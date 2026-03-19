import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Droplets, Flame, Timer, Clock, FlaskConical } from "lucide-react";
import { GeneratedRecipe } from "./pizza-engine";
import { useCms } from "./cms/cms-context";
import { createFormatter } from "./cms/i18n";

interface RecipeStatStripProps {
  recipe: GeneratedRecipe;
  nerdMode?: boolean;
}

/**
 * Stat strip — 4 key metrics as a visually prominent row.
 * When nerdMode is ON, an additional technical row slides in below.
 */
export function RecipeStatStrip({
  recipe,
  nerdMode,
}: RecipeStatStripProps) {
  const science = recipe.science;
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--container-border)",
      }}
    >
      {/* Main 4-stat row */}
      <div className="grid grid-cols-4 gap-0">
        <StatCell
          label={ui.statHydration}
          value={`${recipe.hydration_pct}%`}
          icon={<Droplets size={16} />}
          color="var(--stat-hydration)"
          first
        />
        <StatCell
          label={ui.statOven}
          value={`${recipe.oven_temp_c}°C`}
          icon={<Flame size={16} />}
          color="var(--stat-oven)"
        />
        <StatCell
          label={ui.statCookTime}
          value={fmt.cookTime(recipe.cook_time_sec)}
          icon={<Timer size={16} />}
          color="var(--stat-cook)"
        />
        <StatCell
          label={ui.statFermentation}
          value={fmt.fermentTime(recipe.fermentation_hours)}
          detail={fmt.tempSuffix(recipe.fermentation_temp_c)}
          icon={<Clock size={16} />}
          color="var(--stat-ferment)"
          last
        />
      </div>

      {/* Nerd row — slides in below */}
      <AnimatePresence>
        {nerdMode && science && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div
              style={{
                borderTop: "1px solid var(--recipe-tip-nerd-border)",
                background: "var(--recipe-tip-nerd-bg)",
                borderLeft: "3px solid var(--score-accent)",
              }}
            >
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                <FlaskConical
                  size={10}
                  style={{ color: "var(--score-accent)" }}
                />
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--score-accent)",
                  }}
                >
                  {ui.nerdTitle}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--score-accent)",
                    background: "color-mix(in srgb, var(--score-accent) 12%, rgba(0,0,0,0))",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Nerd
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-0">
                <NerdCell
                  label={ui.nerdFlourW}
                  value={`${recipe.flour_w}`}
                />
                <NerdCell
                  label={ui.nerdPL}
                  value={`${recipe.flour_pl}`}
                />
                <NerdCell
                  label={ui.nerdYeast}
                  value={`${science.yeast_baker_pct}%`}
                />
                <NerdCell
                  label={ui.nerdHoursAt18}
                  value={`${science.effective_hours_18c}h`}
                />
                <NerdCell
                  label={ui.nerdQ10}
                  value={`${science.q10_factor}×`}
                />
                <NerdCell
                  label={ui.nerdAw}
                  value={`${science.water_activity}`}
                  last
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCell({
  label,
  value,
  detail,
  icon,
  color,
  last,
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
        background: "var(--container-page)",
      }}
    >
      {/* Divider on left side for all except first cell */}
      {!first && (
        <div
          className="absolute left-0 top-3 bottom-3 w-px"
          style={{ background: "var(--container-divider)" }}
        />
      )}
      {icon && (
        <div className="mb-2" style={{ color, opacity: 0.6 }}>
          {icon}
        </div>
      )}
      <span
        className="type-numeric"
        style={{
          fontSize: "clamp(var(--font-size-2xl), 3vw, var(--font-size-5xl))",
          fontWeight: "var(--weight-bold)" as any,
          color,
          lineHeight: "var(--leading-display)",
        }}
      >
        {value}
      </span>
      <span
        className="mt-1.5"
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--weight-semibold)" as any,
          letterSpacing: "var(--tracking-spread)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {detail && (
        <span
          className="mt-0.5"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {detail}
        </span>
      )}
    </div>
  );
}

/* ═══ Compact nerd metric cell ═══ */
function NerdCell({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-3 px-1.5 text-center relative"
      style={{ background: "var(--container-page)" }}
    >
      <span
        className="type-data"
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--weight-bold)" as any,
          color: "var(--score-accent)",
          fontFeatureSettings: "'tnum'",
        }}
      >
        {value}
      </span>
      <span
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--weight-medium)" as any,
          lineHeight: "var(--leading-compact)",
          marginTop: 2,
        }}
      >
        {label}
      </span>
    </div>
  );
}