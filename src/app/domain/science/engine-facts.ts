/* ═══ FW-05 — Fatti del motore per i testi ═══
 * Glossario, problemi e soluzioni, guida ai prefermenti e server MCP citano
 * numeri e regole del motore: qui li leggono, senza duplicarli. Un testo che
 * contiene un numero del motore usa un segnaposto interpolato da questi fatti
 * (test: content-engine-consistency.test.ts). Modulo puro: niente React,
 * CMS, browser né formattazione (le cifre si formattano nella lingua attiva
 * da chi le mostra). */

/* Solo moduli leggeri del motore (niente pizza-engine.ts): questi fatti
 * finiscono nel chunk principale con glossario e CMS (budget D-059). */
import type { PizzaStyle } from "../pizza-engine";
import {
  calculateYeastPercentage,
  fermentationSpeedRatio,
  getQ10,
  Q10_BREAKPOINT_C,
  Q10_REFERENCE_TEMP_C,
  YEAST_DRY_RATIO,
  YEAST_REFERENCE_HOURS,
  YEAST_REFERENCE_PCT,
} from "../fermentation-model";
import { doughThicknessGPerCm2 } from "../shape-geometry";
import { FLOUR_W_EXCESS_FACTOR } from "../flour-strength";
import { STYLES_DB } from "../styles-db";
import {
  AUTH_AXIS_WEIGHTS,
  AUTHENTICITY_FUEL_CAP,
  DEFAULT_UI_SCORE_WEIGHTS,
  FEAS_AXIS_WEIGHTS,
  NON_FEASIBLE_SCORE_CEILING,
  SCORE_BANDS,
} from "../recipe-score";
import { computePreFermentSplit, PRE_FERMENT_FLOUR_PCT } from "../pre-ferment-split";
/* G3-WP-03: soglie con cui il motore sceglie il testo dei passi. */
export { BASIL_BEFORE_BAKE_MAX_SEC, HIGH_HYDRATION_PCT } from "../step-thresholds";
export { FLOUR_STRENGTH_SCALE, flourFitForStyle, flourStrength, type FlourStrength } from "../flour-strength";

type Range = readonly [number, number];

/* ─── Punteggi ─── */

/** Pesi, fasce e tetti come li calcola il motore (scelte di Vulcan, D-A). */
export function scoreModelFacts() {
  return {
    authenticityWeights: AUTH_AXIS_WEIGHTS,
    feasibilityWeights: FEAS_AXIS_WEIGHTS,
    bands: SCORE_BANDS,
    authenticityFuelCap: AUTHENTICITY_FUEL_CAP,
    nonFeasibleCeiling: NON_FEASIBLE_SCORE_CEILING,
    compositeWeights: DEFAULT_UI_SCORE_WEIGHTS,
    /** Il numero finale non supera mai autenticità né il tetto di non fattibilità. */
    compositeRule: "min" as const,
  };
}

/** Le quattro fasce di un punteggio come intervalli chiusi di interi [min, max]. */
export function scoreBandRanges(type: "A" | "F" | "D"): [number, number][] {
  const [hi, mid, lo] = SCORE_BANDS[type];
  return [[hi, 100], [mid, hi - 1], [lo, mid - 1], [0, lo - 1]];
}

/* ─── Fermentazione ─── */

/** Il modello della velocità di lievitazione: Q10 a tratti continuo riferito a
 *  18 °C. Non è l'equazione di Arrhenius e non ha un β (S12-A-01/B-02). */
export function fermentationModelFacts() {
  const c = Q10_BREAKPOINT_C.commercial;
  const s = Q10_BREAKPOINT_C.sourdough;
  return {
    referenceTempC: Q10_REFERENCE_TEMP_C,
    commercial: { breakpointC: c, above: getQ10("fresh", c).q10, below: getQ10("fresh", c - 1).q10 },
    sourdough: { breakpointC: s, above: getQ10("sourdough", s + 1).q10, below: getQ10("sourdough", s).q10 },
    yeastReferencePct: YEAST_REFERENCE_PCT,
    yeastReferenceHours: YEAST_REFERENCE_HOURS,
    dryRatio: YEAST_DRY_RATIO,
  };
}

