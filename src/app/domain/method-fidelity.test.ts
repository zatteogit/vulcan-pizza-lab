import { describe, expect, it } from "vitest";
import { handleMcpMessage } from "../agent/mcp-server";
import { STYLES_DB, equivalentFermentationHours, fermentationPhases, generateRecipe, type UserConstraints } from "./pizza-engine";
import { canonicalRecipeEntry, recipeFromEntry, buildGeneratedRecipe, optimizeSelectedRecipe } from "../use-cases/recipe-entry";
import { getInterpretationById } from "../data/interpretation-library";
import { TOPPING_LIBRARY } from "../data/topping-library";
import { getSectionHeader, localizeStep } from "../features/recipe/recipe-output-format";
import { CMS_DEFAULTS } from "../features/cms/cms-context";
import { EN_LOCALE } from "../features/cms/locales/en";
import { DE_LOCALE } from "../features/cms/locales/de";
import { ES_LOCALE } from "../features/cms/locales/es";
import { FR_LOCALE } from "../features/cms/locales/fr";
import { PT_LOCALE } from "../features/cms/locales/pt";
import { JA_LOCALE } from "../features/cms/locales/ja";

const kitchen: UserConstraints = {oven_type:"wood",oven_max_temp_c:485,skill_level:4,available_hours:0,meal_deadline:false,
 dough_balls:2,has_mixer:true,has_baking_pan:true,has_pizza_stone:false,has_pizza_steel:false,
 pantry_flours:[],pantry_yeasts:[],dietary_filters:[]};
function call(name:string,input:Record<string,unknown>) {
 const response=handleMcpMessage({jsonrpc:"2.0",id:1,method:"tools/call",params:{name,arguments:input}});
 if (!response || !("result" in response)) throw Error("No MCP response");
 const r=response.result as {isError?:boolean;structuredContent:any};expect(r.isError).not.toBe(true);return r.structuredContent;
}
const bundles=[CMS_DEFAULTS,EN_LOCALE,DE_LOCALE,ES_LOCALE,FR_LOCALE,PT_LOCALE,JA_LOCALE];

