import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  generateRecipe,
  type PizzaStyle,
  type UserConstraints,
} from "./pizza-engine";
import { buildRecipePhases, onlySourdoughYeast, phaseSum, yeastDilution, type DoughIngredientId } from "./recipe-phases";
import { roundForDisplay } from "./dose-rounding";

/* ═══ FW-17 — invarianti delle dosi per fase, su tutti gli stili ═══
 * Come pizza-engine.properties.test.ts: ogni stile, con e senza prefermento
 * (biga e poolish, quote 20–50 %), pochi e tanti panetti. */

const STYLES: PizzaStyle[] = Object.values(STYLES_DB);
const INGREDIENTS: DoughIngredientId[] = ["flour", "water", "yeast", "salt", "sugar", "fat"];

function constraints(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "home",
    oven_max_temp_c: 250,
    skill_level: 3,
    available_hours: 72,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: [],
    kitchen_temp_c: 21,
    pantry_flours: [],
    pantry_yeasts: [],
    mixer_type: "hands",
    surfaces: [],
    ...overrides,
  };
}

const CASES = STYLES.flatMap((style) =>
  [1, 4, 9].flatMap((balls) =>
    [
      { usePreFerment: false },
      { usePreFerment: true, preFerment: { type: "biga" as const, flourPct: 20 } },
      { usePreFerment: true, preFerment: { type: "biga" as const, flourPct: 50 } },
      { usePreFerment: true, preFerment: { type: "poolish" as const, flourPct: 30 } },
      { usePreFerment: true, preFerment: { type: "poolish" as const, flourPct: 50 } },
    ].map((options) => ({ style, balls, options })),
  ),
);

describe("buildRecipePhases — invarianti su tutto il catalogo", () => {
  it("per ogni ingrediente la somma delle fasi è il totale (lo zucchero non sparisce più)", () => {
    for (const { style, balls, options } of CASES) {
      const recipe = generateRecipe(style, constraints({ dough_balls: balls }), options);
      const model = buildRecipePhases(recipe);
      for (const id of INGREDIENTS) {
        const total = model.totals.find((t) => t.id === id)?.grams ?? 0;
        expect(phaseSum(model.phases, id), `${style.id} ×${balls} ${JSON.stringify(options)} ${id}`).toBeCloseTo(total, 6);
      }
    }
  });

  it("nessuna quantità negativa; acqua finale a 0 g solo se dichiarata «tutta nel prefermento»", () => {
    for (const { style, balls, options } of CASES) {
      const recipe = generateRecipe(style, constraints({ dough_balls: balls }), options);
      for (const phase of buildRecipePhases(recipe).phases) {
        for (const ing of phase.ingredients) {
          expect(ing.grams, `${style.id} ${phase.id} ${ing.id}`).toBeGreaterThanOrEqual(0);
          if (phase.id === "final" && ing.id === "water" && ing.grams === 0) expect(ing.note).toBe("allInPreferment");
        }
      }
    }
  });

  it("tutto il lievito nel prefermento; sale, zucchero e grasso solo nell'impasto finale", () => {
    for (const { style, balls, options } of CASES) {
      const recipe = generateRecipe(style, constraints({ dough_balls: balls }), options);
      if (!recipe.has_pre_ferment) continue;
      const [pref, final] = buildRecipePhases(recipe).phases;
      expect(pref.id).toBe("preferment");
      expect(final.ingredients.some((i) => i.id === "yeast")).toBe(false);
      for (const id of ["salt", "sugar", "fat"] as const) expect(pref.ingredients.some((i) => i.id === id)).toBe(false);
      expect(final.ingredients[0].id).toBe("preferment");
    }
  });

  it("totale e percentuali sono quelli del motore (schermo = stampa)", () => {
    for (const { style, balls, options } of CASES.filter((_, i) => i % 7 === 0)) {
      const recipe = generateRecipe(style, constraints({ dough_balls: balls }), options);
      const model = buildRecipePhases(recipe);
      expect(model.totalDoughG).toBe(recipe.total_dough_g);
      expect(model.totals.find((t) => t.id === "water")?.bakerPct).toBe(recipe.hydration_pct);
      if (recipe.salt_g > 0) expect(model.totals.find((t) => t.id === "salt")?.bakerPct).toBe(recipe.baker_pcts?.salt);
    }
  });

  it("le percentuali dichiarate restano entro l'arrotondamento dei grammi (S08-B-19)", () => {
    for (const { style, balls, options } of CASES) {
      const recipe = generateRecipe(style, constraints({ dough_balls: balls }), options);
      const model = buildRecipePhases(recipe);
      for (const id of ["salt", "fat", "sugar"] as const) {
        const row = model.totals.find((t) => t.id === id);
        if (!row) continue;
        const declaredG = (row.bakerPct * recipe.flour_g) / 100;
        const tolerance = declaredG < 5 ? 0.25 : 0.5;
        expect(Math.abs(row.grams - declaredG), `${style.id} ×${balls} ${id}`).toBeLessThanOrEqual(tolerance + 1e-9);
      }
    }
  });
});

