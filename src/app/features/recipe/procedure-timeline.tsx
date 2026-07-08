/* ═══ PROCEDURE TIMELINE — tab Procedimento (estratto fase 2, lug 2026) ═══
 * Banner compensazioni (nerd) + timeline con orari assoluti, stretch
 * flessibili, StepDetails e ToppingSection inline allo step Condimento. */

import { FlaskConical } from "lucide-react";
import { motion } from "motion/react";
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
          <NerdAuraBlock className="mb-6">
            <div
              className="rounded-2xl overflow-hidden text-left animate-in fade-in duration-200"
              style={{
                background: "var(--recipe-tip-nerd-bg)",
                border: "1px solid var(--recipe-tip-nerd-border)",
                borderLeft: "3px solid var(--score-accent)",
              }}
            >
          <div className="px-4 py-3 flex items-center gap-2.5"
                style={{ borderBottom: "1px solid var(--recipe-tip-nerd-border)" }}
              >
                <FlaskConical
                  size={14}
                  style={{ color: "var(--score-accent)", flexShrink: 0 }}
                />
                <span
                  className="type-data-field"
                  style={{
                    fontWeight: "var(--weight-semibold)" as any,
                    color: "var(--score-accent)",
                  }}
                >
                  {cms.misc.techAdjustmentsApplied}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md type-code"
                  style={{
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--score-accent)",
                    background: "var(--stat-nerd-pill-bg)",
                  }}
                >
                  Nerd
                </span>
                <span
                  className="type-numeric"
                  style={{
                    fontSize: "var(--font-size-md)",
                    color: "var(--text-muted)",
                    marginLeft: "auto",
                  }}
                >
                  {compensations.length}
                </span>
              </div>
              <div className="px-4 py-2.5 flex flex-col gap-2">
                {compensations.map((c, i) => (
                  <div
                    key={`${c.type}-${i}`}
                    className="flex items-baseline justify-between gap-3 type-body"
                  >
                    <span style={{ color: "var(--text-default)" }}>
                      {c.reason}{compGramsSuffix(c, recipe.flour_g)}
                    </span>
                    <span
                      className="type-numeric flex-shrink-0"
                      style={{
                        color: "var(--score-accent)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
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
        <div className="relative">
          <div
            className="absolute left-[20px] top-5 bottom-5 w-px"
            style={{ background: "var(--recipe-divider)" }}
          />
          <div className="flex flex-col gap-0">
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
                  className="flex gap-5 pb-9 last:pb-0"
                >
                  {/* Node */}
                  <div
                    className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFirst
                        ? "var(--recipe-node-first-bg)"
                        : isLast
                          ? "var(--recipe-node-last-bg)"
                          : "var(--recipe-node-mid-bg)",
                      color:
                        isFirst || isLast
                          ? "var(--text-on-accent)"
                          : "var(--recipe-node-accent)",
                      border:
                        isFirst || isLast
                          ? "none"
                          : "2px solid var(--recipe-border)",
                    }}
                  >
                    <StepIllustration
                      stepId={step.id}
                      size={34}
                      tone={isFirst || isLast ? "onAccent" : "accent"}
                      style={{ opacity: 1 }}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Orario inizio (prima del nome step, ben evidente) */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-md type-numeric"
                        style={{
                          fontSize: "var(--font-size-md)",
                          fontWeight: "var(--weight-bold)" as any,
                          background:
                            isFirst || isLast
                              ? "var(--recipe-badge-accent-bg)"
                              : "var(--recipe-bg)",
                          color:
                            isFirst || isLast
                              ? "var(--recipe-badge-accent-text)"
                              : "var(--text-default)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {times
                          ? displayStepTime(step.id, times.start, startTime, bcp47, cms.cooking)
                          : step.timing_label}
                      </span>
                    </div>
                    <span
                      style={{
                        color: "var(--text-default)",
                        fontSize: "var(--font-size-3xl)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      {isToppingTimelineStep(step.id) ? cms.cooking.toppingTitle : localizedStep.title}
                    </span>
                    {isToppingTimelineStep(step.id) ? (
                      <>
                        <ToppingSection mode="timeline" recipe={recipe} activeTopping={activeTopping} toppingChoices={toppingChoices} allToppingChoices={allToppingChoices} servingUnit={servingUnit} onSelectTopping={onSelectTopping} />
                        <p
                          className="mt-3"
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "var(--font-size-2xl)",
                            lineHeight: "var(--leading-reading)",
                          }}
                        >
                          {localizedStep.description}
                        </p>
                      </>
                    ) : (
                      <p
                        className="mt-1"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-2xl)",
                          lineHeight: "var(--leading-reading)",
                        }}
                      >
                        {localizedStep.description}
                      </p>
                    )}
                    {step.duration_minutes > 0 && (
                      <span
                        className="inline-block mt-1.5 type-numeric"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-lg)",
                        }}
                      >
                        {t(cms.cooking.durationLabel, { duration: fmtDuration(effDuration(i), fmt) })}
                        {(stretch[i] ?? 0) !== 0 && (
                          <span
                            className="ml-1.5 px-1.5 py-0.5 rounded type-data-sm"
                            style={{
                              fontWeight: "var(--weight-semibold)" as any,
                              background: "var(--recipe-comfort-chip-bg)",
                              color: "var(--recipe-success)",
                            }}
                          >
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
