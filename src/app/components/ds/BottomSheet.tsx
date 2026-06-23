/**
 * ds/BottomSheet — T4 drawer dal basso token-driven, context-free.
 *
 * Scrim + pannello con handle di trascinamento, slide-up spring. Controllato
 * via `open`. `inline` rende l'overlay `absolute` nel parent (per preview).
 * Estratto da BottomSheetSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  inline = false,
  className,
  style,
}: BottomSheetProps) {
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
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className={className}
            style={{
              background: "var(--container-card)",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "12px 24px 24px",
              width: "100%",
              maxWidth: inline ? "100%" : 480,
              boxShadow: "var(--shadow-lg)",
              ...style,
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                background: "var(--outline-variant)",
                margin: "0 auto 16px",
              }}
            />
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
