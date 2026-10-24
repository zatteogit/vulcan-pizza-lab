import { FLOURS_DB } from "../../data/flour-database";
import { uiMessage } from "../../i18n/ui-messages";

/* C-3 — nome di una farina della dispensa per id, nella lingua attiva. Lo usano
   le chip della dispensa e i messaggi del motore che citano le farine (mix). */
export function pantryFlourName(id: string): string {
  switch (id) {
    case "00": return uiMessage("features.recipe.user-needs.farina-00-06dc5ab2");
    case "0": return uiMessage("features.recipe.user-needs.farina-0-625e81ec");
    case "tipo_1": return uiMessage("features.recipe.user-needs.farina-tipo-1-189a22b7");
    case "manitoba": return uiMessage("features.recipe.user-needs.manitoba-c1a38647");
    case "integrale": return uiMessage("features.recipe.user-needs.integrale-596f723e");
    case "semola": return uiMessage("features.recipe.user-needs.semola-rimacinata-8c3476b8");
    default: return FLOURS_DB.find((f) => f.id === id)?.name ?? id;
  }
}
