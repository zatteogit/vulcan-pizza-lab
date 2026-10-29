
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  createContext,
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
import {
  FOCUSABLE_SELECTOR,
  fixedFrameFor,
  fixedPopoverAnchor,
  nextInOrder,
  popoverHost,
} from "./info-tip-layer";

/** FW-04: chiamato prima di aprire la voce del glossario da un livello che
 * resterebbe sopra la pagina (la vista di cottura lo chiude). */
export const GlossaryNavigationContext = createContext<(() => void) | null>(null);

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
  const beforeNavigate = useContext(GlossaryNavigationContext);
  const onClick = beforeNavigate ? () => beforeNavigate() : undefined;
  const href = `/learn/glossary#${termId}`;
  const content = <>
    {uiMessage("ds.disclosure.openGlossary")}
    <ArrowRight size={12} aria-hidden="true" />
  </>;
  return inRouter
    ? <Link to={href} className="info-tip__glossary-link" onClick={onClick}>{content}</Link>
    : <a href={href} className="info-tip__glossary-link" onClick={onClick}>{content}</a>;
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
     popover esce in posizione fissa calcolata dal trigger e tenuta dentro lo
     schermo (16 px di margine). Va nel dialog modale che contiene il termine
     (sopra di esso e dentro il suo Tab), altrimenti nel body. */
  const [anchor, setAnchor] = useState<Record<string, string>>({});
  const [host, setHost] = useState<HTMLElement | null>(null);

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
        setPlacement(spaceBelow < 250 ? "above" : "below");
        if (triggerLabel) {
          const target = popoverHost(triggerRef.current);
          const fixed = fixedPopoverAnchor(
            rect,
            { width: window.innerWidth, height: window.innerHeight },
            fixedFrameFor(target),
          );
          setHost(target);
          setAnchor(fixed.vars);
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

  /* FW-04: Tab avanti dall'ultima voce del popover torna al testo, al
     controllo dopo il termine; Maiusc+Tab dalla prima torna al termine. */
  const onPopoverKeyDown = (event: React.KeyboardEvent) => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    if (event.key !== "Tab" || !popover || !trigger) return;
    const items = [...popover.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
    const active = document.activeElement;
    if (event.shiftKey && active === items[0]) {
      event.preventDefault();
      trigger.focus({ preventScroll: true });
    } else if (!event.shiftKey && active === items[items.length - 1]) {
      const scope = popoverHost(trigger);
      const order = [...scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
        .filter((el) => el.getClientRects().length > 0);
      const next = nextInOrder(order, trigger, (el) => popover.contains(el));
      event.preventDefault();
      setOpen(false);
      (next ?? trigger).focus({ preventScroll: true });
    }
  };

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
            onKeyDown={triggerLabel ? onPopoverKeyDown : undefined}
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
      return triggerLabel && typeof document !== "undefined" ? createPortal(popover, host ?? document.body) : popover;
      })()}
    </span>
  );
}
