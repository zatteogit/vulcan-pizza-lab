/**
 * ds/CtaButton — T4 CTA primaria/secondaria token-driven.
 *
 * Consuma i token T3 `--cta-btn-*` / `--btn-secondary-*` e lascia al call-site
 * solo layout, dimensioni e semantica (`button`, `Link`, `a`, ... via `as`).
 * Vedi docs/design-system-tiers.md (T4, F2-4).
 */
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

type CtaVariant = "primary" | "secondary";
type CtaRadius = "pill" | "xl" | "lg";

export type CtaButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: CtaVariant;
  radius?: CtaRadius;
  elevated?: boolean;
  deepShadow?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "children" | "className" | "style"
>;

const BASE =
  "inline-flex items-center justify-center gap-2 active:scale-95 transition-transform";

const RADIUS_CLASS: Record<CtaRadius, string> = {
  pill: "rounded-full",
  xl: "rounded-xl",
  lg: "rounded-lg",
};

export function CtaButton<T extends ElementType = "button">({
  as,
  variant = "primary",
  radius = "pill",
  elevated = true,
  deepShadow = false,
  className,
  style,
  children,
  ...props
}: CtaButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  const primary = variant === "primary";

  return (
    <Component
      className={
        className
          ? `${BASE} ${RADIUS_CLASS[radius]} ${className}`
          : `${BASE} ${RADIUS_CLASS[radius]}`
      }
      style={{
        background: primary
          ? "var(--cta-btn-bg)"
          : "var(--btn-secondary-bg)",
        color: primary
          ? "var(--cta-btn-text)"
          : "var(--btn-secondary-text)",
        border: primary
          ? "none"
          : "1px solid var(--btn-secondary-border)",
        fontSize: "var(--cta-btn-font-size)",
        fontWeight: primary
          ? ("var(--cta-btn-weight)" as CSSProperties["fontWeight"])
          : ("var(--btn-secondary-weight)" as CSSProperties["fontWeight"]),
        boxShadow:
          primary && elevated
            ? deepShadow
              ? "var(--cta-btn-shadow-deep)"
              : "var(--cta-btn-shadow)"
            : "none",
        cursor: "pointer",
        textDecoration: "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
