import { METHOD_MESSAGES_IT } from "../data/method-messages";
// ═══ VULCAN PIZZA ENGINE ═══
// Scientific pizza recipe generation based on Progetto Vulcan
// Last audit alignment: 14 feb 2026 — Audit Verifica Implementativa v1
// Changes: P/L ratio, variable Q10, Chicago butter fix, STG W AVPN 2024,
//          full compensation engine (logarithmic hydration, Arrhenius baking),
//          sustainability score documented, fat_type model

import { STYLE_DEVIATIONS } from "./deviation-tags";
import { globalRecipeScore, type GlobalScoreCalculation } from "./recipe-score";
import {
getImpasto,
mergeImpastoIntoDough,
type ImpastoRecipe,
} from "../data/impasto-library";
import { getToppingByStyle } from "../data/parametric-databases";
import {
getToppingForStyle,
getRecipesByAuthenticity,
type TimelineInsertPoint,
type ToppingRecipe
} from "../data/topping-library";
import { FLOURS_DB } from "../data/flour-database";
import { pantryIngredientId, pantryIngredientReferences, type PantryFlourDetails } from "./pantry-ingredients";
import { BRAND } from "../config/brand";
import { getDietaryWarnings, type DietaryWarning } from "../data/dietary-data";

// ═══ TYPES ═══

export type ShapeType = "round" | "oval" | "rectangular";
export type OvenType =
  | "wood"
  | "coal"
  | "electric_high"
  | "electric_standard"
  | "gas"
  | "gas_pizza"
  | "home";
export type CrustType =
  | "leopard_soft"
  | "crispy_thin"
  | "thick_airy"
  | "cheese_crown"
  | "deep_dish"
  | "focaccia_soft"
  | "stuffed_thin"
  | "pan_crispy";
export type SkillLevel = 1 | 2 | 3 | 4;
export type HydrationCategory =
  | "low"
  | "medium"
  | "high"
  | "extreme";
export type FamilyId =
  | "napoletana"
  | "romana"
  | "americana"
  | "contemporanea";

export interface DoughParameters {
  flour_w_range: [number, number];
  flour_pl_range: [number, number]; // P/L alveografico — tenacità/estensibilità (Audit Maestro P0-1)
  hydration_pct_range: [number, number];
  salt_pct: number;
  oil_pct: number;
  fat_type: "oil" | "butter" | "lard" | "none"; // Audit KB: Chicago usa burro, non olio
  sugar_pct: number;
  fermentation_hours_range: [number, number];
  /** Temperatura nominale del metodo verificato, non una soglia di sicurezza.
   * Le altre temperature richiedono un metodo distinto. */
  fermentation_temp_c?: number;
  process_type: string;
  /** Impasto non lievitato (es. Focaccia di Recco): nessun lievito, le ore di
   *  "fermentazione" rappresentano solo il riposo della sfoglia. VPL-B2. */
  unleavened?: boolean;
  /** Miscela di farine in percentuale (es. Pinsa frumento/soia/riso, o un mix
   *  di più farine di frumento alla Bonci). Ogni componente ha la sua quota
   *  (`pct`, sommano a 100) e, se è una farina di frumento, la sua forza (`w`);
   *  i componenti senza `w` sono senza glutine. L'output mostra il breakdown in
   *  grammi con la W di ciascuna farina; la forza efficace dell'impasto è la
   *  media delle W di frumento pesata sulle quote. Modificabile dall'utente. VPL-B2. */
  flour_blend?: { name: string; pct: number; w?: number }[];
}

interface ShapeParameters {
  shape_type: ShapeType;
  dough_weight_g: number;
  thickness_factor: number;
  diameter_cm?: number;
  length_cm?: number;
  width_cm?: number;
}

interface BakingParameters {
  oven_type_required: OvenType;
  temp_c_range: [number, number];
  temp_c_ideal: number;
  cook_time_sec_range: [number, number];
  cook_time_sec_ideal: number;
  /** Metodo alternativo documentato, distinto dal range della cottura originale.
   * Senza questo dato, sotto il minimo non si promette una compensazione. */
  home_adaptation?: {
    min_temp_c: number;
    method: "inverted_tray";
    source_url: string;
  };
}

/** Struttura geometrica della preparazione — Sprint 11 Fase 1.
 *
 * Una pizza "single" è la classica: un solo disco/panetto/teglia monostrato.
 * Le altre permettono di modellare preparazioni complesse senza duplicare l'impasto:
 *
 * - "stacked"           → 2 dischi sovrapposti con olio in mezzo (Baciata, Marinella)
 * - "closed_stuffed"    → 2 dischi sigillati con ripieno interno (Ciaccino Senese)
 * - "folded_layers"     → 1 sfoglia ripiegata in N strati (Scaccia Ragusana)
 * - "double_thin_sheet" → 2 sfoglie sottilissime con ripieno tra esse (Focaccia di Recco)
 */
export type LayoutType =
  | "single"
  | "stacked"
  | "closed_stuffed"
  | "folded_layers"
  | "double_thin_sheet";

export interface LayoutSpec {
  type: LayoutType;
  /** Quanti pezzi compongono UNA unità servita (default 1, Baciata = 2, ecc.) */
  pieces_per_unit?: number;
  /** Cosa va tra i pezzi quando pieces_per_unit > 1 */
  interlayer?: "none" | "oil_brush" | "sealed_edges" | "internal_filling";
  /** Quando avviene la farcitura principale */
  filling_timing?: "pre_bake" | "post_bake_split" | "post_bake_external" | "pre_bake_internal";
  /** Modalità di cottura */
  cook_mode?: "topped" | "white_then_top" | "bianca_only";
  /** Numero di pieghe (solo folded_layers) */
  folds?: number;
}

/** Default layout = pizza tradizionale a singolo disco/teglia, topping pre-cottura. */
const DEFAULT_LAYOUT: Required<Omit<LayoutSpec, "folds">> = {
  type: "single",
  pieces_per_unit: 1,
  interlayer: "none",
  filling_timing: "pre_bake",
  cook_mode: "topped",
};

/** Layout effettivo dello stile con default applicati. */
export function getLayoutSpec(style: PizzaStyle): Required<Omit<LayoutSpec, "folds">> & { folds?: number } {
  if (!style.layout) return { ...DEFAULT_LAYOUT };
  return { ...DEFAULT_LAYOUT, ...style.layout };
}

/** True se lo stile è "farcito" (ripieno/sdoppiato a libro): l'UI mostra
 *  "Farcitura" al posto di "Condimento". Es. calzone, ciaccino, focaccia di
 *  Recco, fugazzeta, baciata/spaccata. */
export function isFillingStyle(style: PizzaStyle): boolean {
  const t = style.layout?.type;
  return (
    t === "closed_stuffed" ||
    t === "double_thin_sheet" ||
    t === "stacked" ||
    t === "folded_layers" ||
    // Spaccata: base singola cotta e poi spaccata/farcita a caldo.
    style.layout?.filling_timing === "post_bake_split"
  );
}

/** Unità di servizio per l'UI: come si chiama un pezzo di questa pizza. */
type ServingUnit = "panetto" | "teglia" | "pala" | "padellino" | "focaccia";

interface ServingUnitLabel {
  singular: string;
  plural: string;
}

export const SERVING_UNIT_LABELS: Record<ServingUnit, ServingUnitLabel> = {
  panetto: { singular: "Panetto", plural: "Panetti" },
  teglia: { singular: "Teglia", plural: "Teglie" },
  pala: { singular: "Pala", plural: "Pale" },
  padellino: { singular: "Padellino", plural: "Padellini" },
  focaccia: { singular: "Focaccia", plural: "Focacce" },
};

export interface StyleOrigin {
  city: string;
  province?: string; // riferimento provinciale/metropolitano per località non capoluogo
  region?: string;   // regione italiana o stato USA
  country?: string;  // es. "Italia", "USA", "Argentina"
}

/** Declared method rules; targets are model choices within the cited source.
 * A profile does not attest legal or association conformity. */
export interface MethodProcessProfile {
  id: string;
  source_url: string;
  direct_only?: boolean;
  proof_hours?: number;
  proof_in_pan?: boolean;
}

export interface PizzaStyle {
  method_profile?: MethodProcessProfile;
  formula_variant?: EngineMsg;
  id: string;
  name: string;
  /** Famiglia primaria (per grouping/badge). */
  family: FamilyId;
  /** Famiglie secondarie: uno stile può appartenere a più tradizioni (es. il
   * Canotto è napoletano MA contemporaneo). Il filtro le considera, il grouping
   * usa solo `family` per non duplicare le card (lug 2026). */
  families?: FamilyId[];
  origin: StyleOrigin;
  dough: DoughParameters;
  shape: ShapeParameters;
  baking: BakingParameters;
  crust_type: CrustType;
  requires_wood_oven: boolean;
  allows_additives: boolean;
  requires_pre_ferment: boolean;
  suitable_for_beginner: boolean;
  description: string;
  key_characteristics: string[];
  hydration_category: HydrationCategory;
  emoji: string;
  image?: string; // URL o data URL base64
  /** Unità di servizio per l'UI ("Panetti" / "Teglie" / "Padellini"...). Se omesso, derivato da shape_type. */
  serving_unit?: ServingUnit;
  /** Numero predefinito di pezzi nel wizard. Tipico: 4 per panetti, 1 per teglie/pale/padellini. */
  default_dough_balls?: number;
  /** Quante persone serve UNA porzione (un panetto, una teglia, ecc.). Range [min, max]. */
  servings_per_unit?: [number, number];
  /** C-2: moltiplicatore delle dosi dei condimenti quando lo stile usa ricette
   *  scritte per un altro formato (pizza al metro con il catalogo napoletano). */
  topping_scale?: number;
  /** Audit totale n. 7: l'impasto si stende in teglia dopo lo staglio e fa
   *  l'appretto lì (Detroit, grandma, focacce, sfincione…). Senza il flag
   *  l'appretto si fa a panetti e la stesura viene subito prima della cottura
   *  (teglia e pala romana, al metro, tonde). */
  proof_in_pan?: boolean;
  /** Sprint 11 Fase 1 — struttura geometrica (stacked/closed/folded/double_sheet).
   * Opzionale: omesso = single (pizza/teglia/panetto monostrato classico). */
  layout?: LayoutSpec;
  /** Preserve the selected style layout when a topping declares another method. */
  reference_layout?: LayoutSpec;
  /** Sprint 11 Fase 2 — id del topping di default (cercato in TOPPING_LIBRARY).
   * Le sue pre_prep, assembly_steps e bake_adjustments si iniettano nella timeline. */
  default_topping_ref?: string;
  /** Sprint 11 Fase 3 — id dell'impasto di default (cercato in IMPASTO_LIBRARY).
   * I suoi dough_overrides si applicano al dough base dello stile.
   * Le versioni possono offrire impasti alternativi tramite impasto_ref. */
  default_impasto_ref?: string;
  /** Sprint 12 Fase 1 (#82) — id del formato canonico (cercato in FORMATS).
   * Se presente, l'UI può offrire formati alternativi mantenendo l'impasto.
   * Se omesso, il motore usa `shape` inline come formato (retrocompat). */
  default_format_id?: string;
  /** Sprint 12 Fase 1 (#82) — id del metodo di cottura canonico (in COOKINGS).
   * Se omesso, il motore usa `baking` inline come cottura (retrocompat). */
  default_cooking_id?: string;
}

/** Deriva l'unità di servizio dallo stile, con override esplicito o fallback shape-based. */
export function getServingUnit(style: PizzaStyle): ServingUnit {
  if (style.serving_unit) return style.serving_unit;
  // Eccezioni note
  if (style.id === "padellino_torino") return "padellino";
  if (style.id === "focaccia_recco" || style.id === "focaccia_genovese") return "focaccia";
  // Default da shape_type
  if (style.shape.shape_type === "rectangular") return "teglia";
  if (style.shape.shape_type === "oval") return "pala";
  return "panetto";
}

/** Quante persone serve una unità (panetto/teglia/pala/...).
 * Derivato da servings_per_unit esplicito, oppure stimato dalla shape e dalle dimensioni.
 * Restituisce [min, max]. */
export function getServingsRange(style: PizzaStyle): [number, number] {
  if (style.servings_per_unit) return style.servings_per_unit;
  // Stima da dimensioni + shape_type
  const s = style.shape;
  if (s.shape_type === "round") {
    const d = s.diameter_cm ?? 30;
    if (d <= 22) return [1, 1];           // padellino, tonda piccola
    if (d <= 30) return [1, 2];           // tonda standard
    if (d <= 35) return [2, 3];           // tonda grande / NY
    return [3, 4];
  }
  if (s.shape_type === "oval") {
    const area = (s.length_cm ?? 35) * (s.width_cm ?? 20);
    if (area <= 500) return [1, 1];       // pala piccola
    if (area <= 800) return [1, 2];
    return [2, 3];
  }
  // rectangular
  const area = (s.length_cm ?? 40) * (s.width_cm ?? 30);
  if (area <= 600) return [3, 4];         // teglia piccola
  if (area <= 900) return [4, 5];         // teglia media (30x30)
  if (area <= 1200) return [4, 6];        // teglia standard 40x30
  return [6, 8];
}

/** Default dough_balls per l'UI in base allo serving_unit. */
export function getDefaultDoughBalls(style: PizzaStyle): number {
  if (style.default_dough_balls !== undefined) return style.default_dough_balls;
  return getServingUnit(style) === "panetto" ? 4 : 1;
}

export interface UserConstraints {
  oven_type: OvenType;
  oven_max_temp_c: number;
  /** Limite fisico del forno scelto, distinto dalla temperatura di cottura.
   * Una regolazione della ricetta non può aumentare la capacità del forno. */
  oven_capacity_temp_c?: number;
  skill_level: SkillLevel;
  available_hours: number;
  /** true: available_hours sono le ore fino a un pasto scelto, quindi la
   *  timeline intera (impasto, staglio, cottura…) deve starci (ENG-4).
   *  Assente o false («Nessuna preferenza», profilo, Scopri): le ore limitano
   *  solo la fermentazione, senza scadenza né avviso di finestra. */
  meal_deadline?: boolean;
  dough_balls: number;
  has_mixer: boolean;
  has_pizza_stone: boolean;
  has_pizza_steel: boolean;
  has_baking_pan: boolean;
  dietary_filters: string[];
  kitchen_temp_c?: number;
  pantry_flours: string[]; // e.g. ['00','0','manitoba','integrale','semola']
  /** Partial inventory is the default: omission does not prove absence. */
  pantry_inventory_complete?: boolean;
  allow_flour_purchase?: boolean;
  excluded_flours?: string[];
  pantry_flour_details?: Record<string, PantryFlourDetails>;
  pantry_ingredients?: string[];
  pantry_ingredients_complete?: boolean;
  excluded_ingredients?: string[];
  excluded_yeasts?: string[];
  equipment_inventory_complete?: boolean;
  allow_equipment_purchase?: boolean;
  pantry_yeasts: string[]; // e.g. ['fresh','dry','sourdough']
  /** Advanced equipment — mixer type from profile (hands/planetary/spiral/fork/stand_domestic) */
  mixer_type?: string | null;
  /** Advanced equipment — baking surfaces from profile */
  surfaces?: string[];
  /** M-11: correzione personale della velocità di lievitazione («la mia
   *  cucina lievita più veloce»). 1 = come il modello; 1,25 = lievita il 25%
   *  più in fretta, quindi serve meno lievito. Limitata a 0,5–2. */
  yeast_speed_factor?: number;
  /** Advanced oven heat profile — resistances/burner layout from profile */
  oven_heat_profile?:
    | "static_top_bottom"
    | "top_grill"
    | "bottom_boost"
    | "fan_assisted"
    | "gas_bottom"
    | "gas_rear"
    | "wood_side_flame";
}

/** Engine message: key-based for i18n, fallback for backward compat */
export interface EngineMsg {
  key: string;
  fallback: string;
  params?: Record<string, string | number | string[]>;
}

/** Shorthand to create an EngineMsg */
function em(key: string, fallback: string, params?: Record<string, string | number>): EngineMsg {
  return params ? { key, fallback, params } : { key, fallback };
}

/** Resolve an EngineMsg array to localized strings using CMS engine templates */
export function resolveEngineMsgs(
  msgs: EngineMsg[],
  templates?: Record<string, string>,
  formatParam?: (msg: EngineMsg, key: string, value: string | number | string[]) => string | number,
): string[] {
  return msgs.map((m) => {
    const tpl = templates?.[m.key] ?? m.fallback;
    if (!m.params) return tpl;
    return Object.entries(m.params).reduce(
      (s, [k, v]) => s.split(`{${k}}`).join(String(formatParam ? formatParam(m, k, v) : Array.isArray(v) ? v.join(", ") : v)),
      tpl,
    );
  });
}

export interface RecipeScores {
  authenticity: number;
  feasibility: number;
  digestibility: number;
  experimentation: number;
  sustainability: number;
  composite: number;
  /** Calcolo ispezionabile del globale: media e limiti non compensabili. */
  global_calculation?: GlobalScoreCalculation;
  authenticity_category: string;
  feasibility_category: string;
  digestibility_category: string;
  experimentation_category: string;
  sustainability_category: string;
  penalties: EngineMsg[];
  warnings: EngineMsg[];
  claims: EngineMsg[];
}

/* ═══ SCORE DIMENSIONS — single source of truth for labels/colors ═══ */
export type ScoreDimensionKey = "authenticity" | "feasibility" | "digestibility" | "experimentation" | "sustainability";

interface ScoreDimension {
  key: ScoreDimensionKey;
  label: string;
  short: string;
  weight: number;
}

export const SCORE_DIMENSIONS: ScoreDimension[] = [
  { key: "authenticity", label: "Autenticità", short: "Aut", weight: 0.45 },
  { key: "feasibility", label: "Fattibilità", short: "Fat", weight: 0.30 },
  { key: "digestibility", label: "Digeribilità", short: "Dig", weight: 0.25 },
];

/* ═══ YEAST LABELS — single source of truth ═══ */
export const YEAST_LABELS: Record<string, string> = {
  fresh: "Lievito fresco",
  dry: "Lievito secco",
  sourdough: "Lievito madre",
};

/* ═══ ENUM LABELS — mai mostrare enum crudi ("extreme", "thick_airy") in UI ═══ */
const HYDRATION_CATEGORY_LABELS: Record<HydrationCategory, string> = {
  low: "Bassa idratazione",
  medium: "Media idratazione",
  high: "Alta idratazione",
  extreme: "Estrema idratazione",
};

const CRUST_TYPE_LABELS: Record<CrustType, string> = {
  leopard_soft: "Leopardata morbida",
  crispy_thin: "Sottile croccante",
  thick_airy: "Alta soffice",
  cheese_crown: "Bordo al formaggio",
  deep_dish: "Deep dish",
  focaccia_soft: "Focaccia soffice",
  stuffed_thin: "Ripiena sottile",
  pan_crispy: "Padellino croccante",
};

export function localizeHydrationCategory(cat: string): string {
  return HYDRATION_CATEGORY_LABELS[cat as HydrationCategory] ?? cat;
}

export function localizeCrustType(crust: string): string {
  return (
    CRUST_TYPE_LABELS[crust as CrustType] ?? crust.replace(/_/g, " ")
  );
}

/* ═══ M-10 — Esito della ricetta ═══
 * Il motore non degrada in silenzio: dice se la ricetta riesce, riesce con
 * avvisi o non è fattibile così, e perché. Ogni motivo bloccante ha i numeri
 * per proporre un'alternativa (orario più avanti, forno o stile diverso). */
export type RecipeOutcome = "ok" | "warnings" | "not_feasible";

export type RecipeBlocker =
  /** Il forno non arriva alla temperatura che lo stile richiede. */
  | { kind: "oven_too_cold"; oven_c: number; style_min_c: number }
  /** Con un orario del pasto, la timeline non ci sta. */
  | { kind: "time_window"; available_h: number; needed_h: number }
  /** La ricetta scende sotto il minimo del metodo selezionato, anche quando
   * le ore sono scelte a mano. `needed_h` include le lavorazioni. */
  | { kind: "fermentation_too_short"; fermentation_h: number; style_min_h: number; needed_h: number }
  | { kind: "fermentation_too_long"; fermentation_h: number; style_max_h: number }
  | { kind: "fermentation_temperature"; actual_c: number; required_c: number }
  | { kind: "resource_excluded"; resource: "flour" | "equipment" | "ingredient"; message: EngineMsg }
  | { kind: "dietary_conflict"; filter_id: string; ingredients: string[]; message: EngineMsg };

export interface RecipeCondition {
  kind: "pan" | "deck" | "flour" | "flour_blend" | "yeast" | "ingredient";
  status: "missing" | "unverified";
  message: EngineMsg;
  acquisition?: "ingredient" | "accessory" | "appliance";
}

export interface RecipeVerdict {
  outcome: RecipeOutcome;
  blockers: RecipeBlocker[];
  /** Condizioni e modifiche da rispettare: senza applicarle non è un «sì». */
  adaptations: EngineMsg[];
  conditions?: RecipeCondition[];
}

/** Sotto questa viabilità termica lo stile non si ottiene (stessa soglia
 *  dell'avviso feas.thermalUnviable). */
const THERMAL_UNVIABLE_THRESHOLD = 0.6;

export interface GeneratedRecipe {
  topping_scale: number;
  topping_geometry: { reference_area_cm2: number; area_cm2: number; area_scale: number };
  pan_config?: PanConfig;
  method_changes?: EngineMsg[];
  schema_version: string; // Notion Pag.09: recipe data schema version
  /** M-10: esito esplicito (riuscito, con avvisi, non fattibile così). */
  verdict: RecipeVerdict;
  optional_aids?: EngineMsg[];
  dietary_warnings?: DietaryWarning[];
  dietary_variant?: { reference_topping_id: string; topping_id: string; omitted_conflicts: string[] };
  style: PizzaStyle;
  dough_balls: number;
  flour_g: number;
  water_g: number;
  salt_g: number;
  oil_g: number;
  fat_g: number; // Grasso totale (olio o burro equivalente)
  fat_label: string; // "Olio EVO" | "Burro" | "Strutto" etc.
  sugar_g: number;
  yeast_g: number;
  yeast_type: "fresh" | "dry" | "sourdough";
  hydration_pct: number;
  baker_pcts?: { salt: number; fat: number; sugar: number };
  flour_w: number;
  flour_pl: number; // P/L stimato
  /** VPL-B2 — mix di farine risolto (con grammi per componente). Presente solo
   * per le ricette a blend (es. Pinsa, Bonci). */
  flour_blend?: { name: string; pct: number; w?: number; grams: number }[];
  /** VPL-B2 — forza glutinica efficace del mix (W frumento diluita dalla quota
   * senza glutine). Informativa; presente solo per blend con farine prive di W. */
  effective_gluten_w?: number;
  fermentation_hours: number;
  fermentation_temp_c: number;
  has_pre_ferment: boolean;
  pre_ferment_type?: string;
  /** D-043 — farina nel pre-fermento, % della farina totale. */
  pre_ferment_flour_pct?: number;
  oven_temp_c: number;
  cook_time_sec: number;
  total_dough_g: number;
  ball_weight_g: number;
  water_temp_c: number | null; // Regola 55: temperatura acqua consigliata
  scores: RecipeScores;
  timeline: TimelineStep[];
  tips: string[];
  science: ScientificLayer;
  /** Topping info from parametric database (Audit: topping awareness) */
  topping_info?: {
    toppingOrder: string[];
    saucePosition: string;
    cheeseType: string;
    cheesePosition: string;
    note: string;
  };
}

interface CompensationApplied {
  type: string;
  original: number;
  compensated: number;
  reason: string;
}

/** M-11: come è stata calcolata la dose di lievito commerciale, per mostrarlo
 *  all'utente. Il margine è una stima (marca e freschezza del lievito,
 *  oscillazioni di temperatura di ±2 °C), non una misura. */
export interface YeastModelInfo {
  /** Dose di riferimento: % di lievito fresco sulla farina per 24 h a 18 °C. */
  reference_pct: number;
  reference_hours: number;
  reference_temp_c: number;
  /** Esponente sulle ore: il lievito si moltiplica, la dose non scala 1:1. */
  time_exponent: number;
  /** Velocità alla temperatura di fermentazione rispetto a 18 °C (Q10 a tratti). */
  speed_ratio: number;
  q10_model: "standard" | "cold_adapted" | "sourdough";
  /** Lievito secco: un terzo del fresco. */
  dry_ratio: number;
  /** Correzione personale applicata (1 = nessuna). */
  personal_factor: number;
  /** Intervallo plausibile della dose (% sulla farina). */
  range_pct: [number, number];
}

/** Margine stimato della dose di lievito: −30% / +30%. */
export const YEAST_DOSE_MARGIN: [number, number] = [0.7, 1.3];
const YEAST_REFERENCE_PCT = 0.1;
const YEAST_REFERENCE_HOURS = 24;
const YEAST_TIME_EXPONENT = 0.7;
const YEAST_DRY_RATIO = 0.33;

/** Correzione personale accettata dal motore. */
export function clampYeastSpeedFactor(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 1;
  return Math.min(2, Math.max(0.5, value));
}

interface ScientificLayer {
  /** M-11: modello della dose di lievito commerciale (assente con lievito madre o senza lievito). */
  yeast_model?: YeastModelInfo;
  yeast_baker_pct: number;
  effective_hours_18c: number;
  fodmap_reduction_pct: number | null;
  gluten_network: number;
  proteolysis_index: number;
  water_activity: number;
  starch_degradation_pct: number;
  q10_factor: number;
  q10_model: "standard" | "cold_adapted" | "sourdough"; // Audit Database: Q10 variabile
  authenticity_breakdown: Record<string, number>;
  compensations: CompensationApplied[]; // Audit Maestro P0-4: traccia compensazioni applicate
  flour_pl_estimated: number; // P/L stimato dalla W (Audit Maestro P0-1)
  baking_energy_kj: number; // Stima energia cottura (Audit Sustainability)
  /** Regola 55: desired dough temperature °C */
  desired_dough_temp_c: number;
  /** Regola 55: friction factor from mixer (0 for hands) */
  friction_factor: number;
  /** Regola 55: temperatura dell'acqua °C, limitata al range pratico 2–40°C
   *  (null solo in ricette salvate prima del 22/10/2026). */
  water_temp_c: number | null;
  /** ENG-7: la Regola 55 chiederebbe acqua oltre il range pratico. "max" =
   *  cucina fredda (servirebbe > 40°C), "min" = cucina calda (< 2°C). */
  water_temp_limit?: "max" | "min" | null;
  /** Deviation tracking (Notion Pag.04/05): style deviation + compensation deviation */
  deviation_category: string; // from STYLE_DEVIATIONS
  deviation_score_intrinsic: number; // 0-1, from style's canonical deviation
  deviation_score_effective: number; // 0-1, intrinsic + user parameter deviations + compensations
  compensation_deviation_points: string[]; // which deviation points are triggered by compensations
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  icon: string;
  timing_label: string;
  tip?: {
    beginner: string;
    nerd: string;
  };
  /** Variante di testo per la localizzazione (es. preriscaldo: cosa fanno i
   *  panetti mentre il forno scalda). Assente = testo standard. */
  /** I18N-2: testi del passo come messaggi con chiave CMS, parametri e
   *  fallback italiano. La UI li traduce; title/description restano l'italiano. */
  msg?: {
    title?: EngineMsg;
    description?: EngineMsg[];
    tip?: { beginner: EngineMsg; nerd: EngineMsg };
  };
  /** «oil»/«fry»: passi di frittura (M-6) per gli stili fritti. */
  variant?: "whole_proof" | "during_rest" | "oil" | "fry" | "pan";
  /** D-050: quante volte si ripete la cottura (una pizza o teglia alla volta);
   *  duration_minutes è già il totale. */
  rounds?: number;
  /** Passive activity already contained in this timeline block. Never subtract it again. */
  parallel_activity?: { kind: "proof" | "rest"; duration_minutes: number; included_in_fermentation: true };
  /** Lavoro per unità: duration_minutes include già tutte le unità. */
  work_units?: number;
  minutes_per_unit?: number;
}

