import { describe, expect, it } from "vitest";
import { STYLES_DB, generateRecipe, dietaryRecipeAlternatives, MAX_DOUGH_BALLS, normalizeDoughBallCount, type UserConstraints } from "./pizza-engine";
import { getDietaryWarnings, ingredientDietaryStatus } from "../data/dietary-data";
import { TOPPING_LIBRARY } from "../data/topping-library";
import { handleMcpMessage } from "../agent/mcp-server";
import { learningStyleForKitchen } from "../use-cases/learning-path";
import { tailoredRecipeEntry, styleWithSelectedTopping } from "../use-cases/recipe-entry";
import { recipeCardSignals, recipePresentationState } from "../features/recipe/recipe-card-signals";
import { localizeStep } from "../features/recipe/recipe-output-format";
import { IT_LOCALE } from "../features/cms/locales/it";
import { createFormatter } from "../features/cms/i18n";

const kitchen: UserConstraints = { oven_type:"wood",oven_max_temp_c:485,available_hours:48,meal_deadline:false,dough_balls:2,skill_level:3,
  has_mixer:true,has_baking_pan:true,has_pizza_stone:true,has_pizza_steel:false,pantry_flours:[],pantry_yeasts:[],dietary_filters:[] };
function call(name: string, args: Record<string, unknown>) {
  const response = handleMcpMessage({jsonrpc:"2.0",id:1,method:"tools/call",params:{name,arguments:args}});
  if(!response || !("result" in response)) throw Error("No MCP response");
  const r=response.result as {isError?:boolean;structuredContent:any};expect(r.isError).not.toBe(true);return r.structuredContent;
}
const marinara=Object.values(TOPPING_LIBRARY).find(t=>t.concept_ref==="marinara" && t.preferred_for_styles?.includes("napoletana_stg"))!;

