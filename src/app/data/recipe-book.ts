/* ═══ RICETTARIO PORTABILE — U-1 «ricette che non si perdono» ═══
 *
 * Regole pure (nessun browser) per tre cose:
 *   1. leggere il ricettario salvato senza buttare via nulla: un JSON rotto o
 *      una voce illeggibile si mettono da parte, non si sovrascrivono;
 *   2. esportarlo in un file versionato e reimportarlo;
 *   3. unire un file importato al ricettario esistente senza duplicati.
 *
 * Il formato del file ha un identificativo tecnico («vulcan-recipe-book»): come
 * le chiavi localStorage vulcan_*, non segue il nome del prodotto
 * (docs/brand/nome-prodotto.md). */

import {
  MAX_SAVED_RECIPES,
  savedRecipeKey,
  sortSavedRecipes,
  type SavedRecipe,
} from "./saved-recipes";

export const RECIPE_BOOK_FORMAT = "vulcan-recipe-book";
/** Versione del formato del file. Una versione più nuova non si importa: si
 *  chiede di aggiornare l'app invece di perdere campi che non conosciamo. */
export const RECIPE_BOOK_VERSION = 1;

export interface RecipeBook {
  format: typeof RECIPE_BOOK_FORMAT;
  version: number;
  exportedAt: number;
  recipes: SavedRecipe[];
  favorites: string[];
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Una voce è leggibile se ha identità e i parametri che servono a rigenerare
 *  la ricetta. I campi facoltativi non si controllano: si conservano. */
export function isSavedRecipe(value: unknown): value is SavedRecipe {
  if (!value || typeof value !== "object") return false;
  const recipe = value as Partial<SavedRecipe>;
  const params = recipe.params as Partial<SavedRecipe["params"]> | undefined;
  return (
    typeof recipe.id === "string" &&
    typeof recipe.styleId === "string" &&
    isFiniteNumber(recipe.createdAt) &&
    !!params &&
    typeof params === "object" &&
    isFiniteNumber(params.hydration) &&
    isFiniteNumber(params.flourW) &&
    isFiniteNumber(params.flourPL) &&
    isFiniteNumber(params.fermentHours) &&
    isFiniteNumber(params.fermentTemp) &&
    isFiniteNumber(params.doughBalls) &&
    typeof params.usePreFerment === "boolean"
  );
}

export interface StoredRecipesRead {
  recipes: SavedRecipe[];
  /** Voci presenti ma illeggibili: vanno messe da parte, non perse. */
  rejected: unknown[];
  /** Il contenuto non è un JSON valido o non è un elenco. */
  corrupt: boolean;
}

/** Legge il valore grezzo di localStorage. `null` (mai salvato) non è corrotto. */
export function parseStoredRecipes(raw: string | null): StoredRecipesRead {
  if (raw === null || raw === "") return { recipes: [], rejected: [], corrupt: false };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { recipes: [], rejected: [], corrupt: true };
  }
  if (!Array.isArray(parsed)) return { recipes: [], rejected: [], corrupt: true };
  const recipes: SavedRecipe[] = [];
  const rejected: unknown[] = [];
  for (const item of parsed) (isSavedRecipe(item) ? recipes : rejected).push(item);
  return { recipes, rejected, corrupt: false };
}

export function serializeRecipeBook(
  recipes: readonly SavedRecipe[],
  favorites: readonly string[],
  exportedAt: number,
): string {
  const book: RecipeBook = {
    format: RECIPE_BOOK_FORMAT,
    version: RECIPE_BOOK_VERSION,
    exportedAt,
    recipes: sortSavedRecipes(recipes),
    favorites: [...favorites],
  };
  return JSON.stringify(book, null, 2);
}

export type RecipeBookParse =
  | { ok: true; recipes: SavedRecipe[]; favorites: string[]; rejected: number }
  | { ok: false; error: "not_json" | "wrong_format" | "newer_version" };

/** Accetta il file esportato e, per recupero, anche un elenco nudo di ricette
 *  (il contenuto di localStorage copiato a mano). */
export function parseRecipeBook(text: string): RecipeBookParse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "not_json" };
  }
  let items: unknown[];
  let favorites: string[] = [];
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    (parsed as RecipeBook).format === RECIPE_BOOK_FORMAT &&
    Array.isArray((parsed as RecipeBook).recipes)
  ) {
    const book = parsed as RecipeBook;
    if (!isFiniteNumber(book.version) || book.version > RECIPE_BOOK_VERSION) {
      return { ok: false, error: "newer_version" };
    }
    items = book.recipes;
    favorites = Array.isArray(book.favorites)
      ? book.favorites.filter((id): id is string => typeof id === "string")
      : [];
  } else {
    return { ok: false, error: "wrong_format" };
  }
  const recipes = items.filter(isSavedRecipe);
  return { ok: true, recipes, favorites, rejected: items.length - recipes.length };
}

export interface RecipeBookMerge {
  recipes: SavedRecipe[];
  added: number;
  /** Già presenti con gli stessi parametri: si tiene la più recente. */
  duplicates: number;
  /** Non entrate perché il ricettario è pieno. */
  skipped: number;
}

/** Unisce le ricette importate a quelle salvate. L'identità è quella del
 *  salvataggio (stile + parametri): nessun doppione, nessuna voce sovrascritta
 *  da una più vecchia, nessuna voce esistente eliminata. */
export function mergeRecipeBooks(
  existing: readonly SavedRecipe[],
  incoming: readonly SavedRecipe[],
  max = MAX_SAVED_RECIPES,
): RecipeBookMerge {
  const byKey = new Map<string, SavedRecipe>();
  for (const recipe of existing) byKey.set(savedRecipeKey(recipe.styleId, recipe.params), recipe);
  const ids = new Set(existing.map((recipe) => recipe.id));
  let added = 0;
  let duplicates = 0;
  let skipped = 0;
  for (const recipe of sortSavedRecipes(incoming)) {
    const key = savedRecipeKey(recipe.styleId, recipe.params);
    const current = byKey.get(key);
    if (current) {
      duplicates += 1;
      if (recipe.createdAt > current.createdAt) byKey.set(key, { ...recipe, id: current.id });
      continue;
    }
    if (byKey.size >= max) {
      skipped += 1;
      continue;
    }
    const id = ids.has(recipe.id) ? `${recipe.id}_${added}` : recipe.id;
    ids.add(id);
    byKey.set(key, { ...recipe, id });
    added += 1;
  }
  return { recipes: sortSavedRecipes([...byKey.values()]), added, duplicates, skipped };
}
