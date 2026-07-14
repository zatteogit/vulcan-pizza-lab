/**
 * ds/Spinner — T4 loading indicator token-driven, context-free.
 *
 * Anello che ruota (arco primary su track). Estratto da LoadingIndicatorSpec.
 */
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { motionTiming } from "./motion";
import { uiMessage } from "../../i18n/ui-messages";

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
      transition={motionTiming.spinner}
      role="status"
      aria-label={uiMessage("components.ds.spinner.caricamento-9f21540f")}
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
