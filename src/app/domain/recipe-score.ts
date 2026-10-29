import type { RecipeOutcome, ScoreDimensionKey } from "./pizza-engine";

/* ═══ FW-05 — Pesi e fasce dei punteggi come dati ═══
 * Una sola fonte per il calcolo e per i testi (glossario, MCP): prima il
 * glossario dichiarava pesi e fasce diversi da quelli calcolati (S12-A-03).
 * Sono scelte di Vulcan, non misure (nota score-weights). */
export const AUTH_AXIS_WEIGHTS = { ingredients: 0.35, process: 0.30, equipment: 0.35 } as const;
export const FEAS_AXIS_WEIGHTS = { oven: 0.4, flour: 0.3, skill: 0.3 } as const;
/** Tetto editoriale dell'autenticità senza il combustibile identitario. */
export const AUTHENTICITY_FUEL_CAP = 75;
/** Soglie inferiori delle fasce (dalla più alta) per A, F e D. */
export const SCORE_BANDS = { A: [90, 75, 60], F: [85, 70, 50], D: [85, 70, 50] } as const;

/** Indice della fascia (0 = la più alta) di un punteggio. */
export function scoreBandIndex(type: "A" | "F" | "D", score: number): 0 | 1 | 2 | 3 {
  const [hi, mid, lo] = SCORE_BANDS[type];
  return score >= hi ? 0 : score >= mid ? 1 : score >= lo ? 2 : 3;
}

/** Product defaults shared by the browser and browser-equivalent MCP modes. */
export const DEFAULT_UI_SCORE_WEIGHTS = {
  authenticity: 0.30, feasibility: 0.25, digestibility: 0.20,
  sustainability: 0.15, experimentation: 0.10,
} as const;

export interface GlobalScoreCalculation {
  weighted_average: number;
  /** Valori effettivamente mediati: E è una distanza, quindi entra come 100−E. */
  weighted_values: Record<ScoreDimensionKey, number>;
  authenticity_ceiling: number;
  feasibility_ceiling: number | null;
  limited_by: "authenticity" | "feasibility" | null;
}

/** Politica di prodotto, non soglia fisica: un esito non fattibile resta
 * nella fascia bassa (<40). La fattibilità è determinata dal verdetto. */
export const NON_FEASIBLE_SCORE_CEILING = 39;

export function globalRecipeScore(
  dimensions: Record<ScoreDimensionKey, number>,
  weights: Record<ScoreDimensionKey, number>,
  outcome: RecipeOutcome,
): { score: number; calculation: GlobalScoreCalculation } {
  const keys = Object.keys(dimensions) as ScoreDimensionKey[];
  const weightedValues = { ...dimensions, experimentation: 100 - dimensions.experimentation };
  const total = keys.reduce((sum, key) => sum + weights[key], 0);
  const weighted = Math.round(keys.reduce((sum, key) => sum + weightedValues[key] * weights[key], 0) / (total || 1));
  const authenticity = Math.round(dimensions.authenticity);
  const feasibility = outcome === "not_feasible" ? NON_FEASIBLE_SCORE_CEILING : null;
  // Gli altri assi non possono riscattare una ricetta infedele allo stile,
  // neppure portando a zero il peso dell'autenticità nel CMS.
  const score = Math.max(0, Math.min(100, weighted, authenticity, feasibility ?? 100));
  const limitedBy = score >= weighted ? null
    : feasibility !== null && feasibility < authenticity && score === feasibility ? "feasibility"
    : "authenticity";
  return {
    score,
    calculation: {
      weighted_average: weighted,
      weighted_values: weightedValues,
      authenticity_ceiling: authenticity,
      feasibility_ceiling: feasibility,
      limited_by: limitedBy,
    },
  };
}
