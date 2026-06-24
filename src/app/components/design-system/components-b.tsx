import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Timer,
  Wheat,
  Zap,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
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
import { Surface, Slider, CtaButton } from "../ds/index";

/* ═══════════════════════════════════════════════════════════
   COMPONENT SPEC SHEETS C08–C10
   ═══════════════════════════════════════════════════════════ */

/* ═══ ANIMATED RING (shared helper) ═══ */
function AnimatedRing({
  score,
  label,
  color,
  size = 72,
  strokeWidth = 5,
}: {
  score: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 active:scale-95"
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ cursor: "pointer" }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-container)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: size * 0.28, fontWeight: "var(--weight-bold)" as any, color, fontFeatureSettings: "'tnum'" }}>{score}</span>
        </div>
      </div>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--muted-foreground)" }}>{label}</span>
    </motion.div>
  );
}

/* ═══ C08: SCORE RING ═══ */
function ScoreRingSpec() {
  const [customScore, setCustomScore] = useState(75);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="ScoreRing" description="Anelli SVG animati! L'animazione strokeDashoffset parte al scroll. Hover per ingrandire, slider per controllare il valore." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Lo ScoreRing è un anello SVG animato che visualizza un punteggio 0–100. L'animazione strokeDashoffset parte con whileInView. Usato nei 5 assi del composite score e nelle card stile."
        principi={[
          "Animazione: strokeDashoffset con ease emphasized [0.16, 1, 0.3, 1]",
          "Hover: scale 1.08 via spring — feedback interattivo",
          "Colore dinamico per tier: cta (≥80), tertiary (≥60), sienna (≥40), destructive (<40)",
        ]}
        anatomia={[
          { parte: "SVG", desc: "Cerchio con rotate(-90deg) per partenza da top" },
          { parte: "Track", desc: "surface-container stroke, width 5px" },
          { parte: "Fill", desc: "strokeDashoffset animato, strokeLinecap round" },
          { parte: "Label", desc: "DM Sans, font-size-md, uppercase, tracking-widest" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Valori esempio — 5 assi composite (hover per ingrandire)</span>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <AnimatedRing score={85} label="Autenticità" color="var(--warm-sienna)" />
          <AnimatedRing score={72} label="Fattibilità" color="var(--cta)" />
          <AnimatedRing score={90} label="Digeribilità" color="var(--tertiary)" />
          <AnimatedRing score={68} label="Sostenibilità" color="var(--warm-sage)" />
          <AnimatedRing score={45} label="Sperimentazione" color="var(--secondary)" />
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Controllo interattivo — Trascina lo slider</span>
        <div className="mt-4 flex items-center gap-8 justify-center">
          <AnimatedRing
            score={customScore} label="Custom"
            color={customScore >= 80 ? "var(--cta)" : customScore >= 60 ? "var(--tertiary)" : customScore >= 40 ? "var(--warm-sienna)" : "var(--destructive)"}
            size={96} strokeWidth={6}
          />
          <Slider
            style={{ width: "200px" }}
            value={customScore}
            min={0}
            max={100}
            onValueChange={setCustomScore}
            label="Score"
            unit="/100"
          />
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Taglie — Small / Medium / Large</span>
        <div className="mt-4 flex items-end justify-center gap-8">
          <AnimatedRing score={78} label="Small" color="var(--primary)" size={56} strokeWidth={4} />
          <AnimatedRing score={78} label="Medium" color="var(--primary)" size={72} strokeWidth={5} />
          <AnimatedRing score={78} label="Large" color="var(--primary)" size={96} strokeWidth={6} />
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Range cromatici per tier</span>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <AnimatedRing score={92} label="Perfetto" color="var(--cta)" />
          <AnimatedRing score={72} label="Buono" color="var(--tertiary)" />
          <AnimatedRing score={45} label="Sfidante" color="var(--warm-sienna)" />
          <AnimatedRing score={20} label="Critico" color="var(--destructive)" />
        </div>
      </Surface>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare whileInView per triggerare l'animazione al primo scroll",
          "Colore semantico per tier: cta ≥80, tertiary ≥60, sienna ≥40, destructive <40",
          "Hover scale 1.08 per feedback — l'utente capisce che è interattivo",
        ]}
        nonFare={[
          "Mai animare il ring senza once: true — evitare ri-animazioni",
          "Mai usare più di 5 ring in una riga — wrappare con flex-wrap",
          "Mai rimuovere la label sotto il ring — il numero da solo non comunica il contesto",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='meter' con aria-valuenow, aria-valuemin=0, aria-valuemax=100 e aria-label." },
        { label: "Reduced motion", desc: "Con prefers-reduced-motion: il ring appare a valore finale senza animazione." },
        { label: "Contrasto", desc: "Il colore del fill ha contrasto ≥3:1 contro il track (non-text)." },
      ]} />
    </div>
  );
}

