/* ═══ SAVED RECIPES — Ricettario personale (audit UX giugno 2026) ═══
 * Una ricetta generata e personalizzata non deve perdersi al reset:
 * questo store la serializza in localStorage così l'utente può rifare
 * "quella di sabato scorso" con un tocco dalla home.
 *
 * Persistenza volutamente minimale: salviamo i PARAMETRI, non il risultato.
 * Al load la ricetta viene rigenerata dal motore — così beneficia sempre
 * di eventuali fix/ricalibrazioni successive del motore stesso.
 */

import type { PanConfig } from "../domain/pizza-engine";

const STORAGE_KEY = "vulcan_saved_recipes";
const MAX_SAVED = 30;

export interface SavedRecipeParams {
  hydration: number;
  flourW: number;
  flourPL: number;
  fermentHours: number;
  fermentTemp: number;
  usePreFerment: boolean;
  doughBalls: number;
  panConfig?: PanConfig;
  selectedFlourId?: string | null;
  selectedToppingConcept?: string | null;
}

export interface SavedRecipe {
  id: string;
  createdAt: number; // epoch ms
  styleId: string;
  styleName: string;
  versionId: string | null;
  params: SavedRecipeParams;
  /** Score composito al momento del salvataggio (solo display). */
  score?: number;
}

function safeLoad(): SavedRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is SavedRecipe =>
        r && typeof r.id === "string" && typeof r.styleId === "string" && r.params,
    );
  } catch {
    return [];
  }
}

function safeStore(recipes: SavedRecipe[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes.slice(0, MAX_SAVED)));
  } catch {
    /* storage pieno o negato: non bloccante */
  }
}

/** Chiave identità: stesso stile + stessi parametri = stessa ricetta. */
function recipeKey(styleId: string, p: SavedRecipeParams): string {
  return [
    styleId,
    p.hydration,
    p.flourW,
    p.flourPL,
    p.fermentHours,
    p.fermentTemp,
    p.usePreFerment ? 1 : 0,
    p.doughBalls,
    p.selectedToppingConcept ?? "",
  ].join("|");
}

export function loadSavedRecipes(): SavedRecipe[] {
  return safeLoad().sort((a, b) => b.createdAt - a.createdAt);
}

export function findSavedRecipe(
  styleId: string,
  params: SavedRecipeParams,
): SavedRecipe | undefined {
  const key = recipeKey(styleId, params);
  return safeLoad().find((r) => recipeKey(r.styleId, r.params) === key);
}

/** Salva (o aggiorna) una ricetta. Ritorna la lista aggiornata. */
export function saveRecipe(recipe: Omit<SavedRecipe, "id" | "createdAt">): SavedRecipe[] {
  const all = safeLoad();
  const key = recipeKey(recipe.styleId, recipe.params);
  const withoutDup = all.filter((r) => recipeKey(r.styleId, r.params) !== key);
  const entry: SavedRecipe = {
    ...recipe,
    id: `sr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  const next = [entry, ...withoutDup];
  safeStore(next);
  return next;
}

/** Rimuove per id. Ritorna la lista aggiornata. */
export function removeRecipe(id: string): SavedRecipe[] {
  const next = safeLoad().filter((r) => r.id !== id);
  safeStore(next);
  return next;
}

/* ═══ PREFERITI (stili canonici) — feedback giugno 2026 ═══
 * Distinzione netta: il CUORE marca uno stile/ricetta canonica che ami
 * (dal pannello di anteprima, prima di adattarla); il SEGNALIBRO salva
 * la TUA versione su misura (dalla scheda ricetta, coi tuoi parametri). */

const FAV_KEY = "vulcan_fav_styles";

export function loadFavoriteStyles(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteStyle(styleId: string): string[] {
  const all = loadFavoriteStyles();
  const next = all.includes(styleId)
    ? all.filter((id) => id !== styleId)
    : [...all, styleId];
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  } catch {
    /* ignora */
  }
  return next;
}

export function isFavoriteStyle(styleId: string): boolean {
  return loadFavoriteStyles().includes(styleId);
}

/** Etichetta data relativa breve, in italiano: "oggi", "ieri", "3 giorni fa", "12 mag". */
export function formatSavedDate(epochMs: number, now: Date = new Date()): string {
  const d = new Date(epochMs);
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return "oggi";
  if (days === 1) return "ieri";
  if (days < 7) return `${days} giorni fa`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}
