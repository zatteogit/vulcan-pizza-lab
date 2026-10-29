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
import {
  PROOF_MIN_TEMP_C,
  STYLES_DB,
  fermentationPhases,
  fermentationSpeedRatio,
  generateRecipe,
  type PreFermentType,
  type UserConstraints,
} from "../pizza-engine";

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

/* ═══ FW-01 — Le formule del registro sono quelle del motore ═══
 * Ricalcola dose di lievito e ore equivalenti con la formula scritta nelle
 * note yeast-dose / equivalent-hours / q10-fermentation e la confronta con
 * generateRecipe: se il motore cambia, la nota non può restare indietro. */
describe("formule del registro = motore (FW-01)", () => {
  const constraints = (overrides: Partial<UserConstraints> = {}): UserConstraints => ({
    oven_type: "home",
    oven_max_temp_c: 250,
    skill_level: 2,
    available_hours: 72,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: [],
    kitchen_temp_c: 22,
    pantry_flours: [],
    pantry_yeasts: [],
    mixer_type: "hands",
    surfaces: [],
    ...overrides,
  });

  /** v(T) come scritto nella nota q10-fermentation. */
  const v = (yeast: "fresh" | "dry" | "sourdough", t: number) => {
    const [tb, qa, qb] = yeast === "sourdough" ? [15, 2.2, 1.9] : [10, 2.0, 1.6];
    return t >= tb ? qa ** ((t - 18) / 10) : qa ** ((tb - 18) / 10) * qb ** ((t - tb) / 10);
  };

  const cases = [
    { style: "napoletana_stg", yeast: "fresh", hours: 24, temp: 22, k: undefined },
    { style: "napoletana_stg", yeast: "dry", hours: 8, temp: 25, k: undefined },
    { style: "detroit", yeast: "fresh", hours: 36, temp: 4, k: undefined },
    { style: "new_york", yeast: "fresh", hours: 48, temp: 6, k: 1.5 },
    { style: "napoletana_stg", yeast: "sourdough", hours: 24, temp: 4, k: undefined },
  ] as const;

  it("v(T) della nota coincide con fermentationSpeedRatio", () => {
    for (const yeast of ["fresh", "dry", "sourdough"] as const) {
      for (let t = 2; t <= 32; t += 0.5) expect(fermentationSpeedRatio(yeast, t)).toBeCloseTo(v(yeast, t), 10);
    }
  });

  it.each(cases)("$style $yeast $hours h a $temp °C: Y e h₁₈ come scritti nelle note", ({ style: id, yeast, hours, temp, k }) => {
    const style = STYLES_DB[id];
    const recipe = generateRecipe(style, constraints({ pantry_yeasts: [yeast], yeast_speed_factor: k }), {
      customFermentationHours: hours,
      customFermentationTempC: temp,
    });
    const h = recipe.fermentation_hours;
    const T = recipe.fermentation_temp_c;
    expect(recipe.yeast_type).toBe(yeast);
    const proof = fermentationPhases(h, recipe.has_pre_ferment, recipe.pre_ferment_type as PreFermentType | undefined, style.method_profile).proof;
    const ha = T < PROOF_MIN_TEMP_C ? proof : 0;
    // equivalent-hours: sopra 18 °C h × v(T); sotto (h − hₐ) × v(T) + hₐ.
    const h18 = (h - ha) * v(yeast, T) + ha;
    expect(recipe.science.effective_hours_18c).toBeCloseTo(h18, 1);
    if (yeast === "sourdough") return; // la dose del lievito madre non usa questa formula
    // yeast-dose: tₑ = (h − hₐ) + hₐ ÷ v(T); Y = max(0,01; min(3; 0,1 × (24/tₑ)^0,7 ÷ v(T) × s) ÷ k).
    const te = h - ha + ha / v(yeast, T);
    const s = yeast === "dry" ? 0.33 : 1;
    const y = Math.max(0.01, Math.min(3, ((0.1 * (24 / te) ** 0.7) / v(yeast, T)) * s) / (k ?? 1));
    expect(recipe.science.yeast_baker_pct).toBeCloseTo(y, 2);
  });
});
