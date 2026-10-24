import { base64UrlDecode } from "./crypto";

/* ═══ D-046 — Accesso con Google (ID token di Google Identity Services) ═══
 * Il browser riceve da Google un ID token (JWT firmato RS256); il Worker ne
 * verifica firma, emittente, destinatario (il nostro Client ID), scadenza ed
 * email verificata. Chiavi pubbliche: https://www.googleapis.com/oauth2/v3/certs
 * Riferimento: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token */

export const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

export interface GoogleIdentity {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

interface Jwk extends JsonWebKey {
  kid?: string;
}

export type JwksFetcher = () => Promise<{ keys: Jwk[] }>;

export class TokenError extends Error {}

function decodeJson<T>(part: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(part))) as T;
}

export async function verifyGoogleIdToken(
  token: string,
  clientId: string,
  fetchJwks: JwksFetcher,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<GoogleIdentity> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new TokenError("malformed token");
  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJson<{ alg?: string; kid?: string }>(headerPart);
  if (header.alg !== "RS256" || !header.kid) throw new TokenError("unexpected algorithm");

  const { keys } = await fetchJwks();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new TokenError("unknown signing key");
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlDecode(signaturePart),
    new TextEncoder().encode(`${headerPart}.${payloadPart}`),
  );
  if (!valid) throw new TokenError("bad signature");

  const claims = decodeJson<{
    iss?: string;
    aud?: string;
    exp?: number;
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    picture?: string;
  }>(payloadPart);
  if (!claims.iss || !ISSUERS.has(claims.iss)) throw new TokenError("wrong issuer");
  if (claims.aud !== clientId) throw new TokenError("wrong audience");
  if (!claims.exp || claims.exp < nowSeconds) throw new TokenError("expired");
  if (!claims.sub || !claims.email) throw new TokenError("missing identity");
  if (claims.email_verified !== true && claims.email_verified !== "true") throw new TokenError("email not verified");
  return { sub: claims.sub, email: claims.email, name: claims.name, picture: claims.picture };
}
