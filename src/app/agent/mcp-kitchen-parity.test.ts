import { describe, expect, it } from "vitest";
import { handleMcpMessage } from "./mcp-server";
import { STYLES_DB, generateRecipe, type GeneratedRecipe, type UserConstraints } from "../domain/pizza-engine";
import { canonicalRecipe, canonicalRecipeEntry, recipeFromEntry, tailoredRecipeEntry, optimizeSelectedRecipe } from "../use-cases/recipe-entry";
import { getVersions } from "../data/style-versions";
import { getInterpretationsForStyle } from "../data/interpretation-library";
import { DEFAULT_UI_SCORE_WEIGHTS as weights } from "../domain/recipe-score";

function call(name: string, args: Record<string, unknown> = {}) {
  const response = handleMcpMessage({jsonrpc:"2.0",id:1,method:"tools/call",params:{name,arguments:args}});
  if (!response || !("result" in response)) throw new Error("missing tool result");
  return response.result as {isError:boolean;content:{text:string}[];structuredContent:Record<string,any>};
}
const kitchen: UserConstraints = {oven_type:"electric_high",oven_max_temp_c:450,skill_level:2,available_hours:0,meal_deadline:false,
  dough_balls:4,has_mixer:false,has_baking_pan:true,has_pizza_stone:false,has_pizza_steel:false,
  pantry_flours:[],pantry_yeasts:[],dietary_filters:[],kitchen_temp_c:21};
const args = {...kitchen};

function sameRecipe(data: Record<string,any>, recipe: GeneratedRecipe, context: string) {
  expect(data.scores,context).toEqual(recipe.scores);
  expect(data.outcome,context).toBe(recipe.verdict.outcome);
  expect(data.blockers,context).toEqual(recipe.verdict.blockers);
  expect(data.conditions,context).toEqual(recipe.verdict.conditions ?? []);
  for (const key of ["hydration_pct","flour_w","flour_pl","fermentation_hours","fermentation_temp_c","oven_temp_c","cook_time_sec","ball_weight_g","total_dough_g"] as const) expect(data[key],`${context}/${key}`).toEqual(recipe[key]);
  expect(data.steps,context).toEqual(recipe.timeline.map(s=>({id:s.id,title:s.title,description:s.description,duration_minutes:s.duration_minutes,...(s.rounds?{rounds:s.rounds}:{}),...(s.round_seconds?{round_seconds:s.round_seconds}:{}),...(s.recovery_seconds?{recovery_seconds:s.recovery_seconds}:{}),...(s.parallel_activity?{parallel_activity:s.parallel_activity}:{}),...(s.work_units?{work_units:s.work_units,minutes_per_unit:s.minutes_per_unit}:{})})));
  for (const [name,key] of [["flour","flour_g"],["water","water_g"],["salt","salt_g"]] as const) expect(data.ingredients.find((i:{name:string})=>i.name===name)?.grams ?? 0,context).toBe(recipe[key]);
}

