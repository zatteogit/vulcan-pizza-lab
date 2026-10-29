import { describe, expect, it } from "vitest";
import { sliderZoneLabels } from "./slider-zone";

describe("sliderZoneLabels (G2-WP-02, S06-A-03/B-03)", () => {
  it("nessuna etichetta senza intervallo", () => {
    expect(sliderZoneLabels(45, 105, undefined, 70)).toEqual({ kind: "none" });
  });

  it("idratazione 45–105 con range 55–62: tacche vicine, testi che si allontanano", () => {
    expect(sliderZoneLabels(45, 105, 55, 62)).toEqual({ kind: "ticks", startAlign: "end", endAlign: "start" });
  });

  it("range largo nel mezzo: testi centrati sotto le tacche", () => {
    expect(sliderZoneLabels(1, 96, 24, 72)).toEqual({ kind: "ticks", startAlign: "center", endAlign: "center" });
  });

  it("tacche vicine ai bordi: il testo resta dentro la traccia", () => {
    expect(sliderZoneLabels(100, 420, 110, 410)).toEqual({ kind: "ticks", startAlign: "start", endAlign: "end" });
    expect(sliderZoneLabels(200, 250, 200, 250, true)).toEqual({ kind: "ticks", startAlign: "start", endAlign: "end" });
  });

  it("cottura di P1, forno 200–250 e stile 250–320: una riga «oltre il tuo forno»", () => {
    expect(sliderZoneLabels(200, 250, 250, 320, true)).toEqual({ kind: "outside", beyondCeiling: true });
  });

  it("range sotto l'inizio della traccia: riga generica, non «oltre il forno»", () => {
    expect(sliderZoneLabels(200, 300, 180, 220, true)).toEqual({ kind: "outside", beyondCeiling: false });
    expect(sliderZoneLabels(1, 96, 48, 120)).toEqual({ kind: "outside", beyondCeiling: false });
  });
});
