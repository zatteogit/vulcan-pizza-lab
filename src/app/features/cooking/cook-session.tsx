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
  useState,
} from "react";
import { useCms } from "../cms/cms-context";
import { formatClock, formatRelative } from "../../i18n/format";
import { t } from "../cms/i18n";
import type { StepVisual } from "./step-visual";
import { showReminder, truncateAtWord } from "../../adapters/browser/cook-reminders";
import type { PredictedScores, RecipeSnapshot } from "../../domain/recipe-feedback";
import {
  FLEXIBLE_STEP_IDS,
  TIMED_WAIT_STEP_IDS,
  completeStepAt,
  startStepAt,
} from "../../use-cases/cook-timing";

const STORAGE_KEY = "vulcan_cook_session";

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
  quantities?: { label: string; value: string }[];
  tip?: string;
  /** Durata pianificata, estensioni della Timeline comoda comprese (FW-19, S10-A-03). */
  duration_minutes: number;
  startMs: number;
  endMs: number;
  flexible: boolean;
  done: boolean;
  /** FW-19 (S10-B-05, S10-A-02): quando l'utente ha davvero cominciato il passo. */
  actualStartMs?: number;
  /** FW-19 (S10-A-16): cotture una alla volta, secondi di un giro e recupero del forno. */
  rounds?: number;
  roundSec?: number;
  recoverySec?: number;
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
  setStepDone: (index: number, done: boolean) => void;
  /** Completa lo step corrente RI-ANCORANDO i tempi successivi a adesso:
   * se finisci l'impasto in ritardo, tutto il resto slitta di conseguenza;
   * se salti un'attesa in anticipo, il piano si accorcia. La timeline segue
   * la realtà, non il contrario. */
  completeStep: (index: number) => void;
  openOverlay: () => void;
  closeOverlay: () => void;
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

  const setStepDone = useCallback(
    (index: number, done: boolean) => {
      setSession((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((st, i) => (i === index ? { ...st, done } : st));
        const next = { ...prev, steps };
        storeSession(next);
        return next;
      });
    },
    [],
  );

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

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  /* ── Tick: notifiche quando arriva il MOMENTO DI AGIRE ──
   * Fase attiva → quando inizia. Fase flessibile (attesa) → quando FINISCE:
   * l'attesa scorre da sola, tocca a te solo alla fine. */
  useEffect(() => {
    if (!session) return;
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
        const description = truncateAtWord(waiting && nextStep
          ? nextStep.description
          : step.description, 90);
        void showReminder(
          title,
          t(cms.cooking.notificationBody, {
            style: session.styleName,
            description,
          }),
        );
        setSession((prev) => {
          if (!prev) return prev;
          const next = { ...prev, notified: [...prev.notified, noticeKey] };
          storeSession(next);
          return next;
        });
      }
    };
    check();
    const interval = setInterval(check, 20_000);
    return () => clearInterval(interval);
  }, [session, cms.cooking]);

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
      setStepDone,
      completeStep,
      openOverlay,
      closeOverlay,
    }),
    [session, overlayOpen, startSession, endSession, startStep, setStepDone, completeStep, openOverlay, closeOverlay],
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
