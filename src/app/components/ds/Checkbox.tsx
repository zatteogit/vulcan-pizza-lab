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
    <div
      className="flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center mt-0.5"
      style={{
        border: "2px solid",
        borderColor: isActive ? "var(--primary)" : "var(--outline)",
        backgroundColor: isActive ? "var(--primary)" : "rgba(0,0,0,0)",
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <AnimatePresence mode="wait">
        {isChecked && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
          >
            <Check size={14} style={{ color: "var(--primary-foreground)" }} />
          </motion.div>
        )}
        {isIndeterminate && (
          <motion.div
            key="minus"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
          >
            <Minus size={14} style={{ color: "var(--primary-foreground)" }} />
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
        "flex items-start gap-3 py-3 px-2 rounded-xl text-left active:scale-98 transition-transform",
        label || description ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: "rgba(0,0,0,0)",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {box}
      {(label || description) && (
        <div>
          {label && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-lg)",
                fontWeight: isActive
                  ? ("var(--weight-semibold)" as CSSProperties["fontWeight"])
                  : ("var(--weight-regular)" as CSSProperties["fontWeight"]),
                color: "var(--text-default)",
                lineHeight: "var(--leading-compact)",
              }}
            >
              {label}
            </div>
          )}
          {description && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-base)",
                color: "var(--text-muted)",
                lineHeight: "var(--leading-body)",
                marginTop: 2,
              }}
            >
              {description}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
