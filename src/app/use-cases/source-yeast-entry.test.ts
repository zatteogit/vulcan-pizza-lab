import { describe, expect, it, vi } from "vitest";
import { STYLES_DB, type UserConstraints } from "../domain/pizza-engine";
import type { Interpretation } from "../data/interpretation-library";
import { FRIDGE_MAX_TEMP_C } from "../domain/fermentation-constants";

/* ═══ Tranche B1 (D-068) · lievito della fonte dal preset alla ricetta ═══
 * Una versione d'autore di prova, del tipo nuovo `autore`, con il lievito
 * della fonte e il «luogo caldo»: i dati veri (Benedetta Rossi) arrivano con
 * la B2. La libreria vera non cambia; qui la voce di prova si aggiunge solo
 * alla ricerca per id, come la userebbe Crea. */

const TEST_AUTORE: Interpretation = {
  id: "test_autore_b1",
  type: "autore",
  author: "Autrice di prova",
  base_style_id: "focaccia_genovese",
  parameter_overrides: { hydration_pct: 60, flour_w: 260, fermentation_hours: 2, warm_place: true, use_pre_ferment: false },
  source_yeast: { type: "dry", pct: 1.4 },
  source_status: "verified",
  url: "https://example.org/ricetta",
  story: "Voce di prova per i test della tranche B1.",
};

vi.mock("../data/interpretation-library", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../data/interpretation-library")>();
  return { ...actual, getInterpretationById: (id: string) => (id === TEST_AUTORE.id ? TEST_AUTORE : actual.getInterpretationById(id)) };
});

const { authorVersionRecipe, buildGeneratedRecipe, canonicalRecipeEntry, interpretationEngineOptions, presetOvenTemp, recipePresetState } =
  await import("./recipe-entry");

const weights = { authenticity: .3, feasibility: .25, digestibility: .2, sustainability: .15, experimentation: .1 };
const base: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 24, dough_balls: 1, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const style = STYLES_DB.focaccia_genovese;

function openedInCreate(constraints: UserConstraints, edit: { fermentHours?: number } = {}) {
  const p = recipePresetState(style, null, TEST_AUTORE);
  return buildGeneratedRecipe({ style, scoreWeights: weights, constraints: { ...constraints, oven_max_temp_c: presetOvenTemp(style, constraints) },
    customHydration: p.hydration, customFlourW: p.flourW, customFlourPL: p.flourPL, customSalt: p.salt,
    customFermentHours: edit.fermentHours ?? p.fermentHours, customFermentTemp: p.fermentTemp, usePreFerment: p.usePreFerment,
    preFermentChoice: {}, panConfig: p.panConfig, activeVersion: null, activeInterpretationId: TEST_AUTORE.id,
    selectedToppingConcept: p.toppingConcept, customFlourBlend: p.flourBlend });
}

describe("interpretationEngineOptions", () => {
  it("lievito con le ore e la temperatura della versione; «luogo caldo» a 26 °C", () => {
    expect(interpretationEngineOptions(TEST_AUTORE)).toEqual({
      sourceYeast: { type: "dry", pct: 1.4, hours: 2, temp_c: 26 }, warmPlace: true,
    });
    expect(canonicalRecipeEntry(style, weights, TEST_AUTORE).options.customFermentationTempC).toBe(26);
  });
  it("le versioni senza fonte del lievito non passano nulla al motore", () => {
    expect(interpretationEngineOptions(null)).toEqual({});
    expect(interpretationEngineOptions({ ...TEST_AUTORE, source_yeast: undefined, parameter_overrides: { fermentation_hours: 8 } })).toEqual({});
    // Senza le ore della fonte la dose non ha riscontro: non si passa.
    expect(interpretationEngineOptions({ ...TEST_AUTORE, parameter_overrides: { warm_place: true } })).toEqual({ warmPlace: true });
  });
});

describe("dal preset a Crea", () => {
  it("la scheda dello stile e Crea danno la stessa ricetta, con la dose della fonte", () => {
    for (const constraints of [base, { ...base, pantry_yeasts: ["fresh"], pantry_inventory_complete: true }]) {
      const preset = authorVersionRecipe(style, TEST_AUTORE, constraints, weights);
      expect(preset).toEqual(openedInCreate(constraints));
      expect(preset.yeast_source?.source_pct).toBe(1.4);
      expect(preset.source_notes?.some((n) => n.key === "fermentation.warmPlace")).toBe(true);
    }
    expect(openedInCreate({ ...base, pantry_yeasts: ["fresh"], pantry_inventory_complete: true }).source_notes?.map((n) => n.key))
      .toEqual(["yeast.sourceDryAsFresh", "fermentation.warmPlace"]);
  });
  it("8 °C per B5 (Dekracap): la versione passa 8 °C al motore, la soglia del frigo resta 6 °C", () => {
    const cold: Interpretation = { ...TEST_AUTORE, id: "test_freddo_8", base_style_id: "teglia_romana", source_yeast: undefined,
      parameter_overrides: { hydration_pct: 85, flour_w: 350, fermentation_hours: 48, fermentation_temp_c: 8 } };
    const entry = canonicalRecipeEntry(STYLES_DB.teglia_romana, weights, cold);
    expect(entry.options.customFermentationTempC).toBe(8);
    expect(interpretationEngineOptions(cold)).toEqual({});
    const r = authorVersionRecipe(STYLES_DB.teglia_romana, cold, base, weights);
    expect([r.fermentation_hours, r.fermentation_temp_c]).toEqual([48, 8]);
    expect(FRIDGE_MAX_TEMP_C).toBe(6);
  });
  it("se in Crea si cambiano le ore torna la dose del modello", () => {
    const edited = openedInCreate(base, { fermentHours: 6 });
    expect(edited.yeast_source).toBeUndefined();
    expect(edited.science.yeast_baker_pct).toBeLessThan(1.4);
  });
});
