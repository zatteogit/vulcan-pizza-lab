import { Check,ChevronDown,Minus } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useEffect,useRef,useState } from "react";
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
    { id: "napo", label: "Napoletana STG", desc: "Classica AVPN, forno legna" },
    { id: "teglia", label: "Teglia Romana", desc: "Alta idratazione, crunch" },
    { id: "bonci", label: "Metodo Bonci", desc: "Lunga maturazione, alveolatura" },
    { id: "detroit", label: "Detroit Style", desc: "Olio nella teglia, bordo croccante" },
    { id: "chicago", label: "Chicago Deep Dish", desc: "Burro 18%, impasto corto" },
    { id: "pinsa", label: "Pinsa Romana", desc: "Farine miste, idratazione 80%" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Checkbox"
        description="M3 checkbox con checkmark animato spring-based, stato indeterminato (Minus icon), e supporto per label a una o due righe. Provale tutte — inclusa l'indeterminata!"
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Checkbox M3 con 3 stati: unchecked, checked (Check icon), indeterminate (Minus icon). Animazione spring-based per check/uncheck. Supporto per label singola o con testo di supporto. Usato per Dietary, Equipment, Pantry."
        principi={[
          "3 stati: unchecked (outline), checked (primary + Check), indeterminate (primary + Minus)",
          "Spring stiffness:500 damping:20 per l'animazione check",
          "Label + supporting text per contesto aggiuntivo",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Interactive list */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Stili preferiti — Interattivo
        </span>
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

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Indeterminato per selezione parziale in un gruppo (es. 2 su 4 selezionati)",
          "Label sempre presente — la checkbox da sola non comunica il significato",
          "Supporting text per spiegazioni contestuali (opzionale)",
        ]}
        nonFare={[
          "Mai checkbox per scelte mutualmente esclusive — usare radio button",
          "Mai più di 7-8 checkbox in un gruppo — spezzare in sotto-gruppi",
          "Mai checkbox senza label accessibile — anche se visivamente nascosta",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "aria-checked='true'/'false'/'mixed' per i 3 stati. aria-labelledby per la label." },
        { label: "Tastiera", desc: "Space per togglare. Tab per navigare. Focus ring 3px primary." },
      ]} />

      {/* States grid */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Stati</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { state: "Unchecked", checked: false, indet: false, disabled: false },
            { state: "Checked", checked: true, indet: false, disabled: false },
            { state: "Indeterminate", checked: false, indet: true, disabled: false },
            { state: "Disabled Off", checked: false, indet: false, disabled: true },
            { state: "Disabled On", checked: true, indet: false, disabled: true },
          ].map((s) => {
            const isActive = s.checked || s.indet;
            return (
              <div key={s.state} className="flex flex-col items-center gap-3">
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center"
                  style={{
                    background: isActive ? "var(--primary)" : "rgba(0,0,0,0)",
                    border: `2px solid ${isActive ? "var(--primary)" : "var(--outline)"}`,
                    opacity: s.disabled ? 0.38 : 1,
                  }}
                >
                  {s.checked && <Check size={14} style={{ color: "var(--primary-foreground)" }} />}
                  {s.indet && <Minus size={14} style={{ color: "var(--primary-foreground)" }} />}
                </div>
                <span className="type-label text-center" style={{ color: "var(--muted-foreground)", fontSize: "var(--font-size-md)", letterSpacing: "var(--tracking-caps)" }}>{s.state}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Container" val="20×20px, border 2px, radius 4px (--radius-xs). Unchecked: outline border. Checked: primary fill." />
          <AnatomyRow prop="Icon" val="Check (14px) o Minus (14px), primary-foreground. Spring stiffness:600 damping:20." />
          <AnatomyRow prop="State layer" val="Hover: 8% primary overlay. Press: 12%. Focus: ring 3px." />
          <AnatomyRow prop="Label" val="DM Sans 0.8125rem, gap 12px. Supporting text 0.6875rem muted-foreground." />
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
    { id: "home", label: "Forno casalingo", desc: "Elettrico standard, max 250°C" },
    { id: "electric_pro", label: "Elettrico professionale", desc: "Fino a 350–400°C, statico/ventilato" },
    { id: "wood", label: "Forno a legna", desc: "450–500°C, fiamma diretta, cottura 60–90s" },
    { id: "ooni", label: "Forno portatile (Ooni/Roccbox)", desc: "Gas o legna, 400–500°C, compatto" },
  ];

  const YEAST_OPTIONS = [
    { id: "fresh", label: "Lievito fresco" },
    { id: "dry", label: "Lievito secco" },
    { id: "sourdough", label: "Lievito madre" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Radio Button"
        description="Selezione esclusiva in un gruppo. M3 Expressive: cerchio esterno con dot interno animato spring-based. Il dot scala da 0 a 10px con overshoot. Completamente interattivi!"
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Radio Button per selezione esclusiva in un gruppo. Cerchio esterno (20px outline) con dot interno (10px primary) animato spring con overshoot. Due layout: verticale con descrizione e orizzontale compatto."
        principi={[
          "Selezione mutualmente esclusiva — un solo radio attivo per gruppo",
          "Dot interno spring stiffness:600 damping:18 per overshoot naturale",
          "Verticale per opzioni complesse (con desc), orizzontale per scelte rapide",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Oven group — with descriptions */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Tipo forno — con descrizione
        </span>
        <div className="mt-4 flex flex-col gap-1" role="radiogroup" aria-label="Tipo forno">
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Tipo lievito — orizzontale compatto
        </span>
        <div className="mt-4 flex flex-wrap gap-4" role="radiogroup" aria-label="Tipo lievito">
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

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Verticale con descrizione per opzioni che richiedono contesto (tipo forno, tipo lievito)",
          "Orizzontale compatto per 2-4 opzioni brevi",
          "role='radiogroup' + role='radio' + aria-checked per accessibilità completa",
        ]}
        nonFare={[
          "Mai radio button per selezione multipla — usare checkbox",
          "Mai più di 6-7 opzioni — considerare un dropdown/select",
          "Mai pre-selezionare un'opzione senza motivo — evitare bias",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='radiogroup' sul container con aria-label. role='radio' + aria-checked su ogni opzione." },
        { label: "Tastiera", desc: "Arrow keys per navigare nel gruppo. Space per selezionare. Tab esce dal gruppo." },
      ]} />

      {/* States */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Stati</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { state: "Unselected", selected: false, disabled: false },
            { state: "Selected", selected: true, disabled: false },
            { state: "Disabled Off", selected: false, disabled: true },
            { state: "Disabled On", selected: true, disabled: true },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  border: `2px solid ${s.selected ? "var(--primary)" : "var(--outline)"}`,
                  opacity: s.disabled ? 0.38 : 1,
                }}
              >
                {s.selected && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />
                )}
              </div>
              <span className="type-label text-center" style={{ color: "var(--muted-foreground)", fontSize: "var(--font-size-md)", letterSpacing: "var(--tracking-caps)" }}>{s.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Outer circle" val="20×20px, border 2px, radius-full. Unselected: outline. Selected: primary." />
          <AnatomyRow prop="Inner dot" val="10×10px, radius-full, primary. Spring stiffness:600 damping:18 (overshoot)." />
          <AnatomyRow prop="A11y" val="role='radiogroup' sul container, role='radio' + aria-checked sui figli." />
          <AnatomyRow prop="Label" val="Identico a Checkbox: DM Sans 0.8125rem, gap 12px, supporting text opzionale." />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C25 — SELECT / DROPDOWN  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

const FLOUR_OPTIONS = [
  { id: "00", label: "Farina 00", desc: "W 200–280", group: "Standard" },
  { id: "0", label: "Farina 0", desc: "W 150–200", group: "Standard" },
  { id: "tipo1", label: "Farina Tipo 1", desc: "W 180–240", group: "Standard" },
  { id: "manitoba", label: "Manitoba", desc: "W 350–400", group: "Forte" },
  { id: "semola", label: "Semola rimacinata", desc: "W 180–220", group: "Speciale" },
  { id: "integrale", label: "Integrale", desc: "W 120–180", group: "Speciale" },
];

function SelectSpec() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>("00");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = FLOUR_OPTIONS.find((o) => o.id === selected);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Select / Dropdown"
        description="Menu di selezione con dropdown animato. M3 Expressive: bordo che transisce a primary su apertura, chevron che ruota, menu con entrata spring e item con hover state layer. Interattivo!"
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Select con dropdown animato spring-based. Il trigger ha bordo che transisce a primary su apertura, chevron che ruota 180°, e menu con scaleY + opacity. Item con hover state layer e Check icon per selezione."
        principi={[
          "Trigger: outline-variant → primary border con glow su apertura",
          "Dropdown: spring stiffness:500 damping:28, scaleY origin top",
          "Item: 5% primary hover, 10% + Check per selected",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Interactive select */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Tipo farina — Interattivo
        </span>
        <div className="mt-4">
          <Select
            options={FLOUR_OPTIONS}
            value={selected}
            onValueChange={setSelected}
            label="Tipo farina"
            style={{ maxWidth: "320px" }}
          />
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Label flottante per contesto quando un valore è selezionato",
          "Raggruppare le opzioni con header (es. Standard/Forte/Speciale per farine)",
          "Chiudere il dropdown su selezione, click fuori, o Escape",
        ]}
        nonFare={[
          "Mai dropdown con più di 15-20 item senza ricerca — aggiungere search",
          "Mai placeholder come unico indicatore — usare label persistente",
          "Mai dropdown senza maxHeight + scroll per liste lunghe",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='listbox' sul menu, role='option' + aria-selected sugli item. aria-expanded sul trigger." },
        { label: "Tastiera", desc: "Arrow keys per navigare le opzioni. Enter per selezionare. Escape per chiudere." },
        { label: "Focus", desc: "Focus trap nel dropdown quando aperto. Focus restituito al trigger alla chiusura." },
      ]} />

      {/* States */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Stati trigger</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { state: "Default", border: "1px solid var(--outline-variant)", shadow: "none" },
            { state: "Hover", border: "1px solid var(--outline)", shadow: "none" },
            { state: "Focused / Open", border: "2px solid var(--primary)", shadow: "var(--shadow-glow)" },
            { state: "Disabled", border: "1px solid var(--outline-variant)", shadow: "none", opacity: 0.5 },
          ].map((s) => (
            <div key={s.state} className="flex flex-col items-center gap-2">
              <div
                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between"
                style={{
                  background: "var(--surface-container)",
                  border: s.border,
                  boxShadow: s.shadow,
                  opacity: (s as any).opacity || 1,
                }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)" }}>Farina 00</span>
                <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />
              </div>
              <span className="type-label text-center" style={{ color: "var(--muted-foreground)", fontSize: "var(--font-size-md)", letterSpacing: "var(--tracking-caps)" }}>{s.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Trigger" val="surface-container bg, outline-variant border, rounded-xl. H 48px min." />
          <AnatomyRow prop="Dropdown" val="surface-container bg, shadow-lg, rounded-xl. spring stiffness:500 damping:28." />
          <AnatomyRow prop="Item" val="px-4 py-2.5. Hover: 5% primary overlay. Selected: 10% + Check icon." />
          <AnatomyRow prop="Label flottante" val="DM Sans 0.625rem, primary, above value. Appare quando compilato." />
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
  { id: "checkbox", label: "Checkbox", group: "c", Component: CheckboxSpec },
  { id: "radio", label: "Radio Button", group: "c", Component: RadioButtonSpec },
  { id: "select", label: "Select / Dropdown", group: "c", Component: SelectSpec },
];