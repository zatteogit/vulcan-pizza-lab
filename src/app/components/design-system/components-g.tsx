import { Check,ChevronDown,Minus } from "lucide-react";
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
import { Checkbox, RadioButton, Select } from "../ds/index";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   C23 — CHECKBOX  (M3 Expressive)
   Animated checkmark, indeterminate state, label alignment.
   ═══════════════════════════════════════════════════════════ */

function CheckboxSpec() {
  const [checks, setChecks] = useState<Record<string, boolean | "indeterminate">>({
    napo: true,
    teglia: false,
    bonci: "indeterminate",
    detroit: true,
    chicago: false,
    pinsa: false,
  });

  const toggle = (id: string) => {
    setChecks((prev) => {
      const v = prev[id];
      if (v === "indeterminate") return { ...prev, [id]: true };
      return { ...prev, [id]: !v };
    });
  };

  const ITEMS = [
    { id: "napo", label: showcaseMessage("components.design-system.components-g.napoletana-stg-fc9d3868"), desc: showcaseMessage("components.design-system.components-g.classica-avpn-forno-legna-03abe9ae") },
    { id: "teglia", label: showcaseMessage("components.design-system.components-g.teglia-romana-3dfce708"), desc: showcaseMessage("components.design-system.components-g.alta-idratazione-crunch-cd39b233") },
    { id: "bonci", label: showcaseMessage("components.design-system.components-g.metodo-bonci-20bdaae9"), desc: showcaseMessage("components.design-system.components-g.lunga-maturazione-alveolatura-861d5c63") },
    { id: "detroit", label: showcaseMessage("components.design-system.components-g.detroit-style-597dfcc8"), desc: showcaseMessage("components.design-system.components-g.olio-nella-teglia-bordo-croccante-ea8a4465") },
    { id: "chicago", label: showcaseMessage("components.design-system.components-g.chicago-deep-dish-1124774f"), desc: showcaseMessage("components.design-system.components-g.burro-18-impasto-corto-6396f49a") },
    { id: "pinsa", label: showcaseMessage("components.design-system.components-g.pinsa-romana-f350c3b8"), desc: showcaseMessage("components.design-system.components-g.farine-miste-idratazione-80-fc1d8698") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-g.checkbox-1d66c3d0")}
        description={showcaseMessage("components.design-system.components-g.m3-checkbox-con-checkmark-animato-spring-b-6ff0a4f0")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-g.checkbox-m3-con-3-stati-unchecked-checked--f495e200")}
        principi={[
          showcaseMessage("components.design-system.components-g.3-stati-unchecked-outline-checked-primary--f3cf2e66"),
          showcaseMessage("components.design-system.components-g.spring-stiffness-500-damping-20-per-l-anim-c55bf933"),
          showcaseMessage("components.design-system.components-g.label-supporting-text-per-contesto-aggiunt-7789dd1e"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.specifiche-057caf2f")} />

      {/* Interactive list */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-g.stili-preferiti-interattivo-b955262b")}</span>
        <div className="mt-4 flex flex-col gap-1">
          {ITEMS.map((item) => (
            <Checkbox
              key={item.id}
              checked={checks[item.id]}
              onCheckedChange={() => toggle(item.id)}
              label={item.label}
              description={item.desc}
            />
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-g.indeterminato-per-selezione-parziale-in-un-58c02096"),
          showcaseMessage("components.design-system.components-g.label-sempre-presente-la-checkbox-da-sola--0a7e900e"),
          showcaseMessage("components.design-system.components-g.supporting-text-per-spiegazioni-contestual-c4f7c8d9"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-g.mai-checkbox-per-scelte-mutualmente-esclus-8f354e43"),
          showcaseMessage("components.design-system.components-g.mai-piu-di-7-8-checkbox-in-un-gruppo-spezz-460ee61a"),
          showcaseMessage("components.design-system.components-g.mai-checkbox-senza-label-accessibile-anche-1f04b6c4"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-g.aria-checked-true-false-mixed-per-i-3-stat-d54d8edc") },
        { label: showcaseMessage("components.design-system.components-g.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-g.space-per-togglare-tab-per-navigare-focus--a6eeb025") },
      ]} />

      {/* States grid */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g.stati-111ef337")}</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { state: showcaseMessage("components.design-system.components-g.unchecked-1b927dec"), checked: false, indet: false, disabled: false },
            { state: showcaseMessage("components.design-system.components-g.checked-b2bc0c00"), checked: true, indet: false, disabled: false },
            { state: showcaseMessage("components.design-system.components-g.indeterminate-dc400fa8"), checked: false, indet: true, disabled: false },
            { state: showcaseMessage("components.design-system.components-g.disabled-off-947f8094"), checked: false, indet: false, disabled: true },
            { state: showcaseMessage("components.design-system.components-g.disabled-on-8bd6426d"), checked: true, indet: false, disabled: true },
          ].map((s) => {
            const isActive = s.checked || s.indet;
            return (
              <div key={s.state} className="flex flex-col items-center gap-3">
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center dsx-s-4e1b54ac47"
                  style={{ "--dsx-background": toShowcaseCssValue(isActive ? "var(--primary)" : "rgba(0,0,0,0)", false), "--dsx-border": toShowcaseCssValue(`2px solid ${isActive ? "var(--primary)" : "var(--outline)"}`, false), "--dsx-opacity": toShowcaseCssValue(s.disabled ? 0.38 : 1, true) } as any}
                >
                  {s.checked && <Check size={14} className="dsx-s-f7a9837ba9" />}
                  {s.indet && <Minus size={14} className="dsx-s-f7a9837ba9" />}
                </div>
                <span className="type-label text-center dsx-s-4d3571287d">{s.state}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.container-e6443af9")} val={showcaseMessage("components.design-system.components-g.20-20px-border-2px-radius-4px-radius-xs-un-ed1bca6f")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.icon-716f63b9")} val={showcaseMessage("components.design-system.components-g.check-14px-o-minus-14px-primary-foreground-af41f3e2")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.state-layer-e694236e")} val={showcaseMessage("components.design-system.components-g.hover-8-primary-overlay-press-12-focus-rin-862bcbb9")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.label-74341e3c")} val={showcaseMessage("components.design-system.components-g.dm-sans-0-8125rem-gap-12px-supporting-text-ce6a81c0")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C24 — RADIO BUTTON  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

function RadioButtonSpec() {
  const [selectedOven, setSelectedOven] = useState("home");
  const [selectedYeast, setSelectedYeast] = useState("fresh");

  const OVEN_OPTIONS = [
    { id: "home", label: showcaseMessage("components.design-system.components-g.forno-casalingo-0e26ef26"), desc: showcaseMessage("components.design-system.components-g.elettrico-standard-max-250-c-d8219947") },
    { id: "electric_pro", label: showcaseMessage("components.design-system.components-g.elettrico-professionale-1524a0d1"), desc: showcaseMessage("components.design-system.components-g.fino-a-350-400-c-statico-ventilato-ef49e3bf") },
    { id: "wood", label: showcaseMessage("components.design-system.components-g.forno-a-legna-b299063a"), desc: showcaseMessage("components.design-system.components-g.450-500-c-fiamma-diretta-cottura-60-90s-46532a68") },
    { id: "ooni", label: showcaseMessage("components.design-system.components-g.forno-portatile-ooni-roccbox-3897a75e"), desc: showcaseMessage("components.design-system.components-g.gas-o-legna-400-500-c-compatto-5b3fbb53") },
  ];

  const YEAST_OPTIONS = [
    { id: "fresh", label: showcaseMessage("components.design-system.components-g.lievito-fresco-f3a7cabd") },
    { id: "dry", label: showcaseMessage("components.design-system.components-g.lievito-secco-0043f8c5") },
    { id: "sourdough", label: showcaseMessage("components.design-system.components-g.lievito-madre-180392fb") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-g.radio-button-e26abc17")}
        description={showcaseMessage("components.design-system.components-g.selezione-esclusiva-in-un-gruppo-m3-expres-5e7f5b1d")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-g.radio-button-per-selezione-esclusiva-in-un-395d23c1")}
        principi={[
          showcaseMessage("components.design-system.components-g.selezione-mutualmente-esclusiva-un-solo-ra-c9e9ad76"),
          showcaseMessage("components.design-system.components-g.dot-interno-spring-stiffness-600-damping-1-4d95a61d"),
          showcaseMessage("components.design-system.components-g.verticale-per-opzioni-complesse-con-desc-o-6afe0650"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.specifiche-057caf2f")} />

      {/* Oven group — with descriptions */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-g.tipo-forno-con-descrizione-86b9fb48")}</span>
        <div className="mt-4 flex flex-col gap-1" role="radiogroup" aria-label={showcaseMessage("components.design-system.components-g.tipo-forno-4f5ee654")}>
          {OVEN_OPTIONS.map((opt) => (
            <RadioButton
              key={opt.id}
              checked={selectedOven === opt.id}
              onSelect={() => setSelectedOven(opt.id)}
              label={opt.label}
              description={opt.desc}
            />
          ))}
        </div>
      </div>

      {/* Yeast group — horizontal compact */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-g.tipo-lievito-orizzontale-compatto-c052348c")}</span>
        <div className="mt-4 flex flex-wrap gap-4" role="radiogroup" aria-label={showcaseMessage("components.design-system.components-g.tipo-lievito-059b5838")}>
          {YEAST_OPTIONS.map((opt) => (
            <RadioButton
              key={opt.id}
              checked={selectedYeast === opt.id}
              onSelect={() => setSelectedYeast(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-g.verticale-con-descrizione-per-opzioni-che--cb5a998c"),
          showcaseMessage("components.design-system.components-g.orizzontale-compatto-per-2-4-opzioni-brevi-ddab1917"),
          showcaseMessage("components.design-system.components-g.role-radiogroup-role-radio-aria-checked-pe-d20fdd93"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-g.mai-radio-button-per-selezione-multipla-us-be3816b1"),
          showcaseMessage("components.design-system.components-g.mai-piu-di-6-7-opzioni-considerare-un-drop-e43069d8"),
          showcaseMessage("components.design-system.components-g.mai-pre-selezionare-un-opzione-senza-motiv-68fe4564"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-g.role-radiogroup-sul-container-con-aria-lab-a16bc423") },
        { label: showcaseMessage("components.design-system.components-g.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-g.arrow-keys-per-navigare-nel-gruppo-space-p-999c87e6") },
      ]} />

      {/* States */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g.stati-111ef337")}</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { state: showcaseMessage("components.design-system.components-g.unselected-a86fe6de"), selected: false, disabled: false },
            { state: showcaseMessage("components.design-system.components-g.selected-9a976fc2"), selected: true, disabled: false },
            { state: showcaseMessage("components.design-system.components-g.disabled-off-947f8094"), selected: false, disabled: true },
            { state: showcaseMessage("components.design-system.components-g.disabled-on-8bd6426d"), selected: true, disabled: true },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center dsx-s-2c1522eee3"
                style={{ "--dsx-border": toShowcaseCssValue(`2px solid ${s.selected ? "var(--primary)" : "var(--outline)"}`, false), "--dsx-opacity": toShowcaseCssValue(s.disabled ? 0.38 : 1, true) } as any}
              >
                {s.selected && (
                  <div className="w-2.5 h-2.5 rounded-full dsx-s-0a278ece1c" />
                )}
              </div>
              <span className="type-label text-center dsx-s-4d3571287d">{s.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.outer-circle-ea8d8efb")} val={showcaseMessage("components.design-system.components-g.20-20px-border-2px-radius-full-unselected--3d9f2a8d")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.inner-dot-ff664eda")} val={showcaseMessage("components.design-system.components-g.10-10px-radius-full-primary-spring-stiffne-98a39b38")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.a11y-9126f700")} val={showcaseMessage("components.design-system.components-g.role-radiogroup-sul-container-role-radio-a-76cf6c2d")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.label-74341e3c")} val={showcaseMessage("components.design-system.components-g.identico-a-checkbox-dm-sans-0-8125rem-gap--2c0c065f")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C25 — SELECT / DROPDOWN  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const FLOUR_OPTIONS = [
  { id: "00", label: showcaseMessage("components.design-system.components-g.farina-00-06dc5ab2"), desc: showcaseMessage("components.design-system.components-g.w-200-280-4a360bf4"), group: "Standard" },
  { id: "0", label: showcaseMessage("components.design-system.components-g.farina-0-625e81ec"), desc: showcaseMessage("components.design-system.components-g.w-150-200-b3e4cb7a"), group: "Standard" },
  { id: "tipo1", label: showcaseMessage("components.design-system.components-g.farina-tipo-1-6d1cd41f"), desc: showcaseMessage("components.design-system.components-g.w-180-240-b60bc3fe"), group: "Standard" },
  { id: "manitoba", label: showcaseMessage("components.design-system.components-g.manitoba-c1a38647"), desc: showcaseMessage("components.design-system.components-g.w-350-400-49989c5d"), group: "Forte" },
  { id: "semola", label: showcaseMessage("components.design-system.components-g.semola-rimacinata-8c3476b8"), desc: showcaseMessage("components.design-system.components-g.w-180-220-e1c44afb"), group: "Speciale" },
  { id: "integrale", label: showcaseMessage("components.design-system.components-g.integrale-596f723e"), desc: showcaseMessage("components.design-system.components-g.w-120-180-48fa9e95"), group: "Speciale" },
];

function SelectSpec() {
  const [selected, setSelected] = useState<string | null>("00");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-g.select-dropdown-af16d8d5")}
        description={showcaseMessage("components.design-system.components-g.menu-di-selezione-con-dropdown-animato-m3--2db5a793")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-g.select-con-dropdown-animato-spring-based-i-8eb51705")}
        principi={[
          showcaseMessage("components.design-system.components-g.trigger-outline-variant-primary-border-con-3cc31158"),
          showcaseMessage("components.design-system.components-g.dropdown-spring-stiffness-500-damping-28-s-454880c7"),
          showcaseMessage("components.design-system.components-g.item-5-primary-hover-10-check-per-selected-c698e08a"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.specifiche-057caf2f")} />

      {/* Interactive select */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-g.tipo-farina-interattivo-23803cd7")}</span>
        <div className="mt-4">
          <Select
            options={FLOUR_OPTIONS}
            value={selected}
            onValueChange={setSelected}
            label={showcaseMessage("components.design-system.components-g.tipo-farina-e8f693c9")} className="dsx-s-3948c0f128"
          />
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-g.label-flottante-per-contesto-quando-un-val-ddcf5865"),
          showcaseMessage("components.design-system.components-g.raggruppare-le-opzioni-con-header-es-stand-c366ca25"),
          showcaseMessage("components.design-system.components-g.chiudere-il-dropdown-su-selezione-click-fu-94fffc5d"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-g.mai-dropdown-con-piu-di-15-20-item-senza-r-f41cda3a"),
          showcaseMessage("components.design-system.components-g.mai-placeholder-come-unico-indicatore-usar-c5c00877"),
          showcaseMessage("components.design-system.components-g.mai-dropdown-senza-maxheight-scroll-per-li-857fd657"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-g.role-listbox-sul-menu-role-option-aria-sel-0257f688") },
        { label: showcaseMessage("components.design-system.components-g.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-g.arrow-keys-per-navigare-le-opzioni-enter-p-237edc04") },
        { label: showcaseMessage("components.design-system.components-g.focus-fe7f55b8"), desc: showcaseMessage("components.design-system.components-g.focus-trap-nel-dropdown-quando-aperto-focu-19ef8eea") },
      ]} />

      {/* States */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g.stati-trigger-8b2f6c42")}</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { state: showcaseMessage("components.design-system.components-g.default-808d7dca"), border: "1px solid var(--outline-variant)", shadow: "none" },
            { state: showcaseMessage("components.design-system.components-g.hover-270d13d8"), border: "1px solid var(--outline)", shadow: "none" },
            { state: showcaseMessage("components.design-system.components-g.focused-open-98d375b6"), border: "2px solid var(--primary)", shadow: "var(--shadow-glow)" },
            { state: showcaseMessage("components.design-system.components-g.disabled-f4f4473d"), border: "1px solid var(--outline-variant)", shadow: "none", opacity: 1 },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-2">
              <div
                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between dsx-s-6d828221e7"
                style={{ "--dsx-border": toShowcaseCssValue(s.border, false), "--dsx-box-shadow": toShowcaseCssValue(s.shadow, false), "--dsx-opacity": toShowcaseCssValue((s as any).opacity || 1, true) } as any}
              >
                <span className="dsx-s-344b2142cb">{showcaseMessage("components.design-system.components-g.farina-00-06dc5ab2")}</span>
                <ChevronDown size={14} className="dsx-s-63782726c0" />
              </div>
              <span className="type-label text-center dsx-s-4d3571287d">{s.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.trigger-d3f06a58")} val={showcaseMessage("components.design-system.components-g.surface-container-bg-outline-variant-borde-7d83f234")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.dropdown-fc2d12b9")} val={showcaseMessage("components.design-system.components-g.surface-container-bg-shadow-lg-rounded-xl--69b5051a")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.item-ecdda59a")} val={showcaseMessage("components.design-system.components-g.px-4-py-2-5-hover-5-primary-overlay-select-54ae566e")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g.label-flottante-9ff2be33")} val={showcaseMessage("components.design-system.components-g.dm-sans-0-625rem-primary-above-value-appar-620370d9")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   (Tooltip, Dialog, IconButton moved to components-g2.tsx)
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "checkbox", label: showcaseMessage("components.design-system.components-g.checkbox-1d66c3d0"), group: "c", Component: CheckboxSpec },
  { id: "radio", label: showcaseMessage("components.design-system.components-g.radio-button-e26abc17"), group: "c", Component: RadioButtonSpec },
  { id: "select", label: showcaseMessage("components.design-system.components-g.select-dropdown-af16d8d5"), group: "c", Component: SelectSpec },
];
