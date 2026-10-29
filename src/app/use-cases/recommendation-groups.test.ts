import { describe, expect, it } from "vitest";
import { recommendStyles, type UserConstraints } from "../domain/pizza-engine";
import { tailoredRecipeEntry } from "./recipe-entry";
import { pantryUnknown, presentationTier } from "./recommendation-groups";

const p1: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 1,
  available_hours: 0, meal_deadline: false, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const p3: UserConstraints = { ...p1, oven_type: "electric_high", oven_max_temp_c: 509, oven_capacity_temp_c: 509, skill_level: 3, has_mixer: true, has_pizza_stone: true };
const recommend = (c: UserConstraints) => recommendStyles(c, undefined, undefined, (style, k) => tailoredRecipeEntry(style, k).recipe);
const count = (c: UserConstraints, tier: string) => recommend(c).filter((rec) => presentationTier(rec, c) === tier).length;

/* FW-09 (S05-A-06, S05-B-11). Misura con la dispensa vuota:
 * P1 casa 250 °C — prima perfect 0 / good 17 / not_feasible 12, dopo 12 / 5 / 12;
 * P3 Effeuno 509 °C — prima perfect 0 / good 29, dopo 26 / 3. */
describe("gruppi di Crea con la dispensa sconosciuta", () => {
  it("la dispensa vuota non svuota «Perfetti per te»", () => {
    expect(pantryUnknown(p3)).toBe(true);
    expect(recommend(p3).every((rec) => rec.tier === "good")).toBe(true);
    expect(count(p3, "perfect")).toBeGreaterThan(20);
    expect(count(p1, "perfect")).toBeGreaterThan(0);
  });

  it("le altre condizioni (forno, metodo) restano «Con condizioni»; i non fattibili non cambiano", () => {
    for (const rec of recommend(p3)) {
      if (rec.verdict.adaptations.some((msg) => !msg.key.startsWith("need.check"))) expect(presentationTier(rec, p3)).toBe("good");
    }
    for (const rec of recommend(p1)) if (rec.tier === "not_feasible") expect(presentationTier(rec, p1)).toBe("not_feasible");
  });

  it("con la dispensa dichiarata il gruppo è quello del motore", () => {
    const declared = { ...p3, pantry_inventory_complete: true };
    expect(pantryUnknown(declared)).toBe(false);
    for (const rec of recommend(declared)) expect(presentationTier(rec, declared)).toBe(rec.tier);
  });
});
