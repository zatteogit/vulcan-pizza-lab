import { passiveActivityMessage } from "../../domain/pizza-engine";
/* ═══ RECIPE OUTPUT — helper puri (estratti dall'audit lug 2026) ═══
 * Formattazione, clock, ottimizzatore comodità, localizzazione step.
 * Nessun JSX: solo funzioni pure riusate da recipe-output e dalle sue sezioni. */

import type { CmsContent, CmsTimelineStep } from "../cms/cms-context";
import { createFormatter, formatTemperatureCopy, t } from "../cms/i18n";
import { engineMsgTexts } from "./engine-msg-text";
import { formatDuration, formatMass, formatPercent, formatTemp as formatTempLocale } from "../../i18n/format";
import { getScienceNote } from "../../data/science-notes";
import { roundForEvidence } from "../../domain/science/evidence";
import { getActiveUiLocale } from "../../i18n/ui-messages";
import { localizeToppingStepText } from "../../data/topping-i18n/localize";
import { FLEXIBLE_STEP_IDS } from "../cooking/cook-session";
import { computePreFermentSplit } from "../../domain/pre-ferment-split";
import {
  getBakingTimeByStyle,
  getEquipmentByStyle,
  getFoldingByStyle,
  getScoringByStyle,
  getToppingByStyle,
} from "../../data/parametric-databases";
import {
  type GeneratedRecipe,
  type PizzaStyle,
  type TimelineStep,
  type EngineMsg,
  type OvenType,
  fermentationSpeedRatio,
  getLayoutSpec,
  getServingUnit,
  isFillingStyle,
  SERVING_UNIT_LABELS,
} from "../../domain/pizza-engine";
import {
  AUTHENTICITY_META,
  type AuthenticityScore,
  type IngredientSection,
  type ToppingIngredient,
} from "../../data/topping-library";

/* ═══ PARAMETRIC CONTEXT TIPS ═══ */

/** Forno e cottura della ricetta generata. I dati parametrici descrivono la
 *  cottura di riferimento dello stile (es. 60–90 s a 485 °C): con la ricetta
 *  il consiglio usa la stima del motore per il forno dell'utente, mai il
 *  riferimento (audit 28/10/2026, S09-A-01; FW-07). */
export interface ParametricTipContext {
  /** Temperatura del forno usata dal motore, °C. */
  ovenTempC: number;
  /** Secondi di una cottura nel forno dell'utente (GeneratedRecipe.cook_time_sec). */
  cookSec: number;
  /** Temperature già formattate nell'unità dell'utente. */
  ovenTempLabel: string;
  referenceTempLabel: string;
  /** FW-07: tipo di forno della cucina effettiva (regola delle rotazioni). */
  ovenType?: OvenType;
  /** FW-07: passo di frittura, senza forno né rotazioni. */
  frying?: boolean;
}

/** FW-07: forni con la fiamma o il calore da un lato, dove la pizza si
 *  ruota spesso; negli altri basta girarla una volta a metà. È la stessa
 *  regola dei testi di cottura del motore (timeline.oven.*). */
const FREQUENT_TURN_OVENS: readonly OvenType[] = ["wood", "coal", "gas_pizza"];

/** FW-07: secondi di UNA cottura del passo bake (con i giri, D-050). */
export function bakeSecondsPerRound(step: TimelineStep, recipeCookSec: number): number {
  const rounds = step.msg?.description?.find((m) => m.key === "timeline.bake.rounds")?.params?.sec;
  if (typeof rounds === "number") return rounds;
  // Un condimento può allungare la cottura (bake_adjustments): il passo lo sa.
  return Math.abs(step.duration_minutes * 60 - recipeCookSec) < 60 ? recipeCookSec : step.duration_minutes * 60;
}

