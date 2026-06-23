import React from 'react';
import { motion } from 'motion/react';

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

  // When reduced motion is preferred, render a static warm wash instead
  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-15%',
            width: '70vw',
            height: '70vh',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${glowPrimary} 0%, transparent 70%)`,
            opacity: baseOpacity * 0.4,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Primary warm ember — top-right drift */}
      <motion.div
        animate={{
          x: [0, 30, -20, 10, 0],
          y: [0, -25, 15, -10, 0],
          scale: [1, 1.08, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-15%',
          width: '70vw',
          height: '70vh',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${glowPrimary} 0%, transparent 70%)`,
          opacity: baseOpacity * 0.4,
        }}
      />

      {/* Secondary amber — center-left breathing */}
      <motion.div
        animate={{
          x: [-10, 20, -15, 5, -10],
          y: [10, -20, 5, -15, 10],
          scale: [1, 1.12, 0.92, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '-20%',
          width: '60vw',
          height: '60vh',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${glowSecondary} 0%, transparent 65%)`,
          opacity: baseOpacity * 0.45,
        }}
      />

      {/* Tertiary deep glow — bottom warm wash */}
      <motion.div
        animate={{
          x: [5, -15, 10, -8, 5],
          y: [0, 15, -10, 20, 0],
          scale: [1, 0.95, 1.1, 0.98, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '80vw',
          height: '50vh',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${glowWarm} 0%, transparent 60%)`,
          opacity: baseOpacity * 0.3,
        }}
      />
    </div>
  );
}