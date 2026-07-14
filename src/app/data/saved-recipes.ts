/* Pure saved-recipe collection rules. Browser persistence lives in adapters/. */

import type { OvenType, PanConfig } from "../domain/pizza-engine";

export const MAX_SAVED_RECIPES = 30;

export interface SavedRecipeParams {
  hydration: number;
  flourW: number;
  flourPL: number;
  fermentHours: number;
  fermentTemp: number;
  usePreFerment: boolean;
  doughBalls: number;
  ovenType?: OvenType;
  ovenTemp?: number;
  panConfig?: PanConfig;
  selectedFlourId?: string | null;
  selectedToppingConcept?: string | null;
}

export interface SavedRecipe {
  id: string;
  createdAt: number;
  styleId: string;
  styleName: string;
  versionId: string | null;
  params: SavedRecipeParams;
  score?: number;
}

export function savedRecipeKey(styleId: string, params: SavedRecipeParams): string {
  return [
    styleId,
    params.hydration,
    params.flourW,
    params.flourPL,
    params.fermentHours,
    params.fermentTemp,
    params.usePreFerment ? 1 : 0,
    params.doughBalls,
    params.ovenType ?? "",
    params.ovenTemp ?? "",
    params.selectedToppingConcept ?? "",
  ].join("|");
}

export function sortSavedRecipes(recipes: readonly SavedRecipe[]): SavedRecipe[] {
  return [...recipes].sort((a, b) => b.createdAt - a.createdAt);
}

export function findSavedRecipeIn(
  recipes: readonly SavedRecipe[],
  styleId: string,
  params: SavedRecipeParams,
): SavedRecipe | undefined {
  const key = savedRecipeKey(styleId, params);
  return recipes.find((recipe) => savedRecipeKey(recipe.styleId, recipe.params) === key);
}

export function upsertSavedRecipe(
  recipes: readonly SavedRecipe[],
  recipe: Omit<SavedRecipe, "id" | "createdAt">,
  identity: { id: string; createdAt: number },
): SavedRecipe[] {
  const key = savedRecipeKey(recipe.styleId, recipe.params);
  const entry: SavedRecipe = { ...recipe, ...identity };
  return [
    entry,
    ...recipes.filter((item) => savedRecipeKey(item.styleId, item.params) !== key),
  ].slice(0, MAX_SAVED_RECIPES);
}

export function removeSavedRecipeFrom(
  recipes: readonly SavedRecipe[],
  id: string,
): SavedRecipe[] {
  return recipes.filter((recipe) => recipe.id !== id);
}

export function toggleFavoriteStyleIn(
  favoriteIds: readonly string[],
  styleId: string,
): string[] {
  return favoriteIds.includes(styleId)
    ? favoriteIds.filter((id) => id !== styleId)
    : [...favoriteIds, styleId];
}

/** Locale-aware relative date; copy can be replaced by the UI catalog. */
export function formatSavedDate(
  epochMs: number,
  now: Date = new Date(),
  locale = "it-IT",
  copy = { today: "oggi", yesterday: "ieri", daysAgo: "{days} giorni fa" },
): string {
  const date = new Date(epochMs);
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return copy.today;
  if (days === 1) return copy.yesterday;
  if (days < 7) return copy.daysAgo.replace("{days}", String(days));
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}
