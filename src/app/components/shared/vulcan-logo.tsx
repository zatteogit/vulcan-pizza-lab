import React, { useId } from "react";
import { motion } from "motion/react";

/**
 * VulcanMark — fetta sottratta, 5 scale ottiche.
 *
 * Il mark nasce da una forma madre triangolare (fetta / vulcano)
 * da cui viene sottratto un taglio verticale-obliquo. La V emerge
 * dal vuoto centrale, non da due aste disegnate separatamente.
 *
 *   INTIMA       72% × 84%  — margini generosi, respira molto
 *   NATURALE     78% × 89%  — un passo in più, default
 *   APERTA       81% × 92%  — presenza decisa
 *   AUDACE       86% × 95%  — riempie bene il quadrato
 *   MONUMENTALE  91% × 98%  — quasi edge-to-edge
 *
 * Ogni step conserva la stessa costruzione madre: residuo sinistro,
 * taglio sottratto e massa destra lunga con terminale morbido.
 */

// ═══ PATH DATA ═════════════════════════════════════════════

/* ── INTIMA: margini comodi (72% × 84%) ── */
const INTIMA =
  "M5.39 2H11.58Q11.67 2 11.67 2.1L11.52 19.31L5.21 2.25Q5.17 2.13 5.26 2.03Q5.31 2 5.39 2Z" +
  "M19.06 2.08C19.07 2.03 19.11 2 19.16 2H27.56C28.68 2 29.27 2.99 28.82 4.02L17.39 27.46C16.48 29.2 14.9 29.31 13.82 28.55C12.92 27.92 12.93 27.05 13.24 25.7L19.06 2.08Z";

/* ── NATURALE: leggermente più (78% × 89%) ── */
const NATURALE =
  "M4.8 1.5H11.31Q11.41 1.5 11.41 1.6L11.25 19.71L4.61 1.77Q4.56 1.64 4.66 1.54Q4.72 1.5 4.8 1.5Z" +
  "M19.18 1.58C19.19 1.53 19.23 1.5 19.29 1.5H28.12C29.3 1.5 29.92 2.54 29.44 3.62L17.42 28.28C16.46 30.11 14.8 30.23 13.67 29.43C12.72 28.77 12.73 27.85 13.06 26.43L19.18 1.58Z";

/* ── APERTA: presenza decisa (81% × 92%) ── */
const APERTA =
  "M4.2 1H10.94Q11.05 1 11.05 1.11L10.88 19.85L4.01 1.28Q3.96 1.14 4.06 1.04Q4.12 1 4.2 1Z" +
  "M19.09 1.09C19.1 1.04 19.15 1 19.2 1H28.35C29.57 1 30.21 2.08 29.72 3.2L17.27 28.72C16.28 30.62 14.56 30.74 13.39 29.91C12.41 29.23 12.42 28.27 12.76 26.81L19.09 1.09Z";

/* ── AUDACE: riempie bene (86% × 95%) ── */
const AUDACE =
  "M3.61 0.5H10.58Q10.69 0.5 10.69 0.61L10.51 20L3.41 0.78Q3.36 0.65 3.46 0.54Q3.52 0.5 3.61 0.5Z" +
  "M19 0.59C19.02 0.54 19.06 0.5 19.12 0.5H28.58C29.84 0.5 30.5 1.61 29.99 2.77L17.12 29.16C16.09 31.12 14.32 31.25 13.1 30.39C12.09 29.69 12.1 28.7 12.46 27.19L19 0.59Z";

/* ── MONUMENTALE: edge-to-edge (91% × 98%) ── */
const MONUMENTALE =
  "M3.02 0H10.17Q10.28 0 10.28 0.11L10.1 20.01L2.81 0.29Q2.76 0.15 2.87 0.04Q2.93 0 3.02 0Z" +
  "M18.81 0.09C18.83 0.04 18.88 0 18.93 0H28.64C29.94 0 30.61 1.14 30.09 2.33L16.88 29.42C15.83 31.43 14.01 31.56 12.76 30.68C11.72 29.96 11.73 28.94 12.09 27.39L18.81 0.09Z";

// ── Variant registry ──────────────────────────────────────

type Variant = "intima" | "naturale" | "aperta" | "audace" | "monumentale";

export const VULCAN_MARK_PATHS: Record<Variant, string> = {
  intima: INTIMA,
  naturale: NATURALE,
  aperta: APERTA,
  audace: AUDACE,
  monumentale: MONUMENTALE,
};

const VARIANTS: Record<Variant, { d: string; fillRule: "nonzero" | "evenodd" }> = {
  intima:       { d: VULCAN_MARK_PATHS.intima,       fillRule: "nonzero" },
  naturale:     { d: VULCAN_MARK_PATHS.naturale,     fillRule: "nonzero" },
  aperta:       { d: VULCAN_MARK_PATHS.aperta,       fillRule: "nonzero" },
  audace:       { d: VULCAN_MARK_PATHS.audace,       fillRule: "nonzero" },
  monumentale:  { d: VULCAN_MARK_PATHS.monumentale,  fillRule: "nonzero" },
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
          <linearGradient id={gradId} x1="0.12" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="var(--logo-grad-start)" />
            <stop offset="48%" stopColor="var(--logo-grad-mid)" />
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
      className={["vulcan-logo__glow-box", className].filter(Boolean).join(" ")}
      style={{ ["--vulcan-logo-size" as any]: `${size}px`, ...style }}
    >
      <motion.div
        className="vulcan-logo__glow-ring"
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
      <div className="vulcan-logo__stage">{svg}</div>
    </div>
  );
}
