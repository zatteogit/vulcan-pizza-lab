import { isFriedStyle, suggestedTimeSlot, type PizzaStyle, type StyleRecommendation } from "./pizza-engine";

/* Ingresso di Crea e raggruppamento dei consigli: tre decisioni di Matteo
 * (docs/autorialita.md) che una PR aveva annullato senza dirlo. Stanno qui,
 * pure e testate (decision-guards.test.ts), così la UI non le riscrive a mano. */

const HOUR_MS = 60 * 60 * 1000;

export interface CreateEntryTime {
  slotId: string;
  hours: number;
  selectedAt: number;
  targetAt: number;
}

/** D-036: senza una scelta salvata, Crea parte dal momento consigliato (il più
 *  vicino alle 24 h), non da «Nessuna preferenza». `null` solo se il motore non
 *  propone alcun momento. */
export function createEntryTime(nowMs: number): CreateEntryTime | null {
  const slot = suggestedTimeSlot(new Date(nowMs));
  if (!slot) return null;
  return {
    slotId: slot.id,
    hours: slot.hours,
    selectedAt: nowMs,
    targetAt: slot.targetAt ?? nowMs + slot.hours * HOUR_MS,
  };
}

/** D-038: l'avviso di Crea chiede solo il forno, e solo finché non è scelto.
 *  `ovenSaved`: c'è un forno nel profilo (anche dall'onboarding o
 *  dall'edizione); `dismissed`: l'utente ha detto «Va bene così». */
export function shouldAskForOven(input: { ovenSaved: boolean; dismissed: boolean }): boolean {
  return !input.ovenSaved && !input.dismissed;
}

export type RecommendationSectionKey = "perfect" | "good" | "fried" | "not_feasible";

/** D-032: le fritte non usano il forno, quindi con una cucina di casa
 *  finirebbero in cima a «Perfetti per te». Stanno in una sezione a parte,
 *  dopo gli stili al forno; quelle non fattibili restano fra le non fattibili.
 *  `sort` è l'ordinamento visibile della UI, applicato dentro ogni sezione. */
export function recommendationSections<T extends Pick<StyleRecommendation, "tier"> & { style: PizzaStyle }>(
  items: readonly T[],
  sort: (items: T[]) => T[] = (list) => list,
): { key: RecommendationSectionKey; items: T[] }[] {
  const baked = items.filter((item) => !isFriedStyle(item.style));
  const fried = items.filter((item) => isFriedStyle(item.style));
  const sections: { key: RecommendationSectionKey; items: T[] }[] = [
    { key: "perfect", items: sort(baked.filter((item) => item.tier === "perfect")) },
    { key: "good", items: sort(baked.filter((item) => item.tier === "good" || item.tier === "challenging")) },
    { key: "fried", items: sort(fried.filter((item) => item.tier !== "not_feasible")) },
    { key: "not_feasible", items: sort(items.filter((item) => item.tier === "not_feasible")) },
  ];
  return sections.filter((section) => section.items.length > 0);
}