describe("second audit: explicit formulas and reference-specific processes",()=>{
 it("Barese declares the existing no-potato formula without changing its mass",()=>{
  const r=call("generate_recipe",{...kitchen,style_id:"focaccia_barese",recipe_mode:"canonical"});
  expect(r.reference.formula_variant.key).toBe("formula.withoutPotato");
  expect(r.ingredients.map((i:{name:string})=>i.name)).toEqual(["flour","water","salt","yeast_fresh","fat"]);
  const style=call("get_style",{style_id:"focaccia_barese"});
  expect(style.description).toContain("senza patate");
  expect(style.formula_variant).toEqual(r.reference.formula_variant);
  for(const b of bundles) {
   expect(b.engineMessages["formula.withoutPotato"]).toBeTruthy();
   expect(b.styleDescriptions.focaccia_barese).toBeTruthy();
  }
 });
 it("Recco hand stretching agrees with the reference, including in localized instructions",()=>{
  const r=call("generate_recipe",{...kitchen,style_id:"focaccia_recco",oven_type:"electric_standard",oven_max_temp_c:300,interpretation_id:"igp_recco",recipe_mode:"canonical"});
  expect(r.steps.find((s:{id:string})=>s.id==="shape").description).toContain("a mano");
  expect(JSON.stringify(r.steps)).not.toContain("mattarello");
  for(const b of bundles) expect(b.engineMessages["timeline.shape.doubleThinSheet"]).not.toMatch(/mattarello|rolling pin|rouleau|Nudelholz|rodillo|rolo|麺棒/);
 });
 it("APITER uses the same 3.5h proof for yeast, timeline, browser and MCP",()=>{
  const style=STYLES_DB.teglia_romana;
  const interpretation=getInterpretationById("apiter_teglia")!;
  const c={...kitchen,oven_type:"electric_standard" as const,oven_max_temp_c:300};
  const entry=canonicalRecipeEntry(style,undefined,interpretation); const o=entry.options;
  const r=recipeFromEntry(entry,c);
  const proof=r.timeline.find(s=>s.id==="proof")!; const preheat=r.timeline.find(s=>s.id==="preheat")!;
  expect(proof.duration_minutes+preheat.duration_minutes).toBe(210);
  expect(r.timeline.findIndex(s=>s.id==="shape")).toBeGreaterThan(r.timeline.findIndex(s=>s.id==="proof"));
  expect(proof.description).toContain("contenitore chiuso");
  expect(localizeStep(proof,r,CMS_DEFAULTS).description).toContain("contenitore chiuso");
  for(const b of bundles) expect(localizeStep(proof,r,b).title).toBe(b.timelineLabels.proof.title);
  expect(localizeStep(r.timeline.find(s=>s.id==="shape")!,r,CMS_DEFAULTS).description).toContain("19°C");
  expect(r.timeline.find(s=>s.id==="shape")?.description).toContain("19°C");
  expect(fermentationPhases(36,false,"poolish",entry.style.method_profile)).toEqual({preferment:0,bulk:32.5,proof:3.5});
  expect(equivalentFermentationHours(36,4,"fresh",false,"poolish",entry.style.method_profile)).toBeLessThan(equivalentFermentationHours(36,4,"fresh",false));
  const generic=generateRecipe({...entry.style,method_profile:undefined},c,o);
  expect(r.yeast_g).not.toBe(generic.yeast_g);
  const rebuilt=buildGeneratedRecipe({style,constraints:c,customHydration:o.customHydration!,customFlourW:o.customFlourW!,customFlourPL:o.customFlourPL!,customFermentHours:o.customFermentationHours!,customFermentTemp:o.customFermentationTempC!,usePreFerment:false,customSalt:o.customSalt!,panConfig:o.panConfig!,activeVersion:null,activeInterpretationId:interpretation.id,selectedToppingConcept:entry.topping,preFermentChoice:{}});
  expect(rebuilt.timeline).toEqual(r.timeline);expect(rebuilt.yeast_g).toBe(r.yeast_g);
  const m=call("generate_recipe",{...c,style_id:style.id,interpretation_id:interpretation.id,recipe_mode:"canonical"});
  expect(m.reference.method.id).toBe(interpretation.id);
  expect(m.schedule.total_minutes).toBe(m.steps.reduce((sum:number,s:{duration_minutes:number})=>sum+s.duration_minutes,0));
  expect(m.steps.find((s:{id:string})=>s.id==="proof").duration_minutes+m.steps.find((s:{id:string})=>s.id==="preheat").duration_minutes).toBe(210);
  const optimized=optimizeSelectedRecipe(style,c,undefined,undefined,null,interpretation.id);
  expect(optimized.recipe.style.method_profile?.id).toBe(interpretation.id);
 });
 it("AVPN with biga retains the departure and cannot claim absolute authenticity",()=>{
  const args={...kitchen,style_id:"napoletana_stg",interpretation_id:"avpn_disciplinare",recipe_mode:"canonical",pre_ferment:"biga",pre_ferment_flour_pct:50};
  const r=call("generate_recipe",args);
  expect(r.reference.stg_departures).toContain("preferment");
  expect(r.reference.method.id).toBe("avpn_disciplinare");
  expect(r.scores.authenticity).toBeLessThan(90);
  expect(r.scores.penalties.some((p:{key:string})=>p.key==="auth.directMethod")).toBe(true);
  expect(r.reference.conformity_certified).toBe(false);
  const dry=call("generate_recipe",{...args,pre_ferment:"none",pre_ferment_flour_pct:undefined,pantry_yeasts:["dry"],excluded_yeasts:["fresh","sourdough"]});
  expect(dry.ingredients.some((i:{name:string})=>i.name==="yeast_dry")).toBe(true);expect(dry.scores.authenticity).toBe(100);
 });
 it("Genovese brine is reproducible and totals scale once, independently of dough and finishing",()=>{
  for(const id of ["focaccia_genovese_classica","focaccia_cipolle_genovese"]) {
   const t=TOPPING_LIBRARY[id];
   expect(t.ingredients.filter(i=>i.section==="salamoia").map(i=>[i.name,i.amount.value,i.amount.unit])).toEqual([["Acqua",30,"ml"],["Sale fino",1.5,"g"]]);
   const r=call("generate_recipe",{...kitchen,style_id:"focaccia_genovese",topping_id:id,recipe_mode:"canonical",dough_balls:3});
   expect(r.topping.ingredients_per_unit.filter((i:{section:string})=>i.section==="salamoia").map((i:{amount:{value:number}})=>i.amount.value)).toEqual([30,1.5]);
   expect(r.topping.ingredients_total.filter((i:{section:string})=>i.section==="salamoia").map((i:{amount:{value:number}})=>i.amount.value)).toEqual([90,4.5]);
   expect(r.steps.find((s:{id:string})=>s.id===t.assembly_steps![0].id).description).toContain("Sciogliere il sale fino");
  }
  for(const lang of ["it","en","de","es","fr","pt","ja"]) {
   expect(getSectionHeader("salamoia",lang)).not.toBe(getSectionHeader("finitura",lang));
  }
 });
});
