import type { AllergenId } from "../../data/allergen-data";
import { uiMessage } from "../../i18n/ui-messages";

export function allergenName(id: AllergenId): string {
  switch(id) {
    case "gluten": return uiMessage("allergen.name.gluten");
    case "crustaceans": return uiMessage("allergen.name.crustaceans");
    case "eggs": return uiMessage("allergen.name.eggs");
    case "fish": return uiMessage("allergen.name.fish");
    case "peanuts": return uiMessage("allergen.name.peanuts");
    case "soy": return uiMessage("allergen.name.soy");
    case "milk": return uiMessage("allergen.name.milk");
    case "nuts": return uiMessage("allergen.name.nuts");
    case "celery": return uiMessage("allergen.name.celery");
    case "mustard": return uiMessage("allergen.name.mustard");
    case "sesame": return uiMessage("allergen.name.sesame");
    case "sulphites": return uiMessage("allergen.name.sulphites");
    case "lupin": return uiMessage("allergen.name.lupin");
    case "molluscs": return uiMessage("allergen.name.molluscs");
  }
}

/** Sentence nouns are lower case except where the language requires capitals. */
export function inlineAllergenName(id: AllergenId, bcp47: string): string {
  const label = allergenName(id);
  return /^de(?:-|$)/i.test(bcp47) ? label : label.charAt(0).toLocaleLowerCase(bcp47) + label.slice(1);
}
