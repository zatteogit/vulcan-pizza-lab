/* ═══ INGREDIENTS SECTION — tab Ricetta (estratto fase 2, lug 2026) ═══
 * Stepper panetti, lista ingredienti (baker's % in nerd), scorporo
 * pre-fermento, Regola 55 e blocchi scienza PizzaNerd. */

import { Check, Copy, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { Stepper } from "../../components/ds/index";
import { computePreFermentSplit } from "../../domain/pre-ferment-split";
import {
  type GeneratedRecipe,
  type UserConstraints,
  type getServingUnit,
  getServingsRange,
  YEAST_LABELS,
} from "../../domain/pizza-engine";
import { PreFermentCard } from "./pre-ferment-guide";
import { GlossaryWLink, IngRow, NerdAuraBlock } from "./recipe-output-bits";
import {
  engineMessage,
  flourStrengthLabel,
  getServingUnitLabel,
  gramsApprox,
  normalizeMeasureUnitSuffixes,
  yeastPracticalHint,
} from "./recipe-output-format";

export interface IngredientsSectionProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  simple?: boolean;
  isNerd: boolean;
  servingUnit: ReturnType<typeof getServingUnit>;
  panSizeLabel: string | null;
  updateBalls: (n: number) => void;
  copiedIng: boolean;
  handleCopyIngredients: () => void;
  showRule55Tip: boolean;
  setShowRule55Tip: Dispatch<SetStateAction<boolean>>;
  rule55Description: string;
}

