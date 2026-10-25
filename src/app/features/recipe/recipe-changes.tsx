import { RecipeConditionChips } from "./recipe-condition-chips";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { recipeDifferences } from "../../use-cases/recipe-entry";
import { useCms } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { engineMsgTexts } from "./engine-msg-text";

/** Il confronto è prima del gesto di ottimizzazione, o prima di generare una
 * proposta che contiene già gli adattamenti. Non richiede una conferma. */
export function RecipeChanges({ from, to, mode }: { from: GeneratedRecipe; to: GeneratedRecipe; mode: "included" | "preview" }) {
  const { cms, bcp47 } = useCms();
  const changes = engineMsgTexts(recipeDifferences(from, to), cms, bcp47);
  if (changes.length === 0) return null;
  return (
    <section className="match-rationale" data-recipe-changes={mode}>
      <p className="type-label">{mode === "included" ? cms.ui.recipeAdaptationsIncluded : cms.ui.recipeOptimizationChanges}</p>
      <p className="type-body-sm">{t(cms.ui.recipeScoreTransition, { from: from.scores.composite, to: to.scores.composite })}</p>
      <ul className="recipe-verdict__reasons">
        {changes.map(text => <li key={text} className="type-body-sm">{text}</li>)}
      </ul>
      {mode === "preview" && <RecipeConditionChips recipe={to} />}
    </section>
  );
}
