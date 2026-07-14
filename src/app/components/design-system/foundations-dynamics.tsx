import { useState, useRef, useEffect } from "react";
import {
  SectionHeader,
  SubSectionLabel,
  Panoramica,
  LineeGuida,
  AccessibilitaInfo,
} from "./shared";
import type { SectionEntry } from "./shared";
import { motion } from "motion/react";
import {
  Flame,
  Timer,
  Wheat,
  MapPin,
  Sun,
  Moon,
  Heart,
  Settings,
  Search,
  Eye,
  Copy,
  HelpCircle,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Check,
  Home,
  Star,
} from "lucide-react";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══ 05: ELEVAZIONE ═══ */
const SHADOWS = [
  { name: showcaseMessage("components.design-system.foundations-dynamics.elevation-0-d8f685d6"), desc: showcaseMessage("components.design-system.foundations-dynamics.base-nessuna-ombra-5fde65ce"), value: "none" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.elevation-1-d1117bc9"), desc: showcaseMessage("components.design-system.foundations-dynamics.card-a-riposo-e6b1ac4b"), value: "var(--shadow-sm)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.elevation-2-ca8bdfeb"), desc: showcaseMessage("components.design-system.foundations-dynamics.card-in-hover-753e379a"), value: "var(--shadow-md)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.elevation-3-15636ddd"), desc: showcaseMessage("components.design-system.foundations-dynamics.modale-dialog-8603b24d"), value: "var(--shadow-lg)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.glow-6ae5a623"), desc: showcaseMessage("components.design-system.foundations-dynamics.focus-ring-primario-3757fc81"), value: "var(--shadow-glow)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.glow-lg-dd8f000a"), desc: showcaseMessage("components.design-system.foundations-dynamics.focus-ring-intenso-dd690037"), value: "var(--elevation-glow-lg)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.cta-9613c87e"), desc: showcaseMessage("components.design-system.foundations-dynamics.bottone-cta-c22f1e67"), value: "var(--shadow-cta)" },
];

function ElevationSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.elevazione-c616d71c")} description={showcaseMessage("components.design-system.foundations-dynamics.ombre-editoriali-morbide-light-mode-usa-rg-5eaf8c1d")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-dynamics.il-sistema-di-elevazione-usa-ombre-calde-p-e7d6d1a5")}
        principi={[
          showcaseMessage("components.design-system.foundations-dynamics.7-livelli-da-elevation-0-piatto-a-elevatio-2b8fcea2"),
          showcaseMessage("components.design-system.foundations-dynamics.nessun-box-shadow-di-default-ombre-solo-su-3d389388"),
          showcaseMessage("components.design-system.foundations-dynamics.glow-separato-per-focus-ring-accessibilita-5828aacf"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.specifiche-057caf2f")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SHADOWS.map((s) => (
          <motion.div
            key={s.name}
            className="p-5 rounded-2xl cursor-pointer active:scale-98 transition-transform dsx-s-a0f7b1fa43"
            style={{ "--dsx-box-shadow": toShowcaseCssValue(s.value === "none" ? "none" : s.value, false) } as any}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={showcaseTransition.preset_0e2957ab5e}
          >
            <div className="type-data dsx-s-cb0868942e">{s.name}</div>
            <div className="dsx-s-1d01913364">{s.desc}</div>
          </motion.div>
        ))}
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-dynamics.usare-elevation-1-per-card-a-riposo-elevat-7423acb4"),
          showcaseMessage("components.design-system.foundations-dynamics.usare-glow-per-focus-ring-su-elementi-inte-328e24ec"),
          showcaseMessage("components.design-system.foundations-dynamics.mantenere-coerenza-stesso-livello-per-elem-6ba30485"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-ombre-su-elementi-inline-o-testo-a5f35a09"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-box-shadow-hardcoded-usare-i-token-601f4c78"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-elevation-3-su-piu-di-un-elemento-cont-0f6adae0"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations-dynamics.focus-glow-5df9749a"), desc: showcaseMessage("components.design-system.foundations-dynamics.il-glow-primario-garantisce-visibilita-del-87a5c804") },
        { label: showcaseMessage("components.design-system.foundations-dynamics.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.foundations-dynamics.le-ombre-non-devono-essere-l-unico-indicat-55333e66") },
      ]} />
    </div>
  );
}

