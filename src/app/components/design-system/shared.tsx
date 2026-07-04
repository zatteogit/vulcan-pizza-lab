import React, { useState, createContext, useContext, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   SHARED — Styles, constants, utilities, small components
   ═══════════════════════════════════════════════════════════ */

/* ── Section Entry (registry type) ── */
export interface SectionEntry {
  id: string;
  label: string;
  group: "f" | "c" | "p";
  Component: React.ComponentType;
}

/* ── Section Number Context (auto-injected by index.tsx) ── */
interface SectionNumValue {
  num: string;
  category: string;
}
export const SectionNumCtx = createContext<SectionNumValue>({ num: "00", category: "" });

/* ── Typography presets ── */

/* mono object REMOVED — all consumers migrated to CSS classes:
   type-data, type-code, type-nerd, type-data-lg, type-mono-label (in theme.css @layer components) */

/* ── CSS Variable Runtime Resolver ── */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return rgb;
  const [r, g, b] = match.map(Number);
  return (
    "#" +
    [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
  ).toUpperCase();
}

/**
 * Resolves a CSS custom property to its computed hex value.
 * Reads from a supplied element (so dark-mode context is respected).
 */
export function resolveVar(
  el: HTMLElement | null,
  cssVar: string
): string {
  if (!el) return "—";
  const raw = getComputedStyle(el)
    .getPropertyValue(cssVar)
    .trim();
  if (!raw) return "—";
  if (raw.startsWith("rgb")) return rgbToHex(raw);
  if (raw.startsWith("#")) return raw.toUpperCase();
  return raw;
}

/* ── Dark Mode Context (forwarded from page) ── */
interface DSContext {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export const DSCtx = createContext<DSContext>({
  darkMode: false,
  setDarkMode: () => {},
});

export function useDSContext() {
  return useContext(DSCtx);
}

/* ═══ SECTION HEADER ═══ */
export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { num, category } = useContext(SectionNumCtx);
  return (
    <div className="flex flex-col gap-1">
      <span className="type-step-num" style={{ color: "var(--primary)" }}>
        {category} · {num}
      </span>
      <h2 className="type-heading-lg" style={{ color: "var(--text-default)" }}>{title}</h2>
      <p className="type-section-desc" style={{ color: "var(--muted-foreground)" }}>{description}</p>
      <div
        className="mt-2"
        style={{
          width: "2rem",
          height: "2px",
          background: "var(--primary)",
          opacity: 0.35,
        }}
      />
    </div>
  );
}

/* ═══ COLOR SWATCH ═══ */
export function ColorSwatch({
  name,
  cssVar,
  resolvedHex,
}: {
  name: string;
  cssVar: string;
  resolvedHex?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `var(${cssVar})`;
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex flex-col rounded-lg overflow-hidden active:scale-95 transition-transform"
      style={{ border: "var(--border-width-thin) solid var(--outline-variant)" }}
    >
      <div
        className="h-12 w-full relative"
        style={{ background: `var(${cssVar})` }}
      >
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "var(--image-check-overlay)" }}
            >
              <Check size={14} style={{ color: "var(--overlay-text)" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className="px-2 py-1.5"
        style={{ background: "var(--surface-container)" }}
      >
        <div
          className="type-data"
          style={{
            fontWeight: "var(--weight-semibold)" as any,
            color: "var(--text-default)",
          }}
        >
          {name}
        </div>
        <div
          className="type-code"
          style={{
            color: "var(--muted-foreground)",
            fontFeatureSettings: "'tnum'",
          }}
        >
          {resolvedHex || `var(${cssVar})`}
        </div>
      </div>
    </button>
  );
}

/* ═══ SPEC ANATOMY ROW ═══ */
export function AnatomyRow({
  prop,
  val,
}: {
  prop: string;
  val: string;
}) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{ background: "var(--surface-container)" }}
    >
      <div
        className="type-data"
        style={{
          color: "var(--primary)",
          fontWeight: "var(--weight-semibold)" as any,
        }}
      >
        {prop}
      </div>
      <div
        className="type-data"
        style={{
          color: "var(--muted-foreground)",
          marginTop: "var(--space-0-5)",
        }}
      >
        {val}
      </div>
    </div>
  );
}

/* ═══ SECTION TABS — Consistent sub-navigation ═══ */

