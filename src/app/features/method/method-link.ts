/* ═══ FW-15 (D-D) — Indirizzi della pagina «Metodo e fonti» ═══
 * Un'ancora per nota (l'id della nota del registro), più le sezioni fisse.
 * Informazioni, Profilo, Impara e ogni ScienceSheet (L3) linkano da qui:
 * la pagina resta nel suo chunk, questo modulo è solo testo. */

export const METHOD_PATH = "/learn/metodo";

/** Ancore delle sezioni fisse della pagina. */
export const METHOD_ANCHORS = {
  how: "come-lavora",
  notes: "modelli",
  assumptions: "ipotesi",
  sources: "fonti",
  limits: "limiti",
  version: "versione",
} as const;

/** Link alla nota del registro (`#yeast-dose`). */
export function methodNoteHref(noteId: string): string {
  return `${METHOD_PATH}#${noteId}`;
}

/** Link a una sezione fissa della pagina. */
export function methodSectionHref(section: keyof typeof METHOD_ANCHORS): string {
  return `${METHOD_PATH}#${METHOD_ANCHORS[section]}`;
}

/** Ancora di una fonte nell'elenco (`#fonte-avpn-2024`). */
export function methodSourceAnchor(sourceId: string): string {
  return `fonte-${sourceId}`;
}

/** Link a una fonte nell'elenco. */
export function methodSourceHref(sourceId: string): string {
  return `${METHOD_PATH}#${methodSourceAnchor(sourceId)}`;
}
