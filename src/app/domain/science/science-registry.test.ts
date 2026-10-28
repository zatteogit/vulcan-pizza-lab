import { describe, expect, it } from "vitest";
import { SCIENCE_NOTES, resolveScienceNote, notesForGlossaryTerm } from "../../data/science-notes";
import { SCIENCE_SOURCES, getScienceSource } from "../../data/science-sources";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { CMS_DEFAULTS, type CmsContent } from "../../features/cms/cms-context";
import { EN_LOCALE } from "../../features/cms/locales/en";
import { DE_LOCALE } from "../../features/cms/locales/de";
import { ES_LOCALE } from "../../features/cms/locales/es";
import { FR_LOCALE } from "../../features/cms/locales/fr";
import { PT_LOCALE } from "../../features/cms/locales/pt";
import { JA_LOCALE } from "../../features/cms/locales/ja";
import { roundForEvidence } from "./evidence";

/* ═══ FW-01 — Guardia del registro della scienza ═══
 * Il registro è il sostegno delle affermazioni dell'app: una nota senza fonte
 * che si presenta come stima, una fonte inesistente o una fonte smentita
 * citata a sostegno farebbero passare per scienza ciò che non lo è. */

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BUNDLES: Record<string, CmsContent> = {
  it: CMS_DEFAULTS,
  en: EN_LOCALE,
  de: DE_LOCALE,
  es: ES_LOCALE,
  fr: FR_LOCALE,
  pt: PT_LOCALE,
  ja: JA_LOCALE,
};

const assumptionIds = [...new Set(SCIENCE_NOTES.flatMap((note) => note.assumptionIds ?? []))];

describe("fonti", () => {
  it("hanno id kebab-case unici", () => {
    const ids = SCIENCE_SOURCES.map((source) => source.id);
    expect(ids.filter((id) => !KEBAB.test(id))).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("una fonte letta ha una data ISO; una fonte verificata è stata letta", () => {
    for (const source of SCIENCE_SOURCES) {
      if (source.accessed) expect(source.accessed, source.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (source.status === "verified") expect(source.accessed, source.id).toBeTruthy();
    }
  });
});

describe("note", () => {
  it("hanno id kebab-case unici", () => {
    const ids = SCIENCE_NOTES.map((note) => note.id);
    expect(ids.filter((id) => !KEBAB.test(id))).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ogni nota ha una fonte, oppure è un'ipotesi o una scelta di Vulcan", () => {
    const unsupported = SCIENCE_NOTES.filter(
      (note) => note.sourceIds.length === 0 && note.kind !== "assumption" && note.kind !== "editorial",
    ).map((note) => note.id);
    expect(unsupported).toEqual([]);
  });

  it("ogni fonte citata esiste", () => {
    const missing = SCIENCE_NOTES.flatMap((note) =>
      note.sourceIds.filter((id) => !getScienceSource(id)).map((id) => `${note.id} → ${id}`),
    );
    expect(missing).toEqual([]);
  });

  it("nessuna nota cita una fonte smentita", () => {
    const wrong = SCIENCE_NOTES.flatMap((note) =>
      note.sourceIds.filter((id) => getScienceSource(id)?.status === "wrong").map((id) => `${note.id} → ${id}`),
    );
    expect(wrong).toEqual([]);
  });

  it("ogni stima dichiara incertezza e decimali", () => {
    const vague = SCIENCE_NOTES.filter(
      (note) => note.kind === "estimate" && note.uncertainty?.displayDecimals === undefined,
    ).map((note) => note.id);
    expect(vague).toEqual([]);
  });

  it("le voci di glossario collegate esistono", () => {
    const terms = new Set(GLOSSARY_TERMS.map((term) => term.id));
    const missing = SCIENCE_NOTES.filter((note) => note.glossaryTermId && !terms.has(note.glossaryTermId))
      .map((note) => `${note.id} → ${note.glossaryTermId}`);
    expect(missing).toEqual([]);
    expect(notesForGlossaryTerm("q10").map((note) => note.id)).toContain("q10-fermentation");
  });

  it("resolveScienceNote restituisce le fonti nell'ordine della nota", () => {
    const note = resolveScienceNote("stg-flour-w");
    expect(note?.sources.map((source) => source.id)).toEqual(["avpn-2024", "masaf-stg-2010"]);
    expect(resolveScienceNote("non-esiste")).toBeUndefined();
  });
});

describe.each(Object.entries(BUNDLES))("testi del registro in %s", (_locale, bundle) => {
  it("ogni nota ha titolo, livello 1 e livello 2", () => {
    const missing = SCIENCE_NOTES.flatMap((note) => {
      const text = bundle.science?.notes?.[note.id];
      return (["title", "l1", "l2"] as const)
        .filter((field) => !text?.[field]?.trim())
        .map((field) => `${note.id}.${field}`);
    });
    expect(missing).toEqual([]);
  });

  it("ogni ipotesi ha il suo testo", () => {
    expect(assumptionIds.filter((id) => !bundle.science?.assumptions?.[id]?.trim())).toEqual([]);
  });

  it("nessun testo orfano senza nota o ipotesi", () => {
    const noteIds = new Set(SCIENCE_NOTES.map((note) => note.id));
    expect(Object.keys(bundle.science.notes).filter((id) => !noteIds.has(id))).toEqual([]);
    expect(Object.keys(bundle.science.assumptions).filter((id) => !assumptionIds.includes(id))).toEqual([]);
  });
});

/* Convenzione 3 dell'audit: nessuna affermazione sulla salute al livello 1.
 * Le caratteristiche dello stile sono chip della scheda (S03-B-05). */
const HEALTH_CLAIM = /digerib|digestib|verdaulich|消化/i;

describe.each(Object.entries(BUNDLES))("livello 1 senza promesse di salute in %s", (_locale, bundle) => {
  it("le caratteristiche degli stili non parlano di digeribilità", () => {
    const claims = Object.entries(bundle.styleChars ?? {})
      .filter(([, chars]) => HEALTH_CLAIM.test(chars))
      .map(([id]) => id);
    expect(claims).toEqual([]);
  });
});

describe("roundForEvidence", () => {
  it("una stima non mostra più decimali di quelli dichiarati (S06-A-06/B-08)", () => {
    const aw = resolveScienceNote("water-activity");
    const q10 = resolveScienceNote("q10-fermentation");
    expect(roundForEvidence(0.945, aw)).toBe(0.95);
    expect(roundForEvidence(0.943, aw)).toBe(0.94);
    expect(roundForEvidence(1.32, q10)).toBe(1.3);
    expect(roundForEvidence(0.43, q10)).toBe(0.4);
  });

  it("senza incertezza dichiarata il valore resta com'è", () => {
    expect(roundForEvidence(2.875, undefined)).toBe(2.875);
    expect(roundForEvidence(2.875, resolveScienceNote("water-temp-rule"))).toBe(2.875);
    expect(roundForEvidence(Number.NaN, resolveScienceNote("water-activity"))).toBeNaN();
  });
});
