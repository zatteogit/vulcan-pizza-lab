import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle } from "lucide-react";

interface InfoTipProps {
  children: React.ReactNode;
  /** Size of the ? button */
  size?: number;
}

/**
 * M3 Rich Tooltip — floating popover that overlays content
 * without layout shift. Uses HelpCircle for universal affordance.
 * Positions above or below depending on viewport space.
 */
export function InfoTip({ children, size = 15 }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"above" | "below">(
    "below",
  );

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPlacement(spaceBelow < 200 ? "above" : "below");
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
        onClick={toggle}
        className="inline-flex items-center justify-center rounded-full transition-all flex-shrink-0"
        style={{
          width: size + 6,
          height: size + 6,
          background: open
            ? "var(--popover-trigger-bg)"
            : "rgba(0,0,0,0)",
          color: open
            ? "var(--popover-trigger-active)"
            : "var(--popover-trigger-idle)",
          cursor: "pointer",
          opacity: open ? 1 : 0.55,
        }}
        aria-label="Più informazioni"
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
              width: "clamp(220px, 60vw, 280px)",
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
                  fontSize: "var(--font-size-lg)",
                  lineHeight: "var(--leading-loose)",
                  color: "var(--popover-text)",
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}