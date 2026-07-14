/**
 * ds/Fab — T4 Floating Action Button token-driven, context-free.
 *
 * Azione primaria flottante. 3 varianti (standard 56px, small 40px, extended
 * con label) × 3 colori (primary, surface, tertiary). Estratto da FABSpec.
 */
import type { CSSProperties, ReactNode } from "react";

export interface FabProps {
  icon?: ReactNode;
  /** Solo `extended`. */
  label?: string;
  /** Nome accessibile per le varianti icon-only. Se omesso, usa `label`. */
  ariaLabel?: string;
  variant?: "standard" | "small" | "extended";
  color?: "primary" | "surface" | "tertiary";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const VARIANT_CLASS: Record<NonNullable<FabProps["variant"]>, string> = {
  standard: "ds-fab--standard",
  small: "ds-fab--small",
  extended: "ds-fab--extended",
};

const COLOR_CLASS: Record<NonNullable<FabProps["color"]>, string> = {
  primary: "ds-fab--c-primary",
  surface: "ds-fab--c-surface",
  tertiary: "ds-fab--c-tertiary",
};

export function Fab({
  icon,
  label,
  ariaLabel,
  variant = "standard",
  color = "primary",
  onClick,
  disabled = false,
  className,
  style,
}: FabProps) {
  const extended = variant === "extended";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={!extended ? ariaLabel ?? label : ariaLabel}
      className={`ds-fab ${VARIANT_CLASS[variant]} ${COLOR_CLASS[color]} ${className ?? ""}`}
      style={style}
    >
      {icon}
      {extended && label && <span data-slot="label">{label}</span>}
    </button>
  );
}
