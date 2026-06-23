import React from 'react';
import { motion } from 'motion/react';

/**
 * M3 EXPRESSIVE DYNAMIC SHAPE — Energy-reactive blob mascot.
 *
 * Two visual modes:
 *   • DOUGH (stretch/rise/rest/spin/fold) — soft, organic, impasto-like
 *   • MAGMA (forge) — volcanic, saturated, molten core with crust edges
 *
 * CSS-driven: borderRadius keyframe morphing + layered blobs
 * with energy-reactive speed, glow, and scale. No SVG paths.
 *
 * - energy 0–25  → gentle breathing, slow morph
 * - energy 25–50 → moderate pulse, visible glow
 * - energy 50–75 → dynamic morph, rotation
 * - energy 75–100 → intense morph, strong glow, satellite
 */

export type DoughVariant = 'stretch' | 'rise' | 'rest' | 'spin' | 'fold' | 'forge' | 'neural';

interface DoughBlobProps {
  variant?: DoughVariant;
  size?: number;
  className?: string;
  animate?: boolean;
  /** 0–100: drives animation speed/intensity. Tied to composite score in step 3. */
  energy?: number;
}

/* ═══ EXPRESSIVE SHAPE KEYFRAMES PER VARIANT ═══ */
const BLOB_RADII: Record<DoughVariant, string[]> = {
  /* ── FORGE: teardrop-influenced — harmonized with VulcanMark Piena ──
   * Bottom-heavy shapes that rhyme with the logo's teardrop terminal.
   * The rightward weight bias echoes the thick-leg asymmetry.
   * At rest the blob reads "drop"; in motion it breathes through
   * organic variations that never fully lose the teardrop DNA. */
  forge: [
    '45% 55% 38% 62% / 28% 28% 72% 72%',   // teardrop — narrow top, round bottom
    '58% 42% 42% 58% / 42% 50% 50% 58%',   // shift right, transitional
    '42% 58% 55% 45% / 52% 32% 68% 48%',   // breathe wide, slight teardrop
    '52% 48% 48% 52% / 36% 48% 52% 64%',   // gentle, bottom-weighted
    '45% 55% 38% 62% / 28% 28% 72% 72%',   // back to teardrop
  ],
  stretch: [
    '30% 70% 70% 30% / 30% 30% 70% 70%',
    '70% 30% 50% 50% / 50% 60% 40% 50%',
    '45% 55% 30% 70% / 60% 35% 65% 40%',
    '55% 45% 65% 35% / 35% 55% 45% 65%',
    '30% 70% 70% 30% / 30% 30% 70% 70%',
  ],
  rise: [
    '40% 60% 55% 45% / 55% 35% 65% 45%',
    '60% 40% 35% 65% / 45% 55% 45% 55%',
    '35% 65% 60% 40% / 65% 45% 55% 35%',
    '50% 50% 40% 60% / 40% 65% 35% 55%',
    '40% 60% 55% 45% / 55% 35% 65% 45%',
  ],
  rest: [
    '50% 50% 50% 50% / 50% 50% 50% 50%',
    '48% 52% 52% 48% / 52% 48% 52% 48%',
    '52% 48% 48% 52% / 48% 52% 48% 52%',
    '50% 50% 50% 50% / 50% 50% 50% 50%',
  ],
  spin: [
    '25% 75% 65% 35% / 55% 30% 70% 45%',
    '65% 35% 40% 60% / 30% 65% 35% 70%',
    '45% 55% 70% 30% / 70% 45% 55% 30%',
    '70% 30% 35% 65% / 40% 60% 40% 60%',
    '25% 75% 65% 35% / 55% 30% 70% 45%',
  ],
  fold: [
    '70% 30% 30% 70% / 70% 70% 30% 30%',
    '30% 70% 70% 30% / 30% 30% 70% 70%',
    '55% 45% 45% 55% / 45% 55% 55% 45%',
    '45% 55% 55% 45% / 55% 45% 45% 55%',
    '70% 30% 30% 70% / 70% 70% 30% 30%',
  ],
  neural: [
    '45% 55% 38% 62% / 28% 28% 72% 72%',
    '50% 50% 45% 55% / 45% 45% 55% 55%',
    '38% 62% 52% 48% / 55% 28% 72% 45%',
    '50% 50% 50% 50% / 50% 50% 50% 50%',
    '45% 55% 38% 62% / 28% 28% 72% 72%',
  ],
};

