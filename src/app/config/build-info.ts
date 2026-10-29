/* ═══ FW-15 (S01-B-01) — Versione della build ═══
 * Data (ISO «YYYY-MM-DD») e commit breve, iniettati da vite.config.ts. Nei test
 * e negli script la costante non esiste: valori vuoti, e la UI non mostra nulla. */

declare const __VULCAN_BUILD__: { date: string; commit: string } | undefined;

export const BUILD_INFO: { date: string; commit: string } =
  typeof __VULCAN_BUILD__ !== "undefined" ? __VULCAN_BUILD__ : { date: "", commit: "" };
