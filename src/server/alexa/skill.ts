/* ═══ Skill Alexa «Vulcan Pizza» — dalla richiesta verificata alla risposta ═══
 * Intenti del modello it-IT (alexa/skill-package): ConsigliaIntent,
 * RicettaIntent, GlossarioIntent più quelli di Amazon. Le risposte vengono
 * dal modulo voice (src/app/agent/voice), cioè dagli stessi tool MCP: qui si
 * traducono solo gli slot in una VoiceQuery e la risposta nel formato Alexa.
 * Se alla ricetta manca lo stile si chiede, ricordando panetti, ore e forno
 * negli attributi di sessione. */

import { STYLES_DB } from "../../app/domain/pizza-engine";
import {
  answerVoice,
  recognizeStyle,
  recognizeTerm,
  understand,
  voiceCatalog,
  type VoiceAnswer,
  type VoiceKitchen,
  type VoiceQuery,
} from "../../app/agent/voice";
import { toSsml } from "../../app/agent/voice/speech";
import type { AlexaEnvelope, AlexaSlot } from "./verify";

export const ALEXA_INTENTS = {
  recommend: "ConsigliaIntent",
  recipe: "RicettaIntent",
  glossary: "GlossarioIntent",
} as const;

/** Nomi degli slot nel modello d'interazione. */
export const ALEXA_SLOTS = {
  style: "stile",
  balls: "panetti",
  hours: "ore",
  oven: "forno",
  term: "termine",
} as const;

interface PendingRecipe {
  pending: "recipe";
  balls?: number;
  hours?: number;
  kitchen?: VoiceKitchen;
  /** Il primo stile consigliato: un «sì» dopo il consiglio ne dà la ricetta. */
  suggestion?: string;
}

export interface AlexaResponseBody {
  version: "1.0";
  sessionAttributes?: Record<string, unknown>;
  response: {
    outputSpeech?: { type: "SSML"; ssml: string };
    reprompt?: { outputSpeech: { type: "SSML"; ssml: string } };
    card?: { type: "Simple"; title: string; content: string };
    shouldEndSession?: boolean;
  };
}

function slotValue(slot: AlexaSlot | undefined): { id?: string; text?: string } {
  if (!slot) return {};
  const match = slot.resolutions?.resolutionsPerAuthority?.find((a) => a.status?.code === "ER_SUCCESS_MATCH");
  return { id: match?.values?.[0]?.value?.id, text: slot.value };
}

function slotNumber(slot: AlexaSlot | undefined, max: number): number | undefined {
  const value = Number(slot?.value);
  return Number.isFinite(value) && value > 0 && value <= max ? value : undefined;
}

function queryFromIntent(envelope: AlexaEnvelope, lang: string): VoiceQuery {
  const catalog = voiceCatalog(lang);
  const intent = envelope.request?.intent;
  const slots = intent?.slots ?? {};
  const oven = slotValue(slots[ALEXA_SLOTS.oven]);
  const ovenText = oven.text ? understand(`forno ${oven.text}`, catalog).kitchen : {};
  const hours = slotNumber(slots[ALEXA_SLOTS.hours], 168);
  const pending = (envelope.session?.attributes ?? {}) as Partial<PendingRecipe>;
  const fromSession = pending.pending === "recipe";
  const kitchen: VoiceKitchen = { ...(fromSession ? pending.kitchen : {}), ...ovenText };
  const base = { kitchen, ...((hours ?? (fromSession ? pending.hours : undefined)) !== undefined ? { hours: hours ?? pending.hours } : {}) };

  switch (intent?.name) {
    case ALEXA_INTENTS.recommend:
      return { intent: "recommend", ...base };
    case ALEXA_INTENTS.recipe: {
      const style = slotValue(slots[ALEXA_SLOTS.style]);
      const styleId = style.id && STYLES_DB[style.id] ? style.id : style.text ? recognizeStyle(style.text, catalog) : undefined;
      const balls = slotNumber(slots[ALEXA_SLOTS.balls], 200) ?? (fromSession ? pending.balls : undefined);
      return { intent: "recipe", ...(styleId ? { styleId } : {}), ...(balls !== undefined ? { balls: Math.round(balls) } : {}), ...base };
    }
    case ALEXA_INTENTS.glossary: {
      const term = slotValue(slots[ALEXA_SLOTS.term]);
      const termId = term.id ?? (term.text ? recognizeTerm(term.text, catalog) : undefined);
      return termId ? { intent: "glossary", termId, ...base } : { intent: "glossary", termUnknown: true, ...base };
    }
    case "AMAZON.HelpIntent":
      return { intent: "help", ...base };
    // «Sì» a una ricetta in sospeso: lo stile consigliato, se c'è; se no lo si chiede.
    case "AMAZON.YesIntent":
      if (!fromSession) return { intent: "fallback", ...base };
      return {
        intent: "recipe",
        ...(pending.suggestion && STYLES_DB[pending.suggestion] ? { styleId: pending.suggestion } : {}),
        ...(pending.balls !== undefined ? { balls: pending.balls } : {}),
        ...base,
      };
    default:
      return { intent: "fallback", ...base };
  }
}

