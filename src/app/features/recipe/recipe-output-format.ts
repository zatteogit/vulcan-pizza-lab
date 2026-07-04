/* ═══ RECIPE OUTPUT — helper puri (estratti dall'audit lug 2026) ═══
 * Formattazione, clock, ottimizzatore comodità, localizzazione step.
 * Nessun JSX: solo funzioni pure riusate da recipe-output e dalle sue sezioni. */

import type { CmsContent, CmsTimelineStep } from "../cms/cms-context";
import { createFormatter, formatTemperatureCopy, t } from "../cms/i18n";
import { FLEXIBLE_STEP_IDS } from "../cooking/cook-session";
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
export function getParametricTip(
  stepId: string,
  styleId: string,
  isNerd: boolean,
  pt: CmsContent["parametricTips"],
): string | null {
  switch (stepId) {
    case "mix": {
      const eq = getEquipmentByStyle(styleId);
      if (!eq) return null;
      const mixer = eq.mixerRequired
        ? (eq.mixerType === "planetaria" ? pt.mixerPlanetaria : eq.mixerType)
        : pt.mixerHand;
      return isNerd
        ? t(pt.mixNerd, { mixer, time: eq.mixingTime_min, note: eq.note })
        : t(pt.mixBeginner, { mixer, time: eq.mixingTime_min, equipment: eq.specialEquipment.length > 0 ? eq.specialEquipment[0] : "" });
    }
    case "bulk": {
      const fold = getFoldingByStyle(styleId);
      if (!fold || fold.foldCount === 0) return null;
      const foldName = fold.foldType.replace(/_/g, " ");
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
      if (!bt) return null;
      const minM = Math.floor(bt.minSeconds / 60);
      const maxM = Math.ceil(bt.maxSeconds / 60);
      const turnsNote = bt.turns > 0
        ? t(pt.turnsSingle, {
            n: bt.turns,
            // Plurale italiano (volta / volte); negli altri locale il placeholder
            // resta letterale finché non viene migrato all'i18n con plurali.
            turn: bt.turns === 1 ? "volta" : "volte",
          })
        : pt.turnsNone;
      return isNerd
        ? t(pt.bakeNerd, { idealSec: bt.idealSeconds, minM, maxM, turns: bt.turns, note: bt.note })
        : t(pt.bakeBeginner, { minM, maxM, turnsNote });
    }
    default:
      return null;
  }
}