export function getParametricTip(
  stepId: string,
  styleId: string,
  isNerd: boolean,
  pt: CmsContent["parametricTips"],
  ctx?: ParametricTipContext,
  text?: CmsContent["parametricText"],
): string | null {
  switch (stepId) {
    case "mix": {
      const eq = getEquipmentByStyle(styleId);
      if (!eq) return null;
      const mixer = eq.mixerRequired
        ? (eq.mixerType === "planetaria" ? pt.mixerPlanetaria : eq.mixerType)
        : pt.mixerHand;
      // L'attrezzatura dello stile (forno, teglia, pala) non riguarda l'impasto:
      // nel passo Impasto diceva «Forno a legna/gas >430°C» anche a chi ha il
      // forno di casa (audit 28/10/2026, S09-A-01).
      return isNerd
        ? t(pt.mixNerd, { mixer, time: eq.mixingTime_min, note: eq.note })
        : t(pt.mixBeginner, { mixer, time: eq.mixingTime_min, equipment: "" }).trim();
    }
    case "bulk": {
      const fold = getFoldingByStyle(styleId);
      if (!fold || fold.foldCount === 0) return null;
      const foldName = text?.fold?.[fold.foldType] ?? fold.foldType.replace(/_/g, " ");
      if (isNerd) {
        return t(pt.bulkNerd, {
          count: fold.foldCount,
          type: foldName,
          interval: fold.foldInterval_min,
          note: fold.note,
        });
      }
      return t(pt.bulkBeginner, {
        count: fold.foldCount,
        type: foldName,
        interval: fold.foldInterval_min,
      });
    }
    case "shape": {
      const sc = getScoringByStyle(styleId);
      if (!sc || !sc.scoringRequired) return null;
      return isNerd
        ? t(pt.shapeNerd, { type: sc.scoringType, depth: sc.scoringDepth_mm, timing: sc.scoringTiming, note: sc.note })
        : t(pt.shapeBeginner, { note: sc.note });
    }
    case "top": {
      const top = getToppingByStyle(styleId);
      if (!top) return null;
      // Sanifica gli ID con underscore (es. "salsa_sopra" \u2192 "salsa sopra")
      const order = top.toppingOrder.map((x) => x.replace(/_/g, " ")).join(" \u2192 ");
      return isNerd
        ? t(pt.topNerd, { order, saucePos: top.saucePosition, cheeseType: top.cheeseType, cheesePos: top.cheesePosition.replace(/_/g, " "), note: top.note })
        : t(pt.topBeginner, { order, note: top.note });
    }
    case "bake": {
      const bt = getBakingTimeByStyle(styleId);
      // FW-07 (S09-A-01): senza la ricetta calcolata non si sa in che forno
      // si cuoce, e i tempi di riferimento dello stile (BAKING_TIME_DB) non
      // diventano mai un consiglio: nessun consiglio.
      if (!bt || !ctx || ctx.frying) return null;
      // Il tempo è la stima del motore per il forno dell'utente (±20 %, è
      // una stima) e la rotazione segue il tipo di forno; il riferimento
      // dello stile resta visibile solo come confronto, in modalità Nerd.
      const minM = Math.max(1, Math.floor((ctx.cookSec * 0.8) / 60));
      const maxM = Math.max(minM + 1, Math.ceil((ctx.cookSec * 1.2) / 60));
      if (isNerd) {
        return t(pt.bakeAdaptedNerd, {
          temp: ctx.ovenTempLabel,
          minM,
          maxM,
          refMin: bt.minSeconds,
          refMax: bt.maxSeconds,
          refTemp: ctx.referenceTempLabel,
        });
      }
      const turnsNote = bt.turns === 0
        ? pt.turnsNone
        : ctx.ovenType && FREQUENT_TURN_OVENS.includes(ctx.ovenType) ? pt.turnsFrequent : pt.turnsHalfway;
      return t(pt.bakeBeginner, { minM, maxM, turnsNote });
    }
    default:
      return null;
  }
}


/* ═══ CLOCK HELPERS ═══ */

/** Audit totale n. 2: senza un pasto scelto il piano partiva «adesso» e la
 *  pizza usciva alle 3 di notte. Ora si ancora al primo pranzo (12:30) o
 *  cena (20:00) raggiungibile, come gli slot di Crea, e si parte
 *  all'indietro. */
export function defaultMealStart(totalMinutes: number, now: Date = new Date()): Date {
  let firstReachable: Date | null = null;
  for (let day = 0; day < 8; day++) {
    for (const [h, m] of [[12, 30], [20, 0]] as const) {
      const meal = new Date(now);
      meal.setDate(meal.getDate() + day);
      meal.setHours(h, m, 0, 0);
      const start = new Date(meal.getTime() - totalMinutes * 60_000);
      if (start.getTime() < now.getTime()) continue;
      firstReachable ??= start;
      // Anche l'impasto va fatto di giorno: si scarta un inizio fra le 22 e le 7.
      const sh = start.getHours();
      if (sh >= 7 && sh < 22) return start;
    }
  }
  return firstReachable ?? roundToQuarter(now);
}

export function roundToQuarter(date: Date): Date {
  const d = new Date(date);
  const mins = d.getMinutes() + (d.getSeconds() > 0 || d.getMilliseconds() > 0 ? 0.001 : 0);
  const rounded = Math.ceil(mins / 15) * 15;
  d.setMinutes(rounded, 0, 0);
  return d;
}

/** Precisione del riepilogo: le stime biologiche si leggono ai quarti d'ora.
 * È solo presentazione: gli istanti del programma e i target scelti restano precisi. */
export function readyTimeForDisplay(date: Date, approximate: boolean): Date {
  return approximate ? new Date(Math.round(date.getTime() / 900_000) * 900_000) : date;
}

/** Una scadenza si calcola a ritroso senza arrotondare in avanti l'inizio. */
export function startForDeadline(meal: Date, totalMinutes: number, now = new Date()): Date {
  return new Date(Math.max(now.getTime(), meal.getTime() - totalMinutes * 60_000));
}
export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}
export function shiftQuarter(date: Date, direction: number): Date {
  return new Date(date.getTime() + direction * 15 * 60 * 1000);
}

/* ═══ Cross-day helpers ═══ */

/** Day offset between two dates (calendar-day based, handles midnight correctly) */
export function dayOffset(reference: Date, target: Date): number {
  const refDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const tgtDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((tgtDay.getTime() - refDay.getTime()) / (24 * 60 * 60 * 1000));
}

/** Day suffix: "" for same day, " domani" for next day, " dopodomani" for +2, " +N giorni" oltre.
 * Si evita "+1g" perché "g" in un'app di pizza è ambiguo (grammi). */
