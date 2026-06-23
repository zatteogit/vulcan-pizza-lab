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
import { ENTRIES as PAT_TMPL } from "./patterns-templates";

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
  COMP_A, COMP_B, COMP_C, COMP_D, COMP_F, COMP_G, COMP_G2, COMP_H, PAT_TMPL,
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
];

/** Pattern & Template order (reorder here → auto-renumbered as P01..PN) */
const PATTERN_ORDER: string[] = [
  // ── Pattern (combinazioni riutilizzabili) ──
  "pat-selection",      // Selection Pattern
  "pat-editorial",      // Editorial Section
  "pat-disclosure",     // Progressive Disclosure
  "pat-floating-cta",   // Floating CTA
  "pat-coachmark",      // Coachmark → Tooltip
  "pat-sticky",         // Sticky Context
  // ── Template (composizioni pagina) ──
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
  group: "f" | "c" | "p";
  category: string;   // "Fondamenta" or "Componenti" or "Pattern & Template"
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
      category: "Fondamenta",
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
      category: "Componenti",
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
      category: "Pattern & Template",
      Component: entry.Component,
    });
  });

  return result;
}

const SECTIONS = buildSections();
const COMPONENT_IDS = new Set(SECTIONS.filter((s) => s.group === "c").map((s) => s.id));
const PATTERN_IDS = new Set(SECTIONS.filter((s) => s.group === "p").map((s) => s.id));

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

  return (
    <DSCtx.Provider value={{ darkMode, setDarkMode: setDarkMode || noop }}>
      <div className="flex flex-col gap-6">
        {/* ══ Page Header ══ */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} style={{ color: "var(--primary)" }} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-semibold)" as any,
                letterSpacing: "var(--tracking-display)",
                textTransform: "uppercase",
                color: "var(--primary)",
              }}
            >
              Design Spec Sheet
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "var(--font-size-9xl)",
                fontWeight: "var(--weight-bold)" as any,
                lineHeight: "var(--leading-tight)",
                letterSpacing: "-0.03em",
                color: "var(--text-default)",
              }}
            >
              Vulcan Design System
            </h1>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-bold)" as any,
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                background: "color-mix(in srgb, var(--cta) 15%, transparent)",
                color: "var(--cta)",
                padding: "4px 12px",
                borderRadius: "9999px",
              }}
            >
              v2.1 Modular
            </span>
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--weight-regular)" as any,
              lineHeight: "var(--leading-reading)",
              color: "var(--muted-foreground)",
              maxWidth: "640px",
            }}
          >
            Spec sheet interattiva. Ogni componente è{" "}
            <span style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
              vivo e cliccabile
            </span>{" "}
            — hover, click, toggle, drag per provare tutti gli stati dal vivo.
            Palette{" "}
            <span style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
              Atelier Stone
            </span>
            , {foundations.length} fondamenta + {components.length} componenti + {patterns.length} pattern.
          </p>

          {/* Legend */}
          <div
            className="flex items-center gap-4 py-2.5 px-4 rounded-lg mt-1"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <Layers
              size={14}
              style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
            />
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Fondamenta", prefix: `01–${foundations.length.toString().padStart(2, "0")}`, color: "var(--primary)" },
                { label: "Componenti", prefix: `C01–C${components.length.toString().padStart(2, "0")}`, color: "var(--cta)" },
                { label: "Pattern & Template", prefix: `P01–P${patterns.length.toString().padStart(2, "0")}`, color: "var(--secondary)" },
              ].map((cat) => (
                <span key={cat.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: cat.color }}
                  />
                  <span
                    className="type-data"
                    style={{
                      color: "var(--text-default)",
                    }}
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
          <aside
            className="hidden lg:flex flex-col flex-shrink-0 sticky self-start overflow-y-auto"
            style={{
              width: "220px",
              top: "60px",
              maxHeight: "calc(100vh - 72px)",
              scrollbarWidth: "thin",
              paddingBottom: "32px",
            }}
          >
            {/* Dark mode toggle */}
            {setDarkMode && (
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 active:scale-95 transition-transform"
                style={{
                  background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                  border: "1px solid var(--outline-variant)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--primary)",
                  cursor: "pointer",
                  outline: "none",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                }}
                aria-label={darkMode ? "Passa a Light mode" : "Passa a Dark mode"}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? "Light mode" : "Dark mode"}
              </motion.button>
            )}

            {/* Expand/Collapse */}
            <motion.button
              onClick={allExpanded ? collapseAll : expandAll}
              className="px-3 py-1.5 rounded-md mb-4 active:scale-95 transition-transform"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--weight-semibold)" as any,
                letterSpacing: "var(--tracking-spread)",
                background: "var(--surface-container)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--outline-variant)",
                cursor: "pointer",
                outline: "none",
                textAlign: "left",
              }}
            >
              {allExpanded ? "Comprimi tutto" : "Espandi tutto"}
            </motion.button>

            {/* Fondamenta group */}
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-bold)" as any,
                letterSpacing: "var(--tracking-ultra)",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: "4px",
                paddingLeft: "8px",
              }}
            >
              Fondamenta
            </span>
            {foundations.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-[0.97] transition-transform"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                    letterSpacing: "var(--tracking-fine)",
                    color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    background: isActive ? "var(--primary)" : "rgba(0,0,0,0)",
                    border: "none",
                    cursor: "pointer",
                    outline: "none",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      flexShrink: 0,
                      fontFeatureSettings: "'tnum'",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {s.short}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div
              className="my-3 mx-2"
              style={{
                height: "1px",
                background: "var(--outline-variant)",
              }}
            />

            {/* Componenti group */}
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-bold)" as any,
                letterSpacing: "var(--tracking-ultra)",
                textTransform: "uppercase",
                color: "var(--cta)",
                marginBottom: "4px",
                paddingLeft: "8px",
              }}
            >
              Componenti
            </span>
            {components.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-[0.97] transition-transform"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                    letterSpacing: "var(--tracking-fine)",
                    color: isActive ? "var(--cta-foreground)" : "var(--muted-foreground)",
                    background: isActive ? "var(--cta)" : "rgba(0,0,0,0)",
                    border: "none",
                    cursor: "pointer",
                    outline: "none",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      flexShrink: 0,
                      fontFeatureSettings: "'tnum'",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {s.short}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div
              className="my-3 mx-2"
              style={{
                height: "1px",
                background: "var(--outline-variant)",
              }}
            />

            {/* Pattern & Template group */}
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-bold)" as any,
                letterSpacing: "var(--tracking-ultra)",
                textTransform: "uppercase",
                color: "var(--secondary)",
                marginBottom: "4px",
                paddingLeft: "8px",
              }}
            >
              Pattern & Template
            </span>
            {patterns.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md active:scale-[0.97] transition-transform"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                    letterSpacing: "var(--tracking-fine)",
                    color: isActive ? "var(--secondary-foreground)" : "var(--muted-foreground)",
                    background: isActive ? "var(--secondary)" : "rgba(0,0,0,0)",
                    border: "none",
                    cursor: "pointer",
                    outline: "none",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      flexShrink: 0,
                      fontFeatureSettings: "'tnum'",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {s.short}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label.split(" · ")[1] || s.label}
                  </span>
                </motion.button>
              );
            })}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* ── Mobile Navigation (lg:hidden) ── */}
            <div
              className="lg:hidden sticky z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-b-xl"
              style={{
                top: "48px",
                paddingTop: "10px",
                paddingBottom: "10px",
                background:
                  "color-mix(in srgb, var(--container-page) 90%, transparent)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                borderBottom: "1px solid var(--border-muted)",
              }}
            >
              <div
                className="flex items-center gap-0.5 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Dark mode toggle (mobile) */}
                {setDarkMode && (
                  <motion.button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mr-1 active:scale-95 transition-transform"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                      color: "var(--primary)",
                      border: "none",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    aria-label={darkMode ? "Light mode" : "Dark mode"}
                  >
                    {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                  </motion.button>
                )}

                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "var(--tracking-ultra)",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    flexShrink: 0,
                    paddingRight: "4px",
                  }}
                >
                  FOND
                </span>
                {foundations.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-md)",
                      fontWeight: activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                      letterSpacing: "var(--tracking-spread)",
                      color: activeSection === s.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      background: activeSection === s.id ? "var(--primary)" : "rgba(0,0,0,0)",
                      padding: "3px 7px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      fontFeatureSettings: "'tnum'",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {s.short}
                  </motion.button>
                ))}
                <div
                  className="mx-1.5 flex-shrink-0"
                  style={{ width: "1px", height: "14px", background: "var(--outline-variant)" }}
                />
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "var(--tracking-ultra)",
                    textTransform: "uppercase",
                    color: "var(--cta)",
                    flexShrink: 0,
                    paddingRight: "4px",
                  }}
                >
                  COMP
                </span>
                {components.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-md)",
                      fontWeight: activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                      letterSpacing: "var(--tracking-spread)",
                      color: activeSection === s.id ? "var(--cta-foreground)" : "var(--muted-foreground)",
                      background: activeSection === s.id ? "var(--cta)" : "rgba(0,0,0,0)",
                      padding: "3px 7px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      fontFeatureSettings: "'tnum'",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {s.short}
                  </motion.button>
                ))}
                <div
                  className="mx-1.5 flex-shrink-0"
                  style={{ width: "1px", height: "14px", background: "var(--outline-variant)" }}
                />
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "var(--tracking-ultra)",
                    textTransform: "uppercase",
                    color: "var(--secondary)",
                    flexShrink: 0,
                    paddingRight: "4px",
                  }}
                >
                  PAT
                </span>
                {patterns.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-md)",
                      fontWeight: activeSection === s.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                      letterSpacing: "var(--tracking-spread)",
                      color: activeSection === s.id ? "var(--secondary-foreground)" : "var(--muted-foreground)",
                      background: activeSection === s.id ? "var(--secondary)" : "rgba(0,0,0,0)",
                      padding: "3px 7px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      fontFeatureSettings: "'tnum'",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {s.short}
                  </motion.button>
                ))}
              </div>

              {/* Expand/Collapse control (mobile) */}
              <div className="flex gap-2 mt-2">
                <motion.button
                  onClick={allExpanded ? collapseAll : expandAll}
                  className="px-2.5 py-1 rounded-md active:scale-95 transition-transform"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "var(--tracking-spread)",
                    background: "var(--surface-container)",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--outline-variant)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {allExpanded ? "Comprimi tutto" : "Espandi tutto"}
                </motion.button>
              </div>
            </div>

            {/* ── Sections (accordion) ── */}
            {SECTIONS.map((section) => {
              const isOpen = expandedSections.has(section.id);
              const isComponent = COMPONENT_IDS.has(section.id);
              const isPattern = PATTERN_IDS.has(section.id);
              const Comp = section.Component;
              return (
                <div
                  key={section.id}
                  id={`ds-${section.id}`}
                  data-nav-id={section.id}
                  style={{ scrollMarginTop: "160px" }}
                >
                  <motion.button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between py-3 px-1 active:scale-[0.98] transition-transform"
                    style={{
                      borderBottom: "1px solid var(--outline-variant)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: isComponent
                            ? "var(--cta)"
                            : isPattern
                            ? "var(--secondary)"
                            : "var(--primary)",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "var(--font-size-2xl)",
                          fontWeight: "var(--weight-semibold)" as any,
                          color: "var(--text-default)",
                        }}
                      >
                        {section.label}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      <ChevronDown
                        size={16}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </motion.div>
                  </motion.button>

                  {/* Accordion body — CSS grid-rows */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
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