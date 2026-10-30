import { describe, expect, it } from "vitest";
/* ═══ FW-05 — Coerenza contenuti ↔ motore ═══
 * Glossario, problemi, prefermenti, caratteristiche degli stili e server MCP
 * citano numeri e regole del motore. Qui si verifica, in tutte e 7 le lingue,
 * che i testi interpolati contengano i valori del motore e che le voci coperte
 * non abbiano cifre scritte a mano (solo segnaposto da engine-facts). */
import { CMS_DEFAULTS, type CmsContent } from "../../features/cms/cms-context";
import { EN_LOCALE } from "../../features/cms/locales/en";
import { DE_LOCALE } from "../../features/cms/locales/de";
import { ES_LOCALE } from "../../features/cms/locales/es";
import { FR_LOCALE } from "../../features/cms/locales/fr";
import { PT_LOCALE } from "../../features/cms/locales/pt";
import { JA_LOCALE } from "../../features/cms/locales/ja";
import { getTermById, glossaryFactValues, GLOSSARY_STYLE_EXAMPLES } from "../../data/glossary-data";
import { getStyleParametrics } from "../../data/parametric-databases";
import { formatNumber, formatPercent, formatRange } from "../../i18n/format";
import { interpolate } from "../../i18n/interpolate";
import { MCP_TOOLS } from "../../agent/mcp-tools";
import { STYLES_DB } from "../styles-db";
import { generateRecipe, getQ10, type UserConstraints } from "../pizza-engine";
import { AUTH_AXIS_WEIGHTS, AUTHENTICITY_FUEL_CAP, FEAS_AXIS_WEIGHTS } from "../recipe-score";
import {
  fermentationModelFacts,
  flourFitForStyle,
  flourStrength,
  FLOUR_STRENGTH_SCALE,
  preFermentFacts,
  scoreBandRanges,
  styleRangeFacts,
  stylesDeclaringPreFerment,
  thresholdFor,
  yeastDoseFact,
  YEAST_SCENARIOS,
} from "./engine-facts";

const BUNDLES: Record<string, CmsContent> = {
  it: CMS_DEFAULTS,
  en: EN_LOCALE,
  de: DE_LOCALE,
  es: ES_LOCALE,
  fr: FR_LOCALE,
  pt: PT_LOCALE,
  ja: JA_LOCALE,
};

const source = (locale: string, bundle: CmsContent) => ({ glossaryTerms: bundle.glossaryTerms, locale: { id: locale } });
const PLACEHOLDER = /\{\w+\}/g;
/** Cifre fuori dai segnaposto (i pedici di Q₁₀ non sono cifre ASCII). */
const literalDigits = (text: string | undefined) => (text ?? "").replace(PLACEHOLDER, "").match(/\d/g) ?? [];

describe("engine-facts legge il motore", () => {
  it("pesi e Q10 sono quelli del calcolo", () => {
    expect(AUTH_AXIS_WEIGHTS.ingredients + AUTH_AXIS_WEIGHTS.process + AUTH_AXIS_WEIGHTS.equipment).toBeCloseTo(1);
    expect(FEAS_AXIS_WEIGHTS.oven + FEAS_AXIS_WEIGHTS.flour + FEAS_AXIS_WEIGHTS.skill).toBeCloseTo(1);
    const fm = fermentationModelFacts();
    expect(fm.commercial.above).toBe(getQ10("fresh", 20).q10);
    expect(fm.commercial.below).toBe(getQ10("fresh", 4).q10);
    expect(fm.sourdough.above).toBe(getQ10("sourdough", 20).q10);
    expect(fm.sourdough.below).toBe(getQ10("sourdough", 4).q10);
  });

  it("una sola scala della farina, a fasce semiaperte (W 280 è solo «forte»)", () => {
    expect(flourStrength(219)).toBe("weak");
    expect(flourStrength(220)).toBe("medium");
    expect(flourStrength(280)).toBe("strong");
    expect(flourStrength(330)).toBe("veryStrong");
    for (let i = 1; i < FLOUR_STRENGTH_SCALE.length; i++) expect(FLOUR_STRENGTH_SCALE[i].min).toBe(FLOUR_STRENGTH_SCALE[i - 1].max);
  });

  it("il giudizio della farina usa la forbice dello stile e la soglia di eccesso della fattibilità (S06-A-04)", () => {
    const teglia = STYLES_DB.teglia_romana.dough.flour_w_range;
    expect(flourFitForStyle(185, teglia)).toBe("weak");
    expect(flourFitForStyle(300, teglia)).toBe("ideal");
    expect(flourFitForStyle(390, STYLES_DB.napoletana_canotto.dough.flour_w_range)).toBe("ideal");
    expect(flourFitForStyle(500, teglia)).toBe("strong");
  });

  it("gli stili «ideali» dei prefermenti sono quelli che li dichiarano nel metodo (S14-A-01)", () => {
    for (const kind of ["biga", "poolish"] as const) {
      const ids = stylesDeclaringPreFerment(kind);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(STYLES_DB[id].dough.process_type.split("|")).toContain(kind);
    }
    expect(stylesDeclaringPreFerment("biga")).not.toContain("pinsa_romana");
    expect(stylesDeclaringPreFerment("poolish")).not.toContain("teglia_romana");
  });
});

