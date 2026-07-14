/**
 * ds/BottomSheet — T4 drawer dal basso token-driven, context-free.
 *
 * Scrim + pannello con handle di trascinamento, slide-up spring. Controllato
 * via `open`. `inline` rende l'overlay `absolute` nel parent (per preview).
 * Estratto da BottomSheetSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { motionSpring } from "./motion";
import { useDialogFocus } from "./use-dialog-focus";

export interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  ariaLabel?: string;
  title?: ReactNode;
  children?: ReactNode;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function BottomSheet({
  open,
  onClose,
  ariaLabel,
  title,
  children,
  inline = false,
  className,
  style,
}: BottomSheetProps) {
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
          className={`ds-sheet-scrim${inline ? " ds-sheet-scrim--inline" : ""}`}
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={motionSpring.sheetContent}
            onPointerDown={(event) => event.stopPropagation()}
            className={`ds-sheet${inline ? " ds-sheet--inline" : ""}${className ? ` ${className}` : ""}`}
            style={style}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
          >
            <div className="ds-sheet__handle" />
            {title && <div className="ds-sheet__title">{title}</div>}
            {children && <div className="ds-sheet__body">{children}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
