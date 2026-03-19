import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";

interface ScrollSectionProps {
  children: React.ReactNode;
  /** data-section id for progress tracking */
  sectionId?: string;
  /** Stagger delay for initial entrance */
  delay?: number;
  /** Disable entrance animation (use when parent already handles it) */
  disableEntrance?: boolean;
}

/**
 * Scrollytelling section wrapper — natural height, soft spotlight.
 *
 * Uses IntersectionObserver to highlight the active section.
 * No CSS scroll-snap, no blur (causes lag on mobile).
 * Gentle opacity change only — respects prefers-reduced-motion.
 * Uses CSS custom property (--ss-opacity) instead of React state
 * to avoid re-renders during scroll (VPL-011 perf fix).
 */
export function ScrollSection({
  children,
  sectionId,
  delay = 0,
  disableEntrance = false,
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    /* Respect prefers-reduced-motion — skip dimming entirely */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      inner.style.opacity = "1";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        /* Softer focus curve — full visibility at ratio 0.15 */
        const focus = Math.min(1, entry.intersectionRatio / 0.15);
        const opacity = 0.45 + focus * 0.55;
        inner.style.opacity = String(opacity);
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 1],
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (disableEntrance) {
    return (
      <div
        ref={ref}
        data-section={sectionId}
        style={{
          scrollMarginTop: "5.5rem",
        }}
      >
        <div
          ref={innerRef}
          style={{
            transition: "opacity 0.35s ease-out",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      data-section={sectionId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      style={{
        scrollMarginTop: "5.5rem",
      }}
    >
      <div
        ref={innerRef}
        style={{
          transition: "opacity 0.35s ease-out",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
