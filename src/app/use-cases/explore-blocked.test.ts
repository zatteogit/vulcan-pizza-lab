import { describe, expect, it } from "vitest";
import type { RecipeBlocker, RecipeVerdict } from "../domain/pizza-engine";
import { STYLES_DB } from "../domain/pizza-engine";
import { canonicalRecipe } from "./recipe-entry";
import { blockedPlacement, groupBlocked, ovenBand } from "./explore-blocked";

const verdict = (blockers: RecipeBlocker[]): RecipeVerdict =>
  ({ outcome: blockers.length ? "not_feasible" : "ok", blockers } as unknown as RecipeVerdict);
const oven = (min: number): RecipeBlocker => ({ kind: "oven_too_cold", oven_c: 250, style_min_c: min });
const time: RecipeBlocker = { kind: "time_window", available_h: 4, needed_h: 24 };

describe("«Servono più gradi»: gruppi per la temperatura che serve", () => {
  it("fasce: fino a 299, da 300 a 399, da 400 in su", () => {
    expect([270, 299, 300, 399, 400, 485].map(ovenBand))
      .toEqual(["home_plus", "home_plus", "pizza_oven", "pizza_oven", "high_heat", "high_heat"]);
  });
  it("solo il forno → fascia; un altro motivo, anche col forno → «altri motivi»; fattibile → niente", () => {
    expect(blockedPlacement(verdict([oven(430)]))).toEqual({ band: "high_heat", minC: 430 });
    expect(blockedPlacement(verdict([oven(270), time]))).toBe("other");
    expect(blockedPlacement(verdict([time]))).toBe("other");
    expect(blockedPlacement(verdict([]))).toBeNull();
  });
  it("ordina per fascia e per temperatura, e salta le voci fattibili", () => {
    const groups = groupBlocked([
      { item: "stg", verdict: verdict([oven(430)]) },
      { item: "ny", verdict: verdict([oven(270)]) },
      { item: "teglia", verdict: verdict([]) },
      { item: "pala", verdict: verdict([oven(330)]) },
      { item: "california", verdict: verdict([oven(280)]) },
      { item: "calzone", verdict: verdict([oven(400)]) },
      { item: "lunga", verdict: verdict([time]) },
    ]);
    expect(groups.bands.map((b) => [b.band, b.fromC, b.items.map((i) => i.item)])).toEqual([
      ["home_plus", 270, ["ny", "california"]],
      ["pizza_oven", 330, ["pala"]],
      ["high_heat", 400, ["calzone", "stg"]],
    ]);
    expect(groups.other.map((o) => o.item)).toEqual(["lunga"]);
  });
  it("forno di casa a 250 °C: tutti i bloccati del catalogo finiscono in una fascia del forno", () => {
    const c = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: "intermediate", available_hours: 0, dough_balls: 4,
      has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false, dietary_filters: [], allergens_avoid: [],
      kitchen_temp_c: 21, pantry_flours: [], pantry_yeasts: [], yeast_speed_factor: 1 } as unknown as Parameters<typeof canonicalRecipe>[1];
    const groups = groupBlocked(Object.values(STYLES_DB).map((style) => ({ item: style.id, verdict: canonicalRecipe(style, c).verdict })));
    expect(groups.other).toEqual([]);
    expect(groups.bands.map((b) => b.band)).toEqual(["home_plus", "pizza_oven", "high_heat"]);
    expect(groups.bands.find((b) => b.band === "high_heat")!.items.map((i) => i.item)).toContain("napoletana_stg");
  });
});
