import { useMemo } from "react";
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";
import {
  feasibleAlternativeStyles,
  type GeneratedRecipe,
  type RecipeBlocker,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { Surface } from "../../components/ds/index";

/* ═══ M-10 — «Così non è fattibile» ═══
 * Quando il motore dichiara la ricetta non fattibile, lo diciamo in cima, con
 * i motivi e le vie d'uscita: un orario più avanti e stili che con gli stessi
 * vincoli funzionano. La ricetta più vicina resta sotto, senza fingere che sia
 * quella chiesta. */

function laterHours(blockers: RecipeBlocker[]): number | null {
  const hours = blockers.flatMap((b) =>
    b.kind === "time_window" || b.kind === "fermentation_too_short" ? [b.needed_h] : [],
  );
  return hours.length > 0 ? Math.max(...hours) : null;
}

export function RecipeVerdictNotice({
  recipe,
  constraints,
  mealDeadline,
}: {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  /** Con un orario del pasto le alternative devono starci nella finestra. */
  mealDeadline: boolean;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const { verdict } = recipe;
  const notFeasible = verdict.outcome === "not_feasible";

  const alternatives = useMemo(
    () =>
      notFeasible
        ? feasibleAlternativeStyles(recipe.style, { ...constraints, meal_deadline: mealDeadline })
        : [],
    [notFeasible, recipe.style, constraints, mealDeadline],
  );

  if (!notFeasible) return null;

  const reasons = verdict.blockers.map((blocker) => {
    switch (blocker.kind) {
      case "oven_too_cold":
        return t(cms.ui.verdictOvenTooCold, {
          oven: fmt.celsius(blocker.oven_c),
          min: fmt.celsius(blocker.style_min_c),
        });
      case "time_window":
        return t(cms.ui.verdictTimeWindow, {
          needed: fmt.durationShort(blocker.needed_h),
          available: fmt.durationShort(blocker.available_h),
        });
      case "fermentation_too_short":
        return t(cms.ui.verdictFermentationTooShort, {
          hours: fmt.durationShort(blocker.fermentation_h),
          min: fmt.durationShort(blocker.style_min_h),
        });
    }
  });
  const later = laterHours(verdict.blockers);

  return (
    <Surface as="section" className="recipe-verdict" aria-labelledby="recipe-verdict-title">
      <header className="recipe-verdict__header">
        <AlertTriangle aria-hidden="true" size={18} className="recipe-verdict__icon" />
        <h2 id="recipe-verdict-title" className="type-heading-xs recipe-verdict__title">
          {cms.ui.verdictTitle}
        </h2>
      </header>
      <ul className="recipe-verdict__reasons">
        {reasons.map((reason) => (
          <li key={reason} className="type-body recipe-verdict__reason">
            {reason}
          </li>
        ))}
      </ul>
      {later !== null && (
        <p className="type-body recipe-verdict__action">
          {t(cms.ui.verdictLaterTime, { hours: fmt.durationShort(later) })}
        </p>
      )}
      {alternatives.length > 0 && (
        <nav className="recipe-verdict__alternatives" aria-label={cms.ui.verdictAlternatives}>
          <p className="type-body recipe-verdict__action">{cms.ui.verdictAlternatives}</p>
          <ul className="recipe-verdict__links">
            {alternatives.map((style) => (
              <li key={style.id}>
                <Link to={`/recipe/${style.id}`} className="type-body recipe-verdict__link">
                  {style.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <p className="type-body recipe-verdict__footnote">{cms.ui.verdictRecipeBelow}</p>
    </Surface>
  );
}
