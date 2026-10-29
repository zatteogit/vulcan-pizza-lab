/* ═══ D-061 — rigenera il modello d'interazione della skill Alexa ═══
 * Uso: npx tsx scripts/build-alexa-model.ts
 * Scrive alexa/skill-package/interactionModels/custom/it-IT.json dagli stili,
 * dal glossario e dal catalogo voce (src/server/alexa/interaction-model.ts).
 * Da rilanciare quando cambiano stili, sinonimi o frasi d'esempio: il test
 * src/server/alexa/interaction-model.test.ts fallisce se il file è vecchio.
 * Il motore importa le immagini dei condimenti: come per il Worker
 * (build-worker.mjs) si impacchetta prima con esbuild, immagini vuote. */
import { build } from "esbuild";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveEditionFile } from "./edition-path.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "alexa/skill-package/interactionModels/custom/it-IT.json");
const EMPTY = [".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".avif", ".mp4", ".webm", ".csv"];

const dir = mkdtempSync(join(tmpdir(), "alexa-model-"));
try {
  const bundle = join(dir, "model.mjs");
  await build({
    entryPoints: [join(ROOT, "src/server/alexa/interaction-model.ts")],
    outfile: bundle,
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    alias: { "@vulcan/edition": resolveEditionFile() },
    loader: Object.fromEntries(EMPTY.map((ext) => [ext, "empty"])),
    logLevel: "warning",
  });
  const { buildInteractionModel } = await import(pathToFileURL(bundle).href);
  writeFileSync(OUT, `${JSON.stringify(buildInteractionModel("it"), null, 2)}\n`);
  console.log(`✓ ${OUT}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
