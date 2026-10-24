import { TOPPING_CONCEPTS, type ToppingConcept, type ToppingRecipe } from "../topping-library";
import type { ToppingTranslation } from "./types";

/* Applica una traduzione (I18N-2) a concetti, varianti e passi della libreria
   condimenti. Funzioni pure: restituiscono copie, l'italiano resta la fonte e
   il fallback di ogni campo mancante. */

export function localizeToppingConcept<T extends Pick<ToppingConcept, "name" | "description">>(
  id: string,
  concept: T,
  tr?: ToppingTranslation,
): T {
  const t = tr?.concepts[id];
  if (!t) return concept;
  return { ...concept, name: t.name ?? concept.name, description: t.description ?? concept.description };
}

export function localizeToppingRecipe(recipe: ToppingRecipe, tr?: ToppingTranslation): ToppingRecipe {
  if (!tr) return recipe;
  const t = tr.recipes[recipe.id];
  const step = <S extends { id: string; title: string; description: string; tip?: { beginner: string; nerd: string } }>(s: S): S => {
    const st = tr.steps[s.id];
    if (!st) return s;
    return {
      ...s,
      title: st.title ?? s.title,
      description: st.description ?? s.description,
      tip: s.tip ? { beginner: st.tip_beginner ?? s.tip.beginner, nerd: st.tip_nerd ?? s.tip.nerd } : s.tip,
    };
  };
  return {
    ...recipe,
    variant_name: t?.variant_name ?? recipe.variant_name,
    name: t?.name ?? recipe.name,
    description: t?.description ?? recipe.description,
    ingredients: recipe.ingredients.map((ing, i) => {
      const ti = t?.ingredients?.[String(i)];
      return ti ? { ...ing, name: ti.name ?? ing.name, notes: ti.notes ?? ing.notes } : ing;
    }),
    pre_prep_steps: recipe.pre_prep_steps?.map(step),
    assembly_steps: recipe.assembly_steps?.map(step),
    bake_adjustments: recipe.bake_adjustments
      ? { ...recipe.bake_adjustments, note: t?.bake_note ?? recipe.bake_adjustments.note }
      : recipe.bake_adjustments,
  };
}

/** Passo della timeline generato da un condimento: si riconosce dall'id. */
export function localizeToppingStepText(
  stepId: string,
  tr?: ToppingTranslation,
): { title?: string; description?: string; tipBeginner?: string; tipNerd?: string } | null {
  const st = tr?.steps[stepId];
  if (!st) return null;
  return { title: st.title, description: st.description, tipBeginner: st.tip_beginner, tipNerd: st.tip_nerd };
}

/** Concetto per id, già tradotto (o undefined se l'id non esiste). */
export function toppingConcept(id: string, tr?: ToppingTranslation): ToppingConcept | undefined {
  const concept = TOPPING_CONCEPTS[id];
  return concept ? localizeToppingConcept(id, concept, tr) : undefined;
}
