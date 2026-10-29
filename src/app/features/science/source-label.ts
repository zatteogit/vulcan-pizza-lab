/* ═══ Revisione ondata 2 — Etichetta di una fonte nella lingua attiva ═══
 * Il titolo bibliografico resta nella lingua originale; la nota descrittiva
 * («scheda del produttore», «letto solo l'abstract», «non pubblico») arriva
 * dal CMS (`science.sourceNotes.<noteKey>`). Una fonte senza titolo (es.
 * rivenditori e recensioni dei forni) è la sola nota. Usata dal «Perché?» e
 * dalla pagina «Metodo e fonti». Pura: niente React. */

import type { SourceRef } from "../../domain/science/types";

export function sourceLabel(source: SourceRef, notes: Readonly<Record<string, string>> | undefined): string {
  const note = source.noteKey ? notes?.[source.noteKey]?.trim() : undefined;
  if (source.title && note) return `${source.title} — ${note}`;
  if (source.title) return source.title;
  if (note) return note.charAt(0).toLocaleUpperCase() + note.slice(1);
  return source.id;
}

/** Formula della nota nella lingua attiva; quella in simboli del registro è
 *  la riserva (per un pacchetto di lingua vecchio senza la chiave). */
export function localizedFormula(
  noteId: string,
  registryFormula: string | undefined,
  formulas: Readonly<Record<string, string>> | undefined,
): string | undefined {
  if (!registryFormula) return undefined;
  return formulas?.[noteId]?.trim() || registryFormula;
}
