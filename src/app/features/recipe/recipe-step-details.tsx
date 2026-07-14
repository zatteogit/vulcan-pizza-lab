/* ═══ STEP DETAILS — "come si fa" collassabile + learn-inline (estratto lug 2026) ═══ */

import { ChevronRight, FlaskConical, LifeBuoy, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { motionSpring } from "../../components/ds/motion";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { CmsContent } from "../cms/cms-context";
import { t } from "../cms/i18n";

/* ═══ Learning contestuale: ogni fase porta al suo termine nel glossario ═══
   (feedback giugno 2026 — il "come si impara" richiamabile dalla ricetta) */
const STEP_GLOSSARY: Record<string, { hash: string }> = {
  preferment: { hash: "biga" },
  bulk: { hash: "bulk_fermentation" },
  proof: { hash: "ball_fermentation" },
  bake: { hash: "maillard" },
  mix: { hash: "hydration" },
};

/* ═══ "È andata lunga?" (audit lug 2026): ogni fase critica porta all'issue di
   troubleshooting più probabile quando qualcosa va storto in QUELLA fase.
   La label è per-fase (cms.cooking.troubleStepLinks), l'id apre l'issue via
   deep-link ?issue=Pxx su /learn/troubleshooting. ═══ */
export const STEP_TROUBLE: Record<string, { issueId: string; labelKey: string }> = {
  preferment: { issueId: "P06", labelKey: "preferment" }, // troppo acido
  mix: { issueId: "P01", labelKey: "mix" },               // appiccicoso
  bulk: { issueId: "P03", labelKey: "bulk" },             // over-fermentato
  proof: { issueId: "P03", labelKey: "proof" },           // over-fermentato
  shape: { issueId: "P02", labelKey: "shape" },           // si strappa
  bake: { issueId: "P09", labelKey: "bake" },             // cruda/bruciata
  bake2: { issueId: "P09", labelKey: "bake" },
};

/* ═══ Dettaglio step collassabile — "come si fa" + consigli al tocco ═══ */
export function StepDetails({
  longDesc,
  tips,
  isNerd,
  stepId,
  cms,
}: {
  longDesc?: string;
  tips: string[];
  isNerd: boolean;
  stepId?: string;
  cms: CmsContent;
}) {
  const [open, setOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const glossaryLabel = useMemo(() => {
    if (!stepId) return "";
    switch (stepId) {
      case "preferment": return cms.cooking.glossaryPreferment;
      case "bulk": return cms.cooking.glossaryBulk;
      case "proof": return cms.cooking.glossaryProof;
      case "bake": return cms.cooking.glossaryBake;
      case "mix": return cms.cooking.glossaryMix;
      default: return "";
    }
  }, [stepId, cms.cooking]);

  if (!longDesc && tips.length === 0) return null;
  return (
    <div className="step-details">
      <button
        onClick={() => setOpen((v) => !v)}
        className="step-details__toggle type-data"
        aria-expanded={open}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={motionSpring.crispControl}
          className="step-details__chevron"
        >
          <ChevronRight size={16} />
        </motion.span>
        {open ? cms.cooking.stepDetailsHide : cms.cooking.stepDetailsShow}
        {!open && tips.length > 0 && (
          <span className="step-details__tips-count">
            · {t(tips.length === 1 ? cms.cooking.tipsCountOne : cms.cooking.tipsCountMany, { n: tips.length })}
          </span>
        )}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={motionSpring.denseDisclosure}
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
          {stepId && STEP_GLOSSARY[stepId] && (
            <>
            <button
              type="button"
              onClick={() => setGlossaryOpen((value) => !value)}
              className="step-details__glossary-toggle type-data"
              aria-expanded={glossaryOpen}
            >
              {t(cms.cooking.learnInlineTitle, { label: glossaryLabel })}
            </button>
            {glossaryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="step-details__glossary-content type-body"
              >
                {t(cms.cooking.learnInlineBody, { label: glossaryLabel })}
              </motion.div>
            )}
            </>
          )}
          {stepId && STEP_TROUBLE[stepId] && (() => {
            const trouble = STEP_TROUBLE[stepId];
            const label = cms.cooking.troubleStepLinks?.[trouble.labelKey];
            if (!label) return null;
            return (
              <Link
                to={`/learn/troubleshooting?issue=${trouble.issueId}`}
                className={
                  STEP_GLOSSARY[stepId]
                    ? "step-details__trouble-link step-details__trouble-link--indented type-data"
                    : "step-details__trouble-link type-data"
                }
              >
                <LifeBuoy size={13} aria-hidden="true" className="step-details__trouble-link-icon" />
                {label}
              </Link>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
