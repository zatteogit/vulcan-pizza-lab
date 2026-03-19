import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Lightbulb, X } from "lucide-react";

/* ═══ VPL-005: Aligned to 3 data-sections ═══ */

export type BuildSection = "context" | "setup" | "styles";

interface ProgressPillProps {
  activeSection: BuildSection;
  visible: boolean;
}

const SECTION_ORDER: BuildSection[] = [
  "context",
  "setup",
  "styles",
];

const SECTION_LABELS: Record<BuildSection, string> = {
  context: "Contesto",
  setup: "Setup",
  styles: "Stile",
};

/* ═══ Contextual tips — coachmark on first visit, tooltip on hover after ═══ */
const SECTION_TIPS: Record<BuildSection, string> = {
  context:
    "La temperatura della cucina e il tempo a disposizione guidano tutto il processo.",
  setup:
    "Adattiamo la ricetta alla tua esperienza, al forno e alla dispensa reale.",
  styles:
    "Ogni stile ha parametri unici: scegli quello che meglio si adatta alle tue condizioni.",
};

/* ═══ localStorage helpers ═══ */
const LS_KEY = "vulcan_tips_seen";

function loadSeenTips(): Set<BuildSection> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return new Set(arr as BuildSection[]);
    }
  } catch { /* ignore */ }
  return new Set();
}

function persistSeenTips(seen: Set<BuildSection>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...seen]));
  } catch { /* ignore */ }
}

const COACHMARK_AUTO_DISMISS_MS = 7000;

