/* ═══ D-044 — Termini del gergo riconosciuti nei testi del procedimento ═══
 * Trova nei testi (già nella lingua attiva) i termini del glossario che un
 * neofita non conosce, per renderli toccabili. Solo il gergo del procedimento,
 * non le parole comuni («lievito», «farina»): un link ogni tre parole stanca.
 * Ogni termine diventa un link solo alla prima occorrenza del testo. */

import type { GlossaryTerm } from "../../data/glossary-data";

export const LINKABLE_TERM_IDS = [
  "biga",
  "poolish",
  "autolysis",
  "bulk_fermentation",
  "ball_fermentation",
  "staglio",
  "incordatura",
  "cornicione",
  "pirlatura",
  "slap_and_fold",
  "stretch_and_fold",
] as const;

/** Forme italiane che il nome della voce non copre (verbi, participi). Nelle
 *  altre lingue valgono le parti del nome tradotto. */
const ITALIAN_ALIASES: Record<string, string[]> = {
  bulk_fermentation: ["puntata"],
  ball_fermentation: ["appretto"],
  autolysis: ["autolisi"],
  staglio: ["stagliare", "stagliati"],
  incordatura: ["incordato", "incordata", "incordare"],
  pirlatura: ["pirlare", "pirlati"],
  slap_and_fold: ["slap and fold"],
  stretch_and_fold: ["stretch and fold", "pieghe"],
};

export type TermSegment = string | { termId: string; text: string };

/** «Puntata (Bulk Fermentation)» → «Puntata», «Bulk Fermentation». */
function nameParts(name: string): string[] {
  return name
    .split(/\s*[()（）]\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildTermMatcher(terms: GlossaryTerm[], locale: string) {
  const aliasToId = new Map<string, string>();
  for (const term of terms) {
    if (!(LINKABLE_TERM_IDS as readonly string[]).includes(term.id)) continue;
    const aliases = [...nameParts(term.name), ...(locale === "it" ? (ITALIAN_ALIASES[term.id] ?? []) : [])];
    for (const alias of aliases) {
      const key = alias.toLocaleLowerCase(locale);
      if (!aliasToId.has(key)) aliasToId.set(key, term.id);
    }
  }
  const alternatives = [...aliasToId.keys()].sort((a, b) => b.length - a.length).map(escape);
  if (!alternatives.length) return () => (text: string): TermSegment[] => [text];
  // Le lingue senza spazi (giapponese) non hanno confini di parola.
  const bounded = locale !== "ja";
  const pattern = new RegExp(
    bounded ? `(?<![\\p{L}\\p{N}])(${alternatives.join("|")})(?![\\p{L}\\p{N}])` : `(${alternatives.join("|")})`,
    "giu",
  );

  /** Un matcher per contesto: ogni termine si collega una volta sola. */
  return () => {
    const linked = new Set<string>();
    return (text: string): TermSegment[] => {
      const segments: TermSegment[] = [];
      let last = 0;
      for (const match of text.matchAll(pattern)) {
        const termId = aliasToId.get(match[0].toLocaleLowerCase(locale));
        if (!termId || linked.has(termId) || match.index === undefined) continue;
        linked.add(termId);
        if (match.index > last) segments.push(text.slice(last, match.index));
        segments.push({ termId, text: match[0] });
        last = match.index + match[0].length;
      }
      if (last < text.length) segments.push(text.slice(last));
      return segments;
    };
  };
}
