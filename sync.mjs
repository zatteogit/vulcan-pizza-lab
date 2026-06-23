#!/usr/bin/env node

/**
 * Vulcan Pizza Lab — Sync CLI
 *
 * Script per sincronizzare il progetto tra Vulcan Cloud e l'ambiente locale.
 * Richiede Node.js 18+ (per clipboard, fs/promises, structuredClone).
 *
 * Comandi:
 *   node sync.mjs scan                  — Mostra tutti i file con hash
 *   node sync.mjs export                — Bundle JSON → stdout (pipe a pbcopy/xclip o > file)
 *   node sync.mjs export bundle.json    — Bundle JSON → file
 *   node sync.mjs import                — Legge bundle da stdin (pipe da pbpaste/xclip)
 *   node sync.mjs import bundle.json    — Legge bundle da file → scrive i file locali
 *   node sync.mjs diff                  — Confronta locale vs ultimo bundle salvato (.sync-snapshot.json)
 *   node sync.mjs diff bundle.json      — Confronta locale vs bundle specifico
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/* ═══ CONFIG ═══ */
const PROJECT_ROOT = process.cwd();
const SNAPSHOT_FILE = path.join(PROJECT_ROOT, ".sync-snapshot.json");

/** Directories and patterns to include */
const INCLUDE_DIRS = [
  "src/app",
  "src/styles",
  "src/imports",
  "src/main.tsx",
];

/** Files in project root to include */
const ROOT_FILES = [
  "vite.config.ts",
  "tsconfig.json",
  "index.html",
  "postcss.config.mjs",
  "package.json",
];

/** Patterns to exclude */
const EXCLUDE_PATTERNS = [
  "node_modules/",
  "dist/",
  ".git/",
];

/* ═══ COLORS (ANSI) ═══ */
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

/* ═══ HASH ═══ */
function hashContent(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex").slice(0, 16);
}

/** Simple djb2 hash matching the browser version */
function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/* ═══ FILE DISCOVERY ═══ */
function isExcluded(filePath) {
  const rel = path.relative(PROJECT_ROOT, filePath);
  return EXCLUDE_PATTERNS.some((p) => rel.startsWith(p) || rel.includes("/" + p));
}

async function findFiles(dir) {
  const results = [];
  const absDir = path.resolve(PROJECT_ROOT, dir);

  try {
    const stat = await fs.stat(absDir);
    if (stat.isFile()) {
      if (!isExcluded(absDir)) results.push(absDir);
      return results;
    }
  } catch {
    return results;
  }

  async function walk(d) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (isExcluded(full)) continue;
      if (entry.isDirectory()) {
        await walk(full);
      } else if (
        entry.isFile() &&
        /\.(tsx?|css|mjs|json|html)$/.test(entry.name)
      ) {
        results.push(full);
      }
    }
  }

  await walk(absDir);
  return results;
}

async function getAllFiles() {
  const allPaths = [];

  // Directories
  for (const dir of INCLUDE_DIRS) {
    const files = await findFiles(dir);
    allPaths.push(...files);
  }

  // Root files
  for (const f of ROOT_FILES) {
    const full = path.resolve(PROJECT_ROOT, f);
    try {
      await fs.access(full);
      allPaths.push(full);
    } catch {
      /* file doesn't exist, skip */
    }
  }

  // Deduplicate and sort
  const unique = [...new Set(allPaths)].sort();

  // Load contents
  const files = {};
  for (const absPath of unique) {
    const rel = "/" + path.relative(PROJECT_ROOT, absPath);
    const content = await fs.readFile(absPath, "utf8");
    files[rel] = {
      content,
      hash: djb2(content),
      lines: content.split("\n").length,
    };
  }

  return files;
}

/* ═══ BUILD BUNDLE ═══ */
function buildBundle(files, source = "local") {
  const bundleFiles = {};
  for (const [p, data] of Object.entries(files)) {
    bundleFiles[p] = {
      hash: data.hash,
      lines: data.lines,
      content: data.content,
    };
  }

  return {
    vulcan_sync: "1.0",
    timestamp: new Date().toISOString(),
    source,
    files: bundleFiles,
    manifest: {
      total_files: Object.keys(bundleFiles).length,
      excluded: EXCLUDE_PATTERNS,
    },
  };
}

/* ═══ COMMANDS ═══ */