describe("MCP kitchen → browser recipe parity", () => {
  it("all 29 styles, originals and Create adaptations, in three kitchens", () => {
    for (const c of [kitchen,{...kitchen,oven_type:"home" as const,oven_max_temp_c:250,available_hours:24,meal_deadline:true},
      {...kitchen,oven_type:"wood" as const,oven_max_temp_c:485,skill_level:4 as const,available_hours:72}]) {
      for (const style of Object.values(STYLES_DB)) for (const recipe_mode of ["canonical","adapted"]) {
        const result=call("generate_recipe",{...c,style_id:style.id,recipe_mode});
        expect(result.isError,style.id).toBe(false);
        sameRecipe(result.structuredContent, recipe_mode==="canonical"?canonicalRecipe(style,c,weights):tailoredRecipeEntry(style,c,weights).recipe,`${style.id}/${recipe_mode}`);
      }
    }
  });

  it("every preset and signature retains the browser defaults and score", () => {
    for (const style of Object.values(STYLES_DB)) {
      for (const v of getVersions(style.id)) {
        const result=call("generate_recipe",{...args,style_id:style.id,version_id:v.id});
        expect(result.isError,v.id).toBe(false);
        sameRecipe(result.structuredContent,recipeFromEntry(canonicalRecipeEntry(style,weights,null,v),kitchen),v.id);
        sameRecipe(call("generate_recipe",{...args,style_id:style.id,version_id:v.id,recipe_mode:"adapted"}).structuredContent,
          optimizeSelectedRecipe(style,kitchen,weights,canonicalRecipeEntry(style,weights,null,v).options.panConfig,v).recipe,`${v.id}/adapted`);
      }
      for (const signature of getInterpretationsForStyle(style.id)) {
        const result=call("generate_recipe",{...args,style_id:style.id,interpretation_id:signature.id});
        expect(result.isError,signature.id).toBe(false);
        sameRecipe(result.structuredContent,recipeFromEntry(canonicalRecipeEntry(style,weights,signature),kitchen),signature.id);
        sameRecipe(call("generate_recipe",{...args,style_id:style.id,interpretation_id:signature.id,recipe_mode:"adapted"}).structuredContent,
          optimizeSelectedRecipe(style,kitchen,weights,canonicalRecipeEntry(style,weights,signature).options.panConfig,null,signature.id).recipe,`${signature.id}/adapted`);
      }
    }
  });

  it("recommendations and generation use the same new constraints and recipe mode", () => {
    for (const recipe_mode of ["canonical","adapted"]) {
      const input={...args,recipe_mode,excluded_flours:["riso"],pantry_yeasts:["dry"],equipment_inventory_complete:true,allow_equipment_purchase:false,include_not_feasible:true,include_recipe:true,limit:29};
      const recs=call("recommend_styles",input);
      expect(recs.isError).toBe(false);
      expect(recs.structuredContent.styles).toHaveLength(29);
      for (const rec of recs.structuredContent.styles) {
        const {include_recipe:_recipe,include_not_feasible:_blocked,limit:_limit,...recipeInput}=input;
        const r=call("generate_recipe",{...recipeInput,style_id:rec.id}).structuredContent;
        expect(rec.compatibility,rec.id).toBe(r.scores.composite);
        expect(rec.outcome,rec.id).toBe(r.outcome);
        expect(r,rec.id).toMatchObject(rec.recipe);
      }
    }
  });

  it("unknown inventory, confirmed absence and refusal remain different", () => {
    const input={...args,style_id:"chicago_deep",pantry_flours:[],pantry_yeasts:[]};
    const partial=call("generate_recipe",input).structuredContent;
    expect(partial.conditions.find((c:{kind:string})=>c.kind==="flour").status).toBe("unverified");
    const missing=call("generate_recipe",{...input,pantry_inventory_complete:true}).structuredContent;
    expect(missing.conditions.find((c:{kind:string})=>c.kind==="flour").status).toBe("missing");
    expect(call("generate_recipe",{...input,pantry_inventory_complete:true,allow_flour_purchase:false}).structuredContent.blockers)
      .toContainEqual(expect.objectContaining({kind:"resource_excluded",resource:"flour"}));
    expect(call("generate_recipe",{...input,style_id:"pinsa_romana",excluded_flours:["riso"],allow_flour_purchase:true}).structuredContent.outcome).toBe("not_feasible");
  });

  it("brand/custom flour label data and yeast match direct engine inputs", () => {
    const c={...kitchen,pantry_flours:["custom:bag"],pantry_flour_details:{"custom:bag":{name:"My flour",producer:"Mill",w:285,pl:0.6,protein_pct:12.5}},pantry_yeasts:["dry"],pantry_inventory_complete:true};
    sameRecipe(call("generate_recipe",{...c,style_id:"pizza_fritta"}).structuredContent,generateRecipe(STYLES_DB.pizza_fritta,c),"custom flour");
    const proteinOnly=call("generate_recipe",{...c,style_id:"pizza_fritta",pantry_flour_details:{"custom:bag":{protein_pct:12.5}}}).structuredContent;
    expect(proteinOnly.conditions.find((v:{kind:string})=>v.kind==="flour").status).toBe("unverified");
    const catalog=call("list_pantry_items",{query:"Caputo",kind:"flour"}).structuredContent.items;
    expect(catalog.some((f:{id:string})=>f.id==="caputo_pizzeria")).toBe(true);
  });

  it("toppings and excluded ingredients affect both procedure and verdict", () => {
    const input={...args,style_id:"napoletana_stg",topping_id:"marinara",excluded_ingredients:["Basilico fresco"]};
    const result=call("generate_recipe",input).structuredContent;
    expect(result.topping.id).toBe("marinara_avpn");
    expect(result.blockers.some((b:{resource:string})=>b.resource==="ingredient")).toBe(false);
    expect(call("generate_recipe",{...input,topping_id:"margherita_napoletana_avpn"}).structuredContent.blockers)
      .toContainEqual(expect.objectContaining({kind:"resource_excluded",resource:"ingredient"}));
    expect(call("list_pantry_items",{query:"basilico",kind:"ingredient"}).structuredContent.items.map((i:{id:string})=>i.id)).toContain("basilico");
  });

  it("pan geometry, advanced equipment and numeric overrides are applied", () => {
    const c={...kitchen,mixer_type:"spiral",has_mixer:true,surfaces:["blue_steel_pan"],oven_heat_profile:"fan_assisted" as const};
    const input={...c,style_id:"teglia_romana",pan:{shape:"rectangular",length_cm:30,width_cm:20,thickness:0.6},hydration_pct:75,flour_w:330,flour_pl:0.55,salt_pct:2.4,fermentation_hours:36,fermentation_temp_c:4};
    sameRecipe(call("generate_recipe",input).structuredContent,generateRecipe(STYLES_DB.teglia_romana,c,{panConfig:{panShape:"rectangular",panLength:30,panWidth:20,thickness:0.6},customHydration:75,customFlourW:330,customFlourPL:0.55,customSalt:2.4,customFermentationHours:36,customFermentationTempC:4}),"pan/overrides");
    for (const mixer_type of ["planetary","stand_domestic","hands"]) {
      const variant={...c,mixer_type,has_mixer:mixer_type!=="hands"};
      sameRecipe(call("generate_recipe",{...variant,style_id:"pizza_fritta"}).structuredContent,generateRecipe(STYLES_DB.pizza_fritta,variant),mixer_type);
    }
  });

  it("validates malformed new inputs instead of silently discarding them", () => {
    for (const patch of [{pantry_flours:"00"},{allow_flour_purchase:"false"},{pantry_flour_details:{x:{protein_pct:101}}},
      {pan:{shape:"round",length_cm:30}},{pan:{width_cm:-1}},{version_id:"not_here"},{interpretation_id:"not_here"},{topping_id:"not_here"},
      {surfaces:["unknown"]},{pantry_yeasts:["unknown"]},{skill_level:1.5},{flour_blend:[{name:"wheat",pct:70}]},{pre_ferment:"none",pre_ferment_flour_pct:40},{excluded_flour:["riso"]},{excluded_flours:["rice"]},{excluded_ingredients:["not-a-catalog-ingredient"]}]) {
      expect(call("generate_recipe",{...args,style_id:"pizza_fritta",...patch}).isError,JSON.stringify(patch)).toBe(true);
    }
    expect(call("recommend_styles",{...args,version_id:"focaccia_moderna"}).isError).toBe(true);
  });

  it("keeps explicit wheat W edits and preferment proportions", () => {
    for (const recipe_mode of ["default","canonical","adapted"]) {
      const r=call("generate_recipe",{...args,style_id:"pinsa_romana",recipe_mode,flour_w:330}).structuredContent;
      expect(r.flour_w,recipe_mode).toBe(330);
      expect(r.flour_blend.find((f:{w?:number})=>f.w!==undefined).w,recipe_mode).toBe(330);
    }
    const r=call("generate_recipe",{...args,style_id:"napoletana_canotto",pre_ferment:"poolish",pre_ferment_flour_pct:45}).structuredContent;
    expect(r.pre_ferment.flour_pct).toBe(45);
    expect(r.pre_ferment.flour_g+r.pre_ferment.final_dough.flour_g).toBe(r.ingredients.find((i:{name:string})=>i.name==="flour").grams);
    const recs=call("recommend_styles",{...args,pre_ferment:"biga",limit:29});
    expect(recs.isError).toBe(false);
    expect(recs.structuredContent.styles.some((s:{id:string})=>s.id==="focaccia_recco")).toBe(false);
  });

  it("reproduces scores actually observed on browser Create cards", () => {
    expect(call("generate_recipe",{...args,style_id:"tonda_romana",recipe_mode:"adapted",skill_level:1,has_baking_pan:false}).structuredContent.scores.composite).toBe(91);
    expect(call("generate_recipe",{...args,style_id:"focaccia_genovese",recipe_mode:"adapted",skill_level:1,has_baking_pan:false,oven_type:"home",oven_max_temp_c:250}).structuredContent.scores.composite).toBe(87);
  });

  it("all catalog ingredients fit a complete inventory without duplicate IDs", () => {
    const catalog=call("list_pantry_items",{}).structuredContent.items as {id:string;kind:string}[];
    expect(new Set(catalog.map(i=>`${i.kind}/${i.id}`)).size).toBe(catalog.length);
    const ingredients=catalog.filter(i=>i.kind==="ingredient").map(i=>i.id);
    expect(call("generate_recipe",{...args,style_id:"pizza_fritta",pantry_ingredients:ingredients,pantry_ingredients_complete:true}).isError).toBe(false);
  });
});
