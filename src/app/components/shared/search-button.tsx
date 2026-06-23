/**
 * SearchButton — bottone circolare "apri ricerca" condiviso dai dock.
 *
 * Standardizza icona (proporzionale al diametro), strokeWidth, aria-label
 * (CMS + ⌘K) e micro-interazione, così il bottone di ricerca è coerente su
 * tutte le superfici. Dimensione e superficie restano prop (il dock mobile, la
 * rail desktop e la navbar ricette hanno diametri/sfondi legittimamente diversi).
 *
 * Pattern (T5), non T4: dipende dal CMS, quindi vive fuori da `ds/` (context-free).
 */
import { Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useCms } from "../../features/cms/cms-context";

const SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;

export function SearchButton({
  diameter,
  surfaceStyle,
  className,
  onOpen,
  iconSize,
}: {
  /** Diametro del bottone in px (la superficie del dock decide la dimensione). */
  diameter: number;
  /** Stile della superficie (glass/dock) — include sfondo, bordo, ombra, radius. */
  surfaceStyle?: CSSProperties;
  className?: string;
  onOpen?: () => void;
  /** Custom icon size override. If not specified, calculates proportional size. */
  iconSize?: number;
}) {
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  /* Icona proporzionale → coerente a ogni diametro (prima 20/22/24 era invertita). */
  const finalIconSize = iconSize ?? Math.round(diameter * 0.38);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen?.()}
      className={`flex items-center justify-center shrink-0${className ? ` ${className}` : ""}`}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
      transition={SPRING}
      style={{
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        /* La superficie (tinta glass) arriva dal call-site; geometria e colore
           icona li possiede il componente → coerenti ovunque (è un oggetto). */
        ...surfaceStyle,
        width: diameter,
        height: diameter,
        borderRadius: "var(--radius-full)",
        color: "var(--icon-muted)",
      }}
      aria-label={`${cms.pages.navSearch} (⌘K)`}
      title="⌘K"
    >
      <Search size={finalIconSize} strokeWidth={2} />
    </motion.button>
  );
}
