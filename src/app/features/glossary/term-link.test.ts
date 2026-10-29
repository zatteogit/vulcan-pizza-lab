import { describe, expect, it } from "vitest";
import { CMS_DEFAULTS } from "../cms/cms-context";
import { EN_LOCALE } from "../cms/locales/en";
import { DE_LOCALE } from "../cms/locales/de";
import { FR_LOCALE } from "../cms/locales/fr";
import { ES_LOCALE } from "../cms/locales/es";
import { PT_LOCALE } from "../cms/locales/pt";
import { JA_LOCALE } from "../cms/locales/ja";
import { GLOSSARY_TERMS, getLocalizedTerm, getTermById } from "../../data/glossary-data";
import { ISSUE_GLOSSARY_TERMS, ISSUES_DB } from "../../data/troubleshooting-data";
import { getScienceNote } from "../../data/science-notes";
import { ALL_STEP_TERM_IDS, stepGlossaryTerms } from "./step-terms";

/* ═══ FW-04 — il glossario è la fonte delle definizioni ═══
 * Ogni termine che l'interfaccia rende toccabile deve avere la sua voce:
 * un TermLink verso un id inesistente mostrerebbe l'id grezzo. */

const SOURCES = import.meta.glob(["../../**/*.{ts,tsx}", "!../../**/*.test.{ts,tsx}"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** termId="x", termId: "x", termIds={["x", "y"]} e le mappe Record<…, string[]> dei termini. */
function termIdsInSource(): Map<string, string> {
  const found = new Map<string, string>();
  for (const [file, text] of Object.entries(SOURCES)) {
    for (const m of text.matchAll(/termId(?:=|:\s*)"([a-z0-9_]+)"/g)) found.set(m[1], file);
    for (const m of text.matchAll(/termIds=\{\[([^\]]*)\]\}/g)) {
      for (const id of m[1].matchAll(/"([a-z0-9_]+)"/g)) found.set(id[1], file);
    }
    for (const m of text.matchAll(/_TERMS: Record<[^>]+> = \{([\s\S]*?)\n\};/g)) {
      for (const id of m[1].matchAll(/"([a-z0-9_]+)"/g)) found.set(id[1], file);
    }
  }
  return found;
}

const ids = new Set(GLOSSARY_TERMS.map((term) => term.id));

describe("FW-04 TermLink e rimandi al glossario", () => {
  it("ogni termId usato nel codice esiste nel glossario", () => {
    const used = termIdsInSource();
    expect(used.size).toBeGreaterThan(15);
    const missing = [...used].filter(([id]) => !ids.has(id)).map(([id, file]) => `${id} (${file})`);
    expect(missing).toEqual([]);
  });

  it("ogni parola dei passi e delle schede dei problemi ha una voce", () => {
    expect(ALL_STEP_TERM_IDS.filter((id) => !ids.has(id))).toEqual([]);
    expect(Object.values(ISSUE_GLOSSARY_TERMS).flat().filter((id) => !ids.has(id))).toEqual([]);
    const issueIds = new Set(ISSUES_DB.map((issue) => issue.id));
    expect(Object.keys(ISSUE_GLOSSARY_TERMS).filter((id) => !issueIds.has(id))).toEqual([]);
  });

  it("i passi parlano delle parole giuste (S09-A-15)", () => {
    expect(stepGlossaryTerms("mix")).toEqual(["gluten_development", "folds"]);
    expect(stepGlossaryTerms("folds")).toContain("folds");
    expect(stepGlossaryTerms("divide")).toContain("dough_division");
    expect(stepGlossaryTerms("proof", { unleavened: true })).toEqual([]);
    expect(stepGlossaryTerms("preferment", { preFermentType: "biga" })).toEqual(["pre_ferment", "biga"]);
  });

  it("correlati e note del modello puntano a voci e note esistenti", () => {
    for (const term of GLOSSARY_TERMS) {
      for (const rel of term.relatedTerms ?? []) expect(ids.has(rel), `${term.id} → ${rel}`).toBe(true);
      for (const note of term.noteIds ?? []) expect(getScienceNote(note), `${term.id} → ${note}`).toBeDefined();
    }
  });
});

describe("FW-04 voci del glossario in ogni lingua", () => {
  const bundles = { it: CMS_DEFAULTS, en: EN_LOCALE, de: DE_LOCALE, fr: FR_LOCALE, es: ES_LOCALE, pt: PT_LOCALE, ja: JA_LOCALE };

  it.each(Object.entries(bundles))("%s: le voci del procedimento (D-044) ci sono", (_lang, cms) => {
    for (const id of ["dough_division", "ball_shaping", "gluten_development", "folds", "poke_test", "cornicione",
      "oven_floor_dome", "pre_ferment", "sourdough", "flour_type", "manitoba", "semola_rimacinata"]) {
      const loc = cms.glossaryTerms.terms[id];
      expect(loc?.name, id).toBeTruthy();
      expect(loc?.definition, id).toBeTruthy();
    }
  });

  it.each(Object.entries(bundles))("%s: valori tipici con il numero sempre nella prima colonna (S12-A-14)", (_lang, cms) => {
    for (const raw of GLOSSARY_TERMS) {
      for (const range of getLocalizedTerm(raw, cms).ranges ?? []) {
        expect(range.value, `${raw.id}: ${range.label}`).toMatch(/\d/);
        expect(range.label, `${raw.id}: ${range.label}`).not.toMatch(/^[<>≤≥]\s?\d|^\d+([.,]\d+)?\s?[–-]\s?\d/);
      }
    }
  });

  it.each(Object.entries(bundles).filter(([lang]) => lang !== "en" && lang !== "ja"))(
    "%s: i numeri delle tabelle hanno la virgola della lingua (P/L, falling number, conducibilità)",
    (_lang, cms) => {
      for (const raw of GLOSSARY_TERMS) {
        for (const range of getLocalizedTerm(raw, cms).ranges ?? []) {
          expect(`${range.value} ${range.note ?? ""}`, raw.id).not.toMatch(/\d\.\d/);
          expect(range.note ?? "", raw.id).not.toMatch(/\d-\d/);
        }
      }
    },
  );

  it.each(Object.entries(bundles))("%s: la pill «Carico d'impasto» apre una voce che lo nomina (S03-B-08)", (_lang, cms) => {
    expect(getTermById("thickness_factor", cms)!.name).toContain(cms.parametricTips.pillDoughLoad.replace(/（.*$/, ""));
  });

  it.each(Object.entries(bundles))("%s: la voce Glutine avverte sulla celiachia e porta al profilo (S12-A-16)", (_lang, cms) => {
    const gluten = getTermById("gluten", cms)!;
    expect(gluten.relatedPages).toContain("profile");
    expect(gluten.whyImportant).toMatch(/celiac|cœliaque|celíac|Zöliakie|coeliac|セリアック/i);
  });

  it.each(Object.entries(bundles))("%s: le formule con parole sono tradotte (S12-A-13)", (lang, cms) => {
    const hydration = getTermById("hydration", cms)!;
    if (lang === "it") expect(hydration.formula).toContain("acqua");
    else expect(hydration.formula).not.toContain("acqua");
  });
});
