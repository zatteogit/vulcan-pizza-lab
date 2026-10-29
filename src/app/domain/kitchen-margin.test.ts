import { describe, expect, it } from "vitest";
import { compareByCompatibility, kitchenMargin, kitchenMarginParts } from "./kitchen-margin";
import { STYLES_DB } from "./pizza-engine";

const kitchen = { oven_max_temp_c: 450, available_hours: 48 };

describe("D-062: margine della cucina (spareggio)", () => {
  it("forno e tempo in proporzione al minimo dello stile, fra 0 e 1, poi la media", () => {
    // Teglia Romana: minimo 250 °C, maturazione minima 24 h.
    const teglia = kitchenMarginParts(STYLES_DB.teglia_romana, kitchen);
    expect(teglia.oven).toBeCloseTo((450 - 250) / 250, 6);
    expect(teglia.time).toBe(1);
    expect(teglia.margin).toBeCloseTo((0.8 + 1) / 2, 6);
    // Napoletana STG: 430 °C minimi; con 36 h il tempo vale (36 − 6) / 6 → 1.
    const napoletana = kitchenMarginParts(STYLES_DB.napoletana_stg, { ...kitchen, available_hours: 36 });
    expect(napoletana.oven).toBeCloseTo(20 / 430, 6);
    expect(napoletana.time).toBe(1);
  });

  it("sotto il minimo il margine è 0, non negativo; la capienza limita il forno", () => {
    expect(kitchenMarginParts(STYLES_DB.napoletana_stg, { oven_max_temp_c: 250, available_hours: 3 })).toEqual({ oven: 0, time: 0, margin: 0 });
    const capped = kitchenMarginParts(STYLES_DB.teglia_romana, { ...kitchen, oven_capacity_temp_c: 300 });
    expect(capped.oven).toBeCloseTo(50 / 250, 6);
  });

  it("per le fritte conta solo il tempo", () => {
    const fried = kitchenMarginParts(STYLES_DB.pizza_fritta, { oven_max_temp_c: 250, available_hours: 12 });
    expect(fried.oven).toBeNull();
    expect(fried.margin).toBe(fried.time);
    expect(fried.time).toBeCloseTo((12 - 8) / 8, 6);
  });

  it("decide solo a pari numero mostrato: il numero arrotondato viene prima", () => {
    const more = { score: 97.4, margin: 0.9 };
    const less = { score: 97.2, margin: 0.1 };
    expect(compareByCompatibility(more, less)).toBeLessThan(0);
    expect(compareByCompatibility(less, more)).toBeGreaterThan(0);
    // Un punto in più batte qualunque margine.
    expect(compareByCompatibility({ score: 98, margin: 0 }, { score: 97, margin: 1 })).toBeLessThan(0);
    // Pari in tutto: 0, il sort stabile tiene l'ordine di prima.
    expect(compareByCompatibility({ score: 97, margin: 0.5 }, { score: 97, margin: 0.5 })).toBe(0);
  });

  it("kitchenMargin è il valore combinato", () => {
    expect(kitchenMargin(STYLES_DB.teglia_romana, kitchen)).toBe(kitchenMarginParts(STYLES_DB.teglia_romana, kitchen).margin);
  });
});
