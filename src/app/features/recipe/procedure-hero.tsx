/* ═══ PROCEDURE HERO — Tabella di marcia (estratto fase 2, lug 2026) ═══
 * Start/fine con shifter a quarti d'ora, chip del giorno, scorciatoie
 * "pronto per il pasto" e Timeline comoda. Stato e handler restano in
 * RecipeOutput (gli orari guidano anche la timeline): qui arrivano via props. */

import { CalendarRange, Minus, Plus } from "lucide-react";
import type {
  ChangeEvent,
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { Surface, Switch } from "../../components/ds/index";
import type { TimeSlot } from "../../domain/pizza-engine";
import {
  dayOffset,
  daySuffix,
  engineMessage,
  optimizeComfort,
  roundToQuarter,
  shiftQuarter,
} from "./recipe-output-format";

export interface ProcedureHeroControlsProps {
  startTime: Date;
  setStartTime: Dispatch<SetStateAction<Date>>;
  endTime: Date;
  totalDurationMin: number;
  hasFlexiblePhases: boolean;
  editingTime: boolean;
  setEditingTime: Dispatch<SetStateAction<boolean>>;
  editingEndTime: boolean;
  setEditingEndTime: Dispatch<SetStateAction<boolean>>;
  handleTimeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeInput: (e: ChangeEvent<HTMLInputElement>) => void;
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
  return (

    <Surface
      className="p-4 sm:p-5"
      style={{
        background:
          "color-mix(in srgb, var(--container-bg) 88%, transparent)",
        boxShadow: "0 12px 34px color-mix(in srgb, var(--shadow-color) 8%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarRange size={16} className="text-primary flex-shrink-0" />
          <h3 className="type-title-sm truncate">{ui.timeline}</h3>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
          style={{
            background: "color-mix(in srgb, var(--primary) 12%, transparent)",
            color: "var(--primary)",
          }}
        >
          Tempo totale: {fmt.durationMinutes(totalDurationMin)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div
          className="rounded-2xl px-2.5 py-3 sm:px-3"
          style={{
            background: "var(--container-bg-low)",
            border: "1px solid var(--container-border-subtle)",
          }}
        >
          <div
            className="type-data"
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: 1,
            }}
          >
            {ui.startTime}
          </div>
          <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaEarlier}
            >
              <Minus size={13} />
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
                  fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                  fontWeight: "var(--weight-bold)" as any,
                  width: 58,
                  border: "none",
                  borderBottom: "2px solid var(--recipe-highlight)",
                }}
              />
            ) : (
              <button
                onClick={() => setEditingTime(true)}
                className="type-numeric flex flex-col items-center justify-center"
                style={{
                  minWidth: 0,
                  flex: 1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px dashed var(--recipe-border)",
                  paddingBottom: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                    fontWeight: "var(--weight-bold)" as any,
                    lineHeight: "var(--leading-tight)",
                    color: "var(--text-accent)",
                  }}
                >
                  {fmt.clockTime(startTime)}
                </span>
                <span
                  className="type-data-sm"
                  style={{
                    display: "block",
                    fontWeight: "var(--weight-medium)" as any,
                    color: "var(--text-muted)",
                    lineHeight: "var(--leading-tight)",
                    marginTop: "var(--space-0-5)",
                    minHeight: "2.2em",
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    visibility: dayOffset(new Date(), startTime) > 0 ? "visible" : "hidden",
                  }}
                >
                  {daySuffix(new Date(), startTime, cms.cooking).trim() || " "}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaLater}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl px-2.5 py-3 sm:px-3"
          style={{
            background: "var(--container-bg-low)",
            border: "1px solid var(--container-border-subtle)",
          }}
        >
          <div
            className="type-data"
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: 1,
            }}
          >
            {ui.endTime}
          </div>
          <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaEarlier}
            >
              <Minus size={13} />
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
                  fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                  fontWeight: "var(--weight-bold)" as any,
                  width: 58,
                  border: "none",
                  borderBottom: "2px solid var(--recipe-highlight)",
                }}
              />
            ) : (
              <button
                onClick={() => setEditingEndTime(true)}
                className="type-numeric flex flex-col items-center justify-center"
                style={{
                  minWidth: 0,
                  flex: 1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px dashed var(--recipe-border)",
                  paddingBottom: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                    fontWeight: "var(--weight-bold)" as any,
                    lineHeight: "var(--leading-tight)",
                    color: "var(--text-accent)",
                  }}
                >
                  {hasFlexiblePhases ? "~" : ""}
                  {fmt.clockTime(endTime)}
                </span>
                <span
                  className="type-data-sm"
                  style={{
                    display: "block",
                    fontWeight: "var(--weight-medium)" as any,
                    color: "var(--text-muted)",
                    lineHeight: "var(--leading-tight)",
                    marginTop: "var(--space-0-5)",
                    minHeight: "2.2em",
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    visibility: dayOffset(new Date(), endTime) > 0 ? "visible" : "hidden",
                  }}
                >
                  {daySuffix(new Date(), endTime, cms.cooking).trim() || " "}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaLater}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Start Day Shifter */}
      <div className="mt-3.5 flex gap-2">
        {[
          { offset: 0, label: "Oggi" },
          { offset: 1, label: "Domani" },
          { offset: 2, label: "Dopodomani" },
        ].map((dayOpt) => {
          const now = new Date();
          const currentStartDay = dayOffset(now, startTime);
          const isSelected = currentStartDay === dayOpt.offset;
          return (
            <button
              key={dayOpt.offset}
              type="button"
              onClick={() => {
                const newStart = new Date(startTime);
                const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOpt.offset);
                newStart.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                setStartTime(roundToQuarter(newStart));
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl text-center text-xs font-semibold active:scale-[0.97] transition-all"
              style={{
                background: isSelected ? "var(--chip-bg-active)" : "var(--container-bg-low)",
                border: isSelected ? "1px solid var(--tertiary)" : "1px solid var(--container-border-subtle)",
                color: isSelected ? "var(--chip-text-active)" : "var(--text-default)",
                cursor: "pointer",
              }}
            >
              {dayOpt.label}
            </button>
          );
        })}
      </div>

      {/* Smart Eating Planner Shortcuts */}
      <div className="mt-4 pt-3.5" style={{ borderTop: "1px solid var(--container-border-subtle)" }}>
        <div
          className="text-[10px] font-bold tracking-wider uppercase mb-2"
          style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-spread)" }}
        >
          Pronto per il pasto:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStartTime(roundToQuarter(new Date()))}
            className="px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
            style={{
              background: "var(--container-bg-low)",
              border: "1px solid var(--container-border-subtle)",
              color: "var(--text-default)",
              cursor: "pointer",
            }}
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
                className="px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
                style={{
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border-subtle)",
                  color: "var(--text-default)",
                  cursor: "pointer",
                }}
              >
                {slot.label} ({slot.sublabel})
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-all"
        style={{
          background: comfortToggled
            ? "var(--recipe-comfort-bg, color-mix(in srgb, var(--cta) 5%, transparent))"
            : "var(--container-bg-low)",
          border: comfortToggled
            ? "1px solid var(--recipe-comfort-border, var(--recipe-success))"
            : "1px solid var(--container-border-subtle)",
        }}
      >
        <div className="min-w-0 text-left">
          <div
            className="type-data"
            style={{
              color: "var(--text-default)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: "var(--leading-tight)",
            }}
          >
            {engineMessage(cms, "timelineComfort.title", "Timeline comoda")}
          </div>
          <div
            className="mt-0.5 type-data-sm"
            style={{
              color: comfortToggled
                ? "var(--recipe-success)"
                : currentComfortPlan
                  ? "var(--recipe-warning-text, var(--primary))"
                  : "var(--text-muted)",
              lineHeight: "var(--leading-normal)",
            }}
          >
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
