import { RecipeAllergens } from "./recipe-allergens";
import { recipeAllergenScope } from "../../domain/allergen-scope";
/* ═══ INGREDIENTS SECTION — tab Ricetta (estratto fase 2, lug 2026) ═══
 * Stepper panetti, lista ingredienti (baker's % in nerd), scorporo
 * pre-fermento, Regola 55 e blocchi scienza PizzaNerd. */

import { Printer } from "lucide-react";
import { useState } from "react";
import { FlourBudget } from "./flour-budget";
import { YeastExplainer } from "./yeast-explainer";
import { WhyButton } from "../science/why-button";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { CtaButton, Stepper } from "../../components/ds/index";
import { computePreFermentSplit } from "../../domain/pre-ferment-split";
import {
  type GeneratedRecipe,
  type UserConstraints,
  type getServingUnit,
  getServingsRange,
  MAX_DOUGH_BALLS,
  YEAST_LABELS,
} from "../../domain/pizza-engine";
import { PreFermentCard } from "./pre-ferment-guide";
import { GlossaryWLink, IngRow, NerdAuraBlock } from "./recipe-output-bits";
import {
  flourStrength,
  flourStrengthLabel,
  getServingUnitLabel,
  normalizeMeasureUnitSuffixes,
  yeastPracticalHint,
  yeastBakerPctText,
} from "./recipe-output-format";
import { uiMessage } from "../../i18n/ui-messages";
import { getScienceNote } from "../../data/science-notes";
import { roundForEvidence } from "../../domain/science/evidence";

/* FW-01 (S06-A-06/B-08): Aw e fattore Q10 sono stime, non misure: non più
 * decimali di quelli che la nota del registro consente. */
const AW_NOTE = getScienceNote("water-activity");
const Q10_NOTE = getScienceNote("q10-fermentation");

