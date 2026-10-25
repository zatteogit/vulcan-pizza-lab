import { describe, expect, it } from "vitest";
import { generateRecipe, optimizeRecipe, recommendStyles, STYLES_DB, type UserConstraints } from "./pizza-engine";
import { getStyleDeviation } from "./deviation-tags";

function kitchen(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "home", oven_max_temp_c: 250, available_hours: 72,
    skill_level: 4, dough_balls: 4, has_mixer: true,
    has_pizza_stone: true, has_pizza_steel: false, has_baking_pan: true,
    pantry_flours: [], pantry_yeasts: [], dietary_filters: [], ...overrides,
  };
}

describe("tre esiti sulla ricetta eseguibile, indipendenti dal punteggio", () => {
  it("Apizza: carbone, legna e forno domestico non sono la stessa dotazione", () => {
    const style = STYLES_DB.new_haven_apizza;
    expect(style.baking.oven_type_required).toBe("coal");
    expect(style.requires_wood_oven).toBe(false);
    const coal = generateRecipe(style, kitchen({ oven_type: "coal", oven_max_temp_c: 400 }));
    const wood = generateRecipe(style, kitchen({ oven_type: "wood", oven_max_temp_c: 450 }));
    const home = generateRecipe(style, kitchen());
    expect(coal.verdict.outcome).toBe("ok");
    expect(wood.verdict.outcome).toBe("warnings");
    expect(wood.verdict.adaptations.map((m) => m.key)).toContain("gen.notCoalOven");
    expect(wood.scores.authenticity).toBeLessThanOrEqual(75);
    expect(wood.scores.composite).toBeLessThan(coal.scores.composite);
    expect(home.verdict.outcome).toBe("not_feasible");
    expect(home.scores.composite).toBeLessThanOrEqual(39);
  });

  it("un profilo di deviazione mancante non diventa canonico per ripiego", () => {
    expect(getStyleDeviation("new_haven_apizza").category).toBe("unclassified");
    expect(getStyleDeviation("napoletana_stg").category).toBe("canonical");
  });
  it("Chicago con teglia e forno adeguato: fattibile senza adattamenti", () => {
    const recipe = generateRecipe(STYLES_DB.chicago_deep, kitchen());
    expect(recipe.verdict).toEqual({ outcome: "ok", blockers: [], adaptations: [] });
  });

  it("teglia romana a 250: fattibile modificando la cottura", () => {
    const recipe = generateRecipe(STYLES_DB.teglia_romana, kitchen());
    expect(recipe.verdict.outcome).toBe("warnings");
    expect(recipe.verdict.adaptations.some((m) => m.key === "feas.ovenSuboptimal")).toBe(true);
    expect(recipe.cook_time_sec).toBeGreaterThan(STYLES_DB.teglia_romana.baking.cook_time_sec_ideal);
  });

  it("pinsa a 250: metodo domestico documentato e applicato al procedimento", () => {
    const recipe = generateRecipe(STYLES_DB.pinsa_romana, kitchen());
    expect(recipe.verdict.outcome).toBe("warnings");
    expect(recipe.verdict.adaptations.map((m) => m.key)).toContain("gen.homeBakingMethod");
    expect(recipe.timeline.find((s) => s.id === "preheat")?.msg?.description?.[0].key).toBe("timeline.homeTray.preheat");
    expect(recipe.timeline.find((s) => s.id === "bake")?.description).toContain("teglia capovolta");
    expect(generateRecipe(STYLES_DB.pinsa_romana, kitchen({ oven_max_temp_c: 249 })).verdict.outcome).toBe("not_feasible");
    expect(STYLES_DB.pinsa_romana.baking.home_adaptation?.source_url).toMatch(/^https:/);
  });

  it("sotto il minimo senza un metodo alternativo non si promette un adattamento", () => {
    const recipe = generateRecipe(STYLES_DB.tonda_romana, kitchen());
    expect(recipe.verdict.blockers).toContainEqual({ kind: "oven_too_cold", oven_c: 250, style_min_c: 300 });
  });

  it("un forno migliore non deve rendere il metodo meno fattibile", () => {
    for (const oven_type of ["home", "gas", "wood"] as const) {
      const recipe = generateRecipe(STYLES_DB.pinsa_romana, kitchen({ oven_type, oven_max_temp_c: 300 }));
      expect(recipe.verdict.blockers).toEqual([]);
    }
  });

  it("le ore scelte a mano rispettano il minimo, come quelle automatiche", () => {
    const c = kitchen({ available_hours: 5 });
    const automatic = generateRecipe(STYLES_DB.napoletana_stg, c);
    const custom = generateRecipe(STYLES_DB.napoletana_stg, c, { customFermentationHours: 5 });
    for (const recipe of [automatic, custom]) {
      expect(recipe.verdict.blockers.some((b) => b.kind === "fermentation_too_short")).toBe(true);
    }
  });

  it("le ore scelte a mano rispettano anche il massimo del metodo", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, kitchen(), { customFermentationHours: 48 });
    expect(recipe.verdict.blockers).toContainEqual({ kind: "fermentation_too_long", fermentation_h: 48, style_max_h: 14 });
  });

  it("attrezzatura mancante: condizione esplicita, non un sì senza riserve", () => {
    const recipe = generateRecipe(STYLES_DB.chicago_deep, kitchen({ has_baking_pan: false }));
    expect(recipe.verdict.outcome).toBe("warnings");
    expect(recipe.verdict.adaptations.map((m) => m.key)).toContain("rec.needsPan");
  });

  it("temperatura di ricetta e URL non aumentano la capacità fisica del forno", () => {
    const c = kitchen({ oven_max_temp_c: 500, oven_capacity_temp_c: 250 });
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, c);
    expect(recipe.oven_temp_c).toBe(250);
    const rec = recommendStyles(c).find((r) => r.style.id === "napoletana_stg")!;
    expect(rec.tier).toBe("not_feasible");
    expect(rec.reasons.map((m) => m.key)).not.toContain("rec.ovenIdeal");
  });

  it("i pesi e l'affinità non promuovono una ricetta bloccata", () => {
    const rec = recommendStyles(kitchen(), undefined, { time: 0, oven: 0, skill: 1, equipment: 0, pantry: 0 })
      .find((r) => r.style.id === "napoletana_stg")!;
    expect(rec.compatibilityScore).toBeGreaterThan(78);
    expect(rec.tier).toBe("not_feasible");
  });

  it("l'ottimizzatore scarta alternative con più punti ma fuori dal metodo", () => {
    const optimized = optimizeRecipe(STYLES_DB.focaccia_genovese, kitchen());
    expect(optimized.recipe.verdict.outcome).not.toBe("not_feasible");
    expect(optimized.recipe.fermentation_hours).toBeLessThanOrEqual(18);
    expect(optimized.alternatives.every((candidate) => candidate.outcome !== "not_feasible")).toBe(true);
  });

  it("la Pinsa lunga resta in frigorifero anche se a TA il punteggio sarebbe maggiore", () => {
    const c = kitchen();
    const warm = generateRecipe(STYLES_DB.pinsa_romana, c, {
      customFermentationHours: 72, customFermentationTempC: 22,
    });
    expect(warm.verdict.blockers).toContainEqual({ kind: "fermentation_temperature", actual_c: 22, required_c: 4 });
    const optimized = optimizeRecipe(STYLES_DB.pinsa_romana, c);
    expect(optimized.recipe.fermentation_temp_c).toBe(4);
    expect(optimized.recipe.verdict.outcome).not.toBe("not_feasible");
  });

  it("tutto il catalogo: consiglio e generazione hanno lo stesso esito e le stesse condizioni", () => {
    const tiers = { ok: "perfect", warnings: "good", not_feasible: "not_feasible" };
    for (const oven_max_temp_c of [200, 250, 300, 450, 485]) {
      for (const available_hours of [2, 8, 24, 72]) {
        for (const skill_level of [1, 4] as const) {
          for (const meal_deadline of [false, true]) {
            const c = kitchen({ oven_max_temp_c, available_hours, skill_level, meal_deadline });
            for (const rec of recommendStyles(c)) {
              const recipe = generateRecipe(rec.style, c);
              expect(rec.tier, `${rec.style.id}/${oven_max_temp_c}/${available_hours}`).toBe(tiers[recipe.verdict.outcome]);
              expect(rec.warnings).toEqual(recipe.verdict.adaptations);
              expect(recipe.scores.composite).toBeLessThanOrEqual(recipe.scores.authenticity);
              if (recipe.verdict.outcome === "not_feasible") expect(recipe.scores.composite).toBeLessThanOrEqual(39);
              if (recipe.verdict.outcome === "ok") expect(recipe.verdict.adaptations).toEqual([]);
              if (recipe.verdict.outcome === "warnings") expect(recipe.verdict.adaptations.length).toBeGreaterThan(0);
              if (recipe.verdict.outcome === "not_feasible") expect(recipe.verdict.blockers.length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });
});
