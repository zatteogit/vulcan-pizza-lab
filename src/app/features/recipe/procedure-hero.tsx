/* ═══ PROCEDURE HERO — Tabella di marcia (estratto fase 2, lug 2026) ═══
 * Start/fine con shifter a quarti d'ora, chip del giorno, scorciatoie
 * "pronto per il pasto" e Timeline comoda. Stato e handler restano in
 * RecipeOutput (gli orari guidano anche la timeline): qui arrivano via props. */

import { CalendarRange, Clock3, Minus, Plus } from "lucide-react";
import type {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { Surface, Switch } from "../../components/ds/index";
import type { TimeSlot } from "../../domain/pizza-engine";
import {
  daySuffix,
  engineMessage,
  optimizeComfort,
  roundToQuarter,
  shiftQuarter,
} from "./recipe-output-format";

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
  setComfortToggled,
  currentComfortPlan,
  preComfortStart,
  setStretch,
}: ProcedureHeroControlsProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

  const startDayLabel = daySuffix(new Date(), startTime, cms.cooking).trim() || "oggi";
  const endDayLabel = daySuffix(new Date(), endTime, cms.cooking).trim() || "oggi";

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
          <h3 className="procedure-hero__title">{ui.timeline}</h3>
        </div>
        <span className="procedure-hero__total">
          Tempo totale: {fmt.durationMinutes(totalDurationMin)}
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
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setEditingTime(true)}
            className="procedure-hero__native-picker"
          >
            <Clock3 size={13} aria-hidden="true" />
            Modifica data e ora
          </button>
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
                className="procedure-hero__time-display type-numeric"
              >
                <span className="procedure-hero__time-value">
                  {hasFlexiblePhases ? "ca. " : ""}
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
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setEditingEndTime(true)}
            className="procedure-hero__native-picker"
          >
            <Clock3 size={13} aria-hidden="true" />
            Modifica data e ora
          </button>
        </div>
      </div>

      {/* Smart Eating Planner Shortcuts */}
      <div className="procedure-hero__meals">
        <div className="procedure-hero__meals-label">
          Pronto per il pasto:
        </div>
        <div className="procedure-hero__meals-row">
          <button
            type="button"
            onClick={() => setStartTime(roundToQuarter(new Date()))}
            className="procedure-hero__meal-chip"
          >
            ⚡ Inizia ora
          </button>

          {mealSlots.map((slot) => {
            if (!slot.isFeasible) return null;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setStartTime(roundToQuarter(slot.idealStart))}
                className="procedure-hero__meal-chip"
              >
                {slot.label} ({slot.sublabel})
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
          <div className="procedure-hero__comfort-title type-data">
            {engineMessage(cms, "timelineComfort.title", "Timeline comoda")}
          </div>
          <div className={comfortDescClass}>
            {comfortToggled
              ? engineMessage(cms, "timelineComfort.active", "Attiva: evita le fasi notturne.")
              : currentComfortPlan
                ? engineMessage(cms, "timelineComfort.nightDetected", "Fasi attive di notte rilevate.")
                : engineMessage(cms, "timelineComfort.idle", "Ottimizza gli orari se serve.")}
          </div>
        </div>
        <Switch
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
