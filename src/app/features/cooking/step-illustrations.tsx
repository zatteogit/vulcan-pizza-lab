/* ═══ STEP ILLUSTRATIONS — line-art per le fasi (giugno 2026) ═══
 * Illustrazioni SVG disegnate a mano, stile tratto caldo, per dare un volto
 * a ogni fase dell'impasto. Usano i token colore dell'app (si adattano a
 * dark mode). Fondamenta per future foto/video di fase: il componente accetta
 * un id fase e potrà fare fallback su media reali quando disponibili.
 */

import type { CSSProperties } from "react";

const STROKE = "var(--step-illustration-stroke, var(--text-default))";
const ACCENT = "var(--step-illustration-accent, var(--primary))";
const SOFT = "var(--step-illustration-soft, var(--text-muted))";

type StepIllustrationTone = "default" | "accent" | "onAccent" | "muted";

interface Props {
  stepId: string;
  size?: number;
  tone?: StepIllustrationTone;
  className?: string;
  style?: CSSProperties;
}

const TONE_VARS: Record<StepIllustrationTone, CSSProperties> = {
  default: {},
  accent: {
    "--step-illustration-stroke": "var(--text-default)",
    "--step-illustration-accent": "var(--primary)",
    "--step-illustration-soft": "var(--text-muted)",
  } as CSSProperties,
  onAccent: {
    "--step-illustration-stroke": "var(--text-on-accent)",
    "--step-illustration-accent": "var(--text-on-accent)",
    "--step-illustration-soft": "color-mix(in srgb, var(--text-on-accent) 70%, transparent)",
  } as CSSProperties,
  muted: {
    "--step-illustration-stroke": "var(--text-muted)",
    "--step-illustration-accent": "var(--text-muted)",
    "--step-illustration-soft": "color-mix(in srgb, var(--text-muted) 65%, transparent)",
  } as CSSProperties,
};

