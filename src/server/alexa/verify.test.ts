import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ECHO_API_CERT_12 } from "./__fixtures__/echo-api-cert-12";
import { makeChain, signBody } from "./__fixtures__/pki";
import { ALEXA_TRUST_ANCHORS_PEM } from "./trust-anchors";
import { clearAlexaCertCache, isValidCertChainUrl, verifyAlexaRequest, type AlexaVerifyOptions } from "./verify";
import { chainsToTrustAnchor, parsePemChain } from "./x509";

/* D-061: le regole di Amazon per l'endpoint HTTPS di una Custom Skill. Una
   richiesta che ne viola una non arriva mai alla skill. */

const SKILL_ID = "amzn1.ask.skill.00000000-0000-0000-0000-000000000000";
const CERT_URL = "https://s3.amazonaws.com/echo.api/echo-api-cert-test.pem";
const NOW = new Date("2026-10-29T10:00:00Z");

function envelope(overrides: { timestamp?: string; appId?: string } = {}) {
  return JSON.stringify({
    version: "1.0",
    session: { new: true, application: { applicationId: overrides.appId ?? SKILL_ID } },
    context: { System: { application: { applicationId: overrides.appId ?? SKILL_ID } } },
    request: { type: "LaunchRequest", requestId: "r1", locale: "it-IT", timestamp: overrides.timestamp ?? NOW.toISOString() },
  });
}

let chain: Awaited<ReturnType<typeof makeChain>>;
beforeAll(async () => {
  chain = await makeChain(NOW);
});
beforeEach(() => clearAlexaCertCache());

async function request(body: string, extra: Partial<AlexaVerifyOptions> = {}, headers: Record<string, string> = {}) {
  let fetched = 0;
  const result = await verifyAlexaRequest({
    skillId: SKILL_ID,
    headers: new Headers({
      SignatureCertChainUrl: CERT_URL,
      "Signature-256": await signBody(body, chain.leaf.keys.privateKey),
      ...headers,
    }),
    body,
    now: NOW,
    fetchCertChain: async () => { fetched++; return chain.chainPem; },
    trustAnchorsPem: [chain.root.pem],
    ...extra,
  });
  return { result, fetched };
}

