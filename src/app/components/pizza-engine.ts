// ═══ VULCAN PIZZA ENGINE ═══
// Scientific pizza recipe generation based on Progetto Vulcan
// Last audit alignment: 14 feb 2026 — Audit Verifica Implementativa v1
// Changes: P/L ratio, variable Q10, Chicago butter fix, STG W AVPN 2024,
//          full compensation engine (logarithmic hydration, Arrhenius baking),
//          sustainability score documented, fat_type model

import { STYLE_DEVIATIONS } from "./deviation-tags";
import { getToppingByStyle } from "./parametric-databases";

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
}

export interface ShapeParameters {
  shape_type: ShapeType;
  dough_weight_g: number;
  thickness_factor: number;
  diameter_cm?: number;
  length_cm?: number;
  width_cm?: number;
}

export interface BakingParameters {
  oven_type_required: OvenType;
  temp_c_range: [number, number];
  temp_c_ideal: number;
  cook_time_sec_range: [number, number];
  cook_time_sec_ideal: number;
}

export interface PizzaStyle {
  id: string;
  name: string;
  family: FamilyId;
  origin: string;
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
): string[] {
  if (!templates) return msgs.map((m) => m.fallback);
  return msgs.map((m) => {
    const tpl = templates[m.key];
    if (!tpl) return m.fallback;
    if (!m.params) return tpl;
    return Object.entries(m.params).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
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
  { key: "authenticity",    label: "Autenticità",     short: "Aut", color: "var(--primary)",    weight: 0.30 },
  { key: "feasibility",     label: "Fattibilità",     short: "Fat", color: "var(--tertiary)",   weight: 0.25 },
  { key: "digestibility",   label: "Digeribilità",    short: "Dig", color: "var(--cta)",        weight: 0.20 },
  { key: "sustainability",  label: "Sostenibilità",   short: "Sos", color: "var(--warm-olive)", weight: 0.15 },
  { key: "experimentation", label: "Sperimentazione", short: "Spe", color: "var(--secondary)",  weight: 0.10 },
];

/* ═══ YEAST LABELS — single source of truth ═══ */
export const YEAST_LABELS: Record<string, string> = {
  fresh: "Lievito fresco",
  dry: "Lievito secco",
  sourdough: "Lievito madre",
};

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

export interface CompensationApplied {
  type: string;
  original: number;
  compensated: number;
  reason: string;
}

export interface ScientificLayer {
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

export const STYLES_DB: Record<string, PizzaStyle> = {
  napoletana_stg: {
    id: "napoletana_stg",
    name: "Napoletana STG",
    family: "napoletana",
    origin: "Napoli, Italia",
    dough: {
      flour_w_range: [250, 320], // Aggiornato da AVPN 2024 (era 220-280) — Audit Maestro S3
      flour_pl_range: [0.55, 0.70], // AVPN 2024 disciplinare — Audit Maestro P0-1
      hydration_pct_range: [55, 62],
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
  },
  napoletana_canotto: {
    id: "napoletana_canotto",
    name: "Canotto Contemporanea",
    family: "napoletana",
    origin: "Napoli (evoluzione moderna)",
    dough: {
      flour_w_range: [280, 350], // Martucci Caputo Saccorosso W300 — era [300,350]
      flour_pl_range: [0.50, 0.65], // Più estensibile per cornicione esplosivo
      hydration_pct_range: [65, 78], // Martucci 68%, Salvo 70%, pro 75% — era [70,80]
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
      temp_c_range: [380, 450],
      temp_c_ideal: 410,
      cook_time_sec_range: [90, 140],
      cook_time_sec_ideal: 110,
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
  },
  teglia_romana: {
    id: "teglia_romana",
    name: "Teglia Romana",
    family: "romana",
    origin: "Roma, Italia",
    dough: {
      flour_w_range: [280, 340], // Teglia classica non-Bonci: farina 0 forte — era [300,350]
      flour_pl_range: [0.50, 0.70], // Estensibile per stesura in teglia
      hydration_pct_range: [75, 90], // Teglia tradizionale 75-85%, moderna 85-90% — era [80,100]
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
      temp_c_range: [270, 310],
      temp_c_ideal: 290,
      cook_time_sec_range: [780, 1080],
      cook_time_sec_ideal: 900,
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
      "Idratazione 80-100%",
      "No-knead + pieghe",
      "Mollica nuvola",
    ],
    hydration_category: "extreme",
    emoji: "📐",
  },
  tonda_romana: {
    id: "tonda_romana",
    name: "Tonda Romana",
    family: "romana",
    origin: "Roma, Italia",
    dough: {
      flour_w_range: [180, 240], // Farina 0 romana W180-220, tipo 1 fino W240 — era [160,210]
      flour_pl_range: [0.40, 0.60], // Bassa tenacità: si stende col mattarello senza resistenza
      hydration_pct_range: [55, 62], // Scrocchiarella classica 55-60%, moderna 60-62% — era [55,60]
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
      temp_c_range: [300, 330],
      temp_c_ideal: 315,
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
  },
  pinsa_romana: {
    id: "pinsa_romana",
    name: "Pinsa Romana",
    family: "romana",
    origin: "Roma (marchio contemporaneo)",
    dough: {
      flour_w_range: [280, 330],
      flour_pl_range: [0.55, 0.75], // Mix multicereale: P/L variabile
      hydration_pct_range: [75, 85],
      salt_pct: 2.5,
      oil_pct: 1.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "direct",
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
      cook_time_sec_range: [120, 240],
      cook_time_sec_ideal: 180,
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
  },
  new_york: {
    id: "new_york",
    name: "New York Style",
    family: "americana",
    origin: "New York City, USA",
    dough: {
      flour_w_range: [260, 310], // Bread flour USA (KA ~W280, KABF ~W300) — era [280,340]
      flour_pl_range: [0.55, 0.70], // Bread flour americana: bilanciata
      hydration_pct_range: [60, 66], // Reinhart 62%, Kenji 63%, tradizionale 60% — era [62,68]
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
      temp_c_range: [260, 300],
      temp_c_ideal: 280,
      cook_time_sec_range: [660, 900],
      cook_time_sec_ideal: 780,
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
  },
  detroit: {
    id: "detroit",
    name: "Detroit Style",
    family: "americana",
    origin: "Detroit, Michigan, USA",
    dough: {
      flour_w_range: [260, 320], // Bread flour USA standard — era [290,350]
      flour_pl_range: [0.55, 0.70], // Bread flour standard
      hydration_pct_range: [68, 78],
      salt_pct: 2.0, // Standard USA — era 2.5
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 1.0,
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
      cook_time_sec_range: [720, 960], // 12-16 min a temp più alta — era [840,1140]
      cook_time_sec_ideal: 840, // 14 min — era 1020 (fuori range)
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
  },
  chicago_deep: {
    id: "chicago_deep",
    name: "Chicago Deep Dish",
    family: "americana",
    origin: "Chicago, Illinois, USA",
    dough: {
      flour_w_range: [200, 270], // AP flour USA W200-250, bread flour max W270 — era [230,290]
      flour_pl_range: [0.45, 0.60], // Shortcrust-like: burro riduce tenacità
      hydration_pct_range: [48, 56], // Impasto corto col burro, 50-55% tipico — era [48,58]
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
  },
  bonci_teglia: {
    id: "bonci_teglia",
    name: "Metodo Bonci",
    family: "contemporanea",
    origin: "Roma (Gabriele Bonci)",
    dough: {
      flour_w_range: [280, 350], // Caputo Cuoco W300-320, tipo 1 W280-320 — era [320,380] troppo alto
      flour_pl_range: [0.50, 0.65], // Alta estensibilità per idratazione estrema
      hydration_pct_range: [78, 95], // "Pizza Hero" 80%, corsi pro 85-90%, estremi 95% — era [85,100]
      salt_pct: 2.5,
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "no_knead",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 900,
      thickness_factor: 0.65,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [250, 300], // Casalingo 250-280, pro 280-300 — era [270,310]
      temp_c_ideal: 280, // era 290
      cook_time_sec_range: [780, 1200],
      cook_time_sec_ideal: 960,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "No-knead con pieghe, idratazione estrema, maestro Bonci. Alta digeribilità.",
    key_characteristics: [
      "No-knead + pieghe",
      "Idratazione estrema",
      "Maturazione 24-72h",
      "Alveolatura nuvola",
    ],
    hydration_category: "extreme",
    emoji: "☁️",
  },

  /* ═══ EXPANSION WAVE 1 — 6 nuovi stili (marzo 2026) ═══ */

  focaccia_genovese: {
    id: "focaccia_genovese",
    name: "Focaccia Genovese",
    family: "contemporanea",
    origin: "Genova, Liguria",
    dough: {
      flour_w_range: [200, 260], // Farina 0 standard ligure W200-250 — era [220,280]
      flour_pl_range: [0.45, 0.65],
      hydration_pct_range: [60, 72], // Tradizionale 60-65%, moderna 68-72% — era [65,75]
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
      cook_time_sec_range: [900, 1200],
      cook_time_sec_ideal: 1020,
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
  },
  sfincione: {
    id: "sfincione",
    name: "Sfincione Palermitano",
    family: "contemporanea",
    origin: "Palermo, Sicilia",
    dough: {
      flour_w_range: [250, 300],
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [65, 70], // Tradizione palermitana 65-70% — era [65,72]
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
      cook_time_sec_range: [900, 1500],
      cook_time_sec_ideal: 1200,
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
  },
  pala_romana: {
    id: "pala_romana",
    name: "Pala Romana",
    family: "romana",
    origin: "Roma (formato contemporaneo)",
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [70, 80],
      salt_pct: 2.5,
      oil_pct: 1.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "biga|poolish",
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
      cook_time_sec_range: [120, 240],
      cook_time_sec_ideal: 180,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: true,
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
  },
  grandma_style: {
    id: "grandma_style",
    name: "Grandma Style",
    family: "americana",
    origin: "Long Island, New York, USA",
    dough: {
      flour_w_range: [240, 300], // Bread flour USA — era [260,320]
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [60, 66], // Tradizione italo-americana 60-65% — era [60,68]
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
      cook_time_sec_range: [720, 960],
      cook_time_sec_ideal: 840,
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
  },
  focaccia_recco: {
    id: "focaccia_recco",
    name: "Focaccia di Recco",
    family: "contemporanea",
    origin: "Recco, Liguria",
    dough: {
      flour_w_range: [170, 210], // Farina debole tipo 00/0 — era [180,220]
      flour_pl_range: [0.40, 0.55], // Farina debole per sfoglia sottilissima
      hydration_pct_range: [45, 52], // Sfoglia non lievitata, disciplinare IGP 45-50% — era [50,55]
      salt_pct: 2.0,
      oil_pct: 4.0, // 3-4% nell'impasto, resto in teglia — era 5.0
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [0.5, 2], // Nessuna lievitazione — sfoglia diretta
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 400,
      thickness_factor: 0.08, // Sottilissima, quasi trasparente
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [280, 320],
      temp_c_ideal: 300,
      cook_time_sec_range: [300, 480],
      cook_time_sec_ideal: 420,
    },
    crust_type: "stuffed_thin",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
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
  },
  padellino_torino: {
    id: "padellino_torino",
    name: "Pizza al Padellino",
    family: "contemporanea",
    origin: "Torino, Piemonte",
    dough: {
      flour_w_range: [260, 320], // Farina 0/1 forte — era [280,330]
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [65, 75],
      salt_pct: 2.5,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.5,
      fermentation_hours_range: [18, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 250,
      thickness_factor: 0.5,
      diameter_cm: 22,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 260],
      temp_c_ideal: 240,
      cook_time_sec_range: [600, 900],
      cook_time_sec_ideal: 720,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
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
  if (deficit > 150 && style.allows_additives) {
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

export function calculateAuthenticityScore(
  style: PizzaStyle,
  hydration: number,
  ovenTemp: number,
  ovenType: OvenType,
  flourW: number,
  flourPL: number,
  fermentationHours: number,
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
    forma: 100,
  };

  // Ingredient axis (30%) — include idratazione, W, P/L
  const hCenter =
    (style.dough.hydration_pct_range[0] +
      style.dough.hydration_pct_range[1]) /
    2;
  const hDeviation = Math.abs(hydration - hCenter);
  if (hDeviation > 5) {
    const penalty = Math.min(25, hDeviation * 2.5);
    breakdown.ingredienti -= penalty;
    penalties.push(
      em("auth.hydrationOff", `Idratazione fuori centro (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
    );
  }

  // Flour W check
  const wCenter =
    (style.dough.flour_w_range[0] +
      style.dough.flour_w_range[1]) /
    2;
  const wDeviation = Math.abs(flourW - wCenter);
  if (wDeviation > 30) {
    const penalty = Math.min(20, (wDeviation - 30) * 0.5);
    breakdown.ingredienti -= penalty;
    penalties.push(
      em("auth.wOutOfRange", `W farina fuori range (-${penalty.toFixed(1)}%)`, { penalty: penalty.toFixed(1) }),
    );
  }

  // P/L check — Audit Maestro P0-1: critico per autenticità
  const plCenter =
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
        em("auth.tempVsIdeal", `Temperatura ${ovenTemp}°C vs ${style.baking.temp_c_ideal}°C (-${tempPenalty.toFixed(1)}%)`, { temp: ovenTemp, ideal: style.baking.temp_c_ideal, penalty: tempPenalty.toFixed(1) }),
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

  const score = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        breakdown.ingredienti * 0.3 +
          breakdown.processo * 0.25 +
          breakdown.attrezzatura * 0.35 +
          breakdown.forma * 0.1,
      ),
    ),
  );

  return { score, penalties, breakdown };
}

export function calculateFeasibilityScore(
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
      em("feas.ovenSuboptimal", `Forno sotto-ottimale: ${ovenMaxTemp}°C vs ideale ${style.baking.temp_c_ideal}°C`, { temp: ovenMaxTemp, ideal: style.baking.temp_c_ideal }),
    );
  } else {
    const deficit = style.baking.temp_c_range[0] - ovenMaxTemp;
    // ADV-08 fix: extreme deficit (>200°C) should floor at 5, not 20
    // A 150°C oven for napoletana STG (430°C min) is physically impossible, not just "suboptimal"
    const floor = deficit > 200 ? 5 : deficit > 100 ? 10 : 20;
    ovenScore = Math.max(floor, 60 - deficit * 0.5);
    warnings.push(
      em("feas.ovenTooCold", `Forno troppo freddo: ${ovenMaxTemp}°C < minimo ${style.baking.temp_c_range[0]}°C`, { temp: ovenMaxTemp, min: style.baking.temp_c_range[0] }),
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

  // Hydration × skill interaction
  if (hydration > 75 && skillLevel === 1) {
    skillScore = 30;
    warnings.push(
      em("feas.hydrationBeginnerHigh", "Idratazione >75% sconsigliata per principianti"),
    );
  } else if (hydration > 75 && skillLevel === 2) {
    skillScore = 55;
    warnings.push(em("feas.hydrationNeedsPractice", "Idratazione alta richiede pratica"));
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

export function calculateDigestibilityScore(
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
export function calculateExperimentationScore(
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
  // Arrhenius-based model con Q10 variabile — Audit Database V1
  const referenceRate = 0.25; // % fresh yeast at 18°C for 24h (Audit Maestro: 0.1-0.2 è range, 0.25 conservativo per home)
  const { q10 } = getQ10(yeastType, fermentationTempC);
  const tempFactor = Math.pow(
    q10,
    (fermentationTempC - 18) / 10,
  );
  const timeFactor = 24 / fermentationHours;

  let pct = (referenceRate * timeFactor) / tempFactor;
  if (yeastType === "dry") pct *= 0.33; // dry = 1/3 of fresh

  return Math.max(0.01, Math.min(3.0, pct));
}

// ═══ RECIPE GENERATOR ═══

/* ═══ PAN/SHAPE HELPERS ═══ */

/** Calculate default area for a style shape (cm²) */
export function getDefaultShapeArea(shape: ShapeParameters): number {
  if (shape.shape_type === "rectangular" || shape.shape_type === "oval") {
    const l = shape.length_cm ?? 30;
    const w = shape.width_cm ?? 20;
    return shape.shape_type === "oval" ? Math.PI * (l / 2) * (w / 2) : l * w;
  }
  const d = shape.diameter_cm ?? 30;
  return Math.PI * (d / 2) * (d / 2);
}

/** Recalculate dough weight from custom pan dimensions + thickness */
export function calcDoughWeight(
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
  return ["teglia_romana", "detroit", "bonci_teglia", "focaccia_genovese",
    "sfincione", "grandma_style", "padellino_torino", "chicago_deep"].includes(style.id);
}

/** Styles that use a baking pan/vessel (rectangular or round) */
export function needsPan(style: PizzaStyle): boolean {
  return [
    "teglia_romana", "detroit", "bonci_teglia", "focaccia_genovese",
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

export function generateRecipe(
  style: PizzaStyle,
  constraints: UserConstraints,
  customHydration?: number,
  customFlourW?: number,
  customFermentationHours?: number,
  customFermentationTempC?: number,
  usePreFerment?: boolean,
  customFlourPL?: number,
  panConfig?: PanConfig,
  scoreWeights?: ScoreWeightsOverride,
): GeneratedRecipe {
  const doughBalls = constraints.dough_balls;

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

  const flourW =
    customFlourW ?? (wRange[0] + wRange[1]) / 2;

  // P/L estimation from W — Audit Maestro P0-1 (VPL-012: accept custom P/L)
  const flourPL = customFlourPL ?? estimatePL(flourW, plRange);

  let fermentationHours =
    customFermentationHours ?? (fermRange[0] + fermRange[1]) / 2;

  // Clamp fermentation to available time
  if (constraints.available_hours > 0) {
    fermentationHours = Math.min(
      fermentationHours,
      constraints.available_hours,
    );
  }

  const fermentationTempC =
    customFermentationTempC ??
    (fermentationHours > 12 ? 4 : 22);

  const hasPreFerment =
    usePreFerment ?? style.requires_pre_ferment;

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
  const effectiveOilPct = style.allows_additives
    ? style.dough.oil_pct + ovenCompensations.oil_delta_pct
    : 0;
  const effectiveSugarPct = style.allows_additives
    ? style.dough.sugar_pct + ovenCompensations.sugar_delta_pct
    : 0;

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
  if (yeastType === "sourdough") {
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
    style.dough.salt_pct / 100 +
    effectiveOilPct / 100 +
    effectiveSugarPct / 100 +
    yeastPct / 100;

  const flourG = Math.round(totalDough / totalPct);
  const waterG = Math.round((flourG * hydration) / 100);
  const saltG =
    Math.round(((flourG * style.dough.salt_pct) / 100) * 10) / 10;
  const fatG = Math.round((flourG * effectiveOilPct) / 100); // Grasso totale (olio O burro)
  const oilG = style.dough.fat_type === "butter" ? 0 : fatG; // oilG = 0 se è burro
  const sugarG =
    Math.round(((flourG * effectiveSugarPct) / 100) * 10) / 10;
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
  );
  const feasResult = calculateFeasibilityScore(
    style,
    constraints.oven_max_temp_c,
    flourW,
    hydration,
    constraints.skill_level,
  );
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
    authenticity: scoreWeights?.authenticity ?? 0.3,
    feasibility: scoreWeights?.feasibility ?? 0.25,
    digestibility: scoreWeights?.digestibility ?? 0.2,
    sustainability: scoreWeights?.sustainability ?? 0.15,
    experimentation: scoreWeights?.experimentation ?? 0.1,
  };
  const composite = Math.round(
    authResult.score * sw.authenticity +
      feasResult.score * sw.feasibility +
      digestResult.score * sw.digestibility +
      sustResult.score * sw.sustainability +
      expResult.score * sw.experimentation,
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
    warnings: feasResult.warnings,
    claims: [...digestResult.claims, ...sustResult.claims],
  };

  // Generate timeline
  const timeline = generateTimeline(
    style,
    fermentationHours,
    fermentationTempC,
    hasPreFerment,
    cookTime,
    ovenTemp,
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
  const kneadBonus = style.dough.process_type.includes(
    "no_knead",
  )
    ? -8
    : 5;
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
  const saltEffect = style.dough.salt_pct * 0.006;
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

function generateTimeline(
  style: PizzaStyle,
  fermentHours: number,
  fermentTemp: number,
  hasPreFerment: boolean,
  cookTimeSec: number,
  actualOvenTemp?: number,
): TimelineStep[] {
  const steps: TimelineStep[] = [];

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

  steps.push({
    id: "mix",
    title: "Impasto",
    description: style.dough.process_type.includes("no_knead")
      ? "Mescolare gli ingredienti senza impastare. Serie di pieghe."
      : "Impastare fino a incordatura. Liscio e elastico.",
    duration_minutes: style.dough.process_type.includes(
      "no_knead",
    )
      ? 10
      : 20,
    icon: "hand",
    timing_label: "Inizio",
    tip: style.dough.process_type.includes("no_knead")
      ? {
          beginner:
            "Non serve impastare! Mescola con una spatola finché non ci sono più grumi di farina asciutta.",
          nerd: "L'autolisi sfrutta le proteinasi endogene della farina per sviluppare il glutine senza lavoro meccanico.",
        }
      : {
          beginner:
            "L'impasto è pronto quando è liscio e si stacca dalle mani. Se appiccica troppo, aspetta 5 min e riprova.",
          nerd: "L'incordatura avviene quando glutenina e gliadina formano ponti disolfuro stabili. Il test del velo verifica la maglia glutinica.",
        },
  });

  steps.push({
    id: "bulk",
    title: "Puntata (Bulk)",
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

  steps.push({
    id: "divide",
    title: "Staglio",
    description:
      "Dividere in panetti del peso corretto. Formare pallina.",
    duration_minutes: 15,
    icon: "scissors",
    timing_label: "15 min",
    tip: {
      beginner:
        "Usa una bilancia! Taglia con un tarocco e arrotonda ogni pezzo in una palla liscia.",
      nerd: "Lo staglio crea tensione superficiale che intrappola CO₂ durante l'appretto e definisce la struttura alveolare finale.",
    },
  });

  steps.push({
    id: "proof",
    title: "Appretto",
    description: `Lievitazione finale a ${Math.max(fermentTemp, 18)}°C`,
    duration_minutes: Math.round(
      fermentHours * 60 * (hasPreFerment ? 0.2 : 0.4),
    ),
    icon: "timer",
    timing_label: formatDuration(
      Math.round(fermentHours * (hasPreFerment ? 0.2 : 0.4)),
    ),
    tip: {
      beginner:
        "I panetti devono essere morbidi. Se li premi con un dito, tornano su lentamente.",
      nerd: "Poke test: ritorno lento = fermentazione ottimale. Troppo rapido = sotto-lievitato. Nessun ritorno = over-proofed.",
    },
  });

  steps.push({
    id: "shape",
    title: "Stesura",
    description:
      style.shape.shape_type === "rectangular"
        ? "Stendere nella teglia oliata con le mani"
        : style.crust_type === "crispy_thin"
          ? "Stendere con mattarello, sottilissima"
          : "Allargare a mano dal centro, preservare il cornicione",
    duration_minutes: 5,
    icon: "expand",
    timing_label: "5 min",
  });

  steps.push({
    id: "top",
    title: "Farcitura",
    description: "Condire la pizza secondo gusto",
    duration_minutes: 5,
    icon: "chef-hat",
    timing_label: "5 min",
  });

  steps.push({
    id: "bake",
    title: "Cottura",
    description: `Cuocere a ${Math.round(actualOvenTemp ?? style.baking.temp_c_ideal)}°C`,
    duration_minutes: Math.round(cookTimeSec / 60),
    icon: "flame",
    timing_label: formatCookTime(cookTimeSec),
    tip: {
      beginner:
        "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
      nerd: `La reazione di Maillard inizia a ~140°C e accelera esponenzialmente. A ${Math.round(actualOvenTemp ?? style.baking.temp_c_ideal)}°C la caramellizzazione crea ~600 composti aromatici.`,
    },
  });

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
    name: "Elettrico Alta T",
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
  tier: "perfect" | "good" | "challenging";
  reasons: EngineMsg[];
  warnings: EngineMsg[];
}

export interface TimeSlot {
  id: string;
  label: string;
  sublabel: string;
  hours: number;
  emoji: string;
}

/** VPL-065: Kept as legacy fallback — consumers should prefer generateTimeSlots() */
export const TIME_SLOTS: TimeSlot[] = [
  {
    id: "tonight",
    label: "Stasera",
    sublabel: "4-6 ore",
    hours: 5,
    emoji: "🌙",
  },
  {
    id: "tomorrow_lunch",
    label: "Domani pranzo",
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
  if (h < 1) return "<1 ora";
  if (h < 2) return "~1 ora";
  return `~${Math.round(h)} ore`;
}

function getDayLabel(dayOffset: number, meal: string, now: Date): string {
  const weekday = now.getDay();
  const DAYS_IT = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  if (dayOffset === 0) return "Stasera";
  if (dayOffset === 1) return meal === "lunch" ? "Domani pranzo" : "Domani sera";
  const targetDay = DAYS_IT[(weekday + dayOffset) % 7];
  return meal === "lunch" ? `${targetDay} pranzo` : `${targetDay} sera`;
}

/** No-preference virtual slot: engine uses 24h @ kitchen temp */
export const NO_PREFERENCE_SLOT: TimeSlot = {
  id: "no_preference",
  label: "Nessuna preferenza",
  sublabel: "il motore sceglie",
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
      label: "Domani pranzo",
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

/** Minimum schema version that can be imported without migration */
export const RECIPE_SCHEMA_MIN_COMPAT = "1.2" as const;

export function outdoorToKitchenTemp(outdoor: number): number {
  if (outdoor <= 25) return Math.round(Math.max(19, Math.min(23, 21 + (outdoor - 15) * 0.1)));
  return Math.round(Math.min(outdoor - 2, 30));
}

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
      reasons.push(em("rec.ovenIdeal", `Il tuo forno raggiunge la temperatura ideale (${style.baking.temp_c_ideal}°C)`, { ideal: style.baking.temp_c_ideal }));
    } else if (constraints.oven_max_temp_c >= style.baking.temp_c_range[0]) {
      ovenScore = 70;
      reasons.push(em("rec.ovenAdequate", "Forno adeguato (compensazione automatica tempo/temperatura)"));
    } else {
      ovenScore = 30;
      warnings.push(em("rec.ovenTooCold", `Forno troppo freddo: ${constraints.oven_max_temp_c}°C < min ${style.baking.temp_c_range[0]}°C`, { temp: constraints.oven_max_temp_c, min: style.baking.temp_c_range[0] }));
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
        "bonci_teglia", "focaccia_genovese", "sfincione", "padellino_torino",
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
    const estTemp = estFermentHours > 12 ? 4 : 22;
    const digestResult = calculateDigestibilityScore(
      estFermentHours,
      estTemp,
      style.requires_pre_ferment,
      0.3,
    );

    // ── Tier classification ──
    let tier: "perfect" | "good" | "challenging";
    if (score >= 78) tier = "perfect";
    else if (score >= 55) tier = "good";
    else tier = "challenging";

    recommendations.push({
      style,
      compatibilityScore: score,
      feasibilityScore: Math.round(
        ovenScore * 0.5 + skillScore * 0.3 + equipScore * 0.2,
      ),
      digestibilityEstimate: digestResult.score,
      tier,
      reasons: reasons.slice(0, 3),
      warnings: warnings.slice(0, 2),
    });
  }

  // Sort by compatibility descending
  recommendations.sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore,
  );
  return recommendations;
}

// ═══ SUSTAINABILITY CALCULATION ═══

export function calculateSustainabilityScore(
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