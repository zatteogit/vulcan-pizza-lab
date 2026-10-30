import type { RecipeBlocker, RecipeVerdict } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { engineMsgTexts } from "./engine-msg-text";

/* FW-09 (S11-A-07, S11-B-04, S11-B-09): il motivo di un esito non fattibile,
 * in una frase, fuori dall'avviso della ricetta (per esempio in Impara). Stesse
 * chiavi e stessi numeri di recipe-verdict-notice, che la usa (G4a-WP-02:
 * una sola copia, budget JS). */

/** Il blocco da dire per primo: allergeni, poi diete, forno, tempi. */
export function primaryBlocker(verdict: RecipeVerdict): RecipeBlocker | null {
  const { blockers } = verdict;
  return blockers.find((b) => b.kind === "dietary_conflict" && b.filter_id.startsWith("allergen:"))
    ?? blockers.find((b) => b.kind === "dietary_conflict")
    ?? blockers.find((b) => b.kind === "oven_too_cold")
    ?? blockers[0]
    ?? null;
}

export function blockerText(blocker: RecipeBlocker, cms: CmsContent, bcp47: string): string {
  const fmt = createFormatter(cms.ui, bcp47);
  switch (blocker.kind) {
    case "dietary_conflict":
    case "resource_excluded":
      return engineMsgTexts([blocker.message], cms, bcp47)[0];
    case "oven_too_cold":
      return t(cms.ui.verdictOvenTooCold, { oven: fmt.celsius(blocker.oven_c), min: fmt.celsius(blocker.style_min_c) });
    case "time_window":
      return t(cms.ui.verdictTimeWindow, { needed: fmt.durationShort(blocker.needed_h), available: fmt.durationShort(blocker.available_h) });
    case "fermentation_too_short":
      return t(cms.ui.verdictFermentationTooShort, { hours: fmt.durationShort(blocker.fermentation_h), min: fmt.durationShort(blocker.style_min_h) });
    case "fermentation_too_long":
      return engineMsgTexts([{
        key: "gen.fermentationTooLong",
        fallback: "Lievitazione di {hours}: supera il massimo previsto da questa ricetta ({maxHours}). Scegli un metodo verificato per una durata maggiore.",
        params: { hours: blocker.fermentation_h, maxHours: blocker.style_max_h },
      }], cms, bcp47)[0];
    case "fermentation_temperature":
      return engineMsgTexts([{
        key: "gen.fermentationTemperature",
        fallback: "Questo metodo prevede maturazione a {requiredTemp}; è stata impostata a {temp}. Ripristina il regime previsto o scegli un altro metodo verificato.",
        params: { temp: blocker.actual_c, requiredTemp: blocker.required_c },
      }], cms, bcp47)[0];
  }
}
