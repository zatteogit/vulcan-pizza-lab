import { describe, expect, it } from "vitest";
import { STYLES_DB } from "../../domain/pizza-engine";
import { getImpasto, mergeImpastoIntoDough } from "../../data/impasto-library";
import {
  AMBIENT_C,
  FRIDGE_C,
  SLIDER_BOUNDS,
  defaultSmartLink,
  linkedActive,
  linkedChanges,
  mapTo,
  mergeLinked,
  propagateLinked,
  type LinkedField,
  type LinkedRanges,
} from "./linked-params";

const SOURCES: LinkedField[] = ["hydration", "flourW", "flourPL", "fermentHours", "fermentTemp"];

function rangesOf(dough: { hydration_pct_range: [number, number]; flour_w_range: [number, number]; flour_pl_range: [number, number]; fermentation_hours_range: [number, number] }): LinkedRanges {
  return {
    hydration: dough.hydration_pct_range,
    flourW: dough.flour_w_range,
    flourPL: dough.flour_pl_range,
    fermentHours: dough.fermentation_hours_range,
    includePL: true,
  };
}

/** Il valore resta nell'intervallo dello stile, oppure nei limiti del cursore se lo stile li supera. */
function expectInside(value: number | undefined, [lo, hi]: readonly [number, number], [sMin, sMax]: readonly [number, number, number], label: string) {
  if (value === undefined) return;
  const low = Math.max(lo, sMin);
  const high = Math.min(hi, sMax);
  expect(value, label).toBeGreaterThanOrEqual(Math.min(low, high) - 1e-9);
  expect(value, label).toBeLessThanOrEqual(Math.max(low, high) + 1e-9);
}

describe("parametri collegati (G2-WP-01)", () => {
  it("nessuna propagazione esce dall'intervallo dello stile, per ogni stile e ogni sorgente", () => {
    for (const style of Object.values(STYLES_DB)) {
      const ranges = rangesOf(style.dough);
      for (const source of SOURCES) {
        const [lo, hi] = source === "fermentTemp" ? [1, 30] : SLIDER_BOUNDS[source];
        for (const value of [lo, (lo + hi) / 2, hi]) {
          const out = propagateLinked(source, value, ranges);
          const tag = `${style.id} · ${source}=${value}`;
          expectInside(out.hydration, ranges.hydration, SLIDER_BOUNDS.hydration, `${tag} → hydration`);
          expectInside(out.flourW, ranges.flourW, SLIDER_BOUNDS.flourW, `${tag} → flourW`);
          expectInside(out.flourPL, ranges.flourPL, SLIDER_BOUNDS.flourPL, `${tag} → flourPL`);
          expectInside(out.fermentHours, ranges.fermentHours, SLIDER_BOUNDS.fermentHours, `${tag} → fermentHours`);
          expect(out).not.toHaveProperty(source);
        }
      }
    }
  });

  it("Bonci (82 %, 48 h): l'idratazione a 76 % non porta la lievitazione sotto il minimo dello stile", () => {
    const ranges = rangesOf(mergeImpastoIntoDough(STYLES_DB.teglia_romana.dough, getImpasto("bonci_metodo")));
    const out = propagateLinked("hydration", 76, ranges);
    expect(out.fermentHours).toBe(ranges.fermentHours[0]);
    expect(out.flourW).toBe(ranges.flourW[0]);
  });

  it("D-G2-1: acceso di default solo dal livello 3 e mai con gli avanzati chiusi", () => {
    expect([1, 2, 3, 4].map(defaultSmartLink)).toEqual([false, false, true, true]);
    expect(linkedActive(true, false)).toBe(false);
    expect(linkedActive(false, true)).toBe(false);
    expect(linkedActive(true, true)).toBe(true);
  });

  it("mapTo non concede più il margine del 20 % oltre l'intervallo", () => {
    expect(mapTo(1.5, 6, 18, 1, 96, 1)).toBe(18);
    expect(mapTo(-0.5, 6, 18, 1, 96, 1)).toBe(6);
    expect(mapTo(1, 0.45, 0.55, 0.3, 0.9, 0.01)).toBe(0.55);
  });

  it("la temperatura segue le ore a tre gradini e le ore seguono la temperatura", () => {
    const ranges = rangesOf(STYLES_DB.teglia_romana.dough);
    expect(propagateLinked("fermentHours", ranges.fermentHours[1], ranges).fermentTemp).toBe(FRIDGE_C);
    expect(propagateLinked("fermentHours", ranges.fermentHours[0], ranges).fermentTemp).toBe(AMBIENT_C);
    const fromFridge = propagateLinked("fermentTemp", FRIDGE_C, ranges);
    expect(fromFridge.fermentHours).toBeGreaterThan(propagateLinked("fermentTemp", AMBIENT_C, ranges).fermentHours!);
  });

  it("P/L segue solo quando è modificabile, e il riepilogo elenca solo i campi cambiati", () => {
    const ranges = { ...rangesOf(STYLES_DB.teglia_romana.dough), includePL: false };
    const out = propagateLinked("hydration", ranges.hydration[1], ranges);
    expect(out).not.toHaveProperty("flourPL");
    expect(linkedChanges({ flourW: out.flourW, fermentHours: 1, fermentTemp: out.fermentTemp }, out)).toEqual(["fermentHours"]);
  });

  it("«Annulla» dopo un trascinamento torna ai valori di prima del primo passo", () => {
    const step1 = mergeLinked(null, { hydration: 55, flourW: 260, fermentHours: 12, fermentTemp: 22 }, "hydration", { flourW: 270, fermentHours: 15, fermentTemp: 12 });
    expect(step1).toEqual({ before: { flourW: 260, fermentHours: 12, fermentTemp: 22 }, after: { flourW: 270, fermentHours: 15, fermentTemp: 12 } });
    const step2 = mergeLinked(step1, { hydration: 56, flourW: 270, fermentHours: 15, fermentTemp: 12 }, "hydration", { flourW: 280, fermentHours: 18, fermentTemp: 4 });
    expect(step2?.before).toEqual({ flourW: 260, fermentHours: 12, fermentTemp: 22 });
    expect(step2?.after).toEqual({ flourW: 280, fermentHours: 18, fermentTemp: 4 });
    // L'utente sposta le ore: tornano sue e non si annullano più.
    const step3 = mergeLinked(step2, { hydration: 56, flourW: 280, fermentHours: 18, fermentTemp: 4 }, "fermentHours", { hydration: 56, flourW: 280, fermentTemp: 4 });
    expect(step3).toEqual({ before: { flourW: 260, fermentTemp: 22 }, after: { flourW: 280, fermentTemp: 4 } });
    // Un'altra azione ha cambiato W: la serie riparte.
    expect(mergeLinked(step3, { hydration: 56, flourW: 300, fermentHours: 18, fermentTemp: 4 }, "hydration", { flourW: 300, fermentHours: 18, fermentTemp: 4 })).toBeNull();
  });

  it("un valore che torna a quello di partenza esce dal riepilogo", () => {
    const run = mergeLinked(
      { before: { flourW: 260, fermentHours: 12 }, after: { flourW: 250, fermentHours: 9 } },
      { hydration: 57, flourW: 250, fermentHours: 9, fermentTemp: 22 },
      "hydration",
      { flourW: 260, fermentHours: 11, fermentTemp: 12 },
    );
    expect(run).toEqual({ before: { fermentHours: 12, fermentTemp: 22 }, after: { fermentHours: 11, fermentTemp: 12 } });
  });
});
