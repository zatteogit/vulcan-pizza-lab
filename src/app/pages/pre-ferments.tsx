import { motion } from "motion/react";
import { Heading } from "../components/ds/index";
import { SubPageHeader } from "../components/shared/sub-page-header";
import { useCms } from "../features/cms/cms-context";
import {
COMPARISON_ROWS,
PreFermentCard
} from "../features/recipe/pre-ferment-guide";
import { Flask } from "../features/cooking/step-illustrations";

const PRE_FERMENT_ORDER = [
  "biga",
  "poolish",
  "autolisi",
] as const;

export function PreFermentsPage() {
  const { cms } = useCms();
  const pg = cms.pages;
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* Header — pattern condiviso (il titolo vive nell'hero sotto) */}
      <SubPageHeader backTo="/learn" backLabel={pg.navLearn} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14"
      >
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 76,
              height: 60,
              borderRadius: 16,
              background:
                "color-mix(in srgb, var(--cta) 12%, transparent)",
            }}
          >
            <Flask size={58} />
          </div>
          <Heading level="page">
            {pg.learnPreFerments}
          </Heading>
          <p
            className="font-serif italic mt-2"
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            {pg.preFermentsSubtitle}
          </p>
        </div>

        {/* Intro paragraph */}
        <div
            className="rounded-2xl px-6 sm:px-8 py-6 sm:py-7 mb-10"
          style={{
            background: "var(--container-bg-low)",
            border: "1px solid var(--container-border)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-2xl)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--text-default)",
              margin: 0,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: pg.preFermentsDescription }} />
          </p>
        </div>

        {/* Pre-ferment cards */}
        <div className="flex flex-col gap-5 mb-14">
          {PRE_FERMENT_ORDER.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: i * 0.08,
              }}
            >
              <PreFermentCard preFermentType={id} />
            </motion.div>
          ))}
        </div>

        {/* Comparison table — always visible on this page */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            delay: 0.3,
          }}
        >
          <Heading level="lg" className="mb-4">
            {cms.misc.preFermentCompare}
          </Heading>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div
              style={{
                overflowX: "auto",
                "--pre-ferment-cell-x": "clamp(var(--space-2), 2vw, var(--space-3))",
              } as React.CSSProperties}
            >
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  fontSize: "var(--font-size-md)",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}> </th>
                    <th
                      style={{
                        ...thStyle,
                        color: "var(--primary)",
                      }}
                    >
                      Biga
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        color: "var(--cta)",
                      }}
                    >
                      Poolish
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        color: "var(--tertiary)",
                      }}
                    >
                      Autolisi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.label}>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: "var(--font-size-sm)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          color: "var(--muted-foreground)",
                          fontWeight:
                            "var(--weight-semibold)" as any,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "transparent",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "transparent",
                        }}
                      >
                        {row.biga}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "transparent",
                        }}
                      >
                        {row.poolish}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "transparent",
                        }}
                      >
                        {row.autolisi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Decision guide */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            delay: 0.4,
          }}
          className="mt-8"
        >
          <Heading level="lg" className="mb-4">
            {pg.preFermentsChoiceTitle}
          </Heading>
          <div className="flex flex-col gap-3">
            <DecisionCard
              emoji="🍞"
              title={pg.preFermentsBigaTitle}
              when={pg.preFermentsBigaWhen}
              best={pg.preFermentsBigaBest}
              color="var(--primary)"
            />
            <DecisionCard
              emoji="💧"
              title={pg.preFermentsPoolishTitle}
              when={pg.preFermentsPoolishWhen}
              best={pg.preFermentsPoolishBest}
              color="var(--cta)"
            />
            <DecisionCard
              emoji="💦"
              title={pg.preFermentsAutolisiTitle}
              when={pg.preFermentsAutolisiWhen}
              best={pg.preFermentsAutolisiBest}
              color="var(--tertiary)"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* === DECISION CARD === */
function DecisionCard({
  emoji,
  title,
  when,
  best,
  color,
}: {
  emoji: string;
  title: string;
  when: string;
  best: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3.5"
      style={{
        background: "var(--container-bg-low)",
        border: "1px solid var(--container-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: "var(--font-size-xl)" }}>
          {emoji}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--weight-semibold)" as any,
            color,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: "var(--font-size-lg)",
          lineHeight: "var(--leading-relaxed)",
          color: "var(--text-default)",
        }}
      >
        {when}
      </div>
      <div
        className="mt-1"
        style={{
          fontSize: "var(--font-size-md)",
          color: "var(--text-muted)",
          lineHeight: "var(--leading-relaxed)",
        }}
      >
        Ideale per: {best}
      </div>
    </div>
  );
}

/* === TABLE STYLES === */
const thStyle: React.CSSProperties = {
  padding: "var(--space-2) var(--pre-ferment-cell-x, var(--space-3))",
  textAlign: "left",
  fontSize: "var(--font-size-sm)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: "var(--weight-semibold)" as any,
  borderBottom: "1px solid var(--outline-variant)",
  overflowWrap: "break-word",
};

const tdStyle: React.CSSProperties = {
  padding: "var(--space-2) var(--pre-ferment-cell-x, var(--space-3))",
  color: "var(--text-default)",
  borderBottom: "1px solid var(--outline-variant)",
  overflowWrap: "break-word",
};
