/**
 * FW-04 (S09-A-15, S09-B-07, S10-A-14): le parole che ogni passo del
 * procedimento usa, verso le voci del glossario. Prima l'Impasto apriva
 * «Idratazione» mentre il testo parlava di incordatura e pieghe, e Staglio,
 * Stesura e Preriscaldo non avevano rimandi.
 *
 * Nell'impasto non lievitato (Focaccia di Recco, ENG-5) puntata e appretto
 * sono un riposo: lì i termini della lievitazione non si mostrano.
 */
const STEP_TERMS: Record<string, readonly string[]> = {
  preferment: ["pre_ferment"],
  mix: ["gluten_development", "folds"],
  bulk: ["bulk_fermentation"],
  divide: ["dough_division", "ball_shaping"],
  proof: ["ball_fermentation", "poke_test"],
  shape: ["cornicione"],
  preheat: ["oven_floor_dome"],
  bake: ["oven_floor_dome", "maillard"],
};

const REST_STEP_IDS = new Set(["bulk", "proof"]);

export function stepGlossaryTerms(
  stepId: string | undefined,
  options: { unleavened?: boolean; preFermentType?: string } = {},
): string[] {
  if (!stepId) return [];
  if (options.unleavened && REST_STEP_IDS.has(stepId)) return [];
  const terms = [...(STEP_TERMS[stepId] ?? [])];
  if (stepId === "preferment" && (options.preFermentType === "biga" || options.preFermentType === "poolish")) {
    terms.push(options.preFermentType);
  }
  return terms;
}

/** Tutti gli id usati, per il test di copertura del glossario. */
export const ALL_STEP_TERM_IDS: readonly string[] = [...new Set([...Object.values(STEP_TERMS).flat(), "biga", "poolish"])];