describe("verifica delle richieste Alexa", () => {
  it("una richiesta firmata, recente e della nostra skill passa", async () => {
    const { result } = await request(envelope());
    expect(result.ok).toBe(true);
  });

  it("URL della catena: solo https, s3.amazonaws.com, /echo.api/, porta 443", () => {
    for (const ok of [
      "https://s3.amazonaws.com/echo.api/echo-api-cert.pem",
      "https://s3.amazonaws.com:443/echo.api/echo-api-cert.pem",
      "https://s3.amazonaws.com/echo.api/../echo.api/echo-api-cert.pem",
      "HTTPS://S3.AMAZONAWS.COM/echo.api/echo-api-cert.pem",
    ]) expect(isValidCertChainUrl(ok), ok).toBe(true);
    for (const bad of [
      null,
      "",
      "http://s3.amazonaws.com/echo.api/echo-api-cert.pem",
      "https://notamazon.com/echo.api/echo-api-cert.pem",
      "https://s3.amazonaws.com/EcHo.aPi/echo-api-cert.pem",
      "https://s3.amazonaws.com/invalid.path/echo-api-cert.pem",
      "https://s3.amazonaws.com:563/echo.api/echo-api-cert.pem",
      "https://s3.amazonaws.com/echo.api/../invalid.path/echo-api-cert.pem",
      "https://s3.amazonaws.com.evil.example/echo.api/x.pem",
      "https://user@s3.amazonaws.com/echo.api/x.pem",
    ]) expect(isValidCertChainUrl(bad), String(bad)).toBe(false);
  });

  it("rifiuta un URL non valido senza scaricare nulla", async () => {
    const { result, fetched } = await request(envelope(), {}, { SignatureCertChainUrl: "https://evil.example/echo.api/x.pem" });
    expect(result).toEqual({ ok: false, reason: "cert_url_invalid" });
    expect(fetched).toBe(0);
  });

  it("rifiuta un timestamp più vecchio (o più nuovo) di 150 secondi", async () => {
    const old = new Date(NOW.getTime() - 151_000).toISOString();
    expect((await request(envelope({ timestamp: old }))).result).toEqual({ ok: false, reason: "timestamp_invalid" });
    const future = new Date(NOW.getTime() + 151_000).toISOString();
    expect((await request(envelope({ timestamp: future }))).result).toEqual({ ok: false, reason: "timestamp_invalid" });
    const edge = new Date(NOW.getTime() - 149_000).toISOString();
    expect((await request(envelope({ timestamp: edge }))).result.ok).toBe(true);
  });

  it("rifiuta una firma sbagliata o un corpo modificato", async () => {
    const body = envelope();
    const signature = await signBody(body, chain.leaf.keys.privateKey);
    const tampered = body.replace("LaunchRequest", "IntentRequest");
    const { result } = await request(tampered, {}, { "Signature-256": signature });
    expect(result).toEqual({ ok: false, reason: "signature_invalid" });
    // Firmato da un'altra chiave (l'intermedio), non da quella del certificato.
    const other = await signBody(body, chain.mid.keys.privateKey);
    expect((await request(body, {}, { "Signature-256": other })).result).toEqual({ ok: false, reason: "signature_invalid" });
    expect((await request(body, {}, { "Signature-256": "%%%" })).result).toEqual({ ok: false, reason: "signature_invalid" });
  });

  it("rifiuta un applicationId diverso", async () => {
    const { result } = await request(envelope({ appId: "amzn1.ask.skill.other" }));
    expect(result).toEqual({ ok: false, reason: "application_id_mismatch" });
  });

  it("senza ALEXA_SKILL_ID rifiuta tutto", async () => {
    expect((await request(envelope(), { skillId: undefined })).result).toEqual({ ok: false, reason: "skill_id_missing" });
    expect((await request(envelope(), { skillId: "  " })).result).toEqual({ ok: false, reason: "skill_id_missing" });
  });

  it("rifiuta un certificato senza echo-api.amazon.com nel SAN", async () => {
    const wrong = await makeChain(NOW, { dns: ["evil.example.com"] });
    const body = envelope();
    const { result } = await request(body, { fetchCertChain: async () => wrong.chainPem, trustAnchorsPem: [wrong.root.pem] }, { "Signature-256": await signBody(body, wrong.leaf.keys.privateKey) });
    expect(result).toEqual({ ok: false, reason: "cert_invalid" });
  });

  it("rifiuta un certificato scaduto", async () => {
    const expired = await makeChain(NOW, { notAfter: new Date(NOW.getTime() - 1000) });
    const body = envelope();
    const { result } = await request(body, { fetchCertChain: async () => expired.chainPem, trustAnchorsPem: [expired.root.pem] }, { "Signature-256": await signBody(body, expired.leaf.keys.privateKey) });
    expect(result).toEqual({ ok: false, reason: "cert_invalid" });
  });

  it("rifiuta una catena che non arriva a una CA fidata", async () => {
    // Le ancore vere di Amazon non hanno firmato la nostra CA di prova.
    const { result } = await request(envelope(), { trustAnchorsPem: undefined });
    expect(result).toEqual({ ok: false, reason: "cert_invalid" });
  });

  it("rifiuta se il download del certificato fallisce, senza firma o con corpo non JSON", async () => {
    expect((await request(envelope(), { fetchCertChain: async () => { throw new Error("rete"); } })).result).toEqual({ ok: false, reason: "cert_fetch_failed" });
    const headers = new Headers({ SignatureCertChainUrl: CERT_URL });
    expect(await verifyAlexaRequest({ skillId: SKILL_ID, headers, body: envelope(), now: NOW, fetchCertChain: async () => chain.chainPem })).toEqual({ ok: false, reason: "signature_missing" });
    expect((await request("non json")).result).toEqual({ ok: false, reason: "body_invalid" });
  });

  it("tiene il certificato in memoria per URL", async () => {
    let fetched = 0;
    const fetchCertChain = async () => { fetched++; return chain.chainPem; };
    await request(envelope(), { fetchCertChain });
    await request(envelope(), { fetchCertChain });
    expect(fetched).toBe(1);
  });
});

describe("certificati veri di Amazon", () => {
  it("la catena pubblicata di echo-api.amazon.com arriva ad Amazon Root CA 1", async () => {
    // Catena scaricata da s3.amazonaws.com/echo.api/echo-api-cert-12.pem, valida nel 2023.
    const certs = parsePemChain(ECHO_API_CERT_12);
    expect(certs[0].dnsNames).toContain("echo-api.amazon.com");
    const anchors = ALEXA_TRUST_ANCHORS_PEM.flatMap(parsePemChain);
    expect(await chainsToTrustAnchor(certs, anchors, new Date("2023-06-01T00:00:00Z"))).toBe(true);
    // Fuori dalla validità del certificato finale non vale più.
    expect(await chainsToTrustAnchor(certs, anchors, new Date("2024-06-01T00:00:00Z"))).toBe(false);
    // Senza le ancore di Amazon la catena non è fidata.
    expect(await chainsToTrustAnchor(certs, [], new Date("2023-06-01T00:00:00Z"))).toBe(false);
  });
});
