/* ═══ Verifica delle richieste Alexa (obbligatoria per la certificazione) ═══
 * Regole di Amazon per un endpoint HTTPS di una Custom Skill
 * (developer.amazon.com → «Host a custom skill as a web service»):
 * 1. SignatureCertChainUrl: https, host s3.amazonaws.com (maiuscole ammesse),
 *    percorso che inizia con /echo.api/, porta 443 se indicata.
 * 2. La catena PEM scaricata: certificato finale valido adesso, SAN con
 *    echo-api.amazon.com, catena fino a una CA fidata.
 * 3. Signature-256: RSA-SHA256 del corpo grezzo con la chiave del certificato.
 * 4. request.timestamp entro 150 secondi.
 * 5. applicationId uguale all'ID della skill (ALEXA_SKILL_ID); senza ID
 *    configurato si rifiuta tutto.
 * Ogni rifiuto diventa un 400 nel gestore. I certificati verificati restano in
 * memoria per URL finché sono validi. */

import { ALEXA_TRUST_ANCHORS_PEM } from "./trust-anchors";
import { chainsToTrustAnchor, decodeBase64, importPublicKey, parsePemChain, type Certificate } from "./x509";

export const ALEXA_CERT_SAN = "echo-api.amazon.com";
export const ALEXA_MAX_SKEW_MS = 150_000;
const MAX_CERT_BYTES = 64 * 1024;
const CACHE_LIMIT = 16;

export type AlexaVerifyFailure =
  | "skill_id_missing"
  | "cert_url_invalid"
  | "cert_fetch_failed"
  | "cert_invalid"
  | "signature_missing"
  | "signature_invalid"
  | "body_invalid"
  | "timestamp_invalid"
  | "application_id_mismatch";

export type AlexaVerifyResult =
  | { ok: true; envelope: AlexaEnvelope }
  | { ok: false; reason: AlexaVerifyFailure };

/** Le parti della richiesta Alexa che il Worker legge. */
export interface AlexaEnvelope {
  version?: string;
  session?: { new?: boolean; attributes?: Record<string, unknown>; application?: { applicationId?: string } };
  context?: { System?: { application?: { applicationId?: string } } };
  request?: {
    type?: string;
    timestamp?: string;
    locale?: string;
    intent?: { name?: string; slots?: Record<string, AlexaSlot> };
  };
}

export interface AlexaSlot {
  name?: string;
  value?: string;
  resolutions?: { resolutionsPerAuthority?: { status?: { code?: string }; values?: { value?: { name?: string; id?: string } }[] }[] };
}

export interface AlexaVerifyOptions {
  skillId: string | undefined;
  headers: Headers;
  body: string;
  now?: Date;
  /** Scarica la catena PEM (nel Worker: fetch). */
  fetchCertChain: (url: string) => Promise<string>;
  /** Solo per i test: ancore diverse da quelle di Amazon. */
  trustAnchorsPem?: readonly string[];
}

/** Regola 1: l'URL della catena di certificati. */
export function isValidCertChainUrl(raw: string | null): boolean {
  if (!raw) return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  // URL normalizza schema e host in minuscolo e risolve «..» nel percorso.
  if (url.protocol !== "https:") return false;
  if (url.hostname !== "s3.amazonaws.com") return false;
  if (url.port !== "" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  return url.pathname.startsWith("/echo.api/");
}

interface CachedCert {
  leaf: Certificate;
  key: CryptoKey;
}
const certCache = new Map<string, CachedCert>();

/** Per i test: svuota la cache dei certificati. */
export function clearAlexaCertCache(): void {
  certCache.clear();
}

let defaultAnchors: Certificate[] | null = null;
function anchorsFor(pems: readonly string[] | undefined): Certificate[] {
  if (pems) return pems.flatMap(parsePemChain);
  defaultAnchors ??= ALEXA_TRUST_ANCHORS_PEM.flatMap(parsePemChain);
  return defaultAnchors;
}

async function verifiedLeaf(url: string, options: AlexaVerifyOptions, now: Date): Promise<CachedCert | AlexaVerifyFailure> {
  const cached = certCache.get(url);
  if (cached) {
    if (cached.leaf.notBefore <= now && now <= cached.leaf.notAfter) return cached;
    certCache.delete(url);
  }
  let pem: string;
  try {
    pem = await options.fetchCertChain(url);
  } catch {
    return "cert_fetch_failed";
  }
  if (!pem || pem.length > MAX_CERT_BYTES) return "cert_fetch_failed";
  try {
    const chain = parsePemChain(pem);
    const leaf = chain[0];
    if (!leaf) return "cert_invalid";
    if (!leaf.dnsNames.includes(ALEXA_CERT_SAN)) return "cert_invalid";
    if (!(await chainsToTrustAnchor(chain, anchorsFor(options.trustAnchorsPem), now))) return "cert_invalid";
    const entry = { leaf, key: await importPublicKey(leaf, "SHA-256") };
    if (certCache.size >= CACHE_LIMIT) certCache.delete(certCache.keys().next().value!);
    certCache.set(url, entry);
    return entry;
  } catch {
    return "cert_invalid";
  }
}

/** Tutte le regole di Amazon, nell'ordine; il primo errore vince. */
export async function verifyAlexaRequest(options: AlexaVerifyOptions): Promise<AlexaVerifyResult> {
  const now = options.now ?? new Date();
  const skillId = options.skillId?.trim();
  if (!skillId) return { ok: false, reason: "skill_id_missing" };

  const certUrl = options.headers.get("SignatureCertChainUrl");
  if (!isValidCertChainUrl(certUrl)) return { ok: false, reason: "cert_url_invalid" };
  const signatureHeader = options.headers.get("Signature-256");
  if (!signatureHeader) return { ok: false, reason: "signature_missing" };

  const cert = await verifiedLeaf(certUrl!, options, now);
  if (typeof cert === "string") return { ok: false, reason: cert };

  let signature: Uint8Array;
  try {
    signature = decodeBase64(signatureHeader);
  } catch {
    return { ok: false, reason: "signature_invalid" };
  }
  const body = new TextEncoder().encode(options.body);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cert.key, signature, body).catch(() => false);
  if (!valid) return { ok: false, reason: "signature_invalid" };

  let envelope: AlexaEnvelope;
  try {
    envelope = JSON.parse(options.body) as AlexaEnvelope;
  } catch {
    return { ok: false, reason: "body_invalid" };
  }
  if (!envelope || typeof envelope !== "object") return { ok: false, reason: "body_invalid" };

  const timestamp = Date.parse(String(envelope.request?.timestamp ?? ""));
  if (!Number.isFinite(timestamp) || Math.abs(now.getTime() - timestamp) > ALEXA_MAX_SKEW_MS) {
    return { ok: false, reason: "timestamp_invalid" };
  }

  const appId = envelope.context?.System?.application?.applicationId ?? envelope.session?.application?.applicationId;
  if (appId !== skillId) return { ok: false, reason: "application_id_mismatch" };

  return { ok: true, envelope };
}
