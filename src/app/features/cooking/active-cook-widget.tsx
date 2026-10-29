/* Sticky cook action: start on recipe pages, active countdown everywhere. */

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  currentStepIndex,
  nextActionTime,
  stepIsWaiting,
  useCookSession,
} from "./cook-session";
import { useCms } from "../cms/cms-context";
import { formatAtClock, formatRelative } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import { motionDuration,motionEase,motionSpring } from "../../components/ds/motion";

export function ActiveCookWidget({
  canStartRecipe = false,
  hasProfileButton = false,
  compact = false,
  inline = false,
}: {
  canStartRecipe?: boolean;
  hasProfileButton?: boolean;
  compact?: boolean;
  /** Participate in the shell's shared action row instead of fixed positioning. */
  inline?: boolean;
}) {
  const { session, overlayOpen, openOverlay } = useCookSession();
  const { cms, bcp47 } = useCms();
  const recipeSetupOpen = useRecipeSetupOpen();
  const prefersReducedMotion = useReducedMotion();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [session]);

  if (overlayOpen || recipeSetupOpen) return null;
  if (!session && !canStartRecipe) return null;

  const active = Boolean(session);
  const metrics = session ? getSessionMetrics(session) : null;
  const due = Boolean(metrics?.isDue);
  const lead = metrics ? getActionLead(metrics, cms.cooking, bcp47) : null;
  const actionLabel = lead ? lead.before : cms.cooking.startShort;
  const countdown = lead?.eta ?? "";
  const activeAccessibleLabel = metrics?.finished
    ? cms.cooking.completed
    : lead?.accessible ?? "";
  const iconBox = compact ? 24 : 28;

  const handleClick = () => {
    if (session) {
      openOverlay();
      return;
    }
    window.dispatchEvent(new CustomEvent("vulcan:start-cooking"));
  };

  return (
    <AnimatePresence>
      <motion.button
        layout
        data-region="widget"
        key={active ? "cook-active-action" : "cook-start-action"}
        type="button"
        /* FW-13 (S01-A-10/B-14): altezza da token (.cook-widget--compact), il
           posto accanto al profilo da .cook-actions--beside-profile. */
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.018, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={motionSpring.liquid}
        onClick={handleClick}
        className={[
          "cook-widget",
          inline && "cook-widget--inline",
          active && "cook-widget--active",
          compact && "cook-widget--compact",
          due && "cook-widget--due",
          hasProfileButton && "cook-widget--with-profile",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={active ? `${activeAccessibleLabel}. ${cms.cooking.reopen}` : cms.cooking.start}
        title={active ? activeAccessibleLabel : cms.cooking.start}
      >
        {active && (
          <motion.span
            aria-hidden="true"
            className="cook-widget__glow"
            animate={
              prefersReducedMotion || !due
                ? undefined
                : { opacity: [0.36, 0.68, 0.36], scale: [1, 1.14, 1] }
            }
            transition={{ duration: due ? motionDuration.duePulse : motionDuration.ambientShort,repeat: Infinity,ease: motionEase.standard }}
          />
        )}

        <span className="cook-widget__icon-box">
          {active && metrics ? (
            <ProgressRing progress={metrics.progress} size={iconBox} />
          ) : (
            <Flame size={compact ? 16 : 17} />
          )}
          {active && (
            <Flame
              size={compact ? 13 : 14}
              className="cook-widget__flame-overlay"
              fill={due ? "currentColor" : "none"}
            />
          )}
        </span>

        <span className="cook-widget__label">{active ? actionLabel : cms.cooking.startShort}</span>
        {active && (
          <span className="cook-widget__countdown type-data">
            {metrics?.finished ? cms.cooking.completed : countdown}
          </span>
        )}
        {active && lead?.after && (
          <span className="cook-widget__label" data-part="suffix">{lead.after}</span>
        )}
      </motion.button>
    </AnimatePresence>
  );
}

function ProgressRing({ progress, size }: { progress: number; size: number }) {
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, progress)) * circumference;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="cook-widget__progress-ring"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="color-mix(in srgb, var(--overlay-text) 28%, transparent)"
        strokeWidth="2.5"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="color-mix(in srgb, var(--overlay-text) 92%, transparent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        transition={motionSpring.liquid}
      />
    </svg>
  );
}

function getSessionMetrics(session: NonNullable<ReturnType<typeof useCookSession>["session"]>) {
  const index = currentStepIndex(session);
  const total = session.steps.length;
  const finished = index >= total;
  const step = finished ? null : session.steps[index];
  const actionAt = step ? nextActionTime(step) : 0;
  const firstStart = session.steps[0]?.startMs ?? session.createdAt;
  const lastEnd = session.steps[total - 1]?.endMs ?? firstStart;
  const timeProgress =
    lastEnd > firstStart ? Math.min(1, Math.max(0, (Date.now() - firstStart) / (lastEnd - firstStart))) : 1;
  const progress = finished
    ? 1
    : Math.max(total > 0 ? Math.min(index, total) / total : 1, timeProgress);

  return {
    actionAt,
    finished,
    isDue: step ? Date.now() >= actionAt : false,
    progress,
    // FW-19 (S10-A-04, S10-A-02): anche il forno acceso è un'attesa: «pronto», non «fra».
    flexible: step ? stepIsWaiting(step) : false,
    stepTitle: step?.title ?? "",
  };
}

/* FW-11 (S01-A-03, S10-B-06, S01-B-04, S01-A-04, S10-B-17): niente
 * preposizioni né unità nel codice. Il testo viene dai template già tradotti
 * widgetStepDueIn / widgetStepReadyAt, divisi sul segnaposto {eta} perché il
 * tempo resti uno span a sé. Un'attesa (lievitazione, prefermento) dice
 * «pronta», non «fra»: la fase è già in corso. Entro un'ora si conta alla
 * rovescia («tra 35 min»), oltre si dà l'orario («verso le 21:00»). */
function getActionLead(
  metrics: ReturnType<typeof getSessionMetrics>,
  copy: ReturnType<typeof useCms>["cms"]["cooking"],
  locale: string,
): { before: string; eta: string; after: string; accessible: string } {
  const plain = (text: string) => ({ before: text, eta: "", after: "", accessible: text });
  if (metrics.finished) return plain(copy.done);
  if (!metrics.stepTitle) return plain(copy.inProgressShort);
  const now = Date.now();
  const relative = formatRelative(metrics.actionAt, now, locale, { seconds: true });
  const withinHour = metrics.isDue || metrics.actionAt - now < 3_600_000;
  const eta = withinHour
    ? relative
    : formatAtClock(metrics.actionAt, locale, { approximate: metrics.flexible, nowMs: now });
  const template =
    metrics.flexible && !metrics.isDue ? copy.widgetStepReadyAt : copy.widgetStepDueIn;
  const [rawBefore = "", rawAfter = ""] = template.split("{eta}");
  const before = rawBefore.replace("{title}", metrics.stepTitle).trim();
  const after = rawAfter.replace("{title}", metrics.stepTitle).trim();
  const sentence = [before, eta, after].filter(Boolean).join(" ");
  return {
    before,
    eta,
    after,
    accessible: withinHour
      ? sentence
      : uiMessage("cooking.widget.withRelative", [sentence, relative], locale),
  };
}

function useRecipeSetupOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOpen(document.body.getAttribute("data-recipe-setup-open") === "true");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-recipe-setup-open"],
    });
    return () => observer.disconnect();
  }, []);

  return open;
}
