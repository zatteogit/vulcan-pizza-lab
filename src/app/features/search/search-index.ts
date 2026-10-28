import { FLOURS_DB } from "../../data/flour-database";
import { GLOSSARY_TERMS, getLocalizedTerm } from "../../data/glossary-data";
import { SIGNATURE_RECIPES, signatureRecipeLink } from "../../data/signature-recipes";
import { TOPPING_CONCEPTS, getVariantsForConcept } from "../../data/topping-library";
import { toppingConcept } from "../../data/topping-i18n/localize";
import { localizeSignatureRecipe } from "../../data/inspiration-i18n/localize";
import { ISSUES_DB, getLocalizedIssue } from "../../data/troubleshooting-data";
import { formatOrigin, PIZZA_FAMILIES, shortOrigin, STYLES_DB } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import type { CmsContent } from "../cms/cms-context";
import { PRE_FERMENT_IDS, preFermentName } from "../recipe/pre-ferment-guide";
import { STYLE_PHOTOS } from "../recipe/recommended-styles";

/* ═══ U-5 — indice della ricerca a tutta pagina ═══
 * Funzioni pure, senza React: la vista dei risultati e i test usano le stesse.
 * Rispetto alla vecchia palette:
 *  - i testi sono quelli della lingua attiva (condimenti, prefermenti,
 *    glossario, problemi), non l'italiano dei database;
 *  - accenti e maiuscole non contano («pâte», «PATE», «pate»);
 *  - più parole vanno trovate tutte, in qualunque ordine;
 *  - i risultati sono ordinati per pertinenza, non per posizione nel database. */

export type ResultType = "style" | "recipe" | "topping" | "flour" | "glossary" | "guide" | "problem";

/** Ordine dei gruppi a parità di pertinenza. */
export const GROUP_ORDER: readonly ResultType[] = [
  "style",
  "recipe",
  "topping",
  "flour",
  "glossary",
  "guide",
  "problem",
];

export interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  link: string;
  photo?: string;
  /** Pertinenza: 3 titolo che inizia con la ricerca, 2 parola del titolo,
   *  1 titolo che la contiene, 0 trovata solo nel resto del testo. */
  score: number;
}

interface SearchEntry extends Omit<SearchResult, "score"> {
  /** Titolo e testo completo già normalizzati. */
  foldedTitle: string;
  haystack: string;
}

export const MIN_QUERY_LENGTH = 2;

/** Minuscole e senza accenti latini. Lascia stare i segni giapponesi
 *  (dakuten), che cambiano la parola. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function queryTokens(query: string): string[] {
  const folded = fold(query.trim());
  if (folded.length < MIN_QUERY_LENGTH) return [];
  return folded.split(/\s+/).filter(Boolean);
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function entry(
  base: Omit<SearchEntry, "foldedTitle" | "haystack">,
  extra: string,
): SearchEntry {
  return {
    ...base,
    foldedTitle: fold(base.title),
    haystack: fold(`${base.title} ${base.subtitle} ${extra}`),
  };
}

/** Costruisce l'indice per la lingua attiva. Si ricalcola solo quando cambia
 *  il CMS (memo nella vista). */
