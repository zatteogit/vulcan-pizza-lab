import { type PizzaStyle, type UserConstraints } from "../domain/pizza-engine";
import { tailoredRecipeEntry } from "./recipe-entry";

/** A practical learning invitation must use the same recipe and constraints
 * as its adapted destination. No supported result means theory, not a promise. */
export function learningStyleForKitchen(preferredId: string, constraints: UserConstraints, styles: Record<string, PizzaStyle>): PizzaStyle | null {
  const candidates = [...new Set([preferredId, "teglia_romana", "padellino_torino", "focaccia_genovese", "tonda_romana"])];
  for (const id of candidates) {
    const style = styles[id];
    if (style && tailoredRecipeEntry(style, constraints).recipe.verdict.outcome !== "not_feasible") return style;
  }
  return null;
}
