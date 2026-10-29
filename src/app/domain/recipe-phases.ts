/* ═══ FW-17 — Dosi per fase: un solo modello ═══
 * Ricetta (lista e scorporo), Procedimento, modalità cottura e scheda di
 * stampa leggevano le dosi ognuna a modo suo: lo zucchero spariva
 * dall'impasto finale (S08-A-02), la stampa sommava grammi arrotondati e
 * ricalcolava le percentuali (S08-A-09), lo scorporo perdeva sale e grasso.
 * Qui le dosi si dividono una volta, per fase, con queste invarianti
 * (recipe-phases.test.ts):
 *  - per ogni ingrediente, la somma delle fasi è il totale della ricetta;
 *  - nessuna quantità negativa; l'acqua dell'impasto finale può essere 0 solo
 *    se è già tutta nel prefermento (e lo si dice);
 *  - tutto il lievito va nel prefermento; sale, zucchero e grasso nell'impasto
 *    finale;
 *  - i totali e le percentuali sono quelli del motore (total_dough_g,
 *    hydration_pct, baker_pcts), uguali a schermo e in stampa.
 * Modulo puro: nessun testo, nessun React. */

import type { GeneratedRecipe } from "./pizza-engine";
import { computePreFermentSplit } from "./pre-ferment-split";

export type DoughIngredientId = "flour" | "water" | "yeast" | "salt" | "sugar" | "fat";
/** «preferment» è il prefermento maturo che entra nell'impasto finale. */
export type PhaseIngredientId = DoughIngredientId | "preferment";

export interface PhaseIngredient {
  id: PhaseIngredientId;
  grams: number;
  /** Percentuale sulla farina TOTALE della ricetta. */
  bakerPct: number;
  /** allInPreferment: acqua 0 g perché è già tutta nel prefermento.
   *  allYeast: tutto il lievito della ricetta. */
  note?: "allInPreferment" | "allYeast";
}

export interface RecipePhase {
  id: "preferment" | "final";
  ingredients: PhaseIngredient[];
  /** Temperatura dell'acqua di questa fase (stima, Regola 55), se calcolata. */
  waterTempC: number | null;
}

export interface PreFermentInfo {
  type: "biga" | "poolish";
  name: "Biga" | "Poolish";
  hydrationPct: number;
  flourPct: number;
  /** Peso del prefermento maturo (farina + acqua + lievito). */
  massG: number;
}

/** D-O: aiuto per le microdosi di lievito con la bilancia da cucina. */
export interface YeastDilution {
  /** Lievito da sciogliere (pesabile al grammo). */
  stockYeastG: number;
  /** Acqua in cui scioglierlo (non è acqua della ricetta). */
  stockWaterG: number;
  /** Soluzione da prelevare: contiene esattamente la dose di lievito. */
  solutionG: number;
  /** Acqua da togliere alla fase che riceve la soluzione. */
  waterToRemoveG: number;
  /** Dose di lievito contenuta nella soluzione prelevata. */
  yeastG: number;
  phase: RecipePhase["id"];
  /** Errore massimo sulla dose, in % (stima): somma degli errori relativi
   *  delle due pesate con la bilancia da cucina, il lievito della soluzione
   *  madre e la soluzione prelevata. Arrotondato per eccesso al 5 %. */
  uncertaintyPct: number;
  /** Solo lievito secco: frazione di cucchiaino raso equivalente (stima). */
  spoonEstimate?: "eighth" | "quarter";
}

export interface RecipePhases {
  phases: RecipePhase[];
  /** Totali della ricetta, nell'ordine della lista ingredienti. */
  totals: PhaseIngredient[];
  /** Totale impasto del motore (peso panetto × panetti). */
  totalDoughG: number;
  flourBlend: GeneratedRecipe["flour_blend"];
  effectiveGlutenW?: number;
  preFerment: PreFermentInfo | null;
  yeastDilution: YeastDilution | null;
}

