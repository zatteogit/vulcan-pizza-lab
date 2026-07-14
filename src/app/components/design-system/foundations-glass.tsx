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
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA — GLASSMORPHISM & LIQUID GLASS
   Merged: Vulcan glassmorphism pattern + iOS 26 reference
   ═══════════════════════════════════════════════════════════ */

/* ── Glass Material Layers (iOS 26 reference) ── */
const GLASS_LAYERS = [
  {
    name: showcaseMessage("components.design-system.foundations-glass.shadow-layer-d70148a5"),
    desc: showcaseMessage("components.design-system.foundations-glass.ombra-diffusa-sotto-il-container-per-profo-e8b13fb7"),
    css: "backdrop-blur(40px)\nbackground: rgba(0,0,0,0.08)\nmix-blend-mode: hard-light",
  },
  {
    name: showcaseMessage("components.design-system.foundations-glass.glass-effect-a3b6a93d"),
    desc: showcaseMessage("components.design-system.foundations-glass.overlay-bianco-semitrasparente-con-screen--16012a18"),
    css: "background: rgba(255,255,255,0.07)\nmix-blend-mode: screen",
  },
  {
    name: showcaseMessage("components.design-system.foundations-glass.fill-layer-5d4135b8"),
    desc: showcaseMessage("components.design-system.foundations-glass.tinta-colorata-con-plus-lighter-blend-3b6ec2ae"),
    css: "background: #242424 (dark)\nmix-blend-mode: plus-lighter",
  },
  {
    name: showcaseMessage("components.design-system.foundations-glass.content-layer-a4b3a13c"),
    desc: showcaseMessage("components.design-system.foundations-glass.icone-e-testo-con-plus-lighter-e-opacita-9-1fbd5e3f"),
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
      transition={showcaseTransition.preset_0e2957ab5e}
      className="relative flex flex-col items-center justify-center cursor-pointer overflow-hidden active:scale-97 transition-transform dsx-s-99af6086ac"
      style={{ "--dsx-border-radius": toShowcaseCssValue(radius, false), "--dsx-border": toShowcaseCssValue(`1px solid rgba(255,255,255,${glassOpacity * 2})`, false) } as any}
    >
      <div
        className="absolute inset-0 dsx-s-3ee2e21bef"
        style={{ "--dsx-backdrop-filter": toShowcaseCssValue(`blur(${blur}px)`, false), "--dsx-webkit-backdrop-filter": toShowcaseCssValue(`blur(${blur}px)`, false), "--dsx-background": toShowcaseCssValue(`rgba(0,0,0,${bgOpacity})`, false) } as any}
      />
      <div
        className="absolute inset-0 dsx-s-e184316eaf"
        style={{ "--dsx-background": toShowcaseCssValue(`radial-gradient(ellipse at 30% 20%, rgba(255,255,255,${glassOpacity * 0.6}) 0%, rgba(0,0,0,0) 70%)`, false) } as any}
      />
      <div className="relative flex flex-col items-center gap-1.5 dsx-s-1f9ab3be63">
        <Flame size={24} className="dsx-s-da205c28bb" />
        <span className="dsx-s-93ad6a1caf">
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
        className="relative h-56 rounded-2xl overflow-hidden dsx-s-dd7e961eb3"
      >
        <div
          className="absolute inset-0 dsx-s-7201528232"
        />
        <div
          className="absolute inset-0 dsx-s-69c0e0adf3"
        />
        <div
          className="absolute rounded-full dsx-s-8afc5cf768"
        />
        <div
          className="absolute rounded-full dsx-s-7f1ee34768"
        />

        <div className="absolute inset-0 flex items-center justify-center gap-4 p-6">
          <GlassSpecimen label={showcaseMessage("components.design-system.foundations-glass.vulcan-91cbb945")} blur={blur} bgOpacity={opacity / 100} glassOpacity={glass / 100} radius="var(--radius-lg)" />
          <GlassSpecimen label={showcaseMessage("components.design-system.foundations-glass.pill-38ea5ba8")} blur={blur} bgOpacity={opacity / 100} glassOpacity={glass / 100} radius="9999px" />
          <div
            className="relative flex flex-col gap-2 p-4 overflow-hidden dsx-s-4c773b777c"
            style={{ "--dsx-border": toShowcaseCssValue(`1px solid rgba(255,255,255,${(glass / 100) * 2})`, false) } as any}
          >
            <div
              className="absolute inset-0 dsx-s-3ee2e21bef"
              style={{ "--dsx-backdrop-filter": toShowcaseCssValue(`blur(${blur}px)`, false), "--dsx-webkit-backdrop-filter": toShowcaseCssValue(`blur(${blur}px)`, false), "--dsx-background": toShowcaseCssValue(`rgba(0,0,0,${opacity / 100})`, false) } as any}
            />
            <div
              className="absolute inset-0 dsx-s-e184316eaf"
              style={{ "--dsx-background": toShowcaseCssValue(`radial-gradient(ellipse at 30% 20%, rgba(255,255,255,${(glass / 100) * 0.6}) 0%, rgba(0,0,0,0) 70%)`, false) } as any}
            />
            {[
              { icon: Flame, label: showcaseMessage("components.design-system.foundations-glass.idratazione-ca30c32c"), val: "68%" },
              { icon: Wheat, label: showcaseMessage("components.design-system.foundations-glass.farina-w-9be32fb5"), val: "300" },
              { icon: Timer, label: showcaseMessage("components.design-system.foundations-glass.fermento-96079945"), val: showcaseMessage("components.design-system.foundations-glass.24h-02779596") },
            ].map((item) => (
              <div key={item.label} className="relative flex items-center gap-2 dsx-s-1f9ab3be63">
                <item.icon size={14} className="dsx-s-8a9e6a537f" />
                <span className="dsx-s-b3b944b438">
                  {item.label}
                </span>
                <span className="dsx-s-84e9dbda7f">
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: showcaseMessage("components.design-system.foundations-glass.blur-900aa998"), value: blur, set: setBlur, min: 0, max: 60, unit: "px" },
          { label: showcaseMessage("components.design-system.foundations-glass.bg-opacity-54bfc748"), value: opacity, set: setOpacity, min: 0, max: 30, unit: "%" },
          { label: showcaseMessage("components.design-system.foundations-glass.glass-overlay-d6c80859"), value: glass, set: setGlass, min: 0, max: 20, unit: "%" },
        ].map((s) => {
          const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="dsx-s-2fd7b782ba">{s.label}</span>
                <span className="dsx-s-8947b681d6">
                  {s.value}{s.unit}
                </span>
              </div>
              <div className="relative w-full h-6 flex items-center">
                <div className="absolute w-full h-2 rounded-full dsx-s-cbebeffe46" />
                <div className="absolute h-2 rounded-full dsx-s-c2bf27541a" style={{ "--dsx-width": toShowcaseCssValue(`${pct}%`, false) } as any} />
                <input
                  aria-label={s.label}
                  type="range" min={s.min} max={s.max} value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="absolute w-full h-6 cursor-pointer dsx-s-0e37fcc660"
                />
                <div
                  className="absolute w-5 h-5 rounded-full pointer-events-none dsx-s-cfa8ab722b"
                  style={{ "--dsx-left": toShowcaseCssValue(`calc(${pct}% - 10px)`, false) } as any}
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
function GlassmorphismLiquidGlassSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations-glass.glassmorphism-liquid-glass-57569f1a")}
        description={showcaseMessage("components.design-system.foundations-glass.pattern-per-header-sticky-e-overlay-vulcan-29b425c9")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-glass.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-glass.il-glassmorphism-in-vulcan-crea-profondita-61afa2c5")}
        principi={[
          showcaseMessage("components.design-system.foundations-glass.blur-24px-saturate-1-6-come-standard-vulca-23f3f4f8"),
          showcaseMessage("components.design-system.foundations-glass.color-mix-in-srgb-var-container-page-88-tr-147cc6ce"),
          showcaseMessage("components.design-system.foundations-glass.border-sottile-con-var-border-muted-per-de-f4cb4687"),
          showcaseMessage("components.design-system.foundations-glass.evitare-mix-blend-mode-plus-lighter-troppo-695558a1"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-glass.specifiche-057caf2f")} />
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-glass.pattern-vulcan-header-sticky-7761b94a")}</h3>
        <div className="relative h-48 rounded-2xl overflow-hidden dsx-s-dd7e961eb3">
          <div className="absolute inset-0 dsx-s-ee7b477eef" />
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-px opacity-30">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="rounded dsx-s-61cd6cc75a"
                style={{ "--dsx-background": toShowcaseCssValue(i % 3 === 0 ? "var(--warm-terracotta)" : i % 3 === 1 ? "var(--warm-oak)" : "var(--warm-sage)", false), "--dsx-opacity": toShowcaseCssValue(0.3 + (i % 5) * 0.12, true) } as any}
              />
            ))}
          </div>
          <div
            className="absolute top-0 left-0 right-0 h-14 flex items-center px-5 dsx-s-0bb936ee2c"
          >
            <span className="dsx-s-9688f15e19">
              {showcaseMessage("components.design-system.foundations-glass.header-con-glassmorphism-d9acd0f3")}</span>
          </div>
          <div
            className="absolute bottom-3 left-3 right-3 p-3 rounded-xl dsx-s-02494e0305"
          >
            <code className="dsx-s-bdf7e04d9e"
            >
              {showcaseMessage("components.design-system.foundations-glass.background-color-mix-in-srgb-var-container-da6f6ed7")}
            </code>
          </div>
        </div>
      </div>

      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-glass.recipe-hero-card-glassmorphism-57aa6443")}</h3>
        <div className="relative h-56 rounded-2xl overflow-hidden dsx-s-dd7e961eb3">
          <div className="absolute inset-0 dsx-s-ee7b477eef" />
          <div
            className="absolute inset-x-4 top-4 bottom-4 p-5 rounded-2xl flex flex-col justify-between dsx-s-13f81a83cb"
          >
            <div>
              <span className="dsx-s-9cfb42e4af">{showcaseMessage("components.design-system.foundations-glass.procedimento-34df82fa")}</span>
              <h4 className="font-serif mt-1 dsx-s-1bfe13f151">{showcaseMessage("components.design-system.foundations-glass.napoletana-stg-fc9d3868")}</h4>
            </div>
            <code className="dsx-s-9c9e7eb6d0"
            >
              {showcaseMessage("components.design-system.foundations-glass.background-var-recipe-hero-card-bg-backdro-f9718c50")}
            </code>
          </div>
        </div>
      </div>

      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-glass.riferimento-ios-26-composizione-materiale-e8ae9a2a")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GLASS_LAYERS.map((layer) => (
            <div key={layer.name} className="surface-card p-4">
              <span className="dsx-s-9688f15e19">
                {layer.name}
              </span>
              <p className="type-body dsx-s-423a2af08b">
                {layer.desc}
              </p>
              <code className="dsx-s-93397dac94">
                {layer.css}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-glass.playground-interattivo-7ed61c72")}</h3>
        <div className="surface-card p-5">
          <span className="dsx-s-22944e37e2">
            {showcaseMessage("components.design-system.foundations-glass.trascina-i-cursori-per-esplorare-il-materi-300a43f9")}<code className="dsx-s-84aeb79e35">var(--radius-lg)</code> {showcaseMessage("components.design-system.foundations-glass.1rem-il-pill-e-riferimento-ios-e55315e4")}</span>
          <BlurPlayground />
        </div>
      </div>

      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-glass.adattamento-ios-26-vulcan-pizza-lab-3f348876")}</h3>
        <div className="surface-card overflow-hidden">
          <div className="px-4 py-3 dsx-s-ff83771d47">
            <span className="type-label dsx-s-a57c4bed75">
              {showcaseMessage("components.design-system.foundations-glass.mappatura-proprieta-4aace8ec")}</span>
          </div>
          <div className="flex flex-col">
            {VULCAN_ADAPTATION.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 px-4 py-3 items-start dsx-s-57dac8b284"
                style={{ "--dsx-border-bottom": toShowcaseCssValue(i < VULCAN_ADAPTATION.length - 1 ? "1px solid var(--outline-variant)" : "none", false) } as any}
              >
                <code className="dsx-s-e7daa36649">
                  {row.from}
                </code>
                <code className="dsx-s-91ec361c08">
                  {row.to}
                </code>
                <span className="dsx-s-53660225ba">
                  {row.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-glass.pattern-vulcan-dove-applicarlo-bc1d0926")}</h3>
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
                className="surface-card p-4 active:scale-98 transition-transform"
                whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                transition={showcaseTransition.preset_0e2957ab5e}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="dsx-s-b0e08465c2" />
                  <span className="dsx-s-9688f15e19">
                    {p.context}
                  </span>
                </div>
                <code className="dsx-s-8c0f4a8278">
                  {p.recipe}
                </code>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-glass.specifiche-glassmorphism-2796768c")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.foundations-glass.backdrop-d4f5e938"), val: showcaseMessage("components.design-system.foundations-glass.blur-24px-saturate-1-6-786f0891") },
            { prop: showcaseMessage("components.design-system.foundations-glass.background-64dd60fe"), val: showcaseMessage("components.design-system.foundations-glass.color-mix-bg-88-954586c8") },
            { prop: showcaseMessage("components.design-system.foundations-glass.border-5d10d3f4"), val: showcaseMessage("components.design-system.foundations-glass.1px-solid-var-border-muted-8edc4248") },
            { prop: showcaseMessage("components.design-system.foundations-glass.radius-e5aaeaac"), val: showcaseMessage("components.design-system.foundations-glass.var-radius-lg-1rem-16px-222bb1c0") },
            { prop: showcaseMessage("components.design-system.foundations-glass.ios-ref-blur-b2205e1e"), val: showcaseMessage("components.design-system.foundations-glass.40px-non-usato-in-vulcan-0630b77b") },
            { prop: showcaseMessage("components.design-system.foundations-glass.ios-blend-edeca742"), val: showcaseMessage("components.design-system.foundations-glass.plus-lighter-non-usato-22d2f51a") },
            { prop: showcaseMessage("components.design-system.foundations-glass.vulcan-blend-064b3168"), val: showcaseMessage("components.design-system.foundations-glass.color-mix-saturate-de763394") },
            { prop: showcaseMessage("components.design-system.foundations-glass.pill-shape-ee630094"), val: showcaseMessage("components.design-system.foundations-glass.9999px-solo-ios-ref-a8882483") },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-glass.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-glass.usare-color-mix-per-trasparenze-piu-preved-45ebf3c7"),
          showcaseMessage("components.design-system.foundations-glass.limitare-il-glass-a-2-3-elementi-per-scher-5bc03f74"),
          showcaseMessage("components.design-system.foundations-glass.testare-sempre-su-sfondi-complessi-gradien-15f8b28e"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-glass.mai-backdrop-filter-senza-fallback-opaco-p-4c850391"),
          showcaseMessage("components.design-system.foundations-glass.mai-glass-su-elementi-con-molto-testo-ridu-3a10bbf8"),
          showcaseMessage("components.design-system.foundations-glass.mai-impilare-piu-layer-glass-performance-c-4a039ff6"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-glass.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations-glass.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.foundations-glass.il-testo-su-glass-deve-mantenere-wcag-aa-u-01481ed1") },
        { label: showcaseMessage("components.design-system.foundations-glass.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.foundations-glass.nessun-impatto-il-glass-e-statico-non-anim-419e0b63") },
        { label: showcaseMessage("components.design-system.foundations-glass.performance-63c90455"), desc: showcaseMessage("components.design-system.foundations-glass.backdrop-filter-e-costoso-su-mobile-limita-c46bb6f4") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "glass", label: showcaseMessage("components.design-system.foundations-glass.glassmorphism-liquid-glass-57569f1a"), group: "f", Component: GlassmorphismLiquidGlassSection },
];
