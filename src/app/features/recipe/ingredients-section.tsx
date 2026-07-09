/* ═══ INGREDIENTS SECTION — tab Ricetta (estratto fase 2, lug 2026) ═══
 * Stepper panetti, lista ingredienti (baker's % in nerd), scorporo
 * pre-fermento, Regola 55 e blocchi scienza PizzaNerd. */

import { HelpCircle } from "lucide-react";
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

interface IngredientsSectionProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  simple?: boolean;
  isNerd: boolean;
  servingUnit: ReturnType<typeof getServingUnit>;
  panSizeLabel: string | null;
  updateBalls: (n: number) => void;
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
  const flourUseLabel = (() => {
    if (recipe.flour_w >= 330) return "Manitoba o tipo 0 molto forte";
    if (recipe.flour_w >= 280) return "Tipo 0/00 forte per pizza";
    if (recipe.flour_w >= 220) return "Tipo 0 media forza";
    return "Tipo 00 debole/media";
  })();
  return (
    <>
      {/* ── Ingredients + panetti stepper ── */}
      <div data-region="section">
        <div className="ingredients-header">
          <h3 className="ingredients-header__title">
            {ui.ingredients}
          </h3>
          {/* Visore di sezione — come "Perfetti per te" */}
          <div className="ingredients-header__divider" />
        </div>

        <div className="ingredients-servings">
          <span className="type-data ingredients-servings__label">
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
          <span className="type-body ingredients-servings__note">
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
                className="type-data ingredients-servings__estimate"
                title={cms.cooking.ballEstimateTooltip}
              >
                {peopleLabel}
              </span>
            );
          })()}
        </div>

        <div className="ingredients-list">
          <IngRow
            name={ui.flour}
            detail={
              recipe.flour_blend && recipe.flour_blend.length > 0
                ? ui.flourMix
                : simple
                  ? (
                      <>
                        {flourUseLabel} · {flourStrengthLabel(recipe.flour_w, cms)} ·{" "}
                        <GlossaryWLink w={recipe.flour_w} />
                      </>
                    )
                  : (
                      <>
                        {flourUseLabel} · <GlossaryWLink w={recipe.flour_w} /> · P/L {recipe.flour_pl}
                      </>
                    )
            }
            amount={gramsApprox(recipe.flour_g, fmt)}
          />
          {recipe.flour_blend && recipe.flour_blend.length > 0 && (
            /* VPL-B2: breakdown del mix risolto. Ogni farina di frumento mostra la
             * propria W (supporta più frumenti, es. Bonci); le senza glutine no. */
            <div className="ingredients-blend">
              {recipe.flour_blend.map((c) => (
                <div key={c.name} className="ingredients-blend__row">
                  <span className="type-body ingredients-blend__name">
                    ↳ {c.name}{" "}
                    <span className="type-numeric">
                      {c.pct}%{c.w ? ` · W${c.w}` : ""}
                    </span>
                  </span>
                  <span className="type-numeric ingredients-blend__grams">
                    {fmt.grams(c.grams)}
                  </span>
                </div>
              ))}
              {recipe.effective_gluten_w != null && (
                /* VPL-B2: forza glutinica efficace = W frumento diluita dalla
                 * quota senza glutine. Informativa, spiega perché il mix è più
                 * delicato di una farina di pari W. */
                <div className="ingredients-blend__row ingredients-blend__row--gluten">
                  <span className="type-body ingredients-blend__name">
                    {ui.flourEffectiveGluten}
                  </span>
                  <span className="type-numeric ingredients-blend__grams">
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
                    className={`ingredients-rule55-toggle${showRule55Tip ? " ingredients-rule55-toggle--active" : ""}`}
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
              className="ingredients-rule55-tip"
            >
              <div className="type-body ingredients-rule55-tip__text">
                {recipe.water_temp_c < 5
                  ? t(cms.engineMessages["tip.waterTempCold"], {
                      temp: fmt.celsius(recipe.water_temp_c),
                    })
                  : t(cms.engineMessages["tip.waterTempNormal"], {
                      temp: fmt.celsius(recipe.water_temp_c),
                      ddt: fmt.celsius(recipe.science.desired_dough_temp_c),
                    })}
              </div>
              <div className="type-body ingredients-rule55-tip__desc">
                {rule55Description}
              </div>
              {recipe.science.friction_factor > 0 && (
                <div className="type-data ingredients-rule55-tip__friction">
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
            <div className="ingredients-preferment">
              <div className="ingredients-preferment__grid">
                <div className="ingredients-preferment__cell ingredients-preferment__cell--filled">
                  <div className="type-data ingredients-preferment__label">
                    1 · {name} ({isPoolish ? `${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(100)}` : `${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(45)}`})
                  </div>
                  <div className="type-data ingredients-preferment__content">
                    {ui.flour}: <b>{fmt.grams(prefFlour)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(prefWater)}</b>
                    <br />
                    {cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type]}: <b>{fmt.grams(recipe.yeast_g)}</b> (tutto)
                  </div>
                </div>
                <div className="ingredients-preferment__cell ingredients-preferment__cell--divided">
                  <div className="type-data ingredients-preferment__label ingredients-preferment__label--muted">
                    2 · {cms.cooking.finalDoughStageTitle}
                  </div>
                  <div className="type-data ingredients-preferment__content">
                    {ui.flour}: <b>{fmt.grams(split.mainFlourG)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(split.mainWaterG)}</b>
                    <br />
                    {ui.salt}: <b>{fmt.grams(recipe.salt_g)}</b>
                    {recipe.fat_g > 0 ? <> · {recipe.fat_label || ui.oilEvo}: <b>{fmt.grams(recipe.fat_g)}</b></> : null}
                  </div>
                </div>
              </div>
              <div className="type-body ingredients-preferment__note">
                {cms.cooking.prefermentSaltNote ??
                  "Il sale va sempre e solo nell'impasto finale: nel pre-fermento frenerebbe i lieviti."}
              </div>
            </div>
          );
        })()}
        <div className="type-numeric ingredients-total">
          <span className="ingredients-total__amount">{fmt.grams(recipe.total_dough_g)}</span>
          <span className="ingredients-total__label">{ui.totalDough}</span>
        </div>

        {/* Regola 55: da round 7 vive SOLO come tip della riga Acqua. */}

        {/* La FlourSuggestionCard è stata spostata dentro il pannello Parametri (RecipeConfigurator) — è una scelta, non un risultato. */}

        {/* ── PizzaNerd parameters grid & Pre-ferment guide (redistributed inline in nerdMode) ── */}
        {isNerd && (
          <NerdAuraBlock className="ingredients-aura-top">
            <div className="ingredients-science">
              <h4 className="ingredients-science__title">
                {cms.ui.scienceTitle}
              </h4>
              <div className="ingredients-science__grid">
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
                  <div key={cell.l} className="ingredients-science__cell">
                    <div className="type-numeric ingredients-science__value">
                      {cell.v}
                    </div>
                    <div className="ingredients-science__label">
                      {cell.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NerdAuraBlock>
        )}

        {isNerd && recipe.has_pre_ferment && (
          <NerdAuraBlock className="ingredients-aura-compact" compact>
            <PreFermentCard preFermentType={recipe.pre_ferment_type} />
          </NerdAuraBlock>
        )}
      </div>
    </>
  );
}