/* ═══ 06: STATE LAYERS ═══ */
const STATE_LAYERS = [
  { name: showcaseMessage("components.design-system.foundations-dynamics.enabled-df174a3f"), opacity: "0%", color: "rgba(0,0,0,0)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.hover-270d13d8"), opacity: "8%", color: "var(--primary)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.focus-press-e01b4733"), opacity: "12%", color: "var(--primary)" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.dragged-e338317c"), opacity: "16%", color: "var(--primary)" },
];

function StateLayersSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.state-layers-b785717a")} description={showcaseMessage("components.design-system.foundations-dynamics.overlay-tonali-m3-per-feedback-interazione-fc7de615")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-dynamics.i-state-layers-comunicano-visivamente-lo-s-a29b7730")}
        principi={[
          showcaseMessage("components.design-system.foundations-dynamics.4-stati-enabled-0-hover-8-focus-press-12-d-1c9ad204"),
          showcaseMessage("components.design-system.foundations-dynamics.il-colore-dell-overlay-e-sempre-il-colore--75557859"),
          showcaseMessage("components.design-system.foundations-dynamics.gli-stati-si-compongono-un-chip-attivo-hov-0a2a9e49"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.specifiche-057caf2f")} />
      <div className="grid grid-cols-4 gap-3">
        {STATE_LAYERS.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center dsx-s-d1283e5581">
              <div className="absolute inset-0 dsx-s-61cd6cc75a" style={{ "--dsx-background": toShowcaseCssValue(s.color, false), "--dsx-opacity": toShowcaseCssValue(parseFloat(s.opacity) / 100, true) } as any} />
              <Star size={24} className="dsx-s-ab7f0a3e92" />
            </div>
            <div className="text-center">
              <div className="type-data dsx-s-0a7247be17">{s.name}</div>
              <div className="type-code dsx-s-63782726c0">{s.opacity}</div>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-dynamics.usare-color-mix-per-sovrapporre-lo-state-l-61add500"),
          showcaseMessage("components.design-system.foundations-dynamics.mantenere-le-percentuali-m3-8-hover-12-pre-a4c1c4ad"),
          showcaseMessage("components.design-system.foundations-dynamics.testare-gli-stati-in-entrambi-i-temi-light-05e06098"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-cambiare-il-colore-base-dell-elemento--dbcc4d2f"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-usare-opacity-css-sull-intero-elemento-1ad97001"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-omettere-lo-stato-hover-su-elementi-in-780e4091"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations-dynamics.visibilita-a4183769"), desc: showcaseMessage("components.design-system.foundations-dynamics.lo-state-layer-deve-essere-percepibile-anc-f3f70132") },
        { label: showcaseMessage("components.design-system.foundations-dynamics.focus-fe7f55b8"), desc: showcaseMessage("components.design-system.foundations-dynamics.lo-stato-focus-12-si-somma-al-focus-ring-p-74792a5f") },
      ]} />
    </div>
  );
}

/* ═══ 07: MOTION SYSTEM ═══ */
const SPRING_GROUPS = [
  {
    category: showcaseMessage("components.design-system.foundations-dynamics.micro-interactions-chip-toggle-tooltip-ba2e05a4"),
    items: [
      { name: showcaseMessage("components.design-system.foundations-dynamics.snappy-a0b1117d"), stiffness: 500, damping: 25, mass: 0.8, use: "Chip select, tooltips" },
      { name: showcaseMessage("components.design-system.foundations-dynamics.responsive-78674579"), stiffness: 400, damping: 25, mass: 1.0, use: "Buttons, focus ring" },
    ],
  },
  {
    category: showcaseMessage("components.design-system.foundations-dynamics.layout-shifts-card-accordion-panel-505555ce"),
    items: [
      { name: showcaseMessage("components.design-system.foundations-dynamics.smooth-254f7697"), stiffness: 300, damping: 30, mass: 1.0, use: "Accordion, height" },
      { name: showcaseMessage("components.design-system.foundations-dynamics.gentle-471908a2"), stiffness: 200, damping: 22, mass: 1.2, use: "Page transition, hero" },
    ],
  },
  {
    category: showcaseMessage("components.design-system.foundations-dynamics.decorative-blob-glow-background-6be57597"),
    items: [
      { name: showcaseMessage("components.design-system.foundations-dynamics.organic-2ee79daa"), stiffness: 100, damping: 15, mass: 1.5, use: "DoughBlob morph, FireGlow" },
      { name: showcaseMessage("components.design-system.foundations-dynamics.bounce-b85b9b0d"), stiffness: 600, damping: 12, mass: 0.6, use: "Score ring enter, check icon" },
    ],
  },
];

