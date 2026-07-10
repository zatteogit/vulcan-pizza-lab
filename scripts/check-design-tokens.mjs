#!/usr/bin/env node
/**
 * Enforcement guard DTCG-ready (F5-6) — vedi docs/design-system-tiers.md.
 *
 * Fallisce (exit 1) se il codice applicativo reintroduce violazioni di tier:
 * colori hardcoded, primitivi Tier 1, famiglie font letterali, rgb(a) colorati,
 * o classi/token composite legacy usati fuori dai componenti T4 (`ds/`).
 *
 * Scope: src/app/**\/*.{ts,tsx}
 *   - escluso lo showcase (`components/design-system/`): documenta i primitivi.
 *   - `theme.css` non è toccato: è la source-of-truth dei token (T1/T2/T3).
 *
 * Uso: `npm run check:tokens`  (o `npm run verify` per tsc + guard).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/app";
const EXCLUDE_SEGMENTS = ["design-system"]; // showcase
const DS_SEGMENT = "components/ds"; // T4: può usare composite/token-componente

/** @typedef {{ id: string, desc: string, severity?: "error"|"warn", excludeDs?: boolean, excludeFiles?: string[], test: (line: string) => string[] | null }} Rule */

/* Tooling/interni esenti dalla regola sul sizing (non flusso utente): la
 * migrazione a IconButton copre solo le schermate dell'app. */
const SIZING_TOOLING_EXEMPT = [
  "dev-tools",
  "engine-test-suite",
  "style-editor-tab",
];

/* Esenti dalla regola sui testi hard-written: tooling/admin e i file che
 * DEFINISCONO le stringhe (CMS, showcase). Il CMS è la source-of-truth i18n. */
const TEXT_EXEMPT = [
  ...SIZING_TOOLING_EXEMPT,
  "feedback-analysis",
  "cms",
  "design-system.tsx",
  "dev.tsx",
  "engine-test-suite",
];

