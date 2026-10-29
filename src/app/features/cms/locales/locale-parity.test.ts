import { describe, expect, it } from "vitest";
import { CMS_DEFAULTS, type CmsContent } from "../cms-context";
import { STYLES_DB } from "../../../domain/styles-db";
import { getVersions } from "../../../data/style-versions";
import { getDoughBaseByStyle } from "../../../data/parametric-databases";
import { EN_LOCALE } from "./en";
import { DE_LOCALE } from "./de";
import { ES_LOCALE } from "./es";
import { FR_LOCALE } from "./fr";
import { PT_LOCALE } from "./pt";
import { JA_LOCALE } from "./ja";

/* ═══ I18N-3 — ogni testo del CMS c'è in ogni lingua ═══
 * Il bundle di una lingua si fonde sopra inglese e italiano: una chiave
 * mancante non rompe nulla, ma mostra in silenzio un'altra lingua (prima
 * es/fr/pt ne avevano circa 300 e il glossario era vuoto in 5 lingue).
 * Qui ogni testo di CMS_DEFAULTS deve esistere in ogni bundle. Numeri e booleani
 * non sono testo; media e i cataloghi con test propri restano fuori. */

const SKIP = /^(media|messages|toppingI18n|inspirationI18n|locale)\./;

function textLeaves(value: unknown, path = "", out: string[] = []): string[] {
  if (typeof value === "string" || Array.isArray(value)) {
    out.push(path);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) textLeaves(child, path ? `${path}.${key}` : key, out);
  }
  return out;
}

function has(bundle: unknown, path: string): boolean {
  let node: unknown = bundle;
  // le chiavi di engineMessages contengono punti: si cerca il resto per intero
  const [head, ...rest] = path.split(".");
  const segments = head === "engineMessages" ? [head, rest.join(".")] : path.split(".");
  for (const segment of segments) {
    if (!node || typeof node !== "object" || !(segment in node)) return false;
    node = (node as Record<string, unknown>)[segment];
  }
  return true;
}

const REQUIRED = textLeaves(CMS_DEFAULTS).filter((path) => !SKIP.test(path));

const BUNDLES: Record<string, CmsContent> = {
  en: EN_LOCALE,
  de: DE_LOCALE,
  es: ES_LOCALE,
  fr: FR_LOCALE,
  pt: PT_LOCALE,
  ja: JA_LOCALE,
};

describe.each(Object.entries(BUNDLES))("bundle %s", (_locale, bundle) => {
  it("ha tutti i testi del CMS", () => {
    expect(REQUIRED.filter((path) => !has(bundle, path))).toEqual([]);
  });
});

/* Ogni stile del catalogo ha descrizione e caratteristiche nel CMS: senza, la UI
 * ricade sul testo italiano di styles-db in tutte le lingue (14 stili su 28
 * erano così). Con le chiavi in CMS_DEFAULTS, il test sopra le esige ovunque. */
describe("stili nel CMS", () => {
  it("ogni stile ha descrizione e caratteristiche", () => {
    const missing = Object.keys(STYLES_DB).filter(
      (id) => !CMS_DEFAULTS.styleDescriptions[id] || !CMS_DEFAULTS.styleChars[id],
    );
    expect(missing).toEqual([]);
  });
});

/* ═══ FW-11 — dati di dominio come chiavi, in ogni lingua ═══
 * Le etichette delle versioni (style-versions.ts) e il metodo di stesura dei
 * dati parametrici sono testo italiano nei dati: ogni bundle deve tradurli,
 * altrimenti «Sottile» o «Stesura in teglia con olio» restano in italiano. */
describe.each(Object.entries(BUNDLES))("FW-11 dati di dominio, bundle %s", (_locale, bundle) => {
  it("ogni etichetta di versione ha la sua traduzione", () => {
    const labels = new Set(
      Object.keys(STYLES_DB).flatMap((id) => getVersions(id).map((version) => version.label)),
    );
    const missing = [...labels].filter(
      (label) => !bundle.engineMessages?.[`version.label.${label}`],
    );
    expect(missing).toEqual([]);
  });

  it("ogni stile con panetto ha il metodo di stesura tradotto", () => {
    const missing = Object.keys(STYLES_DB).filter(
      (id) => getDoughBaseByStyle(id) && !bundle.parametricText?.stretch?.[id],
    );
    expect(missing).toEqual([]);
  });
});

/* FW-14 (revisione): la tabella §Termini (docs/linee-guida-editoriali.md)
 * vieta «Originale» per la ricetta di riferimento. I testi che la nominano
 * dicono «Riferimento» in ogni lingua. */
const ORIGINAL_TERM = /origina|オリジナル|元の/i;
const REFERENCE_TEXTS = (c: CmsContent) => ({
  createSourceHint: c.ui?.createSourceHint,
  scoreExplainer: c.misc?.scoreExplainer,
  recipeCanonical: c.cooking?.recipeCanonical,
  preCookBody: c.cooking?.preCookBody,
  preCookStart: c.cooking?.preCookStart,
  ceilingOvenWall: c.cooking?.ceilingOvenWall,
  ceilingCanonicalOk: c.cooking?.ceilingCanonicalOk,
  ceilingCompromise: c.cooking?.ceilingCompromise,
  resetToOriginal: c.cooking?.resetToOriginal,
});
describe.each(Object.entries({ it: CMS_DEFAULTS, ...BUNDLES }))("FW-14 lessico del riferimento, %s", (_locale, bundle) => {
  it("nessun testo del riferimento dice «Originale»", () => {
    const texts = REFERENCE_TEXTS(bundle);
    for (const [key, text] of Object.entries(texts)) expect(text, key).toBeTruthy();
    expect(Object.entries(texts).filter(([, text]) => ORIGINAL_TERM.test(text ?? "")).map(([key]) => key)).toEqual([]);
  });
});

/* Revisione G2 (WCAG 2.5.3, nome contiene l'etichetta): il «Ripristina» del
 * Personalizza mostra recipeResetPreset ma si chiama resetToReference. */
describe("il nome accessibile del reset contiene il testo visibile", () => {
  for (const [id, locale] of Object.entries({ it: CMS_DEFAULTS, en: EN_LOCALE, de: DE_LOCALE, es: ES_LOCALE, fr: FR_LOCALE, pt: PT_LOCALE, ja: JA_LOCALE })) {
    it(id, () => {
      const visible = locale.ui.recipeResetPreset.toLocaleLowerCase();
      expect(String(locale.engineMessages?.["recipeSetup.resetToReference"]).toLocaleLowerCase()).toContain(visible);
    });
  }
});