export type PhaseRecipe = Pick<
  GeneratedRecipe,
  | "flour_g" | "water_g" | "salt_g" | "sugar_g" | "fat_g" | "yeast_g" | "yeast_type"
  | "hydration_pct" | "baker_pcts" | "total_dough_g" | "has_pre_ferment" | "pre_ferment_type"
  | "pre_ferment_flour_pct" | "water_temp_c" | "pre_ferment_water_temp_c" | "flour_blend"
  | "effective_gluten_w"
>;

/* ── Diluizione (D-O) ──
 * 5 g di lievito in 245 g d'acqua = soluzione al 2 %: ogni 50 g contengono
 * 1 g di lievito. Con dosi al decimo di grammo la soluzione da prelevare è un
 * multiplo di 5 g, pesabile con la bilancia da cucina. L'aritmetica è esatta,
 * le pesate no: la bilancia da cucina (passo 1 g) sbaglia fino a ±0,5 g sia sui
 * 5 g di lievito (±10 %) sia sulla soluzione prelevata (±0,5 g su 5–45 g, cioè
 * dal ±10 % all'1 %). Le due incertezze si sommano: ±20 % a 0,1 g, ±15 % da
 * 0,2 g fino al grammo (per eccesso al 5 %). L'acqua della soluzione madre
 * (245 g) pesa per lo 0,2 % e si trascura. */
export const DILUTION_STOCK_YEAST_G = 5;
export const DILUTION_FACTOR = 50;
/** Metà del passo di una bilancia da cucina al grammo. */
export const KITCHEN_SCALE_ERROR_G = 0.5;

/** Errore massimo sulla dose diluita, in %, arrotondato per eccesso al 5 %. */
export function dilutionUncertaintyPct(stockYeastG: number, solutionG: number, scaleErrorG = KITCHEN_SCALE_ERROR_G): number {
  const relative = scaleErrorG / stockYeastG + scaleErrorG / solutionG;
  return Math.ceil(Math.round(relative * 1000) / 10 / 5) * 5;
}

export function yeastDilution(
  yeastG: number,
  yeastType: GeneratedRecipe["yeast_type"],
  phaseWaterG: number,
  phase: RecipePhase["id"] = "final",
): YeastDilution | null {
  if (yeastType === "sourdough" || !(yeastG > 0) || yeastG >= 1) return null;
  const solutionG = Math.round(yeastG * DILUTION_FACTOR * 10) / 10;
  const waterToRemoveG = Math.round(solutionG - yeastG);
  if (waterToRemoveG > phaseWaterG) return null;
  /* Stima, solo per il secco: un cucchiaino raso ≈ 3 g (la stessa ipotesi dei
     suggerimenti in cucchiaini sopra il grammo). Si propone solo quando la
     frazione dista meno del 30 % dalla dose. */
  const spoon = yeastType === "dry"
    ? ([["eighth", 3 / 8], ["quarter", 3 / 4]] as const).find(([, g]) => Math.abs(g - yeastG) / yeastG <= 0.3)?.[0]
    : undefined;
  return {
    stockYeastG: DILUTION_STOCK_YEAST_G,
    stockWaterG: DILUTION_STOCK_YEAST_G * (DILUTION_FACTOR - 1),
    solutionG,
    waterToRemoveG,
    yeastG,
    phase,
    uncertaintyPct: dilutionUncertaintyPct(DILUTION_STOCK_YEAST_G, solutionG),
    ...(spoon ? { spoonEstimate: spoon } : {}),
  };
}

const pctOf = (grams: number, flourG: number) => (flourG > 0 ? (grams / flourG) * 100 : 0);

