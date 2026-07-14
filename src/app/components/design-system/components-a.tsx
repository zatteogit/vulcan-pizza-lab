import { ArrowRight,Flame,Lightbulb,Moon,Star,Sun,Timer } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ImageWithFallback } from "../media/ImageWithFallback";
import type { SectionEntry } from "./shared";
import { AccessibilitaInfo,LineeGuida,Panoramica,SectionHeader,SubSectionLabel } from "./shared";
import { CtaButton, Badge, StepHeader, Chip, Surface, Slider } from "../ds/index";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══ C01: BUTTONS ═══ */
function ButtonsSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-a.bottoni-1471b07f")} description={showcaseMessage("components.design-system.components-a.4-varianti-x-3-taglie-active-scale-95-hove-3880ba75")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-a.i-bottoni-di-vulcan-seguono-4-varianti-ger-f6edb844")}
        principi={[
          showcaseMessage("components.design-system.components-a.primary-per-l-azione-principale-di-ogni-sc-0eae1581"),
          showcaseMessage("components.design-system.components-a.active-scale-95-per-feedback-tattile-immed-cf3dd6ae"),
          showcaseMessage("components.design-system.components-a.hover-con-css-transition-non-motion-per-pe-aa98b48a"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-a.container-e6443af9"), desc: showcaseMessage("components.design-system.components-a.rounded-xl-padding-px-5-py-2-5-35db3d23") },
          { parte: showcaseMessage("components.design-system.components-a.label-74341e3c"), desc: showcaseMessage("components.design-system.components-a.dm-sans-font-size-lg-weight-semibold-abec868b") },
          { parte: showcaseMessage("components.design-system.components-a.state-layer-e694236e"), desc: showcaseMessage("components.design-system.components-a.8-hover-12-press-via-css-transition-6b0e7871") },
          { parte: showcaseMessage("components.design-system.components-a.focus-ring-f71d645b"), desc: showcaseMessage("components.design-system.components-a.3px-primary-offset-2px-5d49a610") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.varianti-f0488d71")}</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CtaButton variant="primary" radius="xl" className="px-5 py-2.5">{showcaseMessage("components.design-system.components-a.primary-a9a96ec0")}</CtaButton>
          <CtaButton variant="secondary" radius="xl" className="px-5 py-2.5">{showcaseMessage("components.design-system.components-a.secondary-025de599")}</CtaButton>
          <CtaButton variant="secondary" radius="xl" className="px-5 py-2.5 dsx-s-4c4ffac3ab">{showcaseMessage("components.design-system.components-a.ghost-bf44c985")}</CtaButton>
          <CtaButton variant="primary" radius="xl" className="px-5 py-2.5 dsx-s-573083fa24">{showcaseMessage("components.design-system.components-a.destructive-f58c8364")}</CtaButton>
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-a.un-solo-primary-visibile-per-schermata-ger-cb461f96"),
          showcaseMessage("components.design-system.components-a.active-scale-95-su-tutti-i-bottoni-per-fee-b53bfe36"),
          showcaseMessage("components.design-system.components-a.hover-con-css-transition-per-performance-n-65932737"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-a.mai-due-bottoni-primary-affiancati-usare-p-8448a749"),
          showcaseMessage("components.design-system.components-a.mai-rimuovere-il-feedback-tattile-scale-pe-d74beb92"),
          showcaseMessage("components.design-system.components-a.mai-usare-whilehover-di-motion-per-i-botto-0c493ea1"),
        ]}
        responsive={showcaseMessage("components.design-system.components-a.su-mobile-i-bottoni-diventano-full-width-w-192c760b")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-a.focus-ring-f71d645b"), desc: showcaseMessage("components.design-system.components-a.3px-solid-var-primary-offset-2px-visibile--7c9b5de3") },
        { label: showcaseMessage("components.design-system.components-a.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.components-a.wcag-aaa-per-primary-e-destructive-aa-per--7be9e634") },
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-a.aria-disabled-su-bottoni-disabilitati-aria-b32ded23") },
      ]} />
    </div>
  );
}

