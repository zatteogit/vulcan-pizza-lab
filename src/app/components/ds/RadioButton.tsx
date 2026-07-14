/**
 * ds/RadioButton — T4 radio token-driven, context-free.
 *
 * Selezione esclusiva: cerchio esterno (outline → primary) con dot interno
 * animato spring. Controllato: lo stato del gruppo vive nel chiamante.
 * Estratto da RadioButtonSpec (design-system). Vedi docs/design-system-tiers.md.
 */
import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { motionSpring } from "./motion";

export interface RadioButtonProps {
  checked?: boolean;
  onSelect?: () => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function RadioButton({
  checked = false,
  onSelect,
  label,
  description,
  disabled = false,
  className,
  style,
}: RadioButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onSelect?.()}
      className={[
        "ds-radio",
        checked ? "ds-radio--checked" : "",
        disabled ? "ds-radio--disabled" : "",
        label || description ? "ds-radio--block" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <div className="ds-radio__circle">
        <motion.div
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={motionSpring.radioMark}
          className="ds-radio__dot"
        />
      </div>
      {(label || description) && (
        <div className="ds-radio__text">
          {label && <div className="ds-radio__label">{label}</div>}
          {description && <div className="ds-radio__description">{description}</div>}
        </div>
      )}
    </button>
  );
}
