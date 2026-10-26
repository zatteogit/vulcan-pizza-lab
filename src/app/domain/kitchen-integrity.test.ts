import { describe, expect, it } from "vitest";
import { handleMcpMessage } from "../agent/mcp-server";
import { generateRecipe, getLayoutSpec, STYLES_DB, type UserConstraints } from "./pizza-engine";
import { pantryIngredientReferences } from "./pantry-ingredients";
import { getRecipesByAuthenticity, getToppingForStyle, scaleToppingAmounts, TOPPING_LIBRARY } from "../data/topping-library";
import { dietaryRecipeAlternatives } from "./pizza-engine";
import { daySuffix, displayStepTime } from "../features/recipe/recipe-output-format";
import { CMS_DEFAULTS } from "../features/cms/cms-context";
import { EN_LOCALE } from "../features/cms/locales/en";

const kitchen:UserConstraints={oven_type:"home",oven_max_temp_c:300,available_hours:48,meal_deadline:true,skill_level:2,dough_balls:4,
 has_baking_pan:true,has_mixer:false,has_pizza_stone:false,has_pizza_steel:false,pantry_flours:[],pantry_yeasts:[],dietary_filters:[]};
function call(name:string,input:Record<string,unknown>) {
 const response=handleMcpMessage({jsonrpc:"2.0",id:1,method:"tools/call",params:{name,arguments:input}});
 if(!response || !("result" in response)) throw Error("Missing MCP result");
 const r=response.result as {isError?:boolean;structuredContent:any};expect(r.isError,JSON.stringify(r)).not.toBe(true);return r.structuredContent;
}
const pan=(length:number,width:number)=>({shape:"rectangular",length_cm:length,width_cm:width});

describe("round 3: actual ingredients and geometry",()=>{
 it("garlic exclusion blocks both a declared compound sauce and a standalone ingredient",()=>{
  for(const [style_id,topping_id] of [["new_york","cheese_ny"],["teglia_romana","marinara_romana"]]){
   const input={...kitchen,style_id,topping_id,recipe_mode:"adapted",excluded_ingredients:["aglio"]};
   const r=call("generate_recipe",input);
   expect(r.outcome).toBe("not_feasible");expect(r.scores.composite).toBeLessThanOrEqual(39);
   expect(r.blockers.some((b:any)=>b.kind==="resource_excluded"&&b.message.params.ingredient.toLowerCase()==="aglio")).toBe(true);
   const allowed=call("generate_recipe",{...input,excluded_ingredients:["burro"]});
   expect(allowed.blockers.some((b:any)=>b.kind==="resource_excluded")).toBe(false);
  }
 });
 it("resolves only explicit components, retaining the compound's amount and optional status",()=>{
  expect(pantryIngredientReferences("Salsa (passata, origano, zucchero, aglio)",["passata","origano","zucchero","aglio"]).map(r=>r.id)).toContain("aglio");
  expect(pantryIngredientReferences("Salsa senza composizione").map(r=>r.id)).not.toContain("aglio");
  expect(pantryIngredientReferences("Formaggio (asciutto)")).toHaveLength(1);
  expect(pantryIngredientReferences("Pomodoro (poco, dentro)")).toHaveLength(1);
  expect(pantryIngredientReferences("Salsa (scalogno, olio)").map(r=>r.id)).not.toContain("aglio");
  expect(pantryIngredientReferences("Crema (acqua o panna, sale)").map(r=>r.id)).not.toContain("panna");
  const r=call("generate_recipe",{...kitchen,style_id:"new_york",topping_id:"cheese_ny",recipe_mode:"canonical"});
  const row=r.topping.ingredients_per_unit.find((i:any)=>i.name.startsWith("Salsa"));
  expect(row.declared_components.map((c:any)=>c.id)).toContain("aglio");
  expect(row.amount.value).toBe(TOPPING_LIBRARY.cheese_ny.ingredients.find(i=>i.name.startsWith("Salsa"))!.amount.value);
  expect(call("list_pantry_items",{kind:"ingredient",query:"aglio"}).items.some((i:any)=>i.id==="aglio")).toBe(true);
 });
 it("Detroit 30x20 → 60x40 scales all topping rows fourfold and counts units once",()=>{
  for(const recipe_mode of ["canonical","adapted"]){
   const input={...kitchen,style_id:"detroit",topping_id:"detroit_brick",recipe_mode,dough_balls:2};
   const a=call("generate_recipe",{...input,pan:pan(30,20)}),b=call("generate_recipe",{...input,pan:pan(60,40)});
   expect(a.ball_weight_g).toBe(480);expect(b.ball_weight_g).toBe(1920);
   expect(b.topping_geometry).toMatchObject({reference_area_cm2:750,area_cm2:2400,area_scale:3.2});
   for(let i=0;i<a.topping.ingredients_per_unit.length;i++){
    expect(b.topping.ingredients_per_unit[i].amount.value).toBe(a.topping.ingredients_per_unit[i].amount.value*4);
    expect(b.topping.ingredients_total[i].amount.value).toBe(b.topping.ingredients_per_unit[i].amount.value*2);
    expect(b.topping.ingredients_per_unit[i].optional).toBe(a.topping.ingredients_per_unit[i].optional);
   }
  }
 });
 it("round pans use diameter squared; thickness and count do not multiply topping density",()=>{
  const input={...kitchen,style_id:"focaccia_barese",recipe_mode:"canonical",dough_balls:1};
  const a=call("generate_recipe",{...input,pan:{shape:"round",diameter_cm:32}});
  const b=call("generate_recipe",{...input,dough_balls:3,pan:{shape:"round",diameter_cm:64}});
  expect(b.topping_geometry.area_scale).toBe(4);
  expect(b.topping.ingredients_per_unit[0].amount.value).toBe(a.topping.ingredients_per_unit[0].amount.value*4);
  expect(b.topping.ingredients_total[0].amount.value).toBe(b.topping.ingredients_per_unit[0].amount.value*3);
  const thick=generateRecipe(STYLES_DB.detroit,kitchen,{panConfig:{panShape:"rectangular",panLength:30,panWidth:20,thickness:2}});
  expect(thick.topping_scale).toBe(generateRecipe(STYLES_DB.detroit,kitchen,{panConfig:{panShape:"rectangular",panLength:30,panWidth:20}}).topping_scale);
  expect(scaleToppingAmounts(TOPPING_LIBRARY.focaccia_genovese_classica,0.5).ingredients[1].amount.value).toBe(.8);
 });
 it("geometry survives a dietary alternative and default generation never compounds its multiplier",()=>{
  const c={...kitchen,dietary_filters:["vegan","lactose_free"]};
  const r=generateRecipe(STYLES_DB.teglia_romana,c,{panConfig:{panShape:"rectangular",panLength:60,panWidth:40},customFermentationHours:24});
  for(const a of dietaryRecipeAlternatives(r,c)) expect(a.recipe.topping_geometry).toEqual(r.topping_geometry);
  const initial=generateRecipe(STYLES_DB.pizza_al_metro,kitchen);
  expect(generateRecipe(initial.style,kitchen).topping_scale).toBe(initial.topping_scale);
 });
});