/** scan — show all tracked files */
async function cmdScan() {
  console.log(`\n${c.bold}${c.cyan}Vulcan Pizza Lab — File Scanner${c.reset}\n`);

  const files = await getAllFiles();
  const entries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));

  let totalLines = 0;
  let totalBytes = 0;

  for (const [filePath, data] of entries) {
    totalLines += data.lines;
    totalBytes += data.content.length;

    const ext = path.extname(filePath);
    const color =
      ext === ".tsx"
        ? c.blue
        : ext === ".ts"
          ? c.cyan
          : ext === ".css"
            ? c.magenta
            : c.gray;

    console.log(
      `  ${color}${filePath}${c.reset}  ${c.dim}${data.lines}L${c.reset}  ${c.gray}${data.hash}${c.reset}`
    );
  }

  console.log(
    `\n${c.bold}${entries.length}${c.reset} file  ·  ${c.bold}${totalLines.toLocaleString()}${c.reset} righe  ·  ${c.bold}${(totalBytes / 1024).toFixed(0)}${c.reset} KB\n`
  );
}

/** export — generate bundle */
async function cmdExport(outputFile) {
  const files = await getAllFiles();
  const bundle = buildBundle(files, "local");
  const json = JSON.stringify(bundle, null, 2);

  if (outputFile) {
    const outPath = path.resolve(PROJECT_ROOT, outputFile);
    await fs.writeFile(outPath, json, "utf8");
    console.log(
      `\n${c.green}✓${c.reset} Bundle esportato in ${c.bold}${outputFile}${c.reset} (${(json.length / 1024).toFixed(0)} KB, ${bundle.manifest.total_files} file)\n`
    );

    // Save snapshot
    await fs.writeFile(SNAPSHOT_FILE, json, "utf8");
  } else {
    // Output to stdout (user can pipe to clipboard or file)
    process.stdout.write(json);

    // Save snapshot
    await fs.writeFile(SNAPSHOT_FILE, json, "utf8");

    // Info to stderr so it doesn't mix with the JSON
    process.stderr.write(
      `\n${c.green}✓${c.reset} Bundle (${(json.length / 1024).toFixed(0)} KB, ${bundle.manifest.total_files} file) scritto su stdout\n`
    );
    process.stderr.write(
      `${c.dim}Tip: node sync.mjs export | pbcopy     (macOS)${c.reset}\n`
    );
    process.stderr.write(
      `${c.dim}     node sync.mjs export | xclip -sel c  (Linux)${c.reset}\n`
    );
    process.stderr.write(
      `${c.dim}     node sync.mjs export | clip          (Windows)${c.reset}\n\n`
    );
  }
}

/** import — apply bundle to local files */
async function cmdImport(inputFile) {
  let json;

  if (inputFile) {
    const inPath = path.resolve(PROJECT_ROOT, inputFile);
    json = await fs.readFile(inPath, "utf8");
  } else {
    // Read from stdin
    process.stderr.write(
      `${c.dim}Lettura bundle da stdin... (Ctrl+D per terminare, oppure pipe: pbpaste | node sync.mjs import)${c.reset}\n`
    );
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    json = Buffer.concat(chunks).toString("utf8");
  }

  let bundle;
  try {
    bundle = JSON.parse(json);
  } catch (e) {
    console.error(`${c.red}✗ Errore parsing JSON:${c.reset} ${e.message}`);
    process.exit(1);
  }

  if (!bundle.vulcan_sync || !bundle.files) {
    console.error(
      `${c.red}✗ Bundle non valido${c.reset} — mancano campi 'vulcan_sync' o 'files'`
    );
    process.exit(1);
  }

  console.log(
    `\n${c.bold}${c.cyan}Vulcan Sync — Import${c.reset}`
  );
  console.log(
    `${c.dim}Sorgente: ${bundle.source} · ${bundle.timestamp} · ${bundle.manifest.total_files} file${c.reset}\n`
  );

  let written = 0;
  let created = 0;
  let unchanged = 0;

  for (const [filePath, data] of Object.entries(bundle.files)) {
    const absPath = path.join(PROJECT_ROOT, filePath);
    const dir = path.dirname(absPath);

    // Check if file exists and is the same
    try {
      const existing = await fs.readFile(absPath, "utf8");
      if (djb2(existing) === data.hash) {
        unchanged++;
        continue;
      }
    } catch {
      // File doesn't exist — will create
      created++;
    }

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(absPath, data.content, "utf8");
    written++;

    const action = created > 0 ? `${c.green}+NEW${c.reset}` : `${c.yellow}UPD${c.reset}`;
    console.log(`  ${action}  ${filePath}`);
  }

  // Save as snapshot for future diff
  await fs.writeFile(SNAPSHOT_FILE, json, "utf8");

  console.log(
    `\n${c.green}✓${c.reset} Completato: ${c.bold}${written}${c.reset} scritti, ${c.bold}${created}${c.reset} nuovi, ${c.bold}${unchanged}${c.reset} invariati\n`
  );
}

