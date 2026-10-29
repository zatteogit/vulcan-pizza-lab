import { describe, expect, it } from "vitest";
import { OVEN_PRESETS } from "../domain/pizza-engine";
import { OVEN_CATALOG_FILTERED, OVEN_MODELS, editionOvenModels, ovenCatalogBrands, ovenSearchExamples, searchOvenModels } from "./oven-models";
import { parseEdition } from "../config/edition";

/* D-048: catalogo dei forni da pizza per marca e modello. */

describe("forni per marca e modello", () => {
  it("id unici e tipi di forno che il motore conosce", () => {
    expect(new Set(OVEN_MODELS.map((m) => m.id)).size).toBe(OVEN_MODELS.length);
    const types = new Set(OVEN_PRESETS.map((p) => p.id));
    for (const m of OVEN_MODELS) expect(types.has(m.ovenType)).toBe(true);
  });

  it("temperature plausibili e coerenti col tipo", () => {
    for (const m of OVEN_MODELS) {
      expect(m.maxTempC).toBeGreaterThanOrEqual(350);
      expect(m.maxTempC).toBeLessThanOrEqual(550);
      if (m.ovenType === "electric_high") expect(m.maxTempC).toBeGreaterThanOrEqual(400);
    }
  });

  it("si cerca per marca, modello o entrambi, senza badare a maiuscole e spazi", () => {
    expect(searchOvenModels("koda 16").map((m) => m.id)).toEqual(["ooni-koda-16"]);
    expect(searchOvenModels("EFFEUNO").length).toBe(5);
    expect(searchOvenModels("pizzaiolo")[0]?.brand).toBe("Sage / Breville");
    expect(searchOvenModels("")).toEqual([]);
  });
});

/* FW-15 (S18-A-03/B-04, S16-A-11): esempi e filtro dal catalogo attivo. */
describe("esempi della ricerca forni", () => {
  it("la generalista propone marche diverse, che la ricerca trova", () => {
    const examples = ovenSearchExamples();
    expect(examples).toEqual(["Ooni", "Gozney", "Effeuno"]);
    for (const example of examples) expect(searchOvenModels(example).length).toBeGreaterThan(0);
    expect(OVEN_CATALOG_FILTERED).toBe(false);
  });

  it("un catalogo di una sola marca propone i suoi modelli", () => {
    const demo = parseEdition({
      schema: 1, id: "prova", kind: "demo", indexing: "noindex", partner: { name: "Forni Prova", invented: true },
      ovens: { only: ["x-"], extra: [
        { id: "x-1", brand: "Forni Prova", model: "Uno", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, source: "demo" },
        { id: "x-2", brand: "Forni Prova", model: "Due", fuel: "electric", ovenType: "electric_high", maxTempC: 450, source: "demo" },
      ] },
    });
    const catalog = editionOvenModels(demo);
    expect(ovenCatalogBrands(catalog)).toEqual(["Forni Prova"]);
    expect(ovenSearchExamples(catalog)).toEqual(["Uno", "Due"]);
  });
});
