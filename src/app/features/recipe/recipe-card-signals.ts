import { ALLERGEN_MESSAGES_IT } from "../../data/allergen-data";
import type { EngineMsg, GeneratedRecipe } from "../../domain/pizza-engine";
import { SKILL_WARNING_KEYS } from "../../domain/verdict-summary";
import { onlyPantryChecks, PANTRY_CHECK_KEYS } from "../../use-cases/recommendation-groups";

export interface CardSignal {
  icon: "oven" | "time" | "pan" | "flour" | "check" | "water";
  tone: "warning" | "error";
  message: EngineMsg;
}
/** Avviso sul metodo di cottura → segnale della card (chiave, ripiego).
 *  Lo usano anche le chip delle condizioni (G4a-WP-03: una sola tabella). */
export const METHOD_SIGNALS: Record<string, [string, string]> = {
  "gen.homeBakingMethod": ["need.invertedTray", "Teglia capovolta"],
  "gen.notCoalOven": ["need.withoutCoal", "Senza carbone"],
  "gen.notWoodOven": ["need.withoutWood", "Anche senza legna"],
  "feas.ovenSuboptimal": ["need.adaptedBake", "Cottura adattata"],
};
const msg = (key: string, fallback: string, params?: EngineMsg["params"]): EngineMsg => ({ key, fallback, params });

/** Card policy: at most two decision signals in Create, one in Explore.
 * D-060 (29/10/2026, nota di Matteo): «Se hai farina W…» e «Se hai lievito»
 * non sono segnali. Finché la dispensa non è detta valgono per ogni ricetta e
 * la farina giusta è già negli ingredienti; Crea lo dice una volta (banner).
 * Resta il segnale quando la dispensa è detta e manca qualcosa («Serve…»). */
export function recipeCardSignals(recipe: GeneratedRecipe, context: "create" | "explore" = "create"): CardSignal[] {
  const { blockers, conditions = [], adaptations } = recipe.verdict;
  if (blockers.length) {
    const b = blockers.find(b => b.kind === "dietary_conflict" && b.filter_id.startsWith("allergen:")) ?? blockers.find(b => b.kind === "dietary_conflict") ?? blockers.find(b => b.kind === "oven_too_cold") ?? blockers[0];
    return [{ icon: b.kind === "oven_too_cold" ? "oven" : b.kind === "resource_excluded" || b.kind === "dietary_conflict" ? "check" : "time", tone: "error",
      message: b.kind === "oven_too_cold" ? msg("need.blockedOven", "Forno non adatto")
        : b.kind === "dietary_conflict" ? b.filter_id.startsWith("allergen:")
          ? msg(b.message.key === "allergen.traceConflict" ? "allergen.cardTrace" : "allergen.cardConflict", ALLERGEN_MESSAGES_IT[b.message.key === "allergen.traceConflict" ? "allergen.cardTrace" : "allergen.cardConflict"], b.message.params)
          : msg("diet.cardConflict", "Fuori dieta")
        : b.kind === "resource_excluded" ? msg("card.resourceExcluded", "Requisito escluso")
        : b.kind === "fermentation_temperature" ? msg("need.blockedMethod", "Metodo inadatto")
        : msg("need.blockedTime", "Poco tempo") }];
  }
  const result: CardSignal[] = [];
  const add = (icon: CardSignal["icon"], message: EngineMsg) => result.push({ icon, tone: "warning", message });
  const optionalAllergen=recipe.dietary_warnings?.find(w=>w.message.key==="allergen.optional");
  if (optionalAllergen) add("check", msg("allergen.cardOptional", ALLERGEN_MESSAGES_IT["allergen.cardOptional"], optionalAllergen.message.params));
  else if (recipe.allergens?.avoided.length) add("check", msg("allergen.cardCheck", ALLERGEN_MESSAGES_IT["allergen.cardCheck"]));
  // FW-10 (S07-A-06): l'impasto troppo idratato per chi comincia viene prima
  // del metodo e delle condizioni: è ciò che fa fallire la pizza.
  if (adaptations.some(a => SKILL_WARNING_KEYS.includes(a.key))) {
    add("water", msg("card.hydrationBeginner", "Impasto esigente"));
  }
  const method = adaptations.find(a => METHOD_SIGNALS[a.key]);
  if (method) add("oven", msg(...METHOD_SIGNALS[method.key]));
  if (!method && recipe.scores.authenticity < 60) add("check", msg("card.authenticity", "Meno autentica"));
  // Discovery cards introduce the style. Pantry/equipment prerequisites
  // remain inspectable in the detail and actionable in Create.
  // Nota di Matteo (29/10/2026): in Scopri un solo segnale, il più importante.
  if (context === "explore") return result.slice(0, 1);
  for (const c of [...conditions].sort((a, b) => Number(b.status === "missing") - Number(a.status === "missing"))) {
    // D-060: le verifiche di dispensa non sono segnali (vedi sopra).
    // Per chiave, non per tipo: la verifica delle esclusioni (rifiuto esplicito
    // dell'utente) ha kind «flour» ma non dipende dalla dispensa e resta.
    if (c.status === "unverified" && PANTRY_CHECK_KEYS.has(c.message.key)) continue;
    if (c.message.key === "need.checkExclusions") { add("flour", msg("card.exclusionsCheck", "Esclusioni?")); continue; }
    if (c.kind === "pan") add("pan", c.status === "missing" ? msg("card.panMissing", "Serve una teglia") : msg("card.panCheck", "Se hai una teglia"));
    if (c.kind === "deck") add("oven", c.status === "missing" ? msg("card.deckMissing", "Pietra o acciaio") : msg("card.deckCheck", "Pietra o acciaio?"));
    // Le verifiche di farina «Se hai…» sono già escluse sopra (D-060): qui
    // resta solo la mancanza certa.
    if (c.kind === "flour") add("flour", msg("card.flourMissing", "Farina W {range}", c.message.params));
    if (c.kind === "flour_blend") add("flour", msg("card.blendCheck", "Verifica le farine"));
    if (c.kind === "ingredient" && c.status === "missing" && !result.some(signal=>signal.message.key==="card.ingredientsMissing")) add("check",msg("card.ingredientsMissing","Da comprare"));
    if (c.kind === "yeast" && c.status === "missing") add("flour", msg("card.yeastMissing", "Serve il lievito"));
  }
  return result.slice(0, 2);
}

/** Operational status is independent of a high numeric affinity. */
export function recipePresentationState(recipe: GeneratedRecipe): "blocked" | "check" | "ready" {
  if (recipe.verdict.outcome === "not_feasible") return "blocked";
  if (recipe.verdict.outcome === "warnings" && onlyPantryChecks(recipe.verdict, recipe.dietary_warnings?.length ?? 0)) return "ready";
  return recipe.verdict.outcome === "warnings" ? "check" : "ready";
}