export function buildRecipePhases(recipe: PhaseRecipe): RecipePhases {
  const flourG = recipe.flour_g;
  const totals: PhaseIngredient[] = [
    { id: "flour" as const, grams: flourG, bakerPct: 100 },
    { id: "water" as const, grams: recipe.water_g, bakerPct: recipe.hydration_pct },
    { id: "salt" as const, grams: recipe.salt_g, bakerPct: recipe.baker_pcts?.salt ?? pctOf(recipe.salt_g, flourG) },
    { id: "yeast" as const, grams: recipe.yeast_g, bakerPct: pctOf(recipe.yeast_g, flourG) },
    { id: "sugar" as const, grams: recipe.sugar_g, bakerPct: recipe.baker_pcts?.sugar ?? pctOf(recipe.sugar_g, flourG) },
    { id: "fat" as const, grams: recipe.fat_g, bakerPct: recipe.baker_pcts?.fat ?? pctOf(recipe.fat_g, flourG) },
  ].filter((row) => row.id === "flour" || row.id === "water" || row.grams > 0);

  const common = {
    totals,
    totalDoughG: recipe.total_dough_g,
    flourBlend: recipe.flour_blend,
    effectiveGlutenW: recipe.effective_gluten_w,
  };
  const row = (id: PhaseIngredientId, grams: number, note?: PhaseIngredient["note"]): PhaseIngredient =>
    ({ id, grams, bakerPct: pctOf(grams, flourG), ...(note ? { note } : {}) });

  if (!recipe.has_pre_ferment) {
    return {
      ...common,
      phases: [{ id: "final", ingredients: totals.map((t) => ({ ...t })), waterTempC: recipe.water_temp_c }],
      preFerment: null,
      yeastDilution: yeastDilution(recipe.yeast_g, recipe.yeast_type, recipe.water_g, "final"),
    };
  }

  const split = computePreFermentSplit({
    flourG,
    waterG: recipe.water_g,
    preFermentType: recipe.pre_ferment_type,
    flourPct: recipe.pre_ferment_flour_pct,
  });
  const yeastG = recipe.yeast_g;
  const massG = split.prefermentFlourG + split.prefermentWaterG + yeastG;
  const preferment: RecipePhase = {
    id: "preferment",
    ingredients: [
      row("flour", split.prefermentFlourG),
      row("water", split.prefermentWaterG),
      ...(yeastG > 0 ? [row("yeast", yeastG, "allYeast")] : []),
    ],
    waterTempC: recipe.pre_ferment_water_temp_c ?? null,
  };
  const final: RecipePhase = {
    id: "final",
    ingredients: [
      // Il prefermento maturo si pesa (o si versa) intero: al grammo.
      row("preferment", Math.round(massG)),
      row("flour", split.mainFlourG),
      row("water", split.mainWaterG, split.mainWaterG === 0 ? "allInPreferment" : undefined),
      ...(recipe.salt_g > 0 ? [row("salt", recipe.salt_g)] : []),
      ...(recipe.sugar_g > 0 ? [row("sugar", recipe.sugar_g)] : []),
      ...(recipe.fat_g > 0 ? [row("fat", recipe.fat_g)] : []),
    ],
    waterTempC: split.mainWaterG > 0 ? recipe.water_temp_c : null,
  };
  return {
    ...common,
    phases: [preferment, final],
    preFerment: {
      type: split.isPoolish ? "poolish" : "biga",
      name: split.name,
      hydrationPct: split.hydrationPct,
      flourPct: split.flourPct,
      massG: Math.round(massG),
    },
    yeastDilution: yeastDilution(yeastG, recipe.yeast_type, split.prefermentWaterG, "preferment"),
  };
}

/** Somma di un ingrediente su tutte le fasi (per test e controlli). */
export function phaseSum(phases: RecipePhase[], id: DoughIngredientId): number {
  return phases.reduce(
    (sum, phase) => sum + phase.ingredients.filter((i) => i.id === id).reduce((s, i) => s + i.grams, 0),
    0,
  );
}

/** FW-17 (D-P): il motore userà il lievito madre per forza (nessun lievito di
 *  birra disponibile), quindi biga e poolish non si calcolano. Rispecchia la
 *  scelta del lievito di generateRecipe; test in recipe-phases.test.ts. */
export function onlySourdoughYeast(pantryYeasts: readonly string[], excludedYeasts: readonly string[] = []): boolean {
  const allowed = (ids: readonly string[]) => ids.filter((id) => !excludedYeasts.includes(id));
  const pantry = allowed(pantryYeasts);
  // Dispensa vuota (o tutta esclusa): il motore prende il primo lievito non escluso.
  if (pantry.length === 0) return allowed(["fresh", "dry", "sourdough"])[0] === "sourdough";
  return pantry.every((id) => id === "sourdough");
}
