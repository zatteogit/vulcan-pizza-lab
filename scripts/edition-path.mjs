/* ═══ Quale edizione costruire (docs/ambienti-ed-edizioni.md) ═══
 * VULCAN_EDITION sceglie l'edizione (predefinita «vulcan», la generalista).
 * Si cerca prima in editions/ (pubbliche), poi in VULCAN_EDITIONS_DIR (il
 * checkout del repository privato dei marchi reali). Lo stesso id in entrambi
 * i posti è un errore: un'edizione privata non deve finire pubblica per sbaglio. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC_EDITIONS_DIR = path.join(root, "editions");

export function privateEditionsDir() {
  const dir = process.env.VULCAN_EDITIONS_DIR;
  return dir ? path.resolve(dir) : null;
}

export function editionId() {
  return process.env.VULCAN_EDITION?.trim() || "vulcan";
}

/** Percorso assoluto del JSON dell'edizione scelta. */
export function resolveEditionFile(id = editionId()) {
  if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(id)) throw new Error(`VULCAN_EDITION non valida: «${id}»`);
  const candidates = [PUBLIC_EDITIONS_DIR, privateEditionsDir()]
    .filter(Boolean)
    .map((dir) => path.join(dir, `${id}.json`))
    .filter((file) => fs.existsSync(file));
  if (candidates.length > 1) throw new Error(`Edizione «${id}» presente sia in editions/ sia in VULCAN_EDITIONS_DIR`);
  if (candidates.length === 0) {
    throw new Error(`Edizione «${id}» non trovata in editions/${privateEditionsDir() ? " né in VULCAN_EDITIONS_DIR" : " (VULCAN_EDITIONS_DIR non impostata)"}`);
  }
  return candidates[0];
}

/** Id di tutte le edizioni disponibili: pubbliche, poi private se il checkout c'è. */
export function listEditions() {
  const ids = (dir) => (dir && fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -5)).sort()
    : []);
  return { public: ids(PUBLIC_EDITIONS_DIR), private: ids(privateEditionsDir()) };
}
