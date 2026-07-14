import { Flame,Heart,Star } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useState } from "react";
import type { SectionEntry } from "./shared";
import {
Panoramica,
SectionHeader,
SubSectionLabel
} from "./shared";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA 15 — EMPHASIS SYSTEM (M3 Expressive)
   4 livelli di enfasi che mappano colore, tipografia,
   container shape e motion per ogni componente.
   ═══════════════════════════════════════════════════════════ */

const EMPHASIS_LEVELS = [
  {
    level: "High",
    desc: showcaseMessage("components.design-system.foundations-m3e.azione-primaria-cta-massima-attenzione-47786c02"),
    color: { bg: "var(--primary)", fg: "var(--primary-foreground)" },
    shape: "rounded-2xl",
    weight: 700,
    fontSize: "var(--font-size-xl)",
    elevation: "var(--shadow-md)",
    motionScale: 1.02,
    examples: ["CTA principale", "FAB", "Score totale", "Step corrente"],
  },
  {
    level: "Medium",
    desc: showcaseMessage("components.design-system.foundations-m3e.azioni-secondarie-informazioni-importanti-ff1473d6"),
    color: { bg: "var(--primary-container)", fg: "var(--on-primary-container)" },
    shape: "rounded-xl",
    weight: 600,
    fontSize: "var(--font-size-lg)",
    elevation: "var(--shadow-sm)",
    motionScale: 1.01,
    examples: ["Chip attivo", "Card stile selezionato", "Badge score", "Nav attiva"],
  },
  {
    level: "Low",
    desc: showcaseMessage("components.design-system.foundations-m3e.contesto-metadata-azioni-terziarie-1196cbba"),
    color: { bg: "var(--surface-container)", fg: "var(--on-surface-variant)" },
    shape: "rounded-lg",
    weight: 500,
    fontSize: "var(--font-size-md)",
    elevation: "none",
    motionScale: 1.0,
    examples: ["Chip inattivo", "Stat strip", "InlineTip", "Bottone ghost"],
  },
  {
    level: "Lowest",
    desc: showcaseMessage("components.design-system.foundations-m3e.sfondo-decorazione-rumore-visivo-minimo-31848361"),
    color: { bg: "var(--surface-container-low)", fg: "var(--muted-foreground)" },
    shape: "rounded-md",
    weight: 400,
    fontSize: "var(--font-size-base)",
    elevation: "none",
    motionScale: 1.0,
    examples: ["Divider", "Helper text", "Footnote", "Empty state"],
  },
];

/* ── Mapping table data ── */
const EMPHASIS_MAPPING = [
  { prop: showcaseMessage("components.design-system.foundations-m3e.background-64dd60fe"), high: "--primary", medium: "--primary-container", low: "--surface-container", lowest: "--surface-container-low" },
  { prop: showcaseMessage("components.design-system.foundations-m3e.foreground-f7745efd"), high: "--primary-foreground", medium: "--on-primary-container", low: "--on-surface-variant", lowest: "--muted-foreground" },
  { prop: showcaseMessage("components.design-system.foundations-m3e.border-5d10d3f4"), high: "nessuno", medium: "--outline-variant", low: "--outline-variant", lowest: "--outline-variant" },
  { prop: showcaseMessage("components.design-system.foundations-m3e.weight-69c0b815"), high: "700 (bold)", medium: "600 (semi)", low: "500 (medium)", lowest: "400 (regular)" },
  { prop: showcaseMessage("components.design-system.foundations-m3e.radius-e5aaeaac"), high: "rounded-2xl", medium: "rounded-xl", low: "rounded-lg", lowest: "rounded-md" },
  { prop: showcaseMessage("components.design-system.foundations-m3e.shadow-aa0e7e86"), high: "elevation-2", medium: "elevation-1", low: "nessuna", lowest: "nessuna" },
  { prop: showcaseMessage("components.design-system.foundations-m3e.motion-e040db2b"), high: "spring bouncy", medium: "spring smooth", low: "spring gentle", lowest: "nessuna" },
];

