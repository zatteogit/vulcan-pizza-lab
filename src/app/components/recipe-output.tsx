import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  ChefHat,
  Flame,
  Scissors,
  Timer,
  Hand,
  Expand,
  Beaker,
  Lightbulb,
  Copy,
  Check,
  Minus,
  Plus,
  Share2,
  FlaskConical,
} from "lucide-react";
import {
  GeneratedRecipe,
  UserConstraints,
  YEAST_LABELS,
  TimelineStep,
} from "./pizza-engine";
import { useCms } from "./cms/cms-context";
import type { CmsContent, CmsTimelineStep } from "./cms/cms-context";
import { createFormatter, t } from "./cms/i18n";
import { PreFermentCard } from "./pre-ferment-guide";
import { FlourSuggestionCard } from "./flour-suggestion-card";
import { RecipeFeedbackForm } from "./recipe-feedback";
import type { FlourEntry } from "./flour-database";
import {
  getFoldingByStyle,
  getToppingByStyle,
  getEquipmentByStyle,
  getBakingTimeByStyle,
  getScoringByStyle,
} from "./parametric-databases";

/* ═══ PARAMETRIC CONTEXT TIPS ═══ */
function getParametricTip(
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
      return isNerd
        ? t(pt.bulkNerd, { count: fold.foldCount, type: foldName, interval: fold.foldInterval_min, note: fold.note })
        : t(pt.bulkBeginner, { count: fold.foldCount, type: foldName, interval: fold.foldInterval_min });
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
      const order = top.toppingOrder.join(" \u2192 ");
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
        ? t(pt.turnsSingle, { n: bt.turns })
        : pt.turnsNone;
      return isNerd
        ? t(pt.bakeNerd, { idealSec: bt.idealSeconds, minM, maxM, turns: bt.turns, note: bt.note })
        : t(pt.bakeBeginner, { minM, maxM, turnsNote });
    }
    default:
      return null;
  }
}

interface RecipeOutputProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  nerdMode?: boolean;
  selectedFlourId?: string | null;
  onSelectFlour?: (flour: FlourEntry | null) => void;
  selectedTimeSlotId?: string | null;
}

/* ═══ CLOCK HELPERS ═══ */
function roundToQuarter(date: Date): Date {
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
function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}
function shiftQuarter(date: Date, direction: number): Date {
  return new Date(date.getTime() + direction * 15 * 60 * 1000);
}

/* ═══ Cross-day helpers ═══ */

/** Day offset between two dates (calendar-day based, handles midnight correctly) */
function dayOffset(reference: Date, target: Date): number {
  const refDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const tgtDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((tgtDay.getTime() - refDay.getTime()) / (24 * 60 * 60 * 1000));
}

/** Day suffix: "" for same day, " +1g" for next day, " +2g" for day after, etc. */
function daySuffix(reference: Date, target: Date): string {
  const d = dayOffset(reference, target);
  if (d === 0) return "";
  return ` +${d}g`;
}

