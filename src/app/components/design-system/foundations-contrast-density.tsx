import { AlertTriangle,Check,Eye,Ruler,X } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useEffect,useRef,useState } from "react";
import type { SectionEntry } from "./shared";
import {
AnatomyRow,
SectionHeader,
useDSContext
} from "./shared";

/* ═══════════════════════════════════════════════════════════
   UTILITY — WCAG Contrast ratio at runtime
   ═══════════════════════════════════════════════════════════ */

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length < 6) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbStringToHex(rgb: string): string | null {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return null;
  return "#" + m.slice(0, 3).map((v) => Number(v).toString(16).padStart(2, "0")).join("");
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type WcagLevel = "AAA" | "AA" | "AA18" | "FAIL";

function wcagLevel(ratio: number | null): WcagLevel {
  if (ratio === null) return "FAIL";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA18";
  return "FAIL";
}

function resolveToHex(el: HTMLElement, cssVar: string): string {
  const raw = getComputedStyle(el).getPropertyValue(cssVar).trim();
  if (!raw) return "";
  if (raw.startsWith("#")) return raw;
  if (raw.startsWith("rgb")) return rgbStringToHex(raw) || "";
  return "";
}

/* ═══════════════════════════════════════════════════════════
   DATA — M3 Safe Pairing Rules
   ═══════════════════════════════════════════════════════════ */

interface ContrastPair {
  id: string;
  fgVar: string;
  bgVar: string;
  label: string;
  category: "semantic" | "container" | "inverse" | "cross";
  required: WcagLevel;
}

const ALL_PAIRS: ContrastPair[] = [
  /* ── Semantic (role-based) ── */
  { id: "fg-bg", fgVar: "--foreground", bgVar: "--background", label: "Foreground / Background", category: "semantic", required: "AAA" },
  { id: "primary-pbg", fgVar: "--primary-foreground", bgVar: "--primary", label: "Primary FG / Primary", category: "semantic", required: "AA" },
  { id: "secondary-sbg", fgVar: "--secondary-foreground", bgVar: "--secondary", label: "Secondary FG / Secondary", category: "semantic", required: "AA" },
  { id: "cta-cbg", fgVar: "--cta-foreground", bgVar: "--cta", label: "CTA FG / CTA", category: "semantic", required: "AA" },
  { id: "destr-dbg", fgVar: "--destructive-foreground", bgVar: "--destructive", label: "Destructive FG / Destructive", category: "semantic", required: "AA" },
  { id: "muted-bg", fgVar: "--muted-foreground", bgVar: "--background", label: "Muted FG / Background", category: "semantic", required: "AA" },
  { id: "primary-bg", fgVar: "--primary", bgVar: "--background", label: "Primary / Background", category: "semantic", required: "AA18" },

  /* ── M3 Container (tonal) ── */
  { id: "pc-opc", fgVar: "--on-primary-container", bgVar: "--primary-container", label: "on-primary-container / primary-container", category: "container", required: "AA" },
  { id: "sc-osc", fgVar: "--on-secondary-container", bgVar: "--secondary-container", label: "on-secondary-container / secondary-container", category: "container", required: "AA" },
  { id: "tc-otc", fgVar: "--on-tertiary-container", bgVar: "--tertiary-container", label: "on-tertiary-container / tertiary-container", category: "container", required: "AA" },
  { id: "ec-oec", fgVar: "--on-error-container", bgVar: "--error-container", label: "on-error-container / error-container", category: "container", required: "AA" },
  { id: "surf-onsurf", fgVar: "--on-surface", bgVar: "--surface", label: "on-surface / surface", category: "container", required: "AAA" },
  { id: "surfv-surfcont", fgVar: "--on-surface-variant", bgVar: "--surface-container", label: "on-surface-variant / surface-container", category: "container", required: "AA" },

  /* ── Inverse ── */
  { id: "inv", fgVar: "--inverse-on-surface", bgVar: "--inverse-surface", label: "inverse-on-surface / inverse-surface", category: "inverse", required: "AA" },

  /* ── Cross-component (common patterns) ── */
  { id: "fg-surfcl", fgVar: "--foreground", bgVar: "--surface-container-low", label: "foreground / surface-container-low", category: "cross", required: "AAA" },
  { id: "muted-surfcl", fgVar: "--muted-foreground", bgVar: "--surface-container-low", label: "muted-foreground / surface-container-low", category: "cross", required: "AA" },
  { id: "muted-surfcont", fgVar: "--muted-foreground", bgVar: "--surface-container", label: "muted-foreground / surface-container", category: "cross", required: "AA18" },
  { id: "primary-surfch", fgVar: "--primary", bgVar: "--surface-container-high", label: "primary / surface-container-high (FAB surface)", category: "cross", required: "AA18" },
  { id: "fg-surfch", fgVar: "--foreground", bgVar: "--surface-container-high", label: "foreground / surface-container-high", category: "cross", required: "AA" },
];

/* ═══════════════════════════════════════════════════════════
   HOOK — resolve all pairs at runtime
   ═══════════════════════════════════════════════════════════ */

interface ResolvedPair extends ContrastPair {
  fgHex: string;
  bgHex: string;
  ratio: number | null;
  level: WcagLevel;
  pass: boolean;
}

function useContrastAudit(pairs: ContrastPair[], trigger?: unknown): { results: ResolvedPair[]; ref: React.RefObject<HTMLDivElement | null> } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<ResolvedPair[]>([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const resolved = pairs.map((p) => {
        const fgHex = resolveToHex(el, p.fgVar);
        const bgHex = resolveToHex(el, p.bgVar);
        const ratio = fgHex && bgHex ? contrastRatio(fgHex, bgHex) : null;
        const level = wcagLevel(ratio);
        const requiredIndex = { FAIL: 0, AA18: 1, AA: 2, AAA: 3 };
        const pass = requiredIndex[level] >= requiredIndex[p.required];
        return { ...p, fgHex, bgHex, ratio, level, pass };
      });
      setResults(resolved);
    });
    return () => cancelAnimationFrame(raf);
  }, [pairs, trigger]);

  return { results, ref };
}

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA — REGOLE CONTRASTO M3
   ═══════════════════════════════════════════════════════════ */

