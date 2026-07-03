/* ═══ RECIPE OUTPUT — componenti di supporto (estratti lug 2026) ═══
 * NerdAuraBlock, ScrollToTopOnMount, IngRow, GlossaryWLink. */

import { motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";

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

/* Deeplink discreto al glossario: la W della farina smette di essere gergo
   muto (audit lug 2026 — persona casalinga). */
export function GlossaryWLink({ w }: { w: number }) {
  return (
    <Link
      to="/learn/glossary#w_alveograph"
      style={{
        color: "inherit",
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        textUnderlineOffset: 3,
      }}
    >
      W{w}
    </Link>
  );
}