export function daySuffix(
  reference: Date,
  target: Date,
  copy?: CmsContent["cooking"],
): string {
  const d = dayOffset(reference, target);
  if (d === 0) return "";
  if (d === 1) return ` ${copy?.dayTomorrow ?? "domani"}`;
  if (d === 2) return ` ${copy?.dayAfterTomorrow ?? "dopodomani"}`;
  return ` ${t(copy?.dayOffset ?? "+{n} giorni", { n: d })}`;
}

/** Clock time with optional day offset badge: "14:30" or "14:30 +1g" */
function clockWithDay(
  date: Date,
  reference: Date,
  bcp47: string,
  copy?: CmsContent["cooking"],
): string {
  const hhmm = date.toLocaleTimeString(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return hhmm + daySuffix(reference, date, copy);
}

/** Tutte le viste usano gli stessi istanti. «ca.» indica la variabilità
 * biologica delle fasi flessibili, senza spostarle rispetto alla fase prima. */
export function displayStepTime(
  stepId: string,
  date: Date,
  reference: Date,
  bcp47: string,
  copy?: CmsContent["cooking"],
): string {
  const approx = copy?.approxPrefix ?? "ca. ";
  if (!FLEXIBLE_STEP_IDS.has(stepId)) {
    return clockWithDay(date, reference, bcp47, copy);
  }
  return `${approx}${clockWithDay(date, reference, bcp47, copy)}`;
}

function normalizeTemperatureUnitSuffixes(text: string): string {
  return text.replace(/(°[CF])\s*(?:°C|℃)\b/g, "$1");
}

export function normalizeMeasureUnitSuffixes(text: string): string {
  return normalizeTemperatureUnitSuffixes(text)
    .replace(/(\d+(?:[.,]\d+)?\s*g)\s*g\b/g, "$1");
}

/* ═══ OTTIMIZZATORE COMODITÀ (feedback giugno 2026) ═══
 * "A volte non fa niente se l'impasto resta in frigo un'ora in più, ma magari
 * non ti devi alzare alle 5." Le fasi flessibili si stirano/accorciano entro
 * tolleranze tecniche per portare le fasi ATTIVE in orari umani, tenendo
 * fisso l'orario del pasto (la fine non si tocca). */

const ACTIVE_STEP_IDS = new Set([
  "mix", "divide", "shape", "top", "bake", "preheat",
  "stack", "fill_internal", "split_fill", "top_post", "bake2",
]);

function isNightHour(h: number): boolean {
  return h >= 23 || h < 7;
}

export function countNightActives(
  timeline: TimelineStep[],
  startMs: number,
  stretch: Record<number, number>,
): number {
  let cursor = startMs;
  let count = 0;
  timeline.forEach((step, i) => {
    if (ACTIVE_STEP_IDS.has(step.id) && isNightHour(new Date(cursor).getHours())) count++;
    cursor += (step.duration_minutes + (stretch[i] ?? 0)) * 60_000;
  });
  return count;
}

interface ComfortPlan {
  stretch: Record<number, number>;
  newStart: Date;
  nightCount: number;
  totalExtra: number;
}

export function optimizeComfort(
  timeline: TimelineStep[],
  startTime: Date,
  fermentTempC: number,
  now: Date = new Date(),
): ComfortPlan | null {
  const baseNight = countNightActives(timeline, startTime.getTime(), {});
  if (baseNight === 0) return null;

  const flexIdx = timeline
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => FLEXIBLE_STEP_IDS.has(s.id) && s.duration_minutes >= 45)
    .map(({ i }) => i);
  if (flexIdx.length === 0) return null;

  const cold = fermentTempC <= 6;
  const optionsFor = (i: number): number[] => {
    const dur = timeline[i].duration_minutes;
    /* In frigo la maturazione tollera molto: fino a +50% (max 6h) e -25%
     * (max 4h) — su 14h di frigo, ±2-3h non cambiano la pizza. A temperatura
     * ambiente i margini sono stretti: +30% (max 2h), -20% (max 90').
     * Passi da 30'. */
    const maxExtra = Math.min(cold ? dur * 0.5 : dur * 0.3, cold ? 360 : 120);
    const maxShrink = cold
      ? Math.min(dur * 0.25, 240)
      : Math.min(dur * 0.2, 90);
    const opts: number[] = [];
    for (let e = -Math.floor(maxShrink / 30) * 30; e <= maxExtra; e += 30) opts.push(e);
    return opts;
  };

  /* Cartesiano sui (pochi) step flessibili */
  let combos: Record<number, number>[] = [{}];
  for (const i of flexIdx) {
    const next: Record<number, number>[] = [];
    for (const c of combos) {
      for (const e of optionsFor(i)) next.push({ ...c, [i]: e });
    }
    combos = next;
    if (combos.length > 25_000) break;
  }

  const totalBase = timeline.reduce((s, st) => s + st.duration_minutes, 0);
  const endMs = startTime.getTime() + totalBase * 60_000; // il pasto NON si sposta
  let best: ComfortPlan | null = null;
  let bestScore = Infinity;

  for (const c of combos) {
    const totalExtra = Object.values(c).reduce((a, b) => a + b, 0);
    // Inizio su quarti d'ora: gli orari proposti devono essere umani
    const newStartMs =
      Math.round((endMs - (totalBase + totalExtra) * 60_000) / 900_000) * 900_000;
    if (newStartMs < now.getTime() - 5 * 60_000) continue; // non si parte nel passato
    const night = countNightActives(timeline, newStartMs, c);
    const score = night * 100_000 + Math.abs(totalExtra);
    if (score < bestScore) {
      bestScore = score;
      best = { stretch: c, newStart: new Date(newStartMs), nightCount: night, totalExtra };
    }
  }

  /* Onestà prima di tutto: proponiamo il piano solo se AZZERA le fasi attive
   * notturne. Un miglioramento parziale ("ti svegli alle 2:30 invece che
   * alle 3") non mantiene la promessa "sistemalo per me". */
  if (!best || best.nightCount > 0) return null;
  best.stretch = Object.fromEntries(
    Object.entries(best.stretch).filter(([, v]) => v !== 0),
  ) as Record<number, number>;
  if (Object.keys(best.stretch).length === 0) return null;
  return best;
}

