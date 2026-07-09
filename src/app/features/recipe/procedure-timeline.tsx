/* ═══ PROCEDURE TIMELINE — tab Procedimento (estratto fase 2, lug 2026) ═══
 * Banner compensazioni (nerd) + timeline con orari assoluti, stretch
 * flessibili, StepDetails e ToppingSection inline allo step Condimento. */

import { FlaskConical } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { StepIllustration } from "../cooking/step-illustrations";
import { TOPPING_LIBRARY } from "../../data/topping-library";
import type {
  GeneratedRecipe,
  getServingUnit,
} from "../../domain/pizza-engine";
import { NerdAuraBlock } from "./recipe-output-bits";
import {
  compGramsSuffix,
  displayStepTime,
  fmtDuration,
  formatCompVal,
  getParametricTip,
  localizeStep,
} from "./recipe-output-format";
import { StepDetails } from "./recipe-step-details";
import { ToppingSection, type ToppingSectionProps } from "./topping-section";

const TOPPING_TIMELINE_STEP_IDS = new Set([
  "top",
  "top_post",
  "fill_internal",
  "split_fill",
  "after_bake_top",
]);
const isToppingTimelineStep = (stepId: string) =>
  TOPPING_TIMELINE_STEP_IDS.has(stepId) || stepId.startsWith("spread_");

type Compensation = NonNullable<GeneratedRecipe["science"]>["compensations"][number];

interface ProcedureTimelineProps {
  recipe: GeneratedRecipe;
  isNerd: boolean;
  compensations: Compensation[];
  startTime: Date;
  stepTimes: { start: Date; end: Date }[];
  stretch: Record<number, number>;
  effDuration: (i: number) => number;
  servingUnit: ReturnType<typeof getServingUnit>;
  activeTopping: ToppingSectionProps["activeTopping"];
  toppingChoices: ToppingSectionProps["toppingChoices"];
  allToppingChoices: ToppingSectionProps["allToppingChoices"];
  onSelectTopping?: (conceptId: string) => void;
}

