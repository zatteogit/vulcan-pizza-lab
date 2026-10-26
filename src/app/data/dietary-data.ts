import type { EngineMsg } from "../domain/pizza-engine";

/** Recipe-level findings, shared by the browser and MCP. A missing product
 * label is unverified, never proof that lactose or animal ingredients are absent. */
export interface DietaryIngredient {
  name: string;
  optional?: boolean;
  gluten?: boolean;
}
export interface DietaryWarning {
  filterId: string;
  ingredients: string[];
  severity: "info" | "warning" | "critical";
  message: EngineMsg;
  tip: EngineMsg;
}
export const DIETARY_MESSAGES_IT: Record<string, string> = {
  "diet.variant": "Versione di {recipe} senza {ingredients}",
  "diet.variantChanges": "Rimossi: {ingredients}.",
  "diet.variantAdded": "Ingredienti aggiunti: {ingredients}.",
  "diet.useVariant": "Usa questa versione",
  "diet.variantAvailable": "Versione alternativa disponibile",
  "diet.glutenConflict": "Il filtro senza glutine esclude: {ingredients}.",
  "diet.glutenUnsupported": "Manca un metodo senza glutine verificato per questa ricetta.",
  "diet.veganConflict": "Il filtro vegano esclude: {ingredients}.",
  "diet.lactoseConflict": "Il filtro senza lattosio esclude: {ingredients}.",
  "diet.verifyVegan": "Idoneità vegana da verificare in etichetta: {ingredients}.",
  "diet.verifyLactose": "Assenza di lattosio da verificare in etichetta: {ingredients}.",
  "diet.changeRecipe": "Scegli una ricetta compatibile o modifica esplicitamente gli ingredienti e ricalcola.",
  "diet.noValidatedMethod": "Non sostituire la farina a parità di dosi: serve una formula senza glutine verificata.",
  "diet.labelCheck": "Verifica la composizione sull’etichetta prima di procedere.",
  "diet.omitOptional": "Per rispettare i filtri, non usare questi ingredienti facoltativi: {ingredients}.",
  "diet.fodmapUnknown": "L’idoneità low FODMAP non si determina dalle sole ore di fermentazione.",
  "diet.histamineUnknown": "Il contenuto di istamina non si determina da tempo e temperatura.",
  "diet.processCheck": "Servono dati su ingredienti, prodotto e porzione: il motore non attesta l’idoneità.",
  "diet.nickelUnknown": "La forza W non misura il contenuto di nichel.",
  "diet.cardConflict": "Incompatibile con i filtri alimentari"
};

const message = (key: string, ingredients?: string[]): EngineMsg => ({
  key, fallback: DIETARY_MESSAGES_IT[key], ...(ingredients ? { params: { ingredients } } : {}),
});

type IngredientStatus = "compatible" | "incompatible" | "unverified";
/** These rules classify declared ingredients, not cross-contamination, clinical
 * tolerance or laboratory composition. Sources: docs/ricerca/dietary-audit-2026-10-26.md. */
export function ingredientDietaryStatus(name: string, filter: "vegan" | "lactose_free"): IngredientStatus {
  const n = name.normalize("NFKC").toLocaleLowerCase("it");
  // The recipe has not selected either branch of this alternative.
  if (/acqua.*\bo\s+poca panna/.test(n)) return "unverified";
  if (/^(latte|bevanda) (di soia|di riso|di mandorla|d.avena)|^(formaggio|mozzarella) vegetale/.test(n)) return "compatible";
  const freshDairy = /crescenza|ricotta|mozzarella|fior di latte|stracciatella|burrata|crème fraîche|panna|\blatte\b|\bburro\b|\bfeta\b|\btuma\b|primosale|mix di quattro formaggi/;
  const agedDairy = /parmigiano|grana padano|pecorino|caciocavallo|gorgonzola|provolone|provola|fontina|brick cheese|cheddar|gouda/;
  const animal = freshDairy.test(n) || agedDairy.test(n) || /\bstrutto\b|\buov[oa]\b|miele|prosciutto|salsiccia|salame|pepperoni|bacon|speck|porchetta|culatello|mortadella|cicoli|ciccioli|nduja|bresaola|\bmanzo\b|\bpollo\b|acciughe|alici|salmone|tonno|vongole|bottarga/.test(n);
  if (filter === "vegan" && animal) return "incompatible";
  if (filter === "lactose_free") {
    if (/senza lattosio|delattosat|lactose[ -]?free/.test(n)) return "compatible";
    if (freshDairy.test(n)) return "incompatible";
    if (agedDairy.test(n) || /prosciutto cotto|salsiccia|salame|pepperoni|bacon|speck|mortadella|cicoli|ciccioli|nduja|pollo.*barbecue/.test(n)) return "unverified";
    if (animal) return "compatible";
  }
  if (/^(acqua|sale|olio|olive oil|farina|lievito|zucchero|aglio|ananas|aneto|basilico|capperi|carciof|champignon|cipoll|composta di pomodoro|coriandolo|crema di zucca|crema di zucchine|fette di patate|fior di sale|friarielli|funghi|giardiniera|granella di pistacchio|jalapeños|melanzane|mentuccia|olive|origano|passata|patate|pelati|pepe|peperon|pere|polpa di pomodoro|pomodor|porcini|rosmarino|rucola|salamoia|salsa (densa di pomodoro|di pomodoro|marinara)|scarola|spinaci|zest|zucchin)/.test(n)) return "compatible";
  return "unverified";
}

export function getDietaryWarnings(activeFilters: string[], ingredients: DietaryIngredient[]): DietaryWarning[] {
  const warnings: DietaryWarning[] = [];
  const add = (filterId: string, severity: DietaryWarning["severity"], names: string[], key: string, tipKey = "diet.changeRecipe") => {
    warnings.push({ filterId, ingredients: names, severity, message: message(key, names.length ? names : undefined), tip: message(tipKey) });
  };
  for (const filter of new Set(activeFilters)) {
    if (filter === "gluten_free") {
      const gluten = ingredients.filter(i => i.gluten || /farina.*(grano|frumento|segale|orzo)|pangrattato|mollica di pane/.test(i.name.toLowerCase())).map(i => i.name);
      add(filter, "critical", gluten, gluten.length ? "diet.glutenConflict" : "diet.glutenUnsupported", "diet.noValidatedMethod");
    } else if (filter === "vegan" || filter === "lactose_free") {
      const findings = ingredients.map(i => ({ ...i, status: ingredientDietaryStatus(i.name, filter) }));
      const incompatible = [...new Set(findings.filter(i => !i.optional && i.status === "incompatible").map(i => i.name))];
      const unknown = [...new Set(findings.filter(i => i.status === "unverified").map(i => i.name))];
      const optional = [...new Set(findings.filter(i => i.optional && i.status === "incompatible").map(i => i.name))];
      if (incompatible.length) add(filter, "critical", incompatible, filter === "vegan" ? "diet.veganConflict" : "diet.lactoseConflict");
      if (unknown.length) add(filter, "warning", unknown, filter === "vegan" ? "diet.verifyVegan" : "diet.verifyLactose", "diet.labelCheck");
      if (optional.length) add(filter, "warning", optional, "diet.omitOptional");
    } else if (filter === "low_fodmap" || filter === "histamine") {
      add(filter, "warning", [], filter === "low_fodmap" ? "diet.fodmapUnknown" : "diet.histamineUnknown", "diet.processCheck");
    } else if (filter === "nickel") {
      add(filter, "info", [], "diet.nickelUnknown", "diet.labelCheck");
    }
  }
  return warnings;
}
