import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useCms } from "../components/cms/cms-context";

export function NotFoundPage() {
  const { cms } = useCms();
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
        className="text-center px-6"
      >
        <span
          className="type-step-num"
          style={{
            fontWeight: "var(--weight-bold)" as any,
            color: "var(--text-accent)",
          }}
        >
          404
        </span>
        <h1
          className="font-serif mt-2"
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: "var(--leading-snug)",
            color: "var(--text-default)",
          }}
        >
          {cms.pages.notFoundTitle}
        </h1>
        <p
          className="font-serif italic mt-2"
          style={{
            fontSize: "var(--font-size-xl-5)",
            color: "var(--text-muted)",
            opacity: 0.65,
          }}
        >
          {cms.pages.notFoundSubtitle}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full"
          style={{
            background: "var(--cta-btn-bg)",
            color: "var(--cta-btn-text)",
            fontWeight: "var(--weight-semibold)" as any,
            fontSize: "var(--font-size-xl)",
            boxShadow: "var(--cta-btn-shadow)",
          }}
        >
          <ArrowLeft size={14} />
          {cms.pages.notFoundBack}
        </Link>
      </motion.div>
    </div>
  );
}