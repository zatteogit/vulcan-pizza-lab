/* ═══ STEP DETAILS — "come si fa" collassabile + learn-inline (estratto lug 2026) ═══ */

import { ChevronRight, FlaskConical, LifeBuoy, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
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
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 type-data active:scale-95 transition-transform"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          color: "var(--text-accent)",
          fontWeight: "var(--weight-semibold)" as any,
          cursor: "pointer",
        }}
        aria-expanded={open}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ display: "inline-flex" }}
        >
          <ChevronRight size={16} />
        </motion.span>
        {open ? cms.cooking.stepDetailsHide : cms.cooking.stepDetailsShow}
        {!open && tips.length > 0 && (
          <span
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-regular)" as any,
            }}
          >
            · {t(tips.length === 1 ? cms.cooking.tipsCountOne : cms.cooking.tipsCountMany, { n: tips.length })}
          </span>
        )}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="overflow-hidden"
        >
          {longDesc && (
            <p
              className="mt-3 type-body-lg"
              style={{
                color: "var(--text-default)",
                lineHeight: "var(--leading-relaxed)",
                opacity: 0.88,
              }}
            >
              {longDesc}
            </p>
          )}
          {tips.map((tip, k) => (
            <div
              key={k}
              className="flex items-start gap-3 mt-3 px-4 py-3 rounded-2xl"
              style={{
                background: isNerd
                  ? "var(--recipe-tip-nerd-bg)"
                  : "var(--recipe-tip-beginner-bg)",
                border: `1px solid ${isNerd ? "var(--recipe-tip-nerd-border)" : "var(--recipe-tip-border)"}`,
              }}
            >
              {isNerd ? (
                <FlaskConical
                  size={14}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--recipe-tip-nerd-icon)", opacity: 0.7 }}
                />
              ) : (
                <Lightbulb
                  size={14}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--recipe-tip-icon)", opacity: 0.7 }}
                />
              )}
              <span
                className={isNerd ? "type-data" : ""}
                style={{
                  fontSize: isNerd ? "var(--font-size-lg)" : "var(--font-size-xl)",
                  lineHeight: "var(--leading-relaxed)",
                  color: "var(--text-subtle)",
                }}
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
              className="inline-flex items-center gap-1.5 mt-3 type-data"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: "var(--text-accent)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                minHeight: 36,
                cursor: "pointer",
              }}
              aria-expanded={glossaryOpen}
            >
              {t(cms.cooking.learnInlineTitle, { label: glossaryLabel })}
            </button>
            {glossaryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-2xl px-4 py-3 type-body"
                style={{
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border-subtle)",
                  color: "var(--text-muted)",
                  lineHeight: "var(--leading-normal)",
                }}
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
                className={`inline-flex items-center gap-1.5 mt-3 type-data${STEP_GLOSSARY[stepId] ? " ml-4" : ""}`}
                style={{
                  color: "var(--text-accent)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  minHeight: 36,
                }}
              >
                <LifeBuoy size={13} aria-hidden="true" style={{ flexShrink: 0, opacity: 0.75 }} />
                {label}
              </Link>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