/** Vista Semplice: la forza farina in parole, non in sigle (audit roleplay). */
export function engineMessage(cms: CmsContent | undefined, key: string, fallback: string): string {
  return cms?.engineMessages?.[key] ?? fallback;
}

export function authenticityLabel(score: AuthenticityScore, cms: CmsContent | undefined): string {
  return engineMessage(cms, `topping.auth.${score}`, AUTHENTICITY_META[score].label);
}

/** "Condimento" per le pizze normali, "Farcitura" per quelle farcite. */
export function toppingSectionLabel(style: PizzaStyle, cms: CmsContent): string {
  return isFillingStyle(style)
    ? cms.cooking.fillingTitle ?? cms.cooking.toppingTitle
    : cms.cooking.toppingTitle;
}

/** Audit n. 11 (B-24): una sola scala della forza (W) per tutta l'app; prima
 *  il selettore semplice chiamava «Media» la W 300 che gli ingredienti
 *  chiamavano «forte». */
export type FlourStrength = "weak" | "medium" | "strong" | "veryStrong";

export function flourStrength(w: number): FlourStrength {
  if (w < 220) return "weak";
  if (w < 280) return "medium";
  if (w < 330) return "strong";
  return "veryStrong";
}

export function flourStrengthLabel(w: number, cms: CmsContent | undefined): string {
  switch (flourStrength(w)) {
    case "weak": return engineMessage(cms, "hint.flourWeak", "farina debole (00 classica)");
    case "medium": return engineMessage(cms, "hint.flourMedium", "farina di media forza");
    case "strong": return engineMessage(cms, "hint.flourStrong", "farina forte (per pizza)");
    default: return engineMessage(cms, "hint.flourVeryStrong", "farina molto forte (manitoba)");
  }
}

/** Delta in grammi di una compensazione forno espressa in % sulla farina
 * (idratazione/olio/zucchero) — rende dinamico il "+X%" mostrando anche la
 * quantità reale, come per il tip zucchero (lug 2026). Vuoto per compensazioni
 * non additive (tempo cottura, spessore). */
export function compGramsSuffix(
  c: { type: string; original: number; compensated: number },
  flourG: number,
): string {
  if (!["hydration", "oil", "sugar"].includes(c.type)) return "";
  const g = Math.round((flourG * (c.compensated - c.original)) / 100);
  /* FW-11: grammi con lo spazio e i decimali della lingua. */
  return g > 0 ? ` · ≈ +${formatMass(g, getActiveUiLocale())}` : "";
}

const YEAST_NOTE = getScienceNote("yeast-dose");

/** Dose di lievito in baker's % con la precisione dichiarata dal registro
 *  (yeast-dose, displayDecimals 2): 0,03 % di secco non diventa «0 %». */
export function yeastBakerPctText(pct: number, locale: string): string {
  return formatPercent(roundForEvidence(pct, YEAST_NOTE), locale, {
    maximumFractionDigits: YEAST_NOTE?.uncertainty?.displayDecimals ?? 2,
  });
}

/** Le microdosi richiedono una bilancia di precisione, senza sostituire il peso. */
export function yeastPracticalHint(grams: number, type: string, cms: CmsContent | undefined): string | undefined {
  if (grams <= 0) return undefined;
  if (grams < 1) return engineMessage(cms, "hint.yeastPrecisionScale", "Usa una bilancia da 0,01 g");
  if (type === "dry") {
    if (grams >= 5) return undefined; // pesabile con precisione sufficiente
    if (grams <= 1.8) return engineMessage(cms, "hint.yeastDryHalfTsp", "≈ ½ cucchiaino");
    if (grams <= 3.5) return engineMessage(cms, "hint.yeastDryOneTsp", "≈ 1 cucchiaino raso");
    return engineMessage(cms, "hint.yeastDryOneHalfTsp", "≈ 1 cucchiaino e ½");
  }
  if (type === "fresh") {
    const whole = Math.round(grams);
    if (grams >= 10 || whole === grams) return undefined; // già pesabile/intero
    return t(engineMessage(cms, "hint.yeastFreshWeighable", "≈ {g} g sulla bilancia da cucina"), { g: whole });
  }
  return undefined; // madre: pesabile, nessuna nota
}

function honestDurationMinutes(minutes: number): number {
  return minutes <= 0 ? 0 : Math.max(1, Math.round(minutes));
}

