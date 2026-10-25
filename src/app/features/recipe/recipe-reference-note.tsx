import type { GeneratedRecipe, OvenType } from "../../domain/pizza-engine";
import { stgDepartures, type StgDeparture } from "../../domain/recipe-reference";
import { uiMessage } from "../../i18n/ui-messages";

export function RecipeReferenceNote({ recipe, oven }: { recipe: GeneratedRecipe; oven?: OvenType }) {
  if (recipe.style.id !== "napoletana_stg") return null;
  const departures = stgDepartures(recipe, oven);
  const descriptions: Record<StgDeparture, string> = {
    wood: uiMessage("recipe.reference.wood"), bake: uiMessage("recipe.reference.bake"),
    flour: uiMessage("recipe.reference.flour"), pl: uiMessage("recipe.reference.pl"),
    fermentation: uiMessage("recipe.reference.fermentation"), cold: uiMessage("recipe.reference.cold"),
    preferment: uiMessage("recipe.reference.preferment"), yeast: uiMessage("recipe.reference.yeast"),
    additions: uiMessage("recipe.reference.additions"), weight: uiMessage("recipe.reference.weight"),
    topping: uiMessage("recipe.reference.topping"),
  };
  return (
    <aside className="recipe-reference-note">
      <p className="recipe-reference-note__title">{departures.length ? uiMessage("recipe.reference.outside") : uiMessage("recipe.reference.source")}</p>
      <details>
        <summary>{uiMessage("recipe.reference.details")}</summary>
        {departures.length > 0 && <ul>{departures.map(key => <li key={key}>{descriptions[key]}</li>)}</ul>}
        <p>{uiMessage("recipe.reference.disclaimer")}</p>
        <a href="https://www.masaf.gov.it/flex/cm/pages/ServeAttachment.php/L/IT/D/1%252F4%252Fa%252FD.54ec78491c37356fe33f/P/BLOB:ID=24230/E/pdf?mode=download" target="_blank" rel="noreferrer">{uiMessage("recipe.reference.specification")}</a>
      </details>
    </aside>
  );
}
