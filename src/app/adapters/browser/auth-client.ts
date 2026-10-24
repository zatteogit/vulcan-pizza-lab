/* ═══ D-046 / D-047 — Client dell'accesso (rotte /api/auth del Worker) ═══
 * La sessione vive in un cookie HttpOnly: il browser non vede il token, chiede
 * solo «chi sono» a /api/auth/me. La demo (D-047) usa tutta l'app ma alla fine
 * non lascia nulla: all'inizio si fotografano i dati locali dell'app, alla
 * chiusura si ripristinano com'erano. */

export type Role = "admin" | "editor" | "tester" | "user" | "demo";

export interface AuthSession {
  role: Role;
  email: string | null;
  name: string | null;
  expiresAt: number;
}

export interface AuthConfig {
  google: { clientId: string } | null;
  demo: boolean;
}

const APP_KEY_PREFIX = "vulcan";
const DEMO_SNAPSHOT_KEY = "vulcan-demo-snapshot";

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, { credentials: "same-origin", ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const fetchAuthConfig = () => request<AuthConfig>("/api/auth/config");
export const fetchSession = () => request<AuthSession>("/api/auth/me");

export function signInWithGoogle(credential: string) {
  return request<AuthSession>("/api/auth/google", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ credential }),
  });
}

function appKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(APP_KEY_PREFIX) && key !== DEMO_SNAPSHOT_KEY) keys.push(key);
  }
  return keys;
}

export async function startDemo(): Promise<AuthSession | null> {
  const session = await request<AuthSession>("/api/auth/demo", { method: "POST" });
  if (!session) return null;
  try {
    const snapshot = Object.fromEntries(appKeys().map((key) => [key, localStorage.getItem(key)]));
    sessionStorage.setItem(DEMO_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage bloccato: la demo funziona, ma non c'è nulla da ripristinare */
  }
  return session;
}

/** Riporta i dati locali a com'erano prima della demo. */
function restoreDemoSnapshot() {
  try {
    const raw = sessionStorage.getItem(DEMO_SNAPSHOT_KEY);
    if (raw === null) return;
    const snapshot = JSON.parse(raw) as Record<string, string | null>;
    for (const key of appKeys()) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(snapshot)) if (value !== null) localStorage.setItem(key, value);
    sessionStorage.removeItem(DEMO_SNAPSHOT_KEY);
  } catch {
    /* niente da ripristinare */
  }
}

export async function signOut(session: AuthSession | null): Promise<void> {
  await request("/api/auth/logout", { method: "POST" });
  if (session?.role === "demo") restoreDemoSnapshot();
}
