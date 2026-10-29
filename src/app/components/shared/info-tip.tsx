
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, BookOpen, ArrowRight } from "lucide-react";
import { Link, useInRouterContext } from "react-router";
import { createPortal } from "react-dom";
import { useCms } from "../../features/cms/cms-context";
import { getTermById } from "../../data/glossary-data";
import { uiMessage } from "../../i18n/ui-messages";
import { motionSpring } from "../ds/motion";
import { useEscapeLayer } from "../ds/escape-stack";

interface InfoTipProps {
  /** Testo specifico del campo; facoltativo con `termId` (basta la definizione). */
  children?: React.ReactNode;
  /** Size of the ? button */
  size?: number;
  /** Optional glossary term ID to unify explanation + glossary definition */
  termId?: string;
  /** FW-03 (S06-A-22): what the «?» explains, for its accessible name when
   * there is no glossary term (e.g. the label of the field next to it). */
  label?: string;
  /** FW-04: il trigger è il termine stesso (TermLink), non un «?». */
  triggerLabel?: React.ReactNode;
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
export function InfoTip({ children, size = 15, termId, label, triggerLabel }: InfoTipProps) {
  const { cms } = useCms();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"above" | "below">(
    "below",
  );
  /* FW-04: il TermLink sta dentro testi e card con overflow nascosto; il suo
     popover va nel body, in posizione fissa calcolata dal trigger e tenuta
     dentro lo schermo (16 px di margine). */
  const [anchor, setAnchor] = useState<Record<string, string>>({});

  const term = termId ? getTermById(termId, cms) : null;
  /* FW-04: con il termine come trigger il nome accessibile è il testo
     visibile (WCAG 2.5.3); aria-expanded dice che apre la definizione. */
  const accessibleName = triggerLabel ? undefined : term
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
        const above = spaceBelow < 250;
        setPlacement(above ? "above" : "below");
        if (triggerLabel) {
          const width = Math.min(300, Math.max(240, window.innerWidth * 0.65), window.innerWidth - 32);
          const left = Math.max(16, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 16));
          setAnchor(above
            ? { "--tip-left": `${left}px`, "--tip-bottom": `${window.innerHeight - rect.top + 8}px` }
            : { "--tip-left": `${left}px`, "--tip-top": `${rect.bottom + 8}px` });
        }
      }
      setOpen((o) => !o);
    },
    [open, triggerLabel],
  );

  /* FW-04: il popover fisso non segue lo scorrimento, quindi si chiude. */
  useEffect(() => {
    if (!open || !triggerLabel) return;
    const close = (event: Event) => {
      if (popoverRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, triggerLabel]);

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

  // FW-12: Esc closes only the popover (escape stack), not the sheet below.
  useEscapeLayer(open, () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  });

  return (
    <span className="info-tip">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`info-tip__trigger${triggerLabel ? " info-tip__trigger--term" : ""}${open ? " info-tip__trigger--active" : ""}`}
        style={triggerLabel ? undefined : { ["--tip-size" as any]: `${size + 6}px` }}
        aria-label={accessibleName}
        aria-expanded={open}
        onKeyDown={(event) => {
          /* FW-04: con il popover nel body, Tab dal termine entra nel popover. */
          if (!triggerLabel || !open || event.key !== "Tab" || event.shiftKey) return;
          const link = popoverRef.current?.querySelector<HTMLElement>("a, button");
          if (link) { event.preventDefault(); link.focus(); }
        }}
      >
        {triggerLabel ?? <HelpCircle size={size} />}
      </button>

      {(() => {
      const popover = <AnimatePresence>
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
            }${triggerLabel ? " info-tip__popover--fixed" : ""}`}
            style={triggerLabel ? anchor : undefined}
          >
            <div className="info-tip__panel">
              <div className="info-tip__content">
                {children && <div data-slot="body">{children}</div>}

                {term && termId && (
                  <div className="info-tip__term">
                    <div className="info-tip__term-head">
                      <BookOpen size={11} />
                      <span data-slot="term-name">
                        {termTitle(term.name, term.symbol)}
                      </span>
                    </div>
                    <p className="info-tip__definition">
                      {term.plainDefinition ?? term.definition}
                    </p>
                    <GlossaryLink termId={termId} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>;
      return triggerLabel && typeof document !== "undefined" ? createPortal(popover, document.body) : popover;
      })()}
    </span>
  );
}
