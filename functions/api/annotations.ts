/* ═══ CLOUDFLARE PAGES FUNCTION — /api/annotations ═══
 *
 * D1-backed store for the AI debug overlay. Both the deployed site and (via
 * VITE_ANNOTATIONS_API) the local dev app talk to this single endpoint, so pins
 * sync across environments without a third-party service.
 *
 * GET    → full registry (array of annotations, tombstones included)
 * POST   → upsert an array of annotations (last-write-wins by id), returns the
 *          canonical registry after the write
 * OPTIONS→ CORS preflight
 *
 * If the `ANNOTATIONS_KEY` env secret is set, every request must send a matching
 * `x-annotations-key` header. It ships in the client bundle so it is a soft gate
 * (stops casual/bot writes to a public URL), not real auth.
 *
 * This file lives under `functions/` and is intentionally outside the app
 * tsconfig `include`, so its Cloudflare-runtime types don't affect `tsc`.
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

interface Env {
  DB: D1Database;
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
  if (!env.ANNOTATIONS_KEY) return true; // open when no key configured
  return request.headers.get("x-annotations-key") === env.ANNOTATIONS_KEY;
}

async function readRegistry(env: Env): Promise<unknown[]> {
  const { results } = await env.DB.prepare("SELECT data FROM annotations").all();
  const rows = results ?? [];
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
  try {
    return json(await readRegistry(env));
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  const { request, env } = context;
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
