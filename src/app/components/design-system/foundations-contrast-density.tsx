import { AlertTriangle,Check,Eye,Ruler,X } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useEffect,useRef,useState } from "react";
import type { SectionEntry } from "./shared";
import {
AnatomyRow,
SectionHeader,
useDSContext
} from "./shared";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

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
  { id: "fg-bg", fgVar: "--foreground", bgVar: "--background", label: showcaseMessage("components.design-system.foundations-contrast-density.foreground-background-94b36418"), category: "semantic", required: "AAA" },
  { id: "primary-pbg", fgVar: "--primary-foreground", bgVar: "--primary", label: showcaseMessage("components.design-system.foundations-contrast-density.primary-fg-primary-39d70341"), category: "semantic", required: "AA" },
  { id: "secondary-sbg", fgVar: "--secondary-foreground", bgVar: "--secondary", label: showcaseMessage("components.design-system.foundations-contrast-density.secondary-fg-secondary-c9e8c33a"), category: "semantic", required: "AA" },
  { id: "cta-cbg", fgVar: "--cta-foreground", bgVar: "--cta", label: showcaseMessage("components.design-system.foundations-contrast-density.cta-fg-cta-9dfaeb7b"), category: "semantic", required: "AA" },
  { id: "destr-dbg", fgVar: "--destructive-foreground", bgVar: "--destructive", label: showcaseMessage("components.design-system.foundations-contrast-density.destructive-fg-destructive-f4cef65e"), category: "semantic", required: "AA" },
  { id: "muted-bg", fgVar: "--muted-foreground", bgVar: "--background", label: showcaseMessage("components.design-system.foundations-contrast-density.muted-fg-background-4e5e2140"), category: "semantic", required: "AA" },
  { id: "primary-bg", fgVar: "--primary", bgVar: "--background", label: showcaseMessage("components.design-system.foundations-contrast-density.primary-background-1f31c868"), category: "semantic", required: "AA" },

  /* ── M3 Container (tonal) ── */
  { id: "pc-opc", fgVar: "--on-primary-container", bgVar: "--primary-container", label: showcaseMessage("components.design-system.foundations-contrast-density.on-primary-container-primary-container-7e8ce78d"), category: "container", required: "AA" },
  { id: "sc-osc", fgVar: "--on-secondary-container", bgVar: "--secondary-container", label: showcaseMessage("components.design-system.foundations-contrast-density.on-secondary-container-secondary-container-d4916285"), category: "container", required: "AA" },
  { id: "tc-otc", fgVar: "--on-tertiary-container", bgVar: "--tertiary-container", label: showcaseMessage("components.design-system.foundations-contrast-density.on-tertiary-container-tertiary-container-95e4c9bb"), category: "container", required: "AA" },
  { id: "ec-oec", fgVar: "--on-error-container", bgVar: "--error-container", label: showcaseMessage("components.design-system.foundations-contrast-density.on-error-container-error-container-4a82a490"), category: "container", required: "AA" },
  { id: "surf-onsurf", fgVar: "--on-surface", bgVar: "--surface", label: showcaseMessage("components.design-system.foundations-contrast-density.on-surface-surface-e5b788a7"), category: "container", required: "AAA" },
  { id: "surfv-surfcont", fgVar: "--on-surface-variant", bgVar: "--surface-container", label: showcaseMessage("components.design-system.foundations-contrast-density.on-surface-variant-surface-container-5263334c"), category: "container", required: "AA" },

  /* ── Inverse ── */
  { id: "inv", fgVar: "--inverse-on-surface", bgVar: "--inverse-surface", label: showcaseMessage("components.design-system.foundations-contrast-density.inverse-on-surface-inverse-surface-9d4002a8"), category: "inverse", required: "AA" },

  /* ── Cross-component (common patterns) ── */
  { id: "fg-surfcl", fgVar: "--foreground", bgVar: "--surface-container-low", label: showcaseMessage("components.design-system.foundations-contrast-density.foreground-surface-container-low-d89faa3d"), category: "cross", required: "AAA" },
  { id: "muted-surfcl", fgVar: "--muted-foreground", bgVar: "--surface-container-low", label: showcaseMessage("components.design-system.foundations-contrast-density.muted-foreground-surface-container-low-92824378"), category: "cross", required: "AA" },
  { id: "muted-surfcont", fgVar: "--muted-foreground", bgVar: "--surface-container", label: showcaseMessage("components.design-system.foundations-contrast-density.muted-foreground-surface-container-d87bc0e5"), category: "cross", required: "AA" },
  { id: "primary-surfch", fgVar: "--primary", bgVar: "--surface-container-high", label: showcaseMessage("components.design-system.foundations-contrast-density.primary-surface-container-high-non-text-ic-3407b68b"), category: "cross", required: "AA18" },
  { id: "fg-surfch", fgVar: "--foreground", bgVar: "--surface-container-high", label: showcaseMessage("components.design-system.foundations-contrast-density.foreground-surface-container-high-e1960599"), category: "cross", required: "AA" },
  { id: "text-default-page", fgVar: "--text-default", bgVar: "--container-page", label: showcaseMessage("components.design-system.foundations-contrast-density.text-default-container-page-5f2dd978"), category: "cross", required: "AAA" },
  { id: "text-muted-page", fgVar: "--text-muted", bgVar: "--container-page", label: showcaseMessage("components.design-system.foundations-contrast-density.text-muted-container-page-b05ff482"), category: "cross", required: "AA" },
  { id: "text-muted-container", fgVar: "--text-muted", bgVar: "--container-bg", label: showcaseMessage("components.design-system.foundations-contrast-density.text-muted-container-bg-4c5e9eca"), category: "cross", required: "AA" },
  { id: "text-subtle-container", fgVar: "--text-subtle", bgVar: "--container-bg", label: showcaseMessage("components.design-system.foundations-contrast-density.text-subtle-container-bg-77c8d129"), category: "cross", required: "AA" },
  { id: "text-accent-page", fgVar: "--text-accent", bgVar: "--container-page", label: showcaseMessage("components.design-system.foundations-contrast-density.text-accent-container-page-198a0d12"), category: "cross", required: "AA" },
  { id: "text-accent-container", fgVar: "--text-accent", bgVar: "--container-bg", label: showcaseMessage("components.design-system.foundations-contrast-density.text-accent-container-bg-9972a494"), category: "cross", required: "AA" },
  { id: "text-success-page", fgVar: "--text-success", bgVar: "--container-page", label: showcaseMessage("components.design-system.foundations-contrast-density.text-success-container-page-76249e13"), category: "cross", required: "AA" },
  { id: "text-warning-page", fgVar: "--text-warning", bgVar: "--container-page", label: showcaseMessage("components.design-system.foundations-contrast-density.text-warning-container-page-3b8a7ce3"), category: "cross", required: "AA" },
  { id: "text-error-page", fgVar: "--text-error", bgVar: "--container-page", label: showcaseMessage("components.design-system.foundations-contrast-density.text-error-container-page-fe7918f9"), category: "cross", required: "AA" },
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

