import React, { useId } from "react";
import { motion } from "motion/react";

/**
 * VulcanMark — PIENA geometrica, 5 scale ottiche.
 *
 * Stessa geometria (V asimmetrica punta secca + teardrop cubic),
 * scalata dal centro ottico per occupare più o meno viewBox 32×32.
 *
 *   INTIMA       72% × 84%  — margini generosi, respira molto
 *   NATURALE     78% × 89%  — un passo in più, default
 *   APERTA       81% × 92%  — presenza decisa
 *   AUDACE       86% × 95%  — riempie bene il quadrato
 *   MONUMENTALE  91% × 98%  — quasi edge-to-edge
 *
 * Ogni step ≈ +5% di occupazione larghezza.
 * Il vertex gap (2.5-3u) e il rapporto thin:thick (~1:3) restano stabili.
 */

// ═══ PATH DATA ═════════════════════════════════════════════

/* ── INTIMA: margini comodi (72% × 84%) ── */
// Thin 2u · Thick 6u · ratio 1:3 · vertex gap 2.5u
const INTIMA =
  "M6 2H8L13.5 26Z" +
  "M23 2H29L20 26C20 29 16 29 16 26Z";

/* ── NATURALE: leggermente più (78% × 89%) ── */
// Thin 2.5u · Thick 7u · ratio 1:2.8 · vertex gap 2.5u
const NATURALE =
  "M5 1.5H7.5L13 27Z" +
  "M23 1.5H30L20 27C20 30 15.5 30 15.5 27Z";

/* ── APERTA: presenza decisa (81% × 92%) ── */
// Thin 3u · Thick 8u · ratio 1:2.67 · vertex gap 2.5u
const APERTA =
  "M4 1H7L13 27.5Z" +
  "M22 1H30L20 27.5C20 30.5 15.5 30.5 15.5 27.5Z";

/* ── AUDACE: riempie bene (86% × 95%) ── */
// Thin 3.5u · Thick 9u · ratio 1:2.57 · vertex gap 2.5u
const AUDACE =
  "M3 0.5H6.5L12.5 28Z" +
  "M21.5 0.5H30.5L19.5 28C19.5 31 15 31 15 28Z";

/* ── MONUMENTALE: edge-to-edge (91% × 98%) ── */
// Thin 3.5u · Thick 10u · ratio 1:2.86 · vertex gap 3u
const MONUMENTALE =
  "M2 0H5.5L12 28.5Z" +
  "M21 0H31L19.5 28.5C19.5 31.5 15 31.5 15 28.5Z";

// ── Variant registry ──────────────────────────────────────

type Variant = "intima" | "naturale" | "aperta" | "audace" | "monumentale";

const VARIANTS: Record<Variant, { d: string; fillRule: "nonzero" | "evenodd" }> = {
  intima:       { d: INTIMA,       fillRule: "nonzero" },
  naturale:     { d: NATURALE,     fillRule: "nonzero" },
  aperta:       { d: APERTA,       fillRule: "nonzero" },
  audace:       { d: AUDACE,       fillRule: "nonzero" },
  monumentale:  { d: MONUMENTALE,  fillRule: "nonzero" },
};

// ── Component ─────────────────────────────────────────────

interface VulcanMarkProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  decorative?: boolean;
  gradient?: boolean;
  glow?: boolean;
  variant?: Variant;
}

export type { Variant as VulcanVariant };

export function VulcanMark({
  size = 24,
  className,
  style,
  decorative = false,
  gradient = false,
  glow = false,
  variant = "naturale",
}: VulcanMarkProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `vm-${uid}`;
  const resolved = VARIANTS[variant] ?? VARIANTS.naturale;
  const { d, fillRule } = resolved;
  const fill = gradient ? `url(#${gradId})` : "currentColor";

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={!glow ? className : undefined}
      style={!glow ? style : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Vulcan Pizza Lab"}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      {!decorative && <title>Vulcan Pizza Lab</title>}

      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="var(--logo-grad-start)" />
            <stop offset="55%" stopColor="var(--logo-grad-mid)" />
            <stop offset="100%" stopColor="var(--logo-grad-end)" />
          </linearGradient>
        </defs>
      )}

      <path d={d} fill={fill} fillRule={fillRule} />
    </svg>
  );

  if (!glow) return svg;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        ...style,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: "-30%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 35%, var(--logo-glow) 0%, transparent 70%)",
          opacity: 0.14,
          filter: "blur(8px)",
        }}
        initial={{ scale: 1, opacity: 0.12 }}
        animate={{
          scale: 1.12,
          opacity: 0.22,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <div style={{ position: "relative" }}>{svg}</div>
    </div>
  );
}