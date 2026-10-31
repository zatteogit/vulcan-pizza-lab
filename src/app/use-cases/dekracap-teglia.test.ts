import { describe, expect, it } from "vitest";
import { STYLES_DB, generateRecipe, type UserConstraints } from "../domain/pizza-engine";
import { FRIDGE_MAX_TEMP_C, SOURCE_FRIDGE_MAX_C, isFridgeTempC } from "../domain/fermentation-constants";
import { YEAST_DRY_RATIO } from "../domain/fermentation-model";
import { sourceProcessUse } from "../domain/source-process";
import { getInterpretationById, getInterpretationsForStyle, isBlockedByStyle } from "../data/interpretation-library";
import { getImpasto } from "../data/impasto-library";
import { handleMcpMessage } from "../agent/mcp-server";
import { IT_LOCALE } from "../features/cms/locales/it";
import { localizeStep } from "../features/recipe/recipe-output-format";
import { sourceTiming } from "../features/recipe/recipe-configurator";
import { isColdPhase } from "./cook-timing";
import { stretchOptions } from "./cook-plan";
import { DEFAULT_UI_SCORE_WEIGHTS } from "../domain/recipe-score";
import { authorVersionRecipe, canonicalRecipeEntry, optimizeSelectedRecipe, recipeFromEntry } from "./recipe-entry";

/* ═══ Tranche B5 · Dekracap, teglia a 48 ore ═══
 * Versione d'autore della teglia romana dalla «Ricetta di Dekracap»
 * (Confraternita della Pizza, 6/10/2014; copia d'archivio del 12/11/2017,
 * docs/ricerca/confraternita-2026-10-30.md §1). Fonte per una teglia 30×40:
 * farina 350, acqua 296, lievito di birra fresco 1, sale 7,5, olio EVO 6;
 * 660 g. Il motore lavora sulle percentuali della dose per 1 L d'acqua
 * (1180/1000/3/25/20): idratazione 84,7 %, lievito 0,254 %, sale 2,12 %,
 * olio 1,69 %. Tolleranza dichiarata: farina, acqua, olio e totale al
 * grammo; sale ±0,5 g (il motore arrotonda al grammo: 7 g, la fonte 7,5);
 * lievito ±0,15 g (0,9 g col decimale del motore, la fonte arrotonda a 1). */

const style = STYLES_DB.teglia_romana;
const dekracap = getInterpretationById("dekracap")!;
const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 72, dough_balls: 1, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const SOURCE = { flour: 350, water: 296, yeastFresh: 1, salt: 7.5, oil: 6, total: 660 };

describe("la versione sta negli intervalli della teglia romana", () => {
  it("84,7 %, 48 h e W 375 (forbice della fonte 350–400, dello stile 300–380): offerta, non bloccata", () => {
    const o = dekracap.parameter_overrides!;
    const d = style.dough;
    expect(o.hydration_pct!).toBeGreaterThanOrEqual(d.hydration_pct_range[0]);
    expect(o.hydration_pct!).toBeLessThanOrEqual(d.hydration_pct_range[1]);
    expect(o.fermentation_hours!).toBeGreaterThanOrEqual(d.fermentation_hours_range[0]);
    expect(o.fermentation_hours!).toBeLessThanOrEqual(d.fermentation_hours_range[1]);
    expect(o.flour_w!).toBeGreaterThanOrEqual(Math.max(350, d.flour_w_range[0]));
    expect(o.flour_w!).toBeLessThanOrEqual(Math.min(400, d.flour_w_range[1]));
    expect(isBlockedByStyle(dekracap, style)).toBe(false);
    expect(getInterpretationsForStyle(style.id).map((i) => i.id)).toContain("dekracap");
    // L'impasto della versione cambia solo sale e olio: gli intervalli restano quelli dello stile.
    expect(Object.keys(getImpasto("dekracap_48h")!.dough_overrides!).sort()).toEqual(["fat_type", "oil_pct", "salt_pct"]);
  });
  it("fonte verificata sulla copia d'archivio, tipo `autore`", () => {
    expect(dekracap.type).toBe("autore");
    expect(dekracap.source_status).toBe("verified");
    expect(dekracap.url).toBe("https://web.archive.org/web/20171112155246/http://laconfraternitadellapizza.forumfree.it:80/?t=69617704");
    expect(dekracap.process_profile?.source_url).toBe(dekracap.url);
  });
});

