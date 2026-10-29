/* G4b-WP-01 (S13-B-09): un solo contesto per i problemi di fase, così la
 * scheda ricetta e la modalità cottura mostrano le stesse diagnosi. */

import { COLD_RETARD_MAX_C } from "../../data/troubleshooting-data";
import { isFriedStyle, needsPan, type GeneratedRecipe } from "../../domain/pizza-engine";
import { resolveStepVisual } from "../cooking/step-visual";

type TroubleRecipe = Pick<GeneratedRecipe, "timeline" | "style" | "fermentation_temp_c" | "flour_w">;

export function stepTroubleContext(recipe: TroubleRecipe) {
  return {
    unleavened: !!recipe.style.dough.unleavened,
    filled: recipe.timeline.some((step) => resolveStepVisual(step) === "fill_internal"),
    /* FW-05: puntata in frigo (S13-B-02) e farina senza glutine, che a
       catalogo ha W 0 (S13-B-14), restringono le diagnosi della fase. */
    coldRetard: recipe.fermentation_temp_c <= COLD_RETARD_MAX_C,
    glutenFree: recipe.flour_w <= 0,
    /* G4b-WP-03 (S13-A-10): la pizza va su pietra o platea con la pala. */
    peel: !needsPan(recipe.style) && !recipe.style.proof_in_pan && !isFriedStyle(recipe.style),
  };
}
