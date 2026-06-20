/**
 * ds/Badge — T4 badge token/composite-driven.
 *
 * Usa `.badge-base` per la voce e accetta un colore semantico per generare la
 * tinta CSS con `color-mix`, che resta correttamente a livello CSS.
 * Vedi docs/design-system-tiers.md (T4, F2-4).
 */
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

const TONE_COLOR = {
  muted: "var(--text-muted)",
  default: "var(--text-default)",
  accent: "var(--text-accent)",
  success: "var(--text-success)",
  warning: "var(--text-warning)",
  error: "var(--text-error)",
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  tertiary: "var(--tertiary)",
  cta: "var(--cta)",
} as const;

export type BadgeTone = keyof typeof TONE_COLOR;

export type BadgeProps<T extends ElementType = "span"> = {
  as?: T;
  tone?: BadgeTone;
  size?: "sm" | "xs";
  color?: string;
  background?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "children" | "className" | "color" | "style"
>;

export function Badge<T extends ElementType = "span">({
  as,
  tone = "muted",
  size = "sm",
  color,
  background,
  className,
  style,
  children,
  ...props
}: BadgeProps<T>) {
  const Component = (as ?? "span") as ElementType;
  const badgeColor = color ?? TONE_COLOR[tone];

  return (
    <Component
      className={[
        "badge-base",
        size === "xs" ? "badge-size-xs" : "",
        className,
      ].filter(Boolean).join(" ")}
      style={{
        color: badgeColor,
        background:
          background ??
          `color-mix(in srgb, ${badgeColor} 15%, transparent)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
