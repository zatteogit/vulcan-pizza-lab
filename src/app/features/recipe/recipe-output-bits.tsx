/* ═══ RECIPE OUTPUT — componenti di supporto (estratti lug 2026) ═══
 * NerdAuraBlock, ScrollToTopOnMount, IngRow, GlossaryWLink. */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { X } from "lucide-react";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { useCms } from "../cms/cms-context";

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
    <div className={`relative ${className}`} style={{ isolation: "isolate" }}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-4xl"
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
        style={{
          inset: compact ? "-10px" : "-18px",
          zIndex: -1,
          filter: compact ? "blur(14px)" : "blur(22px)",
          background:
            "radial-gradient(ellipse at 18% 18%, color-mix(in srgb, var(--logo-grad-start) 42%, transparent) 0%, transparent 58%), radial-gradient(ellipse at 82% 30%, color-mix(in srgb, var(--logo-grad-mid) 36%, transparent) 0%, transparent 54%), radial-gradient(ellipse at 48% 92%, color-mix(in srgb, var(--logo-grad-end) 34%, transparent) 0%, transparent 62%)",
        }}
      />
      <div className="relative z-[1]">{children}</div>
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
  amount: string;
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-3.5"
      style={{ borderBottom: "1px solid var(--recipe-divider-subtle)" }}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 min-w-0">
        <span
          style={{
            color: "var(--text-default)",
            fontSize: "var(--font-size-xl-5)",
            lineHeight: "var(--leading-normal)",
          }}
        >
          {name}
        </span>
        {detail && (
          <span
            className="type-numeric"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-md)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            {detail}
          </span>
        )}
      </div>
      <span
        className="type-numeric"
        style={{
          color: "var(--text-default)",
          fontSize: "var(--font-size-2xl)",
          fontWeight: "var(--weight-semibold)" as any,
          lineHeight: "var(--leading-tight)",
          flexShrink: 0,
        }}
      >
        {amount}
      </span>
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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
        style={{
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
          color: "inherit",
          cursor: "pointer",
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textUnderlineOffset: 3,
        }}
      >
        W{w}
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[80] flex items-end justify-center overscroll-contain sm:items-center sm:px-4 sm:py-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: "var(--dialog-scrim-strong)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              }}
              onClick={() => setOpen(false)}
            >
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-label={term.name}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 34 }}
                className="w-full max-h-[80dvh] sm:max-w-[440px] rounded-t-4xl sm:rounded-4xl border-0 sm:border overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5"
                style={{
                  background:
                    "color-mix(in srgb, var(--container-page) 94%, transparent)",
                  color: "var(--text-default)",
                  borderColor: "var(--container-border)",
                  boxShadow: "var(--dialog-shadow)",
                  backdropFilter: "blur(24px) saturate(1.6)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <h3
                    className="flex-1 min-w-0"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "var(--font-size-3xl)",
                      fontWeight: "var(--weight-bold)" as any,
                      margin: 0,
                      lineHeight: "var(--leading-compact)",
                    }}
                  >
                    {term.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full active:scale-90 transition-all flex-shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      background: "var(--container-bg-low)",
                      border: "1px solid var(--container-border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    aria-label={cms.ui.close}
                  >
                    <X size={15} />
                  </button>
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-size-md)",
                    lineHeight: "var(--leading-normal)",
                  }}
                >
                  {term.definition}
                </p>
                {term.ranges && term.ranges.length > 0 && (
                  <div className="mt-3 flex flex-col">
                    {term.ranges.map((range) => {
                      const active = inRange(range.value);
                      return (
                        <div
                          key={range.label}
                          className="flex items-baseline gap-3 py-1.5"
                          style={{
                            borderBottom:
                              "1px solid var(--container-border-subtle)",
                            color: active
                              ? "var(--primary)"
                              : "var(--text-muted)",
                            fontWeight: active
                              ? ("var(--weight-semibold)" as any)
                              : ("var(--weight-regular)" as any),
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          <span
                            className="type-numeric flex-shrink-0"
                            style={{ minWidth: 72 }}
                          >
                            {range.value}
                          </span>
                          <span className="flex-1 min-w-0">
                            {range.label}
                            {range.note ? ` — ${range.note}` : ""}
                          </span>
                          {active && (
                            <span className="type-numeric flex-shrink-0">
                              ← W{w}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {term.whyImportant && (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "var(--text-muted)",
                      fontSize: "var(--font-size-sm)",
                      lineHeight: "var(--leading-normal)",
                    }}
                  >
                    {term.whyImportant}
                  </p>
                )}
                <Link
                  to="/learn/glossary#w_alveograph"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block"
                  style={{
                    color: "var(--text-accent)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--weight-semibold)" as any,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  {cms.cooking.learnMore} →
                </Link>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

