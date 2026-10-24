import { useId, useState } from "react";
import { CalendarClock, Check } from "lucide-react";
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
}: {
  /** Lo slot su misura attualmente scelto, se c'è. */
  activeSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  cms: CmsContent;
  bcp47: string;
}) {
  const inputId = useId();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const active = activeSlot?.id === CUSTOM_SLOT_ID;
  const activeText = active && activeSlot ? timeSlotText(activeSlot, cms, bcp47) : null;

  const openForm = () => {
    const now = new Date();
    setValue(toLocalInputValue(activeSlot?.targetAt ? new Date(activeSlot.targetAt) : defaultTarget(now)));
    setError(false);
    setOpen(true);
  };

  const confirm = () => {
    const slot = value ? customMealSlot(new Date(value)) : null;
    if (!slot) {
      setError(true);
      return;
    }
    setOpen(false);
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
            aria-invalid={error}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setValue(event.target.value);
              setError(false);
            }}
            className="needs-custom-slot__input"
          />
          {error && (
            <p id={errorId} role="alert" className="type-body needs-custom-slot__error">
              {cms.ui.slotCustomOutOfRange}
            </p>
          )}
          <CtaButton type="button" radius="lg" onClick={confirm} className="needs-custom-slot__confirm">
            {cms.ui.slotCustomConfirm}
          </CtaButton>
        </div>
      )}
    </div>
  );
}
