import { ChevronDown,ChevronUp,Droplets,Flame,FlaskConical,Hourglass,Sparkles,Timer } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter,formatTemperatureCopy,t } from "../cms/i18n";
import { Badge } from "../../components/ds/index";
import { GeneratedRecipe } from "../../domain/pizza-engine";

interface RecipeStatStripProps {
  recipe: GeneratedRecipe;
  nerdMode?: boolean;
  isPersonalized?: boolean;
  /** Vista Semplice (giugno 2026): niente range tecnici sotto i valori. */
  simple?: boolean;
  nerdAvailable?: boolean;
  onNerdModeChange?: (nerd: boolean) => void;
}

/**
 * Stat strip — 4 key metrics as a visually prominent row.
 * When nerdMode is ON, an additional technical row slides in below.
 */
export function RecipeStatStrip({
  recipe,
  nerdMode,
  isPersonalized = true,
  simple,
  nerdAvailable = false,
  onNerdModeChange,
}: RecipeStatStripProps) {
  const science = recipe.science;
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const idealLabel = ui.statIdeal;
  const nerdRefTempVars = { refTemp: fmt.celsius(18) };

  // #3(b) trasparenza: marca i parametri che SI DISCOSTANO dalla canonica (il
  // centro range dello stile) — di norma le scelte dell'ottimizzatore. Easy mode:
  // idratazione e lievitazione. Nerd: anche W farina. Oven/cottura no (sono il
  // tuo forno / derivati, non scelte).
  const hMid = Math.round(
    (recipe.style.dough.hydration_pct_range[0] + recipe.style.dough.hydration_pct_range[1]) / 2,
  );
  const hChanged =
    isPersonalized && Math.abs(recipe.hydration_pct - hMid) >= 2
      ? { dir: recipe.hydration_pct > hMid ? "up" : ("down" as "up" | "down"), canonical: fmt.percent(hMid) }
      : undefined;
  const fMid = Math.round(
    (recipe.style.dough.fermentation_hours_range[0] + recipe.style.dough.fermentation_hours_range[1]) / 2,
  );
  const fChanged =
    isPersonalized && Math.abs(recipe.fermentation_hours - fMid) >= 2
      ? { dir: recipe.fermentation_hours > fMid ? "up" : ("down" as "up" | "down"), canonical: fmt.fermentTime(fMid) }
      : undefined;
  const wMid = Math.round(
    (recipe.style.dough.flour_w_range[0] + recipe.style.dough.flour_w_range[1]) / 2,
  );
  const wChanged =
    isPersonalized && Math.abs(recipe.flour_w - wMid) >= 15
      ? { dir: recipe.flour_w > wMid ? "up" : ("down" as "up" | "down"), canonical: `W${wMid}` }
      : undefined;

  return (
    <div className="flex flex-col gap-3">
      {/* ═══ Intestazione della Sezione e Nerd Toggle incorporato ═══ */}
      <div className="flex items-center justify-between px-0.5 min-h-[36px]">
        <span
          className="type-data"
          style={{
            color: "var(--text-default)",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--weight-bold)" as any,
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-spread)",
            opacity: 0.9,
          }}
        >
          {cms.ui.nerdTitle || "Parametri Impasto"}
        </span>

        {nerdAvailable && onNerdModeChange && (
          <div
            className="flex items-center p-0.5 rounded-full"
            style={{
              background: "color-mix(in srgb, var(--container-page) 82%, transparent)",
              border: "1px solid var(--container-border)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <button
              type="button"
              onClick={() => onNerdModeChange(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all active:scale-[0.98]"
              style={{
                background: !nerdMode ? "var(--container-bg-high)" : "transparent",
                color: !nerdMode ? "var(--text-default)" : "var(--text-muted)",
                border: "none",
                boxShadow: !nerdMode ? "0 2px 6px color-mix(in srgb, var(--shadow-color) 6%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 12%, transparent)" : "none",
                fontWeight: !nerdMode ? "var(--weight-semibold)" as any : "var(--weight-medium)" as any,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              <Sparkles size={12} style={{ color: !nerdMode ? "var(--icon-accent)" : "var(--icon-muted)" }} />
              <span>Easy</span>
            </button>
            <button
              type="button"
              onClick={() => onNerdModeChange(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all active:scale-[0.98]"
              style={{
                background: nerdMode ? "var(--primary)" : "transparent",
                color: nerdMode ? "var(--text-on-accent)" : "var(--text-muted)",
                border: "none",
                boxShadow: nerdMode ? "0 2px 6px color-mix(in srgb, var(--primary) 24%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 18%, transparent)" : "none",
                fontWeight: nerdMode ? "var(--weight-semibold)" as any : "var(--weight-medium)" as any,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              <FlaskConical size={12} style={{ color: nerdMode ? "var(--icon-on-accent)" : "var(--icon-muted)" }} />
              <span>Nerd</span>
            </button>
          </div>
        )}
      </div>
      {/* ═══ Capsule espressive (M3 Expressive, giugno 2026) ═══
          Niente più griglia da tabella: quattro contenitori tonali con
          forme CONTRASTANTI (raggi asimmetrici alternati), numeri oversize
          e ingresso a molla scaglionato. Il tocco le fa "respirare". */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCell
          label={ui.statHydration}
          value={fmt.percent(recipe.hydration_pct)}
          detail={simple ? undefined : `${fmt.percent(recipe.style.dough.hydration_pct_range[0])}–${fmt.percent(recipe.style.dough.hydration_pct_range[1])}`}
          icon={<Droplets size={18} />}
          color="var(--stat-hydration)"
          toneBg="var(--stat-hydration-bg)"
          index={0}
          changed={hChanged}
        />
        {/* Su misura vs ideale (feedback giugno 2026): quando il TUO forno
            impone una compensazione, mostriamo il canonico dello stile —
            chiaro senza essere fuorviante. In nerd: il range completo. */}
        <StatCell
          label={ui.statOven}
          value={fmt.celsius(recipe.oven_temp_c)}
          detail={
            simple
              ? Math.abs(recipe.oven_temp_c - recipe.style.baking.temp_c_ideal) > 15
                ? `${idealLabel} ${fmt.celsius(recipe.style.baking.temp_c_ideal)}`
                : undefined
              : `${fmt.celsius(recipe.style.baking.temp_c_range[0])}–${fmt.celsius(recipe.style.baking.temp_c_range[1])} · ${idealLabel} ${fmt.celsius(recipe.style.baking.temp_c_ideal)}`
          }
          icon={<Flame size={18} />}
          color="var(--stat-oven)"
          toneBg="var(--stat-oven-bg)"
          index={1}
        />
        <StatCell
          label={ui.statCookTime}
          value={fmt.cookTime(recipe.cook_time_sec)}
          detail={
            simple
              ? Math.abs(recipe.cook_time_sec - recipe.style.baking.cook_time_sec_ideal) >
                recipe.style.baking.cook_time_sec_ideal * 0.25
                ? `${idealLabel} ${fmt.cookTime(recipe.style.baking.cook_time_sec_ideal)}`
                : undefined
              : `${fmt.durationMinutes(Math.round(recipe.style.baking.cook_time_sec_range[0]/60))}–${fmt.durationMinutes(Math.round(recipe.style.baking.cook_time_sec_range[1]/60))}`
          }
          icon={<Timer size={18} />}
          color="var(--stat-cook)"
          toneBg="var(--stat-cook-bg)"
          index={2}
        />
        <StatCell
          label={ui.statFermentation}
          value={fmt.fermentTime(recipe.fermentation_hours)}
          detail={simple ? undefined : `${fmt.durationMinutes(recipe.style.dough.fermentation_hours_range[0] * 60)}–${fmt.durationMinutes(recipe.style.dough.fermentation_hours_range[1] * 60)} · ${fmt.celsius(recipe.fermentation_temp_c)}`}
          icon={<Hourglass size={18} />}
          color="var(--stat-ferment)"
          toneBg="var(--stat-ferment-bg)"
          index={3}
          changed={fChanged}
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
              className="mt-3 overflow-hidden"
              style={{
                background: "var(--recipe-tip-nerd-bg)",
                border: "1px solid var(--recipe-tip-nerd-border)",
                borderRadius: "12px 28px 28px 28px",
              }}
            >
              <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                <FlaskConical
                  size={12}
                  style={{ color: "var(--score-accent)" }}
                />
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--score-accent)",
                  }}
                >
                  {ui.nerdTitle}
                </span>
                <Badge
                  className="px-2 py-0.5 rounded-md"
                  color="var(--score-accent)"
                  background="var(--stat-nerd-pill-bg)"
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Nerd
                </Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-0">
                <NerdCell
                  label={ui.nerdFlourW}
                  value={`${recipe.flour_w}`}
                  changed={wChanged}
                />
                <NerdCell
                  label={ui.nerdPL}
                  value={`${recipe.flour_pl}`}
                />
                <NerdCell
                  label={ui.nerdYeast}
                  value={fmt.percent(science.yeast_baker_pct)}
                />
                <NerdCell
                  label={t(formatTemperatureCopy(ui.nerdHoursAt18, fmt), nerdRefTempVars)}
                  value={fmt.fermentTime(Number(science.effective_hours_18c))}
                />
                <NerdCell
                  label={t(formatTemperatureCopy(ui.nerdQ10, fmt), nerdRefTempVars)}
                  value={`${science.q10_factor}×`}
                />
                <NerdCell
                  label={ui.nerdAw}
                  value={`${science.water_activity}`}
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
  toneBg,
  index = 0,
  changed,
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: React.ReactNode;
  color: string;
  toneBg: string;
  index?: number;
  /** #3(b): segnala che il valore è stato cambiato vs canonica (su misura). */
  changed?: { dir: "up" | "down"; canonical: string };
}) {
  const statValue = splitStatValue(value);
  const detailRows = [statValue.extra, detail].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.06 + index * 0.07,
        type: "spring",
        stiffness: 380,
        damping: 24,
      }}
      whileTap={{ scale: 0.96 }}
      className="grid items-start py-4 px-4 text-left select-none border"
      style={{
        background: "var(--container-bg)",
        border: "1px solid var(--container-border)",
        borderRadius: "16px",
        cursor: "default",
        minHeight: 124,
        gridTemplateRows: "auto minmax(42px, 1fr) auto",
        rowGap: "var(--space-2)",
        alignContent: "start",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span style={{ color }}>{icon}</span>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--weight-bold)" as any,
            letterSpacing: "var(--tracking-spread)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
        {changed && (
          <span
            className="inline-flex items-center rounded-full"
            style={{ color: "var(--cta)", marginLeft: -2 }}
            title={`Su misura per te · canonica ${changed.canonical}`}
            aria-label={`Valore su misura. Canonica: ${changed.canonical}`}
          >
            {changed.dir === "up" ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
          </span>
        )}
      </div>
      <div
        className="type-numeric flex items-baseline gap-1 min-w-0 w-full"
        style={{
          color: "var(--text-default)",
          fontFeatureSettings: "'tnum'",
          lineHeight: "var(--leading-none)",
          alignSelf: "start",
          whiteSpace: "nowrap",
        }}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={value}
            className="inline-block"
            initial={{ opacity: 0, y: 16, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(3px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{
              fontSize: "clamp(var(--font-size-6xl), 4.8vw, var(--font-size-7xl))",
              fontWeight: 760,
              letterSpacing: 0,
              lineHeight: "0.95",
            }}
          >
            {statValue.main}
          </motion.span>
        </AnimatePresence>
        {statValue.unit && (
          <span
            style={{
              fontSize: "clamp(var(--font-size-xl-5), 1.8vw, var(--font-size-3xl))",
              fontWeight: "var(--weight-bold)" as any,
              letterSpacing: 0,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {statValue.unit}
          </span>
        )}
      </div>
      {detailRows.length > 0 && (
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-md)",
            lineHeight: "var(--leading-normal)",
            alignSelf: "start",
          }}
        >
          {detailRows.map((row, rowIndex) => (
            <span
              key={rowIndex}
              className="block"
            >
              {row}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function splitStatValue(value: string): {
  main: string;
  unit?: string;
  extra?: string;
} {
  const normalized = value.trim();
  const compact = normalized.match(/^([\d.,]+)(°C|%)$/);
  if (compact) return { main: compact[1], unit: compact[2] };

  const words = normalized.match(/^([\d.,]+)\s+(.+)$/);
  if (words) return { main: words[1], unit: words[2] };

  const hoursMinutes = normalized.match(/^(\d+h)\s+(.+)$/);
  if (hoursMinutes) return { main: hoursMinutes[1], extra: hoursMinutes[2] };

  return { main: normalized };
}

/* ═══ Compact nerd metric cell ═══ */
function NerdCell({
  label,
  value,
  changed,
}: {
  label: string;
  value: string;
  changed?: { dir: "up" | "down"; canonical: string };
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-4 px-2 text-center relative"
      style={{ background: "var(--container-page)" }}
    >
      <span
        className="type-data inline-flex items-center gap-0.5"
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--weight-bold)" as any,
          color: "var(--score-accent)",
          fontFeatureSettings: "'tnum'",
        }}
      >
        {value}
        {changed && (
          <span
            style={{ color: "var(--cta)" }}
            title={`Su misura per te · canonica ${changed.canonical}`}
          >
            {changed.dir === "up" ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
          </span>
        )}
      </span>
      <span
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--font-size-md)",
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
