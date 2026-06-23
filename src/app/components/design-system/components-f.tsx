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

/* ═══════════════════════════════════════════════════════════
   C17 — FAB / EXTENDED FAB  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const FAB_VARIANTS = [
  { id: "standard", label: "Standard", size: 56, iconSize: 24, radius: "28px", showLabel: false },
  { id: "small", label: "Small", size: 40, iconSize: 20, radius: "12px", showLabel: false },
  { id: "large", label: "Large", size: 96, iconSize: 36, radius: "28px", showLabel: false },
  { id: "extended", label: "Extended", size: 56, iconSize: 20, radius: "28px", showLabel: true },
];

const FAB_COLORS = [
  { id: "primary", label: "Primary", bg: "var(--primary-container)", fg: "var(--on-primary-container)", shadow: "var(--shadow-md)" },
  { id: "surface", label: "Surface", bg: "var(--surface-container-high)", fg: "var(--primary)", shadow: "var(--shadow-md)" },
  { id: "tertiary", label: "Tertiary", bg: "var(--tertiary-container)", fg: "var(--on-tertiary-container)", shadow: "var(--shadow-md)" },
];

export function FABSpec() {
  const [activeVariant, setActiveVariant] = useState("standard");
  const [activeColor, setActiveColor] = useState("primary");
  const [fabPressed, setFabPressed] = useState(false);

  const variant = FAB_VARIANTS.find((v) => v.id === activeVariant)!;
  const color = FAB_COLORS.find((c) => c.id === activeColor)!;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="FAB / Extended FAB"
        description="Floating Action Button — l'azione primaria della schermata. M3 Expressive: il FAB morfa forma e dimensione. Radius organici (non cerchio perfetto per Large), shadow reattiva al press."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il FAB è il bottone flottante per l'azione primaria. 3 varianti: Standard (56px cerchio), Small (40px), Extended (rettangolo con label). 3 colori: Primary, Surface, Tertiary. Shadow e scale reagiscono al press."
        principi={[
          "Un solo FAB per schermata — è l'azione principale",
          "Shadow reattiva: elevation-2 rest, elevation-1 press, elevation-3 hover",
          "Extended FAB mostra label + icona per chiarezza",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Variant selector */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Varianti FAB</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {FAB_VARIANTS.map((v) => (
            <CtaButton
              key={v.id}
              variant="secondary"
              radius="xl"
              onClick={() => setActiveVariant(v.id)}
              className="px-4 py-2"
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: activeVariant === v.id ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                background: activeVariant === v.id ? "var(--primary)" : "var(--surface-container)",
                color: activeVariant === v.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                border: activeVariant === v.id ? "1px solid var(--primary)" : "1px solid var(--outline-variant)",
              }}
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
              className="px-3 py-1.5 flex items-center gap-2"
              style={{
                background: activeColor === c.id ? c.bg : "var(--surface-container)",
                color: activeColor === c.id ? c.fg : "var(--muted-foreground)",
                border: activeColor === c.id ? `1px solid ${c.fg}` : "1px solid var(--outline-variant)",
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{
                background: activeColor === c.id ? c.fg : c.bg,
                border: activeColor === c.id ? `2px solid ${c.fg}` : "1px solid var(--outline-variant)",
              }} />
              {c.label}
            </CtaButton>
          ))}
        </div>

        {/* FAB preview */}
        <div className="mt-6 flex items-center justify-center" style={{ minHeight: "140px" }}>
          <Fab
            variant={activeVariant as any}
            color={activeColor as any}
            icon={<Plus size={variant.iconSize} />}
            label="Nuova ricetta"
          />
        </div>
      </Surface>

      {/* All FAB sizes side by side */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Scala completa</span>
        <div className="mt-4 flex items-end gap-6 justify-center flex-wrap">
          {FAB_VARIANTS.map((v) => (
            <div key={v.id} className="flex flex-col items-center gap-2">
              <Fab
                variant={v.id as any}
                icon={<Plus size={v.iconSize} />}
                label="Crea"
              />
              <span className="type-code" style={{ color: "var(--muted-foreground)" }}>
                {v.label} · {v.size}px
              </span>
            </div>
          ))}
        </div>
      </Surface>

      {/* Anatomy */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia FAB</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Container" val="primary-container (default), surface-container-high, tertiary-container" />
          <AnatomyRow prop="Shape" val="Small: 12px, Standard: 16px (→28px M3E), Large: 28px, Extended: 16px" />
          <AnatomyRow prop="Elevation" val="elevation-2 (rest), elevation-1 (pressed), elevation-3 (hover)" />
          <AnatomyRow prop="Motion" val="spring stiffness:500 damping:25, whileTap scale:0.92" />
          <AnatomyRow prop="Label (ext)" val="DM Sans, 0.875rem, weight 600, letterSpacing 0.01em" />
          <AnatomyRow prop="Icon" val="Lucide, 24px standard, 20px small/ext, 36px large" />
        </div>
      </Surface>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Un solo FAB per schermata — l'azione primaria unica",
          "Extended FAB per azioni che richiedono chiarezza (label + icona)",
          "Shadow reattiva al press per feedback fisico",
        ]}
        nonFare={[
          "Mai due FAB nella stessa schermata",
          "Mai FAB per azioni secondarie — usare un bottone standard",
          "Mai rimuovere l'ombra — il FAB deve flottare",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "aria-label descrittivo sull'azione. Extended FAB: la label è sufficiente." },
        { label: "Focus", desc: "Focus ring 3px primary su :focus-visible. Tab order coerente." },
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
    label: "Tipo forno",
    options: [
      { id: "home", label: "Casalingo", icon: Home },
      { id: "electric", label: "Elettrico Pro", icon: Flame },
      { id: "wood", label: "Legna", icon: Flame },
    ],
  },
  {
    id: "view",
    label: "Vista ricetta",
    options: [
      { id: "ingredients", label: "Ingredienti", icon: Wheat },
      { id: "timeline", label: "Timeline", icon: Timer },
      { id: "science", label: "Scienza", icon: FlaskConical },
    ],
  },
];