const SAFE_RULES = [
  { rule: "Sempre accoppiare container con on-container", example: "primary-container → on-primary-container", anti: "primary-container → primary-container (stesso token!)" },
  { rule: "Mai usare lo stesso token per bg e fg", example: "bg: --surface, fg: --on-surface", anti: "bg: --error-container, fg: --error-container" },
  { rule: "Testo su primary/CTA: usare il -foreground dedicato", example: "--cta → --cta-foreground", anti: "--cta → --foreground (non garantito)" },
  { rule: "Dot/swatch attivo: invertire fg quando bg = parent bg", example: "Dot bg: c.fg quando button bg = c.bg", anti: "Dot bg: c.bg su button bg c.bg (invisibile)" },
  { rule: "Stato attivo: il bordo deve usare il token fg, non outline-variant", example: "border: c.fg (contrasta con c.bg)", anti: "border: outline-variant (troppo tenue su container)" },
  { rule: "Muted-foreground: validare su OGNI superficie, non solo --background", example: "Testare muted-fg su surface-container, surface-container-high...", anti: "Assumere che AA su background = AA su tutte le superfici" },
];

const CATEGORY_LABELS: Record<string, string> = {
  semantic: "Ruoli Semantici",
  container: "Container M3",
  inverse: "Inverse (Tooltip/Snackbar)",
  cross: "Cross-Component (pattern reali)",
};

