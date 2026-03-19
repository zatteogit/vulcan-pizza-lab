/* === LEARN PAGE — VPL-062 (placeholder) ===
   Hub educativo: glossario, troubleshooting, guide.
   Tab: Impara — /learn */

import { motion } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";
import { Link } from "react-router";
import { useCms } from "../components/cms/cms-context";

export function LearnPage() {
  const { cms } = useCms();
  const pg = cms.pages;

  const SECTIONS = [
    {
      id: "glossary",
      label: pg.learnGlossary,
      desc: pg.learnGlossaryDesc,
      icon: BookOpen,
      to: "/learn/glossary",
      color: "var(--primary)",
    },
    {
      id: "troubleshooting",
      label: pg.learnTroubleshooting,
      desc: pg.learnTroubleshootingDesc,
      icon: AlertTriangle,
      to: "/learn/troubleshooting",
      color: "var(--tertiary)",
    },
    {
      id: "prefermenti",
      label: pg.learnPreFerments,
      desc: pg.learnPreFermentsDesc,
      icon: FlaskConical,
      to: "/learn/pre-ferments",
      color: "var(--cta)",
    },
  ];

  return (
    <div
      className="min-h-screen"
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
          stiffness: 400,
          damping: 30,
        }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background:
                "color-mix(in srgb, var(--primary) 12%, rgba(0,0,0,0))",
            }}
          >
            <GraduationCap
              size={28}
              style={{ color: "var(--primary)" }}
            />
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              lineHeight: "var(--leading-snug)",
              color: "var(--text-default)",
            }}
          >
            {pg.learnTitle}
          </h1>
          <p
            className="font-serif italic mt-2"
            style={{
              fontSize: "var(--font-size-xl-5)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            {pg.learnSubtitle}
          </p>
        </div>

        {/* Section cards */}
        <div className="flex flex-col gap-4">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            const isDisabled = section.to === "#";
            const Comp = isDisabled ? "div" : Link;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  delay: i * 0.06,
                }}
              >
                <Comp
                  {...(!isDisabled ? { to: section.to } : {})}
                  className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl active:scale-[0.98] transition-transform"
                  style={{
                    background: "var(--container-bg-low)",
                    border: "1px solid var(--container-border)",
                    textDecoration: "none",
                    color: "inherit",
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? "default" : "pointer",
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `color-mix(in srgb, ${section.color} 12%, rgba(0,0,0,0))`,
                    }}
                  >
                    <Icon
                      size={22}
                      style={{ color: section.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: "var(--font-size-xl)",
                        fontWeight:
                          "var(--weight-semibold)" as any,
                        color: "var(--text-default)",
                      }}
                    >
                      {section.label}
                    </div>
                    <div
                      className="type-data mt-0.5"
                      style={{
                        fontSize: "var(--font-size-sm)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {section.desc}
                    </div>
                  </div>
                  {isDisabled && (
                    <span
                      className="type-data px-2 py-1 rounded-md flex-shrink-0"
                      style={{
                        fontSize: "var(--font-size-xs)",
                        background: "var(--container-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Presto
                    </span>
                  )}
                </Comp>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}