/* ═══ C02: BADGES ═══ */
function BadgesSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-a.badge-inlinetip-b0887721")} description={showcaseMessage("components.design-system.components-a.badge-tier-data-badge-dm-mono-nerd-only-in-91edf4f9")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-a.tre-tipi-di-badge-tier-badge-per-classific-b7a16ce4")}
        principi={[
          showcaseMessage("components.design-system.components-a.tier-badge-dot-colorato-label-il-colore-co-f0687fae"),
          showcaseMessage("components.design-system.components-a.data-badge-dm-mono-con-tabular-nums-riserv-a1a50bcf"),
          showcaseMessage("components.design-system.components-a.inlinetip-background-ambra-soft-lightbulb--c6257aef"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-a.tier-dot-22db62b5"), desc: showcaseMessage("components.design-system.components-a.w-2-h-2-rounded-full-colore-semantico-5df38f00") },
          { parte: showcaseMessage("components.design-system.components-a.data-badge-6834728b"), desc: showcaseMessage("components.design-system.components-a.dm-mono-nerd-only-font-size-base-primary-s-0afd92bb") },
          { parte: showcaseMessage("components.design-system.components-a.inlinetip-6f3b27ab"), desc: showcaseMessage("components.design-system.components-a.lightbulb-16px-testo-dm-sans-su-tertiary-8-e4bcaa5c") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.tier-badge-2b546205")}</span>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { l: "Perfect Match", c: "var(--cta)", t: "cta" },
            { l: "Buona Scelta", c: "var(--tertiary)", t: "tertiary" },
            { l: "Challenging", c: "var(--secondary)", t: "secondary" },
          ].map(b => (
            <Badge key={b.l} tone={b.t as any} color={b.c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(b.c, false) } as any} />
              {b.l}
            </Badge>
          ))}
        </div>
      </Surface>
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.data-badge-85ed437d")}</span>
        <div className="mt-4 flex flex-wrap gap-2">
          {["W 280","H 65%","24h","250\u00b0C","P/L 0.58"].map(l => (
            <Badge key={l} tone="primary" className="dsx-s-8c3793ebbf">{l}</Badge>
          ))}
        </div>
      </Surface>
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.inlinetip-6f3b27ab")}</span>
        <div className="mt-4 flex gap-3 p-3 rounded-xl dsx-s-94c1c4ebb0">
          <Lightbulb size={16} className="dsx-s-57204f114b" />
          <p className="dsx-s-893b2f3e81">
            <span className="dsx-s-9aa8a919f2">{showcaseMessage("components.design-system.components-a.suggerimento-906be0f7")}</span> {showcaseMessage("components.design-system.components-a.con-65-di-idratazione-e-w280-la-napoletana-11b62b15")}</p>
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-a.tier-badge-usare-solo-i-3-livelli-standard-33d21368"),
          showcaseMessage("components.design-system.components-a.data-badge-sempre-dm-mono-con-tabular-nums-816f2bfc"),
          showcaseMessage("components.design-system.components-a.inlinetip-breve-e-contestuale-massimo-2-ri-0643a194"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-a.mai-inventare-nuovi-tier-i-3-livelli-copro-e3b8543c"),
          showcaseMessage("components.design-system.components-a.mai-usare-dm-sans-per-valori-numerici-nei--b7fbde2d"),
          showcaseMessage("components.design-system.components-a.mai-inlinetip-senza-icona-lightbulb-e-il-p-83e231b4"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-a.colore-testo-30eff303"), desc: showcaseMessage("components.design-system.components-a.i-tier-badge-usano-colore-testo-mai-solo-c-b8ec66a2") },
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-a.inlinetip-usa-role-note-per-screen-reader--ecb68ec4") },
      ]} />
    </div>
  );
}

