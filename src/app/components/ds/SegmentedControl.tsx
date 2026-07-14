/**
 * ds/SegmentedControl - T4 selector for one-of-many modes/tabs.
 *
 * Use for compact mode switches and simple tab strips. More specialized docks
 * can stay T5 until their mobile/sticky behavior is generic enough.
 * Consumes the T3 `--segmented-*` token group.
 */
import { motion } from "motion/react";
import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motionOffset, motionSpring } from "./motion";

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
}: SegmentedControlProps<TValue>) {
  const isTabList = role === "tablist";
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveSelection = (fromIndex: number, direction: 1 | -1) => {
    for (let offset = 1; offset <= options.length; offset += 1) {
      const index = (fromIndex + direction * offset + options.length) % options.length;
      const option = options[index];
      if (option.disabled) continue;
      onValueChange(option.value);
      itemRefs.current[index]?.focus();
      return;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      moveSelection(index, 1);
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      moveSelection(index, -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const ordered = event.key === "Home"
        ? options.map((_, optionIndex) => optionIndex)
        : options.map((_, optionIndex) => options.length - 1 - optionIndex);
      const targetIndex = ordered.find((optionIndex) => !options[optionIndex].disabled);
      if (targetIndex === undefined) return;
      onValueChange(options[targetIndex].value);
      itemRefs.current[targetIndex]?.focus();
    }
  };

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
    >
      {options.map((option, index) => {
        const active = option.value === value;

        return (
          <motion.button
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            key={option.value}
            type="button"
            role={isTabList ? "tab" : "radio"}
            aria-selected={isTabList ? active : undefined}
            aria-checked={isTabList ? undefined : active}
            aria-label={option.ariaLabel ?? (typeof option.label === "string" ? option.label : undefined)}
            tabIndex={active ? 0 : -1}
            disabled={option.disabled}
            onKeyDown={(event) => handleKeyDown(event, index)}
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
            }}
            whileHover={option.disabled ? undefined : { y: motionOffset.controlHoverLift }}
            transition={motionSpring.crispControl}
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
