import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { Clock, CookingPot, Flame, ScanLine, Wheat } from "lucide-react";
import { Badge } from "../../components/ds/index";
import { RecipeMatchIcon } from "./recipe-match-icon";
import { recipeCardSignals } from "./recipe-card-signals";
import { engineMsgTexts } from "./engine-msg-text";
import type { GeneratedRecipe, PizzaStyle } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { uiMessage } from "../../i18n/ui-messages";


/* ═══ Parti comuni delle card di uno stile (Scopri e Crea) ═══
 * Nota di Matteo (24/10/2026): le card delle due pagine erano due componenti
 * diversi (anello del punteggio contro pill, «Principianti» in alto contro
 * «livello · ore» in basso). Un solo linguaggio: in alto a destra la
 * compatibilità con la tua cucina, in basso solo segnali utili alla scelta. */

/** Sotto questo margine il «→ migliore» è rumore: la card resta pulita. */
const HEADROOM_MIN = 8;

export function CompatibilityPill({ now, best, basis, blocked, className }: { now: number; best: number; basis?: string; blocked?: boolean; className?: string }) {
  const headroom = best - now >= HEADROOM_MIN ? best : null;
  const label = headroom
    ? uiMessage("pages.explore.compatibilityOptimizable", [now, headroom])
    : uiMessage("pages.explore.compatibility", [now]);
  return (
    <p className={`compat-pill${blocked ? " compat-pill--blocked" : ""}${className ? ` ${className}` : ""}`} title={label} aria-label={label}>
      {basis && <span className="compat-pill__basis">{basis}</span>}
      <RecipeMatchIcon score={now} blocked={blocked} size={14} aria-hidden="true" className="compat-pill__icon" />
      <span className="compat-pill__now">{now}</span>
      {headroom && (
        <>
          <span className="compat-pill__arrow" aria-hidden="true">→</span>
          <span className="compat-pill__best">{headroom}</span>
        </>
      )}
    </p>
  );
}

/** A maximum of two useful signals, inside the photo. The duration describes
 * the complete generated timeline, not fermentation alone. */
export function StyleMetaChip({ style, cms, recipe }: { style: PizzaStyle; cms: CmsContent; recipe?: GeneratedRecipe }) {
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const signals = recipe ? recipeCardSignals(recipe) : [];
  const icons = { oven: Flame, time: Clock, pan: CookingPot, flour: Wheat, check: ScanLine };
  const duration = recipe
    ? fmt.durationShort(Math.round(recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0) / 30) / 2)
    : `${style.dough.fermentation_hours_range[0]}–${style.dough.fermentation_hours_range[1]}h`;
  return (
    <div className="style-signals" data-region="meta">
      {signals.map(signal => {
        const Icon = icons[signal.icon];
        const text = engineMsgTexts([signal.message], cms, bcp47)[0];
        return <Badge key={text} tone={signal.tone} className={signal.tone === "error" ? "style-signal style-signal--error" : "style-signal style-signal--warning"}>
          <Icon size={13} aria-hidden="true" /><span data-slot="label">{text}</span>
        </Badge>;
      })}
      {signals.length < 2 && recipe?.verdict.outcome !== "not_feasible" && (
        <Badge tone="muted" className="style-signal"><Clock size={13} aria-hidden="true" /><span data-slot="label">≈ {duration}</span></Badge>
      )}
    </div>
  );
}
