/* === GLOSSARY LINK — Inline popover with term definition ===
   Replaces navigation-based approach: term definition shown in-context,
   with optional link to the full glossary page. */
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ExternalLink, X } from "lucide-react";
import { getTermById } from "./glossary-data";
import { useCms } from "./cms/cms-context";

interface GlossaryLinkProps {
  /** Glossary term ID (e.g. "w_alveograph", "pl_ratio", "hydration") */
  termId: string;
  /** Override display text (defaults to term name or symbol) */
  label?: string;
  /** Show BookOpen icon (default: true) */
  showIcon?: boolean;
  /** Inline style — fits within text flow */
  inline?: boolean;
}

/**
 * Contextual glossary link that opens an inline popover with term definition.
 * Clicking "Vai al glossario" navigates to the full glossary page.
 */
export function GlossaryLink({
  termId,
  label,
  showIcon = true,
  inline = true,
}: GlossaryLinkProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { cms } = useCms();
  const term = getTermById(termId, cms);
  if (!term) return null;

  const displayText = label ?? term.symbol ?? term.name;

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(!open);
  };

  if (inline) {
    return (
      <span ref={containerRef} className="relative inline-block">
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-0.5 active:scale-95"
          style={{
            color: "var(--primary)",
            fontSize: "inherit",
            fontFamily: "inherit",
            fontWeight: "inherit",
            lineHeight: "inherit",
            textDecoration: "none",
            borderBottom: "1px dotted color-mix(in srgb, var(--primary) 40%, rgba(0,0,0,0))",
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            borderBottomColor: "color-mix(in srgb, var(--primary) 40%, rgba(0,0,0,0))",
            padding: 0,
          }}
          title={`Glossario: ${term.name}`}
          aria-label={`Vedi definizione di ${term.name}`}
          aria-expanded={open}
        >
          {showIcon && (
            <BookOpen
              size={10}
              style={{ opacity: 0.6, flexShrink: 0, marginRight: 2 }}
            />
          )}
          {displayText}
        </button>

        {/* Inline popover */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 4, scale: 0.96, x: "-50%" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute z-50"
              style={{
                top: "calc(100% + 6px)",
                left: "50%",
                width: "min(320px, 90vw)",
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "0.75rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                padding: "0.75rem 1rem",
                pointerEvents: "auto",
              }}
            >
              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center active:scale-95"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                }}
                aria-label="Chiudi"
              >
                <X size={10} />
              </button>

              {/* Term name + symbol */}
              <div className="flex items-baseline gap-2 pr-6">
                <span
                  className="font-serif"
                  style={{
                    fontSize: "var(--font-size-xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    color: "var(--text-default)",
                    lineHeight: 1.2,
                  }}
                >
                  {term.name}
                </span>
                {term.symbol && (
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {term.symbol}
                  </span>
                )}
              </div>

              {/* Definition */}
              <p
                className="mt-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {term.definition}
              </p>

              {/* Unit / Formula if available */}
              {(term.unit || term.formula) && (
                <div
                  className="flex items-center gap-3 mt-2 px-2 py-1.5 rounded-md"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    fontSize: "var(--font-size-xs)",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-default)",
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {term.unit && <span>Unita: {term.unit}</span>}
                  {term.formula && <span>Formula: {term.formula}</span>}
                </div>
              )}

              {/* Link to full glossary */}
              <Link
                to={`/learn/glossary#${termId}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 mt-3 active:scale-95"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--primary)",
                  fontWeight: "var(--weight-medium)" as any,
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={11} />
                Vai al glossario
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    );
  }

  /* Badge variant — for use next to labels */
  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md active:scale-95"
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--primary)",
          background: "color-mix(in srgb, var(--primary) 6%, rgba(0,0,0,0))",
          border: "1px solid color-mix(in srgb, var(--primary) 12%, var(--outline-variant))",
          cursor: "pointer",
          letterSpacing: "0.02em",
        }}
        title={`Glossario: ${term.name}`}
        aria-label={`Vedi definizione di ${term.name}`}
        aria-expanded={open}
      >
        <BookOpen size={9} style={{ opacity: 0.6 }} />
        <span>{displayText}</span>
      </button>

      {/* Inline popover (same as inline variant) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute z-50"
            style={{
              top: "calc(100% + 6px)",
              left: 0,
              width: "min(320px, 90vw)",
              background: "var(--surface-container-low)",
              border: "1px solid var(--outline-variant)",
              borderRadius: "0.75rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              padding: "0.75rem 1rem",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center active:scale-95"
              style={{
                color: "var(--text-muted)",
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
              }}
              aria-label="Chiudi"
            >
              <X size={10} />
            </button>
            <div className="flex items-baseline gap-2 pr-6">
              <span
                className="font-serif"
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--weight-bold)" as any,
                  color: "var(--text-default)",
                  lineHeight: 1.2,
                }}
              >
                {term.name}
              </span>
              {term.symbol && (
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {term.symbol}
                </span>
              )}
            </div>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {term.definition}
            </p>
            <Link
              to={`/learn/glossary#${termId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 mt-3 active:scale-95"
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--primary)",
                fontWeight: "var(--weight-medium)" as any,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={11} />
              Vai al glossario
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}