/* G3-WP-03 (S09-A-13) — Soglie con cui il motore sceglie il testo di un passo.
 * Il passo dà un solo comando per la ricetta e la cucina dell'utente: niente
 * «se l'idratazione è alta…» o «se la cottura dura poco…». Le soglie stanno
 * qui (e in engine-facts per i testi), mai ripetute come numeri nel codice. */

/** Oltre questa idratazione (%) l'impasto a mano si lavora con lo slap & fold
 *  e il motore suggerisce le pieghe; con chi comincia è un avviso. */
export const HIGH_HYDRATION_PCT = 75;

/** D-G3-02: fino a questa cottura effettiva (s) il basilico in foglia va sulla
 *  pizza prima del forno; oltre, appena sfornata. Scelta di Vulcan (nota
 *  basil-timing), non una misura: copre la napoletana di 60-90 s con margine. */
export const BASIL_BEFORE_BAKE_MAX_SEC = 120;

export type ToppingBakeLength = "short" | "long";

/** Variante di un passo del condimento secondo la cottura effettiva. */
export function toppingBakeLength(effectiveCookSec: number): ToppingBakeLength {
  return effectiveCookSec <= BASIL_BEFORE_BAKE_MAX_SEC ? "short" : "long";
}

/** Cottura effettiva con il condimento: quella della cucina effettiva
 *  (resolveEffectiveKitchen → cook_time_sec) più i minuti che il condimento
 *  aggiunge. Unica per motore e UI. */
export function toppingEffectiveCookSec(
  cookTimeSec: number,
  topping?: { bake_adjustments?: { additional_minutes?: number } },
): number {
  return cookTimeSec + (topping?.bake_adjustments?.additional_minutes ?? 0) * 60;
}

/** Variante del passo del condimento, solo se il passo ne ha una per le
 *  cotture brevi. */
export function assemblyStepBake(
  step: { description_short_bake?: string },
  effectiveCookSec: number,
): ToppingBakeLength | undefined {
  return step.description_short_bake ? toppingBakeLength(effectiveCookSec) : undefined;
}

/** Il testo del passo per quella variante: un solo comando. */
export function assemblyStepDescription(
  step: { description: string; description_short_bake?: string },
  bake: ToppingBakeLength | undefined,
): string {
  return bake === "short" && step.description_short_bake ? step.description_short_bake : step.description;
}
