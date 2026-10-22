#!/usr/bin/env node
/* Rigenera le immagini servite dall'app a partire dagli originali.
 *
 * Gli originali (PNG/JPG ~1536×1024, 2–3 MB l'uno) stanno in
 * `design-assets/originali/`, FUORI da `src/`: nessun modulo li importa e Vite
 * non li mette nel bundle. L'app importa soltanto i WebP generati qui.
 *
 * Uscite, per ogni originale `design-assets/originali/<dir>/<nome>.<png|jpg>`:
 *   - foto (pizzas, signatures, toppings, toppings/variants):
 *       src/assets/<dir>/<nome>.webp      lato lungo orizzontale ≤ 1280 px
 *       src/assets/<dir>/<nome>-640.webp  640 px di larghezza (card, miniature)
 *     più la voce in `src/assets/responsive-images.json` (dimensioni + variante
 *     piccola), letta da `components/media/responsive-images.ts` per srcset,
 *     sizes, width e height.
 *   - illustrazioni con trasparenza (timeline): un solo WebP alla misura
 *     originale (256 px), canale alfa a qualità piena.
 *   - poster dei video: `public/videos/posters/<nome>.webp`, primo fotogramma
 *     di `public/videos/<nome>.mp4` (il video non viene ricompresso).
 *
 * Mai ingrandimenti: un originale più stretto di 1280 px resta alla sua misura.
 *
 * Requisiti: ImageMagick con supporto WebP (`magick` v7 o `convert` v6;
 * su macOS `brew install imagemagick`) e, solo per i poster, ffmpeg con
 * libwebp (`brew install ffmpeg`).
 *
 * Uso:
 *   node scripts/optimize-images.mjs                  # tutto
 *   node scripts/optimize-images.mjs --only=verace    # solo i file che contengono "verace"
 *   node scripts/optimize-images.mjs --quality=85     # qualità foto diversa (default 80)
 *   node scripts/optimize-images.mjs --no-posters     # salta i poster video
 */
import { execFile, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGINALS = join(ROOT, "design-assets/originali");
const ASSETS = join(ROOT, "src/assets");
const MANIFEST = join(ASSETS, "responsive-images.json");
const VIDEOS = join(ROOT, "public/videos");
const POSTERS = join(VIDEOS, "posters");

const LARGE_WIDTH = 1280;
const SMALL_WIDTH = 640;

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const only = typeof args.get("only") === "string" ? args.get("only") : null;
const photoQuality = Number(args.get("quality") ?? 80);
const withPosters = !args.has("no-posters");

/* Profili per cartella. Le illustrazioni della timeline hanno trasparenza vera
 * e sono già piccole: niente ridimensionamento, alfa a qualità 100. */
const PROFILES = {
  photo: { quality: photoQuality, sizes: [LARGE_WIDTH, SMALL_WIDTH] },
  illustration: { quality: 82, sizes: [null] },
};
const profileFor = (rel) => (rel.startsWith("timeline/") ? PROFILES.illustration : PROFILES.photo);

function findImageMagick() {
  for (const cmd of [["magick"], ["convert"]]) {
    try {
      execFileSync(cmd[0], ["-version"], { stdio: "ignore" });
      const identify = cmd[0] === "magick" ? ["magick", "identify"] : ["identify"];
      return { convert: cmd, identify };
    } catch {
      /* prova il successivo */
    }
  }
  console.error("✖ ImageMagick non trovato (servono `magick` o `convert` con supporto WebP).");
  process.exit(1);
}
const IM = findImageMagick();

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

async function dimensions(file) {
  const [cmd, ...pre] = IM.identify;
  const { stdout } = await run(cmd, [...pre, "-format", "%w %h", file]);
  const [width, height] = stdout.trim().split(/\s+/).map(Number);
  return { width, height };
}

async function encode(input, output, { width, quality, alpha }) {
  const [cmd, ...pre] = IM.convert;
  const ops = [input, "-auto-orient", "-strip"];
  /* `1280x>`: riduce solo se più largo, mai ingrandimenti. */
  if (width) ops.push("-filter", "Lanczos", "-resize", `${width}x>`);
  ops.push(
    "-quality", String(quality),
    "-define", "webp:method=6",
    "-define", "webp:use-sharp-yuv=true",
  );
  if (alpha) ops.push("-define", "webp:alpha-quality=100");
  mkdirSync(dirname(output), { recursive: true });
  await run(cmd, [...pre, ...ops, output]);
}

async function pool(items, limit, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (queue.length) await fn(queue.shift());
  });
  await Promise.all(workers);
}

const originals = walk(ORIGINALS)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .map((f) => relative(ORIGINALS, f).split("\\").join("/"))
  .sort();

let inBytes = 0;
let outBytes = 0;
let encoded = 0;

await pool(
  originals.filter((rel) => !only || rel.includes(only)),
  cpus().length,
  async (rel) => {
    const profile = profileFor(rel);
    const input = join(ORIGINALS, rel);
    const stem = rel.slice(0, -extname(rel).length);
    inBytes += statSync(input).size;
    for (const width of profile.sizes) {
      const suffix = width === SMALL_WIDTH ? `-${SMALL_WIDTH}` : "";
      const output = join(ASSETS, `${stem}${suffix}.webp`);
      await encode(input, output, {
        width,
        quality: profile.quality,
        alpha: profile === PROFILES.illustration,
      });
      outBytes += statSync(output).size;
      encoded++;
    }
  },
);

/* Manifest delle foto responsive: sempre ricostruito da TUTTI gli originali,
 * così `--only` non ne perde le voci. Chiavi ordinate → diff stabili. */
const manifest = {};
for (const rel of originals) {
  if (profileFor(rel) !== PROFILES.photo) continue;
  const stem = rel.slice(0, -extname(rel).length);
  const large = `${stem}.webp`;
  const small = `${stem}-${SMALL_WIDTH}.webp`;
  if (!existsSync(join(ASSETS, large)) || !existsSync(join(ASSETS, small))) {
    console.error(`✖ Mancano i WebP di ${rel}: rilancia senza --only.`);
    process.exit(1);
  }
  const l = await dimensions(join(ASSETS, large));
  const s = await dimensions(join(ASSETS, small));
  manifest[large] = { width: l.width, height: l.height, small, smallWidth: s.width, smallHeight: s.height };
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

let posters = 0;
if (withPosters && existsSync(VIDEOS)) {
  if (!hasFfmpeg()) {
    console.warn("⚠ ffmpeg non trovato: poster video non rigenerati.");
  } else {
    mkdirSync(POSTERS, { recursive: true });
    for (const video of readdirSync(VIDEOS).filter((f) => f.endsWith(".mp4")).sort()) {
      if (only && !video.includes(only)) continue;
      const output = join(POSTERS, `${basename(video, ".mp4")}.webp`);
      /* Primo fotogramma: coincide con l'avvio della riproduzione, niente salti. */
      execFileSync("ffmpeg", [
        "-v", "error", "-y", "-i", join(VIDEOS, video),
        "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", "-compression_level", "6",
        output,
      ]);
      posters++;
    }
  }
}

const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
console.log(
  `✓ ${encoded} WebP da ${only ? "originali filtrati" : `${originals.length} originali`}` +
    ` (${mb(inBytes)} → ${mb(outBytes)}), manifest con ${Object.keys(manifest).length} foto` +
    `${posters ? `, ${posters} poster video` : ""}.`,
);