export function SegmentedButtonSpec() {
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
        title="Segmented Button"
        description="Toggle a segmenti per selezione esclusiva. M3 Expressive: il segmento attivo ha container filled con check animato. Diverso dai Chip: i segmenti sono mutualmente esclusivi e raggruppati."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il Segmented Button è un toggle a segmenti per selezione mutualmente esclusiva. Il segmento attivo ha container filled con Check animato. Usato per scelte di tipo forno, vista ricetta, e toggle binari raggruppati."
        principi={[
          "Selezione mutualmente esclusiva — un solo segmento attivo alla volta",
          "Check icon animato (spring 500/20) sul segmento attivo",
          "Container unico rounded-2xl con outline-variant border",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Demo groups */}
      {SEGMENT_DEMOS.map((group) => (
        <Surface variant="card" className="p-5" key={group.id}>
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>{group.label}</span>
          <div className="mt-4">
            <SegmentedControl
              value={selections[group.id]}
              options={group.options.map(opt => ({
                value: opt.id,
                label: <span className="hidden sm:inline">{opt.label}</span>,
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Stati Segmento</span>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { state: "Unselected", bg: "var(--surface-container-low)", fg: "var(--on-surface-variant)", icon: false },
            { state: "Selected", bg: "var(--primary)", fg: "var(--primary-foreground)", icon: true },
            { state: "Hover", bg: "var(--surface-container)", fg: "var(--on-surface-variant)", icon: false },
            { state: "Disabled", bg: "var(--surface-container-low)", fg: "var(--outline-variant)", icon: false },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-2">
              <div
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: s.bg,
                  color: s.fg,
                  border: "1px solid var(--outline-variant)",
                  opacity: s.state === "Disabled" ? 0.5 : 1,
                }}
              >
                {s.icon && <Check size={14} />}
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: s.icon ? "var(--weight-bold)" as any : "var(--weight-medium)" as any }}>Label</span>
              </div>
              <span className="type-label text-center" style={{ color: "var(--muted-foreground)", fontSize: "var(--font-size-md)", letterSpacing: "var(--tracking-caps)" }}>{s.state}</span>
            </div>
          ))}
        </div>
      </Surface>

      {/* Anatomy */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Container" val="outline-variant border, rounded-2xl outer, nessun gap interno" />
          <AnatomyRow prop="Selected" val="primary bg, primary-foreground text, Check icon animato" />
          <AnatomyRow prop="Typography" val="DM Sans, 0.75rem, weight 500→700 on select" />
          <AnatomyRow prop="Divider" val="1px outline-variant tra segmenti (nascosto quando adiacente al selezionato)" />
        </div>
      </Surface>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Max 5 segmenti — oltre, usare Tabs o Dropdown",
          "Label brevi (1-2 parole) per leggibilità su mobile",
          "Check icon animato per conferma visiva della selezione",
        ]}
        nonFare={[
          "Mai segmented button per selezione multipla — usare Chip",
          "Mai mescolare segmenti con icona e senza icona nello stesso gruppo",
          "Mai usare per navigazione tra pagine — è per toggle di stato",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='radiogroup' sul container, role='radio' + aria-checked su ogni segmento." },
        { label: "Tastiera", desc: "Arrow keys per navigare tra segmenti. Space/Enter per selezionare." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C19 — SWITCH  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

export function SwitchSpec() {
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
    { id: "nerd", label: "PizzaNerd Mode", desc: "Layer scientifico nei punteggi" },
    { id: "dark", label: "Dark Mode", desc: "Tema scuro" },
    { id: "preferm", label: "Pre-fermento", desc: "Biga o poolish" },
    { id: "sourdough", label: "Lievito madre", desc: "Sourdough disponibile" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Switch"
        description="Toggle on/off con thumb che morfa. M3 Expressive: il thumb cambia dimensione (16→24px) e mostra un'icona contestuale. Track cambia colore. Spring bounce per feedback fisico."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Lo Switch è un toggle on/off con thumb morfante. Il thumb cambia dimensione (16→24px) e mostra un Check icon quando attivo. Track cambia colore da switch-background a primary. Usato per PizzaNerd, Dark Mode, Pre-fermento."
        principi={[
          "Thumb morfante: 16px (off) → 24px (on) con Check icon animato",
          "Spring physics (500/25) per thumb e icon separatamente",
          "Track colore: switch-background (off) → primary (on)",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Interactive switches */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Switch interattivi</span>
        <div className="mt-4 flex flex-col gap-1">
          {SWITCH_DEMOS.map((sw) => {
            const isOn = switches[sw.id];
            return (
              <div key={sw.id} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>{sw.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{sw.desc}</div>
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Stati Switch</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { state: "Off", on: false, disabled: false },
            { state: "On", on: true, disabled: false },
            { state: "Off Disabled", on: false, disabled: true },
            { state: "On Disabled", on: true, disabled: true },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-3">
              <div
                className="relative flex-shrink-0"
                style={{
                  width: "52px",
                  height: "32px",
                  borderRadius: "16px",
                  background: s.on ? "var(--primary)" : "var(--switch-background)",
                  border: s.on ? "none" : "2px solid var(--outline)",
                  opacity: s.disabled ? 0.38 : 1,
                }}
              >
                <div
                  className="absolute top-1/2 rounded-full flex items-center justify-center"
                  style={{
                    transform: `translateY(-50%) translateX(${s.on ? "22px" : "4px"})`,
                    width: s.on ? "24px" : "16px",
                    height: s.on ? "24px" : "16px",
                    background: s.on ? "var(--primary-foreground)" : "var(--outline)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  {s.on && <Check size={14} style={{ color: "var(--primary)" }} />}
                </div>
              </div>
              <span className="type-label text-center" style={{ color: "var(--muted-foreground)", fontSize: "var(--font-size-md)", letterSpacing: "var(--tracking-caps)" }}>{s.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Track" val="52×32px, radius-full. Off: switch-background + outline 2px. On: primary." />
          <AnatomyRow prop="Thumb" val="Off: 16px outline. On: 24px primary-foreground + Check icon 14px." />
          <AnatomyRow prop="Motion" val="spring stiffness:500 damping:25 — thumb + icon separati" />
          <AnatomyRow prop="A11y" val="role='switch', aria-checked, aria-label. Focus ring 3px primary." />
        </div>
      </Surface>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Label e descrizione sempre visibili accanto allo switch",
          "Stato on/off chiaramente distinguibile (colore + dimensione thumb)",
          "role='switch' con aria-checked per screen reader",
        ]}
        nonFare={[
          "Mai switch senza label — l'utente non sa cosa sta togglando",
          "Mai usare switch per azioni irreversibili — usare un dialog di conferma",
          "Mai cambiare lo stato programmaticamente senza feedback visivo",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='switch', aria-checked, aria-label. Supporto nativo." },
        { label: "Tastiera", desc: "Space per togglare. Tab per navigare. Focus ring visibile." },
        { label: "Contrasto", desc: "Thumb off: outline su switch-background. On: primary-foreground su primary." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C20 — PROGRESS INDICATORS  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

export function ProgressIndicatorSpec() {
  const [progress, setProgress] = useState(65);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Progress Indicators"
        description="Linear e Circular progress. M3 Expressive: track arrotondato, indicatore con radius pill, colore primary. L'indeterminato usa un'animazione fluida infinita."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Progress Indicators in due forme: Linear (barra orizzontale) e Circular (anello SVG). Entrambi hanno varianti determinate (con %) e indeterminate (loop infinito). Spring per determinato, easing fluido per indeterminato."
        principi={[
          "Determinato: spring animation per il progresso, valore numerico visibile",
          "Indeterminato: loop fluido infinito (linear 1.8s per linear, rotate 1.4s per circular)",
          "Track sempre visibile (surface-container-high) per contesto",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Linear — determinate */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Linear — Determinato</span>
        <div className="mt-4">
          <Progress value={progress} label="Completamento ricetta" />
          <input
            type="range"
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Linear — Indeterminato</span>
        <div className="mt-4">
          <Progress indeterminate />
        </div>
      </Surface>

      {/* Circular */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Circular</span>
        <div className="mt-4 flex items-center gap-8 justify-center flex-wrap">
          {/* Determinate */}
          {[25, 50, 75, 100].map((pct) => (
            <div key={pct} className="flex flex-col items-center gap-2">
              <Progress variant="circular" value={pct} size={48} />
              <span className="type-code" style={{ color: "var(--muted-foreground)" }}>{pct}%</span>
            </div>
          ))}

          {/* Indeterminate spinner */}
          <div className="flex flex-col items-center gap-2">
            <Progress variant="circular" indeterminate size={48} />
            <span className="type-code" style={{ color: "var(--muted-foreground)" }}>Indet.</span>
          </div>
        </div>
      </Surface>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Linear Track" val="4px height, radius-full. surface-container-high background." />
          <AnatomyRow prop="Linear Indicator" val="primary, radius-full (pill). Spring animation per determinato." />
          <AnatomyRow prop="Circular Track" val="48×48px, stroke 4px, radius 18. surface-container-high." />
          <AnatomyRow prop="Circular Indicator" val="primary stroke, strokeLinecap round. Indet: rotate 360° 1.4s linear." />
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Determinato: mostrare sempre la % per feedback preciso",
          "Indeterminato: usare solo quando il tempo è sconosciuto",
          "Circular per spazi ridotti, Linear per sezioni ampie",
        ]}
        nonFare={[
          "Mai progress senza track — l'utente perde il contesto 0-100%",
          "Mai animare il determinato con duration/ease — usare spring",
          "Mai mescolare linear e circular nello stesso contesto",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='progressbar', aria-valuenow, aria-valuemin=0, aria-valuemax=100." },
        { label: "Indet.", desc: "aria-valuemin/max senza aria-valuenow segnala stato indeterminato." },
        { label: "Reduced motion", desc: "Indeterminato: fallback a static pulse con prefers-reduced-motion." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C21 — TABS  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const TAB_DEMOS = [
  { id: "config", label: "Configura", icon: Home },
  { id: "styles", label: "Stili", icon: ChefHat },
  { id: "recipe", label: "Ricetta", icon: Flame },
  { id: "score", label: "Punteggio", icon: Star },
  { id: "science", label: "Scienza", icon: FlaskConical },
];

export function TabsSpec() {
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
        title="Tabs"
        description="M3 Expressive: indicator animato sotto il tab attivo, spring-based. Primary tabs (con icona) e Secondary tabs (solo testo). L'indicator si allunga/accorcia fluidamente tra tab."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Tabs con indicator animato via spring. Due varianti: Primary (icon + label) con indicator misurato dinamicamente via ref, e Secondary (solo testo) con layoutId per shared layout animation."
        principi={[
          "Indicator spring stiffness:400 damping:30 per movement fluido",
          "Primary: icon 18px + label. Secondary: solo label",
          "Tab attivo: primary color, weight 700. Inattivo: on-surface-variant, weight 500",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Primary tabs (icon + label) */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Primary Tabs — Icona + Label</span>
        <div className="mt-4 relative" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
          <div className="flex">
            {TAB_DEMOS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 px-2 relative active:scale-[0.97]"
                  style={{
                    background: "rgba(0,0,0,0)",
                    border: "none",
                    cursor: "pointer",
                    outline: "none",
                    color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                    transition: "color 0.15s",
                  }}
                >
                  <Icon size={18} />
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-base)",
                    fontWeight: isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                    letterSpacing: "var(--tracking-wide)",
                  }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Animated indicator */}
          <motion.div
            className="absolute bottom-0 h-0.5 rounded-full"
            style={{ background: "var(--primary)" }}
            animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Tab content preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 700, damping: 35 }}
            className="mt-4 p-4 rounded-xl"
            style={{ background: "var(--surface-container)", minHeight: "60px" }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
              {TAB_DEMOS.find((t) => t.id === activeTab)?.label}
            </span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", marginTop: "4px" }}>
              Contenuto della sezione {TAB_DEMOS.find((t) => t.id === activeTab)?.label?.toLowerCase()}.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Secondary tabs (text only) */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Secondary Tabs — Solo testo</span>
        <div className="mt-4 flex" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
          {TAB_DEMOS.slice(0, 4).map((tab) => {
            const isActive = activeSecondary === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSecondary(tab.id)}
                className="flex-1 py-2.5 px-3 relative active:scale-[0.97]"
                style={{
                  background: "rgba(0,0,0,0)",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-md)",
                  fontWeight: isActive ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                  color: isActive ? "var(--text-default)" : "var(--on-surface-variant)",
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="secondary-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: "var(--primary)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Container" val="outline-variant bottom border. No background." />
          <AnatomyRow prop="Indicator" val="3px primary, radius-full. Spring stiffness:400 damping:30." />
          <AnatomyRow prop="Primary Tab" val="Icon 18px + Label DM Sans 0.6875rem. Active: primary, weight 700." />
          <AnatomyRow prop="Secondary Tab" val="Label only. Active: foreground, weight 700. Inactive: on-surface-variant, 500." />
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Primary tabs per sezioni con icona contestuale (Configura, Stili, Ricetta...)",
          "Secondary tabs per sotto-sezioni testuali senza icona",
          "Indicator spring-based per feedback di navigazione fluido",
        ]}
        nonFare={[
          "Mai più di 5-6 tabs — oltre, usare scrollable tabs o menu",
          "Mai mescolare primary e secondary tabs nella stessa barra",
          "Mai tabs senza contenuto sotto — l'utente si aspetta un cambio vista",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='tablist' sul container, role='tab' + aria-selected su ogni tab, role='tabpanel' sul contenuto." },
        { label: "Tastiera", desc: "Arrow keys per navigare. Tab entra nella tablist, poi arrow left/right." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C22 — DIVIDER  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

export function DividerSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Divider"
        description="Separatore visivo. M3: 1px outline-variant, full-bleed o inset (padding 16px). Verticale per layout orizzontali. Usato ovunque nell'app per strutturare le sezioni."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il Divider è un separatore visivo minimo (1px outline-variant). 3 varianti: Full-bleed (tutta la larghezza), Inset (allineato al contenuto), Verticale (tra elementi inline). Nessuna animazione — è un elemento strutturale puro."
        principi={[
          "1px outline-variant — mai più spesso",
          "Inset allineato al leading element (es. 44px con avatar)",
          "Verticale: height 24px default, inline con flex items",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Varianti Divider</span>

        <div className="mt-5 flex flex-col gap-6">
          {/* Full-bleed */}
          <div>
            <span className="type-mono-label" style={{ color: "var(--primary)" }}>Full-bleed</span>
            <div className="mt-2 p-4 rounded-xl" style={{ background: "var(--surface-container)" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", padding: "8px 0" }}>Elemento sopra</div>
              <Divider />
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", padding: "8px 0" }}>Elemento sotto</div>
            </div>
          </div>

          {/* Inset */}
          <div>
            <span className="type-mono-label" style={{ color: "var(--primary)" }}>Inset (16px)</span>
            <div className="mt-2 p-4 rounded-xl" style={{ background: "var(--surface-container)" }}>
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full" style={{ background: "var(--primary-container)" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)" }}>Napoletana STG</span>
              </div>
              <Divider inset />
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full" style={{ background: "var(--tertiary-container)" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)" }}>Teglia Romana</span>
              </div>
            </div>
          </div>

          {/* Vertical */}
          <div>
            <span className="type-mono-label" style={{ color: "var(--primary)" }}>Verticale</span>
            <div className="mt-2 p-4 rounded-xl flex items-center gap-0" style={{ background: "var(--surface-container)" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", padding: "0 12px" }}>65%</span>
              <Divider orientation="vertical" style={{ height: "24px" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", padding: "0 12px" }}>W280</span>
              <Divider orientation="vertical" style={{ height: "24px" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", padding: "0 12px" }}>24h</span>
              <Divider orientation="vertical" style={{ height: "24px" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", padding: "0 12px" }}>4°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Specifiche</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Colore" val="outline-variant (light: parchment-500, dark: night-300)" />
          <AnatomyRow prop="Spessore" val="1px (--border-width-thin)" />
          <AnatomyRow prop="Inset" val="Allineato al contenuto: 16px default, 44px con leading element" />
          <AnatomyRow prop="Verticale" val="height: 24px default, inline con flex items" />
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Full-bleed per separare sezioni maggiori",
          "Inset per separare item in una lista con leading element",
          "Verticale per separare metriche inline (stat strip)",
        ]}
        nonFare={[
          "Mai divider tra ogni elemento — usare gap/spacing",
          "Mai spessore > 1px — non è un bordo decorativo",
          "Mai colore diverso da outline-variant — è un elemento neutro",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='separator' per screen reader. Decorativo: aria-hidden='true'." },
        { label: "Orientamento", desc: "aria-orientation='horizontal' o 'vertical' per contesto." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "fab", label: "FAB / Extended FAB", group: "c", Component: FABSpec },
  { id: "segmented", label: "Segmented Button", group: "c", Component: SegmentedButtonSpec },
  { id: "switch", label: "Switch", group: "c", Component: SwitchSpec },
  { id: "progress", label: "Progress Indicators", group: "c", Component: ProgressIndicatorSpec },
  { id: "tabs", label: "Tabs", group: "c", Component: TabsSpec },
  { id: "divider", label: "Divider", group: "c", Component: DividerSpec },
];
