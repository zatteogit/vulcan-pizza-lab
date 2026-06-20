import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Download,
  Copy,
  Check,
  FileText,
  FilePlus2,
  FileMinus2,
  FileEdit,
  AlertTriangle,
  RefreshCw,
  ClipboardPaste,
  ChevronDown,
  X,
  Monitor,
  Apple,
  Terminal,
  ArrowRight,
  ArrowDown,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Badge, SegmentedControl, Surface } from "./ds";

/* ═══ TYPES ═══ */
interface SyncBundle {
  vulcan_sync: string;
  timestamp: string;
  source: "figma-make" | "local";
  files: Record<string, { hash: string; lines: number; content: string }>;
  manifest: { total_files: number; excluded: string[] };
}

interface DiffEntry {
  path: string;
  status: "added" | "modified" | "deleted" | "unchanged";
  localContent?: string;
  makeContent?: string;
  localHash?: string;
  makeHash?: string;
}

/* ═══ HASH (djb2) ═══ */
function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/* ═══ GLOB: all active source files ═══ */
const sourceGlobs = import.meta.glob(
  [
    "/src/app/**/*.{ts,tsx}",
    "/src/styles/**/*.css",
    "/src/main.tsx",
    "/src/imports/**/*.tsx",
  ],
  { query: "?raw", import: "default" }
) as Record<string, () => Promise<string>>;

const configGlobs = import.meta.glob(
  ["/vite.config.ts", "/tsconfig.json", "/index.html", "/postcss.config.mjs"],
  { query: "?raw", import: "default" }
) as Record<string, () => Promise<string>>;

/* ═══ EXCLUDED PATTERNS ═══ */
const EXCLUDE_PATTERNS = ["/src/app/components/ui/"];

function isExcluded(path: string): boolean {
  return EXCLUDE_PATTERNS.some((p) => path.startsWith(p));
}

/* ═══ CLIPBOARD HELPER (dual-path per iframe) ═══ */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* ═══ LOAD ALL FILES ═══ */
async function loadAllFiles(): Promise<
  Record<string, { content: string; hash: string; lines: number }>
> {
  const result: Record<
    string,
    { content: string; hash: string; lines: number }
  > = {};
  const allGlobs = { ...sourceGlobs, ...configGlobs };
  const entries = Object.entries(allGlobs).filter(
    ([path]) => !isExcluded(path)
  );
  const loaded = await Promise.all(
    entries.map(async ([path, loader]) => {
      try {
        const content = await loader();
        return { path, content };
      } catch {
        return null;
      }
    })
  );
  for (const item of loaded) {
    if (!item) continue;
    result[item.path] = {
      content: item.content,
      hash: djb2(item.content),
      lines: item.content.split("\n").length,
    };
  }
  return result;
}

/* ═══ BUILD BUNDLE ═══ */
function buildBundle(
  files: Record<string, { content: string; hash: string; lines: number }>
): SyncBundle {
  const bundleFiles: SyncBundle["files"] = {};
  for (const [path, data] of Object.entries(files)) {
    bundleFiles[path] = { hash: data.hash, lines: data.lines, content: data.content };
  }
  return {
    vulcan_sync: "1.0",
    timestamp: new Date().toISOString(),
    source: "figma-make",
    files: bundleFiles,
    manifest: {
      total_files: Object.keys(bundleFiles).length,
      excluded: ["node_modules/", "dist/", "src/app/components/ui/"],
    },
  };
}

/* ═══ COMPUTE DIFF ═══ */
function computeDiff(
  makeFiles: Record<string, { content: string; hash: string; lines: number }>,
  importedBundle: SyncBundle
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const importedPaths = new Set(Object.keys(importedBundle.files));
  for (const [path, imported] of Object.entries(importedBundle.files)) {
    const local = makeFiles[path];
    if (!local) {
      diffs.push({ path, status: "added", localContent: imported.content, localHash: imported.hash });
    } else if (local.hash !== imported.hash) {
      diffs.push({ path, status: "modified", localContent: imported.content, makeContent: local.content, localHash: imported.hash, makeHash: local.hash });
    } else {
      diffs.push({ path, status: "unchanged" });
    }
  }
  for (const path of Object.keys(makeFiles)) {
    if (!importedPaths.has(path)) {
      diffs.push({ path, status: "deleted", makeContent: makeFiles[path].content, makeHash: makeFiles[path].hash });
    }
  }
  const order = { modified: 0, added: 1, deleted: 2, unchanged: 3 };
  diffs.sort((a, b) => order[a.status] - order[b.status]);
  return diffs;
}

/* ═══ LINE DIFF (LCS-based) ═══ */
const CONTEXT_LINES = 3;
const MAX_LCS_CELLS = 4_000_000;
const SMALL_FILE_THRESHOLD = 25;
const REWRITE_RATIO = 0.65;

function lcsMatches(a: string[], b: string[]): [number, number][] {
  const m = a.length, n = b.length;
  if (m * n > MAX_LCS_CELLS) return [];
  const dp: number[][] = Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
    }
  }
  const matches: [number, number][] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { matches.push([i - 1, j - 1]); i--; j--; }
    else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  return matches.reverse();
}

interface Hunk {
  oldStart: number; oldEnd: number;
  newStart: number; newEnd: number;
  newLines: string[];
  contextBefore: string[];
  contextAfter: string[];
}

