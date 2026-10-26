import type { Interpretation } from "../interpretation-library";
import type { SignatureRecipe } from "../signature-recipes";
import type { InspirationTranslation } from "./types";

/* Funzioni pure: restituiscono copie con i testi della lingua attiva;
   l'italiano resta il fallback di ogni campo mancante. */

export function localizeInterpretation(it: Interpretation, tr?: InspirationTranslation): Interpretation {
  const t = tr?.interpretations[it.id];
  if (!t) return it;
  return {
    ...it,
    signature_name: t.signature_name ?? it.signature_name,
    technique_signature: t.technique_signature ?? it.technique_signature,
    story: t.story ?? it.story,
    badge: t.badge ?? it.badge,
  };
}

export function localizeSignatureRecipe(recipe: SignatureRecipe, tr?: InspirationTranslation): SignatureRecipe {
  const t = tr?.recipes[recipe.id];
  if (!t) return recipe;
  return { ...recipe, name: t.name ?? recipe.name, description: t.description ?? recipe.description,
    ...(recipe.card || t.card ? {card:{...recipe.card,...t.card}} : {}),
  };
}
