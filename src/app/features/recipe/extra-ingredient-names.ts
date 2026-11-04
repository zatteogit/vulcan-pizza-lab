import type { ExtraDoughIngredientId } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";

/** B4 (M4): nome tradotto di un ingrediente aggiuntivo dell'impasto. */
export function extraIngredientName(id: ExtraDoughIngredientId): string {
  switch (id) {
    case "malt_syrup": return uiMessage("dough.extra.malt_syrup");
    case "potato_flakes": return uiMessage("dough.extra.potato_flakes");
  }
}
