import { Flame,Heart,Star } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useState } from "react";
import type { SectionEntry } from "./shared";
import {
Panoramica,
SectionHeader,
SubSectionLabel
} from "./shared";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA 15 — EMPHASIS SYSTEM (M3 Expressive)
   4 livelli di enfasi che mappano colore, tipografia,
   container shape e motion per ogni componente.
   ═══════════════════════════════════════════════════════════ */

const EMPHASIS_LEVELS = [
  {
    level: "High",
    desc: "Azione primaria, CTA — massima attenzione",
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
    desc: "Azioni secondarie, informazioni importanti",
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
    desc: "Contesto, metadata, azioni terziarie",
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
    desc: "Sfondo, decorazione, rumore visivo minimo",
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
  { prop: "Background", high: "--primary", medium: "--primary-container", low: "--surface-container", lowest: "--surface-container-low" },
  { prop: "Foreground", high: "--primary-foreground", medium: "--on-primary-container", low: "--on-surface-variant", lowest: "--muted-foreground" },
  { prop: "Border", high: "nessuno", medium: "--outline-variant", low: "--outline-variant", lowest: "--outline-variant" },
  { prop: "Weight", high: "700 (bold)", medium: "600 (semi)", low: "500 (medium)", lowest: "400 (regular)" },
  { prop: "Radius", high: "rounded-2xl", medium: "rounded-xl", low: "rounded-lg", lowest: "rounded-md" },
  { prop: "Shadow", high: "elevation-2", medium: "elevation-1", low: "nessuna", lowest: "nessuna" },
  { prop: "Motion", high: "spring bouncy", medium: "spring smooth", low: "spring gentle", lowest: "nessuna" },
];

function EmphasisSystemSection() {
  const [activeLevel, setActiveLevel] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Emphasis System"
        description="4 livelli di enfasi che mappano colore, tipografia, container shape e motion per ogni componente. High → Medium → Low → Lowest."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="L'Emphasis System definisce 4 livelli gerarchici (High, Medium, Low, Lowest) che controllano colore, tipografia, forma, ombre e animazione di ogni componente. Garantisce gerarchia visiva coerente in tutta l'app."
        principi={[
          "High: azioni primarie (CTA, FAB) — colore pieno, font bold, radius grande, ombra",
          "Medium: azioni secondarie — container colorato, weight semibold",
          "Low: informazioni di supporto — outline o tonal, peso medio",
          "Lowest: rumore minimo — text-only, nessuna ombra, radius ridotto",
        ]}
      />
      <SubSectionLabel label="Specifiche" />

      {/* Live emphasis comparison */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Confronto livelli — interattivo
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", marginTop: "6px", lineHeight: "var(--leading-relaxed)" }}>
          Clicca su un livello per evidenziarlo. Nota come colore, peso, forma e ombra scalano insieme.
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMPHASIS_LEVELS.map((e, i) => (
            <motion.button
              key={e.level}
              onClick={() => setActiveLevel(i)}
              whileHover={{ scale: e.motionScale }}
              className={`flex flex-col items-center gap-3 p-4 cursor-pointer active:scale-95 transition-transform ${e.shape}`}
              style={{
                background: e.color.bg,
                color: e.color.fg,
                border: activeLevel === i
                  ? "2px solid var(--primary)"
                  : i <= 1
                    ? "none"
                    : "1px solid var(--outline-variant)",
                boxShadow: e.elevation !== "none" ? e.elevation : "none",
                outline: "none",
              }}
            >
              {/* Icon specimen */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: i === 0
                    ? "color-mix(in srgb, var(--primary-foreground) 15%, transparent)"
                    : "color-mix(in srgb, currentColor 8%, transparent)",
                }}
              >
                <Star size={20} />
              </div>

              {/* Label */}
              <div className="text-center">
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: e.weight,
                  letterSpacing: "var(--tracking-caps)",
                  textTransform: "uppercase" as const,
                }}>
                  {e.level}
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: e.fontSize,
                  fontWeight: e.weight,
                  marginTop: "4px",
                }}>
                  Esempio testo
                </div>
              </div>

              {/* Chip-like examples */}
              <div className="flex flex-wrap gap-1 justify-center">
                {e.examples.slice(0, 2).map((ex) => (
                  <span
                    key={ex}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-base)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "color-mix(in srgb, currentColor 10%, transparent)",
                      whiteSpace: "nowrap" as const,
                    }}
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
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="surface-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: EMPHASIS_LEVELS[activeLevel].color.bg === "var(--surface-container-low)" ? "var(--muted-foreground)" : EMPHASIS_LEVELS[activeLevel].color.bg }}
            />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" as const }}>
              {EMPHASIS_LEVELS[activeLevel].level} Emphasis
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginBottom: "12px" }}>
            {EMPHASIS_LEVELS[activeLevel].desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {EMPHASIS_LEVELS[activeLevel].examples.map((ex) => (
              <span
                key={ex}
                className="px-3 py-1.5 rounded-lg"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--weight-semibold)" as any,
                  background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                  color: "var(--primary)",
                }}
              >
                {ex}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mapping table */}
      <div className="surface-card overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
            Matrice Emphasis × Proprietà
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                <th className="px-3 py-2 text-left type-data" style={{ color: "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>Proprietà</th>
                {["High", "Medium", "Low", "Lowest"].map((l) => (
                  <th key={l} className="px-3 py-2 text-left type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMPHASIS_MAPPING.map((row, i) => (
                <tr key={row.prop} style={{ borderBottom: i < EMPHASIS_MAPPING.length - 1 ? "1px solid var(--outline-variant)" : "none" }}>
                  <td className="px-3 py-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{row.prop}</td>
                  <td className="px-3 py-2 type-code" style={{ color: "var(--muted-foreground)" }}>{row.high}</td>
                  <td className="px-3 py-2 type-code" style={{ color: "var(--muted-foreground)" }}>{row.medium}</td>
                  <td className="px-3 py-2 type-code" style={{ color: "var(--muted-foreground)" }}>{row.low}</td>
                  <td className="px-3 py-2 type-code" style={{ color: "var(--muted-foreground)" }}>{row.lowest}</td>
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
    label: "FAB → Sheet",
    desc: "Il FAB si espande in un pannello azione",
    collapsed: { w: 56, h: 56, r: "28px", bg: "var(--primary)", fg: "var(--primary-foreground)" },
    expanded: { w: 280, h: 160, r: "28px", bg: "var(--primary-container)", fg: "var(--on-primary-container)" },
  },
  {
    id: "card",
    label: "Card → Detail",
    desc: "La card si espande in vista dettaglio",
    collapsed: { w: 140, h: 100, r: "16px", bg: "var(--surface-container)", fg: "var(--text-default)" },
    expanded: { w: 280, h: 180, r: "24px", bg: "var(--surface-container-low)", fg: "var(--text-default)" },
  },
  {
    id: "chip",
    label: "Chip → Active",
    desc: "Il chip cambia colore e forma al toggle",
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
        title="Container Transform"
        description="M3 Expressive tratta i container come organismi che morfano tra stati. La transizione mantiene continuità visiva: stessa origine, stessa identità, forma diversa. Clicca per attivare ogni trasformazione."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MORPH_DEMOS.map((demo) => {
          const isExpanded = expandedIds.has(demo.id);
          const state = isExpanded ? demo.expanded : demo.collapsed;

          return (
            <div key={demo.id} className="surface-card p-5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 w-full">
                <span className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, color: "var(--primary)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" as const }}>{demo.label}</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", lineHeight: "var(--leading-body)", width: "100%" }}>
                {demo.desc}
              </p>

              {/* Morph container */}
              <div className="relative flex items-center justify-center" style={{ minHeight: "200px", width: "100%" }}>
                <motion.button
                  onClick={() => toggle(demo.id)}
                  animate={{
                    width: state.w,
                    height: state.h,
                    borderRadius: state.r,
                    backgroundColor: state.bg,
                    color: state.fg,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    mass: 1,
                  }}
                  className="flex items-center justify-center overflow-hidden cursor-pointer active:scale-97 transition-transform"
                  style={{
                    border: "none",
                    outline: "none",
                    boxShadow: isExpanded ? "var(--shadow-md)" : "var(--shadow-sm)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!isExpanded ? (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 700, damping: 35 }}
                        className="flex items-center justify-center"
                      >
                        {demo.id === "fab" && <Flame size={24} />}
                        {demo.id === "card" && (
                          <div className="flex flex-col items-center gap-1">
                            <Heart size={18} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any }}>Tocca</span>
                          </div>
                        )}
                        {demo.id === "chip" && (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-medium)" as any }}>Stile</span>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 600, damping: 30, delay: 0.1 }}
                        className="flex flex-col items-center justify-center gap-2 p-4"
                      >
                        {demo.id === "fab" && (
                          <div style={{ display: "contents" }}>
                            <Flame size={20} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any }}>Nuova ricetta</span>
                            <div className="flex gap-2">
                              {["Veloce", "Classica", "Gourmet"].map((opt) => (
                                <span key={opt} className="px-2 py-1 rounded-lg" style={{
                                  fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-medium)" as any,
                                  background: "color-mix(in srgb, currentColor 12%, transparent)",
                                }}>
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {demo.id === "card" && (
                          <div style={{ display: "contents" }}>
                            <Heart size={18} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any }}>Napoletana STG</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", opacity: 0.7 }}>Score: 87 · Forno legna</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", opacity: 0.5 }}>Tocca per chiudere</span>
                          </div>
                        )}
                        {demo.id === "chip" && (
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            >
                              <Star size={14} />
                            </motion.div>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any }}>Attivo</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* State indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: isExpanded ? "var(--cta)" : "var(--muted-foreground)" }} />
                <span className="type-data" style={{ color: isExpanded ? "var(--cta)" : "var(--muted-foreground)", fontWeight: "var(--weight-semibold)" as any }}>
                  {isExpanded ? "Espanso" : "Collassato"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motion specs */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Specifiche Container Transform</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Spring", desc: "stiffness: 400, damping: 28, mass: 1 — M3E 'emphasized' curve" },
            { label: "Continuità", desc: "Stesso elemento morfa: nessun crossfade, nessun replace. Layout animation puro." },
            { label: "Contenuto", desc: "Interno crossfade con AnimatePresence mode='wait', delay 100ms per leggibilità" },
            { label: "Ombra", desc: "Elevation scala con lo stato: sm→md durante espansione, sincronizzata con shape" },
          ].map((spec) => (
            <div key={spec.label} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--primary)" }}>{spec.label}</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-body)" }}>{spec.desc}</p>
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
  { id: "emphasis", label: "Emphasis System", group: "f", Component: EmphasisSystemSection },
  { id: "container-transform", label: "Container Transform", group: "f", Component: ContainerTransformSection },
];