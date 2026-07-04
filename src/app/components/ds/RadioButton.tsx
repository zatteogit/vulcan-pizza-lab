/**
 * ds/RadioButton — T4 radio token-driven, context-free.
 *
 * Selezione esclusiva: cerchio esterno (outline → primary) con dot interno
 * animato spring. Controllato: lo stato del gruppo vive nel chiamante.
 * Estratto da RadioButtonSpec (design-system). Vedi docs/design-system-tiers.md.
 */
import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

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
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
        style={{ border: `2px solid ${checked ? "var(--primary)" : "var(--outline)"}` }}
      >
        <motion.div
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "var(--primary)" }}
        />
      </div>
      {(label || description) && (
        <div>
          {label && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-lg)",
                fontWeight: checked
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
