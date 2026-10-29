/* ═══ EDIZIONE — una sola base di codice, più versioni (decisione del 28/10/2026) ═══
 *
 * La generalista e le versioni dedicate a un partner nascono dallo stesso main:
 * cambia solo un file di dati, l'«edizione», scelto in build. Niente rami per
 * cliente: una correzione al motore arriva a tutte le edizioni con un merge.
 *
 *   · editions/<id>.json       → edizioni pubbliche (generalista, demo con marchi inventati);
 *   · $VULCAN_EDITIONS_DIR     → edizioni dei marchi reali, dal repository privato;
 *   · VULCAN_EDITION=<id>      → quale edizione costruire (predefinita: «vulcan»).
 *
 * L'alias @vulcan/edition punta al file scelto (scripts/edition-path.mjs, usato
 * da vite.config.ts, vitest e build del Worker); tsconfig lo fa puntare alla
 * generalista per typecheck e script tsx. Un'edizione non valida ferma la build.
 *
 * Modulo puro (solo dati): lo importano anche domain/data. Procedura completa
 * in docs/ambienti-ed-edizioni.md.
 */
import raw from "@vulcan/edition";

export type EditionKind = "generalist" | "demo" | "partner";

/** Stessa forma di OvenModel (data/oven-models.ts), ripetuta per tenere il modulo senza import. */
export interface EditionOvenModel {
  id: string;
  brand: string;
  model: string;
  fuel: "wood" | "gas" | "electric" | "pellet";
  ovenType: "wood" | "coal" | "electric_high" | "electric_standard" | "gas" | "gas_pizza" | "home";
  maxTempC: number;
  pizzaCm?: number;
  /** V produttore, P fonte secondaria, demo = dato inventato (FW-01, S18-B-07). */
  source: "V" | "P" | "demo";
}

/* ═══ FW-15 — Trasparenza dell'edizione e suggerimenti di ricerca (D-K, S04-A-08) ═══
 * Valori chiusi: ognuno ha il suo testo in 7 lingue (ui-messages.*.ts). Un
 * valore nuovo si aggiunge qui e nei cataloghi, mai con `if (edition.id …)`. */

/** Rapporto fra Vulcan e il partner (testo `edition.relationship.<valore>`). */
export const PARTNER_RELATIONSHIPS = ["co-branded", "demo"] as const;
export type PartnerRelationship = (typeof PARTNER_RELATIONSHIPS)[number];

/** Dichiarazione di neutralità del motore (testo `edition.neutrality.<valore>`). */
export const NEUTRALITY_STATEMENTS = ["same-engine"] as const;
export type NeutralityStatement = (typeof NEUTRALITY_STATEMENTS)[number];

/** Suggerimenti della ricerca (testo `components.shared.search-overlay.suggestion.<id>`).
 * Bisogni e stili, senza marchi né persone (S01-A-06): un'edizione ne sceglie
 * un sottoinsieme e l'ordine. */
export const SEARCH_SUGGESTION_IDS = [
  "napoletana", "teglia", "homeOven", "hydration", "sourdough", "biga", "focaccia", "detroit",
] as const;
export type SearchSuggestionId = (typeof SEARCH_SUGGESTION_IDS)[number];
export const DEFAULT_SEARCH_SUGGESTIONS: readonly SearchSuggestionId[] = SEARCH_SUGGESTION_IDS;

export interface Edition {
  schema: 1;
  id: string;
  kind: EditionKind;
  /** «noindex» per demo e pilot: il Worker manda X-Robots-Tag. */
  indexing: "index" | "noindex";
  /** Co-branding: il prodotto resta Vulcan, l'app dice «per <partner>». */
  partner?: {
    name: string;
    url?: string;
    invented?: boolean;
    /** FW-15 (D-K): assente = «demo» se il marchio è inventato, altrimenti «co-branded». */
    relationship?: PartnerRelationship;
    /** FW-15 (D-K): assente = «same-engine». La neutralità si dichiara sempre. */
    neutralityStatement?: NeutralityStatement;
  };
  /** FW-15 (S01-A-05): dove mandare un riscontro (https: o mailto:). Assente = nessun canale mostrato. */
  feedbackUrl?: string;
  /** FW-15 (S04-A-08): suggerimenti della ricerca; assente = DEFAULT_SEARCH_SUGGESTIONS. */
  search?: { suggestions?: SearchSuggestionId[] };
  ovens?: {
    /** Modelli in più (es. forni di un marchio inventato per le demo). */
    extra?: EditionOvenModel[];
    /** Prefissi di id ammessi; assente = tutti i modelli. */
    only?: string[];
    /** Forno preimpostato al primo avvio, se l'utente non ne ha scelto uno. */
    default?: string;
  };
}

