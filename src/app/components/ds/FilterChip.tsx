/**
 * ds/FilterChip — T4 chip per filtri e faccette.
 *
 * Differisce da `Chip`: non mostra check animato e non implica toggle generico
 * di preferenza; serve per filtri mono/multi-select, categorie e facet row.
 * Consuma il set T3 `--chip-*`.
 */
import { motion } from "motion/react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

type MotionButtonProps = ComponentProps<typeof motion.button>;
type FilterChipSize = "sm" | "md";
type FilterChipRadius = "md" | "lg" | "xl" | "pill";

export type FilterChipProps = {
  active: boolean;
  children: ReactNode;
  count?: ReactNode;
  size?: FilterChipSize;
  radius?: FilterChipRadius;
  className?: string;
  style?: CSSProperties;
} & Omit<MotionButtonProps, "children" | "className" | "style">;

const SIZE_CLASS: Record<FilterChipSize, string> = {
  sm: "ds-filterchip--sm",
  md: "ds-filterchip--md",
};

const RADIUS_CLASS: Record<FilterChipRadius, string> = {
  md: "ds-filterchip--r-md",
  lg: "ds-filterchip--r-lg",
  xl: "ds-filterchip--r-xl",
  pill: "ds-filterchip--r-pill",
};

export function FilterChip({
  active,
  children,
  count,
  size = "md",
  radius = "xl",
  className,
  style,
  ...props
}: FilterChipProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      className={[
        "ds-filterchip",
        active ? "ds-filterchip--active" : "",
        SIZE_CLASS[size],
        RADIUS_CLASS[radius],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      layout
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    >
      {children}
      {count != null && (
        <span className="type-numeric ds-filterchip__count">{count}</span>
      )}
    </motion.button>
  );
}
