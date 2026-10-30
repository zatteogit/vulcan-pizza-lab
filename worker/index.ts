/* ═══ CLOUDFLARE WORKER — SPA + API degli strumenti (solo sviluppo) ═══
 *
 * The production deploy is a Worker with Static Assets (…workers.dev), not
 * Pages, so the API can't live in a `functions/` Pages Function — it must be
 * this Worker script. Everything is served from the built SPA via the
 * `ASSETS` binding (with single-page-application fallback for client routes).
 *
 * Tool APIs (`/api/annotations` for the debug overlay, `/api/config` for the
 * global theme) are OFF unless `TOOLS_API_ENABLED="1"`: in production they
 * answer 404 (audit SEC-1 — they exposed annotations and let anyone change the
 * theme for every visitor). The variable is set ONLY in local development, in
 * `.dev.vars` read by `wrangler dev` (see .env.example); never in
 * wrangler.toml or in the dashboard. The schema lives in schema.sql.
 *
 * D1 is a native binding declared in `wrangler.toml` and deployed atomically by
 * `wrangler deploy` — no dashboard binding UI, no API token.
 *
 * Lives under `worker/`, outside the app tsconfig `include`, so its
 * Cloudflare-runtime types don't affect `tsc`.
 */

import { handleMediaRequest } from "../src/server/media/handler";
import { mediaStore } from "./media-store";
import { handleMcpBody } from "../src/app/agent/mcp-server";
import { fetchAlexaCertChain, handleAlexaRequest } from "../src/server/alexa/handler";
import { handleVoiceRequest } from "../src/server/voice/http";
import { handleAuthRequest, type AuthStore, type SessionRecord } from "../src/server/auth/handler";
import { GOOGLE_JWKS_URL } from "../src/server/auth/google";
import type { Role } from "../src/server/auth/roles";

interface D1Result {
  results?: Record<string, unknown>[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all(): Promise<D1Result>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}
interface Env {
  /** Assente nei Worker delle edizioni (wrangler.toml [env.edition]): niente accesso né strumenti. */
  DB?: D1Database;
  ASSETS: AssetsBinding;
  /** Optional soft write-gate (x-annotations-key), development only. */
  ANNOTATIONS_KEY?: string;
  /** "1" turns the tool APIs on. Local development only (.dev.vars). */
  TOOLS_API_ENABLED?: string;
  /** Comma-separated CORS allowlist for the tool APIs (default: Vite dev server). */
  TOOLS_API_ORIGINS?: string;
  /** P-4: "test" on the vulcan-test Worker (wrangler.toml [env.test]). */
  DEPLOY_ENV?: string;
  /** "1" sui Worker delle edizioni noindex (demo, partner): scripts/deploy-edition.mjs. */
  NOINDEX?: string;
  /** "1" sui Worker di test: senza Cloudflare Access davanti si risponde 403. */
  REQUIRE_ACCESS?: string;
  /** D-046: OAuth Client ID di Google (pubblico, in wrangler.toml [vars]). */
  GOOGLE_CLIENT_ID?: string;
  /** D-046: impronte SHA-256 delle email per ruolo, separate da virgole. */
  ADMIN_EMAIL_SHA256?: string;
  EDITOR_EMAIL_SHA256?: string;
  TESTER_EMAIL_SHA256?: string;
  /** D-061: ID della skill Alexa (amzn1.ask.skill.…). Senza, /alexa rifiuta tutto. */
  ALEXA_SKILL_ID?: string;
}

const TOOL_API_PATHS = new Set(["/api/annotations", "/api/config"]);
const DEFAULT_TOOLS_API_ORIGINS = "http://localhost:5174,http://127.0.0.1:5174";

/**
 * Security headers (audit SEC-2) for every response the Worker generates.
 * Assets served directly by the asset layer get the same set from
 * public/_headers. Only frame-ancestors on purpose: a fuller CSP would need
 * its own review (inline anti-FOUC script, fonts, images).
 */
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "frame-ancestors 'self'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function withSecurityHeaders(headers: Headers): Headers {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return headers;
}

