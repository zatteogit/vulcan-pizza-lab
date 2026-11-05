/* «Servono più gradi» (decisione di Matteo, 05/11/2026): nelle viste complete di
 * Scopri ciò che la tua cucina non permette non sta più nella griglia in grigio.
 * Si raggruppa per il motivo:
 *   - solo il forno troppo freddo → fascia per temperatura minima dello stile
 *     (fino a 299 °C, da 300 a 399 °C, da 400 °C in su);
 *   - qualunque altro blocco (allergeni, diete, dispensa, tempi), anche insieme
 *     al forno → «Per altri motivi»: alzare il forno non basterebbe.
 * Le fasce dipendono dalla temperatura, mai dall'elenco dei nomi. */
import type { RecipeVerdict } from "../domain/pizza-engine";

export type OvenBand = "home_plus" | "pizza_oven" | "high_heat";

const BAND_ORDER: readonly OvenBand[] = ["home_plus", "pizza_oven", "high_heat"];

export function ovenBand(minC: number): OvenBand {
  if (minC < 300) return "home_plus";
  if (minC < 400) return "pizza_oven";
  return "high_heat";
}

export interface BlockedBand<T> {
  band: OvenBand;
  /** La temperatura minima più bassa della fascia («Da 270 °C a 299 °C»). */
  fromC: number;
  items: { item: T; minC: number }[];
}

export interface BlockedGroups<T> {
  bands: BlockedBand<T>[];
  other: { item: T; verdict: RecipeVerdict }[];
}

/** Dove va una voce non fattibile; null se si può fare. */
export function blockedPlacement(verdict: RecipeVerdict): { band: OvenBand; minC: number } | "other" | null {
  if (verdict.outcome !== "not_feasible") return null;
  const oven = verdict.blockers.find((b) => b.kind === "oven_too_cold");
  if (oven?.kind === "oven_too_cold" && verdict.blockers.every((b) => b.kind === "oven_too_cold")) {
    const minC = Math.max(...verdict.blockers.map((b) => (b.kind === "oven_too_cold" ? b.style_min_c : 0)));
    return { band: ovenBand(minC), minC };
  }
  return "other";
}

/** Raggruppa le voci non fattibili; quelle fattibili si ignorano. Dentro una
 *  fascia l'ordine è per temperatura, poi quello dato. */
export function groupBlocked<T>(entries: readonly { item: T; verdict: RecipeVerdict }[]): BlockedGroups<T> {
  const byBand = new Map<OvenBand, { item: T; minC: number; index: number }[]>();
  const other: BlockedGroups<T>["other"] = [];
  entries.forEach(({ item, verdict }, index) => {
    const placement = blockedPlacement(verdict);
    if (placement === null) return;
    if (placement === "other") {
      other.push({ item, verdict });
      return;
    }
    const list = byBand.get(placement.band) ?? [];
    list.push({ item, minC: placement.minC, index });
    byBand.set(placement.band, list);
  });
  const bands = BAND_ORDER.flatMap((band) => {
    const list = byBand.get(band);
    if (!list?.length) return [];
    list.sort((a, b) => a.minC - b.minC || a.index - b.index);
    return [{ band, fromC: list[0].minC, items: list.map(({ item, minC }) => ({ item, minC })) }];
  });
  return { bands, other };
}
