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
    <div className={`ds-stepheader ${className ?? ""}`} style={style}>
      {eyebrow && <span className="ds-stepheader__eyebrow">{eyebrow}</span>}
      <h2 className="ds-stepheader__title">{title}</h2>
      {subtitle && <span className="ds-stepheader__subtitle">{subtitle}</span>}
      <div className="ds-stepheader__rule" />
    </div>
  );
}
