import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Project, SyntaxKind, ts, type SourceFile } from "ts-morph";

interface Baseline {
  version: 1;
  orphanModules: string[];
  unusedDiagnostics: Record<string, number>;
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = path.join(ROOT, "scripts/.dead-code-baseline.json");
const UPDATE = process.argv.includes("--update");
const BACKUP_SEGMENT = /(^|\/)(?:_?backup(?:_|-|\/)|[^/]*_backup(?:_|-|\/)|engine_backup)/i;
const BACKUP_SUFFIX = /(?:\.bak|\.old|\.orig|~)$/i;
const UNUSED_CODES = new Set([6133, 6192, 6196]);
const ENTRY_FILES = [
  "src/main.tsx",
  "src/app/components/ds/_sync-entry.ts",
] as const;

function rel(file: string): string {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function isTestModule(file: string): boolean {
  return /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file);
}

function productionFile(source: SourceFile): boolean {
  const file = rel(source.getFilePath());
  return (
    file.startsWith("src/app/") &&
    /\.[cm]?[jt]sx?$/.test(file) &&
    !isTestModule(file)
  );
}

function moduleTargets(source: SourceFile): SourceFile[] {
  const targets = new Set<SourceFile>();
  for (const declaration of source.getImportDeclarations()) {
    const target = declaration.getModuleSpecifierSourceFile();
    if (target) targets.add(target);
  }
  for (const declaration of source.getExportDeclarations()) {
    const target = declaration.getModuleSpecifierSourceFile();
    if (target) targets.add(target);
  }
  for (const call of source.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (call.getExpression().getKind() !== SyntaxKind.ImportKeyword) continue;
    const argument = call.getArguments()[0];
    if (!argument || !argument.isKind(SyntaxKind.StringLiteral)) continue;
    const resolution = ts.resolveModuleName(
      argument.getLiteralValue(),
      source.getFilePath(),
      source.getProject().getCompilerOptions(),
      ts.sys,
    ).resolvedModule;
    if (!resolution) continue;
    const target = source.getProject().getSourceFile(resolution.resolvedFileName);
    if (target) targets.add(target);
  }
  return [...targets];
}

function reachableFiles(project: Project): Set<string> {
  const roots = ENTRY_FILES.map((entry) => project.getSourceFile(path.join(ROOT, entry))).filter(
    (source): source is SourceFile => Boolean(source),
  );
  const seen = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const source = queue.shift()!;
    const file = source.getFilePath();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const target of moduleTargets(source)) {
      if (!seen.has(target.getFilePath())) queue.push(target);
    }
  }
  return seen;
}

function flattenMessage(message: string | ts.DiagnosticMessageChain): string {
  return typeof message === "string"
    ? message
    : [message.messageText, ...(message.next ?? []).map(flattenMessage)].join(" ");
}

