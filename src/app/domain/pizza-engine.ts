// ═══ VULCAN PIZZA ENGINE ═══
// Scientific pizza recipe generation based on Progetto Vulcan
// Last audit alignment: 14 feb 2026 — Audit Verifica Implementativa v1
// Changes: P/L ratio, variable Q10, Chicago butter fix, STG W AVPN 2024,
//          full compensation engine (logarithmic hydration, Arrhenius baking),
//          sustainability score documented, fat_type model

import { STYLE_DEVIATIONS } from "./deviation-tags";
import {
getImpasto,
mergeImpastoIntoDough,
type ImpastoRecipe,
} from "../data/impasto-library";
import { getToppingByStyle } from "../data/parametric-databases";
import {
getToppingForStyle,
type TimelineInsertPoint,
type ToppingRecipe
} from "../data/topping-library";

// ═══ TYPES ═══

export type ShapeType = "round" | "oval" | "rectangular";
export type OvenType =
  | "wood"
  | "electric_high"
  | "electric_standard"
  | "gas"
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
export type ServingUnit = "panetto" | "teglia" | "pala" | "padellino" | "focaccia";

export interface ServingUnitLabel {
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
  region?: string;   // regione italiana o stato USA
  country?: string;  // es. "Italia", "USA", "Argentina"
}

export interface PizzaStyle {
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
  /** Sprint 11 Fase 1 — struttura geometrica (stacked/closed/folded/double_sheet).
   * Opzionale: omesso = single (pizza/teglia/panetto monostrato classico). */
  layout?: LayoutSpec;
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
  skill_level: SkillLevel;
  available_hours: number;
  dough_balls: number;
  has_mixer: boolean;
  has_pizza_stone: boolean;
  has_pizza_steel: boolean;
  has_baking_pan: boolean;
  dietary_filters: string[];
  kitchen_temp_c?: number;
  pantry_flours: string[]; // e.g. ['00','0','manitoba','integrale','semola']
  pantry_yeasts: string[]; // e.g. ['fresh','dry','sourdough']
  /** Advanced equipment — mixer type from profile (hands/planetary/spiral/fork/stand_domestic) */
  mixer_type?: string | null;
  /** Advanced equipment — baking surfaces from profile */
  surfaces?: string[];
}

/** Engine message: key-based for i18n, fallback for backward compat */
export interface EngineMsg {
  key: string;
  fallback: string;
  params?: Record<string, string | number>;
}

/** Shorthand to create an EngineMsg */
function em(key: string, fallback: string, params?: Record<string, string | number>): EngineMsg {
  return params ? { key, fallback, params } : { key, fallback };
}

