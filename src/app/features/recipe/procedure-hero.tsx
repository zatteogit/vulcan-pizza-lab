/* ═══ PROCEDURE HERO — Tabella di marcia (estratto fase 2, lug 2026) ═══
 * Start/fine con shifter a quarti d'ora, chip del giorno, scorciatoie
 * "pronto per il pasto" e Timeline comoda. Stato e handler restano in
 * RecipeOutput (gli orari guidano anche la timeline): qui arrivano via props. */

import { CalendarClock, CalendarRange, Minus, Pencil, Plus } from "lucide-react";
import type {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { useId, useState } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { timeSlotText } from "./time-slot-text";
import { Disclosure, IconButton, Surface, Switch } from "../../components/ds/index";
import type { TimeSlot } from "../../domain/pizza-engine";
import {
  daySuffix,
  engineMessage,
  shiftQuarter,
} from "./recipe-output-format";
import { COMFORT_TOLERANCES, type NightAction, type optimizeComfort } from "../../use-cases/cook-plan";
import { t } from "../cms/i18n";
import { uiMessage } from "../../i18n/ui-messages";

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
  setPreciseEndTime: Dispatch<SetStateAction<boolean>>;
  totalDurationMin: number;
  hasFlexiblePhases: boolean;
  editingTime: boolean;
  setEditingTime: Dispatch<SetStateAction<boolean>>;
  editingEndTime: boolean;
  setEditingEndTime: Dispatch<SetStateAction<boolean>>;
  handleTimeInput: (e: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) => void;
  handleEndTimeInput: (e: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) => void;
  mealSlots: (TimeSlot & { idealStart: Date; isFeasible: boolean })[];
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

      {/* FW-12 (S09-B-10): la scorciatoia delle frecce, detta allo screen reader. */}
      <p id={shiftHintId} className="sr-only">{uiMessage("features.recipe.procedure-hero.shift-hint")}</p>
      <div className="procedure-hero__times">
        <div className="procedure-hero__time">
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

        <div className="procedure-hero__time">
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
                aria-label={`${ui.endTime} ${hasFlexiblePhases ? uiMessage("features.recipe.procedure-hero.ca-dfd4ac18") : ""}${fmt.clockTime(endDisplayTime)} ${endDayLabel}`}
                aria-keyshortcuts="ArrowUp ArrowDown"
                aria-describedby={shiftHintId}
                className="procedure-hero__time-display type-numeric"
              >
                <span className="procedure-hero__time-value">
                  {/* FW-19 (S09-A-10): una sola notazione per «circa». */}
                  {hasFlexiblePhases ? cms.cooking.approxPrefix : ""}
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
          <button
            type="button"
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
            title={fromNowHelp}
            className="procedure-hero__meal-chip"
          >
            <CalendarClock size={15} aria-hidden="true" />
            {uiMessage("features.recipe.procedure-hero.inizia-ora-895d8504")}</button>
          <p id={nowHelpId} className="procedure-hero__now-help">{fromNowHelp}</p>
        </div>
        {plannedFromNow === startTime.getTime() && <p role="status" className="procedure-hero__now-status">
          {uiMessage("recipe.schedule.updated")}
        </p>}

        {feasibleMeals.length > 0 && <div className="procedure-hero__meal-picker">
          <div className="procedure-hero__meals-label">
            {uiMessage("features.recipe.procedure-hero.pronto-per-il-pasto-503f1512")}</div>
          <div className="procedure-hero__meals-row">
            {feasibleMeals.map((slot) => {
              const text = timeSlotText(slot, cms, bcp47);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => { setPreciseEndTime(true); setStartTime(slot.idealStart); }}
                  className="procedure-hero__meal-chip"
                >
                  {text.label} ({text.sublabel})
                </button>
              );
            })}
          </div>
        </div>}
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
            {engineMessage(cms, "timelineComfort.title", "Timeline comoda")}
          </div>
          <div id={comfortDescId} className={comfortDescClass}>
            {comfortToggled
              ? nightActivesLeft > 0
                ? engineMessage(cms, "timelineComfort.activePartial", "Attiva, ma alcune fasi restano di notte: scegli un altro pasto qui sopra.")
                : engineMessage(cms, "timelineComfort.active", "Attiva: evita le fasi notturne.")
              : currentComfortPlan
                ? engineMessage(cms, "timelineComfort.nightDetected", "Fasi attive di notte rilevate.")
                : nightWithoutPlan
                  ? t(engineMessage(cms, feasibleMeals.length > 0 ? "timelineComfort.nightNoPlan" : "timelineComfort.nightNoPlanNoMeal", ""), {
                      n: nightActivesLeft,
                      time: firstNightLabel,
                    })
                  : engineMessage(cms, "timelineComfort.idle", "Ottimizza gli orari se serve.")}
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
    </Surface>
  );
}
