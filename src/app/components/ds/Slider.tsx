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
    <div className={className ? `ds-slider ${className}` : "ds-slider"} style={style}>
      {label && (
        <div className="ds-slider__label-row">
          <span className="ds-slider__label">{label}</span>
          <span className="ds-slider__value type-data-lg">
            {value}
            {unit}
          </span>
        </div>
      )}
      <div
        className={`ds-slider__control${disabled ? " ds-slider__control--disabled" : ""}`}
        style={{ ["--ds-slider-pct" as any]: `${pct}%` }}
      >
        <div className="ds-slider__track" />
        <div className="ds-slider__fill" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onValueChange?.(+e.target.value)}
          className="ds-slider__input"
        />
        <div className="ds-slider__thumb" />
      </div>
    </div>
  );
}
