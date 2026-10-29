import { ALLERGEN_MESSAGES_IT } from "../../data/allergen-data";
import type { EngineMsg, GeneratedRecipe } from "../../domain/pizza-engine";
import { SKILL_WARNING_KEYS } from "../../domain/verdict-summary";
import { PANTRY_CHECK_KEYS } from "../../use-cases/recommendation-groups";

export interface CardSignal {
  icon: "oven" | "time" | "pan" | "flour" | "check" | "water";
  tone: "warning" | "error";
  message: EngineMsg;
}
const msg = (key: string, fallback: string, params?: EngineMsg["params"]): EngineMsg => ({ key, fallback, params });

/** Card policy: at most two decision signals. Unverified flour is a concrete
 * condition too: an empty inventory never implies the required flour is available. */
export function recipeCardSignals(recipe: GeneratedRecipe, context: "create" | "explore" = "create", options: { hidePantryChecks?: boolean } = {}): CardSignal[] {
  const { blockers, conditions = [], adaptations } = recipe.verdict;
  if (blockers.length) {
    const b = blockers.find(b => b.kind === "dietary_conflict" && b.filter_id.startsWith("allergen:")) ?? blockers.find(b => b.kind === "dietary_conflict") ?? blockers.find(b => b.kind === "oven_too_cold") ?? blockers[0];
    return [{ icon: b.kind === "oven_too_cold" ? "oven" : b.kind === "resource_excluded" || b.kind === "dietary_conflict" ? "check" : "time", tone: "error",
      message: b.kind === "oven_too_cold" ? msg("need.blockedOven", "Forno insufficiente")
        : b.kind === "dietary_conflict" ? b.filter_id.startsWith("allergen:")
          ? msg(b.message.key === "allergen.traceConflict" ? "allergen.cardTrace" : "allergen.cardConflict", ALLERGEN_MESSAGES_IT[b.message.key === "allergen.traceConflict" ? "allergen.cardTrace" : "allergen.cardConflict"], b.message.params)
          : msg("diet.cardConflict", "Incompatibile con i filtri alimentari")
        : b.kind === "resource_excluded" ? msg("card.resourceExcluded", "Requisito escluso")
        : b.kind === "fermentation_temperature" ? msg("need.blockedMethod", "Regime non compatibile")
        : msg("need.blockedTime", "Tempi non compatibili") }];
  }
  const result: CardSignal[] = [];
  const add = (icon: CardSignal["icon"], message: EngineMsg) => result.push({ icon, tone: "warning", message });
  const optionalAllergen=recipe.dietary_warnings?.find(w=>w.message.key==="allergen.optional");
  if (optionalAllergen) add("check", msg("allergen.cardOptional", ALLERGEN_MESSAGES_IT["allergen.cardOptional"], optionalAllergen.message.params));
  else if (recipe.allergens?.avoided.length) add("check", msg("allergen.cardCheck", ALLERGEN_MESSAGES_IT["allergen.cardCheck"]));
  // FW-10 (S07-A-06): l'impasto troppo idratato per chi comincia viene prima
  // del metodo e delle condizioni: è ciò che fa fallire la pizza.
  if (adaptations.some(a => SKILL_WARNING_KEYS.includes(a.key))) {
    add("water", msg("card.hydrationBeginner", "Impasto difficile per chi inizia"));
  }
  const method = adaptations.find(a => ["gen.homeBakingMethod", "gen.notCoalOven", "gen.notWoodOven", "feas.ovenSuboptimal"].includes(a.key));
  if (method) {
    const keys: Record<string, [string, string]> = {
      "gen.homeBakingMethod": ["need.invertedTray", "Teglia capovolta"],
      "gen.notCoalOven": ["need.withoutCoal", "Cottura senza carbone"],
      "gen.notWoodOven": ["need.withoutWood", "Anche senza legna"],
      "feas.ovenSuboptimal": ["need.adaptedBake", "Cottura adattata"],
    };
    add("oven", msg(...keys[method.key]));
  }
  if (!method && recipe.scores.authenticity < 60) add("check", msg("card.authenticity", "Autenticità ridotta"));
  // Discovery cards introduce the style. Pantry/equipment prerequisites
  // remain inspectable in the detail and actionable in Create.
  if (context === "explore") return result.slice(0, 2);
  for (const c of [...conditions].sort((a, b) => Number(b.status === "missing") - Number(a.status === "missing"))) {
    // FW-09 (S05-A-06): con la dispensa sconosciuta «Se hai farina…» vale per
    // tutti gli stili; la pagina lo dice una volta sola.
    // Per chiave, non per tipo: la verifica delle esclusioni (rifiuto esplicito
    // dell'utente) ha kind «flour» ma non dipende dalla dispensa e resta.
    if (options.hidePantryChecks && c.status === "unverified" && PANTRY_CHECK_KEYS.has(c.message.key)) continue;
    if (c.message.key === "need.checkExclusions") { add("flour", c.message); continue; }
    if (c.kind === "pan") add("pan", c.status === "missing" ? msg("card.panMissing", "Serve una teglia") : msg("card.panCheck", "Se hai una teglia"));
    if (c.kind === "deck") add("oven", c.status === "missing" ? msg("need.deck", "Serve pietra o acciaio") : msg("need.checkDeck", "Se hai pietra o acciaio"));
    if (c.kind === "flour") add("flour", c.status === "missing"
      ? msg("need.flour", "Serve farina con forza W{w}", c.message.params)
      : msg("need.checkFlour", "Se hai farina con forza W{w}", c.message.params));
    if (c.kind === "flour_blend") add("flour", msg("card.blendCheck", "Se hai le farine del mix"));
    if (c.kind === "ingredient" && c.status === "missing" && !result.some(signal=>signal.message.key==="card.ingredientsMissing")) add("check",msg("card.ingredientsMissing","Ingredienti da procurare"));
    if (c.kind === "yeast" && c.status === "missing") add("flour", msg("card.yeastMissing", "Serve il lievito"));
  }
  return result.slice(0, 2);
}

/** Operational status is independent of a high numeric affinity. */
export function recipePresentationState(recipe: GeneratedRecipe): "blocked" | "check" | "ready" {
  if (recipe.verdict.outcome === "not_feasible") return "blocked";
  return recipe.verdict.outcome === "warnings" ? "check" : "ready";
}
