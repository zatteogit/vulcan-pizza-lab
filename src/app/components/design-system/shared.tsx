import React, { useState, createContext, useContext, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X } from "lucide-react";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   SHARED — Styles, constants, utilities, small components
   ═══════════════════════════════════════════════════════════ */

/* ── Section Entry (registry type) ── */
export interface SectionEntry {
  id: string;
  label: string;
  /** f=T1–T3 foundations, c=T4 components, p=T5 patterns, t=T6 templates. */
  group: "f" | "c" | "p" | "t";
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
      <span className="type-step-num dsx-s-b0e08465c2">
        {category} · {num}
      </span>
      <h2 className="type-heading-lg dsx-s-a57c4bed75">{title}</h2>
      <p className="type-section-desc dsx-s-63782726c0">{description}</p>
      <div
        className="mt-2 dsx-s-3493194ed3"
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
      aria-pressed={copied}
      className="flex flex-col rounded-lg overflow-hidden active:scale-95 transition-transform dsx-s-4aa8691bab"
    >
      <div
        className="h-12 w-full relative dsx-s-fbecfa7efd"
        style={{ "--dsx-background": toShowcaseCssValue(`var(${cssVar})`, false) } as any}
      >
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center dsx-s-a8e26f202a"
            >
              <Check size={14} className="dsx-s-b52c90fb9d" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className="px-2 py-1.5 dsx-s-e4f209c55b"
      >
        <div
          className="type-data dsx-s-24d7245ee0"
        >
          {name}
        </div>
        <div
          className="type-code dsx-s-9f96c1f09f"
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
      className="p-3 rounded-lg dsx-s-e4f209c55b"
    >
      <div
        className="type-data dsx-s-d4cbd3ba0a"
      >
        {prop}
      </div>
      <div
        className="type-data dsx-s-d9a70bfa3c"
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
        role="tablist"
        className="flex gap-1 overflow-x-auto py-1 -my-1 dsx-s-d23c07fd1e"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${scopeId}-panel-${tab.id}`}
              id={`${scopeId}-tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className="relative px-4 py-2 rounded-xl flex-shrink-0 active:scale-95 dsx-s-ec297496cc"
              style={{ "--dsx-font-weight": toShowcaseCssValue(isActive
                                                  ? ("var(--weight-semibold)" as any)
                                                  : ("var(--weight-medium)" as any), true), "--dsx-color": toShowcaseCssValue(isActive
                                                  ? "var(--primary-foreground)"
                                                  : "var(--muted-foreground)", false), "--dsx-background": toShowcaseCssValue(isActive
                                                  ? "var(--primary)"
                                                  : "rgba(0,0,0,0)", false), "--dsx-border": toShowcaseCssValue(isActive
                                                  ? "none"
                                                  : "1px solid var(--outline-variant)", false) } as any}
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
          role="tabpanel"
          id={`${scopeId}-panel-${activeTab?.id}`}
          aria-labelledby={`${scopeId}-tab-${activeTab?.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={showcaseTransition.preset_9fd73d3829}
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
      <p className="dsx-s-e5ea47006a"
      >
        {descrizione}
      </p>
      {principi && principi.length > 0 && (
        <div className="surface-card p-5">
          <span className="type-label dsx-s-e2184fadc0">
            {showcaseMessage("components.design-system.shared.principi-chiave-9d1502fa")}</span>
          <ul className="mt-3 flex flex-col gap-2">
            {principi.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 dsx-s-0a278ece1c"
                />
                <span className="dsx-s-815c2a92e3"
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
          className="p-4 rounded-xl dsx-s-db81fe0192"
        >
          <span className="type-label dsx-s-4cc5c212dd">
            {showcaseMessage("components.design-system.shared.quando-usare-79b7aeba")}</span>
          <p
            className="mt-1.5 dsx-s-a86bc31235"
          >
            {quandoUsare}
          </p>
        </div>
      )}
      {anatomia && anatomia.length > 0 && (
        <div className="surface-card p-5">
          <span className="type-label dsx-s-e2184fadc0">
            {showcaseMessage("components.design-system.shared.anatomia-1de8143f")}</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {anatomia.map((a, i) => (
              <div
                key={i}
                className="flex items-baseline gap-2.5 p-2.5 rounded-lg dsx-s-e4f209c55b"
              >
                <span
                  className="type-data dsx-s-fa5041adc3"
                >
                  {a.parte}
                </span>
                <span className="dsx-s-6849179898"
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
            <Check size={16} className="dsx-s-5e98e84d69" />
            <span className="type-label dsx-s-ddb8956c51">{showcaseMessage("components.design-system.shared.fai-ffcc1fd7")}</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {fai.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="dsx-s-38082926e2"
                >
                  +
                </span>
                <span className="dsx-s-a86bc31235"
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <X size={16} className="dsx-s-3372a44748" />
            <span className="type-label dsx-s-acd2c9765f">
              {showcaseMessage("components.design-system.shared.non-fare-2da2abc1")}</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {nonFare.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="dsx-s-93f639c60d"
                >
                  -
                </span>
                <span className="dsx-s-a86bc31235"
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
          className="p-4 rounded-xl dsx-s-7852c68e05"
        >
          <span className="type-label dsx-s-e2184fadc0">
            {showcaseMessage("components.design-system.shared.layout-responsive-3fdd8112")}</span>
          <p
            className="mt-1.5 dsx-s-a86bc31235"
          >
            {responsive}
          </p>
        </div>
      )}
      {comportamento && (
        <div className="p-4 rounded-xl dsx-s-e4f209c55b">
          <span className="type-label dsx-s-e2184fadc0">
            {showcaseMessage("components.design-system.shared.comportamento-e56c0a53")}</span>
          <p
            className="mt-1.5 dsx-s-815c2a92e3"
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
          className="flex items-start gap-3 p-3.5 rounded-xl dsx-s-bb3e77c269"
        >
          <span
            className="type-data dsx-s-f39b919599"
          >
            {item.label}
          </span>
          <span className="dsx-s-815c2a92e3"
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
        style={{ "--dsx-background": toShowcaseCssValue(color || "var(--primary)", false) } as any} className="dsx-s-591b798d47"
      />
      <span
        style={{ "--dsx-color": toShowcaseCssValue(color || "var(--primary)", false) } as any} className="dsx-s-03afe4cd45"
      >
        {label}
      </span>
      <div
        className="flex-1 dsx-s-143f476efb"
      />
    </div>
  );
}
