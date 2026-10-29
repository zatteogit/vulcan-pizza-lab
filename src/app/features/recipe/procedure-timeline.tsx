/* ═══ PROCEDURE TIMELINE — tab Procedimento (estratto fase 2, lug 2026) ═══
 * Banner compensazioni (nerd) + timeline con orari assoluti, stretch
 * flessibili, StepDetails e ToppingSection inline allo step Condimento. */

import { FlaskConical } from "lucide-react";
import { motion } from "motion/react";
import { motionDelay,motionSpring } from "../../components/ds/motion";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { COLD_RETARD_MAX_C, getStepTroubleshooting } from "../../data/troubleshooting-data";
import { resolveStepVisual } from "../cooking/step-visual";
import { StepIllustration } from "../cooking/step-illustrations";
import { procedureTimelineRows } from "./procedure-step-identity";
import type {
  GeneratedRecipe,
  getServingUnit,
  OvenType,
  TimelineStep,
} from "../../domain/pizza-engine";
import { NerdAuraBlock } from "./recipe-output-bits";
import {
  compGramsSuffix,
  displayStepTime,
  fmtDuration,
  formatCompVal,
  bakeSecondsPerRound,
  getParametricTip,
  type ParametricTipContext,
  localizeStep,
  engineMessage,
  stepQuantities,
} from "./recipe-output-format";
import { StepDetails } from "./recipe-step-details";
import { ToppingSection, type ToppingSectionProps } from "./topping-section";
import { uiMessage } from "../../i18n/ui-messages";
import { approxStartAt } from "../../use-cases/cook-plan";

type Compensation = NonNullable<GeneratedRecipe["science"]>["compensations"][number];

interface ProcedureTimelineProps {
  recipe: GeneratedRecipe;
  /** FW-07: forno della cucina effettiva, per la regola delle rotazioni. */
  ovenType?: OvenType;
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
  ovenType,
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
  // FW-19: le pieghe sono un passo; il consiglio della puntata non le ripete.
  const foldsInPlan = recipe.timeline.some((step) => step.id === "folds");
  // FW-07: il consiglio di cottura parla del forno della ricetta, passo per passo.
  const tipContext = (step: TimelineStep): ParametricTipContext => ({
    ovenTempC: recipe.oven_temp_c,
    cookSec: step.id === "bake" ? bakeSecondsPerRound(step, recipe.cook_time_sec) : recipe.cook_time_sec,
    ovenTempLabel: fmt.celsius(recipe.oven_temp_c),
    referenceTempLabel: fmt.celsius(recipe.style.baking.temp_c_ideal),
    ovenType,
    frying: step.variant === "fry",
    foldsInPlan,
  });
  return (
    <>
      {/* ── Procedure / Timeline with inline tips ── */}
      <div data-region="section">
        {recipe.dough_balls > 1 && (
          <p className="procedure-timeline-step__desc">
            {engineMessage(cms, "timeline.batchModel", "")}
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
          <div className="procedure-timeline-spine__rail" aria-hidden="true" />
          {/* FW-12 (S09-B-09): elenco ordinato, un titolo h3 per passo. */}
          <ol className="procedure-timeline-list">
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
              const parametricTip = getParametricTip(step.id, recipe.style.id, isNerd, cms.parametricTips, tipContext(step), cms.parametricText);
              /* FW-05: puntata in frigo (S13-B-02) e farina senza glutine, che a
                 catalogo ha W 0 (S13-B-14), restringono le diagnosi della fase. */
              const trouble = getStepTroubleshooting(step, {
                unleavened: !!recipe.style.dough.unleavened,
                filled,
                coldRetard: recipe.fermentation_temp_c <= COLD_RETARD_MAX_C,
                glutenFree: recipe.flour_w <= 0,
              });
              /* FW-19 (S09-A-11, S09-B-06): l'appretto mostra la sua durata
                 vera; gli ultimi minuti corrono mentre il forno scalda (il
                 passo dopo), e lo si dice qui invece che con un conto nel
                 preriscaldo. */
              const next = recipe.timeline[i + 1];
              const proofDuringPreheat =
                step.id === "proof" && next?.id === "preheat" && next.parallel_activity?.kind === "proof"
                  ? next.parallel_activity.duration_minutes
                  : 0;
              const stretchMin = stretch[i] ?? 0;
              const stepFooter = <>
                {step.duration_minutes > 0 && (
                  <span className="type-numeric procedure-timeline-step__duration">
                    {t(cms.cooking.durationLabel, { duration: fmtDuration(effDuration(i) + proofDuringPreheat, fmt) })}
                    {step.work_units && ` · ${step.work_units} × ${fmt.durationMinutes(step.minutes_per_unit!)}`}
                    {proofDuringPreheat > 0 && (
                      <span className="type-data-sm procedure-timeline-step__parallel">
                        {uiMessage(next?.variant === "oil" ? "recipe.procedure.proofDuringOil" : "recipe.procedure.proofDuringPreheat", [fmt.durationMinutes(proofDuringPreheat)])}
                      </span>
                    )}
                    {/* FW-19 (S09-A-19): la durata include già l'estensione;
                        l'etichetta dice perché, separata e senza segno attaccato. */}
                    {stretchMin !== 0 && (
                      <span className="type-data-sm procedure-timeline-step__stretch">
                        {uiMessage(stretchMin > 0 ? "recipe.procedure.comfortMore" : "recipe.procedure.comfortLess", [
                          fmtDuration(Math.abs(stretchMin), fmt),
                        ])}
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
                  variant={step.variant}
                  unleavened={!!recipe.style.dough.unleavened}
                  preFermentType={recipe.pre_ferment_type}
                  cms={cms}
                  troubleshooting={trouble ? { ...trouble, title: localizedStep.title } : undefined}
                />
              </>;
              return (
                <motion.li
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
                          ? displayStepTime(approxStartAt(recipe.timeline, i), times.start, calendarReference, bcp47, cms.cooking)
                          : step.timing_label}
                      </span>
                    </div>
                    <h3 className="procedure-timeline-step__title">
                      {phase ? assemblyTitle : localizedStep.title}
                    </h3>
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
                        {/* FW-17 (S09-A-06): le dosi del passo, dallo stesso modello
                            per fasi della scheda Ricetta e della modalità cottura. */}
                        {(() => {
                          const quantities = stepQuantities(step.id, recipe, cms, fmt, activeTopping);
                          return quantities.length > 0 ? (
                            <ul className="type-numeric procedure-timeline-step__quantities">
                              {quantities.map((q) => (
                                <li key={q.label}>
                                  {q.label} <strong>{q.value}</strong>
                                </li>
                              ))}
                            </ul>
                          ) : null;
                        })()}
                        {stepFooter}
                      </>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}
