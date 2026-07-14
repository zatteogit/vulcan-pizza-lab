import {
ArrowRight,
Check,
ChevronDown,
Flame,
HelpCircle,
Lightbulb,
Moon,
Palette,
RotateCcw,
SlidersHorizontal,
Sparkles,
Sun,
X,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useState } from "react";
import type { SectionEntry } from "./shared";
import {
AccessibilitaInfo,
AnatomyRow,
LineeGuida,
Panoramica,
SectionHeader,
SectionTabs,
SubSectionLabel,
} from "./shared";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";
import { CtaButton, IconButton } from "../ds/index";

/* ═══════════════════════════════════════════════════════════
   P01 — SELECTION PATTERN
   Chip & Card selection across the entire build flow.
   ═══════════════════════════════════════════════════════════ */

function SelectionPatternSpec() {
  const [selectedChip, setSelectedChip] = useState<string | null>("b");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const chips = [
    { id: "a", label: showcaseMessage("components.design-system.patterns-templates.stasera-4581c567"), icon: Moon },
    { id: "b", label: showcaseMessage("components.design-system.patterns-templates.domani-pranzo-7787d159"), icon: Sun },
    { id: "c", label: showcaseMessage("components.design-system.patterns-templates.weekend-0a4171b1"), icon: Flame },
  ];

  const cards = [
    { id: "nap", label: showcaseMessage("components.design-system.patterns-templates.napoletana-stg-fc9d3868"), score: 92, tier: "perfect" as const },
    { id: "rom", label: showcaseMessage("components.design-system.patterns-templates.teglia-romana-3dfce708"), score: 78, tier: "good" as const },
    { id: "det", label: showcaseMessage("components.design-system.patterns-templates.detroit-style-597dfcc8"), score: 54, tier: "challenging" as const },
  ];

  const tierColors: Record<string, { bg: string; border: string; text: string }> = {
    perfect: {
      bg: "color-mix(in srgb, var(--cta) 10%, transparent)",
      border: "color-mix(in srgb, var(--cta) 30%, transparent)",
      text: "var(--cta)",
    },
    good: {
      bg: "color-mix(in srgb, var(--tertiary) 10%, transparent)",
      border: "color-mix(in srgb, var(--tertiary) 30%, transparent)",
      text: "var(--tertiary)",
    },
    challenging: {
      bg: "color-mix(in srgb, var(--primary) 10%, transparent)",
      border: "color-mix(in srgb, var(--primary) 30%, transparent)",
      text: "var(--primary)",
    },
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.selection-pattern-55446e4b")}
        description={showcaseMessage("components.design-system.patterns-templates.il-pattern-universale-per-le-scelte-dell-u-857e46bb")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.chip-selection-64919c6c")} />

                {/* Chip demo */}
                <div
                  className="p-6 rounded-2xl dsx-s-bb3e77c269"
                >
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const isActive = selectedChip === chip.id;
                      const Icon = chip.icon;
                      return (
                        <motion.button
                          key={chip.id}
                          onClick={() => setSelectedChip(chip.id)}
                          className="flex items-center gap-2 rounded-xl cursor-pointer active:scale-95 dsx-s-5120bb4b70"
                          style={{ "--dsx-background": toShowcaseCssValue(isActive
                                                                                      ? "var(--primary)"
                                                                                      : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(isActive
                                                                                      ? "1px solid var(--primary)"
                                                                                      : "1px solid var(--outline-variant)", false), "--dsx-color": toShowcaseCssValue(isActive
                                                                                      ? "var(--primary-foreground)"
                                                                                      : "var(--text-default)", false) } as any}
                          aria-pressed={isActive}
                        >
                          <AnimatePresence mode="wait">
                            {isActive ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={showcaseTransition.preset_ee3522ac33}
                              >
                                <Check size={14} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="icon"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                              >
                                <Icon size={14} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {chip.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p
                    className="mt-4 dsx-s-77aff18b42"
                  >
                    {showcaseMessage("components.design-system.patterns-templates.flusso-presente-opzioni-utente-seleziona-c-cceb845f")}</p>
                </div>

                {/* Anatomy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.inattivo-8d27ee29")} val={showcaseMessage("components.design-system.patterns-templates.surface-container-bg-outline-variant-borde-fb5ce2ca")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.attivo-b2bba8d5")} val={showcaseMessage("components.design-system.patterns-templates.primary-bg-primary-foreground-text-animate-87d01bc9")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.radius-e5aaeaac")} val={showcaseMessage("components.design-system.patterns-templates.rounded-xl-0-75rem-9d296ad2")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.padding-9c47ca55")} val={showcaseMessage("components.design-system.patterns-templates.px-4-py-2-5-chip-gap-2-icon-label-b83064e6")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.feedback-c8d7677e")} val={showcaseMessage("components.design-system.patterns-templates.active-scale-95-spring-stiffness-500-dampi-7215bf1b")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.a11y-9126f700")} val={showcaseMessage("components.design-system.patterns-templates.aria-pressed-role-implicito-button-43fd642d")} />
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.card-selection-a39b2b13")} />

                {/* Card demo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cards.map((card) => {
                    const isActive = selectedCard === card.id;
                    const tc = tierColors[card.tier];
                    return (
                      <motion.button
                        key={card.id}
                        onClick={() => setSelectedCard(card.id)}
                        className="relative p-4 rounded-2xl text-left cursor-pointer active:scale-97 dsx-s-1e591d85f2"
                        style={{ "--dsx-background": toShowcaseCssValue(isActive
                                                                                ? tc.bg
                                                                                : "var(--surface-container-low)", false), "--dsx-border": toShowcaseCssValue(isActive
                                                                                ? `2px solid ${tc.text}`
                                                                                : "1px solid var(--outline-variant)", false) } as any}
                        aria-pressed={isActive}
                      >
                        {/* Score badge */}
                        <div
                          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center dsx-s-08c5fe74f8"
                          style={{ "--dsx-background": toShowcaseCssValue(tc.bg, false), "--dsx-border": toShowcaseCssValue(`2px solid ${tc.text}`, false) } as any}
                        >
                          <span
                            className="type-data dsx-s-cf9b9195b1"
                            style={{ "--dsx-color": toShowcaseCssValue(tc.text, false) } as any}
                          >
                            {card.score}
                          </span>
                        </div>

                        <span className="dsx-s-4fac5275aa"
                        >
                          {card.label}
                        </span>
                        <div className="mt-2">
                          <span
                            className="type-mono-label dsx-s-3c487ee146"
                            style={{ "--dsx-color": toShowcaseCssValue(tc.text, false) } as any}
                          >
                            {card.tier}
                          </span>
                        </div>

                        {/* Selection check */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={showcaseTransition.preset_ee3522ac33}
                              className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center dsx-s-fbecfa7efd"
                              style={{ "--dsx-background": toShowcaseCssValue(tc.text, false) } as any}
                            >
                              <Check
                                size={12} className="dsx-s-b52c90fb9d"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.tier-visual-8e558a87")} val={showcaseMessage("components.design-system.patterns-templates.perfect-cta-good-tertiary-challenging-prim-7eacd259")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.score-ring-5c741433")} val={showcaseMessage("components.design-system.patterns-templates.angolo-top-right-scorering-importato-da-sc-66d75e57")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.border-attivo-83858a91")} val={showcaseMessage("components.design-system.patterns-templates.2px-solid-tier-color-bg-tier-color-10-18588828")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.conferma-8d25542a")} val={showcaseMessage("components.design-system.patterns-templates.check-animato-spring-500-25-bottom-right-4817c1e7")} />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-selection-pattern-gestisce-tutte-le-sce-f084f3f8")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.un-solo-elemento-attivo-per-gruppo-single--9faca06a"),
                  showcaseMessage("components.design-system.patterns-templates.il-colore-di-selezione-riflette-il-contest-5b613a0c"),
                  showcaseMessage("components.design-system.patterns-templates.feedback-tattile-immediato-active-scale-95-46d0462a"),
                  showcaseMessage("components.design-system.patterns-templates.l-icona-si-swap-anima-icon-check-con-sprin-faafe525"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.ogni-volta-che-l-utente-deve-scegliere-tra-a023011f")}
                anatomia={[
                  { parte: showcaseMessage("components.design-system.patterns-templates.container-e6443af9"), desc: showcaseMessage("components.design-system.patterns-templates.surface-container-bg-outline-variant-borde-91f58baf") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.label-74341e3c"), desc: showcaseMessage("components.design-system.patterns-templates.dm-sans-font-size-lg-8a336352") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.icon-slot-ce507698"), desc: showcaseMessage("components.design-system.patterns-templates.animatepresence-mode-wait-per-swap-icon-ch-e311c543") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.score-badge-94378e03"), desc: showcaseMessage("components.design-system.patterns-templates.solo-nelle-card-posizione-absolute-top-rig-b7734819") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.confirmation-3424edc2"), desc: showcaseMessage("components.design-system.patterns-templates.check-icon-animata-spring-stiffness-500-b95d69b1") },
                ]}
              />
            ),
          },
          {
            id: "linee-guida",
            label: showcaseMessage("components.design-system.patterns-templates.linee-guida-b43417d1"),
            content: (
              <LineeGuida
                fai={[
                  showcaseMessage("components.design-system.patterns-templates.usare-aria-pressed-per-comunicare-lo-stato-4ae47625"),
                  showcaseMessage("components.design-system.patterns-templates.animare-l-icona-con-animatepresence-mode-w-d8d92943"),
                  showcaseMessage("components.design-system.patterns-templates.mantenere-il-check-come-conferma-visiva-pr-e6d258db"),
                  showcaseMessage("components.design-system.patterns-templates.usare-tier-color-coerente-tra-badge-border-13186454"),
                ]}
                nonFare={[
                  showcaseMessage("components.design-system.patterns-templates.mai-multi-select-senza-indicazione-chiara--c9ac2dd5"),
                  showcaseMessage("components.design-system.patterns-templates.mai-usare-solo-colore-come-indicatore-il-c-60c36582"),
                  showcaseMessage("components.design-system.patterns-templates.mai-omettere-il-feedback-tattile-active-sc-3b19b82a"),
                  showcaseMessage("components.design-system.patterns-templates.mai-animare-con-duration-ease-sempre-sprin-dfc1b458"),
                ]}
                responsive={showcaseMessage("components.design-system.patterns-templates.chip-flex-wrap-su-mobile-scroll-orizzontal-451ffb0d")}
              />
            ),
          },
          {
            id: "a11y",
            label: showcaseMessage("components.design-system.patterns-templates.accessibilita-48c069b7"),
            content: (
              <AccessibilitaInfo
                items={[
                  { label: showcaseMessage("components.design-system.patterns-templates.aria-pressed-3e1dce4b"), desc: showcaseMessage("components.design-system.patterns-templates.true-false-su-ogni-chip-card-per-comunicar-c3601150") },
                  { label: showcaseMessage("components.design-system.patterns-templates.focus-visible-ce59c0b0"), desc: showcaseMessage("components.design-system.patterns-templates.outline-ring-su-focus-visible-per-navigazi-66a6bac3") },
                  { label: showcaseMessage("components.design-system.patterns-templates.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.patterns-templates.check-icon-su-bg-primario-minimo-4-5-1-per-bd624dd5") },
                  { label: showcaseMessage("components.design-system.patterns-templates.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.patterns-templates.spring-animation-si-degrada-a-instant-swit-77439bc7") },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P02 — EDITORIAL SECTION PATTERN
   StepHeader + ScrollSection + content flow.
   ═══════════════════════════════════════════════════════════ */

function EditorialSectionSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.editorial-section-426f2b6e")}
        description={showcaseMessage("components.design-system.patterns-templates.il-pattern-scrollytelling-che-da-ritmo-nar-80a7faca")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                {/* Live mini-demo */}
                <div
                  className="p-6 rounded-2xl overflow-hidden dsx-s-bb3e77c269"
                >
                  <div className="flex flex-col gap-1.5">
                    {/* Step number */}
                    <span
                      className="type-mono-label dsx-s-b0e08465c2"
                    >
                      {showcaseMessage("components.design-system.patterns-templates.01-contesto-90bc94e1")}</span>
                    {/* Title */}
                    <span className="dsx-s-8ee0bf1181"
                    >
                      {showcaseMessage("components.design-system.patterns-templates.quando-e-dove-e80d367d")}</span>
                    {/* Subtitle */}
                    <span
                      className="font-serif dsx-s-49d60feb76 ds-showcase__secondary-ink"
                    >
                      {showcaseMessage("components.design-system.patterns-templates.tempo-temperatura-stagione-52cc43b9")}</span>
                    {/* Decorative line */}
                    <div
                      className="mt-3 dsx-s-b075cf5350"
                    />
                  </div>

                  {/* Content placeholder */}
                  <div className="mt-6 flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full dsx-s-9a3b8c4783"
                        style={{ "--dsx-width": toShowcaseCssValue(`${100 - i * 15}%`, false) } as any}
                      />
                    ))}
                  </div>
                </div>

                {/* Anatomy */}
                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.anatomia-stepheader-525b2c74")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.step-number-9d6d2ca0")} val={showcaseMessage("components.design-system.patterns-templates.dm-sans-type-step-num-primary-0-6875rem-up-f1108368")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.title-768e0c1c")} val={showcaseMessage("components.design-system.patterns-templates.playfair-display-clamp-1-75rem-5vw-2-5rem--3e04ad1a")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.subtitle-e159d05a")} val={showcaseMessage("components.design-system.patterns-templates.playfair-italic-muted-foreground-opacity-0-169106d0")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.decorative-line-de7ec345")} val={showcaseMessage("components.design-system.patterns-templates.2rem-wide-2px-height-primary-opacity-0-35-f02e9dc9")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.entrance-aa4bbfb3")} val={showcaseMessage("components.design-system.patterns-templates.whileinview-once-true-amount-0-5-stagger-0-8f947fef")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.scrollsection-f0f188db")} val={showcaseMessage("components.design-system.patterns-templates.io-driven-opacity-0-45-focus-0-55-transiti-191b3aa7")} />
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.scroll-snap-structure-53995d25")} />
                <div
                  className="p-5 rounded-2xl flex flex-col gap-3 dsx-s-bb3e77c269"
                >
                  {[
                    { num: "01", name: showcaseMessage("components.design-system.patterns-templates.contesto-6b37d2f1"), desc: showcaseMessage("components.design-system.patterns-templates.meteo-quando-f7ae4724") },
                    { num: "02", name: showcaseMessage("components.design-system.patterns-templates.setup-cdd7bb28"), desc: showcaseMessage("components.design-system.patterns-templates.skill-equipment-pantry-60e51e54") },
                    { num: "03", name: showcaseMessage("components.design-system.patterns-templates.stile-36bcfdbc"), desc: showcaseMessage("components.design-system.patterns-templates.grid-stili-raccomandati-68a96cd1") },
                  ].map((s) => (
                    <div
                      key={s.num}
                      className="flex items-center gap-3 p-3 rounded-xl dsx-s-e4f209c55b"
                    >
                      <span
                        className="type-data dsx-s-065ae40f66"
                      >
                        {s.num}
                      </span>
                      <div className="flex flex-col">
                        <span className="dsx-s-ce5ec66ff8"
                        >
                          {s.name}
                        </span>
                        <span className="dsx-s-6849179898"
                        >
                          {s.desc}
                        </span>
                      </div>
                      <div
                        className="ml-auto type-code dsx-s-63782726c0"
                      >
                        {showcaseMessage("components.design-system.patterns-templates.scroll-snap-start-0abc0c02")}</div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-pattern-editorial-section-crea-il-ritmo-bb8dfa01")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.il-numero-editoriale-01-02-03-in-dm-mono-o-38f9ffb1"),
                  showcaseMessage("components.design-system.patterns-templates.il-titolo-serif-crea-autorevolezza-il-sott-49108471"),
                  showcaseMessage("components.design-system.patterns-templates.la-linea-decorativa-segna-il-confine-tra-h-c1d7e203"),
                  showcaseMessage("components.design-system.patterns-templates.scrollsection-dimma-le-sezioni-non-attive--eeb44503"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.per-qualsiasi-flusso-multi-step-con-conten-962c621d")}
                anatomia={[
                  { parte: showcaseMessage("components.design-system.patterns-templates.data-section-599e913f"), desc: showcaseMessage("components.design-system.patterns-templates.attributo-html-per-intersectionobserver-tr-92f5cd33") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.scroll-snap-align-2dfb6243"), desc: showcaseMessage("components.design-system.patterns-templates.start-ogni-sezione-si-aggancia-al-viewport-8d9d5973") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.min-height-6e9cba46"), desc: showcaseMessage("components.design-system.patterns-templates.calc-100dvh-6rem-per-garantire-snap-funzio-2a6c1974") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.scrollsection-f0f188db"), desc: showcaseMessage("components.design-system.patterns-templates.wrapper-io-driven-per-opacity-dimming-3a08735e") },
                  { parte: showcaseMessage("components.design-system.patterns-templates.stepheader-678aa1f3"), desc: showcaseMessage("components.design-system.patterns-templates.numero-titolo-sottotitolo-linea-ce0955f3") },
                ]}
              />
            ),
          },
          {
            id: "linee-guida",
            label: showcaseMessage("components.design-system.patterns-templates.linee-guida-b43417d1"),
            content: (
              <LineeGuida
                fai={[
                  showcaseMessage("components.design-system.patterns-templates.usare-scroll-snap-y-mandatory-con-scroll-m-44a07527"),
                  showcaseMessage("components.design-system.patterns-templates.wrappare-sempre-in-scrollsection-per-dimmi-f81a6d6b"),
                  showcaseMessage("components.design-system.patterns-templates.usare-data-section-per-il-tracking-dell-in-6b059430"),
                  showcaseMessage("components.design-system.patterns-templates.stepheader-con-whileinview-animazione-once-f91e7531"),
                ]}
                nonFare={[
                  showcaseMessage("components.design-system.patterns-templates.mai-usare-scroll-snap-senza-min-height-la--c5666eca"),
                  showcaseMessage("components.design-system.patterns-templates.mai-omettere-la-linea-decorativa-nel-steph-07befbe5"),
                  showcaseMessage("components.design-system.patterns-templates.mai-animare-scrollsection-con-blur-causa-l-5696b295"),
                  showcaseMessage("components.design-system.patterns-templates.mai-usare-piu-di-4-5-sezioni-snap-diventa--3fcc2f2f"),
                ]}
                responsive={showcaseMessage("components.design-system.patterns-templates.su-mobile-min-height-garantisce-snap-su-de-e32fb233")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P03 — PROGRESSIVE DISCLOSURE PATTERN
   Nerd mode, accordion, InfoTip.
   ═══════════════════════════════════════════════════════════ */

function ProgressiveDisclosureSpec() {
  const [nerdMode, setNerdMode] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.progressive-disclosure-45ee64c0")}
        description={showcaseMessage("components.design-system.patterns-templates.complessita-stratificata-informazioni-base-29154946")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.livello-1-nerd-mode-toggle-d95744cd")} />

                <div
                  className="p-6 rounded-2xl dsx-s-bb3e77c269"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="dsx-s-0b15ddefe0"
                    >
                      {showcaseMessage("components.design-system.patterns-templates.score-dashboard-3510d97d")}</span>
                    <motion.button
                      onClick={() => setNerdMode(!nerdMode)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 dsx-s-14f72ff8bb"
                      style={{ "--dsx-background": toShowcaseCssValue(nerdMode
                                                                                      ? "color-mix(in srgb, var(--tertiary) 15%, transparent)"
                                                                                      : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(nerdMode
                                                                                      ? "1px solid var(--tertiary)"
                                                                                      : "1px solid var(--outline-variant)", false), "--dsx-color": toShowcaseCssValue(nerdMode
                                                                                      ? "var(--tertiary)"
                                                                                      : "var(--muted-foreground)", false) } as any}
                      aria-pressed={nerdMode}
                    >
                      <Sparkles size={12} />
                      {showcaseMessage("components.design-system.patterns-templates.pizzanerd-2cc4b266")}</motion.button>
                  </div>

                  {/* Base content */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: showcaseMessage("components.design-system.patterns-templates.composite-b9ec0f58"), value: "87" },
                      { label: showcaseMessage("components.design-system.patterns-templates.autenticita-78be3a91"), value: "92" },
                      { label: showcaseMessage("components.design-system.patterns-templates.fattibilita-a6527242"), value: "78" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="p-3 rounded-xl text-center dsx-s-e4f209c55b"
                      >
                        <div
                          className="type-data-lg dsx-s-b0e08465c2"
                        >
                          {m.value}
                        </div>
                        <div
                          className="type-data mt-0.5 dsx-s-63782726c0"
                        >
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nerd content */}
                  <AnimatePresence>
                    {nerdMode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={showcaseTransition.preset_52932982c7}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-4 p-4 rounded-xl dsx-s-7852c68e05"
                        >
                          <span
                            className="type-mono-label dsx-s-851da3db2b"
                          >
                            {showcaseMessage("components.design-system.patterns-templates.scientific-layer-365e7a17")}</span>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {[
                              { k: "Q10 model", v: "standard (2.0)" },
                              { k: "FODMAP", v: "-42%" },
                              { k: "Water activity", v: "0.97" },
                              { k: "Gluten network", v: "78/100" },
                            ].map((d) => (
                              <div key={d.k} className="flex justify-between">
                                <span
                                  className="type-code dsx-s-63782726c0"
                                >
                                  {d.k}
                                </span>
                                <span
                                  className="type-data dsx-s-b32ff17e76"
                                >
                                  {d.v}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.livello-2-accordion-06fe5f7d")} />

                <div
                  className="rounded-2xl overflow-hidden dsx-s-bb3e77c269"
                >
                  <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left active:scale-99 transition-transform cursor-pointer"
                    aria-expanded={accordionOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal
                        size={14}
                        style={{ "--dsx-color": toShowcaseCssValue(accordionOpen
                                                                                                ? "var(--text-accent)"
                                                                                                : "var(--muted-foreground)", false) } as any} className="dsx-s-3c487ee146"
                      />
                      <span className="dsx-s-9688f15e19"
                      >
                        {showcaseMessage("components.design-system.patterns-templates.personalizza-parametri-a2d9885d")}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: accordionOpen ? 180 : 0 }}
                      transition={showcaseTransition.preset_a84e383e92}
                    >
                      <ChevronDown
                        size={16} className="dsx-s-63782726c0"
                      />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {accordionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={showcaseTransition.preset_52932982c7}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 pb-5 pt-3 dsx-s-e0f5da197d"
                        >
                          <div className="flex flex-col gap-2">
                            {["Idratazione: 65%", "Farina W: 280", "Fermentazione: 16h"].map(
                              (item) => (
                                <div
                                  key={item}
                                  className="h-2.5 rounded-full dsx-s-5c4c6ae81c"
                                />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.livello-3-infotip-25e5da64")} />

                <div
                  className="p-6 rounded-2xl flex items-center gap-3 dsx-s-bb3e77c269"
                >
                  <span className="dsx-s-ce5ec66ff8"
                  >
                    {showcaseMessage("components.design-system.patterns-templates.rapporto-p-l-7930c2de")}</span>
                  <div className="relative">
                    <button
                      onClick={() => setTipVisible(!tipVisible)}
                      className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer dsx-s-f703d3a415 ds-showcase__compact-target"
                      aria-expanded={tipVisible}
                      aria-label={showcaseMessage("components.design-system.patterns-templates.info-p-l-36526536")}
                    >
                      <HelpCircle size={12} />
                    </button>
                    <AnimatePresence>
                      {tipVisible && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={showcaseTransition.preset_52932982c7}
                          className="absolute left-0 top-7 z-10 p-3 rounded-xl dsx-s-ec55c334ca"
                        >
                          <p className="dsx-s-37a1e2bb6e"
                          >
                            {showcaseMessage("components.design-system.patterns-templates.rapporto-alveografico-tenacita-estensibili-9e78aff3")}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.nerd-toggle-1375cf8c")} val={showcaseMessage("components.design-system.patterns-templates.dm-mono-tertiary-palette-aria-pressed-e94ca0fa")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.accordion-21191a04")} val={showcaseMessage("components.design-system.patterns-templates.aria-expanded-chevrondown-rotates-180deg-s-c6fb866d")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.infotip-ec4c79f7")} val={showcaseMessage("components.design-system.patterns-templates.helpcircle-12px-popover-absolute-shadow-md-e1ae7ef0")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.escape-b4cfe1f4")} val={showcaseMessage("components.design-system.patterns-templates.tutti-i-popover-si-chiudono-con-escape-c1964a8f")} />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-pattern-progressive-disclosure-stratifi-42a5c930")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.il-contenuto-base-deve-essere-sufficiente--039e52d1"),
                  showcaseMessage("components.design-system.patterns-templates.nerd-mode-aggiunge-dati-non-nasconde-funzi-a2913093"),
                  showcaseMessage("components.design-system.patterns-templates.infotip-e-l-ultimo-livello-spiegazioni-gra-3060313b"),
                  showcaseMessage("components.design-system.patterns-templates.ogni-livello-si-apre-con-animatepresence-s-43fbde0f"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.quando-il-contenuto-ha-audience-miste-prin-195d6f6c")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P04 — FLOATING CTA PATTERN
   Context-aware bottom action bar.
   ═══════════════════════════════════════════════════════════ */

function FloatingCTASpec() {
  const [state, setState] = useState<"early" | "ready" | "result">("early");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.floating-cta-12498c41")}
        description={showcaseMessage("components.design-system.patterns-templates.cta-contestuale-che-evolve-con-lo-stato-de-a561e082")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                {/* State switcher */}
                <div className="flex gap-2 flex-wrap">
                  {(["early", "ready", "result"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      aria-pressed={state === s}
                      className="px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 dsx-s-e84ef391a9"
                      style={{ "--dsx-background": toShowcaseCssValue(state === s
                                                                            ? "var(--primary)"
                                                                            : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(state === s
                                                                            ? "var(--primary-foreground)"
                                                                            : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(state === s
                                                                            ? "none"
                                                                            : "1px solid var(--outline-variant)", false) } as any}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Demo */}
                <div
                  className="relative rounded-2xl overflow-hidden dsx-s-0cff888657"
                >
                  {/* Simulated page content */}
                  <div className="p-5">
                    <div
                      className="h-2 rounded-full mb-2 dsx-s-d522a600a7"
                    />
                    <div
                      className="h-2 rounded-full dsx-s-32c546d78a"
                    />
                  </div>

                  {/* Floating CTA bar — positioned inside demo */}
                  <div
                    className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 dsx-s-d4e8f24582"
                  >
                    <AnimatePresence mode="wait">
                      {state === "early" && (
                        <motion.button
                          key="cta-scroll"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          transition={showcaseTransition.preset_52932982c7}
                          className="flex items-center gap-2 h-11 px-7 rounded-full active:scale-97 dsx-s-b7ae22a28a"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.scegli-stile-522638d1")}<ArrowRight size={14} />
                        </motion.button>
                      )}

                      {state === "ready" && (
                        <motion.button
                          key="cta-generate"
                          initial={{ opacity: 0, y: 12, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.9 }}
                          transition={showcaseTransition.preset_52932982c7}
                          className="flex items-center gap-2 h-11 px-7 rounded-full active:scale-97 dsx-s-b7ae22a28a"
                        >
                          <Sparkles size={13} />
                          {showcaseMessage("components.design-system.patterns-templates.genera-ricetta-2453c685")}</motion.button>
                      )}

                      {state === "result" && (
                        <motion.div
                          key="cta-result"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          className="flex items-center gap-2.5 dsx-s-cf54c6d8e2"
                        >
                          <CtaButton
                            variant="secondary"
                            elevated={false}
                            className="flex items-center gap-2 h-11 px-5 rounded-full active:scale-97 dsx-s-b349da78cc"
                          >
                            <Palette size={12} />
                            {showcaseMessage("components.design-system.patterns-templates.cambia-stile-d0e513fb")}</CtaButton>
                          <CtaButton
                            variant="secondary"
                            elevated={false}
                            className="flex items-center gap-2 h-11 px-5 rounded-full active:scale-97 dsx-s-1e2169ea67"
                          >
                            <RotateCcw size={12} />
                            {showcaseMessage("components.design-system.patterns-templates.nuova-pizza-01f145ae")}</CtaButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* States table */}
                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.state-machine-ff33720d")} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.early-818743b9")}
                    val={showcaseMessage("components.design-system.patterns-templates.timeslot-selezionato-no-stile-scegli-stile-e5955410")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.ready-75c05337")}
                    val={showcaseMessage("components.design-system.patterns-templates.stile-selezionato-genera-ricetta-step-resu-fe579687")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.result-37a5301a")}
                    val={showcaseMessage("components.design-system.patterns-templates.in-result-step-cambia-stile-nuova-pizza-7bd8ea0b")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.container-e6443af9")} val={showcaseMessage("components.design-system.patterns-templates.fixed-bottom-0-z-50-pointer-events-none-93cd9a5a")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.button-794145f0")} val={showcaseMessage("components.design-system.patterns-templates.pointer-events-auto-rounded-full-cta-btn-b-a194d64e")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.shadow-aa0e7e86")} val={showcaseMessage("components.design-system.patterns-templates.cta-btn-shadow-deep-per-primary-shadow-md--f5ce6736")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.transition-4ead496f")} val={showcaseMessage("components.design-system.patterns-templates.animatepresence-mode-wait-spring-400-25-94034790")} />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-floating-cta-e-un-action-bar-contestual-1daa5cd7")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.il-cta-e-sempre-pertinente-allo-stato-corr-b7e587c9"),
                  showcaseMessage("components.design-system.patterns-templates.usa-animatepresence-mode-wait-per-transizi-5c1f199c"),
                  showcaseMessage("components.design-system.patterns-templates.il-container-e-pointer-events-none-solo-i--0a1a3cd9"),
                  showcaseMessage("components.design-system.patterns-templates.in-result-il-cta-secondario-nuova-pizza-ha-8268e10b"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.quando-c-e-un-azione-primaria-che-deve-ess-0216284c")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P05 — COACHMARK → TOOLTIP PATTERN
   First-visit education transitioning to quick reference.
   ═══════════════════════════════════════════════════════════ */

function CoachmarkTooltipSpec() {
  const [phase, setPhase] = useState<"coachmark" | "tooltip">("coachmark");
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.coachmark-tooltip-b89cc629")}
        description={showcaseMessage("components.design-system.patterns-templates.educazione-al-primo-accesso-che-si-trasfor-87b3d7f6")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                {/* Phase switcher */}
                <div className="flex gap-2">
                  {(["coachmark", "tooltip"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPhase(p);
                        setShowTip(true);
                      }}
                      aria-pressed={phase === p}
                      className="px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 dsx-s-e84ef391a9"
                      style={{ "--dsx-background": toShowcaseCssValue(phase === p
                                                                            ? "var(--primary)"
                                                                            : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(phase === p
                                                                            ? "var(--primary-foreground)"
                                                                            : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(phase === p
                                                                            ? "none"
                                                                            : "1px solid var(--outline-variant)", false) } as any}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Demo */}
                <div
                  className="relative p-6 rounded-2xl dsx-s-47d2adb632"
                >
                  {/* Fake pill dots */}
                  <div className="flex flex-col items-start gap-2">
                    {["Contesto", "Setup", "Stile"].map((s, i) => (
                      <div key={s} className="flex items-center gap-3">
                        <div
                          className="rounded-full dsx-s-ac25e46afc"
                          style={{ "--dsx-width": toShowcaseCssValue(i === 0 ? 22 : 6, false), "--dsx-background": toShowcaseCssValue(i === 0
                                                                                            ? "var(--primary)"
                                                                                            : i < 1
                                                                                              ? "var(--muted-foreground)"
                                                                                              : "var(--outline-variant)", false) } as any}
                        />
                        {i === 0 && (
                          <span
                            className="type-data dsx-s-63782726c0"
                          >
                            {s}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tip bubble */}
                  <AnimatePresence>
                    {showTip && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={showcaseTransition.preset_5aaf817320}
                        className="absolute left-20 top-6 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl dsx-s-c42c4ed115"
                        style={{ "--dsx-background": toShowcaseCssValue(phase === "coachmark"
                                                                                                  ? "var(--surface-container-high)"
                                                                                                  : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(phase === "coachmark"
                                                                                                  ? "1px solid var(--primary)"
                                                                                                  : "1px solid var(--outline-variant)", false), "--dsx-box-shadow": toShowcaseCssValue(phase === "coachmark"
                                                                                                  ? "var(--shadow-md)"
                                                                                                  : "var(--shadow-sm)", false) } as any}
                      >
                        {phase === "coachmark" && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Lightbulb
                                size={11} className="dsx-s-851da3db2b"
                              />
                              <span
                                className="type-data dsx-s-63782726c0"
                              >
                                {showcaseMessage("components.design-system.patterns-templates.1-di-3-cac9178c")}</span>
                            </div>
                            <IconButton
                              size="sm"
                              variant="bare"
                              onClick={() => setShowTip(false)}
                              className="cursor-pointer dsx-s-56c17670c7"
                              aria-label={showcaseMessage("components.design-system.components-c.chiudi-0f9a273d")}
                            >
                              <X size={10} />
                            </IconButton>
                          </div>
                        )}
                        <span className="dsx-s-9326ffcdc1"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.la-temperatura-della-cucina-e-il-tempo-gui-5c45621e")}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.coachmark-af45152e")}
                    val={showcaseMessage("components.design-system.patterns-templates.auto-appear-on-unseen-section-lightbulb-ic-a8e7160a")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.auto-dismiss-4e7d55f2")}
                    val={showcaseMessage("components.design-system.patterns-templates.7000ms-timeout-persisted-in-localstorage-v-5fcb276e")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.tooltip-b8407e25")}
                    val={showcaseMessage("components.design-system.patterns-templates.post-onboarding-appare-su-hover-no-dismiss-98b78a99")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.pulsing-ring-755d2e9b")}
                    val={showcaseMessage("components.design-system.patterns-templates.sul-dot-attivo-durante-coachmark-opacity-0-d5d94311")}
                  />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-pattern-coachmark-tooltip-gestisce-l-ed-66802b6f")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.il-coachmark-ha-piu-peso-visivo-del-toolti-37e61b2a"),
                  showcaseMessage("components.design-system.patterns-templates.il-pulsing-ring-attira-l-attenzione-sul-do-98af7ca6"),
                  showcaseMessage("components.design-system.patterns-templates.persistenza-in-localstorage-l-utente-non-r-180d43b8"),
                  showcaseMessage("components.design-system.patterns-templates.l-auto-dismiss-7s-previene-che-il-coachmar-c962a83e"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.per-onboarding-one-time-su-elementi-di-nav-974ec9fb")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P06 — STICKY CONTEXT PATTERN
   Dashboard that follows scroll, responsive.
   ═══════════════════════════════════════════════════════════ */

function StickyContextSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.sticky-context-4be53874")}
        description={showcaseMessage("components.design-system.patterns-templates.dashboard-metriche-che-segue-lo-scroll-ada-c9e445fd")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                {/* Visual comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Desktop */}
                  <div
                    className="p-5 rounded-2xl dsx-s-bb3e77c269"
                  >
                    <span
                      className="type-mono-label dsx-s-5e98e84d69"
                    >
                      {showcaseMessage("components.design-system.patterns-templates.desktop-sidebar-sticky-73ced03f")}</span>
                    <div className="mt-3 flex gap-3">
                      {/* Main content */}
                      <div className="flex-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-2 rounded-full mb-2 dsx-s-9a3b8c4783"
                            style={{ "--dsx-width": toShowcaseCssValue(`${100 - i * 10}%`, false) } as any}
                          />
                        ))}
                      </div>
                      {/* Sidebar */}
                      <div
                        className="w-20 rounded-xl p-2 flex-shrink-0 dsx-s-d1283e5581"
                      >
                        <div
                          className="type-code text-center dsx-s-b0e08465c2"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.score-93d630bb")}</div>
                        <div
                          className="w-10 h-10 rounded-full mx-auto mt-2 dsx-s-11fdea725c"
                        />
                        <div
                          className="type-code text-center mt-1 dsx-s-63782726c0"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.sticky-6a43371c")}</div>
                        <div
                          className="type-code text-center dsx-s-63782726c0"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.top-80px-b07a1451")}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div
                    className="p-5 rounded-2xl dsx-s-bb3e77c269"
                  >
                    <span
                      className="type-mono-label dsx-s-b0e08465c2"
                    >
                      {showcaseMessage("components.design-system.patterns-templates.mobile-sub-header-sticky-47fa42be")}</span>
                    <div className="mt-3 flex flex-col gap-2">
                      {/* Header */}
                      <div
                        className="h-6 rounded-lg dsx-s-b42d544b20"
                      />
                      {/* Sticky bar */}
                      <div
                        className="h-8 rounded-lg flex items-center justify-center dsx-s-da16e5a7dc"
                      >
                        <span
                          className="type-code dsx-s-b0e08465c2"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.scoredashboard-compact-c6ecd2df")}</span>
                      </div>
                      {/* Content */}
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-2 rounded-full dsx-s-9a3b8c4783"
                          style={{ "--dsx-width": toShowcaseCssValue(`${100 - i * 15}%`, false) } as any}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.desktop-532c67fe")}
                    val={showcaseMessage("components.design-system.patterns-templates.lg-grid-cols-1fr-340px-sidebar-sticky-top--ee2cc1b8")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.mobile-b1d70245")}
                    val={showcaseMessage("components.design-system.patterns-templates.lg-hidden-sticky-top-14-glassmorphism-blur-541b9fd2")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.z-index-674904ca")}
                    val={showcaseMessage("components.design-system.patterns-templates.z-30-sotto-header-z-50-sopra-contenuto-12114dcc")}
                  />
                  <AnatomyRow
                    prop={showcaseMessage("components.design-system.patterns-templates.nerd-mode-77adb15d")}
                    val={showcaseMessage("components.design-system.patterns-templates.toggle-pizzanerd-espande-radar-chart-deskt-6abe3b89")}
                  />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-pattern-sticky-context-mantiene-le-metr-683e9a43")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.le-metriche-devono-essere-leggibili-in-un--ce7c0d12"),
                  showcaseMessage("components.design-system.patterns-templates.su-mobile-il-dashboard-compatto-mostra-sol-ac1266bf"),
                  showcaseMessage("components.design-system.patterns-templates.il-radar-chart-nerd-mode-si-apre-in-modale-b246d32e"),
                  showcaseMessage("components.design-system.patterns-templates.z-layering-header-z-50-sticky-dashboard-z--eaca1761"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.quando-il-contenuto-e-lungo-e-l-utente-ha--d957c025")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   T01 — BUILD PAGE TEMPLATE
   ═══════════════════════════════════════════════════════════ */

function BuildTemplateSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.build-page-template-00797cee")}
        description={showcaseMessage("components.design-system.patterns-templates.il-template-del-flusso-build-hero-3-sezion-88708f2a")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                {/* Visual wireframe */}
                <div
                  className="p-5 rounded-2xl dsx-s-bb3e77c269"
                >
                  <div className="relative dsx-s-4e3aa61b70">
                    {/* Header */}
                    <div
                      className="h-8 rounded-lg flex items-center px-3 justify-between dsx-s-da16e5a7dc"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-md dsx-s-0a278ece1c"
                        />
                        <span
                          className="type-data dsx-s-b32ff17e76"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.vulcan-733fdc87")}</span>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full dsx-s-e4f209c55b"
                      />
                    </div>

                    {/* Mobile progress bar */}
                    <div
                      className="mt-1 h-5 rounded-md flex items-center gap-1 px-2 dsx-s-d1283e5581"
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full dsx-s-fbecfa7efd"
                          style={{ "--dsx-background": toShowcaseCssValue(i === 1
                                                                                        ? "var(--primary)"
                                                                                        : "var(--outline-variant)", false) } as any}
                        />
                      ))}
                      <span
                        className="type-code ml-1 dsx-s-63782726c0"
                      >
                        {showcaseMessage("components.design-system.patterns-templates.mobile-only-5fd462bd")}</span>
                    </div>

                    {/* Content area with sections */}
                    <div className="flex mt-3 gap-3">
                      {/* ProgressPill (desktop) */}
                      <div className="flex flex-col items-center gap-1.5 pt-8 flex-shrink-0 dsx-s-ae5abd2361">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded-full dsx-s-ac25e46afc"
                            style={{ "--dsx-width": toShowcaseCssValue(i === 0 ? 18 : 6, false), "--dsx-background": toShowcaseCssValue(i === 0
                                                                                              ? "var(--primary)"
                                                                                              : i === 1
                                                                                                ? "var(--muted-foreground)"
                                                                                                : "var(--outline-variant)", false) } as any}
                          />
                        ))}
                        <span
                          className="type-code mt-1 dsx-s-534b82ae22"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.desktop-838dfce6")}</span>
                      </div>

                      {/* Sections */}
                      <div className="flex-1 flex flex-col gap-2">
                        {[
                          { num: "01", name: showcaseMessage("components.design-system.patterns-templates.hero-contesto-b3625d97"), h: 70, snap: true },
                          { num: "02", name: showcaseMessage("components.design-system.patterns-templates.setup-cdd7bb28"), h: 60, snap: true },
                          { num: "03", name: showcaseMessage("components.design-system.patterns-templates.stili-ad1a9b2f"), h: 90, snap: true },
                        ].map((s) => (
                          <div
                            key={s.num}
                            className="rounded-xl p-3 flex flex-col dsx-s-f0abbbb21b"
                            style={{ "--dsx-height": toShowcaseCssValue(s.h, false) } as any}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="type-mono-label dsx-s-b0e08465c2"
                              >
                                {s.num}
                              </span>
                              {s.snap && (
                                <span
                                  className="type-code dsx-s-63782726c0"
                                >
                                  {showcaseMessage("components.design-system.patterns-templates.snap-start-a0d44c7d")}</span>
                              )}
                            </div>
                            <span
                              className="type-data mt-1 dsx-s-a57c4bed75"
                            >
                              {s.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Floating CTA */}
                    <div className="flex justify-center mt-3">
                      <div
                        className="h-7 px-5 rounded-full flex items-center gap-1.5 dsx-s-d1935dcf16"
                      >
                        <Sparkles size={10} />
                        <span
                          className="type-data dsx-s-0aab34e715"
                        >
                          CTA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.layer-map-675457a4")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.z-50-181b2866")} val={showcaseMessage("components.design-system.patterns-templates.header-sticky-top-0-floating-cta-fixed-bot-04ab99ee")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.z-40-4802bd5b")} val={showcaseMessage("components.design-system.patterns-templates.progresspill-fixed-left-mobileprogressbar--74812624")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.z-2-4f057529")} val={showcaseMessage("components.design-system.patterns-templates.main-content-motion-main-70e648fd")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.z-1-0bcb043a")} val={showcaseMessage("components.design-system.patterns-templates.fireglow-ambient-background-fixed-a2220120")} />
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.composizione-pattern-461cc613")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="P02" val={showcaseMessage("components.design-system.patterns-templates.editorial-section-ripetuto-3-volte-context-763eeda7")} />
                  <AnatomyRow prop="P01" val={showcaseMessage("components.design-system.patterns-templates.selection-pattern-in-ogni-sezione-chips-ca-02c30e72")} />
                  <AnatomyRow prop="P05" val={showcaseMessage("components.design-system.patterns-templates.coachmark-tooltip-nel-progresspill-94d1f7b8")} />
                  <AnatomyRow prop="P06" val={showcaseMessage("components.design-system.patterns-templates.floating-cta-bottom-bar-contestuale-429b2b02")} />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-build-page-template-e-il-layout-princip-7a58b42d")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.scroll-snap-y-mandatory-con-scroll-padding-2a48796b"),
                  showcaseMessage("components.design-system.patterns-templates.ogni-sezione-ha-min-height-calc-100dvh-6re-00b40aac"),
                  showcaseMessage("components.design-system.patterns-templates.progresspill-e-mobileprogressbar-si-esclud-0f10e74e"),
                  showcaseMessage("components.design-system.patterns-templates.fireglow-come-sfondo-animato-reagisce-alla-6bc7ee09"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.per-qualsiasi-flusso-multi-step-che-richie-02e6a14d")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   T02 — RESULT PAGE TEMPLATE
   ═══════════════════════════════════════════════════════════ */

function ResultTemplateSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.patterns-templates.result-page-template-4c71b325")}
        description={showcaseMessage("components.design-system.patterns-templates.il-template-del-risultato-header-cinematog-a88f3f36")}
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: showcaseMessage("components.design-system.patterns-templates.specifiche-057caf2f"),
            content: (
              <div className="flex flex-col gap-8">
                {/* Visual wireframe */}
                <div
                  className="p-5 rounded-2xl dsx-s-bb3e77c269"
                >
                  <div className="flex flex-col gap-2 dsx-s-a9a67db444">
                    {/* Cinematic header */}
                    <div
                      className="relative rounded-xl overflow-hidden dsx-s-584921563c"
                    >
                      <div
                        className="absolute inset-0 dsx-s-bb86c305cd"
                      />
                      <div
                        className="absolute inset-0 dsx-s-9700b57a92"
                      />
                      <div className="absolute bottom-2 left-3">
                        <span
                          className="type-mono-label dsx-s-63782726c0"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.la-tua-pizza-perfetta-504ab49b")}</span>
                        <div className="dsx-s-3e3cd90766"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.napoletana-stg-67342c12")}</div>
                      </div>
                    </div>

                    {/* Main + Sidebar */}
                    <div className="flex gap-3">
                      {/* Main content */}
                      <div className="flex-1 flex flex-col gap-2">
                        {/* Stat strip */}
                        <div className="flex gap-1.5">
                          {["H 60%", "W 280", "16h", "250C"].map((stat) => (
                            <div
                              key={stat}
                              className="flex-1 p-2 rounded-lg text-center dsx-s-e4f209c55b"
                            >
                              <span
                                className="type-data dsx-s-f8fdede155"
                              >
                                {stat}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Fine-tuning accordion */}
                        <div
                          className="p-2.5 rounded-lg dsx-s-d1283e5581"
                        >
                          <div className="flex items-center justify-between">
                            <span className="type-data dsx-s-a57c4bed75">
                              {showcaseMessage("components.design-system.patterns-templates.fine-tuning-248325fa")}</span>
                            <ChevronDown size={12} className="dsx-s-63782726c0" />
                          </div>
                        </div>
                        {/* Recipe content */}
                        <div
                          className="p-2.5 rounded-lg flex-1 dsx-s-e4f209c55b"
                        >
                          <span className="type-data dsx-s-a57c4bed75">
                            {showcaseMessage("components.design-system.patterns-templates.ingredienti-timeline-59904414")}</span>
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-1.5 rounded-full mt-2 dsx-s-a14a17a5a7"
                              style={{ "--dsx-width": toShowcaseCssValue(`${90 - i * 12}%`, false) } as any}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Sidebar (desktop) */}
                      <div
                        className="w-20 flex-shrink-0 rounded-xl p-2 dsx-s-d1283e5581"
                      >
                        <span className="type-code dsx-s-b0e08465c2">
                          {showcaseMessage("components.design-system.patterns-templates.score-93d630bb")}</span>
                        <div
                          className="w-12 h-12 rounded-full mx-auto mt-2 dsx-s-11fdea725c"
                        />
                        <div className="flex flex-col gap-1 mt-2">
                          {["Auth", "Feas", "Dig"].map((s) => (
                            <div
                              key={s}
                              className="h-1 rounded-full dsx-s-279d49df94"
                            />
                          ))}
                        </div>
                        <span
                          className="type-code block text-center mt-2 dsx-s-63782726c0"
                        >
                          {showcaseMessage("components.design-system.patterns-templates.sticky-6a43371c")}</span>
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex justify-center gap-2 mt-2">
                      <div
                        className="h-6 px-4 rounded-full flex items-center gap-1 dsx-s-d1283e5581"
                      >
                        <Palette size={9} />
                        <span className="type-code dsx-s-a57c4bed75">
                          {showcaseMessage("components.design-system.patterns-templates.cambia-ecc84c3b")}</span>
                      </div>
                      <div
                        className="h-6 px-4 rounded-full flex items-center gap-1 dsx-s-dd7e961eb3"
                      >
                        <RotateCcw size={9} />
                        <span className="type-code dsx-s-63782726c0">
                          {showcaseMessage("components.design-system.patterns-templates.reset-5cbb04b3")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.layout-grid-d72c8c8e")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.desktop-532c67fe")} val={showcaseMessage("components.design-system.patterns-templates.lg-grid-cols-1fr-340px-lg-gap-12-xl-gap-16-616024cc")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.mobile-b1d70245")} val={showcaseMessage("components.design-system.patterns-templates.singola-colonna-sidebar-hidden-9ff3249d")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.photo-header-996aded2")} val={showcaseMessage("components.design-system.patterns-templates.max-height-55vh-min-height-280px-object-co-ef6c9a2a")} />
                  <AnatomyRow prop={showcaseMessage("components.design-system.patterns-templates.scrim-cbd1ca36")} val={showcaseMessage("components.design-system.patterns-templates.gradient-to-bottom-transparent-background--505c3f0a")} />
                </div>

                <SubSectionLabel label={showcaseMessage("components.design-system.patterns-templates.composizione-pattern-461cc613")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="P04" val={showcaseMessage("components.design-system.patterns-templates.sticky-context-scoredashboard-sidebar-sub--8b2ca7c3")} />
                  <AnatomyRow prop="P03" val={showcaseMessage("components.design-system.patterns-templates.progressive-disclosure-nerd-mode-accordion-037303b4")} />
                  <AnatomyRow prop="P06" val={showcaseMessage("components.design-system.patterns-templates.floating-cta-cambia-stile-nuova-pizza-ecda8fec")} />
                  <AnatomyRow prop="VPL-008" val={showcaseMessage("components.design-system.patterns-templates.focus-management-heading-riceve-focus-su-t-78864193")} />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: showcaseMessage("components.design-system.patterns-templates.panoramica-f38c9a27"),
            content: (
              <Panoramica
                descrizione={showcaseMessage("components.design-system.patterns-templates.il-result-page-template-presenta-la-ricett-2fa26258")}
                principi={[
                  showcaseMessage("components.design-system.patterns-templates.l-header-cinematografico-crea-il-momento-w-c3335a22"),
                  showcaseMessage("components.design-system.patterns-templates.il-testo-overlay-usa-text-shadow-per-leggi-58743a85"),
                  showcaseMessage("components.design-system.patterns-templates.la-sidebar-sticky-si-ferma-a-top-80px-sott-029e9904"),
                  showcaseMessage("components.design-system.patterns-templates.focus-management-l-heading-h2-riceve-focus-8ad9c91c"),
                ]}
                quandoUsare={showcaseMessage("components.design-system.patterns-templates.per-la-presentazione-di-un-risultato-compl-20898dca")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */

export const ENTRIES: SectionEntry[] = [
  { id: "pat-selection", label: showcaseMessage("components.design-system.patterns-templates.selection-pattern-55446e4b"), group: "p", Component: SelectionPatternSpec },
  { id: "pat-editorial", label: showcaseMessage("components.design-system.patterns-templates.editorial-section-426f2b6e"), group: "p", Component: EditorialSectionSpec },
  { id: "pat-disclosure", label: showcaseMessage("components.design-system.patterns-templates.progressive-disclosure-45ee64c0"), group: "p", Component: ProgressiveDisclosureSpec },
  { id: "pat-floating-cta", label: showcaseMessage("components.design-system.patterns-templates.floating-cta-12498c41"), group: "p", Component: FloatingCTASpec },
  { id: "pat-coachmark", label: showcaseMessage("components.design-system.patterns-templates.coachmark-tooltip-b89cc629"), group: "p", Component: CoachmarkTooltipSpec },
  { id: "pat-sticky", label: showcaseMessage("components.design-system.patterns-templates.sticky-context-4be53874"), group: "p", Component: StickyContextSpec },
  { id: "tmpl-build", label: showcaseMessage("components.design-system.patterns-templates.build-page-template-00797cee"), group: "t", Component: BuildTemplateSpec },
  { id: "tmpl-result", label: showcaseMessage("components.design-system.patterns-templates.result-page-template-4c71b325"), group: "t", Component: ResultTemplateSpec },
];
