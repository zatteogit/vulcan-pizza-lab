import { afterEach, describe, expect, it } from "vitest";
import {
  EXTRA_DOUGH_INGREDIENTS, STYLES_DB, declaredPhases, equivalentFermentationHours, fermentationPhases, generateRecipe,
  type GeneratedRecipe, type UserConstraints,
} from "../domain/pizza-engine";
import { WARM_PLACE } from "../domain/fermentation-constants";
import { buildRecipePhases } from "../domain/recipe-phases";
import { getInterpretationById, getInterpretationsForStyle, isBlockedByStyle } from "../data/interpretation-library";
import { getImpasto } from "../data/impasto-library";
import { handleMcpMessage } from "../agent/mcp-server";
import { IT_LOCALE } from "../features/cms/locales/it";
import { JA_LOCALE } from "../features/cms/locales/ja";
import type { CmsContent } from "../features/cms/cms-context";
import { flourBlendName, localizeStep, phaseRowLabel } from "../features/recipe/recipe-output-format";
import { pantryIngredientNames } from "../features/recipe/pantry-ingredient-names";
import { registerUiMessages, setActiveUiLocale } from "../i18n/ui-messages";
import { UI_MESSAGES_JA } from "../i18n/ui-messages.ja";
import { DEFAULT_UI_SCORE_WEIGHTS } from "../domain/recipe-score";
import { canonicalRecipeEntry, optimizeSelectedRecipe, recipeFromEntry } from "./recipe-entry";

/* ═══ Tranche B4 · Paoletta, teglia in giornata «da fare in fretta» ═══
 * Fonte: Paola Sersante («Paoletta»), «Pizza di Paoletta da fare in fretta»,
 * Anice & Cannella, 05/02/2018, aggiornata il 09/07/2025 (verificata,
 * docs/progetto-catalogo-italiano.md §9.2). Versione bassa (decisione 10 di
 * Matteo): dose della fonte ×1,5 per 2 teglie 30×40, con W 330 ed enkir:
 * farine 600 g (W 330 450, semola rimacinata 75, enkir 75), acqua 480,
 * lievito di birra fresco 15, sale 12, olio EVO 30, malto d'orzo in sciroppo
 * 1,5 cucchiaini ≈ 10,5 g, fiocchi di patate facoltativi 1,5 cucchiai ≈ 8,1 g
 * (spenti). Fasi: 2 h in ciotola, 1 h a campana dopo pieghe e
 * arrotondamento, 30 minuti in teglia; «luogo caldo» a 26 °C.
 * Tolleranza dichiarata: il motore arrotonda il peso della teglia (573 g
 * invece di 573,75: 0,478 g/cm² sulla teglia 30×40), quindi farina e acqua
 * ±1 g; malto ±0,5 g (arrotondato al grammo); sale, olio e lievito esatti. */

const style = STYLES_DB.teglia_in_giornata;
const paoletta = getInterpretationById("paoletta")!;
const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 24, dough_balls: 2, has_mixer: true, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const entry = () => canonicalRecipeEntry(style, undefined, paoletta);
const recipe = (c: Partial<UserConstraints> = {}) => recipeFromEntry(entry(), { ...home, ...c });
const minutes = (r: GeneratedRecipe, id: string) => r.timeline.filter((s) => s.id === id).reduce((n, s) => n + s.duration_minutes, 0);
const extra = (r: GeneratedRecipe, id: string) => r.extra_ingredients?.find((x) => x.id === id);

