import type { Annotation } from "./annotation-types";

/* ═══ REMOTE SYNC — CLOUDFLARE PAGES FUNCTION + D1 ═══
 *
 * The overlay talks to a single `/api/annotations` endpoint backed by D1 (see
 * `functions/api/annotations.ts`). Production hits it same-origin; local dev
 * points at the deployed URL via `VITE_ANNOTATIONS_API`, so both environments
 * share one store. localStorage stays as an instant/offline cache on top.
 */

const API_BASE = (import.meta.env.VITE_ANNOTATIONS_API as string | undefined) || "/api/annotations";
const API_KEY = (import.meta.env.VITE_ANNOTATIONS_KEY as string | undefined) || "";

/**
 * Whether a remote is reachable. Always true in production (same-origin
 * function); in dev only when an absolute URL is configured, since the Vite dev
 * server does not serve the function itself.
 */
export function isRemoteConfigured(): boolean {
  if (import.meta.env.VITE_ANNOTATIONS_API) return true;
  return !import.meta.env.DEV;
}

function headers(withBody: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  if (withBody) h["Content-Type"] = "application/json";
  if (API_KEY) h["x-annotations-key"] = API_KEY;
  return h;
}

/** Fetch the full registry (tombstones included). Null on any failure. */
export async function fetchRemote(): Promise<Annotation[] | null> {
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
 */
export async function pushRemote(list: Annotation[]): Promise<Annotation[] | null> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(list),
      keepalive: true, // let the request survive a page unload (flush-on-close)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