/* ═══ C03: STEPHEADER ═══ */
function StepHeaderSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-a.stepheader-678aa1f3")} description={showcaseMessage("components.design-system.components-a.titolone-editoriale-dm-sans-step-number-pl-b37f494a")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-a.il-stepheader-e-il-titolone-editoriale-che-83aef465")}
        principi={[
          showcaseMessage("components.design-system.components-a.ingresso-animato-con-whileinview-once-true-34e3e36b"),
          showcaseMessage("components.design-system.components-a.step-number-dm-sans-type-step-num-terracot-fe543480"),
          showcaseMessage("components.design-system.components-a.titolo-playfair-display-con-clamp-responsi-608b16a4"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-a.step-num-4ef97793"), desc: showcaseMessage("components.design-system.components-a.dm-sans-type-step-num-0-6875rem-uppercase--51fd0f4b") },
          { parte: showcaseMessage("components.design-system.components-a.title-768e0c1c"), desc: showcaseMessage("components.design-system.components-a.playfair-display-clamp-1-5rem-4vw-2-5rem-b-a6e35c0c") },
          { parte: showcaseMessage("components.design-system.components-a.subtitle-e159d05a"), desc: showcaseMessage("components.design-system.components-a.playfair-display-italic-1rem-muted-opacity-222f2960") },
          { parte: showcaseMessage("components.design-system.components-a.divider-912fc145"), desc: showcaseMessage("components.design-system.components-a.2rem-wide-2px-height-primary-opacity-0-35-f02e9dc9") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <div className="flex flex-col gap-8">
          {[
            { num: "01", cat: "Contesto", title: showcaseMessage("components.design-system.components-a.quando-e-dove-34977dd3"), sub: "Tempo, luogo, stagione" },
            { num: "02", cat: "Setup", title: showcaseMessage("components.design-system.components-a.cosa-hai-a-disposizione-17034004"), sub: "Attrezzatura, dispensa, esperienza" },
            { num: "03", cat: "Stili", title: showcaseMessage("components.design-system.components-a.scopri-il-tuo-stile-6ffc22fe"), sub: "Le ricette che fanno per te" },
          ].map(s => (
            <StepHeader key={s.num} num={s.num} category={s.cat} title={s.title} subtitle={s.sub} />
          ))}
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-a.usare-whileinview-con-once-true-per-l-anim-44b879ca"),
          showcaseMessage("components.design-system.components-a.step-number-sempre-con-dm-sans-uppercase-t-0e7d3b64"),
          showcaseMessage("components.design-system.components-a.titolo-con-clamp-per-responsive-naturale-s-cd574ebb"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-a.mai-piu-di-3-stepheader-in-una-pagina-il-f-334f856b"),
          showcaseMessage("components.design-system.components-a.mai-omettere-la-linea-decorativa-e-la-firm-f5d7db2b"),
          showcaseMessage("components.design-system.components-a.mai-usare-dm-sans-per-il-titolo-playfair-d-dcb754a8"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-a.heading-a3089b7f"), desc: showcaseMessage("components.design-system.components-a.il-titolo-e-un-h2-semantico-il-sottotitolo-f8363ca6") },
        { label: showcaseMessage("components.design-system.components-a.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.components-a.con-prefers-reduced-motion-l-animazione-d--dc1e71ca") },
      ]} />
    </div>
  );
}

/* ═══ C04: CHIPS ═══ */
const CHIPS = [
  { id: "tonight", label: showcaseMessage("components.design-system.components-a.stasera-4581c567"), icon: Moon },
  { id: "lunch", label: showcaseMessage("components.design-system.components-a.domani-pranzo-7787d159"), icon: Sun },
  { id: "dinner", label: showcaseMessage("components.design-system.components-a.domani-cena-913a7002"), icon: Flame },
  { id: "dayafter", label: showcaseMessage("components.design-system.components-a.dopodomani-2458b1b4"), icon: Timer },
  { id: "weekend", label: showcaseMessage("components.design-system.components-a.weekend-0a4171b1"), icon: Star },
];
function ChipsSpec() {
  const [sel, setSel] = useState<Set<string>>(new Set(["tonight"]));
  const toggle = (id: string) => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-a.unifiedchip-df6f2cb6")} description={showcaseMessage("components.design-system.components-a.toggle-chip-con-check-animato-attivo-prima-cdda79bf")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-a.il-chip-e-l-unita-di-selezione-principale--27f5f4ca")}
        principi={[
          showcaseMessage("components.design-system.components-a.inattivo-surface-container-bg-outline-vari-902e275a"),
          showcaseMessage("components.design-system.components-a.attivo-primary-bg-con-check-icon-che-scala-5056b60e"),
          showcaseMessage("components.design-system.components-a.transizioni-colore-via-css-transition-back-808bd8bd"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-a.container-e6443af9"), desc: showcaseMessage("components.design-system.components-a.rounded-xl-px-4-py-2-5-border-1px-aa951cb5") },
          { parte: showcaseMessage("components.design-system.components-a.icon-716f63b9"), desc: showcaseMessage("components.design-system.components-a.16px-animatepresence-swap-check-icon-020d7031") },
          { parte: showcaseMessage("components.design-system.components-a.label-74341e3c"), desc: showcaseMessage("components.design-system.components-a.dm-sans-font-size-lg-weight-medium-8197dec0") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.quando-prepari-c573d5f2")}</span>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {CHIPS.map(c => {
            const a = sel.has(c.id); const I = c.icon;
            return (
              <Chip key={c.id} label={c.label} active={a} onToggle={() => toggle(c.id)} icon={<I size={14} />} />
            );
          })}
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-a.usare-animatepresence-mode-wait-per-swap-i-4f3a1475"),
          showcaseMessage("components.design-system.components-a.active-scale-95-per-feedback-tattile-su-cl-822855c4"),
          showcaseMessage("components.design-system.components-a.colori-transizionati-via-css-transition-no-3b38c3f4"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-a.mai-piu-di-7-chip-in-una-riga-wrappare-con-d9784bde"),
          showcaseMessage("components.design-system.components-a.mai-usare-whiletap-di-motion-usare-active--b72aa1ee"),
          showcaseMessage("components.design-system.components-a.mai-omettere-l-icona-il-chip-senza-icona-p-84686392"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-a.role-checkbox-con-aria-checked-per-toggle--8f4ac922") },
        { label: showcaseMessage("components.design-system.components-a.focus-fe7f55b8"), desc: showcaseMessage("components.design-system.components-a.focus-ring-3px-primary-su-focus-visible-na-574c5fa0") },
      ]} />
    </div>
  );
}

