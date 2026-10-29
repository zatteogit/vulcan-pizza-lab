/* ═══ COOK SESSION — "Pizzata attiva" (feedback utente giugno 2026) ═══
 * Le fasi della pizza durano ORE: un wizard da tenere aperto non ha senso.
 * Questo modulo trasforma la modalità cucina in una SESSIONE persistente:
 *
 *  - sopravvive a navigazione e reload (localStorage, timestamp assoluti)
 *  - un widget flottante, visibile in tutta l'app, mostra la prossima azione
 *    e il countdown ("Pieghe tra 42 min")
 *  - notifiche del browser quando una fase scade (il più vicino possibile
 *    alle Live Activities che il web permette oggi)
 *  - il titolo del documento mostra il countdown quando il tab è in background
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCms } from "../cms/cms-context";
import { formatClock, formatRelative } from "../../i18n/format";
import { t } from "../cms/i18n";
import type { StepVisual } from "./step-visual";
import { showReminder, truncateAtWord } from "../../adapters/browser/cook-reminders";
import { createCookAlert, readCookAlerts, writeCookAlerts, type CookAlertKind } from "../../adapters/browser/cook-alert";
import { uiMessage } from "../../i18n/ui-messages";
import type { PredictedScores, RecipeSnapshot } from "../../domain/recipe-feedback";
import type { TimelineStep } from "../../domain/pizza-engine";
import type { StepTroubleshooting } from "../../data/troubleshooting-data";
import {
  FLEXIBLE_STEP_IDS,
  TIMED_WAIT_STEP_IDS,
  activeStepTimeUp,
  completeStepAt,
  startStepAt,
} from "../../use-cases/cook-timing";

const STORAGE_KEY = "vulcan_cook_session";
/** G4a-WP-02: un segnale arrivato in ritardo (app riaperta dopo ore) non suona più. */
const SIGNAL_STALE_MS = 5 * 60_000;

/* Fasi "flessibili": lunghe attese passive dove ±minuti non cambiano nulla.
 * Le altre sono azioni attive con le mani in pasta. FW-19: l'elenco vive nel
 * piano unico (use-cases/cook-timing.ts); qui resta esportato per le viste. */
export { FLEXIBLE_STEP_IDS, TIMED_WAIT_STEP_IDS };

export interface CookSessionStep {
  id: string;
  visual?: StepVisual;
  title: string;
  description: string;
  longDesc?: string;
  /** Audit totale n. 12: dosi del passo (già formattate). */
  quantities?: { label: string; value: string; /** FW-17: aiuto sotto il valore. */ hint?: string }[];
  tip?: string;
  /** Durata pianificata, estensioni della Timeline comoda comprese (FW-19, S10-A-03). */
  duration_minutes: number;
  startMs: number;
  endMs: number;
  flexible: boolean;
  /** Fase in frigo (isColdPhase): sceglie il criterio di prontezza.
   *  Opzionale: le sessioni già salvate restano valide. */
  cold?: boolean;
  done: boolean;
  /** FW-19 (S10-B-05, S10-A-02): quando l'utente ha davvero cominciato il passo. */
  actualStartMs?: number;
  /** FW-19 (S10-A-16): cotture una alla volta, secondi di un giro e recupero del forno. */
  rounds?: number;
  roundSec?: number;
  recoverySec?: number;
  /** Rotazioni per cottura (0 = non girare) e variante («fry» = in olio):
   *  decidono i testi del timer per giro. */
  turns?: number;
  variant?: TimelineStep["variant"];
  /** G4b-WP-01 (S13-B-09): problemi della fase, risolti alla partenza.
   *  Opzionale: le sessioni già salvate restano valide. */
  trouble?: StepTroubleshooting;
}

/** FW-16 (D-M, S10-B-07): parametri della ricetta cucinata, per chiedere
 *  com'è venuta alla fine della pizzata. */
export interface CookFeedbackContext {
  snapshot: RecipeSnapshot;
  predicted: PredictedScores;
}