/* Accent layer — inner blob with offset phase */
const ACCENT_RADII: Record<DoughVariant, string[]> = {
  forge: [
    '50% 50% 42% 58% / 40% 40% 60% 60%',   // soft teardrop inner
    '58% 42% 48% 52% / 50% 45% 55% 50%',   // asymmetric shift
    '45% 55% 52% 48% / 45% 50% 50% 55%',   // neutral breath
    '50% 50% 42% 58% / 40% 40% 60% 60%',   // back
  ],
  stretch: [
    '55% 45% 40% 60% / 60% 40% 60% 40%',
    '40% 60% 55% 45% / 45% 55% 45% 55%',
    '60% 40% 45% 55% / 50% 50% 50% 50%',
    '55% 45% 40% 60% / 60% 40% 60% 40%',
  ],
  rise: [
    '45% 55% 60% 40% / 40% 60% 40% 60%',
    '55% 45% 40% 60% / 60% 40% 60% 40%',
    '50% 50% 55% 45% / 45% 55% 55% 45%',
    '45% 55% 60% 40% / 40% 60% 40% 60%',
  ],
  rest: [
    '50% 50% 50% 50% / 50% 50% 50% 50%',
    '52% 48% 48% 52% / 48% 52% 48% 52%',
    '50% 50% 50% 50% / 50% 50% 50% 50%',
  ],
  spin: [
    '60% 40% 50% 50% / 50% 60% 40% 50%',
    '40% 60% 50% 50% / 50% 40% 60% 50%',
    '50% 50% 60% 40% / 40% 50% 50% 60%',
    '60% 40% 50% 50% / 50% 60% 40% 50%',
  ],
  fold: [
    '45% 55% 55% 45% / 55% 45% 45% 55%',
    '55% 45% 45% 55% / 45% 55% 55% 45%',
    '50% 50% 50% 50% / 50% 50% 50% 50%',
    '45% 55% 55% 45% / 55% 45% 45% 55%',
  ],
  neural: [
    '50% 50% 45% 55% / 45% 45% 55% 55%',
    '45% 55% 55% 45% / 55% 45% 45% 55%',
    '55% 45% 45% 55% / 45% 55% 55% 45%',
    '50% 50% 45% 55% / 45% 45% 55% 55%',
  ],
};

/* Highlight (inner-inner) — small bright core */
const HIGHLIGHT_RADII: string[] = [
  '50% 50% 30% 70% / 60% 40% 60% 40%',
  '30% 70% 70% 30% / 40% 60% 40% 60%',
  '60% 40% 50% 50% / 50% 50% 50% 50%',
  '50% 50% 30% 70% / 60% 40% 60% 40%',
];

/* Map energy (0–100) to animation parameters */
function energyToParams(energy: number) {
  const e = Math.max(0, Math.min(100, energy)) / 100;
  return {
    /* Morph cycle: slower when calm, faster when intense */
    mainDuration:  8 - e * 4.5,       // 8s → 3.5s
    accentDuration: 6 - e * 3,        // 6s → 3s
    highlightDuration: 5 - e * 2.5,   // 5s → 2.5s
    /* Rotation: very slow base, increases with energy */
    rotateDuration: 40 - e * 25,      // 40s → 15s
    rotateRange: [0, 360] as [number, number],
    /* Accent rotation: counter-rotate */
    accentRotateDuration: 50 - e * 30, // 50s → 20s
    /* Scale breathing */
    scaleRange: [1, 1.02 + e * 0.06, 0.98 - e * 0.03, 1] as number[],
    scaleDuration: 6 - e * 3,          // 6s → 3s
    /* Glow */
    glowOpacityRange: [0.06 + e * 0.06, 0.12 + e * 0.14] as [number, number],
    glowScaleRange: [1, 1.08 + e * 0.15] as [number, number],
    glowDuration: 5 - e * 2.5,
    /* Satellite (only visible at high energy) */
    satelliteOpacity: Math.max(0, (e - 0.5) * 2),   // 0 until 50, then linear to 1
    satelliteDuration: 4 - e * 2,
  };
}