describe("dati della versione", () => {
  it("versione d'autore verificata della teglia in giornata, dentro gli intervalli dello stile", () => {
    expect([paoletta.type, paoletta.source_status, paoletta.base_style_id]).toEqual(["autore", "verified", "teglia_in_giornata"]);
    expect(paoletta.url).toBe("https://www.aniceecannella.com/la-pizza-di-paoletta-da-fare-in-fretta/");
    expect(paoletta.process_profile?.source_url).toBe(paoletta.url);
    expect(paoletta.source_yeast).toEqual({ type: "fresh", pct: 2.5 });
    expect(isBlockedByStyle(paoletta, style)).toBe(false);
    expect(getInterpretationsForStyle(style.id).map((i) => i.id)).toContain("paoletta");
    const o = paoletta.parameter_overrides!;
    const d = style.dough;
    expect(o.hydration_pct!).toBeGreaterThanOrEqual(d.hydration_pct_range[0]);
    expect(o.hydration_pct!).toBeLessThanOrEqual(d.hydration_pct_range[1]);
    expect(o.flour_w!).toBeGreaterThanOrEqual(d.flour_w_range[0]);
    expect(o.flour_w!).toBeLessThanOrEqual(d.flour_w_range[1]);
    expect(o.fermentation_hours!).toBeGreaterThanOrEqual(d.fermentation_hours_range[0]);
    expect(o.fermentation_hours!).toBeLessThanOrEqual(d.fermentation_hours_range[1]);
    // L'impasto della versione cambia sale, olio, zucchero, mix e ingredienti aggiuntivi: non gli intervalli.
    expect(Object.keys(getImpasto("paoletta")!.dough_overrides!).sort())
      .toEqual(["extra_ingredients", "fat_type", "flour_blend", "oil_pct", "salt_pct", "sugar_pct"]);
  });
  it("le fasi della fonte sommano le 3 h 30 della versione, tutte nel «luogo caldo»", () => {
    const p = paoletta.process_profile!.phases!;
    expect([p.bulk.hours, p.rest?.hours, p.proof.hours]).toEqual([2, 1, 0.5]);
    expect([p.bulk.temp_c, p.rest?.temp_c, p.proof.temp_c]).toEqual([WARM_PLACE.calcC, WARM_PLACE.calcC, WARM_PLACE.calcC]);
    expect(declaredPhases(paoletta.process_profile, 3.5, 26, false)).toBe(p);
    expect(declaredPhases(paoletta.process_profile, 3, 26, false)).toBeUndefined();
    expect(fermentationPhases(3.5, false, "poolish", paoletta.process_profile, 26)).toEqual({ preferment: 0, bulk: 2, rest: 1, proof: 0.5 });
    // Senza riposo della fonte la forma resta quella di prima (nessuna chiave in più).
    expect(Object.keys(fermentationPhases(3.5, false))).toEqual(["preferment", "bulk", "proof"]);
  });
});

describe("dosi della fonte (2 teglie 30×40, forno di casa a 250 °C)", () => {
  const r = recipe();
  it("farine, acqua, sale, olio, lievito, malto: i grammi della versione bassa", () => {
    expect([r.dough_balls, r.ball_weight_g]).toEqual([2, 573]);
    expect(Math.round((r.ball_weight_g / (30 * 40)) * 1000) / 1000).toBe(0.478);
    expect(Math.abs(r.flour_g - 600)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.water_g - 480)).toBeLessThanOrEqual(1);
    expect([r.salt_g, r.fat_g, r.sugar_g]).toEqual([12, 30, 0]);
    expect([r.yeast_type, r.yeast_g]).toEqual(["fresh", 15]);
    expect(r.yeast_source).toMatchObject({ source_type: "fresh", source_pct: 2.5, converted: false });
    expect([r.hydration_pct, r.flour_w, r.baker_pcts]).toEqual([80, 330, { salt: 2, fat: 5, sugar: 0 }]);
    expect(Math.abs(extra(r, "malt_syrup")!.grams - 10.5)).toBeLessThanOrEqual(0.5);
    expect([r.oven_temp_c, r.cook_time_sec]).toEqual([250, 750]);
    expect(r.verdict.outcome).not.toBe("not_feasible");
  });
  it("il mix: W 330 per il frumento, semola ed enkir con glutine non diluiscono la forza", () => {
    expect(r.flour_blend?.map((c) => [c.id, c.pct, c.grams])).toEqual([["wheat", 75, 449], ["semola", 12.5, 75], ["enkir", 12.5, 75]]);
    expect(r.flour_blend!.reduce((s, c) => s + c.grams, 0)).toBe(r.flour_g);
    expect(r.effective_gluten_w).toBeUndefined();
    // La stessa quota senza glutine (come il riso della pinsa) la diluirebbe.
    const riceLike = generateRecipe(entry().style, home, { ...entry().options,
      customFlourBlend: [{ name: "Farina di frumento", pct: 75, w: 330 }, { name: "Farina di riso", pct: 25 }] });
    expect(riceLike.effective_gluten_w).toBe(248);
  });
  it("le note: «luogo caldo», dosi convertite della versione bassa, salsa della margherita dello stile", () => {
    expect(r.source_notes?.map((n) => n.key)).toEqual(["fermentation.warmPlace", "source.paolettaDoses", "topping.sauceSeasoning"]);
  });
});

