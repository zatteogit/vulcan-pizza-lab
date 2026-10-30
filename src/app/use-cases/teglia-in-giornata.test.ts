import { describe, expect, it } from "vitest";
import { STYLES_DB, saltRangePct, generateRecipe, type UserConstraints } from "../domain/pizza-engine";
import { getInterpretationById, getInterpretationsForStyle, relatedAuthorVersions } from "../data/interpretation-library";
import { getStyleReference, getVersions } from "../data/style-versions";
import { getToppingForStyle, scaleToppingAmounts } from "../data/topping-library";
import { handleMcpMessage } from "../agent/mcp-server";
import { buildSearchIndex, searchIndex } from "../features/search/search-index";
import { IT_LOCALE } from "../features/cms/locales/it";
import { EN_LOCALE } from "../features/cms/locales/en";
import type { CmsContent } from "../features/cms/cms-context";
import { authorVersionRecipe, canonicalRecipe } from "./recipe-entry";

/* ═══ Tranche B2 · Teglia casalinga in giornata ═══
 * Stile nuovo con il riferimento dalla versione d'autore di Benedetta Rossi
 * (base «fonte», D-055/D-068), dosi convertite da Vulcan (D-066). La fonte,
 * per una teglia 35×35: 250 g di manitoba + 250 g di 00, 400 ml d'acqua
 * (399 g a 20 °C), 50 ml d'olio (46 g), 1 cucchiaino di sale (6 g), 2 di
 * zucchero (8 g), 7 g di lievito di birra secco; 2 h al caldo + 10 minuti in
 * teglia; 25 minuti a 210 °C + 5 con la mozzarella
 * (docs/progetto-catalogo-italiano.md §9.3).
 * Tolleranza dichiarata: l'acqua ±1 g (Vulcan scrive 1 g/ml: 400 g; a 20 °C
 * sarebbero 399), tutto il resto al grammo. */

const style = STYLES_DB.teglia_in_giornata;
const weights = { authenticity: .3, feasibility: .25, digestibility: .2, sustainability: .15, experimentation: .1 };
const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 24, dough_balls: 1, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };

const SOURCE = { flour: 500, water: 399, oil: 46, salt: 6, sugar: 8, yeastDry: 7 };

describe("riferimento della teglia casalinga in giornata (Benedetta Rossi)", () => {
  it("il riferimento è la versione d'autore di Benedetta, offerta dallo stile", () => {
    expect(getStyleReference(style.id)).toEqual({ referenceVersionId: null, referenceInterpretationId: "benedetta_rossi", basis: "fonte" });
    const benedetta = getInterpretationById("benedetta_rossi")!;
    expect(benedetta.type).toBe("autore");
    expect(benedetta.source_status).toBe("verified");
    expect(benedetta.url).toBe("https://www.fattoincasadabenedetta.it/ricetta/pizza-in-teglia/");
    expect(getInterpretationsForStyle(style.id).map((it) => it.id)).toEqual(["benedetta_rossi"]);
    expect(relatedAuthorVersions(style.id).map((v) => `${v.interpretation.id}:${v.relation}`)).toEqual(["benedetta_rossi:base"]);
    // Nessun preset nuovo; il preset «Casalinga» della teglia romana resta lì, col suo ID.
    expect(getVersions(style.id)).toEqual([]);
    expect(getVersions("teglia_romana").map((v) => v.id)).toContain("teglia_casalinga");
  });

  it("teglia 35×35, forno di casa: le dosi convertite della fonte", () => {
    const r = canonicalRecipe(style, home, weights);
    expect([r.dough_balls, r.ball_weight_g]).toEqual([1, 967]);
    expect(r.flour_g).toBe(SOURCE.flour);
    expect(Math.abs(r.water_g - SOURCE.water)).toBeLessThanOrEqual(1);
    expect([r.fat_g, r.salt_g, r.sugar_g]).toEqual([SOURCE.oil, SOURCE.salt, SOURCE.sugar]);
    expect([r.yeast_type, r.yeast_g]).toEqual(["dry", SOURCE.yeastDry]);
    expect(r.yeast_source).toMatchObject({ source_type: "dry", source_pct: 1.4, converted: false });
    expect([r.hydration_pct, r.flour_w, r.fermentation_hours, r.fermentation_temp_c]).toEqual([80, 280, 2, 26]);
    expect([r.oven_temp_c, r.cook_time_sec]).toEqual([210, 1800]);
    expect(r.source_notes?.map((n) => n.key)).toEqual(["source.convertedDoses", "fermentation.warmPlace", "topping.sauceSeasoning"]);
    expect(r.verdict.outcome).not.toBe("not_feasible");
    // L'impasto si mescola, non s'impasta; la salsa va prima dell'appretto in teglia.
    expect(r.timeline.find((s) => s.id === "mix")?.msg?.description?.[0]?.key).toBe("timeline.mix.stir");
    const ids = r.timeline.map((s) => s.id);
    expect(ids.indexOf("spread_margherita_teglia_in_giornata")).toBeLessThan(ids.indexOf("bake"));
  });

  it("la scheda dello stile («Genera con questa versione») dà le stesse dosi", () => {
    const r = authorVersionRecipe(style, getInterpretationById("benedetta_rossi")!, home, weights);
    expect([r.flour_g, r.water_g, r.fat_g, r.salt_g, r.sugar_g, r.yeast_g]).toEqual([500, 400, 46, 6, 8, 7]);
  });

  it("con solo lievito fresco la dose si converte 1:3 e si dichiara", () => {
    const r = canonicalRecipe(style, { ...home, pantry_yeasts: ["fresh"], pantry_inventory_complete: true }, weights);
    expect(r.yeast_type).toBe("fresh");
    expect(r.yeast_source?.converted).toBe(true);
    expect(r.source_notes?.map((n) => n.key)).toEqual(["source.convertedDoses", "yeast.sourceDryAsFresh", "fermentation.warmPlace", "topping.sauceSeasoning"]);
  });
});

