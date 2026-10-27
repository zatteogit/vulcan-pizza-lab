import { useDecorativeMotion } from "../../context/visual-quality-context";
import { motion } from "motion/react";
import { VulcanMark } from "./vulcan-logo";
import { DoughBlob } from "../../features/cooking/dough-mascot";
import type { DoughVariant } from "../../features/cooking/dough-mascot";
import type { VulcanVariant } from "./vulcan-logo";
import { motionDuration,motionEase } from "../ds/motion";

/** U-10 (F25): il respiro della home si ferma dopo pochi cicli (oltre 5 s
 *  un movimento automatico distrae e va fermato). */
const HERO_LOOPS = 3;

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
  loops?: number;
}

export function VulcanHero({
  size = 160,
  energy = 35,
  blobVariant = "forge",
  logoVariant = "naturale",
  markRatio = 0.32,
  className,
  loops = HERO_LOOPS,
}: VulcanHeroProps) {
  const reducedMotion = !useDecorativeMotion();
  const markSize = Math.round(size * markRatio);

  return (
    <div
      className={["vulcan-hero", className].filter(Boolean).join(" ")}
      style={{ ["--hero-size" as any]: `${size}px` }}
    >
      {/* Blob: organic energy field */}
      <div className="vulcan-hero__field">
        <DoughBlob
          variant={blobVariant}
          size={size}
          energy={energy}
          loops={loops}
        />
      </div>

      {/* Mark: crystallized form floating in the blob */}
      <motion.div
        className="vulcan-hero__mark"
        animate={{
          scale: reducedMotion ? 1 : [1, 1.015, 0.99, 1.01, 1],
        }}
        transition={{
          scale: {
            duration: motionDuration.ambientLong - (energy / 100) * motionDuration.ambientRange,
            repeat: reducedMotion ? 0 : loops,
            ease: motionEase.standard,
          },
        }}
      >
        <VulcanMark
          size={markSize}
          variant={logoVariant}
          glow
          decorative
        />
      </motion.div>
    </div>
  );
}
