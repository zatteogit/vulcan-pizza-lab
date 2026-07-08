#!/usr/bin/env node
/**
 * Controllo a maglie strette — presentazione FUORI dal markup.
 *
 * Vieta di far CRESCERE il debito di:
 *   · inline-style   → `style={...}` nel JSX (blocca la temizzabilità: gli
 *                      stili inline battono il CSS e non si agganciano a
 *                      [data-theme]/[data-region]). La presentazione va nei
 *                      token (theme.css) o nel presentation layer (layout.css).
 *   · bare-wrapper   → `<div>` / `<span>` senza attributi = wrapper non
 *                      semantico. Usa un elemento semantico o un `data-region`.
 *
 * Modello a CRICCHETTO: il debito legacy è fotografato in
 * scripts/semantics-baseline.json. La build FALLISCE se un file supera il suo
 * baseline (o se un file nuovo introduce violazioni). Il conteggio può solo
 * scendere — "non ne voglio più vedere di nuovi".
 *
 * Uso:
 *   node scripts/check-semantics.mjs           # verifica (usato da `verify`)
 *   node scripts/check-semantics.mjs --update  # rigenera il baseline
 *   node scripts/check-semantics.mjs --list    # elenca il debito per file
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src/app";
const BASELINE_PATH = "scripts/semantics-baseline.json";

/* Tooling/showcase esente (come check:tokens): non è flusso utente e per
 * natura mostra/valori demo. Il resto dell'app è soggetto al cricchetto. */
const EXEMPT_SEGMENTS = ["design-system", "dev-tools", "cms.tsx", "cms-context"];

const METRICS = {
  "inline-style": {
    desc:
      "style={{…}} inline → classe semantica (theme.css @layer components). " +
      "Esenti: oggetti di SOLE custom property (style={{ [\"--x\" as any]: v }}, " +
      "il pattern legale per i valori runtime) e style={espressione} non-literal " +
      "(prop di dominio o MotionValue: non è CSS scritto nel markup).",
    count(src) {
      let n = 0;
      for (const m of src.matchAll(/style=\{\{([\s\S]*?)\}\}/g)) {
        const body = m[1];
        const hasPlainKey = /(^|,)\s*[A-Za-z_$][\w$]*\s*:/.test(body);
        const hasCustomProp = /\[?\s*["']--/.test(body);
        if (hasCustomProp && !hasPlainKey) continue; // solo custom property → legale
        n++;
      }
      return n;
    },
  },
  "bare-wrapper": {
    desc: "<div>/<span> senza attributi → elemento semantico o data-region",
    re: /<(?:div|span)>/g,
  },
  "markup-presentation": {
    desc:
      "vocabolario di presentazione nel markup (font/colore/ombra/valore arbitrario) " +
      "→ classe semantica. Il markup dice COSA, il CSS decide COME.",
    // Font voice, italic/weight, and any arbitrary visual utility/property.
    re: /\bfont-(?:serif|sans|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b|\b(?:not-)?italic\b|\b(?:text|bg|border|shadow|fill|stroke|decoration|ring|outline|from|via|to)-\[|\[(?:color|background|background-color|border-color|box-shadow|text-shadow|font-family|font-weight|font-size|letter-spacing|line-height|opacity|text-decoration):/g,
  },
};

/** Rimuove solo i commenti (le stringhe restano: le classi di presentazione
 *  vivono dentro className="…", vanno lette). Evita di toccare `://` (URL). */
function sanitize(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".tsx")) acc.push(full);
  }
  return acc;
}

function isExempt(normPath) {
  return EXEMPT_SEGMENTS.some((seg) => normPath.includes(seg));
}

/** Conteggio corrente per file: { "rel/path": { "inline-style": n, "bare-wrapper": m } } */
function scan() {
  const counts = {};
  for (const file of walk(ROOT)) {
    const norm = file.replace(/\\/g, "/");
    if (isExempt(norm)) continue;
    const src = sanitize(readFileSync(file, "utf8"));
    const rel = relative(".", file).replace(/\\/g, "/");
    for (const [id, { re, count }] of Object.entries(METRICS)) {
      const n = count ? count(src) : (src.match(re) || []).length;
      if (n > 0) {
        counts[rel] ??= {};
        counts[rel][id] = n;
      }
    }
  }
  return counts;
}

function total(counts, metric) {
  return Object.values(counts).reduce((s, m) => s + (m[metric] || 0), 0);
}

const mode = process.argv[2];
const current = scan();

if (mode === "--update") {
  const sorted = Object.fromEntries(
    Object.keys(current).sort().map((k) => [k, current[k]]),
  );
  writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + "\n");
  const t1 = total(current, "inline-style");
  const t2 = total(current, "bare-wrapper");
  console.log(
    `✓ Baseline aggiornato (${BASELINE_PATH}): ${Object.keys(current).length} file — ` +
      `${t1} inline-style, ${total(current,"markup-presentation")} presentazione, ${t2} bare-wrapper. Il cricchetto parte da qui.`,
  );
  process.exit(0);
}

if (mode === "--list") {
  for (const [file, m] of Object.entries(current).sort()) {
    console.log(`${file}  ${JSON.stringify(m)}`);
  }
  console.log(
    `\nTotale: ${total(current,"inline-style")} inline-style, ${total(current,"markup-presentation")} presentazione, ${total(current,"bare-wrapper")} bare-wrapper in ${Object.keys(current).length} file.`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(
    `✗ check:semantics — baseline mancante. Genera con:\n  node scripts/check-semantics.mjs --update`,
  );
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const violations = [];

for (const [file, m] of Object.entries(current)) {
  const base = baseline[file] || {};
  for (const [id, n] of Object.entries(m)) {
    const allowed = base[id] || 0;
    if (n > allowed) {
      violations.push({ file, id, allowed, found: n, delta: n - allowed });
    }
  }
}

/* Un file che PRIMA aveva debito e ora è stato ripulito NON deve essere
 * ripristinato nel baseline manualmente: al prossimo --update scende. Ma se
 * un file sale, fallisce subito qui. */
if (violations.length === 0) {
  const t1 = total(current, "inline-style");
  const t2 = total(current, "markup-presentation");
  const t3 = total(current, "bare-wrapper");
  console.log(
    `✓ check:semantics — nessuna NUOVA violazione. Debito residuo (cricchetto): ` +
      `${t1} inline-style, ${t2} presentazione, ${t3} bare-wrapper. Può solo scendere.`,
  );
  process.exit(0);
}

console.error(
  `✗ check:semantics — ${violations.length} regressioni (presentazione nel markup):\n`,
);
const byMetric = new Map();
for (const v of violations) {
  if (!byMetric.has(v.id)) byMetric.set(v.id, []);
  byMetric.get(v.id).push(v);
}
for (const [id, items] of byMetric) {
  console.error(`▸ ${id} — ${METRICS[id].desc}`);
  for (const v of items) {
    console.error(`    ${v.file}  baseline ${v.allowed} → ${v.found} (+${v.delta})`);
  }
  console.error("");
}
console.error(
  "La presentazione va nei token (theme.css) o nel presentation layer\n" +
    "(layout.css, agganciato a data-region). Se è debito legittimo spostato\n" +
    "tra file, rigenera il baseline: node scripts/check-semantics.mjs --update",
);
process.exit(1);
