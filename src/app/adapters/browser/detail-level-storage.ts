/* FW-08 (D-C): livello di dettaglio globale, «Mostra i dettagli tecnici»
   (soprannome PizzaNerd). È l'unico modulo che legge e scrive la chiave
   `vulcan_nerd_on`: profilo, Crea, scheda ricetta, Scopri e pannello stile
   passano tutti da qui (hooks/use-detail-level.ts). Decide solo che cosa si
   apre di default; il «Perché?» resta per tutti. */

export type DetailLevel = "essential" | "technical";

export const DETAIL_LEVEL_STORAGE_KEY = "vulcan_nerd_on";
/** Chiave storica (prima di PizzaNerd): «nerd» valeva come acceso. */
const LEGACY_VIEW_MODE_KEY = "vulcan_view_mode";
/** Evento nella stessa scheda: `storage` arriva solo alle altre schede. */
export const DETAIL_LEVEL_EVENT = "vulcan:detail-level";

export function loadDetailLevel(): DetailLevel {
  try {
    if (localStorage.getItem(DETAIL_LEVEL_STORAGE_KEY) === "true") return "technical";
    if (localStorage.getItem(LEGACY_VIEW_MODE_KEY) === "nerd") return "technical";
  } catch {
    /* storage bloccato (navigazione privata): vale il livello essenziale */
  }
  return "essential";
}

export function saveDetailLevel(level: DetailLevel): void {
  try {
    localStorage.setItem(DETAIL_LEVEL_STORAGE_KEY, String(level === "technical"));
    localStorage.removeItem(LEGACY_VIEW_MODE_KEY);
  } catch {
    /* storage non disponibile: la scelta vale per questa sessione */
  }
  try {
    window.dispatchEvent(new CustomEvent(DETAIL_LEVEL_EVENT, { detail: level }));
  } catch {
    /* ambiente senza window (test, SSR) */
  }
}

/** Ascolta i cambi del livello, in questa scheda e nelle altre. */
export function subscribeDetailLevel(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === DETAIL_LEVEL_STORAGE_KEY || event.key === LEGACY_VIEW_MODE_KEY) onChange();
  };
  window.addEventListener(DETAIL_LEVEL_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DETAIL_LEVEL_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