export function Bowl({ size }: { size: number }) {
  /* Ciotola con impasto e cucchiaio — mix */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <path d="M14 40 h92 a2 2 0 0 1 2 2 c0 22 -18 38 -48 38 s-48 -16 -48 -38 a2 2 0 0 1 2 -2z" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 40 c4 -8 14 -13 30 -13 s26 5 30 13" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <path d="M72 30 L98 6" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="100" cy="5" rx="5" ry="4" stroke={STROKE} strokeWidth="2.5" transform="rotate(40 100 5)" />
      <path d="M46 34 c2 -3 6 -5 10 -4" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Flask({ size }: { size: number }) {
  /* Barattolo di pre-fermento con bollicine */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <rect x="38" y="14" width="44" height="10" rx="3" stroke={STROKE} strokeWidth="3" />
      <path d="M42 24 v50 a8 8 0 0 0 8 8 h20 a8 8 0 0 0 8 -8 V24" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M44 52 h32" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <circle cx="54" cy="62" r="3" stroke={SOFT} strokeWidth="2" />
      <circle cx="66" cy="68" r="2.4" stroke={SOFT} strokeWidth="2" />
      <circle cx="62" cy="58" r="2" stroke={SOFT} strokeWidth="2" />
      <path d="M50 40 c2 2 6 2 8 0 m6 0 c2 2 6 2 8 0" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RisingDough({ size }: { size: number }) {
  /* Contenitore con impasto che cresce + orologio — puntata */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <rect x="16" y="34" width="64" height="46" rx="6" stroke={STROKE} strokeWidth="3" />
      <path d="M20 52 c8 -12 20 -18 28 -18 s20 6 28 18" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 46 c3 -4 7 -6 10 -6" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      <circle cx="96" cy="28" r="16" stroke={STROKE} strokeWidth="3" />
      <path d="M96 20 v8 l6 4" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cutter({ size }: { size: number }) {
  /* Tarocco che divide due panetti — staglio */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <ellipse cx="38" cy="66" rx="20" ry="14" stroke={STROKE} strokeWidth="3" />
      <ellipse cx="84" cy="66" rx="20" ry="14" stroke={STROKE} strokeWidth="3" />
      <path d="M30 60 c3 -3 8 -4 12 -2" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      <rect x="52" y="10" width="18" height="30" rx="3" stroke={ACCENT} strokeWidth="3" />
      <path d="M50 40 h22 l-2 8 h-18 z" stroke={ACCENT} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function ProofBox({ size }: { size: number }) {
  /* Cassetta con panetti gonfi — appretto */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <rect x="12" y="40" width="96" height="40" rx="6" stroke={STROKE} strokeWidth="3" />
      <path d="M22 60 a14 11 0 0 1 28 0" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <path d="M46 60 a14 11 0 0 1 28 0" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 60 a14 11 0 0 1 28 0" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <path d="M28 54 c2 -2 5 -3 7 -2" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 26 c0 -4 4 -4 4 -8 m12 8 c0 -4 4 -4 4 -8 m12 8 c0 -4 4 -4 4 -8" stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Hands({ size }: { size: number }) {
  /* Disco steso con mani — stesura */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="58" rx="38" ry="22" stroke={STROKE} strokeWidth="3" />
      <ellipse cx="60" cy="58" rx="24" ry="13" stroke={SOFT} strokeWidth="2" strokeDasharray="4 5" />
      <path d="M16 30 c6 -2 12 0 16 6 m-20 2 c5 -2 10 -1 14 3" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <path d="M104 30 c-6 -2 -12 0 -16 6 m20 2 c-5 -2 -10 -1 -14 3" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Ladle({ size }: { size: number }) {
  /* Spirale di pomodoro col mestolo — farcitura */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <ellipse cx="56" cy="60" rx="38" ry="22" stroke={STROKE} strokeWidth="3" />
      <path d="M56 60 m-20 0 a20 11 0 1 1 40 0 a14 8 0 1 1 -28 0 a8 4.5 0 1 1 16 0" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M86 36 L106 14" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M80 42 a9 7 0 0 0 14 -6" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M48 18 c2 3 0 5 2 8 m10 -8 c2 3 0 5 2 8" stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Oven({ size }: { size: number }) {
  /* Bocca di forno con fiamma — cottura */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <path d="M14 80 v-28 a46 38 0 0 1 92 0 v28" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 80 v-18 a30 24 0 0 1 60 0 v18" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M60 76 c-8 -6 -10 -12 -4 -18 c1 5 4 6 6 8 c3 -4 2 -8 1 -11 c8 5 11 13 5 19 c-2 2 -5 3 -8 2z" stroke={ACCENT} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M8 84 h104" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Slice({ size }: { size: number }) {
  /* Fetta — assemblaggi/farciture post cottura e default */
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" fill="none" aria-hidden="true">
      <path d="M16 26 L104 50 L36 86 z" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M16 26 c30 -2 62 6 88 24" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="50" r="4" stroke={SOFT} strokeWidth="2.4" />
      <circle cx="62" cy="62" r="4" stroke={SOFT} strokeWidth="2.4" />
      <circle cx="44" cy="68" r="3" stroke={SOFT} strokeWidth="2.4" />
    </svg>
  );
}

const MAP: Record<string, (p: { size: number }) => JSX.Element> = {
  preferment: Flask,
  mix: Bowl,
  bulk: RisingDough,
  divide: Cutter,
  proof: ProofBox,
  shape: Hands,
  top: Ladle,
  top_post: Ladle,
  preheat: Oven,
  bake: Oven,
  bake2: Oven,
  stack: Slice,
  fill_internal: Slice,
  split_fill: Slice,
};

export function StepIllustration({
  stepId,
  size = 110,
  tone = "default",
  className,
  style,
}: Props) {
  const Comp = MAP[stepId] ?? Slice;
  return (
    <span
      className={`inline-flex items-center justify-center ${className ?? ""}`}
      style={{ opacity: 0.9, ...TONE_VARS[tone], ...style }}
      role="img"
      aria-label=""
    >
      <Comp size={size} />
    </span>
  );
}
