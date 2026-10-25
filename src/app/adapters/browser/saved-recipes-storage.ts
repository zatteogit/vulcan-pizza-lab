/* Browser adapter for the pure saved-recipe collection rules.
 *
 * U-1 «ricette che non si perdono»:
 *   · ogni scrittura riuscita si copia in RECIPES_BACKUP_KEY;
 *   · un valore illeggibile non si sovrascrive mai: si legge la copia di
 *     sicurezza e il grezzo resta in RECIPES_QUARANTINE_KEY, recuperabile
 *     importandolo dal profilo;
 *   · ogni scrittura dice se è riuscita (storage pieno o bloccato). */

import {
  findSavedRecipeIn,
  removeSavedRecipeFrom,
  renameSavedRecipeIn,
  sortSavedRecipes,
  toggleFavoriteStyleIn,
  upsertSavedRecipe,
  type SavedRecipe,
  type SavedRecipeParams,
} from "../../data/saved-recipes";
import {
  mergeRecipeBooks,
  parseRecipeBook,
  parseStoredRecipes,
  serializeRecipeBook,
  type RecipeBookMerge,
} from "../../data/recipe-book";

export type { SavedRecipe, SavedRecipeParams } from "../../data/saved-recipes";
export { formatSavedDate } from "../../data/saved-recipes";

const RECIPES_KEY = "vulcan_saved_recipes";
const RECIPES_BACKUP_KEY = "vulcan_saved_recipes_backup";
const RECIPES_QUARANTINE_KEY = "vulcan_saved_recipes_quarantine";
const FAVORITES_KEY = "vulcan_fav_styles";

function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    // Storage pieno o non disponibile: il chiamante lo dice all'utente.
    return false;
  }
}

/** Mette da parte un contenuto illeggibile senza perdere quanto già in quarantena. */
function quarantine(entry: unknown): void {
  let previous: unknown[] = [];
  try {
    const parsed: unknown = JSON.parse(getItem(RECIPES_QUARANTINE_KEY) ?? "[]");
    if (Array.isArray(parsed)) previous = parsed;
  } catch {
    /* quarantena illeggibile: si ricomincia, il grezzo nuovo è più utile */
  }
  setItem(RECIPES_QUARANTINE_KEY, JSON.stringify([...previous, { at: Date.now(), entry }]));
}

function readRecipes(): SavedRecipe[] {
  const raw = getItem(RECIPES_KEY);
  const read = parseStoredRecipes(raw);
  if (read.corrupt) {
    quarantine(raw);
    const backup = parseStoredRecipes(getItem(RECIPES_BACKUP_KEY));
    // Il principale torna leggibile dalla copia: la prossima scrittura non
    // ripartirà da un elenco vuoto.
    if (!backup.corrupt) setItem(RECIPES_KEY, JSON.stringify(backup.recipes));
    return backup.recipes;
  }
  if (read.rejected.length > 0) {
    for (const entry of read.rejected) quarantine(entry);
    setItem(RECIPES_KEY, JSON.stringify(read.recipes));
  }
  return read.recipes;
}

/** Scrive il ricettario e, solo se la scrittura riesce, la sua copia di
 *  sicurezza identica: se il principale si rovina, la copia ha tutto. */
function writeRecipes(next: readonly SavedRecipe[]): boolean {
  const value = JSON.stringify(next);
  if (!setItem(RECIPES_KEY, value)) return false;
  setItem(RECIPES_BACKUP_KEY, value);
  return true;
}

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
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
  return writeRecipes(next) ? next : readRecipes();
}

export function removeRecipe(id: string): SavedRecipe[] {
  const next = removeSavedRecipeFrom(readRecipes(), id);
  return writeRecipes(next) ? next : readRecipes();
}

export function renameSavedRecipe(id: string, name: string): boolean {
  const recipes = readRecipes();
  return recipes.some(recipe => recipe.id === id) && writeRecipes(renameSavedRecipeIn(recipes, id, name));
}

/** Rimette una ricetta appena tolta (azione «Annulla»). */
export function restoreRecipe(recipe: SavedRecipe): SavedRecipe[] {
  const { recipes } = mergeRecipeBooks(readRecipes(), [recipe]);
  return writeRecipes(recipes) ? recipes : readRecipes();
}

export function loadFavoriteStyles(): string[] {
  return readFavorites();
}

export function toggleFavoriteStyle(styleId: string): string[] {
  const next = toggleFavoriteStyleIn(readFavorites(), styleId);
  setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function isFavoriteStyle(styleId: string): boolean {
  return readFavorites().includes(styleId);
}

/* ═══ Esportazione e importazione (U-1) ═══ */

/** Il ricettario completo come testo del file da scaricare. */
export function exportRecipeBook(now = Date.now()): string {
  return serializeRecipeBook(readRecipes(), readFavorites(), now);
}

export type ImportRecipeBookResult =
  | (RecipeBookMerge & { ok: true; rejected: number })
  | { ok: false; error: "not_json" | "wrong_format" | "newer_version" | "storage" };

export function importRecipeBook(text: string): ImportRecipeBookResult {
  const parsed = parseRecipeBook(text);
  if (!parsed.ok) return parsed;
  const merge = mergeRecipeBooks(readRecipes(), parsed.recipes);
  if (!writeRecipes(merge.recipes)) return { ok: false, error: "storage" };
  const favorites = [...new Set([...readFavorites(), ...parsed.favorites])];
  setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return { ok: true, ...merge, rejected: parsed.rejected };
}
