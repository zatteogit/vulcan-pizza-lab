import React from "react";
import { motion } from "motion/react";
import { Thermometer, Snowflake, Sun } from "lucide-react";
import {
  PizzaStyle,
  UserConstraints,
  OvenType,
  OVEN_PRESETS,
} from "./pizza-engine";
import { InfoTip } from "./info-tip";

interface RecipeConfiguratorProps {
  style: PizzaStyle;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  customHydration: number;
  onHydrationChange: (v: number) => void;
  customFlourW: number;
  onFlourWChange: (v: number) => void;
  customFermentHours: number;
  onFermentHoursChange: (v: number) => void;
  customFermentTemp: number;
  onFermentTempChange: (v: number) => void;
  usePreFerment: boolean;
  onPreFermentChange: (v: boolean) => void;
  science?: unknown;
}

/* ═══ GRADIENT PRESETS ═══ */
const SLIDER_GRADIENTS: Record<string, string> = {
  hydration:
    "linear-gradient(90deg, #D4A574 0%, #5B9BD5 50%, #2D6A8F 100%)",
  flourW:
    "linear-gradient(90deg, #E8D5B0 0%, #C08552 50%, #6B4424 100%)",
  fermentation:
    "linear-gradient(90deg, #7BA05B 0%, #C08552 50%, #C24A2F 100%)",
  temperature:
    "linear-gradient(90deg, #5B9BD5 0%, #C08552 40%, #C24A2F 70%, #8B2515 100%)",
};