export function ContrastRulesSection() {
  const { darkMode } = useDSContext();
  const { results, ref } = useContrastAudit(ALL_PAIRS, darkMode);
  const [filterFails, setFilterFails] = useState(false);

  const displayed = filterFails ? results.filter((r) => !r.pass) : results;
  const failCount = results.filter((r) => !r.pass).length;
  const warnCount = results.filter((r) => r.pass && r.level === "AA18").length;
  const passCount = results.filter((r) => r.pass && r.level !== "AA18").length;

  const categories = ["semantic", "container", "inverse", "cross"] as const;

  return (
    <div className="flex flex-col gap-8" ref={ref as any}>
      <SectionHeader
        title="Regole Contrasto M3"
        description="Il sistema M3 definisce coppie cromatiche safe: ogni container ha il suo on-container, ogni ruolo il suo -foreground. L'audit live calcola il rapporto WCAG in tempo reale sui token risolti, catturando bug come coppie identiche o contrasto insufficiente."
      />

      {/* ── Summary strip ── */}
      <div className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: "Pass", count: passCount, color: "var(--cta)", bg: "color-mix(in srgb, var(--cta) 12%, transparent)" },
            { label: "AA solo 18pt", count: warnCount, color: "var(--tertiary)", bg: "color-mix(in srgb, var(--tertiary) 12%, transparent)" },
            { label: "Fail", count: failCount, color: "var(--destructive)", bg: "color-mix(in srgb, var(--destructive) 12%, transparent)" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: s.bg }}>
              <span className="type-data-lg" style={{ fontWeight: "var(--weight-bold)" as any, color: s.color, fontFeatureSettings: "'tnum'" }}>{s.count}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: s.color }}>{s.label}</span>
            </div>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setFilterFails((f) => !f)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg active:scale-95"
            style={{
              background: filterFails ? "color-mix(in srgb, var(--destructive) 12%, transparent)" : "var(--surface-container)",
              color: filterFails ? "var(--destructive)" : "var(--muted-foreground)",
              border: "1px solid var(--outline-variant)",
              fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any,
              cursor: "pointer", outline: "none",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <AlertTriangle size={13} />
            {filterFails ? "Mostra tutto" : "Solo fallimenti"}
          </button>
        </div>
      </div>

      {/* ── Safe Pairing Rules ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)" }}>Regole di accoppiamento sicuro</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", marginTop: "6px", lineHeight: "var(--leading-relaxed)" }}>
          Queste regole prevengono bug come il pallino invisibile nel FAB color selector. Seguirle garantisce contrasto WCAG in ogni combinazione light/dark.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {SAFE_RULES.map((r, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: "var(--surface-container)" }}>
              <div className="flex items-start gap-2">
                <Check size={14} style={{ color: "var(--cta)", flexShrink: 0, marginTop: "2px" }} />
                <div className="flex-1 min-w-0">
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{r.rule}</span>
                  <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{
                      background: "color-mix(in srgb, var(--cta) 10%, transparent)",
                      fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--cta)", fontFeatureSettings: "'tnum'",
                    }}>
                      <Check size={10} /> {r.example}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{
                      background: "color-mix(in srgb, var(--destructive) 10%, transparent)",
                      fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--destructive)", fontFeatureSettings: "'tnum'",
                    }}>
                      <X size={10} /> {r.anti}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live WCAG Audit Table ── */}
      {categories.map((cat) => {
        const catPairs = displayed.filter((r) => r.category === cat);
        if (catPairs.length === 0) return null;
        return (
          <div key={cat} className="surface-card overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
              <Eye size={14} style={{ color: "var(--primary)" }} />
              <span className="type-label" style={{ color: "var(--text-default)" }}>
                {CATEGORY_LABELS[cat]} — Audit live
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                    <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Coppia</th>
                    <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Antepr.</th>
                    <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Ratio</th>
                    <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Target</th>
                    <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Esito</th>
                  </tr>
                </thead>
                <tbody>
                  {catPairs.map((r) => {
                    const levelColor = r.level === "AAA" ? "var(--cta)"
                      : r.level === "AA" ? "var(--cta)"
                      : r.level === "AA18" ? "var(--tertiary)"
                      : "var(--destructive)";
                    const levelBg = r.level === "AAA" ? "color-mix(in srgb, var(--cta) 12%, transparent)"
                      : r.level === "AA" ? "color-mix(in srgb, var(--cta) 12%, transparent)"
                      : r.level === "AA18" ? "color-mix(in srgb, var(--tertiary) 12%, transparent)"
                      : "color-mix(in srgb, var(--destructive) 12%, transparent)";
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                        <td className="px-3 py-2.5">
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{r.label}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="type-code" style={{ color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>{r.fgHex || "—"}</span>
                            <span className="type-code" style={{ color: "var(--muted-foreground)" }}>/</span>
                            <span className="type-code" style={{ color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>{r.bgHex || "—"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center rounded-lg" style={{
                            width: "48px", height: "30px",
                            background: `var(${r.bgVar})`,
                            border: "1px solid var(--outline-variant)",
                          }}>
                            <span style={{
                              fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any,
                              color: `var(${r.fgVar})`,
                            }}>Aa</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="type-data" style={{
                            fontWeight: "var(--weight-bold)" as any, fontFeatureSettings: "'tnum'",
                            color: r.pass ? "var(--text-default)" : "var(--destructive)",
                          }}>
                            {r.ratio !== null ? r.ratio.toFixed(1) + ":1" : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="type-data" style={{ color: "var(--muted-foreground)" }}>
                            {r.required === "AAA" ? "7:1" : r.required === "AA" ? "4.5:1" : r.required === "AA18" ? "3:1" : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md" style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-bold)" as any,
                            background: levelBg, color: levelColor,
                          }}>
                            {r.pass ? <Check size={11} /> : <X size={11} />}
                            {r.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* ── Anti-pattern: the FAB dot bug ── */}
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} style={{ color: "var(--destructive)" }} />
          <span className="type-label" style={{ color: "var(--destructive)" }}>Anti-pattern — pallino colore invisibile</span>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginBottom: "12px" }}>
          Bug reale catturato: nel FAB color selector, il pallino usava <code className="type-code" style={{ padding: "1px 4px", borderRadius: "3px", background: "var(--surface-container)" }}>c.bg</code> come sfondo su un bottone con sfondo <code className="type-code" style={{ padding: "1px 4px", borderRadius: "3px", background: "var(--surface-container)" }}>c.bg</code> — rapporto 1:1, invisibile.
        </p>
        <div className="flex flex-wrap gap-4">
          {/* Before */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
              background: "var(--primary-container)", border: "1px solid var(--outline-variant)",
            }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--primary-container)", border: "1px solid var(--outline-variant)" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--on-primary-container)" }}>Primary</span>
            </div>
            <span className="flex items-center gap-1 type-code" style={{ color: "var(--destructive)" }}>
              <X size={10} /> Pallino invisibile
            </span>
          </div>
          {/* After */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
              background: "var(--primary-container)", border: "1px solid var(--on-primary-container)",
            }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--on-primary-container)", border: "2px solid var(--on-primary-container)" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--on-primary-container)" }}>Primary</span>
            </div>
            <span className="flex items-center gap-1 type-code" style={{ color: "var(--cta)" }}>
              <Check size={10} /> Dot in on-container
            </span>
          </div>
        </div>
      </div>

      {/* ── WCAG level reference ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)" }}>Soglie WCAG 2.1</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { level: "AAA", ratio: "7 : 1", desc: "Testo body, valori critici (ingredienti, score)", color: "var(--cta)" },
            { level: "AA", ratio: "4.5 : 1", desc: "Testo UI, label, chip, bottoni", color: "var(--cta)" },
            { level: "AA 18pt", ratio: "3 : 1", desc: "Testo grande (>= 18pt / 14pt bold), icone, decorativi", color: "var(--tertiary)" },
          ].map((w) => (
            <div key={w.level} className="p-3 rounded-xl" style={{ background: "var(--surface-container)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="type-code" style={{ fontWeight: "var(--weight-bold)" as any, color: w.color }}>{w.level}</span>
                <span className="type-data" style={{ color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>{w.ratio}</span>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", lineHeight: "var(--leading-body)" }}>{w.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA — DENSITÀ M3
   ═══════════════════════════════════════════════════════════ */

type DensityLevel = "expanded" | "comfortable" | "compact";

interface DensitySpec {
  targetHeight: number;
  iconSize: number;
  paddingY: number;
  paddingX: number;
  gap: number;
  chipHeight: number;
  inputHeight: number;
  fontSize: string;
  label: string;
  m3Scale: string;
}

const DENSITY_SPECS: Record<DensityLevel, DensitySpec> = {
  expanded: {
    targetHeight: 48, iconSize: 24, paddingY: 12, paddingX: 24,
    gap: 16, chipHeight: 40, inputHeight: 48, fontSize: "var(--font-size-xl)",
    label: "Expanded", m3Scale: "0 (default M3)",
  },
  comfortable: {
    targetHeight: 40, iconSize: 20, paddingY: 8, paddingX: 16,
    gap: 12, chipHeight: 36, inputHeight: 40, fontSize: "var(--font-size-lg)",
    label: "Comfortable", m3Scale: "-1 (Vulcan default)",
  },
  compact: {
    targetHeight: 32, iconSize: 18, paddingY: 4, paddingX: 12,
    gap: 8, chipHeight: 28, inputHeight: 32, fontSize: "var(--font-size-md)",
    label: "Compact", m3Scale: "-2 (iframe / mobile)",
  },
};

const DENSITY_TOKENS = [
  { token: "--density-target", desc: "Altezza minima touch target", unit: "px" },
  { token: "--density-icon", desc: "Dimensione icona default", unit: "px" },
  { token: "--density-py", desc: "Padding verticale componente", unit: "px" },
  { token: "--density-px", desc: "Padding orizzontale componente", unit: "px" },
  { token: "--density-gap", desc: "Gap tra elementi in gruppo", unit: "px" },
  { token: "--density-chip-h", desc: "Altezza chip / badge", unit: "px" },
  { token: "--density-input-h", desc: "Altezza campo input", unit: "px" },
];

const COMPONENT_DENSITY_MAPPING = [
  { component: "UnifiedChip", expanded: "h:40 px:16 gap:8 r:16", comfortable: "h:36 px:12 gap:6 r:12", compact: "h:28 px:10 gap:4 r:10" },
  { component: "Button Filled", expanded: "h:48 px:24 gap:8 r:full", comfortable: "h:40 px:20 gap:6 r:full", compact: "h:32 px:16 gap:4 r:full" },
  { component: "FAB", expanded: "56×56 icon:24 r:28", comfortable: "48×48 icon:22 r:24", compact: "40×40 icon:20 r:16" },
  { component: "Input", expanded: "h:48 px:16 r:12", comfortable: "h:40 px:12 r:12", compact: "h:32 px:10 r:8" },
  { component: "Switch Track", expanded: "52×32", comfortable: "48×28", compact: "40×24" },
  { component: "Tabs", expanded: "h:48 gap:0", comfortable: "h:40 gap:0", compact: "h:32 gap:0" },
  { component: "Navigation Item", expanded: "h:56 icon:24 r:full", comfortable: "h:48 icon:20 r:full", compact: "h:40 icon:18 r:full" },
  { component: "Card padding", expanded: "p:20", comfortable: "p:16", compact: "p:12" },
];

export function DensitySection() {
  const [active, setActive] = useState<DensityLevel>("comfortable");
  const spec = DENSITY_SPECS[active];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Densità"
        description="M3 Expressive definisce una scala di densità che regola target area, padding, gap e icon size in modo coordinato. Vulcan usa 'Comfortable' come default (scale -1), con 'Compact' per l'iframe e 'Expanded' per touch-first."
      />

      {/* ── Density toggle ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)" }}>Seleziona livello densità</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["expanded", "comfortable", "compact"] as DensityLevel[]).map((d) => (
            <button
              key={d}
              onClick={() => setActive(d)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-95"
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)",
                fontWeight: active === d ? "var(--weight-bold)" : "var(--weight-medium)" as any,
                background: active === d ? "var(--primary)" : "var(--surface-container)",
                color: active === d ? "var(--primary-foreground)" : "var(--muted-foreground)",
                border: active === d ? "1px solid var(--primary)" : "1px solid var(--outline-variant)",
                cursor: "pointer", outline: "none",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
            >
              <Ruler size={14} />
              {DENSITY_SPECS[d].label}
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="mt-5 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 700, damping: 35 }}
              className="flex flex-col gap-4"
            >
              {/* Simulated button */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      height: spec.targetHeight,
                      paddingLeft: spec.paddingX,
                      paddingRight: spec.paddingX,
                      gap: spec.gap / 2,
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: spec.fontSize,
                      fontWeight: "var(--weight-semibold)" as any,
                    }}
                  >
                    <Check size={spec.iconSize} />
                    <span>Conferma</span>
                  </div>
                  <span className="type-label text-center" style={{ color: "var(--muted-foreground)" }}>Button {spec.targetHeight}px</span>
                </div>

                {/* Simulated chip */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center rounded-xl"
                    style={{
                      height: spec.chipHeight,
                      paddingLeft: spec.paddingX * 0.75,
                      paddingRight: spec.paddingX * 0.75,
                      gap: spec.gap / 2,
                      background: "var(--surface-container)",
                      color: "var(--on-surface-variant)",
                      border: "1px solid var(--outline-variant)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: spec.fontSize,
                      fontWeight: "var(--weight-medium)" as any,
                    }}
                  >
                    <span>Napoletana</span>
                  </div>
                  <span className="type-label text-center" style={{ color: "var(--muted-foreground)" }}>Chip {spec.chipHeight}px</span>
                </div>

                {/* Simulated input */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center rounded-xl"
                    style={{
                      height: spec.inputHeight,
                      width: "160px",
                      paddingLeft: spec.paddingX,
                      paddingRight: spec.paddingX,
                      background: "var(--surface-container)",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--outline-variant)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: spec.fontSize,
                    }}
                  >
                    <span style={{ opacity: 0.5 }}>Cerca stile...</span>
                  </div>
                  <span className="type-label text-center" style={{ color: "var(--muted-foreground)" }}>Input {spec.inputHeight}px</span>
                </div>
              </div>

              {/* Touch target overlay */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-container)" }}>
                <div className="flex items-center justify-center" style={{
                  width: 48, height: 48,
                  borderRadius: "8px",
                  border: "2px dashed var(--outline-variant)",
                  position: "relative",
                }}>
                  <div style={{
                    width: spec.targetHeight,
                    height: spec.targetHeight,
                    borderRadius: "6px",
                    background: "color-mix(in srgb, var(--primary) 20%, transparent)",
                    border: "1px solid var(--primary)",
                  }} />
                </div>
                <div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                    Touch target: {spec.targetHeight}×{spec.targetHeight}px
                  </span>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "2px" }}>
                    M3 scala {spec.m3Scale} — minimo 48×48px tratteggiato
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Token reference table ── */}
      <div className="surface-card overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
          <span className="type-label" style={{ color: "var(--text-default)" }}>Tabella token densità</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Token</th>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>Expanded</th>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>Comfortable</th>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>Compact</th>
              </tr>
            </thead>
            <tbody>
              {DENSITY_TOKENS.map((t, i) => {
                const vals = [
                  DENSITY_SPECS.expanded,
                  DENSITY_SPECS.comfortable,
                  DENSITY_SPECS.compact,
                ];
                const propMap: Record<string, keyof DensitySpec> = {
                  "--density-target": "targetHeight",
                  "--density-icon": "iconSize",
                  "--density-py": "paddingY",
                  "--density-px": "paddingX",
                  "--density-gap": "gap",
                  "--density-chip-h": "chipHeight",
                  "--density-input-h": "inputHeight",
                };
                const prop = propMap[t.token];
                return (
                  <tr key={t.token} style={{ borderBottom: i < DENSITY_TOKENS.length - 1 ? "1px solid var(--outline-variant)" : "none" }}>
                    <td className="px-3 py-2">
                      <div className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{t.token}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "1px" }}>{t.desc}</div>
                    </td>
                    {vals.map((v, vi) => {
                      const val = prop ? v[prop] : "—";
                      const isActive = (["expanded", "comfortable", "compact"] as DensityLevel[])[vi] === active;
                      return (
                        <td key={vi} className="px-3 py-2 type-data" style={{
                          fontSize: "var(--font-size-lg)", fontFeatureSettings: "'tnum'",
                          fontWeight: isActive ? "var(--weight-bold)" : "var(--weight-medium)" as any,
                          color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                        }}>
                          {val}{t.unit}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Component density mapping ── */}
      <div className="surface-card overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
          <span className="type-label" style={{ color: "var(--text-default)" }}>Mappa componente × densità</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Componente</th>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>Expanded</th>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>Comfortable</th>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>Compact</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_DENSITY_MAPPING.map((c, i) => {
                const densityIdx = active === "expanded" ? 0 : active === "comfortable" ? 1 : 2;
                return (
                  <tr key={c.component} style={{ borderBottom: i < COMPONENT_DENSITY_MAPPING.length - 1 ? "1px solid var(--outline-variant)" : "none" }}>
                    <td className="px-3 py-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{c.component}</td>
                    {[c.expanded, c.comfortable, c.compact].map((val, vi) => (
                      <td key={vi} className="px-3 py-2 type-code" style={{
                        fontFeatureSettings: "'tnum'",
                        fontWeight: vi === densityIdx ? "var(--weight-bold)" : "var(--weight-medium)" as any,
                        color: vi === densityIdx ? "var(--primary)" : "var(--muted-foreground)",
                      }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Anatomy notes ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)" }}>Note implementazione</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Default" val="Comfortable (-1): Vulcan standard. Bilancia leggibilità e densità informativa." />
          <AnatomyRow prop="Iframe" val="Compact (-2): usare per widget embedded. Riduce altezza di ~20% su tutti i componenti." />
          <AnatomyRow prop="Touch" val="Expanded (0): M3 default. 48px touch target rispetta i 44px minimi Apple HIG." />
          <AnatomyRow prop="Scaling" val="Tutti i valori scalano linearmente. Il gap tra livelli e costante: ~8px per step." />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "contrast", label: "Regole Contrasto M3", group: "f", Component: ContrastRulesSection },
  { id: "density", label: "Densità", group: "f", Component: DensitySection },
];