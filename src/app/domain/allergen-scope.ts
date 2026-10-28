import { getToppingForStyle } from "../data/topping-library";
import type { RecipeAllergens } from "../data/allergen-data";
import type { PizzaStyle } from "./pizza-engine";

/** FW-18 — What an allergen summary actually covers.
 * - "full": dough, cooking (e.g. frying oil) and the topping or filling the
 *   engine resolved for this recipe.
 * - "dough": the recipe has no topping/filling yet, so only dough and cooking
 *   are known; the label must say so instead of looking complete. */
export type AllergenScope = "dough" | "full";

export interface ScopedRecipeAllergens {
  scope: AllergenScope;
  report: RecipeAllergens;
}

/** Scope of the engine's combined report. It does not reassess ingredients:
 * `generateRecipe` already runs `assessAllergens` on flour, water, salt, fat,
 * sugar, yeast, the resolved topping/filling and the frying oil, and that same
 * report drives the verdict and the dietary blockers. Re-deriving it here could
 * only drift from what the engine decides. */
export function recipeAllergenScope(recipe: { allergens: RecipeAllergens; style: PizzaStyle }): ScopedRecipeAllergens {
  const ref = recipe.style.default_topping_ref;
  const toppingKnown = !!ref && getToppingForStyle(ref, recipe.style) !== undefined;
  return { scope: toppingKnown ? "full" : "dough", report: recipe.allergens };
}
