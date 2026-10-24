/* Pure saved-recipe collection rules. Browser persistence lives in adapters/. */

import type { OvenType, PanConfig, PreFermentChoice } from "../domain/pizza-engine";

/** U-1: prima 30, e oltre si perdevano in silenzio le più vecchie. Una voce
 *  pesa circa 400 byte: 200 voci stanno larghe in localStorage. */
export const MAX_SAVED_RECIPES = 200;

export interface SavedRecipeParams {
  hydration: number;
  flourW: number;
  flourPL: number;
  fermentHours: number;
  fermentTemp: number;
  usePreFerment: boolean;
  /** D-043 — biga o poolish e quota di farina scelti. */
  preFerment?: PreFermentChoice;
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
    params.preFerment?.type ?? "",
    params.preFerment?.flourPct ?? "",
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
  const others = recipes.filter((item) => savedRecipeKey(item.styleId, item.params) !== key);
  // U-1: a ricettario pieno una ricetta nuova non entra, ma nessuna voce
  // esistente viene tolta per farle posto.
  if (others.length >= MAX_SAVED_RECIPES) return [...recipes];
  return [{ ...recipe, ...identity }, ...others];
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

/** Data relativa nella lingua attiva («oggi», «yesterday», «vor 3 Tagen»)
 *  tramite Intl: prima «oggi/ieri» restavano in italiano in tutte le lingue. */
export function formatSavedDate(
  epochMs: number,
  now: Date = new Date(),
  locale = "it-IT",
): string {
  const date = new Date(epochMs);
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.max(0, Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000));
  if (days < 7) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-days, "day");
  }
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}
