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
import { useCms, type CmsContent } from "../cms/cms-context";
import { t } from "../cms/i18n";

const STORAGE_KEY = "vulcan_cook_session";
type CookingCopy = CmsContent["cooking"];

const FALLBACK_COOKING_COPY = {
  etaNow: "ora",
  etaInMinutes: "tra {n} min",
  etaInHours: "tra {h} ore",
  etaInHoursMinutes: "tra {h}h {m}m",
  etaInDaysHours: "tra {d}g {h}h",
} as Pick<
  CookingCopy,
  "etaNow" | "etaInMinutes" | "etaInHours" | "etaInHoursMinutes" | "etaInDaysHours"
>;

/* Fasi "flessibili": lunghe attese passive dove ±minuti non cambiano nulla.
 * Le altre sono azioni attive con le mani in pasta. */
export const FLEXIBLE_STEP_IDS = new Set(["bulk", "proof", "preferment"]);

export interface CookSessionStep {
  id: string;
  title: string;
  description: string;
  longDesc?: string;
  tip?: string;
  duration_minutes: number;
  startMs: number;
  endMs: number;
  flexible: boolean;
  done: boolean;
}

export interface CookSession {
  styleName: string;
  styleId: string;
  createdAt: number;
  steps: CookSessionStep[];
  /** id step per cui è già stata mostrata una notifica */
  notified: string[];
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

/** Il momento in cui TOCCA all'utente per questo step:
 * fase attiva → al suo inizio; attesa flessibile → alla sua fine. */
export function nextActionTime(step: CookSessionStep): number {
  return step.flexible ? step.endMs : step.startMs;
}

/* ── Context ── */
interface CookSessionCtx {
  session: CookSession | null;
  overlayOpen: boolean;
  startSession: (
    styleId: string,
    styleName: string,
    steps: Omit<CookSessionStep, "done">[],
  ) => void;
  endSession: () => void;
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

/** Richiede il permesso notifiche senza bloccare (best effort). */
function requestNotificationPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  } catch {
    /* niente notifiche: il widget resta la fonte primaria */
  }
}

function notify(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico", tag: "vulcan-cook" });
    }
  } catch {
    /* ignora */
  }
}

export function CookSessionProvider({ children }: { children: React.ReactNode }) {
  const { cms } = useCms();
  const [session, setSession] = useState<CookSession | null>(loadSession);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const persist = useCallback((s: CookSession | null) => {
    setSession(s);
    storeSession(s);
  }, []);

  const startSession = useCallback(
    (styleId: string, styleName: string, steps: Omit<CookSessionStep, "done">[]) => {
      const s: CookSession = {
        styleId,
        styleName,
        createdAt: Date.now(),
        steps: steps.map((st) => ({ ...st, done: false })),
        notified: [],
      };
      persist(s);
      setOverlayOpen(true);
      requestNotificationPermission();
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

  const completeStep = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev || index < 0 || index >= prev.steps.length) return prev;
      const now = Date.now();
      const steps = prev.steps.map((st) => ({ ...st }));
      /* Lo step completato finisce ADESSO (presto o tardi che sia) */
      steps[index].done = true;
      steps[index].endMs = now;
      /* Ri-ancora tutti gli step successivi in sequenza da adesso */
      let cursor = now;
      for (let j = index + 1; j < steps.length; j++) {
        const dur = steps[j].duration_minutes * 60_000;
        steps[j].startMs = cursor;
        steps[j].endMs = cursor + dur;
        cursor = steps[j].endMs;
      }
      const next = { ...prev, steps };
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
      if (now >= actionAt && !session.notified.includes(step.id + idx)) {
        const nextStep = session.steps[idx + 1];
        const title = step.flexible
          ? t(cms.cooking.notificationWaitDoneTitle, {
              title: nextStep ? nextStep.title : cms.cooking.continueAction,
            })
          : t(cms.cooking.notificationDueTitle, { title: step.title });
        const description = (step.flexible && nextStep
          ? nextStep.description
          : step.description
        ).slice(0, 90);
        notify(
          title,
          t(cms.cooking.notificationBody, {
            style: session.styleName,
            description,
          }),
        );
        setSession((prev) => {
          if (!prev) return prev;
          const next = { ...prev, notified: [...prev.notified, step.id + idx] };
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
      document.title =
        diffMin <= 0
          ? t(cms.cooking.documentTitleDue, { title: step.title })
          : t(cms.cooking.documentTitleCountdown, {
              eta: formatEta(actionAt, Date.now(), cms.cooking),
              title: step.title,
            });
    };
    const interval = setInterval(tick, 30_000);
    return () => {
      clearInterval(interval);
      document.title = original;
    };
  }, [session, cms.cooking]);

  const value = useMemo(
    () => ({
      session,
      overlayOpen,
      startSession,
      endSession,
      setStepDone,
      completeStep,
      openOverlay,
      closeOverlay,
    }),
    [session, overlayOpen, startSession, endSession, setStepDone, completeStep, openOverlay, closeOverlay],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ── Format helpers (condivisi col widget e la modalità cucina) ── */

/** Human ETA, i18n-aware when cooking copy is provided. */
export function formatEta(
  targetMs: number,
  now: number = Date.now(),
  copy: Pick<
    CookingCopy,
    "etaNow" | "etaInMinutes" | "etaInHours" | "etaInHoursMinutes" | "etaInDaysHours"
  > = FALLBACK_COOKING_COPY,
): string {
  const diffMin = Math.round((targetMs - now) / 60_000);
  if (diffMin <= 0) return copy.etaNow;
  if (diffMin < 60) return t(copy.etaInMinutes, { n: diffMin });
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h < 24) {
    return m > 0
      ? t(copy.etaInHoursMinutes, { h, m })
      : t(copy.etaInHours, { h });
  }
  const d = Math.floor(h / 24);
  return t(copy.etaInDaysHours, { d, h: h % 24 });
}

/** Orario "onesto": esatto per fasi attive, ~arrotondato ai 15' per le flessibili. */
export function formatStepClock(ms: number, flexible: boolean, locale = "it-IT"): string {
  const d = new Date(ms);
  if (!flexible) {
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }
  const rounded = new Date(Math.round(ms / 900_000) * 900_000);
  return `~${rounded.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
}
