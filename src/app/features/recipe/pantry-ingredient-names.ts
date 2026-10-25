import { TOPPING_LIBRARY } from "../../data/topping-library";
import { pantryIngredientId } from "../../domain/pantry-ingredients";
import type { CmsContent } from "../cms/cms-context";

/** Persisted identities stay in the source language; only labels are localized.
 * Reuse the topping catalog's ingredient translations, including qualifiers. */
export function pantryIngredientNames(cms: CmsContent): Map<string, string> {
  const names = new Map([
    [pantryIngredientId("Sale"), cms.ui.salt],
    [pantryIngredientId("Zucchero"), cms.ui.sugar],
    [pantryIngredientId("Olio EVO"), cms.ui.oilEvo],
    [pantryIngredientId("Burro"), cms.ui.fatButter],
    [pantryIngredientId("Strutto"), cms.ui.fatLard],
    [pantryIngredientId("Acqua"), cms.ui.water],
  ]);
  for (const recipe of Object.values(TOPPING_LIBRARY)) {
    const translated = cms.toppingI18n?.recipes[recipe.id]?.ingredients;
    recipe.ingredients.forEach((ingredient, index) => {
      const id = pantryIngredientId(ingredient.name);
      if (!names.has(id)) names.set(id, translated?.[String(index)]?.name ?? ingredient.name);
    });
  }
  return names;
}
