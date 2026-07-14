/* Sticky cook action: start on recipe pages, active countdown everywhere. */

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  currentStepIndex,
  nextActionTime,
  useCookSession,
} from "./cook-session";
import { useCms } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { motionDuration,motionEase,motionSpring } from "../../components/ds/motion";

export function ActiveCookWidget({
  canStartRecipe = false,
  hasProfileButton = false,
  compact = false,
  hidden = false,
}: {
  canStartRecipe?: boolean;
  hasProfileButton?: boolean;
  compact?: boolean;
  /** Chrome liquida ritirata (scroll verso il basso). Il widget idle si ritira
   *  con lei; una pizzata ATTIVA resta sempre visibile (è un timer live). */
  hidden?: boolean;
}) {
  const { session, overlayOpen, openOverlay } = useCookSession();
  const { cms } = useCms();
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
  const retracted = hidden && !active;
  const metrics = session ? getSessionMetrics(session) : null;
  const due = Boolean(metrics?.isDue);
  const countdown = metrics ? getCompactCountdown(metrics.actionAt, cms.cooking) : "";
  const actionLabel = metrics ? getActionLead(metrics, cms.cooking) : cms.cooking.startShort;
  const activeAccessibleLabel = metrics?.finished
    ? cms.cooking.completed
    : `${actionLabel} ${countdown}`.trim();
  const actionHeight = compact ? 40 : 44;
  const iconBox = compact ? 24 : 28;

  const rightVal = hasProfileButton ? (compact ? 64 : 68) : 16;

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
        initial={{ opacity: 0, y: -8, scale: 0.98, height: actionHeight, right: rightVal }}
        animate={{
          opacity: retracted ? 0 : 1,
          y: retracted && !prefersReducedMotion ? -(actionHeight + 28) : 0,
          scale: 1,
          height: actionHeight,
          right: rightVal,
        }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.018, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={motionSpring.liquid}
        onClick={handleClick}
        className={[
          "cook-widget",
          active && "cook-widget--active",
          compact && "cook-widget--compact",
          due && "cook-widget--due",
          retracted && "cook-widget--retracted",
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
    stepTitle: step?.title ?? "",
  };
}

function getActionLead(
  metrics: ReturnType<typeof getSessionMetrics>,
  copy: ReturnType<typeof useCms>["cms"]["cooking"],
) {
  if (metrics.finished) return copy.done;
  if (!metrics.stepTitle) return copy.inProgressShort;
  if (metrics.isDue) return metrics.stepTitle;

  const inLabel = copy.etaInMinutes.trim().toLowerCase().startsWith("tra") ? "fra" : "in";
  return `${metrics.stepTitle} ${inLabel}`;
}

function getCompactCountdown(actionAt: number, copy: ReturnType<typeof useCms>["cms"]["cooking"]) {
  const ms = actionAt - Date.now();
  if (ms <= 0) return copy.etaNow;
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return t(copy.compactSeconds, { n: seconds });
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return t(copy.compactMinutes, { n: minutes });
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes > 0
    ? t(copy.compactHoursMinutes, { h: hours, m: restMinutes })
    : t(copy.compactHours, { h: hours });
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
