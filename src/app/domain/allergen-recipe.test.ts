import { describe, expect, it } from "vitest";
import { STYLES_DB, generateRecipe, type UserConstraints } from "./pizza-engine";
import { handleMcpMessage } from "../agent/mcp-server";
import { recipeCardSignals, recipePresentationState } from "../features/recipe/recipe-card-signals";
const kitchen:UserConstraints={oven_type:"wood",oven_max_temp_c:485,available_hours:0,meal_deadline:false,dough_balls:4,skill_level:4,has_mixer:true,has_baking_pan:true,has_pizza_stone:true,has_pizza_steel:false,pantry_flours:[],pantry_yeasts:[],dietary_filters:[]};
function call(args:Record<string,unknown>,name="generate_recipe"){const res=handleMcpMessage({jsonrpc:"2.0",id:1,method:"tools/call",params:{name,arguments:args}});if(!res||!("result"in res))throw Error("no result");return res.result as any;}
describe("allergens across the actual recipe and MCP",()=>{
 it("blocks milk in Margherita independently of score, diets or oven",()=>{
  const r=generateRecipe({...STYLES_DB.napoletana_stg,default_topping_ref:"margherita_napoletana_avpn"},{...kitchen,allergens_avoid:["milk"]});
  expect(r.allergens.contains.map(g=>g.id)).toEqual(["gluten","milk"]);
  expect(r.verdict.outcome).toBe("not_feasible");expect(r.scores.composite).toBeLessThanOrEqual(39);
  expect(recipePresentationState(r)).toBe("blocked");expect(recipeCardSignals(r)[0].message).toMatchObject({key:"allergen.cardConflict",params:{allergen:"milk"}});
 });
 it("Marinara changes the actual topping, retains avoidance and label verification",()=>{
  const r=call({...kitchen,style_id:"napoletana_stg",topping_id:"marinara",allergens_avoid:["milk"]}).structuredContent;
  expect(r.topping.id).toBe("marinara_avpn");expect(r.allergens.contains.map((g:any)=>g.id)).toEqual(["gluten"]);
  expect(r.outcome).not.toBe("not_feasible");expect(r.dietary_warnings.some((w:any)=>w.filterId==="allergen:labels")).toBe(true);
  expect(r.allergens.avoided).toEqual(["milk"]);expect(r.dietary_variant.omitted_conflicts.length).toBeGreaterThan(0);expect(r.schema_version).toBe("1.5");
 });
 it("Pinsa includes the soy in the actual flour blend",()=>{
  const r=generateRecipe(STYLES_DB.pinsa_romana,{...kitchen,allergens_avoid:["soy"]});
  expect(r.allergens.contains.some(g=>g.id==="soy"&&g.sources.some(s=>s.section==="dough"))).toBe(true);
  expect(r.verdict.blockers).toContainEqual(expect.objectContaining({filter_id:"allergen:soy"}));
 });
 it("compound mortadella and optional dairy stay distinct",()=>{
  const r=generateRecipe({...STYLES_DB.teglia_romana,default_topping_ref:"bianca_mortazza_romana"},{...kitchen,allergens_avoid:["nuts","milk"]});
  const nuts=r.allergens.contains.find(g=>g.id==="nuts")!;
  expect(nuts.sources.some(s=>s.component==="pistacchio")).toBe(true);
  expect(r.allergens.conditional.some(g=>g.id==="milk")).toBe(true);
  expect(r.verdict.blockers.some(b=>b.kind==="dietary_conflict"&&b.filter_id==="allergen:milk")).toBe(false);
  const selected=generateRecipe(r.style,{...kitchen,allergens_avoid:["milk"],included_optional_ingredients:["Stracciatella di burrata (mozzarella, panna)"]});
  expect(selected.verdict.blockers.some(b=>b.kind==="dietary_conflict"&&b.filter_id==="allergen:milk")).toBe(true);
 });
 it("MCP marks an explicitly selected optional ingredient as included",()=>{
  const r=call({...kitchen,style_id:"teglia_romana",topping_id:"bianca_mortazza",allergens_avoid:["milk"],included_optional_ingredients:["Stracciatella di burrata (mozzarella, panna)"]}).structuredContent;
  expect(r.outcome).toBe("not_feasible");
  expect(r.topping.ingredients_per_unit.find((i:any)=>i.name.startsWith("Stracciatella")).included).toBe(true);
 });
 it("cards state the necessary omission for optional dairy",()=>{
  const r=generateRecipe({...STYLES_DB.teglia_romana,default_topping_ref:"bianca_mortazza_romana"},{...kitchen,allergens_avoid:["milk"]});
  expect(r.verdict.outcome).not.toBe("not_feasible");
  expect(recipeCardSignals(r)[0].message).toMatchObject({key:"allergen.cardOptional",params:{allergen:"milk"}});
 });
 it("explicit allergy names take priority when a diet also conflicts",()=>{
  const r=generateRecipe(STYLES_DB.napoletana_stg,{...kitchen,dietary_filters:["lactose_free"],allergens_avoid:["milk"]});
  expect(recipeCardSignals(r)[0].message.key).toBe("allergen.cardConflict");
 });
 it("no personal avoidance means no allergy signals on cards",()=>{
  const r=generateRecipe(STYLES_DB.focaccia_genovese,kitchen);expect(recipeCardSignals(r).some(s=>s.message.key.startsWith("allergen."))).toBe(false);
 });
 it("frying oil remains unverified until the actual product is specified",()=>{
  const args={...kitchen,style_id:"pizza_fritta",allergens_avoid:["peanuts"]};
  const unknown=call(args).structuredContent;
  expect(unknown.allergens.unverified).toContainEqual(expect.objectContaining({ingredient:"Olio per frittura",section:"cooking"}));
  expect(unknown.allergens.may_contain).toEqual([]);
  const chosen=call({...args,allergen_labels:{"Olio per frittura":{product:"Olio di arachidi",contains:["peanuts"],may_contain:[],complete:true}}}).structuredContent;
  expect(chosen.blockers.some((b:any)=>b.filter_id==="allergen:peanuts")).toBe(true);
 });
 it("explicit label traces block while an unknown sauce never invents traces",()=>{
  const r=call({...kitchen,style_id:"napoletana_stg",topping_id:"marinara",allergens_avoid:["peanuts"],allergen_labels:{"Olio EVO":{product:"Bottiglia scelta",contains:[],may_contain:["peanuts"],complete:true}}});
  expect(r.isError).toBe(false);expect(r.structuredContent.outcome).toBe("not_feasible");expect(r.structuredContent.allergens.may_contain[0].id).toBe("peanuts");
  expect(r.structuredContent.dietary_warnings.find((w:any)=>w.filterId==="allergen:peanuts").message).toContain("arachidi");
 });
 it.each([{allergens_avoid:["lactose"]},{allergens_avoid:"milk"},{allergen_labels:{x:{product:"P",contains:[],may_contain:[],complete:"yes"}}},{allergen_labels:{x:{product:"P",contains:["milk"],may_contain:["unknown"],complete:true}}}])("rejects malformed allergy inputs: %j",bad=>{
  expect(call({style_id:"napoletana_stg",...bad}).isError).toBe(true);
 });
 it("recommendations and generation carry identical allergy evidence",()=>{
  const args={...kitchen,style_id:"napoletana_stg",topping_id:"margherita",allergens_avoid:["milk"]};
  const r=call(args).structuredContent,rec=call({...args,include_not_feasible:true,limit:1},"recommend_styles").structuredContent.styles[0];
  expect(rec.allergens).toEqual(r.allergens);expect(rec.outcome).toBe("not_feasible");
 });
});