/** @type {Rule[]} */
const RULES = [
  {
    id: "hex-color",
    desc: "Colore hex hardcoded → token semantico (T2/T3) o color-mix",
    test: (l) => l.match(/#[0-9a-fA-F]{3,8}\b/g),
  },
  {
    id: "t1-primitive",
    desc: "Primitivo Tier 1 var(--color-*) → consumare un token T2/T3",
    test: (l) => l.match(/var\(--color-[a-z0-9-]+\)/g),
  },
  {
    id: "font-literal",
    desc: 'Famiglia font letterale → var(--font-sans|-serif|-mono)',
    test: (l) => l.match(/["'](?:DM Sans|Playfair Display|DM Mono)["']/g),
  },
  {
    id: "rgba-nonscrim",
    desc: "rgb(a) colorato hardcoded (scrim 0,0,0 / 255,255,255 esenti) → token + color-mix",
    test: (l) => {
      const m = l.match(/rgba?\([^)]*\)/g);
      if (!m) return null;
      const bad = m.filter(
        (s) =>
          !/rgba?\(\s*0\s*,\s*0\s*,\s*0/.test(s) &&
          !/rgba?\(\s*255\s*,\s*255\s*,\s*255/.test(s),
      );
      return bad.length ? bad : null;
    },
  },
  {
    id: "composite-class-bypass",
    desc: "Classe composite usata fuori da ds/ → usare il componente T4 (Surface/Badge). I token T3 (es. --cta-btn-*) restano consumabili.",
    excludeDs: true,
    test: (l) => l.match(/\b(?:surface-card|surface-glass|badge-base)\b/g),
  },
  {
    id: "offscale-square-size",
    desc: "Dimensione quadrata fuori scala --space (w-7/9/11 = 28/36/44px) → <IconButton> (ds/, per i bottoni-icona) oppure w-8/10/12 (32/40/48px).",
    excludeDs: true,
    excludeFiles: SIZING_TOOLING_EXEMPT,
    test: (l) =>
      l.match(/\b(?:w-7 h-7|w-9 h-9|w-11 h-11|h-7 w-7|h-9 w-9|h-11 w-11)\b/g),
  },
  {
    id: "fixed-px-size",
    desc: "Dimensione fissa in px hardcoded (w-[Npx]/h-[Npx], 8–80px) → scala --space (token) o utility w-N/h-N; per i bottoni-icona usa <IconButton>. (min-/max-/basis di layout esenti; hairline <8px esenti.)",
    excludeDs: true,
    excludeFiles: SIZING_TOOLING_EXEMPT,
    test: (l) => {
      const m = [...l.matchAll(/(?<![-a-zA-Z])[wh]-\[(\d+)px\]/g)];
      const bad = m.filter((x) => {
        const n = Number(x[1]);
        return n >= 8 && n <= 80;
      });
      return bad.length ? bad.map((x) => x[0]) : null;
    },
  },
  {
    id: "tw-raw-palette",
    desc: "Classe palette Tailwind di default (bg-red-500…) → token semantico. La palette è disattivata in @theme: la classe NON compila e fallisce in silenzio.",
    test: (l) =>
      l.match(
        /\b(?:bg|text|placeholder|border|divide|ring-offset|inset-ring|ring|fill|stroke|from|to|via|shadow|outline|decoration|accent|caret)(?:-(?:[trblxyse]|ss|se|es|ee))?-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+(?:\/\d+)?\b/g,
      ),
  },
  {
    id: "arbitrary-font-size",
    desc: "Font-size arbitrario text-[Npx] → scala tipografica (text-2xs, text-xs, …) o composite type-*.",
    excludeFiles: SIZING_TOOLING_EXEMPT,
    test: (l) => l.match(/\btext-\[\d+(?:\.\d+)?px\]/g),
  },
  {
    id: "arbitrary-z",
    desc: "Z-index arbitrario z-[N] → scala nativa (z-10…z-50) o token AF: z-(--z-widget|--z-modal|--z-skiplink).",
    excludeFiles: SIZING_TOOLING_EXEMPT,
    test: (l) => l.match(/\bz-\[\d+\]/g),
  },
  {
    id: "arbitrary-scale",
    desc: "Scale arbitrario scale-[x] → valore bare Tailwind 4 (scale-98, active:scale-95, …).",
    excludeFiles: SIZING_TOOLING_EXEMPT,
    test: (l) => l.match(/\bscale-\[[\d.]+\]/g),
  },
  {
    id: "hardcoded-text",
    desc: "Testo user-facing hardcoded in aria-label/placeholder/title/alt → spostalo nel CMS (cms.*).",
    excludeDs: true,
    excludeFiles: TEXT_EXEMPT,
    test: (l) => {
      const m = [...l.matchAll(/\b(?:aria-label|placeholder|title|alt)="([^"{}]+)"/g)];
      const bad = m
        .map((x) => x[1])
        // naturale = contiene lettere e (uno spazio o una vocale accentata o lunghezza ≥ 6)
        .filter((s) => /[A-Za-zÀ-ÿ]/.test(s) && /\s/.test(s.trim()) && !/^https?:/.test(s))
        .filter((s) => !/^[\s⌘⌥⇧⌃+\->Kk]+$/.test(s));
      return bad.length ? bad : null;
    },
  },
];

/** Rimuove commenti di riga (`// ...`, evitando `https://`) e blocchi inline (`/* ... *\/`). */
function stripComments(line) {
  return line
    .replace(/\/\*.*?\*\//g, "")
    .replace(/([^:]|^)\/\/.*$/, "$1");
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_SEGMENTS.includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const normFile = file.replace(/\\/g, "/");
  const isDs = normFile.includes(DS_SEGMENT);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((raw, i) => {
    const line = stripComments(raw);
    for (const rule of RULES) {
      if (rule.excludeDs && isDs) continue;
      if (rule.excludeFiles?.some((seg) => normFile.includes(seg))) continue;
      const hits = rule.test(line);
      if (hits) {
        violations.push({
          file,
          line: i + 1,
          rule: rule.id,
          severity: rule.severity ?? "error",
          hits: [...new Set(hits)],
        });
      }
    }
  });
}

/* Controllo extra su theme.css: le composite (@layer components) e ogni regola
 * devono usare var(--font-*), mai famiglie letterali. Le DEFINIZIONI dei
 * primitivi font usano `--font-sans: "DM Sans"` (property `--font-*:`, non
 * `font-family:`), quindi non vengono toccate da questo controllo. */
const CSS_FILE = "src/styles/theme.css";
try {
  const cssLines = readFileSync(CSS_FILE, "utf8").split("\n");
  cssLines.forEach((raw, i) => {
    if (/font-family:\s*['"]/.test(raw)) {
      violations.push({
        file: CSS_FILE,
        line: i + 1,
        rule: "css-font-literal",
        severity: "error",
        hits: [raw.trim().slice(0, 60)],
      });
    }
  });
} catch {
  /* theme.css assente: ignora */
}

/* ── Allineamento bidirezionale: token/composite DEFINITI ma mai CONSUMATI ──
 * Il tier system vale nei due sensi: il codice consuma solo token, e il
 * design system non accumula token morti. Un token è "vivo" se compare come
 * var(--x) (in app o in theme.css stesso), come stringa letterale nel codice,
 * o — per i token @theme — come utility Tailwind derivata (bg-primary…).
 * Token in fase di rollout: aggiungerli a STAGED_TOKENS con una scadenza. */
const STAGED_TOKENS = new Set([
  /* es. "--nuovo-token", // in rollout fino a <data/PR> */
  /* Migrazione semantica (lug 2026): consumo rimosso dal markup, in migrazione
     nel CSS per-feature. Rimuovere quando il consumo torna vivo. */
  "--color-secondary",
  /* Scala densità (T2) in rollout: --gap-lg non ha ancora un consumo, arriva
     man mano che i componenti migrano da --space-* a --gap-*. */
  "--gap-lg",
  /* Terzo step della scala densità: lo consumavano i temi rimossi
     (Minimal, Copertina). Resta in staging come parte della scala T2. */
  "--density-spacious",
]);

/* A differenza del guard in avanti, qui lo showcase È incluso: le sue pagine
 * renderizzano davvero i token (swatch, demo glass/dynamics), quindi contano
 * come consumo — escluderle romperebbe /design-system. */
function walkAll(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkAll(full, acc);
    else if (/\.(ts|tsx|css|html)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/* Consumo "vivo" = occorrenza dell'identificatore con confini: `--primary`
 * dentro `var(--primary-foreground)` NON tiene vivo `--primary`. */
const boundaryRe = (id) => new RegExp(`(?<![a-z0-9-])${id}(?![a-z0-9-])`);

/* Guard esplicito (niente try/catch: un errore qui deve fallire il check,
 * non disattivarlo in silenzio). */
if (existsSync(CSS_FILE)) {
  const css = readFileSync(CSS_FILE, "utf8");
  const cssLines = css.split("\n");
  const lineOf = (name, matcher) => {
    const idx = cssLines.findIndex((l) => matcher.test(l));
    return idx === -1 ? 1 : idx + 1;
  };
  /* Le definizioni/consumi si cercano nel CSS senza commenti: un blocco
   * commentato non definisce né tiene vivo nulla. */
  const cssClean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const themeBlock = cssClean.match(/@theme inline \{[\s\S]*?\n\}/)?.[0] ?? "";
  const themeTokens = new Set(
    [...themeBlock.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
  );
  const allSources = [...walkAll("src"), "index.html"]
    .filter((f) => !f.replace(/\\/g, "/").endsWith("theme.css"))
    .map((f) => {
      try {
        return readFileSync(f, "utf8");
      } catch {
        return "";
      }
    })
    .join("\n");

  const tokenDefs = [
    ...new Set([...cssClean.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1])),
  ];
  for (const t of tokenDefs) {
    if (STAGED_TOKENS.has(t)) continue;
    const name = t.slice(2);
    const varRe = new RegExp(`var\\(${t}[\\),]`);
    if (varRe.test(cssClean)) continue; // consumato dentro theme.css
    if (boundaryRe(t).test(allSources)) continue; // var(--x) o stringa letterale
    if (themeTokens.has(t)) {
      /* Token @theme: vivo anche se consumato via utility Tailwind derivata.
       * `--text-2xs--line-height` è un modificatore del token base: segue
       * la sorte di `--text-2xs`, non va contato da solo. */
      if (name.includes("--")) continue;
      let utilRe = null;
      if (name.startsWith("color-")) {
        utilRe = new RegExp(
          `\\b(?:bg|text|placeholder|border|divide|ring-offset|inset-ring|ring|fill|stroke|outline|accent|caret|decoration|from|to|via|shadow)(?:-(?:[trblxyse]|ss|se|es|ee))?-${name.slice(6)}(?![a-z-])`,
        );
      } else if (name.startsWith("radius-")) {
        utilRe = new RegExp(`\\brounded(?:-[trbleyxs]{1,2})?-${name.slice(7)}(?![a-z-])`);
      } else if (name.startsWith("font-")) {
        utilRe = new RegExp(`\\bfont-${name.slice(5)}(?![a-z-])`);
      } else if (name.startsWith("text-")) {
        utilRe = new RegExp(`\\btext-${name.slice(5)}(?![a-z-])`);
      }
      if (utilRe && utilRe.test(allSources)) continue;
    }
    violations.push({
      file: CSS_FILE,
      line: lineOf(t, new RegExp(`^\\s*${t}\\s*:`)),
      rule: "dead-token",
      severity: "error",
      hits: [t],
    });
  }

  const compBlock = cssClean.slice(cssClean.indexOf("@layer components"));
  const compClasses = [
    ...new Set([...compBlock.matchAll(/^\s*\.([a-z][a-z0-9-]+)/gm)].map((m) => m[1])),
  ];
  for (const c of compClasses) {
    if (!boundaryRe(c).test(allSources)) {
      violations.push({
        file: CSS_FILE,
        line: lineOf(c, new RegExp(`^\\s*\\.${c}\\b`)),
        rule: "dead-composite",
        severity: "error",
        hits: [`.${c}`],
      });
    }
  }
}

const errors = violations.filter((v) => v.severity !== "warn");
const warnings = violations.filter((v) => v.severity === "warn");
const EXTRA_DESC = {
  "css-font-literal": "theme.css: famiglia font letterale → usare var(--font-sans|-serif|-mono)",
  "dead-token": "theme.css: token definito ma mai consumato (né var(), né utility @theme) → rimuoverlo o metterlo in STAGED_TOKENS",
  "dead-composite": "theme.css: classe composite @layer components mai usata → rimuoverla",
};

function report(list, stream) {
  const byRule = new Map();
  for (const v of list) {
    if (!byRule.has(v.rule)) byRule.set(v.rule, []);
    byRule.get(v.rule).push(v);
  }
  for (const [ruleId, items] of byRule) {
    const desc = RULES.find((r) => r.id === ruleId)?.desc ?? EXTRA_DESC[ruleId] ?? ruleId;
    stream(`▸ ${ruleId} — ${desc}`);
    for (const v of items) stream(`    ${v.file}:${v.line}  ${v.hits.join("  ")}`);
    stream("");
  }
}

/* Warning (non bloccanti): debito noto, da migrare nel tempo. */
if (warnings.length) {
  console.warn(`⚠ check:tokens — ${warnings.length} warning (non bloccanti):\n`);
  report(warnings, (s) => console.warn(s));
}

if (errors.length === 0) {
  const tail = warnings.length ? ` (${warnings.length} warning, non bloccanti)` : "";
  console.log(`✓ check:tokens — ${files.length} file app + theme.css, 0 violazioni bloccanti${tail}.`);
  process.exit(0);
}

console.error(`✗ check:tokens — ${errors.length} violazioni di tier:\n`);
report(errors, (s) => console.error(s));
console.error(
  "Le composite e i primitivi vanno SOLO in src/styles/theme.css; lo showcase è esente.\nVedi docs/design-system-tiers.md (F5-6).",
);
process.exit(1);
