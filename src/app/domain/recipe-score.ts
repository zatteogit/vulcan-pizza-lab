import type { RecipeOutcome, RecipeScores, ScoreDimensionKey } from "./pizza-engine";

/** Product defaults shared by the browser and browser-equivalent MCP modes.
 *
 * FW-06 · D-E (Matteo, 28/10/2026): la «Compatibilità con la tua cucina» pesa
 * solo la facilità (fattibilità) e la fedeltà allo stile (autenticità).
 * Maturazione, sostenibilità e sperimentazione restano calcolate e si mostrano
 * a parte, al livello 2: con peso 0 non spostano il numero. Il rapporto
 * 55 : 45 conserva quello che i due criteri avevano prima (30 : 25).
 * Misura dell'effetto sulla classifica: docs/audit-punteggio-d-e.md. */
export const DEFAULT_UI_SCORE_WEIGHTS = {
  authenticity: 0.55, feasibility: 0.45, digestibility: 0,
  sustainability: 0, experimentation: 0,
} as const;

export interface GlobalScoreCalculation {
  weighted_average: number;
  /** Valori effettivamente mediati: E è una distanza, quindi entra come 100−E. */
  weighted_values: Record<ScoreDimensionKey, number>;
  /** FW-06: pesi usati, normalizzati a somma 1 (0 = informativo). */
  weights?: Record<ScoreDimensionKey, number>;
  authenticity_ceiling: number;
  feasibility_ceiling: number | null;
  limited_by: "authenticity" | "feasibility" | null;
}

/** Politica di prodotto, non soglia fisica: un esito non fattibile resta
 * nella fascia bassa (<40). La fattibilità è determinata dal verdetto. */
export const NON_FEASIBLE_SCORE_CEILING = 39;

const SCORE_KEYS: readonly ScoreDimensionKey[] = ["authenticity", "feasibility", "digestibility", "sustainability", "experimentation"];

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
  const normalized = Object.fromEntries(SCORE_KEYS.map((key) => [key, total > 0 ? (weights[key] ?? 0) / total : 0])) as Record<ScoreDimensionKey, number>;
  return {
    score,
    calculation: {
      weighted_average: weighted,
      weighted_values: weightedValues,
      weights: normalized,
      authenticity_ceiling: authenticity,
      feasibility_ceiling: feasibility,
      limited_by: limitedBy,
    },
  };
}

/* ═══ FW-06 — Il punteggio spiegato, una sola volta ═══
 * Audit 28/10/2026 (S02-A-02, S03-A-05, S05-B-03, S07-B-03): il tooltip
 * parlava di due criteri, la scheda di cinque, nessuno diceva che il voto è il
 * più basso fra media e tetti. `explainScore` non ricalcola nulla: legge
 * `globalRecipeScore` e ne espone i pezzi, così Scopri, pannello stile, Crea,
 * scheda ricetta e ricettario raccontano lo stesso numero. */

export interface ScoreDimensionExplanation {
  key: ScoreDimensionKey;
  /** Valore dell'asse 0–100 come lo mostra la barra (E resta la distanza). */
  value: number;
  /** Valore che entra nella media (per E è 100−E). */
  weightedValue: number;
  /** Peso normalizzato 0–1 (somma 1 sui criteri che contano). */
  weight: number;
  /** Punti portati alla media: weightedValue × weight. */
  contribution: number;
  /** false = informazione separata (peso 0): non sposta il punteggio. */
  counts: boolean;
}

export interface ScoreExplanation {
  score: number;
  weightedAverage: number;
  dimensions: ScoreDimensionExplanation[];
  limitedBy: "authenticity" | "feasibility" | null;
  ceilings: { authenticity: number; feasibility: number | null };
  /** I criteri che tolgono più punti (fino a 2), dal più pesante. */
  topDrivers: ScoreDimensionKey[];
}

export function explainScore(
  dimensions: Record<ScoreDimensionKey, number>,
  weights: Record<ScoreDimensionKey, number>,
  outcome: RecipeOutcome,
): ScoreExplanation {
  const { score, calculation } = globalRecipeScore(dimensions, weights, outcome);
  const normalized = calculation.weights!;
  const rows = SCORE_KEYS.map((key): ScoreDimensionExplanation => {
    const weight = normalized[key];
    const weightedValue = calculation.weighted_values[key];
    return { key, value: dimensions[key], weightedValue, weight, contribution: weightedValue * weight, counts: weight > 0 };
  });
  const topDrivers = rows
    .filter((row) => row.counts && row.weightedValue < 100)
    .map((row) => ({ key: row.key, loss: (100 - row.weightedValue) * row.weight }))
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 2)
    .map((row) => row.key);
  return {
    score,
    weightedAverage: calculation.weighted_average,
    dimensions: rows,
    limitedBy: calculation.limited_by,
    ceilings: { authenticity: calculation.authenticity_ceiling, feasibility: calculation.feasibility_ceiling },
    topDrivers,
  };
}

/** La spiegazione del punteggio di una ricetta già calcolata, con i pesi che
 *  il motore ha davvero usato (salvati nel calcolo). */
export function explainRecipeScores(scores: RecipeScores): ScoreExplanation | null {
  const calculation = scores.global_calculation;
  if (!calculation?.weights) return null;
  const dimensions = Object.fromEntries(SCORE_KEYS.map((key) => [key, scores[key]])) as Record<ScoreDimensionKey, number>;
  const outcome: RecipeOutcome = calculation.feasibility_ceiling !== null ? "not_feasible" : "ok";
  return explainScore(dimensions, calculation.weights, outcome);
}
