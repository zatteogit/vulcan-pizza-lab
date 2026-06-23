/**
 * ds/Spinner — T4 loading indicator token-driven, context-free.
 *
 * Anello che ruota (arco primary su track). Estratto da LoadingIndicatorSpec.
 */
import { motion } from "motion/react";
import type { CSSProperties } from "react";

export interface SpinnerProps {
  size?: number;
  /** Colore dell'arco (default `--primary`). */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function Spinner({ size = 24, color = "var(--primary)", className, style }: SpinnerProps) {
  const stroke = Math.max(2, size / 10);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      role="status"
      aria-label="Caricamento"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * 0.75}
      />
    </motion.svg>
  );
}
