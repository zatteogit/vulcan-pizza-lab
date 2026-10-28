import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type UserConstraints } from "./pizza-engine";
import { compareToReference, recipeDisplayName, stgDepartures } from "./recipe-reference";

const kitchen: UserConstraints = {
  oven_type: "wood", oven_max_temp_c: 485, available_hours: 24,
  skill_level: 4, dough_balls: 4, has_mixer: true,
  has_pizza_stone: true, has_pizza_steel: false, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};
const reference = () => generateRecipe(STYLES_DB.napoletana_stg, kitchen, {
  customHydration: 58, customFlourW: 280, customFlourPL: 0.6,
  customFermentationHours: 10, customFermentationTempC: 22,
});

describe("STG reference and executable recipe are distinct", () => {
  it("keeps the catalog name but drops STG without wood, regardless of score", () => {
    const recipe = reference();
    recipe.scores.authenticity = 100;
    expect(recipeDisplayName(recipe, "electric_high")).toBe("Napoletana");
    expect(stgDepartures(recipe, "electric_high")).toContain("wood");
    expect(recipe.style.name).toBe("Napoletana STG");
  });
  it("detects woodless cooking from the generated recipe for cards", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, { ...kitchen, oven_type: "electric_high" });
    expect(recipeDisplayName(recipe)).toBe("Napoletana");
  });
  it("a wood oven does not make a refrigerated, long, prefermented recipe compliant", () => {
    const recipe = { ...reference(), fermentation_hours: 24, fermentation_temp_c: 4, has_pre_ferment: true };
    expect(stgDepartures(recipe, "wood")).toEqual(expect.arrayContaining(["fermentation", "cold", "preferment"]));
    expect(recipeDisplayName(recipe, "wood")).toBe("Napoletana");
  });
  it("uses specification boundaries, not the narrower style ranges or score", () => {
    const recipe = { ...reference(), flour_w: 380, flour_pl: 0.5, cook_time_sec: 90, ball_weight_g: 250 };
    recipe.scores.authenticity = 30;
    expect(stgDepartures(recipe, "wood")).toEqual([]);
    expect(recipeDisplayName(recipe, "wood")).toBe("Napoletana STG");
    expect(stgDepartures({ ...recipe, flour_w: 381, flour_pl: 0.71, cook_time_sec: 91, ball_weight_g: 251 }, "wood"))
      .toEqual(expect.arrayContaining(["flour", "pl", "bake", "weight"]));
  });
  it("checks actual dough and topping, leaving other styles alone", () => {
    const recipe = { ...reference(), fat_g: 5, sugar_g: 2, yeast_type: "sourdough" as const,
      style: { ...STYLES_DB.napoletana_stg, default_topping_ref: "diavola" } };
    expect(stgDepartures(recipe, "wood")).toEqual(expect.arrayContaining(["additions", "yeast", "topping"]));
    const other = { ...recipe, style: STYLES_DB.teglia_romana };
    expect(stgDepartures(other, "home")).toEqual([]);
    expect(recipeDisplayName(other, "home")).toBe(other.style.name);
  });
});

/* FW-14: i delta partono dalla ricetta di riferimento, non dal centro del range. */
describe("compareToReference", () => {
  it("a ricetta invariata non segnala nulla, anche se è lontana dal centro degli intervalli", () => {
    const recipe = reference();
    expect(compareToReference(recipe, reference())).toEqual([]);
  });
  it("cambiare solo il sale non marca idratazione, W o lievitazione", () => {
    const salted = generateRecipe(STYLES_DB.napoletana_stg, kitchen, {
      customHydration: 58, customFlourW: 280, customFlourPL: 0.6,
      customFermentationHours: 10, customFermentationTempC: 22, customSalt: 3.2,
    });
    expect(compareToReference(salted, reference())).toEqual([]);
  });
  it("riporta il valore di riferimento vero, compreso il passaggio in frigo", () => {
    const changed = generateRecipe(STYLES_DB.napoletana_stg, kitchen, {
      customHydration: 62, customFlourW: 300, customFlourPL: 0.6,
      customFermentationHours: 10, customFermentationTempC: 4,
    });
    expect(compareToReference(changed, reference())).toEqual([
      { param: "hydration", reference: { value: 58 }, current: { value: 62 } },
      { param: "flourW", reference: { value: 280 }, current: { value: 300 } },
      { param: "fermentation", reference: { value: 10, tempC: 22 }, current: { value: 10, tempC: 4 } },
    ]);
  });
});
