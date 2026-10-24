import { ChefHat, Gauge } from "lucide-react";
import type { PizzaStyle } from "../../domain/pizza-engine";
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

export function CompatibilityPill({ now, best, className }: { now: number; best: number; className?: string }) {
  const headroom = best - now >= HEADROOM_MIN ? best : null;
  const label = headroom
    ? uiMessage("pages.explore.compatibilityOptimizable", [now, headroom])
    : uiMessage("pages.explore.compatibility", [now]);
  return (
    <p className={`compat-pill${className ? ` ${className}` : ""}`} title={label} aria-label={label}>
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

export function StyleMetaChip({ style, cms }: { style: PizzaStyle; cms: CmsContent }) {
  return (
    <p className="style-meta-chip">
      <ChefHat size={13} strokeWidth={2.5} className="style-meta-chip__icon" aria-hidden="true" />
      <span data-region="meta">{styleMetaLabel(style, cms)}</span>
    </p>
  );
}
