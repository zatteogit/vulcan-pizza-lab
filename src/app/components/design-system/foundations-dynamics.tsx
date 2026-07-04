import React, { useState, useRef, useEffect } from "react";
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

/* ═══ 05: ELEVAZIONE ═══ */
const SHADOWS = [
  { name: "elevation-0", desc: "Base, nessuna ombra", value: "none" },
  { name: "elevation-1", desc: "Card a riposo", value: "var(--shadow-sm)" },
  { name: "elevation-2", desc: "Card in hover", value: "var(--shadow-md)" },
  { name: "elevation-3", desc: "Modale, dialog", value: "var(--shadow-lg)" },
  { name: "glow", desc: "Focus ring primario", value: "var(--shadow-glow)" },
  { name: "glow-lg", desc: "Focus ring intenso", value: "var(--elevation-glow-lg)" },
  { name: "cta", desc: "Bottone CTA", value: "var(--shadow-cta)" },
];

function ElevationSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Elevazione" description="Ombre editoriali morbide. Light mode usa rgba(28,25,23), dark mode rgba(0,0,0) per profondità reale. Glow separati per focus e CTA." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il sistema di elevazione usa ombre calde per comunicare profondità senza distaccare gli elementi dal contesto. In dark mode il colore base dell'ombra cambia per mantenere la leggibilità."
        principi={[
          "7 livelli: da elevation-0 (piatto) a elevation-3 (modale), più glow e CTA",
          "Nessun box-shadow di default — ombre solo su elementi floating o interattivi",
          "Glow separato per focus ring (accessibilità) e CTA (richiamo visivo)",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SHADOWS.map((s) => (
          <motion.div
            key={s.name}
            className="p-5 rounded-2xl cursor-pointer active:scale-98 transition-transform"
            style={{ background: "var(--surface-container-low)", boxShadow: s.value === "none" ? "none" : s.value, border: "1px solid var(--outline-variant)" }}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", marginBottom: "0.25rem" }}>{s.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)" }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare elevation-1 per card a riposo, elevation-2 in hover",
          "Usare glow per focus ring su elementi interattivi",
          "Mantenere coerenza: stesso livello per elementi allo stesso piano",
        ]}
        nonFare={[
          "Mai ombre su elementi inline o testo",
          "Mai box-shadow hardcoded — usare i token",
          "Mai elevation-3 su più di un elemento contemporaneamente",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Focus glow", desc: "Il glow primario garantisce visibilità del focus anche su sfondi complessi." },
        { label: "Contrasto", desc: "Le ombre non devono essere l'unico indicatore di profondità — usare anche bordi." },
      ]} />
    </div>
  );
}

/* ═══ 06: STATE LAYERS ═══ */
const STATE_LAYERS = [
  { name: "Enabled", opacity: "0%", color: "rgba(0,0,0,0)" },
  { name: "Hover", opacity: "8%", color: "var(--primary)" },
  { name: "Focus / Press", opacity: "12%", color: "var(--primary)" },
  { name: "Dragged", opacity: "16%", color: "var(--primary)" },
];

function StateLayersSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="State Layers" description="Overlay tonali M3 per feedback interazione. Il colore dell'overlay è sempre il colore on-surface del componente." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="I state layers comunicano visivamente lo stato interattivo di un elemento sovrapponendo un colore semitrasparente. Il pattern M3 usa il colore on-surface dell'elemento come tinta dell'overlay."
        principi={[
          "4 stati: Enabled (0%), Hover (8%), Focus/Press (12%), Dragged (16%)",
          "Il colore dell'overlay è sempre il colore on-surface del componente, non un grigio generico",
          "Gli stati si compongono: un chip attivo + hover = primary bg + 8% overlay",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="grid grid-cols-4 gap-3">
        {STATE_LAYERS.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}>
              <div className="absolute inset-0" style={{ background: s.color, opacity: parseFloat(s.opacity) / 100 }} />
              <Star size={24} style={{ color: "var(--primary)", position: "relative", zIndex: 1 }} />
            </div>
            <div className="text-center">
              <div className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{s.name}</div>
              <div className="type-code" style={{ color: "var(--muted-foreground)" }}>{s.opacity}</div>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare color-mix() per sovrapporre lo state layer al background",
          "Mantenere le percentuali M3: 8% hover, 12% press, 16% drag",
          "Testare gli stati in entrambi i temi (light e dark)",
        ]}
        nonFare={[
          "Mai cambiare il colore base dell'elemento — solo sovrapporre l'overlay",
          "Mai usare opacity CSS sull'intero elemento — solo sullo state layer",
          "Mai omettere lo stato hover su elementi interattivi",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Visibilità", desc: "Lo state layer deve essere percepibile anche con daltonismo — il cambio di luminosità è sufficiente." },
        { label: "Focus", desc: "Lo stato focus (12%) si somma al focus ring per doppia indicazione." },
      ]} />
    </div>
  );
}

