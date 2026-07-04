#!/usr/bin/env node
/* Pull the debug annotation registry from the shared Cloudflare/D1 endpoint into
 * the local `vulcan-debug-registry.json`, merging by id (last-write-wins) so
 * pins created in production land in the file the "risolvi i commenti" workflow
 * reads — without opening the app.
 *
 * Usage:
 *   VULCAN_ANNOTATIONS_API=https://your-project.pages.dev/api/annotations \
 *   [VULCAN_ANNOTATIONS_KEY=<key>] npm run debug:pull
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, "..", "vulcan-debug-registry.json");

const api = process.env.VULCAN_ANNOTATIONS_API;
const key = process.env.VULCAN_ANNOTATIONS_KEY;

if (!api) {
  console.error("✖ Set VULCAN_ANNOTATIONS_API to the deployed /api/annotations URL first.");
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

const res = await fetch(api, {
  headers: key ? { "x-annotations-key": key } : {},
});

if (!res.ok) {
  console.error(`✖ API fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

let remote;
try {
  remote = await res.json();
} catch {
  console.error("✖ Response is not valid JSON.");
  process.exit(1);
}
if (!Array.isArray(remote)) {
  console.error("✖ Response is not an annotations array.");
  process.exit(1);
}

const merged = mergeById(readLocal(), remote);
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(merged, null, 2), "utf8");

const live = merged.filter((a) => !a.deleted).length;
console.log(`✔ Pulled ${remote.length} remote entries → ${merged.length} total (${live} live) in vulcan-debug-registry.json`);