const MOTION_PATTERNS = [
  { pattern: "whileTap", code: "scale: 0.95", desc: showcaseMessage("components.design-system.foundations-dynamics.feedback-tattile-bottoni-chip-1182e78f") },
  { pattern: "whileInView", code: "once: true, amount: 0.5", desc: showcaseMessage("components.design-system.foundations-dynamics.entrance-animation-sezioni-a8a5574f") },
  { pattern: "AnimatePresence", code: "mode='wait'", desc: showcaseMessage("components.design-system.foundations-dynamics.transizioni-pagina-con-exit-c4254b64") },
  { pattern: "layoutId", code: "'tabIndicator'", desc: showcaseMessage("components.design-system.foundations-dynamics.shared-layout-per-tab-nav-pill-bcd26d2a") },
];

function MotionSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.motion-system-0dff1745")} description={showcaseMessage("components.design-system.foundations-dynamics.spring-physics-curve-emphasized-le-animazi-e208823e")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-dynamics.il-motion-system-di-vulcan-e-basato-su-fis-3d911f7e")}
        principi={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-duration-ease-sempre-spring-con-stiffn-72654051"),
          showcaseMessage("components.design-system.foundations-dynamics.micro-interactions-chip-toggle-spring-snap-fd79173e"),
          showcaseMessage("components.design-system.foundations-dynamics.layout-shifts-accordion-panel-spring-smoot-6760141f"),
          showcaseMessage("components.design-system.foundations-dynamics.decorative-blob-glow-spring-organic-100-15-7d83b4d4"),
        ]}
      />
      {SPRING_GROUPS.map((group) => (
        <div key={group.category}>
          <h3 className="type-subheading dsx-s-1c0bccd446">{group.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map((s) => (
              <div key={s.name} className="surface-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="type-data dsx-s-0a7247be17">{s.name}</span>
                  <motion.div
                    className="w-5 h-5 rounded-full dsx-s-0a278ece1c"
                    animate={{ x: 20 }}
                    transition={showcaseTransition.dynamic_bd694a549f(s.stiffness, s.damping, s.mass)}
                  />
                </div>
                <div className="flex gap-3 type-data dsx-s-9f96c1f09f">
                  <span>{showcaseMessage("components.design-system.foundations-dynamics.stiffness-71b6cc48")}{s.stiffness}</span>
                  <span>{showcaseMessage("components.design-system.foundations-dynamics.damping-6c984e1e")}{s.damping}</span>
                  <span>{showcaseMessage("components.design-system.foundations-dynamics.mass-617d85d5")}{s.mass}</span>
                </div>
                <p className="mt-1 dsx-s-414b01c9cf">{s.use}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Key patterns */}
      <div className="surface-card p-4">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations-dynamics.pattern-chiave-2aae51cf")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {MOTION_PATTERNS.map((p) => (
            <div key={p.pattern} className="p-3 rounded-lg dsx-s-e4f209c55b">
              <code className="dsx-s-37ba466586">{p.pattern}</code>
              <span className="type-code dsx-s-9b88d5c354">{p.code}</span>
              <p className="dsx-s-ff544bce2a">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-dynamics.usare-motion-react-per-tutte-le-entrance-a-a49be779"),
          showcaseMessage("components.design-system.foundations-dynamics.whiletap-scale-0-95-su-tutti-gli-elementi--a778bafc"),
          showcaseMessage("components.design-system.foundations-dynamics.whileinview-con-once-true-per-evitare-ri-a-130536a6"),
          showcaseMessage("components.design-system.foundations-dynamics.animatepresence-mode-wait-per-transizioni--bc4f8d46"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-css-transitions-per-entrance-animation-cece8563"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-duration-ease-nelle-transition-solo-sp-5e16fdbf"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-animare-colori-direttamente-su-motion--8396f6f7"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-importare-da-framer-motion-sempre-moti-ea872929"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations-dynamics.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.foundations-dynamics.prefers-reduced-motion-le-spring-diventano-e9f66acc") },
        { label: showcaseMessage("components.design-system.foundations-dynamics.vestibolare-0d9f9acf"), desc: showcaseMessage("components.design-system.foundations-dynamics.nessuna-animazione-con-scroll-parallax-o-r-acc86095") },
      ]} />
    </div>
  );
}

/* ═══ 08: ICONOGRAFIA ═══ */
const ICON_SETS = [
  { icons: [Flame, Timer, Wheat, MapPin, Sun, Moon, Heart], label: showcaseMessage("components.design-system.foundations-dynamics.food-context-33529184") },
  { icons: [Settings, Search, Eye, Copy, HelpCircle, Lightbulb, Zap], label: showcaseMessage("components.design-system.foundations-dynamics.ui-actions-6b994238") },
  { icons: [ChevronDown, ChevronRight, Plus, X, Check, Home, Star], label: showcaseMessage("components.design-system.foundations-dynamics.navigation-cf03cf2e") },
];

const ICON_SIZES = [
  { size: 16, name: showcaseMessage("components.design-system.foundations-dynamics.small-c74fd971"), use: "Badge, inline" },
  { size: 20, name: showcaseMessage("components.design-system.foundations-dynamics.medium-d404968e"), use: "Bottoni, chip" },
  { size: 24, name: showcaseMessage("components.design-system.foundations-dynamics.large-738fd1d2"), use: "Header, nav" },
];

function IconographySection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.iconografia-641eb812")} description={showcaseMessage("components.design-system.foundations-dynamics.lucide-react-stroke-2px-4-taglie-standard--a02e04e7")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-dynamics.vulcan-usa-lucide-react-come-libreria-icon-6bf54190")}
        principi={[
          showcaseMessage("components.design-system.foundations-dynamics.3-taglie-standard-16px-small-20px-medium-2-a3bf3bb6"),
          showcaseMessage("components.design-system.foundations-dynamics.stroke-2px-costante-mai-fill-tranne-per-st-c1590794"),
          showcaseMessage("components.design-system.foundations-dynamics.colore-dinamico-via-custom-property-bridge-39cca769"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.specifiche-057caf2f")} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ICON_SIZES.map((s) => (
          <div key={s.name} className="surface-card p-4 flex items-center gap-3">
            <Flame size={s.size} className="dsx-s-9426b3ef0f" />
            <div>
              <div className="type-data dsx-s-d55dfaa8b9">{s.name} · {s.size}px</div>
              <div className="dsx-s-6849179898">{s.use}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="surface-card p-5">
        {ICON_SETS.map((set) => (
          <div key={set.label} className="mb-4 last:mb-0">
            <span className="type-label dsx-s-5e33726d63">{set.label}</span>
            <div className="flex flex-wrap gap-3">
              {set.icons.map((Icon, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform dsx-s-e4f209c55b"
                  whileHover={{ scale: 1.15 }}
                  transition={showcaseTransition.preset_e8d752eab0}
                >
                  <Icon size={18} className="dsx-s-86a4206cb1" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-dynamics.usare-aria-label-su-bottoni-con-sole-icone-209798e4"),
          showcaseMessage("components.design-system.foundations-dynamics.taglie-coerenti-16px-per-inline-20px-per-u-87b811a5"),
          showcaseMessage("components.design-system.foundations-dynamics.colore-via-css-custom-property-per-coerenz-a83cdd02"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-icone-decorative-senza-significato-usa-1bfc353d"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-mischiare-taglie-nella-stessa-riga-dbe5e713"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-fill-di-default-solo-stroke-based-9ff2e451"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.foundations-dynamics.aria-label-obbligatorio-su-bottoni-icona-a-ea635a10") },
        { label: showcaseMessage("components.design-system.foundations-dynamics.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.foundations-dynamics.minimo-3-1-per-icone-informative-wcag-aa-p-9f0d5891") },
      ]} />
    </div>
  );
}

/* ═══ 09: GRADIENTI + TIME-OF-DAY ═══ */
const GRADIENTS = [
  { name: showcaseMessage("components.design-system.foundations-dynamics.grad-ember-32bcf277"), desc: showcaseMessage("components.design-system.foundations-dynamics.logo-brand-composite-score-banner-e9eb9f9e"), cssVar: "--grad-ember" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.grad-sage-920a987f"), desc: showcaseMessage("components.design-system.foundations-dynamics.bottone-cta-principale-c89835d7"), cssVar: "--grad-sage" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.grad-warm-3b8be6cd"), desc: showcaseMessage("components.design-system.foundations-dynamics.background-sezioni-surface-overlay-3d079486"), cssVar: "--grad-warm" },
];

const TIME_SLOTS = [
  { name: showcaseMessage("components.design-system.foundations-dynamics.tonight-4ce0cba1"), label: showcaseMessage("components.design-system.foundations-dynamics.stasera-4581c567"), cssVar: "--time-tonight", softVar: "--time-tonight-soft" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.lunch-09453054"), label: showcaseMessage("components.design-system.foundations-dynamics.pranzo-6045fdca"), cssVar: "--time-lunch", softVar: "--time-lunch-soft" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.dinner-78cbc77f"), label: showcaseMessage("components.design-system.foundations-dynamics.cena-88702fbe"), cssVar: "--time-dinner", softVar: "--time-dinner-soft" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.dayafter-54a1407d"), label: showcaseMessage("components.design-system.foundations-dynamics.domani-14595e7f"), cssVar: "--time-dayafter", softVar: "--time-dayafter-soft" },
  { name: showcaseMessage("components.design-system.foundations-dynamics.weekend-505eabdf"), label: showcaseMessage("components.design-system.foundations-dynamics.weekend-0a4171b1"), cssVar: "--time-weekend", softVar: "--time-weekend-soft" },
];

function GradientsSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.gradienti-99da547c")} description={showcaseMessage("components.design-system.foundations-dynamics.3-gradienti-semantici-ember-per-brand-sage-cf7a1a7c")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-dynamics.tre-gradienti-semantici-coprono-tutti-i-ca-554f611d")}
        principi={[
          showcaseMessage("components.design-system.foundations-dynamics.grad-ember-terracotta-arancio-ambra-identi-9205a452"),
          showcaseMessage("components.design-system.foundations-dynamics.grad-sage-salvia-salvia-chiaro-bottoni-cta-dc8aedde"),
          showcaseMessage("components.design-system.foundations-dynamics.grad-warm-parchment-tonal-sfondi-sezione-s-eddc095f"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.specifiche-057caf2f")} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {GRADIENTS.map((g) => (
          <div key={g.name} className="overflow-hidden rounded-2xl dsx-s-dd7e961eb3">
            <div className="h-20 dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(`var(${g.cssVar})`, false) } as any} />
            <div className="p-3 dsx-s-e4f209c55b">
              <code className="dsx-s-37ba466586">{g.name}</code>
              <p className="dsx-s-8e2b1a3642">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-dynamics.usare-i-token-css-var-grad-ember-per-refer-e94f8527"),
          showcaseMessage("components.design-system.foundations-dynamics.sovrapporre-gradienti-con-opacity-per-effe-d57e6e17"),
          showcaseMessage("components.design-system.foundations-dynamics.testare-in-entrambi-i-temi-i-gradienti-si--54b39b0f"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-creare-gradienti-custom-con-hex-hardco-ccd3117a"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-usare-gradienti-su-testo-leggibilita-s-5acb794c"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-grad-ember-per-cta-usare-grad-sage-9e2c914d"),
        ]}
      />
    </div>
  );
}

function TimePaletteSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.time-of-day-palette-b1fee0e7")} description={showcaseMessage("components.design-system.foundations-dynamics.5-colori-unici-per-time-slot-con-variante--2ed99d67")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-dynamics.ogni-time-slot-stasera-pranzo-cena-domani--430e926c")}
        principi={[
          showcaseMessage("components.design-system.foundations-dynamics.5-slot-tonight-caldo-lunch-solare-dinner-i-a4de63e6"),
          showcaseMessage("components.design-system.foundations-dynamics.ogni-colore-ha-una-variante-soft-per-backg-9518edc0"),
          showcaseMessage("components.design-system.foundations-dynamics.i-colori-sono-pensati-per-essere-distingui-16820e10"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.specifiche-057caf2f")} />
      <div className="grid grid-cols-5 gap-2">
        {TIME_SLOTS.map((t) => (
          <div key={t.name} className="flex flex-col gap-1">
            <div className="h-14 rounded-xl dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(`var(${t.cssVar})`, false) } as any} />
            <div className="h-8 rounded-lg dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(`var(${t.softVar})`, false) } as any} />
            <div className="text-center mt-1">
              <div className="dsx-s-7429dbc22f">{t.label}</div>
              <div className="type-data dsx-s-9f96c1f09f">{t.name}</div>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-dynamics.usare-il-colore-soft-come-background-dei-c-951bc08c"),
          showcaseMessage("components.design-system.foundations-dynamics.usare-il-colore-pieno-come-accento-bordo-d-6908bc4e"),
          showcaseMessage("components.design-system.foundations-dynamics.accompagnare-sempre-il-colore-con-un-etich-e2803291"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-dynamics.mai-usare-i-colori-time-of-day-fuori-dal-c-f092c03a"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-veicolare-informazioni-solo-tramite-il-adb2966f"),
          showcaseMessage("components.design-system.foundations-dynamics.mai-mescolare-colori-time-of-day-con-i-ruo-af32e9bd"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations-dynamics.colore-testo-30eff303"), desc: showcaseMessage("components.design-system.foundations-dynamics.il-colore-time-of-day-e-sempre-accompagnat-205c0d8b") },
        { label: showcaseMessage("components.design-system.foundations-dynamics.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.foundations-dynamics.i-colori-soft-hanno-contrasto-sufficiente--dd75023a") },
      ]} />
    </div>
  );
}

/* ═══ 12: ACCESSIBILITÀ ═══ */
function AccessibilitySection() {
  const [focusSource, setFocusSource] = useState<Record<string, "keyboard" | "click" | null>>({});

  const CONTRAST_PAIRS = [
    { fg: "var(--text-default)", bg: "var(--container-page)", label: showcaseMessage("components.design-system.foundations-dynamics.text-default-page-45185f62"), level: "AAA" },
    { fg: "var(--primary)", bg: "var(--container-page)", label: showcaseMessage("components.design-system.foundations-dynamics.primary-page-c950ef3e"), level: "AA" },
    { fg: "var(--cta-foreground)", bg: "var(--cta)", label: showcaseMessage("components.design-system.foundations-dynamics.cta-foreground-cta-6e009270"), level: "AAA" },
    { fg: "var(--primary-foreground)", bg: "var(--primary)", label: showcaseMessage("components.design-system.foundations-dynamics.primary-fg-primary-39d70341"), level: "AAA" },
    { fg: "var(--muted-foreground)", bg: "var(--container-page)", label: showcaseMessage("components.design-system.foundations-dynamics.muted-fg-page-e874c114"), level: "AA" },
  ];

  const FOCUS_SPECIMENS = [
    { id: "filled", label: showcaseMessage("components.design-system.foundations-dynamics.filled-button-93140755"), variant: "filled" as const },
    { id: "outlined", label: showcaseMessage("components.design-system.foundations-dynamics.outlined-button-f63d1468"), variant: "outlined" as const },
    { id: "chip", label: showcaseMessage("components.design-system.foundations-dynamics.chip-f8fd9bc3"), variant: "chip" as const },
    { id: "input", label: showcaseMessage("components.design-system.foundations-dynamics.input-field-346b96e1"), variant: "input" as const },
  ];

  const lastInteractionRef = useRef<"keyboard" | "mouse">("mouse");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Tab") lastInteractionRef.current = "keyboard"; };
    const onMouse = () => { lastInteractionRef.current = "mouse"; };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onMouse);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onMouse); };
  }, []);

  const handleFocus = (id: string) => {
    setFocusSource((prev) => ({ ...prev, [id]: lastInteractionRef.current === "keyboard" ? "keyboard" : "click" }));
  };
  const handleBlur = (id: string) => {
    setFocusSource((prev) => ({ ...prev, [id]: null }));
  };

  const focusBadge = (id: string) => {
    const src = focusSource[id];
    if (!src) return null;
    const isKb = src === "keyboard";
    return (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        style={{ "--dsx-background": toShowcaseCssValue(isKb
                                ? "color-mix(in srgb, var(--cta) 15%, transparent)"
                                : "color-mix(in srgb, var(--tertiary) 15%, transparent)", false), "--dsx-color": toShowcaseCssValue(isKb ? "var(--cta)" : "var(--tertiary)", false) } as any} className="dsx-s-67aebc901c"
      >
        {isKb ? showcaseMessage("components.design-system.foundations-dynamics.focus-visible-cf86be26") : showcaseMessage("components.design-system.foundations-dynamics.focus-click-bc8fbe2d")}
      </motion.span>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6")} description={showcaseMessage("components.design-system.foundations-dynamics.focus-ring-3px-primary-con-offset-2px-visi-78f7af2f")} />

      {/* Focus ring demonstration */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations-dynamics.focus-ring-naviga-con-tab-o-clicca-e3496605")}</span>
        <p className="dsx-s-b8f661b746">
          {showcaseMessage("components.design-system.foundations-dynamics.premi-a90615b5")}<kbd className="dsx-s-9f7d95daa6">Tab</kbd> {showcaseMessage("components.design-system.foundations-dynamics.per-navigare-il-badge-verde-indica-focus-r-07304921")}</p>
        <div className="mt-4 flex flex-wrap gap-6">
          {FOCUS_SPECIMENS.map((spec) => {
            const previewClass = focusSource[spec.id] ? " ds-showcase__focus-preview" : "";

            if (spec.variant === "filled") {
              return (
                <div key={spec.id} className="flex flex-col items-center gap-1.5 dsx-s-2a9495ecbb">
                  {focusBadge(spec.id)}
                  <motion.button
                    onFocus={() => handleFocus(spec.id)}
                    onBlur={() => handleBlur(spec.id)}
                    className={[`active:scale-95 transition-transform${previewClass}`, "dsx-s-126723057c"].filter(Boolean).join(" ")}
                  >
                    {spec.label}
                  </motion.button>
                </div>
              );
            }
            if (spec.variant === "outlined") {
              return (
                <div key={spec.id} className="flex flex-col items-center gap-1.5 dsx-s-2a9495ecbb">
                  {focusBadge(spec.id)}
                  <motion.button
                    onFocus={() => handleFocus(spec.id)}
                    onBlur={() => handleBlur(spec.id)}
                    className={[`active:scale-95 transition-transform${previewClass}`, "dsx-s-340cdb6379"].filter(Boolean).join(" ")}
                  >
                    {spec.label}
                  </motion.button>
                </div>
              );
            }
            if (spec.variant === "chip") {
              return (
                <div key={spec.id} className="flex flex-col items-center gap-1.5 dsx-s-2a9495ecbb">
                  {focusBadge(spec.id)}
                  <motion.button
                    onFocus={() => handleFocus(spec.id)}
                    onBlur={() => handleBlur(spec.id)}
                    className={[`active:scale-95 transition-transform${previewClass}`, "dsx-s-c8694f1b5d"].filter(Boolean).join(" ")}
                  >
                    {spec.label}
                  </motion.button>
                </div>
              );
            }
            return (
              <div key={spec.id} className="flex flex-col items-center gap-1.5 dsx-s-2a9495ecbb">
                {focusBadge(spec.id)}
                <input
                  type="text"
                  placeholder={showcaseMessage("components.design-system.foundations-dynamics.input-text-81654378")}
                  onFocus={() => handleFocus(spec.id)}
                  onBlur={() => handleBlur(spec.id)}
                  readOnly
                  className={[previewClass.trim() || undefined, "dsx-s-11f93db7a7"].filter(Boolean).join(" ")}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-col gap-1.5">
          {[
            { prop: showcaseMessage("components.design-system.foundations-dynamics.outline-e57362d5"), val: showcaseMessage("components.design-system.foundations-dynamics.3px-solid-var-primary-4fceff48") },
            { prop: showcaseMessage("components.design-system.foundations-dynamics.outline-offset-c5c64aad"), val: "2px" },
            { prop: showcaseMessage("components.design-system.foundations-dynamics.trigger-63d62d4a"), val: showcaseMessage("components.design-system.foundations-dynamics.focus-visible-solo-tastiera-badge-verde-48afb8d4") },
            { prop: showcaseMessage("components.design-system.foundations-dynamics.click-preview-8c71acd4"), val: showcaseMessage("components.design-system.foundations-dynamics.focus-via-mouse-badge-ambra-anteprima-visi-6e31311f") },
            { prop: showcaseMessage("components.design-system.foundations-dynamics.fallback-5d288ad2"), val: showcaseMessage("components.design-system.foundations-dynamics.focus-per-browser-senza-focus-visible-8b24cc51") },
          ].map((a) => (
            <div key={a.prop} className="flex items-baseline gap-2">
              <span className="type-data dsx-s-39ea38e469">{a.prop}</span>
              <span className="dsx-s-6849179898">{a.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contrast pairs */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations-dynamics.contrasto-wcag-coppie-principali-3a7f0e93")}</span>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTRAST_PAIRS.map((pair) => (
            <div key={pair.label} className="flex items-center gap-3 p-3 rounded-xl dsx-s-e4f209c55b">
              <div className="flex items-center justify-center rounded-lg dsx-s-dc56a7a171" style={{ "--dsx-background": toShowcaseCssValue(pair.bg, false) } as any}>
                <span style={{ "--dsx-color": toShowcaseCssValue(pair.fg, false) } as any} className="dsx-s-758301c37f">{showcaseMessage("components.design-system.foundations-dynamics.aa-2c419ecc")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="dsx-s-9f565a378e">{pair.label}</span>
              </div>
              <span style={{ "--dsx-background": toShowcaseCssValue(pair.level === "AAA"
                                                      ? "color-mix(in srgb, var(--cta) 15%, transparent)"
                                                      : "color-mix(in srgb, var(--tertiary) 15%, transparent)", false), "--dsx-color": toShowcaseCssValue(pair.level === "AAA" ? "var(--cta)" : "var(--tertiary)", false) } as any} className="dsx-s-da50b6f8bb">
                {pair.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reduced motion */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations-dynamics.prefers-reduced-motion-6860b6cd")}</span>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { component: "FireGlow", behavior: "Static wash (nessuna animazione fiamma)", status: "ok" },
            { component: "DoughBlob", behavior: "Shape statica con borderRadius fisso, nessun morph/glow/satellite", status: "ok" },
            { component: "ScrollSection", behavior: "Opacity sempre 1, nessun dimming", status: "ok" },
            { component: "StepHeader", behavior: "Testo visibile senza whileInView", status: "ok" },
            { component: "Motion (globale)", behavior: "Spring transitions diventano instant", status: "ok" },
          ].map((item) => (
            <div key={item.component} className="flex items-center gap-3 p-2.5 rounded-lg dsx-s-e4f209c55b">
              <span style={{ "--dsx-background": toShowcaseCssValue(item.status === "ok"
                                                      ? "color-mix(in srgb, var(--cta) 15%, transparent)"
                                                      : "color-mix(in srgb, var(--tertiary) 15%, transparent)", false), "--dsx-color": toShowcaseCssValue(item.status === "ok" ? "var(--cta)" : "var(--tertiary)", false) } as any} className="dsx-s-f1fb6414c4">
                {item.status === "ok" ? "OK" : "WIP"}
              </span>
              <span className="type-code dsx-s-b51806e640">{item.component}</span>
              <span className="dsx-s-11e231f7cb">{item.behavior}</span>
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
  { id: "elevation", label: showcaseMessage("components.design-system.foundations-dynamics.elevazione-c616d71c"), group: "f", Component: ElevationSection },
  { id: "states", label: showcaseMessage("components.design-system.foundations-dynamics.state-layers-b785717a"), group: "f", Component: StateLayersSection },
  { id: "motion", label: showcaseMessage("components.design-system.foundations-dynamics.motion-system-0dff1745"), group: "f", Component: MotionSection },
  { id: "icons", label: showcaseMessage("components.design-system.foundations-dynamics.iconografia-641eb812"), group: "f", Component: IconographySection },
  { id: "gradients", label: showcaseMessage("components.design-system.foundations-dynamics.gradienti-99da547c"), group: "f", Component: GradientsSection },
  { id: "time-palette", label: showcaseMessage("components.design-system.foundations-dynamics.time-of-day-palette-b1fee0e7"), group: "f", Component: TimePaletteSection },
  { id: "a11y", label: showcaseMessage("components.design-system.foundations-dynamics.accessibilita-e59811a6"), group: "f", Component: AccessibilitySection },
];
