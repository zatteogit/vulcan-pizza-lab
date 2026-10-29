import { RecipeAllergens } from "./recipe-allergens";
import { recipeAllergenScope } from "../../domain/allergen-scope";
/* ═══ INGREDIENTS SECTION — tab Ricetta (estratto fase 2, lug 2026) ═══
 * Stepper panetti, lista ingredienti (baker's % in nerd), scorporo
 * pre-fermento, Regola 55 e blocchi scienza PizzaNerd. */

import { HelpCircle, Printer } from "lucide-react";
import { motion } from "motion/react";
import { motionSpring } from "../../components/ds/motion";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { FlourBudget } from "./flour-budget";
import { YeastExplainer } from "./yeast-explainer";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { CtaButton, Stepper } from "../../components/ds/index";
import { Disclosure } from "../../components/ds/Disclosure";
import { buildRecipePhases, type DoughIngredientId } from "../../domain/recipe-phases";
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
  getServingUnitLabel,
  normalizeMeasureUnitSuffixes,
  phaseBakerPctText,
  phaseIngredientLabel,
  yeastDilutionText,
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
  onYeastSpeedChange,
  showRule55Tip,
  setShowRule55Tip,
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
  /* Nome del grasso nella lingua attiva (il motore dà un'etichetta italiana). */
  const fatType = recipe.style.dough.fat_type;
  const fatLabel = fatType === "butter" ? ui.fatButter : fatType === "lard" ? ui.fatLard : ui.oilEvo;
  const flourUseLabel = {
    weak: cms.ui.flourUseWeak,
    medium: cms.ui.flourUseMedium,
    strong: cms.ui.flourUseStrong,
    veryStrong: cms.ui.flourUseVeryStrong,
  }[flourStrength(recipe.flour_w)];
  /* FW-17: le dosi per fase vengono da un solo modello (domain/recipe-phases),
     lo stesso di Procedimento, modalità cottura e stampa. */
  const phases = buildRecipePhases(recipe);
  /* Baker's % (layer nerd accanto ai grammi): le stesse righe dei totali e lo
     stesso formato della stampa, così i due numeri non divergono (S08-A-09). */
  const bakerPct = (id: DoughIngredientId) => {
    const row = phases.totals.find((r) => r.id === id);
    return row ? phaseBakerPctText(row, bcp47) : undefined;
  };
  const dilution = phases.yeastDilution ? yeastDilutionText(phases.yeastDilution, fmt) : null;
  /* FW-17 (S08-A-15/B-10, D-042): per le tonde una persona = un panetto, quindi
     un solo stepper («Persone») e una riga che dice quanti panetti servono. */
  const perUnit = Math.max(1, getServingsRange(recipe.style)[0]);
  const singleStepper = perUnit === 1;
  /* Regola 55: bottone (?) e spiegazione. Senza prefermento stanno sulla riga
     Acqua; con un prefermento accanto alla temperatura dell'acqua dell'impasto
     finale, nello scorporo (FW-17, S08-A-07): la spiegazione è quella a quattro
     termini (rule55DescriptionText). */
  const rule55Toggle = recipe.water_temp_c != null ? (
    <button
      type="button"
      onClick={() => setShowRule55Tip((v) => !v)}
      className={`ingredients-rule55-toggle${showRule55Tip ? " ingredients-rule55-toggle--active" : ""}`}
      aria-label={showRule55Tip ? cms.cooking.rule55AriaClose : cms.cooking.rule55AriaOpen}
      aria-expanded={showRule55Tip}
    >
      <HelpCircle size={13} />
    </button>
  ) : null;
  const rule55Tip = recipe.water_temp_c != null && showRule55Tip ? (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={motionSpring.balanced}
      className="ingredients-rule55-tip"
    >
      {!waterTempLimit && (
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
      )}
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
  ) : null;
  const announceBalls = (actual: number) =>
    /* U-10 (F11): le quantità cambiano tutte insieme; lo si dice. */
    setBallsStatus(
      t(ui.quantitiesUpdatedStatus, {
        n: `${actual} ${getServingUnitLabel(cms, servingUnit, actual, cms.locale.id !== "de")}`,
      }),
    );
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
                    if (units !== constraints.dough_balls) {
                      const actual = updateBalls(units);
                      if (singleStepper) announceBalls(actual);
                    }
                  }}
                  decrementLabel={uiMessage("features.recipe.ingredients-section.peopleLess")}
                  incrementLabel={uiMessage("features.recipe.ingredients-section.peopleMore")}
                />
                {singleStepper && (
                  <p className="type-body ingredients-servings__note" data-region="servings-balls">
                    {normalizeMeasureUnitSuffixes(
                      uiMessage("recipe.phases.peopleBalls", [
                        constraints.dough_balls,
                        getServingUnitLabel(cms, servingUnit, constraints.dough_balls, cms.locale.id !== "de"),
                        fmt.grams(recipe.ball_weight_g),
                      ]),
                    )}
                    {panSizeLabel ? ` · ${panSizeLabel}` : ""}
                  </p>
                )}
                {singleStepper && <p role="status" className="sr-only">{ballsStatus}</p>}
              </div>
            );
          })()}
          {!singleStepper && (
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
              onChange={(n) => announceBalls(updateBalls(n))}
              decrementLabel={ui.ariaReduceBalls}
              incrementLabel={ui.ariaAddBalls}
            />
            <p role="status" className="sr-only">{ballsStatus}</p>
          </div>
          )}
        </div>
        <FlourBudget recipe={recipe} servingUnit={servingUnit} onApply={updateBalls} />

        {/* FW-17 (S08-B-02): con un prefermento la lista dà i totali; lo si dice
            prima, così farina, acqua e lievito non si pesano due volte. */}
        {phases.preFerment && (
          <p className="type-body ingredients-totals-note" data-region="totals-note">
            {uiMessage("recipe.phases.totalsIncludePreferment")}
          </p>
        )}
        <div className="ingredients-list">
          <IngRow
            name={ui.flour}
            detail={
              recipe.flour_blend && recipe.flour_blend.length > 0
                ? ui.flourMix
                : simple
                  ? (
                      /* FW-17 (S08-A-14): l'uso e la forza dicevano la stessa cosa due volte. */
                      <>
                        {/* FW-05 (S08-B-05): un'etichetta sola sulla scala unica. */}
                        {flourUseLabel} · <GlossaryWLink w={recipe.flour_w} />
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
                {fmt.percent(recipe.hydration_pct)}
                {/* FW-17 (S08-A-07): con un prefermento le acque sono due, con due
                    temperature: stanno nello scorporo, fase per fase. */}
                {recipe.water_temp_c != null && !phases.preFerment
                  ? ` · ${fmt.celsius(recipe.water_temp_c)}`
                  : ""}
                {/* Round 7 (nota Matteo): la Regola 55 vive come tip accanto alla
                    temperatura che spiega; con un prefermento quella temperatura
                    è nello scorporo, e il tip la segue (FW-17, S08-A-07). */}
                {!phases.preFerment && rule55Toggle}
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
          {!phases.preFerment && rule55Tip}
          {/* Audit lug 2026 (nerd): baker's % accanto ai grammi — il linguaggio
              con cui si confrontano le ricette. Easy resta pulito. */}
          <IngRow
            name={ui.salt}
            detail={isNerd ? bakerPct("salt") : undefined}
            amount={fmt.grams(recipe.salt_g)}
          />
          {recipe.yeast_g > 0 && (
            <IngRow
              name={cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type] || recipe.yeast_type}
              detail={[
                yeastPracticalHint(recipe.yeast_g, recipe.yeast_type, cms),
                isNerd ? bakerPct("yeast") : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              amount={fmt.grams(recipe.yeast_g)}
            />
          )}
          {/* FW-17 (D-O, S08-A-13/B-04): sotto il grammo, la diluizione si pesa
              con la bilancia da cucina. */}
          {dilution && (
            <Disclosure variant="inline" summary={dilution.title} className="ingredients-dilution">
              {dilution.body.map((line) => (
                <p key={line} className="type-body ingredients-dilution__text">{line}</p>
              ))}
            </Disclosure>
          )}
          {recipe.yeast_g > 0 && onYeastSpeedChange && (
            <YeastExplainer recipe={recipe} onSpeedFactorChange={onYeastSpeedChange} />
          )}
          {recipe.fat_g > 0 && (
            <IngRow
              name={fatLabel}
              detail={isNerd ? bakerPct("fat") : undefined}
              amount={fmt.grams(recipe.fat_g)}
            />
          )}
          {recipe.sugar_g > 0 && (
            <IngRow
              name={ui.sugar}
              detail={isNerd ? bakerPct("sugar") : undefined}
              amount={fmt.grams(recipe.sugar_g)}
            />
          )}
        </div>

        {/* FW-17 (S08-B-02): il totale subito sotto la lista, prima dello scorporo. */}
        <div className="type-numeric ingredients-total">
          <span className="ingredients-total__amount">{fmt.grams(phases.totalDoughG)}</span>
          <span className="ingredients-total__label">{ui.totalDough}</span>
        </div>

        {/* ── Scorporo pre-fermento (audit roleplay giugno 2026) ──
            FW-17: le fasi vengono da domain/recipe-phases (somma delle fasi =
            totali, zucchero compreso); la cella 2 parte dal prefermento. */}
        {phases.preFerment && (
          <section className="ingredients-preferment" aria-labelledby="ingredients-preferment-title">
            <h3 id="ingredients-preferment-title" className="type-data ingredients-preferment__title">
              {uiMessage("recipe.phases.splitTitle")}
            </h3>
            <div className="ingredients-preferment__grid">
              {phases.phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`ingredients-preferment__cell ${
                    phase.id === "preferment" ? "ingredients-preferment__cell--filled" : "ingredients-preferment__cell--divided"
                  }`}
                >
                  <h4
                    className={`type-data ingredients-preferment__label${
                      phase.id === "final" ? " ingredients-preferment__label--muted" : ""
                    }`}
                  >
                    {index + 1} ·{" "}
                    {phase.id === "preferment"
                      ? `${phases.preFerment!.name} (${cms.ui.statHydration.toLowerCase()} ${fmt.percent(phases.preFerment!.hydrationPct)})`
                      : cms.cooking.finalDoughStageTitle}
                  </h4>
                  <ul className="type-data ingredients-preferment__content ingredients-preferment__list">
                    {phase.ingredients
                      .filter((ing) => ing.grams > 0 || ing.note === "allInPreferment")
                      .map((ing) => (
                        <li key={ing.id}>
                          {phaseIngredientLabel(ing.id, recipe, cms, phases.preFerment!.name)}:{" "}
                          {ing.note === "allInPreferment" ? (
                            uiMessage("recipe.phases.waterAllInPreferment")
                          ) : (
                            <b>{fmt.grams(ing.grams)}</b>
                          )}
                          {ing.note === "allYeast" && ` (${uiMessage("recipe.phases.allYeast")})`}
                          {ing.id === "preferment" && ` (${uiMessage("recipe.phases.allPreferment")})`}
                        </li>
                      ))}
                    {phase.waterTempC != null && (
                      <li data-region="phase-water-temp">
                        {uiMessage("recipe.phases.waterTempLabel")}:{" "}
                        <b>
                          {phase.id === "preferment"
                            ? uiMessage("recipe.phases.estimateValue", [fmt.celsius(phase.waterTempC)])
                            : fmt.celsius(phase.waterTempC)}
                        </b>
                        {phase.id === "final" && rule55Toggle}
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            {rule55Tip}
            <p className="type-body ingredients-preferment__note">
              {/* FW-14 (S08-A-18): una sola nota sul sale, quella del CMS
                  (il testo di riserva diceva il perché ma non si vedeva mai). */}
              {cms.cooking.prefermentSaltNote}
            </p>
          </section>
        )}
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
            <PreFermentCard
              preFermentType={recipe.pre_ferment_type}
              /* FW-05 (S14-A-02): la dose vera della ricetta accanto alla guida. */
              recipeContext={recipe.yeast_type !== "sourdough" && recipe.yeast_g > 0
                ? {
                    // FW-17: la farina del prefermento dallo stesso modello delle fasi.
                    flourG: phases.phases.find((p) => p.id === "preferment")?.ingredients.find((i) => i.id === "flour")?.grams ?? 0,
                    yeastG: recipe.yeast_g,
                  }
                : undefined}
            />
          </NerdAuraBlock>
        )}
      </div>
    </>
  );
}
