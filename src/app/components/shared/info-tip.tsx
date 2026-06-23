import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, BookOpen } from "lucide-react";
import { useCms } from "../../features/cms/cms-context";
import { getTermById } from "../../data/glossary-data";

interface InfoTipProps {
  children: React.ReactNode;
  /** Size of the ? button */
  size?: number;
  /** Optional glossary term ID to unify explanation + glossary definition */
  termId?: string;
}

/**
 * M3 Rich Tooltip — floating popover that overlays content
 * without layout shift. Uses HelpCircle for universal affordance.
 * Positions above or below depending on viewport space.
 */
export function InfoTip({ children, size = 15, termId }: InfoTipProps) {
  const { cms } = useCms();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"above" | "below">(
    "below",
  );

  const term = termId ? getTermById(termId, cms) : null;

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPlacement(spaceBelow < 250 ? "above" : "below");
      }
      setOpen((o) => !o);
    },
    [open],
  );

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () =>
      document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-center rounded-full transition-all flex-shrink-0"
        style={{
          width: size + 6,
          height: size + 6,
          background: open
            ? "var(--popover-trigger-bg)"
            : "transparent",
          color: open
            ? "var(--popover-trigger-active)"
            : "var(--popover-trigger-idle)",
          cursor: "pointer",
          opacity: open ? 1 : 0.55,
          border: "none",
          padding: 0,
        }}
        aria-label={cms.misc.moreInfo}
        aria-expanded={open}
      >
        <HelpCircle size={size} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            initial={{
              opacity: 0,
              scale: 0.92,
              y: placement === "below" ? -4 : 4,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: placement === "below" ? -4 : 4,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="absolute z-50"
            style={{
              [placement === "below" ? "top" : "bottom"]:
                "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "clamp(240px, 65vw, 300px)",
              pointerEvents: "auto",
            }}
          >
            <div
              className="rounded-2xl px-4 py-3.5"
              style={{
                background: "var(--popover-surface)",
                border: "1px solid var(--popover-border-color)",
                boxShadow: "var(--popover-shadow)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-md)",
                  lineHeight: "1.4",
                  color: "var(--popover-text)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div>{children}</div>

                {term && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--popover-border-color)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5"
                      style={{
                        color: "var(--primary)",
                        fontWeight: "var(--weight-semibold)" as any,
                        fontSize: "var(--font-size-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <BookOpen size={11} />
                      <span>
                        {term.name} {term.symbol ? `(${term.symbol})` : ""}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--font-size-sm)",
                        color: "var(--text-muted)",
                        lineHeight: "1.4",
                      }}
                    >
                      {term.definition}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}