/** Ore a `tempC` equivalenti a `hoursAtReference` ore a 18 °C (lievito commerciale). */
export function equivalentHoursAt(tempC: number, hoursAtReference: number): number {
  return hoursAtReference / fermentationSpeedRatio("fresh", tempC);
}

/** Dose di lievito fresco del motore (% sulla farina) per ore e temperatura. */
export function yeastDoseFact(hours: number, tempC: number): number {
  return calculateYeastPercentage(hours, tempC, "fresh");
}

/** Scenari mostrati nel glossario: la dose cambia con ore e temperatura. */
export const YEAST_SCENARIOS: readonly { hours: number; tempC: number }[] = [
  { hours: 2, tempC: 24 },
  { hours: 8, tempC: 22 },
  { hours: YEAST_REFERENCE_HOURS, tempC: Q10_REFERENCE_TEMP_C },
  { hours: 48, tempC: 4 },
];

/* ─── Stili ─── */

export interface StyleRangeFacts {
  id: string;
  name: string;
  hydrationPct: Range;
  flourW: Range;
  flourPL: Range;
  fermentationHours: Range;
  ovenTempC: Range;
  /** Peso del panetto sull'area della forma (g/cm²), come lo calcola il motore. */
  thicknessGPerCm2: number;
  unleavened: boolean;
}

export function styleRangeFacts(styleId: string): StyleRangeFacts | undefined {
  const style = STYLES_DB[styleId];
  if (!style) return undefined;
  return {
    id: style.id,
    name: style.name,
    hydrationPct: style.dough.hydration_pct_range,
    flourW: style.dough.flour_w_range,
    flourPL: style.dough.flour_pl_range,
    fermentationHours: style.dough.fermentation_hours_range,
    ovenTempC: style.baking.temp_c_range,
    thicknessGPerCm2: doughThicknessGPerCm2(style),
    unleavened: !!style.dough.unleavened,
  };
}

/** Soglie dei consigli relative allo stile (D-I: niente regole universali). */
export interface StyleThresholds {
  hydrationPct: Range;
  flourW: Range;
  /** Oltre questa W la farina è «troppo forte» per lo stile (stessa regola della fattibilità). */
  flourWExcess: number;
  ovenMinC: number;
}

export function thresholdFor(style: Pick<PizzaStyle, "dough" | "baking"> | undefined): StyleThresholds | undefined {
  if (!style) return undefined;
  return {
    hydrationPct: style.dough.hydration_pct_range,
    flourW: style.dough.flour_w_range,
    flourWExcess: Math.round(style.dough.flour_w_range[1] * FLOUR_W_EXCESS_FACTOR),
    ovenMinC: style.baking.temp_c_range[0],
  };
}

/* ─── Farina: la scala unica vive in flour-strength.ts (riesportata sopra) ─── */

/* ─── Prefermenti ─── */

/** Stili che dichiarano il prefermento nel metodo (process_type), in ordine di catalogo. */
export function stylesDeclaringPreFerment(kind: "biga" | "poolish"): string[] {
  return Object.values(STYLES_DB)
    .filter((style) => style.dough.process_type.split("|").includes(kind))
    .map((style) => style.id);
}

export function preFermentFacts(kind: "biga" | "poolish") {
  const split = computePreFermentSplit({ flourG: 1000, waterG: 0, preFermentType: kind });
  return {
    /** Quota di farina di partenza nel prefermento (% della farina totale). */
    flourPct: PRE_FERMENT_FLOUR_PCT[kind],
    flourPctRange: [PRE_FERMENT_FLOUR_PCT.min, PRE_FERMENT_FLOUR_PCT.max] as Range,
    hydrationPct: split.hydrationPct,
    idealStyleIds: stylesDeclaringPreFerment(kind),
  };
}
