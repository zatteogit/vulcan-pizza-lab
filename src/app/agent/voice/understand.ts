/* ═══ Voce — dalla frase detta all'intento ═══
 * Testo parlato (dettatura di Siri, slot di Alexa) → che cosa chiede la
 * persona: consiglio, ricetta, glossario, aiuto. Riconosce stili e termini
 * con sinonimi e piccole storpiature, numeri in lettere («quattro panetti»,
 * «ventiquattro ore»), forno per tipo o per marca. Nessun numero della
 * ricetta nasce qui: questo modulo prepara solo gli input dei tool MCP. */

import { MAX_DOUGH_BALLS, STYLES_DB, type OvenType } from "../../domain/pizza-engine";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { searchOvenModels } from "../../data/oven-models";
import type { VoiceCatalog } from "./catalog";

export type VoiceIntent = "recommend" | "recipe" | "glossary" | "help" | "fallback";

export interface VoiceKitchen {
  ovenType?: OvenType;
  /** Testo per oven_model del tool MCP («ooni koda 16»). */
  ovenModel?: string;
  ovenMaxTempC?: number;
}

export interface VoiceQuery {
  intent: VoiceIntent;
  styleId?: string;
  balls?: number;
  hours?: number;
  kitchen: VoiceKitchen;
  termId?: string;
  /** Il glossario è stato chiesto ma il termine non è riconosciuto. */
  termUnknown?: boolean;
}

