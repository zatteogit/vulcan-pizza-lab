import type { GeneratedRecipe, OvenType } from "./pizza-engine";

/** FW-11 (S07-A-18): il disciplinare STG (PDF, MASAF) accanto alle regole che
 *  ne derivano, non incollato nel componente. Fonte verificata in
 *  docs/ricerca/identita-stg-2026-10-25.md. */
export const STG_SPECIFICATION_URL =
  "https://www.masaf.gov.it/flex/cm/pages/ServeAttachment.php/L/IT/D/1%252F4%252Fa%252FD.54ec78491c37356fe33f/P/BLOB:ID=24230/E/pdf?mode=download";

export type StgDeparture = "wood" | "bake" | "flour" | "pl" | "fermentation" | "cold" | "preferment" | "yeast" | "additions" | "weight" | "topping";

/** Known departures from the MASAF STG specification, art. 3.
 * This is deliberately NOT a conformity certificate: provenance, shaping,
 * dough temperature and the full production process are not verified here.
 * Never use the authenticity score (distance from a style) as a legal test. */
export function stgDepartures(recipe: GeneratedRecipe, oven?: OvenType): StgDeparture[] {
  if (recipe.style.id !== "napoletana_stg") return [];
  const result: StgDeparture[] = [];
  // D-063: con il forno a temperatura «senza legna» non è più un avviso del
  // verdetto ma un'informazione dell'autenticità (auth.woodByMethod); per il
  // disciplinare STG resta comunque uno scostamento.
  const woodless = recipe.verdict.adaptations.some(a => a.key === "gen.notWoodOven") ||
    recipe.scores.penalties.some(p => p.key === "auth.notWoodOven" || p.key === "auth.woodByMethod");
  if (oven ? oven !== "wood" : woodless) result.push("wood");
  if (recipe.cook_time_sec < 60 || recipe.cook_time_sec > 90) result.push("bake");
  if (recipe.flour_w < 220 || recipe.flour_w > 380) result.push("flour");
  if (recipe.flour_pl < 0.5 || recipe.flour_pl > 0.7) result.push("pl");
  if (recipe.fermentation_hours < 6 || recipe.fermentation_hours > 14) result.push("fermentation");
  // A refrigerated process is a known departure; ambient temperature alone
  // cannot prove compliance with the required dough temperature.
  if (recipe.fermentation_temp_c <= 10) result.push("cold");
  if (recipe.has_pre_ferment) result.push("preferment");
  if (recipe.yeast_type === "sourdough") result.push("yeast");
  if (recipe.fat_g > 0 || recipe.sugar_g > 0) result.push("additions");
  if (recipe.ball_weight_g < 180 || recipe.ball_weight_g > 250) result.push("weight");
  if (recipe.style.default_topping_ref && !["margherita_napoletana_avpn", "marinara_avpn"].includes(recipe.style.default_topping_ref)) result.push("topping");
  return result;
}

/** Catalog titles stay untouched. Executable recipes with known departures
 * lose the protected qualifier, including when their numeric score is high. */
export function recipeDisplayName(recipe: GeneratedRecipe, oven?: OvenType): string {
  return stgDepartures(recipe, oven).length ? "Napoletana" : recipe.style.name;
}

/* ═══ FW-14 · Delta dal riferimento (S07-A-04, S07-B-01) ═══
 * I «Prima → Ora» della tabella parametri si calcolano dalla ricetta di
 * riferimento effettivamente generata (preset attivo), mai dal centro degli
 * intervalli dello stile. Solo i parametri mostrati nella tabella. */
export type ReferenceParam = "hydration" | "flourW" | "fermentation";
export interface ReferenceDelta {
  param: ReferenceParam;
  reference: { value: number; tempC?: number };
  current: { value: number; tempC?: number };
}

export function compareToReference(recipe: GeneratedRecipe, reference: GeneratedRecipe): ReferenceDelta[] {
  const side = (r: GeneratedRecipe, param: ReferenceParam) => param === "hydration" ? { value: r.hydration_pct }
    : param === "flourW" ? { value: r.flour_w } : { value: r.fermentation_hours, tempC: r.fermentation_temp_c };
  // Idratazione e ore mostrate con un decimale al massimo: sotto non è una modifica.
  const changed: Record<ReferenceParam, boolean> = {
    hydration: Math.abs(recipe.hydration_pct - reference.hydration_pct) >= 0.05,
    flourW: Math.round(recipe.flour_w) !== Math.round(reference.flour_w),
    fermentation: Math.abs(recipe.fermentation_hours - reference.fermentation_hours) >= 0.05
      // La temperatura si mostra in gradi interi: sotto il grado non è una modifica.
      || Math.round(recipe.fermentation_temp_c) !== Math.round(reference.fermentation_temp_c),
  };
  return (Object.keys(changed) as ReferenceParam[]).filter((p) => changed[p])
    .map((param) => ({ param, reference: side(reference, param), current: side(recipe, param) }));
}

/** FW-14 (revisione): testo della cella «Lievitazione» e del suo «Prima».
 *  La cella dichiara di solito l'ambiente (frigo/ambiente); se il delta sta
 *  nella temperatura e l'ambiente non cambia, l'etichetta d'ambiente
 *  renderebbe identici i due lati («12 h ambiente → 12 h ambiente»): allora
 *  entrambi i lati mostrano la temperatura, con lo stesso formatter. */
export interface FermentationCellFormat {
  duration: (hours: number) => string;
  celsius: (tempC: number) => string;
  env: (tempC: number) => string;
}
export function fermentationCellText(
  current: { hours: number; tempC: number },
  delta: ReferenceDelta | undefined,
  fmt: FermentationCellFormat,
): { value: string; canonical?: string } {
  const ref = delta?.param === "fermentation"
    ? { hours: delta.reference.value, tempC: delta.reference.tempC ?? current.tempC }
    : undefined;
  const tempOnly = !!ref && Math.round(ref.tempC) !== Math.round(current.tempC)
    && fmt.env(ref.tempC) === fmt.env(current.tempC);
  const text = (s: { hours: number; tempC: number }) =>
    `${fmt.duration(s.hours)} ${tempOnly ? fmt.celsius(s.tempC) : fmt.env(s.tempC)}`;
  return ref ? { value: text(current), canonical: text(ref) } : { value: text(current) };
}