interface IngredientsSectionProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  simple?: boolean;
  isNerd: boolean;
  servingUnit: ReturnType<typeof getServingUnit>;
  panSizeLabel: string | null;
  updateBalls: (n: number) => number;
  /** M-11: correzione personale della lievitazione. */
  onYeastSpeedChange?: (factor: number) => void;
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
  onYeastSpeedChange,
  rule55Description,
}: IngredientsSectionProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const servingLabel = getServingUnitLabel(cms, servingUnit, 2);
  const [ballsStatus, setBallsStatus] = useState("");
  const [people, setPeople] = useState(
    () => constraints.dough_balls * Math.max(1, getServingsRange(recipe.style)[0]),
  );
  const waterTempLimit = recipe.science.water_temp_limit ?? null;
  /* Baker's % sul totale farina — layer nerd accanto ai grammi. */
  const bakerPct = (grams: number, maxDecimals = 1) =>
    `${new Intl.NumberFormat(bcp47, { maximumFractionDigits: maxDecimals }).format(
      (grams / recipe.flour_g) * 100,
    )}%`;
  /* Nome del grasso nella lingua attiva (il motore dà un'etichetta italiana). */
  const fatType = recipe.style.dough.fat_type;
  const fatLabel = fatType === "butter" ? ui.fatButter : fatType === "lard" ? ui.fatLard : ui.oilEvo;
  const flourUseLabel = {
    weak: cms.ui.flourUseWeak,
    medium: cms.ui.flourUseMedium,
    strong: cms.ui.flourUseStrong,
    veryStrong: cms.ui.flourUseVeryStrong,
  }[flourStrength(recipe.flour_w)];
  return (
    <>
      {/* ── Ingredients + panetti stepper ── */}
      <div data-region="section">
        <div className="ingredients-header">
          {/* U-10 (F16): h2 sotto l'h1 della ricetta (era h3, saltava un livello). */}
          <h2 className="ingredients-header__title">
            {ui.ingredients}
          </h2>
          {/* Visore di sezione — come "Perfetti per te" */}
          <div className="ingredients-header__divider" />
          {/* D-043: scheda di produzione stampabile (tutte le schede in fila). */}
          <CtaButton
            type="button"
            variant="secondary"
            elevated={false}
            onClick={() => window.dispatchEvent(new CustomEvent("vulcan:print-request"))}
            className="ingredients-print type-data"
          >
            <Printer size={14} aria-hidden="true" />
            {uiMessage("features.recipe.recipe-output.print")}
          </CtaButton>
        </div>

        {/* D-042: si parte dalle persone; l'app decide quante unità servono
            (una tonda a testa, le teglie in base all'area). */}
        <div className="ingredients-quantities">
          {(() => {
            const perUnit = Math.max(1, getServingsRange(recipe.style)[0]);
            const peopleShown =
              Math.ceil(people / perUnit) === constraints.dough_balls ? people : constraints.dough_balls * perUnit;
            return (
              <div className="ingredients-servings ingredients-servings--people">
                <span className="type-data ingredients-servings__label">
                  {uiMessage("features.recipe.ingredients-section.people")}
                </span>
                <Stepper
                  value={peopleShown}
                  min={1}
                  max={MAX_DOUGH_BALLS * perUnit}
                  inputLabel={uiMessage("features.recipe.ingredients-section.people")}
                  onChange={(n) => {
                    setPeople(n);
                    const units = Math.max(1, Math.ceil(n / perUnit));
                    if (units !== constraints.dough_balls) updateBalls(units);
                  }}
                  decrementLabel={uiMessage("features.recipe.ingredients-section.peopleLess")}
                  incrementLabel={uiMessage("features.recipe.ingredients-section.peopleMore")}
                />
              </div>
            );
          })()}
          <div className="ingredients-servings">
            <div className="ingredients-servings__heading">
              <span className="type-data ingredients-servings__label">
                {servingLabel}
              </span>
              <span className="type-body ingredients-servings__note">
                {normalizeMeasureUnitSuffixes(t(ui.doughBallsFrom, { w: fmt.grams(recipe.ball_weight_g) }))}
                {panSizeLabel ? ` · ${panSizeLabel}` : ""}
              </span>
            </div>
            <Stepper
              value={constraints.dough_balls}
              min={1}
              max={MAX_DOUGH_BALLS}
              inputLabel={servingLabel}
              onChange={(n) => {
                const actual = updateBalls(n);
                /* U-10 (F11): le quantità cambiano tutte insieme; lo si dice. */
                setBallsStatus(
                  t(ui.quantitiesUpdatedStatus, {
                    n: `${actual} ${getServingUnitLabel(cms, servingUnit, actual, cms.locale.id !== "de")}`,
                  }),
                );
              }}
              decrementLabel={ui.ariaReduceBalls}
              incrementLabel={ui.ariaAddBalls}
            />
            <p role="status" className="sr-only">{ballsStatus}</p>
          </div>
        </div>
        <FlourBudget recipe={recipe} servingUnit={servingUnit} onApply={updateBalls} />

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
                        {flourUseLabel} · <GlossaryWLink w={recipe.flour_w} /> {uiMessage("features.recipe.ingredients-section.p-l-c4730ae9")}{recipe.flour_pl}
                      </>
                    )
            }
            amount={fmt.grams(recipe.flour_g)}
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
                      {c.pct}%{c.w ? uiMessage("features.recipe.ingredients-section.w-value-f84aef04", [c.w]) : ""}
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
                    {uiMessage("features.recipe.ingredients-section.w-e07879a9")}{recipe.effective_gluten_w}
                  </span>
                </div>
              )}
            </div>
          )}
          <IngRow
            name={ui.water}
            detail={
              <>
                {/* FW-02 (S08-B-12): i due numeri dicono che cosa sono. */}
                {recipe.water_temp_c != null
                  ? uiMessage("recipe.ingredients.waterDetail", [
                      fmt.percent(recipe.hydration_pct),
                      fmt.celsius(recipe.water_temp_c),
                    ])
                  : uiMessage("recipe.ingredients.hydrationDetail", [fmt.percent(recipe.hydration_pct)])}
                {recipe.water_temp_c != null && (
                  /* Round 7 (nota Matteo): la Regola 55 vive SOLO nella riga
                     Acqua. FW-02: il «?» diventa il «Perché?» della nota
                     water-temp-rule, con i numeri di questa ricetta. */
                  <>
                    {" "}
                    <WhyButton noteId="water-temp-rule">
                      {!waterTempLimit && (
                        <p>
                          {recipe.water_temp_c < 5
                            ? t(cms.engineMessages["tip.waterTempCold"], {
                                temp: fmt.celsius(recipe.water_temp_c),
                              })
                            : t(cms.engineMessages["tip.waterTempNormal"], {
                                temp: fmt.celsius(recipe.water_temp_c),
                                ddt: fmt.celsius(recipe.science.desired_dough_temp_c),
                              })}
                        </p>
                      )}
                      <p>{rule55Description}</p>
                      {recipe.science.friction_factor > 0 && (
                        <p>
                          {t(cms.engineMessages["tip.frictionNote"], {
                            friction: fmt.celsiusDelta(recipe.science.friction_factor),
                          })}
                        </p>
                      )}
                    </WhyButton>
                  </>
                )}
              </>
            }
            amount={fmt.grams(recipe.water_g)}
          />
          {/* ENG-7: fuori dal range pratico dell'acqua (2–40 °C) la Regola 55 non
              basta da sola: diciamo cosa fare invece di tacere. */}
          {recipe.water_temp_c != null && waterTempLimit && (
            <p className="type-body ingredients-water-limit">
              {t(
                cms.engineMessages[
                  waterTempLimit === "max" ? "tip.waterTempLimitMax" : "tip.waterTempLimitMin"
                ],
                {
                  temp: fmt.celsius(recipe.water_temp_c),
                  ddt: fmt.celsius(recipe.science.desired_dough_temp_c),
                },
              )}
            </p>
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
              detail={
                <>
                  {[
                    yeastPracticalHint(recipe.yeast_g, recipe.yeast_type, cms),
                    isNerd ? bakerPct(recipe.yeast_g, 2) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  {/* FW-02 (S08-A-20): il «Perché?» della dose sta nella riga del
                      lievito, non fra il lievito e l'olio. */}
                  {onYeastSpeedChange && (
                    <> <YeastExplainer recipe={recipe} onSpeedFactorChange={onYeastSpeedChange} /></>
                  )}
                </>
              }
              amount={fmt.grams(recipe.yeast_g)}
            />
          )}
          {recipe.fat_g > 0 && (
            <IngRow
              name={fatLabel}
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
            flourPct: recipe.pre_ferment_flour_pct,
          });
          const { name } = split;
          const prefFlour = split.prefermentFlourG;
          const prefWater = split.prefermentWaterG;
          return (
            <div className="ingredients-preferment">
              <div className="ingredients-preferment__grid">
                <div className="ingredients-preferment__cell ingredients-preferment__cell--filled">
                  <div className="type-data ingredients-preferment__label">
                    1 · {name} ({`${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(split.hydrationPct)}`})
                  </div>
                  <div className="type-data ingredients-preferment__content">
                    {ui.flour}: <b>{fmt.grams(prefFlour)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(prefWater)}</b>
                    <br />
                    {cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type]}: <b>{fmt.grams(recipe.yeast_g)}</b> {uiMessage("features.recipe.ingredients-section.tutto-e2f163ad")}</div>
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
                    {recipe.fat_g > 0 ? <> · {fatLabel}: <b>{fmt.grams(recipe.fat_g)}</b></> : null}
                  </div>
                </div>
              </div>
              <div className="type-body ingredients-preferment__note">
                {/* FW-14 (S08-A-18): una sola nota sul sale, quella del CMS
                    (il testo di riserva diceva il perché ma non si vedeva mai). */}
                {cms.cooking.prefermentSaltNote}
              </div>
            </div>
          );
        })()}
        <div className="type-numeric ingredients-total">
          <span className="ingredients-total__amount">{fmt.grams(recipe.total_dough_g)}</span>
          <span className="ingredients-total__label">{ui.totalDough}</span>
        </div>
        <RecipeAllergens report={recipe.allergens} scope={recipeAllergenScope(recipe).scope} />

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
                  { l: `${cms.scienceLabels.yeastBaker} (baker's %)`, v: yeastBakerPctText(recipe.science.yeast_baker_pct, bcp47) },
                  { l: `${cms.scienceLabels.effectiveHours} @${fmt.celsius(18)}`, v: fmt.durationShort(recipe.science.effective_hours_18c) },
                  { l: `${cms.scienceLabels.q10Factor} vs ${fmt.celsius(18)}`, v: uiMessage("format.timesFactor", [fmt.number(roundForEvidence(recipe.science.q10_factor, Q10_NOTE))]) },
                  { l: cms.scienceLabels.waterActivity, v: fmt.number(roundForEvidence(recipe.science.water_activity, AW_NOTE), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
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