export function buildSearchIndex(cms: CmsContent): SearchEntry[] {
  const out: SearchEntry[] = [];
  const pages = cms.pages;

  for (const style of Object.values(STYLES_DB)) {
    const familyName =
      cms.families?.[style.family]?.name ||
      PIZZA_FAMILIES[style.family as keyof typeof PIZZA_FAMILIES]?.name ||
      "";
    /* Luogo e maestro nell'indice: «Bonci», «Napoli», «Genova» trovano gli stili.
     * FW-10 (S04-A-07): il sottotitolo dice origine e prima caratteristica,
     * non la famiglia (che ripeteva il titolo); la famiglia resta cercabile. */
    const firstChar = (cms.styleChars?.[style.id] ?? "").split("|")[0]?.trim();
    out.push(
      entry(
        {
          id: `style-${style.id}`,
          type: "style",
          title: style.name,
          subtitle: [shortOrigin(style.origin), firstChar].filter(Boolean).join(" · "),
          link: `/recipe/${style.id}?mode=canonical`,
          photo: STYLE_PHOTOS[style.id],
        },
        `${familyName} ${style.id.replace(/_/g, " ")} ${formatOrigin(style.origin)} ${cms.styleDescriptions?.[style.id] ?? ""} ${cms.styleChars?.[style.id] ?? ""}`,
      ),
    );
  }

  /* Ricette iconiche: deep link a stile + condimento, testi nella lingua
   * attiva (I18N-5); si trovano anche col nome del condimento. */
  for (const raw of SIGNATURE_RECIPES) {
    const rec = localizeSignatureRecipe(raw, cms.inspirationI18n);
    const style = STYLES_DB[rec.style_id];
    const concept = toppingConcept(rec.topping_concept_id, cms.toppingI18n);
    out.push(
      entry(
        {
          id: `recipe-${rec.id}`,
          type: "recipe",
          title: rec.name,
          subtitle: style?.name ?? "",
          link: signatureRecipeLink(rec),
          photo: rec.photo || STYLE_PHOTOS[rec.style_id],
        },
        `${rec.description} ${raw.name} ${concept?.name ?? ""} ${(rec.occasion_tags ?? []).join(" ")}`,
      ),
    );
  }

  for (const id of Object.keys(TOPPING_CONCEPTS)) {
    const concept = toppingConcept(id, cms.toppingI18n);
    if (!concept) continue;
    const targetStyle = getVariantsForConcept(id)[0]?.preferred_for_styles?.[0] ?? "napoletana_stg";
    out.push(
      entry(
        {
          id: `topping-${id}`,
          type: "topping",
          title: concept.name,
          subtitle: clip(concept.description, 90),
          link: `/recipe/${targetStyle}?mode=canonical&tab=condimento&topping=${id}`,
        },
        /* Il nome italiano resta cercabile: è quello scritto sui menu. */
        `${concept.description} ${TOPPING_CONCEPTS[id].name} ${id.replace(/_/g, " ")} ${(concept.occasions ?? []).join(" ")}`,
      ),
    );
  }

  const flourCat: Record<string, string> = {
    grano_tenero: pages.searchFlourWheat,
    manitoba: pages.searchFlourManitoba,
    semola: pages.searchFlourSemola,
    integrale: pages.searchFlourWholegrain,
    gluten_free: pages.searchFlourGlutenFree,
    speciale: pages.searchFlourSpecial,
  };
  for (const flour of FLOURS_DB) {
    const catLabel = flourCat[flour.category] || flour.category;
    out.push(
      entry(
        {
          id: `flour-${flour.id}`,
          type: "flour",
          title: flour.name,
          subtitle: uiMessage("components.shared.search-overlay.value-w-value-value-prot-value-98984423", [
            flour.producer,
            flour.w,
            flour.proteine_pct,
            catLabel,
          ]),
          link: "/profile",
        },
        `${flour.producer} ${flour.category.replace(/_/g, " ")} ${flour.note}`,
      ),
    );
  }

  for (const raw of GLOSSARY_TERMS) {
    const term = getLocalizedTerm(raw, cms);
    out.push(
      entry(
        {
          id: `glossary-${term.id}`,
          type: "glossary",
          title: term.symbol && !term.name.includes(term.symbol) ? `${term.name} (${term.symbol})` : term.name,
          subtitle: clip(term.definition, 100),
          link: `/learn/glossary#${term.id}`,
        },
        `${term.definition} ${term.id.replace(/_/g, " ")}`,
      ),
    );
  }

  for (const id of PRE_FERMENT_IDS) {
    const item = cms.preFerment.items[id];
    const description = item?.description ?? "";
    out.push(
      entry(
        {
          id: `guide-${id}`,
          type: "guide",
          title: preFermentName(id),
          subtitle: clip(description, 100),
          link: `/learn/pre-ferments#pf-${id}`,
        },
        `${description} ${item?.idealStyles ?? ""} ${cms.pages.learnPreFerments}`,
      ),
    );
  }

  for (const raw of ISSUES_DB) {
    const issue = getLocalizedIssue(raw, cms);
    out.push(
      entry(
        {
          id: `problem-${issue.id}`,
          type: "problem",
          title: issue.symptom,
          subtitle: clip(issue.cause, 100),
          link: `/learn/troubleshooting?issue=${encodeURIComponent(issue.id)}`,
        },
        `${issue.cause} ${issue.fixImmediate} ${issue.prevention}`,
      ),
    );
  }

  return out;
}