describe("ingredienti aggiuntivi (M4)", () => {
  it("malto nel totale; fiocchi di patate facoltativi, spenti e fuori dal totale", () => {
    const r = recipe();
    expect(extra(r, "malt_syrup")).toMatchObject({ name: EXTRA_DOUGH_INGREDIENTS.malt_syrup.name, pct: 1.75 });
    expect(extra(r, "malt_syrup")?.optional).toBeUndefined();
    expect(extra(r, "potato_flakes")).toMatchObject({ pct: 1.35, grams: 8, optional: true });
    expect(extra(r, "potato_flakes")?.included).toBeUndefined();
    // Totale = farina × (1 + acqua + sale + olio + lievito + malto), senza i fiocchi.
    expect(Math.round(r.flour_g * (1 + 0.8 + 0.02 + 0.05 + 0.025 + 0.0175))).toBe(r.total_dough_g);
    const phases = buildRecipePhases(r);
    expect(phases.totals.map((t) => t.id)).toEqual(["flour", "water", "salt", "yeast", "malt_syrup", "potato_flakes", "fat"]);
    expect(phases.totals.find((t) => t.id === "potato_flakes")?.optional).toBe(true);
    expect(phases.phases[0].ingredients.map((i) => i.id)).toContain("malt_syrup");
  });
  it("scelti per nome (come gli altri facoltativi) entrano nel totale e nella ricetta", () => {
    const base = recipe();
    const withFlakes = recipe({ included_optional_ingredients: ["fiocchi di patate"] });
    expect(extra(withFlakes, "potato_flakes")?.included).toBe(true);
    expect(withFlakes.total_dough_g).toBe(base.total_dough_g);
    expect(withFlakes.flour_g).toBeLessThan(base.flour_g);
    expect(buildRecipePhases(withFlakes).totals.find((t) => t.id === "potato_flakes")?.optional).toBeUndefined();
  });
  it("allergeni: il malto d'orzo è glutine; i fiocchi di patate (facoltativi) vanno letti in etichetta", () => {
    const r = recipe();
    const gluten = r.allergens.contains.find((g) => g.id === "gluten")!.sources.map((s) => s.ingredient);
    expect(gluten).toEqual(["Farina di frumento", "Semola rimacinata di grano duro", "Farina di farro monococco", "Malto d'orzo"]);
    expect(r.allergens.unverified.map((u) => u.ingredient)).toContain("Fiocchi di patate");
    expect(r.allergens.unverified.map((u) => u.ingredient)).not.toContain("Malto d'orzo");
    expect(r.allergens.optional_ingredients).toEqual([{ id: "fiocchi di patate", name: "Fiocchi di patate", selected: false }]);
  });
  it("diete: senza glutine lo dicono tutte le farine e il malto; vegano, l'impasto non è in conflitto", () => {
    const gf = recipe({ dietary_filters: ["gluten_free"] }).dietary_warnings!.find((w) => w.filterId === "gluten_free")!;
    expect(gf.severity).toBe("critical");
    expect(gf.ingredients).toEqual(["Farina di frumento", "Semola rimacinata di grano duro", "Farina di farro monococco", "Malto d'orzo"]);
    const vegan = recipe({ dietary_filters: ["vegan"] }).dietary_warnings!.filter((w) => w.filterId === "vegan");
    expect(vegan.find((w) => w.severity === "critical")?.ingredients).toEqual(["Mozzarella a dadini"]);
    const verify = vegan.find((w) => w.severity === "warning")?.ingredients ?? [];
    expect(verify).not.toContain("Malto d'orzo");
    expect(verify).not.toContain("Semola rimacinata di grano duro");
  });
  it("dispensa: «Non usare» il malto blocca, i fiocchi facoltativi no; con la dispensa completa il malto serve", () => {
    const noMalt = recipe({ excluded_ingredients: ["malto d'orzo"] });
    expect(noMalt.verdict.blockers.some((b) => b.kind === "resource_excluded")).toBe(true);
    const noFlakes = recipe({ excluded_ingredients: ["fiocchi di patate"] });
    expect(noFlakes.verdict.blockers.some((b) => b.kind === "resource_excluded")).toBe(false);
    const complete = recipe({ pantry_ingredients_complete: true, pantry_ingredients: [] });
    expect(complete.verdict.conditions?.some((c) => c.kind === "ingredient" && c.message.params?.ingredient === "Malto d'orzo")).toBe(true);
  });
});

