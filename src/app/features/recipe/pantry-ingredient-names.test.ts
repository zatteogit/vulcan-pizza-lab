import { describe, expect, it } from "vitest";
import { IT_LOCALE } from "../cms/locales/it";
import { EN_LOCALE } from "../cms/locales/en";
import { DE_LOCALE } from "../cms/locales/de";
import { ES_LOCALE } from "../cms/locales/es";
import { FR_LOCALE } from "../cms/locales/fr";
import { PT_LOCALE } from "../cms/locales/pt";
import { JA_LOCALE } from "../cms/locales/ja";
import { TOPPING_LIBRARY } from "../../data/topping-library";
import { pantryIngredientId } from "../../domain/pantry-ingredients";
import { pantryIngredientNames } from "./pantry-ingredient-names";
import { engineMsgTexts } from "./engine-msg-text";

describe("ingredienti tradotti senza cambiare le identità salvate", () => {
  for (const cms of [EN_LOCALE, DE_LOCALE, ES_LOCALE, FR_LOCALE, PT_LOCALE, JA_LOCALE]) {
    const lang = cms.locale.id;
    it(`${lang}: dispensa e avvisi usano le stesse etichette tradotte`, () => {
      const names = pantryIngredientNames(cms);
      expect([...names.keys()]).toEqual([...pantryIngredientNames(IT_LOCALE).keys()]);
      expect(names.get("olio_evo")).toBe(cms.ui.oilEvo);
      expect(names.get("burro")).toBe(cms.ui.fatButter);
      expect(names.get("strutto")).toBe(cms.ui.fatLard);
      expect(names.get("acqua")).toBe(cms.ui.water);
      const ingredient = TOPPING_LIBRARY.margherita_napoletana_avpn.ingredients[0];
      const translated = cms.toppingI18n!.recipes.margherita_napoletana_avpn.ingredients!["0"].name!;
      expect(names.get(pantryIngredientId(ingredient.name))).toBe(translated);
      const messages = engineMsgTexts([
        { key: "need.ingredient", fallback: "", params: { ingredient: ingredient.name } },
        { key: "need.excludedIngredient", fallback: "", params: { ingredient: "Burro" } },
        { key: "need.excludedIngredient", fallback: "", params: { ingredient: "fresh" } },
      ], cms, lang);
      expect(messages[0]).toContain(translated);
      expect(messages[1]).toContain(cms.ui.fatButter);
      expect(messages[2]).toContain(cms.yeastLabels.fresh);
    });
  }
  it("non conserva una lingua precedente al cambio di catalogo", () => {
    const italian = pantryIngredientNames(IT_LOCALE);
    const english = pantryIngredientNames(EN_LOCALE);
    expect(italian.get("acqua")).toBe("Acqua");
    expect(english.get("acqua")).toBe("Water");
    expect(pantryIngredientNames(IT_LOCALE).get("acqua")).toBe("Acqua");
  });
});
