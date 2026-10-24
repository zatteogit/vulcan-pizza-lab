import { PRE_FERMENT_FLOUR_PCT, type PreFermentChoice } from "../../domain/pizza-engine";

/* ═══ D-043 — biga o poolish nel link ═══
 * `pft` = tipo scelto (biga | poolish), `pfp` = farina nel pre-fermento in %
 * della farina totale. Assenti: quelli dello stile. */

export function decodePreFermentChoice(params: URLSearchParams): PreFermentChoice {
  const type = params.get("pft");
  const pct = Number(params.get("pfp"));
  const choice: PreFermentChoice = {};
  if (type === "biga" || type === "poolish") choice.type = type;
  if (params.has("pfp") && Number.isFinite(pct) && pct >= PRE_FERMENT_FLOUR_PCT.min && pct <= PRE_FERMENT_FLOUR_PCT.max) {
    choice.flourPct = pct;
  }
  return choice;
}

export function writePreFermentChoice(params: URLSearchParams, choice: PreFermentChoice): void {
  if (choice.type) params.set("pft", choice.type);
  else params.delete("pft");
  if (choice.flourPct !== undefined) params.set("pfp", String(choice.flourPct));
  else params.delete("pfp");
}
