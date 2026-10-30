import { describe, expect, it } from "vitest";
import { computePreFermentSplit, PRE_FERMENT_FLOUR_PCT } from "./pre-ferment-split";
import { preFermentExample } from "./science/engine-facts";

/* Convenzioni canoniche (audit roleplay giu 2026 + audit lug 2026):
   biga = 40% farina @ 44% idro (fonti, audit n. 10) · poolish = 30% farina @ 100% idro.
   Il sale non entra mai nel pre-fermento (vive solo nell'impasto finale,
   quindi NON compare in questo split). */

describe("computePreFermentSplit", () => {
  it("biga: 40% della farina, idratata al 44%", () => {
    const split = computePreFermentSplit({
      flourG: 1000,
      waterG: 700,
      preFermentType: "biga",
    });
    expect(split.name).toBe("Biga");
    expect(split.hydrationPct).toBe(44);
    expect(split.prefermentFlourG).toBe(400);
    expect(split.prefermentWaterG).toBe(176);
    expect(split.mainFlourG).toBe(600);
    expect(split.mainWaterG).toBe(524);
  });

  it("poolish: 30% della farina, 1:1 con l'acqua", () => {
    const split = computePreFermentSplit({
      flourG: 1000,
      waterG: 700,
      preFermentType: "poolish",
    });
    expect(split.name).toBe("Poolish");
    expect(split.hydrationPct).toBe(100);
    expect(split.prefermentFlourG).toBe(300);
    expect(split.prefermentWaterG).toBe(300);
    expect(split.mainFlourG).toBe(700);
    expect(split.mainWaterG).toBe(400);
  });

  it("tipo sconosciuto o assente → biga (default conservativo)", () => {
    expect(
      computePreFermentSplit({ flourG: 500, waterG: 325, preFermentType: null })
        .name,
    ).toBe("Biga");
    expect(
      computePreFermentSplit({ flourG: 500, waterG: 325 }).name,
    ).toBe("Biga");
  });

  it("conserva i totali: pre-fermento + impasto finale = ricetta", () => {
    for (const type of ["biga", "poolish"]) {
      const split = computePreFermentSplit({
        flourG: 1780,
        waterG: 1330,
        preFermentType: type,
      });
      expect(split.prefermentFlourG + split.mainFlourG).toBe(1780);
      expect(split.prefermentWaterG + split.mainWaterG).toBe(1330);
    }
  });

  it("l'acqua residua dell'impasto finale non va mai in negativo con idratazioni reali (≥55%)", () => {
    // caso limite: poolish con idratazione bassa dello stile
    const split = computePreFermentSplit({
      flourG: 1000,
      waterG: 550, // 55%
      preFermentType: "poolish",
    });
    expect(split.mainWaterG).toBeGreaterThan(0);
  });
});

describe("quota di farina scelta (D-043)", () => {
  it("biga al 30%: 300 g di farina e 132 g d'acqua su 1 kg", () => {
    const split = computePreFermentSplit({ flourG: 1000, waterG: 700, preFermentType: "biga", flourPct: 30 });
    expect(split.flourPct).toBe(30);
    expect(split.prefermentFlourG).toBe(300);
    expect(split.prefermentWaterG).toBe(132);
  });
});

/* G4b-WP-02 (S14-B-07): l'esempio della guida su 1 kg di farina usa lo stesso
 * scorporo delle ricette; prefermento + impasto finale = totali. */
describe("preFermentExample", () => {
  it.each(["biga", "poolish"] as const)("%s: farina e acqua si sommano ai totali", (kind) => {
    const ex = preFermentExample(kind);
    expect(ex.flourG).toBe(1000);
    expect(ex.prefermentFlourG + ex.mainFlourG).toBe(ex.flourG);
    expect(ex.prefermentWaterG + ex.mainWaterG).toBe(ex.waterG);
    expect(ex.waterG).toBe((ex.flourG * ex.doughHydrationPct) / 100);
    expect(ex.prefermentFlourG).toBe((ex.flourG * PRE_FERMENT_FLOUR_PCT[kind]) / 100);
    expect(ex.mainWaterG).toBeGreaterThan(0);
  });
});
