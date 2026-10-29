/* ═══ STEP DETAILS — "come si fa" collassabile + learn-inline (estratto lug 2026) ═══ */

import { ChevronRight, FlaskConical, LifeBuoy, Lightbulb } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { motionDuration, motionSpring } from "../../components/ds/motion";
import { useId, useState } from "react";
import { useDisclosureScroll } from "../../hooks/use-disclosure-scroll";
import type { StepTroubleshooting } from "../../data/troubleshooting-data";
import { TroubleshootingSheet } from "./troubleshooting-panel";
import type { CmsContent } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { GlossaryTermLinks } from "../glossary/term-link";
import { stepGlossaryTerms } from "../glossary/step-terms";

/* ═══ Learning contestuale — FW-04 (S09-A-15, S09-B-07) ═══
   Le parole del passo (incordatura, staglio, appretto…) sono TermLink sempre
   visibili, anche quando il passo non ha «Come si fa»: la mappa vive in
   features/glossary/step-terms.ts, condivisa con la modalità cottura. */

/* ═══ Dettaglio step collassabile — "come si fa" + consigli al tocco ═══ */
export function StepDetails({
  longDesc,
  tips,
  isNerd,
  stepId,
  unleavened = false,
  preFermentType,
  cms,
  troubleshooting,
}: {
  longDesc?: string;
  tips: string[];
  isNerd: boolean;
  stepId?: string;
  /** Impasto non lievitato: niente rimandi alla lievitazione nei riposi. */
  unleavened?: boolean;
  preFermentType?: string;
  cms: CmsContent;
  troubleshooting?: StepTroubleshooting & { title: string };
}) {
  const [open, setOpen] = useState(false);
  const [troubleOpen, setTroubleOpen] = useState(false);
  const detailsScroll = useDisclosureScroll(open);
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? { duration: motionDuration.reduced } : motionSpring.denseDisclosure;
  const detailsId = useId();
  const glossaryTerms = stepGlossaryTerms(stepId, { unleavened, preFermentType });

  const hasDetails = Boolean(longDesc || tips.length);
  const troubleLabel = troubleshooting && cms.cooking.troubleStepLinks?.[troubleshooting.labelKey];
  const troubleAction = troubleLabel ? (
    <button
      type="button"
      onClick={() => setTroubleOpen(true)}
      aria-haspopup="dialog"
      aria-expanded={troubleOpen}
      className="step-details__trouble-link type-data"
    >
      <LifeBuoy size={13} aria-hidden="true" className="step-details__trouble-link-icon" />
      {troubleLabel}
      {/* FW-03 (S09-B-12): apre un foglio, quindi freccia; un solo rientro */}
      <ChevronRight size={14} aria-hidden="true" className="step-details__trouble-link-icon" />
    </button>
  ) : null;

  if (!hasDetails && !troubleAction && glossaryTerms.length === 0) return null;
  return (
    <div className="step-details">
      {hasDetails && <button
        ref={detailsScroll.anchorRef}
        type="button"
        onClick={() => { if (!open) detailsScroll.prepare(); setOpen((v) => !v); }}
        className="step-details__toggle type-data"
        aria-expanded={open}
        aria-controls={open ? detailsId : undefined}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={reducedMotion ? { duration: motionDuration.reduced } : motionSpring.crispControl}
          className="step-details__chevron"
        >
          <ChevronRight size={16} />
        </motion.span>
        {cms.cooking.stepDetailsShow}
        {tips.length > 0 && (
          <span className="step-details__tips-count">
            · {t(tips.length === 1 ? cms.cooking.tipsCountOne : cms.cooking.tipsCountMany, { n: tips.length })}
          </span>
        )}
      </button>}
      {!hasDetails && troubleAction}
      {open && (
        <motion.div
          ref={detailsScroll.contentRef}
          id={detailsId}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={transition}
          onUpdate={(latest) => { if (typeof latest.height === "number" || typeof latest.height === "string") detailsScroll.follow(latest.height); }}
          onAnimationComplete={detailsScroll.complete}
          className="step-details__content"
        >
          {longDesc && <p className="step-details__desc type-body-lg">{longDesc}</p>}
          {tips.map((tip, k) => (
            <div
              key={k}
              className={isNerd ? "step-details__tip step-details__tip--nerd" : "step-details__tip step-details__tip--beginner"}
            >
              {isNerd ? (
                <FlaskConical size={14} className="step-details__tip-icon step-details__tip-icon--nerd" />
              ) : (
                <Lightbulb size={14} className="step-details__tip-icon step-details__tip-icon--beginner" />
              )}
              <span
                className={
                  isNerd
                    ? "step-details__tip-text step-details__tip-text--nerd type-data"
                    : "step-details__tip-text step-details__tip-text--beginner"
                }
              >
                {tip}
              </span>
            </div>
          ))}
          {troubleAction}
        </motion.div>
      )}
      <GlossaryTermLinks termIds={glossaryTerms} className="step-details__terms" />
      {troubleshooting && (
        <TroubleshootingSheet open={troubleOpen} context={troubleshooting} onClose={() => setTroubleOpen(false)} />
      )}
    </div>
  );
}