/** Durate del programma al minuto, coerenti con gli orari della guida. */
export function fmtDuration(minutes: number, fmt?: ReturnType<typeof createFormatter>): string {
  const roundedMinutes = honestDurationMinutes(minutes);
  if (roundedMinutes <= 0) return "";
  if (fmt) return fmt.durationMinutes(roundedMinutes);
  /* FW-11 (S10-B-17): lo stesso formato di fmt.durationMinutes. */
  return formatDuration(roundedMinutes, getActiveUiLocale());
}

/* ═══ Clipboard helpers ═══ */
export function copyToClipboard(text: string, onSuccess: () => void) {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    navigator.clipboard
      .writeText(text)
      .then(onSuccess)
      .catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
}
export function fallbackCopy(text: string, onSuccess: () => void) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    onSuccess();
  } catch {
    /* silently fail */
  }
}

/* VPL-013: format compensation values with appropriate units */
export function formatCompVal(type: string, val: number): string {
  if (type.includes("hydration")) return `${val.toFixed(1)}%`;
  if (type.includes("oil") || type.includes("fat") || type.includes("sugar")) return `${val.toFixed(1)}%`;
  if (type.includes("time") || type.includes("cook")) return `${Math.round(val)}s`;
  if (type.includes("thickness")) return `×${val.toFixed(2)}`;
  return String(Math.round(val * 100) / 100);
}

/* ═══ I18N-2 — passi con testi a chiave e passi dei condimenti ═══ */
function localizeKeyedStep(
  step: TimelineStep,
  cms: CmsContent,
  bcp47: string,
): { title: string; description: string; tip?: { beginner: string; nerd: string } } | null {
  const toppingTr = cms.toppingI18n;
  const text = (msg: EngineMsg) =>
    msg.key === "topping.bakeNote"
      ? (toppingTr?.recipes[String(msg.params?.toppingId)]?.bake_note ?? msg.fallback)
      : engineMsgTexts([msg], cms, bcp47)[0];
  if (step.msg) {
    return {
      title: step.msg.title ? text(step.msg.title) : step.title,
      description: step.msg.description ? step.msg.description.map(text).join(" ") : step.description,
      tip: step.msg.tip
        ? { beginner: text(step.msg.tip.beginner), nerd: text(step.msg.tip.nerd) }
        : step.tip,
    };
  }
  // Passo di un condimento (assembly / pre_prep): si riconosce dall'id.
  const topping = localizeToppingStepText(step.id, toppingTr);
  if (topping) {
    return {
      title: topping.title ?? step.title,
      description: topping.description ?? step.description,
      tip: step.tip
        ? { beginner: topping.tipBeginner ?? step.tip.beginner, nerd: topping.tipNerd ?? step.tip.nerd }
        : undefined,
    };
  }
  return null;
}

/* ═══ Timeline step localization ═══ */
export function localizeStep(
  step: TimelineStep, recipe: GeneratedRecipe, cms: CmsContent, fmt?: ReturnType<typeof createFormatter>,
) {
  const localized = localizeStepBase(step, recipe, cms, fmt);
  const activity = passiveActivityMessage(step);
  if (!activity) return localized;
  const note = engineMsgTexts([activity], cms, fmt?.bcp47 ?? "it-IT")[0];
  return { ...localized, description: `${localized.description} ${note}` };
}

