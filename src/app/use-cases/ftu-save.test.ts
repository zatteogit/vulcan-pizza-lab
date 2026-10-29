import { describe, expect, it } from "vitest";
import { planFtuWrites, type FtuState } from "./ftu-save";

const base: FtuState = { confirmedUpTo: -1, mode: "skip", savedOven: null, ovenType: "wood", ovenTemp: 480, skillLevel: 4, flours: [], yeasts: [] };

describe("onboarding: che cosa salva «Salta» (G5-WP-01)", () => {
  it("«Salta» al primo passo non salva forno né livello (D-038)", () => {
    expect(planFtuWrites(base)).toEqual({});
  });
  it("«Salta» dopo aver confermato il forno salva il forno, non il livello", () => {
    expect(planFtuWrites({ ...base, confirmedUpTo: 0 })).toEqual({ oven: { ovenType: "wood", maxTemp: 480 } });
  });
  it("«Salta» dopo forno e livello salva entrambi", () => {
    expect(planFtuWrites({ ...base, confirmedUpTo: 1 })).toEqual({ oven: { ovenType: "wood", maxTemp: 480 }, skill: 4 });
  });
  it("un livello non scelto non diventa «Principiante»", () => {
    expect(planFtuWrites({ ...base, confirmedUpTo: 1, skillLevel: null }).skill).toBeUndefined();
  });
  it("la dispensa si salva solo se confermata e non vuota", () => {
    expect(planFtuWrites({ ...base, confirmedUpTo: 1, flours: ["00"] }).pantry).toBeUndefined();
    expect(planFtuWrites({ ...base, confirmedUpTo: 2, flours: ["00"] }).pantry).toEqual({ flours: ["00"], yeasts: [] });
    expect(planFtuWrites({ ...base, confirmedUpTo: 2 }).pantry).toBeUndefined();
  });
  it("«Vai a Crea» con lo stesso forno conserva il modello salvato", () => {
    const savedOven = { ovenType: "electric_high" as const, maxTemp: 450, modelId: "effeuno-p134h" };
    expect(planFtuWrites({ ...base, mode: "finish", savedOven, ovenType: "electric_high", ovenTemp: 450 }).oven).toMatchObject({ modelId: "effeuno-p134h", ovenType: "electric_high" });
  });
  it("«Vai a Crea» con un forno diverso toglie il modello", () => {
    const savedOven = { ovenType: "electric_high" as const, maxTemp: 450, modelId: "effeuno-p134h" };
    expect(planFtuWrites({ ...base, mode: "finish", savedOven }).oven).toEqual({ ovenType: "wood", maxTemp: 480 });
  });
});