/** diff — compare local vs snapshot/bundle */
async function cmdDiff(bundleFile) {
  let snapshotJson;

  if (bundleFile) {
    snapshotJson = await fs.readFile(
      path.resolve(PROJECT_ROOT, bundleFile),
      "utf8"
    );
  } else {
    try {
      snapshotJson = await fs.readFile(SNAPSHOT_FILE, "utf8");
    } catch {
      console.error(
        `${c.red}✗ Nessuno snapshot trovato.${c.reset} Esegui prima: node sync.mjs export\n`
      );
      process.exit(1);
    }
  }

  const snapshot = JSON.parse(snapshotJson);
  const currentFiles = await getAllFiles();

  console.log(
    `\n${c.bold}${c.cyan}Vulcan Sync — Diff${c.reset}`
  );
  console.log(
    `${c.dim}Snapshot: ${snapshot.source} · ${snapshot.timestamp}${c.reset}\n`
  );

  const snapshotPaths = new Set(Object.keys(snapshot.files));
  const currentPaths = new Set(Object.keys(currentFiles));

  let modified = 0;
  let added = 0;
  let deleted = 0;
  let unchanged = 0;

  // Modified & unchanged
  for (const [p, data] of Object.entries(currentFiles)) {
    if (snapshotPaths.has(p)) {
      if (data.hash !== snapshot.files[p].hash) {
        console.log(`  ${c.yellow}M${c.reset}  ${p}`);
        modified++;
      } else {
        unchanged++;
      }
    } else {
      console.log(`  ${c.green}+${c.reset}  ${p}`);
      added++;
    }
  }

  // Deleted
  for (const p of snapshotPaths) {
    if (!currentPaths.has(p)) {
      console.log(`  ${c.red}-${c.reset}  ${p}`);
      deleted++;
    }
  }

  if (modified + added + deleted === 0) {
    console.log(`  ${c.green}Tutto sincronizzato!${c.reset}`);
  }

  console.log(
    `\n${c.bold}${modified}${c.reset} modificati · ${c.bold}${added}${c.reset} nuovi · ${c.bold}${deleted}${c.reset} eliminati · ${c.dim}${unchanged} invariati${c.reset}\n`
  );
}

/* ═══ MAIN ═══ */
const [, , command, arg] = process.argv;

switch (command) {
  case "scan":
    await cmdScan();
    break;
  case "export":
    await cmdExport(arg);
    break;
  case "import":
    await cmdImport(arg);
    break;
  case "diff":
    await cmdDiff(arg);
    break;
  default:
    console.log(`
${c.bold}${c.cyan}Vulcan Pizza Lab — Sync CLI${c.reset}

  Sincronizza il progetto tra Vulcan Cloud e l'ambiente locale.

${c.bold}Comandi:${c.reset}

  ${c.green}scan${c.reset}                    Mostra tutti i file tracciati con hash
  ${c.green}export${c.reset}                  Bundle JSON → stdout (pipe a clipboard o file)
  ${c.green}export${c.reset} ${c.dim}<file.json>${c.reset}      Bundle JSON → file specificato
  ${c.green}import${c.reset}                  Legge bundle da stdin → scrive file locali
  ${c.green}import${c.reset} ${c.dim}<file.json>${c.reset}      Legge bundle da file → scrive file locali
  ${c.green}diff${c.reset}                    Confronta locale vs ultimo snapshot
  ${c.green}diff${c.reset}   ${c.dim}<file.json>${c.reset}      Confronta locale vs bundle specificato

${c.bold}Esempi:${c.reset}

  ${c.dim}# Export e copia in clipboard (macOS)${c.reset}
  node sync.mjs export | pbcopy

  ${c.dim}# Export e copia in clipboard (Linux)${c.reset}
  node sync.mjs export | xclip -selection clipboard

  ${c.dim}# Export e copia in clipboard (Windows PowerShell)${c.reset}
  node sync.mjs export | clip

  ${c.dim}# Export in file${c.reset}
  node sync.mjs export bundle.json

  ${c.dim}# Import da clipboard (macOS)${c.reset}
  pbpaste | node sync.mjs import

  ${c.dim}# Import da file${c.reset}
  node sync.mjs import bundle.json

  ${c.dim}# Vedi cosa e cambiato dall'ultimo sync${c.reset}
  node sync.mjs diff
`);
}
