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

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

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
        className={cx("ds-divider", "ds-divider--vertical", className)}
        style={style}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cx("ds-divider", "ds-divider--label", className)}
        style={style}
      >
        <div className="ds-divider__line" />
        <span className="ds-divider__label">{label}</span>
        <div className="ds-divider__line" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cx("ds-divider", inset && "ds-divider--inset", className)}
      style={style}
    />
  );
}