describe("round 3: method and calendar integrity",()=>{
 it("selected Fugazza uses all dough as one base, with no ghost disc or closing step",()=>{
  const args={...kitchen,oven_max_temp_c:250,available_hours:28,style_id:"fugazzeta",topping_id:"fugazza_argentina",recipe_mode:"adapted",dietary_filters:["vegan","lactose_free"],excluded_ingredients:["aglio"],pan:pan(40,30)};
  const r=call("generate_recipe",args);
  expect(r.outcome).not.toBe("not_feasible");expect(r.blockers).toEqual([]);
  expect(r.layout).toMatchObject({type:"single",pieces_per_unit:1});
  expect(r.steps.find((s:any)=>s.id==="divide").description).not.toContain("2 pezzi");
  expect(r.steps.some((s:any)=>s.id==="fill_internal")).toBe(false);
  expect(r.steps.some((s:any)=>s.id==="fugazza_top")).toBe(true);
  expect(JSON.stringify(r.steps)).not.toMatch(/secondo disco|per la chiusura|sigillare/);
  expect(r.method_changes[0].key).toBe("diet.singleBase");
  expect(r.scores.authenticity).toBeLessThan(90);
  expect(r.scores.penalties.some((p:any)=>p.key==="auth.layoutChanged")).toBe(true);
  expect(r.schedule.total_minutes).toBe(r.steps.reduce((n:number,s:any)=>n+s.duration_minutes,0));
  expect(r.total_dough_g).toBe(r.dough_balls*r.ball_weight_g);
  expect(getToppingForStyle("fugazza_argentina",STYLES_DB.focaccia_recco)).toBeUndefined();
  const actual=generateRecipe({...STYLES_DB.fugazzeta,default_topping_ref:"fugazza_argentina"},kitchen);
  expect(getLayoutSpec(actual.style).pieces_per_unit).toBe(1);
  expect(getRecipesByAuthenticity(actual.style).some(t=>t.recipe.id==="fugazzeta_rellena")).toBe(true);
  const restored=generateRecipe({...actual.style,default_topping_ref:"fugazzeta_rellena"},kitchen);
  expect(getLayoutSpec(restored.style).pieces_per_unit).toBe(2);
  expect(getToppingForStyle("fugazza_argentina",actual.style)?.ingredients).toEqual(TOPPING_LIBRARY.fugazza_argentina.ingredients);
 });
 it("future starts, midnight and +3 days use today's calendar anchor in IT and EN",()=>{
  const reference=new Date(2026,9,26,23,55),start=new Date(2026,9,27,7,8);
  for(const [lang,copy] of [["it-IT",CMS_DEFAULTS.cooking],["en-GB",EN_LOCALE.cooking]] as const){
   for(const [date,suffix] of [[start,copy.dayTomorrow],[new Date(2026,9,28,16,3),copy.dayAfterTomorrow],[new Date(2026,9,29,0,8),copy.dayOffset.replace('{n}','3')]] as const){
    expect(daySuffix(reference,date,copy).trim()).toBe(suffix);
    expect(displayStepTime("proof",date,reference,lang,copy)).toContain(suffix);
   }
   expect(displayStepTime("bake",new Date(2026,9,27,0,5),reference,lang,copy)).toContain(copy.dayTomorrow);
  }
 });
});
