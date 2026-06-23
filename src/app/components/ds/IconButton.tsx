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
const SIZE_TOKEN: Record<IconButtonSize, string> = {
  sm: "var(--space-8)", // 32px
  md: "var(--space-10)", // 40px
  lg: "var(--space-12)", // 48px
};

const RADIUS_CLASS: Record<IconButtonRadius, string> = {
  full: "rounded-full",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
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

const BASE = "inline-flex items-center justify-center";

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
  const dim = SIZE_TOKEN[size];
  const base = `${BASE} ${RADIUS_CLASS[radius]}`;

  /* L'apparenza dipende dal variant. `bare` non imposta bg/bordo/colore: li
     lascia alle utility Tailwind del call-site (es. overlay su immagine). */
  const variantStyle: CSSProperties =
    variant === "surface"
      ? {
          background: "var(--surface-container)",
          color: "var(--icon-muted)",
          border: "1px solid var(--outline-variant)",
        }
      : variant === "ghost"
        ? { background: "transparent", border: "none" }
        : {};

  return (
    <Component
      className={className ? `${base} ${className}` : base}
      style={{
        width: dim,
        height: dim,
        flexShrink: 0,
        cursor: "pointer",
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