describe("casi delle evidenze dell'audit", () => {
  it("S08-A-02: New York con biga: lo zucchero è nell'impasto finale", () => {
    const recipe = generateRecipe(STYLES_DB.new_york, constraints(), { usePreFerment: true, preFerment: { type: "biga", flourPct: 50 } });
    const final = buildRecipePhases(recipe).phases[1];
    expect(recipe.sugar_g).toBeGreaterThan(0);
    expect(final.ingredients.find((i) => i.id === "sugar")?.grams).toBe(recipe.sugar_g);
  });

  it("S08-A-03: poolish al 50 % con idratazione 48 %: la quota scende a 48 %, l'acqua finale non è negativa", () => {
    const recipe = generateRecipe(STYLES_DB.chicago_deep, constraints(), {
      usePreFerment: true,
      preFerment: { type: "poolish", flourPct: 50 },
      customHydration: 48,
    });
    expect(recipe.pre_ferment_flour_pct).toBeLessThanOrEqual(48);
    const final = buildRecipePhases(recipe).phases[1];
    const water = final.ingredients.find((i) => i.id === "water")!;
    expect(water.grams).toBeGreaterThanOrEqual(0);
    if (water.grams === 0) expect(water.note).toBe("allInPreferment");
  });

  it("S08-A-07: con un prefermento due temperature dell'acqua, la finale con la regola a quattro termini", () => {
    const k = constraints({ kitchen_temp_c: 20 });
    const plain = generateRecipe(STYLES_DB.napoletana_canotto, k, { usePreFerment: false, customFermentationTempC: 20 });
    const biga = generateRecipe(STYLES_DB.napoletana_canotto, k, { usePreFerment: true, preFerment: { type: "biga" }, customFermentationTempC: 20 });
    // 3 × 24 − 20 − 20 = 32 · 4 × 24 − 20 − 20 − 19 = 37 · biga: 3 × 19 − 20 − 20 = 17
    expect(plain.water_temp_c).toBe(32);
    expect(biga.water_temp_c).toBe(37);
    expect(biga.pre_ferment_water_temp_c).toBe(17);
    const phases = buildRecipePhases(biga).phases;
    expect(phases[0].waterTempC).toBe(17);
    expect(phases[1].waterTempC).toBe(37);
  });

  it("D-P: con il solo lievito madre niente biga, e la ricetta lo dice", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_canotto, constraints({ pantry_yeasts: ["sourdough"] }), {
      usePreFerment: true,
      preFerment: { type: "biga" },
      customFermentationHours: 24,
    });
    expect(recipe.yeast_type).toBe("sourdough");
    expect(recipe.has_pre_ferment).toBe(false);
    expect(recipe.method_changes?.map((m) => m.key)).toContain("preferment.sourdoughInstead");
    expect(recipe.timeline.some((s) => s.id === "preferment")).toBe(false);
  });

  it("D-P: con lievito di birra in dispensa la biga usa quello, non il lievito madre", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_canotto, constraints({ pantry_yeasts: ["sourdough", "fresh"] }), {
      usePreFerment: true,
      preFerment: { type: "biga" },
      customFermentationHours: 24,
    });
    expect(recipe.has_pre_ferment).toBe(true);
    expect(recipe.yeast_type).toBe("fresh");
  });
});

describe("yeastDilution (D-O)", () => {
  it("0,6 g: 30 g di soluzione al 2 % e 29 g d'acqua in meno", () => {
    const d = yeastDilution(0.6, "fresh", 300)!;
    expect(d).toMatchObject({ stockYeastG: 5, stockWaterG: 245, solutionG: 30, waterToRemoveG: 29 });
    // l'aritmetica è esatta: la soluzione prelevata contiene la dose
    expect((d.solutionG * d.stockYeastG) / (d.stockYeastG + d.stockWaterG)).toBeCloseTo(0.6, 9);
  });

  it("solo sotto il grammo, mai per il lievito madre, mai oltre l'acqua disponibile", () => {
    expect(yeastDilution(1, "fresh", 500)).toBeNull();
    expect(yeastDilution(0.5, "sourdough", 500)).toBeNull();
    expect(yeastDilution(0.9, "fresh", 40)).toBeNull();
    expect(yeastDilution(0, "fresh", 500)).toBeNull();
  });

  it("stima in cucchiaini solo per il secco e solo vicino alla dose", () => {
    expect(yeastDilution(0.8, "dry", 500)?.spoonEstimate).toBe("quarter");
    expect(yeastDilution(0.4, "dry", 500)?.spoonEstimate).toBe("eighth");
    expect(yeastDilution(0.1, "dry", 500)?.spoonEstimate).toBeUndefined();
    expect(yeastDilution(0.8, "fresh", 500)?.spoonEstimate).toBeUndefined();
  });
});

describe("roundForDisplay (S08-B-19)", () => {
  it("sale e grasso al mezzo grammo sotto i 5 g, al grammo sopra", () => {
    expect(roundForDisplay("salt", 2.36)).toBe(2.5);
    expect(roundForDisplay("fat", 1.7)).toBe(1.5);
    expect(roundForDisplay("salt", 14.4)).toBe(14);
    expect(roundForDisplay("yeast", 0.64)).toBe(0.6);
    expect(roundForDisplay("starter", 91.6)).toBe(92);
  });
});

describe("onlySourdoughYeast (D-P) — stessa scelta del motore", () => {
  const cases: [string[], string[]][] = [
    [[], []], [["sourdough"], []], [["sourdough", "fresh"], []], [["sourdough", "fresh"], ["fresh"]],
    [["fresh"], ["fresh", "dry"]], [["dry"], []], [[], ["fresh", "dry"]],
  ];
  it("vero solo quando il motore userebbe per forza il lievito madre", () => {
    for (const [pantry, excluded] of cases) {
      const recipe = generateRecipe(
        STYLES_DB.napoletana_canotto,
        constraints({ pantry_yeasts: pantry, excluded_yeasts: excluded as UserConstraints["excluded_yeasts"] }),
        { usePreFerment: true, preFerment: { type: "biga" }, customFermentationHours: 24 },
      );
      const forced = recipe.yeast_type === "sourdough";
      expect(onlySourdoughYeast(pantry, excluded), JSON.stringify([pantry, excluded])).toBe(forced);
    }
  });
});
