/* ═══ COOKING MODE — vista della Pizzata attiva (v2, giugno 2026) ═══
 * Ripensata dopo feedback: le fasi durano ore, quindi NON è un wizard da
 * tenere aperto. È la vista full-screen di una sessione persistente
 * (cook-session.tsx): chiuderla non perde nulla — il widget flottante e le
 * notifiche continuano a seguire la pizzata. I countdown sono ancorati a
 * timestamp assoluti, non a timer manuali.
 */

import {
AlertTriangle,
BellRing,
Check,
ChevronLeft,
ChevronRight,
Clock,
Lightbulb,
Trash2,
X,
} from "lucide-react";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { motionDelay,motionDuration,motionEase,motionSpring } from "../../components/ds/motion";
import { useCallback,useEffect,useMemo,useState } from "react";
import { createPortal } from "react-dom";
import { useCms,type CmsContent } from "../cms/cms-context";
import { t } from "../cms/i18n";
import {
currentStepIndex,
formatEta,
formatStepClock,
useCookSession,
type CookSessionStep
} from "./cook-session";
import { ConfirmDialog, CtaButton } from "../../components/ds/index";
import { DoughBlob } from "./dough-mascot";
import { StepIllustration } from "./step-illustrations";

type CookingCopy = CmsContent["cooking"];

function formatDurationLabel(min: number, copy: CookingCopy): string {
  if (min < 60) return t(copy.durationMinutes, { n: min });
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) {
    return m > 0
      ? t(copy.durationHoursMinutes, { h, m })
      : t(copy.durationHours, { h });
  }
  const d = Math.floor(h / 24);
  const hr = h % 24;
  return hr > 0
    ? t(copy.durationDaysHours, { d, h: hr })
    : t(copy.durationDays, {
        d,
        unit: d === 1 ? copy.durationDayUnit : copy.durationDaysUnit,
      });
}

