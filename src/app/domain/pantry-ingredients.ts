/** Stable identities shared by the pantry and recipe checks. Preparation
 * variants stay distinct unless they describe the same common ingredient. */
export function pantryIngredientId(name: string): string {
  const normalized = name.normalize("NFKC").toLocaleLowerCase("it").trim().replace(/\s+/g, " ");
  if (/^olio (evo|extra\s?vergine)/.test(normalized)) return "olio_evo";
  if (/^sale\b/.test(normalized)) return "sale";
  if (/^basilico\b/.test(normalized)) return "basilico";
  if (/^zucchero\b/.test(normalized)) return "zucchero";
  if (/^acqua\b/.test(normalized)) return "acqua";
  if (/^burro\b/.test(normalized)) return "burro";
  return normalized;
}

/** G2-WP-04: voci dell'impasto che si possono segnare «Non usare». Acqua e
 * sale non ci sono: il motore li richiede in ogni stile (requiredIngredients)
 * e non ha varianti senza, quindi escluderli bloccherebbe tutto. Chiavi
 * stabili dagli ingredienti del motore, mai testo tradotto. */
export const EXCLUDABLE_DOUGH_INGREDIENTS = ["Zucchero", "Olio EVO", "Burro", "Strutto"] as const;
const ALWAYS_REQUIRED = new Set(["acqua", "sale"]);

/** Acqua e sale: il motore li richiede sempre, quindi non si offrono mai come «Non usare». */
export function isAlwaysRequiredIngredient(name: string): boolean {
  return ALWAYS_REQUIRED.has(pantryIngredientId(name));
}

/** Righe della scheda «Condimenti»: un id per ingrediente, senza acqua e sale
 * (anche se un condimento li cita), così nessuna riga li può escludere. */
export function pantryToppingIngredients(recipes: Iterable<{ ingredients: readonly { name: string }[] }>): { id: string; name: string }[] {
  const unique = new Map<string, { id: string; name: string }>();
  for (const recipe of recipes) for (const { name } of recipe.ingredients) {
    const id = pantryIngredientId(name);
    if (!ALWAYS_REQUIRED.has(id) && !unique.has(id)) unique.set(id, { id, name });
  }
  return [...unique.values()];
}

/** Ripulisce in lettura le esclusioni salvate prima di G2-WP-04 (acqua/sale). */
export function excludableIngredientIds(ids: readonly string[] | undefined): string[] | undefined {
  return ids?.filter(id => !isAlwaysRequiredIngredient(id));
}

/** Only catalog-declared composition participates: never parse preparation
 * notes or infer the recipe of an unknown sauce. Components have identities,
 * not invented fractions of the compound's amount. */
export function pantryIngredientReferences(name: string, components: readonly string[] = []): { id: string; name: string }[] {
  return [...new Map([name, ...components].map(part => [pantryIngredientId(part), {id:pantryIngredientId(part),name:part}])).values()];
}

export interface PantryFlourDetails {
  name?: string;
  producer?: string;
  /** Explicit label/supplier data, never inferred from protein. */
  w?: number;
  pl?: number;
  protein_pct?: number;
}

export function normalizePantryFlourDetails(value: unknown): Record<string, PantryFlourDetails> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, PantryFlourDetails> = {};
  for (const [id, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || ["__proto__", "constructor", "prototype"].includes(id)) continue;
    const item = raw as Record<string, unknown>;
    const detail: PantryFlourDetails = {};
    for (const key of ["name", "producer"] as const) if (typeof item[key] === "string") detail[key] = item[key].trim().slice(0, 120);
    for (const key of ["w", "pl", "protein_pct"] as const) {
      const number = item[key];
      if (typeof number === "number" && Number.isFinite(number) && number >= 0 && (key === "protein_pct" || number > 0) && number <= (key === "w" ? 1000 : key === "pl" ? 10 : 100)) detail[key] = number;
    }
    result[id] = detail;
  }
  return result;
}
