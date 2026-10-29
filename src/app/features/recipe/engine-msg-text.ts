import { resolveEngineMsgs, type EngineMsg } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { formatSeconds } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import { inlineAllergenName } from "./allergen-names";
import type { AllergenId } from "../../data/allergen-data";
import { pantryFlourName } from "./pantry-flour-names";
import { pantryIngredientNames } from "./pantry-ingredient-names";
import { pantryIngredientId } from "../../domain/pantry-ingredients";

/* ═══ Messaggi del motore nella lingua attiva (M-5) ═══
 * Il motore passa i numeri come parametri (a volte già come stringa, es.
 * `penalty.toFixed(1)`); qui diventano numeri formattati per lingua: 63,7%
 * in italiano, 63.7% in inglese. Le temperature passano dal formattatore delle
 * unità (°C o °F secondo il profilo) e le ore diventano durate («3 h 45 min»):
 * i template del CMS non scrivono l'unità dopo questi parametri. */

/** Parametri che sono sempre temperature. */
const TEMPERATURE_PARAMS = new Set(["temp", "ideal", "oven", "ddt", "requiredTemp", "fromTemp", "toTemp"]);
/** Messaggi in cui anche {min} è una temperatura (altrove è un'idratazione). */
const TEMPERATURE_MIN_KEYS = new Set([
  "feas.ovenTooCold",
  "rec.ovenTooCold",
  "auth.thermalUnviable",
  "feas.thermalUnviable",
]);
/** Parametri in ore, per messaggio. */
const HOUR_PARAMS: Record<string, readonly string[]> = {
  "change.fermentation": ["fromHours", "toHours"],
  /* Solo l'estremo alto porta l'unità: «8–24 h», non «8 h-24 h». */
  "rec.timeCompatible": ["fMax"],
  "rec.timeAdaptable": ["hours"],
  "rec.timeInsufficient": ["fMin", "available"],
  "gen.windowTooShort": ["available", "needed"],
  "gen.fermentationTooLong": ["hours", "maxHours"],
  "gen.timeBelowStyleWindow": ["available", "fMin"],
  "gen.timeBelowStyleWindowMeal": ["available", "work", "ferment", "fMin", "needed"],
  "opt.coldLongFerment": ["hours", "available"],
  "opt.roomFerment": ["hours"],
};
/** Parametri in secondi di cottura, per messaggio (D-050). */
const COOK_SECONDS_PARAMS: Record<string, readonly string[]> = {
  "timeline.bake.rounds": ["sec"],
  /* FW-19 (S09-A-14): recupero del forno fra due cotture. */
  "timeline.bake.recovery": ["sec"],
  /* G3-WP-03: soglia del basilico nel «Come si fa». */
  "timeline.topping.basilThreshold": ["sec"],
};
/** FW-19: parametri in minuti (intervallo delle pieghe). */
const MINUTE_PARAMS: Record<string, readonly string[]> = {
  "timeline.folds.desc": ["interval"],
  "timeline.folds.descCold": ["interval"],
  "timeline.folds.descCool": ["interval"],
};
/** Parametri che sono id di farine della dispensa (C-3). */
const FLOUR_PARAMS: Record<string, readonly string[]> = {
  "rec.flourMix": ["weak", "strong"],
};
const NUMERIC = /^-?\d+(?:\.\d+)?$/;

export function engineMsgTexts(
  msgs: EngineMsg[],
  cms: CmsContent,
  bcp47: string,
): string[] {
  const fmt = createFormatter(cms.ui, bcp47);
  const ingredients = msgs.some(msg => msg.key === "need.ingredient" || msg.key === "need.excludedIngredient" || Array.isArray(msg.params?.ingredients))
    ? pantryIngredientNames(cms) : null;
  return resolveEngineMsgs(msgs, cms.engineMessages, (msg, key, value) => {
    if (key === "allergen") return inlineAllergenName(String(value) as AllergenId, bcp47);
    if (Array.isArray(value)) return value.map(name => name === "Olio per frittura" ? uiMessage("allergen.fryingOil") : name === "Farina di grano" ? cms.ui.flour : ingredients?.get(pantryIngredientId(name)) ?? name).join(", ");
    if (ingredients && key === "ingredient") return cms.yeastLabels[String(value)] ?? ingredients.get(pantryIngredientId(String(value))) ?? value;
    if (msg.key === "need.excludedFlour" && key === "flour") return pantryFlourName(String(value));
    if ((msg.key === "need.yeast" || msg.key === "need.checkYeast") && key === "yeast") return cms.yeastLabels[String(value)] ?? String(value);
    if (FLOUR_PARAMS[msg.key]?.includes(key)) return pantryFlourName(String(value));
    const number =
      typeof value === "number" ? value : NUMERIC.test(value) ? Number(value) : null;
    if (number === null || !Number.isFinite(number)) return value;
    const isTemperature =
      TEMPERATURE_PARAMS.has(key) || (key === "min" && TEMPERATURE_MIN_KEYS.has(msg.key));
    if (isTemperature) return fmt.celsius(number);
    if (HOUR_PARAMS[msg.key]?.includes(key)) return fmt.durationShort(number);
    /* FW-19 (S09-A-14): «5 min 45 s», non «6 minuti»: con 4 cotture e 23
       minuti in tutto il conto deve tornare. */
    if (COOK_SECONDS_PARAMS[msg.key]?.includes(key)) return formatSeconds(number, bcp47);
    if (MINUTE_PARAMS[msg.key]?.includes(key)) return fmt.durationMinutes(number);
    return fmt.number(number, { maximumFractionDigits: 2 });
  });
}
