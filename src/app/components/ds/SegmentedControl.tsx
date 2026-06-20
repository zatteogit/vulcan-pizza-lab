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
  sm: "px-3 py-1.5",
  md: "px-4 py-3",
};

const GROUP_RADIUS_CLASS: Record<SegmentedControlRadius, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  pill: "rounded-full",
};

const ITEM_RADIUS_CLASS: Record<SegmentedControlRadius, string> = {
  lg: "rounded-md",
  xl: "rounded-lg",
  "2xl": "rounded-xl",
  pill: "rounded-full",
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
  const activeBg =
    tone === "brand"
      ? "var(--segmented-bg-active-brand)"
      : "var(--segmented-bg-active)";
  const activeText =
    tone === "brand"
      ? "var(--segmented-text-active-brand)"
      : "var(--segmented-text-active)";

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center gap-1 p-1",
        fullWidth ? "w-full" : "",
        GROUP_RADIUS_CLASS[radius],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: chrome === "surface" ? "var(--segmented-bg)" : "transparent",
        border:
          chrome === "surface"
            ? "1px solid var(--segmented-border)"
            : "1px solid transparent",
        ...style,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        const iconColor = active
          ? option.accentColor ?? "currentColor"
          : "currentColor";

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
              "inline-flex min-w-0 items-center justify-center gap-1.5 active:scale-[0.98] transition-transform",
              fullWidth ? "flex-1" : "",
              SIZE_CLASS[size],
              ITEM_RADIUS_CLASS[radius],
              itemClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              background: active ? activeBg : "transparent",
              color: active ? activeText : "var(--segmented-text)",
              border: "1px solid transparent",
              borderBottom: `2px solid ${
                active ? option.accentColor ?? "transparent" : "transparent"
              }`,
              boxShadow:
                active && tone === "neutral"
                  ? "var(--segmented-shadow-active)"
                  : "none",
              cursor: option.disabled ? "not-allowed" : "pointer",
              fontSize:
                size === "sm"
                  ? "var(--segmented-font-size-sm)"
                  : "var(--segmented-font-size)",
              fontWeight: active
                ? ("var(--segmented-weight-active)" as CSSProperties["fontWeight"])
                : ("var(--segmented-weight)" as CSSProperties["fontWeight"]),
              lineHeight: 1.15,
              opacity: option.disabled ? 0.48 : 1,
              ...itemStyle,
            }}
            whileHover={option.disabled ? undefined : { y: -1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {option.icon && (
              <span
                className="flex-shrink-0"
                style={{ color: iconColor, lineHeight: 0 }}
              >
                {option.icon}
              </span>
            )}
            <span
              className={
                option.subLabel
                  ? "flex min-w-0 flex-col items-center gap-0.5"
                  : "min-w-0 truncate"
              }
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.subLabel != null && (
                <span
                  className="type-data min-w-0 truncate"
                  style={{
                    fontSize: "var(--font-size-xs)",
                    opacity: 0.7,
                    fontFeatureSettings: "'tnum'",
                  }}
                >
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
