import { getDefaultVersion } from "../data/style-versions";
import { getDefaultDoughBalls, type EngineMsg, type GeneratedRecipe, type PizzaStyle, type UserConstraints } from "../domain/pizza-engine";
import { FLEXIBLE_STEP_IDS, isColdPhase, totalPlannedMinutes } from "./cook-timing";
import { canonicalRecipeEntry, recipeFromEntry } from "./recipe-entry";

/** La ricetta che apre il link del percorso, /recipe/<id>?mode=adapted senza
 * altri parametri: la versione del tuo livello (getDefaultVersion) sulla tua
 * cucina, con i panetti di default dello stile, costruita come la scheda
 * (recipe.tsx). G4a-WP-04: prima si valutava la proposta di Crea
 * (tailoredRecipeEntry), che non è la ricetta che il link apre. */
export function learningPathRecipe(style: PizzaStyle, constraints: UserConstraints): GeneratedRecipe {
  const entry = canonicalRecipeEntry(style, undefined, null, getDefaultVersion(style.id, constraints.skill_level));
  return recipeFromEntry(entry, { ...constraints, dough_balls: getDefaultDoughBalls(style) });
}

/** A practical learning invitation must use the same recipe and constraints
 * as its adapted destination. No supported result means theory, not a promise. */
export function learningStyleForKitchen(preferredId: string, constraints: UserConstraints, styles: Record<string, PizzaStyle>): PizzaStyle | null {
  const candidates = [...new Set([preferredId, "teglia_romana", "padellino_torino", "focaccia_genovese", "tonda_romana"])];
  for (const id of candidates) {
    const style = styles[id];
    if (style && learningPathRecipe(style, constraints).verdict.outcome !== "not_feasible") return style;
  }
  return null;
}

/** G4a-WP-04 (S11-A-02): cosa aspetta chi apre la ricetta del percorso,
 * prima del clic, dalla stessa ricetta (learningPathRecipe): durata del piano
 * unico (FW-19), minuti delle attese in frigo con la stessa soglia della
 * Timeline comoda (pieghe e gesti sono a temperatura ambiente), e le
 * condizioni d'attrezzatura (teglia, piano di cottura) già emesse dal
 * verdetto, non ricostruite. */
export interface LearningPathPreview {
  totalMinutes: number;
  coldMinutes: number;
  equipment: EngineMsg[];
}

export function learningPathPreview(recipe: GeneratedRecipe): LearningPathPreview {
  return {
    totalMinutes: totalPlannedMinutes(recipe.timeline),
    coldMinutes: recipe.timeline.reduce((n, s) => n + (FLEXIBLE_STEP_IDS.has(s.id) && isColdPhase(s.id, recipe.fermentation_temp_c) ? s.duration_minutes : 0), 0),
    equipment: (recipe.verdict.conditions ?? []).filter((c) => c.kind === "pan" || c.kind === "deck").map((c) => c.message),
  };
}
