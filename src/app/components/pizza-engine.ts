// ═══ VULCAN PIZZA ENGINE ═══
// Scientific pizza recipe generation based on Progetto Vulcan

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
  | "deep_dish";
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
  hydration_pct_range: [number, number];
  salt_pct: number;
  oil_pct: number;
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
  dietary_filters: string[];
  kitchen_temp_c?: number;
  pantry_flours: string[]; // e.g. ['00','0','manitoba','integrale','semola']
  pantry_yeasts: string[]; // e.g. ['fresh','dry','sourdough']
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
  penalties: string[];
  warnings: string[];
  claims: string[];
}

export interface GeneratedRecipe {
  style: PizzaStyle;
  dough_balls: number;
  flour_g: number;
  water_g: number;
  salt_g: number;
  oil_g: number;
  sugar_g: number;
  yeast_g: number;
  yeast_type: "fresh" | "dry" | "sourdough";
  hydration_pct: number;
  flour_w: number;
  fermentation_hours: number;
  fermentation_temp_c: number;
  has_pre_ferment: boolean;
  pre_ferment_type?: string;
  oven_temp_c: number;
  cook_time_sec: number;
  total_dough_g: number;
  ball_weight_g: number;
  scores: RecipeScores;
  timeline: TimelineStep[];
  tips: string[];
  science: ScientificLayer;
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
  authenticity_breakdown: Record<string, number>;
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
      flour_w_range: [220, 280],
      hydration_pct_range: [55, 62],
      salt_pct: 2.8,
      oil_pct: 0.0,
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
      flour_w_range: [300, 350],
      hydration_pct_range: [70, 80],
      salt_pct: 2.5,
      oil_pct: 0.0,
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
      flour_w_range: [300, 350],
      hydration_pct_range: [80, 100],
      salt_pct: 2.5,
      oil_pct: 2.5,
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
      flour_w_range: [160, 210],
      hydration_pct_range: [55, 60],
      salt_pct: 2.8,
      oil_pct: 2.5,
      sugar_pct: 0.0,
      fermentation_hours_range: [3, 6],
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
      hydration_pct_range: [75, 85],
      salt_pct: 2.5,
      oil_pct: 1.0,
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
      flour_w_range: [280, 340],
      hydration_pct_range: [62, 68],
      salt_pct: 2.8,
      oil_pct: 2.5,
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
      flour_w_range: [290, 350],
      hydration_pct_range: [68, 78],
      salt_pct: 2.5,
      oil_pct: 3.0,
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
      temp_c_range: [230, 260],
      temp_c_ideal: 245,
      cook_time_sec_range: [840, 1140],
      cook_time_sec_ideal: 1020,
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
      flour_w_range: [230, 290],
      hydration_pct_range: [48, 58],
      salt_pct: 2.5,
      oil_pct: 0.0,
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
      temp_c_range: [200, 230],
      temp_c_ideal: 215,
      cook_time_sec_range: [1800, 2400],
      cook_time_sec_ideal: 2100,
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
      flour_w_range: [320, 380],
      hydration_pct_range: [85, 100],
      salt_pct: 2.5,
      oil_pct: 3.0,
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
      temp_c_range: [270, 310],
      temp_c_ideal: 290,
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
};

// ═══ SCORING ALGORITHMS ═══

