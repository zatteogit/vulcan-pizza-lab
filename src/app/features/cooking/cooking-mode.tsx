import { KeepScreenAwakeNotice, KeepScreenAwakeToggle, useKeepScreenAwake } from "./keep-screen-awake";
import { CookRemindersRow } from "./cook-reminders-row";
import { RecipeFeedbackForm } from "../recipe/recipe-feedback";
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
LifeBuoy,
Trash2,
ChevronDown,
} from "lucide-react";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { motionDelay,motionDuration,motionEase,motionSpring } from "../../components/ds/motion";
import { lazy,Suspense,useCallback,useEffect,useMemo,useRef,useState } from "react";
import { createPortal } from "react-dom";
import { useCms } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { formatAtClock, formatDuration } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import {
currentStepIndex,
formatEta,
formatStepClock,
stepIsWaiting,
useCookSession,
type CookSessionStep,
type CookUndoSnapshot
} from "./cook-session";
import {
  READY_CHANGE_ANNOUNCE_MS,
  TIMED_WAIT_STEP_IDS,
  previewCompleteNow,
  previewStartNow,
  readyCriterionKey,
  sessionNightActions,
  sessionProgress,
  sessionReadyAt,
  startNowNeedsConfirm,
} from "../../use-cases/cook-timing";
import { BakeRoundsTimer } from "./bake-rounds-timer";
import { ConfirmDialog, CtaButton, IconButton, Snackbar } from "../../components/ds/index";
import { useDialogFocus } from "../../components/ds/use-dialog-focus";
import type { EscapeLayerHandle } from "../../components/ds/escape-stack";
import { cookingKeyAction, nextViewIndex } from "./cooking-keys";
import { DoughBlob } from "./dough-mascot";
import { StepIllustration } from "./step-illustrations";
import { resolveStepVisual } from "./step-visual";
import { STYLES_DB } from "../../domain/styles-db";
import { isFriedStyle } from "../../domain/pizza-engine";
import { GlossaryTermLinks } from "../glossary/term-link";
import { GlossaryNavigationContext } from "../../components/shared/info-tip";
import { stepGlossaryTerms } from "../glossary/step-terms";
import { isOilPreheat, preheatText } from "./preheat-copy";
/* Caricato al primo tocco: la modalità cottura non porta con sé il catalogo dei problemi. */
const TroubleshootingSheet = lazy(() => import("../recipe/troubleshooting-panel").then((m) => ({ default: m.TroubleshootingSheet })));


/** S10-B-11: quanto resta annullabile un completamento. */
const UNDO_MS = 10_000;

/* ── Countdown della fase ──
 * FW-19 (S10-B-05, S10-A-02): il countdown di un passo attivo parte da quando
 * l'utente lo comincia davvero, non dall'orario pianificato; un passo non
 * ancora cominciato dice solo quanto dura («circa 10 min»). «Tempo
 * completato» in verde vale solo per un'attesa finita (lievitazione, forno
 * in temperatura): un passo attivo oltre il tempo previsto è «in ritardo». */
