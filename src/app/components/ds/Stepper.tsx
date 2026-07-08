/**
 * ds/Stepper — T4 contatore numerico −/valore/+ token-driven.
 *
 * Incapsula la struttura (due IconButton + valore animato), la logica min/max e
 * il disabilitato ai limiti. Apparenza dei bottoni e del valore via prop, così
 * resta riusabile (context-free: le label aria sono prop). Vedi docs/design-system-tiers.md (T4).
 */
import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { IconButton } from "./IconButton";

export type StepperProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  decrementLabel: string;
  incrementLabel: string;
  /** Stile della superficie dei due bottoni (es. recipe-bg/border). */
  buttonStyle?: CSSProperties;
  /** Stile del valore centrale (font, colore, larghezza minima…). */
  valueStyle?: CSSProperties;
  iconSize?: number;
  className?: string;
};

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  decrementLabel,
  incrementLabel,
  buttonStyle,
  valueStyle,
  iconSize = 14,
  className,
}: StepperProps) {
  return (
    <div className={`ds-stepper${className ? ` ${className}` : ""}`}>
      <IconButton
        onClick={() => onChange(value - step)}
        disabled={value <= min}
        size="md"
        radius="xl"
        variant="ghost"
        className="ds-stepper__btn"
        style={buttonStyle}
        aria-label={decrementLabel}
      >
        <Minus size={iconSize} />
      </IconButton>
      <motion.span
        key={value}
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="type-numeric ds-stepper__value"
        style={valueStyle}
      >
        {value}
      </motion.span>
      <IconButton
        onClick={() => onChange(value + step)}
        disabled={value >= max}
        size="md"
        radius="xl"
        variant="ghost"
        className="ds-stepper__btn"
        style={buttonStyle}
        aria-label={incrementLabel}
      >
        <Plus size={iconSize} />
      </IconButton>
    </div>
  );
}
