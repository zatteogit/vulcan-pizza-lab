/* ═══ Voce — numeri e testo come si parlano ═══
 * Grammi come nell'app (interi; un decimale sotto i 10 g, come il lievito),
 * ore arrotondate alla mezz'ora con «circa» quando non sono esatte, niente
 * simboli. SSML per Alexa: le stesse frasi con pause brevi. */

import type { VoiceCatalog } from "./catalog";

/** Grammi detti: la stessa precisione che mostra l'app (formatUnit). */
export function spokenGrams(grams: number, catalog: VoiceCatalog): string {
  const value = grams >= 10 ? Math.round(grams) : Math.round(grams * 10) / 10;
  return String(value).replace(".", catalog.decimalSeparator);
}

/** Ore dette: «24 ore», «circa 7 ore e mezza», «45 minuti». Alla mezz'ora sotto
 *  le 10 ore, all'ora sopra. upward = per un minimo richiesto si arrotonda in
 *  su, mai in giù (non si promette meno tempo di quello che serve). */
export function spokenHours(hours: number, catalog: VoiceCatalog, upward = false): string {
  if (hours < 0.75 && !upward) return catalog.say.minutesPhrase(Math.max(5, Math.round((hours * 60) / 5) * 5));
  const step = hours >= 10 ? 1 : 2;
  const units = upward ? Math.ceil(hours * step - 1e-9) : Math.round(hours * step);
  const rounded = Math.max(1, units / step);
  const approx = Math.abs(rounded - hours) > 1e-6;
  return catalog.say.hoursPhrase(Math.floor(rounded), rounded % 1 !== 0, approx);
}

/** Testo del glossario o del motore leggibile da una sintesi vocale. */
export function speechify(text: string, catalog: VoiceCatalog): string {
  let out = text
    // Riferimenti bibliografici tra parentesi: non si leggono.
    .replace(/\s*\([^()]*\b\d{4}\)/g, "")
    .replace(/(\d)\.(\d)/g, `$1${catalog.decimalSeparator}$2`);
  const preps = catalog.rangePrepositions.join("|");
  // «a 18–20 °C» → «tra 18 e 20 gradi»: la preposizione cade.
  out = out.replace(new RegExp(`\\b(?:${preps}) (\\d+(?:,\\d+)?)\\s*[–-]\\s*(\\d+(?:,\\d+)?)`, "g"), (_, a: string, b: string) =>
    catalog.rangeWord(a, b, true));
  out = out.replace(/(\d+(?:,\d+)?)\s*[–-]\s*(\d+(?:,\d+)?)/g, (_, a: string, b: string) => catalog.rangeWord(a, b, false));
  for (const [re, replacement] of catalog.speechReplacements) out = out.replace(re, replacement);
  return out
    .replace(/\s*\(\s*/g, ", ")
    .replace(/\s*\)/g, ",")
    .replace(/["“”«»]/g, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

/** Prime frasi intere entro un numero di parole (la prima sempre). */
export function firstSentences(text: string, maxWords: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  let out = "";
  for (const sentence of sentences) {
    const next = `${out} ${sentence.trim()}`.trim();
    if (out && wordCount(next) > maxWords) break;
    out = next;
  }
  return out;
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** SSML pulito: una frase dopo l'altra con una pausa breve. */
export function toSsml(sentences: string[]): string {
  const body = sentences.filter(Boolean).map(escapeXml).join(' <break time="300ms"/> ');
  return `<speak>${body}</speak>`;
}
