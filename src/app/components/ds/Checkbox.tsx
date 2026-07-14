/**
 * ds/Checkbox — T4 checkbox token-driven, context-free.
 *
 * 3 stati: unchecked (outline), checked (Check), indeterminate (Minus).
 * Animazione spring sull'icona. Label + testo di supporto opzionali.
 * Estratto da CheckboxSpec (design-system). Vedi docs/design-system-tiers.md.
 */
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { motionSpring } from "./motion";

export interface CheckboxProps {
  /** `true`, `false`, oppure `"indeterminate"`. */
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
  style,
}: CheckboxProps) {
  const isChecked = checked === true;
  const isIndeterminate = checked === "indeterminate";
  const isActive = isChecked || isIndeterminate;

  const box = (
    <div className="ds-checkbox__box">
      <AnimatePresence mode="wait">
        {isChecked && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={motionSpring.checkmark}
          >
            <Check size={14} className="ds-checkbox__icon" />
          </motion.div>
        )}
        {isIndeterminate && (
          <motion.div
            key="minus"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={motionSpring.checkmark}
          >
            <Minus size={14} className="ds-checkbox__icon" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isChecked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!isChecked)}
      className={[
        "ds-checkbox",
        isActive ? "ds-checkbox--active" : "",
        disabled ? "ds-checkbox--disabled" : "",
        label || description ? "ds-checkbox--block" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {box}
      {(label || description) && (
        <div data-slot="content">
          {label && <div className="ds-checkbox__label">{label}</div>}
          {description && (
            <div className="ds-checkbox__description">{description}</div>
          )}
        </div>
      )}
    </button>
  );
}