interface CookSession {
  styleName: string;
  styleId: string;
  createdAt: number;
  steps: CookSessionStep[];
  /** id step per cui è già stata mostrata una notifica */
  notified: string[];
  feedback?: CookFeedbackContext;
  /** FW-19 (S10-B-21): impronta della ricetta cucinata. */
  recipeKey?: string;
}

function loadSession(): CookSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as CookSession;
    if (!s || !Array.isArray(s.steps) || s.steps.length === 0) return null;
    /* Sessione più vecchia di 7 giorni dalla fine: scaduta */
    const lastEnd = s.steps[s.steps.length - 1].endMs;
    if (Date.now() - lastEnd > 7 * 86_400_000) return null;
    return s;
  } catch {
    return null;
  }
}

function storeSession(s: CookSession | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage negato: la sessione vive solo in memoria */
  }
}

/** Lo step "corrente": il primo non completato. */
export function currentStepIndex(s: CookSession): number {
  const i = s.steps.findIndex((st) => !st.done);
  return i === -1 ? s.steps.length : i;
}

/** FW-19 (S10-A-02): un passo che si sta aspettando. Le attese flessibili, e
 *  il preriscaldo dopo che il forno è stato acceso. */
export function stepIsWaiting(step: Pick<CookSessionStep, "id" | "flexible" | "actualStartMs">): boolean {
  return step.flexible || (TIMED_WAIT_STEP_IDS.has(step.id) && step.actualStartMs !== undefined);
}

/** Il momento in cui TOCCA all'utente per questo step:
 * fase attiva → al suo inizio; attesa (flessibile o forno acceso) → alla sua fine. */
export function nextActionTime(step: CookSessionStep): number {
  return stepIsWaiting(step) ? step.endMs : step.startMs;
}

/** S10-B-11: passi (orari compresi) e notifiche prima di un completamento,
 *  per annullarlo. Copia profonda: la sessione successiva non la tocca. */
export interface CookUndoSnapshot {
  steps: CookSessionStep[];
  notified: string[];
}

export function takeCookSnapshot(s: Pick<CookSession, "steps" | "notified">): CookUndoSnapshot {
  return JSON.parse(JSON.stringify({ steps: s.steps, notified: s.notified }));
}

/** «Annulla»: la sessione torna com'era nella fotografia. */
export function applyCookSnapshot<S extends CookUndoSnapshot>(s: S, snap: CookUndoSnapshot): S {
  return { ...s, ...takeCookSnapshot(snap) };
}

/* ── Context ── */
interface CookSessionCtx {
  session: CookSession | null;
  overlayOpen: boolean;
  startSession: (
    styleId: string,
    styleName: string,
    steps: Omit<CookSessionStep, "done">[],
    feedback?: CookFeedbackContext,
    recipeKey?: string,
  ) => void;
  endSession: () => void;
  /** FW-19 (S10-A-01, S10-A-02, S10-B-05): il passo comincia adesso; il resto
   *  del piano slitta con le durate pianificate. */
  startStep: (index: number) => void;
  /** Completa lo step corrente RI-ANCORANDO i tempi successivi a adesso:
   * se finisci l'impasto in ritardo, tutto il resto slitta di conseguenza;
   * se salti un'attesa in anticipo, il piano si accorcia. La timeline segue
   * la realtà, non il contrario. */
  completeStep: (index: number) => void;
  /** S10-B-11: fotografia da prendere PRIMA di completeStep… */
  snapshot: () => CookUndoSnapshot | null;
  /** …e da rimettere con «Annulla»: passi, orari e notifiche come prima
   *  (le notifiche segnate dopo tornano in coda). */
  restore: (snap: CookUndoSnapshot) => void;
  openOverlay: () => void;
  closeOverlay: () => void;
  /** G4a-WP-02 (S10-B-04, D-G4a-3): suono e vibrazione alla fine delle fasi. */
  alertsOn: boolean;
  setAlertsOn: (on: boolean) => void;
  signal: (kind: CookAlertKind) => void;
}

const Ctx = createContext<CookSessionCtx | null>(null);

export function useCookSession(): CookSessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCookSession fuori da CookSessionProvider");
  return ctx;
}

