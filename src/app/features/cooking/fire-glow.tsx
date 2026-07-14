import React from 'react';
import { motion } from 'motion/react';
import { motionDelay,motionDuration,motionEase } from "../../components/ds/motion";

/**
 * FireGlow — subtle animated gradient background simulating warm firelight.
 * Multiple radial gradients drift slowly to create a living surface.
 * Uses CSS custom properties for theme-aware colors.
 * Very lightweight: no blur, no filters, just opacity + translation.
 * Respects prefers-reduced-motion.
 */
export function FireGlow({ intensity = 0.5, variant = 'warm' }: { intensity?: number; variant?: 'warm' | 'neural' }) {
  const baseOpacity = Math.min(0.35, intensity * 0.4);

  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const glowPrimary = variant === 'neural' ? 'var(--glow-primary-neural)' : 'var(--glow-primary)';
  const glowSecondary = variant === 'neural' ? 'var(--glow-secondary-neural)' : 'var(--glow-secondary)';
  const glowWarm = variant === 'neural' ? 'var(--glow-warm-neural)' : 'var(--glow-warm)';

  const toneVars = {
    ['--fire-glow-primary' as any]: glowPrimary,
    ['--fire-glow-secondary' as any]: glowSecondary,
    ['--fire-glow-warm' as any]: glowWarm,
    ['--fire-glow-opacity' as any]: baseOpacity,
  };

  // When reduced motion is preferred, render a static warm wash instead
  if (reducedMotion) {
    return (
      <div className="fire-glow" style={toneVars}>
        <div className="fire-glow__primary" />
      </div>
    );
  }

  return (
    <div className="fire-glow" style={toneVars}>
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