function computeHunks(oldContent: string, newContent: string): Hunk[] | null {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  if (newLines.length <= SMALL_FILE_THRESHOLD) return null;
  const matches = lcsMatches(oldLines, newLines);
  if (matches.length === 0 && oldLines.length * newLines.length > MAX_LCS_CELLS) return null;
  const matchRatio = matches.length / Math.max(oldLines.length, newLines.length, 1);
  if (matchRatio < (1 - REWRITE_RATIO)) return null;

  const hunks: Hunk[] = [];
  let ni = 0, matchIdx = 0;
  while (ni < newLines.length) {
    if (matchIdx < matches.length && matches[matchIdx][1] === ni) { matchIdx++; ni++; continue; }
    const hunkNewStart = ni;
    while (ni < newLines.length && (matchIdx >= matches.length || matches[matchIdx][1] !== ni)) ni++;
    const hunkNewEnd = ni;
    const prevMatch = matchIdx > 0 ? matches[matchIdx - 1] : null;
    const nextMatch = matchIdx < matches.length ? matches[matchIdx] : null;
    const oldStart = prevMatch ? prevMatch[0] + 1 : 0;
    const oldEnd = nextMatch ? nextMatch[0] : oldLines.length;
    const ctxBeforeStart = Math.max(0, hunkNewStart - CONTEXT_LINES);
    const contextBefore = newLines.slice(ctxBeforeStart, hunkNewStart);
    const ctxAfterEnd = Math.min(newLines.length, hunkNewEnd + CONTEXT_LINES);
    const contextAfter = newLines.slice(hunkNewEnd, ctxAfterEnd);
    hunks.push({ oldStart, oldEnd, newStart: hunkNewStart, newEnd: hunkNewEnd, newLines: newLines.slice(hunkNewStart, hunkNewEnd), contextBefore, contextAfter });
  }

  const merged: Hunk[] = [];
  for (const hunk of hunks) {
    const prev = merged[merged.length - 1];
    if (prev && (hunk.newStart - prev.newEnd) <= CONTEXT_LINES * 2) {
      const gapLines = newLines.slice(prev.newEnd, hunk.newStart);
      prev.newLines = [...prev.newLines, ...gapLines, ...hunk.newLines];
      prev.newEnd = hunk.newEnd; prev.oldEnd = hunk.oldEnd;
      prev.contextAfter = hunk.contextAfter;
    } else {
      merged.push({ ...hunk });
    }
  }
  return merged.length > 0 ? merged : null;
}

function formatHunksAsChangeStr(hunks: Hunk[]): string {
  let out = "";
  for (let i = 0; i < hunks.length; i++) {
    const h = hunks[i];
    out += "// ... existing code ...\n";
    for (const line of h.contextBefore) out += line + "\n";
    for (const line of h.newLines) out += line + "\n";
    for (const line of h.contextAfter) out += line + "\n";
  }
  out += "// ... existing code ...\n";
  return out;
}

/* ═══ TOKEN & CREDIT ESTIMATION ═══ */
const CHARS_PER_TOKEN = 3.5;
const TOKENS_PER_TURN = 25000;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
function estimateTurns(tokens: number): number {
  return Math.max(1, Math.ceil(tokens / TOKENS_PER_TURN));
}

/* ═══ GENERATE PROMPTS ═══ */

type PromptMode = "compact" | "full";

function generateFullPrompt(diffs: DiffEntry[]): string {
  const changed = diffs.filter((d) => d.status !== "unchanged");
  if (changed.length === 0) return "Nessuna modifica da applicare.";
  let prompt = `Applica le seguenti modifiche sincronizzate dal repository locale.\n`;
  prompt += `${changed.length} file da aggiornare.\n`;
  prompt += `Per ogni file usa lo strumento indicato (write_tool per nuovi/riscritti, delete_tool per eliminati).\n\n`;
  for (const diff of changed) {
    if (diff.status === "modified" && diff.localContent) {
      prompt += `=== RISCRIVI FILE: ${diff.path} ===\nUsa write_tool per sostituire l'intero contenuto:\n`;
      prompt += "```\n" + diff.localContent + "\n```\n\n";
    } else if (diff.status === "added" && diff.localContent) {
      prompt += `=== NUOVO FILE: ${diff.path} ===\nUsa write_tool:\n`;
      prompt += "```\n" + diff.localContent + "\n```\n\n";
    } else if (diff.status === "deleted") {
      prompt += `=== ELIMINA: ${diff.path} ===\nUsa delete_tool.\n\n`;
    }
  }
  return prompt;
}

function generateCompactPrompt(diffs: DiffEntry[]): string {
  const changed = diffs.filter((d) => d.status !== "unchanged");
  if (changed.length === 0) return "Nessuna modifica da applicare.";
  let prompt = `Sync dal repository locale — ${changed.length} file da aggiornare.\n`;
  prompt += `Istruzioni: usa fast_apply_tool per le PATCH (applica il change_str cosi com'e), write_tool per file nuovi/riscritti, delete_tool per eliminati.\n\n`;
  let patchCount = 0, fullCount = 0;
  for (const diff of changed) {
    if (diff.status === "added" && diff.localContent) {
      prompt += `=== NUOVO FILE: ${diff.path} ===\nUsa write_tool:\n`;
      prompt += "```\n" + diff.localContent + "\n```\n\n";
      fullCount++;
    } else if (diff.status === "deleted") {
      prompt += `=== ELIMINA: ${diff.path} ===\nUsa delete_tool.\n\n`;
    } else if (diff.status === "modified" && diff.localContent && diff.makeContent) {
      const hunks = computeHunks(diff.makeContent, diff.localContent);
      if (hunks) {
        const changeStr = formatHunksAsChangeStr(hunks);
        prompt += `=== PATCH: ${diff.path} ===\nUsa fast_apply_tool con questo change_str:\n`;
        prompt += "```\n" + changeStr + "```\n\n";
        patchCount++;
      } else {
        prompt += `=== RISCRIVI: ${diff.path} ===\nUsa write_tool (file piccolo o riscritto >65%):\n`;
        prompt += "```\n" + diff.localContent + "\n```\n\n";
        fullCount++;
      }
    }
  }
  prompt += `--- Riepilogo: ${patchCount} patch, ${fullCount} riscritture, ${changed.filter(d => d.status === "deleted").length} eliminazioni ---\n`;
  return prompt;
}

