import { recipeDifferences } from "../../use-cases/recipe-entry";
import type { EngineMsg, GeneratedRecipe } from "../../domain/pizza-engine";

export interface CardSignal {
  icon: "oven" | "time" | "pan" | "flour" | "check";
  tone: "warning" | "error";
  message: EngineMsg;
}
const msg = (key: string, fallback: string, params?: EngineMsg["params"]): EngineMsg => ({ key, fallback, params });

/** Card policy: at most two decision signals. Unverified flour is a concrete
 * condition too: an empty inventory never implies the required flour is available. */
export function recipeCardSignals(recipe: GeneratedRecipe): CardSignal[] {
  const { blockers, conditions = [], adaptations } = recipe.verdict;
  if (blockers.length) {
    const b = blockers.find(b => b.kind === "oven_too_cold") ?? blockers[0];
    return [{ icon: b.kind === "oven_too_cold" ? "oven" : b.kind === "resource_excluded" ? "check" : "time", tone: "error",
      message: b.kind === "oven_too_cold" ? msg("need.blockedOven", "Forno insufficiente")
        : b.kind === "resource_excluded" ? msg("card.resourceExcluded", "Requisito escluso")
        : b.kind === "fermentation_temperature" ? msg("need.blockedMethod", "Regime non compatibile")
        : msg("need.blockedTime", "Tempi non compatibili") }];
  }
  const result: CardSignal[] = [];
  const add = (icon: CardSignal["icon"], message: EngineMsg) => result.push({ icon, tone: "warning", message });
  const method = adaptations.find(a => ["gen.homeBakingMethod", "gen.notCoalOven", "gen.notWoodOven", "feas.ovenSuboptimal"].includes(a.key));
  if (method) {
    const keys: Record<string, [string, string]> = {
      "gen.homeBakingMethod": ["need.invertedTray", "Teglia capovolta"],
      "gen.notCoalOven": ["need.withoutCoal", "Cottura senza carbone"],
      "gen.notWoodOven": ["need.withoutWood", "Cottura senza legna"],
      "feas.ovenSuboptimal": ["need.adaptedBake", "Cottura adattata"],
    };
    add("oven", msg(...keys[method.key]));
  }
  if (!method && recipe.scores.authenticity < 60) add("check", msg("card.authenticity", "Autenticità ridotta"));
  for (const c of [...conditions].sort((a, b) => Number(b.status === "missing") - Number(a.status === "missing"))) {
    if (c.kind === "pan") add("pan", c.status === "missing" ? msg("card.panMissing", "Serve una teglia") : msg("card.panCheck", "Se hai una teglia"));
    if (c.kind === "deck") add("oven", c.status === "missing" ? msg("need.deck", "Serve pietra o acciaio") : msg("need.checkDeck", "Se hai pietra o acciaio"));
    if (c.kind === "flour") add("flour", c.status === "missing"
      ? msg("need.flour", "Serve farina W{w}", c.message.params)
      : msg("need.checkFlour", "Se hai farina W{w}", c.message.params));
    if (c.kind === "flour_blend") add("flour", msg("card.blendCheck", "Se hai le farine del mix"));
    if (c.kind === "yeast" && c.status === "missing") add("flour", msg("card.yeastMissing", "Serve il lievito"));
  }
  return result.slice(0, 2);
}

/** Operational status is independent of a high numeric affinity. */
export function recipePresentationState(recipe: GeneratedRecipe, original?: GeneratedRecipe): "blocked" | "adapted" | "check" | "ready" {
  if (recipe.verdict.outcome === "not_feasible") return "blocked";
  if (original && recipeDifferences(original, recipe).length > 0 || recipe.verdict.adaptations.some(a =>
    ["gen.homeBakingMethod", "gen.notCoalOven", "gen.notWoodOven", "feas.ovenSuboptimal"].includes(a.key))) return "adapted";
  return recipe.verdict.outcome === "warnings" ? "check" : "ready";
}