describe("fasi della fonte nella timeline (con il riposo dei panetti)", () => {
  const r = recipe();
  it("puntata 2 h, staglio, riposo 1 h a campana, stesura in teglia, 30 minuti in teglia col preriscaldo", () => {
    expect(r.declared_phases).toEqual(paoletta.process_profile!.phases);
    const ids = r.timeline.map((s) => s.id);
    expect(ids).toEqual(["mix", "bulk", "divide", "rest", "shape", "preheat", "spread_margherita_teglia_in_giornata", "bake"]);
    const rest = r.timeline.find((s) => s.id === "rest")!;
    expect([minutes(r, "bulk"), r.timeline.find((s) => s.id === "bulk")!.temp_c]).toEqual([120, 26]);
    expect([rest.duration_minutes, rest.temp_c, rest.msg?.title?.key]).toEqual([60, 26, "timeline.rest.title"]);
    // Appretto di 30 minuti tutto durante il preriscaldo del forno di casa (30 minuti a 250 °C).
    expect(minutes(r, "proof") + minutes(r, "preheat")).toBe(30);
    expect(r.timeline.find((s) => s.id === "preheat")?.variant).toBe("whole_proof");
    // La fermentazione della timeline è quella della ricetta: 3 h 30.
    expect(minutes(r, "bulk") + minutes(r, "rest") + minutes(r, "proof") + minutes(r, "preheat")).toBe(210);
    expect(r.timeline.some((s) => s.id === "folds")).toBe(false);
  });
  it("il condimento dopo l'appretto in teglia, cottura ventilata dal basso all'alto", () => {
    const spread = r.timeline.find((s) => s.id === "spread_margherita_teglia_in_giornata")!;
    expect(spread.topping_variant).toBe("after_pan_proof");
    expect(spread.description).toMatch(/impasto lievitato nella teglia/);
    expect(r.timeline.find((s) => s.id === "bake")?.msg?.description?.map((m) => m.key)).toContain("timeline.bake.lowThenHighFan");
    // Benedetta (riferimento) e Adriano non cambiano.
    const ref = recipeFromEntry(canonicalRecipeEntry(style), home);
    expect(ref.timeline.find((s) => s.id === "spread_margherita_teglia_in_giornata")?.topping_variant).toBeUndefined();
    expect(ref.timeline.some((s) => s.id === "rest")).toBe(false);
    const adriano = recipeFromEntry(canonicalRecipeEntry(style, undefined, getInterpretationById("adriano_continisio")), home);
    expect(adriano.timeline.find((s) => s.id === "bake")?.msg?.description?.map((m) => m.key)).toContain("timeline.bake.lowThenHigh");
  });
  it("il modello del lievito conta anche il riposo, alla sua temperatura", () => {
    expect(equivalentFermentationHours(3.5, 26, "fresh", false, "poolish", paoletta.process_profile)).toBeCloseTo(3.5, 6);
    expect(r.yeast_source!.model_pct).toBeLessThan(2.5);
  });
  it("cambiate le ore torna il modello: niente riposo, niente dose della fonte", () => {
    const e = entry();
    const r5 = generateRecipe(e.style, home, { ...e.options, customFermentationHours: 5 });
    expect(r5.declared_phases).toBeUndefined();
    expect(r5.yeast_source).toBeUndefined();
    expect(r5.timeline.some((s) => s.id === "rest")).toBe(false);
  });
});

