import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Layers,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import {
  DSCtx,
  SectionNumCtx,
} from "./shared";
import type { SectionEntry } from "./shared";

/* ── Registries (each file is self-contained) ── */
import { ENTRIES as FOUND_CORE } from "./foundations";
import { ENTRIES as FOUND_DYN } from "./foundations-dynamics";
import { ENTRIES as FOUND_GLASS } from "./foundations-glass";
import { ENTRIES as FOUND_LOGO } from "./foundations-logo";
import { ENTRIES as FOUND_EXT } from "./foundations-ext";
import { ENTRIES as FOUND_M3E } from "./foundations-m3e";
import { ENTRIES as FOUND_CD } from "./foundations-contrast-density";
import { ENTRIES as COMP_A } from "./components-a";
import { ENTRIES as COMP_B } from "./components-b";
import { ENTRIES as COMP_C } from "./components-c";
import { ENTRIES as COMP_D } from "./components-d";
import { ENTRIES as COMP_F } from "./components-f";
import { ENTRIES as COMP_G } from "./components-g";
import { ENTRIES as COMP_G2 } from "./components-g2";
import { ENTRIES as COMP_H } from "./components-h";
import { ENTRIES as COMP_RUNTIME } from "./components-runtime";
import { ENTRIES as PAT_TMPL } from "./patterns-templates";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   ORDER DEFINITION — SINGLE SOURCE OF TRUTH

   To reorder: move IDs in these arrays.
   To add: export a new ENTRIES item from the component file,
           then add its ID here.
   Auto-numbering: foundations get 01..N, components get C01..N.
   ═══════════════════════════════════════════════════════════ */

/** All registered entries, keyed by id for lookup */
const ALL_ENTRIES = new Map<string, SectionEntry>();
[
  FOUND_CORE, FOUND_DYN, FOUND_GLASS, FOUND_LOGO, FOUND_EXT, FOUND_M3E, FOUND_CD,
  COMP_A, COMP_B, COMP_C, COMP_D, COMP_F, COMP_G, COMP_G2, COMP_H, COMP_RUNTIME, PAT_TMPL,
].forEach((arr) => arr.forEach((e) => ALL_ENTRIES.set(e.id, e)));

/** Foundation order (reorder here → auto-renumbered) */
const FOUNDATION_ORDER: string[] = [
  // Core visual tokens
  "colors",           // Sistema Cromatico
  "typography",       // Tipografia
  "spacing",          // Spaziatura
  "shape",            // Forma (Border Radius)
  "elevation",        // Elevazione
  "states",           // State Layers
  // Motion & icons
  "motion",           // Motion System
  "icons",            // Iconografia
  // Palette & effects
  "gradients",        // Gradienti
  "time-palette",     // Time-of-Day Palette
  "glass",            // Glassmorphism & Liquid Glass
  "logo",             // Logo & Brand Identity
  // Advanced patterns
  "xshapes",          // Expressive Shapes
  "images",           // Image Treatment
  "emphasis",         // Emphasis System
  "container-transform", // Container Transform
  // Cross-cutting (chiude le fondamenta)
  "contrast",         // Regole Contrasto M3
  "density",          // Densità
  "a11y",             // Accessibilità
];

/** Component order (reorder here → auto-renumbered as C01..C26) */
const COMPONENT_ORDER: string[] = [
  // ── Primitivi Input ──
  "buttons",          // Bottoni
  "iconbutton",       // Icon Button
  "fab",              // FAB / Extended FAB
  "switch",           // Switch
  "checkbox",         // Checkbox
  "radio",            // Radio Button
  "chips",            // UnifiedChip
  "inputs",           // Input & Slider
  "select",           // Select / Dropdown
  // ── Navigazione ──
  "tabs",             // Tabs
  "segmented",        // Segmented Button
  "navbar",           // NavigationBar
  // ── Data Display ──
  "badges",           // Badge & InlineTip
  "scorering",        // ScoreRing
  "statstrip",        // RecipeStatStrip
  "progress",         // Progress Indicators
  "loading",          // Loading Indicator (M3 Nuovo)
  "divider",          // Divider
  // ── Feedback / Overlay ──
  "tooltip",          // Tooltip
  "snackbar",         // Snackbar / Toast
  // ── Layout / Pattern ──
  "cards",            // Card / Container
  "carousel",         // Carousel (M3 Expressive)
  "stepheader",       // StepHeader
  "modal",            // Modale ScoreDashboard
  // ── App-Specific ──
  "configurator",     // RecipeConfigurator
  "timeline",         // Recipe Timeline
  "runtime-contract", // Production T4 contract gallery
];

