/* Browser adapter for the pure saved-recipe collection rules. */

import {
  findSavedRecipeIn,
  removeSavedRecipeFrom,
  sortSavedRecipes,
  toggleFavoriteStyleIn,
  upsertSavedRecipe,
  type SavedRecipe,
  type SavedRecipeParams,
} from "../../data/saved-recipes";

export type { SavedRecipe, SavedRecipeParams } from "../../data/saved-recipes";
export { formatSavedDate } from "../../data/saved-recipes";

const RECIPES_KEY = "vulcan_saved_recipes";
const FAVORITES_KEY = "vulcan_fav_styles";

function readArray<T>(key: string, valid: (value: unknown) => value is T): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(valid) : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: readonly unknown[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full; persistence is non-blocking.
  }
}

function readRecipes(): SavedRecipe[] {
  return readArray(
    RECIPES_KEY,
    (value): value is SavedRecipe =>
      Boolean(
        value &&
          typeof value === "object" &&
          typeof (value as SavedRecipe).id === "string" &&
          typeof (value as SavedRecipe).styleId === "string" &&
          (value as SavedRecipe).params,
      ),
  );
}

export function loadSavedRecipes(): SavedRecipe[] {
  return sortSavedRecipes(readRecipes());
}

export function findSavedRecipe(
  styleId: string,
  params: SavedRecipeParams,
): SavedRecipe | undefined {
  return findSavedRecipeIn(readRecipes(), styleId, params);
}

export function saveRecipe(
  recipe: Omit<SavedRecipe, "id" | "createdAt">,
): SavedRecipe[] {
  const next = upsertSavedRecipe(readRecipes(), recipe, {
    id: `sr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  });
  writeArray(RECIPES_KEY, next);
  return next;
}

export function removeRecipe(id: string): SavedRecipe[] {
  const next = removeSavedRecipeFrom(readRecipes(), id);
  writeArray(RECIPES_KEY, next);
  return next;
}

export function loadFavoriteStyles(): string[] {
  return readArray(FAVORITES_KEY, (value): value is string => typeof value === "string");
}

export function toggleFavoriteStyle(styleId: string): string[] {
  const next = toggleFavoriteStyleIn(loadFavoriteStyles(), styleId);
  writeArray(FAVORITES_KEY, next);
  return next;
}

export function isFavoriteStyle(styleId: string): boolean {
  return loadFavoriteStyles().includes(styleId);
}
