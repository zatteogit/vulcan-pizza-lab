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
          className={["ds-dialog-scrim", inline && "ds-dialog-scrim--inline"].filter(Boolean).join(" ")}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={["ds-dialog", className].filter(Boolean).join(" ")}
            style={style}
          >
            {title && <div className="ds-dialog__title">{title}</div>}
            {children && <div className="ds-dialog__body">{children}</div>}
            {actions && <div className="ds-dialog__actions">{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
