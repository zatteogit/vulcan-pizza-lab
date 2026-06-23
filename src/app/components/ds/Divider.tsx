/**
 * ds/Divider — T4 separatore token-driven, context-free.
 *
 * Orizzontale (full-bleed o inset), verticale, o con label centrata.
 * Estratto da DividerSpec (design-system). Vedi docs/design-system-tiers.md.
 */
import type { CSSProperties, ReactNode } from "react";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  /** Solo orizzontale: testo centrato con linee ai lati. */
  label?: ReactNode;
  /** Solo orizzontale: rientro laterale invece che full-bleed. */
  inset?: boolean;
  className?: string;
  style?: CSSProperties;
}

const LINE = "var(--outline-variant)";

export function Divider({
  orientation = "horizontal",
  label,
  inset = false,
  className,
  style,
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={className}
        style={{ width: 1, alignSelf: "stretch", background: LINE, ...style }}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={className}
        style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", ...style }}
      >
        <div style={{ height: 1, flex: 1, background: LINE }} />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div style={{ height: 1, flex: 1, background: LINE }} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={className}
      style={{
        height: 1,
        width: inset ? "auto" : "100%",
        marginInline: inset ? "var(--space-4)" : 0,
        background: LINE,
        ...style,
      }}
    />
  );
}
