import { FLOURS_DB } from "../../data/flour-database";
import { uiMessage } from "../../i18n/ui-messages";

/* C-3 — nome di una farina della dispensa per id, nella lingua attiva. Lo usano
   le chip della dispensa e i messaggi del motore che citano le farine (mix). */
export function pantryFlourName(id: string): string {
  switch (id) {
    case "00": return uiMessage("features.recipe.user-needs.06dc5ab2");
    case "0": return uiMessage("features.recipe.user-needs.625e81ec");
    case "tipo_1": return uiMessage("features.recipe.user-needs.189a22b7");
    case "manitoba": return uiMessage("features.recipe.user-needs.c1a38647");
    case "integrale": return uiMessage("features.recipe.user-needs.596f723e");
    case "semola": return uiMessage("features.recipe.user-needs.8c3476b8");
    case "farro": return uiMessage("features.recipe.user-needs.cba26b1c");
    case "spelta": return uiMessage("features.recipe.user-needs.145c7e5d");
    case "kamut": return uiMessage("features.recipe.user-needs.23160bf9");
    case "segale": return uiMessage("features.recipe.user-needs.4d6ef95b");
    case "riso": return uiMessage("features.recipe.user-needs.1d5fb293");
    case "mais": return uiMessage("features.recipe.user-needs.41910105");
    case "saraceno": return uiMessage("features.recipe.user-needs.d1593536");
    case "avena": return uiMessage("features.recipe.user-needs.d11c4a10");
    case "ceci": return uiMessage("features.recipe.user-needs.f7a159a1");
    default: return FLOURS_DB.find((f) => f.id === id)?.name ?? id;
  }
}