function localizeStepBase(
  step: TimelineStep,
  recipe: GeneratedRecipe,
  cms: CmsContent,
  fmt?: ReturnType<typeof createFormatter>,
): { title: string; description: string; longDesc?: string; tip?: { beginner: string; nerd: string } } {
  const formatRawStep = (raw: TimelineStep) => {
    // I18N-2: testi del motore con chiave → CMS nella lingua attiva.
    const keyed = localizeKeyedStep(raw, cms, fmt?.bcp47 ?? "it-IT");
    if (keyed) return keyed;
    if (!fmt) return raw;
    return {
      ...raw,
      description: normalizeTemperatureUnitSuffixes(formatTemperatureCopy(raw.description, fmt)),
      tip: raw.tip
        ? {
            beginner: normalizeTemperatureUnitSuffixes(formatTemperatureCopy(raw.tip.beginner, fmt)),
            nerd: normalizeTemperatureUnitSuffixes(formatTemperatureCopy(raw.tip.nerd, fmt)),
          }
        : undefined,
    };
  };
  const labels = cms.timelineLabels;
  if (!labels) return formatRawStep(step);

  const isNoKnead = recipe.style.dough.process_type.includes("no_knead");
  const isCold = recipe.fermentation_temp_c <= 6;
  const isRect = recipe.style.shape.shape_type === "rectangular";
  const isThin = recipe.style.crust_type === "crispy_thin";
  // Audit motore 2026-05: lo step "Cottura" deve riflettere la temperatura
  // effettiva del forno utente (recipe.oven_temp_c), non quella ideale dello
  // stile. Prima usava temp_c_ideal e diceva "Cuocere a 485°C" anche con
  // forno domestico 250°C.
  const bakeTemp = Math.round(recipe.oven_temp_c);
  const fermTemp = recipe.fermentation_temp_c;
  // ENG-2: stesso fattore di velocità del motore (Q10 a tratti continuo), non
  // più Math.pow(2, …) fisso. Decimale della lingua (0,4 in italiano), una cifra.
  const fermRatio = fermentationSpeedRatio(recipe.yeast_type, fermTemp);
  const fermFactor = fmt
    ? fmt.number(fermRatio, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : fermRatio.toFixed(1);
  const isUnleavened = !!recipe.style.dough.unleavened;
  /* Audit totale n. 3: il tipo viene dalla ricetta, come lo scorporo degli
   * ingredienti (prima «direct|biga|poolish» diventava poolish qui e biga là). */
  const prefType = recipe.pre_ferment_type === "biga" ? "biga" : "poolish";
  const formatTemp = (value: number) =>
    fmt ? fmt.celsius(value) : formatTempLocale(Math.round(value), getActiveUiLocale());

  // Sprint 11 Fase 1: con layout speciale, gli step shape/divide/bake hanno
  // descrizioni layout-aware nel motore. Skippiamo la localizzazione CMS per quegli step
  // così non sovrascrive il testo specifico (Baciata, Ciaccino, Scaccia, Recco).
  const layout = getLayoutSpec(recipe.style);
  const hasSpecialLayout = layout.type !== "single";

  let entry: CmsTimelineStep | undefined;

  switch (step.id) {
    case "preferment":
      entry = labels.preferment;
      break;
    case "mix":
      // Audit role-play giugno 2026 (punto 2): per gli impasti lavorati il motore
      // genera testo specifico per l'impastatrice scelta (planetaria/spirale/
      // forcella/a mano), con tempi e consigli diversi. Bypassiamo il CMS — che
      // ha solo una stringa generica — per non perderlo. No-knead resta da CMS.
      if (!isNoKnead) return formatRawStep(step);
      entry = labels.mix_noknead || labels.mix;
      break;
    case "bulk":
      // Impasto non lievitato (Recco): è un riposo, non una lievitazione (ENG-5).
      entry = isUnleavened
        ? (labels.rest || labels.bulk)
        : isCold ? (labels.bulk_cold || labels.bulk) : labels.bulk;
      break;
    case "divide": {
      // Con layout multi-piece, motore già genera desc specifica
      if (hasSpecialLayout && (layout.pieces_per_unit ?? 1) > 1) return formatRawStep(step);
      // Teglia/pala/focaccia: staglio delicato, niente pirlatura stretta.
      const unit = getServingUnit(recipe.style);
      const isGentle = unit === "teglia" || unit === "pala" || unit === "focaccia";
      entry = isGentle ? (labels.divide_teglia || labels.divide) : labels.divide;
      break;
    }
    case "proof":
      if (recipe.style.method_profile?.id === "apiter_teglia") {
        const specific = formatRawStep(step);
        return { ...specific, title: labels.proof?.title ?? specific.title,
          tip: { beginner: labels.proof?.tipBeginner ?? specific.tip?.beginner ?? "",
            nerd: labels.proof?.tipNerd ?? specific.tip?.nerd ?? "" } };
      }
      entry = isUnleavened
        ? (labels.rest || labels.proof)
        : step.variant === "pan"
          ? (labels.proof_pan || labels.proof)
          : labels.proof;
      break;
    case "shape":
      if (recipe.style.method_profile?.id === "apiter_teglia") return formatRawStep(step);
      // Audit totale n. 7: stesura in teglia prima dell'appretto, testo del motore.
      if (step.variant === "pan") return formatRawStep(step);
      // Con layout speciale, motore già genera desc specifica per il tipo di stesura
      if (hasSpecialLayout) return formatRawStep(step);
      entry = isThin ? (labels.shape_thin || labels.shape) : (isRect && labels.shape?.descAlt) ? labels.shape : labels.shape;
      break;
    case "top":
      entry = labels.top;
      break;
    case "preheat": {
      // M-6: per gli stili fritti il passo è l'olio, non il forno.
      if (step.variant === "oil") {
        return {
          title: engineMessage(cms, "timeline.heatOil.title", "Olio a temperatura"),
          description: t(
            engineMessage(
              cms,
              "timeline.heatOil.desc",
              "Scalda l'olio (almeno 5 cm, in una pentola dai bordi alti) a {temp} e controllalo con un termometro. Intanto i panetti finiscono l'appretto.",
            ),
            { temp: formatTemp(recipe.style.baking.temp_c_ideal) },
          ),
          tip: step.tip
            ? {
                beginner: engineMessage(cms, "timeline.heatOil.tipBeginner", step.tip.beginner),
                nerd: engineMessage(cms, "timeline.heatOil.tipNerd", step.tip.nerd),
              }
            : undefined,
        };
      }
      const equipmentNote = step.description.includes("pietra o acciaio")
        ? engineMessage(cms, "timeline.preheat.equipmentNote", " (pietra o acciaio già dentro)")
        : "";
      // ENG-5: cosa fanno i panetti mentre il forno scalda dipende dal piano
      // del motore (appretto lungo, appretto corto, impasto non lievitato).
      const preheatDesc =
        recipe.style.proof_in_pan && step.variant !== "during_rest"
          ? step.variant === "whole_proof"
            ? engineMessage(
                cms,
                "timeline.preheat.descPanWholeProof",
                "Accendi ora il forno a {temp}{equipmentNote}. Intanto l'impasto fa l'appretto in teglia.",
              )
            : engineMessage(
                cms,
                "timeline.preheat.descPan",
                "Accendi ora il forno a {temp}{equipmentNote}. Intanto l'impasto finisce l'appretto in teglia.",
              )
          : step.variant === "whole_proof"
          ? engineMessage(
              cms,
              "timeline.preheat.descWholeProof",
              "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti fanno l'appretto.",
            )
          : step.variant === "during_rest"
            ? engineMessage(
                cms,
                "timeline.preheat.descDuringRest",
                "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti riposano.",
              )
            : engineMessage(
                cms,
                "timeline.preheat.desc",
                "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti finiscono l'appretto.",
              );
      return {
        title: engineMessage(cms, "timeline.preheat.title", "Preriscalda il forno"),
        description: t(preheatDesc, { temp: formatTemp(bakeTemp), equipmentNote }),
        tip: step.tip
          ? {
              beginner: engineMessage(
                cms,
                "timeline.preheat.tipBeginner",
                "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
              ),
              nerd: t(
                engineMessage(
                  cms,
                  "timeline.preheat.tipNerd",
                  "La massa termica della superficie domina il primo minuto di cottura: {minutes} min di soak assicurano che pietra/acciaio siano saturi, non solo l'aria del forno.",
                ),
                { minutes: step.duration_minutes },
              ),
            }
          : undefined,
      };
    }
    case "bake":
      if (step.variant === "fry") {
        return {
          title: engineMessage(cms, "timeline.fry.title", "Frittura"),
          description: t(
            engineMessage(
              cms,
              "timeline.fry.desc",
              "Friggi una pizza alla volta a {temp} per {time}, girandola a metà con una schiumarola. Scolala su carta assorbente.",
            ),
            {
              temp: formatTemp(recipe.style.baking.temp_c_ideal),
              time: fmt ? fmt.cookTime(recipe.cook_time_sec) : step.timing_label,
            },
          ),
          tip: step.tip
            ? {
                beginner: engineMessage(cms, "timeline.fry.tipBeginner", step.tip.beginner),
                nerd: engineMessage(cms, "timeline.fry.tipNerd", step.tip.nerd),
              }
            : undefined,
        };
      }
      // Con cook_mode "white_then_top", il motore genera "Prima cottura (in bianco)" custom
      if (layout.cook_mode === "white_then_top") return formatRawStep(step);
      // Audit role-play giugno 2026 (punto 2): il motore aggiunge il setup forno
      // specifico per tipo (resistenze, ripiano, grill finale, pietra). Bypassiamo
      // il CMS per mostrarlo invece del solo "Cuocere a {temp}".
      return formatRawStep(step);
    default:
      return formatRawStep(step);
  }

  if (!entry) return formatRawStep(step);

  // L'appretto avviene a temperatura ambiente anche con maturazione in frigo:
  // il motore usa max(fermTemp, 18) — qui dobbiamo fare lo stesso, altrimenti
  // il sottotitolo dice "a 4°C" mentre il testo dice "temperatura ambiente".
  const proofTemp = Math.max(fermTemp, 18);
  const vars: Record<string, string | number> = {
    temp: formatTemp(step.id === "proof" ? proofTemp : fermTemp),
    refTemp: formatTemp(18),
    fridgeTemp: formatTemp(4),
    type: prefType,
    factor: fermFactor,
    /* Durata del passo dalla timeline; temperatura e idratazione del tipo di
     * pre-fermento (fonti in docs/ricerca/prefermenti-fonti-2026-10-24.md). */
    /* al quarto d'ora, come la durata mostrata sopra il passo */
    hours: fmt
      ? fmt.durationMinutes(Math.round(step.duration_minutes))
      : fmtDuration(step.duration_minutes),
    prefTemp: prefType === "biga" ? `${formatTemp(18)}–${formatTemp(20)}` : `${formatTemp(20)}–${formatTemp(22)}`,
    prefHydration: fmt ? fmt.percent(44) : "44%",
  };
  const title = entry.title || step.title;
  let desc = entry.desc || step.description;

  // For shape: use descAlt for rectangular, default for round
  if (step.id === "shape" && isRect && entry.descAlt) {
    desc = entry.descAlt;
  }

  // Replace template vars
  desc = normalizeTemperatureUnitSuffixes(t(desc, vars));

  const tip = (entry.tipBeginner && entry.tipNerd)
    ? {
        beginner: normalizeTemperatureUnitSuffixes(t(entry.tipBeginner, vars)),
        nerd: normalizeTemperatureUnitSuffixes(t(entry.tipNerd, vars)),
      }
    : step.tip;

  // Spiegazione estesa opzionale (interpolata con le stesse vars)
  const longText = step.id === "preferment" && prefType === "biga" && entry.longDescAlt
    ? entry.longDescAlt
    : entry.longDesc;
  const longDesc = longText
    ? normalizeTemperatureUnitSuffixes(t(longText, vars))
    : undefined;

  return { title, description: desc, longDesc, tip };
}


/* ═══ Helper condimento (spostati in fase 2) ═══ */
export function formatToppingAmountForLocale(
  value: number,
  unit: "g" | "ml" | "pcs",
  fmt: ReturnType<typeof createFormatter>,
) {
  const rounded = Math.round(value * 10) / 10;
  if (unit === "pcs") return fmt.pieces(rounded);
  if (unit === "ml") return fmt.milliliters(rounded);
  return fmt.grams(rounded);
}

export function getServingUnitLabel(
  cms: CmsContent,
  unit: ReturnType<typeof getServingUnit>,
  count: number,
  lowercase = false,
) {
  const label =
    cms.cooking.servingUnits?.[unit]?.[count === 1 ? "singular" : "plural"] ??
    SERVING_UNIT_LABELS[unit][count === 1 ? "singular" : "plural"];
  return lowercase ? label.toLocaleLowerCase(cms.locale.id) : label;
}

export function getSectionHeader(section: string, locale: string): string {
  const brineLabels: Record<string, [string, string]> = {"it": ["Salamoia", "Finitura"], "en": ["Brine", "Finishing"], "de": ["Salzlake", "Zum Abschluss"], "es": ["Salmuera", "Acabado"], "fr": ["Saumure", "Finition"], "pt": ["Salmoura", "Finalização"], "ja": ["塩水", "仕上げ"]};
  if (section === "salamoia" || section === "finitura") return (brineLabels[locale.split("-")[0]] ?? brineLabels.en)[section === "salamoia" ? 0 : 1];
  const isIt = locale.toLowerCase().startsWith("it");
  const isDe = locale.toLowerCase().startsWith("de");
  const isJa = locale.toLowerCase().startsWith("ja");

  if (isIt) {
    switch (section) {
      case "ripieno": return "Ripieno Interno";
      case "base": return "Sulla Base";
      case "crosta": return "Bordo / Crosta";
      case "superficie": return "In Superficie";
      default: return "Ingredienti";
    }
  } else if (isDe) {
    switch (section) {
      case "ripieno": return "Füllung";
      case "base": return "Auf dem Boden";
      case "crosta": return "Rand / Kruste";
      case "superficie": return "Belag / Oberfläche";
      default: return "Zutaten";
    }
  } else if (isJa) {
    switch (section) {
      case "ripieno": return "中の具材（フィリング）";
      case "base": return "生地のベース";
      case "crosta": return "生地の端・耳";
      case "superficie": return "トッピング・表面";
      default: return "材料";
    }
  } else {
    // English default
    switch (section) {
      case "ripieno": return "Internal Filling";
      case "base": return "On the Base";
      case "crosta": return "Crust / Edge";
      case "superficie": return "On the Surface";
      default: return "Ingredients";
    }
  }
}

export function getToppingIngredientSectionOrder(ingredients: ToppingIngredient[]): IngredientSection[] {
  const seen = new Set<IngredientSection>();
  const order: IngredientSection[] = [];
  ingredients.forEach((ing) => {
    const section = ing.section ?? "superficie";
    if (!seen.has(section)) {
      seen.add(section);
      order.push(section);
    }
  });
  return order;
}


/* ═══ Audit totale n. 12 — dosi dentro i passi ═══
 * In modalità cottura i passi non riportavano i grammi (lo staglio rimandava a
 * «ingredienti sotto», che lì non ci sono). Dosi per i passi che le usano:
 * pre-fermento, impasto, staglio. */
export interface StepQuantity {
  label: string;
  value: string;
}

export function stepQuantities(
  stepId: string,
  recipe: GeneratedRecipe,
  cms: CmsContent,
  fmt: ReturnType<typeof createFormatter>,
): StepQuantity[] {
  const ui = cms.ui;
  const yeastLabel = cms.yeastLabels?.[recipe.yeast_type] ?? recipe.yeast_type;
  const fatType = recipe.style.dough.fat_type;
  const fatLabel = fatType === "butter" ? ui.fatButter : fatType === "lard" ? ui.fatLard : ui.oilEvo;
  const split = recipe.has_pre_ferment
    ? computePreFermentSplit({ flourG: recipe.flour_g, waterG: recipe.water_g, preFermentType: recipe.pre_ferment_type, flourPct: recipe.pre_ferment_flour_pct })
    : null;
  const yeast = recipe.yeast_g > 0 ? [{ label: yeastLabel, value: fmt.grams(recipe.yeast_g) }] : [];
  switch (stepId) {
    case "preferment":
      return split
        ? [
            { label: ui.flour, value: fmt.grams(split.prefermentFlourG) },
            { label: ui.water, value: fmt.grams(split.prefermentWaterG) },
            ...yeast,
          ]
        : [];
    case "mix": {
      const rest = [
        ...(recipe.salt_g > 0 ? [{ label: ui.salt, value: fmt.grams(recipe.salt_g) }] : []),
        ...(recipe.sugar_g > 0 ? [{ label: ui.sugar, value: fmt.grams(recipe.sugar_g) }] : []),
        ...(recipe.fat_g > 0 ? [{ label: fatLabel, value: fmt.grams(recipe.fat_g) }] : []),
      ];
      return split
        ? [
            { label: split.name, value: fmt.grams(split.prefermentFlourG + split.prefermentWaterG) },
            { label: ui.flour, value: fmt.grams(split.mainFlourG) },
            { label: ui.water, value: fmt.grams(split.mainWaterG) },
            ...rest,
          ]
        : [
            { label: ui.flour, value: fmt.grams(recipe.flour_g) },
            { label: ui.water, value: fmt.grams(recipe.water_g) },
            ...yeast,
            ...rest,
          ];
    }
    case "divide":
      return [{ label: `${recipe.dough_balls} ×`, value: fmt.grams(recipe.ball_weight_g) }];
    default:
      return [];
  }
}
