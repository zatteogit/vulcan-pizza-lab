import { newSessionToken, normalizeEmail, sha256Hex } from "./crypto";
import { TokenError, verifyGoogleIdToken, type GoogleIdentity, type JwksFetcher } from "./google";
import { roleForEmail, type Role, type RoleConfig } from "./roles";

/* ═══ D-046 / D-047 — Accesso e ruoli ═══
 *
 * Rotte sotto /api/auth (servite dal Worker):
 *   GET  /api/auth/config   quali accessi sono attivi (Client ID di Google)
 *   POST /api/auth/google   { credential } → sessione (cookie HttpOnly)
 *   POST /api/auth/demo     sessione demo di 4 ore, senza account
 *   GET  /api/auth/me       chi sei (o 401)
 *   POST /api/auth/logout   chiude la sessione
 * In archivio vanno solo l'impronta del token e i dati minimi dell'utente.
 * Il ruolo si ricalcola a ogni accesso: togliere un'email dalla
 * configurazione basta a revocarlo.
 */

export const SESSION_COOKIE = "vulcan_session";
const USER_SESSION_SECONDS = 30 * 24 * 3600;
const DEMO_SESSION_SECONDS = 4 * 3600;

export interface SessionRecord {
  tokenHash: string;
  userId: string | null;
  role: Role;
  email: string | null;
  name: string | null;
  expiresAt: number;
}

export interface AuthStore {
  upsertUser(user: { id: string; email: string; name: string | null; role: Role; now: number }): Promise<void>;
  createSession(session: SessionRecord): Promise<void>;
  getSession(tokenHash: string): Promise<SessionRecord | null>;
  deleteSession(tokenHash: string): Promise<void>;
}

export interface AuthEnv extends RoleConfig {
  GOOGLE_CLIENT_ID?: string;
}

export interface AuthDeps {
  store: AuthStore;
  env: AuthEnv;
  fetchJwks: JwksFetcher;
  now?: () => number;
  /** false solo in sviluppo su http://localhost (il cookie Secure non passerebbe). */
  secureCookies?: boolean;
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=") || null;
  }
  return null;
}

function sessionCookie(token: string, maxAge: number, secure: boolean): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

function publicSession(session: SessionRecord) {
  return {
    role: session.role,
    email: session.email,
    name: session.name,
    expiresAt: session.expiresAt,
  };
}

async function startSession(
  deps: AuthDeps,
  data: Omit<SessionRecord, "tokenHash" | "expiresAt">,
  seconds: number,
): Promise<Response> {
  const now = (deps.now ?? Date.now)();
  const token = newSessionToken();
  const record: SessionRecord = { ...data, tokenHash: await sha256Hex(token), expiresAt: now + seconds * 1000 };
  await deps.store.createSession(record);
  return json(publicSession(record), 200, {
    "Set-Cookie": sessionCookie(token, seconds, deps.secureCookies !== false),
  });
}

async function currentSession(request: Request, deps: AuthDeps): Promise<SessionRecord | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const session = await deps.store.getSession(await sha256Hex(token));
  if (!session) return null;
  if (session.expiresAt < (deps.now ?? Date.now)()) {
    await deps.store.deleteSession(session.tokenHash);
    return null;
  }
  return session;
}

/** Risposta per le rotte /api/auth/*, o null se il percorso non è suo. */
export async function handleAuthRequest(request: Request, deps: AuthDeps): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/auth/")) return null;
  const route = pathname.slice("/api/auth/".length);

  if (route === "config" && request.method === "GET") {
    return json({ google: deps.env.GOOGLE_CLIENT_ID ? { clientId: deps.env.GOOGLE_CLIENT_ID } : null, demo: true });
  }

  if (route === "me" && request.method === "GET") {
    const session = await currentSession(request, deps);
    return session ? json(publicSession(session)) : json({ error: "not signed in" }, 401);
  }

  if (route === "logout" && request.method === "POST") {
    const token = readCookie(request, SESSION_COOKIE);
    if (token) await deps.store.deleteSession(await sha256Hex(token));
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0, deps.secureCookies !== false) });
  }

  if (route === "demo" && request.method === "POST") {
    return startSession(deps, { userId: null, role: "demo", email: null, name: null }, DEMO_SESSION_SECONDS);
  }

  if (route === "google" && request.method === "POST") {
    const clientId = deps.env.GOOGLE_CLIENT_ID;
    if (!clientId) return json({ error: "google sign-in not configured" }, 503);
    let credential = "";
    try {
      credential = String(((await request.json()) as { credential?: unknown }).credential ?? "");
    } catch {
      return json({ error: "invalid JSON body" }, 400);
    }
    let identity: GoogleIdentity;
    try {
      identity = await verifyGoogleIdToken(credential, clientId, deps.fetchJwks);
    } catch (e) {
      if (e instanceof TokenError) return json({ error: `invalid credential: ${e.message}` }, 401);
      throw e;
    }
    const email = normalizeEmail(identity.email);
    const role = await roleForEmail(email, deps.env);
    const userId = `google:${identity.sub}`;
    const now = (deps.now ?? Date.now)();
    await deps.store.upsertUser({ id: userId, email, name: identity.name ?? null, role, now });
    return startSession(deps, { userId, role, email, name: identity.name ?? null }, USER_SESSION_SECONDS);
  }

  return json({ error: "not found" }, 404);
}
