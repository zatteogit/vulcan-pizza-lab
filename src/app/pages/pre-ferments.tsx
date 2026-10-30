import type { LucideIcon } from "lucide-react";
import { Droplet, Droplets, Wheat } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { useHashTarget } from "../hooks/use-hash-target";
import { CtaButton, Heading } from "../components/ds/index";
import { SubPageHeader } from "../components/shared/sub-page-header";
import { useCms } from "../features/cms/cms-context";
import {
  fillPreFermentText,
  PreFermentCard,
  PreFermentComparisonTable,
  PreFermentStyleList
} from "../features/recipe/pre-ferment-guide";
import { Flask } from "../features/cooking/step-illustrations";
import { motionDelay,motionSpring } from "../components/ds/motion";
import { uiMessage } from "../i18n/ui-messages";

/* FW-09 (S14-A-09): dalla teoria alla pratica. La Pala romana dichiara diretto,
 * biga e poolish (process_type), quindi apre la ricetta col prefermento scelto
 * (link D-043: pf, pft). */
const TRY_STYLE_ID = "pala_romana";
const tryLink = (type: "biga" | "poolish") => `/recipe/${TRY_STYLE_ID}?mode=adapted&pf=1&pft=${type}`;

const PRE_FERMENT_ORDER = [
  "biga",
  "poolish",
  "autolisi",
] as const;

export function PreFermentsPage() {
  const { cms, bcp47 } = useCms();
  const pg = cms.pages;
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set());
  const setOpen = (id: string, open: boolean) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });

  /* U-5 + FW-04 (S14-B-16): dalla ricerca si arriva alla scheda già aperta
     (#pf-biga, #pf-poolish…), con focus sul titolo. */
  useHashTarget({
    prefix: "pf-",
    onMatch: (id) => {
      if (!(PRE_FERMENT_ORDER as readonly string[]).includes(id)) return false;
      setOpen(id, true);
      return true;
    },
    targetId: (id) => `pf-${id}`,
    focusId: (id) => `pf-card-${id}`,
  });
  return (
    <div className="preferment-page">
      {/* Header — pattern condiviso (il titolo vive nell'hero sotto) */}
      <SubPageHeader backTo="/learn" backLabel={pg.navLearn} />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.standard}
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
            {/* FW-05: l'idratazione della biga arriva dal motore (segnaposto). */}
            <span dangerouslySetInnerHTML={{ __html: fillPreFermentText(pg.preFermentsDescription, bcp47) }} />
          </p>
        </div>

        {/* Pre-ferment cards */}
        <div className="preferment-cards">
          {PRE_FERMENT_ORDER.map((id, i) => (
            <motion.div
              key={id}
              id={`pf-${id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...motionSpring.standard,delay: i * motionDelay.recipeReveal }}
            >
              <PreFermentCard
                preFermentType={id}
                showComparison={false}
                showExample
                headingLevel={2}
                open={openIds.has(id)}
                onOpenChange={(open) => setOpen(id, open)}
              />
            </motion.div>
          ))}
        </div>

        {/* Comparison table — always visible on this page */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSpring.standard,delay: motionDelay.deliberate }}
        >
          <Heading level="lg" className="preferment-section-title">
            {cms.misc.preFermentCompare}
          </Heading>
          <PreFermentComparisonTable pf={cms.preFerment} locale={bcp47} />
        </motion.div>

        {/* Decision guide */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionSpring.standard,delay: motionDelay.pageDecision }}
          className="preferment-decisions"
        >
          <Heading level="lg" className="preferment-section-title">
            {pg.preFermentsChoiceTitle}
          </Heading>
          <div className="preferment-decisions__list">
            <DecisionCard
              icon={Wheat}
              title={pg.preFermentsBigaTitle}
              when={pg.preFermentsBigaWhen}
              best={<PreFermentStyleList kind="biga" locale={bcp47} />}
              tone="biga"
              tryHref={tryLink("biga")}
              tryLabel={uiMessage("pages.preFerments.tryBiga")}
            />
            <DecisionCard
              icon={Droplet}
              title={pg.preFermentsPoolishTitle}
              when={pg.preFermentsPoolishWhen}
              best={<PreFermentStyleList kind="poolish" locale={bcp47} />}
              tone="poolish"
              tryHref={tryLink("poolish")}
              tryLabel={uiMessage("pages.preFerments.tryPoolish")}
            />
            <DecisionCard
              icon={Droplets}
              title={pg.preFermentsAutolisiTitle}
              when={pg.preFermentsAutolisiWhen}
              best={pg.preFermentsAutolisiBest}
              tone="autolisi"
            />
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}

/* === DECISION CARD === */
function DecisionCard({
  icon: Icon,
  title,
  when,
  best,
  tone,
  tryHref,
  tryLabel,
}: {
  icon: LucideIcon;
  title: string;
  when: string;
  /** FW-05 (S14-A-01): per biga e poolish, gli stili del motore con il link. */
  best: React.ReactNode;
  tone: "biga" | "poolish" | "autolisi";
  tryHref?: string;
  tryLabel?: string;
}) {
  return (
    <div className="preferment-decision" data-tone={tone}>
      <div className="preferment-decision__head">
        <span className="preferment-decision__emoji">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="preferment-decision__title">
          {title}
        </span>
      </div>
      <div className="preferment-decision__when">
        {when}
      </div>
      <div className="preferment-decision__best">
        {uiMessage("pages.pre-ferments.0aebda24")}{best}
      </div>
      {tryHref && tryLabel && (
        <CtaButton as={Link} to={tryHref} variant="secondary" radius="lg" elevated={false} className="preferment-decision__try">
          {tryLabel}
        </CtaButton>
      )}
    </div>
  );
}
