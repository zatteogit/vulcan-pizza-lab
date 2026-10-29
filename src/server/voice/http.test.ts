import { describe, expect, it } from "vitest";
import { VOICE_MAX_INPUT } from "../../app/agent/voice";
import { handleVoiceRequest } from "./http";

/* D-061: l'endpoint del Comando rapido di Siri. */

const BASE = "https://vulcan.test/api/voice";

describe("/api/voice", () => {
  it("GET ?q= → testo semplice da pronunciare, senza cache", async () => {
    const res = await handleVoiceRequest(new Request(`${BASE}?q=${encodeURIComponent("ricetta focaccia")}&lang=it`));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(await res.text()).toMatch(/^Considero un forno di casa\. Focaccia Genovese: una focaccia da \d+ grammi\./);
  });

  it("?format=json → {speech, url, intent}", async () => {
    const res = await handleVoiceRequest(new Request(`${BASE}?q=${encodeURIComponent("ricetta pinsa per due pale")}&format=json`));
    const body = (await res.json()) as { speech: string; url: string; intent: string; style_id: string; dough_balls: number; lang: string };
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(body.intent).toBe("recipe");
    expect(body.style_id).toBe("pinsa_romana");
    expect(body.dough_balls).toBe(2);
    expect(body.url).toBe("https://vulcan.test/recipe/pinsa_romana?mode=adapted");
    expect(body.lang).toBe("it");
    expect(body.speech).toContain("2 pale");
  });

  it("POST: testo semplice, JSON o modulo", async () => {
    const plain = await handleVoiceRequest(new Request(BASE, { method: "POST", body: "cos'è la biga" }));
    expect(await plain.text()).toMatch(/^Biga\./);
    const json = await handleVoiceRequest(new Request(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: "cos'è il poolish" }) }));
    expect(await json.text()).toMatch(/^Poolish\./);
    const form = await handleVoiceRequest(new Request(BASE, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "q=aiuto" }));
    expect(await form.text()).toMatch(/^Puoi chiedermi/);
  });

  it("senza domanda risponde con l'aiuto", async () => {
    expect(await (await handleVoiceRequest(new Request(BASE))).text()).toMatch(/^Puoi chiedermi/);
  });

  it("domanda troppo lunga → 400 con una frase da dire", async () => {
    const res = await handleVoiceRequest(new Request(`${BASE}?q=${"a".repeat(VOICE_MAX_INPUT + 1)}`));
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("troppo lunga");
    const big = await handleVoiceRequest(new Request(BASE, { method: "POST", body: "a".repeat(5000) }));
    expect(big.status).toBe(400);
  });

  it("altri metodi → 405", async () => {
    expect((await handleVoiceRequest(new Request(BASE, { method: "PUT", body: "x" }))).status).toBe(405);
  });
});
