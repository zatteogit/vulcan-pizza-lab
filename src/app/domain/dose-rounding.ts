/* ═══ FW-17 — Arrotondamento delle dosi per ingrediente ═══
 * Una sola regola, usata dal motore quando trasforma le percentuali del
 * panettiere in grammi (S08-B-19):
 *  - sale, grasso, zucchero: al grammo sopra i 5 g, al mezzo grammo sotto.
 *    Al grammo un sale all'1,8 % su 131 g di farina (2,36 g) diventava 2 g,
 *    cioè 1,5 %: la pinsa singola risultava sottosalata del 15 %. Al mezzo
 *    grammo l'errore massimo è 0,25 g;
 *  - lievito di birra (fresco o secco): al decimo di grammo, perché sotto il
 *    grammo la differenza conta (le microdosi hanno l'aiuto della diluizione,
 *    vedi yeastDilution in recipe-phases.ts). Sotto 0,1 g al centesimo, e mai
 *    0: al decimo una pinsa singola con 48 h in frigo (0,04 g di secco)
 *    diventava 0 g e la ricetta lievitata perdeva il lievito;
 *  - lievito madre: al grammo.
 * Modulo puro, senza dipendenze. */

export type RoundedDoseId = "salt" | "fat" | "sugar" | "yeast" | "starter";

/** Sotto questa dose (g) sale, grasso e zucchero si arrotondano al mezzo grammo. */
export const HALF_GRAM_BELOW_G = 5;

/** Sotto questa dose (g) il lievito di birra si arrotonda al centesimo. */
export const YEAST_HUNDREDTH_BELOW_G = 0.1;

export function roundForDisplay(id: RoundedDoseId, grams: number): number {
  if (!Number.isFinite(grams) || grams <= 0) return 0;
  if (id === "yeast") {
    const tenth = Math.round(grams * 10) / 10;
    if (tenth >= YEAST_HUNDREDTH_BELOW_G) return tenth;
    return Math.max(0.01, Math.round(grams * 100) / 100);
  }
  if (id === "starter") return Math.round(grams);
  return grams < HALF_GRAM_BELOW_G ? Math.round(grams * 2) / 2 : Math.round(grams);
}

/** Errore massimo dell'arrotondamento di `roundForDisplay`, in grammi. */
export function maxRoundingErrorG(id: RoundedDoseId, grams: number): number {
  if (id === "yeast") return grams < YEAST_HUNDREDTH_BELOW_G ? 0.005 : 0.05;
  if (id === "starter") return 0.5;
  return grams < HALF_GRAM_BELOW_G ? 0.25 : 0.5;
}