function withHeaders(response: Response): Response {
  const headers = withSecurityHeaders(new Headers(response.headers));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function toolsApiEnabled(env: Env): boolean {
  return env.TOOLS_API_ENABLED === "1";
}

/** CORS only for an allowlisted Origin (no more `*`). Same-origin needs none. */
function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowed = (env.TOOLS_API_ORIGINS ?? DEFAULT_TOOLS_API_ORIGINS)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!origin || !allowed.includes(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-annotations-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  const headers = withSecurityHeaders(
    new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store", ...cors }),
  );
  return new Response(JSON.stringify(body), { status, headers });
}

function notFound(): Response {
  const headers = withSecurityHeaders(
    new Headers({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }),
  );
  return new Response("Not found", { status: 404, headers });
}

function authorized(request: Request, env: Env): boolean {
  if (!env.ANNOTATIONS_KEY) return true;
  return request.headers.get("x-annotations-key") === env.ANNOTATIONS_KEY;
}

async function readRegistry(env: Env): Promise<unknown[]> {
  const { results } = await env.DB.prepare("SELECT data FROM annotations").all();
  const out: unknown[] = [];
  for (const row of results ?? []) {
    try {
      out.push(JSON.parse(String(row.data)));
    } catch {
      // skip corrupt row
    }
  }
  return out;
}

/**
 * Cache policy for the served SPA. Vite emits content-hashed asset names
 * (e.g. /assets/index-BNAyXsMB.js): the name changes whenever the bytes change,
 * so the old name can be cached forever. HTML must NEVER be cached hard — a
 * browser holding a stale index.html keeps requesting old chunk names after a
 * deploy and ends up mixing an old chunk with a new index, which is exactly what
 * makes Safari throw "Importing binding name 'x' is not found" (Chrome tolerates
 * the same stale mix). So: hash-named /assets/* → immutable; everything else,
 * including the single-page-application fallback (which returns HTML), → no-cache.
 *
 * The content-type check matters: a request for a missing /assets/old.js returns
 * the SPA fallback (text/html), and we must NOT stamp that as an immutable asset.
 * The same responses also get SECURITY_HEADERS (frame-ancestors, nosniff,
 * referrer policy).
 */
function withCacheHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const contentType = response.headers.get("content-type") || "";
  const isHashedAsset =
    response.status === 200 &&
    url.pathname.startsWith("/assets/") &&
    !contentType.includes("text/html");

  const headers = withSecurityHeaders(new Headers(response.headers));
  headers.set(
    "Cache-Control",
    isHashedAsset ? "public, max-age=31536000, immutable" : "no-cache, must-revalidate",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleGet(
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> {
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401, cors);
  try {
    return json(await readRegistry(env), 200, cors);
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500, cors);
  }
}

async function handlePost(
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> {
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401, cors);

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400, cors);
  }
  if (!Array.isArray(incoming)) {
    return json({ error: "body must be an array of annotations" }, 400, cors);
  }

  const statements: D1PreparedStatement[] = [];
  for (const anno of incoming) {
    if (!anno || typeof (anno as { id?: unknown }).id !== "string") continue;
    const record = anno as { id: string; updatedAt?: number; deleted?: boolean };
    statements.push(
      env.DB
        .prepare(
          `INSERT INTO annotations (id, data, updated_at, deleted)
           VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT(id) DO UPDATE SET
             data = excluded.data,
             updated_at = excluded.updated_at,
             deleted = excluded.deleted
           WHERE excluded.updated_at >= annotations.updated_at`,
        )
        .bind(
          record.id,
          JSON.stringify(record),
          typeof record.updatedAt === "number" ? record.updatedAt : 0,
          record.deleted ? 1 : 0,
        ),
    );
  }

  try {
    if (statements.length > 0) await env.DB.batch(statements);
    return json(await readRegistry(env), 200, cors);
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500, cors);
  }
}

