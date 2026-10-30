/** G1a-WP-02 (D-G1a-02): l'indirizzo che apre la ricerca del forno nel
 *  Profilo, già compilata con `query`. Non sceglie niente: il forno salvato
 *  cambia solo con un tocco o Invio (T10). Senza testo (FW-10, «Cambia forno»
 *  dalle card di Scopri) la ricerca si apre vuota, con il fuoco nel campo. */
export const OVEN_QUERY_PARAM = "ovenQuery";

export function ovenSetupLink(query = ""): string {
  return `/profile?tab=setup&${OVEN_QUERY_PARAM}=${encodeURIComponent(query)}`;
}
