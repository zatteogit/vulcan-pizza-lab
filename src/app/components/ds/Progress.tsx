/**
 * ds/Progress — T4 indicatore di avanzamento token-driven, context-free.
 *
 * Lineare o circolare, determinato (value 0–100) o indeterminato.
 * Estratto da ProgressIndicatorSpec.
 */
import { motion } from "motion/react";
import type { CSSProperties } from "react";

export interface ProgressProps {
  value?: number;
  indeterminate?: boolean;
  variant?: "linear" | "circular";
  /** Diametro per `circular`. */
  size?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const TRACK = "var(--surface-container-high)";
const FILL = "var(--primary)";

export function Progress({
  value = 0,
  indeterminate = false,
  variant = "linear",
  size = 44,
  label,
  className,
  style,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));

  if (variant === "circular") {
    const stroke = 4;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`ds-progress--circular${className ? ` ${className}` : ""}`}
        style={style}
        animate={indeterminate ? { rotate: 360 } : undefined}
        transition={indeterminate ? { repeat: Infinity, duration: 1, ease: "linear" } : undefined}
        role="progressbar"
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={FILL}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={indeterminate ? circ * 0.7 : circ * (1 - pct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </motion.svg>
    );
  }

  return (
    <div className={className} style={style}>
      {label && <div className="ds-progress__label">{label}</div>}
      <div className="ds-progress__track">
        {indeterminate ? (
          <motion.div
            className="ds-progress__fill ds-progress__fill--indeterminate"
            animate={{ left: ["-40%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          />
        ) : (
          <div className="ds-progress__fill" style={{ ["--ds-progress-pct" as any]: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}
