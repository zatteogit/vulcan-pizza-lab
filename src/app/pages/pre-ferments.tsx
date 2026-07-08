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
    <div className="preferment-page">
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
        className="preferment-shell"
        data-region="page"
      >
        {/* Header */}
        <div data-region="page-header" className="preferment-header">
          <div className="preferment-header__icon">
            <Flask size={58} />
          </div>
          <Heading level="page">
            {pg.learnPreFerments}
          </Heading>
          <p className="preferment-header__subtitle">
            {pg.preFermentsSubtitle}
          </p>
        </div>

        {/* Intro paragraph */}
        <div className="preferment-intro">
          <p className="preferment-intro__text">
            <span dangerouslySetInnerHTML={{ __html: pg.preFermentsDescription }} />
          </p>
        </div>

        {/* Pre-ferment cards */}
        <div className="preferment-cards">
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
          <Heading level="lg" className="preferment-section-title">
            {cms.misc.preFermentCompare}
          </Heading>
          <div className="preferment-table">
            <div className="preferment-table__scroll">
              <table className="preferment-table__grid">
                <thead>
                  <tr>
                    <th className="preferment-table__th"> </th>
                    <th className="preferment-table__th preferment-table__th--biga">
                      Biga
                    </th>
                    <th className="preferment-table__th preferment-table__th--poolish">
                      Poolish
                    </th>
                    <th className="preferment-table__th preferment-table__th--autolisi">
                      Autolisi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td className="preferment-table__td preferment-table__rowlabel">
                        {row.label}
                      </td>
                      <td className="preferment-table__td">
                        {row.biga}
                      </td>
                      <td className="preferment-table__td">
                        {row.poolish}
                      </td>
                      <td className="preferment-table__td">
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
          className="preferment-decisions"
        >
          <Heading level="lg" className="preferment-section-title">
            {pg.preFermentsChoiceTitle}
          </Heading>
          <div className="preferment-decisions__list">
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
      className="preferment-decision"
      style={{ ["--tone" as any]: color }}
    >
      <div className="preferment-decision__head">
        <span className="preferment-decision__emoji">
          {emoji}
        </span>
        <span className="preferment-decision__title">
          {title}
        </span>
      </div>
      <div className="preferment-decision__when">
        {when}
      </div>
      <div className="preferment-decision__best">
        Ideale per: {best}
      </div>
    </div>
  );
}
