
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, BookOpen, ArrowRight } from "lucide-react";
import { Link, useInRouterContext } from "react-router";
import { useCms } from "../../features/cms/cms-context";
import { getTermById } from "../../data/glossary-data";
import { uiMessage } from "../../i18n/ui-messages";
import { motionSpring } from "../ds/motion";

interface InfoTipProps {
  children: React.ReactNode;
  /** Size of the ? button */
  size?: number;
  /** Optional glossary term ID to unify explanation + glossary definition */
  termId?: string;
  /** FW-03 (S06-A-22): what the «?» explains, for its accessible name when
   * there is no glossary term (e.g. the label of the field next to it). */
  label?: string;
}

/** «Idratazione (H%)» already carries its symbol: never print it twice. */
function termTitle(name: string, symbol?: string): string {
  if (!symbol || name.includes(symbol)) return name;
  return `${name} (${symbol})`;
}

/** Link to the full glossary entry; a plain anchor outside a router (DS sync). */
function GlossaryLink({ termId }: { termId: string }) {
  const inRouter = useInRouterContext();
  const href = `/learn/glossary#${termId}`;
  const content = <>
    {uiMessage("ds.disclosure.openGlossary")}
    <ArrowRight size={12} aria-hidden="true" />
  </>;
  return inRouter
    ? <Link to={href} className="info-tip__glossary-link">{content}</Link>
    : <a href={href} className="info-tip__glossary-link">{content}</a>;
}

/**
 * InfoTip v2 (FW-03) — short definition of a term, M3 rich tooltip.
 * - Accessible name «Definizione: <termine>» (or «Più informazioni: <label>»),
 *   never the same «Più informazioni» for every «?».
 * - With `termId`: short definition + «Apri nel glossario» (formula, unit,
 *   ranges and sources live in the glossary entry, level 3).
 * - Escape closes only the popover, not the dialog or sheet around it.
 * Positions above or below depending on viewport space.
 */
export function InfoTip({ children, size = 15, termId, label }: InfoTipProps) {
  const { cms } = useCms();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"above" | "below">(
    "below",
  );

  const term = termId ? getTermById(termId, cms) : null;
  const accessibleName = term
    ? uiMessage("ds.disclosure.definitionOf", [term.name])
    : label
      ? uiMessage("ds.disclosure.moreInfoAbout", [label])
      : cms.misc.moreInfo;

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

  // Escape closes only the popover: capture on window runs before the
  // dialog/sheet listener on document, and stops it from also closing.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", handler, true);
    return () =>
      window.removeEventListener("keydown", handler, true);
  }, [open]);

  return (
    <span className="info-tip">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`info-tip__trigger${open ? " info-tip__trigger--active" : ""}`}
        style={{ ["--tip-size" as any]: `${size + 6}px` }}
        aria-label={accessibleName}
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

                {term && termId && (
                  <div className="info-tip__term">
                    <div className="info-tip__term-head">
                      <BookOpen size={11} />
                      <span data-slot="term-name">
                        {termTitle(term.name, term.symbol)}
                      </span>
                    </div>
                    <p className="info-tip__definition">
                      {term.definition}
                    </p>
                    <GlossaryLink termId={termId} />
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
