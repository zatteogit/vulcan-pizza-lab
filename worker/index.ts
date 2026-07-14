/* ═══ CLOUDFLARE WORKER — SPA + /api/annotations ═══
 *
 * The production deploy is a Worker with Static Assets (…workers.dev), not
 * Pages, so the API can't live in a `functions/` Pages Function — it must be
 * this Worker script. Requests to `/api/annotations` are handled here against
 * the D1 binding `DB`; everything else is served from the built SPA via the
 * `ASSETS` binding (with single-page-application fallback for client routes).
 *
 * D1 is a native binding declared in `wrangler.toml` and deployed atomically by
 * `wrangler deploy` — no dashboard binding UI, no API token.
 *
 * Lives under `worker/`, outside the app tsconfig `include`, so its
 * Cloudflare-runtime types don't affect `tsc`.
 */

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
  DB: D1Database;
  ASSETS: AssetsBinding;
  ANNOTATIONS_KEY?: string;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-annotations-key",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
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
 */
function withCacheHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const contentType = response.headers.get("content-type") || "";
  const isHashedAsset =
    response.status === 200 &&
    url.pathname.startsWith("/assets/") &&
    !contentType.includes("text/html");

  const headers = new Headers(response.headers);
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

async function handleGet(request: Request, env: Env): Promise<Response> {
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);
  try {
    return json(await readRegistry(env));
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (!Array.isArray(incoming)) {
    return json({ error: "body must be an array of annotations" }, 400);
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
    return json(await readRegistry(env));
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/config") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
      if (request.method === "GET") {
        try {
          await env.DB.prepare("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL)").run();
          const { results } = await env.DB.prepare("SELECT value FROM config WHERE key = 'theme'").all();
          const themeValue = results?.[0]?.value ?? "";
          return json({ theme: themeValue });
        } catch (e) {
          return json({ error: String((e as Error).message) }, 500);
        }
      }
      if (request.method === "POST") {
        if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);
        try {
          let body: any;
          try {
            body = await request.json();
          } catch {
            return json({ error: "invalid JSON body" }, 400);
          }
          const themeValue = body?.theme ?? "";
          await env.DB.prepare("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL)").run();
          await env.DB.prepare("INSERT INTO config (key, value) VALUES ('theme', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(themeValue).run();
          return json({ success: true, theme: themeValue });
        } catch (e) {
          return json({ error: String((e as Error).message) }, 500);
        }
      }
      return json({ error: "method not allowed" }, 405);
    }

    if (url.pathname === "/api/annotations") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
      if (request.method === "GET") return handleGet(request, env);
      if (request.method === "POST") return handlePost(request, env);
      return json({ error: "method not allowed" }, 405);
    }

    // Everything else: serve the built SPA (assets + client-route fallback),
    // stamping cache headers so hashed assets are immutable and HTML is never
    // cached stale (see withCacheHeaders).
    return withCacheHeaders(request, await env.ASSETS.fetch(request));
  },
};
