import { describe, expect, it } from "vitest";
import { OVEN_PRESETS } from "../domain/pizza-engine";
import { OVEN_MODELS, searchOvenModels } from "./oven-models";

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
