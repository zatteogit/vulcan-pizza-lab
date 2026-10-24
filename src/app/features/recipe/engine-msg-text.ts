import { resolveEngineMsgs, type EngineMsg } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";

/* ═══ Messaggi del motore nella lingua attiva (M-5) ═══
 * Il motore passa i numeri come parametri (a volte già come stringa, es.
 * `penalty.toFixed(1)`); qui diventano numeri formattati per lingua: 63,7%
 * in italiano, 63.7% in inglese. Le temperature passano dal formattatore delle
 * unità (°C o °F secondo il profilo) e le ore diventano durate («3 h 45 min»):
 * i template del CMS non scrivono l'unità dopo questi parametri. */

/** Parametri che sono sempre temperature. */
const TEMPERATURE_PARAMS = new Set(["temp", "ideal", "oven", "ddt"]);
/** Messaggi in cui anche {min} è una temperatura (altrove è un'idratazione). */
const TEMPERATURE_MIN_KEYS = new Set([
  "feas.ovenTooCold",
  "rec.ovenTooCold",
  "auth.thermalUnviable",
  "feas.thermalUnviable",
]);
/** Parametri in ore, per messaggio. */
const HOUR_PARAMS: Record<string, readonly string[]> = {
  /* Solo l'estremo alto porta l'unità: «8–24 h», non «8 h-24 h». */
  "rec.timeCompatible": ["fMax"],
  "rec.timeAdaptable": ["hours"],
  "rec.timeInsufficient": ["fMin", "available"],
  "gen.windowTooShort": ["available", "needed"],
  "gen.timeBelowStyleWindow": ["available", "fMin"],
  "opt.coldLongFerment": ["hours", "available"],
  "opt.roomFerment": ["hours"],
};
const NUMERIC = /^-?\d+(?:\.\d+)?$/;

export function engineMsgTexts(
  msgs: EngineMsg[],
  cms: CmsContent,
  bcp47: string,
): string[] {
  const fmt = createFormatter(cms.ui, bcp47);
  return resolveEngineMsgs(msgs, cms.engineMessages, (msg, key, value) => {
    const number =
      typeof value === "number" ? value : NUMERIC.test(value) ? Number(value) : null;
    if (number === null || !Number.isFinite(number)) return value;
    const isTemperature =
      TEMPERATURE_PARAMS.has(key) || (key === "min" && TEMPERATURE_MIN_KEYS.has(msg.key));
    if (isTemperature) return fmt.celsius(number);
    if (HOUR_PARAMS[msg.key]?.includes(key)) return fmt.durationShort(number);
    return fmt.number(number, { maximumFractionDigits: 2 });
  });
}