/* ═══ CLOCK HELPERS ═══ */
export function roundToQuarter(date: Date): Date {
  const d = new Date(date);
  const mins = d.getMinutes();
  const rounded = Math.ceil(mins / 15) * 15;
  d.setMinutes(rounded, 0, 0);
  if (rounded >= 60) {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
  }
  return d;
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

/** Orario "onesto" (feedback giugno 2026): le fasi flessibili (puntata,
 * appretto, pre-fermento) durano ore — "inizia alle 18:17" è precisione
 * finta. Arrotondiamo ai 15' con prefisso ~; le fasi attive restano esatte. */
export function displayStepTime(
  stepId: string,
  date: Date,
  reference: Date,
  bcp47: string,
  copy?: CmsContent["cooking"],
): string {
  if (!FLEXIBLE_STEP_IDS.has(stepId)) {
    return clockWithDay(date, reference, bcp47, copy);
  }
  const rounded = new Date(Math.round(date.getTime() / 900_000) * 900_000);
  return `~${clockWithDay(rounded, reference, bcp47, copy)}`;
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

function countNightActives(
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

export function flourStrengthLabel(w: number, cms: CmsContent | undefined): string {
  if (w < 220) return engineMessage(cms, "hint.flourWeak", "farina debole (00 classica)");
  if (w < 280) return engineMessage(cms, "hint.flourMedium", "farina di media forza");
  if (w < 330) return engineMessage(cms, "hint.flourStrong", "farina forte (per pizza)");
  return engineMessage(cms, "hint.flourVeryStrong", "farina molto forte (manitoba)");
}

/** Arrotondamento "caso per caso" dei numeri grandi (farina/acqua/totale).
 * La risoluzione scala con la grandezza: <100g al grammo, <1kg a 5g, ≥1kg a 10g.
 * Nessuno pesa 1346g di farina — 1350g è più leggibile e l'errore è <0.3%.
 * `approx` è true quando l'arrotondamento ha semplificato il numero, così la UI
 * può anteporre "~" (Q1+Q3, audit precisione lug 2026). Il lievito NON passa di
 * qui: mantiene 0.1g, dove il sotto-grammo conta. */
function roundGramsMagnitude(grams: number): { value: number; approx: boolean } {
  if (grams <= 0) return { value: 0, approx: false };
  const step = grams < 100 ? 1 : grams < 1000 ? 5 : 10;
  const value = Math.round(grams / step) * step;
  return { value, approx: value !== Math.round(grams) };
}

/** Formatta un peso grande con "~" se arrotondato. */
export function gramsApprox(grams: number, fmt: ReturnType<typeof createFormatter>): string {
  const { value, approx } = roundGramsMagnitude(grams);
  return `${approx ? "~" : ""}${fmt.grams(value)}`;
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
  return g > 0 ? ` · ≈ +${g}g` : "";
}

/** "Versione misurabile" del lievito, mostrata come sottotitolo accanto al peso
 * preciso (che resta sempre a 0.1g). Serve a chi NON ha la bilancia di precisione
 * (decisione owner lug 2026: preciso + misurabile insieme).
 * - Secco: frazioni di cucchiaino (idiomatiche, coprono tutto il range reale).
 * - Fresco: sotto il grammo "un pizzico" (la bilancia da 1g non lo legge); da 1g
 *   in su il target al grammo intero sulla bilancia da cucina — ma solo se il
 *   valore preciso ha un decimale (se è già intero è già pesabile, niente nota).
 * - Madre / ≥10g: nessuna nota (già pesabile e intero). */
export function yeastPracticalHint(grams: number, type: string, cms: CmsContent | undefined): string | undefined {
  if (grams <= 0) return undefined;
  if (type === "dry") {
    if (grams >= 5) return undefined; // pesabile con precisione sufficiente
    if (grams <= 0.4) return engineMessage(cms, "hint.yeastDryPinch", "≈ una punta di cucchiaino");
    if (grams <= 0.9) return engineMessage(cms, "hint.yeastDryQuarterTsp", "≈ ¼ di cucchiaino");
    if (grams <= 1.8) return engineMessage(cms, "hint.yeastDryHalfTsp", "≈ ½ cucchiaino");
    if (grams <= 3.5) return engineMessage(cms, "hint.yeastDryOneTsp", "≈ 1 cucchiaino raso");
    return engineMessage(cms, "hint.yeastDryOneHalfTsp", "≈ 1 cucchiaino e ½");
  }
  if (type === "fresh") {
    if (grams < 1) return engineMessage(cms, "hint.yeastFreshPinch", "≈ un pizzico");
    const whole = Math.round(grams);
    if (grams >= 10 || whole === grams) return undefined; // già pesabile/intero
    return t(engineMessage(cms, "hint.yeastFreshWeighable", "≈ {g} g sulla bilancia da cucina"), { g: whole });
  }
  return undefined; // madre: pesabile, nessuna nota
}

/** Unified duration formatter: "15 min" / "1h 30min" / "16h" / "1g 4h" / "2g 3h" */
export function fmtDuration(minutes: number, fmt?: ReturnType<typeof createFormatter>): string {
  if (minutes <= 0) return "";
  if (fmt) return fmt.durationMinutes(minutes);
  if (minutes < 60) return `${minutes} min`;
  const totalH = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (totalH < 24) {
    if (m === 0) return `${totalH}h`;
    return `${totalH}h ${m}min`;
  }
  const d = Math.floor(totalH / 24);
  const h = totalH % 24;
  const dayLabel = d === 1 ? "1 giorno" : `${d} giorni`;
  if (h === 0) return dayLabel;
  return `${dayLabel} ${h}h`;
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

/* ═══ Timeline step localization ═══ */
export function localizeStep(
  step: TimelineStep,
  recipe: GeneratedRecipe,
  cms: CmsContent,
  fmt?: ReturnType<typeof createFormatter>,
): { title: string; description: string; longDesc?: string; tip?: { beginner: string; nerd: string } } {
  const formatRawStep = (raw: TimelineStep) => {
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
  const fermFactor = Math.pow(2, (fermTemp - 18) / 10).toFixed(1);
  const prefType = recipe.style.dough.process_type.includes("poolish") ? "poolish" : "biga";
  const formatTemp = (value: number) =>
    fmt ? fmt.celsius(value) : `${Math.round(value)}°C`;

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
      entry = isCold ? (labels.bulk_cold || labels.bulk) : labels.bulk;
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
      entry = labels.proof;
      break;
    case "shape":
      // Con layout speciale, motore già genera desc specifica per il tipo di stesura
      if (hasSpecialLayout) return formatRawStep(step);
      entry = isThin ? (labels.shape_thin || labels.shape) : (isRect && labels.shape?.descAlt) ? labels.shape : labels.shape;
      break;
    case "top":
      entry = labels.top;
      break;
    case "preheat": {
      const equipmentNote = step.description.includes("pietra o acciaio")
        ? engineMessage(cms, "timeline.preheat.equipmentNote", " (pietra o acciaio già dentro)")
        : "";
      return {
        title: engineMessage(cms, "timeline.preheat.title", "Forno al massimo"),
        description: t(
          engineMessage(
            cms,
            "timeline.preheat.desc",
            "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti finiscono l'appretto.",
          ),
          { temp: formatTemp(bakeTemp), equipmentNote },
        ),
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
  const longDesc = entry.longDesc
    ? normalizeTemperatureUnitSuffixes(t(entry.longDesc, vars))
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
