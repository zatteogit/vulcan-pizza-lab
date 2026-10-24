/**
 * ds/Stepper — T4 contatore numerico −/valore/+ token-driven.
 *
 * Incapsula la struttura (due IconButton + valore animato), la logica min/max e
 * il disabilitato ai limiti. Espone classi strutturali stabili per la
 * composizione T5, senza accettare presentation inline; le label aria restano
 * obbligatorie e contestuali. Vedi docs/design-system-tiers.md (T4).
 */
import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { IconButton } from "./IconButton";

export type StepperProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  decrementLabel: string;
  incrementLabel: string;
  iconSize?: number;
  className?: string;
  /** Valore digitabile (audit totale n. 15: 60 panetti a colpi di «+» erano
   *  60 tocchi). Serve il nome accessibile del campo. */
  inputLabel?: string;
};

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  decrementLabel,
  incrementLabel,
  iconSize = 14,
  className,
  inputLabel,
}: StepperProps) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Math.round(Number(draft));
    if (!Number.isFinite(n)) return setDraft(String(value));
    const clamped = Math.max(min, Math.min(max, n));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };
  return (
    <div className={`ds-stepper${className ? ` ${className}` : ""}`}>
      <IconButton
        onClick={() => onChange(value - step)}
        disabled={value <= min}
        size="md"
        radius="xl"
        variant="ghost"
        className="ds-stepper__btn"
        aria-label={decrementLabel}
      >
        <Minus size={iconSize} />
      </IconButton>
      {inputLabel ? (
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={draft}
          aria-label={inputLabel}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          className="type-numeric ds-stepper__value ds-stepper__input"
        />
      ) : (
        <motion.span
          key={value}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className="type-numeric ds-stepper__value"
        >
          {value}
        </motion.span>
      )}
      <IconButton
        onClick={() => onChange(value + step)}
        disabled={value >= max}
        size="md"
        radius="xl"
        variant="ghost"
        className="ds-stepper__btn"
        aria-label={incrementLabel}
      >
        <Plus size={iconSize} />
      </IconButton>
    </div>
  );
}
