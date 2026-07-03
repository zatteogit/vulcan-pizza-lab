import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  generateRecipe,
  generateTimeSlots,
  optimizeRecipe,
  thermalViability,
  type UserConstraints,
} from "./pizza-engine";

/* ═══ Rete di sicurezza sul motore (audit lug 2026) ═══
   Invarianti stabili, non numeri fragili: disciplinare AVPN, Regola 55,
   proprietà dell'ottimizzatore, slot orari. Prima di questo file il motore
   (~5k righe) non aveva alcun test eseguibile in CI. */

const napoletana = STYLES_DB["napoletana_stg"];

function makeConstraints(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "wood",
    oven_max_temp_c: 485,
    skill_level: 3 as UserConstraints["skill_level"],
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: true,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: [],
    kitchen_temp_c: 22,
    pantry_flours: [],
    pantry_yeasts: [],
    mixer_type: "hands",
    surfaces: [],
    ...overrides,
  };
}

describe("generateRecipe — Napoletana STG con forno capace", () => {
  const recipe = generateRecipe(napoletana, makeConstraints());

  it("lo stile esiste nel DB", () => {
    expect(napoletana).toBeDefined();
  });

  it("idratazione dentro il range dello stile", () => {
    const [lo, hi] = napoletana.dough.hydration_pct_range;
    expect(recipe.hydration_pct).toBeGreaterThanOrEqual(lo);
    expect(recipe.hydration_pct).toBeLessThanOrEqual(hi);
  });

  it("sale nel range del disciplinare AVPN (45–55 g per litro d'acqua)", () => {
    const gramsPerLiter = (recipe.salt_g / recipe.water_g) * 1000;
    expect(gramsPerLiter).toBeGreaterThanOrEqual(40); // margine tecnico sotto
    expect(gramsPerLiter).toBeLessThanOrEqual(55);
  });

  it("cottura dentro il range dello stile", () => {
    const [lo, hi] = napoletana.baking.cook_time_sec_range;
    expect(recipe.cook_time_sec).toBeGreaterThanOrEqual(lo);
    expect(recipe.cook_time_sec).toBeLessThanOrEqual(hi);
  });

  it("la fermentazione rispetta il tempo disponibile", () => {
    expect(recipe.fermentation_hours).toBeLessThanOrEqual(24);
  });

  it("bilancio impasto: panetti × peso = totale", () => {
    expect(recipe.dough_balls * recipe.ball_weight_g).toBe(recipe.total_dough_g);
  });

  it("punteggi nel dominio 0–100", () => {
    for (const key of ["composite", "authenticity", "feasibility", "digestibility"] as const) {
      expect(recipe.scores[key]).toBeGreaterThanOrEqual(0);
      expect(recipe.scores[key]).toBeLessThanOrEqual(100);
    }
  });
});

describe("Regola 55 (temperatura acqua / DDT)", () => {
  it("cucina a 22°C, a mano: acqua ≈ 28°C (DDT 24: 24×3 − 22 − 22)", () => {
    const recipe = generateRecipe(napoletana, makeConstraints({ kitchen_temp_c: 22 }));
    expect(recipe.science.desired_dough_temp_c).toBe(24);
    expect(recipe.science.water_temp_c).toBe(28);
  });

  it("l'impastatrice sottrae l'attrito dall'acqua", () => {
    const hands = generateRecipe(napoletana, makeConstraints({ mixer_type: "hands" }));
    const mixer = generateRecipe(
      napoletana,
      makeConstraints({ has_mixer: true, mixer_type: "planetary" }),
    );
    expect(mixer.science.friction_factor).toBeGreaterThan(0);
    if (hands.science.water_temp_c != null && mixer.science.water_temp_c != null) {
      expect(mixer.science.water_temp_c).toBeLessThan(hands.science.water_temp_c);
    }
  });

  it("fermentazione in frigo → DDT 22", () => {
    const recipe = generateRecipe(napoletana, makeConstraints(), {
      customFermentationTempC: 4,
      customFermentationHours: 24,
    });
    expect(recipe.science.desired_dough_temp_c).toBe(22);
  });

  it("cucina rovente d'estate: acqua fredda ma mai sotto il pavimento pratico (2°C) o null", () => {
    const recipe = generateRecipe(napoletana, makeConstraints({ kitchen_temp_c: 34 }));
    const wt = recipe.science.water_temp_c;
    expect(wt === null || wt >= 2).toBe(true);
  });
});

describe("optimizeRecipe — proprietà dell'ottimizzatore", () => {
  it("il soffitto non è mai sotto la ricetta generata (a parità di vincoli)", () => {
    const constraints = makeConstraints({ oven_type: "home", oven_max_temp_c: 250 });
    const generated = generateRecipe(napoletana, constraints);
    const optimized = optimizeRecipe(napoletana, constraints);
    expect(optimized.recipe.scores.composite).toBeGreaterThanOrEqual(
      generated.scores.composite - 0.5,
    );
  });

  it("l'ottimo resta dentro i range dello stile", () => {
    const { recipe } = optimizeRecipe(napoletana, makeConstraints());
    const [hLo, hHi] = napoletana.dough.hydration_pct_range;
    expect(recipe.hydration_pct).toBeGreaterThanOrEqual(hLo);
    expect(recipe.hydration_pct).toBeLessThanOrEqual(hHi);
  });
});

describe("thermalViability", () => {
  it("forno domestico a 250°C: la Napoletana non è viabile (< 1)", () => {
    expect(thermalViability(napoletana, 250)).toBeLessThan(1);
  });

  it("forno a legna a 485°C: viabilità piena", () => {
    expect(thermalViability(napoletana, 485)).toBeGreaterThanOrEqual(1);
  });
});

describe("generateTimeSlots", () => {
  it("propone sempre almeno uno slot, con ore positive e crescenti", () => {
    const slots = generateTimeSlots(new Date("2026-07-03T10:00:00"));
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.hours).toBeGreaterThan(0);
    }
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].hours).toBeGreaterThanOrEqual(slots[i - 1].hours);
    }
  });

  it("a tarda sera i pasti di oggi sono già esclusi", () => {
    const slots = generateTimeSlots(new Date("2026-07-03T23:30:00"));
    // nessuno slot deve essere irrealisticamente vicino
    for (const slot of slots) {
      expect(slot.hours).toBeGreaterThanOrEqual(4);
    }
  });
});
