#!/usr/bin/env node
/* Pull the debug annotation registry from the GitHub gist into the local
 * `vulcan-debug-registry.json`, merging by id (last-write-wins) so pins created
 * in production land in the file the "risolvi i commenti" workflow reads —
 * without having to open the dev app first.
 *
 * Usage:
 *   VULCAN_GIST_TOKEN=<pat> VULCAN_GIST_ID=<id> npm run debug:pull
 *
 * The token needs only the `gist` scope. Store it outside the repo (shell
 * profile / .env you don't commit).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, "..", "vulcan-debug-registry.json");
const GIST_FILENAME = "vulcan-debug-registry.json";

const token = process.env.VULCAN_GIST_TOKEN;
const gistId = process.env.VULCAN_GIST_ID;

if (!token || !gistId) {
  console.error("✖ Set VULCAN_GIST_TOKEN and VULCAN_GIST_ID env vars first.");
  process.exit(1);
}

function stamp(a) {
  return typeof a?.updatedAt === "number" ? a.updatedAt : 0;
}

function mergeById(...sources) {
  const byId = new Map();
  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const anno of source) {
      if (!anno || typeof anno.id !== "string") continue;
      const existing = byId.get(anno.id);
      if (!existing || stamp(anno) > stamp(existing)) byId.set(anno.id, anno);
    }
  }
  return [...byId.values()];
}

function readLocal() {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

const res = await fetch(`https://api.github.com/gists/${gistId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

if (!res.ok) {
  console.error(`✖ Gist fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const data = await res.json();
const file = data?.files?.[GIST_FILENAME];
if (!file) {
  console.error(`✖ Gist has no ${GIST_FILENAME} file.`);
  process.exit(1);
}

const content = file.truncated && file.raw_url
  ? await (await fetch(file.raw_url)).text()
  : file.content;

let remote;
try {
  remote = JSON.parse(content);
} catch {
  console.error("✖ Gist file is not valid JSON.");
  process.exit(1);
}

const merged = mergeById(readLocal(), remote);
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(merged, null, 2), "utf8");

const live = merged.filter((a) => !a.deleted).length;
console.log(`✔ Pulled ${remote.length} remote entries → ${merged.length} total (${live} live) in vulcan-debug-registry.json`);