/* ═══ C09: RECIPE STAT STRIP ═══ */
const STAT_DATA = [
  { icon: Flame, label: "Idratazione", value: "68%", color: "var(--primary)" },
  { icon: Wheat, label: "Farina W", value: "300", color: "var(--tertiary)" },
  { icon: Timer, label: "Fermento", value: "24h", color: "var(--cta)" },
  { icon: Zap, label: "Cottura", value: "90s", color: "var(--warm-sienna)" },
];

function StatStripSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="RecipeStatStrip" description="Strip orizzontale con 4 metriche chiave — hover per evidenziare! DM Sans tabular-nums per numeri, icone tematiche, sfondo surface-container." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="La RecipeStatStrip è una barra orizzontale che mostra le 4 metriche chiave della ricetta: idratazione, W farina, ore fermentazione, tempo cottura. Ogni stat ha icona tematica e hover con lift."
        principi={[
          "4 stat fissi: Idratazione, Farina W, Fermento, Cottura",
          "Numeri in DM Sans con tabular-nums per allineamento",
          "Hover: y -3 con shadow-md via spring per feedback interattivo",
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)", marginBottom: "12px", display: "block" }}>Specimen — Strip completa (hover sui singoli stat)</span>
        <div className="flex gap-3">
          {STAT_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl cursor-pointer active:scale-[0.96]"
                style={{ background: "var(--surface-container)" }}
                whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon size={16} style={{ color: stat.color }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-3xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>{stat.value}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", fontWeight: "var(--weight-semibold)" as any }}>{stat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </Surface>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Mantenere sempre 4 stat — aggiungerne altri rompe il ritmo visivo",
          "Icone tematiche: Flame per idratazione, Wheat per farina, Timer per fermento, Zap per cottura",
          "Hover con lift (y: -3) e shadow per comunicare interattività",
        ]}
        nonFare={[
          "Mai più di 4 stat — se servono più dati, usare una tabella",
          "Mai cambiare l'ordine dei 4 stat — l'utente si aspetta la sequenza fissa",
          "Mai numeri senza tabular-nums — il layout salta durante l'aggiornamento",
        ]}
        responsive="Su mobile (<640px) la strip diventa 2×2 grid con gap-2. I label si abbreviano."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Semantica", desc: "Ogni stat è un <div> con aria-label='Idratazione: 68%'. Il gruppo ha role='group'." },
        { label: "Contrasto", desc: "Il valore numerico (foreground) su surface-container soddisfa WCAG AA (4.5:1)." },
      ]} />
    </div>
  );
}

/* ═══ C10: SNACKBAR / TOAST ═══ */
const TOAST_CONFIG: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  info: { color: "var(--primary)", icon: Info, bg: "color-mix(in srgb, var(--primary) 8%, var(--surface-container-lowest))" },
  success: { color: "var(--cta)", icon: CheckCircle, bg: "color-mix(in srgb, var(--cta) 8%, var(--surface-container-lowest))" },
  warning: { color: "var(--tertiary)", icon: AlertTriangle, bg: "color-mix(in srgb, var(--tertiary) 8%, var(--surface-container-lowest))" },
  error: { color: "var(--destructive)", icon: AlertTriangle, bg: "color-mix(in srgb, var(--destructive) 8%, var(--surface-container-lowest))" },
};