/* ═══ C05: CARDS ═══ */
const CARD_V = [
  { v: "Flat", bg: "var(--surface-container-low)", hs: "var(--shadow-sm)", c: "var(--primary)", d: "Card standard. Hover aggiunge shadow." },
  { v: "Elevated", bg: "var(--surface-container-low)", s: "var(--shadow-md)", hs: "var(--shadow-lg)", c: "var(--tertiary)", d: "Card elevata. Hover intensifica ombra." },
  { v: "Filled", bg: "var(--surface-container)", c: "var(--cta)", d: "Card riempita. Background piu denso." },
];
function CardsSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-a.card-container-a6c489fb")} description={showcaseMessage("components.design-system.components-a.3-varianti-base-media-card-con-foto-hover--79a8c7a6")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-a.le-card-sono-i-container-principali-per-ra-0f0dca47")}
        principi={[
          showcaseMessage("components.design-system.components-a.radius-rounded-2xl-1rem-per-tutte-le-varia-ea9151aa"),
          showcaseMessage("components.design-system.components-a.border-1px-solid-outline-variant-sempre-pr-34821438"),
          showcaseMessage("components.design-system.components-a.hover-whilehover-con-y-2-e-shadow-upgrade--500dfd0b"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-a.container-e6443af9"), desc: showcaseMessage("components.design-system.components-a.rounded-2xl-1px-outline-variant-border-d885b673") },
          { parte: showcaseMessage("components.design-system.components-a.padding-9c47ca55"), desc: showcaseMessage("components.design-system.components-a.p-4-standard-p-5-per-content-heavy-ad8c8152") },
          { parte: showcaseMessage("components.design-system.components-a.media-slot-cbf5c80b"), desc: showcaseMessage("components.design-system.components-a.aspect-ratio-16-9-object-fit-cover-overflo-4a961932") },
          { parte: showcaseMessage("components.design-system.components-a.badge-6d12c8ad"), desc: showcaseMessage("components.design-system.components-a.absolute-top-3-left-3-glassmorphism-backgr-f53b3a36") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.varianti-base-d8d78cf1")}</span>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CARD_V.map(c => (
            <div key={c.v} className="flex flex-col gap-2">
              <span className="type-label dsx-s-3c487ee146" style={{ "--dsx-color": toShowcaseCssValue(c.c, false) } as any}>{c.v}</span>
              <Surface variant="card" className="p-4 rounded-2xl cursor-pointer active:scale-98 transition-all hover:-translate-y-0.5 hover:shadow-md dsx-s-c4ed0d9205" style={{ "--dsx-background": toShowcaseCssValue(c.bg, false), "--dsx-box-shadow": toShowcaseCssValue(c.s || "none", false) } as any}>
                <p className="dsx-s-7d00437ab2">{c.d}</p>
              </Surface>
            </div>
          ))}
        </div>
      </Surface>
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.media-card-a053d1c2")}</span>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { t: "Napoletana STG", s: "AVPN", b: "Forno legna 450\u00b0C, 60-90s.", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZWFwb2xpdGFuJTIwcGl6emElMjBtYXJnaGVyaXRhJTIwd29vZCUyMGZpcmV8ZW58MXx8fHwxNzcxMjMwNTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral", badge: "W 250\u2013320", bc: "var(--primary)" },
            { t: "Lunga Maturazione", s: "72h frigo", b: "Fermentazione 4\u00b0C, alveolatura aperta.", img: "https://images.unsplash.com/photo-1738717201744-9faf699eea3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwZmVybWVudGF0aW9uJTIwc291cmRvdWdofGVufDF8fHx8MTc3MTIzMDU0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral", badge: "72h frigo", bc: "var(--cta)" },
          ].map(c => (
            <motion.div key={c.t} className="rounded-2xl overflow-hidden cursor-pointer active:scale-98 dsx-s-bb3e77c269" whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }} transition={showcaseTransition.preset_0e2957ab5e}>
              <div className="relative dsx-s-4bffb10407">
                <ImageWithFallback src={c.img} alt={c.t} className="w-full h-full dsx-s-bcc9535a4c" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg dsx-s-247dc85ef7" style={{ "--dsx-color": toShowcaseCssValue(c.bc, false), "--dsx-border": toShowcaseCssValue(`1px solid color-mix(in srgb,${c.bc} 30%,transparent)`, false) } as any}>{c.badge}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="dsx-s-55a675dcea">{c.t}</span>
                  <span className="dsx-s-81188e61fd">{c.s}</span>
                </div>
                <p className="dsx-s-88047117f0">{c.b}</p>
                <div className="flex items-center gap-1 mt-1 dsx-s-b0e08465c2">
                  <span className="dsx-s-0b6720c747">{showcaseMessage("components.design-system.components-a.configura-e4c15bac")}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-a.sempre-border-1px-outline-variant-anche-su-c63edd1d"),
          showcaseMessage("components.design-system.components-a.hover-con-spring-stiffness-400-damping-25--5043a2be"),
          showcaseMessage("components.design-system.components-a.media-card-immagine-con-aspect-ratio-16-9--b222f810"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-a.mai-box-shadow-senza-border-l-ombra-da-sol-1785ec8f"),
          showcaseMessage("components.design-system.components-a.mai-card-senza-padding-minimo-p-4-e30c7ae6"),
          showcaseMessage("components.design-system.components-a.mai-nesting-card-dentro-card-usare-section-5e5ce83e"),
        ]}
        responsive={showcaseMessage("components.design-system.components-a.su-mobile-le-card-media-diventano-full-wid-64555bef")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-a.interattiva-f0654dc8"), desc: showcaseMessage("components.design-system.components-a.card-cliccabili-role-button-o-a-semantico--12151f64") },
        { label: showcaseMessage("components.design-system.components-a.immagini-37c56c75"), desc: showcaseMessage("components.design-system.components-a.alt-text-descrittivo-su-tutte-le-immagini--d576ec63") },
        { label: showcaseMessage("components.design-system.components-a.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.components-a.testo-su-surface-container-low-ratio-minim-6e0494aa") },
      ]} />
    </div>
  );
}

