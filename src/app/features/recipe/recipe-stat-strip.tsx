import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { motionDelay,motionSpring } from "../../components/ds/motion";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { GeneratedRecipe } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";

interface RecipeStatStripProps {
  recipe: GeneratedRecipe;
  isPersonalized?: boolean;
}

/**
 * Blocco IMPASTO — spec-sheet tipografico (redesign tab Ricetta, lug 2026).
 * Round 4 (nota Matteo): SOLO i 4 parametri che contano — niente beuta né
 * accordion; i dati nerd (lievito, P/L, ore@18°, Q10, Aw) vivono nel dialog
 * Personalizza. Il marker ↗/↘ (trend, colore dell'ottimizzatore) segue il
 * VALORE e dichiara "questo è stato spostato per te" vs la canonica.
 */
export function RecipeStatStrip({
  recipe,
  isPersonalized = true,
}: RecipeStatStripProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

  // #3(b) trasparenza: marca i parametri che SI DISCOSTANO dalla canonica (il
  // centro range dello stile) — di norma le scelte dell'ottimizzatore.
  // Forno/cottura no (sono il tuo forno / derivati, non scelte).
  const hMid = Math.round(
    (recipe.style.dough.hydration_pct_range[0] + recipe.style.dough.hydration_pct_range[1]) / 2,
  );
  const hChanged =
    isPersonalized && Math.abs(recipe.hydration_pct - hMid) >= 2
      ? { canonical: fmt.percent(hMid) }
      : undefined;
  const fMid = Math.round(
    (recipe.style.dough.fermentation_hours_range[0] + recipe.style.dough.fermentation_hours_range[1]) / 2,
  );
  const fChanged =
    isPersonalized && Math.abs(recipe.fermentation_hours - fMid) >= 2
      ? { canonical: fmt.fermentTime(fMid) }
      : undefined;
  const wMid = Math.round(
    (recipe.style.dough.flour_w_range[0] + recipe.style.dough.flour_w_range[1]) / 2,
  );
  const wChanged =
    isPersonalized && Math.abs(recipe.flour_w - wMid) >= 15
      ? { canonical: uiMessage("features.recipe.recipe-stat-strip.w-value-f64b6332", [wMid]) }
      : undefined;

  /* Round 6-7 (note Matteo): in tabella SOLO i valori che cambiano e
     caratterizzano la ricetta — via Cottura (derivato), dentro la Forza
     farina che fa paio con l'idratazione; la lievitazione dichiara il
     CONTESTO (ambiente/frigo), non solo le ore. */
  const fermentEnv =
    recipe.fermentation_temp_c < 10
      ? (ui.fermentEnvFridge ?? "frigo")
      : (ui.fermentEnvAmbient ?? "ambiente");
  const cells: {
    label: string;
    value: string;
    changed?: { canonical: string };
  }[] = [
    { label: ui.statHydration, value: fmt.percent(recipe.hydration_pct), changed: hChanged },
    { label: ui.statFlourStrength ?? "Forza farina", value: `${recipe.flour_w} W`, changed: wChanged },
    { label: ui.statFermentation, value: `${recipe.fermentation_hours}h ${fermentEnv}`, changed: fChanged },
    { label: ui.statOven, value: fmt.celsius(recipe.oven_temp_c) },
  ];

  /* La tabella tecnica del sacco di farina: filetto d'apertura e filetti
     VERTICALI fra le colonne. NIENTE filetto di chiusura: la sezione Match
     subito sotto è parte della stessa scheda (nota Matteo, 4 lug). */
  return (
    <div data-region="section" className="stat-strip">
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={i > 0 ? "stat-strip__cell stat-strip__cell--divider" : "stat-strip__cell"}
        >
          <SpecCell label={cell.label} value={cell.value} index={i} changed={cell.changed} />
        </div>
      ))}
    </div>
  );
}

/* ═══ Voce dello spec-sheet ═══
   Etichetta sopra (minuscola, spaziata), valore sotto (bold, tabulare) con
   unità in corpo minore. Il marker ↗/↘ in salvia segue il valore: trend, non
   chevron-accordion. small = varianti compatte; science = etichetta tinta
   tecnica (riusata dal blocco nerd nel dialog Personalizza). */
export function SpecCell({
  label,
  value,
  index = 0,
  changed,
  small = false,
  science = false,
}: {
  label: string;
  value: string;
  index?: number;
  changed?: { canonical: string };
  small?: boolean;
  science?: boolean;
}) {
  const parts = splitStatValue(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...motionSpring.statValue,delay: motionDelay.micro + index * motionDelay.short }}
      className="stat-strip__spec"
    >
      <div
        className={science ? "stat-strip__label stat-strip__label--science" : "stat-strip__label"}
        title={label}
      >
        {label}
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={motionSpring.selection}
          className={changed ? "type-numeric stat-strip__value stat-strip__value--changed" : "type-numeric stat-strip__value"}
          title={changed ? uiMessage("features.recipe.recipe-stat-strip.prima-value-ottimizzato-value-e6e2e71f", [changed.canonical, value]) : undefined}
          aria-label={changed ? uiMessage("features.recipe.recipe-stat-strip.valore-ottimizzato-prima-value-ora-value-dca62da8", [changed.canonical, value]) : undefined}
        >
          {changed && (
            <>
              <span className="stat-strip__value-prev">
                {changed.canonical}
              </span>
              <ArrowRight
                size={small ? 11 : 12}
                strokeWidth={2.4}
                className="stat-strip__value-arrow"
                aria-hidden="true"
              />
              <Sparkles
                size={small ? 11 : 12}
                strokeWidth={2.4}
                className="stat-strip__value-star"
                aria-hidden="true"
              />
            </>
          )}
          <span
            className={
              parts.extra
                ? "stat-strip__value-current stat-strip__value-current--stacked"
                : "stat-strip__value-current"
            }
          >
            <span
              className={
                small
                  ? "stat-strip__value-main stat-strip__value-main--small"
                  : "stat-strip__value-main"
              }
            >
              {parts.main}
            </span>
            {parts.unit && (
              <span
                className={
                  small
                    ? "stat-strip__value-sub stat-strip__value-sub--small"
                    : "stat-strip__value-sub"
                }
              >
                {parts.unit}
              </span>
            )}
            {parts.extra && (
              <span
                className={
                  small
                    ? "stat-strip__value-sub stat-strip__value-sub--small"
                    : "stat-strip__value-sub"
                }
              >
                {parts.extra}
              </span>
            )}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function splitStatValue(value: string): {
  main: string;
  unit?: string;
  extra?: string;
} {
  const normalized = value.trim();
  const compact = normalized.match(/^([\d.,]+)(°C|°F|%)$/);
  if (compact) return { main: compact[1], unit: compact[2] };

  const words = normalized.match(/^([\d.,]+)\s+(.+)$/);
  if (words) return { main: words[1], unit: words[2] };

  const hoursMinutes = normalized.match(/^(\d+h)\s+(.+)$/);
  if (hoursMinutes) return { main: hoursMinutes[1], extra: hoursMinutes[2] };

  return { main: normalized };
}
