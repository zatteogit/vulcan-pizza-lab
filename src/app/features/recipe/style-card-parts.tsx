import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { ChefHat, Gauge } from "lucide-react";
import type { GeneratedRecipe, PizzaStyle } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { uiMessage } from "../../i18n/ui-messages";
import { styleDifficultyLabel } from "./recommended-styles";

/* ═══ Parti comuni delle card di uno stile (Scopri e Crea) ═══
 * Nota di Matteo (24/10/2026): le card delle due pagine erano due componenti
 * diversi (anello del punteggio contro pill, «Principianti» in alto contro
 * «livello · ore» in basso). Un solo linguaggio: in alto a destra la
 * compatibilità con la tua cucina (D-041), in basso la chip livello e ore. */

/** Sotto questo margine il «→ migliore» è rumore: la card resta pulita. */
const HEADROOM_MIN = 8;

export function CompatibilityPill({ now, best, basis, className }: { now: number; best: number; basis?: string; className?: string }) {
  const headroom = best - now >= HEADROOM_MIN ? best : null;
  const label = headroom
    ? uiMessage("pages.explore.compatibilityOptimizable", [now, headroom])
    : uiMessage("pages.explore.compatibility", [now]);
  return (
    <p className={`compat-pill${className ? ` ${className}` : ""}`} title={label} aria-label={label}>
      {basis && <span className="compat-pill__basis">{basis}</span>}
      <Gauge size={11} aria-hidden="true" className="compat-pill__icon" />
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

/** «Principiante · 18–48h»: quanto è difficile e quanto dura. */
export function styleMetaLabel(style: PizzaStyle, cms: CmsContent): string {
  const [fMin, fMax] = style.dough.fermentation_hours_range;
  const time = fMax <= 8 ? cms.filters.timeFast : `${Math.round(fMin)}–${Math.round(fMax)}h`;
  return `${styleDifficultyLabel(style, cms)} · ${time}`;
}

export function StyleMetaChip({ style, cms, recipe }: { style: PizzaStyle; cms: CmsContent; recipe?: GeneratedRecipe }) {
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const label = recipe ? `${styleDifficultyLabel(style, cms)} · ${fmt.durationShort(recipe.fermentation_hours)}` : styleMetaLabel(style, cms);
  return (
    <p className="style-meta-chip">
      <ChefHat size={13} strokeWidth={2.5} className="style-meta-chip__icon" aria-hidden="true" />
      <span data-region="meta">{label}</span>
    </p>
  );
}