function PhaseCountdown({ step, isCurrent }: { step: CookSessionStep; isCurrent: boolean }) {
  const { cms, bcp47 } = useCms();
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), step.duration_minutes >= 90 ? 30_000 : 1000);
    return () => clearInterval(i);
  }, [step.duration_minutes]);

  const now = Date.now();
  const waits = stepIsWaiting(step);
  const timedWait = TIMED_WAIT_STEP_IDS.has(step.id);
  /* Le fritte scaldano l'olio, non il forno (step.variant "oil" dal motore). */
  const oil = isOilPreheat(step);
  const explicitlyStarted = step.actualStartMs !== undefined;
  const notStarted = now < step.startMs && !explicitlyStarted;
  /* Un passo attivo arrivato alla sua ora ma non ancora cominciato: niente
     conto alla rovescia sull'orario pianificato. */
  const dueNotStarted = !waits && !explicitlyStarted && !notStarted && !step.flexible;
  const remainingMs = Math.max(0, step.endMs - now);
  const phaseOver = !notStarted && !dueNotStarted && now >= step.endMs;
  const waitDone = phaseOver && waits;
  const activeLate = phaseOver && !waits;
  const totalMs = step.endMs - step.startMs;
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, (now - step.startMs) / totalMs)) : 1;

  const remainingLabel = (() => {
    const min = Math.ceil(remainingMs / 60_000);
    if (min > 1 || step.duration_minutes >= 90) return formatDuration(min, bcp47);
    const sec = Math.ceil(remainingMs / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  })();
  const phaseDuration = formatDuration(step.duration_minutes, bcp47);
  const phaseEnd = formatStepClock(step.endMs, step.flexible, bcp47);
  const toneClass = waitDone ? " cooking-mode-phase--done" : activeLate ? " cooking-mode-phase--late" : "";

  return (
    <div className={`cooking-mode-phase${toneClass}`}>
      <div className="cooking-mode-phase__head">
        <Clock size={18} className="cooking-mode-phase__icon" />
        <div className="cooking-mode-phase__body">
          <div className="type-numeric cooking-mode-phase__value">
            {notStarted
              ? t(cms.cooking.stepStartsIn, {
                  eta: formatEta(step.startMs, Date.now(), bcp47),
                })
              : dueNotStarted
                ? uiMessage("cooking.phase.about", [phaseDuration])
                : waitDone
                  ? timedWait ? preheatText(oil, "ready") : cms.cooking.phaseDone
                  : activeLate
                    ? uiMessage("cooking.phase.late")
                    : timedWait
                      ? preheatText(oil, "remaining", [remainingLabel])
                      : t(cms.cooking.phaseRemaining, { time: remainingLabel })}
          </div>
          <div className="cooking-mode-phase__meta">
            {step.flexible
              ? t(cms.cooking.passivePhaseMeta, {
                  duration: phaseDuration,
                  time: phaseEnd,
                })
              : dueNotStarted
                ? uiMessage("cooking.phase.dueNow")
                : t(cms.cooking.activePhaseMeta, {
                    duration: phaseDuration,
                    time: phaseEnd,
                  })}
          </div>
        </div>
        {waitDone && isCurrent && (
          <span className="cooking-mode-phase__badge">
            <BellRing size={14} aria-hidden="true" />
            {cms.cooking.yourTurn}
          </span>
        )}
      </div>
      {/* FW-13 (S10-B-13): il cambio di stato si annuncia una volta, non a ogni tick. */}
      <p role="status" className="sr-only">
        {waitDone && isCurrent ? (timedWait ? preheatText(oil, "ready") : cms.cooking.phaseDone) : ""}
      </p>
      {!notStarted && !dueNotStarted && !phaseOver && (
        <div className="cooking-mode-phase__track">
          <div
            className="cooking-mode-phase__track-fill"
            style={{ ["--phase-progress" as any]: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
      {waits && !phaseOver && (
        <p className="cooking-mode-phase__hint">
          {cms.cooking.passiveCloseHint}
        </p>
      )}
    </div>
  );
}

/* G4a-WP-02 (S10-B-04, D-G4a-3): suono e vibrazione alla fine delle fasi,
   attivi per default; l'interruttore sta nell'header, accanto allo schermo. */
function CookAlertsToggle() {
  const { alertsOn, setAlertsOn } = useCookSession();
  return (
    <IconButton variant="bare" radius="lg" className="cooking-mode-header__action" aria-pressed={alertsOn}
      aria-label={uiMessage("cooking.alerts.label")} onClick={() => setAlertsOn(!alertsOn)}>
      <BellRing size={18} aria-hidden="true" />
    </IconButton>
  );
}

export function CookingMode() {
  const { session, completeStep, startStep, closeOverlay, endSession, snapshot, restore } = useCookSession();
  const { cms, bcp47 } = useCms();
  const steps = session?.steps ?? [];
  const total = steps.length;
  const activeIdx = session ? Math.min(currentStepIndex(session), total - 1) : 0;
  const allDone = session ? currentStepIndex(session) >= total : false;

  /* viewIndex: si può sfogliare avanti/indietro senza toccare lo stato della sessione */
  const [viewIndex, setViewIndex] = useState(activeIdx);
  const [finished, setFinished] = useState(allDone);
  /* G4a-WP-02 (S10-B-14): un solo controller dello schermo acceso, spento a pizzata finita. */
  const screen = useKeepScreenAwake(!finished);
  /* Conferma prima di buttare via una pizzata in corso: chiuderla è
     distruttivo (perdi timer e progresso), non un semplice "riduci". */
  const [confirmAbort, setConfirmAbort] = useState(false);
  /* FW-19 (S10-A-01): cominciare prima dell'orario sposta il pasto: si chiede. */
  const [confirmStart, setConfirmStart] = useState(false);
  /* FW-19 (S10-A-02): «È già in temperatura» salta l'attesa del forno: si chiede. */
  const [confirmHot, setConfirmHot] = useState(false);
  /* S10-B-11: «L'impasto è già pronto?» chiude un'attesa di ore: si chiede. */
  const [confirmSkip, setConfirmSkip] = useState(false);
  /* G4b-WP-01 (S13-B-09): «Qualcosa non va?» della fase, aperto su questo indice. */
  const [troubleAt, setTroubleAt] = useState<number | null>(null);
  /* S10-B-11: ogni completamento si annulla per qualche secondo (un toast alla volta). */
  const [undo, setUndo] = useState<{ snap: CookUndoSnapshot; index: number; title: string } | null>(null);
  /* G4-R3 (WCAG 2.2.1): la scadenza si sospende finché focus o puntatore
     sono sul toast, e riparte intera quando escono. */
  const [undoFocus, setUndoFocus] = useState(false);
  const [undoHover, setUndoHover] = useState(false);
  useEffect(() => {
    if (!undo) {
      setUndoFocus(false);
      setUndoHover(false);
      return;
    }
    if (undoFocus || undoHover) return;
    const id = setTimeout(() => {
      /* Il toast sparisce: il focus non deve cadere su <body>. */
      if (document.activeElement?.closest(".cooking-mode-undo")) dialogRef.current?.focus();
      setUndo(null);
    }, UNDO_MS);
    return () => clearTimeout(id);
  }, [undo, undoFocus, undoHover]);

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

  const step = steps[viewIndex];
  const isCurrent = viewIndex === activeIdx && !allDone;
  const viewingDone = step?.done ?? false;

  /* Tick per il countdown nel bottone e per il passaggio «prima/adesso» */
  const [, setNavTick] = useState(0);
  useEffect(() => {
    if (!isCurrent) return;
    const i = setInterval(() => setNavTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [isCurrent, step?.id]);

  /* FW-19: stato del passo corrente nel piano unico (use-cases/cook-timing.ts).
     - early: non ancora cominciato e prima del suo orario → «Inizia adesso»
       con conferma (S10-A-01), mai «Fatto»;
     - forno: il primo tocco lo accende, poi si aspetta (S10-A-02);
     - attesa: lievitazioni e forno acceso, «Fatto» solo alla fine. */
  const now = Date.now();
  const timedWait = !!step && TIMED_WAIT_STEP_IDS.has(step.id);
  const oil = isOilPreheat(step);
  const explicitlyStarted = step?.actualStartMs !== undefined;
  const early = isCurrent && !viewingDone && !!step && !explicitlyStarted && now < step.startMs;
  const ovenToStart = isCurrent && timedWait && !explicitlyStarted && !early;
  const stepWaits = !!step && stepIsWaiting(step);
  const waiting = isCurrent && !early && stepWaits && now < step.endMs;
  const waitOver = isCurrent && !early && stepWaits && now >= step.endMs;

  const advanceView = useCallback(() => {
    if (viewIndex >= total - 1) setFinished(true);
    else setViewIndex(viewIndex + 1);
  }, [viewIndex, total]);

  const readyApprox = !!session && session.steps.some((s) => !s.done && s.flexible);
  /* Un anticipo appena confermato (o senza effetti visibili) non si riannuncia: l'utente
     ha appena letto il nuovo orario. */
  const confirmedShift = useRef(false);

  /* S10-B-11: fotografia (passi, orari, notifiche) PRIMA di completare, poi
     il toast «Fatto: …» con «Annulla». */
  const completeWithUndo = useCallback(() => {
    const snap = snapshot();
    completeStep(viewIndex);
    advanceView();
    if (snap && step) setUndo({ snap, index: viewIndex, title: step.title });
  }, [snapshot, completeStep, viewIndex, advanceView, step]);

  const undoComplete = useCallback(() => {
    if (!undo) return;
    confirmedShift.current = true;
    restore(undo.snap);
    setFinished(false);
    setViewIndex(undo.index);
    setUndo(null);
    /* Il bottone sparisce: il focus resta nella vista. */
    dialogRef.current?.focus();
  }, [undo, restore]);
  const goNext = useCallback(() => {
    if (!session) return;
    if (isCurrent && early) {
      /* Se l'orario del pasto mostrato non cambia e non arriva niente di
         notte, non c'è niente da confermare. */
      if (startNowNeedsConfirm(session.steps, viewIndex, Date.now(), readyApprox)) {
        setConfirmStart(true);
      } else {
        confirmedShift.current = true;
        startStep(viewIndex);
      }
    } else if (isCurrent && ovenToStart) {
      /* «Ho acceso il forno»: parte l'attesa, il resto slitta da adesso. */
      startStep(viewIndex);
    } else if (isCurrent && !waiting) {
      /* Fase attiva fatta, o attesa conclusa: completa e ri-ancora i tempi */
      completeWithUndo();
    } else if (!isCurrent && viewIndex < total - 1) {
      setViewIndex(viewIndex + 1);
    } else if (allDone) {
      setFinished(true);
    }
  }, [session, isCurrent, early, ovenToStart, waiting, viewIndex, total, allDone, completeWithUndo, startStep, readyApprox]);

  /* «L'impasto è già pronto?» / «È già in temperatura»: chiudere un'attesa in
     anticipo ri-ancora il resto, quindi chiede sempre conferma (S10-B-11). */
  const skipWait = useCallback(() => {
    if (!session || !isCurrent) return;
    if (timedWait) setConfirmHot(true);
    else setConfirmSkip(true);
  }, [session, isCurrent, timedWait]);

  /* FW-19 (S10-B-12): l'orario in cui si mangia, sempre visibile; se cambia
     di più di un quarto d'ora lo si annuncia. */
  const readyAtMs = session ? sessionReadyAt(session.steps) : 0;
  const readyLabel = readyAtMs ? formatStepClock(readyAtMs, readyApprox, bcp47) : "";
  const prevReady = useRef(readyAtMs);
  const [readyChange, setReadyChange] = useState<{ from: number; to: number } | null>(null);
  useEffect(() => {
    if (!readyAtMs) return;
    const before = prevReady.current;
    prevReady.current = readyAtMs;
    const silent = confirmedShift.current;
    confirmedShift.current = false;
    if (silent) {
      setReadyChange(null);
      return;
    }
    if (before && Math.abs(readyAtMs - before) > READY_CHANGE_ANNOUNCE_MS) setReadyChange({ from: before, to: readyAtMs });
  }, [readyAtMs]);
  /* FW-19 (S10-A-03): dopo un ri-ancoraggio, le azioni rimaste di notte. */
  const nightLeft = session ? sessionNightActions(session.steps, now) : [];
  const startPreview = confirmStart && session ? previewStartNow(session.steps, viewIndex, Date.now()) : null;
  const skipPreview = confirmSkip && session ? previewCompleteNow(session.steps, viewIndex, Date.now()) : null;
  /* Dopo il salto resta «ca.» solo se c'è ancora un'attesa flessibile. */
  const skipApprox = !!session && session.steps.some((s, i) => i !== viewIndex && !s.done && s.flexible);
  const troubleLabel = step?.trouble && cms.cooking.troubleStepLinks?.[step.trouble.labelKey];
  const criterion = cms.cooking.readyCriterion[readyCriterionKey(step?.id ?? "", !!step?.cold)];

  const goPrev = useCallback(() => {
    if (finished) setFinished(false);
    else if (viewIndex > 0) setViewIndex(viewIndex - 1);
  }, [finished, viewIndex]);

  /* FW-12 (S10-A-09/B-02): la vista è un dialog vero. Focus iniziale sul
     titolo del passo, Tab che resta dentro, Esc via escape-stack (chiude solo
     lo strato in cima: con «Interrompi?» aperto chiude il dialog, non la
     vista), ritorno del focus al widget della pizzata. */
  const titleRef = useRef<HTMLHeadingElement>(null);
  const layerRef = useRef<EscapeLayerHandle | null>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>({
    open: true,
    onClose: closeOverlay,
    lockScroll: false,
    initialFocusRef: titleRef,
    fallbackFocus: () => document.querySelector<HTMLElement>(".cook-widget"),
    layerRef,
  });

  /* FW-12 (S10-A-08/B-01): le frecce sfogliano soltanto, mai «Fatto», e
     tacciono se sopra c'è un altro strato o il focus è in un controllo. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const action = cookingKeyAction(e, { isTopLayer: layerRef.current?.isTop() ?? false });
      if (!action) return;
      e.preventDefault();
      if (action === "prev") goPrev();
      else if (!finished) setViewIndex(nextViewIndex(viewIndex, { activeIdx, total, allDone }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, finished, viewIndex, activeIdx, total, allDone]);

  const doneCount = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  /* G4a-WP-02 (S10-B-23): la stessa regola dell'anello del widget. */
  const progressPct = finished ? 100 : Math.round(sessionProgress(steps, now) * 100);

  if (!session || !step) return null;

  const overlay = (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
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
          {/* G4a-WP-02 (S10-A-24, S10-B-23): l'occhiello dice quando si mangia. */}
          <p className="type-numeric cooking-mode-header__eyebrow">
            {finished
              ? cms.cooking.done
              : readyLabel
                ? uiMessage("cooking.chip.readyAt", [readyLabel])
                : cms.cooking.inProgress}
          </p>
          <div className="cooking-mode-header__title">
            {session.styleName}
          </div>
        </div>
        <div className="cooking-mode-header__meta">
          {/* A pizzata finita resta solo «Concludi»: niente contatore n / n né cestino. */}
          {!finished && (
            <>
              <span className="type-numeric cooking-mode-header__counter">
                {Math.min(viewIndex + 1, total)} / {total}
              </span>
              <KeepScreenAwakeToggle control={screen} />
              <CookAlertsToggle />
              {/* Interrompi: azione distruttiva, perciò chiede conferma. */}
              <button
                type="button"
                onClick={() => setConfirmAbort(true)}
                className="cooking-mode-header__action"
                aria-label={cms.cooking.interrupt}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={closeOverlay}
            className="cooking-mode-header__action cooking-mode-header__action--close"
            aria-label={cms.cooking.minimize}
          >
            {/* Audit n. 20: «riduci» è una freccia giù, non una X accanto al cestino. */}
            <ChevronDown size={20} aria-hidden="true" />
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

      {/* FW-19 (S10-A-01): cominciare prima dell'orario sposta il pasto. */}
      <ConfirmDialog
        open={confirmStart && !!startPreview}
        onDismiss={() => setConfirmStart(false)}
        ariaLabel={uiMessage("cooking.startEarly.title")}
        icon={<Clock size={26} />}
        position="absolute"
        zIndex={10}
        title={uiMessage("cooking.startEarly.title")}
        body={
          startPreview ? (
            <>
              {uiMessage("cooking.startEarly.body", [
                formatAtClock(step.startMs, bcp47, { nowMs: Date.now() }),
                formatStepClock(startPreview.readyAtMs, readyApprox, bcp47),
                readyLabel,
              ])}
              {startPreview.nightActions.length > 0 && (
                <strong className="cooking-mode-confirm__night">
                  {uiMessage("cooking.night.warning", [
                    startPreview.nightActions.length,
                    formatAtClock(startPreview.nightActions[0].atMs, bcp47, { nowMs: Date.now() }),
                  ])}
                </strong>
              )}
            </>
          ) : null
        }
        actions={[
          {
            label: uiMessage("cooking.startEarly.confirm"),
            onClick: () => {
              setConfirmStart(false);
              confirmedShift.current = true;
              startStep(viewIndex);
            },
            variant: "cta",
          },
          {
            label: uiMessage("cooking.startEarly.keep"),
            onClick: () => setConfirmStart(false),
            variant: "secondary",
          },
        ]}
      />

      {/* FW-19 (S10-A-02): il forno è davvero già caldo? */}
      <ConfirmDialog
        open={confirmHot}
        onDismiss={() => setConfirmHot(false)}
        ariaLabel={preheatText(oil, "hotTitle")}
        icon={<AlertTriangle size={26} />}
        position="absolute"
        zIndex={10}
        title={preheatText(oil, "hotTitle")}
        body={preheatText(oil, "hotBody")}
        actions={[
          {
            label: preheatText(oil, "hotKeep"),
            onClick: () => setConfirmHot(false),
            variant: "cta",
          },
          {
            label: preheatText(oil, "hotConfirm"),
            onClick: () => {
              setConfirmHot(false);
              completeWithUndo();
            },
            variant: "secondary",
          },
        ]}
      />

      {/* S10-B-11, S10-A-15: chiudere una lievitazione prima del tempo. */}
      <ConfirmDialog
        open={confirmSkip && !!skipPreview}
        onDismiss={() => setConfirmSkip(false)}
        ariaLabel={cms.cooking.finishedEarly}
        icon={<Clock size={26} />}
        position="absolute"
        zIndex={10}
        initialFocusAction={1}
        title={cms.cooking.finishedEarly}
        body={
          skipPreview ? (
            <>
              {t(cms.cooking.skipConfirmBody, {
                criterion,
                newReady: formatStepClock(skipPreview.readyAtMs, skipApprox, bcp47),
                plannedReady: readyLabel,
              })}
              {skipPreview.nightActions.length > 0 && (
                <strong className="cooking-mode-confirm__night">
                  {uiMessage("cooking.night.warning", [
                    skipPreview.nightActions.length,
                    formatAtClock(skipPreview.nightActions[0].atMs, bcp47, { nowMs: Date.now() }),
                  ])}
                </strong>
              )}
            </>
          ) : null
        }
        actions={[
          {
            label: cms.cooking.skipConfirmYes,
            onClick: () => {
              setConfirmSkip(false);
              confirmedShift.current = true;
              completeWithUndo();
            },
            variant: "cta",
          },
          {
            label: cms.cooking.skipConfirmNo,
            onClick: () => setConfirmSkip(false),
            variant: "secondary",
          },
        ]}
      />

      {step.trouble && troubleAt === viewIndex && !finished && (
        <Suspense fallback={null}>
          <TroubleshootingSheet open context={{ ...step.trouble, title: step.title }} onClose={() => setTroubleAt(null)} />
        </Suspense>
      )}

      {/* ── Progress ── */}
      <div
        className="cooking-mode-progress"
        role="progressbar"
        aria-label={uiMessage("cooking.a11y.progress-label")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
        aria-valuetext={uiMessage("cooking.a11y.progress-value", [finished ? total : doneCount, total])}
      >
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={motionSpring.cookingPanel}
          className="cooking-mode-progress__fill"
        />
      </div>

      {/* FW-12 (S10-A-09): annuncio del passo al cambio di vista. */}
      <p className="sr-only" role="status" aria-live="polite">
        {finished
          ? cms.cooking.completed
          : uiMessage("cooking.a11y.step-announce", [Math.min(viewIndex + 1, total), total, step.title])}
      </p>

      {/* ── Contenuto ── */}
      <div className="cooking-mode-body">
        <div className="cooking-mode-body__inner">
          {/* FW-19 (S10-B-12): annuncio del nuovo orario di fine. */}
          <p className="sr-only" role="status" aria-live="polite">
            {readyChange ? uiMessage("cooking.header.readyChanged", [formatStepClock(readyChange.to, readyApprox, bcp47)]) : ""}
          </p>
          {!finished && readyChange && (
            <p data-tone="caution" className="cooking-mode-note">
              {uiMessage("cooking.header.readyChangedFrom", [
                formatStepClock(readyChange.to, readyApprox, bcp47),
                formatStepClock(readyChange.from, readyApprox, bcp47),
              ])}
            </p>
          )}
          {!finished && nightLeft.length > 0 && (
            <p data-tone="caution" className="cooking-mode-note">
              {uiMessage("cooking.night.warning", [nightLeft.length, formatAtClock(nightLeft[0].atMs, bcp47, { nowMs: now })])}
            </p>
          )}
          {!finished && <KeepScreenAwakeNotice control={screen} />}
          {!finished && <CookRemindersRow />}
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
                {/* FW-16 (D-M, S10-B-07): com'è venuta? Prima di chiudere la pizzata. */}
                {session.feedback && (
                  <RecipeFeedbackForm
                    snapshot={session.feedback.snapshot}
                    predicted={session.feedback.predicted}
                    question={cms.feedback.cookedQuestion}
                  />
                )}
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
                    <StepIllustration stepId={step.id} visual={step.visual ?? resolveStepVisual(step, {
                      fried: STYLES_DB[session.styleId] && isFriedStyle(STYLES_DB[session.styleId]),
                      unleavened: !!STYLES_DB[session.styleId]?.dough.unleavened,
                      proofInPan: !!STYLES_DB[session.styleId]?.proof_in_pan,
                    })} size={120} />
                  </motion.div>
                </div>

                {/* Orario onesto + stato */}
                <div className="cooking-mode-step__status-row">
                  <span className="type-numeric cooking-mode-step__clock">
                    {/* FW-11 (S10-B-18): l'orario dice se è inizio o fine. */}
                    {step.flexible
                      ? uiMessage("cooking.chip.readyAt", [formatStepClock(step.endMs, true, bcp47)])
                      : timedWait && explicitlyStarted
                        ? preheatText(oil, "waiting", [formatStepClock(step.endMs, false, bcp47)])
                      : isCurrent && !viewingDone && (now >= step.startMs || explicitlyStarted)
                        ? uiMessage("cooking.chip.now")
                        : uiMessage("cooking.chip.startsAt", [formatStepClock(step.startMs, false, bcp47)])}
                  </span>
                  {viewingDone && (
                    <span className="cooking-mode-step__done-badge">
                      <Check size={13} /> {cms.cooking.stepDoneBadge}
                    </span>
                  )}
                </div>

                {/* Titolo */}
                <h2 ref={titleRef} tabIndex={-1} className="cooking-mode-step__title">
                  {step.title}
                </h2>

                {/* Descrizione */}
                <p className="cooking-mode-step__description">
                  {step.description}
                </p>

                {step.quantities && step.quantities.length > 0 && (
                  <dl className="cooking-mode-step__quantities">
                    {step.quantities.map((q) => (
                      <div key={q.label} className="cooking-mode-step__quantity">
                        <dt>{q.label}</dt>
                        <dd className="type-numeric">{q.value}</dd>
                        {/* FW-17 (S10-A-21, D-O): aiuto per le microdosi. */}
                        {q.hint && <dd className="type-body cooking-mode-step__quantity-hint">{q.hint}</dd>}
                      </div>
                    ))}
                  </dl>
                )}

                {step.longDesc && (
                  <p className="type-body-lg cooking-mode-step__long-desc">
                    {step.longDesc}
                  </p>
                )}

                {/* FW-04 (S10-A-14): le parole del passo aprono il glossario. */}
                <GlossaryTermLinks termIds={stepGlossaryTerms(step.id, { unleavened: !!STYLES_DB[session.styleId]?.dough.unleavened, variant: step.variant })} />


                {/* Countdown di fase ancorato agli orari reali */}
                {step.duration_minutes > 0 && !viewingDone && (
                  <PhaseCountdown step={step} isCurrent={isCurrent} />
                )}

                {/* FW-19 (S10-A-16): un timer per ogni cottura, anche per una sola. */}
                {isCurrent && !viewingDone && !early && (step.rounds ?? 0) >= 1 && step.roundSec ? (
                  <BakeRoundsTimer
                    key={step.id + viewIndex}
                    rounds={step.rounds!}
                    roundSec={step.roundSec}
                    recoverySec={step.recoverySec}
                    turns={step.turns}
                    variant={step.variant}
                  />
                ) : null}

                {/* Tip */}
                {step.tip && (
                  <div className="cooking-mode-step__tip">
                    <Lightbulb size={18} className="cooking-mode-step__tip-icon" />
                    <p className="type-body-lg cooking-mode-step__tip-text">
                      {step.tip}
                    </p>
                  </div>
                )}

                {/* G4b-WP-01 (S13-B-09): i problemi della fase senza uscire
                    dalla pizzata; lo stesso foglio della scheda ricetta. */}
                {troubleLabel && (
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={troubleAt === viewIndex}
                    onClick={() => setTroubleAt(viewIndex)}
                    className="cooking-mode-step__trouble"
                  >
                    <LifeBuoy size={18} aria-hidden="true" className="cooking-mode-step__trouble-icon" />
                    <span className="cooking-mode-step__trouble-text">
                      <span className="type-data-sm cooking-mode-step__trouble-eyebrow">{uiMessage("cooking.trouble.cta")}</span>
                      <span className="cooking-mode-step__trouble-label">{troubleLabel}</span>
                    </span>
                  </button>
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
            {/* «L'impasto è già pronto?»: apre una conferma, mai un salto diretto. */}
            {waiting && (
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={skipWait}
                className="cooking-mode-nav__skip"
              >
                {timedWait ? preheatText(oil, "alreadyHot") : cms.cooking.finishedEarly}
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
                {early ? (
                  <>
                    {uiMessage("cooking.startEarly.cta")}
                    <ChevronRight size={20} />
                  </>
                ) : ovenToStart ? (
                  <>
                    {preheatText(oil, "start")}
                    <ChevronRight size={20} />
                  </>
                ) : waiting ? (
                  <>
                    <Clock size={18} />
                    {timedWait
                      ? preheatText(oil, "waiting", [formatEta(step.endMs, Date.now(), bcp47)])
                      : t(cms.cooking.waitingReadyAt, {
                          eta: formatEta(step.endMs, Date.now(), bcp47),
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

      {/* S10-B-11: annulla l'ultimo completamento (orari compresi). */}
      {undo && (
        <Snackbar
          className={`cooking-mode-undo${finished ? " cooking-mode-undo--finished" : ""}`}
          message={t(cms.cooking.stepDoneToast, { step: undo.title })}
          action={cms.cooking.undo}
          onAction={undoComplete}
          onFocus={() => setUndoFocus(true)}
          onBlur={() => setUndoFocus(false)}
          onPointerEnter={() => setUndoHover(true)}
          onPointerLeave={() => setUndoHover(false)}
        />
      )}
    </motion.div>
  );

  /* FW-04: «Apri nel glossario» chiude la vista (la pizzata continua nel
     widget), altrimenti la voce si aprirebbe dietro lo schermo intero. */
  return createPortal(
    <GlossaryNavigationContext.Provider value={closeOverlay}>{overlay}</GlossaryNavigationContext.Provider>,
    document.body,
  );
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