function EmphasisSystemSection() {
  const [activeLevel, setActiveLevel] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations-m3e.emphasis-system-0984df4a")}
        description={showcaseMessage("components.design-system.foundations-m3e.4-livelli-di-enfasi-che-mappano-colore-tip-a4bf3a26")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-m3e.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-m3e.l-emphasis-system-definisce-4-livelli-gera-4e478877")}
        principi={[
          showcaseMessage("components.design-system.foundations-m3e.high-azioni-primarie-cta-fab-colore-pieno--eb34ab16"),
          showcaseMessage("components.design-system.foundations-m3e.medium-azioni-secondarie-container-colorat-6ef89488"),
          showcaseMessage("components.design-system.foundations-m3e.low-informazioni-di-supporto-outline-o-ton-b430b63d"),
          showcaseMessage("components.design-system.foundations-m3e.lowest-rumore-minimo-text-only-nessuna-omb-03dbf425"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-m3e.specifiche-057caf2f")} />

      {/* Live emphasis comparison */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.foundations-m3e.confronto-livelli-interattivo-a51269ae")}</span>
        <p className="dsx-s-b8f661b746">
          {showcaseMessage("components.design-system.foundations-m3e.clicca-su-un-livello-per-evidenziarlo-nota-2c1bd860")}</p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMPHASIS_LEVELS.map((e, i) => (
            <motion.button
              key={e.level}
              onClick={() => setActiveLevel(i)}
              whileHover={{ scale: e.motionScale }}
              className={[`flex flex-col items-center gap-3 p-4 cursor-pointer active:scale-95 transition-transform ${e.shape}`, "dsx-s-9870df0897"].filter(Boolean).join(" ")}
              style={{ "--dsx-background": toShowcaseCssValue(e.color.bg, false), "--dsx-color": toShowcaseCssValue(e.color.fg, false), "--dsx-border": toShowcaseCssValue(activeLevel === i
                                                  ? "2px solid var(--primary)"
                                                  : i <= 1
                                                    ? "none"
                                                    : "1px solid var(--outline-variant)", false), "--dsx-box-shadow": toShowcaseCssValue(e.elevation !== "none" ? e.elevation : "none", false) } as any}
            >
              {/* Icon specimen */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center dsx-s-fbecfa7efd"
                style={{ "--dsx-background": toShowcaseCssValue(i === 0
                                                            ? "color-mix(in srgb, var(--primary-foreground) 15%, transparent)"
                                                            : "color-mix(in srgb, currentColor 8%, transparent)", false) } as any}
              >
                <Star size={20} />
              </div>

              {/* Label */}
              <div className="text-center">
                <div style={{ "--dsx-font-weight": toShowcaseCssValue(e.weight, true) } as any} className="dsx-s-7ae2dc6f45">
                  {e.level}
                </div>
                <div style={{ "--dsx-font-size": toShowcaseCssValue(e.fontSize, false), "--dsx-font-weight": toShowcaseCssValue(e.weight, true) } as any} className="dsx-s-b3ec628d17">
                  {showcaseMessage("components.design-system.foundations-m3e.esempio-testo-13af50f1")}</div>
              </div>

              {/* Chip-like examples */}
              <div className="flex flex-wrap gap-1 justify-center">
                {e.examples.slice(0, 2).map((ex) => (
                  <span
                    key={ex} className="dsx-s-a4d8f67478"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detail panel for active level */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={showcaseTransition.preset_0e2957ab5e}
          className="surface-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full dsx-s-fbecfa7efd"
              style={{ "--dsx-background": toShowcaseCssValue(EMPHASIS_LEVELS[activeLevel].color.bg === "var(--surface-container-low)" ? "var(--muted-foreground)" : EMPHASIS_LEVELS[activeLevel].color.bg, false) } as any}
            />
            <span className="dsx-s-c60540e492">
              {EMPHASIS_LEVELS[activeLevel].level} {showcaseMessage("components.design-system.foundations-m3e.emphasis-c3249f37")}</span>
          </div>
          <p className="dsx-s-b40c42da32">
            {EMPHASIS_LEVELS[activeLevel].desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {EMPHASIS_LEVELS[activeLevel].examples.map((ex) => (
              <span
                key={ex}
                className="px-3 py-1.5 rounded-lg dsx-s-d9b371a3b6"
              >
                {ex}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mapping table */}
      <div className="surface-card overflow-hidden">
        <div className="px-4 py-3 dsx-s-ff83771d47">
          <span className="type-label dsx-s-e2184fadc0">
            {showcaseMessage("components.design-system.foundations-m3e.matrice-emphasis-proprieta-c70be159")}</span>
        </div>
        <div
          className="overflow-x-auto"
          role="region"
          tabIndex={0}
          aria-label={showcaseMessage("components.design-system.foundations-m3e.matrice-emphasis-proprieta-c70be159")}
        >
          <table className="w-full dsx-s-97a92178cd">
            <thead>
              <tr className="dsx-s-ff83771d47">
                <th className="px-3 py-2 text-left type-data dsx-s-6996f2eedb">{showcaseMessage("components.design-system.foundations-m3e.proprieta-7f49d584")}</th>
                {["High", "Medium", "Low", "Lowest"].map((l) => (
                  <th key={l} className="px-3 py-2 text-left type-data dsx-s-d4cbd3ba0a">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMPHASIS_MAPPING.map((row, i) => (
                <tr key={row.prop} style={{ "--dsx-border-bottom": toShowcaseCssValue(i < EMPHASIS_MAPPING.length - 1 ? "1px solid var(--outline-variant)" : "none", false) } as any} className="dsx-s-57dac8b284">
                  <td className="px-3 py-2 dsx-s-7429dbc22f">{row.prop}</td>
                  <td className="px-3 py-2 type-code dsx-s-63782726c0">{row.high}</td>
                  <td className="px-3 py-2 type-code dsx-s-63782726c0">{row.medium}</td>
                  <td className="px-3 py-2 type-code dsx-s-63782726c0">{row.low}</td>
                  <td className="px-3 py-2 type-code dsx-s-63782726c0">{row.lowest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA 16 — CONTAINER TRANSFORM (M3 Expressive)
   Morphing organico tra stati: FAB→Sheet, Card→Expanded,
   Chip→Selected. Il container è un organismo vivente.
   ═══════════════════════════════════════════════════════════ */

const MORPH_DEMOS = [
  {
    id: "fab",
    label: showcaseMessage("components.design-system.foundations-m3e.fab-sheet-d9a47bac"),
    desc: showcaseMessage("components.design-system.foundations-m3e.il-fab-si-espande-in-un-pannello-azione-3928328a"),
    collapsed: { w: 56, h: 56, r: "28px", bg: "var(--primary)", fg: "var(--primary-foreground)" },
    expanded: { w: 280, h: 160, r: "28px", bg: "var(--primary-container)", fg: "var(--on-primary-container)" },
  },
  {
    id: "card",
    label: showcaseMessage("components.design-system.foundations-m3e.card-detail-8cc1da09"),
    desc: showcaseMessage("components.design-system.foundations-m3e.la-card-si-espande-in-vista-dettaglio-948cf91d"),
    collapsed: { w: 140, h: 100, r: "16px", bg: "var(--surface-container)", fg: "var(--text-default)" },
    expanded: { w: 280, h: 180, r: "24px", bg: "var(--surface-container-low)", fg: "var(--text-default)" },
  },
  {
    id: "chip",
    label: showcaseMessage("components.design-system.foundations-m3e.chip-active-47f4f1d9"),
    desc: showcaseMessage("components.design-system.foundations-m3e.il-chip-cambia-colore-e-forma-al-toggle-50ef69a7"),
    collapsed: { w: 100, h: 36, r: "12px", bg: "var(--surface-container)", fg: "var(--on-surface-variant)" },
    expanded: { w: 120, h: 40, r: "20px", bg: "var(--primary)", fg: "var(--primary-foreground)" },
  },
];

function ContainerTransformSection() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations-m3e.container-transform-99f9a5ef")}
        description={showcaseMessage("components.design-system.foundations-m3e.m3-expressive-tratta-i-container-come-orga-0bbf556e")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MORPH_DEMOS.map((demo) => {
          const isExpanded = expandedIds.has(demo.id);
          const state = isExpanded ? demo.expanded : demo.collapsed;

          return (
            <div key={demo.id} className="surface-card p-5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 w-full">
                <span className="type-data dsx-s-5c744891ef">{demo.label}</span>
              </div>
              <p className="dsx-s-26feb26ebe">
                {demo.desc}
              </p>

              {/* Morph container */}
              <div className="relative flex items-center justify-center dsx-s-01de26f7d0">
                <motion.button
                  onClick={() => toggle(demo.id)}
                  aria-label={demo.label}
                  animate={{
                    width: state.w,
                    height: state.h,
                    borderRadius: state.r,
                    backgroundColor: state.bg,
                    color: state.fg,
                  }}
                  transition={showcaseTransition.preset_d6556213f2}
                  className="flex items-center justify-center overflow-hidden cursor-pointer active:scale-97 transition-transform dsx-s-9afb78db64"
                  style={{ "--dsx-box-shadow": toShowcaseCssValue(isExpanded ? "var(--shadow-md)" : "var(--shadow-sm)", false) } as any}
                >
                  <AnimatePresence mode="wait">
                    {!isExpanded ? (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={showcaseTransition.preset_304998007a}
                        className="flex items-center justify-center"
                      >
                        {demo.id === "fab" && <Flame size={24} />}
                        {demo.id === "card" && (
                          <div className="flex flex-col items-center gap-1">
                            <Heart size={18} />
                            <span className="dsx-s-85ec651394">{showcaseMessage("components.design-system.foundations-m3e.tocca-3e86bdf5")}</span>
                          </div>
                        )}
                        {demo.id === "chip" && (
                          <span className="dsx-s-d15c696f41">{showcaseMessage("components.design-system.foundations-m3e.stile-36bcfdbc")}</span>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={showcaseTransition.preset_a559023bfd}
                        className="flex flex-col items-center justify-center gap-2 p-4"
                      >
                        {demo.id === "fab" && (
                          <div className="dsx-s-043808a943">
                            <Flame size={20} />
                            <span className="dsx-s-85ec651394">{showcaseMessage("components.design-system.foundations-m3e.nuova-ricetta-f620b619")}</span>
                            <div className="flex gap-2">
                              {["Veloce", "Classica", "Gourmet"].map((opt) => (
                                <span key={opt} className="px-2 py-1 rounded-lg dsx-s-56f05d5877">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {demo.id === "card" && (
                          <div className="dsx-s-043808a943">
                            <Heart size={18} />
                            <span className="dsx-s-d3069e7078">{showcaseMessage("components.design-system.foundations-m3e.napoletana-stg-fc9d3868")}</span>
                            <span className="dsx-s-f89fc9f884">{showcaseMessage("components.design-system.foundations-m3e.score-87-forno-legna-bc693098")}</span>
                            <span className="dsx-s-5ee3b2d0dd">{showcaseMessage("components.design-system.foundations-m3e.tocca-per-chiudere-dbc6eea7")}</span>
                          </div>
                        )}
                        {demo.id === "chip" && (
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={showcaseTransition.preset_4ca9650ce3}
                            >
                              <Star size={14} />
                            </motion.div>
                            <span className="dsx-s-85ec651394">{showcaseMessage("components.design-system.foundations-m3e.attivo-b2bba8d5")}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* State indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(isExpanded ? "var(--cta)" : "var(--muted-foreground)", false) } as any} />
                <span className="type-data dsx-s-03efa1acac" style={{ "--dsx-color": toShowcaseCssValue(isExpanded ? "var(--cta)" : "var(--muted-foreground)", false) } as any}>
                  {isExpanded ? showcaseMessage("components.design-system.foundations-m3e.espanso-1b59e15d") : showcaseMessage("components.design-system.foundations-m3e.collassato-41d92fdf")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motion specs */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations-m3e.specifiche-container-transform-6765d0b6")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: showcaseMessage("components.design-system.foundations-m3e.spring-89677615"), desc: showcaseMessage("components.design-system.foundations-m3e.stiffness-400-damping-28-mass-1-m3e-emphas-1fc8431e") },
            { label: showcaseMessage("components.design-system.foundations-m3e.continuita-195ee3ed"), desc: showcaseMessage("components.design-system.foundations-m3e.stesso-elemento-morfa-nessun-crossfade-nes-4c915757") },
            { label: showcaseMessage("components.design-system.foundations-m3e.contenuto-fd190428"), desc: showcaseMessage("components.design-system.foundations-m3e.interno-crossfade-con-animatepresence-mode-606d3fdb") },
            { label: showcaseMessage("components.design-system.foundations-m3e.ombra-60e878df"), desc: showcaseMessage("components.design-system.foundations-m3e.elevation-scala-con-lo-stato-sm-md-durante-84a7d173") },
          ].map((spec) => (
            <div key={spec.label} className="p-3 rounded-lg dsx-s-e4f209c55b">
              <span className="type-data dsx-s-133edc77c0">{spec.label}</span>
              <p className="dsx-s-ff544bce2a">{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "emphasis", label: showcaseMessage("components.design-system.foundations-m3e.emphasis-system-0984df4a"), group: "f", Component: EmphasisSystemSection },
  { id: "container-transform", label: showcaseMessage("components.design-system.foundations-m3e.container-transform-99f9a5ef"), group: "f", Component: ContainerTransformSection },
];
