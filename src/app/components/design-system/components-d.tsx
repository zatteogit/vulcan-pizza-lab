import { useState } from "react";
import { motion } from "motion/react";
import {
  Droplets,
  Wheat,
  Clock,
  Thermometer,
  Lightbulb,
  Hand,
  ChefHat,
  Scissors,
  Expand,
  Flame,
  Check,
  Copy,
} from "lucide-react";
import {
  SectionHeader,
  AnatomyRow,
  SubSectionLabel,
  Panoramica,
  LineeGuida,
  AccessibilitaInfo,
} from "./shared";
import type { SectionEntry } from "./shared";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══ C15: RECIPE CONFIGURATOR ═══ */

const DEMO_SLIDERS = [
  {
    id: "hydration",
    label: showcaseMessage("components.design-system.components-d.idratazione-ca30c32c"),
    icon: Droplets,
    unit: "%",
    min: 45, max: 100, step: 1, defaultValue: 65,
    gradient: "var(--grad-slider-hydration)",
    tip: showcaseMessage("components.design-system.components-d.percentuale-di-acqua-rispetto-alla-farina--e28fd058"),
  },
  {
    id: "flourW",
    label: showcaseMessage("components.design-system.components-d.forza-farina-w-96325fc3"),
    icon: Wheat,
    unit: "",
    min: 150, max: 420, step: 10, defaultValue: 280,
    gradient: "var(--grad-slider-flour)",
    tip: showcaseMessage("components.design-system.components-d.indice-di-forza-alveografico-w-alto-piu-gl-b7b57373"),
  },
  {
    id: "fermentation",
    label: showcaseMessage("components.design-system.components-d.fermentazione-e42ae57b"),
    icon: Clock,
    unit: showcaseMessage("components.design-system.components-d.h-27d5482e"),
    min: 2, max: 72, step: 1, defaultValue: 24,
    gradient: "var(--grad-slider-ferment)",
    tip: showcaseMessage("components.design-system.components-d.durata-totale-della-lievitazione-piu-lunga-92603ab5"),
  },
  {
    id: "temperature",
    label: showcaseMessage("components.design-system.components-d.temperatura-df12789a"),
    icon: Thermometer,
    unit: "°C",
    min: 2, max: 30, step: 1, defaultValue: 4,
    gradient: "var(--grad-slider-temp)",
    tip: showcaseMessage("components.design-system.components-d.temperatura-di-fermentazione-frigo-2-6-c-p-6328ed79"),
  },
];