/** T5 Pattern order (reorder here → auto-renumbered as P01..PN) */
const PATTERN_ORDER: string[] = [
  "pat-selection",      // Selection Pattern
  "pat-editorial",      // Editorial Section
  "pat-disclosure",     // Progressive Disclosure
  "pat-floating-cta",   // Floating CTA
  "pat-coachmark",      // Coachmark → Tooltip
  "pat-sticky",         // Sticky Context
];

/** T6 Template order (reorder here → auto-renumbered as T01..TN) */
const TEMPLATE_ORDER: string[] = [
  "tmpl-build",         // Build Page Template
  "tmpl-result",        // Result Page Template
];

/* ═══════════════════════════════════════════════════════════
   BUILD SECTIONS — auto-numbering
   ═══════════════════════════════════════════════════════════ */

interface BuiltSection {
  id: string;
  num: string;        // "01" or "C07" or "P03"
  label: string;      // "01 · Sistema Cromatico"
  short: string;      // "01" or "C07" or "P03"
  group: "f" | "c" | "p" | "t";
  category: string;   // "Fondamenta", "Componenti", "Pattern" or "Template"
  Component: React.ComponentType;
}

function buildSections(): BuiltSection[] {
  const result: BuiltSection[] = [];

  FOUNDATION_ORDER.forEach((id, i) => {
    const entry = ALL_ENTRIES.get(id);
    if (!entry) { console.warn(`[DS] Foundation "${id}" not found in registry`); return; }
    const num = String(i + 1).padStart(2, "0");
    result.push({
      id: entry.id,
      num,
      label: `${num} · ${entry.label}`,
      short: num,
      group: "f",
      category: showcaseMessage("components.design-system.index.fondamenta-f3c3e8ce"),
      Component: entry.Component,
    });
  });

  COMPONENT_ORDER.forEach((id, i) => {
    const entry = ALL_ENTRIES.get(id);
    if (!entry) { console.warn(`[DS] Component "${id}" not found in registry`); return; }
    const num = `C${String(i + 1).padStart(2, "0")}`;
    result.push({
      id: entry.id,
      num,
      label: `${num} · ${entry.label}`,
      short: num,
      group: "c",
      category: showcaseMessage("components.design-system.index.componenti-f9c24842"),
      Component: entry.Component,
    });
  });

  PATTERN_ORDER.forEach((id, i) => {
    const entry = ALL_ENTRIES.get(id);
    if (!entry) { console.warn(`[DS] Pattern "${id}" not found in registry`); return; }
    const num = `P${String(i + 1).padStart(2, "0")}`;
    result.push({
      id: entry.id,
      num,
      label: `${num} · ${entry.label}`,
      short: num,
      group: "p",
      category: showcaseMessage("components.design-system.index.pattern-1fff6a31"),
      Component: entry.Component,
    });
  });

  TEMPLATE_ORDER.forEach((id, i) => {
    const entry = ALL_ENTRIES.get(id);
    if (!entry) { console.warn(`[DS] Template "${id}" not found in registry`); return; }
    const num = `T${String(i + 1).padStart(2, "0")}`;
    result.push({
      id: entry.id,
      num,
      label: `${num} · ${entry.label}`,
      short: num,
      group: "t",
      category: showcaseMessage("components.design-system.index.template-3ec1ae06"),
      Component: entry.Component,
    });
  });

  return result;
}

