import React from "react";
import { motion } from "motion/react";

/* ═══ STEP HEADER — big editorial step marker (shared) ═══ */

interface StepHeaderProps {
  number: string;
  title: string;
  subtitle: string;
  className?: string;
}

export function StepHeader({
  number,
  title,
  subtitle,
  className,
}: StepHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex flex-col items-center lg:items-start text-center lg:text-left${className ? ` ${className}` : ""}`}
    >
      <span
        className="type-step-num"
        style={{
          fontWeight: "var(--weight-bold)" as any,
          color: "var(--step-num-color)",
          marginBottom: "0.5rem",
        }}
      >
        {number}
      </span>
      <h2
        className="font-serif"
        style={{
          fontSize: "clamp(var(--font-size-7xl), 5vw, 2.75rem)",
          lineHeight: "var(--leading-snug)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--step-title-color)",
        }}
      >
        {title}
      </h2>
      <p
        className="font-serif italic mt-1.5"
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--font-size-xl-5)",
          lineHeight: "var(--leading-relaxed)",
          opacity: 0.65,
        }}
      >
        {subtitle}
      </p>
      <div
        className="mx-auto lg:mx-0 mt-4 sm:mt-5"
        style={{
          width: "2rem",
          height: "2px",
          borderRadius: "1px",
          background: "var(--step-line-color)",
          opacity: 0.35,
        }}
      />
    </motion.div>
  );
}