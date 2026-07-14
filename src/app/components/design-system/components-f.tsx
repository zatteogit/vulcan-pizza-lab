import {
Check,
ChefHat,
Flame,
FlaskConical,
Home,
Plus,
Star,
Timer,
Wheat
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React, { useEffect,useRef,useState } from "react";
import type { SectionEntry } from "./shared";
import {
AccessibilitaInfo,
AnatomyRow,
LineeGuida,
Panoramica,
SectionHeader,
SubSectionLabel,
} from "./shared";
import { Switch, Divider, Fab, SegmentedControl, Progress, Surface, CtaButton } from "../ds/index";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   C17 — FAB / EXTENDED FAB  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const FAB_VARIANTS = [
  { id: "standard", label: showcaseMessage("components.design-system.components-f.standard-2dfa6607"), size: 56, iconSize: 24, radius: "28px", showLabel: false },
  { id: "small", label: showcaseMessage("components.design-system.components-f.small-c74fd971"), size: 40, iconSize: 20, radius: "12px", showLabel: false },
  { id: "large", label: showcaseMessage("components.design-system.components-f.large-738fd1d2"), size: 96, iconSize: 36, radius: "28px", showLabel: false },
  { id: "extended", label: showcaseMessage("components.design-system.components-f.extended-e4b32be2"), size: 56, iconSize: 20, radius: "28px", showLabel: true },
];

const FAB_COLORS = [
  { id: "primary", label: showcaseMessage("components.design-system.components-f.primary-a9a96ec0"), bg: "var(--primary-container)", fg: "var(--on-primary-container)", shadow: "var(--shadow-md)" },
  { id: "surface", label: showcaseMessage("components.design-system.components-f.surface-cda05ca6"), bg: "var(--surface-container-high)", fg: "var(--primary)", shadow: "var(--shadow-md)" },
  { id: "tertiary", label: showcaseMessage("components.design-system.components-f.tertiary-b710a1f9"), bg: "var(--tertiary-container)", fg: "var(--on-tertiary-container)", shadow: "var(--shadow-md)" },
];

function FABSpec() {
  const [activeVariant, setActiveVariant] = useState("standard");
  const [activeColor, setActiveColor] = useState("primary");

  const variant = FAB_VARIANTS.find((v) => v.id === activeVariant)!;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-f.fab-extended-fab-cfe6aada")}
        description={showcaseMessage("components.design-system.components-f.floating-action-button-l-azione-primaria-d-ae6b8803")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-f.il-fab-e-il-bottone-flottante-per-l-azione-66c705ac")}
        principi={[
          showcaseMessage("components.design-system.components-f.un-solo-fab-per-schermata-e-l-azione-princ-82b62ef0"),
          showcaseMessage("components.design-system.components-f.shadow-reattiva-elevation-2-rest-elevation-afcb7338"),
          showcaseMessage("components.design-system.components-f.extended-fab-mostra-label-icona-per-chiare-09aefc92"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.specifiche-057caf2f")} />

      {/* Variant selector */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.varianti-fab-6105533a")}</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {FAB_VARIANTS.map((v) => (
            <CtaButton
              key={v.id}
              variant="secondary"
              radius="xl"
              onClick={() => setActiveVariant(v.id)}
              className="px-4 py-2 dsx-s-f341e5ccff"
              style={{ "--dsx-font-weight": toShowcaseCssValue(activeVariant === v.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-background": toShowcaseCssValue(activeVariant === v.id ? "var(--primary)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(activeVariant === v.id ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(activeVariant === v.id ? "1px solid var(--primary)" : "1px solid var(--outline-variant)", false) } as any}
            >
              {v.label}
            </CtaButton>
          ))}
        </div>

        {/* Color selector */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FAB_COLORS.map((c) => (
            <CtaButton
              key={c.id}
              variant="secondary"
              radius="lg"
              onClick={() => setActiveColor(c.id)}
              className="px-3 py-1.5 flex items-center gap-2 dsx-s-5b29d53027"
              style={{ "--dsx-background": toShowcaseCssValue(activeColor === c.id ? c.bg : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(activeColor === c.id ? c.fg : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(activeColor === c.id ? `1px solid ${c.fg}` : "1px solid var(--outline-variant)", false) } as any}
            >
              <div className="w-3 h-3 rounded-full dsx-s-08c5fe74f8" style={{ "--dsx-background": toShowcaseCssValue(activeColor === c.id ? c.fg : c.bg, false), "--dsx-border": toShowcaseCssValue(activeColor === c.id ? `2px solid ${c.fg}` : "1px solid var(--outline-variant)", false) } as any} />
              {c.label}
            </CtaButton>
          ))}
        </div>

        {/* FAB preview */}
        <div className="mt-6 flex items-center justify-center dsx-s-06b17225d1">
          <Fab
            variant={activeVariant as any}
            color={activeColor as any}
            icon={<Plus size={variant.iconSize} />}
            label={showcaseMessage("components.design-system.components-f.nuova-ricetta-f620b619")}
          />
        </div>
      </Surface>

      {/* All FAB sizes side by side */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.scala-completa-4325b011")}</span>
        <div className="mt-4 flex items-end gap-6 justify-center flex-wrap">
          {FAB_VARIANTS.map((v) => (
            <div key={v.id} className="flex flex-col items-center gap-2">
              <Fab
                variant={v.id as any}
                icon={<Plus size={v.iconSize} />}
                label={showcaseMessage("components.design-system.components-f.crea-e7c107d0")}
              />
              <span className="type-code dsx-s-63782726c0">
                {v.label} · {v.size}px
              </span>
            </div>
          ))}
        </div>
      </Surface>

      {/* Anatomy */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.anatomia-fab-4ceef10b")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.container-e6443af9")} val={showcaseMessage("components.design-system.components-f.primary-container-default-surface-containe-2fd6b7da")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.shape-ea5c1a20")} val={showcaseMessage("components.design-system.components-f.small-12px-standard-16px-28px-m3e-large-28-fbcbba17")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.elevation-a514da10")} val={showcaseMessage("components.design-system.components-f.elevation-2-rest-elevation-1-pressed-eleva-cb0dec8b")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.motion-e040db2b")} val={showcaseMessage("components.design-system.components-f.spring-stiffness-500-damping-25-whiletap-s-9889d374")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.label-ext-089df5fe")} val={showcaseMessage("components.design-system.components-f.dm-sans-0-875rem-weight-600-letterspacing--5483787a")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.icon-716f63b9")} val={showcaseMessage("components.design-system.components-f.lucide-24px-standard-20px-small-ext-36px-l-9700c497")} />
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-f.un-solo-fab-per-schermata-l-azione-primari-6c20545a"),
          showcaseMessage("components.design-system.components-f.extended-fab-per-azioni-che-richiedono-chi-f4abb196"),
          showcaseMessage("components.design-system.components-f.shadow-reattiva-al-press-per-feedback-fisi-1659e2a1"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-f.mai-due-fab-nella-stessa-schermata-7bfeac7c"),
          showcaseMessage("components.design-system.components-f.mai-fab-per-azioni-secondarie-usare-un-bot-24838a55"),
          showcaseMessage("components.design-system.components-f.mai-rimuovere-l-ombra-il-fab-deve-flottare-dd08c8ed"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-f.aria-label-descrittivo-sull-azione-extende-e4fbaf31") },
        { label: showcaseMessage("components.design-system.components-f.focus-fe7f55b8"), desc: showcaseMessage("components.design-system.components-f.focus-ring-3px-primary-su-focus-visible-ta-809bbb38") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C18 — SEGMENTED BUTTON  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const SEGMENT_DEMOS = [
  {
    id: "oven",
    label: showcaseMessage("components.design-system.components-f.tipo-forno-4f5ee654"),
    options: [
      { id: "home", label: showcaseMessage("components.design-system.components-f.casalingo-dbde4388"), icon: Home },
      { id: "electric", label: showcaseMessage("components.design-system.components-f.elettrico-pro-0d2b1723"), icon: Flame },
      { id: "wood", label: showcaseMessage("components.design-system.components-f.legna-643804b4"), icon: Flame },
    ],
  },
  {
    id: "view",
    label: showcaseMessage("components.design-system.components-f.vista-ricetta-776ca1e2"),
    options: [
      { id: "ingredients", label: showcaseMessage("components.design-system.components-f.ingredienti-d62cdaa1"), icon: Wheat },
      { id: "timeline", label: showcaseMessage("components.design-system.components-f.timeline-018514a3"), icon: Timer },
      { id: "science", label: showcaseMessage("components.design-system.components-f.scienza-ec75a6f6"), icon: FlaskConical },
    ],
  },
];

function SegmentedButtonSpec() {
  const [selections, setSelections] = useState<Record<string, string>>({
    oven: "home",
    view: "ingredients",
  });

  const select = (groupId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: optionId }));
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-f.segmented-button-2edf83ed")}
        description={showcaseMessage("components.design-system.components-f.toggle-a-segmenti-per-selezione-esclusiva--7fe81962")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-f.il-segmented-button-e-un-toggle-a-segmenti-d26f301c")}
        principi={[
          showcaseMessage("components.design-system.components-f.selezione-mutualmente-esclusiva-un-solo-se-3a430f33"),
          showcaseMessage("components.design-system.components-f.check-icon-animato-spring-500-20-sul-segme-23e72107"),
          showcaseMessage("components.design-system.components-f.container-unico-rounded-2xl-con-outline-va-489e1e90"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.specifiche-057caf2f")} />

      {/* Demo groups */}
      {SEGMENT_DEMOS.map((group) => (
        <Surface variant="card" className="p-5" key={group.id}>
          <span className="type-label dsx-s-e2184fadc0">{group.label}</span>
          <div className="mt-4">
            <SegmentedControl
              value={selections[group.id]}
              options={group.options.map(opt => ({
                value: opt.id,
                label: <span className="hidden sm:inline">{opt.label}</span>,
                ariaLabel: opt.label,
                icon: React.createElement(opt.icon, { size: 16 })
              }))}
              onValueChange={val => select(group.id, val)}
              ariaLabel={group.label}
              fullWidth
            />
          </div>
        </Surface>
      ))}

      {/* States */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.stati-segmento-a4036b8c")}</span>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { state: showcaseMessage("components.design-system.components-f.unselected-a86fe6de"), bg: "var(--surface-container-low)", fg: "var(--on-surface-variant)", icon: false },
            { state: showcaseMessage("components.design-system.components-f.selected-9a976fc2"), bg: "var(--primary)", fg: "var(--primary-foreground)", icon: true },
            { state: showcaseMessage("components.design-system.components-f.hover-270d13d8"), bg: "var(--surface-container)", fg: "var(--on-surface-variant)", icon: false },
            { state: showcaseMessage("components.design-system.components-f.disabled-f4f4473d"), bg: "var(--surface-container-low)", fg: "var(--muted-foreground)", icon: false },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-2">
              <div
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 dsx-s-2249b1ef86"
                style={{ "--dsx-background": toShowcaseCssValue(s.bg, false), "--dsx-color": toShowcaseCssValue(s.fg, false), "--dsx-opacity": toShowcaseCssValue(1, true) } as any}
              >
                {s.icon && <Check size={14} />}
                <span style={{ "--dsx-font-weight": toShowcaseCssValue(s.icon ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true) } as any} className="dsx-s-3094594d67">{showcaseMessage("components.design-system.components-f.label-74341e3c")}</span>
              </div>
              <span className="type-label text-center dsx-s-4d3571287d">{s.state}</span>
            </div>
          ))}
        </div>
      </Surface>

      {/* Anatomy */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.container-e6443af9")} val={showcaseMessage("components.design-system.components-f.outline-variant-border-rounded-2xl-outer-n-0e0de454")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.selected-9a976fc2")} val={showcaseMessage("components.design-system.components-f.primary-bg-primary-foreground-text-check-i-fb233d2b")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.typography-f4beb9af")} val={showcaseMessage("components.design-system.components-f.dm-sans-0-75rem-weight-500-700-on-select-d2447a71")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.divider-912fc145")} val={showcaseMessage("components.design-system.components-f.1px-outline-variant-tra-segmenti-nascosto--3fae11f3")} />
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-f.max-5-segmenti-oltre-usare-tabs-o-dropdown-ab6369cc"),
          showcaseMessage("components.design-system.components-f.label-brevi-1-2-parole-per-leggibilita-su--124a845c"),
          showcaseMessage("components.design-system.components-f.check-icon-animato-per-conferma-visiva-del-cfc92ced"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-f.mai-segmented-button-per-selezione-multipl-d8a08088"),
          showcaseMessage("components.design-system.components-f.mai-mescolare-segmenti-con-icona-e-senza-i-0b326e4f"),
          showcaseMessage("components.design-system.components-f.mai-usare-per-navigazione-tra-pagine-e-per-53a625be"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-f.role-radiogroup-sul-container-role-radio-a-e83fe4ba") },
        { label: showcaseMessage("components.design-system.components-f.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-f.arrow-keys-per-navigare-tra-segmenti-space-08be69d2") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C19 — SWITCH  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

function SwitchSpec() {
  const [switches, setSwitches] = useState<Record<string, boolean>>({
    nerd: false,
    dark: true,
    preferm: false,
    sourdough: true,
  });

  const toggle = (id: string) => {
    setSwitches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const SWITCH_DEMOS = [
    { id: "nerd", label: showcaseMessage("components.design-system.components-f.pizzanerd-mode-9df321e1"), desc: showcaseMessage("components.design-system.components-f.layer-scientifico-nei-punteggi-7f19651b") },
    { id: "dark", label: showcaseMessage("components.design-system.components-f.dark-mode-e7f8b9dc"), desc: showcaseMessage("components.design-system.components-f.tema-scuro-4416f373") },
    { id: "preferm", label: showcaseMessage("components.design-system.components-f.pre-fermento-97cf6254"), desc: showcaseMessage("components.design-system.components-f.biga-o-poolish-e1386158") },
    { id: "sourdough", label: showcaseMessage("components.design-system.components-f.lievito-madre-180392fb"), desc: showcaseMessage("components.design-system.components-f.sourdough-disponibile-5423c1b1") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-f.switch-3e44c920")}
        description={showcaseMessage("components.design-system.components-f.toggle-on-off-con-thumb-che-morfa-m3-expre-3de74eb3")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-f.lo-switch-e-un-toggle-on-off-con-thumb-mor-40d5bdb7")}
        principi={[
          showcaseMessage("components.design-system.components-f.thumb-morfante-16px-off-24px-on-con-check--a8b51a74"),
          showcaseMessage("components.design-system.components-f.spring-physics-500-25-per-thumb-e-icon-sep-504389d9"),
          showcaseMessage("components.design-system.components-f.track-colore-switch-background-off-primary-1b905a12"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.specifiche-057caf2f")} />

      {/* Interactive switches */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.switch-interattivi-3ef9d465")}</span>
        <div className="mt-4 flex flex-col gap-1">
          {SWITCH_DEMOS.map((sw) => {
            const isOn = switches[sw.id];
            return (
              <div key={sw.id} className="flex items-center justify-between py-3 dsx-s-ff83771d47">
                <div>
                  <div className="dsx-s-1ccbfa8010">{sw.label}</div>
                  <div className="dsx-s-6849179898">{sw.desc}</div>
                </div>
                <Switch
                  checked={isOn}
                  onCheckedChange={() => toggle(sw.id)}
                  aria-label={sw.label}
                />
              </div>
            );
          })}
        </div>
      </Surface>

      {/* States grid */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.stati-switch-38cc7454")}</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { state: showcaseMessage("components.design-system.components-f.off-e3de5ab0"), on: false, disabled: false },
            { state: showcaseMessage("components.design-system.components-f.on-e0049a66"), on: true, disabled: false },
            { state: showcaseMessage("components.design-system.components-f.off-disabled-eb0cc2dd"), on: false, disabled: true },
            { state: showcaseMessage("components.design-system.components-f.on-disabled-c3c240dd"), on: true, disabled: true },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-3">
              <div
                className="relative flex-shrink-0 dsx-s-5d5076d45f"
                style={{ "--dsx-background": toShowcaseCssValue(s.on ? "var(--primary)" : "var(--switch-background)", false), "--dsx-border": toShowcaseCssValue(s.on ? "none" : "2px solid var(--outline)", false), "--dsx-opacity": toShowcaseCssValue(s.disabled ? 0.38 : 1, true) } as any}
              >
                <div
                  className="absolute top-1/2 rounded-full flex items-center justify-center dsx-s-0f9faff05a"
                  style={{ "--dsx-transform": toShowcaseCssValue(`translateY(-50%) translateX(${s.on ? "22px" : "4px"})`, false), "--dsx-width": toShowcaseCssValue(s.on ? "24px" : "16px", false), "--dsx-height": toShowcaseCssValue(s.on ? "24px" : "16px", false), "--dsx-background": toShowcaseCssValue(s.on ? "var(--primary-foreground)" : "var(--outline)", false) } as any}
                >
                  {s.on && <Check size={14} className="dsx-s-b0e08465c2" />}
                </div>
              </div>
              <span className="type-label text-center dsx-s-4d3571287d">{s.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.track-b1c5a7af")} val={showcaseMessage("components.design-system.components-f.52-32px-radius-full-off-switch-background--aec33272")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.thumb-55751877")} val={showcaseMessage("components.design-system.components-f.off-16px-outline-on-24px-primary-foregroun-5dd1a728")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.motion-e040db2b")} val={showcaseMessage("components.design-system.components-f.spring-stiffness-500-damping-25-thumb-icon-c4b69c2c")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.a11y-9126f700")} val={showcaseMessage("components.design-system.components-f.role-switch-aria-checked-aria-label-focus--6550f879")} />
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-f.label-e-descrizione-sempre-visibili-accant-8cf503a1"),
          showcaseMessage("components.design-system.components-f.stato-on-off-chiaramente-distinguibile-col-240ad5a6"),
          showcaseMessage("components.design-system.components-f.role-switch-con-aria-checked-per-screen-re-43b595ad"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-f.mai-switch-senza-label-l-utente-non-sa-cos-9bb84170"),
          showcaseMessage("components.design-system.components-f.mai-usare-switch-per-azioni-irreversibili--ce9c4c2f"),
          showcaseMessage("components.design-system.components-f.mai-cambiare-lo-stato-programmaticamente-s-5ba98c20"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-f.role-switch-aria-checked-aria-label-suppor-00254035") },
        { label: showcaseMessage("components.design-system.components-f.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-f.space-per-togglare-tab-per-navigare-focus--821707c0") },
        { label: showcaseMessage("components.design-system.components-f.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.components-f.thumb-off-outline-su-switch-background-on--ebebd1ff") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C20 — PROGRESS INDICATORS  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

function ProgressIndicatorSpec() {
  const [progress, setProgress] = useState(65);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-f.progress-indicators-6933a0d7")}
        description={showcaseMessage("components.design-system.components-f.linear-e-circular-progress-m3-expressive-t-5da493b2")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-f.progress-indicators-in-due-forme-linear-ba-200dc4f6")}
        principi={[
          showcaseMessage("components.design-system.components-f.determinato-spring-animation-per-il-progre-51e43440"),
          showcaseMessage("components.design-system.components-f.indeterminato-loop-fluido-infinito-linear--339e7347"),
          showcaseMessage("components.design-system.components-f.track-sempre-visibile-surface-container-hi-a7faf90e"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.specifiche-057caf2f")} />

      {/* Linear — determinate */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.linear-determinato-4a8e30bd")}</span>
        <div className="mt-4">
          <Progress value={progress} label={showcaseMessage("components.design-system.components-f.completamento-ricetta-703e03d5")} />
          <input
            type="range"
            aria-label={showcaseMessage("components.design-system.components-f.completamento-ricetta-703e03d5")}
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full mt-3 accent-[var(--primary)]"
          />
        </div>
      </Surface>

      {/* Linear — indeterminate */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.linear-indeterminato-fe1714ea")}</span>
        <div className="mt-4">
          <Progress indeterminate />
        </div>
      </Surface>

      {/* Circular */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.circular-782acc59")}</span>
        <div className="mt-4 flex items-center gap-8 justify-center flex-wrap">
          {/* Determinate */}
          {[25, 50, 75, 100].map((pct) => (
            <div key={pct} className="flex flex-col items-center gap-2">
              <Progress variant="circular" value={pct} size={48} />
              <span className="type-code dsx-s-63782726c0">{pct}%</span>
            </div>
          ))}

          {/* Indeterminate spinner */}
          <div className="flex flex-col items-center gap-2">
            <Progress variant="circular" indeterminate size={48} />
            <span className="type-code dsx-s-63782726c0">{showcaseMessage("components.design-system.components-f.indet-4ed5fc13")}</span>
          </div>
        </div>
      </Surface>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.linear-track-13fc2469")} val={showcaseMessage("components.design-system.components-f.4px-height-radius-full-surface-container-h-f6a1a9df")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.linear-indicator-559db509")} val={showcaseMessage("components.design-system.components-f.primary-radius-full-pill-spring-animation--9fe3f334")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.circular-track-f18e5e8d")} val={showcaseMessage("components.design-system.components-f.48-48px-stroke-4px-radius-18-surface-conta-9885d93b")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.circular-indicator-32d2edea")} val={showcaseMessage("components.design-system.components-f.primary-stroke-strokelinecap-round-indet-r-2259a16f")} />
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-f.determinato-mostrare-sempre-la-per-feedbac-c0ac16db"),
          showcaseMessage("components.design-system.components-f.indeterminato-usare-solo-quando-il-tempo-e-b0e85c42"),
          showcaseMessage("components.design-system.components-f.circular-per-spazi-ridotti-linear-per-sezi-8b418a6e"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-f.mai-progress-senza-track-l-utente-perde-il-a2067b36"),
          showcaseMessage("components.design-system.components-f.mai-animare-il-determinato-con-duration-ea-afe0ccd0"),
          showcaseMessage("components.design-system.components-f.mai-mescolare-linear-e-circular-nello-stes-ea9e295a"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-f.role-progressbar-aria-valuenow-aria-valuem-9615d224") },
        { label: showcaseMessage("components.design-system.components-f.indet-4ed5fc13"), desc: showcaseMessage("components.design-system.components-f.aria-valuemin-max-senza-aria-valuenow-segn-40175699") },
        { label: showcaseMessage("components.design-system.components-f.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.components-f.indeterminato-fallback-a-static-pulse-con--7dd54ae4") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C21 — TABS  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const TAB_DEMOS = [
  { id: "config", label: showcaseMessage("components.design-system.components-f.configura-e4c15bac"), icon: Home },
  { id: "styles", label: showcaseMessage("components.design-system.components-f.stili-ad1a9b2f"), icon: ChefHat },
  { id: "recipe", label: showcaseMessage("components.design-system.components-f.ricetta-b120bce5"), icon: Flame },
  { id: "score", label: showcaseMessage("components.design-system.components-f.punteggio-8c67f490"), icon: Star },
  { id: "science", label: showcaseMessage("components.design-system.components-f.scienza-ec75a6f6"), icon: FlaskConical },
];

function TabsSpec() {
  const [activeTab, setActiveTab] = useState("config");
  const [activeSecondary, setActiveSecondary] = useState("config");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setIndicatorStyle({
          left: elRect.left - parentRect.left,
          width: elRect.width,
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-f.tabs-2a4d562b")}
        description={showcaseMessage("components.design-system.components-f.m3-expressive-indicator-animato-sotto-il-t-429da53f")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-f.tabs-con-indicator-animato-via-spring-due--8c42781f")}
        principi={[
          showcaseMessage("components.design-system.components-f.indicator-spring-stiffness-400-damping-30--66d827a9"),
          showcaseMessage("components.design-system.components-f.primary-icon-18px-label-secondary-solo-lab-f85a0611"),
          showcaseMessage("components.design-system.components-f.tab-attivo-primary-color-weight-700-inatti-6fd2db3e"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.specifiche-057caf2f")} />

      {/* Primary tabs (icon + label) */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.primary-tabs-icona-label-e295ca69")}</span>
        <div className="mt-4 relative dsx-s-ff83771d47">
          <div className="flex" role="tablist">
            {TAB_DEMOS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`primary-panel-${tab.id}`}
                  id={`primary-tab-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 px-2 relative active:scale-97 dsx-s-75ab04c980"
                  style={{ "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary)" : "var(--on-surface-variant)", false) } as any}
                >
                  <Icon size={18} />
                  <span style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true) } as any} className="dsx-s-47bcd58928">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Animated indicator */}
          <motion.div
            className="absolute bottom-0 h-0.5 rounded-full dsx-s-0a278ece1c"
            animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            transition={showcaseTransition.preset_9fd73d3829}
          />
        </div>

        {/* Tab content preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            role="tabpanel"
            id={`primary-panel-${activeTab}`}
            aria-labelledby={`primary-tab-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={showcaseTransition.preset_304998007a}
            className="mt-4 p-4 rounded-xl dsx-s-b55bd0c40d"
          >
            <span className="dsx-s-1ccbfa8010">
              {TAB_DEMOS.find((t) => t.id === activeTab)?.label}
            </span>
            <p className="dsx-s-2d3a274d76">
              {showcaseMessage("components.design-system.components-f.contenuto-della-sezione-865fbc82")}{TAB_DEMOS.find((t) => t.id === activeTab)?.label?.toLowerCase()}.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Secondary tabs (text only) */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.secondary-tabs-solo-testo-6424ed54")}</span>
        <div className="mt-4 flex dsx-s-ff83771d47" role="tablist">
          {TAB_DEMOS.slice(0, 4).map((tab) => {
            const isActive = activeSecondary === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`secondary-panel-${tab.id}`}
                id={`secondary-tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveSecondary(tab.id)}
                className="flex-1 py-2.5 px-3 relative active:scale-97 dsx-s-09b6d9b413"
                style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--text-default)" : "var(--on-surface-variant)", false) } as any}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="secondary-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full dsx-s-0a278ece1c"
                    transition={showcaseTransition.preset_9fd73d3829}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          id={`secondary-panel-${activeSecondary}`}
          aria-labelledby={`secondary-tab-${activeSecondary}`}
          className="sr-only"
        >{TAB_DEMOS.find((tab) => tab.id === activeSecondary)?.label}</div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.container-e6443af9")} val={showcaseMessage("components.design-system.components-f.outline-variant-bottom-border-no-backgroun-26a558b5")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.indicator-61f608db")} val={showcaseMessage("components.design-system.components-f.3px-primary-radius-full-spring-stiffness-4-5b45ecd0")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.primary-tab-e4af8bdb")} val={showcaseMessage("components.design-system.components-f.icon-18px-label-dm-sans-0-6875rem-active-p-9c26a191")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.secondary-tab-9f41d537")} val={showcaseMessage("components.design-system.components-f.label-only-active-foreground-weight-700-in-4be72a8d")} />
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-f.primary-tabs-per-sezioni-con-icona-contest-e4bb34d2"),
          showcaseMessage("components.design-system.components-f.secondary-tabs-per-sotto-sezioni-testuali--ab974826"),
          showcaseMessage("components.design-system.components-f.indicator-spring-based-per-feedback-di-nav-e190acc6"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-f.mai-piu-di-5-6-tabs-oltre-usare-scrollable-8f92b146"),
          showcaseMessage("components.design-system.components-f.mai-mescolare-primary-e-secondary-tabs-nel-130819ee"),
          showcaseMessage("components.design-system.components-f.mai-tabs-senza-contenuto-sotto-l-utente-si-31474914"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-f.role-tablist-sul-container-role-tab-aria-s-90e11c45") },
        { label: showcaseMessage("components.design-system.components-f.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-f.arrow-keys-per-navigare-tab-entra-nella-ta-f629ced7") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C22 — DIVIDER  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

function DividerSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-f.divider-912fc145")}
        description={showcaseMessage("components.design-system.components-f.separatore-visivo-m3-1px-outline-variant-f-0dac483c")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-f.il-divider-e-un-separatore-visivo-minimo-1-fd2ae6ca")}
        principi={[
          showcaseMessage("components.design-system.components-f.1px-outline-variant-mai-piu-spesso-52188446"),
          showcaseMessage("components.design-system.components-f.inset-allineato-al-leading-element-es-44px-f6ea4d01"),
          showcaseMessage("components.design-system.components-f.verticale-height-24px-default-inline-con-f-b1eb7751"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.specifiche-057caf2f")} />

      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.varianti-divider-7d99a6a3")}</span>

        <div className="mt-5 flex flex-col gap-6">
          {/* Full-bleed */}
          <div>
            <span className="type-mono-label dsx-s-b0e08465c2">{showcaseMessage("components.design-system.components-f.full-bleed-9581df88")}</span>
            <div className="mt-2 p-4 rounded-xl dsx-s-e4f209c55b">
              <div className="dsx-s-25bc1d4bcb">{showcaseMessage("components.design-system.components-f.elemento-sopra-c9530f2b")}</div>
              <Divider />
              <div className="dsx-s-25bc1d4bcb">{showcaseMessage("components.design-system.components-f.elemento-sotto-0621c6fc")}</div>
            </div>
          </div>

          {/* Inset */}
          <div>
            <span className="type-mono-label dsx-s-b0e08465c2">{showcaseMessage("components.design-system.components-f.inset-16px-0047b987")}</span>
            <div className="mt-2 p-4 rounded-xl dsx-s-e4f209c55b">
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full dsx-s-a354218702" />
                <span className="dsx-s-344b2142cb">{showcaseMessage("components.design-system.components-f.napoletana-stg-fc9d3868")}</span>
              </div>
              <Divider inset />
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full dsx-s-d7ce50aa40" />
                <span className="dsx-s-344b2142cb">{showcaseMessage("components.design-system.components-f.teglia-romana-3dfce708")}</span>
              </div>
            </div>
          </div>

          {/* Vertical */}
          <div>
            <span className="type-mono-label dsx-s-b0e08465c2">{showcaseMessage("components.design-system.components-f.verticale-15789baf")}</span>
            <div className="mt-2 p-4 rounded-xl flex items-center gap-0 dsx-s-e4f209c55b">
              <span className="dsx-s-3461067b9c">65%</span>
              <Divider orientation="vertical" className="dsx-s-eb78790f84" />
              <span className="dsx-s-3461067b9c">W280</span>
              <Divider orientation="vertical" className="dsx-s-eb78790f84" />
              <span className="dsx-s-3461067b9c">{showcaseMessage("components.design-system.components-f.24h-02779596")}</span>
              <Divider orientation="vertical" className="dsx-s-eb78790f84" />
              <span className="dsx-s-3461067b9c">4°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-f.specifiche-057caf2f")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.colore-46db165e")} val={showcaseMessage("components.design-system.components-f.outline-variant-light-parchment-500-dark-n-35056000")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.spessore-53de4947")} val={showcaseMessage("components.design-system.components-f.1px-border-width-thin-790bc2d2")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.inset-4e46a9b6")} val={showcaseMessage("components.design-system.components-f.allineato-al-contenuto-16px-default-44px-c-5890e4d9")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-f.verticale-15789baf")} val={showcaseMessage("components.design-system.components-f.height-24px-default-inline-con-flex-items-d586a835")} />
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-f.full-bleed-per-separare-sezioni-maggiori-f12e014d"),
          showcaseMessage("components.design-system.components-f.inset-per-separare-item-in-una-lista-con-l-9929cc07"),
          showcaseMessage("components.design-system.components-f.verticale-per-separare-metriche-inline-sta-40fc864f"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-f.mai-divider-tra-ogni-elemento-usare-gap-sp-ccc491e0"),
          showcaseMessage("components.design-system.components-f.mai-spessore-1px-non-e-un-bordo-decorativo-f0175732"),
          showcaseMessage("components.design-system.components-f.mai-colore-diverso-da-outline-variant-e-un-53561da7"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-f.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-f.role-separator-per-screen-reader-decorativ-a34f60de") },
        { label: showcaseMessage("components.design-system.components-f.orientamento-e4cf8027"), desc: showcaseMessage("components.design-system.components-f.aria-orientation-horizontal-o-vertical-per-3e13cfc6") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "fab", label: showcaseMessage("components.design-system.components-f.fab-extended-fab-cfe6aada"), group: "c", Component: FABSpec },
  { id: "segmented", label: showcaseMessage("components.design-system.components-f.segmented-button-2edf83ed"), group: "c", Component: SegmentedButtonSpec },
  { id: "switch", label: showcaseMessage("components.design-system.components-f.switch-3e44c920"), group: "c", Component: SwitchSpec },
  { id: "progress", label: showcaseMessage("components.design-system.components-f.progress-indicators-6933a0d7"), group: "c", Component: ProgressIndicatorSpec },
  { id: "tabs", label: showcaseMessage("components.design-system.components-f.tabs-2a4d562b"), group: "c", Component: TabsSpec },
  { id: "divider", label: showcaseMessage("components.design-system.components-f.divider-912fc145"), group: "c", Component: DividerSpec },
];
