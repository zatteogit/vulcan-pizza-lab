import { useId, useState } from "react";
import { Wheat } from "lucide-react";
import {
  doughBallsForFlour,
  type GeneratedRecipe,
  type getServingUnit,
} from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { CtaButton } from "../../components/ds/index";
import { getServingUnitLabel } from "./recipe-output-format";

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
  const [open, setOpen] = useState(false);
  const [grams, setGrams] = useState("");

  const budget = Number(grams.replace(",", "."));
  const fit = grams && budget > 0 ? doughBallsForFlour(recipe, budget) : null;
  const unit = (n: number) => getServingUnitLabel(cms, servingUnit, n, true);

  return (
    <div className="flour-budget">
      <button
        type="button"
        className="type-body flour-budget__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Wheat size={16} aria-hidden="true" />
        {ui.flourBudgetToggle}
      </button>
      {open && (
        <div className="flour-budget__panel">
          <label htmlFor={inputId} className="type-label flour-budget__label">
            {ui.flourBudgetInput}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={0}
            step={10}
            value={grams}
            onChange={(event) => setGrams(event.target.value)}
            className="flour-budget__input"
          />
          {fit && (
            <p className="type-body flour-budget__result" aria-live="polite">
              {fit.balls > 0
                ? t(ui.flourBudgetResult, {
                    n: fit.balls,
                    unit: unit(fit.balls),
                    used: fmt.grams(fit.flour_g),
                    left: fmt.grams(fit.leftover_g),
                  })
                : t(ui.flourBudgetTooLittle, { unit: unit(1), min: fmt.grams(fit.per_ball_g) })}
            </p>
          )}
          {fit && fit.balls > 0 && fit.balls !== recipe.dough_balls && (
            <CtaButton
              type="button"
              radius="lg"
              className="flour-budget__apply"
              onClick={() => onApply(fit.balls)}
            >
              {t(ui.flourBudgetApply, { n: fit.balls, unit: unit(fit.balls) })}
            </CtaButton>
          )}
        </div>
      )}
    </div>
  );
}