/* ═══ 07: MOTION SYSTEM ═══ */
const SPRING_GROUPS = [
  {
    category: "Micro-interactions (chip, toggle, tooltip)",
    items: [
      { name: "snappy", stiffness: 500, damping: 25, mass: 0.8, use: "Chip select, tooltips" },
      { name: "responsive", stiffness: 400, damping: 25, mass: 1.0, use: "Buttons, focus ring" },
    ],
  },
  {
    category: "Layout shifts (card, accordion, panel)",
    items: [
      { name: "smooth", stiffness: 300, damping: 30, mass: 1.0, use: "Accordion, height" },
      { name: "gentle", stiffness: 200, damping: 22, mass: 1.2, use: "Page transition, hero" },
    ],
  },
  {
    category: "Decorative (blob, glow, background)",
    items: [
      { name: "organic", stiffness: 100, damping: 15, mass: 1.5, use: "DoughBlob morph, FireGlow" },
      { name: "bounce", stiffness: 600, damping: 12, mass: 0.6, use: "Score ring enter, check icon" },
    ],
  },
];

const MOTION_PATTERNS = [
  { pattern: "whileTap", code: "scale: 0.95", desc: "Feedback tattile bottoni/chip" },
  { pattern: "whileInView", code: "once: true, amount: 0.5", desc: "Entrance animation sezioni" },
  { pattern: "AnimatePresence", code: "mode='wait'", desc: "Transizioni pagina con exit" },
  { pattern: "layoutId", code: "'tabIndicator'", desc: "Shared layout per tab/nav pill" },
];

function MotionSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Motion System" description="Spring Physics + curve Emphasized. Le animazioni comunicano peso, urgenza e personalità. Sempre motion/react, mai CSS transitions per entrance." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il motion system di Vulcan è basato su fisica spring: ogni animazione ha peso (mass), rigidità (stiffness) e smorzamento (damping). Le animazioni non sono decorative — comunicano la natura dell'interazione."
        principi={[
          "Mai duration/ease — sempre spring con stiffness/damping/mass",
          "Micro-interactions (chip, toggle): spring snappy (500/25/0.8)",
          "Layout shifts (accordion, panel): spring smooth (300/30/1.0)",
          "Decorative (blob, glow): spring organic (100/15/1.5)",
        ]}
      />
      {SPRING_GROUPS.map((group) => (
        <div key={group.category}>
          <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>{group.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map((s) => (
              <div key={s.name} className="surface-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{s.name}</span>
                  <motion.div
                    className="w-5 h-5 rounded-full"
                    style={{ background: "var(--primary)" }}
                    animate={{ x: 20 }}
                    transition={{ type: "spring", stiffness: s.stiffness, damping: s.damping, mass: s.mass, repeat: Infinity, repeatType: "mirror", repeatDelay: 1.5 }}
                  />
                </div>
                <div className="flex gap-3 type-data" style={{ color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>
                  <span>stiffness: {s.stiffness}</span>
                  <span>damping: {s.damping}</span>
                  <span>mass: {s.mass}</span>
                </div>
                <p className="mt-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{s.use}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Key patterns */}
      <div className="surface-card p-4">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Pattern Chiave</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {MOTION_PATTERNS.map((p) => (
            <div key={p.pattern} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>{p.pattern}</code>
              <span className="type-code" style={{ color: "var(--muted-foreground)", marginLeft: "8px" }}>{p.code}</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-body)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare motion/react per tutte le entrance animation",
          "whileTap={{ scale: 0.95 }} su tutti gli elementi interattivi",
          "whileInView con once: true per evitare ri-animazioni",
          "AnimatePresence mode='wait' per transizioni di pagina",
        ]}
        nonFare={[
          "Mai CSS transitions per entrance animation — solo motion/react",
          "Mai duration/ease nelle transition — solo spring physics",
          "Mai animare colori direttamente su motion.div — usare CSS transition separata",
          "Mai importare da 'framer-motion' — sempre 'motion/react'",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Reduced motion", desc: "prefers-reduced-motion: le spring diventano instant, nessuna animazione decorativa." },
        { label: "Vestibolare", desc: "Nessuna animazione con scroll parallax o rotazione continua." },
      ]} />
    </div>
  );
}

/* ═══ 08: ICONOGRAFIA ═══ */
const ICON_SETS = [
  { icons: [Flame, Timer, Wheat, MapPin, Sun, Moon, Heart], label: "Food & Context" },
  { icons: [Settings, Search, Eye, Copy, HelpCircle, Lightbulb, Zap], label: "UI & Actions" },
  { icons: [ChevronDown, ChevronRight, Plus, X, Check, Home, Star], label: "Navigation" },
];

const ICON_SIZES = [
  { size: 16, name: "Small", use: "Badge, inline" },
  { size: 20, name: "Medium", use: "Bottoni, chip" },
  { size: 24, name: "Large", use: "Header, nav" },
];

function IconographySection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Iconografia" description="Lucide React, stroke 2px, 4 taglie standard. Colore via CSS custom property, mai fill di default." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Vulcan usa Lucide React come libreria icone: stroke-based, 24x24 viewBox, consistente con lo stile editoriale. Il colore è sempre ereditato via CSS custom property."
        principi={[
          "3 taglie standard: 16px (small), 20px (medium), 24px (large)",
          "Stroke 2px costante, mai fill — tranne per stati attivi espliciti",
          "Colore via style={{ color: 'var(--token)' }}, mai fill o className colore",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ICON_SIZES.map((s) => (
          <div key={s.name} className="surface-card p-4 flex items-center gap-3">
            <Flame size={s.size} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <div>
              <div className="type-data" style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{s.name} · {s.size}px</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{s.use}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="surface-card p-5">
        {ICON_SETS.map((set) => (
          <div key={set.label} className="mb-4 last:mb-0">
            <span className="type-label" style={{ marginBottom: "0.5rem", display: "block" }}>{set.label}</span>
            <div className="flex flex-wrap gap-3">
              {set.icons.map((Icon, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  style={{ background: "var(--surface-container)" }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Icon size={18} style={{ color: "var(--icon-default)" }} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare aria-label su bottoni con sole icone",
          "Taglie coerenti: 16px per inline, 20px per UI, 24px per header",
          "Colore via CSS custom property per coerenza tema",
        ]}
        nonFare={[
          "Mai icone decorative senza significato — usare aria-hidden",
          "Mai mischiare taglie nella stessa riga",
          "Mai fill di default — solo stroke-based",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "aria-label obbligatorio su bottoni icona. aria-hidden='true' per icone decorative." },
        { label: "Contrasto", desc: "Minimo 3:1 per icone informative (WCAG AA per non-testo)." },
      ]} />
    </div>
  );
}

/* ═══ 09: GRADIENTI + TIME-OF-DAY ═══ */
const GRADIENTS = [
  { name: "grad-ember", desc: "Logo, brand, composite score banner", cssVar: "--grad-ember" },
  { name: "grad-sage", desc: "Bottone CTA principale", cssVar: "--grad-sage" },
  { name: "grad-warm", desc: "Background sezioni, surface overlay", cssVar: "--grad-warm" },
];

const TIME_SLOTS = [
  { name: "tonight", label: "Stasera", cssVar: "--time-tonight", softVar: "--time-tonight-soft" },
  { name: "lunch", label: "Pranzo", cssVar: "--time-lunch", softVar: "--time-lunch-soft" },
  { name: "dinner", label: "Cena", cssVar: "--time-dinner", softVar: "--time-dinner-soft" },
  { name: "dayafter", label: "Domani", cssVar: "--time-dayafter", softVar: "--time-dayafter-soft" },
  { name: "weekend", label: "Weekend", cssVar: "--time-weekend", softVar: "--time-weekend-soft" },
];

function GradientsSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Gradienti" description="3 gradienti semantici: ember per brand, sage per CTA, warm per background. Tutti duali Light/Dark." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Tre gradienti semantici coprono tutti i casi d'uso: ember (brand/logo), sage (CTA/azioni), warm (sfondi/superfici). Ognuno ha varianti Light e Dark automatiche."
        principi={[
          "grad-ember: terracotta → arancio → ambra — identità brand, logo, score banner",
          "grad-sage: salvia → salvia chiaro — bottoni CTA, conferme, successo",
          "grad-warm: parchment tonal — sfondi sezione, surface overlay",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {GRADIENTS.map((g) => (
          <div key={g.name} className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--outline-variant)" }}>
            <div className="h-20" style={{ background: `var(${g.cssVar})` }} />
            <div className="p-3" style={{ background: "var(--surface-container)" }}>
              <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>{g.name}</code>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "2px", lineHeight: "var(--leading-body)" }}>{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare i token CSS (var(--grad-ember)) per referenziare i gradienti",
          "Sovrapporre gradienti con opacity per effetti sottili",
          "Testare in entrambi i temi — i gradienti si adattano automaticamente",
        ]}
        nonFare={[
          "Mai creare gradienti custom con hex hardcoded",
          "Mai usare gradienti su testo (leggibilità scarsa)",
          "Mai grad-ember per CTA — usare grad-sage",
        ]}
      />
    </div>
  );
}

function TimePaletteSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Time-of-Day Palette" description="5 colori unici per time slot con variante -soft. Usati nei chip di selezione oraria e nelle illustrazioni contestuali." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Ogni time slot (stasera, pranzo, cena, domani, weekend) ha un colore dedicato con variante -soft per sfondi. Questo sistema comunica visivamente la dimensione temporale della ricetta."
        principi={[
          "5 slot: tonight (caldo), lunch (solare), dinner (intenso), dayafter (fresco), weekend (rilassato)",
          "Ogni colore ha una variante -soft per background chip e card",
          "I colori sono pensati per essere distinguibili anche con daltonismo",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="grid grid-cols-5 gap-2">
        {TIME_SLOTS.map((t) => (
          <div key={t.name} className="flex flex-col gap-1">
            <div className="h-14 rounded-xl" style={{ background: `var(${t.cssVar})` }} />
            <div className="h-8 rounded-lg" style={{ background: `var(${t.softVar})` }} />
            <div className="text-center mt-1">
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{t.label}</div>
              <div className="type-data" style={{ color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>{t.name}</div>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare il colore -soft come background dei chip time slot",
          "Usare il colore pieno come accento/bordo del chip selezionato",
          "Accompagnare sempre il colore con un'etichetta testuale",
        ]}
        nonFare={[
          "Mai usare i colori time-of-day fuori dal contesto temporale",
          "Mai veicolare informazioni solo tramite il colore — aggiungere testo",
          "Mai mescolare colori time-of-day con i ruoli semantici",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Colore + testo", desc: "Il colore time-of-day è sempre accompagnato da label testuale. Mai solo colore." },
        { label: "Contrasto", desc: "I colori -soft hanno contrasto sufficiente con il testo foreground in entrambi i temi." },
      ]} />
    </div>
  );
}

/* ═══ 12: ACCESSIBILITÀ ═══ */
function AccessibilitySection() {
  const [focusSource, setFocusSource] = useState<Record<string, "keyboard" | "click" | null>>({});

  const CONTRAST_PAIRS = [
    { fg: "var(--text-default)", bg: "var(--container-page)", label: "Text Default / Page", level: "AAA" },
    { fg: "var(--primary)", bg: "var(--container-page)", label: "Primary / Page", level: "AA" },
    { fg: "var(--cta-foreground)", bg: "var(--cta)", label: "CTA Foreground / CTA", level: "AAA" },
    { fg: "var(--primary-foreground)", bg: "var(--primary)", label: "Primary FG / Primary", level: "AAA" },
    { fg: "var(--muted-foreground)", bg: "var(--container-page)", label: "Muted FG / Page", level: "AA" },
  ];

  const FOCUS_SPECIMENS = [
    { id: "filled", label: "Filled Button", variant: "filled" as const },
    { id: "outlined", label: "Outlined Button", variant: "outlined" as const },
    { id: "chip", label: "Chip", variant: "chip" as const },
    { id: "input", label: "Input Field", variant: "input" as const },
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

  const focusRingStyle = (id: string): React.CSSProperties => {
    const src = focusSource[id];
    if (!src) return {};
    return { outline: "3px solid var(--primary)", outlineOffset: "2px" };
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
        style={{
          position: "absolute",
          top: "-22px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--weight-semibold)" as any,
          padding: "2px 8px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          background: isKb
            ? "color-mix(in srgb, var(--cta) 15%, transparent)"
            : "color-mix(in srgb, var(--tertiary) 15%, transparent)",
          color: isKb ? "var(--cta)" : "var(--tertiary)",
        }}
      >
        {isKb ? "⌨ :focus-visible" : "🖱 :focus (click)"}
      </motion.span>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Accessibilità" description="Focus ring 3px Primary con offset 2px. Visibile solo via tastiera (:focus-visible). Contrasto WCAG AA/AAA. prefers-reduced-motion rispettato." />

      {/* Focus ring demonstration */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Focus Ring — Naviga con Tab o clicca</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", marginTop: "6px", lineHeight: "var(--leading-relaxed)" }}>
          Premi <kbd style={{ padding: "1px 5px", borderRadius: "4px", background: "var(--surface-container)", border: "1px solid var(--outline-variant)", fontSize: "var(--font-size-base)" }}>Tab</kbd> per navigare — il badge verde indica focus reale da tastiera. Il click mostra il ring come anteprima visiva (badge ambra).
        </p>
        <div className="mt-4 flex flex-wrap gap-6">
          {FOCUS_SPECIMENS.map((spec) => {
            const ring = focusRingStyle(spec.id);

            if (spec.variant === "filled") {
              return (
                <div key={spec.id} className="flex flex-col items-center gap-1.5" style={{ position: "relative" }}>
                  {focusBadge(spec.id)}
                  <motion.button
                    onFocus={() => handleFocus(spec.id)}
                    onBlur={() => handleBlur(spec.id)}
                    className="active:scale-95 transition-transform"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "10px 24px", borderRadius: "9999px",
                      background: "var(--primary)", color: "var(--primary-foreground)",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any,
                      border: "none", cursor: "pointer", outline: "none",
                      ...ring,
                    }}
                  >
                    {spec.label}
                  </motion.button>
                </div>
              );
            }
            if (spec.variant === "outlined") {
              return (
                <div key={spec.id} className="flex flex-col items-center gap-1.5" style={{ position: "relative" }}>
                  {focusBadge(spec.id)}
                  <motion.button
                    onFocus={() => handleFocus(spec.id)}
                    onBlur={() => handleBlur(spec.id)}
                    className="active:scale-95 transition-transform"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "10px 24px", borderRadius: "9999px",
                      background: "rgba(0,0,0,0)", color: "var(--primary)",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any,
                      border: "1px solid var(--outline-variant)", cursor: "pointer", outline: "none",
                      ...ring,
                    }}
                  >
                    {spec.label}
                  </motion.button>
                </div>
              );
            }
            if (spec.variant === "chip") {
              return (
                <div key={spec.id} className="flex flex-col items-center gap-1.5" style={{ position: "relative" }}>
                  {focusBadge(spec.id)}
                  <motion.button
                    onFocus={() => handleFocus(spec.id)}
                    onBlur={() => handleBlur(spec.id)}
                    className="active:scale-95 transition-transform"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "10px 16px", borderRadius: "0.75rem",
                      background: "var(--surface-container)", color: "var(--text-default)",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-medium)" as any,
                      border: "1px solid var(--outline-variant)", cursor: "pointer", outline: "none",
                      ...ring,
                    }}
                  >
                    {spec.label}
                  </motion.button>
                </div>
              );
            }
            return (
              <div key={spec.id} className="flex flex-col items-center gap-1.5" style={{ position: "relative" }}>
                {focusBadge(spec.id)}
                <input
                  type="text"
                  placeholder="Input text..."
                  onFocus={() => handleFocus(spec.id)}
                  onBlur={() => handleBlur(spec.id)}
                  readOnly
                  style={{
                    padding: "10px 16px", borderRadius: "0.75rem",
                    background: "var(--surface-container)", color: "var(--text-default)",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)",
                    border: "1px solid var(--outline-variant)", cursor: "pointer",
                    width: "180px", outline: "none",
                    ...ring,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-col gap-1.5">
          {[
            { prop: "outline", val: "3px solid var(--primary)" },
            { prop: "outline-offset", val: "2px" },
            { prop: "trigger", val: ":focus-visible (solo tastiera — badge verde)" },
            { prop: "click preview", val: ":focus via mouse (badge ambra — anteprima visiva)" },
            { prop: "fallback", val: ":focus per browser senza :focus-visible" },
          ].map((a) => (
            <div key={a.prop} className="flex items-baseline gap-2">
              <span className="type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any, width: "90px", flexShrink: 0 }}>{a.prop}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{a.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contrast pairs */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Contrasto WCAG — Coppie principali</span>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTRAST_PAIRS.map((pair) => (
            <div key={pair.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-container)" }}>
              <div className="flex items-center justify-center rounded-lg" style={{ width: "48px", height: "32px", background: pair.bg, border: "1px solid var(--outline-variant)" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-bold)" as any, color: pair.fg }}>Aa</span>
              </div>
              <div className="flex-1 min-w-0">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, display: "block" }}>{pair.label}</span>
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-bold)" as any, padding: "2px 8px", borderRadius: "6px",
                background: pair.level === "AAA"
                  ? "color-mix(in srgb, var(--cta) 15%, transparent)"
                  : "color-mix(in srgb, var(--tertiary) 15%, transparent)",
                color: pair.level === "AAA" ? "var(--cta)" : "var(--tertiary)",
              }}>
                {pair.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reduced motion */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>prefers-reduced-motion</span>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { component: "FireGlow", behavior: "Static wash (nessuna animazione fiamma)", status: "ok" },
            { component: "DoughBlob", behavior: "Shape statica con borderRadius fisso, nessun morph/glow/satellite", status: "ok" },
            { component: "ScrollSection", behavior: "Opacity sempre 1, nessun dimming", status: "ok" },
            { component: "StepHeader", behavior: "Testo visibile senza whileInView", status: "ok" },
            { component: "Motion (globale)", behavior: "Spring transitions diventano instant", status: "ok" },
          ].map((item) => (
            <div key={item.component} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-bold)" as any, padding: "2px 6px", borderRadius: "4px",
                background: item.status === "ok"
                  ? "color-mix(in srgb, var(--cta) 15%, transparent)"
                  : "color-mix(in srgb, var(--tertiary) 15%, transparent)",
                color: item.status === "ok" ? "var(--cta)" : "var(--tertiary)",
                flexShrink: 0,
              }}>
                {item.status === "ok" ? "OK" : "WIP"}
              </span>
              <span className="type-code" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)", width: "100px", flexShrink: 0 }}>{item.component}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", flex: 1 }}>{item.behavior}</span>
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
  { id: "elevation", label: "Elevazione", group: "f", Component: ElevationSection },
  { id: "states", label: "State Layers", group: "f", Component: StateLayersSection },
  { id: "motion", label: "Motion System", group: "f", Component: MotionSection },
  { id: "icons", label: "Iconografia", group: "f", Component: IconographySection },
  { id: "gradients", label: "Gradienti", group: "f", Component: GradientsSection },
  { id: "time-palette", label: "Time-of-Day Palette", group: "f", Component: TimePaletteSection },
  { id: "a11y", label: "Accessibilità", group: "f", Component: AccessibilitySection },
];