/** Clock time with optional day offset badge: "14:30" or "14:30 +1g" */
function clockWithDay(
  date: Date,
  reference: Date,
  bcp47: string,
): string {
  const hhmm = date.toLocaleTimeString(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return hhmm + daySuffix(reference, date);
}

/** Unified duration formatter: "15 min" / "1h 30min" / "16h" / "1g 4h" / "2g 3h" */
function fmtDuration(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const totalH = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (totalH < 24) {
    if (m === 0) return `${totalH}h`;
    return `${totalH}h ${m}min`;
  }
  const d = Math.floor(totalH / 24);
  const h = totalH % 24;
  if (h === 0) return `${d}g`;
  return `${d}g ${h}h`;
}

/* ═══ Clipboard helpers ═══ */
function copyToClipboard(text: string, onSuccess: () => void) {
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
function fallbackCopy(text: string, onSuccess: () => void) {
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
function formatCompVal(type: string, val: number): string {
  if (type.includes("hydration")) return `${val.toFixed(1)}%`;
  if (type.includes("oil") || type.includes("fat") || type.includes("sugar")) return `${val.toFixed(1)}%`;
  if (type.includes("time") || type.includes("cook")) return `${Math.round(val)}s`;
  if (type.includes("thickness")) return `×${val.toFixed(2)}`;
  return String(Math.round(val * 100) / 100);
}

/* ═══ Friendly compensation descriptions (non-nerd mode) ═══ */
function friendlyReason(type: string, ui: any): string {
  const map: Record<string, string> = {
    hydration: ui.compHydration,
    oil: ui.compOil,
    sugar: ui.compSugar,
    cook_time: ui.compCookTime,
    thickness: ui.compThickness,
  };
  return map[type] ?? ui.compDefault;
}

/* ═══ Timeline step localization ═══ */
function localizeStep(
  step: TimelineStep,
  recipe: GeneratedRecipe,
  cms: CmsContent,
): { title: string; description: string; tip?: { beginner: string; nerd: string } } {
  const labels = cms.timelineLabels;
  if (!labels) return step;

  const isNoKnead = recipe.style.dough.process_type.includes("no_knead");
  const isCold = recipe.fermentation_temp_c <= 6;
  const isRect = recipe.style.shape.shape_type === "rectangular";
  const isThin = recipe.style.crust_type === "crispy_thin";
  const bakeTemp = Math.round(recipe.style.baking.temp_c_ideal);
  const fermTemp = recipe.fermentation_temp_c;
  const fermFactor = Math.pow(2, (fermTemp - 18) / 10).toFixed(1);
  const prefType = recipe.style.dough.process_type.includes("poolish") ? "poolish" : "biga";

  let entry: CmsTimelineStep | undefined;

  switch (step.id) {
    case "preferment":
      entry = labels.preferment;
      break;
    case "mix":
      entry = isNoKnead ? (labels.mix_noknead || labels.mix) : labels.mix;
      break;
    case "bulk":
      entry = isCold ? (labels.bulk_cold || labels.bulk) : labels.bulk;
      break;
    case "divide":
      entry = labels.divide;
      break;
    case "proof":
      entry = labels.proof;
      break;
    case "shape":
      entry = isThin ? (labels.shape_thin || labels.shape) : (isRect && labels.shape?.descAlt) ? labels.shape : labels.shape;
      break;
    case "top":
      entry = labels.top;
      break;
    case "bake":
      entry = labels.bake;
      break;
    default:
      return step;
  }

  if (!entry) return step;

  const vars: Record<string, string | number> = { temp: step.id === "bake" ? bakeTemp : fermTemp, type: prefType, factor: fermFactor };
  const title = entry.title || step.title;
  let desc = entry.desc || step.description;

  // For shape: use descAlt for rectangular, default for round
  if (step.id === "shape" && isRect && entry.descAlt) {
    desc = entry.descAlt;
  }

  // Replace template vars
  desc = t(desc, vars);

  const tip = (entry.tipBeginner && entry.tipNerd)
    ? { beginner: t(entry.tipBeginner, vars), nerd: t(entry.tipNerd, vars) }
    : step.tip;

  return { title, description: desc, tip };
}

export function RecipeOutput({
  recipe,
  constraints,
  onConstraintsChange,
  nerdMode,
  selectedFlourId,
  onSelectFlour,
  selectedTimeSlotId,
}: RecipeOutputProps) {
  const [copiedIng, setCopiedIng] = useState(false);
  const [copiedProc, setCopiedProc] = useState(false);

  /* ═══ Smart start time — back-calculate from eating time ═══
     If the user selected a time slot, we know WHEN they want to eat
     (now + available_hours). We subtract the total recipe duration
     to get the ideal start time. Falls back to "now" rounded. */
  const totalDurationMinStatic = React.useMemo(
    () => recipe.timeline.reduce((sum, s) => sum + s.duration_minutes, 0),
    [recipe.timeline],
  );

  const [startTime, setStartTime] = useState(() => {
    if (selectedTimeSlotId && selectedTimeSlotId !== "no_preference" && constraints.available_hours > 0) {
      const eatingTime = new Date(Date.now() + constraints.available_hours * 3600_000);
      const idealStart = new Date(eatingTime.getTime() - totalDurationMinStatic * 60_000);
      // If ideal start is in the past, use now + 15min rounded
      if (idealStart.getTime() < Date.now()) {
        return roundToQuarter(new Date());
      }
      return roundToQuarter(idealStart);
    }
    return roundToQuarter(new Date());
  });

  const [editingTime, setEditingTime] = useState(false);
  const [editingEndTime, setEditingEndTime] = useState(false);
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

  const isNerd = !!nerdMode;

  const handleCopyIngredients = () => {
    const text = formatIngredientsText(recipe, cms);
    copyToClipboard(text, () => {
      setCopiedIng(true);
      setTimeout(() => setCopiedIng(false), 2000);
    });
  };
  const handleShareProcedure = () => {
    const text = formatProcedureText(
      recipe,
      stepTimes,
      startTime,
      cms,
      bcp47,
    );
    if (navigator.share) {
      navigator
        .share({ title: `${recipe.style.name} — Vulcan`, text })
        .catch(() => {
          copyToClipboard(text, () => {
            setCopiedProc(true);
            setTimeout(() => setCopiedProc(false), 2000);
          });
        });
    } else {
      copyToClipboard(text, () => {
        setCopiedProc(true);
        setTimeout(() => setCopiedProc(false), 2000);
      });
    }
  };

  const stepTimes = React.useMemo(() => {
    let cursor = new Date(startTime);
    return recipe.timeline.map((step) => {
      const start = new Date(cursor);
      const end = addMinutes(cursor, step.duration_minutes);
      cursor = end;
      return { start, end };
    });
  }, [recipe.timeline, startTime]);

  const endTime =
    stepTimes.length > 0
      ? stepTimes[stepTimes.length - 1].end
      : startTime;

  /* Total duration in minutes for back-calculating start from end */
  const totalDurationMin = React.useMemo(
    () => recipe.timeline.reduce((sum, s) => sum + s.duration_minutes, 0),
    [recipe.timeline],
  );

  const handleTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const d = new Date(startTime);
      d.setHours(h, m, 0, 0);
      setStartTime(d);
    }
    setEditingTime(false);
  };

  const handleEndTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const desired = new Date(startTime);
      desired.setHours(h, m, 0, 0);
      // If desired end is before or equal to start, assume next day
      if (desired.getTime() <= startTime.getTime()) {
        desired.setDate(desired.getDate() + 1);
      }
      // Back-calculate start from desired end
      const newStart = addMinutes(desired, -totalDurationMin);
      setStartTime(newStart);
    }
    setEditingEndTime(false);
  };

  const updateBalls = (n: number) => {
    onConstraintsChange({
      ...constraints,
      dough_balls: Math.max(1, Math.min(20, n)),
    });
  };

  /* VPL-013: Compensations applied */
  const compensations = recipe.science?.compensations ?? [];

  return (
    <div className="flex flex-col gap-12 sm:gap-14">
      {/* ═══ VPL-013: Compensations banner ═══ */}
      {compensations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: isNerd
              ? "var(--recipe-tip-nerd-bg)"
              : "var(--recipe-bg)",
            border: `1px solid ${
              isNerd
                ? "var(--recipe-tip-nerd-border)"
                : "var(--recipe-border)"
            }`,
            borderLeft: isNerd
              ? "3px solid var(--score-accent)"
              : undefined,
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2.5"
            style={{ borderBottom: `1px solid ${isNerd ? "var(--recipe-tip-nerd-border)" : "var(--recipe-divider-subtle)"}` }}
          >
            {isNerd ? (
              <FlaskConical
                size={14}
                style={{ color: "var(--score-accent)", flexShrink: 0 }}
              />
            ) : (
              <FlaskConical
                size={14}
                style={{ color: "var(--text-warning)", flexShrink: 0 }}
              />
            )}
            <span
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
                color: isNerd ? "var(--score-accent)" : "var(--text-default)",
              }}
            >
              {isNerd ? ui.compTitleNerd : ui.compTitle}
            </span>
            {isNerd && (
              <span
                className="px-2 py-0.5 rounded-md"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-bold)" as any,
                  letterSpacing: "var(--tracking-caps)",
                  textTransform: "uppercase",
                  color: "var(--score-accent)",
                  background: "color-mix(in srgb, var(--score-accent) 12%, rgba(0,0,0,0))",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                Nerd
              </span>
            )}
            <span
              className="type-numeric"
              style={{
                fontSize: "var(--font-size-base)",
                color: "var(--text-muted)",
                marginLeft: "auto",
              }}
            >
              {compensations.length}
            </span>
          </div>
          <div className="px-4 py-2.5 flex flex-col gap-2">
            {compensations.map((c, i) => (
              <div
                key={`${c.type}-${i}`}
                className="flex items-baseline justify-between gap-3"
                style={{ fontSize: "var(--font-size-md)" }}
              >
                <span style={{ color: isNerd ? "var(--text-default)" : "var(--text-muted)" }}>
                  {isNerd ? c.reason : friendlyReason(c.type, ui)}
                </span>
                {isNerd && (
                  <span
                    className="type-numeric flex-shrink-0"
                    style={{
                      color: "var(--score-accent)",
                      fontWeight: "var(--weight-semibold)" as any,
                    }}
                  >
                    {c.original !== c.compensated
                      ? `${formatCompVal(c.type, c.original)} → ${formatCompVal(c.type, c.compensated)}`
                      : formatCompVal(c.type, c.compensated)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Ingredients + panetti stepper ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3>{ui.ingredients}</h3>
          <button
            onClick={handleCopyIngredients}
            className="flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full active:scale-95"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--weight-medium)" as any,
              background: "var(--recipe-bg)",
              border: "1px solid var(--recipe-border)",
            }}
          >
            {copiedIng ? (
              <Check
                size={14}
                style={{ color: "var(--recipe-success)" }}
              />
            ) : (
              <Copy size={14} />
            )}
            {copiedIng ? ui.copied : ui.copy}
          </button>
        </div>

        <div
          className="flex items-center gap-4 mb-4 pb-4"
          style={{
            borderBottom: "1px solid var(--recipe-divider-subtle)",
          }}
        >
          <span
            style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-medium)" as any }}
          >
            {ui.doughBalls}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateBalls(constraints.dough_balls - 1)
              }
              disabled={constraints.dough_balls <= 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-20 active:scale-[0.88] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaReduceBalls}
            >
              <Minus size={12} />
            </button>
            <motion.span
              key={constraints.dough_balls}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: "var(--font-size-3xl)",
                fontWeight: "var(--weight-bold)" as any,
                minWidth: 28,
                textAlign: "center",
                color: "var(--recipe-highlight)",
              }}
              className="type-numeric"
            >
              {constraints.dough_balls}
            </motion.span>
            <button
              onClick={() =>
                updateBalls(constraints.dough_balls + 1)
              }
              disabled={constraints.dough_balls >= 20}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-20 active:scale-[0.88] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaAddBalls}
            >
              <Plus size={12} />
            </button>
          </div>
          <span
            style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)" }}
          >
            {t(ui.doughBallsFrom, { w: recipe.ball_weight_g })}
          </span>
        </div>

        <div className="flex flex-col">
          <IngRow
            name={ui.flour}
            detail={`W${recipe.flour_w} · P/L ${recipe.flour_pl}`}
            amount={recipe.flour_g}
          />
          <IngRow
            name={ui.water}
            detail={`${recipe.hydration_pct}%${recipe.water_temp_c != null ? ` · ${recipe.water_temp_c}°C` : ""}`}
            amount={recipe.water_g}
          />
          <IngRow name={ui.salt} amount={recipe.salt_g} />
          <IngRow
            name={cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type] || recipe.yeast_type}
            amount={recipe.yeast_g}
          />
          {recipe.fat_g > 0 && (
            <IngRow name={recipe.fat_label || ui.oilEvo} amount={recipe.fat_g} />
          )}
          {recipe.sugar_g > 0 && (
            <IngRow name={ui.sugar} amount={recipe.sugar_g} />
          )}
        </div>
        <div
          className="mt-3 type-numeric"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-lg)",
          }}
        >
          {recipe.dough_balls} × {recipe.ball_weight_g}g ={" "}
          {recipe.total_dough_g}g {ui.totalDough}
        </div>

        {/* ── Regola 55 — Water temperature tip ── */}
        {recipe.water_temp_c != null && (
          <div
            className="mt-3 flex items-start gap-2 p-3 rounded-xl"
            style={{
              background: recipe.water_temp_c < 5
                ? "color-mix(in srgb, var(--text-warning) 8%, rgba(0,0,0,0))"
                : "color-mix(in srgb, var(--cta) 8%, rgba(0,0,0,0))",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <span style={{ fontSize: "var(--font-size-lg)", flexShrink: 0 }}>
              {recipe.water_temp_c < 5 ? "🧊" : "💧"}
            </span>
            <div>
              <div
                className="type-label"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-default)",
                }}
              >
                {recipe.water_temp_c < 5
                ? t(cms.engineMessages["tip.waterTempCold"] || "Regola 55: usa acqua dal frigo ({temp}°C). L'impasto a macchina scalda la massa.", { temp: recipe.water_temp_c })
                : t(cms.engineMessages["tip.waterTempNormal"] || "Regola 55: usa acqua a {temp}°C per raggiungere {ddt}°C di impasto.", { temp: recipe.water_temp_c, ddt: recipe.science.desired_dough_temp_c })}
              </div>
              {recipe.science.friction_factor > 0 && (
                <div
                  className="type-data"
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {t(cms.engineMessages["tip.frictionNote"] || "Compensazione attrito impastatrice: {friction}°C", { friction: recipe.science.friction_factor })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Flour suggestions — matching flours from database ── */}
        <FlourSuggestionCard
          styleId={recipe.style.id}
          recipeW={recipe.flour_w}
          fermentationHours={recipe.fermentation_hours}
          selectedFlourId={selectedFlourId}
          onSelectFlour={onSelectFlour}
        />

        {/* ── Topping order visual strip ── */}
        {recipe.topping_info && recipe.topping_info.toppingOrder.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.2 }}
            className="mt-5 rounded-2xl overflow-hidden px-4 py-3.5"
            style={{
              background: "var(--surface-container-low)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: "var(--font-size-lg)" }}>🍕</span>
              <span
                style={{
                  fontSize: "var(--font-size-2xs)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-muted)",
                }}
              >
                {cms.parametricTips?.toppingOrderLabel || "Ordine condimento"}
              </span>
              {recipe.topping_info.saucePosition !== "sotto" && (
                <span
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    fontSize: "var(--font-size-2xs)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                    background: "color-mix(in srgb, var(--primary) 12%, var(--surface-container))",
                    color: "var(--primary)",
                  }}
                >
                  {recipe.topping_info.saucePosition === "sopra"
                    ? "Ordine invertito"
                    : recipe.topping_info.saucePosition === "nessuna"
                      ? "Senza salsa"
                      : "Integrata"}
                </span>
              )}
            </div>
            {/* Topping flow arrows */}
            <div className="flex flex-wrap items-center gap-1.5">
              {recipe.topping_info.toppingOrder.map((step, i) => (
                <div key={`${step}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-xs)",
                        opacity: 0.5,
                      }}
                    >
                      →
                    </span>
                  )}
                  <span
                    className="px-2.5 py-1 rounded-lg"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--weight-medium)" as any,
                      color: "var(--text-default)",
                      background: "var(--surface-container)",
                      border: "1px solid var(--outline-variant)",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
            {/* Cheese & note */}
            <div
              className="mt-2.5 flex flex-col gap-1"
              style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}
            >
              {recipe.topping_info.cheeseType !== "Nessuno" && (
                <span>
                  <span style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-secondary)" }}>
                    {cms.parametricTips?.cheeseLabel || "Formaggio"}:
                  </span>{" "}
                  {recipe.topping_info.cheeseType}
                </span>
              )}
              <span style={{ lineHeight: "var(--leading-reading)", fontStyle: "italic" }}>
                {recipe.topping_info.note}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Pre-ferment educational card (nerd mode) ── */}
      {isNerd && recipe.has_pre_ferment && (
        <div className="mt-6 mb-2">
          <PreFermentCard preFermentType={recipe.pre_ferment_type} />
        </div>
      )}

      {/* ── Procedure / Timeline with inline tips ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <h3>{ui.procedure}</h3>
            <span
              className="type-numeric"
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--font-size-md)",
              }}
            >
              {ui.steps_count.replace("{n}", String(recipe.timeline.length))}
            </span>
          </div>
          <button
            onClick={handleShareProcedure}
            className="flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full active:scale-95"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--weight-medium)" as any,
              background: "var(--recipe-bg)",
              border: "1px solid var(--recipe-border)",
            }}
          >
            {copiedProc ? (
              <Check
                size={14}
                style={{ color: "var(--recipe-success)" }}
              />
            ) : (
              <Share2 size={14} />
            )}
            {copiedProc ? ui.copied : ui.share}
          </button>
        </div>

        {/* Start / end time */}
        <div
          className="flex items-center gap-4 mb-6 py-3 px-4 surface-card"
        >
          <div className="flex-1 flex items-center gap-3">
            <span
              style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-medium)" as any }}
            >
              {ui.startTime}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setStartTime((s) => shiftQuarter(s, -1))
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-[0.9] transition-transform"
                style={{
                  background: "var(--recipe-bg)",
                  border: "1px solid var(--recipe-border)",
                }}
                aria-label={ui.ariaEarlier}
              >
                <Minus size={12} />
              </button>
              {editingTime ? (
                <input
                  type="time"
                  autoFocus
                  defaultValue={fmt.clockTime(startTime)}
                  onBlur={handleTimeInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }}
                  className="bg-transparent text-center outline-none type-numeric"
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    width: 72,
                    border: "none",
                    borderBottom: "2px solid var(--recipe-highlight)",
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingTime(true)}
                  className="type-numeric"
                  style={{
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    minWidth: 52,
                    textAlign: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-accent)",
                    borderBottom:
                      "1px dashed var(--recipe-border)",
                    paddingBottom: 1,
                  }}
                >
                  {fmt.clockTime(startTime)}
                </button>
              )}
              <button
                onClick={() =>
                  setStartTime((s) => shiftQuarter(s, 1))
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-[0.9] transition-transform"
                style={{
                  background: "var(--recipe-bg)",
                  border: "1px solid var(--recipe-border)",
                }}
                aria-label={ui.ariaLater}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div
            className="h-6 w-px"
            style={{ background: "var(--recipe-divider)" }}
          />
          <div className="flex items-center gap-3">
            <span
              style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-medium)" as any }}
            >
              {ui.endTime}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setStartTime((s) => shiftQuarter(s, -1))
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-[0.9] transition-transform"
                style={{
                  background: "var(--recipe-bg)",
                  border: "1px solid var(--recipe-border)",
                }}
                aria-label={ui.ariaEarlier}
              >
                <Minus size={12} />
              </button>
              {editingEndTime ? (
                <input
                  type="time"
                  autoFocus
                  defaultValue={fmt.clockTime(endTime)}
                  onBlur={handleEndTimeInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }}
                  className="bg-transparent text-center outline-none type-numeric"
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    width: 72,
                    border: "none",
                    borderBottom: "2px solid var(--recipe-highlight)",
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingEndTime(true)}
                  className="type-numeric"
                  style={{
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    minWidth: 52,
                    textAlign: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-accent)",
                    borderBottom:
                      "1px dashed var(--recipe-border)",
                    paddingBottom: 1,
                  }}
                >
                  {clockWithDay(endTime, startTime, bcp47)}
                </button>
              )}
              <button
                onClick={() =>
                  setStartTime((s) => shiftQuarter(s, 1))
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-[0.9] transition-transform"
                style={{
                  background: "var(--recipe-bg)",
                  border: "1px solid var(--recipe-border)",
                }}
                aria-label={ui.ariaLater}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Total duration summary */}
        {totalDurationMin > 0 && (
          <div
            className="flex items-center justify-center gap-2 -mt-4 mb-4"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}
          >
            <span className="type-numeric" style={{ opacity: 0.7 }}>
              {fmtDuration(totalDurationMin)} totali
            </span>
            {dayOffset(startTime, endTime) > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-md type-numeric"
                style={{
                  fontSize: "var(--font-size-2xs)",
                  fontWeight: "var(--weight-semibold)" as any,
                  letterSpacing: "0.06em",
                  background: "color-mix(in srgb, var(--tertiary) 12%, var(--surface-container))",
                  color: "var(--tertiary)",
                }}
              >
                {dayOffset(startTime, endTime) === 1 ? "giorno dopo" : `+${dayOffset(startTime, endTime)} giorni`}
              </span>
            )}
          </div>
        )}

        {/* Steps with inline tips */}
        <div className="relative">
          <div
            className="absolute left-[16px] top-4 bottom-4 w-px"
            style={{ background: "var(--recipe-divider)" }}
          />
          <div className="flex flex-col gap-0">
            {recipe.timeline.map((step, i) => {
              const StepIcon = getIcon(step.icon);
              const isFirst = i === 0;
              const isLast = i === recipe.timeline.length - 1;
              const times = stepTimes[i];
              const localizedStep = localizeStep(step, recipe, cms);
              const tipText = localizedStep.tip
                ? isNerd
                  ? localizedStep.tip.nerd
                  : localizedStep.tip.beginner
                : null;
              const parametricTip = getParametricTip(step.id, recipe.style.id, isNerd, cms.parametricTips);
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="flex gap-4 pb-6 last:pb-0"
                >
                  {/* Node */}
                  <div
                    className="relative z-10 w-[33px] h-[33px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFirst
                        ? "var(--recipe-node-first-bg)"
                        : isLast
                          ? "var(--recipe-node-last-bg)"
                          : "var(--recipe-node-mid-bg)",
                      color:
                        isFirst || isLast
                          ? "var(--text-on-accent)"
                          : "var(--recipe-node-accent)",
                      border:
                        isFirst || isLast
                          ? "none"
                          : "2px solid var(--recipe-border)",
                    }}
                  >
                    <StepIcon size={14} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{
                          color: "var(--text-default)",
                          fontSize: "var(--font-size-xl-5)",
                          fontWeight: "var(--weight-semibold)" as any,
                        }}
                      >
                        {localizedStep.title}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Clock time with day offset */}
                        <span
                          className="px-2.5 py-0.5 rounded-lg type-numeric"
                          style={{
                            fontSize: "var(--font-size-md)",
                            fontWeight: "var(--weight-semibold)" as any,
                            background:
                              isFirst || isLast
                                ? "var(--recipe-badge-accent-bg)"
                                : "var(--recipe-bg)",
                            color:
                              isFirst || isLast
                                ? "var(--recipe-badge-accent-text)"
                                : "var(--text-muted)",
                          }}
                        >
                          {times
                            ? clockWithDay(times.start, startTime, bcp47)
                            : step.timing_label}
                        </span>
                      </div>
                    </div>
                    <p
                      className="mt-1"
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-xl)",
                        lineHeight: "var(--leading-reading)",
                      }}
                    >
                      {localizedStep.description}
                    </p>
                    {step.duration_minutes > 0 && (
                      <span
                        className="inline-block mt-1.5 type-numeric"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-base)",
                        }}
                      >
                        {fmtDuration(step.duration_minutes)}
                        {times && ` → ${clockWithDay(times.end, startTime, bcp47)}`}
                      </span>
                    )}
                    {/* ── Inline tip — nerd vs beginner styling ── */}
                    {tipText && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 + 0.15 }}
                        className="flex items-start gap-2.5 mt-3 px-3.5 py-2.5 rounded-xl"
                        style={{
                          background: isNerd
                            ? "var(--recipe-tip-nerd-bg)"
                            : "var(--recipe-tip-beginner-bg)",
                          border: `1px solid ${
                            isNerd
                              ? "var(--recipe-tip-nerd-border)"
                              : "var(--recipe-tip-border)"
                          }`,
                        }}
                      >
                        {isNerd ? (
                          <FlaskConical
                            size={12}
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              color: "var(--recipe-tip-nerd-icon)",
                              opacity: 0.7,
                            }}
                          />
                        ) : (
                          <Lightbulb
                            size={12}
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              color: "var(--recipe-tip-icon)",
                              opacity: 0.7,
                            }}
                          />
                        )}
                        <span
                          className={isNerd ? "type-data" : ""}
                          style={{
                            fontSize: isNerd
                              ? "var(--font-size-md)"
                              : "var(--font-size-lg)",
                            lineHeight: 1.55,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {tipText}
                        </span>
                      </motion.div>
                    )}
                    {/* ── Parametric tip ── */}
                    {parametricTip && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.06 + 0.2,
                          type: "spring",
                          stiffness: 450,
                          damping: 28,
                        }}
                        className="flex items-start gap-2.5 mt-2 px-3.5 py-2.5 rounded-xl"
                        style={{
                          background: isNerd
                            ? "var(--recipe-tip-nerd-bg)"
                            : "var(--recipe-tip-beginner-bg)",
                          border: `1px solid ${
                            isNerd
                              ? "var(--recipe-tip-nerd-border)"
                              : "var(--recipe-tip-border)"
                          }`,
                        }}
                      >
                        {isNerd ? (
                          <FlaskConical
                            size={12}
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              color: "var(--recipe-tip-nerd-icon)",
                              opacity: 0.7,
                            }}
                          />
                        ) : (
                          <Lightbulb
                            size={12}
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              color: "var(--recipe-tip-icon)",
                              opacity: 0.7,
                            }}
                          />
                        )}
                        <span
                          className={isNerd ? "type-data" : ""}
                          style={{
                            fontSize: isNerd
                              ? "var(--font-size-md)"
                              : "var(--font-size-lg)",
                            lineHeight: 1.55,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {parametricTip}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Feedback form ── */}
      <div className="mt-6">
        <RecipeFeedbackForm recipe={recipe} skillLevel={constraints.skill_level} />
      </div>
    </div>
  );
}

function IngRow({
  name,
  detail,
  amount,
}: {
  name: string;
  detail?: string;
  amount: number;
}) {
  return (
    <div
      className="flex items-baseline justify-between py-3"
      style={{ borderBottom: "1px solid var(--recipe-divider-subtle)" }}
    >
      <div className="flex items-baseline gap-2.5">
        <span
          style={{ color: "var(--text-default)", fontSize: "var(--font-size-xl-5)" }}
        >
          {name}
        </span>
        {detail && (
          <span
            className="type-numeric"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-md)",
            }}
          >
            {detail}
          </span>
        )}
      </div>
      <span
        className="type-numeric"
        style={{
          color: "var(--text-default)",
          fontSize: "var(--font-size-2-5xl)",
          fontWeight: "var(--weight-bold)" as any,
        }}
      >
        {amount}g
      </span>
    </div>
  );
}

function getIcon(name: string) {
  const m: Record<string, typeof Clock> = {
    beaker: Beaker,
    hand: Hand,
    clock: Clock,
    scissors: Scissors,
    timer: Timer,
    expand: Expand,
    "chef-hat": ChefHat,
    flame: Flame,
  };
  return m[name] || Clock;
}

function formatIngredientsText(r: GeneratedRecipe, cms: any) {
  const ui = cms.ui;
  const yeastName = cms.yeastLabels[r.yeast_type] || YEAST_LABELS[r.yeast_type] || r.yeast_type;
  const title = t(ui.clipboardTitle, { style: r.style.name });
  const balls = t(ui.clipboardBalls, { n: r.dough_balls, w: r.ball_weight_g });
  const total = t(ui.clipboardTotal, { g: r.total_dough_g });
  return `${title}\n${balls}\n\n${ui.flour} W${r.flour_w} · P/L ${r.flour_pl}: ${r.flour_g}g\n${ui.water}: ${r.water_g}g (${r.hydration_pct}%)\n${ui.salt}: ${r.salt_g}g\n${yeastName}: ${r.yeast_g}g${r.fat_g > 0 ? `\n${r.fat_label || ui.oilEvo}: ${r.fat_g}g` : ""}\n\n${total}`;
}

function formatProcedureText(
  r: GeneratedRecipe,
  stepTimes: { start: Date; end: Date }[],
  startTime: Date,
  cms: any,
  bcp47: string,
) {
  const ui = cms.ui;
  const lines = r.timeline.map((step, i) => {
    const st = stepTimes[i];
    const timeStr = st ? clockWithDay(st.start, startTime, bcp47) : step.timing_label;
    const dur = fmtDuration(step.duration_minutes);
    const loc = localizeStep(step, r, cms);
    return `${timeStr} — ${loc.title} (${dur})${step.duration_minutes > 0 && st ? ` → ${clockWithDay(st.end, startTime, bcp47)}` : ""}\n${loc.description}`;
  });
  const heading = t(ui.clipboardProcedure, { style: r.style.name });
  const totalLine = `\n${fmtDuration(r.timeline.reduce((s, st) => s + st.duration_minutes, 0))} totali`;
  return `${heading}${totalLine}\n\n${lines.join("\n\n")}`;
}