export function passiveActivityMessage(step: TimelineStep): EngineMsg | null {
  if (!step.parallel_activity) return null;
  const rest = step.parallel_activity.kind === "rest";
  return em(rest ? "timeline.preheat.includesRest" : "timeline.preheat.includesProof",
    rest ? "Questo blocco comprende {minutes} minuti di riposo, già inclusi nel tempo totale: non aggiungerli di nuovo."
      : "Questo blocco comprende {minutes} minuti di appretto, già inclusi nella fermentazione totale: non aggiungerli di nuovo.",
    { minutes: step.parallel_activity.duration_minutes });
}

/** Passaggi che sono riposo o fermentazione dell'impasto: la loro somma è uguale
 *  alle ore di fermentazione. Il preriscaldo è ricavato dentro appretto o
 *  puntata (avviene in parallelo), quindi conta qui. Tutto il resto è overhead
 *  fisso: impasto, staglio, stesura, farcitura, cottura (ENG-4). */
const FERMENTATION_STEP_IDS = new Set(["preferment", "bulk", "proof", "preheat"]);

/** Minuti della timeline che NON sono fermentazione (overhead fisso). */
export function timelineOverheadMinutes(timeline: TimelineStep[]): number {
  return timeline
    .filter((step) => !FERMENTATION_STEP_IDS.has(step.id))
    .reduce((sum, step) => sum + step.duration_minutes, 0);
}

/** Fermentazione minima quando la finestra è stretta (ENG-4): 1h per gli
 *  impasti lievitati (sotto le 2h vale il modello cinetico con tetto 3%, ENG-3);
 *  uno stile con minimo più basso (Recco, riposo 0,5h) tiene il suo. */
const MIN_FERMENTATION_HOURS = 1;

function minimumFermentationHours(fermRange: [number, number]): number {
  return Math.min(fermRange[0], MIN_FERMENTATION_HOURS);
}

/** Ore di fermentazione che stanno nella finestra togliendo l'overhead fisso,
 *  arrotondate per difetto al quarto d'ora (orari umani, somme esatte). */
function fermentationWindowHours(availableHours: number, overheadMinutes: number): number {
  return floorToQuarterHour((availableHours * 60 - overheadMinutes) / 60);
}

// ═══ STYLES DATABASE ═══

// ═══ STILI & FAMIGLIE — estratti in ./styles-db (audit lug 2026) ═══
// Re-export di compatibilità: tutti gli import esistenti da pizza-engine
// continuano a funzionare. Chi NON usa il motore (es. styles-override-context)
// importa direttamente da ./styles-db per non caricarlo.
import { STYLES_DB } from "./styles-db";
export {
  PIZZA_FAMILIES,
  STYLES_DB,
  formatOrigin,
  shortOrigin,
  styleMatchesFamily,
} from "./styles-db";


// ═══ Q10 MODEL — VARIABLE BY YEAST TYPE & TEMPERATURE ═══
// Stime del modello, non valori di letteratura (C-4, docs/fonti-dati.md §4).
// Q10 ≈ 2 tra 18 e 25 °C è coerente con i tassi di crescita di S. cerevisiae
// (Salvadó et al. 2011). Il valore 1,6 sotto i 10 °C è una scelta del modello
// senza fonte. Per il lievito madre (batteri lattici + lieviti) i valori sono
// anch'essi stime da verificare.
//
// getQ10 restituisce il Q10 LOCALE del tratto in cui cade la temperatura. Per la
// velocità rispetto a 18°C si usa fermentationSpeedRatio, che applica i tratti in
// modo continuo (audit motore 22/10/2026, ENG-2). Prima l'esponente partiva sempre
// da 18°C con il Q10 del tratto finale: a 10°C c'era un salto non fisico (scaldando
// da 9,9 a 10°C il lievito saliva). Il vecchio commento diceva che Q10=2 fisso
// «sovrastima l'attività a bassa T», ma il Q10 più basso sotto i 10°C dà PIÙ
// attività a freddo, non meno: commento ed effetto si contraddicevano.

export function getQ10(
  yeastType: "fresh" | "dry" | "sourdough",
  tempC: number,
): { q10: number; model: "standard" | "cold_adapted" | "sourdough" } {
  if (yeastType === "sourdough") {
    // Lievito madre: LAB dominano sotto 15°C con Q10 più alto
    return {
      q10: tempC > 15 ? 2.2 : 1.9,
      model: "sourdough",
    };
  }
  if (tempC < 10) {
    // Cold fermentation: Q10 1,6 sotto i 10°C. È una scelta del modello senza
    // fonte verificata: il riferimento citato prima (PMC7146123) è una review sui
    // soft sensor di fermentazione e non parla di lievito (verifica del 24/10/2026,
    // voce C-4). In UI lo mostriamo come stima, non come dato misurato.
    return { q10: 1.6, model: "cold_adapted" };
  }
  return { q10: 2.0, model: "standard" };
}

/** Temperatura di riferimento del modello cinetico (°C). */
const Q10_REFERENCE_TEMP_C = 18;

/**
 * Velocità di fermentazione relativa a 18°C con Q10 a tratti CONTINUO
 * (decisione di Matteo, 22/10/2026 — ENG-2).
 *
 * - Lievito commerciale: Q10 2,0 da 18 a 10°C, poi 1,6 sotto i 10°C partendo
 *   dal valore raggiunto a 10°C.
 * - Lievito madre: Q10 2,2 sopra i 15°C, poi 1,9 sotto i 15°C con lo stesso
 *   raccordo (stesso salto, stessa correzione).
 *
 * È la sola fonte del fattore di velocità: dose di lievito, ore equivalenti a
 * 18°C (digeribilità e livello scientifico) e testi della timeline. Funzione
 * crescente e continua in T.
 */
export function fermentationSpeedRatio(
  yeastType: "fresh" | "dry" | "sourdough",
  tempC: number,
): number {
  const breakC = yeastType === "sourdough" ? 15 : 10;
  const q10Above = getQ10(yeastType, breakC + 1).q10;
  const q10Below = getQ10(yeastType, breakC - 1).q10;
  if (tempC >= breakC) {
    return Math.pow(q10Above, (tempC - Q10_REFERENCE_TEMP_C) / 10);
  }
  return (
    Math.pow(q10Above, (breakC - Q10_REFERENCE_TEMP_C) / 10) *
    Math.pow(q10Below, (tempC - breakC) / 10)
  );
}

// ═══ FERMENTATION TEMPERATURE DEFAULT ═══
// Audit role-play giugno 2026 (finding F4): il vecchio default binario
// `hours > 12 ? 4 : 22` forzava il FRIGO su qualsiasi maturazione lunga, anche
// sugli stili tradizionalmente a temperatura ambiente. Per la Napoletana STG —
// impasto diretto a TA per disciplinare — questo dava digeribilità "Media" su
// 24h a lievito madre (anti-disciplinare e controintuitivo). Ora gli stili
// diretti a TA restano in ambiente anche a lunga maturazione; gli altri lunghi
// mantengono il frigo. Usato come DEFAULT quando l'utente non sceglie la temp.
const ROOM_TEMP_DIRECT_STYLES = new Set<string>([
  "napoletana_stg",
  "tonda_romana",
]);

export function defaultFermentTempC(style: PizzaStyle, fermentationHours: number): number {
  if (style.dough.fermentation_temp_c !== undefined) return style.dough.fermentation_temp_c;
  if (style.dough.unleavened) return 20; // sfoglia: solo riposo a TA
  if (ROOM_TEMP_DIRECT_STYLES.has(style.id)) return 22; // diretto a TA anche se lungo
  return fermentationHours > 12 ? 4 : 22;
}

// ═══ THERMAL VIABILITY — "il forno ce la fa?" (Audit role-play giugno 2026) ═══
// Solo penalità di autenticità/scoring: NON stabilisce la fattibilità.
// L'esito operativo usa i minimi del metodo e gli adattamenti documentati.
// Per gli stili in cui la cottura È l'identità (forno a legna richiesto, o minimo
// stile ≥ 350°C: Napoletana, Canotto, Pinsa, Pala), scendere sotto il minimo
// significa che leopardatura, cornicione e struttura canonici sono FISICAMENTE
// irraggiungibili. Restituisce 1 (nessun impatto) quando il forno basta, altrimenti
// un fattore 0.25–1 che fa crollare l'autenticità e la fattibilità (rompe il
// pavimento strutturale ~65 dell'A-Score). Per gli stili da forno domestico
// (teglia, detroit, focacce…) ritorna sempre 1: la loro temperatura è raggiungibile.
export function thermalViability(style: PizzaStyle, ovenTemp: number): number {
  const styleMinTemp = style.baking.temp_c_range[0];
  const tempCritical = style.requires_wood_oven || style.baking.oven_type_required === "coal" || styleMinTemp >= 350;
  if (!tempCritical || ovenTemp >= styleMinTemp) return 1;
  const deficitFrac = (styleMinTemp - ovenTemp) / styleMinTemp; // 0..1
  return Math.max(0.25, 1 - deficitFrac * 1.6);
}

/** Metodo domestico realmente implementato, non dedotto da un punteggio. */
function homeBakingAdaptation(style: PizzaStyle, ovenType: OvenType, ovenTemp: number) {
  const method = style.baking.home_adaptation;
  return method && HOME_OVENS.has(ovenType) &&
    ovenTemp >= method.min_temp_c && ovenTemp < style.baking.temp_c_range[0]
    ? method : null;
}

function constrainOvenToCapacity(constraints: UserConstraints): UserConstraints {
  constraints = { ...constraints,
    pantry_flours: constraints.pantry_flours.filter(id => !(constraints.excluded_flours ?? []).includes(id)),
    pantry_yeasts: constraints.pantry_yeasts.filter(id => !(constraints.excluded_yeasts ?? []).includes(id)),
  };
  const capacity = constraints.oven_capacity_temp_c;
  return capacity !== undefined && Number.isFinite(capacity) && capacity > 0
    ? { ...constraints, oven_max_temp_c: Math.min(constraints.oven_max_temp_c, capacity) }
    : constraints;
}

/** Limite operativo: le euristiche di autenticità non stabiliscono se si può
 * cucinare. Sotto il range serve un metodo alternativo documentato. */
function minimumSupportedOvenTemp(style: PizzaStyle, constraints: UserConstraints): number {
  return HOME_OVENS.has(constraints.oven_type)
    ? Math.min(style.baking.temp_c_range[0], style.baking.home_adaptation?.min_temp_c ?? Infinity)
    : style.baking.temp_c_range[0];
}

/** Prerequisiti dichiarati, comuni a consiglio e ricetta: la dispensa vuota
 * non prova di avere una farina; l'attrezzatura non scelta non è disponibile
 * per magia. Queste sono condizioni da soddisfare, non blocchi fisici. */
function kitchenPrerequisites(style: PizzaStyle, constraints: UserConstraints, flourW: number, yeastType: GeneratedRecipe["yeast_type"]): RecipeCondition[] {
  const conditions: RecipeCondition[] = [];
  const add = (kind: RecipeCondition["kind"], status: RecipeCondition["status"], message: EngineMsg) => conditions.push({ kind, status, message });
  const surfaces = constraints.surfaces ?? [];
  const hasPan = constraints.has_baking_pan || surfaces.some((s) =>
    ["aluminum_pan", "blue_steel_pan", "cast_iron"].includes(s),
  );
  const panStyle = style.proof_in_pan || style.shape.shape_type === "rectangular" ||
    ["chicago_deep", "padellino_torino", "focaccia_barese", "greek_pan", "focaccia_recco", "ciaccino_senese", "fugazzeta"].includes(style.id);
  const homeMethod = homeBakingAdaptation(style, constraints.oven_type, constraints.oven_max_temp_c);
  if (!isFriedStyle(style) && (panStyle || homeMethod) && !hasPan) {
    add("pan", constraints.equipment_inventory_complete ? "missing" : "unverified", constraints.equipment_inventory_complete
      ? em("need.pan", "Se ti procuri una teglia") : em("need.checkPan", "Se hai una teglia"));
  }
  if (!isFriedStyle(style) && !panStyle && !homeMethod && HOME_OVENS.has(constraints.oven_type) &&
    !constraints.has_pizza_stone && !constraints.has_pizza_steel &&
    !surfaces.some((s) => ["cordierite_stone", "refractory_brick", "steel_plate"].includes(s))) {
    add("deck", constraints.equipment_inventory_complete ? "missing" : "unverified", constraints.equipment_inventory_complete
      ? em("need.deck", "Serve pietra o acciaio") : em("need.checkDeck", "Se hai pietra o acciaio"));
  }
  const pantryRanges = constraints.pantry_flours.map(id => pantryFlourRange(constraints, id)).filter((range): range is [number, number] => Boolean(range));
  const confirmed = constraints.pantry_flours.filter(id => pantryFlourIsDeclared(constraints, id));
  const confirmedCoversW = confirmed.some(id => { const range = pantryFlourRange(constraints, id); return range && range[0] <= flourW && flourW <= range[1]; });
  const confirmedMix = pantryFlourMix(confirmed, [flourW, flourW], true, constraints.pantry_flour_details);
  const unknownFlour = !confirmedCoversW && !confirmedMix && (constraints.pantry_inventory_complete !== true || constraints.pantry_flours.some(id => !pantryFlourIsDeclared(constraints, id)));
  const coversW = pantryRanges.some(([lo, hi]) => lo <= flourW && flourW <= hi);
  const mix = !coversW ? pantryFlourMix(constraints.pantry_flours, [flourW, flourW], true, constraints.pantry_flour_details) : null;
  if (unknownFlour || (!coversW && !mix)) {
    add("flour", unknownFlour ? "unverified" : "missing", unknownFlour
      ? em("need.checkFlour", "Se hai farina W{w}", { w: flourW })
      : em("need.flour", "Serve farina W{w}", { w: flourW }));
  }
  if ((style.dough.flour_blend?.length ?? 0) > 1) {
    // La dispensa censisce prodotti/farine, non tutti i componenti di ogni blend.
    // La compatibilità W del frumento non prova di avere anche soia/riso, ecc.
    add("flour_blend", "unverified", em("need.checkBlend", "Se hai tutte le farine del mix"));
  }
  if (!style.dough.unleavened && !constraints.pantry_yeasts.includes(yeastType)) {
    const unknown = constraints.pantry_inventory_complete !== true;
    add("yeast", unknown ? "unverified" : "missing", unknown
      ? em("need.checkYeast", "Se hai lievito: {yeast}", { yeast: yeastType })
      : em("need.yeast", "Serve lievito: {yeast}", { yeast: yeastType }));
  }
  for (const c of conditions) c.acquisition = c.kind === "pan" || c.kind === "deck" ? "accessory" : "ingredient";
  return conditions;
}

/** Only exclusions that can be verified from the actual dough are blockers.
 * An excluded generic flour category is not inferred from its W. */
function excludedRecipeFlours(style: PizzaStyle, excluded: readonly string[]): string[] {
  const names = (style.dough.flour_blend ?? []).filter(c => c.pct > 0).map(c => c.name.toLowerCase());
  return excluded.filter(id => id === "frumento" || names.some(name => name.includes(id)));
}

// ═══ COMPENSATION ENGINE ═══
// Audit Maestro P0-4: 8 compensazioni parametriche per deficit forno
// Audit Database: formula idratazione deve essere logaritmica (Modernist Pizza 2021)

interface OvenCompensations {
  hydration_delta_pct: number; // Aumento idratazione per non seccare
  oil_delta_pct: number; // Aumento grasso per tenerezza (shortening)
  sugar_delta_pct: number; // Aumento zucchero per Maillard a bassa T
  cook_time_sec: number; // Tempo cottura compensato
  thickness_factor: number; // Fattore spessore (1.0 = invariato, 0.8 = -20%)
  compensations: CompensationApplied[];
}

export function calculateOvenCompensations(
  style: PizzaStyle,
  ovenTemp: number,
): OvenCompensations {
  const idealTemp = style.baking.temp_c_ideal;
  const deficit = Math.max(0, idealTemp - ovenTemp);
  const compensations: CompensationApplied[] = [];

  // ── Hydration: logarithmic model (Modernist Pizza 2021) ──
  // Audit Database V3: lineare sovrastima a bassi deficit, sottostima a grandi deficit
  // Dati empirici: 50°C→+2%, 100°C→+5%, 150°C→+9%, 200°C→+14%
  let hydrationDelta = 0;
  if (deficit > 20) {
    hydrationDelta =
      Math.round(5 * Math.log(1 + deficit / 50) * 10) / 10;
    compensations.push({
      type: "hydration",
      original: 0,
      compensated: hydrationDelta,
      reason: `+${hydrationDelta}% idratazione per compensare deficit ${deficit}°C (modello logaritmico)`,
    });
  }

  // ── Oil: +2% per deficit > 150°C (Modernist Pizza empirico) ──
  let oilDelta = 0;
  if (deficit > 150 && style.allows_additives && style.dough.fat_type !== "butter") {
    oilDelta = Math.min(3, Math.round((deficit - 150) * 0.02 * 10) / 10 + 2);
    compensations.push({
      type: "oil",
      original: style.dough.oil_pct,
      compensated: style.dough.oil_pct + oilDelta,
      reason: `+${oilDelta}% grasso per tenerezza (shortening) con forno domestico`,
    });
  }

  // ── Sugar: +0.5-1% per Maillard a bassa T (< 300°C) ──
  let sugarDelta = 0;
  if (ovenTemp < 300 && deficit > 100 && style.allows_additives) {
    sugarDelta = Math.min(1.5, Math.round((deficit - 100) * 0.01 * 10) / 10 + 0.5);
    compensations.push({
      type: "sugar",
      original: style.dough.sugar_pct,
      compensated: style.dough.sugar_pct + sugarDelta,
      reason: `+${sugarDelta}% zucchero per reazione di Maillard a ${ovenTemp}°C`,
    });
  }

  // ── Cook time: Arrhenius-like exponential model ──
  // Audit Maestro: inversione lineare imprecisa per deficit estremi
  // Modello: t = t_ideal × e^(k × deficit) con k empirico
  // Calibrato su: 485°C→75s, 400°C→~130s, 280°C→~270s, 250°C→~345s
  // Nota: fit imperfetto su singola esponenziale — k=0.0065 è best compromise
  const k = 0.0065; // Ricalibrato (era 0.0045 — sottostimava ~40% a T domestiche)
  const cookTime = Math.round(
    style.baking.cook_time_sec_ideal * Math.exp(k * deficit),
  );
  if (deficit > 20) {
    compensations.push({
      type: "cook_time",
      original: style.baking.cook_time_sec_ideal,
      compensated: cookTime,
      reason: `Tempo cottura da ${formatCookTimeShort(style.baking.cook_time_sec_ideal)} a ${formatCookTimeShort(cookTime)} (modello esponenziale)`,
    });
  }

  // ── Thickness: -10-20% per cottura interna con forno freddo ──
  let thicknessFactor = 1.0;
  if (deficit > 200) {
    thicknessFactor = 0.8;
    compensations.push({
      type: "thickness",
      original: 1.0,
      compensated: 0.8,
      reason: "Stendere -20% più sottile per cottura uniforme con forno domestico",
    });
  } else if (deficit > 100) {
    thicknessFactor = 0.9;
    compensations.push({
      type: "thickness",
      original: 1.0,
      compensated: 0.9,
      reason: "Stendere leggermente più sottile per cottura interna",
    });
  }

  return {
    hydration_delta_pct: hydrationDelta,
    oil_delta_pct: oilDelta,
    sugar_delta_pct: sugarDelta,
    cook_time_sec: cookTime,
    thickness_factor: thicknessFactor,
    compensations,
  };
}

function formatCookTimeShort(sec: number): string {
  if (sec < 120) return `${sec}s`;
  return `${Math.round(sec / 60)}min`;
}

// ═══ P/L ESTIMATION FROM W ═══
// Audit Maestro: P/L assente è critico. Stima empirica da W quando P/L non è noto dall'utente.
// Correlazione P/L~W: farine deboli tendono P/L basso (estensibili), forti P/L più alto (tenaci)
// Fonte: dati Caputo, Mulino Dallagiovanna, letteratura alveografica

export function estimatePL(flourW: number, stylePlRange: [number, number]): number {
  // Stima base da W: regressione lineare sui dati medi delle farine italiane
  const plEstimate = 0.3 + (flourW - 150) * 0.0015; // W150→0.30, W250→0.45, W350→0.60
  // Clamp nel range dello stile
  return Math.round(
    Math.max(stylePlRange[0], Math.min(stylePlRange[1], plEstimate)) * 100,
  ) / 100;
}

// ═══ SCORING ALGORITHMS ═══

/**
 * Override puntuali per il centro dell'auth score quando un'interpretazione
 * è attiva (Maestro/Disciplinare/Community). Il "canone" non è più il centro
 * del range dello stile, ma il valore preciso dell'interpretazione.
 * Tolleranza simmetrica più stretta: ±3% H / ±25W / ±0.07 P/L / ±4h.
 */
interface AuthenticityCenter {
  hydration_pct?: number;
  flour_w?: number;
  flour_pl?: number;
  fermentation_hours?: number;
}

