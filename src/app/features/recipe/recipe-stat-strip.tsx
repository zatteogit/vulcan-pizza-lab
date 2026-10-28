import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { motionDelay,motionSpring } from "../../components/ds/motion";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { isFriedStyle, GeneratedRecipe } from "../../domain/pizza-engine";
import { compareToReference } from "../../domain/recipe-reference";
import { uiMessage } from "../../i18n/ui-messages";

interface RecipeStatStripProps {
  recipe: GeneratedRecipe;
  isPersonalized?: boolean;
  /** FW-14: ricetta del preset attivo (riferimento); i delta partono da qui. */
  reference?: GeneratedRecipe;
  /** I valori sono quelli scelti dall'ottimizzatore, non modifiche a mano. */
  optimized?: boolean;
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
  reference,
  optimized = false,
}: RecipeStatStripProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

  /* FW-14 (S07-A-04, S07-B-01): marca i parametri che si discostano dalla
     ricetta di riferimento (preset attivo) — mai dal centro degli intervalli.
     Stesso formatter sui due lati. Forno/cottura no (sono il tuo forno). */
  const envOf = (tempC: number) =>
    tempC < 10 ? (ui.fermentEnvFridge ?? "frigo") : (ui.fermentEnvAmbient ?? "ambiente");
  const deltas = isPersonalized && reference ? compareToReference(recipe, reference) : [];
  const deltaOf = (param: string) => deltas.find((d) => d.param === param);
  const h = deltaOf("hydration");
  const w = deltaOf("flourW");
  const f = deltaOf("fermentation");
  const hChanged = h ? { canonical: fmt.percent(h.reference.value) } : undefined;
  // Stesso formato del valore attuale nella cella (prima «W285» contro «280 W»).
  const flourWValue = (v: number) => `${v} W`;
  const wChanged = w ? { canonical: flourWValue(w.reference.value) } : undefined;
  const fChanged = f
    ? { canonical: `${fmt.durationShort(f.reference.value)} ${envOf(f.reference.tempC ?? recipe.fermentation_temp_c)}` }
    : undefined;

  /* Round 6-7 (note Matteo): in tabella SOLO i valori che cambiano e
     caratterizzano la ricetta — via Cottura (derivato), dentro la Forza
     farina che fa paio con l'idratazione; la lievitazione dichiara il
     CONTESTO (ambiente/frigo), non solo le ore. */
  const fermentEnv = envOf(recipe.fermentation_temp_c);
  /* Audit totale n. 6: la ricetta (anche l'originale) si calcola sul TUO
     forno; se resta sotto il minimo dello stile lo diciamo accanto al valore. */
  const ovenBelowStyle =
    !isFriedStyle(recipe.style) &&
    recipe.oven_temp_c < recipe.style.baking.temp_c_range[0] &&
    // Se non è fattibile lo spiega già il blocco compatibilità.
    recipe.verdict.outcome !== "not_feasible";
  const cells: {
    label: string;
    value: string;
    changed?: { canonical: string };
    note?: string;
  }[] = [
    { label: ui.statHydration, value: fmt.percent(recipe.hydration_pct), changed: hChanged },
    { label: ui.statFlourStrength ?? "Forza farina", value: flourWValue(recipe.flour_w), changed: wChanged },
    {
      label: recipe.style.dough.unleavened ? ui.statRest : ui.statFermentation,
      value: `${fmt.durationShort(recipe.fermentation_hours)} ${fermentEnv}`,
      changed: fChanged,
    },
    // M-6: le fritte non hanno forno, la temperatura è quella dell'olio.
    isFriedStyle(recipe.style)
      ? { label: ui.statOil, value: fmt.celsius(recipe.style.baking.temp_c_ideal) }
      : {
          label: ui.statOven,
          value: fmt.celsius(recipe.oven_temp_c),
          note: ovenBelowStyle
            ? uiMessage("features.recipe.recipe-stat-strip.idealOven", [fmt.celsius(recipe.style.baking.temp_c_ideal)])
            : undefined,
        },
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
          <SpecCell label={cell.label} value={cell.value} index={i} changed={cell.changed} optimized={optimized} />
          {cell.note && <p className="stat-strip__note">{cell.note}</p>}
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
  optimized = true,
}: {
  label: string;
  value: string;
  index?: number;
  changed?: { canonical: string };
  small?: boolean;
  science?: boolean;
  /** FW-14: «ottimizzato» solo per le scelte dell'ottimizzatore. */
  optimized?: boolean;
}) {
  const parts = splitStatValue(value);
  const pair = changed ? [changed.canonical, value] : [];
  const changedTitle = !changed ? undefined : optimized
    ? uiMessage("features.recipe.recipe-stat-strip.prima-value-ottimizzato-value-e6e2e71f", pair)
    : uiMessage("features.recipe.recipe-stat-strip.modified", pair);
  const changedLabel = !changed ? undefined : optimized
    ? uiMessage("features.recipe.recipe-stat-strip.valore-ottimizzato-prima-value-ora-value-dca62da8", pair)
    : uiMessage("features.recipe.recipe-stat-strip.modified", pair);
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
          title={changedTitle}
          aria-label={changedLabel}
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
              {optimized && (
                <Sparkles
                  size={small ? 11 : 12}
                  strokeWidth={2.4}
                  className="stat-strip__value-star"
                  aria-hidden="true"
                />
              )}
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
