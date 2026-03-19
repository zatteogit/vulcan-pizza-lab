import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronDown,
  Lightbulb,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Palette,
  SlidersHorizontal,
  HelpCircle,
  Moon,
  Sun,
  Flame,
} from "lucide-react";
import {
  SectionHeader,
  SubSectionLabel,
  AnatomyRow,
  SectionTabs,
  Panoramica,
  LineeGuida,
  AccessibilitaInfo,
} from "./shared";
import type { SectionEntry } from "./shared";

/* ═══════════════════════════════════════════════════════════
   P01 — SELECTION PATTERN
   Chip & Card selection across the entire build flow.
   ═══════════════════════════════════════════════════════════ */

function SelectionPatternSpec() {
  const [selectedChip, setSelectedChip] = useState<string | null>("b");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const chips = [
    { id: "a", label: "Stasera", icon: Moon },
    { id: "b", label: "Domani pranzo", icon: Sun },
    { id: "c", label: "Weekend", icon: Flame },
  ];

  const cards = [
    { id: "nap", label: "Napoletana STG", score: 92, tier: "perfect" as const },
    { id: "rom", label: "Teglia Romana", score: 78, tier: "good" as const },
    { id: "det", label: "Detroit Style", score: 54, tier: "challenging" as const },
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
        title="Selection Pattern"
        description="Il pattern universale per le scelte dell'utente: chip per opzioni semplici, card per selezioni complesse con preview."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                <SubSectionLabel label="Chip Selection" />

                {/* Chip demo */}
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const isActive = selectedChip === chip.id;
                      const Icon = chip.icon;
                      return (
                        <motion.button
                          key={chip.id}
                          onClick={() => setSelectedChip(chip.id)}
                          className="flex items-center gap-2 rounded-xl cursor-pointer active:scale-95"
                          style={{
                            padding: "10px 16px",
                            background: isActive
                              ? "var(--primary)"
                              : "var(--surface-container)",
                            border: isActive
                              ? "1px solid var(--primary)"
                              : "1px solid var(--outline-variant)",
                            color: isActive
                              ? "var(--primary-foreground)"
                              : "var(--text-default)",
                            fontSize: "var(--font-size-lg)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                          aria-pressed={isActive}
                        >
                          <AnimatePresence mode="wait">
                            {isActive ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 25,
                                }}
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
                    className="mt-4"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-base)",
                      color: "var(--muted-foreground)",
                      fontStyle: "italic",
                    }}
                  >
                    Flusso: presente opzioni &rarr; utente seleziona &rarr;
                    check animato + shift colore
                  </p>
                </div>

                {/* Anatomy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="Inattivo" val="surface-container bg, outline-variant border, foreground text" />
                  <AnatomyRow prop="Attivo" val="primary bg, primary-foreground text, animated Check icon" />
                  <AnatomyRow prop="Radius" val="rounded-xl (0.75rem)" />
                  <AnatomyRow prop="Padding" val="px-4 py-2.5 (chip), gap-2 (icon-label)" />
                  <AnatomyRow prop="Feedback" val="active:scale-95, spring stiffness 500/damping 25" />
                  <AnatomyRow prop="A11y" val="aria-pressed, role implicito button" />
                </div>

                <SubSectionLabel label="Card Selection" />

                {/* Card demo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cards.map((card) => {
                    const isActive = selectedCard === card.id;
                    const tc = tierColors[card.tier];
                    return (
                      <motion.button
                        key={card.id}
                        onClick={() => setSelectedCard(card.id)}
                        className="relative p-4 rounded-2xl text-left cursor-pointer active:scale-[0.97]"
                        style={{
                          background: isActive
                            ? tc.bg
                            : "var(--surface-container-low)",
                          border: isActive
                            ? `2px solid ${tc.text}`
                            : "1px solid var(--outline-variant)",
                          transition: "border-color 0.2s ease, background 0.2s ease",
                        }}
                        aria-pressed={isActive}
                      >
                        {/* Score badge */}
                        <div
                          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: tc.bg,
                            border: `2px solid ${tc.text}`,
                          }}
                        >
                          <span
                            className="type-data"
                            style={{
                              color: tc.text,
                              fontWeight: "var(--weight-bold)" as any,
                            }}
                          >
                            {card.score}
                          </span>
                        </div>

                        <span
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "var(--font-size-3xl)",
                            color: "var(--text-default)",
                            lineHeight: "var(--leading-tight)",
                          }}
                        >
                          {card.label}
                        </span>
                        <div className="mt-2">
                          <span
                            className="type-mono-label"
                            style={{ color: tc.text }}
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
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                              }}
                              className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ background: tc.text }}
                            >
                              <Check
                                size={12}
                                style={{ color: "var(--color-white)" }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="Tier visual" val="perfect=cta, good=tertiary, challenging=primary" />
                  <AnatomyRow prop="Score ring" val="Angolo top-right, ScoreRing importato da score-ring.tsx" />
                  <AnatomyRow prop="Border attivo" val="2px solid tier-color, bg tier-color 10%" />
                  <AnatomyRow prop="Conferma" val="Check animato (spring 500/25) bottom-right" />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il Selection Pattern gestisce tutte le scelte dell'utente nel flusso build. Due varianti: Chip (opzioni semplici a singola riga) e Card (selezioni complesse con preview, score e tier). Entrambe condividono lo stesso ritmo visivo: stato neutro → interazione → conferma animata."
                principi={[
                  "Un solo elemento attivo per gruppo (single-select). Il check animato conferma la scelta.",
                  "Il colore di selezione riflette il contesto: primary per chip generici, tier-color per card stilistiche.",
                  "Feedback tattile immediato: active:scale-95 (chip) o active:scale-[0.97] (card).",
                  "L'icona si swap-anima (icon → check) con spring transition, mai cross-fade.",
                ]}
                quandoUsare="Ogni volta che l'utente deve scegliere tra opzioni discrete. Chip per 2-6 opzioni testuali, Card per opzioni con contenuto rich (immagine, score, metadata)."
                anatomia={[
                  { parte: "Container", desc: "surface-container bg, outline-variant border" },
                  { parte: "Label", desc: "DM Sans, font-size-lg" },
                  { parte: "Icon slot", desc: "AnimatePresence mode='wait' per swap icon/check" },
                  { parte: "Score badge", desc: "Solo nelle card, posizione absolute top-right" },
                  { parte: "Confirmation", desc: "Check icon animata, spring stiffness 500" },
                ]}
              />
            ),
          },
          {
            id: "linee-guida",
            label: "Linee guida",
            content: (
              <LineeGuida
                fai={[
                  "Usare aria-pressed per comunicare lo stato attivo",
                  "Animare l'icona con AnimatePresence mode='wait'",
                  "Mantenere il check come conferma visiva primaria",
                  "Usare tier-color coerente tra badge, border e check",
                ]}
                nonFare={[
                  "Mai multi-select senza indicazione chiara (questo pattern e single-select)",
                  "Mai usare solo colore come indicatore — il check e obbligatorio per a11y",
                  "Mai omettere il feedback tattile (active:scale)",
                  "Mai animare con duration/ease — sempre spring",
                ]}
                responsive="Chip: flex-wrap su mobile, scroll orizzontale non necessario per 3-6 opzioni. Card: grid 1 colonna mobile, 2-3 colonne desktop."
              />
            ),
          },
          {
            id: "a11y",
            label: "Accessibilita",
            content: (
              <AccessibilitaInfo
                items={[
                  { label: "aria-pressed", desc: "true/false su ogni chip/card per comunicare lo stato" },
                  { label: "Focus visible", desc: "Outline ring su focus-visible per navigazione keyboard" },
                  { label: "Contrasto", desc: "Check icon su bg primario: minimo 4.5:1 per WCAG AA" },
                  { label: "Reduced motion", desc: "Spring animation si degrada a instant switch" },
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
        title="Editorial Section"
        description="Il pattern scrollytelling che dà ritmo narrativo al flusso build: numero editoriale, titolo serif, sottotitolo in italico, linea decorativa, contenuto."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                {/* Live mini-demo */}
                <div
                  className="p-6 rounded-2xl overflow-hidden"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    {/* Step number */}
                    <span
                      className="type-mono-label"
                      style={{ color: "var(--primary)" }}
                    >
                      01 — Contesto
                    </span>
                    {/* Title */}
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                        lineHeight: 1.1,
                        color: "var(--text-default)",
                      }}
                    >
                      Quando e dove
                    </span>
                    {/* Subtitle */}
                    <span
                      className="font-serif"
                      style={{
                        fontStyle: "italic",
                        color: "var(--muted-foreground)",
                        opacity: 0.65,
                        fontSize: "var(--font-size-2xl)",
                      }}
                    >
                      Tempo, temperatura, stagione
                    </span>
                    {/* Decorative line */}
                    <div
                      className="mt-3"
                      style={{
                        width: "2rem",
                        height: "2px",
                        background: "var(--primary)",
                        opacity: 0.35,
                        borderRadius: "1px",
                      }}
                    />
                  </div>

                  {/* Content placeholder */}
                  <div className="mt-6 flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full"
                        style={{
                          background: "var(--surface-container)",
                          width: `${100 - i * 15}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Anatomy */}
                <SubSectionLabel label="Anatomia StepHeader" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="Step number" val="DM Sans, type-step-num, primary, 0.6875rem, uppercase, tracking 0.18em" />
                  <AnatomyRow prop="Title" val="Playfair Display, clamp(1.75rem, 5vw, 2.5rem), line-height 1.1" />
                  <AnatomyRow prop="Subtitle" val="Playfair italic, muted-foreground, opacity 0.65" />
                  <AnatomyRow prop="Decorative line" val="2rem wide, 2px height, primary, opacity 0.35" />
                  <AnatomyRow prop="Entrance" val="whileInView, once: true, amount: 0.5, stagger 0.08s" />
                  <AnatomyRow prop="ScrollSection" val="IO-driven opacity: 0.45 + focus * 0.55, transition 0.35s ease-out" />
                </div>

                <SubSectionLabel label="Scroll-Snap Structure" />
                <div
                  className="p-5 rounded-2xl flex flex-col gap-3"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  {[
                    { num: "01", name: "Contesto", desc: "Meteo + Quando" },
                    { num: "02", name: "Setup", desc: "Skill + Equipment + Pantry" },
                    { num: "03", name: "Stile", desc: "Grid stili raccomandati" },
                  ].map((s) => (
                    <div
                      key={s.num}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--surface-container)" }}
                    >
                      <span
                        className="type-data"
                        style={{
                          color: "var(--primary)",
                          fontWeight: "var(--weight-bold)" as any,
                          width: "28px",
                          flexShrink: 0,
                        }}
                      >
                        {s.num}
                      </span>
                      <div className="flex flex-col">
                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "var(--font-size-lg)",
                            fontWeight: "var(--weight-semibold)" as any,
                            color: "var(--text-default)",
                          }}
                        >
                          {s.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "var(--font-size-base)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {s.desc}
                        </span>
                      </div>
                      <div
                        className="ml-auto type-code"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        scroll-snap: start
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il pattern Editorial Section crea il ritmo narrativo del flusso build. Ogni sezione ha un'apertura editoriale (StepHeader) seguita dal contenuto funzionale, wrappata in ScrollSection per soft-focus dimming. Le 3 sezioni usano CSS scroll-snap: y mandatory per un flusso verticale cadenzato."
                principi={[
                  "Il numero editoriale (01, 02, 03) in DM Mono orienta l'utente nello step corrente.",
                  "Il titolo serif crea autorevolezza; il sottotitolo italic ammorbidisce il tono.",
                  "La linea decorativa segna il confine tra header e contenuto — mai omessa.",
                  "ScrollSection dimma le sezioni non attive (opacity 0.45) per creare focus visivo.",
                ]}
                quandoUsare="Per qualsiasi flusso multi-step con contenuto narrativo. Non usare per form sequenziali senza contesto (li usare un wizard classico con stepper orizzontale)."
                anatomia={[
                  { parte: "data-section", desc: "Attributo HTML per IntersectionObserver tracking" },
                  { parte: "scroll-snap-align", desc: "start — ogni sezione si aggancia al viewport" },
                  { parte: "min-height", desc: "calc(100dvh - 6rem) per garantire snap funzionale" },
                  { parte: "ScrollSection", desc: "Wrapper IO-driven per opacity dimming" },
                  { parte: "StepHeader", desc: "Numero + titolo + sottotitolo + linea" },
                ]}
              />
            ),
          },
          {
            id: "linee-guida",
            label: "Linee guida",
            content: (
              <LineeGuida
                fai={[
                  "Usare scroll-snap: y mandatory con scroll-margin-top per header sticky",
                  "Wrappare sempre in ScrollSection per dimming coerente",
                  "Usare data-section per il tracking dell'IntersectionObserver",
                  "StepHeader con whileInView animazione — once: true per non ripetere",
                ]}
                nonFare={[
                  "Mai usare scroll-snap senza min-height — la sezione deve riempire il viewport",
                  "Mai omettere la linea decorativa nel StepHeader",
                  "Mai animare ScrollSection con blur() — causa lag su mobile",
                  "Mai usare piu di 4-5 sezioni snap — diventa faticoso navigare",
                ]}
                responsive="Su mobile, min-height garantisce snap. Su desktop, ProgressPill (left edge) indica la posizione. La MobileProgressBar compare sotto lo header come sub-bar segmentata."
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
        title="Progressive Disclosure"
        description="Complessità stratificata: informazioni base per tutti, dettagli avanzati per chi li cerca. Tre livelli: contenuto default, toggle nerd mode, InfoTip contestuale."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                <SubSectionLabel label="Livello 1 — Nerd Mode Toggle" />

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--weight-semibold)" as any,
                        color: "var(--text-default)",
                      }}
                    >
                      Score Dashboard
                    </span>
                    <motion.button
                      onClick={() => setNerdMode(!nerdMode)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer active:scale-95"
                      style={{
                        background: nerdMode
                          ? "color-mix(in srgb, var(--tertiary) 15%, transparent)"
                          : "var(--surface-container)",
                        border: nerdMode
                          ? "1px solid var(--tertiary)"
                          : "1px solid var(--outline-variant)",
                        color: nerdMode
                          ? "var(--tertiary)"
                          : "var(--muted-foreground)",
                        fontSize: "var(--font-size-base)",
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: "var(--weight-semibold)" as any,
                        letterSpacing: "var(--tracking-spread)",
                        textTransform: "uppercase",
                      }}
                      aria-pressed={nerdMode}
                    >
                      <Sparkles size={12} />
                      PizzaNerd
                    </motion.button>
                  </div>

                  {/* Base content */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Composite", value: "87" },
                      { label: "Autenticita", value: "92" },
                      { label: "Fattibilita", value: "78" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="p-3 rounded-xl text-center"
                        style={{ background: "var(--surface-container)" }}
                      >
                        <div
                          className="type-data-lg"
                          style={{ color: "var(--primary)" }}
                        >
                          {m.value}
                        </div>
                        <div
                          className="type-data mt-0.5"
                          style={{ color: "var(--muted-foreground)" }}
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
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-4 p-4 rounded-xl"
                          style={{
                            background:
                              "color-mix(in srgb, var(--tertiary) 6%, transparent)",
                            border:
                              "1px solid color-mix(in srgb, var(--tertiary) 15%, transparent)",
                          }}
                        >
                          <span
                            className="type-mono-label"
                            style={{ color: "var(--tertiary)" }}
                          >
                            Scientific Layer
                          </span>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {[
                              { k: "Q10 model", v: "standard (2.0)" },
                              { k: "FODMAP", v: "-42%" },
                              { k: "Water activity", v: "0.97" },
                              { k: "Gluten network", v: "78/100" },
                            ].map((d) => (
                              <div key={d.k} className="flex justify-between">
                                <span
                                  className="type-code"
                                  style={{ color: "var(--muted-foreground)" }}
                                >
                                  {d.k}
                                </span>
                                <span
                                  className="type-data"
                                  style={{
                                    color: "var(--text-default)",
                                    fontWeight: "var(--weight-semibold)" as any,
                                  }}
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

                <SubSectionLabel label="Livello 2 — Accordion" />

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left active:scale-[0.99] transition-transform cursor-pointer"
                    aria-expanded={accordionOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal
                        size={14}
                        style={{
                          color: accordionOpen
                            ? "var(--text-accent)"
                            : "var(--muted-foreground)",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "var(--font-size-xl)",
                          fontWeight: "var(--weight-semibold)" as any,
                          color: "var(--text-default)",
                        }}
                      >
                        Personalizza parametri
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: accordionOpen ? 180 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      <ChevronDown
                        size={16}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {accordionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 pb-5 pt-3"
                          style={{
                            borderTop:
                              "1px solid var(--outline-variant)",
                          }}
                        >
                          <div className="flex flex-col gap-2">
                            {["Idratazione: 65%", "Farina W: 280", "Fermentazione: 16h"].map(
                              (item) => (
                                <div
                                  key={item}
                                  className="h-2.5 rounded-full"
                                  style={{
                                    background: "var(--surface-container)",
                                    width: "80%",
                                  }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <SubSectionLabel label="Livello 3 — InfoTip" />

                <div
                  className="p-6 rounded-2xl flex items-center gap-3"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-lg)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    Rapporto P/L
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setTipVisible(!tipVisible)}
                      className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                      style={{
                        background: "var(--surface-container)",
                        color: "var(--muted-foreground)",
                      }}
                      aria-expanded={tipVisible}
                      aria-label="Info P/L"
                    >
                      <HelpCircle size={12} />
                    </button>
                    <AnimatePresence>
                      {tipVisible && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="absolute left-0 top-7 z-10 p-3 rounded-xl"
                          style={{
                            width: 220,
                            background: "var(--surface-container)",
                            border: "1px solid var(--outline-variant)",
                            boxShadow: "var(--shadow-md)",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "var(--font-size-base)",
                              lineHeight: "var(--leading-relaxed)",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            Rapporto alveografico tenacita/estensibilita
                            della farina. Stimato dalla W se non modificato.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="Nerd toggle" val="DM Mono, tertiary palette, aria-pressed" />
                  <AnatomyRow prop="Accordion" val="aria-expanded, ChevronDown rotates 180deg, spring 500/30" />
                  <AnatomyRow prop="InfoTip" val="HelpCircle 12px, popover absolute, shadow-md, z-10" />
                  <AnatomyRow prop="Escape" val="Tutti i popover si chiudono con Escape" />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il pattern Progressive Disclosure stratifica la complessita su 3 livelli: contenuto base (sempre visibile), expert mode (toggle), help contestuale (on-demand). Questo permette ai principianti di non essere sopraffatti e agli esperti di trovare profondita."
                principi={[
                  "Il contenuto base deve essere sufficiente per completare il task senza mai aprire nerd mode.",
                  "Nerd mode aggiunge dati, non nasconde funzionalita — mai usarlo per gate-keeping.",
                  "InfoTip e l'ultimo livello: spiegazioni granulari per singolo parametro.",
                  "Ogni livello si apre con AnimatePresence + spring — mai show/hide istantaneo.",
                ]}
                quandoUsare="Quando il contenuto ha audience miste (principianti + esperti). Non usare per nascondere informazioni critiche — quelle devono essere sempre visibili."
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
        title="Floating CTA"
        description="CTA contestuale che evolve con lo stato dell'app: guida lo scroll, invita all'azione, offre alternative nel risultato."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                {/* State switcher */}
                <div className="flex gap-2 flex-wrap">
                  {(["early", "ready", "result"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className="px-3 py-1.5 rounded-lg cursor-pointer active:scale-95"
                      style={{
                        background:
                          state === s
                            ? "var(--primary)"
                            : "var(--surface-container)",
                        color:
                          state === s
                            ? "var(--primary-foreground)"
                            : "var(--muted-foreground)",
                        border:
                          state === s
                            ? "none"
                            : "1px solid var(--outline-variant)",
                        fontSize: "var(--font-size-base)",
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: "var(--weight-semibold)" as any,
                        letterSpacing: "var(--tracking-spread)",
                        textTransform: "uppercase",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Demo */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    height: 180,
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  {/* Simulated page content */}
                  <div className="p-5">
                    <div
                      className="h-2 rounded-full mb-2"
                      style={{
                        background: "var(--surface-container)",
                        width: "60%",
                      }}
                    />
                    <div
                      className="h-2 rounded-full"
                      style={{
                        background: "var(--surface-container)",
                        width: "40%",
                      }}
                    />
                  </div>

                  {/* Floating CTA bar — positioned inside demo */}
                  <div
                    className="absolute bottom-0 left-0 right-0 flex justify-center pb-4"
                    style={{ pointerEvents: "none" }}
                  >
                    <AnimatePresence mode="wait">
                      {state === "early" && (
                        <motion.button
                          key="cta-scroll"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="flex items-center gap-2 h-11 px-7 rounded-full active:scale-[0.97]"
                          style={{
                            pointerEvents: "auto",
                            background: "var(--cta-btn-bg)",
                            color: "var(--cta-btn-text)",
                            boxShadow: "var(--shadow-lg)",
                            fontWeight: "var(--weight-semibold)" as any,
                            fontSize: "var(--font-size-lg)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          Scegli stile
                          <ArrowRight size={14} />
                        </motion.button>
                      )}

                      {state === "ready" && (
                        <motion.button
                          key="cta-generate"
                          initial={{ opacity: 0, y: 12, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="flex items-center gap-2 h-11 px-7 rounded-full active:scale-[0.97]"
                          style={{
                            pointerEvents: "auto",
                            background: "var(--cta-btn-bg)",
                            color: "var(--cta-btn-text)",
                            boxShadow: "var(--shadow-lg)",
                            fontWeight: "var(--weight-semibold)" as any,
                            fontSize: "var(--font-size-lg)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <Sparkles size={13} />
                          Genera ricetta
                        </motion.button>
                      )}

                      {state === "result" && (
                        <motion.div
                          key="cta-result"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          className="flex items-center gap-2.5"
                          style={{ pointerEvents: "auto" }}
                        >
                          <button
                            className="flex items-center gap-2 h-11 px-5 rounded-full active:scale-[0.97]"
                            style={{
                              background: "var(--surface-container)",
                              color: "var(--text-default)",
                              boxShadow: "var(--shadow-md)",
                              fontWeight: "var(--weight-semibold)" as any,
                              fontSize: "var(--font-size-base)",
                              fontFamily: "'DM Sans', sans-serif",
                              border: "1px solid var(--outline-variant)",
                            }}
                          >
                            <Palette size={12} />
                            Cambia stile
                          </button>
                          <button
                            className="flex items-center gap-2 h-11 px-5 rounded-full active:scale-[0.97]"
                            style={{
                              background: "rgba(0,0,0,0)",
                              color: "var(--muted-foreground)",
                              fontWeight: "var(--weight-semibold)" as any,
                              fontSize: "var(--font-size-base)",
                              fontFamily: "'DM Sans', sans-serif",
                              border: "1px solid var(--outline-variant)",
                            }}
                          >
                            <RotateCcw size={12} />
                            Nuova pizza
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* States table */}
                <SubSectionLabel label="State Machine" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <AnatomyRow
                    prop="early"
                    val="TimeSlot selezionato, no stile → 'Scegli stile' (scrollTo styles)"
                  />
                  <AnatomyRow
                    prop="ready"
                    val="Stile selezionato → 'Genera ricetta' (step → result)"
                  />
                  <AnatomyRow
                    prop="result"
                    val="In result step → 'Cambia stile' + 'Nuova pizza'"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="Container" val="fixed bottom-0, z-50, pointer-events-none" />
                  <AnatomyRow prop="Button" val="pointer-events-auto, rounded-full, cta-btn-bg gradient" />
                  <AnatomyRow prop="Shadow" val="cta-btn-shadow-deep per primary, shadow-md per secondary" />
                  <AnatomyRow prop="Transition" val="AnimatePresence mode='wait', spring 400/25" />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il Floating CTA e un action bar contestuale che vive in fondo al viewport. Evolve attraverso 3 stati basati sullo stato dell'app, guidando l'utente nel flusso senza mai bloccare il contenuto (pointer-events-none sul container, auto sui bottoni)."
                principi={[
                  "Il CTA e sempre pertinente allo stato corrente — mai generico.",
                  "Usa AnimatePresence mode='wait' per transizioni pulite tra stati.",
                  "Il container e pointer-events-none; solo i bottoni sono interattivi.",
                  "In result, il CTA secondario ('Nuova pizza') ha meno peso visivo del primario ('Cambia stile').",
                ]}
                quandoUsare="Quando c'e un'azione primaria che deve essere sempre raggiungibile. Non usare per azioni secondarie o navigazione — per quelle c'e lo header."
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
        title="Coachmark → Tooltip"
        description="Educazione al primo accesso che si trasforma in riferimento rapido dopo l'onboarding. Persistenza in localStorage."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
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
                      className="px-3 py-1.5 rounded-lg cursor-pointer active:scale-95"
                      style={{
                        background:
                          phase === p
                            ? "var(--primary)"
                            : "var(--surface-container)",
                        color:
                          phase === p
                            ? "var(--primary-foreground)"
                            : "var(--muted-foreground)",
                        border:
                          phase === p
                            ? "none"
                            : "1px solid var(--outline-variant)",
                        fontSize: "var(--font-size-base)",
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: "var(--weight-semibold)" as any,
                        letterSpacing: "var(--tracking-spread)",
                        textTransform: "uppercase",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Demo */}
                <div
                  className="relative p-6 rounded-2xl"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                    minHeight: 200,
                  }}
                >
                  {/* Fake pill dots */}
                  <div className="flex flex-col items-start gap-2">
                    {["Contesto", "Setup", "Stile"].map((s, i) => (
                      <div key={s} className="flex items-center gap-3">
                        <div
                          className="rounded-full"
                          style={{
                            width: i === 0 ? 22 : 6,
                            height: 6,
                            background:
                              i === 0
                                ? "var(--primary)"
                                : i < 1
                                  ? "var(--muted-foreground)"
                                  : "var(--outline-variant)",
                          }}
                        />
                        {i === 0 && (
                          <span
                            className="type-data"
                            style={{ color: "var(--muted-foreground)" }}
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
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 26,
                        }}
                        className="absolute left-20 top-6 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
                        style={{
                          width: 200,
                          background:
                            phase === "coachmark"
                              ? "var(--surface-container-high)"
                              : "var(--surface-container)",
                          border:
                            phase === "coachmark"
                              ? "1px solid var(--primary)"
                              : "1px solid var(--outline-variant)",
                          boxShadow:
                            phase === "coachmark"
                              ? "var(--shadow-md)"
                              : "var(--shadow-sm)",
                        }}
                      >
                        {phase === "coachmark" && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Lightbulb
                                size={11}
                                style={{ color: "var(--tertiary)" }}
                              />
                              <span
                                className="type-data"
                                style={{
                                  color: "var(--muted-foreground)",
                                }}
                              >
                                1 di 3
                              </span>
                            </div>
                            <button
                              onClick={() => setShowTip(false)}
                              className="cursor-pointer"
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--muted-foreground)",
                                opacity: 0.6,
                                padding: 2,
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}
                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "var(--font-size-base)",
                            lineHeight: "var(--leading-relaxed)",
                            color: "var(--text-default)",
                            fontStyle: "italic",
                          }}
                        >
                          La temperatura della cucina e il tempo guidano
                          tutto il processo.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow
                    prop="Coachmark"
                    val="Auto-appear on unseen section, Lightbulb icon, counter '1 di 3', dismiss X"
                  />
                  <AnatomyRow
                    prop="Auto-dismiss"
                    val="7000ms timeout, persisted in localStorage (vulcan_tips_seen)"
                  />
                  <AnatomyRow
                    prop="Tooltip"
                    val="Post-onboarding: appare su hover, no dismiss X, no counter"
                  />
                  <AnatomyRow
                    prop="Pulsing ring"
                    val="Sul dot attivo durante coachmark: opacity [0.5,0] scale [1,2.2], loop"
                  />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il pattern Coachmark → Tooltip gestisce l'educazione dell'utente nel ProgressPill. Al primo accesso, tip contestuali appaiono automaticamente per ogni sezione (coachmark con contatore e dismiss). Una volta visti tutti e 3, i tip diventano tooltip discreti che appaiono solo su hover."
                principi={[
                  "Il coachmark ha piu peso visivo del tooltip (border primary, shadow-md, Lightbulb icon).",
                  "Il pulsing ring attira l'attenzione sul dot attivo — solo durante il coachmark.",
                  "Persistenza in localStorage: l'utente non rivede i coachmark dopo il primo ciclo.",
                  "L'auto-dismiss (7s) previene che il coachmark blocchi l'interazione.",
                ]}
                quandoUsare="Per onboarding one-time su elementi di navigazione non ovvi. Non usare per educazione critica (li usare un dialog modale)."
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
        title="Sticky Context"
        description="Dashboard metriche che segue lo scroll, adattandosi a desktop (sidebar) e mobile (sub-header sticky con glassmorphism)."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                {/* Visual comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Desktop */}
                  <div
                    className="p-5 rounded-2xl"
                    style={{
                      background: "var(--surface-container-low)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <span
                      className="type-mono-label"
                      style={{ color: "var(--cta)" }}
                    >
                      Desktop — sidebar sticky
                    </span>
                    <div className="mt-3 flex gap-3">
                      {/* Main content */}
                      <div className="flex-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-2 rounded-full mb-2"
                            style={{
                              background: "var(--surface-container)",
                              width: `${100 - i * 10}%`,
                            }}
                          />
                        ))}
                      </div>
                      {/* Sidebar */}
                      <div
                        className="w-20 rounded-xl p-2 flex-shrink-0"
                        style={{
                          background: "var(--surface-container)",
                          border: "1px solid var(--outline-variant)",
                        }}
                      >
                        <div
                          className="type-code text-center"
                          style={{ color: "var(--primary)" }}
                        >
                          Score
                        </div>
                        <div
                          className="w-10 h-10 rounded-full mx-auto mt-2"
                          style={{
                            border: "2px solid var(--primary)",
                          }}
                        />
                        <div
                          className="type-code text-center mt-1"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          sticky
                        </div>
                        <div
                          className="type-code text-center"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          top: 80px
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div
                    className="p-5 rounded-2xl"
                    style={{
                      background: "var(--surface-container-low)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <span
                      className="type-mono-label"
                      style={{ color: "var(--primary)" }}
                    >
                      Mobile — sub-header sticky
                    </span>
                    <div className="mt-3 flex flex-col gap-2">
                      {/* Header */}
                      <div
                        className="h-6 rounded-lg"
                        style={{
                          background: "var(--surface-container)",
                          width: "100%",
                        }}
                      />
                      {/* Sticky bar */}
                      <div
                        className="h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background:
                            "color-mix(in srgb, var(--surface-container) 88%, transparent)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid var(--outline-variant)",
                        }}
                      >
                        <span
                          className="type-code"
                          style={{ color: "var(--primary)" }}
                        >
                          ScoreDashboard compact
                        </span>
                      </div>
                      {/* Content */}
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-2 rounded-full"
                          style={{
                            background: "var(--surface-container)",
                            width: `${100 - i * 15}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow
                    prop="Desktop"
                    val="lg:grid-cols-[1fr_340px], sidebar sticky top-20"
                  />
                  <AnatomyRow
                    prop="Mobile"
                    val="lg:hidden sticky top-14, glassmorphism (blur 20px, saturate 1.4)"
                  />
                  <AnatomyRow
                    prop="Z-index"
                    val="z-30 (sotto header z-50, sopra contenuto)"
                  />
                  <AnatomyRow
                    prop="Nerd mode"
                    val="Toggle PizzaNerd espande radar chart (desktop) o modale fullscreen (mobile)"
                  />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il pattern Sticky Context mantiene le metriche chiave sempre visibili durante lo scroll del risultato. Desktop: sidebar a destra con sticky positioning. Mobile: sub-header compatto con glassmorphism sotto lo header principale."
                principi={[
                  "Le metriche devono essere leggibili in un colpo d'occhio — no scroll interno.",
                  "Su mobile, il dashboard compatto mostra solo il composite score + toggle nerd.",
                  "Il radar chart (nerd mode) si apre in modale fullscreen su mobile (createPortal).",
                  "Z-layering: header (z-50) > sticky dashboard (z-30) > contenuto.",
                ]}
                quandoUsare="Quando il contenuto e lungo e l'utente ha bisogno di un riferimento costante. Non usare per dati che cambiano con lo scroll (li usare un progress indicator)."
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
        title="Build Page Template"
        description="Il template del flusso build: hero + 3 sezioni scroll-snap, ProgressPill laterale su desktop, MobileProgressBar su mobile, floating CTA in basso."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                {/* Visual wireframe */}
                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="relative" style={{ minHeight: 360 }}>
                    {/* Header */}
                    <div
                      className="h-8 rounded-lg flex items-center px-3 justify-between"
                      style={{
                        background:
                          "color-mix(in srgb, var(--surface-container) 88%, transparent)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid var(--outline-variant)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-md"
                          style={{
                            background: "var(--primary)",
                          }}
                        />
                        <span
                          className="type-data"
                          style={{
                            color: "var(--text-default)",
                            fontWeight: "var(--weight-semibold)" as any,
                          }}
                        >
                          Vulcan
                        </span>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ background: "var(--surface-container)" }}
                      />
                    </div>

                    {/* Mobile progress bar */}
                    <div
                      className="mt-1 h-5 rounded-md flex items-center gap-1 px-2"
                      style={{
                        background: "var(--surface-container)",
                        border: "1px solid var(--outline-variant)",
                      }}
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full"
                          style={{
                            background:
                              i === 1
                                ? "var(--primary)"
                                : "var(--outline-variant)",
                          }}
                        />
                      ))}
                      <span
                        className="type-code ml-1"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        mobile only
                      </span>
                    </div>

                    {/* Content area with sections */}
                    <div className="flex mt-3 gap-3">
                      {/* ProgressPill (desktop) */}
                      <div className="flex flex-col items-center gap-1.5 pt-8 flex-shrink-0" style={{ width: 24 }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded-full"
                            style={{
                              width: i === 0 ? 18 : 6,
                              height: 6,
                              background:
                                i === 0
                                  ? "var(--primary)"
                                  : i === 1
                                    ? "var(--muted-foreground)"
                                    : "var(--outline-variant)",
                            }}
                          />
                        ))}
                        <span
                          className="type-code mt-1"
                          style={{
                            color: "var(--muted-foreground)",
                            writingMode: "vertical-lr",
                            fontSize: "8px",
                          }}
                        >
                          desktop
                        </span>
                      </div>

                      {/* Sections */}
                      <div className="flex-1 flex flex-col gap-2">
                        {[
                          { num: "01", name: "Hero + Contesto", h: 70, snap: true },
                          { num: "02", name: "Setup", h: 60, snap: true },
                          { num: "03", name: "Stili", h: 90, snap: true },
                        ].map((s) => (
                          <div
                            key={s.num}
                            className="rounded-xl p-3 flex flex-col"
                            style={{
                              height: s.h,
                              background: "var(--surface-container)",
                              border: "1px solid var(--outline-variant)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="type-mono-label"
                                style={{ color: "var(--primary)" }}
                              >
                                {s.num}
                              </span>
                              {s.snap && (
                                <span
                                  className="type-code"
                                  style={{ color: "var(--muted-foreground)" }}
                                >
                                  snap: start
                                </span>
                              )}
                            </div>
                            <span
                              className="type-data mt-1"
                              style={{ color: "var(--text-default)" }}
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
                        className="h-7 px-5 rounded-full flex items-center gap-1.5"
                        style={{
                          background: "var(--cta-btn-bg)",
                          color: "var(--cta-btn-text)",
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        <Sparkles size={10} />
                        <span
                          className="type-data"
                          style={{
                            color: "var(--cta-btn-text)",
                            fontWeight: "var(--weight-semibold)" as any,
                          }}
                        >
                          CTA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <SubSectionLabel label="Layer Map" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="z-50" val="Header (sticky top-0) + Floating CTA (fixed bottom-0)" />
                  <AnatomyRow prop="z-40" val="ProgressPill (fixed left) + MobileProgressBar (fixed top-14)" />
                  <AnatomyRow prop="z-2" val="Main content (<motion.main>)" />
                  <AnatomyRow prop="z-1" val="FireGlow (ambient background, fixed)" />
                </div>

                <SubSectionLabel label="Composizione Pattern" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="P02" val="Editorial Section — ripetuto 3 volte (context, setup, styles)" />
                  <AnatomyRow prop="P01" val="Selection Pattern — in ogni sezione (chips, cards)" />
                  <AnatomyRow prop="P05" val="Coachmark → Tooltip — nel ProgressPill" />
                  <AnatomyRow prop="P06" val="Floating CTA — bottom bar contestuale" />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il Build Page Template e il layout principale dell'esperienza di configurazione. Tre sezioni scroll-snap verticali (context, setup, styles), ciascuna con un'apertura editoriale (StepHeader), wrappate in ScrollSection per soft-focus. ProgressPill a sinistra su desktop, MobileProgressBar sotto lo header su mobile. Floating CTA in basso guida l'utente verso il passo successivo."
                principi={[
                  "Scroll-snap: y mandatory con scroll-padding-top: 4rem per lo header sticky.",
                  "Ogni sezione ha min-height: calc(100dvh - 6rem) per garantire lo snap.",
                  "ProgressPill e MobileProgressBar si escludono a vicenda (hidden lg:flex / lg:hidden).",
                  "FireGlow come sfondo animato reagisce alla sezione attiva (intensita crescente).",
                ]}
                quandoUsare="Per qualsiasi flusso multi-step che richiede un'esperienza immersiva con contesto persistente. Non usare per form brevi (< 3 step) o configurazioni rapide."
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
        title="Result Page Template"
        description="Il template del risultato: header cinematografico, main + sidebar su desktop, metriche sticky su mobile, floating bottom bar."
      />

      <SectionTabs
        tabs={[
          {
            id: "specifiche",
            label: "Specifiche",
            content: (
              <div className="flex flex-col gap-8">
                {/* Visual wireframe */}
                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="flex flex-col gap-2" style={{ minHeight: 400 }}>
                    {/* Cinematic header */}
                    <div
                      className="relative rounded-xl overflow-hidden"
                      style={{ height: 100 }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)",
                          opacity: 0.3,
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to top, var(--surface-container-low) 0%, rgba(0,0,0,0) 60%)",
                        }}
                      />
                      <div className="absolute bottom-2 left-3">
                        <span
                          className="type-mono-label"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          La tua pizza perfetta
                        </span>
                        <div
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "var(--font-size-4xl)",
                            color: "var(--text-default)",
                            lineHeight: 1.1,
                          }}
                        >
                          Napoletana STG
                        </div>
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
                              className="flex-1 p-2 rounded-lg text-center"
                              style={{ background: "var(--surface-container)" }}
                            >
                              <span
                                className="type-data"
                                style={{
                                  color: "var(--primary)",
                                  fontWeight: "var(--weight-bold)" as any,
                                }}
                              >
                                {stat}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Fine-tuning accordion */}
                        <div
                          className="p-2.5 rounded-lg"
                          style={{
                            background: "var(--surface-container)",
                            border: "1px solid var(--outline-variant)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="type-data" style={{ color: "var(--text-default)" }}>
                              Fine-tuning
                            </span>
                            <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
                          </div>
                        </div>
                        {/* Recipe content */}
                        <div
                          className="p-2.5 rounded-lg flex-1"
                          style={{ background: "var(--surface-container)" }}
                        >
                          <span className="type-data" style={{ color: "var(--text-default)" }}>
                            Ingredienti + Timeline
                          </span>
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-1.5 rounded-full mt-2"
                              style={{
                                background: "var(--outline-variant)",
                                width: `${90 - i * 12}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Sidebar (desktop) */}
                      <div
                        className="w-20 flex-shrink-0 rounded-xl p-2"
                        style={{
                          background: "var(--surface-container)",
                          border: "1px solid var(--outline-variant)",
                        }}
                      >
                        <span className="type-code" style={{ color: "var(--primary)" }}>
                          Score
                        </span>
                        <div
                          className="w-12 h-12 rounded-full mx-auto mt-2"
                          style={{ border: "2px solid var(--primary)" }}
                        />
                        <div className="flex flex-col gap-1 mt-2">
                          {["Auth", "Feas", "Dig"].map((s) => (
                            <div
                              key={s}
                              className="h-1 rounded-full"
                              style={{ background: "var(--outline-variant)" }}
                            />
                          ))}
                        </div>
                        <span
                          className="type-code block text-center mt-2"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          sticky
                        </span>
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex justify-center gap-2 mt-2">
                      <div
                        className="h-6 px-4 rounded-full flex items-center gap-1"
                        style={{
                          background: "var(--surface-container)",
                          border: "1px solid var(--outline-variant)",
                        }}
                      >
                        <Palette size={9} />
                        <span className="type-code" style={{ color: "var(--text-default)" }}>
                          Cambia
                        </span>
                      </div>
                      <div
                        className="h-6 px-4 rounded-full flex items-center gap-1"
                        style={{ border: "1px solid var(--outline-variant)" }}
                      >
                        <RotateCcw size={9} />
                        <span className="type-code" style={{ color: "var(--muted-foreground)" }}>
                          Reset
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <SubSectionLabel label="Layout Grid" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="Desktop" val="lg:grid-cols-[1fr_340px] lg:gap-12 xl:gap-16" />
                  <AnatomyRow prop="Mobile" val="Singola colonna, sidebar hidden" />
                  <AnatomyRow prop="Photo header" val="max-height: 55vh, min-height: 280px, object-cover" />
                  <AnatomyRow prop="Scrim" val="Gradient to bottom: transparent → background, testo overlay con text-shadow" />
                </div>

                <SubSectionLabel label="Composizione Pattern" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <AnatomyRow prop="P04" val="Sticky Context — ScoreDashboard sidebar/sub-header" />
                  <AnatomyRow prop="P03" val="Progressive Disclosure — Nerd mode + accordion + InfoTip" />
                  <AnatomyRow prop="P06" val="Floating CTA — 'Cambia stile' + 'Nuova pizza'" />
                  <AnatomyRow prop="VPL-008" val="Focus management — heading riceve focus su transizione" />
                </div>
              </div>
            ),
          },
          {
            id: "panoramica",
            label: "Panoramica",
            content: (
              <Panoramica
                descrizione="Il Result Page Template presenta la ricetta generata con un'apertura cinematografica (foto editoriale + scrim + titolo overlay), seguita da un layout main + sidebar su desktop. La sidebar ospita il ScoreDashboard sticky; su mobile, diventa un sub-header compatto. Sotto il contenuto principale: stat strip, fine-tuning accordion, ingredienti e timeline procedurale."
                principi={[
                  "L'header cinematografico crea il momento 'wow' — mai omettere la foto.",
                  "Il testo overlay usa text-shadow per leggibilita su qualsiasi foto.",
                  "La sidebar sticky si ferma a top: 80px (sotto header 64px + margine).",
                  "Focus management: l'heading h2 riceve focus su transizione build → result (VPL-008).",
                ]}
                quandoUsare="Per la presentazione di un risultato complesso con metriche di supporto. Non usare per risultati semplici (es. un singolo valore) — li basta un success state inline."
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
  { id: "pat-selection", label: "Selection Pattern", group: "p", Component: SelectionPatternSpec },
  { id: "pat-editorial", label: "Editorial Section", group: "p", Component: EditorialSectionSpec },
  { id: "pat-disclosure", label: "Progressive Disclosure", group: "p", Component: ProgressiveDisclosureSpec },
  { id: "pat-floating-cta", label: "Floating CTA", group: "p", Component: FloatingCTASpec },
  { id: "pat-coachmark", label: "Coachmark → Tooltip", group: "p", Component: CoachmarkTooltipSpec },
  { id: "pat-sticky", label: "Sticky Context", group: "p", Component: StickyContextSpec },
  { id: "tmpl-build", label: "Build Page Template", group: "p", Component: BuildTemplateSpec },
  { id: "tmpl-result", label: "Result Page Template", group: "p", Component: ResultTemplateSpec },
];