export function DoughBlob({
  variant = 'stretch',
  size = 200,
  className = '',
  animate: shouldAnimate = true,
  energy = 50,
}: DoughBlobProps) {
  const params = energyToParams(energy);

  /* ═══ VPL-001: Respect prefers-reduced-motion ═══ */
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isAnimated = shouldAnimate && !reducedMotion;

  const mainRadii = BLOB_RADII[variant];
  const accentRadii = ACCENT_RADII[variant];
  const isForge = variant === 'forge';
  const isNeural = variant === 'neural';

  /* Layer sizes */
  const mainSize = size * 0.82;
  const accentSize = isForge || isNeural ? size * 0.62 : size * 0.58;
  const highlightSize = isForge || isNeural ? size * 0.28 : size * 0.3;
  const satelliteSize = size * 0.1;

  /* Static border-radius for reduced-motion */
  const staticRadius = mainRadii[0];

  /* ═══ MAGMA vs NEURAL vs DOUGH visual layer config ═══
   * Forge: saturated lava gradients, higher opacity, solid crust,
   *        bright molten core, ember satellites.
   * Neural: glowing fluid gradients (indigo, violet, pink), glassmorphic opacity,
   *         bright white/indigo core, soft glowing satellite.
   * Dough: soft pastels, low opacity, dashed ring, gentle glow. */
  const layer = {
    glow: isForge
      ? 'var(--blob-glow-forge)'
      : isNeural
        ? 'var(--blob-glow-neural)'
        : 'var(--blob-glow)',
    main: isForge
      ? 'var(--blob-body-forge)'
      : isNeural
        ? 'var(--blob-body-neural)'
        : 'var(--blob-body)',
    mainOpacity: isForge ? 0.28 : isNeural ? 0.35 : 0.16,
    accent: isForge
      ? 'var(--blob-accent-forge)'
      : isNeural
        ? 'var(--blob-accent-neural)'
        : 'var(--blob-accent)',
    accentOpacity: isForge ? 0.32 : isNeural ? 0.4 : 0.2,
    core: isForge
      ? 'var(--blob-core-forge)'
      : isNeural
        ? 'var(--blob-core-neural)'
        : 'var(--blob-core)',
    coreOpacity: isForge ? 0.25 : isNeural ? 0.3 : 0.14,
    edge: isForge
      ? 'var(--blob-edge-forge)'
      : isNeural
        ? 'var(--blob-edge-neural)'
        : 'var(--blob-edge)',
    satellite: isForge
      ? 'var(--blob-satellite-forge)'
      : isNeural
        ? 'var(--blob-satellite-neural)'
        : 'var(--blob-satellite)',
    satelliteOpacity: isForge ? 0.5 : isNeural ? 0.75 : 0.35,
  };

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
      aria-hidden="true"
    >
      {/* Layer 0: Ambient glow — energy-reactive, blurred */}
      {isAnimated && (
        <motion.div
          style={{
            position: 'absolute',
            inset: isForge ? '-25%' : '-20%',
            background: layer.glow,
            borderRadius: '50%',
            filter: isForge ? 'blur(25px)' : 'blur(30px)',
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
          animate={{
            scale: isForge
              ? [params.glowScaleRange[0], params.glowScaleRange[1] * 1.1]
              : params.glowScaleRange,
            opacity: isForge
              ? [params.glowOpacityRange[0] * 1.5, params.glowOpacityRange[1] * 1.4]
              : params.glowOpacityRange,
          }}
          transition={{
            scale: { duration: params.glowDuration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            opacity: { duration: params.glowDuration * 1.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          }}
        />
      )}

      {/* Layer 1: Main blob */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: mainSize,
          height: mainSize,
          marginTop: -mainSize / 2,
          marginLeft: -mainSize / 2,
          background: layer.main,
          opacity: layer.mainOpacity,
          borderRadius: isAnimated ? undefined : staticRadius,
          willChange: 'border-radius, transform',
        }}
        {...(isAnimated ? {
          animate: {
            borderRadius: mainRadii,
            rotate: params.rotateRange,
            scale: params.scaleRange,
          },
          transition: {
            borderRadius: { duration: params.mainDuration, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: params.rotateDuration, repeat: Infinity, ease: 'linear' },
            scale: { duration: params.scaleDuration, repeat: Infinity, ease: 'easeInOut' },
          },
        } : {})}
      />

      {/* Layer 2: Accent blob — molten core (forge) or counter-rotate layer */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: accentSize,
          height: accentSize,
          marginTop: -accentSize / 2,
          marginLeft: -accentSize / 2,
          background: layer.accent,
          opacity: layer.accentOpacity,
          borderRadius: isAnimated ? undefined : accentRadii[0],
          willChange: 'border-radius, transform',
        }}
        {...(isAnimated ? {
          animate: {
            borderRadius: accentRadii,
            rotate: [360, 0],
          },
          transition: {
            borderRadius: { duration: params.accentDuration, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: params.accentRotateDuration, repeat: Infinity, ease: 'linear' },
          },
        } : {})}
      />

      {/* Layer 3: Highlight core — bright molten center */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: highlightSize,
          height: highlightSize,
          marginTop: -highlightSize / 2,
          marginLeft: -highlightSize / 2,
          background: layer.core,
          opacity: layer.coreOpacity,
          borderRadius: isAnimated ? undefined : HIGHLIGHT_RADII[0],
          willChange: 'border-radius, transform',
        }}
        {...(isAnimated ? {
          animate: {
            borderRadius: HIGHLIGHT_RADII,
            scale: isForge ? [1, 1.15, 0.92, 1.08, 1] : [1, 1.1, 0.95, 1.05, 1],
          },
          transition: {
            borderRadius: { duration: params.highlightDuration, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: params.highlightDuration * 1.3, repeat: Infinity, ease: 'easeInOut' },
          },
        } : {})}
      />

      {/* Layer 4: Edge — solid crust (forge) or dashed ring */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: mainSize + 4,
          height: mainSize + 4,
          marginTop: -(mainSize + 4) / 2,
          marginLeft: -(mainSize + 4) / 2,
          border: layer.edge,
          borderRadius: isAnimated ? undefined : staticRadius,
          willChange: 'border-radius, transform',
        }}
        {...(isAnimated ? {
          animate: {
            borderRadius: mainRadii,
            rotate: params.rotateRange,
          },
          transition: {
            borderRadius: { duration: params.mainDuration * 1.1, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: params.rotateDuration * 1.05, repeat: Infinity, ease: 'linear' },
          },
        } : {})}
      />

      {/* Layer 5: Satellite — ember spark (forge) or soft blob */}
      {isAnimated && params.satelliteOpacity > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            width: satelliteSize,
            height: satelliteSize,
            background: layer.satellite,
            opacity: params.satelliteOpacity * layer.satelliteOpacity,
          }}
          animate={{
            borderRadius: HIGHLIGHT_RADII,
            x: [
              size * 0.35, size * 0.05, -size * 0.1,
              size * 0.05, size * 0.35,
            ],
            y: [
              -size * 0.05, size * 0.15, size * 0.35,
              size * 0.55, -size * 0.05,
            ],
          }}
          transition={{
            borderRadius: { duration: params.satelliteDuration, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: params.satelliteDuration * 3, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: params.satelliteDuration * 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}
    </div>
  );
}

// ═══ HELPERS ═══
export function moodFromScore(score: number): DoughVariant {
  if (score >= 80) return 'rise';
  if (score >= 60) return 'stretch';
  if (score >= 40) return 'fold';
  return 'rest';
}

export function moodFromTier(tier: 'perfect' | 'good' | 'challenging'): DoughVariant {
  switch (tier) {
    case 'perfect': return 'rise';
    case 'good': return 'stretch';
    case 'challenging': return 'rest';
  }
}

export function moodFromCount(count: number): DoughVariant {
  if (count <= 2) return 'rest';
  if (count <= 6) return 'stretch';
  if (count <= 12) return 'rise';
  return 'spin';
}

export const DoughMascot = DoughBlob;