function scrollToSection(sectionId: BuildSection) {
  const el = document.querySelector<HTMLElement>(
    `[data-section="${sectionId}"]`,
  );
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Fixed progress pill — minimal vertical indicator on the left edge.
 * Desktop only (hidden on mobile).
 *
 * Tip behavior (coachmark → tooltip pattern):
 * - First visit: coachmark auto-appears for each unseen section, with dismiss ×
 *   and auto-fade after 7s. Pulsing ring on active dot draws attention.
 * - After all 3 tips seen: clean dots only; tip appears on hover as a tooltip.
 *
 * VPL-005: Aligned from 7 sub-sections to 3 data-sections.
 */
export function ProgressPill({
  activeSection,
  visible,
}: ProgressPillProps) {
  const currentIdx = SECTION_ORDER.indexOf(activeSection);
  /* ═══ VPL-045: Respect prefers-reduced-motion ═══ */
  const prefersReducedMotion = useReducedMotion();

  /* ── Coachmark state ── */
  const [seenTips, setSeenTips] = useState<Set<BuildSection>>(() =>
    loadSeenTips(),
  );
  const allSeen = seenTips.size >= SECTION_ORDER.length;

  /* Track whether the coachmark for the *current* active section is showing */
  const [coachmarkVisible, setCoachmarkVisible] = useState(false);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Hover tooltip state (post-coachmark) ── */
  const [hoveredSection, setHoveredSection] =
    useState<BuildSection | null>(null);

  /* When active section changes, decide whether to show coachmark */
  useEffect(() => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
    }

    if (!allSeen && !seenTips.has(activeSection)) {
      /* Slight delay so the dot animation settles first */
      const showTimer = setTimeout(() => setCoachmarkVisible(true), 400);
      /* Auto-dismiss after N seconds */
      autoDismissRef.current = setTimeout(() => {
        dismissCoachmark(activeSection);
      }, COACHMARK_AUTO_DISMISS_MS + 400);
      return () => {
        clearTimeout(showTimer);
        if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
      };
    } else {
      setCoachmarkVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, allSeen]);

  const dismissCoachmark = useCallback(
    (section: BuildSection) => {
      setCoachmarkVisible(false);
      setSeenTips((prev) => {
        const next = new Set(prev);
        next.add(section);
        persistSeenTips(next);
        return next;
      });
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
        autoDismissRef.current = null;
      }
    },
    [],
  );

  /* Which tip to show? Coachmark wins over hover */
  const showCoachmark = coachmarkVisible && !allSeen && !seenTips.has(activeSection);
  const showTooltip = !showCoachmark && allSeen && hoveredSection !== null;
  const tipSection = showCoachmark ? activeSection : hoveredSection;
  const tipText = tipSection ? SECTION_TIPS[tipSection] : "";

  /* Coachmark progress counter */
  const seenCount = seenTips.size;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : -20,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
      }}
      className="fixed z-40 hidden lg:flex flex-col items-center"
      style={{
        left: "clamp(12px, 2vw, 24px)",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      {/* Vertical dots with active label */}
      <div
        className="relative flex flex-col items-center gap-2 px-2.5 py-3 rounded-2xl"
        style={{
          background: "var(--stepper-pill-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--stepper-pill-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {SECTION_ORDER.map((s, i) => {
          const isActive = s === activeSection;
          const isPast = i < currentIdx;
          const showPulse = isActive && showCoachmark && !prefersReducedMotion;
          return (
            <button
              key={s}
              onClick={() => scrollToSection(s)}
              onMouseEnter={() => allSeen && setHoveredSection(s)}
              onMouseLeave={() => setHoveredSection(null)}
              className="relative flex items-center gap-0 cursor-pointer"
              style={{
                background: "none",
                border: "none",
                padding: "3px 2px",
              }}
              aria-label={SECTION_LABELS[s]}
            >
              {/* Pulsing ring — coachmark attention grabber */}
              <AnimatePresence>
                {showPulse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: [0.5, 0],
                      scale: [1, 2.2],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeOut",
                    }}
                    className="absolute rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: "var(--stepper-dot-active)",
                      left: "50%",
                      top: "50%",
                      marginLeft: -3,
                      marginTop: -3,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                animate={{
                  width: isActive ? 22 : 6,
                  height: 6,
                  backgroundColor: isActive
                    ? "var(--stepper-dot-active)"
                    : isPast
                      ? "var(--stepper-dot-past)"
                      : "var(--stepper-dot-future)",
                  borderRadius: 3,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Active section label — absolute so it never shifts the dots */}
      <div
        className="absolute flex justify-center"
        style={{
          top: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap" as React.CSSProperties["whiteSpace"],
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="px-2 py-0.5 rounded-lg type-label"
            style={{
              background: "var(--stepper-label-bg)",
              fontSize: "var(--font-size-xs)",
              color: "var(--stepper-label-color)",
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
            }}
          >
            {SECTION_LABELS[activeSection]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Tip bubble: coachmark (first visit) or tooltip (hover, post-onboarding) ── */}
      <AnimatePresence mode="wait">
        {(showCoachmark || showTooltip) && (
          <motion.div
            key={`tip-${tipSection}`}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 26,
            }}
            className="absolute flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
            style={{
              top: "calc(100% + 34px)",
              left: 0,
              width: 190,
              background: showCoachmark
                ? "var(--tip-bg-emphasis)"
                : "var(--tip-bg)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: showCoachmark
                ? "1px solid var(--tip-border-emphasis)"
                : "1px solid var(--tip-border)",
              boxShadow: showCoachmark ? "var(--shadow-md)" : "var(--shadow-sm)",
            }}
          >
            {/* Coachmark header: icon + dismiss */}
            {showCoachmark && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Lightbulb
                    size={11}
                    style={{
                      color: "var(--tip-icon)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="type-label"
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--tip-text)",
                      letterSpacing: "var(--tracking-spread)",
                    }}
                  >
                    {seenCount + 1} di {SECTION_ORDER.length}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissCoachmark(activeSection);
                  }}
                  className="cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 2,
                    color: "var(--tip-text)",
                    opacity: 0.6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = "0.6")
                  }
                  aria-label="Chiudi suggerimento"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            {/* Tip text */}
            <span
              style={{
                fontSize: "var(--font-size-base)",
                lineHeight: "var(--leading-relaxed)",
                color: "var(--tip-text)",
                fontStyle: "italic",
              }}
            >
              {tipText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Mobile progress bar — segmented, tappable.
 * Tapping a segment scrolls to the corresponding section.
 *
 * VPL-005: Aligned to 3 sections.
 */
export function MobileProgressBar({
  activeSection,
}: {
  activeSection: BuildSection;
}) {
  const currentIdx = SECTION_ORDER.indexOf(activeSection);

  return (
    <div className="lg:hidden w-full flex items-center gap-1.5">
      {SECTION_ORDER.map((s, i) => {
        const isActive = s === activeSection;
        const isPast = i <= currentIdx;
        return (
          <button
            key={s}
            onClick={() => scrollToSection(s)}
            className="relative flex-1 h-6 flex items-center cursor-pointer"
            style={{
              background: "none",
              border: "none",
              padding: 0,
            }}
            aria-label={SECTION_LABELS[s]}
          >
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{
                background: "var(--stepper-dot-future)",
              }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{
                  width: isPast ? "100%" : "0%",
                  backgroundColor: isActive
                    ? "var(--stepper-dot-active)"
                    : "var(--stepper-dot-past)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            </div>
            {/* Label on active */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap type-label"
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--stepper-label-color)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {SECTION_LABELS[s]}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}