const SECTIONS = buildSections();
const COMPONENT_IDS = new Set(SECTIONS.filter((s) => s.group === "c").map((s) => s.id));
const PATTERN_IDS = new Set(SECTIONS.filter((s) => s.group === "p").map((s) => s.id));
const TEMPLATE_IDS = new Set(SECTIONS.filter((s) => s.group === "t").map((s) => s.id));

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export function DesignSystemTab({
  darkMode = false,
  setDarkMode,
}: {
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.id))
  );
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0]?.id ?? "");

  /* ── Intersection Observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-nav-id");
            if (id) setActiveSection(id);
          }
        }
      },
      { rootMargin: "-110px 0px -55% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`ds-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ── Actions ── */
  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`ds-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSections(new Set(SECTIONS.map((s) => s.id)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  const allExpanded = expandedSections.size === SECTIONS.length;
  const noop = () => {};

  const foundations = SECTIONS.filter((s) => s.group === "f");
  const components = SECTIONS.filter((s) => s.group === "c");
  const patterns = SECTIONS.filter((s) => s.group === "p");
  const templates = SECTIONS.filter((s) => s.group === "t");

  return (
    <DSCtx.Provider value={{ darkMode, setDarkMode: setDarkMode || noop }}>
      <div className="flex flex-col gap-6">
        {/* ══ Page Header ══ */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="dsx-s-b0e08465c2" />
            <span className="dsx-s-97bd1732e7"
            >
              {showcaseMessage("components.design-system.index.design-spec-sheet-21f99f90")}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="dsx-s-5e63651105"
            >
              {showcaseMessage("components.design-system.index.vulcan-design-system-79aa984a")}</h1>
            <span className="dsx-s-3fe0ac1704"
            >
              {showcaseMessage("components.design-system.index.v2-1-modular-de82fec4")}</span>
          </div>
          <p className="dsx-s-02cf081320"
          >
            {showcaseMessage("components.design-system.index.spec-sheet-interattiva-ogni-componente-e-08cd5bb9")}{" "}
            <span className="dsx-s-a172e52ce6">
              {showcaseMessage("components.design-system.index.vivo-e-cliccabile-c0b2b2f8")}</span>{" "}
            {showcaseMessage("components.design-system.index.hover-click-toggle-drag-per-provare-tutti--686c04f6")}{" "}
            <span className="dsx-s-a172e52ce6">
              {showcaseMessage("components.design-system.index.atelier-stone-3c66930c")}</span>
            , {foundations.length} {showcaseMessage("components.design-system.index.fondamenta-a8503a52")}{components.length} {showcaseMessage("components.design-system.index.componenti-272723fc")}{patterns.length} {showcaseMessage("components.design-system.index.pattern-4e1c5277")}{templates.length} {showcaseMessage("components.design-system.index.template-cab6016f")}</p>

          {/* Legend */}
          <div
            className="flex items-center gap-4 py-2.5 px-4 rounded-lg mt-1 dsx-s-d1283e5581"
          >
            <Layers
              size={14} className="dsx-s-3f51ae8a96"
            />
            <div className="flex flex-wrap gap-3">
              {[
                { label: showcaseMessage("components.design-system.index.fondamenta-f3c3e8ce"), prefix: `01–${foundations.length.toString().padStart(2, "0")}`, color: "var(--primary)" },
                { label: showcaseMessage("components.design-system.index.componenti-f9c24842"), prefix: `C01–C${components.length.toString().padStart(2, "0")}`, color: "var(--cta)" },
                { label: showcaseMessage("components.design-system.index.pattern-t5-a32c89d3"), prefix: `P01–P${patterns.length.toString().padStart(2, "0")}`, color: "var(--secondary)" },
                { label: showcaseMessage("components.design-system.index.template-t6-6cd92f12"), prefix: `T01–T${templates.length.toString().padStart(2, "0")}`, color: "var(--tertiary)" },
              ].map((cat) => (
                <span key={cat.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full dsx-s-fbecfa7efd"
                    style={{ "--dsx-background": toShowcaseCssValue(cat.color, false) } as any}
                  />
                  <span
                    className="type-data dsx-s-a57c4bed75"
                  >
                    {cat.prefix} — {cat.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Layout: Sidebar (lg+) + Content ══ */}
        <div className="flex gap-6">
          {/* ── Sidebar (lg+ only) ── */}
          <nav
            aria-label={showcaseMessage("components.design-system.index.indice-del-design-system-eada352f")}
            className="hidden lg:flex flex-col flex-shrink-0 sticky self-start overflow-y-auto dsx-s-b4645d1b2c"
          >
            {/* Dark mode toggle */}
            {setDarkMode && (
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 active:scale-95 transition-transform dsx-s-da1388fd62"
                aria-label={darkMode ? showcaseMessage("components.design-system.index.passa-a-light-mode-2ee1a984") : showcaseMessage("components.design-system.index.passa-a-dark-mode-b6cac547")}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? showcaseMessage("components.design-system.index.light-mode-3d3791aa") : showcaseMessage("components.design-system.index.dark-mode-9cf83d1f")}
              </motion.button>
            )}

            {/* Expand/Collapse */}
            <motion.button
              onClick={allExpanded ? collapseAll : expandAll}
              className="px-3 py-1.5 rounded-md mb-4 active:scale-95 transition-transform dsx-s-813813629f"
            >
              {allExpanded ? showcaseMessage("components.design-system.index.comprimi-tutto-33bce275") : showcaseMessage("components.design-system.index.espandi-tutto-976ac0c3")}
            </motion.button>

            {/* Fondamenta group */}
            <span className="dsx-s-f4ac66dbb3"
            >
              {showcaseMessage("components.design-system.index.fondamenta-12b68e92")}</span>
            {foundations.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-97 transition-transform dsx-s-196ac45619"
                  style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(isActive ? "var(--primary)" : "rgba(0,0,0,0)", false) } as any}
                >
                  <span className="dsx-s-93831e2f43"
                  >
                    {s.short}
                  </span>
                  <span className="dsx-s-0119c27775"
                  >
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div
              className="my-3 mx-2 dsx-s-2c046cdae7"
            />

            {/* Componenti group */}
            <span className="dsx-s-b00ae2ac38"
            >
              {showcaseMessage("components.design-system.index.componenti-141c9303")}</span>
            {components.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-97 transition-transform dsx-s-196ac45619"
                  style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--cta-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(isActive ? "var(--cta)" : "rgba(0,0,0,0)", false) } as any}
                >
                  <span className="dsx-s-15dbd194b0"
                  >
                    {s.short}
                  </span>
                  <span className="dsx-s-0119c27775"
                  >
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div
              className="my-3 mx-2 dsx-s-2c046cdae7"
            />

            {/* T5 Pattern group */}
            <span className="dsx-s-0ae2cc7999"
            >
              {showcaseMessage("components.design-system.index.pattern-t5-3824a152")}</span>
            {patterns.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-97 transition-transform dsx-s-196ac45619"
                  style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--secondary-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(isActive ? "var(--secondary)" : "rgba(0,0,0,0)", false) } as any}
                >
                  <span className="dsx-s-15dbd194b0"
                  >
                    {s.short}
                  </span>
                  <span className="dsx-s-0119c27775"
                  >
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}

            <div
              className="my-3 mx-2 dsx-s-2c046cdae7"
            />
            <span className="dsx-s-163939eae5"
            >
              {showcaseMessage("components.design-system.index.template-t6-6adb678b")}</span>
            {templates.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-97 transition-transform dsx-s-196ac45619"
                  style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(isActive ? "var(--tertiary)" : "rgba(0,0,0,0)", false) } as any}
                >
                  <span className="dsx-s-15dbd194b0"
                  >
                    {s.short}
                  </span>
                  <span className="dsx-s-0119c27775">
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* ── Mobile Navigation (lg:hidden) ── */}
            <nav
              aria-label={showcaseMessage("components.design-system.index.indice-del-design-system-eada352f")}
              className="lg:hidden sticky z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-b-xl dsx-s-bc043068fd"
            >
              <div
                className="flex items-center gap-0.5 overflow-x-auto dsx-s-d23c07fd1e"
              >
                {/* Dark mode toggle (mobile) */}
                {setDarkMode && (
                  <motion.button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mr-1 active:scale-95 transition-transform dsx-s-f5074fcb0f"
                    aria-label={darkMode ? showcaseMessage("components.design-system.index.light-mode-3d3791aa") : showcaseMessage("components.design-system.index.dark-mode-9cf83d1f")}
                  >
                    {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                  </motion.button>
                )}

                <span className="dsx-s-ac008c9c7f"
                >
                  FOND
                </span>
                {foundations.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{ "--dsx-font-weight": toShowcaseCssValue(activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(activeSection === s.id ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(activeSection === s.id ? "var(--primary)" : "rgba(0,0,0,0)", false) } as any} className="dsx-s-b9a345748c"
                  >
                    {s.short}
                  </motion.button>
                ))}
                <div
                  className="mx-1.5 flex-shrink-0 dsx-s-7f1b3a6457"
                />
                <span className="dsx-s-0500c5ed65"
                >
                  COMP
                </span>
                {components.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{ "--dsx-font-weight": toShowcaseCssValue(activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(activeSection === s.id ? "var(--cta-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(activeSection === s.id ? "var(--cta)" : "rgba(0,0,0,0)", false) } as any} className="dsx-s-b9a345748c"
                  >
                    {s.short}
                  </motion.button>
                ))}
                <div
                  className="mx-1.5 flex-shrink-0 dsx-s-7f1b3a6457"
                />
                <span className="dsx-s-346d8df875"
                >
                  PAT
                </span>
                {patterns.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{ "--dsx-font-weight": toShowcaseCssValue(activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(activeSection === s.id ? "var(--secondary-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(activeSection === s.id ? "var(--secondary)" : "rgba(0,0,0,0)", false) } as any} className="dsx-s-b9a345748c"
                  >
                    {s.short}
                  </motion.button>
                ))}
                <div
                  className="mx-1.5 flex-shrink-0 dsx-s-7f1b3a6457"
                />
                <span className="dsx-s-03945cfd8f"
                >
                  TMP
                </span>
                {templates.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{ "--dsx-font-weight": toShowcaseCssValue(activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(activeSection === s.id ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(activeSection === s.id ? "var(--tertiary)" : "rgba(0,0,0,0)", false) } as any} className="dsx-s-b9a345748c"
                  >
                    {s.short}
                  </motion.button>
                ))}
              </div>

              {/* Expand/Collapse control (mobile) */}
              <div className="flex gap-2 mt-2">
                <motion.button
                  onClick={allExpanded ? collapseAll : expandAll}
                  className="px-2.5 py-1 rounded-md active:scale-95 transition-transform dsx-s-e92c22ec8b"
                >
                  {allExpanded ? showcaseMessage("components.design-system.index.comprimi-tutto-33bce275") : showcaseMessage("components.design-system.index.espandi-tutto-976ac0c3")}
                </motion.button>
              </div>
            </nav>

            {/* ── Sections (accordion) ── */}
            {SECTIONS.map((section) => {
              const isOpen = expandedSections.has(section.id);
              const isComponent = COMPONENT_IDS.has(section.id);
              const isPattern = PATTERN_IDS.has(section.id);
              const isTemplate = TEMPLATE_IDS.has(section.id);
              const Comp = section.Component;
              return (
                <div
                  key={section.id}
                  id={`ds-${section.id}`}
                  data-nav-id={section.id} className="dsx-s-5c95386af9"
                >
                  <motion.button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between py-3 px-1 active:scale-98 transition-transform dsx-s-ff83771d47"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 dsx-s-fbecfa7efd"
                        style={{ "--dsx-background": toShowcaseCssValue(isComponent
                                                                                            ? "var(--cta)"
                                                                                            : isPattern
                                                                                            ? "var(--secondary)"
                                                                                            : isTemplate
                                                                                            ? "var(--tertiary)"
                                                                                            : "var(--primary)", false) } as any}
                      />
                      <span className="dsx-s-0b15ddefe0"
                      >
                        {section.label}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={showcaseTransition.preset_a84e383e92}
                    >
                      <ChevronDown
                        size={16} className="dsx-s-63782726c0"
                      />
                    </motion.div>
                  </motion.button>

                  {/* Accordion body — CSS grid-rows */}
                  <div
                    style={{ "--dsx-grid-template-rows": toShowcaseCssValue(isOpen ? "1fr" : "0fr", false) } as any} className="dsx-s-2a61280093"
                  >
                    <div className="dsx-s-a5317b8da5">
                      <div className="py-6">
                        <SectionNumCtx.Provider
                          value={{ num: section.num, category: section.category }}
                        >
                          <Comp />
                        </SectionNumCtx.Provider>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DSCtx.Provider>
  );
}
