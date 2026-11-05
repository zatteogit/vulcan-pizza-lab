/* Vetrina di Scopri (primo piano + anteprime di «Tutto»): mostra solo ciò che
 * la tua cucina permette. Le voci non fattibili restano nelle viste complete
 * («Tutte le ricette», «Tutti gli stili»), non in vetrina. Solo se nella lista
 * non c'è nulla di fattibile la vetrina le usa, per non restare vuota. */

export interface ShowcaseEntry<T> {
  item: T;
  blocked: boolean;
}

/** Anteprima: fino a `limit` voci fattibili, nell'ordine dato, senza `exclude`
 *  (la ricetta già in primo piano). Può restituirne meno di `limit`, anche zero. */
export function showcasePreview<T>(ranked: readonly ShowcaseEntry<T>[], limit: number, exclude?: T): T[] {
  const anyFeasible = ranked.some((entry) => !entry.blocked);
  return ranked
    .filter((entry) => entry.item !== exclude && (!anyFeasible || !entry.blocked))
    .slice(0, limit)
    .map((entry) => entry.item);
}
