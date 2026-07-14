/**
 * ds/Heading — T4 componente condiviso per i titoli.
 *
 * Applica le composite tipografiche T3.5 (`.type-title-page`, ...) invece di
 * ricalcolare famiglia/size/leading inline su ogni schermata. La voce vive nel
 * DS; qui si aggiunge solo il colore (escluso dalle `.type-*` per convenzione).
 *
 * Vedi docs/design-system-tiers.md (T4, F2-3).
 */
import type { ElementType, ReactNode } from "react";

const LEVEL_CLASS = {
  display: "type-display",
  page: "type-title-page",
  xl: "type-heading-xl",
  lg: "type-heading-lg",
  md: "type-heading-md",
  sm: "type-heading-sm",
  xs: "type-heading-xs",
} as const;

const LEVEL_TAG = {
  display: "h1",
  page: "h1",
  xl: "h1",
  lg: "h2",
  md: "h3",
  sm: "h3",
  xs: "h3",
} as const;

export interface HeadingProps {
  level?: keyof typeof LEVEL_CLASS;
  /** Override dell'elemento semantico (es. "h2" quando non è il titolo principale). */
  as?: ElementType;
  /** Colore del testo: token T3. Default `--text-default`. */
  color?: string;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Heading({
  level = "page",
  as,
  color = "var(--text-default)",
  id,
  className,
  children,
}: HeadingProps) {
  const Tag = (as ?? LEVEL_TAG[level]) as ElementType;
  const composite = LEVEL_CLASS[level];
  return (
    <Tag
      id={id}
      className={
        className
          ? `${composite} ds-heading ${className}`
          : `${composite} ds-heading`
      }
      style={{ ["--ds-heading-color" as any]: color }}
    >
      {children}
    </Tag>
  );
}
