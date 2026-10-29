import { describe, expect, it } from "vitest";
import { generateRecipe, pantryFlourMix, pantryFlourRange, STYLES_DB, type UserConstraints } from "./pizza-engine";
import { EXCLUDABLE_DOUGH_INGREDIENTS, excludableIngredientIds, isAlwaysRequiredIngredient, normalizePantryFlourDetails, pantryIngredientId, pantryToppingIngredients } from "./pantry-ingredients";
import { TOPPING_LIBRARY } from "../data/topping-library";

const kitchen: UserConstraints = {oven_type:"wood",oven_max_temp_c:450,available_hours:48,skill_level:4,dough_balls:4,
  has_mixer:true,has_pizza_stone:true,has_pizza_steel:true,has_baking_pan:true,pantry_flours:[],pantry_yeasts:[],dietary_filters:[]};

describe("dispensa precisa e dati sconosciuti", () => {
  const baseline = generateRecipe(STYLES_DB.calzone_napoletano, kitchen);
  it("una W dichiarata conferma la farina anche con inventario parziale", () => {
    const recipe = generateRecipe(STYLES_DB.calzone_napoletano, {...kitchen,pantry_flours:["custom:bag"],
      pantry_flour_details:{"custom:bag":{name:"La mia farina",w:baseline.flour_w,protein_pct:13}}});
    expect(recipe.verdict.conditions?.some(condition=>condition.kind==="flour")).toBe(false);
  });
  it("le proteine da sole non diventano una W né confermano disponibilità", () => {
    const constraints={...kitchen,pantry_flours:["custom:bag"],pantry_flour_details:{"custom:bag":{protein_pct:13}}};
    expect(pantryFlourRange(constraints,"custom:bag")).toBeUndefined();
    expect(generateRecipe(STYLES_DB.calzone_napoletano,constraints).verdict.conditions).toContainEqual(expect.objectContaining({kind:"flour",status:"unverified"}));
  });
  it("l'override di una sola confezione non muta il catalogo globale", () => {
    const before=pantryFlourRange({},"caputo_pizzeria");
    expect(pantryFlourRange({pantry_flour_details:{caputo_pizzeria:{w:310}}},"caputo_pizzeria")).toEqual([310,310]);
    expect(pantryFlourRange({},"caputo_pizzeria")).toEqual(before);
    expect(pantryFlourMix(["custom:weak","custom:strong"],[300,300],true,{"custom:weak":{w:200},"custom:strong":{w:400}})).toMatchObject({w:300});
  });
  it("una farina esclusa non contribuisce alla copertura della dispensa", () => {
    const recipe=generateRecipe(STYLES_DB.calzone_napoletano,{...kitchen,pantry_inventory_complete:true,pantry_flours:["custom:bag"],
      excluded_flours:["custom:bag"],pantry_flour_details:{"custom:bag":{w:baseline.flour_w}}});
    expect(recipe.verdict.conditions).toContainEqual(expect.objectContaining({kind:"flour",status:"missing"}));
  });
  it("sceglie un lievito consentito e blocca se sono tutti esclusi", () => {
    expect(generateRecipe(STYLES_DB.calzone_napoletano,{...kitchen,pantry_yeasts:["fresh","dry"],excluded_yeasts:["fresh"]}).yeast_type).toBe("dry");
    expect(generateRecipe(STYLES_DB.calzone_napoletano,{...kitchen,excluded_yeasts:["fresh","dry","sourdough"]}).verdict.blockers).toContainEqual(expect.objectContaining({kind:"resource_excluded",resource:"ingredient"}));
  });
});

describe("ingredienti dell'impasto e del condimento", () => {
  it("un ingrediente escluso è un vincolo della ricetta effettiva", () => {
    const recipe=generateRecipe(STYLES_DB.napoletana_stg,{...kitchen,oven_max_temp_c:500,excluded_ingredients:["basilico"]});
    expect(recipe.verdict.blockers).toContainEqual(expect.objectContaining({kind:"resource_excluded",resource:"ingredient",message:expect.objectContaining({key:"need.excludedIngredient"})}));
    const alternative=generateRecipe({...STYLES_DB.napoletana_stg,default_topping_ref:"marinara"},{...kitchen,oven_max_temp_c:500,excluded_ingredients:["basilico"]});
    expect(alternative.verdict.blockers.some(blocker=>blocker.kind==="resource_excluded")).toBe(false);
  });
  it("l'esclusione di un condimento assente non vieta la ricetta", () => {
    const recipe=generateRecipe(STYLES_DB.napoletana_stg,{...kitchen,oven_max_temp_c:500,excluded_ingredients:["ananas"]});
    expect(recipe.verdict.blockers.some(blocker=>blocker.kind==="resource_excluded")).toBe(false);
  });
  it("l'omissione non prova l'assenza dei condimenti: elenco completo separato", () => {
    const partial=generateRecipe(STYLES_DB.napoletana_stg,kitchen);
    expect(partial.verdict.conditions?.some(condition=>condition.kind==="ingredient")).toBe(false);
    const complete=generateRecipe(STYLES_DB.napoletana_stg,{...kitchen,pantry_ingredients_complete:true});
    expect(complete.verdict.conditions).toContainEqual(expect.objectContaining({kind:"ingredient",status:"missing"}));
  });
  it("riconosce le preparazioni comuni senza confondere ingredienti differenti", () => {
    expect(pantryIngredientId("Olio EVO a filo")).toBe(pantryIngredientId("Olio EVO"));
    expect(pantryIngredientId("Basilico fresco")).toBe("basilico");
    expect(pantryIngredientId("Olio di semi")).not.toBe(pantryIngredientId("Olio EVO"));
  });
  it("scarta valori non validi e campi inattesi dai dettagli importati", () => {
    expect(normalizePantryFlourDetails({bag:{name:" Test ",w:Infinity,protein_pct:999,pl:-1,extra:"ignored"}})).toEqual({bag:{name:"Test"}});
  });
});

describe("G2-WP-04 · acqua e sale non si escludono", () => {
  it("le voci escludibili dell'impasto non includono acqua e sale", () => {
    const ids = EXCLUDABLE_DOUGH_INGREDIENTS.map(pantryIngredientId);
    expect(ids).not.toContain("acqua");
    expect(ids).not.toContain("sale");
  });
  it("escluderli bloccherebbe ogni stile: per questo i dati vecchi si ripuliscono in lettura", () => {
    const blocked = generateRecipe(STYLES_DB.napoletana_stg, {...kitchen, excluded_ingredients:["acqua"]});
    expect(blocked.verdict.blockers?.some(b => b.kind === "resource_excluded")).toBe(true);
    expect(excludableIngredientIds(["acqua", "Sale fino", "burro"])).toEqual(["burro"]);
    expect(excludableIngredientIds(undefined)).toBeUndefined();
  });
  it("neanche la scheda Condimenti offre acqua o sale da escludere", () => {
    const allNames = Object.values(TOPPING_LIBRARY).flatMap(recipe => recipe.ingredients.map(i => i.name));
    expect(allNames.some(isAlwaysRequiredIngredient)).toBe(true);
    const ids = pantryToppingIngredients(Object.values(TOPPING_LIBRARY)).map(item => item.id);
    expect(ids).not.toContain("sale");
    expect(ids).not.toContain("acqua");
    expect(ids.length).toBeGreaterThan(10);
  });
});
