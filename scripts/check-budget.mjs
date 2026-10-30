#!/usr/bin/env node
import { createHash } from "node:crypto";
/* ═══ P-5 — budget di prestazioni sulla build (dist/) ═══
 * Misure del 24/10/2026 e motivi in docs/budget-prestazioni.md. I limiti sono
 * un cricchetto: si abbassano quando si migliora, non si alzano per far
 * passare lavoro nuovo (stessa regola dei baseline dei guard).
 * Uso: npm run build && npm run check:budget */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "dist";
const KB = 1024;
const MB = 1024 * 1024;

const BUDGET = {
  /** Chunk JS più grande, gzip. Oggi 75 kB (vendor-react); i bundle lingua crescono con i condimenti tradotti. */
  maxJsChunkGz: 100 * KB,
  /** JS senza i cataloghi delle lingue, gzip. Il 29/10/2026 485 kB (D-059). */
  jsWithoutLocalesGz: 500 * KB,
  /** JS che scarica al massimo un utente: codice + la lingua più pesante
   *  (i cataloghi si caricano solo per la lingua attiva). Il 29/10/2026 572 kB. */
  jsPerUserGz: 600 * KB,
  /** Foglio di stile unico, gzip. Oggi 60 kB. */
  cssGz: 75 * KB,
  /** Singolo video. P-5c (D-034): clip da 8 s a 480p; oggi il più grande è
   *  0,65 MB (napoletana_stg.mp4). */
  maxVideo: 1 * MB,
  /** Tutti i video. Oggi 2,6 MB (erano 48,6). */
  totalVideo: 3 * MB,
  /** Tutte le immagini (WebP + originali fuori bundle esclusi). Oggi 40,4 MB. */
  totalImages: 42 * MB,
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

let files;
try {
  files = walk(DIST).filter((file) => !file.endsWith(".map"));
} catch {
  console.error("check:budget — dist/ mancante: esegui prima npm run build.");
  process.exit(1);
}

const gz = (file) => gzipSync(readFileSync(file)).length;
/* Chunk caricati solo dalle pagine del CMS (oggi l'archivio foto, /cms/foto):
   nessun percorso pubblico li richiede, come il CSS del CMS qui sotto. Si
   misurano a parte; un chunk nuovo del CMS va aggiunto qui, non ai limiti. */
const CMS_ONLY_JS = /\/photo-library-[^/]+\.js$/;
const cmsJs = files.filter((f) => CMS_ONLY_JS.test(f));
const js = files.filter((f) => f.endsWith(".js") && !cmsJs.includes(f)).map((f) => ({ f, size: gz(f) }));
const cmsCss = files.filter((f) => /photo-library-[^/]+\.css$/.test(f));
const css = files.filter((f) => f.endsWith(".css") && !cmsCss.includes(f)).map((f) => ({ f, size: gz(f) }));
const videos = files.filter((f) => /\.(mp4|webm|mov)$/i.test(f)).map((f) => ({ f, size: statSync(f).size }));
const archiveImages = files.filter((f) => f.includes("/media/photos/"));
// Count the largest selectable responsive version per CMS slot. Immutable
// historical copies do not all download in one public experience.
const mediaCatalog = JSON.parse(readFileSync("public/media/catalog.json", "utf8"));
const fallbackHashes = new Set(mediaCatalog.versions.filter(v => v.label === "Precedente")
  .flatMap(v => [v.src, v.smallSrc]).map(url => basename(url, ".webp")));
const images = files.filter(f => !archiveImages.includes(f) && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(f))
  .filter(f => !fallbackHashes.has(createHash("sha256").update(readFileSync(f)).digest("hex")))
  .map(f => ({ f, size: statSync(f).size }));
for (const slot of Object.keys(mediaCatalog.active)) {
  const largest = Math.max(...mediaCatalog.versions.filter(v => v.slot === slot)
    .map(v => [...new Set([v.src, v.smallSrc])].reduce((n, url) => n + statSync(join(DIST, url)).size, 0)));
  images.push({ f: `CMS:${slot}`, size: largest });
}
// Cataloghi caricati solo per la lingua attiva (features/cms/locales/<lingua>.ts):
// un utente ne scarica uno, quindi non si sommano tra loro.
const LOCALES = readdirSync("src/app/features/cms/locales")
  .map((name) => name.match(/^([a-z]{2})\.ts$/)?.[1])
  .filter(Boolean);
const isLocale = (f) => LOCALES.some((code) => basename(f).startsWith(`${code}-`));
const code = js.filter((item) => !isLocale(item.f));
const locales = js.filter((item) => isLocale(item.f));
const sum = (list) => list.reduce((total, item) => total + item.size, 0);
const max = (list) => list.reduce((best, item) => (item.size > best.size ? item : best), { f: "—", size: 0 });
/* Una lingua può avere più chunk (catalogo e condimenti, D-065): un utente li
   scarica tutti, quindi per lingua si sommano. */
const byLanguage = LOCALES.map((code) => {
  const chunks = locales.filter((item) => basename(item.f).startsWith(`${code}-`));
  return { f: `${code}: ${chunks.map((item) => basename(item.f)).join(" + ")}`, size: sum(chunks) };
});

const fmt = (bytes) => (bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${(bytes / KB).toFixed(1)} kB`);
const checks = [
  ["JS, chunk più grande (gzip)", max(js).size, BUDGET.maxJsChunkGz, max(js).f],
  ["JS senza lingue (gzip)", sum(code), BUDGET.jsWithoutLocalesGz, `${code.length} chunk`],
  ["JS per utente, con la lingua più pesante (gzip)", sum(code) + max(byLanguage).size, BUDGET.jsPerUserGz, max(byLanguage).f],
  ["CSS (gzip)", sum(css), BUDGET.cssGz, `${css.length} file`],
  ["Video, il più grande", max(videos).size, BUDGET.maxVideo, max(videos).f],
  ["Video, totale", sum(videos), BUDGET.totalVideo, `${videos.length} file`],
  ["Immagini, totale", sum(images), BUDGET.totalImages, `${images.length} file`],
];

let failed = 0;
console.log(`· JS emesso in tutto, tutte le lingue (gzip): ${(sum(js) / KB).toFixed(1)} kB in ${js.length} chunk (solo informazione)`);
for (const [label, value, limit, detail] of checks) {
  const ok = value <= limit;
  if (!ok) failed += 1;
  console.log(`${ok ? "✓" : "✗"} ${label}: ${fmt(value)} / ${fmt(limit)} (${detail})`);
}
if (failed) {
  console.error(`✗ ${failed} budget superati: vedi docs/budget-prestazioni.md`);
  process.exit(1);
}
console.log("✓ budget di prestazioni rispettati");

console.log(`CMS photo archive (loaded on demand): ${(sum(archiveImages.map(f => ({ size: statSync(f).size }))) / MB).toFixed(1)} MB; product image budget unchanged.`);

console.log(`CMS-only JS, lazy: ${sum(cmsJs.map(f => ({ size: gz(f) })))} bytes gzip (not requested by public journeys).`);

console.log(`CMS-only CSS, lazy: ${sum(cmsCss.map(f => ({ size: gz(f) })))} bytes gzip (not requested by public journeys).`);
