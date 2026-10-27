/* Pure saved-recipe collection rules. Browser persistence lives in adapters/. */

import type { OvenType, PanConfig, PreFermentChoice } from "../domain/pizza-engine";

/** U-1: prima 30, e oltre si perdevano in silenzio le più vecchie. Una voce
 *  pesa circa 400 byte: 200 voci stanno larghe in localStorage. */
export const MAX_SAVED_RECIPES = 200;

export interface SavedRecipeParams {
  hydration: number;
  hydrationBase?: number;
  salt?: number;
  interpretationId?: string | null;
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
  name?: string;
  versionId: string | null;
  params: SavedRecipeParams;
  score?: number;
}

export const MAX_RECIPE_NAME_LENGTH = 80;
/** Source identity is independent of the custom name and tailored values. */
export function recipeSourceUrl(styleId: string, versionId: string | null, interpretationId?: string | null): string {
  const params = new URLSearchParams({ mode: "canonical", tab: "ricetta" });
  if (versionId) params.set("v", versionId);
  if (interpretationId) params.set("interpretation", interpretationId);
  return `/recipe/${encodeURIComponent(styleId)}?${params}`;
}

export function normalizeRecipeName(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_RECIPE_NAME_LENGTH).trim() || undefined;
}

export function renameSavedRecipeIn(recipes: readonly SavedRecipe[], id: string, name: string): SavedRecipe[] {
  return recipes.map(recipe => recipe.id === id ? { ...recipe, name: normalizeRecipeName(name) } : recipe);
}

export function savedRecipeKey(styleId: string, params: SavedRecipeParams): string {
  return [
    styleId,
    params.hydration,
    params.hydrationBase ?? "",
    params.salt ?? "",
    params.interpretationId ?? "",
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
