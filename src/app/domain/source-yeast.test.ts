import { describe, expect, it } from "vitest";
import { YEAST_DRY_RATIO } from "./fermentation-model";
import { WARM_PLACE } from "./fermentation-constants";
import { convertYeastPct, sourceYeastMatches, sourceYeastUse, type SourceYeast } from "./source-yeast";
import { STYLES_DB, generateRecipe, type GeneratedRecipe, type GenerateRecipeOptions, type UserConstraints } from "./pizza-engine";

/* ═══ Tranche B1 (M1, D-068) · lievito della fonte ═══
 * Dosi come in docs/progetto-catalogo-italiano.md §9.3: Benedetta Rossi
 * (pagina Paneangeli) 1 bustina da 7 g di secco su 500 g di farina = 1,4 %,
 * circa 2 h «in un luogo caldo» (26 °C, decisione 7); Adriano Continisio
 * 4,5 g di fresco su 900 g = 0,5 %. Qui solo il comportamento del motore: i
 * dati delle versioni arrivano con la tranche B2. */

const BENEDETTA: SourceYeast = { type: "dry", pct: 1.4, hours: 2, temp_c: WARM_PLACE.calcC };
const ADRIANO: SourceYeast = { type: "fresh", pct: 0.5, hours: 10, temp_c: 22 };

describe("convertYeastPct: rapporto del motore 1:3", () => {
  it("il secco è un terzo del fresco, e ritorno", () => {
    expect(convertYeastPct(1.4, "dry", "dry")).toBe(1.4);
    expect(convertYeastPct(1.4, "dry", "fresh")).toBeCloseTo(1.4 / YEAST_DRY_RATIO, 10);
    expect(convertYeastPct(1.4, "dry", "fresh")).toBeCloseTo(4.24, 2); // §9.3: «4,2 % col rapporto 1:3 del motore»
    expect(convertYeastPct(0.5, "fresh", "dry")).toBeCloseTo(0.165, 10);
    expect(convertYeastPct(convertYeastPct(0.5, "fresh", "dry"), "dry", "fresh")).toBeCloseTo(0.5, 10);
  });
});

describe("sourceYeastUse", () => {
  it("vale solo con le ore e la temperatura della fonte", () => {
    expect(sourceYeastMatches(BENEDETTA, 2, 26)).toBe(true);
    expect(sourceYeastMatches(BENEDETTA, 2 + 0.5 / 60, 26)).toBe(true);
    expect(sourceYeastMatches(BENEDETTA, 3, 26)).toBe(false);
    expect(sourceYeastMatches(BENEDETTA, 2, 22)).toBe(false);
    expect(sourceYeastUse(BENEDETTA, [], [], 3, 26)).toBeNull();
  });
  it("col tipo della fonte in dispensa (o dispensa non detta): tipo e dose come scritti", () => {
    const written = { source_type: "dry", source_pct: 1.4, type: "dry", pct: 1.4, converted: false };
    expect(sourceYeastUse(BENEDETTA, [], [], 2, 26)).toEqual(written);
    expect(sourceYeastUse(BENEDETTA, ["dry"], [], 2, 26)).toEqual(written);
    expect(sourceYeastUse(BENEDETTA, ["fresh", "dry"], [], 2, 26)).toEqual(written);
  });
  it("senza quel tipo e con l'altro lievito di birra: conversione 1:3 dichiarata", () => {
    expect(sourceYeastUse(BENEDETTA, ["fresh"], [], 2, 26)).toMatchObject({ type: "fresh", converted: true, source_type: "dry", source_pct: 1.4 });
    expect(sourceYeastUse(BENEDETTA, ["fresh"], [], 2, 26)!.pct).toBeCloseTo(1.4 / YEAST_DRY_RATIO, 10);
    expect(sourceYeastUse(ADRIANO, ["dry", "sourdough"], [], 10, 22)).toMatchObject({ type: "dry", pct: 0.5 * YEAST_DRY_RATIO, converted: true });
    // Dispensa non detta ma tipo della fonte escluso: si converte.
    expect(sourceYeastUse(BENEDETTA, [], ["dry"], 2, 26)).toMatchObject({ type: "fresh", converted: true });
  });
  it("col solo lievito madre resta il tipo della fonte: nessuna conversione senza fonte", () => {
    expect(sourceYeastUse(BENEDETTA, ["sourdough"], [], 2, 26)).toMatchObject({ type: "dry", pct: 1.4, converted: false });
  });
});