export function calculateAuthenticityScore(
  style: PizzaStyle,
  hydration: number,
  ovenTemp: number,
  ovenType: OvenType,
  flourW: number,
  fermentationHours: number,
): {
  score: number;
  penalties: string[];
  breakdown: Record<string, number>;
} {
  const penalties: string[] = [];
  const breakdown = {
    ingredienti: 100,
    processo: 100,
    attrezzatura: 100,
    forma: 100,
  };

  // Ingredient axis (30%)
  const hCenter =
    (style.dough.hydration_pct_range[0] +
      style.dough.hydration_pct_range[1]) /
    2;
  const hDeviation = Math.abs(hydration - hCenter);
  if (hDeviation > 5) {
    const penalty = Math.min(25, hDeviation * 2.5);
    breakdown.ingredienti -= penalty;
    penalties.push(
      `Idratazione fuori centro (-${penalty.toFixed(1)}%)`,
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
      `W farina fuori range (-${penalty.toFixed(1)}%)`,
    );
  }

  // Equipment axis (35%)
  if (style.requires_wood_oven && ovenType !== "wood") {
    breakdown.attrezzatura -= 15;
    penalties.push("Forno non a legna (-15%)");
    const tempRatio = ovenTemp / style.baking.temp_c_ideal;
    const tempPenalty = (1 - tempRatio) * 25;
    if (tempPenalty > 0) {
      breakdown.attrezzatura -= tempPenalty;
      penalties.push(
        `Temperatura ${ovenTemp}°C vs ${style.baking.temp_c_ideal}°C (-${tempPenalty.toFixed(1)}%)`,
      );
    }
  } else {
    if (ovenTemp < style.baking.temp_c_range[0]) {
      const deficit = style.baking.temp_c_range[0] - ovenTemp;
      const penalty = Math.min(20, deficit * 0.2);
      breakdown.attrezzatura -= penalty;
      penalties.push(
        `Temperatura sotto minimo (-${penalty.toFixed(1)}%)`,
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
      `Fermentazione troppo breve (-${penalty.toFixed(1)}%)`,
    );
  } else if (fermentationHours > fMax * 1.5) {
    const excess = fermentationHours - fMax;
    const penalty = Math.min(10, excess * 0.5);
    breakdown.processo -= penalty;
    penalties.push(
      `Fermentazione troppo lunga (-${penalty.toFixed(1)}%)`,
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
): { score: number; warnings: string[] } {
  const warnings: string[] = [];

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
      `Forno sotto-ottimale: ${ovenMaxTemp}°C vs ideale ${style.baking.temp_c_ideal}°C`,
    );
  } else {
    const deficit = style.baking.temp_c_range[0] - ovenMaxTemp;
    ovenScore = Math.max(20, 60 - deficit * 0.5);
    warnings.push(
      `Forno troppo freddo: ${ovenMaxTemp}°C < minimo ${style.baking.temp_c_range[0]}°C`,
    );
  }

  // Flour factor (30%)
  let flourScore: number;
  const [wMin, wMax] = style.dough.flour_w_range;
  if (flourW < wMin) {
    flourScore = Math.max(10, 70 - (wMin - flourW) * 0.5);
    warnings.push(`W troppo basso: ${flourW} < ${wMin}`);
  } else if (flourW > wMax * 1.3) {
    flourScore = Math.max(60, 90 - (flourW - wMax) * 0.2);
    warnings.push(`W molto alto (${flourW}). Impasto tenace.`);
  } else {
    flourScore = 95;
  }

  // Skill factor (30%)
  let skillScore = 90;
  if (hydration > 75 && skillLevel === 1) {
    skillScore = 30;
    warnings.push(
      "Idratazione >75% sconsigliata per principianti",
    );
  } else if (hydration > 75 && skillLevel === 2) {
    skillScore = 55;
    warnings.push("Idratazione alta richiede pratica");
  } else if (hydration > 65 && skillLevel === 1) {
    skillScore = 50;
    warnings.push("Idratazione media-alta per principiante");
  }

  if (
    style.dough.process_type.includes("no_knead") &&
    skillLevel <= 2
  ) {
    skillScore = Math.min(95, skillScore + 15);
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
): {
  score: number;
  category: string;
  claims: string[];
  fodmap_reduction_pct: number | null;
} {
  const claims: string[] = [];

  // Effective hours at 18°C (Q10 model)
  const q10 = 2.0;
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
    claims.push(
      "Fermentazione troppo breve: amidi non degradati",
    );
  } else if (effectiveHours < 8) {
    score = 20 + ((effectiveHours - 3) / 5) * 30;
    category = "Bassa";
    claims.push("Fermentazione breve: digeribilità limitata");
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
      claims.push(`FODMAP ridotti ~${fodmapReductionPct}%`);
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
    claims.push("FODMAP ridotti >80%");
    claims.push(
      "Maturazione estrema: massima complessità aromatica",
    );
  }

  if (yeastPct > 1.5) {
    const penalty = Math.min(20, (yeastPct - 1.5) * 10);
    score -= penalty;
    claims.push(
      `Dosaggio lievito alto (${yeastPct}%): -${Math.round(penalty)}% digeribilità`,
    );
  }

  if (fermentationTempC <= 4) {
    score = Math.min(100, score + 5);
    claims.push(
      "Fermentazione fredda: attività enzimatica ottimale",
    );
  }

  return {
    score: Math.round(Math.max(0, score)),
    category,
    claims,
    fodmap_reduction_pct: fodmapReductionPct,
  };
}

export function calculateExperimentationScore(
  style: PizzaStyle,
  hydration: number,
  fermentationHours: number,
  hasPreFerment: boolean,
  ovenType: OvenType,
): { score: number; category: string } {
  let score = 0;

  // Deviation from canonical
  const hCenter =
    (style.dough.hydration_pct_range[0] +
      style.dough.hydration_pct_range[1]) /
    2;
  const hDeviation = Math.abs(hydration - hCenter) / hCenter;
  score += hDeviation * 30;

  const fCenter =
    (style.dough.fermentation_hours_range[0] +
      style.dough.fermentation_hours_range[1]) /
    2;
  const fDeviation =
    Math.abs(fermentationHours - fCenter) / fCenter;
  score += fDeviation * 20;

  if (hasPreFerment && !style.requires_pre_ferment) score += 15;
  if (style.requires_wood_oven && ovenType !== "wood")
    score += 10;

  score = Math.min(100, Math.round(score));

  let category: string;
  if (score <= 20) category = "Tradizionale";
  else if (score <= 40) category = "Variazione parametrica";
  else if (score <= 65) category = "Variante tecnica";
  else if (score <= 85) category = "Ibridazione";
  else category = "Sperimentale";

  return { score, category };
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
  };

function calculateYeastPercentage(
  fermentationHours: number,
  fermentationTempC: number,
  yeastType: "fresh" | "dry",
): number {
  // Simplified Arrhenius-based model
  const referenceRate = 0.3; // % at 18°C for 24h
  const q10 = 2.0;
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

export function generateRecipe(
  style: PizzaStyle,
  constraints: UserConstraints,
  customHydration?: number,
  customFlourW?: number,
  customFermentationHours?: number,
  customFermentationTempC?: number,
  usePreFerment?: boolean,
): GeneratedRecipe {
  const doughBalls = constraints.dough_balls;

  // Determine optimal parameters
  const hydration =
    customHydration ??
    (style.dough.hydration_pct_range[0] +
      style.dough.hydration_pct_range[1]) /
      2;

  const flourW =
    customFlourW ??
    (style.dough.flour_w_range[0] +
      style.dough.flour_w_range[1]) /
      2;

  let fermentationHours =
    customFermentationHours ??
    (style.dough.fermentation_hours_range[0] +
      style.dough.fermentation_hours_range[1]) /
      2;

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

  // Oven temperature (apply compensations)
  let ovenTemp = Math.min(
    constraints.oven_max_temp_c,
    style.baking.temp_c_ideal,
  );
  if (ovenTemp < style.baking.temp_c_range[0]) {
    ovenTemp = constraints.oven_max_temp_c;
  }

  // Cook time compensation
  const tempRatio = ovenTemp / style.baking.temp_c_ideal;
  const cookTime = Math.round(
    style.baking.cook_time_sec_ideal / tempRatio,
  );

  // ── Auto yeast selection based on pantry ──
  let yeastType: "fresh" | "dry" | "sourdough";
  const py = constraints.pantry_yeasts;
  if (py.length === 0) {
    yeastType = "fresh"; // default when no pantry info
  } else if (
    py.includes("sourdough") &&
    fermentationHours >= 12 &&
    (hasPreFerment || style.requires_pre_ferment)
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

  // Baker's percentages to grams
  const ballWeight = style.shape.dough_weight_g;
  const totalDough = ballWeight * doughBalls;

  // Total dough = flour * (1 + H/100 + salt/100 + oil/100 + sugar/100 + yeast/100)
  const totalPct =
    1 +
    hydration / 100 +
    style.dough.salt_pct / 100 +
    (style.allows_additives ? style.dough.oil_pct / 100 : 0) +
    (style.allows_additives ? style.dough.sugar_pct / 100 : 0) +
    (yeastType === "sourdough"
      ? yeastPct / 100
      : yeastPct / 100);

  const flourG = Math.round(totalDough / totalPct);
  const waterG = Math.round((flourG * hydration) / 100);
  const saltG =
    Math.round(((flourG * style.dough.salt_pct) / 100) * 10) /
    10;
  const oilG = Math.round(
    (flourG *
      (style.allows_additives ? style.dough.oil_pct : 0)) /
      100,
  );
  const sugarG =
    Math.round(
      ((flourG *
        (style.allows_additives ? style.dough.sugar_pct : 0)) /
        100) *
        10,
    ) / 10;
  const yeastG =
    yeastType === "sourdough"
      ? Math.round((flourG * yeastPct) / 100)
      : Math.round(((flourG * yeastPct) / 100) * 10) / 10;

  // Calculate scores
  const authResult = calculateAuthenticityScore(
    style,
    hydration,
    ovenTemp,
    constraints.oven_type,
    flourW,
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
    yeastType === "sourdough" ? 0.2 : yeastPct, // sourdough has inherently low fast-yeast %
  );
  const expResult = calculateExperimentationScore(
    style,
    hydration,
    fermentationHours,
    hasPreFerment,
    constraints.oven_type,
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

  const composite = Math.round(
    authResult.score * 0.3 +
      feasResult.score * 0.25 +
      digestResult.score * 0.2 +
      sustResult.score * 0.15 +
      expResult.score * 0.1,
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
  );

  // Generate tips
  const tips = generateTips(
    style,
    hydration,
    flourW,
    ovenTemp,
    constraints,
  );

  // ── Scientific layer ──
  const effectiveHours18c =
    fermentationHours *
    Math.pow(2.0, (fermentationTempC - 18) / 10);

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
        Math.pow(2.0, (fermentationTempC - 18) / 10) * 100,
      ) / 100,
    authenticity_breakdown: authResult.breakdown,
  };

  return {
    style,
    dough_balls: doughBalls,
    flour_g: flourG,
    water_g: waterG,
    salt_g: saltG,
    oil_g: oilG,
    sugar_g: sugarG,
    yeast_g: yeastG,
    yeast_type: yeastType,
    hydration_pct: hydration,
    flour_w: flourW,
    fermentation_hours: fermentationHours,
    fermentation_temp_c: fermentationTempC,
    has_pre_ferment: hasPreFerment,
    pre_ferment_type: hasPreFerment ? "poolish" : undefined,
    oven_temp_c: ovenTemp,
    cook_time_sec: cookTime,
    total_dough_g: totalDough,
    ball_weight_g: ballWeight,
    scores,
    timeline,
    tips,
    science,
  };
}

function generateTimeline(
  style: PizzaStyle,
  fermentHours: number,
  fermentTemp: number,
  hasPreFerment: boolean,
  cookTimeSec: number,
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
    description: `Cuocere a ${Math.round(style.baking.temp_c_ideal)}°C`,
    duration_minutes: Math.round(cookTimeSec / 60),
    icon: "flame",
    timing_label: formatCookTime(cookTimeSec),
    tip: {
      beginner:
        "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
      nerd: `La reazione di Maillard inizia a ~140°C e accelera esponenzialmente. A ${Math.round(style.baking.temp_c_ideal)}°C la caramellizzazione crea ~600 composti aromatici.`,
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
  reasons: string[];
  warnings: string[];
}

export interface TimeSlot {
  id: string;
  label: string;
  sublabel: string;
  hours: number;
  emoji: string;
}

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
    id: "weekend",
    label: "Nel weekend",
    sublabel: "72+ ore",
    hours: 72,
    emoji: "🎉",
  },
];

export function recommendStyles(
  constraints: UserConstraints,
): StyleRecommendation[] {
  const allStyles = Object.values(STYLES_DB);
  const recommendations: StyleRecommendation[] = [];

  // Pre-compute pantry W ranges for flour matching
  const pantryWRanges = constraints.pantry_flours
    .map((id) => FLOUR_W_RANGES[id])
    .filter(Boolean);
  const hasPantryFlours = pantryWRanges.length > 0;
  const hasPantryYeasts = constraints.pantry_yeasts.length > 0;

  for (const style of allStyles) {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // ── Time compatibility (25%) ──
    const [fMin, fMax] = style.dough.fermentation_hours_range;
    let timeScore: number;
    if (
      constraints.available_hours >= fMin &&
      constraints.available_hours <= fMax * 1.5
    ) {
      timeScore = 95;
      reasons.push(
        `Fermentazione ${fMin}-${fMax}h: compatibile con il tuo tempo`,
      );
    } else if (constraints.available_hours >= fMin * 0.7) {
      timeScore = 65;
      const optimalHours = Math.min(
        constraints.available_hours,
        fMax,
      );
      reasons.push(
        `Fermentazione adattabile a ~${optimalHours}h`,
      );
    } else {
      timeScore = 25;
      warnings.push(
        `Richiede minimo ${fMin}h, hai ${constraints.available_hours}h`,
      );
    }

    // ── Oven compatibility (25%) ──
    let ovenScore: number;
    if (
      style.requires_wood_oven &&
      constraints.oven_type !== "wood"
    ) {
      ovenScore = 30;
      warnings.push("Richiede forno a legna");
    } else if (
      constraints.oven_max_temp_c >= style.baking.temp_c_ideal
    ) {
      ovenScore = 95;
      reasons.push(
        `Il tuo forno raggiunge la temperatura ideale (${style.baking.temp_c_ideal}°C)`,
      );
    } else if (
      constraints.oven_max_temp_c >=
      style.baking.temp_c_range[0]
    ) {
      ovenScore = 70;
      reasons.push(
        `Forno adeguato (compensazione automatica tempo/temperatura)`,
      );
    } else {
      ovenScore = 30;
      warnings.push(
        `Forno troppo freddo: ${constraints.oven_max_temp_c}°C < min ${style.baking.temp_c_range[0]}°C`,
      );
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
        reasons.push("Adatto al tuo livello");
    } else if (constraints.skill_level >= 3) {
      skillScore = 90;
      reasons.push("Il tuo livello permette qualsiasi stile");
    } else if (constraints.skill_level === 2) {
      skillScore = hCenter > 75 ? 50 : 75;
      if (hCenter > 75)
        warnings.push("Idratazione alta richiede pratica");
    } else {
      skillScore = hCenter > 65 ? 30 : 60;
      if (!style.suitable_for_beginner)
        warnings.push("Stile avanzato per principianti");
    }

    // ── Equipment bonus (10%) ──
    let equipScore = 70;
    if (style.dough.process_type.includes("no_knead")) {
      equipScore = 90;
      if (!constraints.has_mixer)
        reasons.push("Non serve impastatrice (no-knead)");
    } else if (constraints.has_mixer) {
      equipScore = 90;
      reasons.push("La tua impastatrice facilita il processo");
    } else if (hCenter > 70) {
      equipScore = 50;
      warnings.push(
        "Idratazione alta: impastatrice consigliata",
      );
    }

    if (
      constraints.has_pizza_stone ||
      constraints.has_pizza_steel
    ) {
      equipScore = Math.min(100, equipScore + 10);
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
        reasons.push("Farina in dispensa compatibile");
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
          warnings.push(
            "Farina parzialmente adatta (W non ideale)",
          );
        } else {
          pantryScore = 30;
          warnings.push(
            "Nessuna farina in dispensa nel range W richiesto",
          );
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
        reasons.push(
          "Lievito madre ideale per maturazione lunga",
        );
      }

      // Warning if only sourdough but style needs short ferment
      if (hasSourdough && !hasCommercial && fMax < 8) {
        pantryScore = Math.max(20, pantryScore - 20);
        warnings.push(
          "Solo lievito madre: fermentazione breve difficile",
        );
      }

      // No commercial yeast warning for styles needing precise timing
      if (!hasCommercial && !hasSourdough) {
        pantryScore = Math.max(30, pantryScore - 15);
      }
    }

    // ── Weighted composite — pantry takes 20% from time/oven/skill ──
    score = Math.round(
      timeScore * 0.25 +
        ovenScore * 0.25 +
        skillScore * 0.2 +
        equipScore * 0.1 +
        pantryScore * 0.2,
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
): { score: number; category: string; claims: string[] } {
  const claims: string[] = [];

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
    claims.push("Cottura rapida: basso consumo energetico");
  } else if (cookTimeSec <= 600) {
    cookEfficiency = 80;
  } else if (cookTimeSec <= 1200) {
    cookEfficiency = 60;
  } else {
    cookEfficiency = 40;
    claims.push("Cottura lunga: consumo energetico elevato");
  }

  // ── Fermentation efficiency (20%): ambient temp = no fridge energy ──
  let ferEfficiency: number;
  if (fermentationTempC >= 18 && fermentationTempC <= 26) {
    ferEfficiency = 95;
    claims.push(
      "Fermentazione a temperatura ambiente: nessun consumo frigorifero",
    );
  } else if (fermentationTempC <= 4) {
    ferEfficiency = 55;
  } else {
    ferEfficiency = 70;
  }

  // ── Ingredient simplicity (15%): fewer additives ──
  let ingredientScore = 80;
  if (!style.allows_additives) {
    ingredientScore = 95;
    claims.push(
      "Impasto puro: solo farina, acqua, sale, lievito",
    );
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
    claims.push("Lievito madre: autoprodotto, a impatto zero");
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