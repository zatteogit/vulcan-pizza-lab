import { useId, useState } from "react";
import { AlertCircle, Wheat } from "lucide-react";
import {
  doughBallsForFlour,
  MAX_DOUGH_BALLS,
  type GeneratedRecipe,
  type getServingUnit,
} from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { CtaButton } from "../../components/ds/index";
import { getServingUnitLabel } from "./recipe-output-format";
import { parseLocaleGrams } from "./flour-budget-number";

/* ═══ U-2 — «ho 750 g di farina» ═══
 * Invece di scegliere i panetti, si parte dalla farina in dispensa: il motore
 * dice quanti ce ne stanno e quanta farina avanza; un tocco li applica. */

export function FlourBudget({
  recipe,
  servingUnit,
  onApply,
}: {
  recipe: GeneratedRecipe;
  servingUnit: ReturnType<typeof getServingUnit>;
  onApply: (balls: number) => void;
}) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const inputId = useId();
  const panelId = useId();
  const feedbackId = useId();
  const [open, setOpen] = useState(false);
  const [grams, setGrams] = useState("");

  /* Revisione G2: «1.500» / «1,500» sono migliaia secondo la lingua, mai 1,5 g. */
  const budget = parseLocaleGrams(grams, bcp47);
  /* S06-A-24 / S06-B-22: zero, negativi o testo non numerico non tacciono. */
  const invalid = grams.trim() !== "" && !(budget > 0 && budget < Infinity);
  const fit = grams.trim() && !invalid ? doughBallsForFlour(recipe, budget) : null;
  const unit = (n: number) => getServingUnitLabel(cms, servingUnit, n, true);
  const same = fit !== null && fit.balls > 0 && fit.balls === recipe.dough_balls;

  return (
    <div className="flour-budget">
      <button
        type="button"
        className="type-body flour-budget__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Wheat size={16} aria-hidden="true" />
        {ui.flourBudgetToggle}
      </button>
      {open && (
        <div id={panelId} className="flour-budget__panel">
          <label htmlFor={inputId} className="type-label flour-budget__label">
            {ui.flourBudgetInput}
          </label>
          <input
            id={inputId}
            /* Testo e non type="number": «-», «abc» o «0» restano visibili e
               ricevono il loro messaggio, e la virgola decimale vale. */
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={grams}
            onChange={(event) => setGrams(event.target.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? feedbackId : undefined}
            className="flour-budget__input"
          />
          {/* Regione live sempre montata: annuncia ogni nuovo esito. */}
          <div id={feedbackId} className="flour-budget__feedback" aria-live="polite">
            {invalid && (
              <p className="type-body flour-budget__result flour-budget__result--invalid">
                <AlertCircle size={16} aria-hidden="true" />
                {ui.flourBudgetInvalid}
              </p>
            )}
            {fit && (
              <p className="type-body flour-budget__result">
                {fit.capped
                  ? /* D-043: il tetto per ricetta, detto e non nascosto. */
                    t(ui.flourBudgetCapped, {
                      max: fmt.number(MAX_DOUGH_BALLS),
                      unit: unit(MAX_DOUGH_BALLS),
                      left: fmt.grams(fit.leftover_g),
                    })
                  : fit.balls > 0
                    ? t(ui.flourBudgetResult, {
                        n: fmt.number(fit.balls),
                        unit: unit(fit.balls),
                        used: fmt.grams(fit.flour_g),
                        left: fmt.grams(fit.leftover_g),
                      })
                    : t(ui.flourBudgetTooLittle, { unit: unit(1), min: fmt.grams(fit.per_ball_g) })}
              </p>
            )}
            {same && <p className="type-body flour-budget__result">{ui.flourBudgetSame}</p>}
          </div>
          {fit && fit.balls > 0 && !same && (
            <CtaButton
              type="button"
              radius="lg"
              className="flour-budget__apply"
              onClick={() => onApply(fit.balls)}
            >
              {t(ui.flourBudgetApply, { n: fmt.number(fit.balls), unit: unit(fit.balls) })}
            </CtaButton>
          )}
        </div>
      )}
    </div>
  );
}
