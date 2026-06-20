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
  sm: "px-3 py-1.5",
  md: "px-3 py-1.5",
};

const RADIUS_CLASS: Record<FilterChipRadius, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  pill: "rounded-full",
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
        "inline-flex items-center gap-1.5 active:scale-95 transition-transform",
        SIZE_CLASS[size],
        RADIUS_CLASS[radius],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: active ? "var(--chip-bg-active)" : "var(--chip-bg)",
        color: active ? "var(--chip-text-active)" : "var(--chip-text)",
        border: active ? "1px solid transparent" : "1px solid var(--chip-border)",
        cursor: "pointer",
        fontSize: size === "sm" ? "var(--font-size-sm)" : "var(--chip-font-size)",
        fontWeight: "var(--chip-weight-active)" as CSSProperties["fontWeight"],
        ...style,
      }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    >
      {children}
      {count != null && (
        <span
          className="type-numeric"
          style={{
            fontSize: "var(--font-size-sm)",
            opacity: 0.65,
            fontFeatureSettings: "'tnum'",
          }}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