/** Resolve an EngineMsg array to localized strings using CMS engine templates */
export function resolveEngineMsgs(
  msgs: EngineMsg[],
  templates?: Record<string, string>,
  formatParam?: (msg: EngineMsg, key: string, value: string | number) => string | number,
): string[] {
  return msgs.map((m) => {
    const tpl = templates?.[m.key] ?? m.fallback;
    if (!m.params) return tpl;
    return Object.entries(m.params).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(formatParam ? formatParam(m, k, v) : v)),
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

export interface ScoreDimension {
  key: ScoreDimensionKey;
  label: string;
  short: string;
  color: string;
  weight: number;
}

export const SCORE_DIMENSIONS: ScoreDimension[] = [
  { key: "authenticity",    label: "Autenticità",     short: "Aut", color: "var(--primary)",    weight: 0.45 },
  { key: "feasibility",     label: "Fattibilità",     short: "Fat", color: "var(--tertiary)",   weight: 0.30 },
  { key: "digestibility",   label: "Digeribilità",    short: "Dig", color: "var(--cta)",        weight: 0.25 },
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

export interface GeneratedRecipe {
  schema_version: string; // Notion Pag.09: recipe data schema version
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

interface ScientificLayer {
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
  /** Regola 55: calculated water temperature °C (null if < 2°C or > 40°C) */
  water_temp_c: number | null;
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
}

// ═══ STYLES DATABASE ═══

export const PIZZA_FAMILIES: Record<
  FamilyId,
  { name: string; description: string; emoji: string }
> = {
  napoletana: {
    name: "Napoletana",
    description:
      "Leggerezza, lievitazione naturale, cottura veloce ad altissima temperatura",
    emoji: "🇮🇹",
  },
  romana: {
    name: "Romana",
    description:
      "Dalla croccantezza estrema della Scrocchiarella all'alta idratazione della Teglia",
    emoji: "🏛️",
  },
  americana: {
    name: "Americana",
    description:
      "Adattamento italo-americano: praticità, street food, varietà regionali",
    emoji: "🗽",
  },
  contemporanea: {
    name: "Contemporanea",
    description:
      "Digeribilità, sperimentazione, alta idratazione, tecniche avanzate",
    emoji: "🔬",
  },
};

/** Uno stile appartiene a una famiglia se è la sua primaria O una secondaria.
 * Usato dai filtri (non esclusivi) — il grouping usa solo `style.family`. */
export function styleMatchesFamily(style: PizzaStyle, family: FamilyId): boolean {
  return style.family === family || (style.families?.includes(family) ?? false);
}

/** Origine "corta" per le card: la città, senza regione/stato/paese né note fra
 * parentesi. "Chicago, Illinois, USA" → "Chicago"; "Roma (Gabriele Bonci)" →
 * "Roma"; "Napoli (evoluzione moderna)" → "Napoli". La stringa piena resta nel
 * DB per la pagina di dettaglio. */
/** Città sola, per le card. */
export function shortOrigin(origin: StyleOrigin): string {
  return origin.city;
}
/** Origine completa per viste di dettaglio: "Napoli, Campania, Italia". */
export function formatOrigin(origin: StyleOrigin): string {
  return [origin.city, origin.region, origin.country].filter(Boolean).join(", ");
}

export const STYLES_DB: Record<string, PizzaStyle> = {
  napoletana_stg: {
    id: "napoletana_stg",
    name: "Napoletana STG",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [250, 320], // Aggiornato da AVPN 2024 (era 220-280) — Audit Maestro S3
      flour_pl_range: [0.55, 0.70], // AVPN 2024 disciplinare — Audit Maestro P0-1
      hydration_pct_range: [55, 62],
      // Audit motore 2026-06: ripristinato a 2.8% (disciplinare AVPN ~50 g/L
      // acqua → a H58-62 ≈ 2.6-3.0% sulla farina). Lo stile è certificato STG:
      // l'omogeneità con Canotto/Teglia NON deve prevalere sul disciplinare per
      // lo stile-bandiera. (Audit role-play — finding F9.)
      salt_pct: 2.8,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 270,
      thickness_factor: 0.34,
      diameter_cm: 32,
    },
    baking: {
      oven_type_required: "wood",
      temp_c_range: [430, 500],
      temp_c_ideal: 485,
      cook_time_sec_range: [60, 90],
      cook_time_sec_ideal: 75,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: true,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    description:
      "Standard aureo secondo disciplinare AVPN. Cornicione gonfio, centro sottile, leopardatura.",
    key_characteristics: [
      "Cornicione 1-2cm gonfio",
      "Centro 3-4mm sottile",
      "Crosta leopardata",
      "Cottura 60-90s",
    ],
    hydration_category: "medium",
    emoji: "🍕",
    servings_per_unit: [1, 1], // Napoletana = 1 pizza a testa
    default_topping_ref: "margherita_napoletana_avpn",
  },
  napoletana_canotto: {
    id: "napoletana_canotto",
    name: "Canotto Contemporanea",
    family: "napoletana",
    families: ["contemporanea"], // Napoletano d'origine ma tecnica contemporanea
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [280, 340], // Martucci Caputo Saccorosso W300 — era [300,350]
      flour_pl_range: [0.50, 0.65], // Più estensibile per cornicione esplosivo
      hydration_pct_range: [65, 75], // Martucci 68%, Salvo 70%, pro 75% — era [70,80]
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "biga|poolish",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 300,
      thickness_factor: 0.36,
      diameter_cm: 33,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [400, 480],
      temp_c_ideal: 450,
      cook_time_sec_range: [90, 150],
      cook_time_sec_ideal: 120,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: true,
    suitable_for_beginner: false,
    description:
      'Cornicione esplosivo "canotto d\'aria", alveolatura estrema, alta digeribilità.',
    key_characteristics: [
      'Cornicione 3-4cm "canotto"',
      "Alveolatura estrema",
      "Maturazione 24-72h",
      "Digeribilità alta",
    ],
    hydration_category: "high",
    emoji: "🎈",
    servings_per_unit: [1, 1], // Canotto = 1 pizza a testa
    default_topping_ref: "margherita_napoletana_avpn",
  },
  teglia_romana: {
    id: "teglia_romana",
    name: "Teglia Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 320], // Disciplinare APITER (Confraternita) W300-380 — Audit Maggio 2026
      flour_pl_range: [0.50, 0.60], // APITER: 0.50-0.60 stretto
      hydration_pct_range: [75, 85], // Teglia tradizionale 75-85%, moderna 85-90% — era [80,100]
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 48],
      process_type: "no_knead",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 800,
      thickness_factor: 0.6,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [260, 300],
      temp_c_ideal: 280,
      cook_time_sec_range: [780, 1080],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Alta idratazione, no-knead con pieghe. Base croccante, mollica nuvola.",
    key_characteristics: [
      "Altezza 2-3cm",
      "Idratazione 75-90%",
      "No-knead + pieghe",
      "Mollica nuvola",
    ],
    hydration_category: "extreme",
    emoji: "📐",
    default_topping_ref: "margherita",
  },
  tonda_romana: {
    id: "tonda_romana",
    name: "Tonda Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [200, 240], // Farina debole W170-220, max W230 — Audit Maggio 2026 (La Verace, Molino Vigevano)
      flour_pl_range: [0.40, 0.60], // Bassa tenacità: si stende col mattarello senza resistenza
      hydration_pct_range: [50, 55], // Scrocchiarella tradizionale 55-60% — Audit Maggio 2026
      salt_pct: 2.5, // Standard romano — era 2.8
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [6, 24], // Minimo 6h diretto, moderna 12-24h — era [3,6] troppo breve
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 180,
      thickness_factor: 0.21,
      diameter_cm: 33,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [300, 340],
      temp_c_ideal: 320,
      cook_time_sec_range: [300, 480],
      cook_time_sec_ideal: 360,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      'Sottilissima, mattarello obbligatorio, croccante estrema. "Scrocchiarella".',
    key_characteristics: [
      "Spessore 1-2mm",
      "Mattarello obbligatorio",
      "Croccante estrema",
      "Farina debole W<210",
    ],
    hydration_category: "medium",
    emoji: "💥",
    servings_per_unit: [1, 1], // Scrocchiarella = 1 pizza a testa
    default_topping_ref: "margherita_romana",
  },
  pinsa_romana: {
    id: "pinsa_romana",
    name: "Pinsa Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.55, 0.75], // Mix multicereale: P/L variabile
      hydration_pct_range: [75, 85],
      salt_pct: 2.5,
      oil_pct: 1.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "direct",
      // VPL-B2: mix multicereale tipico della pinsa (non una farina "W305" singola)
      flour_blend: [
        { name: "Farina di frumento", pct: 70, w: 290 },
        { name: "Farina di soia", pct: 15 },
        { name: "Farina di riso", pct: 15 },
      ],
    },
    shape: {
      shape_type: "oval",
      dough_weight_g: 280,
      thickness_factor: 0.35,
      length_cm: 35,
      width_cm: 25,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [350, 420],
      temp_c_ideal: 380,
      cook_time_sec_range: [180, 300],
      cook_time_sec_ideal: 240,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    description:
      "Mix 70% frumento / 15% soia / 15% riso. Forma ovale, crosta vetrosa.",
    key_characteristics: [
      "Mix multi-cereale",
      "Forma ovale",
      "Crosta vetrosa",
      "Maturazione 24-72h",
    ],
    hydration_category: "high",
    emoji: "🥖",
    servings_per_unit: [1, 1], // Pinsa = formato individuale ovale
    default_topping_ref: "margherita",
  },
  new_york: {
    id: "new_york",
    name: "New York Style",
    family: "americana",
    origin: { city: "New York", region: "New York", country: "USA" },
    dough: {
      flour_w_range: [280, 340], // Bread flour USA (KA ~W280, KABF ~W300) — era [280,340]
      flour_pl_range: [0.55, 0.70], // Bread flour americana: bilanciata
      hydration_pct_range: [58, 65], // Reinhart 62%, Kenji 63%, tradizionale 60% — era [62,68]
      salt_pct: 2.0, // Standard USA 1.5-2% — era 2.8 (troppo per tradizione americana)
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 1.5,
      fermentation_hours_range: [18, 48],
      process_type: "direct|poolish",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 280,
      thickness_factor: 0.28,
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [270, 310],
      temp_c_ideal: 290,
      cook_time_sec_range: [540, 720],
      cook_time_sec_ideal: 600,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Fetta grande pieghevole, crosta croccante ma flessibile. Street food.",
    key_characteristics: [
      "Fetta pieghevole",
      "Zucchero + olio",
      "Cottura 12-15min",
      "Oleosità caratteristica",
    ],
    hydration_category: "medium",
    emoji: "🗽",
    default_topping_ref: "margherita_new_york",
  },
  detroit: {
    id: "detroit",
    name: "Detroit Style",
    family: "americana",
    origin: { city: "Detroit", region: "Michigan", country: "USA" },
    dough: {
      flour_w_range: [280, 320], // Bread flour USA standard — era [290,350]
      flour_pl_range: [0.55, 0.70], // Bread flour standard
      hydration_pct_range: [70, 75],
      salt_pct: 2.0, // Standard USA — era 2.5
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 0.5, // Standard Detroit 0.3-0.5% — era 1.0 (PizzaBlab, PizzaLogic)
      fermentation_hours_range: [18, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 600,
      thickness_factor: 0.72,
      length_cm: 30,
      width_cm: 25,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [250, 290], // Serve calore per caramellizzazione brick cheese — era [230,260]
      temp_c_ideal: 270, // 500°F+ per frico ai bordi — era 245
      cook_time_sec_range: [660, 900], // 12-16 min a temp più alta — era [840,1140]
      cook_time_sec_ideal: 780, // 14 min — era 1020 (fuori range)
    },
    crust_type: "cheese_crown",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Cheese crown croccante, teglia Blue Steel. Formaggio fino ai bordi.",
    key_characteristics: [
      "Cheese crown",
      "Teglia profonda",
      "Formaggio ai bordi",
      "Crosta caramellata",
    ],
    hydration_category: "high",
    emoji: "🚗",
    default_topping_ref: "detroit_brick",
  },
  chicago_deep: {
    id: "chicago_deep",
    name: "Chicago Deep Dish",
    family: "americana",
    origin: { city: "Chicago", region: "Illinois", country: "USA" },
    dough: {
      flour_w_range: [220, 260], // AP flour USA W200-250, bread flour max W270 — era [230,290]
      flour_pl_range: [0.45, 0.60], // Shortcrust-like: burro riduce tenacità
      hydration_pct_range: [48, 52], // Impasto corto col burro, 50-55% tipico — era [48,58]
      salt_pct: 2.0, // Ripieno e formaggi aggiungono sapidità — era 2.5
      oil_pct: 18.0, // FIX Audit: era 0.0 — Chicago Deep Dish usa ~18% burro sulla farina
      fat_type: "butter", // Burro, non olio — Audit KB Bug #4
      sugar_pct: 1.0,
      fermentation_hours_range: [12, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 450,
      thickness_factor: 1.05,
      diameter_cm: 23,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [200, 235], // 425-450°F — era [200,230]
      temp_c_ideal: 225, // 435°F Cook's Illustrated — era 215
      cook_time_sec_range: [1500, 2100], // 25-35 min — era [1800,2400] troppo lungo
      cook_time_sec_ideal: 1800, // 30 min — era 2100 (al bordo max)
    },
    crust_type: "deep_dish",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Pizza profonda come una torta salata. Strati invertiti: formaggio-ripieno-salsa.",
    key_characteristics: [
      "Profondità 5cm",
      "Burro 18%",
      "Strati invertiti",
      "Cottura 35min",
    ],
    hydration_category: "low",
    emoji: "🏙️",
    default_topping_ref: "chicago_deep_classic",
  },

  /* ═══ EXPANSION WAVE 1 — 6 nuovi stili (marzo 2026) ═══ */

  focaccia_genovese: {
    id: "focaccia_genovese",
    name: "Focaccia Genovese",
    family: "contemporanea",
    origin: { city: "Genova", region: "Liguria", country: "Italia" },
    dough: {
      flour_w_range: [240, 280], // Farina 0 standard ligure W200-250 — era [220,280]
      flour_pl_range: [0.45, 0.65],
      hydration_pct_range: [55, 62], // Tradizionale 60-65%, moderna 68-72% — era [65,75]
      salt_pct: 2.5,
      oil_pct: 8.0, // Generoso olio EVO nella teglia e sull'impasto
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [6, 18],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 700,
      thickness_factor: 0.55,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [210, 250], // Focaccia vuole calore per bolle dorate — era [200,230]
      temp_c_ideal: 230, // era 220
      cook_time_sec_range: [1140, 1440],
      cook_time_sec_ideal: 1320,
    },
    crust_type: "focaccia_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Soffice e unta, con crosta dorata e crateri caratteristici. Salamoia olio-acqua in superficie.",
    key_characteristics: [
      "Olio EVO generoso",
      "Crateri superficiali",
      "Salamoia olio-acqua",
      "Cottura 15-20min",
    ],
    hydration_category: "high",
    emoji: "🫒",
    default_topping_ref: "bianca",
  },
  sfincione: {
    id: "sfincione",
    name: "Sfincione Palermitano",
    family: "contemporanea",
    origin: { city: "Palermo", region: "Sicilia", country: "Italia" },
    dough: {
      flour_w_range: [240, 280],
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [60, 70], // "Molto idratato" da tradizione palermitana — Audit Maggio 2026
      salt_pct: 2.5,
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 800,
      thickness_factor: 0.7,
      length_cm: 35,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [200, 240], // Sfincione cuoce a temp media — era [220,260]
      temp_c_ideal: 220, // era 240
      cook_time_sec_range: [1200, 1500],
      cook_time_sec_ideal: 1380,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Pizza spessa siciliana con pomodoro, cipolla, acciughe, caciocavallo e pangrattato. Street food di Palermo.",
    key_characteristics: [
      "Spesso e soffice",
      "Pangrattato tostato",
      "Cipolla + acciughe",
      "Caciocavallo",
    ],
    hydration_category: "medium",
    emoji: "🏺",
    default_topping_ref: "sfincione_palermitano",
  },
  pala_romana: {
    id: "pala_romana",
    name: "Pala Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 320], // Consultapizza W260-350 — Audit Maggio 2026
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [75, 82],
      salt_pct: 2.5,
      oil_pct: 2.5, // Pala tradizionale 2-3% olio EVO — era 1.5 (Consultapizza)
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [18, 48], // Pala tradizionale 18-48h, prolungabile — Audit Maggio 2026
      process_type: "direct|biga|poolish", // Pala può essere diretta o con pre-fermento
    },
    shape: {
      shape_type: "oval",
      dough_weight_g: 320,
      thickness_factor: 0.35,
      length_cm: 40,
      width_cm: 20,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [330, 380],
      temp_c_ideal: 350,
      cook_time_sec_range: [240, 360],
      cook_time_sec_ideal: 300,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false, // Può essere diretta o con biga — non più obbligatorio
    suitable_for_beginner: false,
    description:
      "Formato ovale allungato servito su pala. Via di mezzo tra tonda e teglia: croccante fuori, nuvola dentro.",
    key_characteristics: [
      "Forma ovale allungata",
      "Alta idratazione",
      "Servita su pala",
      "Crosta croccante-nuvola",
    ],
    hydration_category: "high",
    emoji: "🏓",
    default_topping_ref: "bianca_mortazza_romana",
  },
  grandma_style: {
    id: "grandma_style",
    name: "Grandma Style",
    family: "americana",
    origin: { city: "Long Island", region: "New York", country: "USA" },
    dough: {
      flour_w_range: [240, 280], // Bread flour USA — era [260,320]
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [60, 65], // Tradizione italo-americana 60-65% — era [60,68]
      salt_pct: 2.0, // Standard USA — era 2.5
      oil_pct: 4.0, // Teglia generosamente oliata
      fat_type: "oil",
      sugar_pct: 1.0,
      fermentation_hours_range: [18, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 550,
      thickness_factor: 0.35,
      length_cm: 33,
      width_cm: 23,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [230, 260],
      temp_c_ideal: 250,
      cook_time_sec_range: [840, 1020],
      cook_time_sec_ideal: 900,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Sottile, croccante, teglia oliata. La pizza della nonna italo-americana. Mozzarella sotto, salsa sopra.",
    key_characteristics: [
      "Sottile e croccante",
      "Mozzarella sotto salsa",
      "Teglia ben oliata",
      "Cottura 12-16min",
    ],
    hydration_category: "medium",
    emoji: "👵",
    default_topping_ref: "margherita",
  },
  focaccia_recco: {
    id: "focaccia_recco",
    name: "Focaccia di Recco",
    family: "contemporanea",
    origin: { city: "Recco", region: "Liguria", country: "Italia" },
    dough: {
      flour_w_range: [300, 340], // Disciplinare IGP focaccia di Recco: W ≥ 300 — era [170,210] ERRATO
      flour_pl_range: [0.55, 0.70], // Forza alta = P/L bilanciato/forte
      hydration_pct_range: [45, 50], // Sfoglia non lievitata, disciplinare IGP 45-50% — era [50,55]
      salt_pct: 2.0,
      oil_pct: 4.0, // 3-4% nell'impasto, resto in teglia — era 5.0
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [0.5, 2], // Solo riposo della sfoglia — non lievitata
      process_type: "direct",
      unleavened: true, // VPL-B2: sfoglia senza lievito (farina/acqua/olio/sale)
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 400,
      thickness_factor: 0.08, // Sottilissima, quasi trasparente
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [300, 340],
      temp_c_ideal: 320,
      cook_time_sec_range: [480, 600],
      cook_time_sec_ideal: 540,
    },
    crust_type: "stuffed_thin",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "double_thin_sheet",
      pieces_per_unit: 2,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    description:
      "Due sfoglie sottilissime con stracchino fuso. IGP dal 2015. Bolle dorate caratteristiche.",
    key_characteristics: [
      "Sfoglia quasi trasparente",
      "Ripiena di stracchino",
      "Bolle dorate",
      "Nessuna lievitazione",
    ],
    hydration_category: "low",
    emoji: "🧀",
    default_topping_ref: "crescenza_recco",
  },
  padellino_torino: {
    id: "padellino_torino",
    name: "Pizza al Padellino",
    family: "contemporanea",
    origin: { city: "Torino", region: "Piemonte", country: "Italia" },
    dough: {
      flour_w_range: [220, 260], // Farina 0/1 forte — era [280,330]
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [60, 65],
      salt_pct: 2.5,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.5,
      fermentation_hours_range: [18, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 180, // Padellino tradizionale 160-200g per padellino 20cm — era 250
      thickness_factor: 0.5,
      diameter_cm: 20, // Padellino in ferro/alluminio standard 20cm — era 22
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 240],
      temp_c_ideal: 230,
      cook_time_sec_range: [600, 720],
      cook_time_sec_ideal: 660,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    default_dough_balls: 4, // Padellini sono individuali: default 4 (uno a testa per 4 persone)
    description:
      "Cotta in padellino di ferro e finita in forno. Fondo croccante burro-olio, soffice al centro. Specialità torinese.",
    key_characteristics: [
      "Padellino di ferro",
      "Fondo ultra-croccante",
      "Morbida al centro",
      "Porzione individuale",
    ],
    hydration_category: "high",
    emoji: "🍳",
    default_topping_ref: "margherita",
  },

  /* ═══ SPRINT 11 Fase 1 — Stili con layout speciale ═══ */
  pizza_baciata: {
    id: "pizza_baciata",
    name: "Pizza Baciata",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [75, 85],
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 48],
      process_type: "direct|biga",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 800, // 2 panetti da 400g per teglia 40x30
      thickness_factor: 0.55,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [270, 300],
      temp_c_ideal: 285,
      cook_time_sec_range: [840, 1200],
      cook_time_sec_ideal: 960,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "stacked",
      pieces_per_unit: 2,
      interlayer: "oil_brush",
      filling_timing: "post_bake_split",
      cook_mode: "white_then_top",
    },
    default_impasto_ref: "teglia_romana_classica",
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Doppio strato in teglia: due dischi sovrapposti spennellati d'olio, cotti in bianco, poi sdoppiati e farciti a freddo. Stile romano da panificio.",
    key_characteristics: [
      "Doppio disco con olio in mezzo",
      "Cottura in bianco",
      "Farcitura post-cottura a freddo",
      "Stile panaria romana",
    ],
    hydration_category: "high",
    emoji: "💋",
    default_topping_ref: "bianca_mortazza",
  },

  ciaccino_senese: {
    id: "ciaccino_senese",
    name: "Ciaccino Senese",
    family: "contemporanea",
    origin: { city: "Siena", region: "Toscana", country: "Italia" },
    dough: {
      flour_w_range: [220, 280],
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [60, 65],
      salt_pct: 2.0,
      oil_pct: 5.0,
      fat_type: "lard",
      sugar_pct: 0.0,
      fermentation_hours_range: [4, 12],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 700, // 2 dischi da 350g
      thickness_factor: 0.40,
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [230, 270],
      temp_c_ideal: 250,
      cook_time_sec_range: [900, 1200],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "stuffed_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 2,
      interlayer: "sealed_edges",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Pizza ripiena toscana: due dischi sigillati con prosciutto cotto e formaggio filante all'interno. Tipico dei panifici senesi.",
    key_characteristics: [
      "Due dischi sigillati ai bordi",
      "Ripieno interno pre-cottura",
      "Strutto/olio nell'impasto",
      "Tradizione senese",
    ],
    hydration_category: "medium",
    emoji: "🥪",
    default_topping_ref: "ciaccino",
  },

  /* Sprint 11 Fase 2 — Variante d'autore: Baciata con topping signature */
  /* Nota: "Pizza Patate e Porchetta" NON è uno stile a sé: è la `pizza_spaccata`
     con la farcitura patate&porchetta (ricetta `patate_porchetta_sancho`,
     "in crosta di patate" alla Sancho). La combinazione iconica vive come
     Ricetta Iconica (signature `patate_e_porchetta` → pizza_spaccata). Lo stile
     dedicato è stato rimosso; /recipe/pizza_patate_porchetta redirige alla spaccata. */
  pizza_spaccata: {
    id: "pizza_spaccata",
    name: "Pizza Spaccata",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [72, 80],
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 48],
      process_type: "direct|biga",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 700,
      thickness_factor: 0.6,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [270, 300],
      temp_c_ideal: 285,
      cook_time_sec_range: [840, 1200],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    layout: {
      type: "single",
      pieces_per_unit: 1,
      interlayer: "none",
      filling_timing: "post_bake_split",
      cook_mode: "bianca_only",
    },
    default_topping_ref: "bianca_mortazza_romana",
    default_impasto_ref: "teglia_romana_classica",
    default_dough_balls: 1,
    servings_per_unit: [2, 4],
    description:
      "UN SOLO disco/teglia di pizza bianca cotto e poi SPACCATO a metà col coltello e farcito a freddo. Diversa dalla Baciata (che parte da due dischi sovrapposti cotti insieme). Farciture: mortazza, crudo, e la patate e porchetta 'in crosta di patate' alla Sancho.",
    key_characteristics: [
      "Base singola cotta in bianco",
      "Spaccata a metà dopo la cottura",
      "Farcita a freddo (mortazza, crudo, patate&porchetta)",
      "Tradizione romana da forno / al taglio",
    ],
    hydration_category: "high",
    emoji: "🔪",
  },

  /* ═══ Sprint 11 — Espansione catalogo (2 nuovi stili) ═══ */
  trancio_milanese: {
    id: "trancio_milanese",
    name: "Trancio Milanese",
    family: "contemporanea",
    origin: { city: "Milano", region: "Lombardia", country: "Italia" },
    dough: {
      flour_w_range: [280, 340], // Farina forte 0/1 — pizzerie Spontini, Cocco, Di Gennaro
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [65, 75], // Medio-alta, mollica soffice
      salt_pct: 2.2,
      oil_pct: 4.0, // Generoso olio nella teglia per fondo dorato
      fat_type: "oil",
      sugar_pct: 0.5, // Spinta minima per colorazione
      fermentation_hours_range: [18, 36],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 600,
      thickness_factor: 0.5, // ~2cm di mollica
      length_cm: 33,
      width_cm: 25,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 260],
      temp_c_ideal: 240,
      cook_time_sec_range: [840, 1080],
      cook_time_sec_ideal: 960,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Trancio rettangolare tipico delle pizzerie milanesi a taglio. Soffice all'interno, fondo dorato dall'olio in teglia. Servito al banco a pranzo.",
    key_characteristics: [
      "Trancio rettangolare al taglio",
      "Cottura in teglia oliata",
      "Mollica soffice ~2cm",
      "Stile tavola calda milanese",
    ],
    hydration_category: "high",
    emoji: "🥪",
    default_topping_ref: "margherita",
  },

  chicago_tavern: {
    id: "chicago_tavern",
    name: "Chicago Tavern Cut",
    family: "americana",
    origin: { city: "Chicago", region: "Illinois", country: "USA" },
    dough: {
      flour_w_range: [240, 290], // Bread flour standard USA
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [50, 58], // Bassa idratazione per crocantezza estrema cracker-like
      salt_pct: 2.0,
      oil_pct: 4.0, // Olio nell'impasto + nella teglia
      fat_type: "oil",
      sugar_pct: 1.5, // Tipico USA, per colorazione e crocantezza
      fermentation_hours_range: [18, 36],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 380,
      thickness_factor: 0.22, // Sottilissima (cracker thin)
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [240, 280],
      temp_c_ideal: 260,
      cook_time_sec_range: [600, 840],
      cook_time_sec_ideal: 720,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    servings_per_unit: [2, 3],
    description:
      "Sottilissima e croccante tagliata a quadrotti (party cut), alternativa al deep dish di Chicago. Servita nei tavern con birra ghiacciata.",
    key_characteristics: [
      "Sottile cracker-like",
      "Taglio a quadrotti (party cut)",
      "Bordo croccante",
      "Stile tavern di quartiere",
    ],
    hydration_category: "low",
    emoji: "🟫",
    default_topping_ref: "diavola",
  },

  /* ═══ NUOVI STILI — Audit motore 2026-05 (italiani minori + internazionali) ═══ */

  focaccia_barese: {
    id: "focaccia_barese",
    name: "Focaccia Barese",
    family: "contemporanea",
    origin: { city: "Bari", region: "Puglia", country: "Italia" },
    dough: {
      flour_w_range: [220, 280], // Farina media + semola rimacinata
      flour_pl_range: [0.45, 0.55],
      hydration_pct_range: [70, 80], // Impasto morbido con patata lessa
      salt_pct: 2.0,
      oil_pct: 4.0, // EVO generoso nell'impasto e nel ruoto
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 500,
      thickness_factor: 0.55,
      diameter_cm: 32, // Ruoto tondo
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 250],
      temp_c_ideal: 240,
      cook_time_sec_range: [1200, 1500],
      cook_time_sec_ideal: 1320,
    },
    crust_type: "focaccia_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [3, 4],
    description:
      "Soffice e umida grazie alla patata nell'impasto. Pomodorini schiacciati, olive baresane, origano e tanto olio EVO. Cotta nel ruoto tondo.",
    key_characteristics: [
      "Patata lessa nell'impasto",
      "Pomodorini e olive baresane",
      "Mollica umida e soffice",
      "Crosta inferiore dorata nell'olio",
    ],
    hydration_category: "high",
    emoji: "🫒",
    default_topping_ref: "focaccia_barese_classica",
  },

  pizza_fritta: {
    id: "pizza_fritta",
    name: "Pizza Fritta",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [220, 280],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [60, 65],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [4, 8], // Lievitazione breve, frittura veloce
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 100, // Dischetto piccolo da friggere
      thickness_factor: 0.5,
      diameter_cm: 14,
    },
    baking: {
      oven_type_required: "home", // Frittura in olio, non forno
      temp_c_range: [180, 190], // VPL-B2: olio di frittura 180-190°C — era [170,180]
      temp_c_ideal: 185,
      cook_time_sec_range: [60, 120],
      cook_time_sec_ideal: 90,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "panetto",
    default_dough_balls: 4,
    servings_per_unit: [1, 2],
    description:
      "Disco di impasto fritto in olio bollente. Due scuole distinte: RIPIENA — farcita di ricotta, provola e cicoli e sigillata PRIMA di friggere; oppure MONTANARA — fritta vuota e poi condita A CRUDO sopra con pomodoro, ricotta e basilico.",
    key_characteristics: [
      "Cottura in frittura (no forno)",
      "Ripiena (chiusa) oppure Montanara (aperta, condita sopra)",
      "Ricotta + provola/cicoli o pomodoro + basilico",
      "Veloce, lievitazione breve",
    ],
    hydration_category: "medium",
    emoji: "🍳",
    default_topping_ref: "pizza_fritta_ripiena",
  },

  calzone_napoletano: {
    id: "calzone_napoletano",
    name: "Calzone Napoletano",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [250, 320],
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [58, 62],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 280,
      thickness_factor: 0.4,
      diameter_cm: 30, // Disco prima della chiusura
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [400, 470],
      temp_c_ideal: 430, // Leggermente sotto la pizza per cuocere il ripieno
      cook_time_sec_range: [120, 240],
      cook_time_sec_ideal: 180,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 1,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    serving_unit: "panetto",
    default_dough_balls: 4,
    servings_per_unit: [1, 1],
    description:
      "Mezzaluna chiusa e sigillata con ripieno di ricotta, fior di latte, salame o cicoli e pepe. Cornicione gonfio, cotto in forno ad alta temperatura.",
    key_characteristics: [
      "Chiuso a mezzaluna sigillata",
      "Ripieno ricotta + fior di latte",
      "Impasto napoletano STG",
      "Cottura alta T per gonfiare",
    ],
    hydration_category: "medium",
    emoji: "🥟",
    default_topping_ref: "calzone_napoletano_classico",
  },

  pizza_al_metro: {
    id: "pizza_al_metro",
    name: "Pizza al Metro",
    family: "napoletana",
    origin: { city: "Vico Equense", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [260, 320],
      flour_pl_range: [0.55, 0.65],
      hydration_pct_range: [62, 70],
      salt_pct: 2.5,
      oil_pct: 1.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [12, 36],
      process_type: "direct|biga",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 700,
      thickness_factor: 0.45,
      length_cm: 70, // Servita "a metri"
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [300, 380],
      temp_c_ideal: 340,
      cook_time_sec_range: [240, 360],
      cook_time_sec_ideal: 300,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Formato rettangolare lungo nato a Vico Equense, servito a metri con più condimenti affiancati. Impasto napoletano morbido, alveolato.",
    key_characteristics: [
      "Formato lungo servito a metri",
      "Più gusti sulla stessa base",
      "Impasto napoletano morbido",
      "Conviviale, da condividere",
    ],
    hydration_category: "medium",
    emoji: "📏",
    default_topping_ref: "margherita",
  },

  new_haven_apizza: {
    id: "new_haven_apizza",
    name: "New Haven Apizza",
    family: "americana",
    origin: { city: "New Haven", region: "Connecticut", country: "USA" },
    dough: {
      flour_w_range: [240, 300], // Bread flour
      flour_pl_range: [0.55, 0.65],
      hydration_pct_range: [60, 66],
      salt_pct: 2.0,
      oil_pct: 1.0,
      fat_type: "oil",
      sugar_pct: 0.0, // Niente zucchero, a differenza della NY
      fermentation_hours_range: [24, 72], // Maturazione fredda
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 300,
      thickness_factor: 0.25, // Sottile e irregolare
      diameter_cm: 38,
    },
    baking: {
      oven_type_required: "wood", // Forno a carbone (coal-fired)
      temp_c_range: [340, 400],
      temp_c_ideal: 370,
      cook_time_sec_range: [240, 360],
      cook_time_sec_ideal: 300,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: true,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    serving_unit: "panetto",
    default_dough_balls: 2,
    servings_per_unit: [2, 3],
    description:
      "Cotta in forno a carbone, sottile, irregolare e carbonizzata sui bordi. L'icona è la white clam pie (vongole, aglio, origano, niente pomodoro).",
    key_characteristics: [
      "Forno a carbone, bordi carbonizzati",
      "Sottile e irregolare",
      "Niente zucchero nell'impasto",
      "White clam pie iconica",
    ],
    hydration_category: "medium",
    emoji: "🦪",
    default_topping_ref: "white_clam",
  },

  fugazzeta: {
    id: "fugazzeta",
    name: "Fugazzeta Argentina",
    family: "americana",
    origin: { city: "Buenos Aires", country: "Argentina" },
    dough: {
      flour_w_range: [200, 260],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [55, 62],
      salt_pct: 2.0,
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 1.0,
      fermentation_hours_range: [4, 12], // Spesso giornaliera, lievito generoso
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 600,
      thickness_factor: 0.7, // Alta, "al molde"
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 260],
      temp_c_ideal: 240,
      cook_time_sec_range: [900, 1200],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 2,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Pizza alta 'al molde' a doppio strato, ripiena di abbondante mozzarella e ricoperta di cipolla. Niente pomodoro. Icona della pizza porteña.",
    key_characteristics: [
      "Doppio strato ripieno di mozzarella",
      "Cipolla in superficie, niente pomodoro",
      "Alta e morbida (al molde)",
      "Origano e olio EVO finale",
    ],
    hydration_category: "medium",
    emoji: "🧅",
    default_topping_ref: "fugazzeta",
  },

  california_style: {
    id: "california_style",
    name: "California Style",
    family: "americana",
    origin: { city: "California", country: "USA" },
    dough: {
      flour_w_range: [240, 300],
      flour_pl_range: [0.55, 0.65],
      hydration_pct_range: [60, 65],
      salt_pct: 2.0,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.5,
      fermentation_hours_range: [24, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 230,
      thickness_factor: 0.25, // Base sottile
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [280, 340],
      temp_c_ideal: 300,
      cook_time_sec_range: [300, 420],
      cook_time_sec_ideal: 360,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "panetto",
    default_dough_balls: 2,
    servings_per_unit: [1, 2],
    description:
      "Base sottile con ingredienti gourmet non convenzionali (pollo BBQ, capra, fichi, rucola). Nata da Chez Panisse e Wolfgang Puck negli anni '80.",
    key_characteristics: [
      "Base sottile artigianale",
      "Ingredienti gourmet stagionali",
      "Combinazioni non tradizionali",
      "Approccio chef-driven",
    ],
    hydration_category: "medium",
    emoji: "🥑",
    default_topping_ref: "ortolana",
  },

  greek_pan: {
    id: "greek_pan",
    name: "Greek Pan Pizza",
    family: "americana",
    origin: { city: "New England", country: "USA" },
    dough: {
      flour_w_range: [220, 280],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [60, 68],
      salt_pct: 2.0,
      oil_pct: 5.0, // Teglia molto unta → fondo quasi fritto
      fat_type: "oil",
      sugar_pct: 1.0,
      fermentation_hours_range: [4, 12],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 400,
      thickness_factor: 0.5,
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [230, 260],
      temp_c_ideal: 245,
      cook_time_sec_range: [720, 1020],
      cook_time_sec_ideal: 840,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [3, 4],
    description:
      "Cotta in teglia tonda generosamente oliata: fondo croccante quasi fritto, mollica soffice. Mix mozzarella + cheddar. Classico dei diner greco-americani.",
    key_characteristics: [
      "Teglia molto unta, fondo fritto",
      "Mollica soffice e spessa",
      "Mix mozzarella + cheddar",
      "Diner greco-americano",
    ],
    hydration_category: "medium",
    emoji: "🫓",
    default_topping_ref: "margherita",
  },
};

// ═══ Q10 MODEL — VARIABLE BY YEAST TYPE & TEMPERATURE ═══
// Audit Database: Q10=2.0 fisso sovrastima attività a bassa T del ~20%
// Letteratura: Saccharomyces cerevisiae Q10=2.1±0.3 (15-30°C), scende a 1.6 sotto 10°C
// Lievito madre: LAB (batteri lattici) hanno Q10 1.9-2.4, media diversa da S. cerevisiae

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
    // Cold fermentation: metabolismo rallentato più di quanto Q10=2.0 predica
    // PMC7146123: S. cerevisiae Q10 ≈ 1.6 sotto 10°C
    return { q10: 1.6, model: "cold_adapted" };
  }
  return { q10: 2.0, model: "standard" };
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
  if (style.dough.unleavened) return 20; // sfoglia: solo riposo a TA
  if (ROOM_TEMP_DIRECT_STYLES.has(style.id)) return 22; // diretto a TA anche se lungo
  return fermentationHours > 12 ? 4 : 22;
}

// ═══ THERMAL VIABILITY — "il forno ce la fa?" (Audit role-play giugno 2026) ═══
// Per gli stili in cui la cottura È l'identità (forno a legna richiesto, o minimo
// stile ≥ 350°C: Napoletana, Canotto, Pinsa, Pala), scendere sotto il minimo
// significa che leopardatura, cornicione e struttura canonici sono FISICAMENTE
// irraggiungibili. Restituisce 1 (nessun impatto) quando il forno basta, altrimenti
// un fattore 0.25–1 che fa crollare l'autenticità e la fattibilità (rompe il
// pavimento strutturale ~65 dell'A-Score). Per gli stili da forno domestico
// (teglia, detroit, focacce…) ritorna sempre 1: la loro temperatura è raggiungibile.
export function thermalViability(style: PizzaStyle, ovenTemp: number): number {
  const styleMinTemp = style.baking.temp_c_range[0];
  const tempCritical = style.requires_wood_oven || styleMinTemp >= 350;
  if (!tempCritical || ovenTemp >= styleMinTemp) return 1;
  const deficitFrac = (styleMinTemp - ovenTemp) / styleMinTemp; // 0..1
  return Math.max(0.25, 1 - deficitFrac * 1.6);
}

// ═══ COMPENSATION ENGINE ═══
// Audit Maestro P0-4: 8 compensazioni parametriche per deficit forno
// Audit Database: formula idratazione deve essere logaritmica (Modernist Pizza 2021)

export interface OvenCompensations {
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
export interface AuthenticityCenter {
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
        `Forno troppo freddo per lo stile ({oven}°C < {min}°C): leopardatura, cornicione e struttura canonici non raggiungibili (×{factor})`,
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
      em("feas.ovenSuboptimal", "Forno sotto-ottimale: {temp} vs ideale {ideal}", { temp: ovenMaxTemp, ideal: style.baking.temp_c_ideal }),
    );
  } else {
    const deficit = style.baking.temp_c_range[0] - ovenMaxTemp;
    // ADV-08 fix: extreme deficit (>200°C) should floor at 5, not 20
    // A 150°C oven for napoletana STG (430°C min) is physically impossible, not just "suboptimal"
    const floor = deficit > 200 ? 5 : deficit > 100 ? 10 : 20;
    ovenScore = Math.max(floor, 60 - deficit * 0.5);
    warnings.push(
      em("feas.ovenTooCold", "Forno troppo freddo: {temp} < minimo {min}", { temp: ovenMaxTemp, min: style.baking.temp_c_range[0] }),
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
    warnings.push(em("feas.wTooHigh", `W molto alto (${flourW}). Impasto tenace.`, { w: flourW }));
  } else {
    flourScore = 95;
  }

  // Skill factor (30%) — Audit Scientifico S3: deve considerare W, metodo, non solo H+skill
  let skillScore = 90;

  // Hydration × skill interaction — soglie più alte per Intermedio/Avanzato
  if (hydration > 75 && skillLevel === 1) {
    skillScore = 30;
    warnings.push(
      em("feas.hydrationBeginnerHigh", "Idratazione >75% sconsigliata per principianti"),
    );
  } else if (hydration > 85 && skillLevel === 2) {
    // Solo idratazioni davvero estreme (>85%) generano warning per Intermedio
    skillScore = 65;
    warnings.push(em("feas.hydrationNeedsPractice", "Idratazione estrema (>85%) richiede pratica"));
  } else if (hydration > 65 && skillLevel === 1) {
    skillScore = 50;
    warnings.push(em("feas.hydrationMedBeginner", "Idratazione media-alta per principiante"));
  }

  // W × hydration interaction — Audit Scientifico S3: W alto aiuta idratazione alta
  if (hydration > 75 && flourW >= 300) {
    skillScore = Math.min(95, skillScore + 10); // farina forte assorbe bene
  } else if (hydration > 70 && flourW < 220) {
    skillScore = Math.max(20, skillScore - 10); // farina debole + alta H = disastro
    warnings.push(em("feas.flourTooWeakForHydration", "Farina troppo debole per questa idratazione"));
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
      warnings.push(em("feas.prefermentNeedsExperience", "Pre-fermento richiede esperienza"));
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

  // Effective hours at 18°C — Audit Database: Q10 variabile per tipo lievito e temperatura
  const { q10, model: q10Model } = getQ10(yeastType, fermentationTempC);
  const tempDiff = fermentationTempC - 18;
  const speedRatio = Math.pow(q10, tempDiff / 10);
  let effectiveHours = fermentationHours * speedRatio;

  if (hasPreFerment) {
    effectiveHours *= 1.2;
  }

  let score: number;
  let category: string;
  let fodmapReductionPct: number | null = null;

  if (effectiveHours < 3) {
    score = 20;
    category = "Pessima";
    claims.push(em("dig.fermentTooShort", "Fermentazione troppo breve: amidi non degradati"));
  } else if (effectiveHours < 8) {
    score = 20 + ((effectiveHours - 3) / 5) * 30;
    category = "Bassa";
    claims.push(em("dig.fermentShort", "Fermentazione breve: digeribilità limitata"));
  } else if (effectiveHours < 18) {
    score = 50 + ((effectiveHours - 8) / 10) * 20;
    category = "Media";
  } else if (effectiveHours < 30) {
    score = 70 + ((effectiveHours - 18) / 12) * 15;
    category = "Alta";
    if (effectiveHours >= 24) {
      fodmapReductionPct = Math.min(
        80,
        Math.round(70 + (effectiveHours - 24) * 1.5),
      );
      claims.push(em("dig.fodmapReduced", `FODMAP ridotti ~${fodmapReductionPct}%`, { pct: fodmapReductionPct }));
    }
  } else {
    score = Math.min(
      95,
      85 + ((effectiveHours - 30) / 20) * 10,
    );
    category = "Eccellente";
    fodmapReductionPct = Math.min(
      95,
      Math.round(80 + (effectiveHours - 30) * 0.5),
    );
    claims.push(em("dig.fodmapHighReduction", "FODMAP ridotti >80%"));
    claims.push(em("dig.extremeMaturation", "Maturazione estrema: massima complessità aromatica"));
  }

  if (yeastPct > 1.5) {
    const penalty = Math.min(20, (yeastPct - 1.5) * 10);
    score -= penalty;
    claims.push(em("dig.highYeastDosage", `Dosaggio lievito alto (${yeastPct}%): -${Math.round(penalty)}% digeribilità`, { pct: yeastPct, penalty: Math.round(penalty) }));
  }

  if (fermentationTempC <= 4) {
    score = Math.min(100, score + 5);
    claims.push(em("dig.coldFermentation", "Fermentazione fredda: attività enzimatica ottimale"));
  }

  return {
    score: Math.round(Math.max(0, score)),
    category,
    claims,
    fodmap_reduction_pct: fodmapReductionPct,
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
  if (style.requires_wood_oven && ovenType !== "wood") score += 8;

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
  return STYLE_DEVIATIONS[styleId]?.category ?? "canonical";
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
    // Branded flours (from flour-database.ts)
    caputo_pizzeria_blu: [240, 280],
    caputo_nuvola: [240, 280],
    caputo_cuoco: [300, 340],
    petra_5037: [340, 380],
    petra_3_evolutiva: [320, 360],
    "5stagioni_rossa": [260, 300],
    "5stagioni_5lune": [330, 370],
    dallagiovanna_manitoba: [360, 400],
  };

function calculateYeastPercentage(
  fermentationHours: number,
  fermentationTempC: number,
  yeastType: "fresh" | "dry",
): number {
  // Guard: zero/negative fermentation → no yeast needed (sfoglia diretta, es. Focaccia di Recco)
  if (fermentationHours <= 0) return 0;
  // ADV-02 fix: very short fermentation (≤2h) = unleavened or minimal leavening
  // Focaccia di Recco [0.5, 2]h — Arrhenius model produces 3% (absurd for sfoglia diretta)
  // Cap at 0.5% max with gentle linear ramp instead of exponential blowup
  if (fermentationHours <= 2) return Math.max(0.01, Math.min(0.5, fermentationHours * 0.2));
  // Arrhenius-based model con Q10 variabile — Audit Database V2
  // Audit motore 2026-05: ricalibrato dopo verifica empirica vs disciplinari.
  //   - referenceRate 0.25→0.10: il vecchio 0.25 sovrastimava di 2-3x rispetto
  //     a Caputo/AVPN/Pizzarium/Shawn Randazzo (Detroit). Ora ancorato a Caputo
  //     standard (0.1% fresh yeast a 18°C per 24h).
  //   - timeFactor lineare (24/h) → sub-lineare (24/h)^0.7: il lievito si
  //     RIPRODUCE durante la fermentazione, non si consuma. Curva log-like.
  //     Verificato su Napoletana 8h, 12h, 24h, Bonci 48h, Detroit 24h.
  const referenceRate = 0.10; // % fresh yeast a 18°C per 24h (Caputo standard)
  const { q10 } = getQ10(yeastType, fermentationTempC);
  const tempFactor = Math.pow(
    q10,
    (fermentationTempC - 18) / 10,
  );
  const timeFactor = Math.pow(24 / fermentationHours, 0.7);

  let pct = (referenceRate * timeFactor) / tempFactor;
  if (yeastType === "dry") pct *= 0.33; // dry = 1/3 of fresh

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

/** Recalculate dough weight from custom pan dimensions + thickness */
function calcDoughWeight(
  style: PizzaStyle,
  panConfig?: PanConfig,
): number {
  if (!panConfig) return style.shape.dough_weight_g;

  const defaultArea = getDefaultShapeArea(style.shape);
  const shape = panConfig.panShape ?? defaultPanShape(style);
  let customArea: number;

  if (shape === "rectangular") {
    const l = panConfig.panLength ?? style.shape.length_cm ?? 30;
    const w = panConfig.panWidth ?? style.shape.width_cm ?? 20;
    customArea = l * w;
  } else {
    const d = panConfig.panDiameter ?? style.shape.diameter_cm ?? 30;
    customArea = Math.PI * (d / 2) * (d / 2);
  }

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
}

export interface ScoreWeightsOverride {
  authenticity?: number;
  feasibility?: number;
  digestibility?: number;
  sustainability?: number;
  experimentation?: number;
}

export interface RecWeightsOverride {
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
}

export function generateRecipe(
  style: PizzaStyle,
  constraints: UserConstraints,
  options: GenerateRecipeOptions = {},
): GeneratedRecipe {
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

  let fermentationHours =
    customFermentationHours ?? (fermRange[0] + fermRange[1]) / 2;

  // Clamp fermentation a available_hours SOLO se l'utente non ha esplicitato un valore custom.
  // Rispettiamo la scelta dell'utente (es. scelta versione "Tradizionale 48h" non va clampata a 24h).
  // Audit role-play giugno 2026 (finding F8): se il clamp porta SOTTO la finestra
  // minima dello stile, non è una scelta dell'utente ma un vincolo di tempo →
  // lo segnaliamo onestamente invece di limitarci a penalizzare l'autenticità.
  let timeClampedBelowMin = false;
  if (customFermentationHours === undefined && constraints.available_hours > 0) {
    const clamped = Math.min(fermentationHours, constraints.available_hours);
    if (clamped < fermRange[0]) timeClampedBelowMin = true;
    fermentationHours = clamped;
  }

  const fermentationTempC =
    customFermentationTempC ??
    defaultFermentTempC(style, fermentationHours);

  const hasPreFerment =
    usePreFerment ?? style.requires_pre_ferment;

  // F3 — sale effettivo: leva utente (customSalt) con fallback allo stile. Clampato
  // a un range sensato (1.5–3.5%) per non uscire dal ragionevole.
  const effectiveSaltPct =
    customSalt != null
      ? Math.max(1.5, Math.min(3.5, customSalt))
      : style.dough.salt_pct;

  // Oven temperature
  let ovenTemp = Math.min(
    constraints.oven_max_temp_c,
    style.baking.temp_c_ideal,
  );
  if (ovenTemp < style.baking.temp_c_range[0]) {
    ovenTemp = constraints.oven_max_temp_c;
  }

  // ── Full Compensation Engine — Audit Maestro P0-4 ──
  const ovenCompensations = calculateOvenCompensations(style, ovenTemp);
  const cookTime = ovenCompensations.cook_time_sec;

  // Apply hydration compensation (only if user didn't set custom)
  const hydration = customHydration
    ? baseHydration
    : Math.round((baseHydration + ovenCompensations.hydration_delta_pct) * 10) / 10;

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
    yeastType = "fresh"; // default when no pantry info
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
    yeastPct = calculateYeastPercentage(
      fermentationHours,
      fermentationTempC,
      yeastType as "fresh" | "dry",
    );
  }

  // Baker's percentages to grams — using compensated values
  // Apply custom pan dimensions + thickness if provided
  const baseBallWeight = panConfig
    ? calcDoughWeight(style, panConfig)
    : style.shape.dough_weight_g;
  const ballWeight = Math.round(
    baseBallWeight * ovenCompensations.thickness_factor,
  );
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
  );
  const feasResult = calculateFeasibilityScore(
    style,
    constraints.oven_max_temp_c,
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
    if (ovenViability <= 0.6) {
      feasResult.warnings.unshift(
        em(
          "feas.thermalUnviable",
          `Con {oven}°C non otterrai una vera {style}: niente leopardatura né cornicione spinto. Per questo stile serve un forno da almeno {min}°C.`,
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
  );
  const expResult = calculateExperimentationScore(
    style,
    hydration,
    fermentationHours,
    hasPreFerment,
    constraints.oven_type,
    ovenCompensations.compensations.length, // Notion Pag.04: compensation count feeds E-Score
  );

  // ── Sustainability score ──
  const sustResult = calculateSustainabilityScore(
    style,
    ovenTemp,
    cookTime,
    fermentationTempC,
    doughBalls,
    yeastType,
  );

  const sw = {
    authenticity: scoreWeights?.authenticity ?? 0.45,
    feasibility: scoreWeights?.feasibility ?? 0.30,
    digestibility: scoreWeights?.digestibility ?? 0.25,
    sustainability: scoreWeights?.sustainability ?? 0.0,
    experimentation: scoreWeights?.experimentation ?? 0.0,
  };
  // Audit role-play giugno 2026 (finding F1): il composite sommava SOLO 3 dei 5
  // pesi. Sul path di default (sust/exp = 0, Σ = 1.0) era corretto, ma se una
  // versione/CMS passava un peso a sustainability o experimentation quel peso
  // spariva e i restanti non sommavano più a 1 → scala distorta. Ora include
  // tutti e cinque i termini e rinormalizza per la somma dei pesi: identico sul
  // path di default, corretto su qualsiasi override.
  const totalScoreWeight =
    sw.authenticity + sw.feasibility + sw.digestibility + sw.sustainability + sw.experimentation;
  const composite = Math.round(
    (authResult.score * sw.authenticity +
      feasResult.score * sw.feasibility +
      digestResult.score * sw.digestibility +
      sustResult.score * sw.sustainability +
      expResult.score * sw.experimentation) /
      (totalScoreWeight || 1),
  );

  const scores: RecipeScores = {
    authenticity: authResult.score,
    feasibility: feasResult.score,
    digestibility: digestResult.score,
    experimentation: expResult.score,
    sustainability: sustResult.score,
    composite,
    authenticity_category: classifyScore("A", authResult.score),
    feasibility_category: classifyScore("F", feasResult.score),
    digestibility_category: classifyScore(
      "D",
      digestResult.score,
    ),
    experimentation_category: expResult.category,
    sustainability_category: sustResult.category,
    penalties: authResult.penalties,
    warnings: timeClampedBelowMin
      ? [
          em(
            "gen.timeBelowStyleWindow",
            `Con {available}h non rientri nella finestra di questo stile (min {fMin}h): fermentazione accorciata. Per l'autenticità piena servono almeno {fMin}h.`,
            { available: constraints.available_hours, fMin: fermRange[0] },
          ),
          ...feasResult.warnings,
        ]
      : feasResult.warnings,
    claims: [...digestResult.claims, ...sustResult.claims],
  };

  // Generate timeline — risolve il topping con il resolver Sprint 12 Fase 2.
  // Se default_topping_ref è un concept_id (es. "margherita"), il resolver sceglie
  // la variante più adatta allo Style (es. margherita_napoletana_avpn per STG,
  // margherita_romana per Tonda Romana, margherita_americana per NY).
  // Se è una recipe_id specifica (es. "patate_porchetta"), usa quella direttamente.
  const defaultTopping = style.default_topping_ref
    ? getToppingForStyle(style.default_topping_ref, style)
    : undefined;
  const timeline = generateTimeline(
    style,
    fermentationHours,
    fermentationTempC,
    hasPreFerment,
    cookTime,
    ovenTemp,
    defaultTopping,
    {
      mixerType: constraints.mixer_type,
      hasMixer: constraints.has_mixer,
      ovenType: constraints.oven_type,
      surfaces: constraints.surfaces,
    },
  );

  // Generate tips
  const tips = generateTips(
    style,
    hydration,
    flourW,
    ovenTemp,
    constraints,
  );

  // ── Scientific layer — con Q10 variabile (Audit Database) ──
  const { q10: sciQ10, model: sciQ10Model } = getQ10(yeastType, fermentationTempC);
  const effectiveHours18c =
    fermentationHours *
    Math.pow(sciQ10, (fermentationTempC - 18) / 10);

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
    q10_factor:
      Math.round(
        Math.pow(sciQ10, (fermentationTempC - 18) / 10) * 100,
      ) / 100,
    q10_model: sciQ10Model,
    authenticity_breakdown: authResult.breakdown,
    compensations: ovenCompensations.compensations,
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
  // Clamp to practical range: 2–40°C, null if outside
  const waterTempC = waterTempRaw >= 2 && waterTempRaw <= 40
    ? Math.round(waterTempRaw * 10) / 10
    : null;
  science.desired_dough_temp_c = ddt;
  science.friction_factor = frictionFactor;
  science.water_temp_c = waterTempC;

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

  return {
    schema_version: RECIPE_SCHEMA_VERSION,
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
    // ADV-04 fix: pick first method from process_type (biga|poolish → biga)
    pre_ferment_type: hasPreFerment
      ? (style.dough.process_type.split("|").find(m => m === "biga" || m === "poolish") ?? "poolish")
      : undefined,
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
export interface OptimizeObjectiveWeights {
  authenticity?: number;
  feasibility?: number;
  digestibility?: number;
  sustainability?: number;
  experimentation?: number;
}

export interface OptimizedCandidate {
  hydration: number;
  flour_w: number;
  fermentation_hours: number;
  fermentation_temp_c: number;
  use_pre_ferment: boolean;
  /** Valore dell'obiettivo (0-100) per questa combinazione. */
  objective_score: number;
  composite: number;
}

export interface OptimizedRecipe {
  /** Ricetta pronta da mostrare, generata con i parametri ottimi. */
  recipe: GeneratedRecipe;
  /** I parametri scelti dall'ottimizzatore. */
  params: {
    hydration: number;
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

  // ── Spazio ore: dentro la finestra dello stile, capato alle ore disponibili ──
  const avail = constraints.available_hours > 0 ? constraints.available_hours : Infinity;
  let hourCands = _uniqRounded(
    [fMin, (fMin + fMax) / 2, fMax, fMax * 1.25].filter((h) => h <= avail),
    0,
  );
  if (hourCands.length === 0) {
    // Anche il minimo dello stile è oltre il tempo disponibile: si fa il meglio possibile.
    hourCands = [Math.max(2, Math.min(fMin, avail === Infinity ? fMin : avail))];
  }

  // ── Spazio temperatura: frigo / cantina / ambiente (sfoglia non lievitata: TA) ──
  const tempCands = effStyle.dough.unleavened ? [20] : [4, 18, 22];

  // ── Spazio idratazione: range stile, capato dal livello dell'utente ──
  const hCeil = Math.min(hMax, _hydrationCeilingForSkill(constraints.skill_level));
  const hLo = Math.min(hMin, hCeil);
  const hydrCands = _uniqRounded([hLo, (hLo + hCeil) / 2, hCeil], 0);

  // ── Spazio farina: midpoint stile + match con la dispensa (se compatibile) ──
  const wMid = Math.round((wMin + wMax) / 2);
  const wCandSet: number[] = [wMid];
  for (const id of constraints.pantry_flours) {
    const r = FLOUR_W_RANGES[id];
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
  const objTotal =
    obj.authenticity + obj.feasibility + obj.digestibility + obj.sustainability + obj.experimentation || 1;

  let best: { cand: OptimizedCandidate; recipe: GeneratedRecipe } | null = null;
  const all: OptimizedCandidate[] = [];
  let evaluated = 0;

  for (const hours of hourCands) {
    for (const temp of tempCands) {
      for (const hydr of hydrCands) {
        for (const w of wCands) {
          for (const pref of prefCands) {
            const recipe = generateRecipe(style, constraints, {
              customHydration: hydr,
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
            const objScore =
              (s.authenticity * obj.authenticity +
                s.feasibility * obj.feasibility +
                s.digestibility * obj.digestibility +
                s.sustainability * obj.sustainability +
                s.experimentation * obj.experimentation) /
              objTotal;
            const cand: OptimizedCandidate = {
              hydration: hydr,
              flour_w: w,
              fermentation_hours: hours,
              fermentation_temp_c: temp,
              use_pre_ferment: pref,
              objective_score: Math.round(objScore * 10) / 10,
              composite: s.composite,
            };
            all.push(cand);
            // Selezione: massimo obiettivo; a pari merito preferisci più
            // fattibile, poi più digeribile (pizze "perfette" ma eseguibili).
            if (
              best === null ||
              objScore > best.cand.objective_score ||
              (Math.abs(objScore - best.cand.objective_score) < 0.05 &&
                (s.feasibility > best.recipe.scores.feasibility ||
                  (s.feasibility === best.recipe.scores.feasibility &&
                    s.digestibility > best.recipe.scores.digestibility)))
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
        `Maturazione ${r.fermentation_hours}h in frigo (${r.fermentation_temp_c}°C): massima digeribilità entro le tue ${constraints.available_hours}h.`,
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
  if (r.hydration_pct < hMidStyle - 1 && constraints.skill_level <= 2) {
    rationale.push(
      em(
        "opt.hydrationLowered",
        `Idratazione abbassata a ${r.hydration_pct}% (canonica ${hMidStyle}%) per restare gestibile al tuo livello.`,
        { h: r.hydration_pct, canonical: hMidStyle },
      ),
    );
  } else if (r.hydration_pct >= hMidStyle) {
    rationale.push(
      em("opt.hydrationForStyle", `Idratazione ${r.hydration_pct}% nel cuore dello stile.`, { h: r.hydration_pct }),
    );
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
  if (r.oven_temp_c < style.baking.temp_c_ideal) {
    rationale.push(
      em("opt.ovenAdapted", `Cottura adattata al tuo forno (${r.oven_temp_c}°C) con compensazioni automatiche.`, {
        temp: r.oven_temp_c,
      }),
    );
  }
  const fromPantry = constraints.pantry_flours.some((id) => {
    const range = FLOUR_W_RANGES[id];
    return range && r.flour_w >= range[0] - 1 && r.flour_w <= range[1] + 1;
  });
  if (fromPantry && Math.abs(r.flour_w - wMidStyle) < 15) {
    // Farina della dispensa che coincide già con la canonica (nessun cambiamento).
    rationale.push(em("opt.pantryFlour", `Forza farina W${r.flour_w} compatibile con la tua dispensa.`, { w: r.flour_w }));
  }

  const alternatives = all
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

export interface EquipmentContext {
  mixerType?: string | null;
  hasMixer?: boolean;
  ovenType?: OvenType;
  surfaces?: string[];
}

interface KneadGuidance {
  description: string;
  duration_minutes: number;
  tip: { beginner: string; nerd: string };
}

function mixerKneadGuidance(eq?: EquipmentContext): KneadGuidance {
  switch (eq?.mixerType) {
    case "spiral":
      return {
        description: "Impastatrice a spirale: 1ª velocità 4-5 min per amalgamare, poi 2ª velocità 3-4 min fino a incordatura.",
        duration_minutes: 9,
        tip: {
          beginner: "La spirale scalda poco l'impasto: gestisce bene anche le idratazioni alte.",
          nerd: "Basso attrito termico (ΔT ~3°C): imita il movimento manuale, sviluppa glutine senza surriscaldare né ossidare.",
        },
      };
    case "fork":
      return {
        description: "Impastatrice a forcella: 12-15 min a velocità unica. Incordatura lenta, maglia molto estensibile.",
        duration_minutes: 14,
        tip: {
          beginner: "Delicata e ossigenante: perfetta per alta idratazione, ma serve pazienza.",
          nerd: "Movimento lento e ossigenante: ideale per impasti molli; incorda meno aggressivamente, estensibilità elevata.",
        },
      };
    case "planetary":
      return {
        description: "Planetaria: gancio a velocità 2, ~8-10 min fino a incordatura completa (test del velo).",
        duration_minutes: 10,
        tip: {
          beginner: "Parti in 1ª per amalgamare, poi passa in 2ª. Pronto quando l'impasto si avvolge al gancio e si stacca dalle pareti.",
          nerd: "Sorveglia la temperatura impasto: oltre 26-28°C il glutine si indebolisce. Usa acqua fredda se la ciotola scalda.",
        },
      };
    case "stand_domestic":
      return {
        description: "Planetaria domestica (tipo KitchenAid): gancio a velocità 1-2, ~10-12 min. Pause di 1-2 min se la ciotola si scalda.",
        duration_minutes: 12,
        tip: {
          beginner: "Non superare la 2ª velocità: il motore domestico fatica e scalda. Pronto = impasto liscio che si stacca dal fondo.",
          nerd: "Trasferisce più calore per attrito (K~0.25): parti con acqua a frigo e impasti corti, non sovraccaricare il motore.",
        },
      };
    case "hands":
      break; // gestito sotto
    default:
      if (eq?.hasMixer) {
        return {
          description: "Con l'impastatrice: gancio a bassa velocità ~10 min fino a incordatura. Liscio ed elastico.",
          duration_minutes: 10,
          tip: {
            beginner: "Pronto quando l'impasto si avvolge al gancio e si stacca dalle pareti.",
            nerd: "Controlla la temperatura finale dell'impasto (~24°C): oltre, il glutine si degrada.",
          },
        };
      }
  }
  // A mano (default)
  return {
    description: "Impastare a mano fino a incordatura (~15-20 min): pieghe sul piano, slap & fold se l'idratazione è alta.",
    duration_minutes: 20,
    tip: {
      beginner: "L'impasto è pronto quando è liscio e si stacca dalle mani. Se appiccica troppo, aspetta 5 min e riprova.",
      nerd: "L'incordatura avviene quando glutenina e gliadina formano ponti disolfuro stabili. Il test del velo verifica la maglia glutinica.",
    },
  };
}

/** Setup forno specifico per tipo: "a quanto metto le resistenze". */
function ovenBakeSetup(eq: EquipmentContext | undefined, _ovenTemp: number): string {
  const hasStone = (eq?.surfaces ?? []).some((s) =>
    ["refractory_brick", "cordierite_stone", "steel_plate"].includes(s),
  );
  switch (eq?.ovenType) {
    case "wood":
      return " Forno a legna: platea pulita, fiamma viva sulla cupola. Inforna vicino alla bocca e ruota di 180° dopo 30-40s per leopardare uniformemente.";
    case "electric_high":
      return " Forno elettrico ad alta T: massima potenza, pietra ben preriscaldata. Gira la pizza a metà cottura per dorare il cornicione tutt'intorno.";
    case "gas":
      return " Forno a gas: fiamma al massimo, pietra sul ripiano per il calore dal basso; ruota la pizza a metà per uniformare.";
    case "home":
    case "electric_standard":
    default:
      return ` Forno statico (resistenza sopra + sotto) al massimo${hasStone ? ", pietra/acciaio già caldi sul ripiano medio-alto" : ", ripiano medio-alto"}. Per il cornicione: ultimi 60-90s sotto il grill (solo resistenza superiore al max), sorvegliando a vista.`;
  }
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
): TimelineStep[] {
  const steps: TimelineStep[] = [];

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
      description: `Mescolare ${style.dough.process_type.includes("poolish") ? "poolish" : "biga"} e far maturare`,
      duration_minutes: Math.round(fermentHours * 60 * 0.4),
      icon: "beaker",
      timing_label: `${Math.round(fermentHours * 0.4)}h prima`,
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
  steps.push({
    id: "mix",
    title: "Impasto",
    description: isNoKnead
      ? "Mescolare gli ingredienti senza impastare, fino a sciogliere i grumi. Poi 3 giri di pieghe (stretch & fold) a intervalli di ~30 min nelle prime 1,5–2 ore."
      : (knead as KneadGuidance).description,
    duration_minutes: isNoKnead ? 10 : (knead as KneadGuidance).duration_minutes,
    icon: "hand",
    timing_label: "Inizio",
    tip: isNoKnead
      ? {
          beginner:
            "Non serve impastare! Mescola finché non ci sono grumi asciutti. Poi, ogni ~30 min, bagna le mani, afferra un lembo, tiralo verso l'alto e ripiegalo al centro ruotando la ciotola: bastano 3 giri da 4 pieghe.",
          nerd: "L'autolisi sviluppa il glutine senza lavoro meccanico; le pieghe a intervalli (stretch & fold) allineano e tendono le fibrille di glutine e redistribuiscono i gas, dando forza senza degassare.",
        }
      : (knead as KneadGuidance).tip,
  });

  steps.push({
    id: "bulk",
    title: "Puntata",
    description: `Lievitazione in massa a ${fermentTemp}°C`,
    duration_minutes: Math.round(
      fermentHours * 60 * (hasPreFerment ? 0.4 : 0.6),
    ),
    icon: "clock",
    timing_label: formatDuration(
      Math.round(fermentHours * (hasPreFerment ? 0.4 : 0.6)),
    ),
    tip:
      fermentTemp <= 6
        ? {
            beginner:
              "In frigo l'impasto cresce lento ma guadagna sapore. Copri bene con pellicola a contatto.",
            nerd: `A ${fermentTemp}°C il Q₁₀≈2.0 rallenta la fermentazione. L'attività proteolitica prevale, degradando i FODMAP.`,
          }
        : {
            beginner:
              "L'impasto deve raddoppiare di volume. Se fa caldo, controlla più spesso!",
            nerd: `A ${fermentTemp}°C la velocità di fermentazione è ${Math.pow(2, (fermentTemp - 18) / 10).toFixed(1)}× rispetto al riferimento 18°C.`,
          },
  });

  // ─── STAGLIO (layout-aware: descrizione cambia con pieces_per_unit) ───
  const layout = getLayoutSpec(style);
  const isMultiPiece = (layout.pieces_per_unit ?? 1) > 1;
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
    description: isMultiPiece
      ? `Dividere in ${layout.pieces_per_unit} pezzi uguali per ogni unità. Formare pallina o disco.`
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

  /* ─── APPRETTO + PRERISCALDO (audit roleplay giugno 2026) ───
   * Nessuna timeline diceva di ACCENDERE IL FORNO: si infornava a freddo.
   * Il preriscaldo ruba i minuti finali dell'appretto (avviene in parallelo:
   * i panetti finiscono di lievitare mentre il forno va in temperatura),
   * così il totale resta identico e l'orario del promemoria è esatto. */
  const proofMinutes = Math.round(
    fermentHours * 60 * (hasPreFerment ? 0.2 : 0.4),
  );
  const ovenTempForPreheat = Math.round(actualOvenTemp ?? style.baking.temp_c_ideal);
  const idealPreheat =
    ovenTempForPreheat >= 400 ? 60 : ovenTempForPreheat >= 300 ? 45 : 30;
  const preheatMinutes = Math.min(idealPreheat, Math.max(0, proofMinutes - 30));

  steps.push({
    id: "proof",
    title: "Appretto",
    description: `Lievitazione finale a ${Math.max(fermentTemp, 18)}°C`,
    duration_minutes: proofMinutes - preheatMinutes,
    icon: "timer",
    timing_label: formatDuration(
      Math.round((proofMinutes - preheatMinutes) / 60),
    ),
    tip: {
      beginner:
        "I panetti devono essere morbidi. Se li premi con un dito, tornano su lentamente.",
      nerd: "Poke test: ritorno lento = fermentazione ottimale. Troppo rapido = sotto-lievitato. Nessun ritorno = over-proofed.",
    },
  });

  if (preheatMinutes > 0) {
    steps.push({
      id: "preheat",
      title: "Forno al massimo",
      description: `Accendi ora il forno a ${ovenTempForPreheat}°C${preheatMinutes >= 45 ? " (pietra o acciaio già dentro)" : ""}. Intanto i panetti finiscono l'appretto.`,
      duration_minutes: preheatMinutes,
      icon: "flame",
      timing_label: `${preheatMinutes} min`,
      tip: {
        beginner:
          "Forno ben caldo = base che si stacca e cornicione che spinge. Non avere fretta: aspetta che arrivi a temperatura.",
        nerd: `La massa termica della superficie domina il primo minuto di cottura: ${preheatMinutes} min di soak assicurano che pietra/acciaio siano saturi, non solo l'aria del forno.`,
      },
    });
  }

  // ─── STESURA (layout-aware) ───
  let shapeDesc: string;
  if (layout.type === "folded_layers") {
    shapeDesc = `Stendere una sfoglia sottilissima e ripiegare ${layout.folds ?? 4} volte a libro, distribuendo la farcitura tra le pieghe.`;
  } else if (layout.type === "double_thin_sheet") {
    shapeDesc = "Stendere due sfoglie sottilissime quasi trasparenti col mattarello.";
  } else if (layout.type === "stacked") {
    shapeDesc = "Stendere il primo disco nella teglia oliata; tenere il secondo da parte.";
  } else if (layout.type === "closed_stuffed") {
    shapeDesc = "Stendere il disco di base in teglia, lasciando il secondo per la chiusura.";
  } else {
    shapeDesc =
      style.shape.shape_type === "rectangular"
        ? "Stendere nella teglia oliata con le mani"
        : style.crust_type === "crispy_thin"
          ? "Stendere con mattarello, sottilissima"
          : "Allargare a mano dal centro, preservare il cornicione";
  }
  steps.push({
    id: "shape",
    title: "Stesura",
    description: shapeDesc,
    duration_minutes: layout.type === "folded_layers" ? 10 : 5,
    icon: "expand",
    timing_label: layout.type === "folded_layers" ? "10 min" : "5 min",
  });

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
    steps.push({
      id: "stack",
      title: "Sovrapposizione",
      description:
        "Spennellare il primo disco con olio EVO; adagiare sopra il secondo disco e sigillare leggermente i bordi.",
      duration_minutes: 3,
      icon: "layers",
      timing_label: "3 min",
      tip: {
        beginner:
          "L'olio in mezzo permetterà di separare i due strati dopo la cottura senza romperli.",
        nerd: "L'olio crea un layer idrofobo che impedisce la coalescenza dei due strati di glutine: facilita lo sdoppiamento post-bake.",
      },
    });
    // Topping step in after_stack (es. patate sopra per Patate e Porchetta)
    injectToppingAt("after_stack");
  } else if (layout.type === "closed_stuffed" && layout.filling_timing === "pre_bake_internal") {
    // Ciaccino: ripieno + chiusura sigillata
    const internalFillReplaced = topping?.assembly_steps?.some(
      (s) => s.insert_at === "after_fill_internal" && s.replaces_generic,
    );
    if (!internalFillReplaced) {
      steps.push({
        id: "fill_internal",
        title: "Ripieno e chiusura",
        description:
          "Disporre la farcitura sul disco di base; coprire con il secondo disco e sigillare bene tutto il bordo.",
        duration_minutes: 8,
        icon: "chef-hat",
        timing_label: "8 min",
        tip: {
          beginner:
            "Sigilla con cura: se i bordi non chiudono, in cottura il ripieno fuoriesce.",
          nerd: "La pressione del bordo è critica: l'aria intrappolata gonfia durante la cottura (effetto pillow).",
        },
      });
    }
    injectToppingAt("after_fill_internal");
  } else if (layout.type === "double_thin_sheet") {
    // Recco: sfoglia inferiore + stracchino + sfoglia superiore
    const internalFillReplaced = topping?.assembly_steps?.some(
      (s) => s.insert_at === "after_fill_internal" && s.replaces_generic,
    );
    if (!internalFillReplaced) {
      steps.push({
        id: "fill_internal",
        title: "Farcitura tra sfoglie",
        description:
          "Distribuire lo stracchino a fiocchi sulla prima sfoglia; coprire con la seconda sfoglia e sigillare i bordi.",
        duration_minutes: 5,
        icon: "chef-hat",
        timing_label: "5 min",
      });
    }
    injectToppingAt("after_fill_internal");
  } else if (layout.filling_timing === "pre_bake" || layout.cook_mode === "topped") {
    // Default: farcitura pre-cottura classica
    // Se il topping ha già inserito uno step "replaces_generic" in after_shape, non aggiungere il generico
    if (!toppingReplacesGenericTop) {
      steps.push({
        id: "top",
        title: "Farcitura",
        description: topping
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
  const ovenTempLabel = Math.round(baseTempC + (topping?.bake_adjustments?.temperature_delta_c ?? 0));
  const effectiveCookSec = cookTimeSec + (topping?.bake_adjustments?.additional_minutes ?? 0) * 60;
  if (layout.cook_mode === "white_then_top") {
    // Baciata: cottura in bianco
    const firstBakeMin = Math.max(8, Math.round((effectiveCookSec / 60) * 0.65));
    const secondBakeMin = Math.max(3, Math.round((effectiveCookSec / 60) * 0.35));
    steps.push({
      id: "bake",
      title: "Prima cottura (in bianco)",
      description: `Cuocere a ${ovenTempLabel}°C senza farcitura. La pizza deve essere dorata ma non bruciata.${topping?.bake_adjustments?.note ? ` ${topping.bake_adjustments.note}` : ""}${ovenBakeSetup(equipment, ovenTempLabel)}`,
      duration_minutes: firstBakeMin,
      icon: "flame",
      timing_label: `${firstBakeMin} min`,
      tip: {
        beginner: "In bianco la pizza cuoce più velocemente. Sorveglia gli ultimi minuti.",
        nerd: "La cottura in bianco completa la gelatinizzazione dell'amido prima di introdurre umidità del topping.",
      },
    });
    injectToppingAt("after_bake");
    const splitReplaced = injectToppingAt("after_split_fill");
    if (!splitReplaced) {
      steps.push({
        id: "split_fill",
        title: "Sdoppiamento e farcitura",
        description:
          "Estrarre dal forno. Con un coltello a sega tagliare orizzontalmente in due metà. Farcire l'interno con i condimenti scelti e richiudere.",
        duration_minutes: 7,
        icon: "scissors",
        timing_label: "7 min",
        tip: {
          beginner:
            "Lo strato d'olio steso prima della cottura permette di aprire le due metà senza romperle.",
          nerd: "Sdoppiamento post-bake = ricetta cold-filled: la matrice amidacea è già stabile, le farciture non vengono cotte oltre i 60°C interni.",
        },
      });
    }
    steps.push({
      id: "bake2",
      title: "Seconda cottura (breve)",
      description: `Riportare in forno a ${ovenTempLabel}°C solo per asciugare e amalgamare. Pochi minuti.`,
      duration_minutes: secondBakeMin,
      icon: "flame",
      timing_label: `${secondBakeMin} min`,
    });
    injectToppingAt("after_bake2");
  } else {
    // Cottura singola classica
    steps.push({
      id: "bake",
      title: "Cottura",
      description: `Cuocere a ${ovenTempLabel}°C${topping?.bake_adjustments?.note ? `. ${topping.bake_adjustments.note}` : ""}.${ovenBakeSetup(equipment, ovenTempLabel)}`,
      duration_minutes: Math.round(effectiveCookSec / 60),
      icon: "flame",
      timing_label: formatCookTime(effectiveCookSec),
      tip: {
        beginner:
          "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
        nerd: `La reazione di Maillard inizia a ~140°C e accelera esponenzialmente. A ${ovenTempLabel}°C la caramellizzazione crea ~600 composti aromatici.`,
      },
    });

    // Farcitura post-cottura esterna (es. Marinella ma non sdoppiata)
    if (layout.filling_timing === "post_bake_external") {
      steps.push({
        id: "top_post",
        title: "Farcitura post-cottura",
        description: "Aggiungere i condimenti a freddo direttamente sulla superficie cotta.",
        duration_minutes: 3,
        icon: "chef-hat",
        timing_label: "3 min",
      });
    }
    injectToppingAt("after_bake");
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
    id: "gas",
    name: "Gas Professionale",
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
    id: "wood",
    name: "Forno a Legna",
    maxTemp: 500,
    icon: "flame-kindling",
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
    description: "Prime esperienze con la pizza",
  },
  {
    level: 2,
    name: "Intermedio",
    description: "Ho fatto pizza diverse volte",
  },
  {
    level: 3,
    name: "Avanzato",
    description: "Conosco le tecniche e i parametri",
  },
  {
    level: 4,
    name: "Esperto",
    description: "Padronanza completa delle tecniche",
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
  /** Audit role-play giugno 2026: composite della ricetta OTTIMIZZATA per i vincoli
   *  dell'utente — il punteggio che otterrai davvero aprendo lo stile. Popolato
   *  dalla UI (recommended-styles) via optimizeRecipe; il ranking/tier resta sulla
   *  compatibilità, ma il badge mostra questo. */
  optimizedComposite?: number;
}

export interface TimeSlot {
  id: string;
  label: string;
  sublabel: string;
  hours: number;
  emoji: string;
}

/** VPL-065: Kept as legacy fallback — consumers should prefer generateTimeSlots() */
const TIME_SLOTS: TimeSlot[] = [
  {
    id: "tonight",
    label: "Stasera",
    sublabel: "4-6 ore",
    hours: 5,
    emoji: "🌙",
  },
  {
    id: "tomorrow_lunch",
    label: "Domani a pranzo",
    sublabel: "16-20 ore",
    hours: 18,
    emoji: "☀️",
  },
  {
    id: "tomorrow_dinner",
    label: "Domani sera",
    sublabel: "24-28 ore",
    hours: 26,
    emoji: "🌆",
  },
  {
    id: "day_after",
    label: "Dopodomani",
    sublabel: "40-48 ore",
    hours: 44,
    emoji: "📅",
  },
  {
    id: "long_ferment",
    label: "Lunga maturazione",
    sublabel: "72+ ore",
    hours: 72,
    emoji: "🕐",
  },
];

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

const MEAL_HOURS: Record<string, number> = { lunch: 12.5, dinner: 20 };
const MIN_PREP_HOURS = 3;

function formatHoursLabel(h: number): string {
  // Difensivo: se il calcolo dà un valore negativo (slot nel passato), skip.
  if (h <= 0) return "passato";
  if (h < 1) return "<1 ora";
  if (h < 2) return "~1 ora";
  return `~${Math.round(h)} ore`;
}

function getDayLabel(dayOffset: number, meal: string, now: Date): string {
  const weekday = now.getDay();
  const DAYS_IT = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  if (dayOffset === 0) return "Stasera";
  if (dayOffset === 1) return meal === "lunch" ? "Domani a pranzo" : "Domani sera";
  const targetDay = DAYS_IT[(weekday + dayOffset) % 7];
  return meal === "lunch" ? `${targetDay} a pranzo` : `${targetDay} sera`;
}

/** No-preference virtual slot: engine uses 24h @ kitchen temp */
export const NO_PREFERENCE_SLOT: TimeSlot = {
  id: "no_preference",
  label: "Nessuna preferenza",
  sublabel: "ci pensa Vulcan",
  hours: 24,
  emoji: "⏳",
};

export function generateTimeSlots(now: Date = new Date()): TimeSlot[] {
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const slots: TimeSlot[] = [];

  for (const target of MEAL_TARGETS) {
    const mealHour = MEAL_HOURS[target.meal];
    const hoursUntil = target.dayOffset * 24 + (mealHour - nowHour);

    if (hoursUntil < MIN_PREP_HOURS) continue;
    if (slots.length >= 4) break;

    slots.push({
      id: target.id,
      label: getDayLabel(target.dayOffset, target.meal, now),
      sublabel: formatHoursLabel(hoursUntil),
      hours: Math.round(hoursUntil),
      emoji: target.emoji,
    });
  }

  if (slots.length === 0) {
    slots.push({
      id: "tomorrow_lunch",
      label: "Domani a pranzo",
      sublabel: formatHoursLabel(24 - nowHour + 12.5),
      hours: Math.round(24 - nowHour + 12.5),
      emoji: "☀️",
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
};

export function recommendStyles(
  constraints: UserConstraints,
  stylesOverride?: Record<string, PizzaStyle>,
  recWeights?: RecWeightsOverride,
): StyleRecommendation[] {
  const allStyles = Object.values(stylesOverride ?? STYLES_DB);
  const recommendations: StyleRecommendation[] = [];

  // Pre-compute pantry W ranges for flour matching
  const pantryWRanges = constraints.pantry_flours
    .map((id) => FLOUR_W_RANGES[id])
    .filter(Boolean);
  const hasPantryFlours = pantryWRanges.length > 0;
  const hasPantryYeasts = constraints.pantry_yeasts.length > 0;

  for (const style of allStyles) {
    const reasons: EngineMsg[] = [];
    const warnings: EngineMsg[] = [];
    let score = 0;

    // ── Time compatibility (25%) ──
    const [fMin, fMax] = style.dough.fermentation_hours_range;
    let timeScore: number;
    if (
      constraints.available_hours >= fMin &&
      constraints.available_hours <= fMax * 1.5
    ) {
      timeScore = 95;
      reasons.push(em("rec.timeCompatible", `Fermentazione ${fMin}-${fMax}h: compatibile con il tuo tempo`, { fMin, fMax }));
    } else if (constraints.available_hours >= fMin * 0.85) {
      /* Audit roleplay giugno 2026: il gradino 95→65 era brutale — 21h vs
       * 24h minime (-12%) non deve far sparire i classici dai consigli. */
      timeScore = 85;
      const optimalHours = Math.min(constraints.available_hours, fMax);
      reasons.push(em("rec.timeAdaptable", `Fermentazione adattabile a ~${optimalHours}h`, { hours: optimalHours }));
    } else if (constraints.available_hours >= fMin * 0.7) {
      timeScore = 65;
      const optimalHours = Math.min(constraints.available_hours, fMax);
      reasons.push(em("rec.timeAdaptable", `Fermentazione adattabile a ~${optimalHours}h`, { hours: optimalHours }));
    } else {
      timeScore = 25;
      warnings.push(em("rec.timeInsufficient", `Richiede minimo ${fMin}h, hai ${constraints.available_hours}h`, { fMin, available: constraints.available_hours }));
    }

    // ── Oven compatibility (25%) ──
    let ovenScore: number;
    if (style.requires_wood_oven && constraints.oven_type !== "wood") {
      ovenScore = 30;
      warnings.push(em("rec.needsWoodOven", "Richiede forno a legna"));
    } else if (constraints.oven_max_temp_c >= style.baking.temp_c_ideal) {
      ovenScore = 95;
      reasons.push(em("rec.ovenIdeal", "Il tuo forno raggiunge la temperatura ideale ({ideal})", { ideal: style.baking.temp_c_ideal }));
    } else if (constraints.oven_max_temp_c >= style.baking.temp_c_range[0]) {
      ovenScore = 70;
      reasons.push(em("rec.ovenAdequate", "Forno adeguato (compensazione automatica tempo/temperatura)"));
    } else {
      ovenScore = 30;
      warnings.push(em("rec.ovenTooCold", "Forno troppo freddo: {temp} < min {min}", { temp: constraints.oven_max_temp_c, min: style.baking.temp_c_range[0] }));
    }

    // ── Skill compatibility (20%) ──
    let skillScore: number;
    const hCenter =
      (style.dough.hydration_pct_range[0] +
        style.dough.hydration_pct_range[1]) /
      2;

    if (
      style.suitable_for_beginner &&
      constraints.skill_level >= 1
    ) {
      skillScore = 95;
      if (constraints.skill_level <= 2)
        reasons.push(em("rec.skillMatch", "Adatto al tuo livello"));
    } else if (constraints.skill_level >= 3) {
      skillScore = 90;
      reasons.push(em("rec.skillExpert", "Il tuo livello permette qualsiasi stile"));
    } else if (constraints.skill_level === 2) {
      skillScore = hCenter > 75 ? 50 : 75;
      if (hCenter > 75)
        warnings.push(em("rec.hydrationNeedsPractice", "Idratazione alta richiede pratica"));
    } else {
      skillScore = hCenter > 65 ? 30 : 60;
      if (!style.suitable_for_beginner)
        warnings.push(em("rec.advancedForBeginner", "Stile avanzato per principianti"));
    }

    // ── Equipment bonus (10%) — enhanced with mixer_type & surfaces ──
    let equipScore = 70;
    const mixerType = constraints.mixer_type;
    const userSurfaces = constraints.surfaces ?? [];
    const hasSurfaces = userSurfaces.length > 0;

    // Mixer scoring — uses advanced mixer_type when available
    if (style.dough.process_type.includes("no_knead")) {
      equipScore = 90;
      if (!constraints.has_mixer)
        reasons.push(em("rec.noKneadNoMixer", "Non serve impastatrice (no-knead)"));
    } else if (mixerType) {
      if (mixerType === "hands") {
        if (hCenter > 75) {
          equipScore = 35;
          warnings.push(em("rec.handsHighHydration", "Idratazione alta: impasto a mano molto difficile"));
        } else if (hCenter > 65) {
          equipScore = 55;
          warnings.push(em("rec.handsMedHydration", "Idratazione media-alta: impasto a mano richiede pratica"));
        } else {
          equipScore = 75;
        }
      } else if (mixerType === "fork") {
        equipScore = hCenter > 75 ? 98 : 90;
        if (hCenter > 75) reasons.push(em("rec.forkIdealHighH", "Forcella ideale per alta idratazione"));
        else reasons.push(em("rec.forkLowFriction", "Impastatrice a forcella: basso attrito termico"));
      } else if (mixerType === "spiral") {
        equipScore = 95;
        reasons.push(em("rec.spiralOptimal", "Spirale professionale: impasto ottimale"));
      } else if (mixerType === "planetary" || mixerType === "stand_domestic") {
        equipScore = mixerType === "planetary" ? 88 : 80;
        if (hCenter > 80 && mixerType === "stand_domestic") {
          equipScore = 60;
          warnings.push(em("rec.domesticStrugglesHighH", "Planetaria domestica: può faticare con idratazione >80%"));
        } else {
          reasons.push(em("rec.mixerHelps", "La tua impastatrice facilita il processo"));
        }
      }
    } else if (constraints.has_mixer) {
      equipScore = 90;
      reasons.push(em("rec.mixerHelps", "La tua impastatrice facilita il processo"));
    } else if (hCenter > 70) {
      equipScore = 50;
      warnings.push(em("rec.mixerRecommended", "Idratazione alta: impastatrice consigliata"));
    }

    // Surface scoring — enhanced with specific surface types
    if (hasSurfaces) {
      // Map surfaces to style compatibility
      const styleId = style.id;
      const panStyles = [
        "teglia_romana", "detroit", "chicago_deep", "grandma_style",
        "focaccia_genovese", "sfincione", "padellino_torino",
      ];
      const stoneStyles = [
        "napoletana_stg", "napoletana_canotto", "tonda_romana",
        "pinsa_romana", "pala_romana", "new_york", "focaccia_recco",
      ];

      const hasPanSurface = userSurfaces.some((s) =>
        ["aluminum_pan", "blue_steel_pan", "cast_iron"].includes(s),
      );
      const hasStoneSurface = userSurfaces.some((s) =>
        ["refractory_brick", "cordierite_stone", "steel_plate"].includes(s),
      );

      if (panStyles.includes(styleId)) {
        if (hasPanSurface) {
          // Check for ideal surface match
          const hasCastIron = userSurfaces.includes("cast_iron");
          if (
            (styleId === "chicago_deep" || styleId === "padellino_torino" || styleId === "detroit") &&
            hasCastIron
          ) {
            equipScore = Math.min(100, equipScore + 18);
            reasons.push(em("rec.castIronPerfect", "Ghisa perfetta per questo stile"));
          } else {
            equipScore = Math.min(100, equipScore + 15);
            reasons.push(em("rec.panFits", "Teglia adatta a questo stile"));
          }
        } else {
          equipScore = Math.max(20, equipScore - 20);
          warnings.push(em("rec.needsPan", "Serve una teglia per questo stile"));
        }
      } else if (stoneStyles.includes(styleId)) {
        if (hasStoneSurface) {
          // Steel plate is fastest for NY/tonda
          const hasSteel = userSurfaces.includes("steel_plate");
          const hasRefractory = userSurfaces.includes("refractory_brick");
          if (
            (styleId === "napoletana_stg" || styleId === "napoletana_canotto") &&
            hasRefractory
          ) {
            equipScore = Math.min(100, equipScore + 18);
            reasons.push(em("rec.refractoryIdeal", "Biscotto refrattario: ideale per la napoletana"));
          } else if (
            (styleId === "new_york" || styleId === "tonda_romana") &&
            hasSteel
          ) {
            equipScore = Math.min(100, equipScore + 15);
            reasons.push(em("rec.steelPlateCrispy", "Piastra in acciaio: base croccante in secondi"));
          } else {
            equipScore = Math.min(100, equipScore + 10);
          }
        }
      }
    } else {
      // Fallback to legacy booleans
      if (
        constraints.has_pizza_stone ||
        constraints.has_pizza_steel
      ) {
        equipScore = Math.min(100, equipScore + 10);
      }

      // Pan bonus/malus for pan-based styles
      if (style.shape.shape_type === "rectangular") {
        if (constraints.has_baking_pan) {
          equipScore = Math.min(100, equipScore + 15);
          reasons.push(em("rec.panPerfect", "La tua teglia è perfetta per questo stile"));
        } else {
          equipScore = Math.max(20, equipScore - 20);
          warnings.push(em("rec.needsPan", "Serve una teglia per questo stile"));
        }
      }
    }

    // ── Pantry compatibility (20% — only when pantry is populated) ──
    let pantryScore = 80; // neutral default when pantry not filled

    if (hasPantryFlours) {
      // Check if any user flour's W range overlaps with style requirement
      const [styleWMin, styleWMax] = style.dough.flour_w_range;
      const hasFlourMatch = pantryWRanges.some(
        ([pMin, pMax]) =>
          pMin <= styleWMax && pMax >= styleWMin,
      );
      if (hasFlourMatch) {
        pantryScore = 95;
        reasons.push(em("rec.flourMatch", "Farina in dispensa compatibile"));
      } else {
        // Check how close the closest flour is
        const closestGap = pantryWRanges.reduce(
          (minGap, [pMin, pMax]) => {
            const gap =
              pMax < styleWMin
                ? styleWMin - pMax
                : pMin - styleWMax;
            return Math.min(minGap, Math.max(0, gap));
          },
          Infinity,
        );
        if (closestGap <= 40) {
          pantryScore = 60;
          warnings.push(em("rec.flourPartial", "Farina parzialmente adatta (W non ideale)"));
        } else {
          pantryScore = 30;
          warnings.push(em("rec.flourNoMatch", "Nessuna farina in dispensa nel range W richiesto"));
        }
      }
    }

    if (hasPantryYeasts) {
      const hasSourdough =
        constraints.pantry_yeasts.includes("sourdough");
      const hasCommercial =
        constraints.pantry_yeasts.includes("fresh") ||
        constraints.pantry_yeasts.includes("dry");

      // Sourdough bonus for long-ferment/pre-ferment styles
      if (
        hasSourdough &&
        (style.requires_pre_ferment || fMax >= 24)
      ) {
        pantryScore = Math.min(100, pantryScore + 8);
        reasons.push(em("rec.sourdoughLongFerment", "Lievito madre ideale per maturazione lunga"));
      }

      // Warning if only sourdough but style needs short ferment
      if (hasSourdough && !hasCommercial && fMax < 8) {
        pantryScore = Math.max(20, pantryScore - 20);
        warnings.push(em("rec.sourdoughOnlyShort", "Solo lievito madre: fermentazione breve difficile"));
      }

      // No commercial yeast warning for styles needing precise timing
      if (!hasCommercial && !hasSourdough) {
        pantryScore = Math.max(30, pantryScore - 15);
      }
    }

    // ── Weighted composite — pantry takes 20% from time/oven/skill ──
    const rw = {
      time: recWeights?.time ?? 0.25,
      oven: recWeights?.oven ?? 0.25,
      skill: recWeights?.skill ?? 0.20,
      equipment: recWeights?.equipment ?? 0.10,
      pantry: recWeights?.pantry ?? 0.20,
    };
    score = Math.round(
      timeScore * rw.time +
        ovenScore * rw.oven +
        skillScore * rw.skill +
        equipScore * rw.equipment +
        pantryScore * rw.pantry,
    );


    // ── Digestibility estimate ──
    const estFermentHours = Math.min(
      constraints.available_hours,
      fMax,
    );
    const estTemp = defaultFermentTempC(style, estFermentHours);
    const digestResult = calculateDigestibilityScore(
      estFermentHours,
      estTemp,
      style.requires_pre_ferment,
      0.3,
    );

    // ── Tier classification — Audit Sprint 12:
    //    Aggiunto "not_feasible" per stili con incompatibilità dura (es. wood-oven
    //    richiesto ma utente ha elettrico) o score molto basso. Permette di mostrare
    //    cosa NON puoi fare e perché, oltre a cosa puoi fare. ──
    let tier: "perfect" | "good" | "challenging" | "not_feasible";
    const hasHardBlocker =
      (style.requires_wood_oven && constraints.oven_type !== "wood") ||
      (style.requires_pre_ferment === true &&
        constraints.skill_level === 1);
    if (score < 30 || hasHardBlocker) tier = "not_feasible";
    else if (score >= 78) tier = "perfect";
    else if (score >= 55) tier = "good";
    else tier = "challenging";

    const rankingScore = score + (ICONIC_BOOST[style.id] ?? 0);

    recommendations.push({
      style,
      compatibilityScore: score,
      rankingScore,
      feasibilityScore: Math.round(
        ovenScore * 0.5 + skillScore * 0.3 + equipScore * 0.2,
      ),
      digestibilityEstimate: digestResult.score,
      tier,
      reasons: reasons.slice(0, 3),
      warnings: warnings.slice(0, 2),
    });
  }

  // Sort by compatibility descending.
  // Prior di rappresentatività (audit giugno 2026): il boost iconico pesa SOLO
  // sull'ordinamento — punteggi e tier restano onesti. A parità di vincoli i
  // classici emergono sulle rarità regionali (senza prior, "Perfetti per te"
  // proponeva Ciaccino Senese e Pizza Fritta prima di Napoletana e Teglia).
  recommendations.sort(
    (a, b) =>
      b.rankingScore - a.rankingScore ||
      b.compatibilityScore - a.compatibilityScore,
  );
  return recommendations;
}

// ═══ SUSTAINABILITY CALCULATION ═══

function calculateSustainabilityScore(
  style: PizzaStyle,
  ovenTemp: number,
  cookTimeSec: number,
  fermentationTempC: number,
  doughBalls: number,
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
    claims.push(em("sust.quickCook", "Cottura rapida: basso consumo energetico"));
  } else if (cookTimeSec <= 600) {
    cookEfficiency = 80;
  } else if (cookTimeSec <= 1200) {
    cookEfficiency = 60;
  } else {
    cookEfficiency = 40;
    claims.push(em("sust.longCook", "Cottura lunga: consumo energetico elevato"));
  }

  // ── Fermentation efficiency (20%): ambient temp = no fridge energy ──
  let ferEfficiency: number;
  if (fermentationTempC >= 18 && fermentationTempC <= 26) {
    ferEfficiency = 95;
    claims.push(em("sust.ambientFerment", "Fermentazione a temperatura ambiente: nessun consumo frigorifero"));
  } else if (fermentationTempC <= 4) {
    ferEfficiency = 55;
  } else {
    ferEfficiency = 70;
  }

  // ── Ingredient simplicity (15%): fewer additives ──
  let ingredientScore = 80;
  if (!style.allows_additives) {
    ingredientScore = 95;
    claims.push(em("sust.pureDough", "Impasto puro: solo farina, acqua, sale, lievito"));
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
    claims.push(em("sust.sourdoughZeroImpact", "Lievito madre: autoprodotto, a impatto zero"));
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
