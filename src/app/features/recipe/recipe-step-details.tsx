/* ═══ STEP DETAILS — "come si fa" collassabile + learn-inline (estratto lug 2026) ═══ */

import { ChevronDown, ChevronRight, FlaskConical, LifeBuoy, Lightbulb } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { motionDuration, motionSpring } from "../../components/ds/motion";
import { useId, useState } from "react";
import { useDisclosureScroll } from "../../hooks/use-disclosure-scroll";
import type { StepTroubleshooting } from "../../data/troubleshooting-data";
import { TroubleshootingSheet } from "./troubleshooting-panel";
import type { CmsContent } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { getTermById } from "../../data/glossary-data";
import { WhyButton } from "../science/why-button";

/* ═══ Learning contestuale: ogni fase porta al suo termine nel glossario ═══
   (feedback giugno 2026 — il "come si impara" richiamabile dalla ricetta) */
const STEP_GLOSSARY: Record<string, { hash: string }> = {
  bulk: { hash: "bulk_fermentation" },
  proof: { hash: "ball_fermentation" },
  bake: { hash: "maillard" },
  mix: { hash: "hydration" },
};

/* Impasto non lievitato (Focaccia di Recco): puntata e appretto sono un
   riposo (ENG-5). Glossario e troubleshooting di quelle fasi parlano di
   lievitazione («La puntata», «È andata lunga?» → impasto troppo lievitato),
   quindi lì non si mostrano. */
const REST_STEP_IDS = new Set(["bulk", "proof"]);

/* FW-02 (S09-B-08): durata e temperatura dei riposi lievitati hanno il loro
   «Perché?»: la velocità con la temperatura (stima Q10) per la puntata, la
   quota dell'appretto (ipotesi del modello) per l'appretto. */
const STEP_SCIENCE_NOTE: Record<string, string> = {
  bulk: "q10-fermentation",
  proof: "proof-split",
};

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
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [troubleOpen, setTroubleOpen] = useState(false);
  const detailsScroll = useDisclosureScroll(open);
  const glossaryScroll = useDisclosureScroll(glossaryOpen && open);
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? { duration: motionDuration.reduced } : motionSpring.denseDisclosure;
  const detailsId = useId();
  const glossaryId = useId();
  const learnStepId =
    stepId && !(unleavened && REST_STEP_IDS.has(stepId)) ? stepId : undefined;

  const glossaryHash = learnStepId === "preferment"
    ? preFermentType === "poolish" ? "poolish" : preFermentType === "biga" ? "biga" : undefined
    : learnStepId ? STEP_GLOSSARY[learnStepId]?.hash : undefined;
  const glossaryTerm = glossaryHash ? getTermById(glossaryHash, cms) : undefined;
  const scienceNoteId = learnStepId ? STEP_SCIENCE_NOTE[learnStepId] : undefined;

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

  if (!hasDetails && !troubleAction) return null;
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
          {glossaryTerm && (
            <>
            <button
              ref={glossaryScroll.anchorRef}
              type="button"
              onClick={() => { if (!glossaryOpen) glossaryScroll.prepare(); setGlossaryOpen((value) => !value); }}
              className="step-details__glossary-toggle type-data"
              aria-expanded={glossaryOpen}
              aria-controls={glossaryOpen ? glossaryId : undefined}
            >
              {t(cms.cooking.learnInlineTitle, { label: glossaryTerm.name })}
              {/* FW-03 (S09-B-12): si apre sul posto, quindi chevron come «Come si fa» */}
              <ChevronDown size={14} aria-hidden="true" className="step-details__glossary-chevron" />
            </button>
            {glossaryOpen && (
              <motion.div
                ref={glossaryScroll.contentRef}
                id={glossaryId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={transition}
                onUpdate={(latest) => { if (typeof latest.height === "number" || typeof latest.height === "string") glossaryScroll.follow(latest.height); }}
                onAnimationComplete={glossaryScroll.complete}
                className="step-details__content"
              >
                <div className="step-details__glossary-content type-body" data-glossary-term={glossaryTerm.id}
                  role="region" aria-label={glossaryTerm.name}>
                  <p>{glossaryTerm.definition}</p>
                  {glossaryTerm.whyImportant && <div className="step-details__glossary-why">
                    <h4>{cms.glossary.whyImportantLabel}</h4>
                    <p>{glossaryTerm.whyImportant}</p>
                  </div>}
                </div>
              </motion.div>
            )}
            </>
          )}
          {scienceNoteId && <WhyButton noteId={scienceNoteId} label={cms.science?.notes?.[scienceNoteId]?.title} className="step-details__why" />}
          {troubleAction}
        </motion.div>
      )}
      {troubleshooting && (
        <TroubleshootingSheet open={troubleOpen} context={troubleshooting} onClose={() => setTroubleOpen(false)} />
      )}
    </div>
  );
}
