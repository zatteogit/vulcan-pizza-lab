import type { ScienceNote } from "./types";

/* ═══ FW-01 — Precisione dichiarata ═══
 * Una stima non mostra più cifre di quante ne regge la sua incertezza
 * (S06-A-06/B-08: l'Aw «0,945» e il Q10 a tre decimali sembravano misure).
 * Per i valori esatti, o senza incertezza dichiarata, il valore resta com'è. */

/** Decimali massimi mostrabili per una nota (undefined = nessun limite). */
export function evidenceDecimals(note: Pick<ScienceNote, "uncertainty"> | undefined): number | undefined {
  return note?.uncertainty?.displayDecimals;
}

/** Arrotonda un valore ai decimali che la nota consente. Puro, senza formattazione. */
export function roundForEvidence(value: number, note: Pick<ScienceNote, "uncertainty"> | undefined): number {
  const decimals = evidenceDecimals(note);
  if (decimals === undefined || !Number.isFinite(value)) return value;
  const digits = Math.max(0, Math.floor(decimals));
  // Spostamento decimale sulla stringa: 0,945 × 100 in binario dà 94,4999…
  // e arrotonderebbe per difetto un valore che si legge «a metà».
  const shifted = Number(`${value}e${digits}`);
  if (!Number.isFinite(shifted)) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }
  return Number(`${Math.round(shifted)}e-${digits}`);
}
