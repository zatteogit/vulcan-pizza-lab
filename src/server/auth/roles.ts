import { normalizeEmail, sha256Hex } from "./crypto";

/* ═══ D-046 — Ruoli ═══
 * admin, editor, tester: per email verificata. Il repository è pubblico, quindi
 * le email non compaiono in chiaro: la configurazione del Worker ha solo le
 * impronte SHA-256 delle email normalizzate (ADMIN_EMAIL_SHA256 ecc., elenchi
 * separati da virgole). demo: sessione di prova senza account (D-047). user:
 * chiunque altro abbia fatto l'accesso. */

export type Role = "admin" | "editor" | "tester" | "user" | "demo";

export interface RoleConfig {
  ADMIN_EMAIL_SHA256?: string;
  EDITOR_EMAIL_SHA256?: string;
  TESTER_EMAIL_SHA256?: string;
}

function hashes(list: string | undefined): Set<string> {
  return new Set((list ?? "").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean));
}

export async function roleForEmail(email: string, config: RoleConfig): Promise<Role> {
  const hash = await sha256Hex(normalizeEmail(email));
  if (hashes(config.ADMIN_EMAIL_SHA256).has(hash)) return "admin";
  if (hashes(config.EDITOR_EMAIL_SHA256).has(hash)) return "editor";
  if (hashes(config.TESTER_EMAIL_SHA256).has(hash)) return "tester";
  return "user";
}
