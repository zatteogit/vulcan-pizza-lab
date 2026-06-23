import React from "react";
import { motion } from "motion/react";
import { VulcanMark } from "./vulcan-logo";
import { DoughBlob } from "../../features/cooking/dough-mascot";
import type { DoughVariant } from "../../features/cooking/dough-mascot";
import type { VulcanVariant } from "./vulcan-logo";

/**
 * VulcanHero — composizione armonizzata logo + blob.
 *
 * Il DoughBlob (variante `forge`) diventa il campo energetico
 * organico attorno al VulcanMark geometrico. Il box rigido
 * scompare: il mark galleggia direttamente nel blob come
 * la sua "cristallizzazione" — energia grezza → forma pura.
 *
 * Proporzioni interne:
 *   blob = size (100%)
 *   mark = size × markRatio (default 32%)
 *
 * Il gradiente ember è condiviso tra mark e blob layers,
 * creando continuità cromatica.
 */

interface VulcanHeroProps {
  /** Overall container size */
  size?: number;
  /** Blob energy 0–100 */
  energy?: number;
  /** Blob variant — default forge (harmonized) */
  blobVariant?: DoughVariant;
  /** Logo variant (optical size) */
  logoVariant?: VulcanVariant;
  /** Ratio of mark size to container size */
  markRatio?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function VulcanHero({
  size = 160,
  energy = 35,
  blobVariant = "forge",
  logoVariant = "naturale",
  markRatio = 0.32,
  className,
  style,
}: VulcanHeroProps) {
  const markSize = Math.round(size * markRatio);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* Blob: organic energy field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <DoughBlob
          variant={blobVariant}
          size={size}
          energy={energy}
        />
      </div>

      {/* Mark: crystallized form floating in the blob */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform",
          /* Subtle breathing sync'd with blob energy */
        }}
        animate={{
          scale: [1, 1.015, 0.99, 1.01, 1],
        }}
        transition={{
          scale: {
            duration: 8 - (energy / 100) * 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <VulcanMark
          size={markSize}
          variant={logoVariant}
          gradient
          glow
          decorative
        />
      </motion.div>
    </div>
  );
}