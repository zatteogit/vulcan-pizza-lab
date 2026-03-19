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

/* ═══ C15: RECIPE CONFIGURATOR ═══ */

const DEMO_SLIDERS = [
  {
    id: "hydration",
    label: "Idratazione",
    icon: Droplets,
    unit: "%",
    min: 45, max: 100, step: 1, defaultValue: 65,
    gradient: "linear-gradient(90deg, var(--color-amber-400) 0%, var(--color-water-500) 50%, var(--color-water-700) 100%)",
    tip: "Percentuale di acqua rispetto alla farina. Più alta = impasto più morbido e alveolato.",
  },
  {
    id: "flourW",
    label: "Forza Farina (W)",
    icon: Wheat,
    unit: "",
    min: 150, max: 420, step: 10, defaultValue: 280,
    gradient: "linear-gradient(90deg, var(--color-parchment-700) 0%, var(--color-amber-600) 50%, var(--color-amber-800) 100%)",
    tip: "Indice di forza alveografico. W alto = più glutine, regge idratazioni alte.",
  },
  {
    id: "fermentation",
    label: "Fermentazione",
    icon: Clock,
    unit: "h",
    min: 2, max: 72, step: 1, defaultValue: 24,
    gradient: "linear-gradient(90deg, var(--color-olive-400) 0%, var(--color-amber-600) 50%, var(--color-terracotta-600) 100%)",
    tip: "Durata totale della lievitazione. Più lunga = più sapore e digeribilità.",
  },
  {
    id: "temperature",
    label: "Temperatura",
    icon: Thermometer,
    unit: "°C",
    min: 2, max: 30, step: 1, defaultValue: 4,
    gradient: "linear-gradient(90deg, var(--color-water-500) 0%, var(--color-amber-600) 40%, var(--color-terracotta-600) 70%, var(--color-terracotta-700) 100%)",
    tip: "Temperatura di fermentazione. Frigo (2-6°C) per maturazioni lunghe, ambiente (18-24°C) per brevi.",
  },
];

export function RecipeConfiguratorSpec() {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    DEMO_SLIDERS.forEach((s) => { init[s.id] = s.defaultValue; });
    return init;
  });
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="RecipeConfigurator" description="Pannello fine-tuning con slider a gradiente semantico, InfoTip contestuali e feedback visivo. Ogni parametro ha un range specifico per stile. Interagisci con gli slider!" />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il RecipeConfigurator permette il fine-tuning dei parametri dell'impasto con slider visivi a gradiente semantico. Ogni parametro ha un range coerente con lo stile selezionato e tooltip contestuali con spiegazioni scientifiche."
        principi={[
          "Gradiente semantico: colori che comunicano il significato del valore (caldo→freddo per temperatura)",
          "InfoTip contestuali: spiegazione di ogni parametro accessibile con un click",
          "Range dinamico: limiti che si adattano allo stile di pizza selezionato",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Slider Fine-Tuning — Demo interattiva</span>

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
                    <Icon size={14} style={{ color: "var(--primary)" }} />
                    <span className="type-code" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{slider.label}</span>
                    <motion.button
                      onClick={() => setExpandedTip(isTipOpen ? null : slider.id)}
                      className="flex items-center justify-center w-5 h-5 rounded-full active:scale-95 transition-transform"
                      style={{
                        background: isTipOpen ? "var(--primary)" : "color-mix(in srgb, var(--primary) 10%, transparent)",
                        color: isTipOpen ? "var(--primary-foreground)" : "var(--primary)",
                        border: "none",
                        cursor: "pointer",
                        outline: "none",
                      }}
                      aria-label="Info"
                    >
                      <Lightbulb size={10} />
                    </motion.button>
                  </div>
                  <span className="type-data-lg" style={{ fontWeight: "var(--weight-bold)" as any,
                    color: "var(--primary)", fontFeatureSettings: "'tnum'",
                  }}>
                    {val}{slider.unit}
                  </span>
                </div>

                {/* Tip */}
                {isTipOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 p-2.5 rounded-lg"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 6%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)",
                    }}
                  >
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", lineHeight: "var(--leading-relaxed)" }}>{slider.tip}</span>
                  </motion.div>
                )}

                {/* Slider track */}
                <div className="relative" style={{ height: "28px" }}>
                  <div
                    className="absolute top-1/2 left-0 right-0 h-2 rounded-full"
                    style={{
                      transform: "translateY(-50%)",
                      background: slider.gradient,
                      opacity: 0.3,
                    }}
                  />
                  <div
                    className="absolute top-1/2 left-0 h-2 rounded-full"
                    style={{
                      transform: "translateY(-50%)",
                      width: `${pct}%`,
                      background: slider.gradient,
                    }}
                  />
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={val}
                    onChange={(e) => setValues((prev) => ({ ...prev, [slider.id]: Number(e.target.value) }))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    style={{ height: "28px" }}
                  />
                  {/* Thumb indicator */}
                  <div
                    className="absolute top-1/2 rounded-full"
                    style={{
                      width: "16px",
                      height: "16px",
                      background: "var(--primary)",
                      border: "3px solid var(--container-page)",
                      boxShadow: "var(--slider-thumb-shadow)",
                      transform: "translate(-50%, -50%)",
                      left: `${pct}%`,
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Range labels */}
                <div className="flex justify-between mt-1 type-code" style={{ color: "var(--muted-foreground)" }}>
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Pattern Slider — Specifiche</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Gradiente", desc: "Semantico per parametro (colori caldi→freddi per temperatura, secco→umido per idratazione)" },
            { label: "InfoTip", desc: "Toggle con Lightbulb icon, background primary 6%, bordo 15%" },
            { label: "Valore", desc: "DM Mono, tnum, fontWeight 700, colore primary" },
          ].map((spec) => (
            <div key={spec.label} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--primary)" }}>{spec.label}</span>
              <p className="type-code" style={{ color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-relaxed)" }}>{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Gradiente semantico per ogni parametro — colori che comunicano il significato",
          "InfoTip contestuali con spiegazione breve (max 2 righe)",
          "Range dinamici coerenti con lo stile selezionato",
        ]}
        nonFare={[
          "Mai slider senza gradiente — il colore piatto non comunica il range",
          "Mai omettere il valore numerico corrente — è il feedback principale",
          "Mai step non coerenti con l'unità (es. step 10 per ore)",
        ]}
        comportamento="I slider aggiornano in real-time. Il rilascio trigger ricalcolo ricetta. Touch: area di hit 28px."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Input nativo", desc: "<input type='range'> sotto il visual custom — tastiera e screen reader out of the box." },
        { label: "InfoTip", desc: "Toggle con aria-expanded. Contenuto collegato via aria-describedby." },
        { label: "Touch target", desc: "Thumb 16px + area cliccabile 28px per WCAG Target Size." },
      ]} />
    </div>
  );
}

