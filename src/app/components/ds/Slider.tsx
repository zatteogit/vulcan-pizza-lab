/**
 * ds/Slider — T4 slider token-driven, context-free.
 *
 * Track sottile + fill primary + thumb circolare, con `<input type=range>`
 * nativo invisibile sopra (tastiera/screen-reader gratis). Label numerica
 * DM Mono tabular. Estratto da InputsSpec. Vedi docs/design-system-tiers.md.
 */
import type { CSSProperties } from "react";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  label,
  unit = "",
  disabled = false,
  className,
  style,
}: SliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={className} style={style}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
              color: "var(--text-default)",
            }}
          >
            {label}
          </span>
          <span
            className="type-data-lg"
            style={{
              fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
              color: "var(--primary)",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative h-8 flex items-center" style={{ opacity: disabled ? 0.5 : 1 }}>
        <div
          className="absolute left-0 right-0 h-1.5 rounded-full"
          style={{ background: "var(--surface-container-high)" }}
        />
        <div
          className="absolute left-0 h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: "var(--primary)" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onValueChange?.(+e.target.value)}
          className="absolute left-0 right-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
        <div
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: "var(--primary)",
            boxShadow: "var(--shadow-sm)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
