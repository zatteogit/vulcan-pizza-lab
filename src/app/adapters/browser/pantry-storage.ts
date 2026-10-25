import type { UserConstraints } from "../../domain/pizza-engine";
import { normalizePantryFlourDetails } from "../../domain/pantry-ingredients";

/** Patch the same pantry document used by profile and quick selection. */
export function savePantryConstraints(constraints: UserConstraints): void {
  try {
    const previous = JSON.parse(localStorage.getItem("vulcan_pantry") ?? "{}");
    localStorage.setItem("vulcan_pantry", JSON.stringify({ ...previous,
      flours: constraints.pantry_flours, yeasts: constraints.pantry_yeasts,
      inventory_complete: constraints.pantry_inventory_complete,
      allow_purchase: constraints.allow_flour_purchase,
      excluded_flours: constraints.excluded_flours,
      flour_details: normalizePantryFlourDetails(constraints.pantry_flour_details),
      ingredients: constraints.pantry_ingredients,
      ingredients_complete: constraints.pantry_ingredients_complete,
      excluded_ingredients: constraints.excluded_ingredients,
      excluded_yeasts: constraints.excluded_yeasts,
    }));
  } catch { /* Live constraints still apply when browser storage is unavailable. */ }
}
