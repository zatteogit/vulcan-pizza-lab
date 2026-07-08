#!/usr/bin/env node
/**
 * Perfezione dei tier — nessun valore hard-written nel layer CSS che CONSUMA.
 *
 * Le dimensioni (spazi, raggi, font-size, tracking, leading, border-width) sono
 * token DTCG `dimension` (design-system-tiers.md §2.2): nel CSS che consuma
 * (`theme.css @layer components`, `layout.css`) ogni valore dimensionale deve
 * essere `var(--token)`, MAI un literal `px|rem|em`. I primitivi T1 (raw values)
 * vivono SOLO in `:root`/`.dark`/`@theme` di theme.css e non sono scansionati qui.
 *
 * Eccezioni ammesse (design-system-tiers.md §2.5 + pragmatiche):
 *   · `0` (unitless);
 *   · percentuali `N%` e `color-mix(...)` (le tinte calcolate restano CSS);
 *   · valori dentro `var(...)` (sono già token);
 *   · `1px`/`0.5px` hairline SOLO in `border`/`outline`/`box-shadow` (spessori;
 *     idealmente `--border-width-thin`, ma tollerati come hairline).
 *
 * Modello a CRICCHETTO come check:semantics: baseline in
 * scripts/css-tokens-baseline.json, il conteggio può solo scendere.
 * Uso: node scripts/check-css-tokens.mjs [--update|--list]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const BASELINE_PATH = "scripts/css-tokens-baseline.json";

/** Estrae il corpo di `@layer components { … }` bilanciando le graffe (non
 *  greedy: si ferma alla SUA chiusura, non all'ultima del file). */
function extractLayer(css) {
  const start = css.indexOf("@layer components {");
  if (start === -1) return "";
  let depth = 0,
    i = css.indexOf("{", start);
  const bodyStart = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(bodyStart, i);
    }
  }
  return css.slice(bodyStart);
}

/** Estrae SOLO le regioni "consumanti" da scansionare. */
function consumingCss() {
  const out = [];
  const theme = readFileSync("src/styles/theme.css", "utf8");
  out.push(["theme.css @layer components", extractLayer(theme)]);
  if (existsSync("src/styles/layout.css")) {
    out.push(["layout.css", readFileSync("src/styles/layout.css", "utf8")]);
  }
  return out;
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Conta i literal dimensionali hard-written in un blocco CSS. */
function countHard(css) {
  const clean = stripComments(css);
  const lines = clean.split("\n");
  let n = 0;
  const hits = [];
  for (const raw of lines) {
    const line = raw;
    // Esenti: definizioni di primitivo/token (`--x: …`) e breakpoint @media.
    if (/^\s*--[\w-]+\s*:/.test(line)) continue;
    if (/@media|@container/.test(line)) continue;
    // literal px/rem/em non-zero, non preceduti da lettera (evita parole)
    const dims = [...line.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(px|rem|em)\b/g)];
    for (const d of dims) {
      const val = d[1] + d[2];
      if (parseFloat(d[1]) === 0) continue; // 0px/0rem
      // hairline 1px/0.5px in border/outline/box-shadow → tollerato
      const isHairline =
        (d[2] === "px" && parseFloat(d[1]) <= 1) &&
        /\b(border|outline|box-shadow|text-shadow)\b/.test(line);
      if (isHairline) continue;
      n++;
      hits.push(`${line.trim().slice(0, 80)}  ⟶  ${val}`);
    }
  }
  return { n, hits };
}

const mode = process.argv[2];
const current = {};
const allHits = {};
for (const [name, css] of consumingCss()) {
  const { n, hits } = countHard(css);
  current[name] = n;
  allHits[name] = hits;
}
const total = Object.values(current).reduce((a, b) => a + b, 0);

if (mode === "--list") {
  for (const [name, hits] of Object.entries(allHits)) {
    console.log(`\n▸ ${name} — ${hits.length} hard-written:`);
    for (const h of hits) console.log(`    ${h}`);
  }
  console.log(`\nTotale: ${total} valori dimensionali hard-written.`);
  process.exit(0);
}

if (mode === "--update") {
  writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + "\n");
  console.log(`✓ Baseline CSS-token aggiornato: ${total} hard-written (cricchetto parte da qui).`);
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(`✗ check:css-tokens — baseline mancante. Genera con --update.`);
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const regressions = [];
for (const [name, n] of Object.entries(current)) {
  const allowed = baseline[name] ?? 0;
  if (n > allowed) regressions.push({ name, allowed, found: n });
}
if (regressions.length === 0) {
  console.log(`✓ check:css-tokens — nessun NUOVO valore hard-written. Debito: ${total} (può solo scendere).`);
  process.exit(0);
}
console.error(`✗ check:css-tokens — valori dimensionali hard-written nuovi:\n`);
for (const r of regressions) console.error(`    ${r.name}: baseline ${r.allowed} → ${r.found} (+${r.found - r.allowed})`);
console.error(`\nOgni dimensione dev'essere un token (--space/--radius/--font-size/--tracking/--leading). Se l'atomo manca, crealo in T1.`);
process.exit(1);
