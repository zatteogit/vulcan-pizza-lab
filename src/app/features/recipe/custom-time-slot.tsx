import { useId, useState } from "react";
import { AlertCircle, CalendarClock, Check } from "lucide-react";
import {
  CUSTOM_SLOT_ID,
  CUSTOM_SLOT_MAX_HOURS,
  CUSTOM_SLOT_MIN_HOURS,
  customMealSlot,
  type TimeSlot,
} from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { CtaButton } from "../../components/ds/index";
import { timeSlotText } from "./time-slot-text";
import type { EarliestFeasibleMeal } from "../../domain/feasible-slot";
import { uiMessage } from "../../i18n/ui-messages";

/* ═══ U-2 — «si cena sabato alle 20» ═══
 * Oltre agli slot fissi (pranzo 12:30, cena 20:00) si sceglie giorno e ora.
 * Il campo è il datetime-local nativo: tastiera, lettori di schermo e formato
 * della data li gestisce il browser nella lingua dell'utente. */

const HOUR_MS = 3_600_000;

/** Valore per <input type="datetime-local"> nell'ora locale. */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Proposta iniziale: la prossima cena alle 20:00 almeno 3 h più avanti. */
function defaultTarget(now: Date): Date {
  const target = new Date(now);
  target.setHours(20, 0, 0, 0);
  if (target.getTime() - now.getTime() < 3 * HOUR_MS) target.setDate(target.getDate() + 1);
  return target;
}

export function CustomTimeSlot({
  activeSlot,
  onSelect,
  cms,
  bcp47,
  earliestMeal,
}: {
  /** FW-09 (S05-A-13): il primo pasto possibile con questa cucina, dal motore. */
  earliestMeal?: () => EarliestFeasibleMeal | null;
  /** Lo slot su misura attualmente scelto, se c'è. */
  activeSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  cms: CmsContent;
  bcp47: string;
}) {
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  /* FW-09 (S05-A-13): l'errore dice se l'orario è troppo vicino o troppo
     lontano e propone il primo orario valido, calcolato dal motore. */
  const [error, setError] = useState<null | { kind: "soon"; fix: TimeSlot | null } | { kind: "far"; until: Date }>(null);
  const active = activeSlot?.id === CUSTOM_SLOT_ID;
  const activeText = active && activeSlot ? timeSlotText(activeSlot, cms, bcp47) : null;

  const openForm = () => {
    const now = new Date();
    setValue(toLocalInputValue(activeSlot?.targetAt ? new Date(activeSlot.targetAt) : defaultTarget(now)));
    setError(null);
    setOpen(true);
  };

  const confirm = () => {
    const now = new Date();
    const target = value ? new Date(value) : null;
    const slot = target ? customMealSlot(target, now) : null;
    if (target && !slot && target.getTime() > now.getTime() + CUSTOM_SLOT_MIN_HOURS * HOUR_MS) {
      setError({ kind: "far", until: new Date(now.getTime() + CUSTOM_SLOT_MAX_HOURS * HOUR_MS) });
      return;
    }
    const earliest = earliestMeal?.() ?? null;
    if (!slot || (earliest && slot.hours < earliest.hours)) {
      setError({ kind: "soon", fix: earliest ? customMealSlot(earliest.at, now) : null });
      return;
    }
    setOpen(false);
    onSelect(slot);
  };
  const choose = (slot: TimeSlot) => {
    setOpen(false);
    setError(null);
    onSelect(slot);
  };

  const now = new Date();
  const min = toLocalInputValue(new Date(now.getTime() + CUSTOM_SLOT_MIN_HOURS * HOUR_MS));
  const max = toLocalInputValue(new Date(now.getTime() + CUSTOM_SLOT_MAX_HOURS * HOUR_MS));

  return (
    <div className="needs-custom-slot">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openForm())}
        aria-expanded={open}
        className={active ? "needs-custom-slot__toggle needs-custom-slot__toggle--active" : "needs-custom-slot__toggle"}
      >
        <CalendarClock size={18} aria-hidden="true" />
        <span className="needs-custom-slot__label">
          {activeText ? activeText.label : cms.ui.slotCustom}
        </span>
        {activeText && <span className="type-numeric needs-custom-slot__sublabel">{activeText.sublabel}</span>}
        {active && <Check size={16} aria-hidden="true" className="needs-custom-slot__check" />}
      </button>

      {open && (
        <div className="needs-custom-slot__form">
          <label htmlFor={inputId} className="type-label needs-custom-slot__input-label">
            {cms.ui.slotCustomInput}
          </label>
          <input
            id={inputId}
            type="datetime-local"
            value={value}
            min={min}
            max={max}
            step={900}
            aria-invalid={error !== null}
            aria-describedby={error ? errorId : hintId}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            className="needs-custom-slot__input"
          />
          {/* U-10 (F27): il vincolo si legge prima di sbagliare, non solo dopo. */}
          {error ? (
            <p id={errorId} role="alert" className="type-body needs-custom-slot__error">
              <AlertCircle size={16} aria-hidden="true" />
              {error.kind === "far"
                ? uiMessage("ui.slotCustomTooFar", [error.until.toLocaleString(bcp47, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })])
                : error.fix
                  ? uiMessage("ui.slotCustomTooSoon", [timeSlotText(error.fix, cms, bcp47).label])
                  : cms.ui.slotCustomOutOfRange}
            </p>
          ) : (
            <p id={hintId} className="type-body needs-custom-slot__hint">
              {cms.ui.slotCustomOutOfRange}
            </p>
          )}
          <CtaButton type="button" radius="lg" onClick={confirm} className="needs-custom-slot__confirm">
            {cms.ui.slotCustomConfirm}
          </CtaButton>
          {error?.kind === "soon" && error.fix && (
            <CtaButton type="button" radius="lg" variant="secondary" elevated={false} onClick={() => choose(error.fix!)} className="needs-custom-slot__confirm">
              {uiMessage("ui.slotCustomUse", [timeSlotText(error.fix, cms, bcp47).label])}
            </CtaButton>
          )}
        </div>
      )}
    </div>
  );
}