function generatePrompt(diffs: DiffEntry[], mode: PromptMode = "compact"): string {
  return mode === "compact" ? generateCompactPrompt(diffs) : generateFullPrompt(diffs);
}

/* ═══ SMALL COMPONENTS ═══ */

function CopyBtn({ text, label, fullWidth }: { text: string; label: string; fullWidth?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [text]);
  return (
    <motion.button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 transition-transform ${fullWidth ? "w-full" : ""}`}
      style={{
        background: copied ? "var(--text-success)" : "var(--chip-bg-active)",
        color: copied ? "var(--text-on-cta)" : "var(--chip-text-active)",
        border: "none", cursor: "pointer",
        fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any,
        fontFamily: "var(--font-sans)",
      }}
      aria-label={label}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? "Copiato!" : label}</span>
    </motion.button>
  );
}

/** Inline command with copy button */
function CmdCopy({ cmd, note }: { cmd: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(cmd);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [cmd]);
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
      style={{ background: "var(--container-bg)" }}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span style={{ color: "var(--text-success)", fontFamily: "var(--font-mono)", fontSize: "var(--font-size-sm)" }}>$</span>
        <span
          className="type-data truncate"
          style={{ fontSize: "var(--font-size-sm)", color: "var(--text-default)" }}
        >
          {cmd}
        </span>
        {note && (
          <span className="type-data-xs hidden sm:inline" style={{ color: "var(--text-muted)" }}>
            {note}
          </span>
        )}
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 p-1.5 rounded-md active:scale-90 transition-transform"
        style={{
          background: copied ? "var(--text-success)" : "color-mix(in srgb, var(--text-muted) 15%, transparent)",
          color: copied ? "var(--text-on-cta)" : "var(--text-muted)",
          border: "none", cursor: "pointer",
        }}
        aria-label={`Copia comando: ${cmd}`}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: DiffEntry["status"] }) {
  const config = {
    modified: { label: "Modificato", color: "var(--text-warning)", bg: "color-mix(in srgb, var(--text-warning) 12%, transparent)", icon: <FileEdit size={11} /> },
    added: { label: "Nuovo", color: "var(--text-success)", bg: "color-mix(in srgb, var(--text-success) 12%, transparent)", icon: <FilePlus2 size={11} /> },
    deleted: { label: "Eliminato", color: "var(--text-accent)", bg: "color-mix(in srgb, var(--text-accent) 12%, transparent)", icon: <FileMinus2 size={11} /> },
    unchanged: { label: "Invariato", color: "var(--text-muted)", bg: "color-mix(in srgb, var(--text-muted) 8%, transparent)", icon: <FileText size={11} /> },
  };
  const c = config[status];
  return (
    <Badge
      color={c.color}
      background={c.bg}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg"
      style={{ fontSize: "var(--font-size-sm)" }}
    >
      {c.icon}{c.label}
    </Badge>
  );
}

/** Numbered step circle */
function StepNum({ n, active }: { n: number; active?: boolean }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: active ? "var(--chip-bg-active)" : "color-mix(in srgb, var(--text-muted) 15%, transparent)",
        color: active ? "var(--chip-text-active)" : "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--weight-bold)" as any,
      }}
    >
      {n}
    </div>
  );
}

/** OS selector for CLI commands */
function OsCommands({ commands }: { commands: { os: string; icon: React.ReactNode; cmd: string; note?: string }[] }) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {commands.map((c, i) => (
          <button
            key={c.os}
            onClick={() => setSelected(i)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
            style={{
              background: selected === i ? "var(--chip-bg-active)" : "transparent",
              color: selected === i ? "var(--chip-text-active)" : "var(--text-muted)",
              border: "none", cursor: "pointer",
              fontSize: "var(--font-size-sm)", fontFamily: "var(--font-sans)",
            }}
          >
            {c.icon}
            <span>{c.os}</span>
          </button>
        ))}
      </div>
      <CmdCopy cmd={commands[selected].cmd} note={commands[selected].note} />
    </div>
  );
}

/* ═══ MAIN SYNC TAB ═══ */
export function SyncTab() {
  const [loading, setLoading] = useState(false);
  const [makeFiles, setMakeFiles] = useState<Record<string, { content: string; hash: string; lines: number }> | null>(null);
  const [exportBundle, setExportBundle] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [diffs, setDiffs] = useState<DiffEntry[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string | null>(null);
  const [fullPromptText, setFullPromptText] = useState<string | null>(null);
  const [promptMode, setPromptMode] = useState<PromptMode>("compact");
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLoadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const files = await loadAllFiles();
      setMakeFiles(files);
      const bundle = buildBundle(files);
      setExportBundle(JSON.stringify(bundle, null, 2));
      try { localStorage.setItem("vulcan_last_sync_ts", new Date().toISOString()); } catch { /* iframe sandbox */ }
    } catch (err) {
      console.error("Sync: errore caricamento file", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImport = useCallback(() => {
    setParseError(null);
    setDiffs(null);
    setPromptText(null);
    setFullPromptText(null);
    if (!importText.trim()) {
      setParseError("Incolla il bundle JSON esportato dal CLI locale.");
      return;
    }
    try {
      const parsed = JSON.parse(importText) as SyncBundle;
      if (!parsed.vulcan_sync || !parsed.files) {
        setParseError("Formato non valido. Il JSON deve avere i campi 'vulcan_sync' e 'files'.");
        return;
      }
      if (!makeFiles) {
        setParseError("Prima clicca 'Scansiona' qui sopra (step 1).");
        return;
      }
      const diffResult = computeDiff(makeFiles, parsed);
      setDiffs(diffResult);
      setPromptText(generatePrompt(diffResult, "compact"));
      setFullPromptText(generatePrompt(diffResult, "full"));
    } catch (e: any) {
      setParseError(`JSON non valido: ${e.message}`);
    }
  }, [importText, makeFiles]);

  const changedCount = diffs ? diffs.filter((d) => d.status !== "unchanged").length : 0;
  const unchangedCount = diffs ? diffs.filter((d) => d.status === "unchanged").length : 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ═══ HERO INTRO ═══ */}
      <Surface className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in srgb, var(--text-accent) 12%, transparent)", color: "var(--text-accent)" }}
          >
            <RefreshCw size={18} />
          </div>
          <div>
            <h3
              className="type-label"
              style={{ color: "var(--text-default)", fontSize: "var(--font-size-lg)", marginBottom: "var(--space-1)" }}
            >
              Sync Make ↔ Locale
            </h3>
            <p className="type-body-sm" style={{ color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Lavora su Vulcan in Figma Make E nel tuo editor preferito (Cursor, VS Code, Windsurf...).
              Questo tool ti permette di portare il codice fuori e poi rimetterlo dentro.
            </p>
          </div>
        </div>

        {/* Visual workflow */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}
        >
          <div
            className="type-label"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2-5)", letterSpacing: "0.08em", textTransform: "uppercase" as any }}
          >
            Come funziona (in 30 secondi)
          </div>

          {/* Direction A */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Download size={13} style={{ color: "var(--text-success)" }} />
              <span style={{ color: "var(--text-success)", fontFamily: "var(--font-mono)", fontSize: "var(--font-size-sm)", fontWeight: "var(--weight-semibold)" as any }}>
                DA QUI → AL TUO PC
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pl-5">
              <Badge color="var(--text-accent)" background="color-mix(in srgb, var(--text-accent) 10%, transparent)" className="px-2 py-1 rounded-lg whitespace-nowrap">
                Scansiona + Copia
              </Badge>
              <ArrowRight size={14} className="hidden sm:block" style={{ color: "var(--text-muted)" }} />
              <ArrowDown size={14} className="block sm:hidden ml-4" style={{ color: "var(--text-muted)" }} />
              <Badge color="var(--text-success)" background="color-mix(in srgb, var(--text-success) 10%, transparent)" className="px-2 py-1 rounded-lg whitespace-nowrap">
                Incolla nel terminale
              </Badge>
              <ArrowRight size={14} className="hidden sm:block" style={{ color: "var(--text-muted)" }} />
              <ArrowDown size={14} className="block sm:hidden ml-4" style={{ color: "var(--text-muted)" }} />
              <Badge color="var(--text-default)" background="color-mix(in srgb, var(--text-muted) 10%, transparent)" className="px-2 py-1 rounded-lg whitespace-nowrap">
                Tutti i file sul tuo PC!
              </Badge>
            </div>
          </div>

          {/* Direction B */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Upload size={13} style={{ color: "var(--text-warning)" }} />
              <span style={{ color: "var(--text-warning)", fontFamily: "var(--font-mono)", fontSize: "var(--font-size-sm)", fontWeight: "var(--weight-semibold)" as any }}>
                DAL TUO PC → QUI DENTRO
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pl-5">
              <Badge color="var(--text-warning)" background="color-mix(in srgb, var(--text-warning) 10%, transparent)" className="px-2 py-1 rounded-lg whitespace-nowrap">
                Export dal terminale
              </Badge>
              <ArrowRight size={14} className="hidden sm:block" style={{ color: "var(--text-muted)" }} />
              <ArrowDown size={14} className="block sm:hidden ml-4" style={{ color: "var(--text-muted)" }} />
              <Badge color="var(--text-accent)" background="color-mix(in srgb, var(--text-accent) 10%, transparent)" className="px-2 py-1 rounded-lg whitespace-nowrap">
                Incolla qui + Diff
              </Badge>
              <ArrowRight size={14} className="hidden sm:block" style={{ color: "var(--text-muted)" }} />
              <ArrowDown size={14} className="block sm:hidden ml-4" style={{ color: "var(--text-muted)" }} />
              <Badge color="var(--text-default)" background="color-mix(in srgb, var(--text-muted) 10%, transparent)" className="px-2 py-1 rounded-lg whitespace-nowrap">
                Copia prompt → Claude applica
              </Badge>
            </div>
          </div>
        </div>
      </Surface>

      {/* ═══ FIRST TIME SETUP ═══ */}
      <Surface className="overflow-hidden">
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="w-full flex items-center justify-between p-5 active:scale-[0.995] transition-transform"
          style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--text-warning) 12%, transparent)", color: "var(--text-warning)" }}
            >
              <BookOpen size={16} />
            </div>
            <div>
              <span className="type-label-sm" style={{ color: "var(--text-default)" }}>
                Prima volta? Setup in 2 minuti
              </span>
              <span className="block type-data-sm" style={{ color: "var(--text-muted)" }}>
                Clona il repo e installa lo script sync
              </span>
            </div>
          </div>
          <ChevronDown
            size={16}
            style={{ color: "var(--text-muted)", transform: showSetup ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
          />
        </button>

        <AnimatePresence>
          {showSetup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 flex flex-col gap-4" style={{ borderTop: "1px solid var(--container-border)" }}>
                <div className="pt-4">
                  {/* Step A: Prerequisiti */}
                  <div className="flex items-start gap-3 mb-4">
                    <StepNum n={0} />
                    <div className="flex-1">
                      <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1-5)" }}>
                        Prerequisiti
                      </div>
                      <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.5 }}>
                        Servono solo <span style={{ color: "var(--text-default)" }}>Node.js 18+</span> e <span style={{ color: "var(--text-default)" }}>Git</span>.
                        Se non li hai: <span className="type-data" style={{ color: "var(--text-accent)" }}>nodejs.org</span> e <span className="type-data" style={{ color: "var(--text-accent)" }}>git-scm.com</span>
                      </p>
                      <div
                        className="flex items-center gap-2 p-2.5 rounded-lg"
                        style={{ background: "color-mix(in srgb, var(--text-success) 8%, transparent)" }}
                      >
                        <Check size={13} style={{ color: "var(--text-success)" }} />
                        <span className="type-body-xs" style={{ color: "var(--text-muted)" }}>
                          Verifica: apri il terminale e scrivi <span className="type-data" style={{ color: "var(--text-default)" }}>node -v</span> — deve dire v18 o superiore
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step B: Clone */}
                  <div className="flex items-start gap-3 mb-4">
                    <StepNum n={1} />
                    <div className="flex-1">
                      <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1-5)" }}>
                        Clona il repository
                      </div>
                      <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.5 }}>
                        Apri il terminale, vai nella cartella dove tieni i progetti, e lancia:
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <CmdCopy cmd="git clone https://github.com/zatteogit/vulcan-pizza-lab.git" />
                        <CmdCopy cmd="cd vulcan-pizza-lab" />
                      </div>
                    </div>
                  </div>

                  {/* Step C: Install */}
                  <div className="flex items-start gap-3 mb-4">
                    <StepNum n={2} />
                    <div className="flex-1">
                      <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1-5)" }}>
                        Installa le dipendenze
                      </div>
                      <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.5 }}>
                        Lancia UNO di questi comandi (quello che preferisci):
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <CmdCopy cmd="pnpm install" note="(consigliato)" />
                        <CmdCopy cmd="npm install" note="(alternativa)" />
                      </div>
                    </div>
                  </div>

                  {/* Step D: Done */}
                  <div className="flex items-start gap-3">
                    <StepNum n={3} active />
                    <div className="flex-1">
                      <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1-5)" }}>
                        Fatto! Ora puoi usare sync
                      </div>
                      <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.5 }}>
                        Il file <span className="type-data" style={{ color: "var(--text-accent)" }}>sync.mjs</span> e gia nella cartella del progetto.
                        Prova con:
                      </p>
                      <CmdCopy cmd="node sync.mjs scan" note="mostra tutti i file" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Surface>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* DIRECTION A: Make → Locale                                      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "2px solid color-mix(in srgb, var(--text-success) 25%, transparent)" }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: "color-mix(in srgb, var(--text-success) 8%, transparent)" }}
        >
          <Download size={16} style={{ color: "var(--text-success)" }} />
          <span
            className="type-label"
            style={{ color: "var(--text-success)", fontSize: "var(--font-size-base)", letterSpacing: "0.06em", textTransform: "uppercase" as any }}
          >
            Portare il codice sul tuo PC
          </span>
          <span className="type-body-xs" style={{ color: "var(--text-muted)" }}>
            (Figma Make → Editor locale)
          </span>
        </div>

        <div className="p-5 flex flex-col gap-5" style={{ background: "var(--surface-container-low)" }}>

          {/* Step 1: Scan */}
          <div className="flex items-start gap-3">
            <StepNum n={1} active={!!makeFiles} />
            <div className="flex-1">
              <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1)" }}>
                Scansiona il progetto
              </div>
              <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2-5)", lineHeight: 1.5 }}>
                Raccoglie tutti i file sorgente e li prepara per l'esportazione.
              </p>
              <motion.button
                onClick={handleLoadFiles}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                style={{
                  background: "var(--chip-bg-active)", color: "var(--chip-text-active)",
                  border: "none", cursor: loading ? "wait" : "pointer",
                  fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any,
                  fontFamily: "var(--font-sans)", opacity: loading ? 0.6 : 1,
                }}
                aria-label="Scansiona i file del progetto"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <RefreshCw size={14} />
                  </motion.div>
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>{loading ? "Scansione..." : makeFiles ? "Ri-scansiona" : "Scansiona progetto"}</span>
              </motion.button>

              {/* Stats */}
              {makeFiles && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "File", value: Object.keys(makeFiles).length, color: "var(--text-accent)" },
                      { label: "Righe", value: Object.values(makeFiles).reduce((s, f) => s + f.lines, 0).toLocaleString(), color: "var(--text-success)" },
                      { label: "Bundle", value: exportBundle ? `${(exportBundle.length / 1024).toFixed(0)} KB` : "—", color: "var(--text-warning)" },
                    ].map((s) => (
                      <div key={s.label} className="p-2.5 rounded-lg" style={{ background: "var(--container-bg)" }}>
                        <span className="type-label-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                        <div className="type-data-lg" style={{ fontWeight: "var(--weight-bold)" as any, color: s.color, fontFeatureSettings: "'tnum'" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <details className="rounded-lg overflow-hidden" style={{ background: "var(--container-bg)" }}>
                    <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", listStyle: "none" }}>
                      <ChevronDown size={12} />
                      <span>Mostra {Object.keys(makeFiles).length} file</span>
                    </summary>
                    <div className="flex flex-col gap-px px-3 pb-2" style={{ maxHeight: "calc(var(--space-10) * 5)", overflowY: "auto" }}>
                      {Object.entries(makeFiles).sort(([a], [b]) => a.localeCompare(b)).map(([path, data]) => (
                        <div key={path} className="flex items-center justify-between py-1">
                          <span className="type-data-xs" style={{ color: "var(--text-default)" }}>{path}</span>
                          <span className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>{data.lines}L</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: "var(--container-border)" }} />

          {/* Step 2: Copy bundle */}
          <div className="flex items-start gap-3">
            <StepNum n={2} active={!!exportBundle} />
            <div className="flex-1">
              <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1)" }}>
                Copia il bundle
              </div>
              <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2-5)", lineHeight: 1.5 }}>
                Clicca il bottone qui sotto. Il bundle JSON (tutti i file del progetto) viene copiato negli appunti.
              </p>
              {exportBundle ? (
                <CopyBtn text={exportBundle} label="Copia Bundle JSON negli appunti" fullWidth />
              ) : (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ background: "color-mix(in srgb, var(--text-muted) 8%, transparent)" }}
                >
                  <HelpCircle size={13} style={{ color: "var(--text-muted)" }} />
                  <span className="type-body-xs" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                    Prima completa lo step 1 (Scansiona)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: "var(--container-border)" }} />

          {/* Step 3: Paste in terminal */}
          <div className="flex items-start gap-3">
            <StepNum n={3} />
            <div className="flex-1">
              <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1)" }}>
                Incolla nel terminale del tuo PC
              </div>
              <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2-5)", lineHeight: 1.5 }}>
                Apri il terminale nella cartella del progetto (<span className="type-data" style={{ color: "var(--text-default)" }}>cd vulcan-pizza-lab</span>) e lancia il comando per il tuo sistema operativo:
              </p>
              <OsCommands commands={[
                { os: "macOS", icon: <Apple size={12} />, cmd: "pbpaste | node sync.mjs import", note: "incolla da clipboard" },
                { os: "Linux", icon: <Terminal size={12} />, cmd: "xclip -selection clipboard -o | node sync.mjs import", note: "incolla da clipboard" },
                { os: "Windows", icon: <Monitor size={12} />, cmd: "powershell -c \"Get-Clipboard\" | node sync.mjs import", note: "incolla da clipboard" },
              ]} />
              <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-xs)", margin: "var(--space-2) 0 0", lineHeight: 1.4 }}>
                In alternativa, puoi salvare il bundle in un file e poi importarlo:
              </p>
              <div className="mt-1.5">
                <CmdCopy cmd="node sync.mjs import bundle.json" note="se hai salvato in un file" />
              </div>

              {/* Success message */}
              <div
                className="flex items-start gap-2 mt-3 p-3 rounded-lg"
                style={{ background: "color-mix(in srgb, var(--text-success) 8%, transparent)" }}
              >
                <Check size={14} style={{ color: "var(--text-success)", marginTop: "var(--space-px)" }} />
                <div>
                  <span className="type-body-xs" style={{ color: "var(--text-success)", fontWeight: "var(--weight-semibold)" as any }}>
                    Finito!
                  </span>
                  <span className="type-body-xs" style={{ color: "var(--text-muted)" }}>
                    {" "}Tutti i file del progetto sono ora sul tuo PC. Aprili con il tuo editor preferito e lavora come vuoi.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* DIRECTION B: Locale → Make                                      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "2px solid color-mix(in srgb, var(--text-warning) 25%, transparent)" }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: "color-mix(in srgb, var(--text-warning) 8%, transparent)" }}
        >
          <Upload size={16} style={{ color: "var(--text-warning)" }} />
          <span
            className="type-label"
            style={{ color: "var(--text-warning)", fontSize: "var(--font-size-base)", letterSpacing: "0.06em", textTransform: "uppercase" as any }}
          >
            Riportare le modifiche qui dentro
          </span>
          <span className="type-body-xs" style={{ color: "var(--text-muted)" }}>
            (Editor locale → Figma Make)
          </span>
        </div>

        <div className="p-5 flex flex-col gap-5" style={{ background: "var(--surface-container-low)" }}>

          {/* Step 1: Export from terminal */}
          <div className="flex items-start gap-3">
            <StepNum n={1} />
            <div className="flex-1">
              <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1)" }}>
                Esporta dal tuo PC
              </div>
              <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2-5)", lineHeight: 1.5 }}>
                Dopo aver fatto le tue modifiche in locale, torna nel terminale e lancia:
              </p>
              <OsCommands commands={[
                { os: "macOS", icon: <Apple size={12} />, cmd: "node sync.mjs export | pbcopy", note: "copia in clipboard" },
                { os: "Linux", icon: <Terminal size={12} />, cmd: "node sync.mjs export | xclip -selection clipboard", note: "copia in clipboard" },
                { os: "Windows", icon: <Monitor size={12} />, cmd: "node sync.mjs export | clip", note: "copia in clipboard" },
              ]} />
              <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-xs)", margin: "var(--space-1-5) 0 0", lineHeight: 1.4 }}>
                Tip: prima di esportare puoi vedere cosa hai cambiato con <span className="type-data" style={{ color: "var(--text-default)" }}>node sync.mjs diff</span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: "var(--container-border)" }} />

          {/* Step 2: Paste here */}
          <div className="flex items-start gap-3">
            <StepNum n={2} active={!!diffs} />
            <div className="flex-1">
              <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1)" }}>
                Incolla qui e analizza le differenze
              </div>
              <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "0 0 var(--space-2-5)", lineHeight: 1.5 }}>
                {!makeFiles
                  ? "⚠️ Prima clicca 'Scansiona' nella sezione verde qui sopra, poi incolla qui il bundle dal terminale."
                  : "Incolla il bundle JSON che hai appena copiato dal terminale:"}
              </p>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Incolla qui il JSON dal terminale (Ctrl+V / Cmd+V)"
                    rows={5}
                    className="w-full rounded-xl p-4 type-data"
                    style={{
                      background: "var(--container-bg)", color: "var(--text-default)",
                      border: "1px solid var(--container-border)",
                      fontSize: "var(--font-size-sm)", resize: "vertical", outline: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  {importText && (
                    <button
                      onClick={() => { setImportText(""); setDiffs(null); setParseError(null); setPromptText(null); setFullPromptText(null); }}
                      className="absolute top-3 right-3 p-1 rounded-lg active:scale-95 transition-transform"
                      style={{ background: "var(--container-bg)", color: "var(--text-muted)", border: "none", cursor: "pointer" }}
                      aria-label="Cancella"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    onClick={async () => {
                      try { const text = await navigator.clipboard.readText(); setImportText(text); } catch { /* blocked in iframe */ }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl active:scale-95 transition-transform"
                    style={{
                      background: "color-mix(in srgb, var(--text-muted) 12%, transparent)",
                      color: "var(--text-default)", border: "none", cursor: "pointer",
                      fontSize: "var(--font-size-base)", fontFamily: "var(--font-sans)",
                    }}
                    aria-label="Incolla da clipboard"
                  >
                    <ClipboardPaste size={14} />
                    <span>Incolla</span>
                  </motion.button>
                  <motion.button
                    onClick={handleImport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
                    style={{
                      background: "var(--text-warning)", color: "var(--text-on-accent)",
                      border: "none", cursor: "pointer",
                      fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any,
                      fontFamily: "var(--font-sans)",
                    }}
                    aria-label="Analizza le differenze"
                  >
                    <FileEdit size={14} />
                    <span>Analizza diff</span>
                  </motion.button>
                </div>

                {parseError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "color-mix(in srgb, var(--text-accent) 10%, transparent)", color: "var(--text-accent)", fontSize: "var(--font-size-base)" }}>
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ DIFF RESULTS (inline) ═══ */}
          <AnimatePresence>
            {diffs && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              >
                <div className="w-full h-px mb-5" style={{ background: "var(--container-border)" }} />

                <div className="flex items-start gap-3">
                  <StepNum n={3} active={changedCount > 0} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>
                        Risultato: cosa e cambiato
                      </div>
                      {changedCount === 0 && (
                        <Badge color="var(--text-success)" background="color-mix(in srgb, var(--text-success) 14%, transparent)" className="px-2 py-0.5 rounded-lg">
                          Tutto sincronizzato!
                        </Badge>
                      )}
                    </div>

                    {/* Summary pills */}
                    {changedCount > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          { label: "Modificati", count: diffs.filter((d) => d.status === "modified").length, color: "var(--text-warning)" },
                          { label: "Nuovi", count: diffs.filter((d) => d.status === "added").length, color: "var(--text-success)" },
                          { label: "Eliminati", count: diffs.filter((d) => d.status === "deleted").length, color: "var(--text-accent)" },
                          { label: "Invariati", count: unchangedCount, color: "var(--text-muted)" },
                        ].filter((p) => p.count > 0).map((pill) => (
                          <Badge key={pill.label} color={pill.color} background={`color-mix(in srgb, ${pill.color} 10%, transparent)`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl">
                            <span style={{ fontWeight: "var(--weight-bold)" as any, fontFeatureSettings: "'tnum'" }}>{pill.count}</span>
                            {pill.label}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* File list */}
                    <div className="flex flex-col gap-1">
                      {diffs.filter((d) => d.status !== "unchanged" || showUnchanged).map((diff) => (
                        <div key={diff.path}>
                          <button
                            onClick={() => setExpandedFile(expandedFile === diff.path ? null : diff.path)}
                            className="w-full flex items-center justify-between py-2 px-3 rounded-lg active:scale-[0.99] transition-transform"
                            style={{ background: expandedFile === diff.path ? "var(--container-bg)" : "transparent", border: "none", cursor: diff.status !== "unchanged" ? "pointer" : "default", textAlign: "left" }}
                          >
                            <span className="type-data-sm" style={{ color: "var(--text-default)" }}>{diff.path}</span>
                            <StatusBadge status={diff.status} />
                          </button>
                          <AnimatePresence>
                            {expandedFile === diff.path && diff.status !== "unchanged" && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="overflow-hidden"
                              >
                                <div className="mx-3 mb-2 p-3 rounded-lg overflow-auto type-data-xs" style={{ background: "var(--container-bg)", maxHeight: "calc(var(--space-10) * 6.25)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                  {(diff.localContent || diff.makeContent || "—").slice(0, 3000)}
                                  {((diff.localContent?.length || 0) > 3000 || (diff.makeContent?.length || 0) > 3000) && (
                                    <span style={{ color: "var(--text-accent)", display: "block", marginTop: "var(--space-2)" }}>... troncato (contenuto completo nel prompt)</span>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {unchangedCount > 0 && (
                        <button
                          onClick={() => setShowUnchanged(!showUnchanged)}
                          className="flex items-center gap-1.5 px-3 py-2 type-data active:scale-95 transition-transform"
                          style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                        >
                          <ChevronDown size={12} style={{ transform: showUnchanged ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                          {showUnchanged ? "Nascondi" : `Mostra ${unchangedCount} file invariati`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ GENERATE PROMPT ═══ */}
          <AnimatePresence>
            {promptText && fullPromptText && changedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }} transition={{ type: "spring", stiffness: 500, damping: 28 }}
              >
                <div className="w-full h-px mb-5" style={{ background: "var(--container-border)" }} />

                <div className="flex items-start gap-3">
                  <StepNum n={4} active />
                  <div className="flex-1">
                    <div className="type-body-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, marginBottom: "var(--space-1)" }}>
                      Ultimo passo: fai applicare le modifiche a Claude
                    </div>

                    {/* ═══ MODE TOGGLE + METRICS ═══ */}
                    {(() => {
                      const activePrompt = promptMode === "compact" ? promptText : fullPromptText;
                      const compactTokens = estimateTokens(promptText);
                      const fullTokens = estimateTokens(fullPromptText);
                      const compactTurns = estimateTurns(compactTokens);
                      const fullTurns = estimateTurns(fullTokens);
                      const savedPct = fullTokens > 0 ? Math.round((1 - compactTokens / fullTokens) * 100) : 0;

                      return (
                        <div className="flex flex-col gap-3 mb-3">
                          {/* Mode toggle */}
                          <SegmentedControl
                            ariaLabel="Formato prompt"
                            value={promptMode}
                            onValueChange={setPromptMode}
                            tone="brand"
                            size="sm"
                            options={[
                              { value: "compact" as const, label: "Diff compatto", subLabel: `~${(compactTokens / 1000).toFixed(1)}K tok` },
                              { value: "full" as const, label: "File interi", subLabel: `~${(fullTokens / 1000).toFixed(1)}K tok` },
                            ]}
                            style={{ alignSelf: "flex-start" }}
                          />

                          {/* Savings metric */}
                          {savedPct > 5 && (
                            <div
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{
                                background: promptMode === "compact"
                                  ? "color-mix(in srgb, var(--text-success) 8%, transparent)"
                                  : "color-mix(in srgb, var(--text-muted) 6%, transparent)",
                              }}
                            >
                              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="type-label-xs" style={{ color: "var(--text-muted)" }}>Compatto</span>
                                    <div className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-success)", fontFeatureSettings: "'tnum'" }}>
                                      {(compactTokens / 1000).toFixed(1)}K
                                      <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--weight-normal)" as any, color: "var(--text-muted)", marginLeft: "var(--space-0-5)" }}>tok</span>
                                    </div>
                                  </div>
                                  <div style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>vs</div>
                                  <div>
                                    <span className="type-label-xs" style={{ color: "var(--text-muted)" }}>File interi</span>
                                    <div className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-muted)", fontFeatureSettings: "'tnum'", textDecoration: "line-through", opacity: 0.5 }}>
                                      {(fullTokens / 1000).toFixed(1)}K
                                      <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--weight-normal)" as any, marginLeft: "var(--space-0-5)" }}>tok</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    color="var(--text-success)"
                                    background="color-mix(in srgb, var(--text-success) 14%, transparent)"
                                    className="px-2 py-0.5 rounded-lg"
                                    style={{
                                      fontSize: "var(--font-size-sm)",
                                      fontWeight: "var(--weight-bold)" as any,
                                    }}
                                  >
                                    -{savedPct}%
                                  </Badge>
                                  <span style={{ color: "var(--text-muted)", fontSize: "var(--font-size-xs)" }}>
                                    ~{compactTurns === 1 ? "1 turno" : `${compactTurns} turni`}
                                    {compactTurns < fullTurns && (
                                      <span> (invece di {fullTurns})</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Instructions */}
                          <ol className="type-body-xs" style={{ color: "var(--text-muted)", margin: 0, paddingLeft: "calc(var(--space-1-5) * 3)", lineHeight: 1.8 }}>
                            <li>Clicca <span style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>il bottone verde qui sotto</span> per copiare il prompt</li>
                            <li><span style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>Torna alla chat di Figma Make</span> (chiudi i DevTools)</li>
                            <li><span style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>Incolla</span> (Ctrl+V / Cmd+V) e premi Invio</li>
                            <li>Claude applichera tutte le <span style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>{changedCount} modifiche</span> automaticamente</li>
                          </ol>

                          {/* Preview */}
                          <div
                            className="p-3 rounded-xl type-data"
                            style={{ background: "var(--container-bg)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)", maxHeight: "calc(var(--space-10) * 3.75)", overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}
                          >
                            {activePrompt.slice(0, 1000)}
                            {activePrompt.length > 1000 && (
                              <span style={{ color: "var(--text-accent)" }}>
                                {"\n"}... anteprima ({Math.ceil(activePrompt.length / 1024)} KB — il bottone copia tutto)
                              </span>
                            )}
                          </div>

                          {/* Copy button */}
                          <CopyBtn
                            text={activePrompt}
                            label={`Copia prompt ${promptMode === "compact" ? "compatto" : "completo"} (${changedCount} file)`}
                            fullWidth
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ QUICK REFERENCE ═══ */}
      <Surface className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={14} style={{ color: "var(--text-muted)" }} />
          <span className="type-label-sm" style={{ color: "var(--text-default)" }}>
            Comandi rapidi (da copiare)
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <CmdCopy cmd="node sync.mjs scan" note="mostra i file del progetto" />
          <CmdCopy cmd="node sync.mjs diff" note="cosa e cambiato dall'ultimo sync" />
          <CmdCopy cmd="node sync.mjs export > bundle.json" note="salva bundle in un file" />
          <CmdCopy cmd="node sync.mjs import bundle.json" note="importa bundle da file" />
        </div>
      </Surface>
    </div>
  );
}
