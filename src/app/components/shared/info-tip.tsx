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
import { motionSpring } from "../ds/motion";

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
    <span className="info-tip">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`info-tip__trigger${open ? " info-tip__trigger--active" : ""}`}
        style={{ ["--tip-size" as any]: `${size + 6}px` }}
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
            transition={motionSpring.crispControl}
            className={`info-tip__popover ${
              placement === "below"
                ? "info-tip__popover--below"
                : "info-tip__popover--above"
            }`}
          >
            <div className="info-tip__panel">
              <div className="info-tip__content">
                <div data-slot="body">{children}</div>

                {term && (
                  <div className="info-tip__term">
                    <div className="info-tip__term-head">
                      <BookOpen size={11} />
                      <span data-slot="term-name">
                        {term.name} {term.symbol ? `(${term.symbol})` : ""}
                      </span>
                    </div>
                    <p className="info-tip__definition">
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
