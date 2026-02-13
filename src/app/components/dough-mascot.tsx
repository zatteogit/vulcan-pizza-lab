import React, { useId, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/**
 * M3 EXPRESSIVE DYNAMIC SHAPE — Energy-reactive.
 * The blob's animation speed, scale amplitude, and glow intensity
 * are driven by an `energy` prop (0–100).
 * - Step 1 (needs): ~25 energy → gentle breathing
 * - Step 2 (styles): ~50 → moderate pulse
 * - Step 3 (result): = composite score → direct feedback when tuning
 */

export type DoughVariant = 'stretch' | 'rise' | 'rest' | 'spin' | 'fold';

interface DoughBlobProps {
  variant?: DoughVariant;
  size?: number;
  className?: string;
  animate?: boolean;
  /** 0–100: drives animation speed/intensity. Tied to composite score in step 3. */
  energy?: number;
}

/* ═══ ORGANIC SHAPE PATHS ═══ */
const BLOB_PATHS: Record<DoughVariant, { main: string; accent: string; highlight: string }> = {
  stretch: {
    main: 'M140,50 C185,35 225,70 230,120 C235,170 200,215 150,220 C100,225 50,200 35,155 C20,110 55,65 100,50 C115,45 130,47 140,50Z',
    accent: 'M160,80 C190,70 215,100 210,135 C205,170 175,190 145,185 C115,180 95,155 100,125 C105,95 130,90 160,80Z',
    highlight: 'M120,75 C145,65 170,80 168,100 C166,120 145,132 125,128 C105,124 95,105 100,88 C105,71 110,70 120,75Z',
  },
  rise: {
    main: 'M130,30 C180,25 230,65 235,125 C240,185 195,230 140,235 C85,240 30,200 25,140 C20,80 75,35 130,30Z',
    accent: 'M150,60 C185,55 210,90 205,130 C200,170 170,195 135,190 C100,185 80,155 85,120 C90,85 115,65 150,60Z',
    highlight: 'M135,55 C160,48 180,68 175,90 C170,112 150,125 130,120 C110,115 100,95 108,76 C116,57 125,53 135,55Z',
  },
  rest: {
    main: 'M135,40 C180,32 225,72 228,130 C231,188 190,228 135,232 C80,236 28,196 25,138 C22,80 85,48 135,40Z',
    accent: 'M155,75 C188,68 212,98 208,135 C204,172 176,196 142,192 C108,188 88,160 92,126 C96,92 122,82 155,75Z',
    highlight: 'M128,68 C152,62 172,80 168,102 C164,124 144,138 124,132 C104,126 92,108 100,88 C108,68 118,65 128,68Z',
  },
  spin: {
    main: 'M145,38 C195,28 240,70 238,132 C236,194 188,235 132,232 C76,229 25,186 28,128 C31,70 95,48 145,38Z',
    accent: 'M162,72 C192,64 218,96 214,132 C210,168 182,194 148,190 C114,186 90,158 94,124 C98,90 132,80 162,72Z',
    highlight: 'M140,62 C162,55 182,72 178,94 C174,116 154,130 136,124 C118,118 106,100 114,80 C122,60 132,58 140,62Z',
  },
  fold: {
    main: 'M138,42 C186,30 232,68 234,128 C236,188 192,232 138,234 C84,236 32,195 30,135 C28,75 90,54 138,42Z',
    accent: 'M158,78 C190,70 216,100 212,138 C208,176 180,200 146,196 C112,192 90,162 94,128 C98,94 126,86 158,78Z',
    highlight: 'M132,70 C156,62 176,80 172,102 C168,124 148,138 128,132 C108,126 96,108 104,88 C112,68 120,66 132,70Z',
  },
};

/* ═══ MORPH ANIMATIONS — smooth organic breathing ═══ */
const MORPH_ANIM: Record<DoughVariant, object> = {
  stretch: { scaleX: [1, 1.08, 0.96, 1.04, 1], scaleY: [1, 0.94, 1.04, 0.97, 1] },
  rise:    { scaleY: [1, 1.06, 0.97, 1.03, 1], scaleX: [1, 0.97, 1.03, 0.99, 1] },
  rest:    { scaleX: [1, 1.02, 0.99, 1.01, 1], scaleY: [1, 0.99, 1.02, 1, 1] },
  spin:    { rotate: [0, 4, -3, 2, 0], scale: [1, 1.02, 0.99, 1.01, 1] },
  fold:    { scaleX: [1, 0.95, 1.05, 0.98, 1], rotate: [0, -2, 3, -1, 0] },
};

/* Map energy (0–100) to animation parameters */
function energyToParams(energy: number) {
  const e = Math.max(0, Math.min(100, energy)) / 100;
  return {
    // Animation cycle: slower when low energy, faster when high
    morphDuration: 9 - e * 5,   // 9s → 4s
    accentDuration: 7 - e * 3,  // 7s → 4s
    glowDuration: 8 - e * 4,    // 8s → 4s
    // Glow intensity
    glowOpacityRange: [0.04 + e * 0.04, 0.07 + e * 0.08] as [number, number],
    // Glow scale pulse
    glowScaleRange: [1, 1.04 + e * 0.08] as [number, number],
    // Accent layer scale amplitude
    accentScaleRange: [1, 1.01 + e * 0.04, 0.99 - e * 0.02, 1] as number[],
  };
}

export function DoughBlob({
  variant = 'stretch',
  size = 200,
  className = '',
  animate: shouldAnimate = true,
  energy = 50,
}: DoughBlobProps) {
  const uid = useId().replace(/:/g, '');
  const paths = BLOB_PATHS[variant];
  const params = energyToParams(energy);

  /* Spring-smoothed energy for glow scale — reacts with slight delay */
  const energyMV = useMotionValue(energy);
  const energySmooth = useSpring(energyMV, { stiffness: 80, damping: 20 });
  const glowScale = useTransform(energySmooth, [0, 100], [0.95, 1.12]);
  const glowOpacity = useTransform(energySmooth, [0, 100], [0.04, 0.12]);

  useEffect(() => { energyMV.set(energy); }, [energy, energyMV]);

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      {/* Ambient glow — energy-reactive */}
      {shouldAnimate && (
        <motion.div
          style={{
            position: 'absolute',
            inset: '-25%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
            opacity: glowOpacity,
            scale: glowScale,
            filter: 'blur(30px)',
          }}
          animate={{
            scale: params.glowScaleRange,
            opacity: params.glowOpacityRange,
          }}
          transition={{ duration: params.glowDuration, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <motion.svg
        viewBox="0 0 260 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        style={{ overflow: 'visible', position: 'relative' }}
        {...(shouldAnimate ? {
          animate: MORPH_ANIM[variant],
          transition: { duration: params.morphDuration, repeat: Infinity, ease: 'easeInOut' as const },
        } : {})}
      >
        <defs>
          <linearGradient id={`dyn-main-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id={`dyn-acc-${uid}`} x1="0.3" y1="0.1" x2="0.7" y2="0.9">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.10" />
          </linearGradient>
          <radialGradient id={`dyn-hi-${uid}`} cx="0.4" cy="0.35" r="0.5">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`dyn-str-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Layer 1: Main blob */}
        <motion.path
          d={paths.main}
          fill={`url(#dyn-main-${uid})`}
          stroke={`url(#dyn-str-${uid})`}
          strokeWidth={1.2}
          {...(shouldAnimate ? {
            animate: { d: paths.main },
            transition: { duration: params.morphDuration * 0.6, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' },
          } : {})}
        />

        {/* Layer 2: Accent shape — energy-driven scale */}
        <motion.path
          d={paths.accent}
          fill={`url(#dyn-acc-${uid})`}
          {...(shouldAnimate ? {
            animate: { scale: params.accentScaleRange },
            transition: { duration: params.accentDuration, repeat: Infinity, ease: 'easeInOut' },
          } : {})}
          style={{ transformOrigin: '50% 50%' }}
        />

        {/* Layer 3: Inner highlight */}
        <path d={paths.highlight} fill={`url(#dyn-hi-${uid})`} />

        {/* Edge detail */}
        <path
          d={paths.accent}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={0.6}
          strokeOpacity={0.1}
          strokeDasharray="8 12"
        />
      </motion.svg>
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