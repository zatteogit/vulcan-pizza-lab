import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type RecipeVerdict, type UserConstraints } from "./pizza-engine";
import { summarizeVerdict } from "./verdict-summary";

/* FW-10 — P1: forno di casa a 250 °C, principiante, dispensa non compilata. */
const p1: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, available_hours: 24, skill_level: 1, dough_balls: 4,
  has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};

describe("summarizeVerdict: una causa, prima, con il rimedio", () => {
  it("Napoletana STG a 250 °C: il forno si dice una volta, senza condizioni né limite di autenticità", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, p1);
    // Misura prima: il motore ripete il forno in tre avvisi e aggiunge tre «Se hai…».
    const raw = recipe.verdict.adaptations.map((m) => m.key);
    expect(raw).toEqual(expect.arrayContaining(["gen.notWoodOven", "feas.thermalUnviable", "feas.ovenTooCold", "need.checkDeck"]));
    expect(recipe.scores.global_calculation?.limited_by).toBe("authenticity");

    const summary = summarizeVerdict(recipe.verdict, recipe.optional_aids);
    expect(summary.primary).toEqual({ kind: "oven_too_cold", oven_c: 250, style_min_c: 430 });
    expect(summary.remedy).toEqual({ kind: "alternatives" });
    expect(summary.secondary).toEqual([]);
    expect(summary.adaptations.map((m) => m.key)).toEqual(["feas.hydrationMedBeginner"]);
    expect(summary.conditions).toEqual([]);
    expect(summary.skillWarning).toBeNull();
    expect(summary.showScoreLimit).toBe(false);
  });

  it("New York a 250 °C: niente «Se hai pietra», niente semola, niente «forno troppo freddo» ripetuto", () => {
    const recipe = generateRecipe(STYLES_DB.new_york, p1);
    expect(recipe.verdict.outcome).toBe("not_feasible");
    expect(recipe.optional_aids?.map((m) => m.key)).toContain("aid.semolina");
    const summary = summarizeVerdict(recipe.verdict, recipe.optional_aids);
    expect(summary.primary?.kind).toBe("oven_too_cold");
    expect(summary.optionalAids).toEqual([]);
    expect(summary.adaptations.some((m) => m.key.startsWith("need.") || m.key === "feas.ovenTooCold")).toBe(false);
  });

  it("senza glutine: la dieta è la causa principale e porta al profilo; il forno resta al livello 2", () => {
    const recipe = generateRecipe(STYLES_DB.tonda_romana, { ...p1, dietary_filters: ["gluten_free"] });
    const summary = summarizeVerdict(recipe.verdict);
    expect(summary.primary).toMatchObject({ kind: "dietary_conflict", filter_id: "gluten_free" });
    expect(summary.remedy).toEqual({ kind: "review_diet", filter_id: "gluten_free" });
    expect(summary.secondary.map((b) => b.kind)).toEqual(["oven_too_cold"]);
  });

  it("i tempi vengono dopo il forno e il rimedio del tempo dice le ore", () => {
    const verdict: RecipeVerdict = {
      outcome: "not_feasible",
      blockers: [
        { kind: "time_window", available_h: 4, needed_h: 9 },
        { kind: "fermentation_too_short", fermentation_h: 2, style_min_h: 6, needed_h: 8 },
      ],
      adaptations: [{ key: "gen.windowTooShort", fallback: "" }, { key: "feas.wTooLow", fallback: "" }],
      conditions: [],
    };
    const summary = summarizeVerdict(verdict);
    expect(summary.primary?.kind).toBe("fermentation_too_short");
    expect(summary.remedy).toEqual({ kind: "later_time", hours: 9 });
    expect(summary.adaptations.map((m) => m.key)).toEqual(["feas.wTooLow"]);
    const withOven = summarizeVerdict({ ...verdict, blockers: [...verdict.blockers, { kind: "oven_too_cold", oven_c: 250, style_min_c: 300 }] });
    expect(withOven.primary?.kind).toBe("oven_too_cold");
    expect(withOven.remedy).toEqual({ kind: "alternatives" });
  });

  it("cause identiche si dicono una volta", () => {
    const oven = { kind: "oven_too_cold", oven_c: 250, style_min_c: 430 } as const;
    const summary = summarizeVerdict({ outcome: "not_feasible", blockers: [oven, oven], adaptations: [], conditions: [] });
    expect(summary.secondary).toEqual([]);
  });

  it("Teglia romana all'88 % per chi comincia: l'avviso d'idratazione sale al livello 1", () => {
    const recipe = generateRecipe(STYLES_DB.teglia_romana, p1);
    expect(recipe.verdict.outcome).toBe("warnings");
    const summary = summarizeVerdict(recipe.verdict, recipe.optional_aids);
    expect(summary.primary).toBeNull();
    expect(summary.skillWarning?.key).toBe("feas.hydrationBeginnerHigh");
    expect(summary.showScoreLimit).toBe(true);
    // Forno e abilità prima delle condizioni di dispensa.
    const keys = summary.adaptations.map((m) => m.key);
    expect(keys.indexOf("feas.hydrationBeginnerHigh")).toBeLessThan(keys.indexOf("need.checkFlour"));
    expect(summary.conditions.length).toBeGreaterThan(0);
  });

  it("non cambia il verdetto del motore", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, p1);
    const before = JSON.stringify(recipe.verdict);
    summarizeVerdict(recipe.verdict, recipe.optional_aids);
    expect(JSON.stringify(recipe.verdict)).toBe(before);
  });
});
