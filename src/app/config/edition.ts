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
  source: "V" | "P";
}

export interface Edition {
  schema: 1;
  id: string;
  kind: EditionKind;
  /** «noindex» per demo e pilot: il Worker manda X-Robots-Tag. */
  indexing: "index" | "noindex";
  /** Co-branding: il prodotto resta Vulcan, l'app dice «per <partner>». */
  partner?: { name: string; url?: string; invented?: boolean };
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

function validateOven(value: unknown, at: string): EditionOvenModel {
  if (!isRecord(value)) fail(`${at} non è un oggetto`);
  const { id, brand, model, fuel, ovenType, maxTempC, pizzaCm, source } = value;
  if (typeof id !== "string" || !ID.test(id)) fail(`${at}.id non valido`);
  if (typeof brand !== "string" || !brand.trim()) fail(`${at}.brand mancante`);
  if (typeof model !== "string" || !model.trim()) fail(`${at}.model mancante`);
  if (typeof fuel !== "string" || !FUELS.has(fuel)) fail(`${at}.fuel non valido`);
  if (typeof ovenType !== "string" || !OVEN_TYPES.has(ovenType)) fail(`${at}.ovenType non valido`);
  if (typeof maxTempC !== "number" || maxTempC < 150 || maxTempC > 600) fail(`${at}.maxTempC fuori scala (150–600 °C)`);
  if (pizzaCm !== undefined && (typeof pizzaCm !== "number" || pizzaCm < 15 || pizzaCm > 80)) fail(`${at}.pizzaCm fuori scala`);
  if (source !== "V" && source !== "P") fail(`${at}.source deve essere "V" o "P"`);
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
  }
  if (value.ovens !== undefined) {
    const ovens = value.ovens;
    if (!isRecord(ovens)) fail("ovens non è un oggetto");
    if (ovens.extra !== undefined) {
      if (!Array.isArray(ovens.extra)) fail("ovens.extra non è un elenco");
      ovens.extra.forEach((oven, index) => validateOven(oven, `ovens.extra[${index}]`));
    }
    if (ovens.only !== undefined && (!Array.isArray(ovens.only) || ovens.only.length === 0 ||
      !ovens.only.every(prefix => typeof prefix === "string" && prefix.length > 0))) fail("ovens.only: elenco di prefissi non vuoto");
    if (ovens.default !== undefined && typeof ovens.default !== "string") fail("ovens.default non valido");
  }
  return value as unknown as Edition;
}

/** Edizione di questa build. */
export const EDITION: Edition = parseEdition(raw);