function RecipeConfiguratorSpec() {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    DEMO_SLIDERS.forEach((s) => { init[s.id] = s.defaultValue; });
    return init;
  });
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-d.recipeconfigurator-abcbcfdd")} description={showcaseMessage("components.design-system.components-d.pannello-fine-tuning-con-slider-a-gradient-9e3060a6")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-d.il-recipeconfigurator-permette-il-fine-tun-17e758ed")}
        principi={[
          showcaseMessage("components.design-system.components-d.gradiente-semantico-colori-che-comunicano--9881b711"),
          showcaseMessage("components.design-system.components-d.infotip-contestuali-spiegazione-di-ogni-pa-3a9c09e3"),
          showcaseMessage("components.design-system.components-d.range-dinamico-limiti-che-si-adattano-allo-96ca8a22"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.specifiche-057caf2f")} />
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-d.slider-fine-tuning-demo-interattiva-1dae4e56")}</span>

        <div className="mt-5 flex flex-col gap-5">
          {DEMO_SLIDERS.map((slider) => {
            const Icon = slider.icon;
            const val = values[slider.id];
            const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
            const isTipOpen = expandedTip === slider.id;

            return (
              <div key={slider.id}>
                {/* Label row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="dsx-s-b0e08465c2" />
                    <span className="type-code dsx-s-24d7245ee0">{slider.label}</span>
                    <motion.button
                      onClick={() => setExpandedTip(isTipOpen ? null : slider.id)}
                      className="flex items-center justify-center w-5 h-5 rounded-full active:scale-95 transition-transform dsx-s-e62f59d27e ds-showcase__compact-target"
                      style={{ "--dsx-background": toShowcaseCssValue(isTipOpen ? "var(--primary)" : "color-mix(in srgb, var(--primary) 10%, transparent)", false), "--dsx-color": toShowcaseCssValue(isTipOpen ? "var(--primary-foreground)" : "var(--primary)", false) } as any}
                      aria-label={showcaseMessage("components.design-system.components-d.info-4b631f69")}
                    >
                      <Lightbulb size={10} />
                    </motion.button>
                  </div>
                  <span className="type-data-lg dsx-s-9f15ac2970">
                    {val}{slider.unit}
                  </span>
                </div>

                {/* Tip */}
                {isTipOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 p-2.5 rounded-lg dsx-s-db81fe0192"
                  >
                    <span className="dsx-s-37161a8aea">{slider.tip}</span>
                  </motion.div>
                )}

                {/* Slider track */}
                <div className="relative dsx-s-1ef1d2ac3e">
                  <div
                    className="absolute top-1/2 left-0 right-0 h-2 rounded-full dsx-s-e286542006"
                    style={{ "--dsx-background": toShowcaseCssValue(slider.gradient, false) } as any}
                  />
                  <div
                    className="absolute top-1/2 left-0 h-2 rounded-full dsx-s-b8e8759055"
                    style={{ "--dsx-width": toShowcaseCssValue(`${pct}%`, false), "--dsx-background": toShowcaseCssValue(slider.gradient, false) } as any}
                  />
                  <input
                    type="range"
                    aria-label={slider.label}
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={val}
                    onChange={(e) => setValues((prev) => ({ ...prev, [slider.id]: Number(e.target.value) }))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer dsx-s-1ef1d2ac3e"
                  />
                  {/* Thumb indicator */}
                  <div
                    className="absolute top-1/2 rounded-full dsx-s-111f7c59a0"
                    style={{ "--dsx-left": toShowcaseCssValue(`${pct}%`, false) } as any}
                  />
                </div>

                {/* Range labels */}
                <div className="flex justify-between mt-1 type-code dsx-s-63782726c0">
                  <span>{slider.min}{slider.unit}</span>
                  <span>{slider.max}{slider.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern specs */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-d.pattern-slider-specifiche-569bc3ca")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: showcaseMessage("components.design-system.components-d.gradiente-e7afa1b4"), desc: showcaseMessage("components.design-system.components-d.semantico-per-parametro-colori-caldi-fredd-f931ad4c") },
            { label: showcaseMessage("components.design-system.components-d.infotip-ec4c79f7"), desc: showcaseMessage("components.design-system.components-d.toggle-con-lightbulb-icon-background-prima-a211c6ce") },
            { label: showcaseMessage("components.design-system.components-d.valore-36a6d826"), desc: showcaseMessage("components.design-system.components-d.dm-mono-tnum-fontweight-700-colore-primary-06857edb") },
          ].map((spec) => (
            <div key={spec.label} className="p-3 rounded-lg dsx-s-e4f209c55b">
              <span className="type-data dsx-s-133edc77c0">{spec.label}</span>
              <p className="type-code dsx-s-a40253a895">{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-d.gradiente-semantico-per-ogni-parametro-col-81240691"),
          showcaseMessage("components.design-system.components-d.infotip-contestuali-con-spiegazione-breve--70076f56"),
          showcaseMessage("components.design-system.components-d.range-dinamici-coerenti-con-lo-stile-selez-1cd05035"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-d.mai-slider-senza-gradiente-il-colore-piatt-3d35f29f"),
          showcaseMessage("components.design-system.components-d.mai-omettere-il-valore-numerico-corrente-e-21eb4fbd"),
          showcaseMessage("components.design-system.components-d.mai-step-non-coerenti-con-l-unita-es-step--6837cd65"),
        ]}
        comportamento={showcaseMessage("components.design-system.components-d.i-slider-aggiornano-in-real-time-il-rilasc-0b5f1671")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-d.input-nativo-bebffdc9"), desc: showcaseMessage("components.design-system.components-d.input-type-range-sotto-il-visual-custom-ta-83650b31") },
        { label: showcaseMessage("components.design-system.components-d.infotip-ec4c79f7"), desc: showcaseMessage("components.design-system.components-d.toggle-con-aria-expanded-contenuto-collega-50e7000a") },
        { label: showcaseMessage("components.design-system.components-d.touch-target-dc7bb62b"), desc: showcaseMessage("components.design-system.components-d.thumb-16px-area-cliccabile-28px-per-wcag-t-c547e55f") },
      ]} />
    </div>
  );
}

/* ═══ C16: RECIPE TIMELINE ═══ */

const DEMO_INGREDIENTS = [
  { name: showcaseMessage("components.design-system.components-d.farina-w280-f5965c8d"), amount: 500, unit: "g", pct: 100, color: "var(--tertiary)" },
  { name: showcaseMessage("components.design-system.components-d.acqua-f3128966"), amount: 325, unit: "ml", pct: 65, color: "var(--time-tonight)" },
  { name: showcaseMessage("components.design-system.components-d.sale-0028d743"), amount: 15, unit: "g", pct: 3, color: "var(--secondary)" },
  { name: showcaseMessage("components.design-system.components-d.lievito-fresco-f3a7cabd"), amount: 1.5, unit: "g", pct: 0.3, color: "var(--cta)" },
  { name: showcaseMessage("components.design-system.components-d.olio-evo-fc08a6fd"), amount: 15, unit: "ml", pct: 3, color: "var(--warm-sienna)" },
];

const DEMO_TIMELINE = [
  { icon: Hand, label: showcaseMessage("components.design-system.components-d.autolisi-d768d82f"), duration: "30 min", desc: showcaseMessage("components.design-system.components-d.farina-80-acqua-riposo-coperto-88d7c050"), time: "18:00", zone: "ambient" as const, temp: "22°C", detail: showcaseMessage("components.design-system.components-d.unire-farina-e-acqua-80-del-totale-in-una--6f66a62e") },
  { icon: ChefHat, label: showcaseMessage("components.design-system.components-d.impasto-4c653db5"), duration: "15 min", desc: showcaseMessage("components.design-system.components-d.aggiungere-sale-lievito-olio-incordare-9425febb"), time: "18:30", zone: "ambient" as const, temp: "22°C", detail: showcaseMessage("components.design-system.components-d.sciogliere-il-lievito-nell-acqua-restante--5c8d440a") },
  { icon: Scissors, label: showcaseMessage("components.design-system.components-d.pieghe-ef8aa969"), duration: "3×15 min", desc: showcaseMessage("components.design-system.components-d.stretch-fold-ogni-15-minuti-4758730c"), time: "18:45", zone: "ambient" as const, temp: "22°C", detail: showcaseMessage("components.design-system.components-d.eseguire-3-serie-di-stretch-fold-a-interva-7c2895a6") },
  { icon: Clock, label: showcaseMessage("components.design-system.components-d.puntata-d0f2ff75"), duration: "2h", desc: showcaseMessage("components.design-system.components-d.riposo-a-temperatura-ambiente-coperto-3304fccc"), time: "19:30", zone: "ambient" as const, temp: "22°C", detail: showcaseMessage("components.design-system.components-d.fase-di-fermentazione-bulk-l-impasto-deve--f91f84ac") },
  { icon: Thermometer, label: showcaseMessage("components.design-system.components-d.frigo-51f4c92e"), duration: "20h", desc: showcaseMessage("components.design-system.components-d.maturazione-in-frigo-a-4-c-38833536"), time: "21:30", zone: "cold" as const, temp: "4°C", detail: showcaseMessage("components.design-system.components-d.trasferire-l-impasto-in-contenitore-oleato-f338d152") },
  { icon: Expand, label: showcaseMessage("components.design-system.components-d.staglio-30fb5fbe"), duration: "30 min", desc: showcaseMessage("components.design-system.components-d.dividere-in-panetti-da-250g-arrotondare-63ad8a3d"), time: "17:30+1", zone: "ambient" as const, temp: "22°C", detail: showcaseMessage("components.design-system.components-d.estrarre-l-impasto-dal-frigo-ribaltare-sul-7f913bed") },
  { icon: Flame, label: showcaseMessage("components.design-system.components-d.cottura-95c1a57a"), duration: "8-10 min", desc: showcaseMessage("components.design-system.components-d.forno-250-c-pietra-refrattaria-c014d309"), time: "19:00+1", zone: "hot" as const, temp: "250°C", detail: showcaseMessage("components.design-system.components-d.preriscaldare-forno-al-massimo-con-pietra--39e8bfd2") },
];

function RecipeTimelineSpec() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleCopy = (idx: number) => {
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const zoneColor = (zone: string) => {
    if (zone === "cold") return "var(--time-tonight)";
    if (zone === "hot") return "var(--primary)";
    return "var(--cta)";
  };

  const zoneBg = (zone: string) => {
    if (zone === "cold") return "color-mix(in srgb, var(--time-tonight) 8%, transparent)";
    if (zone === "hot") return "color-mix(in srgb, var(--primary) 8%, transparent)";
    return "transparent";
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-d.recipe-output-timeline-45360f6f")} description={showcaseMessage("components.design-system.components-d.visualizzazione-finale-della-ricetta-ingre-f2f626f0")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-d.il-recipe-output-e-la-visualizzazione-fina-00a67b77")}
        principi={[
          showcaseMessage("components.design-system.components-d.ingredienti-barre-proporzionali-al-baker-s-dd27f18b"),
          showcaseMessage("components.design-system.components-d.timeline-step-verticali-con-nodi-40-40px-z-0a454632"),
          showcaseMessage("components.design-system.components-d.clipboard-doppio-path-api-textarea-fallbac-72d9ed8c"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.specifiche-057caf2f")} />

      {/* Ingredients */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-d.ingredienti-barre-proporzionali-93c7d2b4")}</span>
          <motion.button
            onClick={() => handleCopy(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg type-data active:scale-95 transition-transform dsx-s-4fe29d0b0f"
            style={{ "--dsx-color": toShowcaseCssValue(copiedIdx === -1 ? "var(--cta)" : "var(--muted-foreground)", false) } as any}
          >
            {copiedIdx === -1 ? <Check size={12} /> : <Copy size={12} />}
            {copiedIdx === -1 ? showcaseMessage("components.design-system.components-d.copiato-d7638aaa") : showcaseMessage("components.design-system.components-d.copia-lista-7584ffd6")}
          </motion.button>
        </div>

        <div className="flex flex-col gap-2.5">
          {DEMO_INGREDIENTS.map((ing) => {
            const barWidth = Math.max(4, ing.pct);
            return (
              <div key={ing.name} className="flex items-center gap-3">
                <span className="type-data dsx-s-9a12d800a3">{ing.name}</span>
                <div className="flex-1 min-w-0 h-6 rounded-lg overflow-hidden relative dsx-s-e4f209c55b">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={showcaseTransition.preset_e9fa60716e}
                    className="h-full rounded-lg dsx-s-d6af7b2e2d"
                    style={{ "--dsx-background": toShowcaseCssValue(ing.color, false) } as any}
                  />
                  <span
                    className="absolute right-2 top-1/2 dsx-s-5e98391378 ds-showcase__bar-value"
                  >
                    {ing.amount}{ing.unit}
                  </span>
                </div>
                <span className="type-code dsx-s-ad965616fd">{ing.pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-3 pt-3 flex items-center justify-between dsx-s-e0f5da197d">
          <span className="type-code dsx-s-a172e52ce6">{showcaseMessage("components.design-system.components-d.totale-impasto-6b5008fd")}</span>
          <span className="type-data-lg dsx-s-9f15ac2970">856.5g</span>
        </div>
      </div>

      {/* Timeline — interactive, with temperature zones */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-d.timeline-procedurale-interattiva-31e83a86")}</span>
          {/* Zone legend */}
          <div className="flex items-center gap-3">
            {[
              { label: showcaseMessage("components.design-system.components-d.ambiente-e6fefb74"), color: "var(--cta)" },
              { label: showcaseMessage("components.design-system.components-d.frigo-51f4c92e"), color: "var(--time-tonight)" },
              { label: showcaseMessage("components.design-system.components-d.forno-0f50f5fe"), color: "var(--primary)" },
            ].map((z) => (
              <div key={z.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(z.color, false) } as any} />
                <span className="dsx-s-6849179898">{z.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="dsx-s-c62c524b46">
          {showcaseMessage("components.design-system.components-d.clicca-su-uno-step-per-espandere-i-dettagl-dac68827")}</p>

        <div className="relative">
          {/* Vertical line — segmented by zone */}
          <div className="absolute left-5 top-3 bottom-3 dsx-s-4b816239d7" />

          <div className="flex flex-col gap-0.5">
            {DEMO_TIMELINE.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === DEMO_TIMELINE.length - 1;
              const isExpanded = expandedStep === i;
              const color = zoneColor(step.zone);

              return (
                <motion.div
                  key={step.label}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={showcaseTransition.dynamic_bcd2ab8e60(i * 0.08)}
                  className="flex gap-4 pl-0 cursor-pointer dsx-s-8a0318eb5f"
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setExpandedStep(isExpanded ? null : i);
                    }
                  }}
                  style={{ "--dsx-background": toShowcaseCssValue(isExpanded ? zoneBg(step.zone) : "transparent", false), "--dsx-padding": toShowcaseCssValue(isExpanded ? "8px 8px 8px 0" : "0", false) } as any}
                >
                  {/* Node */}
                  <div className="flex flex-col items-center dsx-s-23ce1bfc81">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 dsx-s-900493cc9c"
                      style={{ "--dsx-background": toShowcaseCssValue(isLast || isExpanded ? color : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(isLast || isExpanded ? "none" : "2px solid var(--outline-variant)", false), "--dsx-color": toShowcaseCssValue(isLast || isExpanded ? "var(--container-page)" : color, false) } as any}
                    >
                      <Icon size={16} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-5">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="type-code dsx-s-bc619688ba ds-showcase__data-ink" style={{ "--dsx-color": toShowcaseCssValue(color, false) } as any}>{step.time}</span>
                      <span className="dsx-s-1ccbfa8010">{step.label}</span>
                      <span style={{ "--dsx-background": toShowcaseCssValue(`color-mix(in srgb, ${color} 12%, transparent)`, false), "--dsx-color": toShowcaseCssValue(color, false) } as any} className="dsx-s-9f0ce81a80 ds-showcase__data-ink">
                        {step.duration}
                      </span>
                      {/* Temperature badge */}
                      <span style={{ "--dsx-background": toShowcaseCssValue(`color-mix(in srgb, ${color} 8%, transparent)`, false), "--dsx-color": toShowcaseCssValue(color, false), "--dsx-border": toShowcaseCssValue(`1px solid color-mix(in srgb, ${color} 20%, transparent)`, false) } as any} className="dsx-s-7d609755d3 ds-showcase__data-ink">
                        {step.temp}
                      </span>
                    </div>
                    <p className="dsx-s-b4252559c3">{step.desc}</p>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={showcaseTransition.preset_e933d0e313}
                        className="mt-2 p-3 rounded-lg dsx-s-b640817721"
                        style={{ "--dsx-border": toShowcaseCssValue(`1px solid color-mix(in srgb, ${color} 20%, transparent)`, false) } as any}
                      >
                        <p className="dsx-s-047468da18">
                          {step.detail}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clipboard pattern */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-d.pattern-clipboard-share-a7f1c6e6")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: showcaseMessage("components.design-system.components-d.clipboard-api-e048451c"), desc: showcaseMessage("components.design-system.components-d.navigator-clipboard-writetext-primario-ric-ca78e455") },
            { label: showcaseMessage("components.design-system.components-d.fallback-textarea-811f85d9"), desc: showcaseMessage("components.design-system.components-d.createelement-textarea-execcommand-copy-pe-e58c8b71") },
            { label: showcaseMessage("components.design-system.components-d.share-api-d62eea62"), desc: showcaseMessage("components.design-system.components-d.navigator-share-con-fallback-a-clipboard-s-932f922f") },
            { label: showcaseMessage("components.design-system.components-d.feedback-c8d7677e"), desc: showcaseMessage("components.design-system.components-d.icona-copy-check-per-1-5s-colore-muted-cta-a38bf68b") },
          ].map((spec) => (
            <div key={spec.label} className="p-3 rounded-lg dsx-s-e4f209c55b">
              <span className="dsx-s-97e646b80b">{spec.label}</span>
              <p className="dsx-s-d0b294e222">{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-d.anatomia-timeline-b7b6fea3")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.components-d.node-260f7a8c"), val: showcaseMessage("components.design-system.components-d.40-40px-rounded-xl-colore-cambia-per-zona--c37d13f3") },
            { prop: showcaseMessage("components.design-system.components-d.zone-termiche-caab5cd7"), val: showcaseMessage("components.design-system.components-d.3-zone-con-colore-semantico-background-esp-7b015370") },
            { prop: showcaseMessage("components.design-system.components-d.step-espandibile-d5d7f164"), val: showcaseMessage("components.design-system.components-d.click-spring-s-300-d-24-dettaglio-con-istr-5e3ce103") },
            { prop: showcaseMessage("components.design-system.components-d.badge-temp-92429895"), val: showcaseMessage("components.design-system.components-d.dm-mono-0-625rem-border-zona-20-mostra-la--f3692d1d") },
            { prop: showcaseMessage("components.design-system.components-d.stagger-dc29b6ac"), val: showcaseMessage("components.design-system.components-d.entrance-staggerata-delay-80ms-indice-x-12-29799c9e") },
            { prop: showcaseMessage("components.design-system.components-d.linea-verticale-94b19aea"), val: showcaseMessage("components.design-system.components-d.2px-outline-variant-absolute-left-5-connet-953362ce") },
          ].map((a) => (
            <AnatomyRow key={a.prop} prop={a.prop} val={a.val} />
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-d.ingredienti-con-barre-proporzionali-al-bak-051884c8"),
          showcaseMessage("components.design-system.components-d.zone-termiche-colorate-nella-timeline-l-ut-a423eb4e"),
          showcaseMessage("components.design-system.components-d.step-espandibili-con-dettagli-scientifici--84d68cd2"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-d.mai-timeline-senza-linea-verticale-perde-l-aae4c430"),
          showcaseMessage("components.design-system.components-d.mai-nodi-tutti-dello-stesso-colore-le-zone-d04541d7"),
          showcaseMessage("components.design-system.components-d.mai-step-espansi-di-default-il-dettaglio-e-e439777b"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-d.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-d.clipboard-5efe0c93"), desc: showcaseMessage("components.design-system.components-d.doppio-path-api-textarea-fallback-per-comp-75dafef0") },
        { label: showcaseMessage("components.design-system.components-d.timeline-018514a3"), desc: showcaseMessage("components.design-system.components-d.role-list-con-role-listitem-per-ogni-step--681f3074") },
        { label: showcaseMessage("components.design-system.components-d.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.components-d.i-colori-zona-hanno-contrasto-3-1-contro-i-9c1caf32") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "configurator", label: showcaseMessage("components.design-system.components-d.recipeconfigurator-abcbcfdd"), group: "c", Component: RecipeConfiguratorSpec },
  { id: "timeline", label: showcaseMessage("components.design-system.components-d.recipe-timeline-794d239e"), group: "c", Component: RecipeTimelineSpec },
];