export function RecipeConfigurator({
  style,
  constraints,
  onConstraintsChange,
  customHydration,
  onHydrationChange,
  customFlourW,
  onFlourWChange,
  customFermentHours,
  onFermentHoursChange,
  customFermentTemp,
  onFermentTempChange,
  usePreFerment,
  onPreFermentChange,
  science,
}: RecipeConfiguratorProps) {
  /* Single-call update for oven to avoid the double-update bug */
  const handleOvenSelect = (id: string, maxTemp: number) => {
    onConstraintsChange({
      ...constraints,
      oven_type: id as OvenType,
      oven_max_temp_c: maxTemp,
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* Hydration */}
      <div>
        <div className="flex items-center gap-2">
          <Label>Idratazione</Label>
          <InfoTip>
            Percentuale d'acqua rispetto alla farina. Più alta =
            impasto più morbido e alveolatura aperta, ma più
            difficile da gestire.
          </InfoTip>
        </div>
        <GradientSlider
          value={customHydration}
          onChange={onHydrationChange}
          min={45}
          max={105}
          step={1}
          unit="%"
          rangeMin={style.dough.hydration_pct_range[0]}
          rangeMax={style.dough.hydration_pct_range[1]}
          gradient={SLIDER_GRADIENTS.hydration}
        />
      </div>

      {/* Flour W */}
      <div>
        <div className="flex items-center gap-2">
          <Label>Forza Farina (W)</Label>
          <InfoTip>
            Indica la capacità di assorbire acqua e trattenere
            gas. W più alto = lievitazioni più lunghe e
            struttura più forte.
          </InfoTip>
        </div>
        <GradientSlider
          value={customFlourW}
          onChange={onFlourWChange}
          min={100}
          max={420}
          step={10}
          unit=""
          rangeMin={style.dough.flour_w_range[0]}
          rangeMax={style.dough.flour_w_range[1]}
          gradient={SLIDER_GRADIENTS.flourW}
        />
      </div>

      {/* Fermentation */}
      <div>
        <div className="flex items-center gap-2">
          <Label>Fermentazione</Label>
          <InfoTip>
            Tempo totale di lievitazione. Più ore a temperature
            basse = sapore più complesso e migliore
            digeribilità.
          </InfoTip>
        </div>
        <div className="flex flex-col gap-5 mt-1">
          <GradientSlider
            value={customFermentHours}
            onChange={onFermentHoursChange}
            min={1}
            max={96}
            step={1}
            unit="h"
            rangeMin={style.dough.fermentation_hours_range[0]}
            rangeMax={style.dough.fermentation_hours_range[1]}
            gradient={SLIDER_GRADIENTS.fermentation}
          />

          <div className="flex gap-2">
            <TempPill
              active={customFermentTemp <= 6}
              onClick={() => onFermentTempChange(4)}
              icon={<Snowflake size={14} />}
              label="4°C frigo"
            />
            <TempPill
              active={
                customFermentTemp > 6 && customFermentTemp <= 16
              }
              onClick={() => onFermentTempChange(12)}
              icon={<Thermometer size={14} />}
              label="12°C"
            />
            <TempPill
              active={customFermentTemp > 16}
              onClick={() => onFermentTempChange(22)}
              icon={<Sun size={14} />}
              label="22°C amb."
            />
          </div>

          {/* Pre-ferment — grouped label + toggle + info */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div className="flex-1 flex items-center gap-2">
              <span
                className="text-foreground"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Pre-fermento
              </span>
              <InfoTip size={14}>
                Il pre-fermento (biga, poolish) è una porzione
                di impasto fermentata in anticipo. Migliora
                sapore, digeribilità e conservazione. Richiede
                12-24h in più di pianificazione.
              </InfoTip>
            </div>
            <button
              onClick={() => onPreFermentChange(!usePreFerment)}
              className="relative w-12 h-7 rounded-full transition-all flex-shrink-0"
              style={{
                background: usePreFerment
                  ? "var(--primary)"
                  : "var(--switch-background)",
              }}
            >
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white"
                style={{ boxShadow: "var(--shadow-sm)" }}
                animate={{ x: usePreFerment ? 22 : 2 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Oven — fixed single-call update */}
      <div>
        <div className="flex items-center gap-2">
          <Label>Forno</Label>
          <InfoTip>
            Seleziona il tipo e regola la temperatura.
            Temperature più alte = cottura più rapida e crosta
            migliore.
          </InfoTip>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {OVEN_PRESETS.map((preset) => {
            const active = constraints.oven_type === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  handleOvenSelect(preset.id, preset.maxTemp)
                }
                className="px-4 py-2.5 rounded-xl transition-all"
                style={{
                  background: active
                    ? "var(--primary)"
                    : "var(--surface-container)",
                  color: active
                    ? "var(--primary-foreground)"
                    : "var(--foreground)",
                  border: active
                    ? "1px solid transparent"
                    : "1px solid var(--outline-variant)",
                  fontSize: "0.8125rem",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {preset.name}
              </motion.button>
            );
          })}
        </div>
        <div className="mt-4">
          <GradientSlider
            value={constraints.oven_max_temp_c}
            onChange={(v) =>
              onConstraintsChange({
                ...constraints,
                oven_max_temp_c: v,
              })
            }
            min={200}
            max={550}
            step={5}
            unit="°C"
            rangeMin={style.baking.temp_c_range[0]}
            rangeMax={style.baking.temp_c_range[1]}
            gradient={SLIDER_GRADIENTS.temperature}
          />
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: "1rem" }}>{children}</h3>;
}

/* ═══ GRADIENT SLIDER ═══ */
function GradientSlider({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  rangeMin,
  rangeMax,
  gradient,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  rangeMin?: number;
  rangeMax?: number;
  gradient: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const inRange =
    rangeMin !== undefined && rangeMax !== undefined
      ? value >= rangeMin && value <= rangeMax
      : true;

  const zoneLeftPct =
    rangeMin !== undefined
      ? ((rangeMin - min) / (max - min)) * 100
      : 0;
  const zoneRightPct =
    rangeMax !== undefined
      ? ((rangeMax - min) / (max - min)) * 100
      : 100;

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex items-baseline justify-between">
        <span
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            fontVariantNumeric: "tabular-nums",
            color: inRange
              ? "var(--foreground)"
              : "var(--destructive)",
          }}
        >
          {value}
          {unit}
        </span>
        {rangeMin !== undefined && rangeMax !== undefined && (
          <span
            className="text-muted-foreground"
            style={{
              fontSize: "0.6875rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ottimale {rangeMin}–{rangeMax}
            {unit}
          </span>
        )}
      </div>

      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-2 rounded-full overflow-hidden">
          <div
            className="w-full h-full rounded-full"
            style={{ background: gradient, opacity: 0.2 }}
          />
        </div>

        {/* Optimal zone */}
        {rangeMin !== undefined && rangeMax !== undefined && (
          <div
            className="absolute h-2 rounded-full"
            style={{
              left: `${zoneLeftPct}%`,
              width: `${zoneRightPct - zoneLeftPct}%`,
              background: gradient,
              opacity: inRange ? 0.35 : 0.15,
              maskImage:
                "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            }}
          />
        )}

        {/* Filled track */}
        <div
          className="absolute h-2 rounded-full overflow-hidden"
          style={{ left: 0, width: `${pct}%` }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: gradient,
              width: `${(100 / pct) * 100}%`,
              opacity: 0.85,
            }}
          />
        </div>

        {/* Zone markers */}
        {rangeMin !== undefined && (
          <div
            className="absolute top-0 bottom-0 flex items-center"
            style={{ left: `${zoneLeftPct}%` }}
          >
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: "var(--outline)" }}
            />
          </div>
        )}
        {rangeMax !== undefined && (
          <div
            className="absolute top-0 bottom-0 flex items-center"
            style={{ left: `${zoneRightPct}%` }}
          >
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: "var(--outline)" }}
            />
          </div>
        )}

        {/* Native input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary
            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-primary
            [&::-moz-range-track]:bg-transparent"
        />
      </div>

      {/* Zone labels */}
      {rangeMin !== undefined && rangeMax !== undefined && (
        <div className="relative h-4">
          <span
            className="absolute text-muted-foreground"
            style={{
              left: `${zoneLeftPct}%`,
              transform: "translateX(-50%)",
              fontSize: "0.625rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {rangeMin}
          </span>
          <span
            className="absolute text-muted-foreground"
            style={{
              left: `${zoneRightPct}%`,
              transform: "translateX(-50%)",
              fontSize: "0.625rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {rangeMax}
          </span>
        </div>
      )}
    </div>
  );
}

function TempPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all"
      style={{
        background: active
          ? "var(--primary)"
          : "var(--surface-container)",
        color: active
          ? "var(--primary-foreground)"
          : "var(--foreground)",
        border: active
          ? "1px solid transparent"
          : "1px solid var(--outline-variant)",
        fontSize: "0.8125rem",
        fontWeight: 500,
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}