/* ═══ C06: INPUTS ═══ */
const SL = [
  { l: "Idratazione", min: 45, max: 100, u: "%" },
  { l: "Farina W", min: 150, max: 400, u: "" },
  { l: "Fermentazione", min: 2, max: 72, u: "h" },
];
function InputsSpec() {
  const [sv, setSv] = useState<Record<string, number>>({ Idratazione: 65, "Farina W": 280, Fermentazione: 24 });
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-a.input-slider-38981e90")} description={showcaseMessage("components.design-system.components-a.slider-trascinabili-con-accent-primario-e--0407e07a")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-a.gli-slider-sono-il-controllo-fine-tuning-p-c51945c4")}
        principi={[
          showcaseMessage("components.design-system.components-a.track-h-1-5-surface-container-high-bg-roun-dde4d5ed"),
          showcaseMessage("components.design-system.components-a.fill-primary-color-larghezza-proporzionale-687b36dc"),
          showcaseMessage("components.design-system.components-a.label-dm-mono-con-tabular-nums-e-fontfeatu-a59b56dc"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-a.track-b1c5a7af"), desc: showcaseMessage("components.design-system.components-a.h-1-5-rounded-full-surface-container-high-1eca4f11") },
          { parte: showcaseMessage("components.design-system.components-a.fill-7adb6736"), desc: showcaseMessage("components.design-system.components-a.sovrapposizione-h-1-5-primary-color-width-836a9a5d") },
          { parte: showcaseMessage("components.design-system.components-a.thumb-55751877"), desc: showcaseMessage("components.design-system.components-a.w-4-h-4-rounded-full-primary-shadow-sm-0fdf5ebd") },
          { parte: showcaseMessage("components.design-system.components-a.value-label-df0ed4ed"), desc: showcaseMessage("components.design-system.components-a.dm-mono-font-size-xl-bold-primary-tnum-9a496390") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-a.slider-aa5db7d8")}</span>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SL.map(s => {
            const v = sv[s.l];
            return (
              <Slider
                key={s.l}
                label={s.l}
                min={s.min}
                max={s.max}
                value={v}
                unit={s.u}
                onValueChange={val => setSv(prev => ({ ...prev, [s.l]: val }))}
              />
            );
          })}
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-a.mostrare-sempre-il-valore-numerico-corrent-5da69794"),
          showcaseMessage("components.design-system.components-a.usare-tabular-nums-per-evitare-jump-del-la-cecb37b2"),
          showcaseMessage("components.design-system.components-a.range-min-max-coerenti-con-i-parametri-del-58d49cf6"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-a.mai-slider-senza-label-testuale-il-valore--5b06e37d"),
          showcaseMessage("components.design-system.components-a.mai-rimuovere-il-thumb-visuale-l-input-nat-7525f2a9"),
          showcaseMessage("components.design-system.components-a.mai-step-discreti-non-multipli-usare-step--14377834"),
        ]}
        comportamento={showcaseMessage("components.design-system.components-a.il-drag-aggiorna-il-valore-in-real-time-il-7978ab1d")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-a.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-a.input-nativo-bebffdc9"), desc: showcaseMessage("components.design-system.components-a.input-type-range-sotto-il-custom-visual-sc-0a1e7f86") },
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-a.aria-label-con-nome-parametro-unita-aria-v-75756b33") },
        { label: showcaseMessage("components.design-system.components-a.touch-target-dc7bb62b"), desc: showcaseMessage("components.design-system.components-a.area-di-hit-minima-44x44px-per-wcag-2-5-5--11ab2e17") },
      ]} />
    </div>
  );
}

/* ═══ ENTRIES ═══ */
export const ENTRIES: SectionEntry[] = [
  { id: "buttons", label: showcaseMessage("components.design-system.components-a.bottoni-1471b07f"), group: "c", Component: ButtonsSpec },
  { id: "badges", label: showcaseMessage("components.design-system.components-a.badge-inlinetip-b0887721"), group: "c", Component: BadgesSpec },
  { id: "stepheader", label: showcaseMessage("components.design-system.components-a.stepheader-678aa1f3"), group: "c", Component: StepHeaderSpec },
  { id: "chips", label: showcaseMessage("components.design-system.components-a.unifiedchip-df6f2cb6"), group: "c", Component: ChipsSpec },
  { id: "cards", label: showcaseMessage("components.design-system.components-a.card-container-a6c489fb"), group: "c", Component: CardsSpec },
  { id: "inputs", label: showcaseMessage("components.design-system.components-a.input-slider-38981e90"), group: "c", Component: InputsSpec },
];