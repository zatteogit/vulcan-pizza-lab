import { beforeAll, describe, expect, it } from "vitest";
import { base64UrlEncode, sha256Hex } from "./crypto";
import { handleAuthRequest, SESSION_COOKIE, type AuthDeps, type AuthStore, type SessionRecord } from "./handler";

/* D-046 / D-047: accesso con Google, ruoli per impronta dell'email, demo. Un
   token «di Google» firmato con una chiave generata qui verifica tutta la
   catena (firma, emittente, destinatario, scadenza, email verificata). */

const CLIENT_ID = "test-client.apps.googleusercontent.com";
const ADMIN = "zatteo@gmail.com";
let keyPair: CryptoKeyPair;
let jwk: JsonWebKey & { kid: string };

beforeAll(async () => {
  keyPair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  jwk = { ...(await crypto.subtle.exportKey("jwk", keyPair.publicKey)), kid: "k1" };
});

async function googleToken(claims: Record<string, unknown>, kid = "k1"): Promise<string> {
  const enc = (o: unknown) => base64UrlEncode(new TextEncoder().encode(JSON.stringify(o)));
  const head = enc({ alg: "RS256", kid, typ: "JWT" });
  const body = enc({
    iss: "https://accounts.google.com",
    aud: CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 600,
    sub: "123",
    email: ADMIN,
    email_verified: true,
    name: "Matteo",
    ...claims,
  });
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyPair.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${base64UrlEncode(new Uint8Array(sig))}`;
}

function memoryStore(): AuthStore & { sessions: Map<string, SessionRecord> } {
  const sessions = new Map<string, SessionRecord>();
  return {
    sessions,
    upsertUser: async () => {},
    createSession: async (s) => void sessions.set(s.tokenHash, s),
    getSession: async (h) => sessions.get(h) ?? null,
    deleteSession: async (h) => void sessions.delete(h),
  };
}

async function deps(store = memoryStore()): Promise<AuthDeps> {
  return {
    store,
    env: { GOOGLE_CLIENT_ID: CLIENT_ID, ADMIN_EMAIL_SHA256: await sha256Hex(ADMIN) },
    fetchJwks: async () => ({ keys: [jwk] }),
  };
}

const post = (path: string, body?: unknown, cookie?: string) =>
  new Request(`https://x${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

function cookieFrom(res: Response): string {
  const set = res.headers.get("set-cookie") ?? "";
  return set.split(";")[0];
}

describe("accesso con Google", () => {
  it("l'email dell'admin diventa admin e /me la riconosce", async () => {
    const d = await deps();
    const res = await handleAuthRequest(post("/api/auth/google", { credential: await googleToken({}) }), d);
    expect(res?.status).toBe(200);
    expect(res?.headers.get("set-cookie")).toMatch(/HttpOnly.*SameSite=Lax.*Secure/);
    const me = await handleAuthRequest(new Request("https://x/api/auth/me", { headers: { cookie: cookieFrom(res!) } }), d);
    expect(await me?.json()).toMatchObject({ role: "admin", email: ADMIN });
  });

  it("un'altra email è un utente normale", async () => {
    const res = await handleAuthRequest(post("/api/auth/google", { credential: await googleToken({ email: "altro@example.com" }) }), await deps());
    expect(await res?.json()).toMatchObject({ role: "user" });
  });

  for (const [why, claims] of [
    ["destinatario sbagliato", { aud: "other" }],
    ["scaduto", { exp: 1 }],
    ["email non verificata", { email_verified: false }],
    ["emittente sbagliato", { iss: "https://evil.example" }],
  ] as const) {
    it(`rifiuta un token con ${why}`, async () => {
      const res = await handleAuthRequest(post("/api/auth/google", { credential: await googleToken(claims) }), await deps());
      expect(res?.status).toBe(401);
    });
  }

  it("rifiuta una firma non di Google", async () => {
    const token = await googleToken({});
    const [h, b] = token.split(".");
    const res = await handleAuthRequest(post("/api/auth/google", { credential: `${h}.${b}.AAAA` }), await deps());
    expect(res?.status).toBe(401);
  });
});

describe("demo e uscita", () => {
  it("la demo è una sessione senza account che scade", async () => {
    const d = await deps();
    const res = await handleAuthRequest(post("/api/auth/demo"), d);
    const data = (await res?.json()) as { role: string; email: string | null; expiresAt: number };
    expect(data.role).toBe("demo");
    expect(data.email).toBeNull();
    expect(data.expiresAt - Date.now()).toBeLessThanOrEqual(4 * 3600 * 1000);
  });

  it("logout cancella la sessione", async () => {
    const store = memoryStore();
    const d = await deps(store);
    const res = await handleAuthRequest(post("/api/auth/demo"), d);
    const cookie = cookieFrom(res!);
    expect(cookie.startsWith(`${SESSION_COOKIE}=`)).toBe(true);
    await handleAuthRequest(post("/api/auth/logout", undefined, cookie), d);
    expect(store.sessions.size).toBe(0);
    const me = await handleAuthRequest(new Request("https://x/api/auth/me", { headers: { cookie } }), d);
    expect(me?.status).toBe(401);
  });

  it("senza Client ID Google l'accesso Google risponde 503 e config lo dice", async () => {
    const d = { ...(await deps()), env: {} };
    const cfg = await handleAuthRequest(new Request("https://x/api/auth/config"), d);
    expect(await cfg?.json()).toEqual({ google: null, demo: true });
    expect((await handleAuthRequest(post("/api/auth/google", { credential: "x" }), d))?.status).toBe(503);
  });
});