function ContrastRulesSection() {
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
        title={showcaseMessage("components.design-system.foundations-contrast-density.regole-contrasto-m3-f2633d9e")}
        description={showcaseMessage("components.design-system.foundations-contrast-density.il-sistema-m3-definisce-coppie-cromatiche--eed77405")}
      />

      {/* ── Summary strip ── */}
      <div className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: showcaseMessage("components.design-system.foundations-contrast-density.pass-d7cd56f2"), count: passCount, color: "var(--cta)", bg: "color-mix(in srgb, var(--cta) 12%, transparent)" },
            { label: showcaseMessage("components.design-system.foundations-contrast-density.aa-solo-18pt-a9e16cab"), count: warnCount, color: "var(--tertiary)", bg: "color-mix(in srgb, var(--tertiary) 12%, transparent)" },
            { label: showcaseMessage("components.design-system.foundations-contrast-density.fail-2758e327"), count: failCount, color: "var(--destructive)", bg: "color-mix(in srgb, var(--destructive) 12%, transparent)" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(s.bg, false) } as any}>
              <span className="type-data-lg dsx-s-9a7af03de3" style={{ "--dsx-color": toShowcaseCssValue(s.color, false) } as any}>{s.count}</span>
              <span style={{ "--dsx-color": toShowcaseCssValue(s.color, false) } as any} className="dsx-s-fa740e6864">{s.label}</span>
            </div>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setFilterFails((f) => !f)}
            aria-pressed={filterFails}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg active:scale-95 dsx-s-609cba803a"
            style={{ "--dsx-background": toShowcaseCssValue(filterFails ? "color-mix(in srgb, var(--destructive) 12%, transparent)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(filterFails ? "var(--destructive)" : "var(--muted-foreground)", false) } as any}
          >
            <AlertTriangle size={13} />
            {filterFails ? showcaseMessage("components.design-system.foundations-contrast-density.mostra-tutto-d72ef3ee") : showcaseMessage("components.design-system.foundations-contrast-density.solo-fallimenti-ea7baec9")}
          </button>
        </div>
      </div>

      {/* ── Safe Pairing Rules ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-contrast-density.regole-di-accoppiamento-sicuro-7472b9b9")}</span>
        <p className="dsx-s-b8f661b746">
          {showcaseMessage("components.design-system.foundations-contrast-density.queste-regole-prevengono-bug-come-il-palli-0ad91b82")}</p>
        <div className="mt-4 flex flex-col gap-2">
          {SAFE_RULES.map((r, i) => (
            <div key={i} className="p-3 rounded-xl dsx-s-e4f209c55b">
              <div className="flex items-start gap-2">
                <Check size={14} className="dsx-s-8a972be2c2" />
                <div className="flex-1 min-w-0">
                  <span className="dsx-s-ce5ec66ff8">{r.rule}</span>
                  <div className="mt-1.5 flex flex-col sm:flex-row gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md dsx-s-3940bed797">
                      <Check size={10} /> {r.example}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md dsx-s-05f3620dc0">
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
            <div className="px-4 py-3 flex items-center gap-2 dsx-s-ff83771d47">
              <Eye size={14} className="dsx-s-b0e08465c2" />
              <span className="type-label dsx-s-a57c4bed75">
                {CATEGORY_LABELS[cat]} {showcaseMessage("components.design-system.foundations-contrast-density.audit-live-2c1cde37")}</span>
            </div>
            <div
              className="overflow-x-auto"
              role="region"
              tabIndex={0}
              aria-label={`${CATEGORY_LABELS[cat]} ${showcaseMessage("components.design-system.foundations-contrast-density.audit-live-2c1cde37")}`}
            >
              <table className="w-full dsx-s-97a92178cd">
                <thead>
                  <tr className="dsx-s-ff83771d47">
                    <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.coppia-569cf0cb")}</th>
                    <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.antepr-b05e519f")}</th>
                    <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.ratio-794f65e9")}</th>
                    <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.target-61ad50a9")}</th>
                    <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.esito-135696b9")}</th>
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
                      <tr key={r.id} className="dsx-s-ff83771d47">
                        <td className="px-3 py-2.5">
                          <span className="dsx-s-7429dbc22f">{r.label}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="type-code dsx-s-9f96c1f09f">{r.fgHex || "—"}</span>
                            <span className="type-code dsx-s-63782726c0">/</span>
                            <span className="type-code dsx-s-9f96c1f09f">{r.bgHex || "—"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center rounded-lg dsx-s-c0bf0b76c1" style={{ "--dsx-background": toShowcaseCssValue(`var(${r.bgVar})`, false) } as any}>
                            <span style={{ "--dsx-color": toShowcaseCssValue(`var(${r.fgVar})`, false) } as any} className="dsx-s-4af75abf92">{showcaseMessage("components.design-system.foundations-contrast-density.aa-2c419ecc")}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="type-data dsx-s-38722267fe" style={{ "--dsx-color": toShowcaseCssValue(r.pass ? "var(--text-default)" : "var(--destructive)", false) } as any}>
                            {r.ratio !== null ? r.ratio.toFixed(1) + ":1" : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="type-data dsx-s-63782726c0">
                            {r.required === "AAA" ? "7:1" : r.required === "AA" ? "4.5:1" : r.required === "AA18" ? "3:1" : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md dsx-s-30bc83d73d" style={{ "--dsx-background": toShowcaseCssValue(levelBg, false), "--dsx-color": toShowcaseCssValue(levelColor, false) } as any}>
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
          <AlertTriangle size={16} className="dsx-s-3372a44748" />
          <span className="type-label dsx-s-3372a44748">{showcaseMessage("components.design-system.foundations-contrast-density.anti-pattern-pallino-colore-invisibile-d99ac9f5")}</span>
        </div>
        <p className="dsx-s-218591018c">
          {showcaseMessage("components.design-system.foundations-contrast-density.bug-reale-catturato-nel-fab-color-selector-0c406ce5")}<code className="type-code dsx-s-98606962cc">{showcaseMessage("components.design-system.foundations-contrast-density.c-bg-d824220f")}</code> {showcaseMessage("components.design-system.foundations-contrast-density.come-sfondo-su-un-bottone-con-sfondo-4e40540a")}<code className="type-code dsx-s-98606962cc">{showcaseMessage("components.design-system.foundations-contrast-density.c-bg-d824220f")}</code> {showcaseMessage("components.design-system.foundations-contrast-density.rapporto-1-1-invisibile-a5179c5e")}</p>
        <div className="flex flex-wrap gap-4">
          {/* Before */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg dsx-s-f0fcfb8e95">
              <div className="w-3 h-3 rounded-full dsx-s-f0fcfb8e95" />
              <span className="dsx-s-dae7c2d5cd">{showcaseMessage("components.design-system.foundations-contrast-density.primary-a9a96ec0")}</span>
            </div>
            <span className="flex items-center gap-1 type-code dsx-s-3372a44748">
              <X size={10} /> {showcaseMessage("components.design-system.foundations-contrast-density.pallino-invisibile-24b5d572")}</span>
          </div>
          {/* After */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg dsx-s-e2e480801e">
              <div className="w-3 h-3 rounded-full dsx-s-2f97c46c98" />
              <span className="dsx-s-dae7c2d5cd">{showcaseMessage("components.design-system.foundations-contrast-density.primary-a9a96ec0")}</span>
            </div>
            <span className="flex items-center gap-1 type-code dsx-s-5e98e84d69">
              <Check size={10} /> {showcaseMessage("components.design-system.foundations-contrast-density.dot-in-on-container-ffb25549")}</span>
          </div>
        </div>
      </div>

      {/* ── WCAG level reference ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-contrast-density.soglie-wcag-2-1-8f0ad668")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { level: "AAA", ratio: "7 : 1", desc: showcaseMessage("components.design-system.foundations-contrast-density.testo-body-valori-critici-ingredienti-scor-d9776fb3"), color: "var(--cta)" },
            { level: "AA", ratio: "4.5 : 1", desc: showcaseMessage("components.design-system.foundations-contrast-density.testo-ui-label-chip-bottoni-d2b7215f"), color: "var(--cta)" },
            { level: "AA 18pt", ratio: "3 : 1", desc: showcaseMessage("components.design-system.foundations-contrast-density.testo-grande-18pt-14pt-bold-icone-decorati-67f30c24"), color: "var(--tertiary)" },
          ].map((w) => (
            <div key={w.level} className="p-3 rounded-xl dsx-s-e4f209c55b">
              <div className="flex items-center gap-2 mb-1">
                <span className="type-code dsx-s-fbd15b3967" style={{ "--dsx-color": toShowcaseCssValue(w.color, false) } as any}>{w.level}</span>
                <span className="type-data dsx-s-9f96c1f09f">{w.ratio}</span>
              </div>
              <span className="dsx-s-d65636e052">{w.desc}</span>
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
    label: showcaseMessage("components.design-system.foundations-contrast-density.expanded-6d170474"), m3Scale: "0 (default M3)",
  },
  comfortable: {
    targetHeight: 40, iconSize: 20, paddingY: 8, paddingX: 16,
    gap: 12, chipHeight: 36, inputHeight: 40, fontSize: "var(--font-size-lg)",
    label: showcaseMessage("components.design-system.foundations-contrast-density.comfortable-2313707a"), m3Scale: "-1 (Vulcan default)",
  },
  compact: {
    targetHeight: 32, iconSize: 18, paddingY: 4, paddingX: 12,
    gap: 8, chipHeight: 28, inputHeight: 32, fontSize: "var(--font-size-md)",
    label: showcaseMessage("components.design-system.foundations-contrast-density.compact-1df39aa5"), m3Scale: "-2 (iframe / mobile)",
  },
};

const DENSITY_TOKENS = [
  { token: "--density-target", desc: showcaseMessage("components.design-system.foundations-contrast-density.altezza-minima-touch-target-6210272f"), unit: "px" },
  { token: "--density-icon", desc: showcaseMessage("components.design-system.foundations-contrast-density.dimensione-icona-default-3df1b9b6"), unit: "px" },
  { token: "--density-py", desc: showcaseMessage("components.design-system.foundations-contrast-density.padding-verticale-componente-8840f8c4"), unit: "px" },
  { token: "--density-px", desc: showcaseMessage("components.design-system.foundations-contrast-density.padding-orizzontale-componente-585e8a39"), unit: "px" },
  { token: "--density-gap", desc: showcaseMessage("components.design-system.foundations-contrast-density.gap-tra-elementi-in-gruppo-06f38561"), unit: "px" },
  { token: "--density-chip-h", desc: showcaseMessage("components.design-system.foundations-contrast-density.altezza-chip-badge-08f6e9ba"), unit: "px" },
  { token: "--density-input-h", desc: showcaseMessage("components.design-system.foundations-contrast-density.altezza-campo-input-74e21747"), unit: "px" },
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

function DensitySection() {
  const [active, setActive] = useState<DensityLevel>("comfortable");
  const spec = DENSITY_SPECS[active];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations-contrast-density.densita-8a2a7365")}
        description={showcaseMessage("components.design-system.foundations-contrast-density.m3-expressive-definisce-una-scala-di-densi-77e74557")}
      />

      {/* ── Density toggle ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-contrast-density.seleziona-livello-densita-bdd9f733")}</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["expanded", "comfortable", "compact"] as DensityLevel[]).map((d) => (
            <button
              key={d}
              onClick={() => setActive(d)}
              aria-pressed={active === d}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 dsx-s-f23a7de82c"
              style={{ "--dsx-font-weight": toShowcaseCssValue(active === d ? "var(--weight-bold)" : "var(--weight-medium)" as any, true), "--dsx-background": toShowcaseCssValue(active === d ? "var(--primary)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(active === d ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(active === d ? "1px solid var(--primary)" : "1px solid var(--outline-variant)", false) } as any}
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
              transition={showcaseTransition.preset_304998007a}
              className="flex flex-col gap-4"
            >
              {/* Simulated button */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-full dsx-s-3d8df2563d"
                    style={{ "--dsx-height": toShowcaseCssValue(spec.targetHeight, false), "--dsx-padding-left": toShowcaseCssValue(spec.paddingX, false), "--dsx-padding-right": toShowcaseCssValue(spec.paddingX, false), "--dsx-gap": toShowcaseCssValue(spec.gap / 2, false), "--dsx-font-size": toShowcaseCssValue(spec.fontSize, false) } as any}
                  >
                    <Check size={spec.iconSize} />
                    <span>{showcaseMessage("components.design-system.foundations-contrast-density.conferma-8d25542a")}</span>
                  </div>
                  <span className="type-label text-center dsx-s-63782726c0">{showcaseMessage("components.design-system.foundations-contrast-density.button-b709c519")}{spec.targetHeight}px</span>
                </div>

                {/* Simulated chip */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center rounded-xl dsx-s-251d65f189"
                    style={{ "--dsx-height": toShowcaseCssValue(spec.chipHeight, false), "--dsx-padding-left": toShowcaseCssValue(spec.paddingX * 0.75, false), "--dsx-padding-right": toShowcaseCssValue(spec.paddingX * 0.75, false), "--dsx-gap": toShowcaseCssValue(spec.gap / 2, false), "--dsx-font-size": toShowcaseCssValue(spec.fontSize, false) } as any}
                  >
                    <span>{showcaseMessage("components.design-system.foundations-contrast-density.napoletana-97c08737")}</span>
                  </div>
                  <span className="type-label text-center dsx-s-63782726c0">{showcaseMessage("components.design-system.foundations-contrast-density.chip-305119d8")}{spec.chipHeight}px</span>
                </div>

                {/* Simulated input */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center rounded-xl dsx-s-1d1f6f8f6f"
                    style={{ "--dsx-height": toShowcaseCssValue(spec.inputHeight, false), "--dsx-padding-left": toShowcaseCssValue(spec.paddingX, false), "--dsx-padding-right": toShowcaseCssValue(spec.paddingX, false), "--dsx-font-size": toShowcaseCssValue(spec.fontSize, false) } as any}
                  >
                    <span className="dsx-s-520d3a5350 ds-showcase__secondary-ink">{showcaseMessage("components.design-system.foundations-contrast-density.cerca-stile-728f3264")}</span>
                  </div>
                  <span className="type-label text-center dsx-s-63782726c0">{showcaseMessage("components.design-system.foundations-contrast-density.input-c568d584")}{spec.inputHeight}px</span>
                </div>
              </div>

              {/* Touch target overlay */}
              <div className="flex items-center gap-3 p-3 rounded-xl dsx-s-e4f209c55b">
                <div className="flex items-center justify-center dsx-s-6ac23bae77">
                  <div style={{ "--dsx-width": toShowcaseCssValue(spec.targetHeight, false), "--dsx-height": toShowcaseCssValue(spec.targetHeight, false) } as any} className="dsx-s-9e4ba00062" />
                </div>
                <div>
                  <span className="dsx-s-ab460f3048">
                    {showcaseMessage("components.design-system.foundations-contrast-density.touch-target-d684ee64")}{spec.targetHeight}×{spec.targetHeight}px
                  </span>
                  <div className="dsx-s-afeb3f0292">
                    {showcaseMessage("components.design-system.foundations-contrast-density.m3-scala-b5e6b421")}{spec.m3Scale} {showcaseMessage("components.design-system.foundations-contrast-density.minimo-48-48px-tratteggiato-61fd0b7f")}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Token reference table ── */}
      <div className="surface-card overflow-hidden">
        <div className="px-4 py-3 dsx-s-ff83771d47">
          <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-contrast-density.tabella-token-densita-1fae5c33")}</span>
        </div>
        <div
          className="overflow-x-auto"
          role="region"
          tabIndex={0}
          aria-label={showcaseMessage("components.design-system.foundations-contrast-density.tabella-token-densita-1fae5c33")}
        >
          <table className="w-full dsx-s-97a92178cd">
            <thead>
              <tr className="dsx-s-ff83771d47">
                <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.token-a1141eb9")}</th>
                <th className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{showcaseMessage("components.design-system.foundations-contrast-density.expanded-6d170474")}</th>
                <th className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{showcaseMessage("components.design-system.foundations-contrast-density.comfortable-2313707a")}</th>
                <th className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{showcaseMessage("components.design-system.foundations-contrast-density.compact-1df39aa5")}</th>
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
                  <tr key={t.token} style={{ "--dsx-border-bottom": toShowcaseCssValue(i < DENSITY_TOKENS.length - 1 ? "1px solid var(--outline-variant)" : "none", false) } as any} className="dsx-s-57dac8b284">
                    <td className="px-3 py-2">
                      <div className="type-data dsx-s-24d7245ee0">{t.token}</div>
                      <div className="dsx-s-aa061c2dfb">{t.desc}</div>
                    </td>
                    {vals.map((v, vi) => {
                      const val = prop ? v[prop] : "—";
                      const isActive = (["expanded", "comfortable", "compact"] as DensityLevel[])[vi] === active;
                      return (
                        <td key={vi} className="px-3 py-2 type-data dsx-s-dd052a56dd" style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary)" : "var(--muted-foreground)", false) } as any}>
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
        <div className="px-4 py-3 dsx-s-ff83771d47">
          <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-contrast-density.mappa-componente-densita-0d891197")}</span>
        </div>
        <div
          className="overflow-x-auto"
          role="region"
          tabIndex={0}
          aria-label={showcaseMessage("components.design-system.foundations-contrast-density.mappa-componente-densita-0d891197")}
        >
          <table className="w-full dsx-s-97a92178cd">
            <thead>
              <tr className="dsx-s-ff83771d47">
                <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-contrast-density.componente-1414bb26")}</th>
                <th className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{showcaseMessage("components.design-system.foundations-contrast-density.expanded-6d170474")}</th>
                <th className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{showcaseMessage("components.design-system.foundations-contrast-density.comfortable-2313707a")}</th>
                <th className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{showcaseMessage("components.design-system.foundations-contrast-density.compact-1df39aa5")}</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_DENSITY_MAPPING.map((c, i) => {
                const densityIdx = active === "expanded" ? 0 : active === "comfortable" ? 1 : 2;
                return (
                  <tr key={c.component} style={{ "--dsx-border-bottom": toShowcaseCssValue(i < COMPONENT_DENSITY_MAPPING.length - 1 ? "1px solid var(--outline-variant)" : "none", false) } as any} className="dsx-s-57dac8b284">
                    <td className="px-3 py-2 dsx-s-7429dbc22f">{c.component}</td>
                    {[c.expanded, c.comfortable, c.compact].map((val, vi) => (
                      <td key={vi} className="px-3 py-2 type-code dsx-s-0a9b6a4a2e" style={{ "--dsx-font-weight": toShowcaseCssValue(vi === densityIdx ? "var(--weight-bold)" : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(vi === densityIdx ? "var(--primary)" : "var(--muted-foreground)", false) } as any}>
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
        <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-contrast-density.note-implementazione-667500cd")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.foundations-contrast-density.default-808d7dca")} val={showcaseMessage("components.design-system.foundations-contrast-density.comfortable-1-vulcan-standard-bilancia-leg-43d85f46")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.foundations-contrast-density.iframe-353fb279")} val={showcaseMessage("components.design-system.foundations-contrast-density.compact-2-usare-per-widget-embedded-riduce-a3da0af7")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.foundations-contrast-density.touch-e3f139ab")} val={showcaseMessage("components.design-system.foundations-contrast-density.expanded-0-m3-default-48px-touch-target-ri-3474b72c")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.foundations-contrast-density.scaling-0b4193c5")} val={showcaseMessage("components.design-system.foundations-contrast-density.tutti-i-valori-scalano-linearmente-il-gap--9cfbed4e")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "contrast", label: showcaseMessage("components.design-system.foundations-contrast-density.regole-contrasto-m3-f2633d9e"), group: "f", Component: ContrastRulesSection },
  { id: "density", label: showcaseMessage("components.design-system.foundations-contrast-density.densita-8a2a7365"), group: "f", Component: DensitySection },
];
