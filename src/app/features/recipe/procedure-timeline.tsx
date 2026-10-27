/* ═══ PROCEDURE TIMELINE — tab Procedimento (estratto fase 2, lug 2026) ═══
 * Banner compensazioni (nerd) + timeline con orari assoluti, stretch
 * flessibili, StepDetails e ToppingSection inline allo step Condimento. */

import { FlaskConical } from "lucide-react";
import { motion } from "motion/react";
import { motionDelay,motionSpring } from "../../components/ds/motion";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { getStepTroubleshooting } from "../../data/troubleshooting-data";
import { resolveStepVisual } from "../cooking/step-visual";
import { StepIllustration } from "../cooking/step-illustrations";
import { procedureTimelineRows } from "./procedure-step-identity";
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
  engineMessage,
} from "./recipe-output-format";
import { StepDetails } from "./recipe-step-details";
import { ToppingSection, type ToppingSectionProps } from "./topping-section";
import { uiMessage } from "../../i18n/ui-messages";

type Compensation = NonNullable<GeneratedRecipe["science"]>["compensations"][number];

interface ProcedureTimelineProps {
  recipe: GeneratedRecipe;
  isNerd: boolean;
  compensations: Compensation[];
  calendarReference: Date;
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
  calendarReference,
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
  const filled = recipe.timeline.some(step => resolveStepVisual(step) === "fill_internal");
  return (
    <>
      {/* ── Procedure / Timeline with inline tips ── */}
      <div data-region="section">
        {recipe.dough_balls > 1 && (
          <p className="procedure-timeline-step__desc">
            {engineMessage(cms, "timeline.batchModel", "Tempi stimati per una persona: stesura e condimento di tutte le unità, poi cotture una alla volta. Servizio scaglionato; nessuna sovrapposizione prevista.")}
          </p>
        )}
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
                  {uiMessage("features.recipe.procedure-timeline.nerd-2de974af")}</span>
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
            {procedureTimelineRows(recipe.timeline).map(({ step, phase, ordinal, key }, i) => {
              const isFirst = i === 0;
              const isLast = i === recipe.timeline.length - 1;
              const times = stepTimes[i];
              
              let displayStep = step;
              if (phase && activeTopping) {
                const activeStep = activeTopping.assembly_steps?.filter(s => s.insert_at === phase)[ordinal];
                
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
              const visual = resolveStepVisual(displayStep, { unleavened: !!recipe.style.dough.unleavened });
              const filling = visual === "fill_internal" || visual === "split_fill";
              const assemblyTitle = filling ? cms.cooking.fillingTitle ?? cms.cooking.toppingTitle : cms.cooking.toppingTitle;
              const tipText = localizedStep.tip
                ? isNerd
                  ? localizedStep.tip.nerd
                  : localizedStep.tip.beginner
                : null;
              const parametricTip = getParametricTip(step.id, recipe.style.id, isNerd, cms.parametricTips);
              const trouble = getStepTroubleshooting(step, { unleavened: !!recipe.style.dough.unleavened, filled });
              const stepFooter = <>
                {step.duration_minutes > 0 && (
                  <span className="type-numeric procedure-timeline-step__duration">
                    {t(cms.cooking.durationLabel, { duration: fmtDuration(effDuration(i), fmt) })}
                    {step.work_units && ` · ${step.work_units} × ${fmt.durationMinutes(step.minutes_per_unit!)}`}
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
                  unleavened={!!recipe.style.dough.unleavened}
                  preFermentType={recipe.pre_ferment_type}
                  cms={cms}
                  troubleshooting={trouble ? { ...trouble, title: localizedStep.title } : undefined}
                />
              </>;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionSpring.balanced,delay: i * motionDelay.collectionStep }}
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
                      stepId={displayStep.id}
                      visual={visual}
                      size={24}
                      variant={displayStep.variant}
                      unleavened={!!recipe.style.dough.unleavened}
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
                          ? displayStepTime(step.id, times.start, calendarReference, bcp47, cms.cooking)
                          : step.timing_label}
                      </span>
                    </div>
                    <span className="procedure-timeline-step__title">
                      {phase ? assemblyTitle : localizedStep.title}
                    </span>
                    {phase ? (
                      <div className="procedure-timeline-step__topping">
                        <ToppingSection mode="timeline" recipe={recipe} activeTopping={activeTopping} toppingChoices={toppingChoices} allToppingChoices={allToppingChoices} servingUnit={servingUnit} onSelectTopping={onSelectTopping}>
                          <p className="procedure-timeline-step__desc procedure-timeline-step__desc--topping">
                            {localizedStep.description}
                          </p>
                          {stepFooter}
                        </ToppingSection>
                      </div>
                    ) : (
                      <>
                        <p className="procedure-timeline-step__desc">
                          {localizedStep.description}
                        </p>
                        {stepFooter}
                      </>
                    )}
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
