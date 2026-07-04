import type { Annotation } from "./annotation-types";

/* ═══ GITHUB GIST SYNC ═══
 *
 * Optional cross-device persistence. The dev-server file endpoint only exists
 * under `npm run dev`, and sessionStorage/localStorage never leaves the
 * device — so pins created in production (e.g. from a phone) can't reach the
 * local `vulcan-debug-registry.json` that the "risolvi i commenti" workflow
 * reads. A secret gist bridges that gap: the overlay reads/writes it from any
 * environment, and locally `npm run debug:pull` folds it back into the file.
 *
 * The token is a fine-grained PAT with the `gist` scope ONLY, stored in
 * localStorage. That is an acceptable exposure for a personal project: the
 * worst a leaked token can do is edit the user's gists. It is never bundled or
 * committed — the user pastes it once into the overlay's settings panel.
 */

const CONFIG_KEY = "vulcan_debug_gist_config";
const GIST_FILENAME = "vulcan-debug-registry.json";

export interface GistConfig {
  token: string;
  gistId: string;
}

export function loadGistConfig(): GistConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.token === "string" && typeof parsed.gistId === "string") {
      return parsed;
    }
  } catch {}
  return null;
}

export function saveGistConfig(config: GistConfig | null): void {
  try {
    if (config) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(CONFIG_KEY);
    }
  } catch {}
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** Read the registry stored in the gist. Returns null if unset/unreachable. */
export async function fetchGistRegistry(config: GistConfig): Promise<Annotation[] | null> {
  try {
    const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      headers: authHeaders(config.token),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const file = data?.files?.[GIST_FILENAME];
    if (!file) return null;
    // Gists over ~1MB come back truncated with a raw_url to fetch in full.
    const content = file.truncated && file.raw_url
      ? await (await fetch(file.raw_url)).text()
      : file.content;
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Overwrite the gist's registry file. Returns true on success. */
export async function pushGistRegistry(config: GistConfig, list: Annotation[]): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      method: "PATCH",
      headers: { ...authHeaders(config.token), "Content-Type": "application/json" },
      body: JSON.stringify({
        files: { [GIST_FILENAME]: { content: JSON.stringify(list, null, 2) } },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Create a fresh secret gist seeded with `list` and return its id, so a new
 * user can bootstrap sync with only a token.
 */
export async function createGist(token: string, list: Annotation[]): Promise<string | null> {
  try {
    const res = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Vulcan AI Debug registry",
        public: false,
        files: { [GIST_FILENAME]: { content: JSON.stringify(list, null, 2) } },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}