/* ═══ C16: RECIPE TIMELINE ═══ */

const DEMO_INGREDIENTS = [
  { name: "Farina W280", amount: 500, unit: "g", pct: 100, color: "var(--tertiary)" },
  { name: "Acqua", amount: 325, unit: "ml", pct: 65, color: "var(--time-tonight)" },
  { name: "Sale", amount: 15, unit: "g", pct: 3, color: "var(--secondary)" },
  { name: "Lievito fresco", amount: 1.5, unit: "g", pct: 0.3, color: "var(--cta)" },
  { name: "Olio EVO", amount: 15, unit: "ml", pct: 3, color: "var(--warm-sienna)" },
];

const DEMO_TIMELINE = [
  { icon: Hand, label: "Autolisi", duration: "30 min", desc: "Farina + 80% acqua, riposo coperto", time: "18:00", zone: "ambient" as const, temp: "22°C", detail: "Unire farina e acqua (80% del totale) in una ciotola ampia. Mescolare grossolanamente fino a idratazione uniforme. Coprire con pellicola e lasciar riposare — il glutine inizia a formarsi da solo." },
  { icon: ChefHat, label: "Impasto", duration: "15 min", desc: "Aggiungere sale, lievito, olio. Incordare.", time: "18:30", zone: "ambient" as const, temp: "22°C", detail: "Sciogliere il lievito nell'acqua restante (20%). Incorporare nell'impasto con sale e olio EVO. Impastare a mano con tecnica slap & fold oppure con planetaria (velocità 2) fino a incordatura — l'impasto deve staccarsi dalle pareti." },
  { icon: Scissors, label: "Pieghe", duration: "3×15 min", desc: "Stretch & fold ogni 15 minuti", time: "18:45", zone: "ambient" as const, temp: "22°C", detail: "Eseguire 3 serie di stretch & fold a intervalli di 15 minuti. Ogni serie: afferrare un lato dell'impasto, stenderlo verso l'alto e ripiegarlo al centro. Ruotare la ciotola di 90° e ripetere su tutti e 4 i lati. Rafforza la maglia glutinica senza re-impastare." },
  { icon: Clock, label: "Puntata", duration: "2h", desc: "Riposo a temperatura ambiente, coperto", time: "19:30", zone: "ambient" as const, temp: "22°C", detail: "Fase di fermentazione bulk. L'impasto deve raddoppiare di volume. A 22°C richiede circa 2 ore. Controllare con il finger test: premere con un dito infarinato — l'impronta deve rientrare lentamente." },
  { icon: Thermometer, label: "Frigo", duration: "20h", desc: "Maturazione in frigo a 4°C", time: "21:30", zone: "cold" as const, temp: "4°C", detail: "Trasferire l'impasto in contenitore oleato e sigillare. In frigo la fermentazione rallenta (Q10 ≈ 1.6) ma la maturazione enzimatica continua: gli enzimi proteasi e amilasi scompongono glutine e amidi, sviluppando complessità aromatica e migliorando la digeribilità (FODMAP -65%)." },
  { icon: Expand, label: "Staglio", duration: "30 min", desc: "Dividere in panetti da 250g, arrotondare", time: "17:30+1", zone: "ambient" as const, temp: "22°C", detail: "Estrarre l'impasto dal frigo, ribaltare sulla spianatoia infarinata. Dividere in porzioni da 250g con tarocco. Arrotondare ogni panetto con movimento rotatorio a mani coppa, creando tensione superficiale. Coprire e lasciare a temperatura ambiente 30 minuti." },
  { icon: Flame, label: "Cottura", duration: "8-10 min", desc: "Forno 250°C, pietra refrattaria", time: "19:00+1", zone: "hot" as const, temp: "250°C", detail: "Preriscaldare forno al massimo con pietra refrattaria per almeno 45 minuti. Stendere il panetto a mano (no mattarello) lasciando il cornicione. Condire velocemente, infornare direttamente sulla pietra. Rotare la pizza a metà cottura per uniformità." },
];

