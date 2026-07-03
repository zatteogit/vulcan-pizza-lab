import { describe, expect, it } from "vitest";
import { computePreFermentSplit } from "./pre-ferment-split";

/* Convenzioni canoniche (audit roleplay giu 2026 + audit lug 2026):
   biga = 40% farina @ 45% idro · poolish = 30% farina @ 100% idro.
   Il sale non entra mai nel pre-fermento (vive solo nell'impasto finale,
   quindi NON compare in questo split). */

describe("computePreFermentSplit", () => {
  it("biga: 40% della farina, idratata al 45%", () => {
    const split = computePreFermentSplit({
      flourG: 1000,
      waterG: 700,
      preFermentType: "biga",
    });
    expect(split.name).toBe("Biga");
    expect(split.hydrationPct).toBe(45);
    expect(split.prefermentFlourG).toBe(400);
    expect(split.prefermentWaterG).toBe(180);
    expect(split.mainFlourG).toBe(600);
    expect(split.mainWaterG).toBe(520);
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
