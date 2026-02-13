import React from "react";
import { Droplets, Flame, Timer, Clock } from "lucide-react";
import { GeneratedRecipe } from "./pizza-engine";

interface RecipeStatStripProps {
  recipe: GeneratedRecipe;
}

function fmtCook(sec: number) {
  return sec < 120 ? `${sec}s` : `${Math.round(sec / 60)}min`;
}

/**
 * Stat strip — 4 key metrics as a visually prominent row.
 * Designed for placement at the top of the recipe view.
 */
export function RecipeStatStrip({
  recipe,
}: RecipeStatStripProps) {
  return (
    <div
      className="grid grid-cols-4 gap-0 rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--outline-variant)",
      }}
    >
      <StatCell
        label="Idratazione"
        value={`${recipe.hydration_pct}%`}
        icon={<Droplets size={16} />}
        color="var(--primary)"
        first
      />
      <StatCell
        label="Forno"
        value={`${recipe.oven_temp_c}°C`}
        icon={<Flame size={16} />}
        color="var(--tertiary)"
      />
      <StatCell
        label="Cottura"
        value={fmtCook(recipe.cook_time_sec)}
        icon={<Timer size={16} />}
        color="var(--cta)"
      />
      <StatCell
        label="Lievitazione"
        value={`${recipe.fermentation_hours}h`}
        detail={`${recipe.fermentation_temp_c}°C`}
        icon={<Clock size={16} />}
        color="var(--tertiary)"
        last
      />
    </div>
  );
}

function StatCell({
  label,
  value,
  detail,
  icon,
  color,
  first,
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: React.ReactNode;
  color: string;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center py-5 px-2 sm:px-3 text-center relative"
      style={{
        background: first
          ? `color-mix(in srgb, ${color} 6%, var(--background))`
          : "var(--background)",
      }}
    >
      {!first && (
        <div
          className="absolute left-0 top-3 bottom-3 w-px"
          style={{ background: "var(--outline-variant)" }}
        />
      )}
      {icon && (
        <div className="mb-2" style={{ color, opacity: 0.6 }}>
          {icon}
        </div>
      )}
      <span
        style={{
          fontSize: "clamp(1.125rem, 3.5vw, 1.5rem)",
          fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          fontVariantNumeric: "tabular-nums",
          color,
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      <span
        className="text-muted-foreground mt-1.5"
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {detail && (
        <span
          className="text-muted-foreground mt-0.5"
          style={{
            fontSize: "0.625rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {detail}
        </span>
      )}
    </div>
  );
}