export function ProcedureTimeline({
  recipe,
  isNerd,
  compensations,
  startTime,
  stepTimes,
  stretch,
  effDuration,
  servingUnit,
  activeTopping,
  toppingChoices,
  allToppingChoices,
  onSelectTopping,
}: ProcedureTimelineProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  return (
    <>
      {/* ── Procedure / Timeline with inline tips ── */}
      <div data-region="section">
        {/* ── Compensations banner (PizzaNerd inline) ── */}
        {isNerd && compensations.length > 0 && (
          <NerdAuraBlock className="procedure-timeline-comp">
            <div className="procedure-timeline-comp__panel">
              <div className="procedure-timeline-comp__header">
                <FlaskConical size={14} className="procedure-timeline-comp__icon" />
                <span className="type-data-field procedure-timeline-comp__label">
                  {cms.misc.techAdjustmentsApplied}
                </span>
                <span className="type-code procedure-timeline-comp__badge">
                  Nerd
                </span>
                <span className="type-numeric procedure-timeline-comp__count">
                  {compensations.length}
                </span>
              </div>
              <div className="procedure-timeline-comp__list">
                {compensations.map((c, i) => (
                  <div
                    key={`${c.type}-${i}`}
                    className="type-body procedure-timeline-comp__row"
                  >
                    <span className="procedure-timeline-comp__row-label">
                      {c.reason}{compGramsSuffix(c, recipe.flour_g)}
                    </span>
                    <span className="type-numeric procedure-timeline-comp__row-value">
                      {c.original !== c.compensated
                        ? `${formatCompVal(c.type, c.original)} → ${formatCompVal(c.type, c.compensated)}`
                        : formatCompVal(c.type, c.compensated)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </NerdAuraBlock>
        )}

        {/* Steps with inline tips */}
        <div className="procedure-timeline-spine">
          <div className="procedure-timeline-spine__rail" />
          <div className="procedure-timeline-list">
            {recipe.timeline.map((step, i) => {
              const isFirst = i === 0;
              const isLast = i === recipe.timeline.length - 1;
              const times = stepTimes[i];
              
              let displayStep = step;
              if (isToppingTimelineStep(step.id) && activeTopping) {
                // Find the original step to check its insert_at timing
                const originalToppingRecipe = Object.values(TOPPING_LIBRARY).find(r => 
                  r.assembly_steps?.some(s => s.id === step.id)
                );
                const originalStep = originalToppingRecipe?.assembly_steps?.find(s => s.id === step.id);
                
                const activeStep = activeTopping.assembly_steps?.find(s => 
                  s.insert_at === originalStep?.insert_at
                ) || activeTopping.assembly_steps?.[0];
                
                if (activeStep) {
                  displayStep = {
                    ...step,
                    title: activeStep.title,
                    description: activeStep.description,
                    tip: activeStep.tip,
                  };
                }
              }
              const localizedStep = localizeStep(displayStep, recipe, cms, fmt);
              const tipText = localizedStep.tip
                ? isNerd
                  ? localizedStep.tip.nerd
                  : localizedStep.tip.beginner
                : null;
              const parametricTip = getParametricTip(step.id, recipe.style.id, isNerd, cms.parametricTips);
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="procedure-timeline-step"
                >
                  {/* Node */}
                  <div
                    className={`procedure-timeline-step__node${
                      isFirst
                        ? " procedure-timeline-step__node--first"
                        : isLast
                          ? " procedure-timeline-step__node--last"
                          : ""
                    }`}
                  >
                    <StepIllustration
                      stepId={step.id}
                      size={34}
                      tone={isFirst || isLast ? "onAccent" : "accent"}
                      className="procedure-timeline-step__icon"
                    />
                  </div>
                  {/* Content */}
                  <div className="procedure-timeline-step__content">
                    {/* Orario inizio (prima del nome step, ben evidente) */}
                    <div className="procedure-timeline-step__time-row">
                      <span
                        className={`type-numeric procedure-timeline-step__time${
                          isFirst || isLast ? " procedure-timeline-step__time--accent" : ""
                        }`}
                      >
                        {times
                          ? displayStepTime(step.id, times.start, startTime, bcp47, cms.cooking)
                          : step.timing_label}
                      </span>
                    </div>
                    <span className="procedure-timeline-step__title">
                      {isToppingTimelineStep(step.id) ? cms.cooking.toppingTitle : localizedStep.title}
                    </span>
                    {isToppingTimelineStep(step.id) ? (
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={activeTopping?.id ?? "no-topping"}
                          className="procedure-timeline-step__topping"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        >
                        <ToppingSection mode="timeline" recipe={recipe} activeTopping={activeTopping} toppingChoices={toppingChoices} allToppingChoices={allToppingChoices} servingUnit={servingUnit} onSelectTopping={onSelectTopping} />
                        <p className="procedure-timeline-step__desc procedure-timeline-step__desc--topping">
                          {localizedStep.description}
                        </p>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <p className="procedure-timeline-step__desc">
                        {localizedStep.description}
                      </p>
                    )}
                    {step.duration_minutes > 0 && (
                      <span className="type-numeric procedure-timeline-step__duration">
                        {t(cms.cooking.durationLabel, { duration: fmtDuration(effDuration(i), fmt) })}
                        {(stretch[i] ?? 0) !== 0 && (
                          <span className="type-data-sm procedure-timeline-step__stretch">
                            {stretch[i]! > 0 ? "+" : "−"}
                            {t(cms.cooking.comfortLabel, {
                              duration: fmtDuration(Math.abs(stretch[i]!), fmt),
                            })}
                          </span>
                        )}
                      </span>
                    )}
                    {/* Audit UI giugno 2026 — "come si fa" e consigli vivono
                        dietro un toggle: la timeline si SCANSIONA, il dettaglio
                        arriva al tocco (e per intero nella Pizzata). */}
                    <StepDetails
                      longDesc={localizedStep.longDesc}
                      tips={[tipText, parametricTip].filter(Boolean) as string[]}
                      isNerd={isNerd}
                      stepId={step.id}
                      cms={cms}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
