import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

interface ScrollSectionProps {
  children: React.ReactNode;
  /** data-section id for progress tracking */
  sectionId?: string;
  /** Stagger delay for initial entrance */
  delay?: number;
}

/**
 * Scrollytelling section wrapper — natural height, soft spotlight.
 *
 * Uses IntersectionObserver to highlight the active section.
 * No CSS scroll-snap, no blur (causes lag on mobile).
 * Gentle opacity change only — respects prefers-reduced-motion.
 */
export function ScrollSection({
  children,
  sectionId,
  delay = 0,
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
      },
      {
        threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1],
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Softer focus curve — full visibility starts at ratio 0.15
  const focus = Math.min(1, ratio / 0.15);

  // Gentle dimming only — no blur, no scale shift
  const opacity = reducedMotion ? 1 : 0.45 + focus * 0.55;

  return (
    <motion.div
      ref={ref}
      data-section={sectionId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{
        scrollMarginTop: "5.5rem",
      }}
    >
      <div
        style={{
          opacity,
          transition: "opacity 0.35s ease-out",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}