describe("testi nella lingua attiva", () => {
  afterEach(() => setActiveUiLocale("it"));
  const r = recipe();
  const step = (id: string) => r.timeline.find((s) => s.id === id)!;
  it("in italiano: riposo a campana, nomi del mix e del facoltativo", () => {
    expect(localizeStep(step("rest"), r, IT_LOCALE).title).toBe("Riposo dei panetti");
    expect(localizeStep(step("rest"), r, IT_LOCALE).description).toMatch(/a campana.*26\s?°C/);
    expect(r.flour_blend!.map(flourBlendName)).toEqual(["Farina di frumento", "Semola rimacinata di grano duro", "Enkir (farro monococco)"]);
    const flakes = buildRecipePhases(r).totals.find((t) => t.id === "potato_flakes")!;
    expect(phaseRowLabel(flakes, r, IT_LOCALE)).toBe("Fiocchi di patate (facoltativo)");
  });
  it("in giapponese: niente italiano nei passi nuovi né nei nomi", () => {
    const ja = { ...IT_LOCALE, ...JA_LOCALE } as CmsContent;
    registerUiMessages("ja", UI_MESSAGES_JA);
    setActiveUiLocale("ja");
    expect(localizeStep(step("rest"), r, ja).title).toBe("生地玉を休ませる");
    expect(localizeStep(step("bake"), r, ja).description).toContain("コンベクション");
    expect(r.flour_blend!.map(flourBlendName)).toEqual(["小麦粉", "デュラム小麦のセモリナ（細挽き）", "一粒小麦（エンキール）"]);
    expect(pantryIngredientNames(ja).get("malto d'orzo")).toBe("大麦モルト");
    expect(ja.inspirationI18n?.interpretations?.paoletta?.story).toMatch(/Paoletta/);
  });
});

describe("MCP", () => {
  const call = (args: Record<string, unknown>) => {
    const response = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "generate_recipe", arguments: args } });
    if (!response || !("result" in response)) throw new Error("missing tool result");
    return (response.result as { structuredContent: Record<string, any> }).structuredContent;
  };
  it("generate_recipe con interpretation_id: malto e fiocchi fra gli ingredienti, fasi col riposo", () => {
    const data = call({ style_id: "teglia_in_giornata", interpretation_id: "paoletta", oven_type: "home", oven_max_temp_c: 250, dough_balls: 2 });
    const row = (name: string) => data.ingredients.find((i: { name: string }) => i.name === name);
    expect([row("yeast_fresh")?.grams, row("salt")?.grams, row("fat")?.grams]).toEqual([15, 12, 30]);
    expect(row("malt_syrup")).toMatchObject({ grams: 10 });
    expect(row("potato_flakes")).toMatchObject({ grams: 8, optional: true, included: false });
    expect(data.declared_phases).toEqual(paoletta.process_profile!.phases);
    expect(data.steps.filter((s: { temp_c?: number }) => s.temp_c !== undefined).map((s: { id: string; temp_c: number }) => `${s.id}@${s.temp_c}`))
      .toEqual(["bulk@26", "rest@26"]);
    const flakes = call({ style_id: "teglia_in_giornata", interpretation_id: "paoletta", oven_type: "home", oven_max_temp_c: 250, dough_balls: 2,
      included_optional_ingredients: ["fiocchi di patate"] });
    expect(flakes.ingredients.find((i: { name: string }) => i.name === "potato_flakes")).toMatchObject({ included: true });
  });
});

/* D-070, «mai fuori stile»: con Paoletta, «Ottimizza per me» resta negli
 * intervalli della teglia in giornata (75–82 %); per chi comincia al minimo. */
describe("D-070: Paoletta e «Ottimizza per me» restano nello stile", () => {
  it("a ogni livello l'idratazione ottimizzata sta fra 75 e 82 %; per chi comincia al minimo", () => {
    const pan = canonicalRecipeEntry(style, DEFAULT_UI_SCORE_WEIGHTS, paoletta, null).options.panConfig;
    for (const skill_level of [1, 2, 3, 4] as const) {
      const r = optimizeSelectedRecipe(style, { ...home, skill_level }, DEFAULT_UI_SCORE_WEIGHTS, pan, null, "paoletta").recipe;
      const [min, max] = style.dough.hydration_pct_range;
      expect(r.hydration_pct, `livello ${skill_level}`).toBeGreaterThanOrEqual(min);
      expect(r.hydration_pct, `livello ${skill_level}`).toBeLessThanOrEqual(max);
      if (skill_level === 1) expect(r.hydration_pct).toBe(min);
    }
  });
});
