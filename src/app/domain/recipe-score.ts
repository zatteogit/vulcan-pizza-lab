import type { RecipeOutcome, ScoreDimensionKey } from "./pizza-engine";

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
