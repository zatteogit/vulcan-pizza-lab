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
PartyPopper,
Trash2,
X,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
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
import { CtaButton, Heading } from "../../components/ds/index";
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
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: phaseDone
          ? "color-mix(in srgb, var(--recipe-success) 12%, var(--surface-container-low))"
          : "var(--surface-container-low)",
        border: `1px solid ${phaseDone ? "color-mix(in srgb, var(--recipe-success) 35%, transparent)" : "var(--outline-variant)"}`,
      }}
    >
      <div className="flex items-center gap-3">
        <Clock
          size={18}
          style={{ color: phaseDone ? "var(--recipe-success)" : "var(--text-accent)", flexShrink: 0 }}
        />
        <div className="min-w-0 flex-1">
          <div
            className="type-numeric"
            style={{
              fontSize: "var(--font-size-3xl)",
              fontWeight: "var(--weight-bold)" as any,
              color: phaseDone ? "var(--recipe-success)" : "var(--text-default)",
              fontFeatureSettings: "'tnum'",
              lineHeight: 1.15,
            }}
          >
            {notStarted
              ? t(cms.cooking.stepStartsIn, {
                  eta: formatEta(step.startMs, Date.now(), cms.cooking),
                })
              : phaseDone
                ? cms.cooking.phaseDone
                : t(cms.cooking.phaseRemaining, { time: remainingLabel })}
          </div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
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
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            <BellRing size={12} />
            {cms.cooking.yourTurn}
          </span>
        )}
      </div>
      {!notStarted && !phaseDone && (
        <div className="mt-3 rounded-full overflow-hidden" style={{ height: "var(--space-1)", background: "var(--container-bg)" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.round(progress * 100)}%`,
              background: "var(--text-accent)",
              borderRadius: 999,
              transition: "width 1s linear",
            }}
          />
        </div>
      )}
      {step.flexible && !phaseDone && (
        <p className="mt-2.5" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", lineHeight: 1.45 }}>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 200, background: "var(--container-page)", color: "var(--text-default)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`${cms.cooking.inProgress} — ${session.styleName}`}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          height: "calc(var(--space-15, 60px) + env(safe-area-inset-top, 0px))",
          borderBottom: "1px solid var(--container-border-subtle)",
        }}
      >
        <div className="min-w-0">
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-accent)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >

          </div>
          <div className="truncate" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any }}>
            {session.styleName}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="type-numeric"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}
          >
            {Math.min(viewIndex + 1, total)} / {total}
          </span>
          {/* Interrompi: azione distruttiva, perciò chiede conferma. */}
          <button
            onClick={() => setConfirmAbort(true)}
            className="flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "var(--container-bg)",
              border: "1px solid var(--container-border)",
              cursor: "pointer",
              color: "var(--icon-muted)",
            }}
            aria-label={cms.cooking.interrupt}
            title={cms.cooking.interrupt}
          >
            <Trash2 size={17} />
          </button>
          <button
            onClick={closeOverlay}
            className="flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "var(--container-bg)",
              border: "1px solid var(--container-border)",
              cursor: "pointer",
              color: "var(--text-default)",
            }}
            aria-label={cms.cooking.minimize}
            title={cms.cooking.minimizeHint}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Conferma interruzione ── */}
      <AnimatePresence>
        {confirmAbort && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-end sm:items-center justify-center p-4"
            style={{ zIndex: 10, background: "color-mix(in srgb, var(--container-page) 70%, transparent)", backdropFilter: "blur(4px)" }}
            onClick={() => setConfirmAbort(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm flex flex-col items-center text-center gap-4 p-6"
              style={{
                borderRadius: "var(--radius-3xl)",
                background: "var(--container-page)",
                border: "1px solid var(--container-border)",
                boxShadow: "0 24px 60px color-mix(in srgb, var(--shadow-color) 28%, transparent)",
              }}
              role="alertdialog"
              aria-modal="true"
              aria-label={cms.cooking.abortConfirmTitle}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-xl)",
                  background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                  color: "var(--destructive)",
                }}
              >
                <AlertTriangle size={26} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Heading level="xs" color="var(--text-default)">
                  {cms.cooking.abortConfirmTitle}
                </Heading>
                <p className="type-body" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {t(cms.cooking.abortBody, { style: session.styleName })}
                </p>
              </div>
              <div className="flex flex-col w-full gap-2.5 mt-1">
                <button
                  onClick={() => {
                    setConfirmAbort(false);
                    endSession();
                  }}
                  className="w-full h-12 rounded-full active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  style={{
                    background: "var(--destructive)",
                    color: "var(--overlay-text)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--weight-semibold)" as any,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                  {cms.cooking.abortYes}
                </button>
                <button
                  onClick={() => setConfirmAbort(false)}
                  className="w-full h-12 rounded-full active:scale-[0.98] transition-transform"
                  style={{
                    background: "var(--container-bg)",
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--weight-semibold)" as any,
                    border: "1px solid var(--container-border)",
                    cursor: "pointer",
                  }}
                >
                  {cms.cooking.abortNo}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress ── */}
      <div style={{ height: "var(--border-width-thick, 3px)", background: "var(--container-bg)" }} className="flex-shrink-0">
        <motion.div
          animate={{ width: `${finished ? 100 : progressPct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ height: "100%", background: "var(--text-accent)" }}
        />
      </div>

      {/* ── Contenuto ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-5 sm:px-6 py-7 pb-36">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col items-center text-center gap-5 pt-12"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "var(--space-22, 88px)",
                    height: "var(--space-22, 88px)",
                    borderRadius: "var(--radius-2xl)",
                    background: "color-mix(in srgb, var(--recipe-success) 14%, transparent)",
                    color: "var(--recipe-success)",
                  }}
                >
                  <PartyPopper size={40} />
                </div>
                <h2 className="font-serif" style={{ fontSize: "clamp(2rem, 6vw, 2.75rem)", lineHeight: 1.1 }}>
                  {cms.cooking.completed}
                </h2>
                <p style={{ fontSize: "var(--font-size-xl)", color: "var(--text-muted)", maxWidth: "var(--cooking-done-max-width, 380px)", lineHeight: 1.5 }}>
                  Hai completato tutti i passaggi della tua {session.styleName}. Buon appetito!
                </p>
                <CtaButton
                  onClick={endSession}
                  className="mt-2 px-8 h-12"
                  style={{ fontSize: "var(--font-size-xl)" }}
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
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="flex flex-col gap-5"
              >
                {/* Illustrazione di fase — respira piano, con alone caldo */}
                <div className="relative flex justify-center">
                  <div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      width: 220,
                      height: 220,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 70%)",
                      filter: "blur(18px)",
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <StepIllustration stepId={step.id} size={120} />
                  </motion.div>
                </div>

                {/* Orario onesto + stato */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span
                    className="type-numeric px-3 py-1 rounded-full"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                      color: "var(--text-accent)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-semibold)" as any,
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {formatStepClock(step.startMs, step.flexible, bcp47)}
                  </span>
                  {viewingDone && (
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{
                        background: "color-mix(in srgb, var(--recipe-success) 12%, transparent)",
                        color: "var(--recipe-success)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      <Check size={13} /> {cms.cooking.stepDoneBadge}
                    </span>
                  )}
                </div>

                {/* Titolo */}
                <h2 className="font-serif text-center" style={{ fontSize: "clamp(1.9rem, 6.5vw, 2.8rem)", lineHeight: 1.08 }}>
                  {step.title}
                </h2>

                {/* Descrizione */}
                <p style={{ fontSize: "var(--font-size-2xl)", lineHeight: 1.55, color: "var(--text-default)" }}>
                  {step.description}
                </p>

                {step.longDesc && (
                  <p className="type-body-lg" style={{ lineHeight: 1.6, color: "var(--text-muted)" }}>
                    {step.longDesc}
                  </p>
                )}

                {/* Countdown di fase ancorato agli orari reali */}
                {step.duration_minutes > 0 && !viewingDone && (
                  <PhaseCountdown step={step} isCurrent={isCurrent} />
                )}

                {/* Tip */}
                {step.tip && (
                  <div
                    className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                    style={{
                      background: "color-mix(in srgb, var(--tertiary) 8%, var(--surface-container-low))",
                      border: "1px solid color-mix(in srgb, var(--tertiary) 18%, transparent)",
                    }}
                  >
                    <Lightbulb size={18} style={{ color: "var(--tertiary)", flexShrink: 0, marginTop: "var(--space-0-5)" }} />
                    <p className="type-body-lg" style={{ lineHeight: 1.5, color: "var(--text-default)" }}>
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
        <div
          className="absolute bottom-0 left-0 right-0 px-5 sm:px-6 pb-6 pt-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, var(--container-page) 55%, transparent 100%)" }}
        >
          <div
            className="max-w-xl mx-auto flex flex-col gap-2 pointer-events-auto"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* "Ho finito prima": uscita discreta dall'attesa */}
            {waiting && (
              <button
                onClick={skipWait}
                className="self-center px-3 py-1 rounded-full active:scale-95 transition-transform"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-sm)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  cursor: "pointer",
                }}
              >
                {cms.cooking.finishedEarly}
              </button>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={viewIndex === 0}
                className="flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-xl)",
                  background: "var(--container-bg)",
                  border: "1px solid var(--container-border)",
                  color: viewIndex === 0 ? "var(--icon-muted)" : "var(--icon-default)",
                  opacity: viewIndex === 0 ? 0.4 : 1,
                  cursor: viewIndex === 0 ? "default" : "pointer",
                }}
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
                className="flex-1 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{
                  height: 56,
                  borderRadius: "var(--radius-xl)",
                  fontSize: "var(--font-size-xl-5)",
                  fontWeight: "var(--weight-semibold)" as any,
                  cursor: waiting ? "default" : "pointer",
                  fontFeatureSettings: "'tnum'",
                  ...(waiting
                    ? {
                        background: "var(--container-bg)",
                        border: "1px solid var(--container-border)",
                        boxShadow: "none",
                        color: "var(--text-muted)",
                      }
                    : {}),
                }}
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
