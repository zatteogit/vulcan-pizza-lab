/**
 * ds/SegmentedControl - T4 selector for one-of-many modes/tabs.
 *
 * Use for compact mode switches and simple tab strips. More specialized docks
 * can stay T5 until their mobile/sticky behavior is generic enough.
 * Consumes the T3 `--segmented-*` token group.
 */
import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export type SegmentedControlOption<TValue extends string> = {
  value: TValue;
  label: ReactNode;
  subLabel?: ReactNode;
  icon?: ReactNode;
  accentColor?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

type SegmentedControlRole = "radiogroup" | "tablist";
type SegmentedControlSize = "sm" | "md";
type SegmentedControlRadius = "lg" | "xl" | "2xl" | "pill";
type SegmentedControlTone = "neutral" | "brand";
type SegmentedControlChrome = "surface" | "ghost";

export type SegmentedControlProps<TValue extends string> = {
  value: TValue;
  options: readonly SegmentedControlOption<TValue>[];
  onValueChange: (value: TValue) => void;
  ariaLabel: string;
  role?: SegmentedControlRole;
  size?: SegmentedControlSize;
  radius?: SegmentedControlRadius;
  tone?: SegmentedControlTone;
  chrome?: SegmentedControlChrome;
  fullWidth?: boolean;
  className?: string;
  itemClassName?: string;
  style?: CSSProperties;
  itemStyle?: CSSProperties;
};

const SIZE_CLASS: Record<SegmentedControlSize, string> = {
  sm: "ds-segmented__item--sm",
  md: "ds-segmented__item--md",
};

const GROUP_RADIUS_CLASS: Record<SegmentedControlRadius, string> = {
  lg: "ds-segmented--r-lg",
  xl: "ds-segmented--r-xl",
  "2xl": "ds-segmented--r-2xl",
  pill: "ds-segmented--r-pill",
};

const ITEM_RADIUS_CLASS: Record<SegmentedControlRadius, string> = {
  lg: "ds-segmented__item--r-lg",
  xl: "ds-segmented__item--r-xl",
  "2xl": "ds-segmented__item--r-2xl",
  pill: "ds-segmented__item--r-pill",
};

const CHROME_CLASS: Record<SegmentedControlChrome, string> = {
  surface: "ds-segmented--surface",
  ghost: "ds-segmented--ghost",
};

const TONE_CLASS: Record<SegmentedControlTone, string> = {
  neutral: "",
  brand: "ds-segmented--brand",
};

export function SegmentedControl<TValue extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
  role = "radiogroup",
  size = "md",
  radius = "xl",
  tone = "neutral",
  chrome = "surface",
  fullWidth = false,
  className,
  itemClassName,
  style,
  itemStyle,
}: SegmentedControlProps<TValue>) {
  const isTabList = role === "tablist";

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={[
        "ds-segmented",
        CHROME_CLASS[chrome],
        TONE_CLASS[tone],
        fullWidth ? "ds-segmented--full" : "",
        GROUP_RADIUS_CLASS[radius],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <motion.button
            key={option.value}
            type="button"
            role={isTabList ? "tab" : "radio"}
            aria-selected={isTabList ? active : undefined}
            aria-checked={isTabList ? undefined : active}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) onValueChange(option.value);
            }}
            className={[
              "ds-segmented__item",
              SIZE_CLASS[size],
              ITEM_RADIUS_CLASS[radius],
              active ? "ds-segmented__item--active" : "",
              itemClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              ["--ds-seg-accent" as any]: option.accentColor,
              ...itemStyle,
            }}
            whileHover={option.disabled ? undefined : { y: -1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {option.icon && (
              <span className="ds-segmented__icon">{option.icon}</span>
            )}
            <span
              className={
                option.subLabel
                  ? "ds-segmented__label-stack"
                  : "ds-segmented__label"
              }
            >
              <span className="ds-segmented__label-text">{option.label}</span>
              {option.subLabel != null && (
                <span className="type-data ds-segmented__sublabel">
                  {option.subLabel}
                </span>
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
