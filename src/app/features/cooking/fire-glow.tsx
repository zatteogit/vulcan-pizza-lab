import { useDecorativeMotion } from "../../context/visual-quality-context";
import { motion } from 'motion/react';
import { motionDelay,motionDuration,motionEase } from "../../components/ds/motion";
import { useLayoutEffect, useRef } from "react";

/**
 * Porta il bagliore al bordo alto del documento: la pagina che lo contiene
 * comincia sotto la testata della shell, e senza questo la fascia dietro la
 * barra di stato (iPhone, viewport-fit=cover) restava senza bagliore.
 * Scrive --fire-glow-offset sull'elemento, senza nuovi render. Misura al
 * montaggio: la testata cambia solo col cambio di pagina, che rimonta.
 */
function useDocumentTopAnchor() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.offsetParent;
    if (el && parent) el.style.setProperty("--fire-glow-offset", `${parent.getBoundingClientRect().top + window.scrollY}px`);
  }, []);
  return ref;
}

/**
 * FireGlow — subtle animated gradient background simulating warm firelight.
 * Multiple radial gradients drift slowly to create a living surface.
 * Colors come from the theme tokens (--glow-*) in theme.css.
 * Very lightweight: no blur, no filters, just opacity + translation.
 * Respects prefers-reduced-motion.
 */
export function FireGlow({ intensity = 0.5 }: { intensity?: number }) {
  const animateDecorations = useDecorativeMotion();
  const anchorRef = useDocumentTopAnchor();
  const toneVars = { ['--fire-glow-opacity' as any]: Math.min(0.35, intensity * 0.4) };

  // When reduced motion is preferred, render a static warm wash instead
  if (!animateDecorations) {
    return (
      <div ref={anchorRef} className="fire-glow" style={toneVars}>
        <div className="fire-glow__primary" />
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="fire-glow" style={toneVars}>
      {/* Primary warm ember — top-right drift */}
      <motion.div
        className="fire-glow__primary"
        animate={{
          x: [0, 30, -20, 10, 0],
          y: [0, -25, 15, -10, 0],
          scale: [1, 1.08, 0.95, 1.05, 1],
        }}
        transition={{
          duration: motionDuration.mascotBreath,
          repeat: Infinity,
          ease: motionEase.standard,
        }}
      />

      {/* Secondary amber — center-left breathing */}
      <motion.div
        className="fire-glow__secondary"
        animate={{
          x: [-10, 20, -15, 5, -10],
          y: [10, -20, 5, -15, 10],
          scale: [1, 1.12, 0.92, 1.06, 1],
        }}
        transition={{
          duration: motionDuration.mascotBlink,
          repeat: Infinity,
          ease: motionEase.standard,
          delay: motionDelay.ambient,
        }}
      />

      {/* Tertiary deep glow — bottom warm wash */}
      <motion.div
        className="fire-glow__warm"
        animate={{
          x: [5, -15, 10, -8, 5],
          y: [0, 15, -10, 20, 0],
          scale: [1, 0.95, 1.1, 0.98, 1],
        }}
        transition={{
          duration: motionDuration.mascotFloat,
          repeat: Infinity,
          ease: motionEase.standard,
          delay: motionDelay.ambientLong,
        }}
      />
    </div>
  );
}
