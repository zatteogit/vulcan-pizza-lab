import type { StyleRecommendation, UserConstraints } from "../domain/pizza-engine";

/* ═══ FW-09 (S05-A-06, S05-B-11): gruppi di Crea con la dispensa sconosciuta ═══
 * Senza dispensa ogni ricetta porta «Se hai farina W…» e «Se hai lievito»: una
 * condizione che vale per tutti gli stili non distingue nulla e svuotava il
 * gruppo «Perfetti per te». Finché la dispensa non è stata detta, quelle
 * verifiche si dicono una volta sola (banner) e non spostano lo stile di gruppo.
 * Il verdetto del motore non cambia: cambia solo il raggruppamento in pagina. */

/** Verifiche di ingredienti che dipendono solo dal non sapere cosa c'è in
 *  dispensa (stato `unverified`, mai `missing`). */
export const PANTRY_CHECK_KEYS: ReadonlySet<string> = new Set([
  "need.checkFlour",
  "need.checkYeast",
  "need.checkBlend",
  "need.checkExclusions",
]);

/** La dispensa non è stata compilata: nessuna farina e inventario non confermato. */
export function pantryUnknown(constraints: UserConstraints): boolean {
  return constraints.pantry_flours.length === 0 && constraints.pantry_inventory_complete !== true;
}

export type PresentationTier = StyleRecommendation["tier"];

/** Il gruppo in cui mostrare lo stile in Crea. */
export function presentationTier(rec: StyleRecommendation, constraints: UserConstraints): PresentationTier {
  if (rec.tier !== "good" || !pantryUnknown(constraints)) return rec.tier;
  const onlyPantryChecks = rec.verdict.adaptations.every((msg) => PANTRY_CHECK_KEYS.has(msg.key));
  const dietary = rec.recipe?.dietary_warnings?.length ?? 0;
  return onlyPantryChecks && dietary === 0 ? "perfect" : "good";
}
