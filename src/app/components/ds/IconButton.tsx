/**
 * ds/IconButton — T4 bottone-icona quadrato token-driven.
 *
 * Incapsula dimensione (`size` → scala `--space-*`), forma circolare, centratura
 * e hit-target, così i call-site non specificano più w/h a mano. La superficie
 * neutra di default ricalca i controlli "chip" (`--surface-container` +
 * `--outline-variant`); stati speciali (es. toggle attivo) si sovrascrivono via
 * `style`. Polimorfo via `as` (button, Link, a, motion.button).
 * Vedi docs/design-system-tiers.md (T4).
 */
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

type IconButtonSize = "sm" | "md" | "lg";
/** surface = look chip (bg+bordo+colore muted) · ghost = trasparente, eredita il
 *  colore · bare = nessuna apparenza (bg/bordo/colore via className, per controlli
 *  con stile interamente Tailwind, es. overlay su immagine). */
type IconButtonVariant = "surface" | "ghost" | "bare";
type IconButtonRadius = "full" | "lg" | "xl" | "2xl";

/** Dimensioni on-scala (la scala `--space-*` in quest'intervallo ha step da 8px). */
const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: "ds-iconbtn--sm", // 32px
  md: "ds-iconbtn--md", // 40px
  lg: "ds-iconbtn--lg", // 48px
};

const RADIUS_CLASS: Record<IconButtonRadius, string> = {
  full: "ds-iconbtn--r-full",
  lg: "ds-iconbtn--r-lg",
  xl: "ds-iconbtn--r-xl",
  "2xl": "ds-iconbtn--r-2xl",
};

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  surface: "ds-iconbtn--surface",
  ghost: "ds-iconbtn--ghost",
  bare: "ds-iconbtn--bare",
};

export type IconButtonProps<T extends ElementType = "button"> = {
  as?: T;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  radius?: IconButtonRadius;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "children" | "className" | "style"
>;

const BASE = "ds-iconbtn";

export function IconButton<T extends ElementType = "button">({
  as,
  size = "md",
  variant = "surface",
  radius = "full",
  className,
  style,
  children,
  ...props
}: IconButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  const base = `${BASE} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${RADIUS_CLASS[radius]}`;

  return (
    <Component
      className={className ? `${base} ${className}` : base}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}
