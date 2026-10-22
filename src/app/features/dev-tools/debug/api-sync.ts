import type { Annotation } from "./annotation-types";

/* ═══ REMOTE SYNC — CLOUDFLARE WORKER + D1 (development only) ═══
 *
 * The overlay talks to a single `/api/annotations` endpoint backed by D1 (see
 * `worker/index.ts`). That API is OFF in production (it answers 404, audit
 * SEC-1) and production builds never call it. In local dev, point
 * `VITE_ANNOTATIONS_API` at a `wrangler dev` Worker started with
 * `TOOLS_API_ENABLED="1"` (see .env.example). localStorage stays as an
 * instant/offline cache on top.
 */

const API_BASE = (import.meta.env.VITE_ANNOTATIONS_API as string | undefined) || "/api/annotations";
/* Never inlined in a production bundle. */
const API_KEY = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_ANNOTATIONS_KEY as string | undefined) || "";

/**
 * Whether a remote is reachable: never in production builds; in dev only when
 * an absolute URL is configured, since the Vite dev server does not serve the
 * Worker API itself.
 */
export function isRemoteConfigured(): boolean {
  if (import.meta.env.PROD) return false;
  return Boolean(import.meta.env.VITE_ANNOTATIONS_API);
}

function headers(withBody: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  if (withBody) h["Content-Type"] = "application/json";
  if (API_KEY) h["x-annotations-key"] = API_KEY;
  return h;
}

/** Fetch the full registry (tombstones included). Null on any failure. */
export async function fetchRemote(): Promise<Annotation[] | null> {
  if (!isRemoteConfigured()) return null;
  try {
    const res = await fetch(API_BASE, { headers: headers(false) });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/**
 * Upsert annotations. The endpoint applies last-write-wins by id and returns the
 * canonical registry after the write, which callers fold back in.
 *
 * `keepalive` lets a request outlive a page unload, but the browser caps the
 * *total* body of all in-flight keepalive requests at 64 KiB — a full registry
 * (rich `outerHTML` / `drawingDataURL` context) silently blows past that and the
 * POST is rejected with a swallowed TypeError, so the write vanishes. Opt in
 * ONLY for the unload flush; the debounced hot path uses a normal fetch, which
 * has no such size limit.
 */
export async function pushRemote(
  list: Annotation[],
  opts: { keepalive?: boolean } = {},
): Promise<Annotation[] | null> {
  if (!isRemoteConfigured()) return null;
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(list),
      keepalive: opts.keepalive ?? false,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