/* ── Countdown automatico della fase, ancorato a endMs ── */
function PhaseCountdown({ step, isCurrent }: { step: CookSessionStep; isCurrent: boolean }) {
  const { cms, bcp47 } = useCms();
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), step.duration_minutes >= 90 ? 30_000 : 1000);
    return () => clearInterval(i);
  }, [step.duration_minutes]);

  const now = Date.now();
  const notStarted = now < step.startMs;
  const remainingMs = Math.max(0, step.endMs - now);
  const phaseDone = now >= step.endMs;
  const totalMs = step.endMs - step.startMs;
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, (now - step.startMs) / totalMs)) : 1;

  const remainingLabel = (() => {
    const min = Math.ceil(remainingMs / 60_000);
    if (min >= 60) return formatDurationLabel(min, cms.cooking);
    if (min > 1 || step.duration_minutes >= 90) {
      return t(cms.cooking.durationMinutes, { n: min });
    }
    const sec = Math.ceil(remainingMs / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  })();
  const phaseDuration = formatDurationLabel(step.duration_minutes, cms.cooking);
  const phaseEnd = formatStepClock(step.endMs, step.flexible, bcp47);

  return (
    <div className={`cooking-mode-phase${phaseDone ? " cooking-mode-phase--done" : ""}`}>
      <div className="cooking-mode-phase__head">
        <Clock size={18} className="cooking-mode-phase__icon" />
        <div className="cooking-mode-phase__body">
          <div className="type-numeric cooking-mode-phase__value">
            {notStarted
              ? t(cms.cooking.stepStartsIn, {
                  eta: formatEta(step.startMs, Date.now(), cms.cooking),
                })
              : phaseDone
                ? cms.cooking.phaseDone
                : t(cms.cooking.phaseRemaining, { time: remainingLabel })}
          </div>
          <div className="cooking-mode-phase__meta">
            {step.flexible
              ? t(cms.cooking.passivePhaseMeta, {
                  duration: phaseDuration,
                  time: phaseEnd,
                })
              : t(cms.cooking.activePhaseMeta, {
                  duration: phaseDuration,
                  time: phaseEnd,
                })}
          </div>
        </div>
        {phaseDone && isCurrent && (
          <span className="cooking-mode-phase__badge">
            <BellRing size={12} />
            {cms.cooking.yourTurn}
          </span>
        )}
      </div>
      {!notStarted && !phaseDone && (
        <div className="cooking-mode-phase__track">
          <div
            className="cooking-mode-phase__track-fill"
            style={{ ["--phase-progress" as any]: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
      {step.flexible && !phaseDone && (
        <p className="cooking-mode-phase__hint">
          {cms.cooking.passiveCloseHint}
        </p>
      )}
    </div>
  );
}

export function CookingMode() {
  const { session, completeStep, closeOverlay, endSession } = useCookSession();
  const { cms, bcp47 } = useCms();
  const steps = session?.steps ?? [];
  const total = steps.length;
  const activeIdx = session ? Math.min(currentStepIndex(session), total - 1) : 0;
  const allDone = session ? currentStepIndex(session) >= total : false;

  /* viewIndex: si può sfogliare avanti/indietro senza toccare lo stato della sessione */
  const [viewIndex, setViewIndex] = useState(activeIdx);
  const [finished, setFinished] = useState(allDone);
  /* Conferma prima di buttare via una pizzata in corso: chiuderla è
     distruttivo (perdi timer e progresso), non un semplice "riduci". */
  const [confirmAbort, setConfirmAbort] = useState(false);

  useEffect(() => {
    /* Se la sessione avanza da fuori (widget/notifiche), riallinea la vista */
    setViewIndex((v) => Math.min(v, Math.max(0, total - 1)));
  }, [total]);

  /* Blocca lo scroll sotto */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Wake Lock: schermo acceso finché la vista è aperta (best effort) */
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
        };
        if (!nav.wakeLock) return;
        const l = await nav.wakeLock.request("screen");
        if (cancelled) l.release().catch(() => {});
        else lock = l;
      } catch {
        /* negato: non bloccante */
      }
    };
    request();
    const onVis = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);

  const step = steps[viewIndex];
  const isCurrent = viewIndex === activeIdx && !allDone;
  const viewingDone = step?.done ?? false;

  /* Tick per il countdown nel bottone (solo quando serve) */
  const [, setNavTick] = useState(0);
  useEffect(() => {
    if (!isCurrent || !step?.flexible) return;
    const i = setInterval(() => setNavTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [isCurrent, step?.flexible, step?.id]);

  /* Stato dell'attesa per lo step corrente flessibile */
  const now = Date.now();
  const waiting = isCurrent && !!step?.flexible && now < step.endMs;
  const waitOver = isCurrent && !!step?.flexible && now >= step.endMs;

  const advanceView = useCallback(() => {
    if (viewIndex >= total - 1) setFinished(true);
    else setViewIndex(viewIndex + 1);
  }, [viewIndex, total]);

  const goNext = useCallback(() => {
    if (!session) return;
    if (isCurrent && !waiting) {
      /* Fase attiva fatta, o attesa conclusa: completa e ri-ancora i tempi */
      completeStep(viewIndex);
      advanceView();
    } else if (!isCurrent && viewIndex < total - 1) {
      setViewIndex(viewIndex + 1);
    } else if (allDone) {
      setFinished(true);
    }
  }, [session, isCurrent, waiting, viewIndex, total, allDone, completeStep, advanceView]);

  /* "Ho finito prima": chiude l'attesa in anticipo, ri-ancorando il resto */
  const skipWait = useCallback(() => {
    if (!session || !isCurrent) return;
    completeStep(viewIndex);
    advanceView();
  }, [session, isCurrent, viewIndex, completeStep, advanceView]);

  const goPrev = useCallback(() => {
    if (finished) setFinished(false);
    else if (viewIndex > 0) setViewIndex(viewIndex - 1);
  }, [finished, viewIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, closeOverlay]);

  const doneCount = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  if (!session || !step) return null;

  const overlay = (
    <motion.div
      data-region="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="cooking-mode-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${cms.cooking.inProgress} — ${session.styleName}`}
    >
      {/* ── Header ── */}
      <div className="cooking-mode-header">
        <div className="cooking-mode-header__identity">
          <div className="cooking-mode-header__eyebrow">

          </div>
          <div className="cooking-mode-header__title">
            {session.styleName}
          </div>
        </div>
        <div className="cooking-mode-header__meta">
          <span className="type-numeric cooking-mode-header__counter">
            {Math.min(viewIndex + 1, total)} / {total}
          </span>
          {/* Interrompi: azione distruttiva, perciò chiede conferma. */}
          <button
            onClick={() => setConfirmAbort(true)}
            className="cooking-mode-header__action"
            aria-label={cms.cooking.interrupt}
            title={cms.cooking.interrupt}
          >
            <Trash2 size={17} />
          </button>
          <button
            onClick={closeOverlay}
            className="cooking-mode-header__action cooking-mode-header__action--close"
            aria-label={cms.cooking.minimize}
            title={cms.cooking.minimizeHint}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Conferma interruzione ── */}
      <ConfirmDialog
        open={confirmAbort}
        onDismiss={() => setConfirmAbort(false)}
        ariaLabel={cms.cooking.abortConfirmTitle}
        icon={<AlertTriangle size={26} />}
        tone="destructive"
        position="absolute"
        zIndex={10}
        title={cms.cooking.abortConfirmTitle}
        body={t(cms.cooking.abortBody, { style: session.styleName })}
        actions={[
          {
            label: (
              <>
                <Trash2 size={16} />
                {cms.cooking.abortYes}
              </>
            ),
            onClick: () => {
              setConfirmAbort(false);
              endSession();
            },
            variant: "destructive",
          },
          {
            label: cms.cooking.abortNo,
            onClick: () => setConfirmAbort(false),
            variant: "secondary",
          },
        ]}
      />

      {/* ── Progress ── */}
      <div className="cooking-mode-progress">
        <motion.div
          animate={{ width: `${finished ? 100 : progressPct}%` }}
          transition={motionSpring.cookingPanel}
          className="cooking-mode-progress__fill"
        />
      </div>

      {/* ── Contenuto ── */}
      <div className="cooking-mode-body">
        <div className="cooking-mode-body__inner">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="cooking-mode-finished"
              >
                {/* La mascotte festeggia con te: blob ad alta energia + burst
                    di coriandoli una tantum (niente con reduced-motion). */}
                <div className="cooking-mode-finished__burst-wrap">
                  <CelebrationBurst />
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...motionSpring.cookingStep,delay: motionDelay.short }}
                  >
                    <DoughBlob variant="rise" size={124} energy={92} />
                  </motion.div>
                </div>
                <h2 className="cooking-mode-finished__title">
                  {cms.cooking.completed}
                </h2>
                <p className="cooking-mode-finished__body">
                  {t(cms.cooking.doneBody, { style: session.styleName })}
                </p>
                <CtaButton
                  onClick={endSession}
                  className="cooking-mode-finished__cta"
                >
                  {cms.cooking.finish}
                </CtaButton>
              </motion.div>
            ) : (
              <motion.div
                key={step.id + viewIndex}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={motionSpring.steady}
                className="cooking-mode-step"
              >
                {/* Illustrazione di fase — respira piano, con alone caldo */}
                <div className="cooking-mode-step__illustration-wrap">
                  <div aria-hidden="true" className="cooking-mode-step__glow" />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: motionDuration.ambientPulse,repeat: Infinity,ease: motionEase.standard }}
                  >
                    <StepIllustration stepId={step.id} size={120} />
                  </motion.div>
                </div>

                {/* Orario onesto + stato */}
                <div className="cooking-mode-step__status-row">
                  <span className="type-numeric cooking-mode-step__clock">
                    {formatStepClock(step.startMs, step.flexible, bcp47)}
                  </span>
                  {viewingDone && (
                    <span className="cooking-mode-step__done-badge">
                      <Check size={13} /> {cms.cooking.stepDoneBadge}
                    </span>
                  )}
                </div>

                {/* Titolo */}
                <h2 className="cooking-mode-step__title">
                  {step.title}
                </h2>

                {/* Descrizione */}
                <p className="cooking-mode-step__description">
                  {step.description}
                </p>

                {step.longDesc && (
                  <p className="type-body-lg cooking-mode-step__long-desc">
                    {step.longDesc}
                  </p>
                )}

                {/* Countdown di fase ancorato agli orari reali */}
                {step.duration_minutes > 0 && !viewingDone && (
                  <PhaseCountdown step={step} isCurrent={isCurrent} />
                )}

                {/* Tip */}
                {step.tip && (
                  <div className="cooking-mode-step__tip">
                    <Lightbulb size={18} className="cooking-mode-step__tip-icon" />
                    <p className="type-body-lg cooking-mode-step__tip-text">
                      {step.tip}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigazione ── */}
      {!finished && (
        <div className="cooking-mode-nav">
          <div className="cooking-mode-nav__inner">
            {/* "Ho finito prima": uscita discreta dall'attesa */}
            {waiting && (
              <button
                onClick={skipWait}
                className="cooking-mode-nav__skip"
              >
                {cms.cooking.finishedEarly}
              </button>
            )}
            <div className="cooking-mode-nav__row">
              <button
                onClick={goPrev}
                disabled={viewIndex === 0}
                className="cooking-mode-nav__prev"
                aria-label={cms.cooking.prevStep}
              >
                <ChevronLeft size={24} />
              </button>
              <CtaButton
                onClick={goNext}
                disabled={waiting}
                aria-disabled={waiting}
                variant={isCurrent && !waiting ? "primary" : "secondary"}
                radius="xl"
                elevated={isCurrent && !waiting}
                className="cooking-mode-nav__cta"
              >
                {waiting ? (
                  <>
                    <Clock size={18} />
                    {t(cms.cooking.waitingReadyAt, {
                      eta: formatEta(step.endMs, Date.now(), cms.cooking),
                    })}
                  </>
                ) : waitOver ? (
                  <>
                    {cms.cooking.continueAction}
                    <ChevronRight size={20} />
                  </>
                ) : isCurrent ? (
                  <>
                    {cms.cooking.doneAction}
                    <Check size={20} />
                  </>
                ) : (
                  <>
                    {cms.cooking.nextStep}
                    <ChevronRight size={20} />
                  </>
                )}
              </CtaButton>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  return createPortal(overlay, document.body);
}

/* ═══ CELEBRATION BURST — coriandoli one-shot per la pizzata completata ═══
   Particelle deterministiche (niente random → niente re-render jitter),
   solo colori token, nulla con prefers-reduced-motion. */
const BURST_COLORS = [
  "var(--primary)",
  "var(--tertiary)",
  "var(--recipe-success)",
  "var(--text-accent)",
];

function CelebrationBurst() {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;
  const particles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
    const distance = 74 + (i % 3) * 24;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 12,
      color: BURST_COLORS[i % BURST_COLORS.length],
      delay: motionDelay.burstStart + (i % 5) * motionDelay.burstStep,
      rotate: (i % 2 ? 1 : -1) * (140 + i * 16),
      size: i % 3 === 0 ? 10 : 7,
      round: i % 2 === 0,
    };
  });
  return (
    <div aria-hidden="true" className="cooking-mode-burst">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className={`cooking-mode-burst__particle${p.round ? " cooking-mode-burst__particle--round" : ""}`}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1, 0.85],
            opacity: [0, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: motionDuration.particle,delay: p.delay,ease: motionEase.expressiveEnter }}
          style={{
            ["--particle-size" as any]: `${p.size}px`,
            ["--particle-color" as any]: p.color,
          }}
        />
      ))}
    </div>
  );
}