/** Global theme for every visitor (`config` table, see schema.sql). */
async function handleConfig(
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> {
  if (request.method === "GET") {
    try {
      const { results } = await env.DB.prepare("SELECT value FROM config WHERE key = 'theme'").all();
      const themeValue = results?.[0]?.value ?? "";
      return json({ theme: themeValue }, 200, cors);
    } catch (e) {
      return json({ error: String((e as Error).message) }, 500, cors);
    }
  }
  if (request.method === "POST") {
    if (!authorized(request, env)) return json({ error: "unauthorized" }, 401, cors);
    try {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return json({ error: "invalid JSON body" }, 400, cors);
      }
      const themeValue = body?.theme ?? "";
      await env.DB.prepare("INSERT INTO config (key, value) VALUES ('theme', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(themeValue).run();
      return json({ success: true, theme: themeValue }, 200, cors);
    } catch (e) {
      return json({ error: String((e as Error).message) }, 500, cors);
    }
  }
  return json({ error: "method not allowed" }, 405, cors);
}

/* ═══ D-046 — archivio dell'accesso su D1 (tabelle users e sessions in schema.sql) ═══
 * Eccezione alla regola «niente DDL nel Worker»: le due tabelle dell'accesso
 * si creano da sole alla prima richiesta (IF NOT EXISTS, una volta per
 * istanza), così l'accesso funziona appena pubblicato, senza un passo a mano
 * su D1. Stesso schema di schema.sql. */
const AUTH_SCHEMA = [
  "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT, role TEXT NOT NULL, created_at INTEGER NOT NULL, last_login INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT, role TEXT NOT NULL, email TEXT, name TEXT, expires_at INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)",
];
let authSchemaReady: Promise<unknown> | null = null;

function ensureAuthSchema(db: D1Database): Promise<unknown> {
  authSchemaReady ??= db.batch(AUTH_SCHEMA.map((sql) => db.prepare(sql))).catch((e) => {
    authSchemaReady = null;
    throw e;
  });
  return authSchemaReady;
}

function d1AuthStore(db: D1Database): AuthStore {
  return {
    async upsertUser({ id, email, name, role, now }) {
      await db
        .prepare(
          "INSERT INTO users (id, email, name, role, created_at, last_login) VALUES (?1, ?2, ?3, ?4, ?5, ?5) " +
            "ON CONFLICT(id) DO UPDATE SET email = ?2, name = ?3, role = ?4, last_login = ?5",
        )
        .bind(id, email, name, role, now)
        .run();
    },
    async createSession(s) {
      await db
        .prepare("INSERT INTO sessions (token_hash, user_id, role, email, name, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
        .bind(s.tokenHash, s.userId, s.role, s.email, s.name, s.expiresAt)
        .run();
    },
    async getSession(tokenHash) {
      const { results } = await db.prepare("SELECT * FROM sessions WHERE token_hash = ?1").bind(tokenHash).all();
      const row = results?.[0];
      if (!row) return null;
      return {
        tokenHash: String(row.token_hash),
        userId: row.user_id == null ? null : String(row.user_id),
        role: String(row.role) as Role,
        email: row.email == null ? null : String(row.email),
        name: row.name == null ? null : String(row.name),
        expiresAt: Number(row.expires_at),
      } satisfies SessionRecord;
    },
    async deleteSession(tokenHash) {
      await db.prepare("DELETE FROM sessions WHERE token_hash = ?1").bind(tokenHash).run();
    },
  };
}

/** Chiavi pubbliche di Google, tenute per un'ora nella cache di Cloudflare. */
async function fetchGoogleJwks() {
  const res = await fetch(GOOGLE_JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } } as RequestInit);
  if (!res.ok) throw new Error(`Google JWKS ${res.status}`);
  return (await res.json()) as { keys: (JsonWebKey & { kid?: string })[] };
}

const MCP_CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-protocol-version, mcp-session-id, authorization",
  "Access-Control-Max-Age": "86400",
};