describe.each(Object.entries(BUNDLES))("glossario e motore, %s", (locale, bundle) => {
  const values = glossaryFactValues(locale);
  const term = (id: string) => getTermById(id, source(locale, bundle))!;

  it("nessun segnaposto resta irrisolto", () => {
    for (const id of ["q10", "arrhenius", "yeast", "w_alveograph", "a_score", "f_score", "d_score", "hydration", "pl_ratio", "thickness_factor", "biga", "poolish"]) {
      const t = term(id);
      const texts = [t.definition, t.whyImportant, t.formula, ...(t.ranges ?? []).flatMap((r) => [r.label, r.value, r.note])];
      expect(texts.filter((text) => /\{\w+\}/.test(text ?? "")), id).toEqual([]);
    }
  });

  it("Q₁₀ e Arrhenius dicono i valori a tratti del motore, senza β (S12-A-01/B-02)", () => {
    const fm = fermentationModelFacts();
    const one = (v: number) => formatNumber(v, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    expect(term("q10").ranges!.map((r) => r.value)).toEqual([fm.commercial.above, fm.commercial.below, fm.sourdough.above, fm.sourdough.below].map(one));
    const arrhenius = term("arrhenius");
    for (const v of [fm.commercial.above, fm.commercial.below, fm.sourdough.above, fm.sourdough.below]) expect(arrhenius.whyImportant).toContain(one(v));
    expect(`${arrhenius.whyImportant} ${arrhenius.formula}`).not.toMatch(/β|0[.,]075|2[.,]12/);
    expect(arrhenius.formula).toContain("Eₐ");
  });

  it("A-Score e F-Score: pesi e fasce del motore (S12-A-03/B-03)", () => {
    const pct = (w: number) => formatPercent(w * 100, locale);
    for (const w of Object.values(AUTH_AXIS_WEIGHTS) as number[]) expect(term("a_score").formula).toContain(pct(w));
    for (const w of Object.values(FEAS_AXIS_WEIGHTS) as number[]) expect(term("f_score").formula).toContain(pct(w));
    for (const [id, type] of [["a_score", "A"], ["f_score", "F"], ["d_score", "D"]] as const) {
      // FW-04 (S12-A-14): il numero sta sempre nella colonna del valore.
      expect(term(id).ranges!.map((r) => r.value)).toEqual(scoreBandRanges(type).map(([a, b]) => formatRange(a, b, locale)));
    }
  });

  it("idratazione, P/L e thickness factor: gli intervalli sono quelli degli stili (S12-A-04/B-04, S11-V-01)", () => {
    const hydration = term("hydration").ranges!;
    GLOSSARY_STYLE_EXAMPLES.hydration.forEach((id, i) => {
      const f = styleRangeFacts(id)!;
      expect(hydration[i]).toEqual({ label: f.name, value: formatRange(f.hydrationPct[0], f.hydrationPct[1], locale, { unit: "percent" }) });
    });
    const pl = term("pl_ratio").ranges!;
    GLOSSARY_STYLE_EXAMPLES.pl_ratio.forEach((id, i) => expect(pl[i].label).toBe(STYLES_DB[id].name));
    const tf = term("thickness_factor").ranges!;
    GLOSSARY_STYLE_EXAMPLES.thickness_factor.forEach((id, i) => {
      expect(tf[i].value).toBe(formatNumber(styleRangeFacts(id)!.thicknessGPerCm2, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      expect(tf[i].note).toBeUndefined();
    });
  });

  it("il lievito: le dosi sono quelle del motore per ore e temperatura (S12-B-04)", () => {
    const ranges = term("yeast").ranges!;
    YEAST_SCENARIOS.forEach((s, i) => {
      expect(ranges[i].value).toBe(formatPercent(yeastDoseFact(s.hours, s.tempC), locale, { maximumFractionDigits: 2 }));
    });
  });

  it("la W ha le fasce della scala unica, con la chiave della regola (S06-A-05, S08-B-05)", () => {
    expect(term("w_alveograph").ranges!.map((r) => r.key)).toEqual(FLOUR_STRENGTH_SCALE.map((b) => b.id));
  });

  it("biga e poolish citano la quota di farina del motore, non «un terzo» (S14-A-07)", () => {
    expect(term("biga").whyImportant).toContain(values.bigaFlourPct);
    expect(term("poolish").whyImportant).toContain(values.poolishFlourPct);
  });

  /* Allowlist motivata: nessuna. Le voci coperte non contengono cifre fuori
   * dai segnaposto; le cifre di fonte (biga 1%, 16 h a 18–20 °C) stanno nelle
   * definizioni, che non sono numeri del motore. */
  it("nessuna cifra scritta a mano nelle voci coperte", () => {
    const raw = bundle.glossaryTerms.terms;
    const covered: [string, string | undefined][] = [
      ["q10.whyImportant", raw.q10?.whyImportant],
      ["arrhenius.whyImportant", raw.arrhenius?.whyImportant],
      ["a_score.formula", raw.a_score?.formula],
      ["f_score.formula", raw.f_score?.formula],
      ["a_score.whyImportant", raw.a_score?.whyImportant],
      ["f_score.whyImportant", raw.f_score?.whyImportant],
      ...(["q10", "yeast", "w_alveograph", "a_score", "f_score", "d_score"] as const).flatMap((id) =>
        (raw[id]?.ranges ?? []).flatMap((r, i) => [[`${id}.ranges.${i}.label`, r.label], [`${id}.ranges.${i}.value`, r.value]] as [string, string][])),
    ];
    expect(covered.filter(([, text]) => literalDigits(text).length > 0).map(([path]) => path)).toEqual([]);
    for (const id of ["hydration", "pl_ratio", "thickness_factor"]) expect(raw[id]?.ranges, id).toBeUndefined();
  });
});

/* D-063: il tetto dell'autenticità per il combustibile vale solo se il forno
 * NON arriva anche alla temperatura minima dello stile. Il glossario «A-Score»
 * deve dire la stessa condizione, prima del tetto, in tutte le lingue. */
const MIN_TEMP_WORD: Record<string, RegExp> = {
  it: /temperatura minima/, en: /minimum temperature/, de: /Mindesttemperatur/, es: /temperatura mínima/,
  fr: /température minimale/, pt: /temperatura mínima/, ja: /最低温度/,
};
describe("A-Score e tetto del combustibile (D-063)", () => {
  const kitchen = (temp: number): UserConstraints => ({
    oven_type: "electric_high", oven_max_temp_c: temp, available_hours: 48, meal_deadline: false, dough_balls: 2, skill_level: 4,
    has_mixer: false, has_baking_pan: true, has_pizza_stone: true, has_pizza_steel: false,
    pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
  });
  it("forno non a legna sopra il minimo: niente tetto; sotto il minimo: tetto", () => {
    const style = STYLES_DB.napoletana_stg;
    const above = generateRecipe(style, kitchen(style.baking.temp_c_range[0] + 20));
    expect(above.scores.penalties.map((p) => p.key)).not.toContain("auth.fuelCap");
    expect(above.scores.authenticity).toBeGreaterThan(AUTHENTICITY_FUEL_CAP);
    const below = generateRecipe(STYLES_DB.pizza_al_metro, kitchen(STYLES_DB.pizza_al_metro.baking.temp_c_range[0] - 10));
    expect(below.scores.authenticity).toBeLessThanOrEqual(AUTHENTICITY_FUEL_CAP);
  });
  it.each(Object.entries(BUNDLES))("il glossario lega il tetto alla temperatura minima, %s", (locale, bundle) => {
    const why = getTermById("a_score", source(locale, bundle))!.whyImportant ?? "";
    const cap = formatNumber(AUTHENTICITY_FUEL_CAP, locale);
    const capAt = why.indexOf(cap);
    expect(capAt, why).toBeGreaterThan(0);
    // La condizione sulla temperatura minima sta prima del tetto, nella stessa frase.
    const clause = why.slice(0, capAt).split(/[.。:：]/).pop() ?? "";
    expect(clause, why).toMatch(MIN_TEMP_WORD[locale]);
  });
});

/* FW-17: con un prefermento la Regola 55 ha quattro termini (rule55Sum) e la
 * temperatura d'impasto voluta dipende dalla fermentazione (≤ 4 °C → 22, sennò 24). */
describe.each(Object.entries(BUNDLES))("Regola 55 e motore, %s", (locale, bundle) => {
  it("il glossario dice la variante a quattro termini e 22/24 °C del motore", () => {
    const t = getTermById("rule_of_55", source(locale, bundle))!;
    expect(t.whyImportant).toMatch(/4 × /);
    expect(t.whyImportant).toContain("22 °C");
    expect(t.whyImportant).toContain("24 °C");
    expect(t.name).toMatch(/55/);
  });
});

describe.each(Object.entries(BUNDLES))("prefermenti e motore, %s", (locale, bundle) => {
  const values = glossaryFactValues(locale);
  const pf = { ...CMS_DEFAULTS.preFerment, ...bundle.preFerment };
  const fill = (text: string) => interpolate(text, values);

  it("idratazione e quota di farina vengono dal motore (S14-A-07, S14-B-14)", () => {
    expect(fill(pf.compValues.hydration.biga)).toBe(formatPercent(preFermentFacts("biga").hydrationPct, locale));
    expect(fill(pf.compValues.hydration.poolish)).toBe(formatPercent(preFermentFacts("poolish").hydrationPct, locale));
    expect(pf.items.biga.tips.map(fill).join(" ")).toContain(values.bigaFlourPct);
    expect(pf.items.poolish.tips.map(fill).join(" ")).toContain(values.poolishFlourPct);
  });

  /* G4b-WP-02 (S14-B-07): i passi «Come si fa» non scrivono numeri; ore,
   * temperature e minuti arrivano dal motore. Il sale entra solo alla fine. */
  it("i passi di biga, poolish e autolisi: segnaposto risolti, nessuna cifra, ore e temperature del motore", () => {
    const counts = { biga: 4, poolish: 4, autolisi: 3 } as const;
    for (const id of ["biga", "poolish", "autolisi"] as const) {
      const steps = pf.items[id].steps;
      expect(steps, id).toHaveLength(counts[id]);
      expect(steps.filter((step) => literalDigits(step).length > 0), id).toEqual([]);
      expect(steps.map(fill).filter((step) => /\{\w+\}/.test(step)), id).toEqual([]);
    }
    const joined = (id: "biga" | "poolish" | "autolisi") => pf.items[id].steps.map(fill).join(" ");
    expect(joined("biga")).toContain(values.bigaHours);
    expect(joined("biga")).toContain(values.bigaTemp);
    expect(joined("poolish")).toContain(values.poolishHours);
    expect(joined("poolish")).toContain(values.poolishTemp);
    expect(joined("autolisi")).toContain(values.autolysisRest);
    expect(values.bigaHours).toContain(formatNumber(preFermentFacts("biga").hours, locale));
    for (const key of ["{flour}", "{hydration}"]) expect(pf.exampleLabel).toContain(key);
    for (const key of ["{name}", "{flour}", "{water}", "{yeast}"]) expect(pf.examplePreFerment).toContain(key);
    for (const key of ["{flour}", "{water}"]) expect(pf.exampleFinal).toContain(key);
    // La tabella di confronto (una sola, guida e ricetta) legge ogni cella senza ripieghi.
    expect(pf.compLabels).toHaveLength(6);
    for (const key of ["hydration", "yeast", "duration", "temperature", "flavor", "extensibility"]) {
      for (const id of ["biga", "poolish", "autolisi"] as const) expect(pf.compValues[key]?.[id], `${key}.${id}`).toBeTruthy();
    }
  });

  it("gli stili ideali di biga e poolish non sono testo del CMS (S14-A-01/B-13)", () => {
    expect(pf.items.biga.idealStyles).toBeUndefined();
    expect(pf.items.poolish.idealStyles).toBeUndefined();
    expect(pf.items.autolisi.idealStyles).toBeTruthy();
    expect("preFermentsBigaBest" in bundle.pages).toBe(false);
  });

  it("l'autolisi ha un occhiello suo e la riga della ricetta ha i tre segnaposto (S14-A-05, S14-A-02)", () => {
    expect(pf.techniqueLabel).toBeTruthy();
    expect(pf.techniqueLabel).not.toBe(pf.sectionLabel);
    for (const key of ["{yeast}", "{flour}", "{pct}"]) expect(pf.recipeContextLine).toContain(key);
  });
});

describe.each(Object.entries(BUNDLES))("caratteristiche degli stili e dati, %s", (_locale, bundle) => {
  /* S03-B-04: un tempo di cottura nelle caratteristiche cade nell'intervallo
   * dei dati parametrici; una W cade nella forbice dello stile. */
  it("i tempi di cottura delle caratteristiche sono quelli dei dati", () => {
    const wrong: string[] = [];
    for (const [id, chars] of Object.entries(bundle.styleChars ?? {})) {
      const bake = getStyleParametrics(id).bakingTime;
      for (const chip of chars.split("|")) {
        const m = chip.match(/(\d+)\s*[-–]?\s*(\d+)?\s*(min|分|s\b|秒)/);
        if (!m || !bake) continue;
        const toSec = (v: number) => (m[3] === "min" || m[3] === "分" ? v * 60 : v);
        const lo = toSec(Number(m[1]));
        const hi = toSec(Number(m[2] ?? m[1]));
        if (lo < bake.minSeconds || hi > bake.maxSeconds) wrong.push(`${id}: ${chip}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("le W delle caratteristiche cadono nella forbice dello stile", () => {
    const wrong: string[] = [];
    for (const [id, chars] of Object.entries(bundle.styleChars ?? {})) {
      const style = STYLES_DB[id];
      if (!style) continue;
      for (const m of chars.matchAll(/W\s*(<|>)?\s*(\d+)(?:\s*[-–]\s*(\d+))?/g)) {
        const [lo, hi] = style.dough.flour_w_range;
        const a = Number(m[2]);
        const b = Number(m[3] ?? m[2]);
        if (m[1] || a < lo || b > hi) wrong.push(`${id}: ${m[0]}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe.each(Object.entries(BUNDLES))("problemi e soluzioni senza soglie universali, %s", (_locale, bundle) => {
  /* D-I: le prevenzioni che contraddicevano gli stili (H ≤ 65%, W max 320,
   * fermentazione minima 8 h, «non oltre 400 °C») sono relative allo stile. */
  it("nessuna soglia numerica nelle prevenzioni relative allo stile", () => {
    const issues = bundle.troubleshootingI18n.issues;
    for (const id of ["P02", "P11", "P15", "P16", "P17", "P19"]) {
      expect(literalDigits(issues[id]?.prevention), `${id}.prevention`).toEqual([]);
    }
  });
});

describe("server MCP e glossario (S12-V-01)", () => {
  const glossary = MCP_TOOLS.find((tool) => tool.name === "glossary")!;
  it.each(["it", "en", "ja"])("in %s serve gli stessi fatti del motore, senza segnaposto", (lang) => {
    const values = glossaryFactValues(lang);
    const arrhenius = glossary.run({ term: "arrhenius", lang }).data as { whyImportant: string };
    expect(arrhenius.whyImportant).toContain(values.q10ComAbove);
    expect(arrhenius.whyImportant).not.toMatch(/β|\{\w+\}/);
    const aScore = glossary.run({ term: "a_score", lang }).data as { formula: string };
    expect(aScore.formula).toContain(values.authWIngredients);
    const fScore = glossary.run({ term: "f_score", lang }).data as { formula: string; ranges: { value: string }[] };
    expect(fScore.formula).toContain(values.feasWOven);
    expect(fScore.ranges[0].value).toBe(values.fBand0);
  });
});

describe("soglie dello stile per i consigli", () => {
  it("thresholdFor legge forbici e minimo del forno dallo stile", () => {
    const t = thresholdFor(STYLES_DB.teglia_romana)!;
    expect(t.hydrationPct).toEqual(STYLES_DB.teglia_romana.dough.hydration_pct_range);
    expect(t.flourW).toEqual(STYLES_DB.teglia_romana.dough.flour_w_range);
    expect(t.ovenMinC).toBe(STYLES_DB.teglia_romana.baking.temp_c_range[0]);
    expect(thresholdFor(undefined)).toBeUndefined();
  });
});