describe("teglia 30×40, forno di casa: le dosi della fonte", () => {
  const r = authorVersionRecipe(style, dekracap, home);
  it("farina, acqua, sale, olio, lievito e totale", () => {
    expect([r.dough_balls, r.total_dough_g]).toEqual([1, SOURCE.total]);
    expect([r.flour_g, r.water_g, r.oil_g]).toEqual([SOURCE.flour, SOURCE.water, SOURCE.oil]);
    expect(Math.abs(r.salt_g - SOURCE.salt)).toBeLessThanOrEqual(0.5);
    expect(r.yeast_type).toBe("fresh");
    expect(Math.abs(r.yeast_g - SOURCE.yeastFresh)).toBeLessThanOrEqual(0.15);
    expect(r.yeast_source).toMatchObject({ source_type: "fresh", source_pct: 0.254, type: "fresh", converted: false });
    expect(r.baker_pcts).toMatchObject({ salt: 2.12, fat: 1.69 });
    expect([r.hydration_pct, r.flour_w, r.fermentation_hours, r.fermentation_temp_c]).toEqual([84.7, 375, 48, 8]);
  });
  it("forno al massimo di casa, minuti del motore (la fonte non li dice)", () => {
    expect(r.oven_temp_c).toBe(250);
    expect(r.cook_time_sec).toBe(1063);
    expect(r.verdict.outcome).not.toBe("not_feasible");
  });
  it("le note: frigo della fonte e ciò che la tabella di marcia fa diversamente", () => {
    expect(r.source_notes?.map((n) => n.key)).toEqual(["fermentation.sourceFridge", "source.dekracapProcess"]);
    expect(r.source_notes?.[0].params).toEqual({ temp: 8 });
  });
  it("con solo lievito secco: rapporto del motore 1:3 (non l'1:1 dell'autore), dichiarato", () => {
    const dry = authorVersionRecipe(style, dekracap, { ...home, pantry_yeasts: ["dry"], pantry_inventory_complete: true });
    expect(dry.yeast_type).toBe("dry");
    expect(dry.yeast_source?.pct).toBeCloseTo(0.254 * YEAST_DRY_RATIO, 4);
    expect(dry.source_notes?.map((n) => n.key)).toEqual(["yeast.sourceFreshAsDry", "fermentation.sourceFridge", "source.dekracapProcess"]);
  });
});

describe("8 °C: in frigo solo perché la fonte ce lo mette", () => {
  const r = authorVersionRecipe(style, dekracap, home);
  it("la soglia del motore resta 6 °C; fino a 8 °C solo con la fonte", () => {
    expect([FRIDGE_MAX_TEMP_C, SOURCE_FRIDGE_MAX_C]).toEqual([6, 8]);
    expect([isFridgeTempC(6), isFridgeTempC(8), isFridgeTempC(8, true), isFridgeTempC(9, true)]).toEqual([true, false, true, false]);
    expect(sourceProcessUse({ hours: 48, temp_c: 4, fridge: true }, 48, 4)).toEqual({ fridge: false, notes: [] });
  });
  it("la ricetta lo dice: pieghe e poi in frigo, puntata in frigo, appretto fuori", () => {
    expect(r.fermentation_in_fridge).toBe(true);
    const folds = r.timeline.find((s) => s.id === "folds")!;
    expect(folds.msg?.description?.[0]?.key).toBe("timeline.folds.descCold");
    expect(r.timeline.find((s) => s.id === "bulk")?.tip?.beginner).toMatch(/In frigo/);
    expect(isColdPhase("bulk", 8, r.fermentation_in_fridge)).toBe(true);
    expect(isColdPhase("proof", 8, r.fermentation_in_fridge)).toBe(false);
    expect(localizeStep(r.timeline.find((s) => s.id === "bulk")!, r, IT_LOCALE).longDesc).toMatch(/frigorifero \(8\s?°C\)/);
    // 2 ore fuori dal frigo prima di cuocere: appretto + preriscaldo.
    const proof = r.timeline.find((s) => s.id === "proof")!.duration_minutes;
    expect(proof + r.timeline.find((s) => s.id === "preheat")!.duration_minutes).toBe(120);
    expect(sourceTiming(r)).toEqual({ yeastFromSource: true, warmPlace: false, sourceFridge: true });
  });
  it("l'acqua punta a un impasto a 22 °C, come per la puntata a freddo (cucina a 21 °C: 24 °C)", () => {
    expect(r.water_temp_c).toBe(24);
  });
  it("le tolleranze della Timeline comoda trattano la puntata come frigo (fino a +6 h, non +2 h)", () => {
    const bulk = r.timeline.find((s) => s.id === "bulk")!.duration_minutes;
    expect(Math.max(...stretchOptions(bulk, isColdPhase("bulk", 8, true)))).toBe(360);
    expect(Math.max(...stretchOptions(bulk, isColdPhase("bulk", 8)))).toBe(120);
  });
  it("gli stessi 8 °C senza la fonte restano «fresco, non in frigo»", () => {
    const plain = generateRecipe(style, home, { customFermentationHours: 48, customFermentationTempC: 8, usePreFerment: false });
    expect(plain.fermentation_in_fridge).toBeUndefined();
    expect(plain.timeline.find((s) => s.id === "folds")?.msg?.description?.[0]?.key).toBe("timeline.folds.descCool");
    expect(isColdPhase("bulk", 8, plain.fermentation_in_fridge)).toBe(false);
    expect(plain.source_notes).toBeUndefined();
  });
  it("nessuno stile, versione o versione d'autore esistente è in frigo sopra i 6 °C", () => {
    for (const s of Object.values(STYLES_DB)) {
      for (const it of getInterpretationsForStyle(s.id).filter((i) => i.id !== "dekracap")) {
        expect(recipeFromEntry(canonicalRecipeEntry(s, undefined, it), home).fermentation_in_fridge, `${s.id} · ${it.id}`).toBeUndefined();
      }
      expect(recipeFromEntry(canonicalRecipeEntry(s), home).fermentation_in_fridge, s.id).toBeUndefined();
    }
  });
});

