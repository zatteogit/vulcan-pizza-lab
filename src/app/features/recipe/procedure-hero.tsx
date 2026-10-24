/* ═══ PROCEDURE HERO — Tabella di marcia (estratto fase 2, lug 2026) ═══
 * Start/fine con shifter a quarti d'ora, chip del giorno, scorciatoie
 * "pronto per il pasto" e Timeline comoda. Stato e handler restano in
 * RecipeOutput (gli orari guidano anche la timeline): qui arrivano via props. */

import { CalendarRange, Minus, Pencil, Plus } from "lucide-react";
import type {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { useId } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { timeSlotText } from "./time-slot-text";
import { IconButton, Surface, Switch } from "../../components/ds/index";
import type { TimeSlot } from "../../domain/pizza-engine";
import {
  daySuffix,
  engineMessage,
  optimizeComfort,
  roundToQuarter,
  shiftQuarter,
} from "./recipe-output-format";
import { uiMessage } from "../../i18n/ui-messages";

function localDateTimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface ProcedureHeroControlsProps {
  startTime: Date;
  setStartTime: Dispatch<SetStateAction<Date>>;
  endTime: Date;
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
  /** Audit totale n. 2: fasi attive che restano di notte col piano corrente. */
  nightActivesLeft?: number;
  setComfortToggled: Dispatch<SetStateAction<boolean>>;
  currentComfortPlan: ReturnType<typeof optimizeComfort>;
  preComfortStart: MutableRefObject<Date | null>;
  setStretch: Dispatch<SetStateAction<Record<number, number>>>;
}

export function ProcedureHeroControls({
  startTime,
  setStartTime,
  endTime,
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
  nightActivesLeft = 0,
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

  const startDayLabel = daySuffix(new Date(), startTime, cms.cooking).trim() || cms.cooking.dayToday;
  const endDayLabel = daySuffix(new Date(), endTime, cms.cooking).trim() || cms.cooking.dayToday;

  const comfortDescClass = comfortToggled
    ? "procedure-hero__comfort-desc procedure-hero__comfort-desc--success type-data-sm"
    : currentComfortPlan
      ? "procedure-hero__comfort-desc procedure-hero__comfort-desc--warning type-data-sm"
      : "procedure-hero__comfort-desc procedure-hero__comfort-desc--idle type-data-sm";

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

      <div className="procedure-hero__times">
        <div className="procedure-hero__time">
          <div className="procedure-hero__time-label type-data">
            {ui.startTime}
          </div>
          <div className="procedure-hero__time-controls">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="procedure-hero__shift-btn"
              aria-label={ui.ariaEarlier}
              title={ui.ariaEarlier}
            >
              <Minus size={13} />
            </button>
            {editingTime ? (
              <input
                type="datetime-local"
                autoFocus
                defaultValue={localDateTimeValue(startTime)}
                step={900}
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
                className="procedure-hero__time-display type-numeric"
              >
                <span className="procedure-hero__time-value">
                  {fmt.clockTime(startTime)}
                </span>
                <span className="procedure-hero__time-suffix type-data-sm">
                  {startDayLabel}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="procedure-hero__shift-btn"
              aria-label={ui.ariaLater}
              title={ui.ariaLater}
            >
              <Plus size={13} />
            </button>
          </div>
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditingTime(true)}
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
              aria-label={ui.ariaEarlier}
              title={ui.ariaEarlier}
            >
              <Minus size={13} />
            </button>
            {editingEndTime ? (
              <input
                type="datetime-local"
                autoFocus
                defaultValue={localDateTimeValue(endTime)}
                step={900}
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
                className="procedure-hero__time-display type-numeric"
              >
                <span className="procedure-hero__time-value">
                  {hasFlexiblePhases ? uiMessage("features.recipe.procedure-hero.ca-dfd4ac18") : ""}
                  {fmt.clockTime(endTime)}
                </span>
                <span className="procedure-hero__time-suffix type-data-sm">
                  {endDayLabel}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="procedure-hero__shift-btn"
              aria-label={ui.ariaLater}
              title={ui.ariaLater}
            >
              <Plus size={13} />
            </button>
          </div>
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditingEndTime(true)}
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
        <div className="procedure-hero__meals-label">
          {uiMessage("features.recipe.procedure-hero.pronto-per-il-pasto-503f1512")}</div>
        <div className="procedure-hero__meals-row">
          <button
            type="button"
            onClick={() => setStartTime(roundToQuarter(new Date()))}
            className="procedure-hero__meal-chip"
          >
            {uiMessage("features.recipe.procedure-hero.inizia-ora-895d8504")}</button>

          {mealSlots.map((slot) => {
            if (!slot.isFeasible) return null;
            const text = timeSlotText(slot, cms, bcp47);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setStartTime(roundToQuarter(slot.idealStart))}
                className="procedure-hero__meal-chip"
              >
                {text.label} ({text.sublabel})
              </button>
            );
          })}
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
            {engineMessage(cms, "timelineComfort.title", "Timeline comoda")}
          </div>
          <div id={comfortDescId} className={comfortDescClass}>
            {comfortToggled
              ? nightActivesLeft > 0
                ? engineMessage(cms, "timelineComfort.activePartial", "Attiva, ma alcune fasi restano di notte: scegli un altro pasto qui sopra.")
                : engineMessage(cms, "timelineComfort.active", "Attiva: evita le fasi notturne.")
              : currentComfortPlan
                ? engineMessage(cms, "timelineComfort.nightDetected", "Fasi attive di notte rilevate.")
                : engineMessage(cms, "timelineComfort.idle", "Ottimizza gli orari se serve.")}
          </div>
        </div>
        <Switch
          aria-labelledby={comfortTitleId}
          aria-describedby={comfortDescId}
          checked={comfortToggled}
          onCheckedChange={(checked) => {
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
    </Surface>
  );
}