describe("sale della fonte (1,2 %)", () => {
  it("il sale dello stile non si alza all'1,5 %; gli altri stili restano 1,5–3,5 %", () => {
    expect(saltRangePct(style)).toEqual([1.2, 3.5]);
    for (const other of Object.values(STYLES_DB).filter((s) => s.id !== style.id)) expect(saltRangePct(other), other.id).toEqual([1.5, 3.5]);
    expect(generateRecipe(style, home, { customSalt: 1.2 }).baker_pcts?.salt).toBe(1.2);
    expect(generateRecipe(style, home, { customSalt: 1 }).baker_pcts?.salt).toBe(1.2);
    expect(generateRecipe(STYLES_DB.teglia_romana, home, { customSalt: 1.2 }).baker_pcts?.salt).toBe(1.5);
  });
});

describe("margherita della teglia in giornata", () => {
  it("dosi della fonte sulla teglia 35×35, mozzarella negli ultimi 5 minuti", () => {
    const recipe = getToppingForStyle(style.default_topping_ref!, style)!;
    expect(recipe.id).toBe("margherita_teglia_in_giornata");
    expect(recipe.ingredients.map((i) => i.amount)).toEqual([{ value: 300, unit: "g" }, { value: 250, unit: "g" }]);
    expect(recipe.assembly_steps?.[0].insert_at).toBe("before_proof");
    expect(recipe.assembly_steps?.[0].description).toContain("ultimi 5 minuti");
    expect(scaleToppingAmounts(recipe, style.topping_scale)).toBe(recipe);
    // Solo su questo stile: la teglia romana tiene la sua margherita.
    expect(getToppingForStyle("margherita", STYLES_DB.teglia_romana)?.id).not.toBe(recipe.id);
  });
});

describe("ricerca", () => {
  const IT = buildSearchIndex(IT_LOCALE);
  const EN = buildSearchIndex({ ...IT_LOCALE, ...EN_LOCALE } as CmsContent);
  it.each(["teglia casalinga", "pizza in teglia", "in giornata"])("«%s» trova lo stile", (q) => {
    expect(searchIndex(IT, q).map((r) => r.id)).toContain("style-teglia_in_giornata");
  });
  it("in inglese col nome italiano e con «same day»", () => {
    expect(searchIndex(EN, "teglia casalinga").map((r) => r.id)).toContain("style-teglia_in_giornata");
    expect(searchIndex(EN, "same day").map((r) => r.id)).toContain("style-teglia_in_giornata");
  });
});

describe("MCP", () => {
  const call = (name: string, args: Record<string, unknown> = {}) => {
    const response = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
    if (!response || !("result" in response)) throw new Error("missing tool result");
    return response.result as { isError: boolean; structuredContent: Record<string, any> };
  };
  it("list_styles lo elenca, get_style offre Benedetta", () => {
    const styles = call("list_styles").structuredContent.styles as { id: string }[];
    expect(styles.map((s) => s.id)).toContain("teglia_in_giornata");
    const got = call("get_style", { style_id: "teglia_in_giornata" }).structuredContent;
    expect(got.interpretations.map((i: { id: string }) => i.id)).toEqual(["benedetta_rossi"]);
  });
  it("generate_recipe: riferimento e versione di Benedetta con il lievito della fonte", () => {
    for (const extra of [{ recipe_mode: "canonical" }, { interpretation_id: "benedetta_rossi" }]) {
      const data = call("generate_recipe", { style_id: "teglia_in_giornata", oven_type: "home", oven_max_temp_c: 250, dough_balls: 1, ...extra }).structuredContent;
      expect(data.yeast_source, JSON.stringify(extra)).toMatchObject({ source_type: "dry", source_pct: 1.4, type: "dry", pct: 1.4, converted: false });
      expect(data.source_notes.map((n: { key: string }) => n.key)).toEqual(["source.convertedDoses", "fermentation.warmPlace", "topping.sauceSeasoning"]);
      expect(data.ingredients.find((i: { name: string }) => i.name === "flour")?.grams).toBe(500);
    }
  });
});
