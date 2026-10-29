/* ═══ FW-05 — Forza della farina: una sola scala e la soglia di eccesso ═══
 * La stessa scala serve il selettore di Crea, la riga degli ingredienti, la
 * modale W e il glossario (S06-A-04/A-05, S08-B-05, S12-B-17). Modulo puro. */

/** FW-05: oltre W massima × questo fattore la farina è «troppo forte» per lo
 *  stile (scelta del modello). Lo legge anche il selettore della farina. */
export const FLOUR_W_EXCESS_FACTOR = 1.3;

export type FlourStrength = "weak" | "medium" | "strong" | "veryStrong";

/** Fasce semiaperte [min, max): W 280 è «forte», non anche «media» (S12-B-17). */
export const FLOUR_STRENGTH_SCALE: readonly { id: FlourStrength; min: number; max: number }[] = [
  { id: "weak", min: 0, max: 220 },
  { id: "medium", min: 220, max: 280 },
  { id: "strong", min: 280, max: 330 },
  { id: "veryStrong", min: 330, max: Infinity },
];

export function flourStrength(w: number): FlourStrength {
  return (FLOUR_STRENGTH_SCALE.find((band) => w >= band.min && w < band.max) ?? FLOUR_STRENGTH_SCALE[0]).id;
}

/** Giudizio della farina per lo stile: sotto la W minima è debole, oltre la
 *  soglia di eccesso della fattibilità è troppo forte (S06-A-04). */
export function flourFitForStyle(w: number, flourW: readonly [number, number]): "weak" | "ideal" | "strong" {
  if (w < flourW[0]) return "weak";
  if (w > flourW[1] * FLOUR_W_EXCESS_FACTOR) return "strong";
  return "ideal";
}