function calculateAuthenticityScore(
  style: PizzaStyle,
  hydration: number,
  ovenTemp: number,
  ovenType: OvenType,
  flourW: number,
  flourPL: number,
  fermentationHours: number,
  /** Centro auth da interpretazione attiva (override sul centro range). */
  interpretationCenter?: AuthenticityCenter,
  hasPreFerment = false,
): {
  score: number;
  penalties: EngineMsg[];
  breakdown: Record<string, number>;
} {
  const penalties: EngineMsg[] = [];
  const breakdown = {
    ingredienti: 100,
    processo: 100,
    attrezzatura: 100,
  };

  // Ingredient axis (30%) — include idratazione, W, P/L
  const hCenter =
    interpretationCenter?.hydration_pct ??
    (style.dough.hydration_pct_range[0] +
      style.dough.hydration_pct_range[1]) /
      2;
  const hTolerance = interpretationCenter?.hydration_pct !== undefined ? 3 : 5;
  const hDeviation = Math.abs(hydration - hCenter);
  if (hDeviation > hTolerance) {
    const penalty = Math.min(25, hDeviation * 2.5);
    breakdown.ingredienti -= penalty;
    penalties.push(
      em("auth.hydrationOff", `Idratazione fuori centro (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
    );
  }

  // Flour W check
  const wCenter =
    interpretationCenter?.flour_w ??
    (style.dough.flour_w_range[0] +
      style.dough.flour_w_range[1]) /
      2;
  const wTolerance = interpretationCenter?.flour_w !== undefined ? 25 : 30;
  const wDeviation = Math.abs(flourW - wCenter);
  if (wDeviation > wTolerance) {
    const penalty = Math.min(20, (wDeviation - wTolerance) * 0.5);
    breakdown.ingredienti -= penalty;
    penalties.push(
      em("auth.wOutOfRange", `W farina fuori range (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
    );
  }

  // P/L check — Audit Maestro P0-1: critico per autenticità
  const plCenter =
    interpretationCenter?.flour_pl ??
    (style.dough.flour_pl_range[0] + style.dough.flour_pl_range[1]) / 2;
  const plDeviation = Math.abs(flourPL - plCenter);
  if (plDeviation > 0.15) {
    const penalty = Math.min(15, plDeviation * 50);
    breakdown.ingredienti -= penalty;
    penalties.push(
      em("auth.plOutOfRange", `P/L ${flourPL.toFixed(2)} fuori range ${style.dough.flour_pl_range[0]}-${style.dough.flour_pl_range[1]} (-${penalty.toFixed(1)}%)`, { pl: flourPL.toFixed(2), plMin: style.dough.flour_pl_range[0], plMax: style.dough.flour_pl_range[1], penalty: penalty.toFixed(1) }),
    );
  }

  // Equipment axis (35%)
  if (style.requires_wood_oven && ovenType !== "wood") {
    breakdown.attrezzatura -= 15;
    penalties.push(em("auth.notWoodOven", "Forno non a legna (-15%)"));
    const tempRatio = ovenTemp / style.baking.temp_c_ideal;
    const tempPenalty = (1 - tempRatio) * 25;
    if (tempPenalty > 0) {
      breakdown.attrezzatura -= tempPenalty;
      penalties.push(
        em("auth.tempVsIdeal", `Temperatura {temp} vs {ideal} (-${tempPenalty.toFixed(1)}%)`, { temp: ovenTemp, ideal: style.baking.temp_c_ideal, penalty: tempPenalty.toFixed(1) }),
      );
    }
  } else {
    if (ovenTemp < style.baking.temp_c_range[0]) {
      const deficit = style.baking.temp_c_range[0] - ovenTemp;
      const penalty = Math.min(20, deficit * 0.2);
      breakdown.attrezzatura -= penalty;
      penalties.push(
        em("auth.tempBelowMin", `Temperatura sotto minimo (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
      );
    }
  }

  // Process axis (25%)
  if (interpretationCenter?.fermentation_hours !== undefined) {
    // Centro = ore canoniche dell'interpretazione, tolleranza ±4h
    const fCenter = interpretationCenter.fermentation_hours;
    const fDeviation = Math.abs(fermentationHours - fCenter);
    if (fDeviation > 4) {
      const penalty = Math.min(15, (fDeviation - 4) * 1.5);
      breakdown.processo -= penalty;
      penalties.push(
        em("auth.fermentOffCenter", `Fermentazione lontana dal canone (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
      );
    }
  } else {
    const [fMin, fMax] = style.dough.fermentation_hours_range;
    if (fermentationHours < fMin) {
      const deficit = fMin - fermentationHours;
      const penalty = Math.min(15, deficit * 2);
      breakdown.processo -= penalty;
      penalties.push(
        em("auth.fermentTooShort", `Fermentazione troppo breve (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
      );
    } else if (fermentationHours > fMax * 1.5) {
      const excess = fermentationHours - fMax;
      const penalty = Math.min(10, excess * 0.5);
      breakdown.processo -= penalty;
      penalties.push(
        em("auth.fermentTooLong", `Fermentazione troppo lunga (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
      );
    }
  }

  // A direct reference is changed by a preferment. Forty process points is a
  // product scoring rule (12 global authenticity points), not a lab measure.
  if (hasPreFerment && (style.method_profile?.direct_only || style.id === "napoletana_stg")) {
    breakdown.processo -= 40;
    penalties.push(em("auth.directMethod", METHOD_MESSAGES_IT["auth.directMethod"]));
  }

  if (style.reference_layout && style.reference_layout.type !== style.layout?.type) {
    breakdown.processo -= 40;
    penalties.push(em("auth.layoutChanged", METHOD_MESSAGES_IT["auth.layoutChanged"]));
  }

  let score = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        breakdown.ingredienti * 0.35 +
          breakdown.processo * 0.30 +
          breakdown.attrezzatura * 0.35,
      ),
    ),
  );

  // Un combustibile identitario sostituito non può restare «rigorosamente
  // autentico», anche quando fornisce il calore necessario. 75 è il confine
  // editoriale di «fedele con adattamenti», non una misura fisica di qualità.
  if ((style.requires_wood_oven && ovenType !== "wood") ||
    (style.baking.oven_type_required === "coal" && ovenType !== "coal")) {
    score = Math.min(score, 75);
    if (style.baking.oven_type_required === "coal") {
      penalties.push(em("auth.notCoalOven", METHOD_MESSAGES_IT["auth.notCoalOven"]));
    }
  }

  // ── Cap di VIABILITÀ TERMICA (Audit role-play giugno 2026, finding "ottimismo") ──
  // Problema: con la media a 3 assi, l'autenticità ha un pavimento strutturale ~65
  // se l'impasto è canonico — anche cuocendo una Napoletana a 250°C (impossibile da
  // leopardare). Ma per gli stili ad altissima temperatura la cottura È l'identità:
  // sotto il minimo dello stile l'aspetto/struttura canonici sono fisicamente
  // irraggiungibili, quindi l'autenticità deve crollare, non fermarsi a 65.
  const viability = thermalViability(style, ovenTemp);
  if (viability < 1) {
    score = Math.round(score * viability);
    penalties.push(
      em(
        "auth.thermalUnviable",
        `Temperatura inferiore al riferimento dello stile ({oven}°C < {min}°C): fedeltà al metodo di cottura ridotta (×{factor})`,
        { oven: ovenTemp, min: style.baking.temp_c_range[0], factor: viability.toFixed(2) },
      ),
    );
  }

  return { score, penalties, breakdown };
}

function calculateFeasibilityScore(
  style: PizzaStyle,
  ovenMaxTemp: number,
  flourW: number,
  hydration: number,
  skillLevel: SkillLevel,
): { score: number; warnings: EngineMsg[] } {
  const warnings: EngineMsg[] = [];

  // Oven factor (40%)
  let ovenScore: number;
  if (ovenMaxTemp >= style.baking.temp_c_ideal) {
    ovenScore = 95;
  } else if (ovenMaxTemp >= style.baking.temp_c_range[0]) {
    const range =
      style.baking.temp_c_ideal - style.baking.temp_c_range[0];
    const position = ovenMaxTemp - style.baking.temp_c_range[0];
    ovenScore = 60 + (position / range) * 35;
    warnings.push(
      em("feas.ovenSuboptimal", METHOD_MESSAGES_IT["feas.ovenSuboptimal"], { temp: ovenMaxTemp, ideal: style.baking.temp_c_ideal }),
    );
  } else {
    const deficit = style.baking.temp_c_range[0] - ovenMaxTemp;
    // ADV-08 fix: extreme deficit (>200°C) should floor at 5, not 20
    // A 150°C oven for napoletana STG (430°C min) is physically impossible, not just "suboptimal"
    const floor = deficit > 200 ? 5 : deficit > 100 ? 10 : 20;
    ovenScore = Math.max(floor, 60 - deficit * 0.5);
    warnings.push(
      em("feas.ovenTooCold", METHOD_MESSAGES_IT["feas.ovenTooCold"], { temp: ovenMaxTemp, min: style.baking.temp_c_range[0] }),
    );
  }

  // Flour factor (30%)
  let flourScore: number;
  const [wMin, wMax] = style.dough.flour_w_range;
  if (flourW < wMin) {
    flourScore = Math.max(10, 70 - (wMin - flourW) * 0.5);
    warnings.push(em("feas.wTooLow", `W troppo basso: ${flourW} < ${wMin}`, { w: flourW, wMin }));
  } else if (flourW > wMax * 1.3) {
    flourScore = Math.max(60, 90 - (flourW - wMax) * 0.2);
    warnings.push(em("feas.wTooHigh", METHOD_MESSAGES_IT["feas.wTooHigh"], { w: flourW }));
  } else {
    flourScore = 95;
  }

  // Skill factor (30%) — Audit Scientifico S3: deve considerare W, metodo, non solo H+skill
  let skillScore = 90;

  // Hydration × skill interaction — soglie più alte per Intermedio/Avanzato
  if (hydration > 75 && skillLevel === 1) {
    skillScore = 30;
    warnings.push(
      em("feas.hydrationBeginnerHigh", METHOD_MESSAGES_IT["feas.hydrationBeginnerHigh"]),
    );
  } else if (hydration > 85 && skillLevel === 2) {
    // Solo idratazioni davvero estreme (>85%) generano warning per Intermedio
    skillScore = 65;
    warnings.push(em("feas.hydrationNeedsPractice", "Idratazione estrema (>85%) richiede pratica"));
  } else if (hydration > 65 && skillLevel === 1) {
    skillScore = 50;
    warnings.push(em("feas.hydrationMedBeginner", METHOD_MESSAGES_IT["feas.hydrationMedBeginner"]));
  }

  // W × hydration interaction — Audit Scientifico S3: W alto aiuta idratazione alta
  if (hydration > 75 && flourW >= 300) {
    skillScore = Math.min(95, skillScore + 10); // farina forte assorbe bene
  } else if (hydration > 70 && flourW < 220) {
    skillScore = Math.max(20, skillScore - 10); // farina debole + alta H = disastro
    warnings.push(em("feas.flourTooWeakForHydration", METHOD_MESSAGES_IT["feas.flourTooWeakForHydration"]));
  }

  // Method bonus — no_knead è più facile
  if (
    style.dough.process_type.includes("no_knead") &&
    skillLevel <= 2
  ) {
    skillScore = Math.min(95, skillScore + 15);
  }

  // Biga/poolish richiede esperienza
  if (
    style.dough.process_type.includes("biga") ||
    style.dough.process_type.includes("poolish")
  ) {
    if (skillLevel === 1) {
      skillScore = Math.max(25, skillScore - 15);
      warnings.push(em("feas.prefermentNeedsExperience", METHOD_MESSAGES_IT["feas.prefermentNeedsExperience"]));
    }
  }

  const score = Math.round(
    ovenScore * 0.4 + flourScore * 0.3 + skillScore * 0.3,
  );
  return { score, warnings };
}

function calculateDigestibilityScore(
  fermentationHours: number,
  fermentationTempC: number,
  hasPreFerment: boolean,
  yeastPct: number,
  yeastType: "fresh" | "dry" | "sourdough" = "fresh",
  /** Impasto senza lievito (Recco): le frasi sulla lievitazione non valgono
   *  (verifica di GPT sul server MCP, 24/10/2026). */
  unleavened = false,
): {
  score: number;
  category: string;
  claims: EngineMsg[];
  fodmap_reduction_pct: number | null;
  effective_hours_18c: number;
  q10_used: number;
  q10_model: "standard" | "cold_adapted" | "sourdough";
} {
  const claims: EngineMsg[] = [];

  // Effective hours at 18°C — Q10 variabile per tipo lievito e temperatura,
  // applicato a tratti in modo continuo (ENG-2).
  const { q10, model: q10Model } = getQ10(yeastType, fermentationTempC);
  const speedRatio = fermentationSpeedRatio(yeastType, fermentationTempC);
  let effectiveHours = fermentationHours * speedRatio;

  if (hasPreFerment) {
    effectiveHours *= 1.2;
  }

  let score: number;
  let category: string;

  if (effectiveHours < 3) {
    score = 20;
    category = "Pessima";
    claims.push(em("dig.fermentTooShort", METHOD_MESSAGES_IT["dig.fermentTooShort"]));
  } else if (effectiveHours < 8) {
    score = 20 + ((effectiveHours - 3) / 5) * 30;
    category = "Bassa";
    claims.push(em("dig.fermentShort", METHOD_MESSAGES_IT["dig.fermentShort"]));
  } else if (effectiveHours < 18) {
    score = 50 + ((effectiveHours - 8) / 10) * 20;
    category = "Media";
  } else if (effectiveHours < 30) {
    score = 70 + ((effectiveHours - 18) / 12) * 15;
    category = "Alta";
  } else {
    score = Math.min(
      95,
      85 + ((effectiveHours - 30) / 20) * 10,
    );
    category = "Eccellente";
    claims.push(em("dig.extremeMaturation", METHOD_MESSAGES_IT["dig.extremeMaturation"]));
  }

  if (yeastPct > 1.5) {
    const penalty = Math.min(20, (yeastPct - 1.5) * 10);
    score -= penalty;
    claims.push(em("dig.highYeastDosage", METHOD_MESSAGES_IT["dig.highYeastDosage"], { pct: yeastPct, penalty: Math.round(penalty) }));
  }

  if (fermentationTempC <= 4) {
    score = Math.min(100, score + 5);
    claims.push(em("dig.coldFermentation", METHOD_MESSAGES_IT["dig.coldFermentation"]));
  }

  // Senza lievito non c'è lievitazione: niente frasi su fermentazione,
  // amidi o FODMAP (il punteggio resta il segnale del tempo di riposo).
  if (unleavened) claims.length = 0;

  return {
    score: Math.round(Math.max(0, score)),
    category,
    claims,
    // Non è misurabile dalle sole ore/temperature: nessuna percentuale sanitaria.
    fodmap_reduction_pct: null,
    effective_hours_18c: Math.round(effectiveHours * 10) / 10,
    q10_used: q10,
    q10_model: q10Model,
  };
}

/**
 * E-Score (Experimentation) — Notion Pag.08 TODO: basato su deviation_signature.
 * 
 * 5 componenti pesate:
 *   1. Intrinsic style deviation (25%) — from STYLE_DEVIATIONS[style.id]
 *   2. Hydration deviation from canonical center (25%)
 *   3. Fermentation deviation from canonical center (15%)
 *   4. Process deviations: pre-ferment, oven swap (20%)
 *   5. Compensation count & severity (15%) — NEW: oven compensations = forced deviations
 */
function calculateExperimentationScore(
  style: PizzaStyle,
  hydration: number,
  fermentationHours: number,
  hasPreFerment: boolean,
  ovenType: OvenType,
  compensationCount?: number,
): { score: number; category: string } {
  let score = 0;

  // 1. Intrinsic style deviation (0-25 pts)
  const styleDeviationScore = _getStyleDeviationScore(style.id);
  score += styleDeviationScore * 25;

  // 2. Hydration deviation from canonical center (0-25 pts)
  const hCenter =
    (style.dough.hydration_pct_range[0] +
      style.dough.hydration_pct_range[1]) /
    2;
  const hDeviation = Math.abs(hydration - hCenter) / hCenter;
  score += Math.min(25, hDeviation * 30);

  // 3. Fermentation deviation (0-15 pts)
  const fCenter =
    (style.dough.fermentation_hours_range[0] +
      style.dough.fermentation_hours_range[1]) /
    2;
  const fDeviation =
    Math.abs(fermentationHours - fCenter) / Math.max(1, fCenter);
  score += Math.min(15, fDeviation * 20);

  // 4. Process deviations (0-20 pts)
  if (hasPreFerment && !style.requires_pre_ferment) score += 12;
  if ((style.requires_wood_oven && ovenType !== "wood") ||
    (style.baking.oven_type_required === "coal" && ovenType !== "coal")) score += 8;

  // 5. Compensation severity — NEW (Notion Pag.04/08)
  // Each oven compensation is a forced deviation from the canonical process
  const nComp = compensationCount ?? 0;
  score += Math.min(15, nComp * 4); // 0-15 pts, ~4 pts per compensation

  score = Math.min(100, Math.round(score));

  // Categories align with DeviationCategory taxonomy (Notion Pag.05)
  let category: string;
  if (score <= 20) category = "Tradizionale";
  else if (score <= 40) category = "Variazione parametrica";
  else if (score <= 65) category = "Variante tecnica";
  else if (score <= 85) category = "Ibridazione";
  else category = "Sperimentale";

  return { score, category };
}

function _getStyleDeviationScore(styleId: string): number {
  return STYLE_DEVIATIONS[styleId]?.deviation_score ?? 0;
}

function _getStyleDeviationCategory(styleId: string): string {
  return STYLE_DEVIATIONS[styleId]?.category ?? "unclassified";
}

/**
 * Calculate effective deviation score (Notion Pag.04 TODO):
 * Combines intrinsic style deviation with user parameter deviations
 * and oven compensations to produce a 0-1 effective score.
 */
function _calculateEffectiveDeviation(
  intrinsicScore: number,
  compensations: CompensationApplied[],
  hydration: number,
  hydrationRange: [number, number],
  fermentationHours: number,
  fermentationRange: [number, number],
): { score: number; compensationPoints: string[] } {
  const compensationPoints: string[] = [];

  // Each compensation type maps to a deviation point
  const compMap: Record<string, string> = {
    hydration: "dough_composition",
    oil: "dough_composition",
    sugar: "dough_composition",
    cook_time: "baking_medium",
    thickness: "dough_structure",
  };
  for (const c of compensations) {
    const dp = compMap[c.type];
    if (dp && !compensationPoints.includes(dp)) {
      compensationPoints.push(dp);
    }
  }

  // Parameter deviation from canonical center (0-1 each)
  const hCenter = (hydrationRange[0] + hydrationRange[1]) / 2;
  const hSpan = (hydrationRange[1] - hydrationRange[0]) / 2 || 1;
  const hDev = Math.min(1, Math.abs(hydration - hCenter) / (hSpan * 2));

  const fCenter = (fermentationRange[0] + fermentationRange[1]) / 2;
  const fSpan = (fermentationRange[1] - fermentationRange[0]) / 2 || 1;
  const fDev = Math.min(1, Math.abs(fermentationHours - fCenter) / (fSpan * 2));

  // Compensation severity: each compensation adds 0.05-0.1
  const compSeverity = Math.min(0.3, compensations.length * 0.07);

  // Weighted combination
  const effective = Math.min(
    1,
    intrinsicScore * 0.4 + hDev * 0.2 + fDev * 0.15 + compSeverity * 0.25,
  );

  return {
    score: Math.round(effective * 100) / 100,
    compensationPoints,
  };
}

function classifyScore(
  type: "A" | "F" | "D",
  score: number,
): string {
  if (type === "A") {
    if (score >= 90) return "Rigorosamente autentica";
    if (score >= 75) return "Fedele con adattamenti";
    if (score >= 60) return "Ispirata ma modificata";
    return "Liberamente interpretata";
  }
  if (type === "F") {
    if (score >= 85) return "Altamente fattibile";
    if (score >= 70) return "Fattibile con attenzione";
    if (score >= 50) return "Difficile";
    return "Alto rischio";
  }
  // D
  if (score >= 85) return "Eccellente";
  if (score >= 70) return "Alta";
  if (score >= 50) return "Media";
  return "Bassa";
}

// ═══ YEAST CALCULATION (Rule of 55) ═══

/* Pantry flour W ranges — used for pantry-aware recommendation + auto W selection */
export const FLOUR_W_RANGES: Record<string, [number, number]> =
  {
    "00": [170, 220],
    "0": [220, 260],
    manitoba: [340, 380],
    integrale: [200, 260],
    semola: [220, 280],
    // C-3: la dispensa offre la Tipo 1 (W220–280) ma qui mancava: chi la
    // sceglieva veniva ignorato in silenzio.
    tipo_1: [220, 280],
    // Farine di marca: chiavi = id di flour-database.ts. C-4: W dalle schede
    // del produttore (Mulino Caputo 2024–2025, Molino Quaglia s.d.; fonti in
    // docs/fonti-dati.md §2.2). Petra 3 è tolta: il produttore non dichiara W.
    // Le ultime tre sono ancora da verificare.
    caputo_pizzeria: [260, 280],
    caputo_nuvola: [270, 290],
    caputo_cuoco: [300, 320],
    petra_5037: [300, 340],
    "5stagioni_rossa": [260, 300],
    "5stagioni_5lune": [330, 370],
    dallagiovanna_manitoba_oro: [360, 400],
  };

/** Explicit per-product data overrides catalog values for this kitchen only. */
export function pantryFlourRange(constraints: Pick<UserConstraints, "pantry_flour_details">, id: string): [number, number] | undefined {
  const w = constraints.pantry_flour_details?.[id]?.w;
  if (typeof w === "number" && Number.isFinite(w) && w > 0 && w <= 1000) return [w, w];
  const known = FLOUR_W_RANGES[id];
  if (known) return known;
  const product = FLOURS_DB.find(flour => flour.id === id);
  return product?.w_declared !== false && product?.w ? [product.w, product.w] : undefined;
}

function pantryFlourIsDeclared(constraints: UserConstraints, id: string): boolean {
  if (constraints.pantry_flour_details?.[id]?.w && pantryFlourRange(constraints, id)) return true;
  return !["00", "0", "tipo_1", "integrale", "semola", "manitoba"].includes(id) && Boolean(pantryFlourRange(constraints, id));
}

/* ═══ C-3 — mix di due farine della dispensa ═══
 * Quando nessuna farina da sola cade nel range W dello stile, ma una sta sotto
 * e una sopra, mescolarle ci arriva. La W di un mix si stima come media pesata
 * sulle quote: è un'approssimazione (l'alveogramma non è lineare), per questo
 * il messaggio dice «circa». Quote arrotondate al 5%, tra 10% e 90%. */
export interface PantryFlourMix {
  weak: string;
  strong: string;
  weakPct: number;
  strongPct: number;
  /** W stimata del mix. */
  w: number;
}

export function pantryFlourMix(
  pantryFlours: readonly string[],
  [wMin, wMax]: readonly [number, number],
  exactTarget = false,
  details?: UserConstraints["pantry_flour_details"],
): PantryFlourMix | null {
  const target = (wMin + wMax) / 2;
  const flours = pantryFlours
    .flatMap(id => { const range = pantryFlourRange({ pantry_flour_details: details }, id); return range ? [{ id, w: (range[0] + range[1]) / 2 }] : []; });
  let best: PantryFlourMix | null = null;
  let bestSpread = Infinity;
  for (const weak of flours) {
    for (const strong of flours) {
      if (!(weak.w < target && strong.w > target)) continue;
      const spread = strong.w - weak.w;
      const strongPct = exactTarget ? ((target - weak.w) / spread) * 100 : Math.round(((target - weak.w) / spread) * 20) * 5;
      if (strongPct < 10 || strongPct > 90) continue;
      const w = exactTarget ? target : Math.round(weak.w + (strongPct / 100) * spread);
      if (w < wMin || w > wMax) continue;
      // A parità, la coppia più vicina: il mix si comporta meglio.
      if (spread < bestSpread) {
        bestSpread = spread;
        best = { weak: weak.id, strong: strong.id, weakPct: 100 - strongPct, strongPct, w };
      }
    }
  }
  return best;
}

/** Ore di maturazione del pre-fermento dalle fonti
 *  (docs/ricerca/prefermenti-fonti-2026-10-24.md): biga circa 16 h a
 *  18–20 °C, poolish 12–16 h a 20–22 °C (qui il centro, 14 h). Prima era il
 *  40 % delle ore totali, uguale per i due (verifica di GPT, 24/10/2026). */
export const PRE_FERMENT_TARGET_HOURS = { biga: 16, poolish: 14 } as const;

/** Ore lasciate all'impasto finale (puntata e appretto) prima di allungare il
 *  pre-fermento verso le ore delle fonti. Parametro del modello, non una
 *  fonte: sotto questa soglia vale la quota di prima (40 %). */
const FINAL_DOUGH_MIN_HOURS = 8;

/** Fasi della fermentazione in ore: pre-fermento, puntata, appretto. Senza
 *  pre-fermento puntata 60 % e appretto 40 %. Con il pre-fermento: quota del
 *  40 % nelle finestre brevi, aumentata se all'impasto finale restano
 *  FINAL_DOUGH_MIN_HOURS, senza superare il target; il resto si divide fra
 *  puntata e appretto 2:1 (come prima, 0,4/0,2). */
export function fermentationPhases(
  fermentationHours: number,
  hasPreFerment: boolean,
  preFermentType: PreFermentType = "poolish",
  profile?: MethodProcessProfile,
): { preferment: number; bulk: number; proof: number } {
  if (!hasPreFerment) {
    const proof = Math.min(fermentationHours, profile?.proof_hours ?? fermentationHours * 0.4);
    return { preferment: 0, bulk: fermentationHours - proof, proof };
  }
  const target = PRE_FERMENT_TARGET_HOURS[preFermentType];
  const preferment = Math.min(target, Math.max(fermentationHours * 0.4, fermentationHours - FINAL_DOUGH_MIN_HOURS));
  // Il target è un tetto: con finestre lunghe si allunga l'impasto finale,
  // non la biga a 18–20 °C. Con meno tempo il pre-fermento si accorcia.
  const rest = fermentationHours - preferment;
  const proof = Math.min(rest, profile?.proof_hours ?? rest / 3);
  return { preferment, bulk: rest - proof, proof };
}

/** Temperatura dell'appretto: sotto i 18 °C (frigo, cantina) l'appretto si fa
 *  comunque a temperatura ambiente, come dice il passo della timeline. */
export const PROOF_MIN_TEMP_C = 18;

/** Audit totale n. 5 (24/10/2026): ore equivalenti alla temperatura di
 *  fermentazione. Con il frigo la timeline fa l'appretto a 18 °C, che è più
 *  veloce: prima la dose di lievito trattava tutte le ore come se fossero a
 *  4 °C (Detroit 36 h: +70 % rispetto al modello). Sopra i 18 °C non cambia
 *  nulla: appretto e puntata sono alla stessa temperatura. */
export function equivalentFermentationHours(
  fermentationHours: number,
  fermentationTempC: number,
  yeastType: "fresh" | "dry" | "sourdough",
  hasPreFerment: boolean,
  preFermentType: PreFermentType = "poolish",
  profile?: MethodProcessProfile,
): number {
  if (fermentationTempC >= PROOF_MIN_TEMP_C || fermentationHours <= 0) return fermentationHours;
  const p = fermentationPhases(fermentationHours, hasPreFerment, preFermentType, profile).proof / fermentationHours;
  const slow = fermentationSpeedRatio(yeastType, fermentationTempC);
  const proof = fermentationSpeedRatio(yeastType, PROOF_MIN_TEMP_C);
  return fermentationHours * (1 - p) + (fermentationHours * p * proof) / slow;
}

function calculateYeastPercentage(
  fermentationHours: number,
  fermentationTempC: number,
  yeastType: "fresh" | "dry",
): number {
  // Guard: zero/negative fermentation → no yeast needed (sfoglia diretta, es. Focaccia di Recco)
  if (fermentationHours <= 0) return 0;
  // ENG-3 (decisione di Matteo, 22/10/2026): tolta la rampa lineare sotto le 2h
  // (ADV-02, 0,2% per ora). Era nata per la Focaccia di Recco, che oggi è
  // `unleavened` e non arriva qui (lievito 0 in generateRecipe). Sugli impasti
  // lievitati la rampa faceva CRESCERE il lievito con le ore (1h → 0,2%,
  // 2h → 0,4%), l'opposto del resto del modello. Ora vale il modello cinetico
  // anche sotto le 2h, con il tetto al 3% sotto.
  // Arrhenius-based model con Q10 variabile — Audit Database V2
  // Audit motore 2026-05: ricalibrato dopo verifica empirica vs disciplinari.
  //   - referenceRate 0.25→0.10: il vecchio 0.25 sovrastimava di 2-3x rispetto
  //     a Caputo/AVPN/Pizzarium/Shawn Randazzo (Detroit). Ora ancorato a Caputo
  //     standard (0.1% fresh yeast a 18°C per 24h).
  //   - timeFactor lineare (24/h) → sub-lineare (24/h)^0.7: il lievito si
  //     RIPRODUCE durante la fermentazione, non si consuma. Curva log-like.
  //     Verificato su Napoletana 8h, 12h, 24h, Bonci 48h, Detroit 24h.
  const referenceRate = YEAST_REFERENCE_PCT; // % fresh yeast a 18°C per 24h (Caputo standard)
  // ENG-2: fattore di velocità a tratti continuo (a 4°C ~+20% di lievito
  // rispetto al vecchio esponente con Q10 1,6 da 18°C).
  const tempFactor = fermentationSpeedRatio(yeastType, fermentationTempC);
  const timeFactor = Math.pow(YEAST_REFERENCE_HOURS / fermentationHours, YEAST_TIME_EXPONENT);

  let pct = (referenceRate * timeFactor) / tempFactor;
  if (yeastType === "dry") pct *= YEAST_DRY_RATIO; // dry = 1/3 of fresh

  return Math.max(0.01, Math.min(3.0, pct));
}

// ═══ RECIPE GENERATOR ═══

/* ═══ PAN/SHAPE HELPERS ═══ */

/** Calculate default area for a style shape (cm²) */
function getDefaultShapeArea(shape: ShapeParameters): number {
  if (shape.shape_type === "rectangular" || shape.shape_type === "oval") {
    const l = shape.length_cm ?? 30;
    const w = shape.width_cm ?? 20;
    return shape.shape_type === "oval" ? Math.PI * (l / 2) * (w / 2) : l * w;
  }
  const d = shape.diameter_cm ?? 30;
  return Math.PI * (d / 2) * (d / 2);
}

/** Audit n. 11 (B-15): lo spessore reale, peso del panetto sull'area della
 *  forma (g/cm²). `shape.thickness_factor` è solo un indice relativo che il
 *  motore usa come rapporto: mostrarlo come g/cm² dava 0,35 dove il peso
 *  diviso l'area fa 0,51. */
export function doughThicknessGPerCm2(style: PizzaStyle, weightG = style.shape.dough_weight_g): number {
  const area = getDefaultShapeArea(style.shape);
  return area > 0 ? Math.round((weightG / area) * 100) / 100 : 0;
}

function panArea(style: PizzaStyle, panConfig?: PanConfig): number {
  const defaultArea = getDefaultShapeArea(style.shape);
  if (!panConfig) return defaultArea;
  const shape = panConfig.panShape ?? defaultPanShape(style);
  let customArea: number;

  if (shape === "rectangular") {
    const l = panConfig.panLength ?? style.shape.length_cm ?? 30;
    const w = panConfig.panWidth ?? style.shape.width_cm ?? 20;
    customArea = l * w;
  } else if (style.shape.shape_type === "oval" && panConfig.panDiameter == null) {
    /* Audit n. 11 (B-15): le forme ovali (pala, pinsa) non hanno un diametro;
     * senza una teglia tonda scelta valeva il tondo da 30 cm di ripiego e la
     * Pala passava da 320 a 360 g. Resta la forma dello stile. */
    customArea = defaultArea;
  } else {
    const d = panConfig.panDiameter ?? style.shape.diameter_cm ?? 30;
    customArea = Math.PI * (d / 2) * (d / 2);
  }

  return customArea;
}

/** Recalculate dough weight from custom pan dimensions + thickness */
function calcDoughWeight(
  style: PizzaStyle,
  panConfig?: PanConfig,
): number {
  if (!panConfig) return style.shape.dough_weight_g;

  const defaultArea = getDefaultShapeArea(style.shape);
  const customArea = panArea(style, panConfig);

  const areaRatio = customArea / defaultArea;
  const thicknessRatio = (panConfig.thickness ?? style.shape.thickness_factor) / style.shape.thickness_factor;
  return Math.round(style.shape.dough_weight_g * areaRatio * thicknessRatio);
}

/** Styles that support thickness customization */
export function supportsThickness(style: PizzaStyle): boolean {
  return ["teglia_romana", "detroit", "focaccia_genovese",
    "sfincione", "grandma_style", "padellino_torino", "chicago_deep"].includes(style.id);
}

/** Styles that use a baking pan/vessel (rectangular or round) */
export function needsPan(style: PizzaStyle): boolean {
  return [
    "teglia_romana", "detroit", "focaccia_genovese",
    "sfincione", "grandma_style", "chicago_deep", "padellino_torino",
  ].includes(style.id);
}

export type PanShape = "rectangular" | "round";

/** Default pan shape for a style */
export function defaultPanShape(style: PizzaStyle): PanShape {
  return style.shape.shape_type === "rectangular" ? "rectangular" : "round";
}

export interface PanConfig {
  panShape?: PanShape;      // forma teglia scelta dall'utente
  panLength?: number;       // cm — per rettangolare
  panWidth?: number;        // cm — per rettangolare
  panDiameter?: number;     // cm — per tonda
  thickness?: number;       // custom thickness_factor
  /** D-043 — peso del panetto scelto dall'utente (g): vince su teglia e
   *  spessore e non subisce le compensazioni del forno. */
  ballWeightG?: number;
}

export interface ScoreWeightsOverride {
  authenticity?: number;
  feasibility?: number;
  digestibility?: number;
  sustainability?: number;
  experimentation?: number;
}

interface RecWeightsOverride {
  time?: number;
  oven?: number;
  skill?: number;
  equipment?: number;
  pantry?: number;
}

/** Override opzionali dei range di stile, applicati da una versione attiva.
 * Quando passati a generateRecipe, sostituiscono i range corrispondenti dello
 * stile per tutta la durata del calcolo (scoring inclusi). */
export interface VersionRangeOverrides {
  hydration_pct_range?: [number, number];
  flour_w_range?: [number, number];
  flour_pl_range?: [number, number];
  fermentation_hours_range?: [number, number];
  /** Override del peso totale impasto a parità di teglia/area.
   * Usato per versioni con coefficiente diverso (es. Sottile 0.5 vs Bonci 0.75 g/cm²). */
  dough_weight_g?: number;
}

/** Opzioni di generateRecipe. Audit role-play giugno 2026: rifattorizzate da 12
 *  parametri posizionali a un options object — l'ordine di 6 `custom*` scalari
 *  in fila era un footgun (il compilatore non becca uno swap). */
export interface GenerateRecipeOptions {
  customHydration?: number;
  customFlourW?: number;
  customFermentationHours?: number;
  customFermentationTempC?: number;
  usePreFerment?: boolean;
  customFlourPL?: number;
  /** F3 — sale come leva utente (% sulla farina). Se omesso usa style.dough.salt_pct.
   *  Usato dal loop di feedback ("troppo salata" → −0.2%) e dallo slider config. */
  customSalt?: number;
  panConfig?: PanConfig;
  scoreWeights?: ScoreWeightsOverride;
  versionRanges?: VersionRangeOverrides;
  /** Sprint 11 Fase 3 — id impasto attivo (da version.impasto_ref). Se omesso,
   * usa style.default_impasto_ref. Se entrambi assenti, no-op (retrocompat). */
  activeImpastoRef?: string;
  /** Audit motore 2026-05 — centro auth score quando un'interpretazione (Maestro/
   * Disciplinare/Community) è attiva. */
  interpretationCenter?: AuthenticityCenter;
  /** VPL-B2 — mix di farine modificato dall'utente (quote/W per componente). */
  customFlourBlend?: { name: string; pct: number; w?: number }[];
  /** ENG-6 — applica la compensazione d'idratazione del forno ANCHE sopra
   *  customHydration (usato dall'ottimizzatore sui suoi candidati). Senza
   *  questo flag un valore custom è la scelta finale dell'utente. */
  compensateCustomHydration?: boolean;
  /** D-043 — biga o poolish scelti dall'utente e quota di farina nel
   *  pre-fermento (% sulla farina totale). Assenti: quelli dello stile. */
  preFerment?: PreFermentChoice;
}

export type PreFermentType = "biga" | "poolish";

export interface PreFermentChoice {
  type?: PreFermentType;
  /** Farina nel pre-fermento, % della farina totale (20–50, fonti in
   *  docs/ricerca/prefermenti-fonti-2026-10-24.md). */
  flourPct?: number;
}

/** Quota di farina nel pre-fermento: default e limiti dalle fonti (biga in
 *  genere 20–50 %, poolish 30–50 %; qui 20–50 per entrambi). */
export const PRE_FERMENT_FLOUR_PCT = { biga: 40, poolish: 30, min: 20, max: 50 } as const;

/** Tipo di pre-fermento della ricetta: il primo dichiarato dallo stile
 *  («direct|biga|poolish» → biga); poolish per gli stili diretti. Una sola
 *  regola per ricetta, ingredienti e procedimento (audit totale n. 3: prima il
 *  passo diceva «poolish» quando gli ingredienti scorporavano una biga). */
export function preFermentKind(style: PizzaStyle): "biga" | "poolish" {
  const kind = style.dough.process_type.split("|").find((m) => m === "biga" || m === "poolish");
  return kind === "biga" ? "biga" : "poolish";
}

export function generateRecipe(
  style: PizzaStyle,
  constraints: UserConstraints,
  options: GenerateRecipeOptions = {},
): GeneratedRecipe {
  constraints = { ...constrainOvenToCapacity(constraints), available_hours: floorToQuarterHour(constraints.available_hours) };
  const {
    customHydration,
    customFlourW,
    customFermentationHours,
    customFermentationTempC,
    usePreFerment,
    customFlourPL,
    customSalt,
    panConfig,
    scoreWeights,
    versionRanges,
    activeImpastoRef,
    interpretationCenter,
    customFlourBlend,
    compensateCustomHydration,
    preFerment,
  } = options;
  const doughBalls = constraints.dough_balls;

  // Sprint 11 Fase 3 — Risolvi impasto effettivo e applica dough_overrides.
  // Priorità: activeImpastoRef (esplicito da versione) > style.default_impasto_ref.
  // I dough_overrides dell'impasto sovrascrivono i campi corrispondenti del dough
  // base; gli altri campi restano identici allo stile.
  const effectiveImpastoId = activeImpastoRef ?? style.default_impasto_ref;
  const impasto: ImpastoRecipe | undefined = effectiveImpastoId
    ? getImpasto(effectiveImpastoId)
    : undefined;
  if (impasto) {
    style = {
      ...style,
      dough: mergeImpastoIntoDough(style.dough, impasto),
      requires_pre_ferment:
        impasto.requires_pre_ferment ?? style.requires_pre_ferment,
    };
  }

  // Apply version range overrides on top of the impasto-merged style.
  // Tutti i campi non-range restano identici allo stile originario.
  if (versionRanges) {
    style = {
      ...style,
      dough: {
        ...style.dough,
        hydration_pct_range:
          versionRanges.hydration_pct_range ?? style.dough.hydration_pct_range,
        flour_w_range:
          versionRanges.flour_w_range ?? style.dough.flour_w_range,
        flour_pl_range:
          versionRanges.flour_pl_range ?? style.dough.flour_pl_range,
        fermentation_hours_range:
          versionRanges.fermentation_hours_range ?? style.dough.fermentation_hours_range,
      },
      shape: versionRanges.dough_weight_g
        ? { ...style.shape, dough_weight_g: versionRanges.dough_weight_g }
        : style.shape,
    };
  }

  // Defensive: normalize inverted ranges (Style Editor may temporarily produce them)
  const safeRange = (r: [number, number]): [number, number] =>
    r[0] <= r[1] ? r : [r[1], r[0]];
  const hRange = safeRange(style.dough.hydration_pct_range);
  const wRange = safeRange(style.dough.flour_w_range);
  const plRange = safeRange(style.dough.flour_pl_range);
  const fermRange = safeRange(style.dough.fermentation_hours_range);

  // Determine optimal parameters
  const baseHydration =
    customHydration ?? (hRange[0] + hRange[1]) / 2;

  // VPL-B2: mix di farine. La forza efficace dell'impasto è la media delle W
  // delle farine di frumento pesata sulle quote (le farine senza glutine non
  // contribuiscono alla maglia glutinica). Per i blend questa sostituisce la W
  // singola dello slider; altrimenti vale customFlourW / midpoint.
  const flourBlend = customFlourBlend ?? style.dough.flour_blend;
  let flourW = customFlourW ?? (wRange[0] + wRange[1]) / 2;
  // VPL-B2 — forza glutinica EFFICACE del mix: la W del frumento diluita dalla
  // frazione senza glutine (gluten ∝ proteina del frumento ∝ quota di frumento).
  // È fisica di primo ordine, INFORMATIVA: la mostriamo ma NON la diamo in pasto
  // alle euristiche calibrate sul frumento puro (identità/scoring/P/L usano la W
  // del frumento, perché le farine senza glutine cambiano la reologia, non solo
  // diluiscono la forza). Per i blend a solo frumento coincide con flourW.
  let effectiveGlutenW: number | undefined;
  if (flourBlend && flourBlend.length > 0) {
    const totalPct = flourBlend.reduce((s, c) => s + c.pct, 0) || 100;
    const wheat = flourBlend.filter((c) => c.w != null && c.pct > 0);
    const wheatPct = wheat.reduce((s, c) => s + c.pct, 0);
    if (wheatPct > 0) {
      flourW = Math.round(
        wheat.reduce((s, c) => s + (c.w as number) * c.pct, 0) / wheatPct,
      );
      effectiveGlutenW = Math.round((flourW * wheatPct) / totalPct);
    }
  }

  // P/L estimation from W — Audit Maestro P0-1 (VPL-012: accept custom P/L)
  const flourPL = customFlourPL ?? estimatePL(flourW, plRange);

  const hasPreFerment = !style.dough.unleavened &&
    (usePreFerment ?? style.requires_pre_ferment);
  const preFermentType: PreFermentType = preFerment?.type ?? preFermentKind(style);
  const preFermentFlourPct = Math.min(
    PRE_FERMENT_FLOUR_PCT.max,
    Math.max(PRE_FERMENT_FLOUR_PCT.min, preFerment?.flourPct ?? PRE_FERMENT_FLOUR_PCT[preFermentType]),
  );

  // Oven temperature
  let ovenTemp = Math.min(
    constraints.oven_max_temp_c,
    style.baking.temp_c_ideal,
  );
  if (ovenTemp < style.baking.temp_c_range[0]) {
    ovenTemp = constraints.oven_max_temp_c;
  }
  // La temperatura dell'olio non è limitata dalla temperatura del forno.
  if (isFriedStyle(style)) ovenTemp = style.baking.temp_c_ideal;
  const homeMethod = homeBakingAdaptation(style, constraints.oven_type, ovenTemp);

  // ── Full Compensation Engine — Audit Maestro P0-4 ──
  const ovenCompensations = calculateOvenCompensations(style, ovenTemp);
  const cookTime = ovenCompensations.cook_time_sec;

  // Timeline — risolve il topping con il resolver Sprint 12 Fase 2.
  // Se default_topping_ref è un concept_id (es. "margherita"), il resolver sceglie
  // la variante più adatta allo Style (es. margherita_napoletana_avpn per STG,
  // margherita_romana per Tonda Romana, margherita_americana per NY).
  // Se è una recipe_id specifica (es. "patate_porchetta"), usa quella direttamente.
  const defaultTopping = style.default_topping_ref
    ? getToppingForStyle(style.default_topping_ref, style)
    : undefined;
  if (defaultTopping?.layout_override || style.reference_layout) {
    style = { ...style, reference_layout: style.reference_layout ?? style.layout,
      layout: defaultTopping?.layout_override ?? style.reference_layout };
  }
  const toppingArea = panArea(style, panConfig);
  const referenceArea = getDefaultShapeArea(style.shape);
  const toppingScale = (style.topping_scale ?? 1) * toppingArea / referenceArea;
  const equipment: EquipmentContext = {
    mixerType: constraints.mixer_type,
    hasMixer: constraints.has_mixer,
    ovenType: constraints.oven_type,
    surfaces: constraints.surfaces,
    ovenHeatProfile: constraints.oven_heat_profile,
  };
  const buildTimeline = (
    hours: number,
    tempC: number,
    yeast: "fresh" | "dry" | "sourdough",
  ) =>
    generateTimeline(
      style,
      hours,
      tempC,
      hasPreFerment,
      cookTime,
      ovenTemp,
      defaultTopping,
      equipment,
      yeast,
      preFermentType,
      constraints.dough_balls,
    );

  let fermentationHours =
    customFermentationHours ?? (fermRange[0] + fermRange[1]) / 2;

  // Clamp fermentation a available_hours SOLO se l'utente non ha esplicitato un valore custom.
  // Rispettiamo la scelta dell'utente (es. scelta versione "Tradizionale 48h" non va clampata a 24h).
  // Audit role-play giugno 2026 (finding F8): se il clamp porta SOTTO la finestra
  // minima dello stile, non è una scelta dell'utente ma un vincolo di tempo →
  // lo segnaliamo onestamente invece di limitarci a penalizzare l'autenticità.
  // ENG-4 (decisione di Matteo, 22/10/2026): con un orario del pasto la finestra
  // è fino al pasto, quindi si toglie l'overhead fisso (impasto, staglio,
  // stesura, farcitura, cottura): prima la fermentazione prendeva TUTTE le ore
  // e la timeline sforava. Senza orario (meal_deadline assente) le ore limitano
  // solo la fermentazione, come prima: «Nessuna preferenza» resta 24 h.
  let timeClampedBelowMin = false;
  if (customFermentationHours === undefined && constraints.available_hours > 0) {
    const windowHours = constraints.meal_deadline
      ? fermentationWindowHours(
          constraints.available_hours,
          timelineOverheadMinutes(
            buildTimeline(fermentationHours, defaultFermentTempC(style, fermentationHours), "fresh"),
          ),
        )
      : constraints.available_hours;
    const clamped = Math.max(
      minimumFermentationHours(fermRange),
      Math.min(fermentationHours, windowHours),
    );
    if (clamped < fermRange[0]) timeClampedBelowMin = true;
    fermentationHours = clamped;
  }

  const fermentationTempC =
    customFermentationTempC ??
    defaultFermentTempC(style, fermentationHours);

  // F3 — sale effettivo: leva utente (customSalt) con fallback allo stile. Clampato
  // a un range sensato (1.5–3.5%) per non uscire dal ragionevole.
  const effectiveSaltPct =
    customSalt != null
      ? Math.max(1.5, Math.min(3.5, customSalt))
      : style.dough.salt_pct;

  // ENG-6 (decisione di Matteo, 22/10/2026): la compensazione di idratazione si
  // applica senza valore custom, oppure sopra un valore custom quando lo chiede
  // l'ottimizzatore (compensateCustomHydration). Può portare fuori dal range
  // dello stile: in quel caso è dichiarata in science.compensations, che ora
  // elenca solo le compensazioni davvero applicate.
  const applyHydrationCompensation =
    customHydration == null || compensateCustomHydration === true;
  const hydrationDeltaApplied = applyHydrationCompensation
    ? ovenCompensations.hydration_delta_pct
    : 0;
  const hydration =
    hydrationDeltaApplied > 0
      ? Math.round((baseHydration + hydrationDeltaApplied) * 10) / 10
      : customHydration != null
        ? baseHydration
        : Math.round(baseHydration * 10) / 10;
  const appliedCompensations: CompensationApplied[] = ovenCompensations.compensations
    .filter((c) => c.type !== "hydration" || hydrationDeltaApplied > 0)
    .map((c) =>
      c.type === "hydration"
        ? { ...c, original: baseHydration, compensated: hydration }
        : c,
    );

  // Effective oil/sugar with compensations
  // VPL-B2: il grasso/zucchero BASE dello stile è un ingrediente sempre presente
  // (es. EVO nell'impasto della Focaccia di Recco); allows_additives governa solo
  // se la compensazione forno può AGGIUNGERne, non azzera la dose di ricetta.
  const effectiveOilPct =
    style.dough.oil_pct +
    (style.allows_additives ? ovenCompensations.oil_delta_pct : 0);
  const effectiveSugarPct =
    style.dough.sugar_pct +
    (style.allows_additives ? ovenCompensations.sugar_delta_pct : 0);

  // ── Auto yeast selection based on pantry ──
  let yeastType: "fresh" | "dry" | "sourdough";
  const py = constraints.pantry_yeasts;
  if (py.length === 0) {
    yeastType = (["fresh", "dry", "sourdough"] as const).find(id => !(constraints.excluded_yeasts ?? []).includes(id)) ?? "fresh";
  } else if (
    py.includes("sourdough") &&
    fermentationHours >= 12 &&
    // ADV-11 fix: sourdough is great for ANY long fermentation (≥24h) or pre-ferment styles
    // Previously excluded no-knead long-ferment styles like teglia_romana, bonci, focaccia_genovese
    (hasPreFerment || style.requires_pre_ferment || fermentationHours >= 24)
  ) {
    yeastType = "sourdough";
  } else if (py.includes("fresh")) {
    yeastType = "fresh";
  } else if (py.includes("dry")) {
    yeastType = "dry";
  } else {
    // Only sourdough in pantry but short ferment — still use it
    yeastType = "sourdough";
  }

  // Yeast calculation (sourdough uses a different model)
  let yeastPct: number;
  if (style.dough.unleavened) {
    // VPL-B2: impasto non lievitato (Focaccia di Recco) → nessun lievito
    yeastPct = 0;
  } else if (yeastType === "sourdough") {
    // Sourdough: ~15-20% of flour weight as starter, expressed as baker's %
    // Less starter for longer fermentations
    yeastPct =
      fermentationHours >= 48
        ? 15
        : fermentationHours >= 24
          ? 18
          : 20;
  } else {
    // M-11: la correzione personale («la mia cucina lievita più veloce»)
    // divide la dose: più veloce → meno lievito per le stesse ore.
    yeastPct = Math.max(
      0.01,
      calculateYeastPercentage(
        equivalentFermentationHours(fermentationHours, fermentationTempC, yeastType as "fresh" | "dry", hasPreFerment, preFermentType, style.method_profile),
        fermentationTempC,
        yeastType as "fresh" | "dry",
      ) /
        clampYeastSpeedFactor(constraints.yeast_speed_factor),
    );
  }

  // Baker's percentages to grams — using compensated values
  // Apply custom pan dimensions + thickness if provided
  const baseBallWeight = panConfig
    ? calcDoughWeight(style, panConfig)
    : style.shape.dough_weight_g;
  const customBallWeight = panConfig?.ballWeightG;
  const ballWeight =
    customBallWeight != null && customBallWeight > 0
      ? Math.round(customBallWeight)
      : Math.round(baseBallWeight * ovenCompensations.thickness_factor);
  const totalDough = ballWeight * doughBalls;

  // Total dough = flour × (1 + H/100 + salt/100 + oil/100 + sugar/100 + yeast/100)
  const totalPct =
    1 +
    hydration / 100 +
    effectiveSaltPct / 100 +
    effectiveOilPct / 100 +
    effectiveSugarPct / 100 +
    yeastPct / 100;

  const flourG = Math.round(totalDough / totalPct);
  const waterG = Math.round((flourG * hydration) / 100);
  // Sale/olio/zucchero: arrotondati all'intero. A casa la bilancia legge 1g e
  // 0.3g di sale sono gustativamente invisibili — mostrare i decimali era una
  // precisione fittizia (audit precisione, luglio 2026). Il lievito resta a 0.1g
  // sotto, perché lì il sotto-grammo conta davvero.
  const saltG = Math.round((flourG * effectiveSaltPct) / 100);
  const fatG = Math.round((flourG * effectiveOilPct) / 100); // Grasso totale (olio O burro)
  const oilG = style.dough.fat_type === "butter" ? 0 : fatG; // oilG = 0 se è burro
  const sugarG = Math.round((flourG * effectiveSugarPct) / 100);
  const yeastG =
    yeastType === "sourdough"
      ? Math.round((flourG * yeastPct) / 100)
      : Math.round(((flourG * yeastPct) / 100) * 10) / 10;

  // Fat label for UI
  const fatLabel =
    style.dough.fat_type === "butter"
      ? "Burro"
      : style.dough.fat_type === "lard"
        ? "Strutto"
        : style.dough.fat_type === "oil"
          ? "Olio EVO"
          : "";

  // Calculate scores
  const authResult = calculateAuthenticityScore(
    style,
    hydration,
    ovenTemp,
    constraints.oven_type,
    flourW,
    flourPL,
    fermentationHours,
    interpretationCenter,
    hasPreFerment,
  );
  const feasResult = calculateFeasibilityScore(
    style,
    isFriedStyle(style) ? style.baking.temp_c_ideal : constraints.oven_max_temp_c,
    flourW,
    hydration,
    constraints.skill_level,
  );

  // ── Tono onesto (Audit role-play giugno 2026): se il forno non regge lo stile
  // ad alta temperatura, non basta che l'A-Score crolli — anche la fattibilità
  // (= "verrà come deve?") va abbassata e va detto in chiaro. Fattore
  // moltiplicativo: preserva l'ordinamento per skill ma segnala il problema. ──
  const ovenViability = thermalViability(style, ovenTemp);
  if (ovenViability < 1) {
    feasResult.score = Math.round(feasResult.score * (0.5 + 0.5 * ovenViability));
    if (ovenViability <= THERMAL_UNVIABLE_THRESHOLD) {
      feasResult.warnings.unshift(
        em(
          "feas.thermalUnviable",
          `A {oven}°C il metodo disponibile non riproduce la cottura di {style}. Il metodo attuale richiede almeno {min}°C; serve un adattamento verificato.`,
          { oven: ovenTemp, style: style.name, min: style.baking.temp_c_range[0] },
        ),
      );
    }
  }
  const digestResult = calculateDigestibilityScore(
    fermentationHours,
    fermentationTempC,
    hasPreFerment,
    yeastType === "sourdough" ? 0.2 : yeastPct,
    yeastType,
    !!style.dough.unleavened,
  );
  const expResult = calculateExperimentationScore(
    style,
    hydration,
    fermentationHours,
    hasPreFerment,
    constraints.oven_type,
    appliedCompensations.length, // Notion Pag.04: compensation count feeds E-Score (solo applicate, ENG-6)
  );

  // ── Sustainability score ──
  const sustResult = calculateSustainabilityScore(
    style,
    ovenTemp,
    cookTime,
    fermentationTempC,
    yeastType,
  );

  const sw = {
    authenticity: scoreWeights?.authenticity ?? 0.45,
    feasibility: scoreWeights?.feasibility ?? 0.30,
    digestibility: scoreWeights?.digestibility ?? 0.25,
    sustainability: scoreWeights?.sustainability ?? 0.0,
    experimentation: scoreWeights?.experimentation ?? 0.0,
  };
  // Il globale si finalizza dopo il verdetto operativo, con la politica unica.
  // Timeline finale (topping e attrezzatura risolti sopra, prima del clamp).
  const timeline = buildTimeline(fermentationHours, fermentationTempC, yeastType);
  // ENG-4: se anche con la fermentazione minima (o con le ore scelte) la timeline
  // non sta nella finestra fino al pasto, lo diciamo: la UI mostra l'avviso.
  const timelineMinutes = timeline.reduce((sum, step) => sum + step.duration_minutes, 0);
  const windowTooShort =
    constraints.meal_deadline === true &&
    constraints.available_hours > 0 &&
    timelineMinutes > constraints.available_hours * 60;
  const neededHours = Math.ceil(timelineMinutes / 6) / 10;

  const prerequisites = kitchenPrerequisites(style, constraints, flourW, yeastType);
  const excludedFlours = excludedRecipeFlours(style, constraints.excluded_flours ?? []);
  if (constraints.excluded_flours?.some(id => ["00", "0", "tipo_1", "manitoba"].includes(id) && !excludedFlours.includes(id))) {
    prerequisites.push({ kind: "flour", status: "unverified", message: em("need.checkExclusions", METHOD_MESSAGES_IT["need.checkExclusions"]) });
  }
  const scores: RecipeScores = {
    authenticity: authResult.score,
    feasibility: feasResult.score,
    digestibility: digestResult.score,
    experimentation: expResult.score,
    sustainability: sustResult.score,
    composite: 0,
    authenticity_category: classifyScore("A", authResult.score),
    feasibility_category: classifyScore("F", feasResult.score),
    digestibility_category: classifyScore(
      "D",
      digestResult.score,
    ),
    experimentation_category: expResult.category,
    sustainability_category: sustResult.category,
    penalties: authResult.penalties,
    warnings: [
      ...(style.baking.oven_type_required === "coal" && constraints.oven_type !== "coal"
        ? [em("gen.notCoalOven", METHOD_MESSAGES_IT["gen.notCoalOven"])]
        : []),
      ...prerequisites.map(condition => condition.message),
      ...(homeMethod ? [em("gen.homeBakingMethod", METHOD_MESSAGES_IT["gen.homeBakingMethod"], { temp: ovenTemp, ideal: style.baking.temp_c_ideal })] : []),
      // D-020: stesso avviso dei consigli sul forno a legna dello stile.
      ...(style.requires_wood_oven && constraints.oven_type !== "wood"
        ? [
            em(
              "gen.notWoodOven",
              METHOD_MESSAGES_IT["gen.notWoodOven"],
            ),
          ]
        : []),
      ...(windowTooShort
        ? [
            em(
              "gen.windowTooShort",
              `Con {available} h non c'è tempo per tutto: questa ricetta richiede circa {needed} h. Sarà pronta più tardi dell'orario scelto: scegli un orario più avanti o una lievitazione più breve.`,
              { available: constraints.available_hours, needed: neededHours },
            ),
          ]
        : []),
      ...(timeClampedBelowMin
        ? [
            constraints.meal_deadline
              ? // Con l'orario del pasto le ore servono anche a impasto, staglio
                // e cottura: il messaggio dice quante ne restano alla
                // lievitazione (verifica di GPT: «con 4 h… min 4 h» era oscuro).
                em(
                  "gen.timeBelowStyleWindowMeal",
                  "Con {available} h fino al pasto, tolte le lavorazioni e la cottura ({work} h), restano {ferment} h di lievitazione: meno del minimo dello stile ({fMin} h). Per lo stile pieno servono circa {needed} h in tutto.",
                  {
                    available: constraints.available_hours,
                    work: Math.ceil(timelineOverheadMinutes(timeline) / 15) / 4,
                    ferment: fermentationHours,
                    fMin: fermRange[0],
                    needed: fermRange[0] + Math.ceil(timelineOverheadMinutes(timeline) / 15) / 4,
                  },
                )
              : em(
                  "gen.timeBelowStyleWindow",
                  `Con {available}h non rientri nella finestra di questo stile (min {fMin}h): fermentazione accorciata. Per l'autenticità piena servono almeno {fMin}h.`,
                  { available: constraints.available_hours, fMin: fermRange[0] },
                ),
          ]
        : []),
      ...feasResult.warnings.filter((m) => !(homeMethod && m.key === "feas.ovenTooCold")),
    ],
    claims: [...digestResult.claims, ...sustResult.claims],
  };

  // Generate tips
  const tips = generateTips(
    style,
    hydration,
    flourW,
    ovenTemp,
    constraints,
  );

  // ── Scientific layer — con Q10 variabile a tratti continuo (ENG-2) ──
  const { model: sciQ10Model } = getQ10(yeastType, fermentationTempC);
  const sciSpeedRatio = fermentationSpeedRatio(yeastType, fermentationTempC);
  const effectiveHours18c =
    equivalentFermentationHours(fermentationHours, fermentationTempC, yeastType, hasPreFerment, preFermentType, style.method_profile) * sciSpeedRatio;

  // Gluten network score: flour W strength + hydration sweet spot + kneading method
  const wNorm = Math.min(1, Math.max(0, (flourW - 150) / 250)); // 0 at W150, 1 at W400
  const hydrationPenalty =
    hydration > 85 ? (hydration - 85) * 0.8 : 0; // very high hydration weakens network
  // F7 (audit role-play): il no-knead NON va penalizzato. Con autolisi + pieghe a
  // intervalli (stretch & fold) su lunga maturazione la maglia glutinica finale è
  // ottima — spesso pari o superiore all'impasto lavorato. Il vecchio -8 era al
  // contrario. Ora leggermente sotto l'impasto intensivo (+3 vs +5) solo per la
  // maggiore variabilità del metodo, non come penalità.
  const kneadBonus = style.dough.process_type.includes("no_knead") ? 3 : 5;
  const glutenNetwork = Math.round(
    Math.min(
      100,
      Math.max(
        10,
        wNorm * 70 + 20 + kneadBonus - hydrationPenalty,
      ),
    ),
  );

  // Proteolysis index: longer fermentation at lower temps → more protein breakdown
  const proteolysis = Math.round(
    Math.min(
      100,
      Math.max(
        5,
        effectiveHours18c * 1.8 +
          (fermentationTempC <= 6 ? 12 : 0) +
          (hasPreFerment ? 10 : 0),
      ),
    ),
  );

  // Water activity: bread dough is typically 0.96–0.99
  // Salt and sugar reduce aw, higher hydration increases it
  const saltEffect = effectiveSaltPct * 0.006;
  const sugarEffect =
    (style.allows_additives ? style.dough.sugar_pct : 0) *
    0.004;
  const waterActivity =
    Math.round(
      (0.96 +
        (hydration - 55) * 0.0005 -
        saltEffect -
        sugarEffect) *
        1000,
    ) / 1000;

  // Starch degradation: enzymatic breakdown during fermentation
  const starchDeg = Math.round(
    Math.min(
      85,
      Math.max(
        2,
        effectiveHours18c * 1.5 +
          (fermentationTempC <= 6 ? 8 : -3),
      ),
    ),
  );

  // Baking energy estimate (kJ): power × time
  // Approximate: home oven ~2kW, wood ~8kW thermal, electric high ~3kW
  const ovenPowerKW =
    ovenTemp > 400 ? 8 : ovenTemp > 300 ? 3 : 2;
  const bakingEnergyKJ = Math.round(
    ovenPowerKW * (cookTime / 3600) * 3600,
  ); // kJ = kW × h × 3600

  const science: ScientificLayer = {
    yeast_baker_pct: Math.round(yeastPct * 100) / 100,
    effective_hours_18c:
      Math.round(effectiveHours18c * 10) / 10,
    fodmap_reduction_pct: digestResult.fodmap_reduction_pct,
    gluten_network: glutenNetwork,
    proteolysis_index: proteolysis,
    water_activity: waterActivity,
    starch_degradation_pct: starchDeg,
    q10_factor: Math.round(sciSpeedRatio * 100) / 100,
    q10_model: sciQ10Model,
    authenticity_breakdown: authResult.breakdown,
    compensations: appliedCompensations,
    flour_pl_estimated: flourPL,
    baking_energy_kj: bakingEnergyKJ,
    desired_dough_temp_c: 0, // set below
    friction_factor: 0,      // set below
    water_temp_c: null,      // set below
    deviation_category: _getStyleDeviationCategory(style.id),
    deviation_score_intrinsic: _getStyleDeviationScore(style.id),
    deviation_score_effective: 0, // set below after compensation tracking
    compensation_deviation_points: [], // set below
  };

  // ── Regola 55: Water Temperature Calculation ──
  // Formula: T_water = DDT × 3 − T_room − T_flour − friction_factor
  // DDT (Desired Dough Temperature): 24°C standard, 22°C for cold-ferment styles
  const ddt = fermentationTempC <= 4 ? 22 : 24;
  const kitchenTemp = constraints.kitchen_temp_c ?? DEFAULT_KITCHEN_TEMP;
  const flourTemp = kitchenTemp; // flour stored at ambient temperature
  // Friction factor from mixer type (Regola 55 / Costante K from Notion DB)
  let frictionFactor = 0;
  if (constraints.mixer_type && constraints.mixer_type !== "hands") {
    const mixerData = MIXER_FRICTION_K[constraints.mixer_type];
    if (mixerData) frictionFactor = mixerData;
  }
  const waterTempRaw = ddt * 3 - kitchenTemp - flourTemp - frictionFactor;
  // Range pratico 2–40°C. ENG-7 (audit motore 22/10/2026): prima, fuori range,
  // il motore restituiva null e la UI taceva (cucina a 15°C o meno: l'acqua
  // richiesta supera i 40°C). Ora l'acqua si ferma al limite pratico e
  // water_temp_limit dice alla UI di spiegare cosa fare: "max" = cucina fredda
  // (non scaldare oltre, intiepidisci la farina o allunga la puntata), "min" =
  // cucina calda (acqua ghiacciata, farina in frigo o puntata più corta).
  const waterTempLimit: "max" | "min" | null =
    waterTempRaw > WATER_TEMP_MAX_C ? "max" : waterTempRaw < WATER_TEMP_MIN_C ? "min" : null;
  const waterTempC =
    waterTempLimit === "max"
      ? WATER_TEMP_MAX_C
      : waterTempLimit === "min"
        ? WATER_TEMP_MIN_C
        : Math.round(waterTempRaw * 10) / 10;
  if (!style.dough.unleavened && yeastType !== "sourdough") {
    const q10 = getQ10(yeastType, fermentationTempC);
    science.yeast_model = {
      reference_pct: YEAST_REFERENCE_PCT,
      reference_hours: YEAST_REFERENCE_HOURS,
      reference_temp_c: Q10_REFERENCE_TEMP_C,
      time_exponent: YEAST_TIME_EXPONENT,
      speed_ratio: Math.round(fermentationSpeedRatio(yeastType, fermentationTempC) * 100) / 100,
      q10_model: q10.model,
      dry_ratio: YEAST_DRY_RATIO,
      personal_factor: clampYeastSpeedFactor(constraints.yeast_speed_factor),
      range_pct: [
        Math.round(yeastPct * YEAST_DOSE_MARGIN[0] * 1000) / 1000,
        Math.round(yeastPct * YEAST_DOSE_MARGIN[1] * 1000) / 1000,
      ],
    };
  }
  science.desired_dough_temp_c = ddt;
  science.friction_factor = frictionFactor;
  science.water_temp_c = waterTempC;
  science.water_temp_limit = waterTempLimit;

  // ── Deviation tracking (Notion Pag.04/05 TODO) ──
  const devResult = _calculateEffectiveDeviation(
    science.deviation_score_intrinsic,
    science.compensations,
    hydration,
    style.dough.hydration_pct_range,
    fermentationHours,
    style.dough.fermentation_hours_range,
  );
  science.deviation_score_effective = devResult.score;
  science.compensation_deviation_points = devResult.compensationPoints;

  // ── M-10: esito esplicito ──
  const dietaryWarnings = getDietaryWarnings(constraints.dietary_filters, [
    ...(flourG > 0 ? (flourBlend?.length
      ? flourBlend.filter(c => c.pct > 0).map(c => ({ name: c.name, gluten: c.w !== undefined }))
      : [{ name: "Farina di grano", gluten: true }]) : []),
    { name: "Acqua" }, { name: "Sale" },
    ...(fatG > 0 && fatLabel ? [{ name: fatLabel }] : []),
    ...(effectiveSugarPct > 0 ? [{ name: "Zucchero" }] : []),
    ...(defaultTopping?.ingredients.filter(i => i.amount.value > 0) ?? []),
  ]);
  const referenceRef = STYLES_DB[style.id]?.default_topping_ref;
  const referenceTopping = referenceRef ? getToppingForStyle(referenceRef, style) : undefined;
  const omittedConflicts = referenceTopping && referenceTopping.id !== defaultTopping?.id
    ? [...new Set(getDietaryWarnings(constraints.dietary_filters, referenceTopping.ingredients)
      .filter(w => w.severity === "critical").flatMap(w => w.ingredients))]
    : [];
  const dietaryVariant = defaultTopping && referenceTopping && omittedConflicts.length > 0 &&
    !dietaryWarnings.some(w => w.severity === "critical") &&
    !defaultTopping.ingredients.some(i => omittedConflicts.includes(i.name))
    ? { reference_topping_id:referenceTopping.id, topping_id:defaultTopping.id, omitted_conflicts:omittedConflicts } : undefined;
  const blockers: RecipeBlocker[] = dietaryWarnings.filter(w => w.severity === "critical").map(w => ({
    kind: "dietary_conflict", filter_id: w.filterId, ingredients: w.ingredients, message: w.message,
  }));
  const requiredIngredients: {name:string;components?:string[]}[] = [{name:"Acqua"}, {name:"Sale"}, ...(fatG > 0 && fatLabel ? [{name:fatLabel}] : []), ...(effectiveSugarPct > 0 ? [{name:"Zucchero"}] : []), ...(defaultTopping?.ingredients ?? [])];
  const excludedIngredientIds = new Set(constraints.excluded_ingredients ?? []);
  const excludedNames = requiredIngredients.flatMap(ingredient => pantryIngredientReferences(ingredient.name,ingredient.components).filter(row => excludedIngredientIds.has(row.id)).map(row => row.name));
  if (!style.dough.unleavened && (constraints.excluded_yeasts ?? []).includes(yeastType)) excludedNames.push(yeastType);
  for (const name of new Map(excludedNames.map(name => [pantryIngredientId(name), name])).values()) blockers.push({kind:"resource_excluded",resource:"ingredient",message:em("need.excludedIngredient",METHOD_MESSAGES_IT["need.excludedIngredient"],{ingredient:name})});
  if (constraints.pantry_ingredients_complete) {
    const present = new Set(constraints.pantry_ingredients ?? []);
    for (const name of [...new Map((defaultTopping?.ingredients ?? []).filter(ingredient => !ingredient.optional).map(ingredient => [pantryIngredientId(ingredient.name), ingredient.name])).values()]) {
      if (!present.has(pantryIngredientId(name)) && !excludedIngredientIds.has(pantryIngredientId(name))) prerequisites.push({kind:"ingredient",status:"missing",acquisition:"ingredient",message:em("need.ingredient","Serve: {ingredient}",{ingredient:name})});
    }
  }
  for (const id of excludedFlours) {
    blockers.push({ kind: "resource_excluded", resource: "flour", message: em("need.excludedFlour", METHOD_MESSAGES_IT["need.excludedFlour"], { flour: id }) });
  }
  for (const condition of prerequisites) {
    const refused = condition.kind === "flour" && constraints.allow_flour_purchase === false ||
      (condition.kind === "pan" || condition.kind === "deck") && constraints.allow_equipment_purchase === false;
    if (condition.status === "missing" && refused) {
      blockers.push({ kind: "resource_excluded", resource: condition.kind === "flour" ? "flour" : "equipment",
        message: em("need.purchaseRefused", METHOD_MESSAGES_IT["need.purchaseRefused"]) });
    }
  }
  const supportedMin = minimumSupportedOvenTemp(style, constraints);
  if (!isFriedStyle(style) && ovenTemp < supportedMin) {
    blockers.push({ kind: "oven_too_cold", oven_c: ovenTemp, style_min_c: supportedMin });
  }
  if (windowTooShort) {
    blockers.push({ kind: "time_window", available_h: constraints.available_hours, needed_h: neededHours });
  }
  if (fermentationHours < fermRange[0]) {
    blockers.push({
      kind: "fermentation_too_short",
      fermentation_h: fermentationHours,
      style_min_h: fermRange[0],
      needed_h: Math.ceil((fermRange[0] * 60 + timelineOverheadMinutes(timeline)) / 15) / 4,
    });
  }
  if (fermentationHours > fermRange[1]) {
    blockers.push({ kind: "fermentation_too_long", fermentation_h: fermentationHours, style_max_h: fermRange[1] });
  }
  if (style.dough.fermentation_temp_c !== undefined && fermentationTempC !== style.dough.fermentation_temp_c) {
    blockers.push({ kind: "fermentation_temperature", actual_c: fermentationTempC, required_c: style.dough.fermentation_temp_c });
  }
  const verdict: RecipeVerdict = {
    outcome: blockers.length > 0 ? "not_feasible" : scores.warnings.length > 0 || dietaryWarnings.length > 0 ? "warnings" : "ok",
    blockers,
    adaptations: scores.warnings,
    conditions: prerequisites,
  };
  const global = globalRecipeScore({
    authenticity: scores.authenticity,
    feasibility: scores.feasibility,
    digestibility: scores.digestibility,
    sustainability: scores.sustainability,
    experimentation: scores.experimentation,
  }, sw, verdict.outcome);
  scores.composite = global.score;
  scores.global_calculation = global.calculation;

  return {
    topping_scale: toppingScale,
    topping_geometry: { reference_area_cm2: referenceArea, area_cm2: toppingArea, area_scale: toppingArea / referenceArea },
    pan_config: panConfig,
    method_changes: defaultTopping?.method_note ? [defaultTopping.method_note] : undefined,
    schema_version: RECIPE_SCHEMA_VERSION,
    dietary_warnings: dietaryWarnings,
    dietary_variant: dietaryVariant,
    optional_aids: style.id !== "napoletana_stg" && !isFriedStyle(style) && !style.proof_in_pan && !style.dough.unleavened &&
      style.shape.shape_type !== "rectangular" && !homeMethod &&
      !(constraints.excluded_flours ?? []).includes("semola") &&
      !(constraints.excluded_flours ?? []).includes("frumento") &&
      (constraints.allow_flour_purchase !== false || constraints.pantry_flours.includes("semola")) && !constraints.dietary_filters.includes("gluten_free")
        ? [em("aid.semolina", METHOD_MESSAGES_IT["aid.semolina"])]
        : [],
    baker_pcts: { salt: effectiveSaltPct, fat: effectiveOilPct, sugar: effectiveSugarPct },
    verdict,
    style,
    dough_balls: doughBalls,
    flour_g: flourG,
    water_g: waterG,
    salt_g: saltG,
    oil_g: oilG,
    fat_g: fatG,
    fat_label: fatLabel,
    sugar_g: sugarG,
    yeast_g: yeastG,
    yeast_type: yeastType,
    hydration_pct: hydration,
    flour_w: flourW,
    flour_pl: flourPL,
    flour_blend: (() => {
      if (!flourBlend || flourBlend.length === 0) return undefined;
      const resolved = flourBlend.map((c) => ({
        ...c,
        grams: Math.round((flourG * c.pct) / 100),
      }));
      // I grammi dei componenti devono sommare esattamente alla farina totale:
      // il drift di arrotondamento va al componente più grande.
      const drift = flourG - resolved.reduce((s, c) => s + c.grams, 0);
      if (drift !== 0) {
        let idx = 0;
        resolved.forEach((c, i) => {
          if (c.grams > resolved[idx].grams) idx = i;
        });
        resolved[idx] = { ...resolved[idx], grams: resolved[idx].grams + drift };
      }
      return resolved;
    })(),
    effective_gluten_w:
      effectiveGlutenW != null && effectiveGlutenW !== flourW
        ? effectiveGlutenW
        : undefined,
    fermentation_hours: fermentationHours,
    fermentation_temp_c: fermentationTempC,
    has_pre_ferment: hasPreFerment,
    pre_ferment_type: hasPreFerment ? preFermentType : undefined,
    pre_ferment_flour_pct: hasPreFerment ? preFermentFlourPct : undefined,
    oven_temp_c: ovenTemp,
    cook_time_sec: cookTime,
    total_dough_g: totalDough,
    ball_weight_g: ballWeight,
    scores,
    timeline,
    water_temp_c: waterTempC,
    tips,
    science,
    topping_info: (() => {
      const ti = getToppingByStyle(style.id);
      if (!ti) return undefined;
      return {
        toppingOrder: ti.toppingOrder,
        saucePosition: ti.saucePosition,
        cheeseType: ti.cheeseType,
        cheesePosition: ti.cheesePosition,
        note: ti.note,
      };
    })(),
  };
}

/** Regola 55 — range pratico dell'acqua d'impasto (°C). Sopra i 40°C il
 *  lievito soffre; sotto i 2°C è acqua ghiacciata. */
const WATER_TEMP_MIN_C = 2;
const WATER_TEMP_MAX_C = 40;

/**
 * Total friction temperature rise (°C) by mixer type — from Notion DB 🥣 Impastatrici.
 * Notion K is °C/(min·100rpm). Pre-computed for typical mix:
 *   Planetaria dom: K=0.25, 10min, 160rpm → 4°C
 *   Planetaria semi-pro: K=0.25, 12min, 170rpm → 5°C
 *   Spirale: K=0.15, 10min, 180rpm → 3°C
 *   Forcella: K≈0.10, 10min, 180rpm → 2°C
 *   A mano: K=0.05, rpm=0 → 0°C (excluded)
 */
const MIXER_FRICTION_K: Record<string, number> = {
  stand_domestic: 4,
  planetary: 5,
  spiral: 3,
  fork: 2,
};

// ═══ RECIPE OPTIMIZER — "genera la pizza perfetta per il TUO setup" ═══
// Audit role-play giugno 2026 (finding §1): generateRecipe VALUTA i parametri che
// gli passi e, in assenza, usa il punto-medio del range. Non cerca mai la
// combinazione MIGLIORE per i tuoi vincoli. optimizeRecipe colma il gap: esplora
// uno spazio parametri vincolato (idratazione, ore/temperatura di fermentazione,
// forza farina, pre-fermento) e restituisce la ricetta che massimizza l'obiettivo
// rispettando forno, ore disponibili e livello dell'utente.

/** Pesi dell'obiettivo da massimizzare. Se omessi, si usano i pesi di scoring
 *  (default 0.45 / 0.30 / 0.25) così l'ottimo coincide col composite mostrato. */
interface OptimizeObjectiveWeights {
  authenticity?: number;
  feasibility?: number;
  digestibility?: number;
  sustainability?: number;
  experimentation?: number;
}

interface OptimizedCandidate {
  hydration: number;
  flour_w: number;
  fermentation_hours: number;
  fermentation_temp_c: number;
  use_pre_ferment: boolean;
  /** Valore dell'obiettivo (0-100) per questa combinazione. */
  objective_score: number;
  composite: number;
  outcome: RecipeOutcome;
}

export interface OptimizedRecipe {
  /** Ricetta pronta da mostrare, generata con i parametri ottimi. */
  recipe: GeneratedRecipe;
  /** I parametri scelti dall'ottimizzatore. */
  params: {
    /** Idratazione finale della ricetta (base + compensazione del forno). */
    hydration: number;
    /** ENG-6: idratazione base del candidato, prima della compensazione. */
    hydration_base: number;
    /** ENG-6: true se la compensazione d'idratazione è applicata. Per
     *  ricostruire la stessa ricetta: customHydration = hydration_base con
     *  compensateCustomHydration = true. */
    hydration_compensated: boolean;
    flour_w: number;
    fermentation_hours: number;
    fermentation_temp_c: number;
    use_pre_ferment: boolean;
  };
  /** Valore dell'obiettivo massimizzato (0-100). */
  objective_score: number;
  /** Perché questi parametri — spiegazione human-readable (i18n-ready). */
  rationale: EngineMsg[];
  /** Migliori alternative (runner-up), per dare scelta all'utente. */
  alternatives: OptimizedCandidate[];
  /** Quante combinazioni sono state valutate. */
  evaluated: number;
}

function _uniqRounded(nums: number[], decimals = 2): number[] {
  const f = Math.pow(10, decimals);
  return Array.from(new Set(nums.map((n) => Math.round(n * f) / f))).sort((a, b) => a - b);
}

/** Tetto d'idratazione gestibile per livello: evita di "ottimizzare" verso impasti
 *  che l'utente non sa gestire (un principiante non deve ricevere 85%). */
function _hydrationCeilingForSkill(skill: SkillLevel): number {
  switch (skill) {
    case 1: return 68;
    case 2: return 78;
    case 3: return 88;
    default: return 200; // esperto: nessun tetto pratico
  }
}

/** ENG-4 — ore di fermentazione massime che stanno nella finestra fino al
 *  pasto, tolto l'overhead fisso della timeline (stesso calcolo del clamp di
 *  generateRecipe), arrotondate per difetto al quarto d'ora e mai sotto il
 *  minimo tecnico. Senza orario del pasto (meal_deadline assente) restituisce
 *  Infinity: nessun limite oltre alle ore disponibili. Serve alla UI per i
 *  parametri «centro dello stile» (reset, interpretazione base), che passano
 *  sempre ore custom e quindi saltano il clamp del motore. */
export function maxFermentationHoursForWindow(
  style: PizzaStyle,
  constraints: UserConstraints,
  options: GenerateRecipeOptions = {},
): number {
  if (!constraints.meal_deadline || !(constraints.available_hours > 0)) return Infinity;
  const probe = generateRecipe(style, constraints, {
    ...options,
    customFermentationHours: undefined,
  });
  const range = probe.style.dough.fermentation_hours_range;
  const fermRange: [number, number] = range[0] <= range[1] ? range : [range[1], range[0]];
  return Math.max(
    minimumFermentationHours(fermRange),
    fermentationWindowHours(constraints.available_hours, timelineOverheadMinutes(probe.timeline)),
  );
}

export function optimizeRecipe(
  style: PizzaStyle,
  constraints: UserConstraints,
  objective?: OptimizeObjectiveWeights,
  panConfig?: PanConfig,
  scoreWeights?: ScoreWeightsOverride,
  versionRanges?: VersionRangeOverrides,
  activeImpastoRef?: string,
  interpretationCenter?: AuthenticityCenter,
): OptimizedRecipe {
  constraints = { ...constrainOvenToCapacity(constraints), available_hours: floorToQuarterHour(constraints.available_hours) };
  const safeRange = (r: [number, number]): [number, number] =>
    r[0] <= r[1] ? r : [r[1], r[0]];

  // Applichiamo gli stessi merge che farebbe generateRecipe per leggere i range
  // effettivi (impasto + versione), così lo spazio di ricerca è coerente.
  let effStyle = style;
  const impastoId = activeImpastoRef ?? style.default_impasto_ref;
  const impasto = impastoId ? getImpasto(impastoId) : undefined;
  if (impasto) {
    effStyle = { ...effStyle, dough: mergeImpastoIntoDough(effStyle.dough, impasto) };
  }
  if (versionRanges) {
    effStyle = {
      ...effStyle,
      dough: {
        ...effStyle.dough,
        hydration_pct_range: versionRanges.hydration_pct_range ?? effStyle.dough.hydration_pct_range,
        flour_w_range: versionRanges.flour_w_range ?? effStyle.dough.flour_w_range,
        fermentation_hours_range: versionRanges.fermentation_hours_range ?? effStyle.dough.fermentation_hours_range,
      },
    };
  }

  const [hMin, hMax] = safeRange(effStyle.dough.hydration_pct_range);
  const [wMin, wMax] = safeRange(effStyle.dough.flour_w_range);
  const [fMin, fMax] = safeRange(effStyle.dough.fermentation_hours_range);

  // ── Ricetta sonda: overhead fisso della timeline (ENG-4) e compensazione
  // d'idratazione del forno (ENG-6), con gli stessi vincoli e la stessa cottura. ──
  const probe = generateRecipe(style, constraints, {
    panConfig,
    scoreWeights,
    versionRanges,
    activeImpastoRef,
    interpretationCenter,
  });
  const overheadMinutes = timelineOverheadMinutes(probe.timeline);
  const hydrationDelta = calculateOvenCompensations(effStyle, probe.oven_temp_c).hydration_delta_pct;

  // ── Spazio ore: dentro la finestra dello stile, capato alle ore disponibili
  // MENO l'overhead fisso (ENG-4: la finestra arriva fino al pasto). Il filtro
  // ora viene DOPO l'arrotondamento, così nessun candidato sfora; si
  // aggiunge la fermentazione più lunga che sta nella finestra (al quarto
  // d'ora), se cade nel range dello stile. Senza orario del pasto
  // (meal_deadline assente) l'overhead non si toglie: le ore limitano solo
  // la fermentazione, come in generateRecipe.
  // M-4: candidati al quarto d'ora (all'ora intera la Recco, 0,5–2 h, finiva
  // a 3 h). Il massimo del metodo è un limite anche quando ogni candidata
  // è bloccata da forno o preferenze: non si aggiungono altre violazioni. ──
  const avail = constraints.available_hours > 0 ? constraints.available_hours : Infinity;
  const fermentWindow =
    avail === Infinity || !constraints.meal_deadline
      ? avail
      : fermentationWindowHours(avail, overheadMinutes);
  let hourCands = _uniqRounded([
    ...[fMin, (fMin + fMax) / 2, fMax].map((h) => Math.max(fMin, floorToQuarterHour(h))),
    ...(fermentWindow >= fMin && fermentWindow <= fMax ? [fermentWindow] : []),
  ]).filter((h) => h <= fermentWindow);
  if (hourCands.length === 0) {
    // Anche il minimo dello stile è oltre il tempo disponibile: si fa il meglio
    // possibile. Se nemmeno il minimo tecnico sta nella finestra, la ricetta
    // porta l'avviso gen.windowTooShort.
    hourCands = [Math.max(minimumFermentationHours([fMin, fMax]), Math.min(fMin, fermentWindow))];
  }

  // ── Spazio temperatura: frigo / cantina / ambiente (sfoglia non lievitata: TA) ──

  // ── Spazio idratazione: range stile, capato dal livello dell'utente ──
  // ENG-6: i candidati sono idratazioni BASE; la compensazione del forno si
  // applica sopra (compensateCustomHydration). Il tetto di livello vale
  // sull'idratazione FINALE, quindi la base si ferma a tetto − compensazione.
  const skillCeilBase = _hydrationCeilingForSkill(constraints.skill_level) - hydrationDelta;
  const skillCeilingBinding = skillCeilBase < hMax;
  const hCeil = Math.min(hMax, skillCeilBase);
  const hLo = Math.min(hMin, hCeil);
  const hydrCands = _uniqRounded(
    _uniqRounded([hLo, (hLo + hCeil) / 2, hCeil], 0).map((h) => Math.min(h, hCeil)),
    1,
  );

  // ── Spazio farina: midpoint stile + match con la dispensa (se compatibile) ──
  const wMid = Math.round((wMin + wMax) / 2);
  const wCandSet: number[] = [wMid];
  for (const id of constraints.pantry_flours) {
    const r = pantryFlourRange(constraints, id);
    if (!r) continue;
    const w = Math.round(Math.max(wMin, Math.min(wMax, (r[0] + r[1]) / 2)));
    if (r[0] <= wMax && r[1] >= wMin) wCandSet.push(w); // overlap col range stile
  }
  const wCands = _uniqRounded(wCandSet, 0);

  // ── Spazio pre-fermento ──
  const allowsPreferment = /biga|poolish/.test(effStyle.dough.process_type);
  let prefCands: boolean[];
  if (effStyle.requires_pre_ferment) prefCands = [true];
  else if (allowsPreferment && constraints.skill_level >= 2) prefCands = [false, true];
  else prefCands = [false];

  // ── Pesi obiettivo: default = pesi di scoring, così l'ottimo = composite mostrato ──
  const obj = {
    authenticity: objective?.authenticity ?? scoreWeights?.authenticity ?? 0.45,
    feasibility: objective?.feasibility ?? scoreWeights?.feasibility ?? 0.30,
    digestibility: objective?.digestibility ?? scoreWeights?.digestibility ?? 0.25,
    sustainability: objective?.sustainability ?? scoreWeights?.sustainability ?? 0.0,
    experimentation: objective?.experimentation ?? scoreWeights?.experimentation ?? 0.0,
  };

  let best: { cand: OptimizedCandidate; recipe: GeneratedRecipe } | null = null;
  const all: OptimizedCandidate[] = [];
  let evaluated = 0;

  for (const hours of hourCands) {
    // Una maturazione fredda non diventa una fermentazione di giorni a TA
    // soltanto perché così l'obiettivo numerico risulta più alto.
    const tempCands = [defaultFermentTempC(effStyle, hours)];
    for (const temp of tempCands) {
      for (const hydr of hydrCands) {
        for (const w of wCands) {
          for (const pref of prefCands) {
            const recipe = generateRecipe(style, constraints, {
              customHydration: hydr,
              compensateCustomHydration: true,
              customFlourW: w,
              customFermentationHours: hours,
              customFermentationTempC: temp,
              usePreFerment: pref,
              panConfig,
              scoreWeights,
              versionRanges,
              activeImpastoRef,
              interpretationCenter,
            });
            evaluated++;
            const s = recipe.scores;
            const objScore = globalRecipeScore({
              authenticity: s.authenticity, feasibility: s.feasibility,
              digestibility: s.digestibility, sustainability: s.sustainability,
              experimentation: s.experimentation,
            }, obj, recipe.verdict.outcome).score;
            const cand: OptimizedCandidate = {
              hydration: hydr,
              flour_w: w,
              fermentation_hours: hours,
              fermentation_temp_c: temp,
              use_pre_ferment: pref,
              objective_score: Math.round(objScore * 10) / 10,
              composite: s.composite,
              outcome: recipe.verdict.outcome,
            };
            all.push(cand);
            // Selezione: massimo obiettivo; a pari merito preferisci più
            // fattibile, poi più digeribile (pizze "perfette" ma eseguibili).
            if (
              best === null ||
              (recipe.verdict.outcome !== "not_feasible" && best.recipe.verdict.outcome === "not_feasible") ||
              ((recipe.verdict.outcome === "not_feasible") === (best.recipe.verdict.outcome === "not_feasible") &&
              (objScore > best.cand.objective_score ||
              (Math.abs(objScore - best.cand.objective_score) < 0.05 &&
                (s.feasibility > best.recipe.scores.feasibility ||
                  (s.feasibility === best.recipe.scores.feasibility &&
                    s.digestibility > best.recipe.scores.digestibility)))))
            ) {
              best = { cand: { ...cand, objective_score: objScore }, recipe };
            }
          }
        }
      }
    }
  }

  // best è garantito non-null: gli spazi candidati hanno sempre ≥1 elemento.
  const chosen = best as { cand: OptimizedCandidate; recipe: GeneratedRecipe };
  const r = chosen.recipe;

  // ── Rationale: spiega le scelte che si discostano dal banale midpoint ──
  const rationale: EngineMsg[] = [];
  if (r.fermentation_temp_c <= 4 && r.fermentation_hours >= 24) {
    rationale.push(
      em(
        "opt.coldLongFerment",
        `Maturazione prevista: ${r.fermentation_hours}h in frigo (${r.fermentation_temp_c}°C), entro la finestra di ${constraints.available_hours}h.`,
        { hours: r.fermentation_hours, temp: r.fermentation_temp_c, available: constraints.available_hours },
      ),
    );
  } else if (r.fermentation_temp_c >= 18) {
    rationale.push(
      em(
        "opt.roomFerment",
        `Fermentazione ${r.fermentation_hours}h a temperatura ambiente (${r.fermentation_temp_c}°C): coerente con lo stile e senza frigo.`,
        { hours: r.fermentation_hours, temp: r.fermentation_temp_c },
      ),
    );
  }
  // Audit role-play giugno 2026 (#3 trasparenza): la rationale dichiara cosa
  // l'optimizer ha CAMBIATO rispetto alla canonica (midpoint), non solo le scelte.
  const hMidStyle = Math.round((hMin + hMax) / 2);
  // ENG-6: le scelte sull'idratazione si leggono sulla BASE del candidato; la
  // compensazione del forno, se applicata, è dichiarata a parte.
  // «Abbassata per il tuo livello» solo se il tetto di livello ha davvero
  // limitato la ricerca e l'idratazione FINALE resta sotto la canonica: con la
  // compensazione la finale può superare la canonica e il messaggio si
  // contraddirebbe (Napoletana a 250°C: base 55%, finale 63,7%).
  const baseHydrationChosen = chosen.cand.hydration;
  if (skillCeilingBinding && r.hydration_pct < hMidStyle - 1) {
    rationale.push(
      em(
        "opt.hydrationLowered",
        `Idratazione abbassata a ${r.hydration_pct}% (canonica ${hMidStyle}%) per restare gestibile al tuo livello.`,
        { h: r.hydration_pct, canonical: hMidStyle },
      ),
    );
  } else if (baseHydrationChosen >= hMidStyle) {
    rationale.push(
      em("opt.hydrationForStyle", `Idratazione ${baseHydrationChosen}% nel cuore dello stile.`, { h: baseHydrationChosen }),
    );
  }
  const hydrationCompApplied = r.science.compensations.find((c) => c.type === "hydration");
  if (hydrationCompApplied) {
    const delta = Math.round((r.hydration_pct - baseHydrationChosen) * 10) / 10;
    rationale.push(
      em(
        "opt.hydrationOvenCompensated",
        `Idratazione ${r.hydration_pct}%: ${baseHydrationChosen}% più ${delta}% per compensare il forno più freddo dell'ideale.`,
        { h: r.hydration_pct, base: baseHydrationChosen, delta },
      ),
    );
    if (r.hydration_pct > hMax || r.hydration_pct < hMin) {
      rationale.push(
        em(
          "opt.hydrationOutOfStyleRange",
          `Con la compensazione l'idratazione esce dal range dello stile (${hMin}–${hMax}%).`,
          { min: hMin, max: hMax },
        ),
      );
    }
  }
  if (r.has_pre_ferment && !style.requires_pre_ferment) {
    rationale.push(
      em("opt.prefermentAdded", `Pre-fermento (${r.pre_ferment_type}) aggiunto: più struttura, alveolatura e aroma.`, {
        type: r.pre_ferment_type ?? "",
      }),
    );
  } else if (r.has_pre_ferment) {
    rationale.push(
      em("opt.preferment", `Pre-fermento (${r.pre_ferment_type}): più struttura, alveolatura e aroma.`, {
        type: r.pre_ferment_type ?? "",
      }),
    );
  }
  // Farina: se l'optimizer ha scelto una W diversa dalla canonica (di norma per
  // sfruttare la tua dispensa), dichiaralo come cambiamento.
  const wMidStyle = Math.round((wMin + wMax) / 2);
  if (Math.abs(r.flour_w - wMidStyle) >= 15) {
    rationale.push(
      em(
        "opt.flourChanged",
        `Farina cambiata a W${r.flour_w} (canonica W${wMidStyle}).`,
        { w: r.flour_w, canonical: wMidStyle },
      ),
    );
  }
  if (r.verdict.outcome !== "not_feasible" && r.oven_temp_c < style.baking.temp_c_ideal) {
    rationale.push(
      em("opt.ovenAdapted", `Cottura adattata al tuo forno (${r.oven_temp_c}°C) con compensazioni automatiche.`, {
        temp: r.oven_temp_c,
      }),
    );
  }
  const fromPantry = constraints.pantry_flours.some((id) => {
    const range = pantryFlourRange(constraints, id);
    return range && r.flour_w >= range[0] - 1 && r.flour_w <= range[1] + 1;
  });
  if (fromPantry && Math.abs(r.flour_w - wMidStyle) < 15) {
    // Farina della dispensa che coincide già con la canonica (nessun cambiamento).
    rationale.push(em("opt.pantryFlour", `Forza farina W${r.flour_w} compatibile con la tua dispensa.`, { w: r.flour_w }));
  }

  const alternatives = all
    .filter((candidate) => candidate.outcome !== "not_feasible")
    .map((c) => ({ ...c, objective_score: Math.round(c.objective_score * 10) / 10 }))
    .filter(
      (c) =>
        !(
          c.hydration === chosen.cand.hydration &&
          c.flour_w === chosen.cand.flour_w &&
          c.fermentation_hours === chosen.cand.fermentation_hours &&
          c.fermentation_temp_c === chosen.cand.fermentation_temp_c &&
          c.use_pre_ferment === chosen.cand.use_pre_ferment
        ),
    )
    .sort((a, b) => b.objective_score - a.objective_score)
    .slice(0, 3);

  return {
    recipe: r,
    params: {
      hydration: r.hydration_pct,
      hydration_base: chosen.cand.hydration,
      hydration_compensated: hydrationCompApplied !== undefined,
      flour_w: r.flour_w,
      fermentation_hours: r.fermentation_hours,
      fermentation_temp_c: r.fermentation_temp_c,
      use_pre_ferment: r.has_pre_ferment,
    },
    objective_score: Math.round(chosen.cand.objective_score * 10) / 10,
    rationale,
    alternatives,
    evaluated,
  };
}

// ═══ EQUIPMENT-AWARE PROCEDURE (Audit role-play giugno 2026, punto 2) ═══
// L'utente imposta impastatrice e forno ma la procedura li ignorava (step "Impasto"
// generico, "Cuocere a X°C" senza setup). Questi helper rendono Impasto e Cottura
// specifici per l'attrezzatura dichiarata.

interface EquipmentContext {
  mixerType?: string | null;
  hasMixer?: boolean;
  ovenType?: OvenType;
  surfaces?: string[];
  ovenHeatProfile?: UserConstraints["oven_heat_profile"];
}

/* ═══ I18N-2 — testi dei passi con chiave ═══ */
/** Parametri che sono temperature in °C: nel testo italiano di riserva
 *  prendono l'unità, nella UI il formattatore (°C o °F). */
const STEP_TEMP_PARAMS = new Set(["temp"]);

function renderStepIt(msgs: EngineMsg[]): string {
  return msgs
    .map((m) =>
      Object.entries(m.params ?? {}).reduce(
        (text, [k, v]) => text.split(`{${k}}`).join(STEP_TEMP_PARAMS.has(k) ? `${v}°C` : String(v)),
        m.fallback,
      ),
    )
    .join(" ");
}

/** Passo con testi a chiave: compila title/description/tip in italiano. */
function keyedStep(
  base: Omit<TimelineStep, "title" | "description" | "tip" | "msg">,
  title: EngineMsg,
  description: EngineMsg[],
  tip?: { beginner: EngineMsg; nerd: EngineMsg },
): TimelineStep {
  return {
    ...base,
    title: renderStepIt([title]),
    description: renderStepIt(description),
    ...(tip ? { tip: { beginner: renderStepIt([tip.beginner]), nerd: renderStepIt([tip.nerd]) } } : {}),
    msg: { title, description, ...(tip ? { tip } : {}) },
  };
}

interface KneadGuidance {
  description: EngineMsg;
  duration_minutes: number;
  tip: { beginner: EngineMsg; nerd: EngineMsg };
}

function mixerKneadGuidance(eq?: EquipmentContext): KneadGuidance {
  switch (eq?.mixerType) {
    case "spiral":
      return {
        description: em("timeline.mix.spiral.desc", METHOD_MESSAGES_IT["timeline.mix.spiral.desc"]),
        duration_minutes: 9,
        tip: {
          beginner: em("timeline.mix.spiral.tipBeginner", METHOD_MESSAGES_IT["timeline.mix.spiral.tipBeginner"]),
          nerd: em("timeline.mix.spiral.tipNerd", METHOD_MESSAGES_IT["timeline.mix.spiral.tipNerd"]),
        },
      };
    case "fork":
      return {
        description: em("timeline.mix.fork.desc", METHOD_MESSAGES_IT["timeline.mix.fork.desc"]),
        duration_minutes: 14,
        tip: {
          beginner: em("timeline.mix.fork.tipBeginner", METHOD_MESSAGES_IT["timeline.mix.fork.tipBeginner"]),
          nerd: em("timeline.mix.fork.tipNerd", METHOD_MESSAGES_IT["timeline.mix.fork.tipNerd"]),
        },
      };
    case "planetary":
      return {
        description: em("timeline.mix.planetary.desc", METHOD_MESSAGES_IT["timeline.mix.planetary.desc"]),
        duration_minutes: 10,
        tip: {
          beginner: em("timeline.mix.planetary.tipBeginner", METHOD_MESSAGES_IT["timeline.mix.planetary.tipBeginner"]),
          nerd: em("timeline.mix.planetary.tipNerd", METHOD_MESSAGES_IT["timeline.mix.planetary.tipNerd"]),
        },
      };
    case "stand_domestic":
      return {
        description: em("timeline.mix.stand_domestic.desc", METHOD_MESSAGES_IT["timeline.mix.stand_domestic.desc"]),
        duration_minutes: 12,
        tip: {
          beginner: em("timeline.mix.stand_domestic.tipBeginner", METHOD_MESSAGES_IT["timeline.mix.stand_domestic.tipBeginner"]),
          nerd: em("timeline.mix.stand_domestic.tipNerd", METHOD_MESSAGES_IT["timeline.mix.stand_domestic.tipNerd"]),
        },
      };
    case "hands":
      break; // gestito sotto
    default:
      if (eq?.hasMixer) {
        return {
        description: em("timeline.mix.generic.desc", METHOD_MESSAGES_IT["timeline.mix.generic.desc"]),
        duration_minutes: 10,
        tip: {
          beginner: em("timeline.mix.generic.tipBeginner", METHOD_MESSAGES_IT["timeline.mix.generic.tipBeginner"]),
          nerd: em("timeline.mix.generic.tipNerd", METHOD_MESSAGES_IT["timeline.mix.generic.tipNerd"]),
        },
      };
      }
  }
  // A mano (default)
  return {
        description: em("timeline.mix.hands.desc", METHOD_MESSAGES_IT["timeline.mix.hands.desc"]),
        duration_minutes: 20,
        tip: {
          beginner: em("timeline.mix.hands.tipBeginner", METHOD_MESSAGES_IT["timeline.mix.hands.tipBeginner"]),
          nerd: em("timeline.mix.hands.tipNerd", METHOD_MESSAGES_IT["timeline.mix.hands.tipNerd"]),
        },
      };
}

/** Setup forno specifico per tipo: "a quanto metto le resistenze". */
function ovenBakeSetup(eq: EquipmentContext | undefined): EngineMsg {
  const hasStone = (eq?.surfaces ?? []).some((s) =>
    ["refractory_brick", "cordierite_stone", "steel_plate"].includes(s),
  );
  if (eq?.ovenHeatProfile === "top_grill") {
    return hasStone
      ? em("timeline.oven.topGrillStone", METHOD_MESSAGES_IT["timeline.oven.topGrillStone"])
      : em("timeline.oven.topGrillShelf", METHOD_MESSAGES_IT["timeline.oven.topGrillShelf"]);
  }
  if (eq?.ovenHeatProfile === "bottom_boost") {
    return em("timeline.oven.bottomBoost", METHOD_MESSAGES_IT["timeline.oven.bottomBoost"]);
  }
  if (eq?.ovenHeatProfile === "fan_assisted") {
    return em("timeline.oven.fanAssisted", METHOD_MESSAGES_IT["timeline.oven.fanAssisted"]);
  }
  if (eq?.ovenHeatProfile === "gas_rear") {
    return em("timeline.oven.gasRear", METHOD_MESSAGES_IT["timeline.oven.gasRear"]);
  }
  if (eq?.ovenHeatProfile === "wood_side_flame") {
    return em("timeline.oven.woodSideFlame", METHOD_MESSAGES_IT["timeline.oven.woodSideFlame"]);
  }
  switch (eq?.ovenType) {
    case "coal":
      return em("timeline.oven.coal", METHOD_MESSAGES_IT["timeline.oven.coal"]);
    case "wood":
      return em("timeline.oven.wood", METHOD_MESSAGES_IT["timeline.oven.wood"]);
    case "electric_high":
      return em("timeline.oven.electricHigh", METHOD_MESSAGES_IT["timeline.oven.electricHigh"]);
    case "gas":
      return em("timeline.oven.gas", METHOD_MESSAGES_IT["timeline.oven.gas"]);
    case "gas_pizza":
      return em("timeline.oven.gasPizza", METHOD_MESSAGES_IT["timeline.oven.gasPizza"]);
    case "home":
    case "electric_standard":
    default:
      return hasStone
        ? em("timeline.oven.staticStone", METHOD_MESSAGES_IT["timeline.oven.staticStone"])
        : em("timeline.oven.staticShelf", METHOD_MESSAGES_IT["timeline.oven.staticShelf"]);
  }
}

/** M-6: stili che si friggono in olio (pizza fritta, montanara), non in forno. */
export function isFriedStyle(style: PizzaStyle): boolean {
  return style.baking.temp_c_range[1] < 200;
}

function generateTimeline(
  style: PizzaStyle,
  fermentHours: number,
  fermentTemp: number,
  hasPreFerment: boolean,
  cookTimeSec: number,
  actualOvenTemp?: number,
  topping?: ToppingRecipe,
  equipment?: EquipmentContext,
  yeastType: "fresh" | "dry" | "sourdough" = "fresh",
  preFermentType: PreFermentType = preFermentKind(style),
  /** Pizze o teglie da cuocere: una alla volta (D-050). */
  bakeRounds = 1,
): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const phases = fermentationPhases(fermentHours, hasPreFerment, preFermentType, style.method_profile);
  const isUnleavened = !!style.dough.unleavened;

  // Helper per iniettare assembly_steps del topping in un certo punto.
  // Restituisce true se uno step "replaces_generic" è già stato iniettato
  // (così la pipeline non aggiunge anche il suo step generico).
  const injectToppingAt = (point: TimelineInsertPoint): boolean => {
    if (!topping?.assembly_steps) return false;
    let replacedGeneric = false;
    topping.assembly_steps
      .filter((s) => s.insert_at === point)
      .forEach((s) => {
        steps.push({
          id: s.id,
          title: s.title,
          description: s.description,
          duration_minutes: s.duration_minutes,
          icon: "chef-hat",
          timing_label: `${s.duration_minutes} min`,
          tip: s.tip,
        });
        if (s.replaces_generic) replacedGeneric = true;
      });
    return replacedGeneric;
  };

  // Topping pre_prep: hours_before_start (es. marinatura 12h prima),
  // just_before_assembly (es. patate in ammollo prima dell'assemblaggio),
  // during_bulk (raramente).
  // Per ora aggiungiamo come step iniziali; in futuro si può schedulare in punti più precisi.
  if (topping?.pre_prep_steps) {
    topping.pre_prep_steps
      .filter((p) => p.timing === "hours_before_start")
      .forEach((p) => {
        steps.push({
          id: p.id,
          title: p.title,
          description: p.description,
          duration_minutes: p.duration_minutes,
          icon: "beaker",
          timing_label: p.hours_before ? `${p.hours_before}h prima` : "preparazione",
          tip: p.tip,
        });
      });
  }

  if (hasPreFerment) {
    steps.push({
      id: "preferment",
      title: "Pre-Fermento",
      description: `Mescolare ${preFermentType} e far maturare`,
      duration_minutes: Math.round(phases.preferment * 60),
      icon: "beaker",
      timing_label: `${Math.round(phases.preferment)}h prima`,
      tip: {
        beginner:
          'Il pre-fermento è come un "antipasto" per il lievito. Mescola e lascia riposare coperto.',
        nerd: "Il pre-fermento produce acidi organici (lattico/acetico) che abbassano il pH a ~4.5, migliorando la rete glutinica e la shelf life.",
      },
    });
  }

  const isNoKnead = style.dough.process_type.includes("no_knead");
  // No-knead: l'impastatrice è irrilevante (mescola + pieghe a mano). Altrimenti
  // la descrizione/durata/consigli cambiano col tipo di impastatrice dichiarato.
  const knead = isNoKnead ? null : mixerKneadGuidance(equipment);
  if (isNoKnead) {
    // No-knead: testi dal CMS (timelineLabels.mix_noknead) nella UI.
    steps.push({
      id: "mix",
      title: "Impasto",
      description:
        "Mescolare gli ingredienti senza impastare, fino a sciogliere i grumi. Poi 3 giri di pieghe (stretch & fold) a intervalli di ~30 min nelle prime 1,5–2 ore.",
      duration_minutes: 10,
      icon: "hand",
      timing_label: "Inizio",
      tip: {
        beginner:
          "Non serve impastare! Mescola finché non ci sono grumi asciutti. Poi, ogni ~30 min, bagna le mani, afferra un lembo, tiralo verso l'alto e ripiegalo al centro ruotando la ciotola: bastano 3 giri da 4 pieghe.",
        nerd: "L'autolisi sviluppa il glutine senza lavoro meccanico; le pieghe a intervalli (stretch & fold) allineano e tendono le fibrille di glutine e redistribuiscono i gas, dando forza senza degassare.",
      },
    });
  } else {
    const k = knead as KneadGuidance;
    steps.push(
      keyedStep(
        { id: "mix", duration_minutes: k.duration_minutes, icon: "hand", timing_label: "Inizio" },
        em("timeline.mix.title", "Impasto"),
        [k.description],
        k.tip,
      ),
    );
  }

  /* ─── PIANO PRERISCALDO (ENG-5, audit motore 22/10/2026) ───
   * Il preriscaldo avviene in parallelo al riposo dei panetti, quindi i suoi
   * minuti sono ricavati dentro la fermentazione: il totale resta identico.
   * Prima esisteva solo se l'appretto superava i 30 min (Math.max(0, appretto
   * − 30)): la Focaccia di Recco non aveva alcun «accendi il forno».
   * - Appretto lungo (≥ preriscaldo + 15 min): il forno si accende negli ultimi
   *   minuti dell'appretto, come prima ma con il preriscaldo pieno.
   * - Appretto corto: il forno si accende subito dopo lo staglio e l'appretto
   *   avviene durante il preriscaldo; i minuti mancanti si tolgono dalla fine
   *   della puntata, così la fermentazione totale non cambia. */
  const bulkMinutesFull = Math.round(phases.bulk * 60);
  const proofMinutes = Math.round(phases.proof * 60);
  const ovenTempForPreheat = Math.round(actualOvenTemp ?? style.baking.temp_c_ideal);
  // M-6: per le fritte si scalda l'olio, non il forno: bastano 15 minuti.
  const idealPreheat = isFriedStyle(style)
    ? 15
    : ovenTempForPreheat >= 400 ? 60 : ovenTempForPreheat >= 300 ? 45 : 30;
  const preheatDuringProof = proofMinutes - idealPreheat >= 15;
  const borrowedFromBulk = preheatDuringProof
    ? 0
    : Math.min(bulkMinutesFull, Math.max(0, idealPreheat - proofMinutes));
  const bulkMinutes = bulkMinutesFull - borrowedFromBulk;
  const preheatMinutes = preheatDuringProof ? idealPreheat : proofMinutes + borrowedFromBulk;
  const proofStepMinutes = preheatDuringProof ? proofMinutes - idealPreheat : 0;
  const speedFactorLabel = fermentationSpeedRatio(yeastType, fermentTemp).toFixed(1);

  // Impasto non lievitato (Focaccia di Recco): non c'è lievitazione, solo riposo.
  const restTip = {
    beginner:
      "Senza lievito l'impasto non cresce: il riposo rilassa il glutine, così la sfoglia si stende sottile senza ritirarsi.",
    nerd: "Il riposo completa l'idratazione della farina e rilassa la maglia glutinica: meno ritorno elastico, sfoglia quasi trasparente.",
  };

  if (bulkMinutes > 0) {
    steps.push({
      id: "bulk",
      title: isUnleavened ? "Riposo" : "Puntata",
      description: isUnleavened
        ? `Lasciare riposare l'impasto coperto a ${fermentTemp}°C`
        : `Lievitazione in massa a ${fermentTemp}°C`,
      duration_minutes: bulkMinutes,
      icon: "clock",
      timing_label: formatDuration(Math.round(bulkMinutes / 60)),
      tip: isUnleavened
        ? restTip
        : fermentTemp <= 6
          ? {
              beginner:
                "In frigo l'impasto cresce lento ma guadagna sapore. Copri bene con pellicola a contatto.",
              nerd: `A ${fermentTemp}°C il modello stima una velocità di fermentazione di ${speedFactorLabel}× rispetto a 18°C. Non è una misura della riduzione FODMAP o della digeribilità.`,
            }
          : {
              beginner:
                "L'impasto deve raddoppiare di volume. Se fa caldo, controlla più spesso!",
              nerd: `A ${fermentTemp}°C la velocità di fermentazione è ${speedFactorLabel}× rispetto al riferimento 18°C.`,
            },
    });
  }

  // ─── STAGLIO (layout-aware: descrizione cambia con pieces_per_unit) ───
  const layout = getLayoutSpec(style);
  const isMultiPiece = (layout.pieces_per_unit ?? 1) > 1;
  const unequalDiscs = style.id === "pizza_fritta_tonda";
  const divideMessage = unequalDiscs
    ? em("timeline.divide.unequalDiscs", METHOD_MESSAGES_IT["timeline.divide.unequalDiscs"])
    : em("timeline.divide.multiPiece", METHOD_MESSAGES_IT["timeline.divide.multiPiece"], { pieces: layout.pieces_per_unit ?? 2 });
  // Teglia/pala/focaccia: staglio delicato senza pirlatura stretta — l'alveolatura
  // costruita in puntata non va sgonfiata (coerente con divide_teglia del CMS).
  const servingUnitForDivide = getServingUnit(style);
  const isGentleDivide =
    !isMultiPiece &&
    (servingUnitForDivide === "teglia" ||
      servingUnitForDivide === "pala" ||
      servingUnitForDivide === "focaccia");
  steps.push({
    id: "divide",
    title: "Staglio",
    ...(isMultiPiece
      ? {
          msg: {
            title: em("timeline.divide.title", "Staglio"),
            description: [
              divideMessage,
            ],
          },
        }
      : {}),
    description: isMultiPiece
      ? renderStepIt([divideMessage])
      : isGentleDivide
        ? "Dividere con delicatezza, senza sgonfiare l'impasto."
        : "Dividere in panetti del peso corretto. Formare pallina.",
    duration_minutes: 15,
    icon: "scissors",
    timing_label: "15 min",
    tip: isGentleDivide
      ? {
          beginner:
            "Mani delicate! Le bolle nell'impasto sono preziose: piega i lembi sotto, senza schiacciare.",
          nerd: "Con idratazione >75% lo staglio aggressivo collassa gli alveoli formati in puntata: tensione minima, degassamento quasi nullo.",
        }
      : {
          beginner:
            "Usa una bilancia! Taglia con un tarocco e arrotonda ogni pezzo in una palla liscia.",
          nerd: "Lo staglio crea tensione superficiale che intrappola CO₂ durante l'appretto e definisce la struttura alveolare finale.",
        },
  });

  /* ─── APPRETTO + PRERISCALDO (audit roleplay giugno 2026, ENG-5) ───
   * Nessuna timeline diceva di ACCENDERE IL FORNO: si infornava a freddo.
   * Il preriscaldo corre in parallelo al riposo dei panetti (piano sopra):
   * il totale resta identico e l'orario del promemoria è esatto. */
  /* Audit totale n. 7: negli stili che lievitano in teglia la stesura viene
   * subito dopo lo staglio e l'appretto si fa nella teglia. */
  const proofInPan = !!style.proof_in_pan && layout.type === "single" && !isUnleavened;
  if (proofInPan) {
    steps.push(
      keyedStep(
        { id: "shape", variant: "pan", duration_minutes: 5, icon: "expand", timing_label: "5 min" },
        em("timeline.shape.title", METHOD_MESSAGES_IT["timeline.shape.title"]),
        [em("timeline.shape.pan", METHOD_MESSAGES_IT["timeline.shape.pan"])],
      ),
    );
  }
  const toppingBeforeProof = injectToppingAt("before_proof");
  const proofMessage = style.method_profile?.id === "apiter_teglia" ? em("timeline.proof.apiter", METHOD_MESSAGES_IT["timeline.proof.apiter"]) : undefined;
  if (proofStepMinutes > 0) {
    steps.push({
      id: "proof",
      ...(proofMessage ? { msg: { description: [proofMessage] } } : {}),
      ...(proofInPan ? { variant: "pan" as const } : {}),
      title: isUnleavened ? "Riposo" : "Appretto",
      description: proofMessage ? renderStepIt([proofMessage]) : isUnleavened
        ? `Lasciare riposare l'impasto coperto a ${Math.max(fermentTemp, PROOF_MIN_TEMP_C)}°C`
        : proofInPan
          ? `Lievitazione finale in teglia a ${Math.max(fermentTemp, PROOF_MIN_TEMP_C)}°C`
          : `Lievitazione finale a ${Math.max(fermentTemp, PROOF_MIN_TEMP_C)}°C`,
      duration_minutes: proofStepMinutes,
      icon: "timer",
      timing_label: formatDuration(Math.round(proofStepMinutes / 60)),
      tip: isUnleavened
        ? restTip
        : {
            beginner:
              "I panetti devono essere morbidi. Se li premi con un dito, tornano su lentamente.",
            nerd: "Poke test: ritorno lento = fermentazione ottimale. Troppo rapido = sotto-lievitato. Nessun ritorno = over-proofed.",
          },
    });
  }

  // Cosa fanno i panetti mentre il forno scalda: finiscono l'appretto (appretto
  // lungo), lo fanno per intero (appretto corto) o riposano (non lievitato).
  const preheatVariant: TimelineStep["variant"] = isUnleavened
    ? "during_rest"
    : preheatDuringProof
      ? undefined
      : "whole_proof";
  const preheatWhile =
    preheatVariant === "during_rest"
      ? "Intanto i panetti riposano."
      : preheatVariant === "whole_proof"
        ? "Intanto i panetti fanno l'appretto."
        : "Intanto i panetti finiscono l'appretto.";
  // M-6: le fritte non vanno in forno: prima si porta l'olio a temperatura.
  if (isFriedStyle(style)) {
    const oilTemp = Math.round(style.baking.temp_c_ideal);
    steps.push({
      id: "preheat",
      variant: "oil",
      title: "Olio a temperatura",
      description: `Scalda l'olio (almeno 5 cm, in una pentola dai bordi alti) a ${oilTemp}°C e controllalo con un termometro. ${preheatWhile}`,
      duration_minutes: preheatMinutes,
      icon: "flame",
      timing_label: `${preheatMinutes} min`,
      tip: {
        beginner: "Sotto i 170°C la pizza assorbe olio e diventa unta; sopra i 190°C si colora fuori e resta cruda dentro.",
        nerd: "Tra 180 e 190°C l'acqua in superficie evapora subito e forma una crosta che limita l'assorbimento d'olio; un panetto alla volta evita che la temperatura crolli.",
      },
    });
  } else steps.push({
    id: "preheat",
    title: "Preriscalda il forno",
    /* Audit n. 8 (C-12): pietra o acciaio servono solo nei forni di casa; il
       forno a legna, a gas e quello elettrico da pizza hanno già la platea. */
    description: `Accendi ora il forno a ${ovenTempForPreheat}°C${preheatMinutes >= 45 && HOME_OVENS.has(equipment?.ovenType ?? "home") ? " (pietra o acciaio già dentro)" : ""}. ${preheatWhile}`,
    duration_minutes: preheatMinutes,
    icon: "flame",
    timing_label: `${preheatMinutes} min`,
    ...(preheatVariant ? { variant: preheatVariant } : {}),
    tip: {
      beginner:
        "Forno ben caldo = base che si stacca e cornicione che spinge. Non avere fretta: aspetta che arrivi a temperatura.",
      nerd: `La massa termica della superficie domina il primo minuto di cottura: ${preheatMinutes} min di soak assicurano che pietra/acciaio siano saturi, non solo l'aria del forno.`,
    },
  });

  // Il metodo domestico ammesso dalla valutazione è parte del procedimento.
  const homeMethod = homeBakingAdaptation(style, equipment?.ovenType ?? "home", actualOvenTemp ?? style.baking.temp_c_ideal);
  if (homeMethod) {
    const preheat = steps.find((step) => step.id === "preheat");
    if (preheat) {
      const message = em("timeline.homeTray.preheat", "Preriscalda il forno al massimo ({temp}) con una teglia capovolta già dentro, finché anche la teglia è ben calda. Intanto termina il riposo dell'impasto.", { temp: actualOvenTemp ?? style.baking.temp_c_ideal });
      preheat.msg = { description: [message] };
      preheat.description = renderStepIt([message]);
    }
  }

  // ─── STESURA (layout-aware) ───
  let shapeMsg: EngineMsg;
  if (layout.type === "folded_layers") {
    shapeMsg = em(
      "timeline.shape.foldedLayers",
      METHOD_MESSAGES_IT["timeline.shape.foldedLayers"],
      { folds: layout.folds ?? 4 },
    );
  } else if (layout.type === "double_thin_sheet") {
    shapeMsg = em("timeline.shape.doubleThinSheet", METHOD_MESSAGES_IT["timeline.shape.doubleThinSheet"]);
  } else if (layout.type === "stacked") {
    shapeMsg = em("timeline.shape.stacked", METHOD_MESSAGES_IT["timeline.shape.stacked"]);
  } else if (layout.type === "closed_stuffed") {
    shapeMsg = isFriedStyle(style)
      ? em("timeline.shape.closedStuffedFried", METHOD_MESSAGES_IT["timeline.shape.closedStuffedFried"])
      : em("timeline.shape.closedStuffed", METHOD_MESSAGES_IT["timeline.shape.closedStuffed"]);
  } else {
    // Layout singolo: nella UI vale il testo del CMS (timelineLabels.shape).
    shapeMsg =
      style.shape.shape_type === "rectangular"
        ? em("timeline.shape.rectangular", METHOD_MESSAGES_IT["timeline.shape.rectangular"])
        : style.crust_type === "crispy_thin"
          ? em("timeline.shape.thin", METHOD_MESSAGES_IT["timeline.shape.thin"])
          : em("timeline.shape.round", METHOD_MESSAGES_IT["timeline.shape.round"]);
  }
  if (style.method_profile?.id === "apiter_teglia") shapeMsg = em("timeline.shape.apiter", METHOD_MESSAGES_IT["timeline.shape.apiter"]);
  if (!proofInPan) steps.push(
    keyedStep(
      {
        id: "shape",
        duration_minutes: layout.type === "folded_layers" ? 10 : 5,
        icon: "expand",
        timing_label: layout.type === "folded_layers" ? "10 min" : "5 min",
      },
      em("timeline.shape.title", METHOD_MESSAGES_IT["timeline.shape.title"]),
      [shapeMsg],
    ),
  );

  // VPL-A1: i pre_prep "just_before_assembly" (es. saltare i funghi, patate in
  // ammollo) NON sono più step separati della timeline: cambiare condimento deve
  // modificare solo lo step "Condimento", non inserire passaggi sopra. Vengono
  // mostrati come note di preparazione dentro lo step Condimento (recipe-output).
  // I pre_prep "hours_before_start" (marinature ore prima) restano schedulati.

  // Topping step in after_shape (es. condimento margherita classica)
  const toppingReplacesGenericTop = injectToppingAt("after_shape");

  // ─── FARCITURA / ASSEMBLAGGIO (layout-aware) ───
  if (layout.type === "stacked" && layout.interlayer === "oil_brush") {
    // Baciata / Marinella: spennellatura olio + sovrapposizione del secondo disco
    steps.push(
      keyedStep(
        { id: "stack", duration_minutes: 3, icon: "layers", timing_label: "3 min" },
        em("timeline.stack.title", "Sovrapposizione"),
        [em("timeline.stack.desc", METHOD_MESSAGES_IT["timeline.stack.desc"])],
        {
          beginner: em("timeline.stack.tipBeginner", METHOD_MESSAGES_IT["timeline.stack.tipBeginner"]),
          nerd: em("timeline.stack.tipNerd", METHOD_MESSAGES_IT["timeline.stack.tipNerd"]),
        },
      ),
    );
    // Topping step in after_stack (es. patate sopra per Patate e Porchetta)
    injectToppingAt("after_stack");
  } else if (layout.type === "closed_stuffed" && layout.filling_timing === "pre_bake_internal") {
    // Ciaccino: ripieno + chiusura sigillata
    const internalFillReplaced = topping?.assembly_steps?.some(
      (s) => s.insert_at === "after_fill_internal" && s.replaces_generic,
    );
    if (!internalFillReplaced) {
      steps.push(
        keyedStep(
          { id: "fill_internal", duration_minutes: 8, icon: "chef-hat", timing_label: "8 min" },
          em("timeline.fillClosed.title", "Ripieno e chiusura"),
          [em("timeline.fillClosed.desc", METHOD_MESSAGES_IT["timeline.fillClosed.desc"])],
          {
            beginner: em("timeline.fillClosed.tipBeginner", METHOD_MESSAGES_IT["timeline.fillClosed.tipBeginner"]),
            nerd: em("timeline.fillClosed.tipNerd", METHOD_MESSAGES_IT["timeline.fillClosed.tipNerd"]),
          },
        ),
      );
    }
    injectToppingAt("after_fill_internal");
  } else if (layout.type === "double_thin_sheet") {
    // Recco: sfoglia inferiore + stracchino + sfoglia superiore
    const internalFillReplaced = topping?.assembly_steps?.some(
      (s) => s.insert_at === "after_fill_internal" && s.replaces_generic,
    );
    if (!internalFillReplaced) {
      steps.push(
        keyedStep(
          { id: "fill_internal", duration_minutes: 5, icon: "chef-hat", timing_label: "5 min" },
          em("timeline.fillSheets.title", "Farcitura tra sfoglie"),
          [em("timeline.fillSheets.desc", METHOD_MESSAGES_IT["timeline.fillSheets.desc"])],
        ),
      );
    } else {
      injectToppingAt("after_fill_internal");
    }
    /* Audit n. 8 (B-23): il passo generico ospita già il condimento scelto;
       aggiungere anche quello del condimento ripeteva la farcitura. */
  } else if (layout.filling_timing === "pre_bake" || layout.cook_mode === "topped") {
    // Default: farcitura pre-cottura classica
    // Se il topping ha già inserito uno step "replaces_generic" in after_shape, non aggiungere il generico
    const toppingAfterBake = topping?.assembly_steps?.some(
      step => step.insert_at === "after_bake" && step.replaces_generic,
    );
    if (!toppingReplacesGenericTop && !toppingAfterBake && !toppingBeforeProof) {
      steps.push({
        id: "top",
        title: "Farcitura",
        description: topping?.name
          ? `Condire con ${topping.name} secondo la ricetta.`
          : "Condire la pizza secondo gusto",
        duration_minutes: 5,
        icon: "chef-hat",
        timing_label: "5 min",
      });
    }
  }
  // Se cook_mode = "white_then_top": niente farcitura ora, va dopo la prima cottura

  // ─── COTTURA (layout-aware: singola o doppia) ───
  // Applica bake_adjustments del topping (es. patate richiedono +5 min)
  const baseTempC = actualOvenTemp ?? style.baking.temp_c_ideal;
  const ovenTempLabel = Math.min(baseTempC, Math.round(baseTempC + (topping?.bake_adjustments?.temperature_delta_c ?? 0)));
  const effectiveCookSec = cookTimeSec + (topping?.bake_adjustments?.additional_minutes ?? 0) * 60;
  // Nota di cottura del condimento: la UI la traduce dall'id del condimento.
  const toppingBakeNote: EngineMsg[] = topping?.bake_adjustments?.note
    ? [em("topping.bakeNote", topping.bake_adjustments.note, { toppingId: topping.id })]
    : [];
  if (layout.cook_mode === "white_then_top") {
    // Baciata: cottura in bianco
    const firstBakeMin = Math.max(8, Math.round((effectiveCookSec / 60) * 0.65));
    const secondBakeMin = Math.max(3, Math.ceil(effectiveCookSec / 60) - firstBakeMin);
    steps.push(
      keyedStep(
        { id: "bake", duration_minutes: firstBakeMin, icon: "flame", timing_label: `${firstBakeMin} min` },
        em("timeline.bakeWhite.title", "Prima cottura (in bianco)"),
        [
          em("timeline.bakeWhite.desc", METHOD_MESSAGES_IT["timeline.bakeWhite.desc"], { temp: ovenTempLabel }),
          ...toppingBakeNote,
          ovenBakeSetup(equipment),
        ],
        {
          beginner: em("timeline.bakeWhite.tipBeginner", METHOD_MESSAGES_IT["timeline.bakeWhite.tipBeginner"]),
          nerd: em("timeline.bakeWhite.tipNerd", METHOD_MESSAGES_IT["timeline.bakeWhite.tipNerd"]),
        },
      ),
    );
    injectToppingAt("after_bake");
    const splitReplaced = injectToppingAt("after_split_fill");
    if (!splitReplaced) {
      steps.push(
        keyedStep(
          { id: "split_fill", duration_minutes: 7, icon: "scissors", timing_label: "7 min" },
          em("timeline.splitFill.title", "Sdoppiamento e farcitura"),
          [em("timeline.splitFill.desc", METHOD_MESSAGES_IT["timeline.splitFill.desc"])],
          {
            beginner: em("timeline.splitFill.tipBeginner", METHOD_MESSAGES_IT["timeline.splitFill.tipBeginner"]),
            nerd: em("timeline.splitFill.tipNerd", METHOD_MESSAGES_IT["timeline.splitFill.tipNerd"]),
          },
        ),
      );
    }
    steps.push(
      keyedStep(
        { id: "bake2", duration_minutes: secondBakeMin, icon: "flame", timing_label: `${secondBakeMin} min` },
        em("timeline.bake2.title", "Seconda cottura (breve)"),
        [em("timeline.bake2.desc", METHOD_MESSAGES_IT["timeline.bake2.desc"], { temp: ovenTempLabel })],
      ),
    );
    injectToppingAt("after_bake2");
  } else {
    // Cottura singola classica (M-6: frittura per gli stili fritti)
    if (isFriedStyle(style)) {
      const oilTemp = Math.round(style.baking.temp_c_ideal);
      steps.push({
        id: "bake",
        variant: "fry",
        title: "Frittura",
        description: `Friggi una pizza alla volta a ${oilTemp}°C per ${formatCookTime(effectiveCookSec)}, girandola a metà con una schiumarola. Scolala su carta assorbente.`,
        duration_minutes: Math.max(1, Math.ceil(effectiveCookSec / 60)),
        icon: "flame",
        timing_label: formatCookTime(effectiveCookSec),
        tip: {
          beginner: "Fai scivolare la pizza nell'olio allontanandola da te e bagnala in superficie con un cucchiaio d'olio caldo: si gonfia in modo uniforme.",
          nerd: "Il vapore interno gonfia il disco nei primi secondi; girarla a metà uniforma la crosta e la cottura del ripieno.",
        },
      });
    } else steps.push(
      keyedStep(
        {
          id: "bake",
          duration_minutes: Math.ceil(effectiveCookSec / 60),
          icon: "flame",
          timing_label: formatCookTime(effectiveCookSec),
        },
        em("timeline.bake.title", "Cottura"),
        [em("timeline.bake.desc", "Cuocere a {temp}.", { temp: ovenTempLabel }), ...toppingBakeNote, homeMethod
          ? em("timeline.homeTray.bake", METHOD_MESSAGES_IT["timeline.homeTray.bake"])
          : ovenBakeSetup(equipment)],
        {
          beginner: em("timeline.bake.tipBeginner", METHOD_MESSAGES_IT["timeline.bake.tipBeginner"]),
          nerd: em(
            "timeline.bake.tipNerd",
            METHOD_MESSAGES_IT["timeline.bake.tipNerd"],
            { temp: ovenTempLabel },
          ),
        },
      ),
    );

    // Farcitura post-cottura esterna (es. Marinella ma non sdoppiata)
    if (layout.filling_timing === "post_bake_external") {
      steps.push(
        keyedStep(
          { id: "top_post", duration_minutes: 3, icon: "chef-hat", timing_label: "3 min" },
          em("timeline.topPost.title", "Farcitura post-cottura"),
          [em("timeline.topPost.desc", METHOD_MESSAGES_IT["timeline.topPost.desc"])],
        ),
      );
    }
    injectToppingAt("after_bake");
  }

  const heatStep = steps.find(step => step.id === "preheat");
  if (heatStep && heatStep.duration_minutes > 0) {
    heatStep.parallel_activity = { kind: isUnleavened ? "rest" : "proof", duration_minutes: heatStep.duration_minutes, included_in_fermentation: true };
    heatStep.description += " " + renderStepIt([passiveActivityMessage(heatStep)!]);
  }

  // D-050: pizze e teglie si cuociono una alla volta, quindi la cottura si
  // ripete. Prima il passo valeva per una sola pizza e il piano finiva prima
  // del vero (verifica di GPT, 24/10/2026).
  if (bakeRounds > 1) {
    // Secondi di una cottura: quelli veri per la cottura singola (75 s, non
    // «1 min» arrotondato: verifica di GPT), i minuti del passo per la baciata.
    const hasSecondBake = steps.some((step) => step.id === "bake2");
    for (const step of steps) {
      if (step.id !== "bake" && step.id !== "bake2") continue;
      const perRoundSec = step.id === "bake" && !hasSecondBake ? effectiveCookSec : step.duration_minutes * 60;
      // La pianificazione in minuti non deve finire prima dei secondi reali.
      step.duration_minutes = Math.max(1, Math.ceil((perRoundSec * bakeRounds) / 60));
      step.rounds = bakeRounds;
      step.timing_label = `${bakeRounds} × ${formatCookTime(perRoundSec)}`;
      if (step.msg?.description) {
        step.msg.description = [
          ...step.msg.description,
          em("timeline.bake.rounds", "{n} cotture da {sec} s, una alla volta.", { n: bakeRounds, sec: perRoundSec }),
        ];
        step.description = renderStepIt(step.msg.description);
      }
    }
  }

  // Modello esplicito e prudente: un operatore, lavorazioni per unità
  // sequenziali, poi tutte le cotture. Non presumiamo sovrapposizioni di servizio.
  const firstShape = steps.findIndex(step => step.id === "shape");
  if (bakeRounds > 1 && firstShape >= 0) {
    for (const step of steps.slice(firstShape)) {
      if (["proof", "preheat", "bake", "bake2"].includes(step.id) || step.duration_minutes <= 0) continue;
      step.minutes_per_unit = step.duration_minutes;
      step.work_units = bakeRounds;
      step.duration_minutes *= bakeRounds;
      step.timing_label = `${bakeRounds} × ${step.minutes_per_unit} min`;
    }
  }
  return steps;
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
}

function formatCookTime(seconds: number): string {
  if (seconds < 120) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

function generateTips(
  style: PizzaStyle,
  hydration: number,
  flourW: number,
  ovenTemp: number,
  constraints: UserConstraints,
): string[] {
  const tips: string[] = [];

  if (hydration > 75) {
    tips.push(
      "Con idratazione alta, usare la tecnica delle pieghe (stretch & fold) ogni 30 minuti nelle prime 2 ore.",
    );
  }

  if (ovenTemp < style.baking.temp_c_ideal) {
    tips.push(
      `Temperatura compensata: preriscaldare il forno almeno 45 minuti. ${constraints.has_pizza_steel ? "L'acciaio per pizza migliorerà la crosta." : constraints.has_pizza_stone ? "La pietra refrattaria aiuterà la cottura." : "Considera una pietra refrattaria o piastra in acciaio."}`,
    );
  }

  if (style.crust_type === "leopard_soft") {
    tips.push(
      "Per la leopardatura: il forno deve essere ben caldo e la pizza deve toccare direttamente la superficie calda.",
    );
  }

  if (constraints.oven_heat_profile === "gas_rear" || constraints.oven_heat_profile === "wood_side_flame") {
    tips.push(
      "La sorgente di calore e laterale/posteriore: prepara la pala per ruotare spesso la pizza, non aspettare che un lato sia gia scuro.",
    );
  }

  if (style.dough.process_type.includes("no_knead")) {
    tips.push(
      "Non impastare! Mescolare con spatola fino a idratare, poi pieghe a intervalli regolari.",
    );
  }

  if (flourW > 320) {
    tips.push(
      "Con farine forti (W>320), l'impasto richiede più tempo per rilassarsi. Pazienza nella stesura.",
    );
  }

  if (style.shape.shape_type === "rectangular") {
    tips.push(
      "Oliare bene la teglia. Stendere con le dita partendo dal centro verso i bordi.",
    );
  }

  // Topping tip from parametric database (Audit recommendation: topping awareness)
  const toppingInfo = getToppingByStyle(style.id);
  if (toppingInfo) {
    if (toppingInfo.saucePosition === "sopra") {
      tips.push(
        `Condimento: ordine invertito per ${style.name}. ${toppingInfo.note}`,
      );
    } else if (toppingInfo.cheesePosition === "interno") {
      tips.push(
        `Formaggio: ${toppingInfo.cheeseType} — ${toppingInfo.note}`,
      );
    } else if (toppingInfo.cheeseType !== "Nessuno" && ovenTemp < 300) {
      tips.push(
        `Con forno <300°C e ${toppingInfo.cheeseType}: aggiungere il formaggio negli ultimi 3-5 minuti per evitare bruciature.`,
      );
    }
  }

  return tips;
}

// ═══ OVEN PRESETS ═══

export const OVEN_PRESETS: {
  id: OvenType;
  name: string;
  maxTemp: number;
  icon: string;
}[] = [
  {
    id: "home",
    name: "Forno Domestico",
    maxTemp: 250,
    icon: "home",
  },
  {
    id: "electric_standard",
    name: "Elettrico Standard",
    maxTemp: 300,
    icon: "zap",
  },
  {
    // D-021 (decisione di Matteo, 24/10/2026): due forni a gas. Questo è il
    // forno a platea: 350 °C è un valore da verificare (docs/fonti-dati.md §3.1).
    id: "gas",
    name: "Forno a gas a platea",
    maxTemp: 350,
    icon: "flame",
  },
  {
    id: "electric_high",
    name: "Elettrico alta temperatura",
    maxTemp: 450,
    icon: "thermometer",
  },
  {
    // Forno a gas da pizza (portatile): Ooni 2026, Koda 16 «può raggiungere i 500 °C».
    id: "gas_pizza",
    name: "Forno a gas da pizza",
    maxTemp: 500,
    icon: "flame",
  },
  {
    id: "wood",
    name: "Forno a Legna",
    maxTemp: 500,
    icon: "flame-kindling",
  },
  {
    id: "coal",
    name: "Forno a carbone",
    // Valore iniziale dal range di lavoro del modello Apizza, da sostituire
    // con la temperatura effettiva della propria dotazione; non è un massimo
    // universale dei forni a carbone. Fonte identità: sallysapizza.com/experience/.
    maxTemp: 400,
    icon: "flame",
  },
];

export const SKILL_LEVELS: {
  level: SkillLevel;
  name: string;
  description: string;
}[] = [
  {
    level: 1,
    name: "Principiante",
    description: "Non ho mai impastato",
  },
  {
    level: 2,
    name: "Intermedio",
    description: "Ho già fatto qualche pizza",
  },
  {
    level: 3,
    name: "Avanzato",
    description: "Gestisco pieghe e lievitazioni",
  },
  {
    level: 4,
    name: "Esperto",
    description: "Adatto impasti, tempi e tecniche",
  },
];

// ═══ STYLE RECOMMENDATION ENGINE ═══

export interface StyleRecommendation {
  style: PizzaStyle;
  compatibilityScore: number;
  feasibilityScore: number;
  digestibilityEstimate: number;
  /** Score effettivo usato per ordinare la lista, inclusi piccoli prior iconici. */
  rankingScore: number;
  tier: "perfect" | "good" | "challenging" | "not_feasible";
  reasons: EngineMsg[];
  warnings: EngineMsg[];
  /** Esito della ricetta con gli stessi vincoli, compresa la scadenza del pasto. */
  verdict: RecipeVerdict;
  recipe: GeneratedRecipe;
  dietary_alternatives?: DietaryRecipeAlternative[];
  /** Audit role-play giugno 2026: composite della ricetta OTTIMIZZATA per i vincoli
   *  dell'utente — il punteggio che otterrai davvero aprendo lo stile. Popolato
   *  dalla UI (recommended-styles) via optimizeRecipe; il ranking/tier resta sulla
   *  compatibilità, ma il badge mostra questo. */
  optimizedComposite?: number;
}

export type MealKind = "lunch" | "dinner";

export interface TimeSlot {
  id: string;
  /** Etichetta di riserva in italiano: la UI la ricompone per lingua da `meal`
   *  e `dayOffset` (vedi features/recipe/time-slot-text.ts). */
  label: string;
  sublabel: string;
  /** Ore fino al pasto, al quarto d'ora per difetto (M-2): la finestra non
   *  supera mai il tempo reale. */
  hours: number;
  emoji: string;
  /** Pasto e giorno (0 = oggi). Assenti per lo slot «Nessuna preferenza». */
  meal?: MealKind;
  dayOffset?: number;
  /** U-2: istante esatto del pasto (epoch ms) per l'orario scelto a mano. */
  targetAt?: number;
}

/* ═══ VPL-065: Dynamic time slots based on current time ═══
 * Calculates real hours remaining until each eating moment.
 * Drops slots that are too close (<3h) or already passed.
 * Adds "no preference" virtual slot (uses 24h default). */

const MEAL_TARGETS = [
  { id: "tonight", meal: "dinner", emoji: "🌙", dayOffset: 0 },
  { id: "tomorrow_lunch", meal: "lunch", emoji: "☀️", dayOffset: 1 },
  { id: "tomorrow_dinner", meal: "dinner", emoji: "🌆", dayOffset: 1 },
  { id: "day_after_lunch", meal: "lunch", emoji: "📅", dayOffset: 2 },
  { id: "long_ferment", meal: "lunch", emoji: "🕐", dayOffset: 3 },
] as const;

const MEAL_HOURS: Record<MealKind, number> = { lunch: 12.5, dinner: 20 };
const MIN_PREP_HOURS = 3;

/** M-2 — ore al quarto d'ora per difetto. Il margine assorbe l'errore in
 *  virgola mobile (3,7499999 → 3,75, non 3,5). */
export function floorToQuarterHour(hours: number): number {
  return Math.floor(hours * 4 + 1e-9) / 4;
}

function formatHoursLabel(h: number): string {
  // Difensivo: se il calcolo dà un valore negativo (slot nel passato), skip.
  if (h <= 0) return "passato";
  const whole = Math.floor(h);
  const minutes = Math.round((h - whole) * 60);
  if (whole === 0) return `${minutes} min`;
  return minutes === 0 ? `${whole} h` : `${whole} h ${minutes} min`;
}

function getDayLabel(dayOffset: number, meal: string, now: Date): string {
  const weekday = now.getDay();
  const DAYS_IT = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  if (dayOffset === 0) return "Stasera";
  if (dayOffset === 1) return meal === "lunch" ? "Domani a pranzo" : "Domani sera";
  const targetDay = DAYS_IT[(weekday + dayOffset) % 7];
  return meal === "lunch" ? `${targetDay} a pranzo` : `${targetDay} sera`;
}

/* ═══ U-2: partire dalla farina che si ha («ho 750 g di farina») ═══
 * Le masse sono lineari nei panetti: la farina per panetto della ricetta
 * corrente dà quanti panetti ci stanno. Il numero esatto si rilegge dalla
 * ricetta rigenerata dopo aver scelto i panetti. */
/** Forni senza platea propria: pietra o acciaio si aggiungono a parte. */
const HOME_OVENS: ReadonlySet<OvenType> = new Set(["home", "electric_standard"]);

/** D-043: fino a 200 unità (un impasto da laboratorio); prima 20. */
export const MAX_DOUGH_BALLS = 200;
export function normalizeDoughBallCount(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(MAX_DOUGH_BALLS, Math.round(value))) : 1;
}

export interface FlourBudgetFit {
  balls: number;
  /** Farina usata, stimata (±1 g di arrotondamento). */
  flour_g: number;
  leftover_g: number;
  /** Farina per un panetto: il minimo per farne uno. */
  per_ball_g: number;
}

export function doughBallsForFlour(recipe: GeneratedRecipe, flourBudgetG: number): FlourBudgetFit {
  const perBall = recipe.dough_balls > 0 ? recipe.flour_g / recipe.dough_balls : recipe.flour_g;
  const budget = Number.isFinite(flourBudgetG) ? Math.max(0, flourBudgetG) : 0;
  const balls = perBall > 0 ? Math.min(MAX_DOUGH_BALLS, Math.floor(budget / perBall + 1e-9)) : 0;
  const flour = Math.round(perBall * balls);
  return { balls, flour_g: flour, leftover_g: Math.max(0, Math.round(budget - flour)), per_ball_g: Math.ceil(perBall) };
}

/* ═══ U-2: orario del pasto scelto a mano («si cena sabato alle 20») ═══ */
export const CUSTOM_SLOT_ID = "custom";
/** Sotto 1 h non c'è nulla da preparare; oltre 7 giorni nessuno stile serve. */
export const CUSTOM_SLOT_MIN_HOURS = 1;
export const CUSTOM_SLOT_MAX_HOURS = 7 * 24;

/** Slot per un orario preciso: ore al quarto d'ora per difetto, come gli altri
 *  slot (M-2). `null` se l'orario è troppo vicino o troppo lontano. */
export function customMealSlot(target: Date, now: Date = new Date()): TimeSlot | null {
  const hours = floorToQuarterHour((target.getTime() - now.getTime()) / 3_600_000);
  if (!(hours >= CUSTOM_SLOT_MIN_HOURS && hours <= CUSTOM_SLOT_MAX_HOURS)) return null;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayOffset = Math.round((startOfDay(target) - startOfDay(now)) / 86_400_000);
  const hh = String(target.getHours()).padStart(2, "0");
  const mm = String(target.getMinutes()).padStart(2, "0");
  return {
    id: CUSTOM_SLOT_ID,
    label: `${getDayLabel(dayOffset, target.getHours() < 16 ? "lunch" : "dinner", now)} · ${hh}:${mm}`,
    sublabel: formatHoursLabel(hours),
    hours,
    emoji: "🗓️",
    dayOffset,
    targetAt: target.getTime(),
  };
}

/** No-preference virtual slot: 0 means no user-imposed time limit. */
export const NO_PREFERENCE_SLOT: TimeSlot = {
  id: "no_preference",
  label: "Nessuna preferenza",
  sublabel: `ci pensa ${BRAND.name}`,
  hours: 0,
  emoji: "⏳",
};

/** Il momento consigliato: quello più vicino alle 24 h di lievitazione.
 *  D-036: è il momento con cui partono i consigli, senza chiederlo prima. */
export function suggestedTimeSlot(now: Date = new Date()): TimeSlot | null {
  const slots = generateTimeSlots(now);
  let best: TimeSlot | null = null;
  for (const slot of slots) {
    if (!best || Math.abs(slot.hours - 24) < Math.abs(best.hours - 24)) best = slot;
  }
  return best;
}

export function generateTimeSlots(now: Date = new Date()): TimeSlot[] {
  const slots: TimeSlot[] = [];
  // Il giorno locale può durare 23 o 25 ore: il pasto è un istante, non
  // dayOffset * 24 (al cambio d'ora la finestra risultava sbagliata di un'ora).
  const hoursToMeal = (dayOffset: number, mealHour: number) => {
    const target = new Date(now);
    target.setDate(target.getDate() + dayOffset);
    target.setHours(Math.floor(mealHour), Math.round((mealHour % 1) * 60), 0, 0);
    return floorToQuarterHour((target.getTime() - now.getTime()) / 3_600_000);
  };

  for (const target of MEAL_TARGETS) {
    const mealHour = MEAL_HOURS[target.meal];
    const hoursUntil = hoursToMeal(target.dayOffset, mealHour);

    if (hoursUntil < MIN_PREP_HOURS) continue;
    if (slots.length >= 4) break;

    slots.push({
      id: target.id,
      label: getDayLabel(target.dayOffset, target.meal, now),
      sublabel: formatHoursLabel(hoursUntil),
      hours: hoursUntil,
      emoji: target.emoji,
      meal: target.meal,
      dayOffset: target.dayOffset,
      targetAt: (() => { const at = new Date(now); at.setDate(at.getDate() + target.dayOffset); at.setHours(Math.floor(mealHour), Math.round(mealHour % 1 * 60), 0, 0); return at.getTime(); })(),
    });
  }

  if (slots.length === 0) {
    const hoursUntil = hoursToMeal(1, MEAL_HOURS.lunch);
    slots.push({
      id: "tomorrow_lunch",
      label: "Domani a pranzo",
      sublabel: formatHoursLabel(hoursUntil),
      hours: hoursUntil,
      emoji: "☀️",
      meal: "lunch",
      dayOffset: 1,
    });
  }

  return slots;
}

/* ═══ VPL-066: Kitchen temperature model ═══
 * Indoor homes are heated/cooled — outdoor temp barely matters.
 * Default: 21°C (typical European heated home).
 * Only deviate in extreme heat when AC is uncommon. */

export const DEFAULT_KITCHEN_TEMP = 21;

/**
 * Recipe data schema version (Notion Pag.09 TODO: versioning 1.3→1.4).
 *
 * Changelog:
 *   1.0 — Initial: 9 styles, basic scoring
 *   1.1 — P/L alveografico, Q10 variabile, 5 compensazioni
 *   1.2 — 15 stili, sustainability score, deviation_tags
 *   1.3 — CMS i18n, parametric databases, flour database v3
 *   1.4 — deviation_signature tracking, E-Score enhanced, Regola 55,
 *          engineMessages i18n, effective_deviation_score, compensation_deviation_points
 */
export const RECIPE_SCHEMA_VERSION = "1.4" as const;



export function outdoorToKitchenTemp(outdoor: number): number {
  if (outdoor <= 25) return Math.round(Math.max(19, Math.min(23, 21 + (outdoor - 15) * 0.1)));
  return Math.round(Math.min(outdoor - 2, 30));
}

/** Prior di rappresentatività: punti extra per gli stili iconici che il
 * pubblico riconosce. Le rarità regionali (Ciaccino, Scaccia, Fugazzeta...)
 * restano consigliabili ma non scavalcano i classici a parità di punteggio. */
const ICONIC_BOOST: Record<string, number> = {
  napoletana_stg: 6,
  teglia_romana: 6,
  tonda_romana: 5,
  new_york: 5,
  napoletana_canotto: 4,
  focaccia_genovese: 4,
  pinsa_romana: 3,
  detroit: 3,
  pala_romana: 3,
  padellino_torino: 2,
  chicago_deep: 2,
  calzone_napoletano: 2,
  pizza_montanara: 2,
};

/** M-10 — stili che con gli stessi vincoli danno una ricetta fattibile,
 *  i più simili per primi (forma, crosta, famiglia, spessore), poi nell'ordine dei
 *  consigli. Le pizze fritte si propongono solo al posto di una fritta: è un
 *  altro metodo di cottura. Serve all'esito «non fattibile così». */
const ALTERNATIVE_OVEN_HEADROOM = 1.1;

export function feasibleAlternativeStyles(
  current: PizzaStyle,
  constraints: UserConstraints,
  limit = 3,
  stylesOverride?: Record<string, PizzaStyle>,
): PizzaStyle[] {
  const similarity = (style: PizzaStyle) =>
    (style.shape.shape_type === current.shape.shape_type ? 2 : 0) +
    (style.crust_type === current.crust_type ? 2 : 0) +
    (style.family === current.family ? 1 : 0) +
    // Spessore: fino a 2 punti, zero oltre 0,3 di differenza.
    2 * Math.max(0, 1 - Math.abs(style.shape.thickness_factor - current.shape.thickness_factor) / 0.3);
  const candidates = recommendStyles(constraints, stylesOverride)
    .filter(
      (rec) =>
        rec.style.id !== current.id &&
        rec.tier !== "not_feasible" &&
        isFriedStyle(rec.style) === isFriedStyle(current) &&
        /* Audit n. 9 (B-17): un'alternativa deve stare nel tuo forno: il suo
           minimo al massimo il 10 % sopra la tua temperatura (quanto recupera
           una pietra ben scaldata), non 300–380 °C con un forno da 250. */
        (isFriedStyle(rec.style) || rec.style.baking.temp_c_range[0] <= constraints.oven_max_temp_c * ALTERNATIVE_OVEN_HEADROOM),
    )
    .map((rec, rank) => ({ style: rec.style, rank, similarity: similarity(rec.style) }))
    .sort((x, y) => y.similarity - x.similarity || x.rank - y.rank);
  const alternatives: PizzaStyle[] = [];
  for (const { style } of candidates) {
    if (alternatives.length >= limit) break;
    if (generateRecipe(style, constraints).verdict.outcome === "not_feasible") continue;
    alternatives.push(style);
  }
  return alternatives;
}

export interface DietaryRecipeAlternative {
  topping_id: string;
  omitted_conflicts: string[];
  removed: string[];
  added: string[];
  recipe: GeneratedRecipe;
}

/** A proposal is a complete, existing topping recipe, not a text-only omission.
 * Only style-supported toppings are considered. Dough, equipment, exclusions
 * and deadline are evaluated again; structural ingredients are never swapped. */
export function dietaryRecipeAlternatives(recipe: GeneratedRecipe, constraints: UserConstraints,
  rebuild?: (style: PizzaStyle) => GeneratedRecipe): DietaryRecipeAlternative[] {
  const conflicts = recipe.verdict.blockers.filter(b => b.kind === "dietary_conflict");
  if (!conflicts.length || constraints.dietary_filters.includes("gluten_free")) return [];
  const current = recipe.style.default_topping_ref ? getToppingForStyle(recipe.style.default_topping_ref, recipe.style) : undefined;
  if (!current) return [];
  const build = rebuild ?? ((style: PizzaStyle) => generateRecipe(style, constraints, {
    customHydration: recipe.hydration_pct, customFlourW: recipe.flour_w,
    customFlourPL: recipe.flour_pl, customFermentationHours: recipe.fermentation_hours,
    customFermentationTempC: recipe.fermentation_temp_c, usePreFerment: recipe.has_pre_ferment,
    customSalt: recipe.baker_pcts?.salt, customFlourBlend: recipe.flour_blend,
    panConfig: recipe.pan_config,
    preFerment: { type: recipe.pre_ferment_type === "biga" || recipe.pre_ferment_type === "poolish" ? recipe.pre_ferment_type : undefined, flourPct: recipe.pre_ferment_flour_pct },
  }));
  const names = (t: ToppingRecipe) => t.ingredients.filter(i => i.amount.value > 0).map(i => i.name);
  const before = names(current);
  const seen = new Set<string>();
  return getRecipesByAuthenticity(recipe.style).flatMap(({ recipe: topping }) => {
    if (topping.id === current.id || seen.has(topping.concept_ref)) return [];
    const candidate = build({ ...recipe.style, default_topping_ref: topping.id });
    if (getToppingForStyle(candidate.style.default_topping_ref ?? "", candidate.style)?.id !== topping.id) return [];
    if (candidate.verdict.outcome === "not_feasible" || candidate.dietary_warnings?.some(w =>
      (w.filterId === "vegan" || w.filterId === "lactose_free") && w.severity !== "info")) return [];
    const after = names(topping);
    const omitted = [...new Set(conflicts.flatMap(b => b.ingredients))];
    if (omitted.some(name => after.includes(name))) return [];
    seen.add(topping.concept_ref);
    return [{ topping_id: topping.id, omitted_conflicts: omitted,
      removed: before.filter(n => !after.some(a => pantryIngredientId(a) === pantryIngredientId(n))),
      added: after.filter(n => !before.some(b => pantryIngredientId(b) === pantryIngredientId(n))), recipe: candidate }];
  }).sort((a, b) => a.removed.length + a.added.length - b.removed.length - b.added.length).slice(0, 2);
}

export function recommendStyles(
  constraints: UserConstraints,
  stylesOverride?: Record<string, PizzaStyle>,
  recWeights?: RecWeightsOverride,
  recipeForStyle: (style: PizzaStyle, constraints: UserConstraints) => GeneratedRecipe = generateRecipe,
): StyleRecommendation[] {
  constraints = { ...constrainOvenToCapacity(constraints), available_hours: floorToQuarterHour(constraints.available_hours) };
  const weights = {
    time: recWeights?.time ?? 0.25,
    oven: recWeights?.oven ?? 0.25,
    skill: recWeights?.skill ?? 0.20,
    equipment: recWeights?.equipment ?? 0.10,
    pantry: recWeights?.pantry ?? 0.20,
  };
  const weightTotal = Object.values(weights).reduce((sum, weight) => sum + weight, 0) || 1;
  const pantryRanges = constraints.pantry_flours.map((id) => pantryFlourRange(constraints, id)).filter((range): range is [number, number] => Boolean(range));

  return Object.values(stylesOverride ?? STYLES_DB).map((style): StyleRecommendation => {
    const recipe = recipeForStyle(style, constraints);
    const { verdict } = recipe;
    const reasons: EngineMsg[] = [];
    const timeLimited = verdict.blockers.some((b) => b.kind === "time_window" || b.kind === "fermentation_too_short");
    const ovenLimited = verdict.blockers.some((b) => b.kind === "oven_too_cold");
    const skillLimited = verdict.adaptations.some((m) => /hydration|prefermentNeedsExperience/i.test(m.key));
    const equipmentLimited = verdict.conditions?.some(c => c.kind === "pan" || c.kind === "deck") ?? false;
    const flourLimited = verdict.conditions?.some(c => c.kind === "flour" && c.status === "missing") ?? false;
    const [fMin, fMax] = style.dough.fermentation_hours_range;
    if (!timeLimited) {
      reasons.push(em("rec.timeCompatible", "Fermentazione {fMin}–{fMax}h: compatibile con il tuo tempo", { fMin, fMax }));
    }
    if (isFriedStyle(style)) {
      reasons.push(em("rec.fried", METHOD_MESSAGES_IT["rec.fried"]));
    } else if (constraints.oven_max_temp_c >= style.baking.temp_c_ideal) {
      reasons.push(em("rec.ovenIdeal", METHOD_MESSAGES_IT["rec.ovenIdeal"], { ideal: style.baking.temp_c_ideal }));
    }
    if (!skillLimited && style.suitable_for_beginner) {
      reasons.push(em("rec.skillMatch", "Adatto al tuo livello"));
    }
    const flourMatch = pantryRanges.some(([lo, hi]) => lo <= recipe.flour_w && recipe.flour_w <= hi);
    const mix = !flourMatch ? pantryFlourMix(constraints.pantry_flours, [recipe.flour_w, recipe.flour_w], true, constraints.pantry_flour_details) : null;
    if (flourMatch && !verdict.conditions?.some(c => c.kind === "flour")) reasons.push(em("rec.flourMatch", "Farina in dispensa compatibile"));
    else if (mix) reasons.push(em("rec.flourMix", METHOD_MESSAGES_IT["rec.flourMix"], { ...mix, weak: constraints.pantry_flour_details?.[mix.weak]?.name ?? mix.weak, strong: constraints.pantry_flour_details?.[mix.strong]?.name ?? mix.strong }));

    // Il numero ordina le proposte, ma non può cambiare l'esito della ricetta.
    const timeScore = timeLimited ? 25 : 95;
    const ovenScore = ovenLimited ? 0 : isFriedStyle(style) || constraints.oven_max_temp_c >= style.baking.temp_c_ideal ? 95 : 65;
    const skillScore = skillLimited ? 50 : 95;
    const equipScore = equipmentLimited ? 40 : 95;
    const pantryScore = flourLimited ? 30 : flourMatch ? 95 : mix ? 85 : 80;
    const score = Math.round((timeScore * weights.time + ovenScore * weights.oven +
      skillScore * weights.skill + equipScore * weights.equipment + pantryScore * weights.pantry) / weightTotal);
    return {
      style,
      compatibilityScore: score,
      feasibilityScore: recipe.scores.feasibility,
      digestibilityEstimate: recipe.scores.digestibility,
      rankingScore: score + (ICONIC_BOOST[style.id] ?? 0),
      tier: verdict.outcome === "not_feasible" ? "not_feasible" : verdict.outcome === "warnings" ? "good" : "perfect",
      reasons,
      warnings: verdict.adaptations,
      verdict,
      recipe,
      dietary_alternatives: dietaryRecipeAlternatives(recipe, constraints, s => recipeForStyle(s, constraints)),
    };
  }).sort((a, b) => b.rankingScore - a.rankingScore || b.compatibilityScore - a.compatibilityScore);
}

// ═══ SUSTAINABILITY CALCULATION ═══

function calculateSustainabilityScore(
  style: PizzaStyle,
  ovenTemp: number,
  cookTimeSec: number,
  fermentationTempC: number,
  yeastType: "fresh" | "dry" | "sourdough",
): { score: number; category: string; claims: EngineMsg[] } {
  const claims: EngineMsg[] = [];

  // ── Energy axis (30%): lower oven temp relative to style = more efficient ──
  let ovenEfficiency: number;
  if (ovenTemp <= style.baking.temp_c_range[0]) {
    ovenEfficiency = 95; // below minimum = less energy, though maybe not ideal
  } else if (ovenTemp <= style.baking.temp_c_ideal) {
    // Proportional: closer to minimum = better
    const range =
      style.baking.temp_c_ideal - style.baking.temp_c_range[0];
    const position = ovenTemp - style.baking.temp_c_range[0];
    ovenEfficiency = 95 - (position / Math.max(1, range)) * 25;
  } else {
    ovenEfficiency = 60; // above ideal = wasting energy
  }
  // Normalize: 250°C home oven is more sustainable than 485°C wood
  const tempNorm = Math.max(0, 1 - (ovenTemp - 200) / 300);
  ovenEfficiency = ovenEfficiency * 0.5 + tempNorm * 100 * 0.5;

  // Correlazione con cookTime (ADV-06): se il tempo di cottura raddoppia rispetto all'ideale
  // per deficit termico, l'efficienza reale del forno diminuisce a causa dell'esposizione prolungata.
  const cookRatio = cookTimeSec / style.baking.cook_time_sec_ideal;
  if (cookRatio > 2) {
    const reduction = Math.min(40, (cookRatio - 2) * 15);
    ovenEfficiency = Math.max(10, ovenEfficiency - reduction);
  }

  // ── Cook time axis (25%): shorter = less energy ──
  let cookEfficiency: number;
  if (cookTimeSec <= 180) {
    cookEfficiency = 95; // very short cook
    claims.push(em("sust.quickCook", METHOD_MESSAGES_IT["sust.quickCook"]));
  } else if (cookTimeSec <= 600) {
    cookEfficiency = 80;
  } else if (cookTimeSec <= 1200) {
    cookEfficiency = 60;
  } else {
    cookEfficiency = 40;
    claims.push(em("sust.longCook", METHOD_MESSAGES_IT["sust.longCook"]));
  }

  // ── Fermentation efficiency (20%): ambient temp = no fridge energy ──
  let ferEfficiency: number;
  if (fermentationTempC >= 18 && fermentationTempC <= 26) {
    ferEfficiency = 95;
    claims.push(em("sust.ambientFerment", METHOD_MESSAGES_IT["sust.ambientFerment"]));
  } else if (fermentationTempC <= 4) {
    ferEfficiency = 55;
  } else {
    ferEfficiency = 70;
  }

  // ── Ingredient simplicity (15%): fewer additives ──
  let ingredientScore = 80;
  if (!style.allows_additives) {
    ingredientScore = 95;
    // La frase elenca gli ingredienti: solo se sono davvero quelli (non la
    // Recco, senza lievito e con olio).
    if (!style.dough.unleavened && style.dough.oil_pct === 0 && style.dough.sugar_pct === 0) {
      claims.push(em("sust.pureDough", METHOD_MESSAGES_IT["sust.pureDough"]));
    }
  } else if (
    style.dough.oil_pct > 0 &&
    style.dough.sugar_pct > 0
  ) {
    ingredientScore = 55;
  }

  // ── Yeast type (10%): sourdough = self-sustaining, most sustainable ──
  let yeastScore: number;
  if (yeastType === "sourdough") {
    yeastScore = 95;
    claims.push(em("sust.sourdoughZeroImpact", METHOD_MESSAGES_IT["sust.sourdoughZeroImpact"]));
  } else if (yeastType === "dry") {
    yeastScore = 75;
  } else {
    yeastScore = 60;
  }

  const score = Math.round(
    ovenEfficiency * 0.3 +
      cookEfficiency * 0.25 +
      ferEfficiency * 0.2 +
      ingredientScore * 0.15 +
      yeastScore * 0.1,
  );

  let category: string;
  if (score >= 80) category = "Eccellente";
  else if (score >= 65) category = "Buona";
  else if (score >= 45) category = "Media";
  else category = "Bassa";

  return {
    score: Math.max(10, Math.min(100, score)),
    category,
    claims: claims.slice(0, 2),
  };
}