/** Minuscolo, senza accenti, apostrofi e punteggiatura, spazi singoli. */
export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/(\d)[.,](\d)/g, "$1#$2")
    .replace(/[^a-z0-9#\s]/g, " ")
    .replace(/#/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Numeri in lettere ── */

const TENS_STEMS: [string, number][] = [
  ["novant", 90], ["ottant", 80], ["settant", 70], ["sessant", 60], ["cinquant", 50], ["quarant", 40], ["trent", 30], ["vent", 20],
];

/** «ventiquattro» → 24, «duecentocinquanta» → 250; null se non è un numero. */
export function wordToNumber(word: string, catalog: VoiceCatalog): number | null {
  if (/^\d+(\.\d+)?$/.test(word)) return Number(word);
  const direct = catalog.numberWords[word];
  if (direct !== undefined) return direct;
  let rest = word;
  let total = 0;
  const hundreds = ["cinquecento", "quattrocento", "trecento", "duecento", "cento"].find((h) => rest.startsWith(h));
  if (hundreds) {
    total += catalog.numberWords[hundreds];
    rest = rest.slice(hundreds.length);
    if (!rest) return total;
  }
  const tens = TENS_STEMS.find(([stem]) => rest.startsWith(stem));
  if (tens) {
    total += tens[1];
    rest = rest.slice(tens[0].length).replace(/^[ai]/, "");
    if (!rest) return total;
    // «ventuno», «trentotto»: la vocale cade davanti a uno e otto.
    if (rest === "uno" || rest === "un") return total + 1;
    if (rest === "otto") return total + 8;
  }
  const unit = catalog.numberWords[rest];
  if (unit !== undefined && unit < 20 && (hundreds || tens)) return total + unit;
  return null;
}

/** Sostituisce i numeri in lettere con cifre, tranne l'articolo «un/una/uno». */
function digitize(text: string, catalog: VoiceCatalog): string {
  return text
    .split(" ")
    .map((word) => {
      if (word === "un" || word === "una" || word === "uno" || word === "paio" || word === "dozzina") return word;
      const n = wordToNumber(word, catalog);
      return n === null ? word : String(n);
    })
    .join(" ")
    .replace(/\b(?:un|una) (paio|dozzina)\b/g, (_, w: string) => String(catalog.numberWords[w]));
}

/* ── Ricerca di sinonimi nel testo ── */

function containsPhrase(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `);
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Frase con una lettera sbagliata per parola lunga («napoletano», «focacia»). */
function containsFuzzy(text: string, phrase: string, exact: ReadonlySet<string>): boolean {
  const words = text.split(" ");
  const target = phrase.split(" ");
  if (!target.some((w) => w.length >= 6)) return false;
  for (let start = 0; start + target.length <= words.length; start++) {
    if (target.every((w, k) => (w.length >= 6 && !exact.has(words[start + k]) ? editDistanceAtMostOne(words[start + k], w) : words[start + k] === w))) return true;
  }
  return false;
}

/** exact: parole che non si correggono mai (i nomi dei pezzi: «teglie» non è «teglia romana»). */
function bestMatch(text: string, table: Record<string, string[]>, exact: ReadonlySet<string>): string | undefined {
  let best: { id: string; len: number } | undefined;
  for (const fuzzy of [false, true]) {
    for (const [id, phrases] of Object.entries(table)) {
      for (const phrase of phrases) {
        const hit = fuzzy ? containsFuzzy(text, phrase, exact) : containsPhrase(text, phrase);
        if (hit && (!best || phrase.length > best.len)) best = { id, len: phrase.length };
      }
    }
    if (best) return best.id;
  }
  return undefined;
}

/** Sinonimi del catalogo più i nomi dello stile, solo per gli stili dell'edizione. */
export function styleTable(catalog: VoiceCatalog): Record<string, string[]> {
  const table: Record<string, string[]> = {};
  for (const style of Object.values(STYLES_DB)) {
    const name = normalizeSpeech(style.name);
    const own = [name, name.replace(/^pizza /, "")];
    table[style.id] = [...new Set([...(catalog.styleSynonyms[style.id] ?? []).map(normalizeSpeech), ...own])].filter(Boolean);
  }
  return table;
}

export function termTable(catalog: VoiceCatalog): Record<string, string[]> {
  const table: Record<string, string[]> = {};
  for (const term of GLOSSARY_TERMS) {
    const name = normalizeSpeech(term.name.replace(/\(.*?\)/g, ""));
    table[term.id] = [...new Set([...(catalog.termSynonyms[term.id] ?? []).map(normalizeSpeech), name])].filter((p) => p.length > 0);
  }
  return table;
}

export function recognizeStyle(text: string, catalog: VoiceCatalog): string | undefined {
  return bestMatch(normalizeSpeech(text), styleTable(catalog), new Set(catalog.countNouns));
}

export function recognizeTerm(text: string, catalog: VoiceCatalog): string | undefined {
  return bestMatch(normalizeSpeech(text), termTable(catalog), new Set(catalog.countNouns));
}

/* ── Forno, ore, pezzi ── */

export function recognizeKitchen(text: string, catalog: VoiceCatalog): VoiceKitchen {
  const norm = digitize(normalizeSpeech(text), catalog);
  const kitchen: VoiceKitchen = {};
  const words = norm.split(" ");
  for (let i = 0; i < words.length && !kitchen.ovenModel; i++) {
    const two = `${words[i]} ${words[i + 1] ?? ""}`.trim();
    const brand = catalog.ovenBrands[two] ?? catalog.ovenBrands[words[i]];
    if (!brand) continue;
    // Marca più fino a tre parole di modello: la ricerca più lunga che trova un forno.
    for (let take = 3; take >= 0; take--) {
      const query = [brand, ...words.slice(i + 1, i + 1 + take)].join(" ");
      if (searchOvenModels(query, 1).length) { kitchen.ovenModel = query; break; }
    }
  }
  if (!kitchen.ovenModel) {
    let longest = 0;
    for (const { type, words: phrases } of catalog.ovenWords) {
      for (const phrase of phrases) {
        if (phrase.length > longest && containsPhrase(norm, normalizeSpeech(phrase))) {
          kitchen.ovenType = type;
          longest = phrase.length;
        }
      }
    }
  }
  const temp = norm.match(/\b(\d{3})\s*gradi\b/);
  if (temp) {
    const value = Number(temp[1]);
    if (value >= 150 && value <= 550) kitchen.ovenMaxTempC = value;
  }
  return kitchen;
}

export function recognizeHours(text: string, catalog: VoiceCatalog): number | undefined {
  const norm = digitize(normalizeSpeech(text), catalog);
  const { hours, days, half, halfDay, dayWords } = catalog.hourWords;
  const halfRe = half.map((h) => normalizeSpeech(h)).join("|");
  const one = (n: string) => (n === "un" || n === "una" ? 1 : Number(n));
  const hourRe = new RegExp(`\\b(\\d+(?:\\.\\d+)?|un|una)\\s*(?:${hours.join("|")})\\b(\\s(?:${halfRe})\\b)?`);
  // «un giorno e mezzo» = 36 ore: il mezzo vale anche per i giorni.
  const dayRe = new RegExp(`\\b(\\d+(?:\\.\\d+)?|un|una)\\s*(?:${days.join("|")})\\b(\\s(?:${halfRe})\\b)?`);
  let value: number | undefined;
  const h = norm.match(hourRe);
  const d = h ? null : norm.match(dayRe);
  if (h) value = one(h[1]) + (h[2] ? 0.5 : 0);
  else if (d) value = one(d[1]) * 24 + (d[2] ? 12 : 0);
  else if (halfDay.some((w) => containsPhrase(norm, normalizeSpeech(w)))) value = 12;
  else if (dayWords.some((w) => containsPhrase(norm, normalizeSpeech(w)))) value = 24;
  return value !== undefined && value > 0 && value <= 168 ? value : undefined;
}

export function recognizeBalls(text: string, catalog: VoiceCatalog): number | undefined {
  let norm = digitize(normalizeSpeech(text), catalog);
  // Ore, giorni e gradi non sono pezzi.
  norm = norm.replace(new RegExp(`\\b\\d+(?:\\.\\d+)?\\s*(?:${[...catalog.hourWords.hours, ...catalog.hourWords.days, "gradi", "minuti"].join("|")})\\b`, "g"), " ");
  const nouns = catalog.countNouns.join("|");
  const counted = norm.match(new RegExp(`\\b(\\d+)\\s*(?:${nouns})\\b`)) ?? norm.match(new RegExp(`\\bper (?:un|una|uno) (?:${nouns})\\b`)) ?? norm.match(/\bper (\d+)\b/);
  if (!counted) return undefined;
  const value = counted[1] === undefined ? 1 : Number(counted[1]);
  if (!Number.isInteger(value) || value < 1) return undefined;
  return Math.min(value, MAX_DOUGH_BALLS);
}

/* ── Intento ── */

function hasCue(text: string, cues: string[]): boolean {
  return cues.some((cue) => containsPhrase(text, normalizeSpeech(cue)));
}

export function understand(text: string, catalog: VoiceCatalog): VoiceQuery {
  const norm = normalizeSpeech(text);
  const kitchen = recognizeKitchen(text, catalog);
  const hours = recognizeHours(text, catalog);
  const base = { kitchen, ...(hours !== undefined ? { hours } : {}) };
  if (!norm) return { intent: "help", ...base };

  const styleId = recognizeStyle(text, catalog);
  const termId = recognizeTerm(text, catalog);
  const balls = recognizeBalls(text, catalog);
  const help = hasCue(norm, catalog.cues.help);
  const glossary = hasCue(norm, catalog.cues.glossary);
  const recommend = hasCue(norm, catalog.cues.recommend);
  const recipe = hasCue(norm, catalog.cues.recipe);

  if (glossary && termId && !recipe) return { intent: "glossary", termId, ...base };
  if (glossary && !styleId && !recipe && !recommend) return { intent: "glossary", termUnknown: true, ...base };
  if (recommend && !recipe) return { intent: "recommend", ...base };
  if (recipe || styleId) {
    return { intent: "recipe", ...(styleId ? { styleId } : {}), ...(balls !== undefined ? { balls } : {}), ...base };
  }
  if (termId) return { intent: "glossary", termId, ...base };
  if (help) return { intent: "help", ...base };
  // «ho sei ore e il forno a legna»: senza stile è una richiesta di consiglio.
  if (hours !== undefined || kitchen.ovenType || kitchen.ovenModel) return { intent: "recommend", ...base };
  return { intent: "fallback", ...base };
}
