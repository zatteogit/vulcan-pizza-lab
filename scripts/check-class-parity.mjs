#!/usr/bin/env node
/**
 * Valida l'output di un agente di tokenizzazione PRIMA dell'integrazione
 * in theme.css (piano: docs/piano-tokenizzazione-semantica.md §5.2).
 *
 * Uso: node scripts/check-class-parity.mjs <file.tsx> <blocco.css>
 *
 * Controlli:
 *  1. USATE→DEFINITE (errore): ogni classe nel JSX esiste nel CSS consegnato
 *     o è già definita negli stylesheet del progetto (composite `type-*`,
 *     `page-lead`, …). Un typo di classe passa tsc e senza questo check si
 *     scopre solo alla QA visiva.
 *  2. DEFINITE→USATE (warning): ogni classe nel CSS consegnato è referenziata
 *     nel TSX. Warning e non errore: può essere un modifier costruito
 *     dinamicamente nel JSX.
 *  3. TOKEN (errore): ogni var(--x) consumata nel CSS esiste in src/styles,
 *     è definita nel CSS stesso, è settata dal TSX come custom property,
 *     oppure è un placeholder --TODO-… (elencato come atomo mancante).
 *
 * Exit: 1 su errori, 0 con soli warning/TODO.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , tsxPath, cssPath] = process.argv;
if (!tsxPath || !cssPath) {
  console.error('Uso: node scripts/check-class-parity.mjs <file.tsx> <blocco.css>');
  process.exit(2);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(p, 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, ' ');

// Classi definite in un CSS: estrae i "preludi" (testo fra un delimitatore e
// la `{` successiva); le dichiarazioni non entrano mai nei preludi perché
// `;` e `}` azzerano il buffer. I preludi `@…` (media, keyframes) sono
// scartati, ma le regole al loro interno producono i propri preludi.
function cssClasses(css) {
  const out = new Set();
  let buf = '';
  for (const ch of stripComments(css)) {
    if (ch === '{') {
      const prelude = buf.trim();
      if (!prelude.startsWith('@')) {
        for (const m of prelude.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) out.add(m[1]);
      }
      buf = '';
    } else if (ch === '}' || ch === ';') {
      buf = '';
    } else {
      buf += ch;
    }
  }
  return out;
}

// Classi usate nel TSX: contenuto testuale degli attributi className
// (stringa letterale, espressione con ternari, template literal). Le parti
// dinamiche ${…} sono sostituite da spazio: i frammenti che ne risultano non
// somigliano a una classe e vengono filtrati dal test finale.
function tsxClasses(src) {
  const out = new Set();
  const re = /className\s*=\s*/g;
  let m;
  while ((m = re.exec(src))) {
    const i = re.lastIndex;
    const q = src[i];
    const texts = [];
    if (q === '"' || q === "'") {
      const end = src.indexOf(q, i + 1);
      texts.push(src.slice(i + 1, end === -1 ? src.length : end));
    } else if (q === '{') {
      let depth = 0;
      let j = i;
      for (; j < src.length; j++) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}' && --depth === 0) break;
      }
      const region = src.slice(i + 1, j);
      for (const s of region.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
        texts.push((s[1] ?? s[2] ?? s[3] ?? '').replace(/\$\{[^}]*\}/g, ' '));
      }
    }
    for (const text of texts) {
      for (const tok of text.split(/\s+/)) {
        if (/^-?[A-Za-z_][\w-]*$/.test(tok)) out.add(tok);
      }
    }
  }
  return out;
}

const styleSources = ['theme.css', 'layout.css', 'index.css', 'fonts.css', 'tailwind.css']
  .map((f) => path.join(root, 'src/styles', f))
  .filter(existsSync)
  .map(read)
  .join('\n');

const tsxSrc = read(tsxPath);
const agentCss = read(cssPath);

const used = tsxClasses(tsxSrc);
const defined = cssClasses(agentCss);
const known = cssClasses(styleSources);

const errors = [];
const warnings = [];
const todos = new Set();

// Un blocco può esistere solo come hook strutturale senza regole proprie,
// purché almeno un suo __element o --modifier sia definito.
const hasStyledChild = (cls) =>
  [...defined, ...known].some((d) => d.startsWith(`${cls}__`) || d.startsWith(`${cls}--`));

for (const cls of [...used].sort()) {
  if (!defined.has(cls) && !known.has(cls) && !hasStyledChild(cls)) {
    errors.push(`classe usata nel TSX ma non definita da nessuna parte: .${cls}`);
  }
}

for (const cls of [...defined].sort()) {
  if (!tsxSrc.includes(cls)) {
    warnings.push(`classe definita nel CSS ma mai referenziata nel TSX: .${cls}`);
  }
}

for (const m of agentCss.matchAll(/var\(\s*(--[\w-]+)/g)) {
  const v = m[1];
  if (v.startsWith('--TODO-')) {
    todos.add(v);
    continue;
  }
  const declaredIn = (src) => new RegExp(`${v}\\s*:`).test(src);
  if (!declaredIn(styleSources) && !declaredIn(agentCss) && !tsxSrc.includes(v)) {
    errors.push(`token inesistente: var(${v}) — non dichiarato in src/styles, nel CSS consegnato, né settato dal TSX`);
  }
}

const rel = (p) => path.relative(root, path.resolve(p));
console.log(`parity ${rel(tsxPath)} ⇄ ${rel(cssPath)}`);
console.log(`  classi TSX: ${used.size} · classi CSS: ${defined.size} · già note: ${known.size}`);

if (todos.size) {
  console.log(`\n▸ ATOMI MANCANTI attesi (placeholder da risolvere in T1/T2 prima dell'integrazione):`);
  for (const t of [...todos].sort()) console.log(`    ${t}`);
}
if (warnings.length) {
  console.log(`\n▸ Warning (${warnings.length}):`);
  for (const w of warnings) console.log(`    ${w}`);
}
if (errors.length) {
  console.log(`\n✖ Errori (${errors.length}):`);
  for (const e of errors) console.log(`    ${e}`);
  process.exit(1);
}
console.log(`\n✔ Parity OK${warnings.length ? ' (con warning)' : ''}${todos.size ? ` — ${todos.size} atomi da creare` : ''}`);
