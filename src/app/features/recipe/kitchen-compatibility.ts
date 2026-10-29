export { canonicalRecipe, canonicalRecipeEntry, canonicalInterpretation, getCanonicalVersion, defaultPL, styleWithSelectedTopping, tailoredRecipeEntry } from "../../use-cases/recipe-entry";
import { canonicalRecipe, tailoredRecipeEntry } from "../../use-cases/recipe-entry";
import {
  type GeneratedRecipe,
  type PizzaStyle,
  type UserConstraints,
} from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";

type ScoreWeights = import("../../domain/pizza-engine").ScoreWeightsOverride;

/** I pesi dei punteggi dal CMS, come li usa la scheda ricetta: senza, le card
 *  davano circa 15 punti in più della ricetta aperta. */
export function scoreWeightsFromCms(cms: Pick<CmsContent, "scoreDimensions">): ScoreWeights {
  const d = cms.scoreDimensions;
  return {
    authenticity: d?.authenticity?.weight,
    feasibility: d?.feasibility?.weight,
    digestibility: d?.digestibility?.weight,
    sustainability: d?.sustainability?.weight,
    experimentation: d?.experimentation?.weight,
  } as ScoreWeights;
}

export interface KitchenCompatibility {
  recipe: GeneratedRecipe;
  /** Punteggio del riferimento sulla tua cucina (0–100, arrotondato). */
  now: number;
  /** Il meglio raggiungibile adattando la ricetta (solo per l'MCP). */
  best: number;
}

/** FW-06 (S07-A-17, S07-B-21): Scopri mostra solo il numero del riferimento
 *  sulla tua cucina; non serve far girare l'ottimizzatore per ogni card. */
export function referenceCompatibility(
  style: PizzaStyle,
  constraints: UserConstraints,
  scoreWeights?: ScoreWeights,
): Pick<KitchenCompatibility, "recipe" | "now"> {
  const recipe = canonicalRecipe(style, constraints, scoreWeights);
  return { recipe, now: Math.round(recipe.scores.composite) };
}

export function kitchenCompatibility(
  style: PizzaStyle,
  constraints: UserConstraints,
  scoreWeights?: ScoreWeights,
): KitchenCompatibility {
  const original = canonicalRecipe(style, constraints, scoreWeights);
  const now = original.scores.composite;
  const optimized = tailoredRecipeEntry(style, constraints, scoreWeights).recipe;
  let best = original.verdict.outcome !== "not_feasible" ? now : 0;
  if (optimized.verdict.outcome !== "not_feasible") best = Math.max(best, optimized.scores.composite);
  // Nessuna candidata eseguibile: non promettere un guadagno teorico.
  return { recipe: original, now: Math.round(now), best: Math.round(best || now) };
}
