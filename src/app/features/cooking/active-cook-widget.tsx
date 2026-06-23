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
import { CtaButton } from "../../components/ds/index";
import { liquidDockButtonStyle, liquidDockQuickSpring, liquidDockSpring, liquidDockStartButtonStyle } from "../../domain/liquid-dock";

export function ActiveCookWidget({
  canStartRecipe = false,
  hasProfileButton = false,
  compact = false,
}: {
  canStartRecipe?: boolean;
  hasProfileButton?: boolean;
  compact?: boolean;
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
        key={active ? "cook-active-action" : "cook-start-action"}
        type="button"
        initial={{ opacity: 0, y: -8, scale: 0.98, height: actionHeight, right: rightVal }}
        animate={{ opacity: 1, y: 0, scale: 1, height: actionHeight, right: rightVal }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.018, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={liquidDockSpring}
        onClick={handleClick}
        className={`fixed top-4 z-[70] inline-flex items-center rounded-full active-cook-widget ${
          active ? "is-active" : ""
        } ${compact ? "is-compact" : ""}`}
        style={{
          ...(active ? liquidDockButtonStyle : liquidDockStartButtonStyle),
          ...(active ? { background: "var(--primary)", color: "var(--text-on-accent)" } : {}),
          border: active
            ? due
              ? "1.5px solid color-mix(in srgb, var(--primary) 74%, white)"
              : "1px solid var(--primary)"
            : "1px solid color-mix(in srgb, var(--cta) 44%, transparent)",
          boxShadow: active
            ? "0 8px 22px color-mix(in srgb, var(--primary) 28%, transparent)"
            : "0 12px 30px color-mix(in srgb, var(--cta) 28%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 28%, transparent)",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--weight-bold)",
          lineHeight: 1,
          cursor: "pointer",
          overflow: "hidden",
          gap: compact ? 8 : 10,
          paddingLeft: compact ? 12 : 14,
          paddingRight: compact ? 12 : 14,
          maxWidth: hasProfileButton ? "calc(100vw - 84px)" : "calc(100vw - 32px)",
          willChange: "transform, opacity, height, right",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label={active ? `${activeAccessibleLabel}. ${cms.cooking.reopen}` : cms.cooking.start}
        title={active ? activeAccessibleLabel : cms.cooking.start}
      >
        {active && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 84,
              height: 58,
              right: -28,
              bottom: -24,
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--overlay-text) 34%, transparent), color-mix(in srgb, var(--overlay-text) 12%, transparent) 44%, transparent 70%)",
            }}
            animate={
              prefersReducedMotion || !due
                ? undefined
                : { opacity: [0.36, 0.68, 0.36], scale: [1, 1.14, 1] }
            }
            transition={{ duration: due ? 2 : 5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <span
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: iconBox, height: iconBox }}
        >
          {active && metrics ? (
            <ProgressRing progress={metrics.progress} due={due} size={iconBox} />
          ) : (
            <Flame size={compact ? 16 : 17} />
          )}
          {active && <Flame size={compact ? 13 : 14} className="absolute" fill={due ? "currentColor" : "none"} />}
        </span>

        <span
          className="active-cook-label relative whitespace-nowrap"
          style={{
            fontSize: compact ? "var(--font-size-sm)" : "var(--font-size-md)",
            maxWidth: compact ? "min(44vw, 132px)" : "min(52vw, 168px)",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {active ? actionLabel : cms.cooking.startShort}
        </span>
        {active && (
          <span
            className="active-cook-countdown relative type-data whitespace-nowrap"
            style={{
              color: "color-mix(in srgb, var(--overlay-text) 78%, transparent)",
              fontWeight: "var(--weight-semibold)",
              fontFeatureSettings: "'tnum'",
              fontSize: compact ? "var(--font-size-sm)" : "var(--font-size-md)",
            }}
          >
            {metrics?.finished ? cms.cooking.completed : countdown}
          </span>
        )}
      </motion.button>
    </AnimatePresence>
  );
}

function ProgressRing({ progress, due, size }: { progress: number; due: boolean; size: number }) {
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, progress)) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="absolute inset-0">
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
        transition={liquidDockSpring}
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