describe("generateRecipe con il lievito della fonte", () => {
  const style = STYLES_DB.focaccia_genovese;
  const kitchen: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, skill_level: 2, available_hours: 24,
    dough_balls: 1, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
    pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
  const options: GenerateRecipeOptions = { customFermentationHours: 2, customFermentationTempC: 26, usePreFerment: false };
  const recipe = (c: UserConstraints, extra: GenerateRecipeOptions = {}) =>
    generateRecipe(style, c, { ...options, sourceYeast: BENEDETTA, ...extra });
  const pctOf = (r: GeneratedRecipe) => r.science.yeast_baker_pct;

  it("la dose è quella della fonte, non quella del modello, e la stima del modello si dichiara", () => {
    const model = generateRecipe(style, kitchen, options);
    const source = recipe(kitchen);
    expect(source.yeast_type).toBe("dry");
    expect(pctOf(source)).toBe(1.4);
    expect(source.yeast_g).toBeCloseTo(source.flour_g * 0.014, 1);
    expect(model.yeast_source).toBeUndefined();
    expect(source.yeast_source).toMatchObject({ source_type: "dry", source_pct: 1.4, type: "dry", pct: 1.4, converted: false });
    // La stima è quella del modello per lo stesso tipo, le stesse ore e la stessa temperatura.
    const modelDry = generateRecipe(style, { ...kitchen, pantry_yeasts: ["dry"] }, options);
    expect(source.yeast_source!.model_pct).toBeCloseTo(modelDry.science.yeast_baker_pct, 2);
    expect(source.yeast_source!.model_pct).toBeLessThan(0.2); // §9.3: il modello darebbe 0,09–0,12 %
    expect(source.source_notes).toBeUndefined();
  });
  it("tempi coerenti con la fonte: la timeline è la stessa, cambia solo il lievito", () => {
    const model = generateRecipe(style, { ...kitchen, pantry_yeasts: ["dry"] }, options);
    const source = recipe({ ...kitchen, pantry_yeasts: ["dry"] });
    expect(source.fermentation_hours).toBe(2);
    expect(source.fermentation_temp_c).toBe(26);
    expect(source.timeline.map((s) => [s.id, s.duration_minutes])).toEqual(model.timeline.map((s) => [s.id, s.duration_minutes]));
    expect(source.flour_g + source.water_g).toBeGreaterThan(0);
  });
  it("la dose non cambia con la cucina né con la correzione personale", () => {
    const base = pctOf(recipe(kitchen));
    for (const c of [
      { ...kitchen, yeast_speed_factor: 1.6 },
      { ...kitchen, yeast_speed_factor: 0.6 },
      { ...kitchen, oven_type: "electric_high" as const, oven_max_temp_c: 450 },
      { ...kitchen, dough_balls: 3, kitchen_temp_c: 28 },
    ]) expect(pctOf(recipe(c))).toBe(base);
    // Il modello invece segue la correzione personale.
    expect(pctOf(generateRecipe(style, { ...kitchen, yeast_speed_factor: 1.6 }, options)))
      .toBeLessThan(pctOf(generateRecipe(style, kitchen, options)));
  });
  it("senza il tipo della fonte in dispensa: conversione col rapporto del motore, dichiarata", () => {
    const r = recipe({ ...kitchen, pantry_yeasts: ["fresh"], pantry_inventory_complete: true });
    expect(r.yeast_type).toBe("fresh");
    expect(pctOf(r)).toBeCloseTo(1.4 / YEAST_DRY_RATIO, 2);
    expect(r.yeast_source).toMatchObject({ converted: true, source_type: "dry", type: "fresh" });
    expect(r.source_notes?.map((n) => n.key)).toEqual(["yeast.sourceDryAsFresh"]);
    expect(r.source_notes![0].params).toMatchObject({ sourcePct: 1.4, pct: 4.24 });
    expect(r.verdict.conditions?.some((c) => c.kind === "yeast")).toBe(false);
    const dry = generateRecipe(style, { ...kitchen, pantry_yeasts: ["dry"], pantry_inventory_complete: true },
      { ...options, sourceYeast: ADRIANO, customFermentationHours: 10, customFermentationTempC: 22 });
    expect(dry.source_notes?.map((n) => n.key)).toEqual(["yeast.sourceFreshAsDry"]);
  });
  it("col solo lievito madre: tipo della fonte e lievito da procurare", () => {
    const r = recipe({ ...kitchen, pantry_yeasts: ["sourdough"], pantry_inventory_complete: true });
    expect(r.yeast_type).toBe("dry");
    expect(pctOf(r)).toBe(1.4);
    expect(r.verdict.conditions?.find((c) => c.kind === "yeast")?.status).toBe("missing");
  });
  it("con ore o temperatura diverse dalla fonte torna il modello", () => {
    const hours = recipe(kitchen, { customFermentationHours: 4 });
    expect(hours.yeast_source).toBeUndefined();
    expect(hours).toEqual(generateRecipe(style, kitchen, { ...options, customFermentationHours: 4 }));
    const temp = recipe(kitchen, { customFermentationTempC: 22 });
    expect(temp.yeast_source).toBeUndefined();
  });
  it("su un impasto non lievitato la fonte non aggiunge lievito", () => {
    const recco = generateRecipe(STYLES_DB.focaccia_recco, kitchen, { sourceYeast: { ...BENEDETTA, hours: 0.5, temp_c: 22 }, customFermentationHours: 0.5, customFermentationTempC: 22 });
    expect(recco.yeast_g).toBe(0);
    expect(recco.yeast_source).toBeUndefined();
  });
});

describe("«luogo caldo» senza gradi (decisione 7)", () => {
  const kitchen: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, skill_level: 2, available_hours: 24,
    dough_balls: 1, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
    pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
  const style = STYLES_DB.focaccia_genovese;
  it("a 26 °C la ricetta dichiara la scelta di Vulcan con la finestra 24–28 °C", () => {
    expect(WARM_PLACE).toEqual({ calcC: 26, windowC: [24, 28] });
    const r = generateRecipe(style, kitchen, { customFermentationHours: 2, customFermentationTempC: 26, warmPlace: true });
    expect(r.source_notes?.map((n) => n.key)).toEqual(["fermentation.warmPlace"]);
    expect(r.source_notes![0].params).toMatchObject({ temp: 26, tempMin: 24, tempMax: 28 });
  });
  it("con un'altra temperatura la nota non c'è", () => {
    const r = generateRecipe(style, kitchen, { customFermentationHours: 2, customFermentationTempC: 22, warmPlace: true });
    expect(r.source_notes).toBeUndefined();
  });
});
