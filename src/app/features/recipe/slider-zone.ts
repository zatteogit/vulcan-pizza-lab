/* ═══ G2-WP-02 (S06-A-03, S06-B-03) — dove si scrivono i numeri del range ═══
 * Le due etichette dell'intervallo dello stile stanno sotto le tacche, non ai
 * bordi della traccia: ai bordi si leggevano come minimo e massimo dello
 * slider. Qui solo la geometria, pura e testata; il CSS legge le posizioni
 * dalle custom property già impostate dallo slider e l'allineamento da
 * `data-align`. */

/** Come si appoggia il testo alla tacca: centrato, che parte dalla tacca
 *  (verso destra) o che finisce sulla tacca (verso sinistra). */
export type ZoneLabelAlign = "center" | "start" | "end";

export type SliderZoneLabels =
  | { kind: "none" }
  /** L'intervallo esce dalla traccia: una riga di testo al posto delle tacche. */
  | { kind: "outside"; beyondCeiling: boolean }
  | { kind: "ticks"; startAlign: ZoneLabelAlign; endAlign: ZoneLabelAlign };

/** Sotto l'8 % o sopra il 92 % della traccia il testo centrato uscirebbe. */
export const ZONE_EDGE_PCT = 8;
/** Tacche più vicine di così: i due testi si allontanano l'uno dall'altro. */
export const ZONE_MIN_GAP_PCT = 16;

export function sliderZoneLabels(
  min: number,
  max: number,
  rangeMin: number | undefined,
  rangeMax: number | undefined,
  ceiling = false,
): SliderZoneLabels {
  if (rangeMin === undefined || rangeMax === undefined || max <= min) return { kind: "none" };
  if (rangeMin < min || rangeMax > max) {
    return { kind: "outside", beyondCeiling: ceiling && rangeMax > max };
  }
  const left = ((rangeMin - min) / (max - min)) * 100;
  const right = ((rangeMax - min) / (max - min)) * 100;
  const close = right - left < ZONE_MIN_GAP_PCT;
  const align = (pct: number, fallback: ZoneLabelAlign): ZoneLabelAlign =>
    pct < ZONE_EDGE_PCT ? "start" : pct > 100 - ZONE_EDGE_PCT ? "end" : fallback;
  return {
    kind: "ticks",
    startAlign: align(left, close ? "end" : "center"),
    endAlign: align(right, close ? "start" : "center"),
  };
}