const TOAST_TRIGGERS = [
  { type: "info", label: "Info", msg: "Ricetta generata con successo." },
  { type: "success", label: "Successo", msg: "Ingredienti copiati negli appunti!", action: "Annulla" },
  { type: "warning", label: "Avviso", msg: "Temperatura forno inferiore all'ideale — compensazioni applicate." },
  { type: "error", label: "Errore", msg: "Impossibile salvare. Riprova.", action: "Riprova" },
];

const TOAST_ANATOMY = [
  { prop: "Background", val: "color-mix({color} 8%, surface)" },
  { prop: "Border", val: "1px solid var(--outline-variant)" },
  { prop: "Radius", val: "rounded-2xl (1rem)" },
  { prop: "Shadow", val: "var(--shadow-lg)" },
  { prop: "Padding", val: "12px 16px" },
  { prop: "Auto-dismiss", val: "4000ms" },
  { prop: "Exit", val: "opacity 0, x +80, scale 0.9" },
  { prop: "Entrance", val: "spring stiffness 400 damping 25" },
];

/* ═══ SINGLE TOAST (With Hover Pause/Resume) ═══ */
function SingleToast({
  toast,
  cfg,
  onDismiss,
}: {
  toast: { id: number; type: string; message: string; action?: string };
  cfg: any;
  onDismiss: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const timeLeft = useRef(4000);
  const lastTick = useRef(Date.now());
  const timerRef = useRef<any>(null);

  React.useEffect(() => {
    if (!paused) {
      lastTick.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, timeLeft.current);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      const elapsed = Date.now() - lastTick.current;
      timeLeft.current = Math.max(0, timeLeft.current - elapsed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, onDismiss]);

  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: cfg.bg,
        border: "1px solid var(--outline-variant)",
        boxShadow: "var(--shadow-lg)",
        maxWidth: "440px",
        cursor: "pointer",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
      <p className="flex-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", color: "var(--text-default)", lineHeight: "var(--leading-body)" }}>{toast.message}</p>
      {toast.action && (
        <button className="active:scale-95 transition-transform" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: cfg.color, background: "none", border: "none", cursor: "pointer", outline: "none", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "var(--tracking-label)" }}>{toast.action}</button>
      )}
      <button onClick={onDismiss} className="active:scale-[0.85] transition-transform" style={{ color: "var(--muted-foreground)", opacity: 0.5, cursor: "pointer", background: "none", border: "none", outline: "none", flexShrink: 0, padding: "2px" }} aria-label="Chiudi toast">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function SnackbarToastSpec() {
  const [toasts, setToasts] = useState<{ id: number; type: string; message: string; action?: string }[]>([]);
  const nextId = useRef(0);
  const [hoveredType, setHoveredType] = React.useState<string | null>(null);

  const addToast = (type: string, message: string, action?: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, type, message, action }]);
  };
  const dismissToast = (id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)); };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Snackbar / Toast" description="Notifiche temporanee con 4 varianti semantiche. Auto-dismiss a 4s, dismissibili con ×, opzionalmente con azione. Clicca i bottoni per triggerare!" />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Toast temporanee con 4 varianti semantiche: info (primary), success (cta), warning (tertiary), error (destructive). Auto-dismiss a 4 secondi, dismissibili con ×, opzionalmente con azione inline."
        principi={[
          "4 varianti: info, success, warning, error — colore e icona derivati dal tipo",
          "Entrance: spring (stiffness 400, damping 25) con y +12 e scale 0.95",
          "Exit: opacity 0, x +80, scale 0.9 per effetto 'swipe away'",
          "Auto-dismiss: 4000ms — il timer si mette in pausa al hover (Completato)",
        ]}
        anatomia={[
          { parte: "Container", desc: "rounded-2xl, shadow-lg, max-width 440px" },
          { parte: "Icon", desc: "16px, colore semantico, flex-shrink 0" },
          { parte: "Message", desc: "DM Sans, font-size-lg, line-height body" },
          { parte: "Action", desc: "DM Sans, font-size-base, uppercase, colore semantico" },
          { parte: "Dismiss", desc: "X 14px, muted-foreground, opacity 0.5" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Triggera una Toast (clicca!)</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOAST_TRIGGERS.map((t) => (
            <CtaButton
              key={t.type}
              variant="secondary"
              radius="lg"
              onClick={() => addToast(t.type, t.msg, t.action)}
              onPointerEnter={() => setHoveredType(t.type)}
              onPointerLeave={() => setHoveredType(null)}
              className="px-4 py-2"
              style={{
                color: TOAST_CONFIG[t.type]?.color || "var(--text-default)",
                transition: "filter 0.15s ease",
                filter: hoveredType === t.type ? "brightness(0.92)" : undefined,
              }}
            >
              {React.createElement(TOAST_CONFIG[t.type]?.icon || Info, { size: 14 })}
              {t.label}
            </CtaButton>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2" style={{ minHeight: "60px" }}>
          <AnimatePresence>
            {toasts.map((toast) => {
              const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
              return (
                <SingleToast
                  key={toast.id}
                  toast={toast}
                  cfg={cfg}
                  onDismiss={() => dismissToast(toast.id)}
                />
              );
            })}
          </AnimatePresence>
          {toasts.length === 0 && (
            <div className="flex items-center justify-center py-4 rounded-xl" style={{ background: "var(--surface-container)", opacity: 0.5 }}>
              <span className="type-data" style={{ fontSize: "var(--font-size-lg)", color: "var(--muted-foreground)" }}>Nessuna toast attiva — clicca un bottone sopra</span>
            </div>
          )}
        </div>
      </Surface>

      {/* Static specimens */}
      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Specimen — Tutte le varianti</span>
        <div className="mt-3 flex flex-col gap-2">
          {TOAST_TRIGGERS.map((t) => {
            const cfg = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={t.type} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: cfg.bg, border: "1px solid var(--outline-variant)", boxShadow: "var(--shadow-sm)" }}>
                <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
                <p className="flex-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", lineHeight: "var(--leading-body)" }}>{t.msg}</p>
                {t.action && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: cfg.color, textTransform: "uppercase", letterSpacing: "var(--tracking-label)", whiteSpace: "nowrap" }}>{t.action}</span>}
                <X size={14} style={{ color: "var(--muted-foreground)", opacity: 0.4, flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia Snackbar</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOAST_ANATOMY.map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </Surface>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Auto-dismiss a 4 secondi — tempo sufficiente per leggere",
          "Icona semantica + colore per identificazione rapida del tipo",
          "Azione inline (Annulla, Riprova) per feedback contestuale",
        ]}
        nonFare={[
          "Mai più di 3 toast visibili contemporaneamente — stacking max 3",
          "Mai toast senza possibilità di dismiss — sempre il bottone ×",
          "Mai toast per informazioni critiche — usare un dialog modale",
        ]}
        comportamento="Le toast si impilano dal basso. Nuove toast push-up le esistenti. Exit con swipe a destra."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA live", desc: "role='status' con aria-live='polite' per info/success. aria-live='assertive' per error." },
        { label: "Dismiss", desc: "Il bottone × ha aria-label='Chiudi toast'. Escape chiude tutte le toast." },
        { label: "Focus trap", desc: "Se la toast ha un'azione, il focus si sposta sulla toast alla comparsa." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "scorering", label: "ScoreRing", group: "c", Component: ScoreRingSpec },
  { id: "statstrip", label: "RecipeStatStrip", group: "c", Component: StatStripSpec },
  { id: "snackbar", label: "Snackbar / Toast", group: "c", Component: SnackbarToastSpec },
];