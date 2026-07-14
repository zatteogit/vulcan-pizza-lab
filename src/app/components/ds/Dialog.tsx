/**
 * ds/Dialog — T4 modale token-driven, context-free.
 *
 * Scrim 32% + container radius 28 con entrata spring dal centro. Controllato
 * via `open`. `inline` rende l'overlay `absolute` nel parent (per preview/embed)
 * invece di `fixed`. Estratto da DialogSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { motionSpring } from "./motion";
import { useDialogFocus } from "./use-dialog-focus";

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  ariaLabel?: string;
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
  ariaLabel,
  title,
  children,
  actions,
  inline = false,
  className,
  style,
}: DialogProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>({
    open,
    onClose,
    lockScroll: !inline,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={onClose}
          className={["ds-dialog-scrim", inline && "ds-dialog-scrim--inline"].filter(Boolean).join(" ")}
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={motionSpring.balanced}
            onPointerDown={(event) => event.stopPropagation()}
            className={["ds-dialog", className].filter(Boolean).join(" ")}
            style={style}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
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
