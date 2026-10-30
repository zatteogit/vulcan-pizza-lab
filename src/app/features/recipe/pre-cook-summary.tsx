import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { summarizeVerdict } from "../../domain/verdict-summary";
import { nightActions } from "../../use-cases/cook-plan";
import { formatAtClock, formatRelative } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import type { CmsContent } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { blockerText } from "./blocker-text";
import { engineMsgTexts } from "./engine-msg-text";
import { recipeCardSignals } from "./recipe-card-signals";

/* ═══ G4a-WP-03 (S10-A-20, S10-B-20) — «Prima di iniziare» concreto ═══
 * Il dialog diceva «controlla le condizioni» senza dire quali, e non diceva
 * quando si comincia né quando si mangia. Qui: le stesse condizioni della
 * match card (recipeCardSignals, mai ricalcolate), l'inizio e la fine dal
 * piano della scheda (i passi che riceverà la sessione), le azioni notturne
 * del piano unico (cook-plan). Con una ricetta non fattibile «Inizia» non
 * tace: il motivo è la causa principale di summarizeVerdict. */

/** Passi pianificati come li riceve la sessione (durata già estesa). */
export interface PreCookStep {
  id: string;
  duration_minutes: number;
  startMs: number;
  endMs: number;
}

/** Oltre questo anticipo si dice fra quanto parte il primo passo. */
const FIRST_STEP_NOTICE_MS = 30 * 60_000;

/** «Non si può iniziare. {requirement}», o null se la ricetta si fa. */
export function startBlockedText(recipe: GeneratedRecipe, cms: CmsContent, bcp47: string): string | null {
  const { primary } = summarizeVerdict(recipe.verdict);
  return primary ? t(cms.cooking.startBlockedReason, { requirement: blockerText(primary, cms, bcp47) }) : null;
}

export function PreCookSummary({ recipe, steps, approximateEnd, cms, bcp47, now = Date.now() }: {
  recipe: GeneratedRecipe;
  steps: readonly PreCookStep[];
  /** Fine stimata (attese biologiche senza orario del pasto fissato). */
  approximateEnd: boolean;
  cms: CmsContent;
  bcp47: string;
  now?: number;
}) {
  const first = steps[0];
  if (!first) return null;
  const conditions = engineMsgTexts(recipeCardSignals(recipe).map((s) => s.message), cms, bcp47);
  const night = nightActions(steps, first.startMs);
  return (
    <section data-region="pre-cook-summary" className="pre-cook-summary">
      {conditions.length > 0 && (
        <>
          <h3 className="type-label pre-cook-summary__title">{cms.cooking.preCookConditionsTitle}</h3>
          <ul className="type-body pre-cook-summary__conditions">
            {conditions.map((text) => <li key={text}>{text}</li>)}
          </ul>
        </>
      )}
      <p className="type-body pre-cook-summary__times">
        {t(cms.cooking.preCookTimes, {
          start: formatAtClock(first.startMs, bcp47, { nowMs: now }),
          end: formatAtClock(steps[steps.length - 1].endMs, bcp47, { approximate: approximateEnd, nowMs: now }),
        })}
      </p>
      {first.startMs - now > FIRST_STEP_NOTICE_MS && (
        <p className="type-body-sm pre-cook-summary__note">
          {t(cms.cooking.preCookFirstStepIn, { in: formatRelative(first.startMs, now, bcp47) })}
        </p>
      )}
      {night.length > 0 && (
        <p data-tone="caution" className="type-body-sm pre-cook-summary__note">
          {uiMessage("cooking.night.warning", [night.length, formatAtClock(night[0].atMs, bcp47, { nowMs: now })])}
        </p>
      )}
    </section>
  );
}
