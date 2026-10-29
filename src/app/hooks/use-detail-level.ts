/* FW-08 (D-C): stato unico «Mostra i dettagli tecnici» (PizzaNerd).
 *
 * Effetti dichiarati di 'technical', e solo questi:
 * - scheda ricetta e Crea: percentuali del panettiere, griglia «Scienza»,
 *   guida al prefermento, consigli tecnici e compensazioni nel Procedimento,
 *   pesi della compatibilità;
 * - parametri avanzati: P/L modificabile;
 * - pannello stile: dettagli tecnici aperti;
 * - Scopri: riga tecnica sulle card degli stili;
 * - ScienceSheet (FW-02): si apre sul livello «Perché» (initialLevel).
 * Il «Perché?» resta per tutti, a qualsiasi livello. */

import { useCallback, useSyncExternalStore } from "react";
import {
  loadDetailLevel,
  saveDetailLevel,
  subscribeDetailLevel,
  type DetailLevel,
} from "../adapters/browser/detail-level-storage";

export type { DetailLevel };

export function useDetailLevel(): {
  level: DetailLevel;
  setLevel: (level: DetailLevel) => void;
} {
  const level = useSyncExternalStore(subscribeDetailLevel, loadDetailLevel, () => "essential" as const);
  const setLevel = useCallback((next: DetailLevel) => saveDetailLevel(next), []);
  return { level, setLevel };
}
