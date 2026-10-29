/* ═══ Voce (Siri, Alexa) — ingresso del modulo ═══
 * Voce → understand (che cosa chiede) → answerVoice (tool MCP) → frasi, SSML,
 * link. Puro: niente browser, niente rete, niente dati dell'utente. */

import { answerVoice, type VoiceAnswer, type VoiceChannel } from "./answer";
import { voiceCatalog } from "./catalog";
import { understand } from "./understand";

export { answerVoice, callMcpTool, type VoiceAnswer, type VoiceChannel } from "./answer";
export { voiceCatalog, VOICE_LANGS, type VoiceCatalog, type VoiceLang } from "./catalog";
export { understand, recognizeStyle, recognizeTerm, normalizeSpeech, styleTable, termTable, type VoiceQuery, type VoiceKitchen } from "./understand";

/** Lunghezza massima di una domanda (caratteri): una frase detta, non un testo. */
export const VOICE_MAX_INPUT = 300;

export interface VoiceReplyOptions {
  lang?: string | null;
  channel: VoiceChannel;
  baseUrl: string;
}

/** Una frase detta → la risposta da dire. */
export function voiceReply(text: string, options: VoiceReplyOptions): VoiceAnswer {
  const catalog = voiceCatalog(options.lang);
  const query = understand(text.slice(0, VOICE_MAX_INPUT), catalog);
  return answerVoice(query, { catalog, channel: options.channel, baseUrl: options.baseUrl });
}
