import { TriangleAlert, Info } from "lucide-react";
import { dietaryRecipeAlternatives, type GeneratedRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { getToppingForStyle } from "../../data/topping-library";
import { localizeToppingRecipe, toppingConcept } from "../../data/topping-i18n/localize";
import { CtaButton } from "../../components/ds/index";
import { useMemo } from "react";
import { recipeDisplayName } from "../../domain/recipe-reference";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";

/** Other recipe tabs retain dietary constraints even when the score card is
 * outside the selected panel. The findings come from the evaluated recipe. */
export function RecipeDietaryNotice({ recipe }: { recipe: GeneratedRecipe }) {
  const { cms, bcp47 } = useCms();
  if (!recipe.dietary_warnings?.length) return null;
  return <div className="home-dietary-warnings" role="status">
    <div className="home-dietary-warnings__title">{cms.pages.dietaryWarningsTitle}</div>
    {recipe.dietary_warnings.map((warning, i) => <div key={`${warning.filterId}-${i}`}
      className={warning.severity === "critical" ? "home-dietary-warning home-dietary-warning--critical"
        : warning.severity === "info" ? "home-dietary-warning home-dietary-warning--info" : "home-dietary-warning home-dietary-warning--warning"}>
      {warning.severity === "info" ? <Info size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />}
      <div className="home-dietary-warning__body">
        <p className="home-dietary-warning__message">{engineMsgTexts([warning.message], cms, bcp47)[0]}</p>
        <p className="home-dietary-warning__tip">{engineMsgTexts([warning.tip], cms, bcp47)[0]}</p>
      </div>
    </div>)}
  </div>;
}

/** Choosing a proposal changes the actual topping; it never clears a filter. */
export function RecipeDietaryAlternatives({ recipe, constraints, onSelect }: {
  recipe: GeneratedRecipe; constraints: UserConstraints; onSelect: (id: string) => void;
}) {
  const { cms, bcp47 } = useCms();
  const alternatives = useMemo(() => dietaryRecipeAlternatives(recipe, constraints), [recipe, constraints]);
  const text = (key: string, fallback: string, params?: import("../../domain/pizza-engine").EngineMsg["params"]) =>
    engineMsgTexts([{key, fallback, params}], cms, bcp47)[0];
  if (recipe.dietary_variant) return <p className="home-dietary-warning__message">{text("diet.variant", "Versione di {recipe} senza {ingredients}", {recipe:recipeDisplayName(recipe, constraints.oven_type), ingredients:recipe.dietary_variant.omitted_conflicts})}</p>;
  if (!alternatives.length) return null;
  return <div className="home-dietary-warnings">
    {alternatives.map(a => {
      const topping = getToppingForStyle(a.topping_id, recipe.style)!;
      const localized = localizeToppingRecipe(topping, cms.toppingI18n);
      return <div key={a.topping_id} className="home-dietary-warning home-dietary-warning--info">
        <Info size={16} aria-hidden="true" />
        <div className="home-dietary-warning__body">
          <p className="home-dietary-warning__message"><strong>{localized.name ?? toppingConcept(topping.concept_ref, cms.toppingI18n)?.name ?? localized.variant_name ?? topping.concept_ref}</strong></p>
          <p className="home-dietary-warning__tip">{text("diet.variant", "Versione di {recipe} senza {ingredients}", {recipe:recipeDisplayName(recipe, constraints.oven_type), ingredients:a.omitted_conflicts})}</p>
          <p className="home-dietary-warning__tip">{text("diet.variantChanges", "Rimossi: {ingredients}.", {ingredients:a.removed})}</p>
          {a.added.length > 0 && <p className="home-dietary-warning__tip">{text("diet.variantAdded", "Ingredienti aggiunti: {ingredients}.", {ingredients:a.added})}</p>}
          {a.recipe.method_changes?.map(note => <p key={note.key} className="home-dietary-warning__tip">{engineMsgTexts([note],cms,bcp47)[0]}</p>)}
          <CtaButton type="button" variant="secondary" className="home-dietary-variant__action" onClick={() => onSelect(a.topping_id)}>{text("diet.useVariant", "Usa questa versione")}</CtaButton>
        </div>
      </div>;
    })}
  </div>;
}