describe("persona audit: dietary requirements override the generic score",()=>{
  it("offers real topping versions without waiving structural or kitchen constraints",()=>{
    const c={...kitchen,dietary_filters:["vegan","lactose_free"]};
    const original=generateRecipe(STYLES_DB.napoletana_stg,c);
    const alternatives=dietaryRecipeAlternatives(original,c);
    expect(alternatives.length).toBeGreaterThan(0);
    const alternative=alternatives.find(a=>a.recipe.style.default_topping_ref===marinara.id)!;
    expect(alternative).toBeDefined();
    expect(alternative.recipe.verdict.outcome).not.toBe("not_feasible");
    expect(alternative.omitted_conflicts.join(" ")).toMatch(/latte|mozzarella/i);
    expect(alternative.removed.join(" ")).toMatch(/latte|mozzarella/i);
    expect(alternative.added.length).toBeGreaterThan(0);
    expect(alternative.recipe.dietary_variant?.topping_id).toBe(marinara.id);
    // The browser selects concrete recipe IDs, not only topping concepts.
    const selected=styleWithSelectedTopping(STYLES_DB.napoletana_stg,marinara.id);
    expect(selected.default_topping_ref).toBe(marinara.id);
    expect(generateRecipe(selected,c).dietary_warnings).toEqual([]);
    expect(original.verdict.outcome).toBe("not_feasible");
    expect(dietaryRecipeAlternatives(generateRecipe(STYLES_DB.focaccia_recco,c),c)).toEqual([]);
    expect(dietaryRecipeAlternatives(generateRecipe(STYLES_DB.chicago_deep,c),c)).toEqual([]);
    const cold={...c,oven_type:"home" as const,oven_max_temp_c:180};
    expect(dietaryRecipeAlternatives(generateRecipe(STYLES_DB.napoletana_stg,cold),cold)).toEqual([]);
    const m=call("recommend_styles",{...c,style_id:"napoletana_stg",recipe_mode:"adapted",include_recipe:true});
    const rec=m.styles[0];
    expect(rec.outcome).toBe("not_feasible");
    expect(rec.dietary_alternatives.length).toBeGreaterThan(0);
    const a=rec.dietary_alternatives[0];
    const chosen=call("generate_recipe",{...c,...a.selection});
    expect(chosen.outcome).toBe(a.outcome);
    expect(chosen.scores.composite).toBe(a.compatibility);
    expect(chosen.topping.ingredients).toEqual(a.recipe.topping.ingredients);
  });
  it("Recco: required crescenza blocks vegan and lactose-free in browser and MCP",()=>{
    const constraints={...kitchen,oven_type:"home" as const,oven_max_temp_c:300,dietary_filters:["vegan","lactose_free"]};
    const r=generateRecipe(STYLES_DB.focaccia_recco,constraints);
    expect(r.verdict.outcome).toBe("not_feasible");expect(r.scores.composite).toBeLessThanOrEqual(39);
    expect(r.verdict.blockers.filter(b=>b.kind==="dietary_conflict").map(b=>b.filter_id)).toEqual(["vegan","lactose_free"]);
    expect(JSON.stringify(r.dietary_warnings)).toMatch(/Crescenza/i);
    expect(recipeCardSignals(r)[0].message.key).toBe("diet.cardConflict");
    const m=call("generate_recipe",{...constraints,style_id:r.style.id,recipe_mode:"adapted",topping_id:"crescenza_recco"});
    expect(m.outcome).toBe("not_feasible");expect(m.blockers.some((b:any)=>b.kind==="dietary_conflict")).toBe(true);
    expect(m.dietary_warnings.every((w:any)=>typeof w.message==="string")).toBe(true);
  });
  it("an ordinary Margherita is blocked but a real Marinara is not labelled as an animal conflict",()=>{
    expect(marinara).toBeDefined();
    const c={...kitchen,dietary_filters:["vegan"]};
    const cheese=generateRecipe(STYLES_DB.napoletana_stg,c);
    const plant=generateRecipe({...STYLES_DB.napoletana_stg,default_topping_ref:marinara.id},c);
    expect(cheese.verdict.blockers.some(b=>b.kind==="dietary_conflict")).toBe(true);
    expect(plant.verdict.blockers.some(b=>b.kind==="dietary_conflict")).toBe(false);
    expect(plant.dietary_warnings).toEqual([]);
  });
  it("checks dough fats even with a plant topping",()=>{
    const r=generateRecipe({...STYLES_DB.chicago_deep,default_topping_ref:marinara.id},{...kitchen,dietary_filters:["vegan"]});
    const conflict=r.dietary_warnings!.find(w=>w.severity==="critical");
    expect(conflict?.ingredients.join(" ")).toMatch(/burro/i);
  });
  it("does not certify lactose from a cheese name or turn lactose-free dairy vegan",()=>{
    expect(ingredientDietaryStatus("Parmigiano Reggiano DOP 24 mesi","lactose_free")).toBe("unverified");
    expect(ingredientDietaryStatus("Mozzarella senza lattosio","lactose_free")).toBe("compatible");
    expect(ingredientDietaryStatus("Mozzarella senza lattosio","vegan")).toBe("incompatible");
    expect(ingredientDietaryStatus("Prodotto nuovo senza scheda","vegan")).toBe("unverified");
    expect(ingredientDietaryStatus("Latte di soia","vegan")).toBe("compatible");
    expect(ingredientDietaryStatus("Acqua tiepida (o poca panna)","vegan")).toBe("unverified");
  });
  it("optional conflicts require explicit omission; required ingredients cannot be waived",()=>{
    const optional=getDietaryWarnings(["vegan"],[{name:"Acciughe",optional:true}]);
    expect(optional[0].severity).toBe("warning");expect(optional[0].message.key).toBe("diet.omitOptional");
    expect(getDietaryWarnings(["vegan"],[{name:"Acciughe"}])[0].severity).toBe("critical");
  });
  it("never recommends a wheat recipe for gluten-free, even with a high affinity",()=>{
    const input={...kitchen,dietary_filters:["gluten_free"],recipe_mode:"adapted",limit:30,include_recipe:true};
    const all=call("recommend_styles",{...input,include_not_feasible:true}).styles;
    expect(all).toHaveLength(30);
    for(const r of all){expect(r.outcome,r.id).toBe("not_feasible");expect(r.compatibility,r.id).toBeLessThanOrEqual(39);}
    expect(call("recommend_styles",input).styles).toEqual([]);
    const mix=getDietaryWarnings(["gluten_free"],[{name:"Farina di riso",gluten:false}]);
    expect(mix[0].severity).toBe("critical");expect(mix[0].message.key).toBe("diet.glutenUnsupported");
  });
});

