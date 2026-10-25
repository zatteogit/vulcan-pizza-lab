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
