/* ═══ D-060 — forza della farina come intervallo ═══
 * Il motore calcola su una W puntuale (di solito il centro dell'intervallo
 * dello stile, per esempio 285 su 260–310), ma le farine si comprano per
 * fascia e l'etichetta stessa ha una tolleranza di ±20 circa: «W285» promette
 * una precisione che non c'è. Si mostra l'intervallo dello stile quando la W
 * ci sta dentro, altrimenti la W arrotondata alla decina. */

/** Testo della W senza la lettera: «260–310» oppure «290». */
export function flourWText(w: number, styleRange?: readonly [number, number]): string {
  if (styleRange && styleRange[0] < styleRange[1] && w >= styleRange[0] && w <= styleRange[1]) {
    return `${styleRange[0]}–${styleRange[1]}`;
  }
  return String(Math.round(w / 10) * 10);
}