const ID = /^[a-z0-9][a-z0-9-]{1,40}$/;
const FUELS = new Set(["wood", "gas", "electric", "pellet"]);
const OVEN_TYPES = new Set(["wood", "coal", "electric_high", "electric_standard", "gas", "gas_pizza", "home"]);

function fail(message: string): never {
  throw new Error(`Edizione non valida: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateOven(value: unknown, at: string, invented: boolean): EditionOvenModel {
  if (!isRecord(value)) fail(`${at} non è un oggetto`);
  const { id, brand, model, fuel, ovenType, maxTempC, pizzaCm, source } = value;
  if (typeof id !== "string" || !ID.test(id)) fail(`${at}.id non valido`);
  if (typeof brand !== "string" || !brand.trim()) fail(`${at}.brand mancante`);
  if (typeof model !== "string" || !model.trim()) fail(`${at}.model mancante`);
  if (typeof fuel !== "string" || !FUELS.has(fuel)) fail(`${at}.fuel non valido`);
  if (typeof ovenType !== "string" || !OVEN_TYPES.has(ovenType)) fail(`${at}.ovenType non valido`);
  if (typeof maxTempC !== "number" || maxTempC < 150 || maxTempC > 600) fail(`${at}.maxTempC fuori scala (150–600 °C)`);
  if (pizzaCm !== undefined && (typeof pizzaCm !== "number" || pizzaCm < 15 || pizzaCm > 80)) fail(`${at}.pizzaCm fuori scala`);
  if (source !== "V" && source !== "P" && source !== "demo") fail(`${at}.source deve essere "V", "P" o "demo"`);
  // FW-01 (S18-B-07): un marchio inventato ha dati inventati, non «fonte secondaria».
  if (invented && source !== "demo") fail(`${at}.source: i forni di un marchio inventato hanno source "demo"`);
  if (!invented && source === "demo") fail(`${at}.source "demo" solo per un marchio inventato`);
  return value as unknown as EditionOvenModel;
}

/** Valida un'edizione letta da JSON; lancia un errore leggibile se non va. */
export function parseEdition(value: unknown): Edition {
  if (!isRecord(value)) fail("non è un oggetto");
  if (value.schema !== 1) fail("schema deve essere 1");
  if (typeof value.id !== "string" || !ID.test(value.id)) fail("id: minuscole, cifre e trattini");
  if (value.kind !== "generalist" && value.kind !== "demo" && value.kind !== "partner") fail("kind: generalist, demo o partner");
  if (value.indexing !== "index" && value.indexing !== "noindex") fail("indexing: index o noindex");
  if (value.kind !== "generalist" && value.indexing !== "noindex") fail("demo e partner restano noindex");
  if (value.kind === "generalist" && value.partner !== undefined) fail("la generalista non ha partner");
  if (value.kind !== "generalist" && value.partner === undefined) fail("demo e partner dichiarano il partner");
  if (value.partner !== undefined) {
    const partner = value.partner;
    if (!isRecord(partner) || typeof partner.name !== "string" || !partner.name.trim()) fail("partner.name mancante");
    if (partner.url !== undefined && (typeof partner.url !== "string" || !partner.url.startsWith("https://"))) fail("partner.url deve essere https");
    if (value.kind === "demo" && partner.invented !== true) fail("una demo usa un marchio inventato (partner.invented: true)");
    // FW-15 (D-K): rapporto e neutralità da valori chiusi, ognuno con il testo in 7 lingue.
    if (partner.relationship !== undefined && !(PARTNER_RELATIONSHIPS as readonly unknown[]).includes(partner.relationship)) {
      fail(`partner.relationship: ${PARTNER_RELATIONSHIPS.join(" o ")}`);
    }
    if (partner.relationship === "demo" && partner.invented !== true) fail("partner.relationship «demo» solo con un marchio inventato");
    if (partner.relationship === "co-branded" && partner.invented === true) fail("un marchio inventato è una demo (partner.relationship «demo»)");
    if (partner.neutralityStatement !== undefined && !(NEUTRALITY_STATEMENTS as readonly unknown[]).includes(partner.neutralityStatement)) {
      fail(`partner.neutralityStatement: ${NEUTRALITY_STATEMENTS.join(" o ")}`);
    }
  }
  // FW-15 (S01-A-05): un canale di riscontro è un link sicuro o un indirizzo email.
  if (value.feedbackUrl !== undefined && (typeof value.feedbackUrl !== "string" || !/^(https:\/\/|mailto:)\S+$/.test(value.feedbackUrl))) {
    fail("feedbackUrl deve essere https: o mailto:");
  }
  if (value.search !== undefined) {
    const search = value.search;
    if (!isRecord(search)) fail("search non è un oggetto");
    if (search.suggestions !== undefined && (!Array.isArray(search.suggestions) || search.suggestions.length === 0 ||
      !search.suggestions.every((id) => (SEARCH_SUGGESTION_IDS as readonly unknown[]).includes(id)))) {
      fail(`search.suggestions: elenco non vuoto fra ${SEARCH_SUGGESTION_IDS.join(", ")}`);
    }
  }
  if (value.ovens !== undefined) {
    const ovens = value.ovens;
    if (!isRecord(ovens)) fail("ovens non è un oggetto");
    if (ovens.extra !== undefined) {
      if (!Array.isArray(ovens.extra)) fail("ovens.extra non è un elenco");
      const invented = isRecord(value.partner) && value.partner.invented === true;
      ovens.extra.forEach((oven, index) => validateOven(oven, `ovens.extra[${index}]`, invented));
    }
    if (ovens.only !== undefined && (!Array.isArray(ovens.only) || ovens.only.length === 0 ||
      !ovens.only.every(prefix => typeof prefix === "string" && prefix.length > 0))) fail("ovens.only: elenco di prefissi non vuoto");
    if (ovens.default !== undefined && typeof ovens.default !== "string") fail("ovens.default non valido");
    // FW-15 (S18-B-09): il forno preimpostato deve passare il filtro dell'edizione,
    // altrimenti sparisce in silenzio (oven-models.ts non lo trova). Il controllo
    // sul catalogo completo è in edition.test.ts, per ogni edizione pubblica e per
    // quella della build.
    const fallbackOven = ovens.default;
    if (typeof fallbackOven === "string" && Array.isArray(ovens.only) &&
      !ovens.only.some((prefix) => typeof prefix === "string" && fallbackOven.startsWith(prefix))) {
      fail("ovens.default non è nel catalogo dell'edizione (ovens.only)");
    }
  }
  return value as unknown as Edition;
}

/** FW-15 (D-K): rapporto col partner, con il valore predefinito dello schema. */
export function partnerRelationship(edition: Edition): PartnerRelationship | null {
  if (!edition.partner) return null;
  return edition.partner.relationship ?? (edition.partner.invented ? "demo" : "co-branded");
}

/** FW-15 (D-K): dichiarazione di neutralità, sempre presente se c'è un partner. */
export function partnerNeutrality(edition: Edition): NeutralityStatement | null {
  if (!edition.partner) return null;
  return edition.partner.neutralityStatement ?? "same-engine";
}

/** FW-15 (S04-A-08): suggerimenti della ricerca di questa edizione. */
export function editionSearchSuggestions(edition: Edition): readonly SearchSuggestionId[] {
  return edition.search?.suggestions ?? DEFAULT_SEARCH_SUGGESTIONS;
}

/** Edizione di questa build. */
export const EDITION: Edition = parseEdition(raw);
