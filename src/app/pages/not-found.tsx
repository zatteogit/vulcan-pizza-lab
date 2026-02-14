import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center px-6"
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--primary)",
          }}
        >
          404
        </span>
        <h1
          className="font-serif mt-2"
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: 1.1,
            color: "var(--foreground)",
          }}
        >
          Pagina non trovata
        </h1>
        <p
          className="font-serif italic mt-2"
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted-foreground)",
            opacity: 0.65,
          }}
        >
          Questa pizza non esiste nel nostro menu.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full"
          style={{
            background: "var(--grad-sage)",
            color: "var(--cta-foreground)",
            fontWeight: 600,
            fontSize: "0.875rem",
            boxShadow: "var(--cta-shadow)",
          }}
        >
          <ArrowLeft size={14} />
          Torna alla home
        </Link>
      </motion.div>
    </div>
  );
}
