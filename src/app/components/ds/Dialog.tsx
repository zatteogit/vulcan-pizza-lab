/**
 * ds/Dialog — T4 modale token-driven, context-free.
 *
 * Scrim 32% + container radius 28 con entrata spring dal centro. Controllato
 * via `open`. `inline` rende l'overlay `absolute` nel parent (per preview/embed)
 * invece di `fixed`. Estratto da DialogSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Overlay `absolute` nel parent posizionato invece di `fixed` sul viewport. */
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  inline = false,
  className,
  style,
}: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: inline ? "absolute" : "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.32)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={className}
            style={{
              background: "var(--container-card)",
              borderRadius: 28,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              ...style,
            }}
          >
            {title && (
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
                  color: "var(--text-default)",
                  marginBottom: 8,
                }}
              >
                {title}
              </div>
            )}
            {children && (
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--font-size-lg)",
                  color: "var(--text-muted)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                {children}
              </div>
            )}
            {actions && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                {actions}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
