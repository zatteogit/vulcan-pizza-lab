/* FW-16 (D-M, S10-B-07) — istantanea della ricetta per il feedback a fine
 * pizzata. Modulo senza UI: Crea e la scheda lo usano all'avvio della
 * pizzata senza caricare il modulo del form. */
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import type { PredictedScores, RecipeSnapshot } from "../../domain/recipe-feedback";

/** FW-16 (D-M): parametri e punteggi della ricetta, presi quando si inizia a
 *  cucinare, così la domanda «com'è venuta?» funziona anche alla fine della pizzata. */
export function feedbackContextFromRecipe(recipe: GeneratedRecipe, skillLevel: number): { snapshot: RecipeSnapshot; predicted: PredictedScores } {
  return {
    snapshot: {
      styleId: recipe.style.id,
      styleName: recipe.style.name,
      hydration: recipe.hydration_pct,
      flourW: recipe.flour_w,
      flourPL: recipe.flour_pl,
      fermentHours: recipe.fermentation_hours,
      fermentTemp: recipe.fermentation_temp_c,
      ovenTemp: recipe.oven_temp_c,
      ovenType: recipe.style.baking.oven_type_required,
      yeastType: recipe.yeast_type,
      yeastPct: recipe.science.yeast_baker_pct,
      skillLevel: skillLevel as 1 | 2 | 3 | 4,
      hasPreFerment: recipe.has_pre_ferment,
      compensationCount: recipe.science.compensations.length,
      doughBalls: recipe.dough_balls,
    },
    predicted: {
      authenticity: recipe.scores.authenticity,
      feasibility: recipe.scores.feasibility,
      digestibility: recipe.scores.digestibility,
      sustainability: recipe.scores.sustainability,
      experimentation: recipe.scores.experimentation,
      composite: recipe.scores.composite,
    },
  };
}
