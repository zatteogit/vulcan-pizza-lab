/* ═══ GET/POST /api/voice — la voce per Siri (Comando rapido) ═══
 * ?q=<frase>&lang=it → testo semplice da far pronunciare; ?format=json →
 * {speech, url, intent}. Motore locale (nessuna chiamata di rete), nessun
 * dato dell'utente letto o salvato, niente cache. Per Siri non serve CORS:
 * il Comando rapido non è un browser. Guida: docs/voce-siri-alexa.md. */

import { VOICE_MAX_INPUT, voiceCatalog, voiceReply, type VoiceAnswer } from "../../app/agent/voice";

const MAX_BODY_BYTES = 4 * 1024;

function reply(body: string, status: number, type: string): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

async function readInput(request: Request, url: URL): Promise<{ q: string; lang: string | null; format: string | null } | "too_large"> {
  let q = url.searchParams.get("q");
  let lang = url.searchParams.get("lang");
  let format = url.searchParams.get("format");
  if (request.method === "POST") {
    const length = Number(request.headers.get("Content-Length") ?? 0);
    if (length > MAX_BODY_BYTES) return "too_large";
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return "too_large";
    const type = request.headers.get("Content-Type") ?? "";
    if (type.includes("application/json")) {
      try {
        const body = JSON.parse(raw) as Record<string, unknown>;
        q ??= typeof body.q === "string" ? body.q : null;
        lang ??= typeof body.lang === "string" ? body.lang : null;
        format ??= typeof body.format === "string" ? body.format : null;
      } catch {
        /* corpo non JSON: si usa la query */
      }
    } else if (type.includes("application/x-www-form-urlencoded")) {
      const form = new URLSearchParams(raw);
      q ??= form.get("q");
      lang ??= form.get("lang");
      format ??= form.get("format");
    } else if (!q) {
      q = raw;
    }
  }
  return { q: (q ?? "").trim(), lang, format };
}

export async function handleVoiceRequest(request: Request): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST", "Cache-Control": "no-store" } });
  }
  const url = new URL(request.url);
  const input = await readInput(request, url);
  const json = typeof input === "object" && input.format === "json";
  if (input === "too_large" || input.q.length > VOICE_MAX_INPUT) {
    const message = voiceCatalog(typeof input === "object" ? input.lang : null).say.tooLong;
    return json ? reply(JSON.stringify({ error: "input_too_long", speech: message }), 400, "application/json") : reply(message, 400, "text/plain");
  }
  const catalog = voiceCatalog(input.lang);
  let answer: Pick<VoiceAnswer, "speech" | "url" | "intent" | "data">;
  try {
    answer = voiceReply(input.q, { lang: input.lang, channel: "siri", baseUrl: url.origin });
  } catch {
    // Un errore del motore diventa una frase, non un silenzio di Siri.
    answer = { speech: catalog.say.error, intent: "fallback" };
  }
  if (json) {
    return reply(JSON.stringify({ speech: answer.speech, url: answer.url ?? null, intent: answer.intent, lang: catalog.lang, ...(answer.data ?? {}) }), 200, "application/json");
  }
  return reply(answer.speech, 200, "text/plain");
}
