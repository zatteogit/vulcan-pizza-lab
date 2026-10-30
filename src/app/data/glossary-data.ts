/* === GLOSSARIO TECNICO — Appendice C === */
/* Basato su Notion Appendice C · Glossario Tecnico (302ed0f7e12081379cf4ce959ef2b1b3) */
/* i18n: localized getters depend on a neutral message-source contract. */

import type { GlossaryMessageSource } from "../i18n/domain-contracts";
import { withBrand } from "../config/brand";
import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS, type GlossaryCategory, type GlossaryTerm } from "./glossary-terms";
export { GLOSSARY_CATEGORIES, GLOSSARY_TERMS, LOCALIZED_FORMULA_TERMS, type GlossaryCategory, type GlossaryPage, type GlossaryTerm } from "./glossary-terms";
import { interpolate } from "../i18n/interpolate";
import { formatNumber, formatPercent, formatRange, formatTemp, formatUnit } from "../i18n/format";
import {
  FLOUR_STRENGTH_SCALE,
  equivalentHoursAt,
  fermentationModelFacts,
  preFermentFacts,
  scoreBandRanges,
  scoreModelFacts,
  styleRangeFacts,
  yeastDoseFact,
  YEAST_SCENARIOS,
  AUTOLYSIS_REST_MIN,
} from "../domain/science/engine-facts";

/** Termini raggruppati per categoria */
export function getTermsByCategory(cms?: GlossaryMessageSource): Record<GlossaryCategory, GlossaryTerm[]> {
  const map = {} as Record<GlossaryCategory, GlossaryTerm[]>;
  for (const cat of Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[]) {
    map[cat] = GLOSSARY_TERMS.map(term => term.category === cat ? getLocalizedTerm(term, cms) : term)
      .filter((term) => term.category === cat);
  }
  return map;
}

/** Trova un termine per ID (localized) */
export function getTermById(id: string, cms?: GlossaryMessageSource): GlossaryTerm | undefined {
  const term = GLOSSARY_TERMS.find((t) => t.id === id);
  return term ? getLocalizedTerm(term, cms) : undefined;
}

/* ═══ FW-05 — Fatti del motore nei testi del glossario ═══
 * I testi (default italiano e 6 lingue) contengono segnaposto come
 * {q10ComAbove} o {aBand0}: i valori arrivano da engine-facts, formattati
 * nella lingua attiva. Così glossario, ricetta e server MCP non divergono più
 * dal motore (test: domain/science/content-engine-consistency.test.ts). */

/** Stili usati come esempi negli intervalli derivati, in ordine di valore. */
export const GLOSSARY_STYLE_EXAMPLES = {
  hydration: ["chicago_deep", "napoletana_stg", "new_york", "napoletana_canotto", "pinsa_romana", "teglia_romana"],
  pl_ratio: ["tonda_romana", "teglia_romana", "napoletana_stg", "new_york", "pinsa_romana"],
  thickness_factor: ["tonda_romana", "new_york", "napoletana_stg", "teglia_romana", "chicago_deep"],
} as const;

const factCache = new Map<string, Record<string, string>>();

/** Valori dei segnaposto, formattati nella lingua `locale` (codice o BCP 47).
 *  Li usano anche la guida ai prefermenti e il server MCP. */
