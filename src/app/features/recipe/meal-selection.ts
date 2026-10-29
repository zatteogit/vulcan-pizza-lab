/* ═══ Pasto selezionato nella tabella di marcia (G3-WP-01, S09-A-16) ═══
 * Lo stato «attivo» dei chip si deriva dal piano, non dall'ultimo clic:
 * all'apertura risulta già scelto il pasto con cui coincide il piano di
 * default, e la scelta si spegne quando l'orario si sposta con −/+. */

export interface MealStartCandidate {
  id: string;
  idealStart: Date;
}

/** Id dello slot il cui inizio ideale dista dall'inizio del piano al massimo
 *  `toleranceMin` minuti; con più candidati vince il più vicino. */
export function selectedMealId(
  slots: readonly MealStartCandidate[],
  startTime: Date,
  toleranceMin = 1,
): string | null {
  let best: { id: string; gap: number } | null = null;
  for (const slot of slots) {
    const gap = Math.abs(slot.idealStart.getTime() - startTime.getTime());
    if (gap <= toleranceMin * 60_000 && (!best || gap < best.gap)) best = { id: slot.id, gap };
  }
  return best?.id ?? null;
}