async function handleMcp(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: withSecurityHeaders(new Headers(MCP_CORS)) });
  }
  // Niente flusso SSE dal server: GET non è supportato (specifica MCP, 405).
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: withSecurityHeaders(new Headers({ ...MCP_CORS, Allow: "POST, OPTIONS" })) });
  }
  const { status, json } = handleMcpBody(await request.text());
  const headers = withSecurityHeaders(new Headers({ ...MCP_CORS, "Content-Type": "application/json" }));
  return new Response(json === null ? null : JSON.stringify(json), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Test e demo dei partner sono solo su invito. Cloudflare Access aggiunge
    // Cf-Access-Jwt-Assertion a ogni richiesta che lascia passare: se manca,
    // Access non è (ancora) davanti al Worker e si chiude invece di esporre.
    // È una sicura contro gli errori di configurazione, non l'autenticazione
    // (quella la fa Access): docs/ambienti-ed-edizioni.md.
    if (env.REQUIRE_ACCESS === "1" && !request.headers.get("Cf-Access-Jwt-Assertion")) {
      return new Response("Accesso solo su invito.\n", {
        status: 403,
        headers: withSecurityHeaders(new Headers({
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        })),
      });
    }

    // D-049: server MCP per agenti (Claude, ChatGPT…). Pubblico, senza stato,
    // in sola lettura: motore e glossario, niente dati degli utenti.
    if (url.pathname === "/mcp") return handleMcp(request);

    // D-061: voce. /api/voice per il Comando rapido di Siri (testo semplice),
    // /alexa per la Custom Skill (richieste firmate da Amazon). Entrambe
    // attingono dal server MCP, in sola lettura e senza dati degli utenti.
    if (url.pathname === "/api/voice") return withHeaders(await handleVoiceRequest(request));
    if (url.pathname === "/alexa") {
      return withHeaders(await handleAlexaRequest(request, { skillId: env.ALEXA_SKILL_ID, fetchCertChain: fetchAlexaCertChain }));
    }

    // D-046: accesso e ruoli. Stessa origine dell'app: niente CORS.
    if (url.pathname.startsWith("/api/auth/")) {
      // Edizioni senza D1: l'accesso non esiste, come una rotta mancante.
      if (!env.DB) return notFound();
      await ensureAuthSchema(env.DB);
      const response = await handleAuthRequest(request, {
        store: d1AuthStore(env.DB),
        env,
        fetchJwks: fetchGoogleJwks,
        secureCookies: url.protocol === "https:",
      });
      if (response) {
        const headers = withSecurityHeaders(new Headers(response.headers));
        return new Response(response.body, { status: response.status, headers });
      }
    }

    if (url.pathname.startsWith("/api/media/")) {
      if (!env.DB) return notFound();
      try {
        const response = await handleMediaRequest(request, {
          store: mediaStore(env.DB),
          async actor(original) {
            await ensureAuthSchema(env.DB!);
            const me = await handleAuthRequest(new Request(new URL("/api/auth/me", original.url), { headers: original.headers }), {
              store: d1AuthStore(env.DB!), env, fetchJwks: fetchGoogleJwks,
            });
            return me?.ok ? await me.json() as { role: string } : null;
          },
        });
        return withHeaders(response);
      } catch {
        return json({ error: "Libreria foto momentaneamente non disponibile." }, 503, {});
      }
    }

    if (TOOL_API_PATHS.has(url.pathname)) {
      // Off in production: same answer as a route that does not exist.
      if (!toolsApiEnabled(env) || !env.DB) return notFound();
      const cors = corsHeaders(request, env);
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: withSecurityHeaders(new Headers(cors)) });
      }
      if (url.pathname === "/api/config") return handleConfig(request, env, cors);
      if (request.method === "GET") return handleGet(request, env, cors);
      if (request.method === "POST") return handlePost(request, env, cors);
      return json({ error: "method not allowed" }, 405, cors);
    }

    // Everything else: serve the built SPA (assets + client-route fallback),
    // stamping cache headers so hashed assets are immutable and HTML is never
    // cached stale (see withCacheHeaders).
    const response = withCacheHeaders(request, await env.ASSETS.fetch(request));
    // P-4: the test environment and the noindex editions must never be
    // indexed. There the Worker runs first for every request
    // (run_worker_first), so the header also covers index.html and assets.
    if (env.DEPLOY_ENV === "test" || env.NOINDEX === "1") {
      const headers = new Headers(response.headers);
      headers.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    return response;
  },
};
