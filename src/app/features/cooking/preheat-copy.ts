import type { TimelineStep } from "../../domain/pizza-engine";
import { uiMessage, type UiMessageValues } from "../../i18n/ui-messages";

/* FW-19 (revisione): il passo «preheat» delle fritte scalda l'olio, non il
 * forno (il motore lo marca con variant "oil"). Pulsanti, conto alla rovescia
 * e conferma «è già caldo?» parlano quindi di olio e termometro, non di forno,
 * pietra o platea. Chiavi letterali: la guardia i18n le verifica una per una. */
export type PreheatPart =
  | "start"
  | "waiting"
  | "remaining"
  | "ready"
  | "alreadyHot"
  | "hotTitle"
  | "hotBody"
  | "hotConfirm"
  | "hotKeep";

export const isOilPreheat = (step: Pick<TimelineStep, "variant"> | null | undefined): boolean =>
  step?.variant === "oil";

export function preheatText(oil: boolean, part: PreheatPart, values: UiMessageValues = []): string {
  switch (part) {
    case "start":
      return uiMessage(oil ? "cooking.preheat.oil.start" : "cooking.preheat.start", values);
    case "waiting":
      return uiMessage(oil ? "cooking.preheat.oil.waiting" : "cooking.preheat.waiting", values);
    case "remaining":
      return uiMessage(oil ? "cooking.preheat.oil.remaining" : "cooking.preheat.remaining", values);
    case "ready":
      return uiMessage(oil ? "cooking.preheat.oil.ready" : "cooking.preheat.ready", values);
    case "alreadyHot":
      return uiMessage(oil ? "cooking.preheat.oil.alreadyHot" : "cooking.preheat.alreadyHot", values);
    case "hotTitle":
      return uiMessage(oil ? "cooking.preheat.oil.hotTitle" : "cooking.preheat.hotTitle", values);
    case "hotBody":
      return uiMessage(oil ? "cooking.preheat.oil.hotBody" : "cooking.preheat.hotBody", values);
    case "hotConfirm":
      return uiMessage(oil ? "cooking.preheat.oil.hotConfirm" : "cooking.preheat.hotConfirm", values);
    case "hotKeep":
      return uiMessage("cooking.preheat.hotKeep", values);
  }
}
