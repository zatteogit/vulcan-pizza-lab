/* ═══ RECIPE OUTPUT — componenti di supporto (estratti lug 2026) ═══
 * NerdAuraBlock, ScrollToTopOnMount, IngRow, GlossaryWLink. */

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { useCms } from "../cms/cms-context";
import { ModalSheet } from "../../components/ds/index";

export function NerdAuraBlock({
  children,
  className = "",
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`bits-nerd-aura ${className}`}>
      <motion.div
        aria-hidden="true"
        className={`bits-nerd-aura__glow${compact ? " bits-nerd-aura__glow--compact" : ""}`}
        initial={false}
        animate={
          reduceMotion
            ? { opacity: compact ? 0.32 : 0.42 }
            : {
                opacity: compact ? [0.28, 0.52, 0.34] : [0.36, 0.72, 0.46],
                scale: [0.96, 1.04, 0.99],
                x: [0, 7, -5, 0],
                y: [0, -5, 6, 0],
              }
        }
        transition={{
          duration: compact ? 5.8 : 7.2,
          repeat: reduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="bits-nerd-aura__content">{children}</div>
    </div>
  );
}


export function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
    let frameId: number;
    let count = 0;
    const scroll = () => {
      window.scrollTo(0, 0);
      count++;
      if (count < 12) {
        frameId = requestAnimationFrame(scroll);
      }
    };
    frameId = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  return null;
}


export function IngRow({
  name,
  detail,
  amount,
}: {
  name: string;
  detail?: ReactNode;
  amount: ReactNode;
}) {
  return (
    <div className="bits-ing-row">
      <div className="bits-ing-row__label">
        <span className="bits-ing-row__name">{name}</span>
        {detail && (
          <span className="bits-ing-row__detail type-numeric">{detail}</span>
        )}
      </div>
      <span className="bits-ing-row__amount type-numeric">{amount}</span>
    </div>
  );
}

/* La W della farina smette di essere gergo muto (audit lug 2026) — e da
   round 7 (nota Matteo) NON porta più fuori dalla ricetta: apre un pannello
   in-page con la voce di glossario, evidenziando la fascia della W corrente.
   Portal su body: il trigger vive dentro gli span di IngRow. */
export function GlossaryWLink({ w }: { w: number }) {
  const [open, setOpen] = useState(false);
  const { cms } = useCms();
  const term = GLOSSARY_TERMS.find((t) => t.id === "w_alveograph");

  if (!term) return <>W{w}</>;

  const inRange = (value: string) => {
    const match = value.match(/(\d+)\s*–\s*(\d+)/);
    if (!match) return false;
    return w >= Number(match[1]) && w <= Number(match[2]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title={term.name}
        className="bits-glossary-w__trigger"
      >
        W{w}
      </button>
      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel={term.name}
        size="sm"
        panelClassName="bits-glossary-w-modal__panel"
      >
        <div className="bits-glossary-w-modal__header">
          <h3 className="bits-glossary-w-modal__title">{term.name}</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="bits-glossary-w-modal__close"
            aria-label={cms.ui.close}
          >
            <X size={15} />
          </button>
        </div>
        <p className="bits-glossary-w-modal__definition">{term.definition}</p>
        {term.ranges && term.ranges.length > 0 && (
          <div className="bits-glossary-w-modal__ranges">
            {term.ranges.map((range) => {
              const active = inRange(range.value);
              return (
                <div
                  key={range.label}
                  className={`bits-glossary-w-modal__range${active ? " bits-glossary-w-modal__range--active" : ""}`}
                >
                  <span className="bits-glossary-w-modal__range-value type-numeric">
                    {range.value}
                  </span>
                  <span className="bits-glossary-w-modal__range-label">
                    {range.label}
                    {range.note ? ` — ${range.note}` : ""}
                  </span>
                  {active && (
                    <span className="bits-glossary-w-modal__range-current type-numeric">
                      ← W{w}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {term.whyImportant && (
          <p className="bits-glossary-w-modal__why">{term.whyImportant}</p>
        )}
        <Link
          to="/learn/glossary#w_alveograph"
          onClick={() => setOpen(false)}
          className="bits-glossary-w-modal__learn-more"
        >
          {cms.cooking.learnMore} →
        </Link>
      </ModalSheet>
    </>
  );
}