/* FW-16 (S10-B-03): il permesso non si chiede più da solo all'avvio: lo
 * chiede la riga «Promemoria» della modalità cucina, con un gesto dell'utente
 * (adapters/browser/cook-reminders.ts). */

export function CookSessionProvider({ children }: { children: React.ReactNode }) {
  const { cms, bcp47 } = useCms();
  const [session, setSession] = useState<CookSession | null>(loadSession);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const persist = useCallback((s: CookSession | null) => {
    setSession(s);
    storeSession(s);
  }, []);

  const startSession = useCallback(
    (styleId: string, styleName: string, steps: Omit<CookSessionStep, "done">[], feedback?: CookFeedbackContext, recipeKey?: string) => {
      const s: CookSession = {
        styleId,
        styleName,
        createdAt: Date.now(),
        steps: steps.map((st) => ({ ...st, done: false })),
        notified: [],
        ...(feedback ? { feedback } : {}),
        ...(recipeKey ? { recipeKey } : {}),
      };
      persist(s);
      setOverlayOpen(true);
    },
    [persist],
  );

  const endSession = useCallback(() => {
    persist(null);
    setOverlayOpen(false);
  }, [persist]);

  /* FW-19: il ri-ancoraggio è quello del piano unico (use-cases/cook-timing.ts):
     le durate sono quelle pianificate, estensioni comprese (S10-A-03). */
  const completeStep = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev || index < 0 || index >= prev.steps.length) return prev;
      const next = { ...prev, steps: completeStepAt(prev.steps, index, Date.now()) };
      storeSession(next);
      return next;
    });
  }, []);

  const startStep = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev || index < 0 || index >= prev.steps.length) return prev;
      const next = { ...prev, steps: startStepAt(prev.steps, index, Date.now()) };
      storeSession(next);
      return next;
    });
  }, []);

  const snapshot = useCallback(
    () => (sessionRef.current ? takeCookSnapshot(sessionRef.current) : null),
    [],
  );

  const restore = useCallback((snap: CookUndoSnapshot) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = applyCookSnapshot(prev, snap);
      storeSession(next);
      return next;
    });
  }, []);

  /* G4a-WP-02 (S10-B-04): un solo segnale per la sessione; l'interruttore
     dell'header lo spegne. Acceso, suona subito: si sente com'è e Safari
     sblocca l'audio nel gesto. */
  const [alertsOn, setAlertsOnState] = useState(readCookAlerts);
  const alertsOnRef = useRef(alertsOn);
  alertsOnRef.current = alertsOn;
  const [cookAlert] = useState(() => createCookAlert({ sound: true, vibrate: true }));
  const signal = useCallback((kind: CookAlertKind) => {
    if (alertsOnRef.current) cookAlert.signal(kind);
  }, [cookAlert]);
  const setAlertsOn = useCallback((on: boolean) => {
    writeCookAlerts(on);
    setAlertsOnState(on);
    alertsOnRef.current = on;
    signal("start");
  }, [signal]);
  const hasSession = !!session;
  useEffect(() => {
    if (!hasSession) return;
    const prime = () => { if (alertsOnRef.current) cookAlert.prime(); };
    document.addEventListener("pointerdown", prime);
    return () => document.removeEventListener("pointerdown", prime);
  }, [hasSession, cookAlert]);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  /* ── Tick: notifiche quando arriva il MOMENTO DI AGIRE ──
   * Fase attiva → quando inizia. Fase flessibile (attesa) → quando FINISCE:
   * l'attesa scorre da sola, tocca a te solo alla fine.
   * G4a-WP-02 (S10-B-04): un passo attivo cronometrato avvisa anche alla sua
   * fine (chiave «:end»), con suono e vibrazione; le attese suonano quando
   * scadono. */
  useEffect(() => {
    if (!session) return;
    const mark = (key: string) =>
      setSession((prev) => {
        if (!prev || prev.notified.includes(key)) return prev;
        const next = { ...prev, notified: [...prev.notified, key] };
        storeSession(next);
        return next;
      });
    const body = (description: string) =>
      t(cms.cooking.notificationBody, { style: session.styleName, description: truncateAtWord(description, 90) });
    const check = () => {
      const now = Date.now();
      const idx = currentStepIndex(session);
      if (idx >= session.steps.length) return;
      const step = session.steps[idx];
      const actionAt = nextActionTime(step);
      const waiting = stepIsWaiting(step);
      // FW-19: il preriscaldo avvisa due volte (accendi, poi forno pronto).
      const noticeKey = step.id + idx + (waiting && !step.flexible ? ":ready" : "");
      if (now >= actionAt && !session.notified.includes(noticeKey)) {
        const nextStep = session.steps[idx + 1];
        const title = waiting
          ? t(cms.cooking.notificationWaitDoneTitle, {
              title: nextStep ? nextStep.title : cms.cooking.continueAction,
            })
          : t(cms.cooking.notificationDueTitle, { title: step.title });
        void showReminder(title, body(waiting && nextStep ? nextStep.description : step.description));
        /* Suona un'attesa finita, non un passo attivo che parte col «Fatto» del precedente. */
        if (waiting && now - actionAt < SIGNAL_STALE_MS) signal("end");
        mark(noticeKey);
      }
      const endKey = `${step.id}${idx}:end`;
      if (activeStepTimeUp(step, waiting, now) && !session.notified.includes(endKey)) {
        void showReminder(uiMessage("cooking.notify.timeUp", [step.title]), body(step.description));
        if (now - step.endMs < SIGNAL_STALE_MS) signal("end");
        mark(endKey);
      }
    };
    check();
    /* Ogni 2 s, non 20: una cottura da 75 s non può aspettare il giro. Il
       controllo costa pochi confronti; scrive solo quando c'è da avvisare. */
    const interval = setInterval(check, 2_000);
    return () => clearInterval(interval);
  }, [session, cms.cooking, signal]);

  /* ── Countdown nel titolo del tab quando in background ── */
  useEffect(() => {
    if (!session) return;
    const original = document.title;
    const tick = () => {
      if (document.visibilityState === "visible") {
        document.title = original;
        return;
      }
      const idx = currentStepIndex(session);
      if (idx >= session.steps.length) return;
      const step = session.steps[idx];
      const actionAt = nextActionTime(step);
      const diffMin = Math.round((actionAt - Date.now()) / 60_000);
      const eta = formatEta(actionAt, Date.now(), bcp47);
      /* FW-19 (S10-A-04): un'attesa in corso dice quando è pronta, non
         «Puntata tra 9 h», che sembra l'inizio. Stessa logica del widget. */
      document.title =
        diffMin <= 0
          ? t(cms.cooking.documentTitleDue, { title: step.title })
          : stepIsWaiting(step)
            ? t(cms.cooking.documentTitleDue, { title: t(cms.cooking.widgetStepReadyAt, { title: step.title, eta }) })
            : t(cms.cooking.documentTitleCountdown, { eta, title: step.title });
    };
    const interval = setInterval(tick, 30_000);
    return () => {
      clearInterval(interval);
      document.title = original;
    };
  }, [session, cms.cooking, bcp47]);

  const value = useMemo(
    () => ({
      session,
      overlayOpen,
      startSession,
      endSession,
      startStep,
      completeStep,
      snapshot,
      restore,
      openOverlay,
      closeOverlay,
      alertsOn,
      setAlertsOn,
      signal,
    }),
    [session, overlayOpen, startSession, endSession, startStep, completeStep, snapshot, restore, openOverlay, closeOverlay, alertsOn, setAlertsOn, signal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ── Format helpers (condivisi col widget e la modalità cucina) ──
 * FW-11 (S10-B-17, S10-A-23): un solo formato di durata e di tempo relativo
 * per tutta la sessione, da i18n/format.ts; il «circa» è una chiave tradotta. */

/** «tra 3 h 30 min» nella lingua attiva. */
export function formatEta(targetMs: number, now: number, locale: string): string {
  return formatRelative(targetMs, now, locale);
}

/** Orario "onesto": esatto per fasi attive, arrotondato ai 15 minuti e
 *  marcato «ca.» per le attese flessibili. */
export function formatStepClock(ms: number, flexible: boolean, locale: string): string {
  return formatClock(ms, locale, { approximate: flexible, nowMs: Date.now() });
}
