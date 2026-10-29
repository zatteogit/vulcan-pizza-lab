import { describe, expect, it } from "vitest";
import { seedEditionOven } from "./edition-defaults";
import type { OvenModel } from "../../data/oven-models";

const oven: OvenModel = { id: "aurora-e1", brand: "Fornace Aurora", model: "E1", fuel: "electric", ovenType: "electric_high", maxTempC: 450, source: "P" };
function memory(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

describe("seedEditionOven", () => {
  it("preimposta il forno dell'edizione al primo avvio", () => {
    const storage = memory();
    expect(seedEditionOven(storage, oven)).toBe(true);
    expect(JSON.parse(storage.data.get("vulcan_oven_pref")!)).toEqual({ ovenType: "electric_high", maxTemp: 450, modelId: "aurora-e1", origin: "edition" });
  });
  it("non tocca una scelta già salvata", () => {
    const storage = memory({ vulcan_oven_pref: JSON.stringify({ ovenType: "home", maxTemp: 250 }) });
    expect(seedEditionOven(storage, oven)).toBe(false);
    expect(JSON.parse(storage.data.get("vulcan_oven_pref")!).ovenType).toBe("home");
  });
  it("senza forno preimpostato (generalista) non fa nulla", () => {
    const storage = memory();
    expect(seedEditionOven(storage, undefined)).toBe(false);
    expect(storage.data.size).toBe(0);
  });
  it("storage non disponibile o che lancia: nessun errore", () => {
    expect(seedEditionOven(null, oven)).toBe(false);
    expect(seedEditionOven({ getItem: () => { throw new Error("blocked"); }, setItem: () => {} }, oven)).toBe(false);
  });
});