describe("con tempi diversi torna il modello", () => {
  const entry = canonicalRecipeEntry(style, undefined, dekracap);
  it.each([
    ["36 h a 8 °C", { customFermentationHours: 36 }],
    ["48 h a 4 °C", { customFermentationTempC: 4 }],
  ])("%s: dose del modello, niente frigo della fonte né note", (_label, change) => {
    const r = generateRecipe(entry.style, home, { ...entry.options, ...change });
    expect(r.yeast_source).toBeUndefined();
    expect(r.fermentation_in_fridge).toBeUndefined();
    expect(r.source_notes).toBeUndefined();
  });
});

describe("MCP", () => {
  const call = (name: string, args: Record<string, unknown> = {}) => {
    const response = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
    if (!response || !("result" in response)) throw new Error("missing tool result");
    return response.result as { isError: boolean; structuredContent: Record<string, any> };
  };
  it("get_style offre Dekracap; generate_recipe con interpretation_id dà le dosi della fonte e il frigo", () => {
    const got = call("get_style", { style_id: "teglia_romana" }).structuredContent;
    expect(got.interpretations.map((i: { id: string }) => i.id)).toContain("dekracap");
    const data = call("generate_recipe", { style_id: "teglia_romana", oven_type: "home", oven_max_temp_c: 250, dough_balls: 1,
      available_hours: 72, interpretation_id: "dekracap" }).structuredContent;
    expect(data.yeast_source).toMatchObject({ source_type: "fresh", source_pct: 0.254, converted: false });
    expect(data.fermentation_in_fridge).toBe(true);
    expect([data.fermentation_hours, data.fermentation_temp_c]).toEqual([48, 8]);
    expect(data.source_notes.map((n: { key: string }) => n.key)).toEqual(["fermentation.sourceFridge", "source.dekracapProcess"]);
    expect(data.ingredients.find((i: { name: string }) => i.name === "flour")?.grams).toBe(SOURCE.flour);
    expect(data.ingredients.find((i: { name: string }) => i.name === "water")?.grams).toBe(SOURCE.water);
    expect(data.steps.find((s: { id: string }) => s.id === "folds")?.description).toMatch(/in frigo/);
  });
  it("il riferimento della teglia romana non cambia: niente frigo della fonte", () => {
    const data = call("generate_recipe", { style_id: "teglia_romana", oven_type: "home", oven_max_temp_c: 250, recipe_mode: "canonical" }).structuredContent;
    expect(data.fermentation_in_fridge).toBeUndefined();
    expect(data.yeast_source).toBeNull();
  });
});

/* D-070, «mai fuori stile»: con la versione di Dekracap scelta, «Ottimizza per
 * me» per chi comincia non scende sotto il minimo dello stile (la versione non
 * cambia gli intervalli: 75–85 %). Livello 1 al minimo, gli altri sopra. */
describe("D-070: Dekracap e «Ottimizza per me» restano nello stile", () => {
  it("a ogni livello l'idratazione ottimizzata sta fra 75 e 85 %; per chi comincia al minimo", () => {
    const pan = canonicalRecipeEntry(style, DEFAULT_UI_SCORE_WEIGHTS, dekracap, null).options.panConfig;
    for (const skill_level of [1, 2, 3, 4] as const) {
      const r = optimizeSelectedRecipe(style, { ...home, skill_level }, DEFAULT_UI_SCORE_WEIGHTS, pan, null, "dekracap").recipe;
      const [min, max] = r.style.dough.hydration_pct_range;
      expect([min, max]).toEqual(style.dough.hydration_pct_range);
      expect(r.hydration_pct, `livello ${skill_level}`).toBeGreaterThanOrEqual(min);
      expect(r.hydration_pct, `livello ${skill_level}`).toBeLessThanOrEqual(max);
      if (skill_level === 1) expect(r.hydration_pct).toBe(min);
    }
  });
});