export interface TabDef {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function SectionTabs({
  tabs,
  defaultTab = "specifiche",
}: {
  tabs: TabDef[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(
    () => tabs.find((t) => t.id === defaultTab)?.id || tabs[0]?.id || ""
  );
  const activeTab = tabs.find((t) => t.id === active) || tabs[0];
  const scopeId = useId();

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div
        className="flex gap-1 overflow-x-auto py-1 -my-1"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="relative px-4 py-2 rounded-xl flex-shrink-0 active:scale-95"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-lg)",
                fontWeight: isActive
                  ? ("var(--weight-semibold)" as any)
                  : ("var(--weight-medium)" as any),
                color: isActive
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                background: isActive
                  ? "var(--primary)"
                  : "rgba(0,0,0,0)",
                border: isActive
                  ? "none"
                  : "1px solid var(--outline-variant)",
                cursor: "pointer",
                outline: "none",
                whiteSpace: "nowrap",
                transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${scopeId}-${activeTab?.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {activeTab?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══ TAB HELPERS — Consistent content for Panoramica / Linee guida / Accessibilità ═══ */

export function Panoramica({
  descrizione,
  principi,
  quandoUsare,
  anatomia,
}: {
  descrizione: string;
  principi?: string[];
  quandoUsare?: string;
  anatomia?: { parte: string; desc: string }[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "var(--font-size-2xl)",
          lineHeight: "var(--leading-reading)",
          color: "var(--text-default)",
        }}
      >
        {descrizione}
      </p>
      {principi && principi.length > 0 && (
        <div className="surface-card p-5">
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
            Principi chiave
          </span>
          <ul className="mt-3 flex flex-col gap-2">
            {principi.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                  style={{ background: "var(--primary)" }}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    lineHeight: "var(--leading-relaxed)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {quandoUsare && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--primary) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)",
          }}
        >
          <span className="type-label" style={{ color: "var(--primary)", fontSize: "var(--font-size-base)" }}>
            Quando usare
          </span>
          <p
            className="mt-1.5"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "var(--font-size-md)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--text-default)",
            }}
          >
            {quandoUsare}
          </p>
        </div>
      )}
      {anatomia && anatomia.length > 0 && (
        <div className="surface-card p-5">
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
            Anatomia
          </span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {anatomia.map((a, i) => (
              <div
                key={i}
                className="flex items-baseline gap-2.5 p-2.5 rounded-lg"
                style={{ background: "var(--surface-container)" }}
              >
                <span
                  className="type-data"
                  style={{
                    color: "var(--primary)",
                    fontWeight: "var(--weight-semibold)" as any,
                    flexShrink: 0,
                  }}
                >
                  {a.parte}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-base)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {a.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LineeGuida({
  fai,
  nonFare,
  responsive,
  comportamento,
}: {
  fai: string[];
  nonFare: string[];
  responsive?: string;
  comportamento?: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Check size={16} style={{ color: "var(--cta)" }} />
            <span className="type-label" style={{ color: "var(--cta)", fontSize: "var(--font-size-base)" }}>Fai</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {fai.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  style={{
                    color: "var(--cta)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    flexShrink: 0,
                  }}
                >
                  +
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    lineHeight: "var(--leading-relaxed)",
                    color: "var(--text-default)",
                  }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <X size={16} style={{ color: "var(--destructive)" }} />
            <span className="type-label" style={{ color: "var(--destructive)", fontSize: "var(--font-size-base)" }}>
              Non fare
            </span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {nonFare.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  style={{
                    color: "var(--destructive)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    flexShrink: 0,
                  }}
                >
                  -
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    lineHeight: "var(--leading-relaxed)",
                    color: "var(--text-default)",
                  }}
                >
                  {n}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {responsive && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--tertiary) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--tertiary) 15%, transparent)",
          }}
        >
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
            Layout responsive
          </span>
          <p
            className="mt-1.5"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "var(--font-size-md)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--text-default)",
            }}
          >
            {responsive}
          </p>
        </div>
      )}
      {comportamento && (
        <div className="p-4 rounded-xl" style={{ background: "var(--surface-container)" }}>
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
            Comportamento
          </span>
          <p
            className="mt-1.5"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "var(--font-size-md)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--muted-foreground)",
            }}
          >
            {comportamento}
          </p>
        </div>
      )}
    </div>
  );
}

export function AccessibilitaInfo({
  items,
}: {
  items: { label: string; desc: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3.5 rounded-xl"
          style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)" }}
        >
          <span
            className="type-data"
            style={{
              fontWeight: "var(--weight-semibold)" as any,
              color: "var(--primary)",
              minWidth: "120px",
              flexShrink: 0,
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "var(--font-size-md)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--muted-foreground)",
            }}
          >
            {item.desc}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══ SUB-SECTION LABEL — vertical flow divider ═══ */

export function SubSectionLabel({
  label,
  color,
}: {
  label: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div
        style={{
          width: "12px",
          height: "2px",
          background: color || "var(--primary)",
          opacity: 0.5,
          borderRadius: "1px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--weight-semibold)" as any,
          letterSpacing: "var(--tracking-ultra)",
          textTransform: "uppercase",
          color: color || "var(--primary)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        className="flex-1"
        style={{
          height: "1px",
          background: "var(--outline-variant)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
