/* ═══ FW-09 (S04-A-02, S04-B-04, S04-B-05, S13-A-09): parole dell'utente ═══
 * Funzioni pure e leggere (nessun dato), condivise dalla ricerca globale e
 * dalle ricerche di pagina (Problemi e soluzioni).
 * Chi cerca scrive come parla («lievito di birra», «pizza bruciata»), in
 * fretta («napoletna») o con un'altra forma della parola («bruciata» per
 * «bruciato»). Tre aiuti, in quest'ordine:
 *  1. dizionario per lingua nel CMS: parole vuote («di», «la») e gruppi di
 *     sinonimi («celiachia» = «senza glutine»);
 *  2. flessioni: dalle 5 lettere in su conta anche la parola senza l'ultima
 *     vocale («bruciat» trova «bruciato» e «bruciata»);
 *  3. solo se non c'è nessun risultato, refusi: distanza di modifica 1 sulle
 *     parole dei testi (2 quando la parola è più lunga di 8 lettere). */

export const MIN_QUERY_LENGTH = 2;

/** Minuscole e senza accenti latini. Lascia stare i segni giapponesi
 *  (dakuten), che cambiano la parola. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function queryTokens(query: string): string[] {
  const folded = fold(query.trim());
  if (folded.length < MIN_QUERY_LENGTH) return [];
  return folded.split(/\s+/).filter(Boolean);
}

/** Una sola lettera: non si ignora in silenzio (S04-A-10). */
export function isShortQuery(query: string): boolean {
  const folded = fold(query.trim());
  return folded.length > 0 && folded.length < MIN_QUERY_LENGTH;
}

export interface SearchLexicon {
  stopwords: ReadonlySet<string>;
  /** Gruppi di espressioni equivalenti, già normalizzate. */
  synonyms: readonly (readonly string[])[];
}

export const EMPTY_LEXICON: SearchLexicon = { stopwords: new Set(), synonyms: [] };

/** Dal CMS: parole vuote separate da spazi; un gruppo di sinonimi per riga,
 *  espressioni separate da «;». */
export function searchLexicon(source: { searchStopwords?: string; searchSynonyms?: string }): SearchLexicon {
  return {
    stopwords: new Set(fold(source.searchStopwords ?? "").split(/\s+/).filter(Boolean)),
    synonyms: fold(source.searchSynonyms ?? "")
      .split("\n")
      .map((line) => line.split(";").map((part) => part.trim().replace(/\s+/g, " ")).filter(Boolean))
      .filter((group) => group.length > 1),
  };
}

const VOWEL_END = /[aeiou]$/;
const MAX_VARIANTS = 12;
const WORD_SPLIT = /[^\p{L}\p{N}]+/u;

function contentTokens(variant: string, lexicon: SearchLexicon): string[] {
  const tokens = queryTokens(variant);
  const kept = tokens.filter((token) => !lexicon.stopwords.has(token));
  return kept.length > 0 ? kept : tokens;
}

/** Le parole da cercare: la ricerca e le sue riscritture coi sinonimi
 *  (frase intera), senza parole vuote. Una lista per variante. */
export function queryVariants(query: string, lexicon: SearchLexicon = EMPTY_LEXICON): string[][] {
  const base = ` ${queryTokens(query).join(" ")} `;
  if (base.trim() === "") return [];
  const variants = [base];
  for (const group of lexicon.synonyms) {
    for (const phrase of group) {
      for (const current of [...variants]) {
        if (!current.includes(` ${phrase} `)) continue;
        for (const alternative of group) {
          if (alternative === phrase || variants.length >= MAX_VARIANTS) continue;
          const next = current.replace(` ${phrase} `, ` ${alternative} `);
          if (!variants.includes(next)) variants.push(next);
        }
      }
    }
  }
  return variants.map((variant) => contentTokens(variant, lexicon));
}

/** La parola c'è nel testo (già normalizzato), anche con un'altra vocale finale. */
export function tokenMatches(haystack: string, token: string): boolean {
  if (haystack.includes(token)) return true;
  return token.length >= 5 && VOWEL_END.test(token) && haystack.includes(token.slice(0, -1));
}

/** Distanza di Damerau-Levenshtein (trasposizioni adiacenti) con uscita
 *  anticipata oltre `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) rows.push([i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, rows[i - 2][j - 2] + 1);
      rows[i][j] = d;
      best = Math.min(best, d);
    }
    if (best > max) return max + 1;
  }
  return rows[a.length][b.length];
}

/** Parole distinte di un testo normalizzato. */
export function textWords(haystack: string): string[] {
  return [...new Set(haystack.split(WORD_SPLIT).filter(Boolean))];
}

/** Un refuso: una parola del testo a distanza 1 (2 oltre le 8 lettere). */
export function fuzzyMatches(words: readonly string[], token: string): boolean {
  if (token.length < 5) return false;
  return words.some((word) => {
    if (word.length < 4) return false;
    const max = Math.max(word.length, token.length) > 8 ? 2 : 1;
    return editDistance(token, word, max) <= max;
  });
}

/** Ricerca su testi liberi: prima esatta (con sinonimi e flessioni), poi,
 *  se non trova nulla, tollerando un refuso. */
export function filterByQuery<T>(
  items: readonly T[],
  textOf: (item: T) => string,
  query: string,
  lexicon: SearchLexicon = EMPTY_LEXICON,
): T[] {
  const variants = queryVariants(query, lexicon);
  if (variants.length === 0) return [...items];
  const texts = items.map((item) => fold(textOf(item)));
  const exact = items.filter((_, i) => variants.some((tokens) => tokens.every((t) => tokenMatches(texts[i], t))));
  if (exact.length > 0) return exact;
  return items.filter((_, i) => {
    const words = textWords(texts[i]);
    return variants.some((tokens) => tokens.every((t) => tokenMatches(texts[i], t) || fuzzyMatches(words, t)));
  });
}
