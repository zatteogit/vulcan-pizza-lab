/**
 * ds/Surface — T4 wrapper per composite `.surface-*`.
 *
 * Incapsula il consumo delle classi T3.5 lasciando al call-site solo layout e
 * ruolo semantico. Vedi docs/design-system-tiers.md (T4, F2-4).
 */
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

type SurfaceVariant = "card" | "glass";

export type SurfaceProps<T extends ElementType = "div"> = {
  as?: T;
  variant?: SurfaceVariant;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "children" | "className" | "style"
>;

const VARIANT_CLASS: Record<SurfaceVariant, string> = {
  card: "surface-card",
  glass: "surface-glass",
};

export function Surface<T extends ElementType = "div">({
  as,
  variant = "card",
  className,
  style,
  children,
  ...props
}: SurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const surfaceClass = VARIANT_CLASS[variant];

  return (
    <Component
      className={
        className ? `${surfaceClass} ${className}` : surfaceClass
      }
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}