export function glossaryFactValues(locale = "it"): Record<string, string> {
  const cached = factCache.get(locale);
  if (cached) return cached;
  const fm = fermentationModelFacts();
  const score = scoreModelFacts();
  const num1 = (v: number) => formatNumber(v, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = (v: number) => formatPercent(v * 100, locale);
  const hours = (h: number) => formatUnit(h, "hour", locale);
  const temp = (c: number) => formatTemp(c, locale);
  const values: Record<string, string> = {
    tenDegrees: temp(10),
    q10RefTemp: temp(fm.referenceTempC),
    q10ComBreak: temp(fm.commercial.breakpointC),
    q10ComAbove: num1(fm.commercial.above),
    q10ComBelow: num1(fm.commercial.below),
    q10SdBreak: temp(fm.sourdough.breakpointC),
    q10SdAbove: num1(fm.sourdough.above),
    q10SdBelow: num1(fm.sourdough.below),
    q10ExampleRefHours: hours(fm.yeastReferenceHours),
    q10ExampleWarmTemp: temp(fm.referenceTempC + 10),
    q10ExampleWarmHours: hours(Math.round(equivalentHoursAt(fm.referenceTempC + 10, fm.yeastReferenceHours))),
    yeastDryRatio: formatNumber(fm.dryRatio, locale, { maximumFractionDigits: 2 }),
    authWIngredients: pct(score.authenticityWeights.ingredients),
    authWProcess: pct(score.authenticityWeights.process),
    authWEquipment: pct(score.authenticityWeights.equipment),
    feasWOven: pct(score.feasibilityWeights.oven),
    feasWFlour: pct(score.feasibilityWeights.flour),
    feasWSkill: pct(score.feasibilityWeights.skill),
    authFuelCap: formatNumber(score.authenticityFuelCap, locale),
    nonFeasibleCeiling: formatNumber(score.nonFeasibleCeiling, locale),
  };
  YEAST_SCENARIOS.forEach((scenario, i) => {
    values[`yeastS${i + 1}Hours`] = hours(scenario.hours);
    values[`yeastS${i + 1}Temp`] = temp(scenario.tempC);
    values[`yeastS${i + 1}Pct`] = formatPercent(yeastDoseFact(scenario.hours, scenario.tempC), locale, { maximumFractionDigits: 2 });
  });
  (["A", "F", "D"] as const).forEach((type) => {
    scoreBandRanges(type).forEach(([min, max], i) => {
      values[`${type.toLowerCase()}Band${i}`] = formatRange(min, max, locale);
    });
  });
  const bandKey = { weak: "wBandWeak", medium: "wBandMedium", strong: "wBandStrong", veryStrong: "wBandVeryStrong" } as const;
  for (const band of FLOUR_STRENGTH_SCALE) {
    values[bandKey[band.id]] = band.min === 0
      ? `< ${formatNumber(band.max, locale)}`
      : Number.isFinite(band.max)
        ? formatRange(band.min, band.max - 1, locale)
        : `≥ ${formatNumber(band.min, locale)}`;
  }
  const biga = preFermentFacts("biga");
  const poolish = preFermentFacts("poolish");
  values.bigaHydration = formatPercent(biga.hydrationPct, locale);
  values.poolishHydration = formatPercent(poolish.hydrationPct, locale);
  values.bigaFlourPct = formatPercent(biga.flourPct, locale);
  values.poolishFlourPct = formatPercent(poolish.flourPct, locale);
  values.flourPctMin = formatPercent(biga.flourPctRange[0], locale);
  values.flourPctMax = formatPercent(biga.flourPctRange[1], locale);
  /* G4b-WP-02: ore e temperature dei passi «Come si fa». */
  values.bigaHours = hours(biga.hours);
  values.poolishHours = hours(poolish.hours);
  values.bigaTemp = formatRange(biga.tempC[0], biga.tempC[1], locale, { unit: "celsius" });
  values.poolishTemp = formatRange(poolish.tempC[0], poolish.tempC[1], locale, { unit: "celsius" });
  values.autolysisRest = formatRange(AUTOLYSIS_REST_MIN[0], AUTOLYSIS_REST_MIN[1], locale, { unit: "minute" });
  factCache.set(locale, values);
  return values;
}

/** Intervalli generati dai dati degli stili: nome dello stile e forbice del motore. */
const DERIVED_RANGES: Record<string, (locale: string) => NonNullable<GlossaryTerm["ranges"]>> = {
  hydration: (locale) => GLOSSARY_STYLE_EXAMPLES.hydration.flatMap((id) => {
    const f = styleRangeFacts(id);
    return f ? [{ label: f.name, value: formatRange(f.hydrationPct[0], f.hydrationPct[1], locale, { unit: "percent" }) }] : [];
  }),
  pl_ratio: (locale) => GLOSSARY_STYLE_EXAMPLES.pl_ratio.flatMap((id) => {
    const f = styleRangeFacts(id);
    return f ? [{ label: f.name, value: formatRange(f.flourPL[0], f.flourPL[1], locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }] : [];
  }),
  thickness_factor: (locale) => GLOSSARY_STYLE_EXAMPLES.thickness_factor.flatMap((id) => {
    const f = styleRangeFacts(id);
    return f ? [{ label: f.name, value: formatNumber(f.thicknessGPerCm2, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }] : [];
  }),
};

function fill(text: string, values: Record<string, string>): string {
  return withBrand(interpolate(text, values));
}

/** FW-04 (revisione): i numeri scritti nelle tabelle dei valori (conducibilità,
 *  falling number) seguono la lingua attiva: «2,5–3,5» in italiano, «8–12 h»
 *  e non «8-12h». Nessun numero cambia, solo la scrittura. */
export function localizeRangeText(text: string, locale: string): string {
  return text
    .replace(/(\d+)-(\d+)\s?h\b/g, (_m, a: string, b: string) => formatRange(Number(a), Number(b), locale, { unit: "hour" }))
    .replace(/\d+\.\d+/g, (n) => {
      const digits = n.split(".")[1].length;
      return formatNumber(Number(n), locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    });
}

/* === i18n: LOCALIZED GETTERS === */

/** Return localized term content (falls back to Italian hardcoded) */
export function getLocalizedTerm(term: GlossaryTerm, cms?: GlossaryMessageSource): GlossaryTerm {
  const loc = cms?.glossaryTerms?.terms?.[term.id];
  const locale = cms?.locale?.id ?? "it";
  const values = glossaryFactValues(locale);
  const ranges = DERIVED_RANGES[term.id]?.(locale)
    ?? (loc?.ranges?.length
      // la chiave della fascia (scala della W) viene dai dati, non dal testo
      ? loc.ranges.map((range, i) => ({ ...range, key: term.ranges?.[i]?.key }))
      : term.ranges);
  const whyImportant = loc?.whyImportant ?? term.whyImportant;
  const formula = loc?.formula ?? term.formula;
  const plainDefinition = loc?.plainDefinition ?? term.plainDefinition;
  return {
    ...term,
    name: loc?.name ?? term.name,
    ...(plainDefinition !== undefined ? { plainDefinition: fill(plainDefinition, values) } : {}),
    definition: fill(loc?.definition ?? term.definition, values),
    ...(whyImportant !== undefined ? { whyImportant: fill(whyImportant, values) } : {}),
    ...(formula !== undefined ? { formula: fill(formula, values) } : {}),
    ...(ranges ? {
      ranges: ranges.map((range) => ({
        ...range,
        label: fill(range.label, values),
        value: localizeRangeText(fill(range.value, values), locale),
        ...(range.note ? { note: localizeRangeText(fill(range.note, values), locale) } : {}),
      })),
    } : {}),
  };
}
