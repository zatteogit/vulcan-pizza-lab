/**
 * ds/StepHeader — T4 titolone editoriale token-driven, context-free.
 *
 * Step number (DM Sans uppercase) + titolo Playfair + sottotitolo italic +
 * linea decorativa. Firma visiva delle macro-sezioni. Estratto da StepHeaderSpec.
 */
import type { CSSProperties, ReactNode } from "react";

export interface StepHeaderProps {
  num?: string;
  category?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function StepHeader({
  num,
  category,
  title,
  subtitle,
  className,
  style,
}: StepHeaderProps) {
  const eyebrow = num && category ? `${num} — ${category}` : num ?? category;
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`} style={style}>
      {eyebrow && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
            letterSpacing: "var(--tracking-extreme)",
            textTransform: "uppercase",
            color: "var(--primary)",
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
          lineHeight: "var(--leading-snug)",
          color: "var(--text-default)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "var(--font-size-2xl)",
            color: "var(--text-muted)",
            opacity: 0.65,
          }}
        >
          {subtitle}
        </span>
      )}
      <div style={{ width: "2rem", height: 2, background: "var(--primary)", opacity: 0.35, marginTop: 8 }} />
    </div>
  );
}
