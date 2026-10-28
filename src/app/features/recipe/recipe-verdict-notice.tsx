import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, ChevronRight } from "lucide-react";
import {
  feasibleAlternativeStyles,
  type GeneratedRecipe,
  type RecipeBlocker,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { summarizeVerdict } from "../../domain/verdict-summary";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { Surface } from "../../components/ds/index";
import { engineMsgTexts } from "./engine-msg-text";
import { uiMessage } from "../../i18n/ui-messages";

/* ═══ M-10 — «Così non è fattibile» ═══
 * Quando il motore dichiara la ricetta non fattibile, lo diciamo in cima, con
 * i motivi e le vie d'uscita: un orario più avanti e stili che con gli stessi
 * vincoli funzionano. La ricetta più vicina resta sotto, senza fingere che sia
 * quella chiesta.
 * FW-10: la causa principale si dice una volta, prima, con il rimedio
 * (summarizeVerdict); le altre cause stanno al livello 2, in «Perché e cosa
 * servirebbe». */

function blockerText(blocker: RecipeBlocker, cms: CmsContent, bcp47: string): string {
  const fmt = createFormatter(cms.ui, bcp47);
  switch (blocker.kind) {
    case "dietary_conflict":
    case "resource_excluded":
      return engineMsgTexts([blocker.message], cms, bcp47)[0];
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
    case "fermentation_too_long":
      return engineMsgTexts([{
        key: "gen.fermentationTooLong",
        fallback: "Lievitazione di {hours}: supera il massimo previsto da questa ricetta ({maxHours}). Scegli un metodo verificato per una durata maggiore.",
        params: { hours: blocker.fermentation_h, maxHours: blocker.style_max_h },
      }], cms, bcp47)[0];
    case "fermentation_temperature":
      return engineMsgTexts([{
        key: "gen.fermentationTemperature",
        fallback: "Questo metodo prevede maturazione a {requiredTemp}; è stata impostata a {temp}. Ripristina il regime previsto o scegli un altro metodo verificato.",
        params: { temp: blocker.actual_c, requiredTemp: blocker.required_c },
      }], cms, bcp47)[0];
  }
}

export function RecipeVerdictNotice({
  recipe,
  constraints,
  mealDeadline,
  embedded = false,
  showRecipeBelow = true,
  details,
}: {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  /** Con un orario del pasto le alternative devono starci nella finestra. */
  mealDeadline: boolean;
  /** Dentro il blocco «Compatibilità con la tua cucina»: senza riquadro né
   *  titolo, che li dà il blocco (nota di Matteo: avviso e compatibilità
   *  dicevano la stessa cosa due volte). */
  embedded?: boolean;
  /** A style preview has no generated recipe below its blocker explanation. */
  showRecipeBelow?: boolean;
  /** Livello 2 aggiuntivo (es. avvisi del pannello stile), dentro lo stesso
   *  «Perché e cosa servirebbe» delle cause secondarie. */
  details?: ReactNode;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const { verdict } = recipe;
  const notFeasible = verdict.outcome === "not_feasible";
  const summary = useMemo(() => summarizeVerdict(verdict), [verdict]);

  const alternatives = useMemo(
    () =>
      notFeasible
        ? feasibleAlternativeStyles(recipe.style, { ...constraints, meal_deadline: mealDeadline })
        : [],
    [notFeasible, recipe.style, constraints, mealDeadline],
  );

  if (!notFeasible || !summary.primary) return null;

  const primaryText = blockerText(summary.primary, cms, bcp47);
  const secondaryTexts = [...new Set(summary.secondary.map((b) => blockerText(b, cms, bcp47)))]
    .filter((text) => text !== primaryText);
  const remedy = summary.remedy;

  const body = (
    <>
      <p className="type-body recipe-verdict__reason">{primaryText}</p>
      {remedy?.kind === "later_time" && (
        <p className="type-body recipe-verdict__action">
          {t(cms.ui.verdictLaterTime, { hours: fmt.durationShort(remedy.hours) })}
        </p>
      )}
      {remedy?.kind === "review_diet" && (
        <Link to="/profile?tab=setup" className="type-body recipe-verdict__link">
          {uiMessage("verdict.reviewDiet")}
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      )}
      {alternatives.length > 0 && (
        <nav className="recipe-verdict__alternatives" aria-label={cms.ui.verdictAlternatives}>
          <p className="type-body recipe-verdict__action">{cms.ui.verdictAlternatives}</p>
          <ul className="recipe-verdict__links">
            {alternatives.map((style) => (
              <li key={style.id}>
                <Link to={`/recipe/${style.id}`} className="type-body recipe-verdict__link">
                  {style.name}
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {(secondaryTexts.length > 0 || details) && (
        <details className="recipe-verdict__more">
          <summary className="type-body-sm recipe-verdict__more-summary">{uiMessage("verdict.whyMore")}</summary>
          {secondaryTexts.length > 0 && (
            <ul className="recipe-verdict__reasons">
              {secondaryTexts.map((text) => (
                <li key={text} className="type-body-sm">{text}</li>
              ))}
            </ul>
          )}
          {details}
        </details>
      )}
      {showRecipeBelow && <p className="type-body recipe-verdict__footnote">{cms.ui.verdictRecipeBelow}</p>}
    </>
  );
  if (embedded) return <div data-region="section" className="recipe-verdict recipe-verdict--embedded">{body}</div>;

  return (
    <Surface as="section" className="recipe-verdict" aria-labelledby="recipe-verdict-title">
      <header className="recipe-verdict__header">
        <AlertTriangle aria-hidden="true" size={18} className="recipe-verdict__icon" />
        <h2 id="recipe-verdict-title" className="type-heading-xs recipe-verdict__title">
          {cms.ui.verdictTitle}
        </h2>
      </header>
      {body}
    </Surface>
  );
}
