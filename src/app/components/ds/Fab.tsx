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
  variant?: "standard" | "small" | "extended";
  color?: "primary" | "surface" | "tertiary";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const COLORS: Record<NonNullable<FabProps["color"]>, { bg: string; fg: string }> = {
  primary: { bg: "var(--primary)", fg: "var(--primary-foreground)" },
  surface: { bg: "var(--surface-container)", fg: "var(--primary)" },
  tertiary: { bg: "var(--tertiary)", fg: "var(--text-default)" },
};

export function Fab({
  icon,
  label,
  variant = "standard",
  color = "primary",
  onClick,
  disabled = false,
  className,
  style,
}: FabProps) {
  const c = COLORS[color];
  const extended = variant === "extended";
  const size = variant === "small" ? 40 : 56;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center active:scale-95 transition-transform ${className ?? ""}`}
      style={{
        gap: extended ? 8 : 0,
        height: size,
        width: extended ? "auto" : size,
        padding: extended ? "0 20px" : 0,
        borderRadius: extended ? 16 : 18,
        background: c.bg,
        color: c.fg,
        border: "none",
        boxShadow: "var(--shadow-lg)",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--font-size-lg)",
        fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
        ...style,
      }}
    >
      {icon}
      {extended && label && <span>{label}</span>}
    </button>
  );
}
