/* ═══ CLOUDFLARE PAGES FUNCTION — /api/annotations ═══
 *
 * D1-backed store for the AI debug overlay. Both the deployed site and (via
 * VITE_ANNOTATIONS_API) the local dev app talk to this single endpoint, so pins
 * sync across environments without a third-party service.
 *
 * Talks to D1 over its **REST API** (not a runtime binding): the flaky
 * dashboard "D1 bindings" UI is bypassed entirely. All it needs is a Cloudflare
 * API token with D1 edit permission, stored server-side as the Pages secret
 * `D1_API_TOKEN`. Account and database ids are non-secret and default to the
 * project's values below (override with env vars if they ever change).
 *
 * GET    → full registry (array of annotations, tombstones included)
 * POST   → upsert an array of annotations (last-write-wins by id), returns the
 *          canonical registry after the write
 * OPTIONS→ CORS preflight
 *
 * If the `ANNOTATIONS_KEY` env is set, every request must send a matching
 * `x-annotations-key` header (soft gate for a public URL, not real auth).
 *
 * Lives under `functions/` — intentionally outside the app tsconfig `include`,
 * so its Cloudflare-runtime types don't affect `tsc`.
 */

const DEFAULT_ACCOUNT_ID = "ea8b6efff9e61cb1427a489488354518";
const DEFAULT_DATABASE_ID = "471d2a9d-1a54-418e-849c-479b85cbd979";

interface Env {
  D1_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  CF_DATABASE_ID?: string;
  ANNOTATIONS_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
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

/** Run one parameterized statement against D1's REST API; returns result rows. */
async function d1Query(env: Env, sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  const accountId = env.CF_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
  const databaseId = env.CF_DATABASE_ID || DEFAULT_DATABASE_ID;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.D1_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );
  const data = (await res.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { results?: Record<string, unknown>[] }[];
  };
  if (!res.ok || !data.success) {
    const msg = data.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`;
    throw new Error(`D1 query failed: ${msg}`);
  }
  return data.result?.[0]?.results ?? [];
}

async function readRegistry(env: Env): Promise<unknown[]> {
  const rows = await d1Query(env, "SELECT data FROM annotations");
  const out: unknown[] = [];
  for (const row of rows) {
    try {
      out.push(JSON.parse(String(row.data)));
    } catch {
      // skip corrupt row
    }
  }
  return out;
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const { request, env } = context;
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);
  if (!env.D1_API_TOKEN) return json({ error: "D1_API_TOKEN secret not set" }, 500);
  try {
    return json(await readRegistry(env));
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  const { request, env } = context;
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);
  if (!env.D1_API_TOKEN) return json({ error: "D1_API_TOKEN secret not set" }, 500);

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (!Array.isArray(incoming)) {
    return json({ error: "body must be an array of annotations" }, 400);
  }

  const upsertSql = `INSERT INTO annotations (id, data, updated_at, deleted)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(id) DO UPDATE SET
       data = excluded.data,
       updated_at = excluded.updated_at,
       deleted = excluded.deleted
     WHERE excluded.updated_at >= annotations.updated_at`;

  try {
    // Sequential to avoid write contention; the registry is small (a few pins).
    for (const anno of incoming) {
      if (!anno || typeof (anno as { id?: unknown }).id !== "string") continue;
      const record = anno as { id: string; updatedAt?: number; deleted?: boolean };
      await d1Query(env, upsertSql, [
        record.id,
        JSON.stringify(record),
        typeof record.updatedAt === "number" ? record.updatedAt : 0,
        record.deleted ? 1 : 0,
      ]);
    }
    return json(await readRegistry(env));
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
}