describe("persona audit: mode, quantity, schedule and learning",()=>{
  it("a canonical recipe can have a conditional verdict without becoming a tailored version",()=>{
    const r=generateRecipe(STYLES_DB.teglia_romana,{...kitchen,oven_type:"home",oven_max_temp_c:250});
    expect(recipePresentationState(r)).toBe("check");
    r.hydration_pct-=1;
    expect(recipePresentationState(r)).toBe("check");
  });
  it("supports the same 40 real units in both channels and bounds only at the shared maximum",()=>{
    expect(normalizeDoughBallCount(40)).toBe(40);expect(normalizeDoughBallCount(40.2)).toBe(40);
    expect(normalizeDoughBallCount(999)).toBe(MAX_DOUGH_BALLS);expect(normalizeDoughBallCount(NaN)).toBe(1);
    const r=call("generate_recipe",{...kitchen,style_id:"napoletana_stg",dough_balls:40,ball_weight_g:250});
    expect(r.dough_balls).toBe(40);expect(r.total_dough_g).toBe(10000);
  });
  it("declares the passive activity already counted in each preheat block",()=>{
    for(const id of ["napoletana_stg","pizza_fritta","focaccia_recco"]){
      const r=generateRecipe(STYLES_DB[id],kitchen);const heat=r.timeline.find(s=>s.id==="preheat")!;
      expect(heat.parallel_activity?.duration_minutes,id).toBe(heat.duration_minutes);
      const fermentation=r.timeline.filter(s=>["preferment","folds","bulk","proof","preheat"].includes(s.id)).reduce((n,s)=>n+s.duration_minutes,0);
      expect(Math.abs(fermentation-r.fermentation_hours*60),id).toBeLessThanOrEqual(1);
      const localized=localizeStep(heat,r,IT_LOCALE,createFormatter(IT_LOCALE.ui,"it-IT"));
      // FW-19 (S09-A-11): niente «contabilità del tempo» nel passo; per gli
      // impasti lievitati, una volta sola il segno di prontezza dei panetti.
      expect(localized.description).not.toMatch(/già inclusi|non aggiungerli/);
      expect(localized.description.match(/premuto con un dito/g)?.length ?? 0).toBe(id==="focaccia_recco"?0:1);
      const m=call("generate_recipe",{...kitchen,style_id:id});
      expect(m.schedule.overlap_policy).toBe("only_declared_passive_activity");
      expect(m.schedule.total_minutes).toBe(m.steps.reduce((n:number,s:any)=>n+s.duration_minutes,0));
    }
  });
  it("uses method ranges for the 88% Teglia preset and keeps the catalog reference separate",()=>{
    const r=call("generate_recipe",{...kitchen,style_id:"teglia_romana",version_id:"teglia_alta",recipe_mode:"canonical"});
    expect(r.hydration_pct).toBe(88);expect(r.parameter_ranges.hydration_pct).toEqual([82,92]);
    const catalog=call("get_style",{style_id:"teglia_romana"});
    expect(catalog.hydration_pct_range).toEqual([75,85]);expect(catalog.parameter_range_basis).toBe("catalog_model_reference");
  });
  it("does not invite a 300°C kitchen to a practical Canotto path",()=>{
    const c={...kitchen,oven_type:"electric_standard" as const,oven_max_temp_c:300};
    const chosen=learningStyleForKitchen("napoletana_canotto",c,STYLES_DB);
    expect(chosen).not.toBeNull();expect(chosen?.id).not.toBe("napoletana_canotto");
    expect(tailoredRecipeEntry(chosen!,c).recipe.verdict.outcome).not.toBe("not_feasible");
    expect(learningStyleForKitchen("napoletana_canotto",{...c,dietary_filters:["gluten_free"]},STYLES_DB)).toBeNull();
  });
});