export function RecipeTimelineSpec() {
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
    return "rgba(0,0,0,0)";
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Recipe Output / Timeline" description="Visualizzazione finale della ricetta: ingredienti con barre proporzionali e timeline procedurale interattiva con zone termiche (ambiente/frigo/cottura), step espandibili e dettagli scientifici. Clicca su uno step per espanderlo!" />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il Recipe Output è la visualizzazione finale della ricetta con due sezioni: ingredienti (barre proporzionali con baker's %) e timeline procedurale (step interattivi con zone termiche, dettagli scientifici e clipboard)."
        principi={[
          "Ingredienti: barre proporzionali al baker's %, con colore semantico per tipo",
          "Timeline: step verticali con nodi 40×40px, zone termiche colorate, step espandibili",
          "Clipboard: doppio path (API + textarea fallback) per iframe Figma",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Ingredients */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Ingredienti — Barre proporzionali</span>
          <motion.button
            onClick={() => handleCopy(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg type-data active:scale-95 transition-transform"
            style={{
              fontWeight: "var(--weight-semibold)" as any,
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
              color: copiedIdx === -1 ? "var(--cta)" : "var(--muted-foreground)",
              cursor: "pointer", outline: "none",
            }}
          >
            {copiedIdx === -1 ? <Check size={12} /> : <Copy size={12} />}
            {copiedIdx === -1 ? "Copiato!" : "Copia lista"}
          </motion.button>
        </div>

        <div className="flex flex-col gap-2.5">
          {DEMO_INGREDIENTS.map((ing) => {
            const barWidth = Math.max(4, ing.pct);
            return (
              <div key={ing.name} className="flex items-center gap-3">
                <span className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", width: "120px", flexShrink: 0 }}>{ing.name}</span>
                <div className="flex-1 min-w-0 h-6 rounded-lg overflow-hidden relative" style={{ background: "var(--surface-container)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ type: "spring", stiffness: 280, damping: 25 }}
                    className="h-full rounded-lg"
                    style={{ background: ing.color, opacity: 0.7 }}
                  />
                  <span
                    className="absolute right-2 top-1/2"
                    style={{
                      transform: "translateY(-50%)",
                      fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)", fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {ing.amount}{ing.unit}
                  </span>
                </div>
                <span className="type-code" style={{ color: "var(--muted-foreground)", width: "40px", textAlign: "right", fontFeatureSettings: "'tnum'" }}>{ing.pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--outline-variant)" }}>
          <span className="type-code" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>Totale impasto</span>
          <span className="type-data-lg" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--primary)", fontFeatureSettings: "'tnum'" }}>856.5g</span>
        </div>
      </div>

      {/* Timeline — interactive, with temperature zones */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Timeline Procedurale — Interattiva</span>
          {/* Zone legend */}
          <div className="flex items-center gap-3">
            {[
              { label: "Ambiente", color: "var(--cta)" },
              { label: "Frigo", color: "var(--time-tonight)" },
              { label: "Forno", color: "var(--primary)" },
            ].map((z) => (
              <div key={z.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{z.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginBottom: "16px" }}>
          Clicca su uno step per espandere i dettagli con istruzioni complete e note scientifiche. La barra laterale cambia colore per zona termica.
        </p>

        <div className="relative">
          {/* Vertical line — segmented by zone */}
          <div className="absolute left-5 top-3 bottom-3" style={{ width: "2px", background: "var(--outline-variant)" }} />

          <div className="flex flex-col gap-0.5">
            {DEMO_TIMELINE.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === DEMO_TIMELINE.length - 1;
              const isExpanded = expandedStep === i;
              const color = zoneColor(step.zone);

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.08 }}
                  className="flex gap-4 pl-0 cursor-pointer"
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                  style={{
                    background: isExpanded ? zoneBg(step.zone) : "rgba(0,0,0,0)",
                    borderRadius: 12,
                    padding: isExpanded ? "8px 8px 8px 0" : "0",
                    transition: "background 0.2s, padding 0.2s",
                  }}
                >
                  {/* Node */}
                  <div className="flex flex-col items-center" style={{ width: "40px", flexShrink: 0 }}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                      style={{
                        background: isLast || isExpanded ? color : "var(--surface-container)",
                        border: isLast || isExpanded ? "none" : "2px solid var(--outline-variant)",
                        color: isLast || isExpanded ? "var(--container-page)" : color,
                        transition: "background 0.2s, color 0.2s, border 0.2s",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-5">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="type-code" style={{ color, fontFeatureSettings: "'tnum'" }}>{step.time}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>{step.label}</span>
                      <span style={{
                        fontWeight: "var(--weight-semibold)" as any,
                        padding: "2px 6px", borderRadius: "4px",
                        background: `color-mix(in srgb, ${color} 12%, transparent)`,
                        color,
                      }}>
                        {step.duration}
                      </span>
                      {/* Temperature badge */}
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", fontWeight: "var(--weight-semibold)" as any,
                        padding: "1px 5px", borderRadius: "4px",
                        background: `color-mix(in srgb, ${color} 8%, transparent)`,
                        color,
                        fontFeatureSettings: "'tnum'",
                        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
                      }}>
                        {step.temp}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>{step.desc}</p>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="mt-2 p-3 rounded-lg"
                        style={{
                          background: "var(--surface-container-low)",
                          border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
                        }}
                      >
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", lineHeight: "var(--leading-loose)" }}>
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Pattern Clipboard / Share</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Clipboard API", desc: "navigator.clipboard.writeText() — primario, richiede secure context" },
            { label: "Fallback Textarea", desc: "createElement('textarea') + execCommand('copy') — per iframe senza permission" },
            { label: "Share API", desc: "navigator.share() con fallback a clipboard se non supportato" },
            { label: "Feedback", desc: "Icona Copy -> Check per 1.5s, colore muted -> cta" },
          ].map((spec) => (
            <div key={spec.label} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)" }}>{spec.label}</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-relaxed)" }}>{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia Timeline</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { prop: "Node", val: "40×40px rounded-xl. Colore cambia per zona termica: cta (ambiente), time-tonight (frigo), primary (forno)." },
            { prop: "Zone termiche", val: "3 zone con colore semantico. Background espanso usa il colore zona al 8% per contesto visivo." },
            { prop: "Step espandibile", val: "Click → spring s:300 d:24. Dettaglio con istruzioni complete e note scientifiche (FODMAP, Q10)." },
            { prop: "Badge temp", val: "DM Mono 0.625rem, border zona 20%, mostra la temperatura target per ogni fase." },
            { prop: "Stagger", val: "Entrance staggerata: delay 80ms × indice, x: -12→0, opacity: 0→1." },
            { prop: "Linea verticale", val: "2px outline-variant, absolute left-5, connette tutti i nodi visivamente." },
          ].map((a) => (
            <AnatomyRow key={a.prop} prop={a.prop} val={a.val} />
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Ingredienti con barre proporzionali al baker's % — comunicano le proporzioni visivamente",
          "Zone termiche colorate nella timeline — l'utente capisce immediatamente il contesto",
          "Step espandibili con dettagli scientifici — informazione progressiva",
        ]}
        nonFare={[
          "Mai timeline senza linea verticale — perde la connessione visiva tra step",
          "Mai nodi tutti dello stesso colore — le zone termiche sono informative",
          "Mai step espansi di default — il dettaglio è opt-in",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Clipboard", desc: "Doppio path (API + textarea fallback) per compatibilità iframe Figma." },
        { label: "Timeline", desc: "role='list' con role='listitem' per ogni step. aria-expanded per i dettagli." },
        { label: "Contrasto", desc: "I colori zona hanno contrasto ≥3:1 contro il background (non-text)." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "configurator", label: "RecipeConfigurator", group: "c", Component: RecipeConfiguratorSpec },
  { id: "timeline", label: "Recipe Timeline", group: "c", Component: RecipeTimelineSpec },
];