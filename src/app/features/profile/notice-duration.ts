/* ═══ G5-WP-05 (S17-B-12): quanto resta a schermo un avviso del ricettario ═══
 * 4 s bastavano per «Link copiato», non per un errore d'importazione o per il
 * link da copiare a mano. Si legge a circa 60 ms a carattere, tra 4 e 12 s;
 * una rimozione con «Annulla» resta 6 s. */
export const NOTICE_MIN_MS = 4000;
export const NOTICE_MAX_MS = 12000;
export const NOTICE_UNDO_MS = 6000;
const MS_PER_CHAR = 60;

export function noticeDurationMs(text: string, kind: "removed" | "message"): number {
  if (kind === "removed") return NOTICE_UNDO_MS;
  return Math.min(NOTICE_MAX_MS, Math.max(NOTICE_MIN_MS, MS_PER_CHAR * text.length));
}
