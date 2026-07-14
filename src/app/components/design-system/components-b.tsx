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
import { Surface, Slider, CtaButton, IconButton } from "../ds/index";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

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
      className="flex flex-col items-center gap-1.5 active:scale-95 dsx-s-9463ff4798"
      whileHover={{ scale: 1.08 }}
      transition={showcaseTransition.preset_0e2957ab5e}
    >
      <div className="relative dsx-s-43f9590b73" style={{ "--dsx-width": toShowcaseCssValue(size, false), "--dsx-height": toShowcaseCssValue(size, false) } as any}>
        <svg width={size} height={size} className="dsx-s-a6d87bd8e8">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-container)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true, amount: 0.5 }}
            transition={showcaseTransition.preset_4533d17723}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ "--dsx-font-size": toShowcaseCssValue(size * 0.28, false), "--dsx-color": toShowcaseCssValue(color, false) } as any} className="dsx-s-99dfb3f7a9">{score}</span>
        </div>
      </div>
      <span className="dsx-s-5731e6e664">{label}</span>
    </motion.div>
  );
}

/* ═══ C08: SCORE RING ═══ */
function ScoreRingSpec() {
  const [customScore, setCustomScore] = useState(75);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-b.scorering-57c7a893")} description={showcaseMessage("components.design-system.components-b.anelli-svg-animati-l-animazione-strokedash-e2b9bc52")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-b.lo-scorering-e-un-anello-svg-animato-che-v-86e75159")}
        principi={[
          showcaseMessage("components.design-system.components-b.animazione-strokedashoffset-con-ease-empha-5e442e75"),
          showcaseMessage("components.design-system.components-b.hover-scale-1-08-via-spring-feedback-inter-82a18441"),
          showcaseMessage("components.design-system.components-b.colore-dinamico-per-tier-cta-80-tertiary-6-0a159ba4"),
        ]}
        anatomia={[
          { parte: "SVG", desc: showcaseMessage("components.design-system.components-b.cerchio-con-rotate-90deg-per-partenza-da-t-092aa79d") },
          { parte: showcaseMessage("components.design-system.components-b.track-b1c5a7af"), desc: showcaseMessage("components.design-system.components-b.surface-container-stroke-width-5px-35cccf60") },
          { parte: showcaseMessage("components.design-system.components-b.fill-7adb6736"), desc: showcaseMessage("components.design-system.components-b.strokedashoffset-animato-strokelinecap-rou-e130acbf") },
          { parte: showcaseMessage("components.design-system.components-b.label-74341e3c"), desc: showcaseMessage("components.design-system.components-b.dm-sans-font-size-md-uppercase-tracking-wi-f755d227") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.valori-esempio-5-assi-composite-hover-per--7f940d55")}</span>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <AnimatedRing score={85} label={showcaseMessage("components.design-system.components-b.autenticita-c750345b")} color="var(--warm-sienna)" />
          <AnimatedRing score={72} label={showcaseMessage("components.design-system.components-b.fattibilita-2e718f11")} color="var(--cta)" />
          <AnimatedRing score={90} label={showcaseMessage("components.design-system.components-b.digeribilita-b0167124")} color="var(--tertiary)" />
          <AnimatedRing score={68} label={showcaseMessage("components.design-system.components-b.sostenibilita-7cea5449")} color="var(--warm-sage)" />
          <AnimatedRing score={45} label={showcaseMessage("components.design-system.components-b.sperimentazione-d09679c9")} color="var(--secondary)" />
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.controllo-interattivo-trascina-lo-slider-743d163b")}</span>
        <div className="mt-4 flex items-center gap-8 justify-center">
          <AnimatedRing
            score={customScore} label={showcaseMessage("components.design-system.components-b.custom-081ae3fd")}
            color={customScore >= 80 ? "var(--cta)" : customScore >= 60 ? "var(--tertiary)" : customScore >= 40 ? "var(--warm-sienna)" : "var(--destructive)"}
            size={96} strokeWidth={6}
          />
          <Slider
            value={customScore}
            min={0}
            max={100}
            onValueChange={setCustomScore}
            label={showcaseMessage("components.design-system.components-b.score-489f4877")}
            unit="/100" className="dsx-s-3cab7ef27d"
          />
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.taglie-small-medium-large-d60ae72c")}</span>
        <div className="mt-4 flex items-end justify-center gap-8">
          <AnimatedRing score={78} label={showcaseMessage("components.design-system.components-b.small-c74fd971")} color="var(--primary)" size={56} strokeWidth={4} />
          <AnimatedRing score={78} label={showcaseMessage("components.design-system.components-b.medium-d404968e")} color="var(--primary)" size={72} strokeWidth={5} />
          <AnimatedRing score={78} label={showcaseMessage("components.design-system.components-b.large-738fd1d2")} color="var(--primary)" size={96} strokeWidth={6} />
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.range-cromatici-per-tier-e084cdd9")}</span>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <AnimatedRing score={92} label={showcaseMessage("components.design-system.components-b.perfetto-0468c428")} color="var(--cta)" />
          <AnimatedRing score={72} label={showcaseMessage("components.design-system.components-b.buono-42d99a3b")} color="var(--tertiary)" />
          <AnimatedRing score={45} label={showcaseMessage("components.design-system.components-b.sfidante-a89eb9c3")} color="var(--warm-sienna)" />
          <AnimatedRing score={20} label={showcaseMessage("components.design-system.components-b.critico-426dea38")} color="var(--destructive)" />
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-b.usare-whileinview-per-triggerare-l-animazi-a1a67850"),
          showcaseMessage("components.design-system.components-b.colore-semantico-per-tier-cta-80-tertiary--bb311243"),
          showcaseMessage("components.design-system.components-b.hover-scale-1-08-per-feedback-l-utente-cap-0a66a436"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-b.mai-animare-il-ring-senza-once-true-evitar-f9a396da"),
          showcaseMessage("components.design-system.components-b.mai-usare-piu-di-5-ring-in-una-riga-wrappa-5d5e9a7b"),
          showcaseMessage("components.design-system.components-b.mai-rimuovere-la-label-sotto-il-ring-il-nu-675bc938"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-b.role-meter-con-aria-valuenow-aria-valuemin-a5f2ff57") },
        { label: showcaseMessage("components.design-system.components-b.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.components-b.con-prefers-reduced-motion-il-ring-appare--163ec4f6") },
        { label: showcaseMessage("components.design-system.components-b.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.components-b.il-colore-del-fill-ha-contrasto-3-1-contro-69d4c356") },
      ]} />
    </div>
  );
}

/* ═══ C09: RECIPE STAT STRIP ═══ */
const STAT_DATA = [
  { icon: Flame, label: showcaseMessage("components.design-system.components-b.idratazione-ca30c32c"), value: "68%", color: "var(--primary)" },
  { icon: Wheat, label: showcaseMessage("components.design-system.components-b.farina-w-9be32fb5"), value: "300", color: "var(--tertiary)" },
  { icon: Timer, label: showcaseMessage("components.design-system.components-b.fermento-96079945"), value: "24h", color: "var(--cta)" },
  { icon: Zap, label: showcaseMessage("components.design-system.components-b.cottura-95c1a57a"), value: "90s", color: "var(--warm-sienna)" },
];

function StatStripSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-b.recipestatstrip-2165724f")} description={showcaseMessage("components.design-system.components-b.strip-orizzontale-con-4-metriche-chiave-ho-ff4adf1a")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-b.la-recipestatstrip-e-una-barra-orizzontale-719339f4")}
        principi={[
          showcaseMessage("components.design-system.components-b.4-stat-fissi-idratazione-farina-w-fermento-7528a2c1"),
          showcaseMessage("components.design-system.components-b.numeri-in-dm-sans-con-tabular-nums-per-all-613d6202"),
          showcaseMessage("components.design-system.components-b.hover-y-3-con-shadow-md-via-spring-per-fee-7b3a8bf0"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-2dd6102f0b">{showcaseMessage("components.design-system.components-b.specimen-strip-completa-hover-sui-singoli--a95c0df5")}</span>
        <div className="flex gap-3">
          {STAT_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl cursor-pointer active:scale-96 dsx-s-e4f209c55b"
                whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
                transition={showcaseTransition.preset_0e2957ab5e}
              >
                <Icon size={16} style={{ "--dsx-color": toShowcaseCssValue(stat.color, false) } as any} className="dsx-s-3c487ee146" />
                <span className="dsx-s-5945ae1d1a">{stat.value}</span>
                <span className="dsx-s-9ad0455005">{stat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-b.mantenere-sempre-4-stat-aggiungerne-altri--aa535e2d"),
          showcaseMessage("components.design-system.components-b.icone-tematiche-flame-per-idratazione-whea-caf421eb"),
          showcaseMessage("components.design-system.components-b.hover-con-lift-y-3-e-shadow-per-comunicare-50dd2631"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-b.mai-piu-di-4-stat-se-servono-piu-dati-usar-c91b2aaa"),
          showcaseMessage("components.design-system.components-b.mai-cambiare-l-ordine-dei-4-stat-l-utente--164bba83"),
          showcaseMessage("components.design-system.components-b.mai-numeri-senza-tabular-nums-il-layout-sa-34d7e257"),
        ]}
        responsive={showcaseMessage("components.design-system.components-b.su-mobile-640px-la-strip-diventa-2-2-grid--68d9f75e")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-b.semantica-5b1a8db9"), desc: showcaseMessage("components.design-system.components-b.ogni-stat-e-un-div-con-aria-label-idratazi-8c7048d6") },
        { label: showcaseMessage("components.design-system.components-b.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.components-b.il-valore-numerico-foreground-su-surface-c-c3ff0500") },
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
  { type: "info", label: showcaseMessage("components.design-system.components-b.info-4b631f69"), msg: showcaseMessage("components.design-system.components-b.ricetta-generata-con-successo-fe672f21") },
  { type: "success", label: showcaseMessage("components.design-system.components-b.successo-c9ab813c"), msg: showcaseMessage("components.design-system.components-b.ingredienti-copiati-negli-appunti-fb7a5d2f"), action: showcaseMessage("components.design-system.components-b.annulla-6c3de538") },
  { type: "warning", label: showcaseMessage("components.design-system.components-b.avviso-144c72dd"), msg: showcaseMessage("components.design-system.components-b.temperatura-forno-inferiore-all-ideale-com-0fd86418") },
  { type: "error", label: showcaseMessage("components.design-system.components-b.errore-ed7261a6"), msg: showcaseMessage("components.design-system.components-b.impossibile-salvare-riprova-6b63bb63"), action: showcaseMessage("components.design-system.components-b.riprova-f360775c") },
];

const TOAST_ANATOMY = [
  { prop: showcaseMessage("components.design-system.components-b.background-64dd60fe"), val: showcaseMessage("components.design-system.components-b.color-mix-color-8-surface-e1745913") },
  { prop: showcaseMessage("components.design-system.components-b.border-5d10d3f4"), val: showcaseMessage("components.design-system.components-b.1px-solid-var-outline-variant-88aa4f0b") },
  { prop: showcaseMessage("components.design-system.components-b.radius-e5aaeaac"), val: showcaseMessage("components.design-system.components-b.rounded-2xl-1rem-38385d5d") },
  { prop: showcaseMessage("components.design-system.components-b.shadow-aa0e7e86"), val: "var(--shadow-lg)" },
  { prop: showcaseMessage("components.design-system.components-b.padding-9c47ca55"), val: showcaseMessage("components.design-system.components-b.12px-16px-3fe4e51f") },
  { prop: showcaseMessage("components.design-system.components-b.auto-dismiss-4e7d55f2"), val: "4000ms" },
  { prop: showcaseMessage("components.design-system.components-b.exit-f83b6fe3"), val: showcaseMessage("components.design-system.components-b.opacity-0-x-80-scale-0-9-9d2cc323") },
  { prop: showcaseMessage("components.design-system.components-b.entrance-aa4bbfb3"), val: showcaseMessage("components.design-system.components-b.spring-stiffness-400-damping-25-3a2b2474") },
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
      transition={showcaseTransition.preset_0e2957ab5e}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl dsx-s-0acb7be1e5"
      style={{ "--dsx-background": toShowcaseCssValue(cfg.bg, false) } as any}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Icon size={16} style={{ "--dsx-color": toShowcaseCssValue(cfg.color, false) } as any} className="dsx-s-40925c3408" />
      <p className="flex-1 dsx-s-00a59fffa5">{toast.message}</p>
      {toast.action && (
        <CtaButton variant="secondary" elevated={false} radius="lg" className="active:scale-95 transition-transform dsx-s-8f3b3ecbfd" style={{ "--dsx-color": toShowcaseCssValue(cfg.color, false) } as any}>{toast.action}</CtaButton>
      )}
      <IconButton size="sm" variant="bare" onClick={onDismiss} className="active:scale-85 transition-transform dsx-s-33a4c1c021" aria-label={showcaseMessage("components.design-system.components-b.chiudi-toast-8e74d6d9")}>
        <X size={14} />
      </IconButton>
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
      <SectionHeader title={showcaseMessage("components.design-system.components-b.snackbar-toast-d13cca4f")} description={showcaseMessage("components.design-system.components-b.notifiche-temporanee-con-4-varianti-semant-2157d7bb")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-b.toast-temporanee-con-4-varianti-semantiche-f989ebd1")}
        principi={[
          showcaseMessage("components.design-system.components-b.4-varianti-info-success-warning-error-colo-4e9146c8"),
          showcaseMessage("components.design-system.components-b.entrance-spring-stiffness-400-damping-25-c-198e6e39"),
          showcaseMessage("components.design-system.components-b.exit-opacity-0-x-80-scale-0-9-per-effetto--5ad7e9ee"),
          showcaseMessage("components.design-system.components-b.auto-dismiss-4000ms-il-timer-si-mette-in-p-b75b0863"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.components-b.container-e6443af9"), desc: showcaseMessage("components.design-system.components-b.rounded-2xl-shadow-lg-max-width-440px-5ed04871") },
          { parte: showcaseMessage("components.design-system.components-b.icon-716f63b9"), desc: showcaseMessage("components.design-system.components-b.16px-colore-semantico-flex-shrink-0-03ccdebe") },
          { parte: showcaseMessage("components.design-system.components-b.message-68f4145f"), desc: showcaseMessage("components.design-system.components-b.dm-sans-font-size-lg-line-height-body-542e88ac") },
          { parte: showcaseMessage("components.design-system.components-b.action-97c89a4d"), desc: showcaseMessage("components.design-system.components-b.dm-sans-font-size-base-uppercase-colore-se-21dcecc4") },
          { parte: showcaseMessage("components.design-system.components-b.dismiss-70afe9ef"), desc: showcaseMessage("components.design-system.components-b.x-14px-muted-foreground-opacity-0-5-403172de") },
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.specifiche-057caf2f")} />
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.triggera-una-toast-clicca-ebd8bdb2")}</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOAST_TRIGGERS.map((t) => (
            <CtaButton
              key={t.type}
              variant="secondary"
              radius="lg"
              onClick={() => addToast(t.type, t.msg, t.action)}
              onPointerEnter={() => setHoveredType(t.type)}
              onPointerLeave={() => setHoveredType(null)}
              className="px-4 py-2 dsx-s-786d186080"
              style={{ "--dsx-color": toShowcaseCssValue(TOAST_CONFIG[t.type]?.color || "var(--text-default)", false), "--dsx-filter": toShowcaseCssValue(hoveredType === t.type ? "brightness(0.92)" : undefined, false) } as any}
            >
              {React.createElement(TOAST_CONFIG[t.type]?.icon || Info, { size: 14 })}
              {t.label}
            </CtaButton>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 dsx-s-07bdff4587">
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
            <div className="flex items-center justify-center py-4 rounded-xl dsx-s-58f3e54615 ds-showcase__opaque-specimen">
              <span className="type-data dsx-s-99d4a660bb ds-showcase__data-ink">{showcaseMessage("components.design-system.components-b.nessuna-toast-attiva-clicca-un-bottone-sop-a0882e44")}</span>
            </div>
          )}
        </div>
      </Surface>

      {/* Static specimens */}
      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.specimen-tutte-le-varianti-c186a6c5")}</span>
        <div className="mt-3 flex flex-col gap-2">
          {TOAST_TRIGGERS.map((t) => {
            const cfg = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={t.type} className="flex items-center gap-3 px-4 py-3 rounded-2xl dsx-s-e7fc852511" style={{ "--dsx-background": toShowcaseCssValue(cfg.bg, false) } as any}>
                <Icon size={16} style={{ "--dsx-color": toShowcaseCssValue(cfg.color, false) } as any} className="dsx-s-40925c3408" />
                <p className="flex-1 dsx-s-64c36ab903">{t.msg}</p>
                {t.action && <span style={{ "--dsx-color": toShowcaseCssValue(cfg.color, false) } as any} className="dsx-s-5f1dbef51c">{t.action}</span>}
                <X size={14} className="dsx-s-fefb6ffecf" />
              </div>
            );
          })}
        </div>
      </Surface>

      <Surface variant="card" className="p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-b.anatomia-snackbar-65a294a3")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOAST_ANATOMY.map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </Surface>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-b.auto-dismiss-a-4-secondi-tempo-sufficiente-c41b2cf4"),
          showcaseMessage("components.design-system.components-b.icona-semantica-colore-per-identificazione-1a106991"),
          showcaseMessage("components.design-system.components-b.azione-inline-annulla-riprova-per-feedback-d0a45ec5"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-b.mai-piu-di-3-toast-visibili-contemporaneam-5fdff2c3"),
          showcaseMessage("components.design-system.components-b.mai-toast-senza-possibilita-di-dismiss-sem-260d9516"),
          showcaseMessage("components.design-system.components-b.mai-toast-per-informazioni-critiche-usare--2aa0d5cc"),
        ]}
        comportamento={showcaseMessage("components.design-system.components-b.le-toast-si-impilano-dal-basso-nuove-toast-6b82844d")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-b.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-b.aria-live-2c8266d1"), desc: showcaseMessage("components.design-system.components-b.role-status-con-aria-live-polite-per-info--81f6ab1d") },
        { label: showcaseMessage("components.design-system.components-b.dismiss-70afe9ef"), desc: showcaseMessage("components.design-system.components-b.il-bottone-ha-aria-label-chiudi-toast-esca-29dc5ea0") },
        { label: showcaseMessage("components.design-system.components-b.focus-trap-f835888b"), desc: showcaseMessage("components.design-system.components-b.se-la-toast-ha-un-azione-il-focus-si-spost-adfe6895") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "scorering", label: showcaseMessage("components.design-system.components-b.scorering-57c7a893"), group: "c", Component: ScoreRingSpec },
  { id: "statstrip", label: showcaseMessage("components.design-system.components-b.recipestatstrip-2165724f"), group: "c", Component: StatStripSpec },
  { id: "snackbar", label: showcaseMessage("components.design-system.components-b.snackbar-toast-d13cca4f"), group: "c", Component: SnackbarToastSpec },
];
