/* ═══ PROCEDURE HERO — Tabella di marcia (estratto fase 2, lug 2026) ═══
 * Start/fine con shifter a quarti d'ora, chip del giorno, scorciatoie
 * "pronto per il pasto" e Timeline comoda. Stato e handler restano in
 * RecipeOutput (gli orari guidano anche la timeline): qui arrivano via props. */

import { ArrowRight, CalendarClock, CalendarRange, Minus, Pencil, Plus } from "lucide-react";
import type {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { useEffect, useId, useState } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { timeSlotText } from "./time-slot-text";
import { CtaButton, Disclosure, EmptyState, FilterChip, IconButton, Surface, Switch } from "../../components/ds/index";
import { selectedMealId } from "./meal-selection";
import { formatRelative } from "../../i18n/format";
import type { TimeSlot } from "../../domain/pizza-engine";
import {
  daySuffix,
  engineMessage,
  shiftQuarter,
} from "./recipe-output-format";
import { COMFORT_TOLERANCES, type NightAction, type optimizeComfort } from "../../use-cases/cook-plan";
import { t } from "../cms/i18n";
import { uiMessage } from "../../i18n/ui-messages";

/* G3-WP-01 (S09-B-14): sotto i 640 px la pianificazione si chiude in una
   riga riassuntiva, così il primo passo resta nel primo schermo. */
const COMPACT_QUERY = "(max-width: 639px)";

function useCompactHero(): boolean {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(COMPACT_QUERY).matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return compact;
}

function localDateTimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface ProcedureHeroControlsProps {
  calendarReference: Date;
  startTime: Date;
  setStartTime: Dispatch<SetStateAction<Date>>;
  endTime: Date;
  endDisplayTime: Date;
  /** Fine scelta come obiettivo (un pasto): niente «circa» sulla Fine. */
  preciseEndTime: boolean;
  setPreciseEndTime: Dispatch<SetStateAction<boolean>>;
  totalDurationMin: number;
  hasFlexiblePhases: boolean;
  editingTime: boolean;
  setEditingTime: Dispatch<SetStateAction<boolean>>;
  editingEndTime: boolean;
  setEditingEndTime: Dispatch<SetStateAction<boolean>>;
  handleTimeInput: (e: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) => void;
  handleEndTimeInput: (e: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) => void;
  mealSlots: (TimeSlot & { idealStart: Date; mealAt: Date; isFeasible: boolean })[];
  comfortToggled: boolean;
  /** Audit totale n. 2, FW-19: azioni attive che restano di notte col piano corrente. */
  nightActionsLeft?: NightAction[];
  setComfortToggled: Dispatch<SetStateAction<boolean>>;
  currentComfortPlan: ReturnType<typeof optimizeComfort>;
  preComfortStart: MutableRefObject<Date | null>;
  setStretch: Dispatch<SetStateAction<Record<number, number>>>;
}

export function ProcedureHeroControls({
  calendarReference,
  startTime,
  setStartTime,
  endTime,
  endDisplayTime,
  preciseEndTime,
  setPreciseEndTime,
  totalDurationMin,
  hasFlexiblePhases,
  editingTime,
  setEditingTime,
  editingEndTime,
  setEditingEndTime,
  handleTimeInput,
  handleEndTimeInput,
  mealSlots,
  comfortToggled,
  nightActionsLeft = [],
  setComfortToggled,
  currentComfortPlan,
  preComfortStart,
  setStretch,
}: ProcedureHeroControlsProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  // U-10 (F05): lo switch prende nome e descrizione dal testo che ha accanto.
  const comfortTitleId = useId();
  const comfortDescId = useId();
  const nowHelpId = useId();
  const shiftHintId = useId();
  const [plannedFromNow, setPlannedFromNow] = useState<number | null>(null);
  const fromNowHelp = uiMessage("recipe.schedule.fromNowHelp");
  const feasibleMeals = mealSlots.filter(slot => slot.isFeasible);
  const mealsLabelId = useId();
  // S09-A-16: il pasto attivo si deriva dal piano (si spegne con −/+).
  const selectedMeal = selectedMealId(feasibleMeals, startTime);
  // S09-B-15: con un pasto scelto (o un piano che coincide con un pasto) la
  // Fine è l'obiettivo, non una stima.
  const approxEnd = hasFlexiblePhases && !preciseEndTime && selectedMeal === null;
  const compact = useCompactHero();

  const startDayLabel = daySuffix(calendarReference, startTime, cms.cooking).trim() || cms.cooking.dayToday;
  const endDayLabel = daySuffix(calendarReference, endDisplayTime, cms.cooking).trim() || cms.cooking.dayToday;

  /* FW-19 (S09-A-03, S09-B-03): optimizeComfort restituisce null sia quando
     non ci sono azioni di notte sia quando non riesce a toglierle. Il secondo
     caso prima cadeva nello stato neutro («Ottimizza gli orari se serve»)
     proprio dopo «Inizia ora» la sera: ora si dice quante sono e quando. */
  const nightActivesLeft = nightActionsLeft.length;
  const nightWithoutPlan = !comfortToggled && !currentComfortPlan && nightActivesLeft > 0;
  const firstNight = nightActionsLeft[0];
  const firstNightLabel = firstNight
    ? `${fmt.clockTime(new Date(firstNight.atMs))}${daySuffix(calendarReference, new Date(firstNight.atMs), cms.cooking)}`
    : "";
  const comfortDescClass = comfortToggled
    ? nightActivesLeft > 0
      ? "procedure-hero__comfort-desc procedure-hero__comfort-desc--warning type-data-sm"
      : "procedure-hero__comfort-desc procedure-hero__comfort-desc--success type-data-sm"
    : currentComfortPlan || nightWithoutPlan
      ? "procedure-hero__comfort-desc procedure-hero__comfort-desc--warning type-data-sm"
      : "procedure-hero__comfort-desc procedure-hero__comfort-desc--idle type-data-sm";
  // S09-B-14: la pianificazione compatta si apre da sola se il piano non
  // coincide con un pasto o se restano fasi attive di notte da vedere.
  const nightIssue = Boolean(currentComfortPlan) || nightActivesLeft > 0;
  const [planOpen, setPlanOpen] = useState(() => selectedMeal === null || nightIssue);
  useEffect(() => {
    if (nightIssue) setPlanOpen(true);
  }, [nightIssue]);
  const tol = COMFORT_TOLERANCES;
  const comfortWhy = t(engineMessage(cms, "timelineComfort.whyBody", ""), {
    coldPlus: fmt.durationMinutes(tol.cold.plusMaxMin),
    coldPlusPct: fmt.percent(tol.cold.plusFraction * 100),
    coldMinus: fmt.durationMinutes(tol.cold.minusMaxMin),
    coldMinusPct: fmt.percent(tol.cold.minusFraction * 100),
    roomPlus: fmt.durationMinutes(tol.room.plusMaxMin),
    roomPlusPct: fmt.percent(tol.room.plusFraction * 100),
    roomMinus: fmt.durationMinutes(tol.room.minusMaxMin),
    roomMinusPct: fmt.percent(tol.room.minusFraction * 100),
  });

  const comfortDesc = comfortToggled
    ? nightActivesLeft > 0
      ? feasibleMeals.length > 0
        ? engineMessage(cms, "timelineComfort.activePartial", "")
        // G3-WP-01: senza chip dei pasti non si rimanda a controlli che non ci sono.
        : t(engineMessage(cms, "timelineComfort.nightNoPlanNoMeal", ""), { n: nightActivesLeft, time: firstNightLabel })
      : engineMessage(cms, "timelineComfort.active", "")
    : currentComfortPlan
      ? engineMessage(cms, "timelineComfort.nightDetected", "")
      : nightWithoutPlan
        ? t(engineMessage(cms, feasibleMeals.length > 0 ? "timelineComfort.nightNoPlan" : "timelineComfort.nightNoPlanNoMeal", ""), {
            n: nightActivesLeft,
            time: firstNightLabel,
          })
        : engineMessage(cms, "timelineComfort.idle", "");

  const body = (
    <>
      {/* FW-12 (S09-B-10): la scorciatoia delle frecce, detta allo screen reader. */}
      <p id={shiftHintId} className="sr-only">{uiMessage("features.recipe.procedure-hero.shift-hint")}</p>
      <div className="procedure-hero__times">
        <div className="procedure-hero__time" data-editing={editingTime || undefined}>
          <div className="procedure-hero__time-label type-data">
            {ui.startTime}
          </div>
          <div className="procedure-hero__time-controls">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="procedure-hero__shift-btn"
              aria-label={uiMessage("recipe.schedule.startEarlier")}
              title={uiMessage("recipe.schedule.startEarlier")}
            >
              <Minus size={13} />
            </button>
            {editingTime ? (
              <input
                type="datetime-local"
                autoFocus
                defaultValue={localDateTimeValue(startTime)}
                step={60}
                onBlur={handleTimeInput}
                onChange={handleTimeInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    (e.target as HTMLInputElement).blur();
                }}
                aria-label={ui.startTime}
                className="procedure-hero__time-input type-numeric"
              />
            ) : (
              <button
                onClick={() => setEditingTime(true)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setStartTime((s) => shiftQuarter(s, 1));
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setStartTime((s) => shiftQuarter(s, -1));
                  }
                }}
                aria-label={`${ui.startTime} ${fmt.clockTime(startTime)} ${startDayLabel}`}
                aria-keyshortcuts="ArrowUp ArrowDown"
                aria-describedby={shiftHintId}
                className="procedure-hero__time-display type-numeric"
              >
                <span className="procedure-hero__time-value">
                  {fmt.clockTime(startTime)}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="procedure-hero__shift-btn"
              aria-label={uiMessage("recipe.schedule.startLater")}
              title={uiMessage("recipe.schedule.startLater")}
            >
              <Plus size={13} />
            </button>
          </div>
          <time className="procedure-hero__time-suffix type-data-sm" dateTime={startTime.toISOString()} title={startDayLabel}>
            {startTime.toLocaleDateString(bcp47,{weekday:"short",day:"numeric",month:"short"})}
          </time>
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditingTime(true)}
            /* FW-12 (S09-B-10): stessa azione del valore, che è già nel Tab:
               la matita resta per il tocco, fuori dall'ordine di tabulazione. */
            tabIndex={-1}
            aria-hidden="true"
            className="procedure-hero__edit-time"
            aria-label={uiMessage("features.recipe.procedure-hero.modifica-value-f8c9ece2", [ui.startTime])}
            title={uiMessage("features.recipe.procedure-hero.modifica-value-f8c9ece2", [ui.startTime])}
          >
            <Pencil size={14} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="procedure-hero__time" data-editing={editingEndTime || undefined}>
          <div className="procedure-hero__time-label type-data">
            {ui.endTime}
          </div>
          <div className="procedure-hero__time-controls">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="procedure-hero__shift-btn"
              aria-label={uiMessage("recipe.schedule.endEarlier")}
              title={uiMessage("recipe.schedule.endEarlier")}
            >
              <Minus size={13} />
            </button>
            {editingEndTime ? (
              <input
                type="datetime-local"
                autoFocus
                defaultValue={localDateTimeValue(endTime)}
                step={60}
                onBlur={handleEndTimeInput}
                onChange={handleEndTimeInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    (e.target as HTMLInputElement).blur();
                }}
                aria-label={ui.endTime}
                className="procedure-hero__time-input type-numeric"
              />
            ) : (
              <button
                onClick={() => setEditingEndTime(true)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setStartTime((s) => shiftQuarter(s, 1));
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setStartTime((s) => shiftQuarter(s, -1));
                  }
                }}
                aria-label={`${ui.endTime} ${approxEnd ? uiMessage("features.recipe.procedure-hero.ca-dfd4ac18") : ""}${fmt.clockTime(endDisplayTime)} ${endDayLabel}`}
                aria-keyshortcuts="ArrowUp ArrowDown"
                aria-describedby={shiftHintId}
                className="procedure-hero__time-display type-numeric"
              >
                <span className="procedure-hero__time-value">
                  {/* FW-19 (S09-A-10): una sola notazione per «circa». */}
                  {approxEnd ? cms.cooking.approxPrefix : ""}
                  {fmt.clockTime(endDisplayTime)}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="procedure-hero__shift-btn"
              aria-label={uiMessage("recipe.schedule.endLater")}
              title={uiMessage("recipe.schedule.endLater")}
            >
              <Plus size={13} />
            </button>
          </div>
          <time className="procedure-hero__time-suffix type-data-sm" dateTime={endDisplayTime.toISOString()} title={endDayLabel}>
            {endDisplayTime.toLocaleDateString(bcp47,{weekday:"short",day:"numeric",month:"short"})}
          </time>
          {/* S09-B-15: il «circa» detto a chi guarda, non solo allo screen reader. */}
          {approxEnd && <p className="procedure-hero__approx-help type-data-sm">{uiMessage("recipe.schedule.approxHelp")}</p>}
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditingEndTime(true)}
            /* FW-12 (S09-B-10): stessa azione del valore, che è già nel Tab:
               la matita resta per il tocco, fuori dall'ordine di tabulazione. */
            tabIndex={-1}
            aria-hidden="true"
            className="procedure-hero__edit-time"
            aria-label={uiMessage("features.recipe.procedure-hero.modifica-value-f8c9ece2", [ui.endTime])}
            title={uiMessage("features.recipe.procedure-hero.modifica-value-f8c9ece2", [ui.endTime])}
          >
            <Pencil size={14} aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {/* Smart Eating Planner Shortcuts */}
      <div className="procedure-hero__meals">
        <div className="procedure-hero__now">
          {/* S09-B-05: «Inizia ora» è un'azione, non una scelta fra i pasti. */}
          <CtaButton
            type="button"
            variant="secondary"
            radius="pill"
            elevated={false}
            onClick={() => {
              const now = new Date();
              // Explicit scheduling from now replaces the comfort adjustments;
              // otherwise its effect could immediately move the start again.
              setComfortToggled(false);
              preComfortStart.current = null;
              setStretch({});
              setPreciseEndTime(false);
              setStartTime(now);
              setPlannedFromNow(now.getTime());
            }}
            aria-describedby={nowHelpId}
            className="procedure-hero__now-btn"
          >
            <CalendarClock size={15} aria-hidden="true" />
            {uiMessage("features.recipe.procedure-hero.inizia-ora-895d8504")}</CtaButton>
          <p id={nowHelpId} className="procedure-hero__now-help">{fromNowHelp}</p>
        </div>
        {plannedFromNow === startTime.getTime() && <p role="status" className="procedure-hero__now-status">
          {uiMessage("recipe.schedule.updated")}
        </p>}

        <div className="procedure-hero__meal-picker">
          <p id={mealsLabelId} className="procedure-hero__meals-label">
            {uiMessage("features.recipe.procedure-hero.pronto-per-il-pasto-503f1512")}</p>
          {feasibleMeals.length > 0 ? (
            <div role="group" aria-labelledby={mealsLabelId} className="procedure-hero__meals-row">
              {feasibleMeals.map((slot) => (
                <FilterChip
                  key={slot.id}
                  active={slot.id === selectedMeal}
                  size="sm"
                  radius="xl"
                  onClick={() => { setPreciseEndTime(true); setStartTime(slot.idealStart); }}
                  className="procedure-hero__meal-chip"
                >
                  {/* S09-A-16: l'ora del pasto, e «fra…» per le ore che mancano. */}
                  <strong className="procedure-hero__meal-name">
                    {timeSlotText(slot, cms, bcp47).label}{" "}
                    <time className="type-numeric" dateTime={slot.mealAt.toISOString()}>{fmt.clockTime(slot.mealAt)}</time>
                  </strong>
                  <small className="procedure-hero__meal-in type-data-sm">{formatRelative(slot.mealAt.getTime(), Date.now(), bcp47)}</small>
                </FilterChip>
              ))}
            </div>
          ) : (
            <EmptyState
              title={uiMessage("recipe.schedule.noMealFits")}
              headingLevel={3}
              actions={[{
                label: uiMessage("features.recipe.procedure-hero.modifica-value-f8c9ece2", [ui.endTime]),
                onClick: () => setEditingEndTime(true),
              }]}
              className="procedure-hero__no-meal"
            />
          )}
        </div>
      </div>

      <div
        className={
          comfortToggled
            ? "procedure-hero__comfort procedure-hero__comfort--active"
            : "procedure-hero__comfort"
        }
      >
        <div className="procedure-hero__comfort-text">
          <div id={comfortTitleId} className="procedure-hero__comfort-title type-data">
            {engineMessage(cms, "timelineComfort.title", "")}
          </div>
          <div id={comfortDescId} className={comfortDescClass}>
            {comfortDesc}
          </div>
        </div>
        <Switch
          aria-labelledby={comfortTitleId}
          aria-describedby={comfortDescId}
          /* FW-19 (S09-A-03): senza un piano che tolga la notte l'interruttore
             non può fare nulla; il perché è nella descrizione collegata. */
          disabled={nightWithoutPlan}
          checked={comfortToggled}
          onCheckedChange={(checked) => {
            setPreciseEndTime(false);
            setComfortToggled(checked);
            if (!checked) {
              setStretch({});
              if (preComfortStart.current) {
                setStartTime(preComfortStart.current);
                preComfortStart.current = null;
              }
            }
          }}
        />
      </div>
      {/* FW-19 (D-Q, S09-A-05, S09-B-04): la Timeline comoda sposta solo gli
          orari; il lievito resta quello calcolato. Lo dice al livello 1 e,
          a richiesta, spiega con quali margini (regole pratiche, non misure). */}
      {comfortToggled && (
        <div data-region="comfort-note" className="procedure-hero__comfort-note">
          <p className="procedure-hero__comfort-dose type-data-sm">
            {engineMessage(cms, "timelineComfort.doseNote", "")}
          </p>
          <Disclosure
            variant="inline"
            summary={engineMessage(cms, "timelineComfort.whyTitle", "")}
            className="procedure-hero__comfort-why"
          >
            <p className="procedure-hero__comfort-why-body type-data-sm">{comfortWhy}</p>
          </Disclosure>
        </div>
      )}
    </>
  );

  return (
    <Surface className="procedure-hero">
      <div className="procedure-hero__header">
        <div className="procedure-hero__title-group">
          <CalendarRange size={16} className="procedure-hero__title-icon" />
          <h2 className="procedure-hero__title">{ui.timeline}</h2>
        </div>
        <span className="procedure-hero__total">
          {uiMessage("features.recipe.procedure-hero.tempo-totale-3c1f6a6f")}{fmt.durationMinutes(totalDurationMin)}
        </span>
      </div>

      {compact ? (
        <>
          <p className="procedure-hero__summary type-data">
            <time className="procedure-hero__summary-part" dateTime={startTime.toISOString()}>
              {ui.startTime} <strong className="type-numeric">{fmt.clockTime(startTime)}</strong> {startDayLabel}
            </time>
            <ArrowRight size={14} aria-hidden="true" className="procedure-hero__summary-arrow" />
            <time className="procedure-hero__summary-part" dateTime={endDisplayTime.toISOString()}>
              {ui.endTime} <strong className="type-numeric">{approxEnd ? cms.cooking.approxPrefix : ""}{fmt.clockTime(endDisplayTime)}</strong> {endDayLabel}
            </time>
          </p>
          <Disclosure
            variant="inline"
            summary={uiMessage("recipe.schedule.editPlan")}
            open={planOpen}
            onOpenChange={setPlanOpen}
            className="procedure-hero__plan"
          >
            {body}
          </Disclosure>
        </>
      ) : body}
    </Surface>
  );
}
