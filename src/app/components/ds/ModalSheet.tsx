/**
 * ds/ModalSheet — T4 modale responsive token-driven, context-free.
 *
 * Guscio unico per i modali dell'app: sheet dal bordo inferiore su mobile,
 * card centrata da `sm` in su. Scrim, superficie, animazione e layering
 * consumano SOLO token (`--z-modal`, `--backdrop-glass-*`, `--sheet-glass-bg`,
 * `--dialog-*`, `--container-*`). Chiude su click-scrim e su Escape.
 * Monta in portal su document.body: i call site non devono portalare.
 *
 * Varianti ortogonali:
 *  - `scrim`    glass (blur forte) · soft (blur leggero) · plain (solo tinta)
 *  - `surface`  glass · glass-dense (picker) · solid
 *  - `entry`    slide (sheet dal basso) · pop (fade+scale centrato)
 *  - `size`     sm 440px · md 640px · lg 672px · xl 1160px
 *  - `height`   auto (cap max-h) · full (workspace ~92dvh)
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  ariaLabel?: string;
  ariaLabelledby?: string;
  size?: "sm" | "md" | "lg" | "xl";
  scrim?: "glass" | "soft" | "plain";
  surface?: "glass" | "glass-dense" | "solid";
  entry?: "slide" | "pop";
  height?: "auto" | "full";
  /** Classi extra sul pannello: padding/overflow del contenuto. */
  panelClassName?: string;
  children: ReactNode;
}

const SIZE_CLASS: Record<NonNullable<ModalSheetProps["size"]>, string> = {
  sm: "sm:max-w-[440px]",
  md: "sm:max-w-[640px]",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-[1160px]",
};

const HEIGHT_CLASS: Record<NonNullable<ModalSheetProps["height"]>, string> = {
  auto: "max-h-[85dvh] sm:max-h-[80vh]",
  full: "h-[92dvh] max-h-[92dvh] sm:h-[min(760px,88vh)] sm:max-h-[88vh]",
};

const SCRIM_STYLE: Record<
  NonNullable<ModalSheetProps["scrim"]>,
  React.CSSProperties
> = {
  glass: {
    background: "var(--dialog-scrim-strong)",
    backdropFilter: "var(--backdrop-glass)",
    WebkitBackdropFilter: "var(--backdrop-glass)",
  },
  soft: {
    background: "var(--dialog-scrim)",
    backdropFilter: "var(--backdrop-glass-soft)",
    WebkitBackdropFilter: "var(--backdrop-glass-soft)",
  },
  plain: { background: "var(--dialog-scrim)" },
};

const SURFACE_STYLE: Record<
  NonNullable<ModalSheetProps["surface"]>,
  React.CSSProperties
> = {
  glass: {
    background: "var(--sheet-glass-bg)",
    color: "var(--text-default)",
    borderColor: "var(--container-border)",
    boxShadow: "var(--dialog-shadow)",
    backdropFilter: "var(--backdrop-glass-strong)",
    WebkitBackdropFilter: "var(--backdrop-glass-strong)",
  },
  "glass-dense": {
    background: "var(--sheet-glass-bg)",
    color: "var(--text-default)",
    borderColor: "var(--container-border)",
    boxShadow:
      "var(--dialog-shadow), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 18%, transparent)",
    backdropFilter: "var(--backdrop-glass-max)",
    WebkitBackdropFilter: "var(--backdrop-glass-max)",
  },
  solid: {
    background: "var(--container-bg)",
    color: "var(--text-default)",
    borderColor: "var(--container-border)",
    boxShadow: "var(--dialog-shadow)",
  },
};

export function ModalSheet({
  open,
  onClose,
  ariaLabel,
  ariaLabelledby,
  size = "md",
  scrim = "glass",
  surface = "glass",
  entry = "slide",
  height = "auto",
  panelClassName,
  children,
}: ModalSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const slide = entry === "slide";
  const containerClass = slide
    ? "fixed inset-0 z-(--z-modal) flex items-end justify-center overscroll-contain sm:items-center sm:px-4 sm:py-5"
    : "fixed inset-0 z-(--z-modal) flex items-end justify-center overscroll-contain px-3 pb-3 sm:items-center sm:p-6";
  const panelShape = slide
    ? "rounded-t-4xl sm:rounded-4xl border-0 sm:border"
    : "rounded-4xl border";

  /* Portal su body: `fixed inset-0` si rompe sotto antenati con transform
   * (es. pannelli motion draggabili), quindi il portal è responsabilità del
   * guscio, non dei call site. */
  const sheet = (
    <AnimatePresence>
      {open && (
        <motion.div
          className={containerClass}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={SCRIM_STYLE[scrim]}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            initial={slide ? { y: "100%" } : { y: 28, opacity: 0, scale: 0.98 }}
            animate={slide ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={slide ? { y: "100%" } : { y: 20, opacity: 0, scale: 0.98 }}
            transition={
              slide
                ? { type: "spring", stiffness: 350, damping: 34 }
                : { type: "spring", stiffness: 420, damping: 34 }
            }
            className={`w-full ${SIZE_CLASS[size]} ${HEIGHT_CLASS[height]} ${panelShape} ${panelClassName ?? ""}`}
            style={SURFACE_STYLE[surface]}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return sheet;
  return createPortal(sheet, document.body);
}
