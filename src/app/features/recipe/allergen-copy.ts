import type { RecipeAllergens } from "../../data/allergen-data";
import { uiMessage } from "../../i18n/ui-messages";
import { allergenName } from "./allergen-names";

/** Name the relevant allergens rather than exposing the engine's group count.
 * Optional sources never imply that an allergen in the base recipe disappears. */
export function allergenSummary(report: RecipeAllergens): string[] {
  const present = new Set(report.contains.map(group => group.id));
  const parts = [report.contains.length
    ? report.contains.map(group => allergenName(group.id)).join(" · ")
    : uiMessage("allergen.noKnown")];
  const optional = report.conditional.filter(group => !present.has(group.id));
  if (optional.length) parts.push(uiMessage("allergen.optionalSummary", [optional.map(group => allergenName(group.id)).join(", ")]));
  const traces = report.may_contain.filter(group => !present.has(group.id) && group.sources.some(source => !source.optional));
  if (traces.length) parts.push(uiMessage("allergen.traceSummary", [traces.map(group => allergenName(group.id)).join(", ")]));
  const optionalTraces = report.may_contain.filter(group => !present.has(group.id) && !optional.some(addition => addition.id === group.id) && group.sources.every(source => source.optional));
  if (optionalTraces.length) parts.push(uiMessage("allergen.optionalTraceSummary", [optionalTraces.map(group => allergenName(group.id)).join(", ")]));
  return parts;
}

export function needsMilkNote(report: RecipeAllergens): boolean {
  return report.avoided.includes("milk") || [...report.contains, ...report.conditional, ...report.may_contain].some(group => group.id === "milk");
}
