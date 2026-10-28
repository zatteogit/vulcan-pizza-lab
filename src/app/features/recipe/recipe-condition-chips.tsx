import { ListChecks, TriangleAlert } from "lucide-react";
import { recipeCardSignals } from "./recipe-card-signals";
import { Badge } from "../../components/ds/index";
import type { EngineMsg, GeneratedRecipe } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";

/** The badge never suggests a purchase can repair a failed cooking method.
 * Missing supplies and unverified pantry contents retain distinct wording.
 * FW-03 (S07-A-07): the chip is a status, not help: a checklist icon, never a
 * «?» that promises an explanation the static badge cannot open. */
export function RecipeConditionChips({ recipe, id, compact = false }: { recipe: GeneratedRecipe; id?: string; compact?: boolean }) {
  const { cms, bcp47 } = useCms();
  const blocked = recipe.verdict.outcome === "not_feasible";
  const messages: EngineMsg[] = blocked ? recipe.verdict.blockers.map(b => b.kind === "resource_excluded" ? b.message : b.kind === "oven_too_cold"
    ? { key: "need.blockedOven", fallback: "Forno insufficiente" }
    : b.kind === "fermentation_temperature" ? { key: "need.blockedMethod", fallback: "Regime non compatibile" }
    : { key: "need.blockedTime", fallback: "Tempo insufficiente" })
    : (recipe.verdict.conditions ?? []).map(c => c.kind === "deck" && c.status === "missing"
      ? { key: "need.deck", fallback: "Serve pietra o acciaio" } : c.message);
  if (!blocked) {
    const keys: Record<string, string> = { "gen.homeBakingMethod": "need.invertedTray", "gen.notCoalOven": "need.withoutCoal", "gen.notWoodOven": "need.withoutWood", "feas.ovenSuboptimal": "need.adaptedBake" };
    for (const warning of recipe.verdict.adaptations) {
      const key = keys[warning.key];
      if (key) messages.push({ key, fallback: warning.fallback, params: warning.params });
    }
  }
  if (compact) {
    messages.splice(0, messages.length, ...recipeCardSignals(recipe).map(s => s.message));
  }
  const texts = [...new Set(engineMsgTexts(messages, cms, bcp47))];
  if (texts.length === 0) return null;
  return (
    <div id={id} className="recipe-condition-chips">
      {texts.map(text => <Badge key={text} tone={blocked ? "error" : "warning"} className="recipe-condition-chip">{blocked ? <TriangleAlert size={14} aria-hidden="true" /> : <ListChecks size={14} aria-hidden="true" />}{text}</Badge>)}
    </div>
  );
}