function unusedDiagnostics(): Record<string, number> {
  const config = ts.readConfigFile(path.join(ROOT, "tsconfig.json"), ts.sys.readFile);
  if (config.error) {
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, " "));
  }
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    ROOT,
    { noUnusedLocals: true, noUnusedParameters: true, noEmit: true },
    path.join(ROOT, "tsconfig.json"),
  );
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const counts: Record<string, number> = {};
  for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
    if (!UNUSED_CODES.has(diagnostic.code) || !diagnostic.file) continue;
    const file = rel(diagnostic.file.fileName);
    if (!file.startsWith("src/app/") || isTestModule(file)) continue;
    const message = flattenMessage(diagnostic.messageText).replace(/\s+/g, " ").trim();
    const key = `${file}::TS${diagnostic.code}::${message}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function collect(): Baseline & {
  backupFiles: string[];
  duplicateModules: string[][];
  duplicateFiles: string[][];
} {
  const project = new Project({ tsConfigFilePath: path.join(ROOT, "tsconfig.json") });
  const files = project.getSourceFiles().filter(productionFile);
  const reachable = reachableFiles(project);
  const orphanModules = files
    .filter((source) => !reachable.has(source.getFilePath()))
    .map((source) => rel(source.getFilePath()))
    .sort();
  const guardedRoots = [path.join(ROOT, "src"), path.join(ROOT, "public")];
  const backupFiles: string[] = [];
  const allFiles: string[] = [];
  const queue = guardedRoots.filter(fs.existsSync);
  while (queue.length) {
    const directory = queue.shift()!;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      const file = rel(absolute);
      allFiles.push(absolute);
      if (BACKUP_SEGMENT.test(file) || BACKUP_SUFFIX.test(file)) backupFiles.push(file);
    }
  }
  backupFiles.sort();
  const byHash = new Map<string, string[]>();
  for (const source of files) {
    const normalized = source.getFullText().trim();
    if (!normalized) continue;
    const hash = createHash("sha256").update(normalized).digest("hex");
    const group = byHash.get(hash) ?? [];
    group.push(rel(source.getFilePath()));
    byHash.set(hash, group);
  }
  const duplicateModules = [...byHash.values()]
    .filter((group) => group.length > 1)
    .map((group) => group.sort())
    .sort((a, b) => a[0].localeCompare(b[0]));
  const allByHash = new Map<string, string[]>();
  for (const absolute of allFiles) {
    const content = fs.readFileSync(absolute);
    if (content.byteLength === 0) continue;
    const hash = createHash("sha256").update(content).digest("hex");
    const group = allByHash.get(hash) ?? [];
    group.push(rel(absolute));
    allByHash.set(hash, group);
  }
  const duplicateFiles = [...allByHash.values()]
    .filter((group) => group.length > 1)
    .map((group) => group.sort())
    .sort((a, b) => a[0].localeCompare(b[0]));
  return {
    version: 1,
    orphanModules,
    unusedDiagnostics: unusedDiagnostics(),
    backupFiles,
    duplicateModules,
    duplicateFiles,
  };
}

function readBaseline(): Baseline {
  if (!fs.existsSync(BASELINE_PATH)) {
    return { version: 1, orphanModules: [], unusedDiagnostics: {} };
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) as Baseline;
}

const current = collect();
if (UPDATE) {
  const {
    backupFiles: _ignoredBackups,
    duplicateModules: _ignoredDuplicates,
    duplicateFiles: _ignoredDuplicateFiles,
    ...baseline
  } = current;
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(
    `Dead-code baseline aggiornata: ${baseline.orphanModules.length} moduli orfani, ${Object.keys(baseline.unusedDiagnostics).length} firme unused.`,
  );
  process.exit(0);
}

const baseline = readBaseline();
const failures: string[] = [];
for (const file of current.backupFiles) {
  failures.push(`${file}: backup vietato dentro src/public`);
}
for (const group of current.duplicateModules) {
  failures.push(`${group.join(" = ")}: moduli duplicati byte-per-byte`);
}
for (const group of current.duplicateFiles) {
  failures.push(`${group.join(" = ")}: file/asset duplicati byte-per-byte`);
}

const allowedOrphans = new Set(baseline.orphanModules);
for (const file of current.orphanModules) {
  if (!allowedOrphans.has(file)) {
    failures.push(`${file}: nuovo modulo non raggiungibile dalle entry production`);
  }
}

for (const [signature, count] of Object.entries(current.unusedDiagnostics)) {
  const allowed = baseline.unusedDiagnostics[signature] ?? 0;
  if (count > allowed) failures.push(`${signature}: ${count} occorrenze, baseline ${allowed}`);
}

const unusedCount = Object.values(current.unusedDiagnostics).reduce((a, b) => a + b, 0);
console.log("Dead-code guard — import graph + TypeScript unused ratchet");
console.log(
    `${current.orphanModules.length} moduli orfani (baseline ${baseline.orphanModules.length}); ` +
    `${unusedCount} diagnostiche unused; ${current.duplicateModules.length} moduli duplicati; ` +
    `${current.duplicateFiles.length} file/asset duplicati.`,
);
if (!fs.existsSync(BASELINE_PATH)) {
  console.log("Baseline assente: tolleranza zero per orfani e diagnostiche unused.");
}
if (failures.length) {
  console.error(`✗ ${failures.length} regressione/i o debito non autorizzato:`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log("✓ nessun nuovo dead code, backup o duplicato in src/public");