export function IngredientsSection({
  recipe,
  constraints,
  simple,
  isNerd,
  servingUnit,
  panSizeLabel,
  updateBalls,
  copiedIng,
  handleCopyIngredients,
  showRule55Tip,
  setShowRule55Tip,
  rule55Description,
}: IngredientsSectionProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const servingLabel = getServingUnitLabel(cms, servingUnit, 2);
  /* Baker's % sul totale farina — layer nerd accanto ai grammi. */
  const bakerPct = (grams: number, maxDecimals = 1) =>
    `${new Intl.NumberFormat(bcp47, { maximumFractionDigits: maxDecimals }).format(
      (grams / recipe.flour_g) * 100,
    )}%`;
  return (
    <>
      {/* ── Ingredients + panetti stepper ── */}
      <div>
        <div className="flex items-center gap-3 sm:gap-4 mb-5">
          <h3
            className="font-serif flex-shrink-0"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 2.45rem)",
              lineHeight: "var(--leading-heading)",
            }}
          >
            {ui.ingredients}
          </h3>
          {/* Visore di sezione — come "Perfetti per te" */}
          <div
            className="flex-1 h-px"
            style={{ background: "var(--container-divider)" }}
          />
          <button
            onClick={handleCopyIngredients}
            className="flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full type-data-field active:scale-95"
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-medium)" as any,
              background: "var(--recipe-bg)",
              border: "1px solid var(--recipe-border)",
            }}
          >
            {copiedIng ? (
              <Check
                size={14}
                style={{ color: "var(--recipe-success)" }}
              />
            ) : (
              <Copy size={14} />
            )}
            {copiedIng ? ui.copied : ui.copy}
          </button>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-5 pb-4"
          style={{
            borderBottom: "1px solid var(--recipe-divider-subtle)",
          }}
        >
          <span
            className="type-data"
            style={{ color: "var(--text-muted)", fontWeight: "var(--weight-medium)" as any }}
          >
            {servingLabel}
          </span>
          <Stepper
            value={constraints.dough_balls}
            min={1}
            max={20}
            onChange={updateBalls}
            decrementLabel={ui.ariaReduceBalls}
            incrementLabel={ui.ariaAddBalls}
            buttonStyle={{
              background: "var(--recipe-bg)",
              border: "1px solid var(--recipe-border)",
            }}
            valueStyle={{
              fontSize: "var(--font-size-2-5xl)",
              fontWeight: "var(--weight-bold)" as any,
              color: "var(--recipe-highlight)",
            }}
          />
          <span
            className="type-body"
            style={{ color: "var(--text-muted)" }}
          >
            {normalizeMeasureUnitSuffixes(t(ui.doughBallsFrom, { w: fmt.grams(recipe.ball_weight_g) }))}
            {panSizeLabel ? ` · ${panSizeLabel}` : ""}
          </span>
          {/* Stima persone (range) accanto al counter */}
          {(() => {
            const [perMin, perMax] = getServingsRange(recipe.style);
            const totalMin = perMin * constraints.dough_balls;
            const totalMax = perMax * constraints.dough_balls;
            const peopleLabel = totalMin === totalMax
              ? t(engineMessage(
                  cms,
                  totalMin === 1 ? "serving.peopleOne" : "serving.peopleMany",
                  totalMin === 1 ? "≈ {n} persona" : "≈ {n} persone",
                ), { n: totalMin })
              : t(engineMessage(cms, "serving.peopleRange", "≈ {min}-{max} persone"), {
                  min: totalMin,
                  max: totalMax,
                });
            return (
              <span
                className="ml-auto px-2 py-0.5 rounded-md type-data"
                style={{
                  fontWeight: "var(--weight-medium)" as any,
                  color: "var(--text-muted)",
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border)",
                }}
                title={cms.cooking.ballEstimateTooltip}
              >
                {peopleLabel}
              </span>
            );
          })()}
        </div>

        <div className="flex flex-col">
          <IngRow
            name={ui.flour}
            detail={
              recipe.flour_blend && recipe.flour_blend.length > 0
                ? ui.flourMix
                : simple
                  ? (
                      <>
                        {flourStrengthLabel(recipe.flour_w, cms)} ·{" "}
                        <GlossaryWLink w={recipe.flour_w} />
                      </>
                    )
                  : (
                      <>
                        <GlossaryWLink w={recipe.flour_w} /> · P/L {recipe.flour_pl}
                      </>
                    )
            }
            amount={gramsApprox(recipe.flour_g, fmt)}
          />
          {recipe.flour_blend && recipe.flour_blend.length > 0 && (
            /* VPL-B2: breakdown del mix risolto. Ogni farina di frumento mostra la
             * propria W (supporta più frumenti, es. Bonci); le senza glutine no. */
            <div
              style={{
                paddingLeft: "var(--space-3)",
                marginTop: "calc(-1 * var(--space-1))",
                marginBottom: "var(--space-2)",
              }}
            >
              {recipe.flour_blend.map((c) => (
                <div
                  key={c.name}
                  className="flex items-baseline justify-between gap-4 py-1"
                >
                  <span className="type-body" style={{ color: "var(--text-muted)" }}>
                    ↳ {c.name}{" "}
                    <span className="type-numeric">
                      {c.pct}%{c.w ? ` · W${c.w}` : ""}
                    </span>
                  </span>
                  <span
                    className="type-numeric"
                    style={{ color: "var(--text-muted)", fontSize: "var(--font-size-md)" }}
                  >
                    {fmt.grams(c.grams)}
                  </span>
                </div>
              ))}
              {recipe.effective_gluten_w != null && (
                /* VPL-B2: forza glutinica efficace = W frumento diluita dalla
                 * quota senza glutine. Informativa, spiega perché il mix è più
                 * delicato di una farina di pari W. */
                <div
                  className="flex items-baseline justify-between gap-4 py-1"
                  style={{ marginTop: "var(--space-1)" }}
                >
                  <span className="type-body" style={{ color: "var(--text-muted)" }}>
                    {ui.flourEffectiveGluten}
                  </span>
                  <span
                    className="type-numeric"
                    style={{ color: "var(--text-muted)", fontSize: "var(--font-size-md)" }}
                  >
                    ≈ W{recipe.effective_gluten_w}
                  </span>
                </div>
              )}
            </div>
          )}
          <IngRow
            name={ui.water}
            detail={
              <>
                {fmt.percent(recipe.hydration_pct)}
                {recipe.water_temp_c != null
                  ? ` · ${fmt.celsius(recipe.water_temp_c)}`
                  : ""}
                {recipe.water_temp_c != null && (
                  /* Round 7 (nota Matteo): la Regola 55 vive SOLO come tip
                     della riga Acqua — la temperatura è già nel dettaglio. */
                  <button
                    onClick={() => setShowRule55Tip((v) => !v)}
                    className="ml-1.5 align-middle active:scale-90 transition-transform"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      opacity: showRule55Tip ? 0.85 : 0.5,
                      lineHeight: 1,
                    }}
                    aria-label={
                      showRule55Tip
                        ? cms.cooking.rule55AriaClose
                        : cms.cooking.rule55AriaOpen
                    }
                    aria-expanded={showRule55Tip}
                  >
                    <HelpCircle size={13} />
                  </button>
                )}
              </>
            }
            amount={gramsApprox(recipe.water_g, fmt)}
          />
          {recipe.water_temp_c != null && showRule55Tip && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="overflow-hidden"
              style={{
                paddingLeft: "var(--space-3)",
                marginTop: "var(--space-1)",
                marginBottom: "var(--space-2)",
              }}
            >
              <div
                className="type-body"
                style={{
                  color: "var(--text-muted)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {recipe.water_temp_c < 5
                  ? t(cms.engineMessages["tip.waterTempCold"], {
                      temp: fmt.celsius(recipe.water_temp_c),
                    })
                  : t(cms.engineMessages["tip.waterTempNormal"], {
                      temp: fmt.celsius(recipe.water_temp_c),
                      ddt: fmt.celsius(recipe.science.desired_dough_temp_c),
                    })}
              </div>
              <div
                className="type-body"
                style={{
                  color: "var(--text-muted)",
                  marginTop: 4,
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {rule55Description}
              </div>
              {recipe.science.friction_factor > 0 && (
                <div
                  className="type-data"
                  style={{ color: "var(--text-muted)", marginTop: 4 }}
                >
                  {t(cms.engineMessages["tip.frictionNote"], {
                    friction: fmt.celsiusDelta(recipe.science.friction_factor),
                  })}
                </div>
              )}
            </motion.div>
          )}
          {/* Audit lug 2026 (nerd): baker's % accanto ai grammi — il linguaggio
              con cui si confrontano le ricette. Easy resta pulito. */}
          <IngRow
            name={ui.salt}
            detail={isNerd ? bakerPct(recipe.salt_g) : undefined}
            amount={fmt.grams(recipe.salt_g)}
          />
          {recipe.yeast_g > 0 && (
            <IngRow
              name={cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type] || recipe.yeast_type}
              detail={[
                yeastPracticalHint(recipe.yeast_g, recipe.yeast_type, cms),
                isNerd ? bakerPct(recipe.yeast_g, 2) : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              amount={fmt.grams(recipe.yeast_g)}
            />
          )}
          {recipe.fat_g > 0 && (
            <IngRow
              name={recipe.fat_label || ui.oilEvo}
              detail={isNerd ? bakerPct(recipe.fat_g) : undefined}
              amount={fmt.grams(recipe.fat_g)}
            />
          )}
          {recipe.sugar_g > 0 && (
            <IngRow
              name={ui.sugar}
              detail={isNerd ? bakerPct(recipe.sugar_g) : undefined}
              amount={fmt.grams(recipe.sugar_g)}
            />
          )}
        </div>

        {/* ── Scorporo pre-fermento (audit roleplay giugno 2026) ──
            Una ricetta con biga/poolish senza dosi separate non è eseguibile:
            split canonico in domain/pre-ferment-split (testato). */}
        {recipe.has_pre_ferment && (() => {
          const split = computePreFermentSplit({
            flourG: recipe.flour_g,
            waterG: recipe.water_g,
            preFermentType: recipe.pre_ferment_type,
          });
          const { isPoolish, name } = split;
          const prefFlour = split.prefermentFlourG;
          const prefWater = split.prefermentWaterG;
          return (
            <div
              className="mt-5 rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--outline-variant)" }}
            >
              <div className="grid grid-cols-2">
                <div className="px-5 py-4" style={{ background: "var(--container-bg-low)" }}>
                  <div
                    className="type-data"
                    style={{
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-accent)",
                      fontWeight: "var(--weight-semibold)" as any,
                      marginBottom: 6,
                    }}
                  >
                    1 · {name} ({isPoolish ? `${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(100)}` : `${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(45)}`})
                  </div>
                  <div className="type-data" style={{ color: "var(--text-default)", lineHeight: 1.75, fontFeatureSettings: "'tnum'" }}>
                    {ui.flour}: <b>{fmt.grams(prefFlour)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(prefWater)}</b>
                    <br />
                    {cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type]}: <b>{fmt.grams(recipe.yeast_g)}</b> (tutto)
                  </div>
                </div>
                <div className="px-5 py-4" style={{ borderLeft: "1px solid var(--outline-variant)" }}>
                  <div
                    className="type-data"
                    style={{
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontWeight: "var(--weight-semibold)" as any,
                      marginBottom: 6,
                    }}
                  >
                    2 · {cms.cooking.finalDoughStageTitle}
                  </div>
                  <div className="type-data" style={{ color: "var(--text-default)", lineHeight: 1.75, fontFeatureSettings: "'tnum'" }}>
                    {ui.flour}: <b>{fmt.grams(split.mainFlourG)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(split.mainWaterG)}</b>
                    <br />
                    {ui.salt}: <b>{fmt.grams(recipe.salt_g)}</b>
                    {recipe.fat_g > 0 ? <> · {recipe.fat_label || ui.oilEvo}: <b>{fmt.grams(recipe.fat_g)}</b></> : null}
                  </div>
                </div>
              </div>
              <div
                className="px-5 py-3 type-body"
                style={{
                  color: "var(--text-muted)",
                  borderTop: "1px solid var(--outline-variant)",
                  lineHeight: 1.45,
                }}
              >
                {cms.cooking.prefermentSaltNote ??
                  "Il sale va sempre e solo nell'impasto finale: nel pre-fermento frenerebbe i lieviti."}
              </div>
            </div>
          );
        })()}
        <div
          className="mt-5 type-numeric"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-xl)",
          }}
        >
          {recipe.dough_balls} × {fmt.grams(recipe.ball_weight_g)} ={" "}
          {fmt.grams(recipe.total_dough_g)} {ui.totalDough}
        </div>

        {/* Regola 55: da round 7 vive SOLO come tip della riga Acqua. */}

        {/* La FlourSuggestionCard è stata spostata dentro il pannello Parametri (RecipeConfigurator) — è una scelta, non un risultato. */}

        {/* ── PizzaNerd parameters grid & Pre-ferment guide (redistributed inline in nerdMode) ── */}
        {isNerd && (
          <NerdAuraBlock className="mt-8">
            <div className="pt-6 border-t border-[var(--recipe-divider-subtle)] text-left">
              <h4 className="font-serif mb-4" style={{ color: "var(--text-default)", fontSize: "clamp(var(--font-size-3xl), 3vw, var(--font-size-5xl))" }}>
                {cms.ui.scienceTitle}
              </h4>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--recipe-tip-nerd-border)", background: "var(--recipe-tip-nerd-bg)" }}
              >
                {[
                  { l: `${cms.scienceLabels.yeastBaker} (baker's %)`, v: fmt.percent(recipe.science.yeast_baker_pct) },
                  { l: `${cms.scienceLabels.effectiveHours} @${fmt.celsius(18)}`, v: `${recipe.science.effective_hours_18c}h` },
                  { l: `${cms.scienceLabels.q10Factor} vs ${fmt.celsius(18)}`, v: `${recipe.science.q10_factor}×` },
                  { l: cms.scienceLabels.waterActivity, v: `${recipe.science.water_activity}` },
                  { l: cms.scienceLabels.glutenNetwork, v: `${recipe.science.gluten_network}/100` },
                  { l: cms.scienceLabels.proteolysis, v: `${recipe.science.proteolysis_index}/100` },
                  { l: cms.scienceLabels.desiredDoughTemp, v: fmt.celsius(recipe.science.desired_dough_temp_c) },
                  { l: cms.scienceLabels.frictionFactor, v: `+${fmt.celsiusDelta(recipe.science.friction_factor)}` },
                  { l: cms.scienceLabels.bakingEnergy, v: `${recipe.science.baking_energy_kj} kJ` },
                ].map((cell) => (
                  <div
                    key={cell.l}
                    className="px-5 py-4"
                    style={{ border: "0.5px solid var(--recipe-tip-nerd-border)" }}
                  >
                    <div
                      className="type-numeric"
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--weight-bold)" as any,
                        color: "var(--score-accent)",
                        fontFeatureSettings: "'tnum'",
                      }}
                    >
                      {cell.v}
                    </div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: "var(--space-1)", lineHeight: "var(--leading-normal)" }}>
                      {cell.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NerdAuraBlock>
        )}

        {isNerd && recipe.has_pre_ferment && (
          <NerdAuraBlock className="mt-6 mb-2" compact>
            <PreFermentCard preFermentType={recipe.pre_ferment_type} />
          </NerdAuraBlock>
        )}
      </div>
    </>
  );
}
