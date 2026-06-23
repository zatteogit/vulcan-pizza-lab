import { Flame,Moon,Sun,Timer,Wheat,Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { SectionEntry } from "./shared";
import {
AccessibilitaInfo,
AnatomyRow,
LineeGuida,
Panoramica,
SectionHeader,
SubSectionLabel,
} from "./shared";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA — GLASSMORPHISM & LIQUID GLASS
   Merged: Vulcan glassmorphism pattern + iOS 26 reference
   ═══════════════════════════════════════════════════════════ */

/* ── Glass Material Layers (iOS 26 reference) ── */
const GLASS_LAYERS = [
  {
    name: "Shadow Layer",
    desc: "Ombra diffusa sotto il container per profondita",
    css: "backdrop-blur(40px)\nbackground: rgba(0,0,0,0.08)\nmix-blend-mode: hard-light",
  },
  {
    name: "Glass Effect",
    desc: "Overlay bianco semitrasparente con screen blend",
    css: "background: rgba(255,255,255,0.07)\nmix-blend-mode: screen",
  },
  {
    name: "Fill Layer",
    desc: "Tinta colorata con plus-lighter blend",
    css: "background: #242424 (dark)\nmix-blend-mode: plus-lighter",
  },
  {
    name: "Content Layer",
    desc: "Icone e testo con plus-lighter e opacita 90%",
    css: "mix-blend-mode: plus-lighter\nopacity: 0.9\ncolor: #d9d9d9",
  },
];

const VULCAN_ADAPTATION = [
  { from: "rgba(0,0,0,0.08)", to: "color-mix(in srgb, var(--container-page) 88%, transparent)", note: "Header sticky" },
  { from: "blur(40px)", to: "blur(24px) saturate(1.6)", note: "Meno aggressivo, più caldo" },
  { from: "rgba(255,255,255,0.07)", to: "var(--outline-variant) / opacity 0.12", note: "Bordi morbidi" },
  { from: "mix-blend-mode: plus-lighter", to: "Non usato (troppo iOS-specifico)", note: "Preferiamo color-mix" },
  { from: "rounded-[100px]", to: "rounded-2xl (1rem)", note: "Coerenza con DS Vulcan" },
];

/* ── Interactive Glass Specimen ── */
function GlassSpecimen({
  label,
  blur,
  bgOpacity,
  glassOpacity,
  radius,
}: {
  label: string;
  blur: number;
  bgOpacity: number;
  glassOpacity: number;
  radius: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex flex-col items-center justify-center cursor-pointer overflow-hidden active:scale-[0.97] transition-transform"
      style={{
        width: "120px",
        height: "120px",
        borderRadius: radius,
        border: `1px solid rgba(255,255,255,${glassOpacity * 2})`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          background: `rgba(0,0,0,${bgOpacity})`,
          borderRadius: "inherit",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,${glassOpacity * 0.6}) 0%, rgba(0,0,0,0) 70%)`,
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      />
      <div className="relative flex flex-col items-center gap-1.5" style={{ zIndex: 1 }}>
        <Flame size={24} style={{ color: "var(--glass-icon)" }} />
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--weight-semibold)" as any,
          color: "var(--glass-text)",
          letterSpacing: "var(--tracking-spread)",
        }}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Interactive Blur Slider ── */
function BlurPlayground() {
  const [blur, setBlur] = useState(24);
  const [opacity, setOpacity] = useState(8);
  const [glass, setGlass] = useState(7);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative h-56 rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--outline-variant)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1689010039458-c605ea68c0b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZmlyZWQlMjBwaXp6YSUyMG92ZW4lMjBmbGFtZXMlMjBkYXJrfGVufDF8fHx8MTc3MTIyNjI2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "var(--glass-panel-warm)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "160px", height: "160px", top: "-20px", right: "-30px",
            background: "var(--glass-orb-primary)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "120px", height: "120px", bottom: "10px", left: "20px",
            background: "var(--glass-orb-secondary)",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center gap-4 p-6">
          <GlassSpecimen label="Vulcan" blur={blur} bgOpacity={opacity / 100} glassOpacity={glass / 100} radius="var(--radius, 1rem)" />
          <GlassSpecimen label="Pill" blur={blur} bgOpacity={opacity / 100} glassOpacity={glass / 100} radius="9999px" />
          <div
            className="relative flex flex-col gap-2 p-4 overflow-hidden"
            style={{
              width: "160px",
              borderRadius: "var(--radius, 1rem)",
              border: `1px solid rgba(255,255,255,${(glass / 100) * 2})`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                background: `rgba(0,0,0,${opacity / 100})`,
                borderRadius: "inherit",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,${(glass / 100) * 0.6}) 0%, rgba(0,0,0,0) 70%)`,
                borderRadius: "inherit",
                pointerEvents: "none",
              }}
            />
            {[
              { icon: Flame, label: "Idratazione", val: "68%" },
              { icon: Wheat, label: "Farina W", val: "300" },
              { icon: Timer, label: "Fermento", val: "24h" },
            ].map((item) => (
              <div key={item.label} className="relative flex items-center gap-2" style={{ zIndex: 1 }}>
                <item.icon size={14} style={{ color: "var(--glass-text-dim)" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--glass-text)" }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--glass-text-bright)", marginLeft: "auto", fontFeatureSettings: "'tnum'" }}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Blur", value: blur, set: setBlur, min: 0, max: 60, unit: "px" },
          { label: "BG Opacity", value: opacity, set: setOpacity, min: 0, max: 30, unit: "%" },
          { label: "Glass Overlay", value: glass, set: setGlass, min: 0, max: 20, unit: "%" },
        ].map((s) => {
          const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>{s.label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)", fontFeatureSettings: "'tnum'" }}>
                  {s.value}{s.unit}
                </span>
              </div>
              <div className="relative w-full h-6 flex items-center">
                <div className="absolute w-full h-2 rounded-full" style={{ background: "var(--surface-container-high)" }} />
                <div className="absolute h-2 rounded-full" style={{ width: `${pct}%`, background: "var(--primary)" }} />
                <input
                  type="range" min={s.min} max={s.max} value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="absolute w-full h-6 cursor-pointer"
                  style={{ opacity: 0, margin: 0, left: 0, top: 0, zIndex: 2, WebkitAppearance: "none", padding: 0 }}
                />
                <div
                  className="absolute w-5 h-5 rounded-full pointer-events-none"
                  style={{
                    left: `calc(${pct}% - 10px)`,
                    background: "var(--primary)",
                    border: "2.5px solid var(--primary-foreground)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ EXPORTED SECTION ═══ */
export function GlassmorphismLiquidGlassSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Glassmorphism & Liquid Glass"
        description="Pattern per header sticky e overlay Vulcan, con riferimento alla composizione materiale iOS 26 Liquid Glass. Background con color-mix + backdrop-filter blur(24px) saturate(1.6). Playground interattivo per esplorare blur, opacita e glass overlay."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il glassmorphism in Vulcan crea profondità senza oscurare il contenuto sottostante. Usato per header sticky, modali e overlay. L'implementazione preferisce color-mix + saturate rispetto ai blend mode iOS."
        principi={[
          "blur(24px) saturate(1.6) come standard Vulcan — meno aggressivo dell'iOS 40px",
          "color-mix(in srgb, var(--container-page) 88%, transparent) per il background",
          "Border sottile con var(--border-muted) per definire i contorni",
          "Evitare mix-blend-mode: plus-lighter — troppo specifico per iOS",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Pattern Vulcan — header sticky</h3>
        <div className="relative h-48 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--outline-variant)" }}>
          <div className="absolute inset-0" style={{ background: "var(--grad-ember)" }} />
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-px opacity-30">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="rounded"
                style={{
                  background: i % 3 === 0 ? "var(--warm-terracotta)" : i % 3 === 1 ? "var(--warm-oak)" : "var(--warm-sage)",
                  opacity: 0.3 + (i % 5) * 0.12,
                }}
              />
            ))}
          </div>
          <div
            className="absolute top-0 left-0 right-0 h-14 flex items-center px-5"
            style={{
              background: "color-mix(in srgb, var(--container-page) 88%, transparent)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              borderBottom: "1px solid var(--border-muted)",
            }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
              Header con Glassmorphism
            </span>
          </div>
          <div
            className="absolute bottom-3 left-3 right-3 p-3 rounded-xl"
            style={{
              background: "color-mix(in srgb, var(--container-page) 92%, transparent)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <code
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "var(--font-size-lg)",
                color: "var(--muted-foreground)",
                lineHeight: "var(--leading-reading)",
                display: "block",
                whiteSpace: "pre-wrap",
              }}
            >
              {`background: color-mix(in srgb, var(--container-page) 88%, transparent);\nbackdrop-filter: blur(24px) saturate(1.6);\nborder-bottom: 1px solid var(--border-muted);`}
            </code>
          </div>
        </div>
      </div>

      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Recipe Hero Card Glassmorphism</h3>
        <div className="relative h-56 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--outline-variant)" }}>
          <div className="absolute inset-0" style={{ background: "var(--grad-ember)" }} />
          <div
            className="absolute inset-x-4 top-4 bottom-4 p-5 rounded-2xl flex flex-col justify-between"
            style={{
              background: "var(--recipe-hero-card-bg)",
              backdropFilter: "blur(24px) saturate(1.7)",
              WebkitBackdropFilter: "blur(24px) saturate(1.7)",
              border: "1px solid var(--container-border)",
              boxShadow: "var(--recipe-hero-card-shadow)",
            }}
          >
            <div>
              <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-accent)", textTransform: "uppercase", fontWeight: "var(--weight-semibold)" }}>Procedimento</span>
              <h1 className="font-serif mt-1" style={{ fontSize: "var(--font-size-6xl)", color: "var(--text-default)", fontWeight: "var(--weight-bold)", margin: 0 }}>Napoletana STG</h1>
            </div>
            <code
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "var(--font-size-md)",
                color: "var(--muted-foreground)",
                whiteSpace: "pre-wrap",
              }}
            >
              {`background: var(--recipe-hero-card-bg);\nbackdrop-filter: blur(24px) saturate(1.7);\nborder: 1px solid var(--container-border);\nbox-shadow: var(--recipe-hero-card-shadow);`}
            </code>
          </div>
        </div>
      </div>

      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Riferimento iOS 26 — composizione materiale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GLASS_LAYERS.map((layer) => (
            <div key={layer.name} className="surface-card p-4">
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                {layer.name}
              </span>
              <p className="type-body" style={{ color: "var(--muted-foreground)", marginTop: "4px" }}>
                {layer.desc}
              </p>
              <code style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "var(--font-size-lg)",
                color: "var(--primary)",
                display: "block",
                marginTop: "8px",
                whiteSpace: "pre-wrap",
                lineHeight: "var(--leading-reading)",
              }}>
                {layer.css}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Playground interattivo</h3>
        <div className="surface-card p-5">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--text-default)", marginBottom: "12px", display: "block" }}>
            Trascina i cursori per esplorare il materiale glass. Il pannello "Vulcan" usa <code style={{ fontFamily: "'DM Mono', monospace", color: "var(--primary)" }}>var(--radius-lg)</code> (1rem), il "Pill" e riferimento iOS.
          </span>
          <BlurPlayground />
        </div>
      </div>

      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Adattamento iOS 26 → Vulcan Pizza Lab</h3>
        <div className="surface-card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
            <span className="type-label" style={{ color: "var(--text-default)" }}>
              Mappatura proprietà
            </span>
          </div>
          <div className="flex flex-col">
            {VULCAN_ADAPTATION.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 px-4 py-3 items-start"
                style={{
                  borderBottom: i < VULCAN_ADAPTATION.length - 1 ? "1px solid var(--outline-variant)" : "none",
                }}
              >
                <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-lg)", color: "var(--muted-foreground)" }}>
                  {row.from}
                </code>
                <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-lg)", color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>
                  {row.to}
                </code>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", color: "var(--muted-foreground)", lineHeight: "var(--leading-body)" }}>
                  {row.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Pattern Vulcan: dove applicarlo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { context: "Header sticky", recipe: "blur(24px) saturate(1.6)\ncolor-mix(bg 88%)\nborder-bottom: border-muted", icon: Sun },
            { context: "ScoreDashboard modal", recipe: "blur(32px)\ncolor-mix(bg 92%)\nz-index: 9999\nfixed inset-0", icon: Zap },
            { context: "Bottom sheet overlay", recipe: "blur(16px)\ncolor-mix(bg 85%)\nborder-top: outline-variant", icon: Moon },
          ].map((p) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.context}
                className="surface-card p-4 active:scale-[0.98] transition-transform"
                whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: "var(--primary)" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                    {p.context}
                  </span>
                </div>
                <code style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "var(--font-size-lg)",
                  color: "var(--muted-foreground)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "var(--leading-reading)",
                  display: "block",
                }}>
                  {p.recipe}
                </code>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)" }}>Specifiche Glassmorphism</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: "Backdrop", val: "blur(24px) saturate(1.6)" },
            { prop: "Background", val: "color-mix(bg 88%)" },
            { prop: "Border", val: "1px solid var(--border-muted)" },
            { prop: "Radius", val: "var(--radius-lg) -> 1rem / 16px" },
            { prop: "iOS ref blur", val: "40px (non usato in Vulcan)" },
            { prop: "iOS blend", val: "plus-lighter (non usato)" },
            { prop: "Vulcan blend", val: "color-mix + saturate" },
            { prop: "Pill shape", val: "9999px (solo iOS ref)" },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare color-mix per trasparenze — più prevedibile di opacity",
          "Limitare il glass a 2-3 elementi per schermata",
          "Testare sempre su sfondi complessi (gradienti, immagini)",
        ]}
        nonFare={[
          "Mai backdrop-filter senza fallback opaco per browser non supportati",
          "Mai glass su elementi con molto testo — riduce la leggibilità",
          "Mai impilare più layer glass — performance costosa",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Contrasto", desc: "Il testo su glass deve mantenere WCAG AA. Usare color-mix con almeno 85% di background." },
        { label: "Reduced motion", desc: "Nessun impatto — il glass è statico, non animato." },
        { label: "Performance", desc: "backdrop-filter è costoso su mobile. Limitare a header e modali." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "glass", label: "Glassmorphism & Liquid Glass", group: "f", Component: GlassmorphismLiquidGlassSection },
];