function scoreTitle(foldedTitle: string, tokens: string[]): number {
  const first = tokens[0];
  if (foldedTitle.startsWith(first)) return 3;
  if (foldedTitle.split(/[\s'’()\-/,]+/).some((word) => word.startsWith(first))) return 2;
  if (tokens.every((t) => foldedTitle.includes(t))) return 1;
  return 0;
}

/** Tutti i risultati che contengono ogni parola della ricerca, ordinati per
 *  pertinenza (a parità, l'ordine del database). */
export function searchIndex(index: readonly SearchEntry[], query: string): SearchResult[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const hits: SearchResult[] = [];
  index.forEach((e) => {
    if (!tokens.every((t) => e.haystack.includes(t))) return;
    const { foldedTitle: _t, haystack: _h, ...result } = e;
    hits.push({ ...result, score: scoreTitle(e.foldedTitle, tokens) });
  });
  /* sort stabile: a parità di punteggio resta l'ordine dell'indice */
  return hits.sort((a, b) => b.score - a.score);
}

/** FW-10 (S04-A-07): come la tua cucina accoglie uno stile. */
export interface KitchenFit {
  blocked: boolean;
  now: number;
}

/** Id dello stile di un risultato «Stili», o null. */
export function styleIdOf(result: Pick<SearchResult, "id" | "type">): string | null {
  return result.type === "style" ? result.id.slice("style-".length) : null;
}

/** A parità di pertinenza, prima gli stili che la tua cucina permette; uno
 *  stile bloccato apre la versione adattata alla tua cucina invece della
 *  canonica. Gli altri risultati non cambiano. */
export function rankForKitchen(
  results: readonly SearchResult[],
  fit: (styleId: string) => KitchenFit | undefined,
): SearchResult[] {
  const blockedOf = (r: SearchResult) => {
    const id = styleIdOf(r);
    return id ? fit(id)?.blocked === true : false;
  };
  return results
    .map((r, index) => ({ r, index, blocked: blockedOf(r) }))
    .sort((a, b) => b.r.score - a.r.score || Number(a.blocked) - Number(b.blocked) || a.index - b.index)
    .map(({ r, blocked }) => (blocked ? { ...r, link: r.link.replace("mode=canonical", "mode=adapted") } : r));
}

/** Gruppi per tipo; prima i gruppi col risultato più pertinente, poi
 *  l'ordine fisso. */
export function groupResults(results: readonly SearchResult[]): [ResultType, SearchResult[]][] {
  const groups = new Map<ResultType, SearchResult[]>();
  for (const r of results) {
    const list = groups.get(r.type);
    if (list) list.push(r);
    else groups.set(r.type, [r]);
  }
  return [...groups.entries()].sort(
    ([ta, a], [tb, b]) => b[0].score - a[0].score || GROUP_ORDER.indexOf(ta) - GROUP_ORDER.indexOf(tb),
  );
}

/** Tratti del testo da evidenziare: prima occorrenza di ogni parola, senza
 *  badare ad accenti e maiuscole. Indici sul testo originale. */
export function highlightRanges(text: string, query: string): [number, number][] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  /* Mappa carattere per carattere: l'NFD può allungare la stringa. */
  let folded = "";
  const start: number[] = [];
  const end: number[] = [];
  let pos = 0;
  for (const ch of text) {
    const f = fold(ch);
    for (let k = 0; k < f.length; k++) {
      start.push(pos);
      end.push(pos + ch.length);
    }
    folded += f;
    pos += ch.length;
  }
  const ranges: [number, number][] = [];
  for (const t of tokens) {
    const at = folded.indexOf(t);
    if (at === -1) continue;
    ranges.push([start[at], end[at + t.length - 1]]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}