function toAlexa(answer: VoiceAnswer, lang: string, previous: Record<string, unknown>): AlexaResponseBody {
  const catalog = voiceCatalog(lang);
  const content = answer.url ? `${answer.speech}\n\n${catalog.say.openOnVulcan}: ${answer.url}` : answer.speech;
  // Una domanda in sospeso sopravvive a un «non ho capito» o a un aiuto.
  const keep = !answer.endSession && (answer.intent === "fallback" || answer.intent === "help");
  const sessionAttributes: Record<string, unknown> = answer.pending && !answer.endSession
    ? { pending: "recipe", balls: answer.pending.balls, hours: answer.pending.hours, kitchen: answer.pending.kitchen, suggestion: answer.pending.suggestion }
    : keep ? previous : {};
  return {
    version: "1.0",
    sessionAttributes,
    response: {
      outputSpeech: { type: "SSML", ssml: answer.ssml },
      card: { type: "Simple", title: answer.title, content },
      ...(answer.endSession ? {} : { reprompt: { outputSpeech: { type: "SSML", ssml: toSsml([answer.reprompt ?? catalog.say.fallbackReprompt]) } } }),
      shouldEndSession: answer.endSession,
    },
  };
}

function speak(sentence: string, end: boolean, reprompt?: string): AlexaResponseBody {
  return {
    version: "1.0",
    response: {
      outputSpeech: { type: "SSML", ssml: toSsml([sentence]) },
      ...(reprompt ? { reprompt: { outputSpeech: { type: "SSML", ssml: toSsml([reprompt]) } } } : {}),
      shouldEndSession: end,
    },
  };
}

/** La risposta Alexa per una richiesta già verificata. baseUrl: origine dei link. */
export function handleAlexaEnvelope(envelope: AlexaEnvelope, baseUrl: string): AlexaResponseBody {
  const lang = String(envelope.request?.locale ?? "it-IT");
  const catalog = voiceCatalog(lang);
  const say = catalog.say;
  switch (envelope.request?.type) {
    case "LaunchRequest":
      return speak(say.welcome, false, say.welcomeReprompt);
    case "IntentRequest": {
      const name = envelope.request.intent?.name;
      // «No» chiude come Stop: la skill non fa altre domande sì/no.
      if (name === "AMAZON.StopIntent" || name === "AMAZON.CancelIntent" || name === "AMAZON.NavigateHomeIntent" || name === "AMAZON.NoIntent") {
        return speak(say.goodbye, true);
      }
      const query = queryFromIntent(envelope, lang);
      return toAlexa(answerVoice(query, { catalog, channel: "alexa", baseUrl }), lang, envelope.session?.attributes ?? {});
    }
    // SessionEndedRequest e gli altri tipi: nessuna voce (Amazon non la ammette).
    default:
      return { version: "1.0", response: {} };
  }
}
