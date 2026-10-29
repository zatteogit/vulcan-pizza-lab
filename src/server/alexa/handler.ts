/* ═══ POST /alexa — endpoint HTTPS della Custom Skill ═══
 * Verifica (verify.ts) → risposta (skill.ts). Qualsiasi richiesta non
 * verificata riceve 400, come chiede Amazon; i motivi restano nel corpo
 * (codici brevi, senza dati della richiesta). Nessun dato dell'utente viene
 * salvato: la skill non ha stato oltre agli attributi di sessione che Alexa
 * stessa rimanda indietro. */

import { voiceCatalog } from "../../app/agent/voice";
import { toSsml } from "../../app/agent/voice/speech";
import { handleAlexaEnvelope } from "./skill";
import { verifyAlexaRequest, type AlexaVerifyOptions } from "./verify";

/** Le richieste Alexa sono piccole; oltre questo limite non si legge nemmeno. */
export const ALEXA_MAX_BODY_BYTES = 64 * 1024;

export interface AlexaHandlerDeps {
  skillId: string | undefined;
  fetchCertChain: AlexaVerifyOptions["fetchCertChain"];
  now?: Date;
  trustAnchorsPem?: readonly string[];
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json;charset=UTF-8", "Cache-Control": "no-store" },
  });
}

export async function handleAlexaRequest(request: Request, deps: AlexaHandlerDeps): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
  }
  const length = Number(request.headers.get("Content-Length") ?? 0);
  if (length > ALEXA_MAX_BODY_BYTES) return jsonResponse({ error: "body_too_large" }, 400);
  const body = await request.text();
  if (body.length > ALEXA_MAX_BODY_BYTES) return jsonResponse({ error: "body_too_large" }, 400);

  const verified = await verifyAlexaRequest({
    skillId: deps.skillId,
    headers: request.headers,
    body,
    now: deps.now,
    fetchCertChain: deps.fetchCertChain,
    trustAnchorsPem: deps.trustAnchorsPem,
  });
  if (!verified.ok) return jsonResponse({ error: verified.reason }, 400);

  const baseUrl = new URL(request.url).origin;
  try {
    return jsonResponse(handleAlexaEnvelope(verified.envelope, baseUrl), 200);
  } catch {
    // Un errore del motore non deve lasciare Alexa senza risposta.
    const catalog = voiceCatalog(verified.envelope.request?.locale);
    return jsonResponse({ version: "1.0", response: { outputSpeech: { type: "SSML", ssml: toSsml([catalog.say.error]) }, shouldEndSession: true } }, 200);
  }
}

/** Scarica la catena PEM di Amazon (Worker: fetch con timeout). */
export async function fetchAlexaCertChain(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error(`cert ${response.status}`);
  return response.text();
}
