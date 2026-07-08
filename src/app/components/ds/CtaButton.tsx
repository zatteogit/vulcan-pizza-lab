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

const RADIUS_CLASS: Record<CtaRadius, string> = {
  pill: "ds-cta--r-pill",
  xl: "ds-cta--r-xl",
  lg: "ds-cta--r-lg",
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
      className={[
        "ds-cta",
        primary ? "ds-cta--primary" : "ds-cta--secondary",
        RADIUS_CLASS[radius],
        elevated ? "ds-cta--elevated" : "",
        deepShadow ? "ds-cta--deep" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}
