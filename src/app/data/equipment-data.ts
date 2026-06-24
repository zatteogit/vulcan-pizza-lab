/* === EQUIPMENT DATA — basato su Database Notion ===
   Fonte: 🔥 Forni, ♨️ Teglie & Piastre, 🥣 Impastatrici, 🔧 Utensili
   Sincronizzato: 17 marzo 2026 */

/* ═══ MIXER (Impastatrici & Planetarie) ═══ */

export type MixerType = "hands" | "planetary" | "spiral" | "fork" | "stand_domestic";
type MixerLevel = "domestic" | "semi_pro" | "professional";

export interface MixerOption {
  id: MixerType;
  label: string;
  description: string;
  emoji: string;
  level: MixerLevel;
  /** Costante K (Regola 55) — attrito termico */
  frictionK?: number;
  /** Attrito °C/min */
  frictionDegMin?: number;
}

const MIXER_OPTIONS: MixerOption[] = [
  {
    id: "hands",
    label: "A mano",
    description: "Impasto manuale, nessuna attrezzatura",
    emoji: "🤲",
    level: "domestic",
  },
  {
    id: "stand_domestic",
    label: "Planetaria domestica",
    description: "KitchenAid, Kenwood, Smeg — 4-7 L, gancio K",
    emoji: "🥣",
    level: "domestic",
    frictionK: 22,
    frictionDegMin: 0.4,
  },
  {
    id: "planetary",
    label: "Planetaria semi-pro",
    description: "10-20 L, gancio a spirale, potenza 500W+",
    emoji: "⚙️",
    level: "semi_pro",
    frictionK: 18,
    frictionDegMin: 0.3,
  },
  {
    id: "spiral",
    label: "Impastatrice a spirale",
    description: "Vasca fissa/ribaltabile, professionale",
    emoji: "🔄",
    level: "professional",
    frictionK: 12,
    frictionDegMin: 0.2,
  },
  {
    id: "fork",
    label: "Impastatrice a forcella",
    description: "Lenta, basso attrito — ideale per alte idratazioni",
    emoji: "🍴",
    level: "professional",
    frictionK: 8,
    frictionDegMin: 0.1,
  },
];

/* ═══ BAKING SURFACE (Teglie & Piastre) ═══ */

export type SurfaceType =
  | "refractory_brick"
  | "cordierite_stone"
  | "steel_plate"
  | "aluminum_pan"
  | "cast_iron"
  | "blue_steel_pan"
  | "oven_rack";

export interface SurfaceOption {
  id: SurfaceType;
  label: string;
  description: string;
  emoji: string;
  /** Conducibilità termica W/(m·K) */
  conductivity: number;
  /** Classe trasferimento calore */
  heatClass: "slow" | "medium" | "fast" | "very_fast";
  /** Stili per cui è ideale */
  bestFor: string[];
}

const SURFACE_OPTIONS: SurfaceOption[] = [
  {
    id: "refractory_brick",
    label: "Biscotto refrattario",
    description: "3 cm, alta massa termica — forno a legna e prosumer",
    emoji: "🧱",
    conductivity: 1.0,
    heatClass: "slow",
    bestFor: ["napoletana_stg", "napoletana_canotto"],
  },
  {
    id: "cordierite_stone",
    label: "Pietra cordierite",
    description: "1.5 cm, compromesso massa/velocità — Effeuno, Ooni",
    emoji: "🪨",
    conductivity: 1.5,
    heatClass: "medium",
    bestFor: ["napoletana_canotto", "new_york", "tonda_romana"],
  },
  {
    id: "steel_plate",
    label: "Piastra in acciaio",
    description: "5-10 mm, trasferimento rapidissimo — base croccante in secondi",
    emoji: "🔩",
    conductivity: 50,
    heatClass: "very_fast",
    bestFor: ["new_york", "tonda_romana", "pinsa_romana"],
  },
  {
    id: "aluminum_pan",
    label: "Teglia in alluminio",
    description: "Leggera, conducibilità estrema — Detroit, teglia romana",
    emoji: "🫕",
    conductivity: 200,
    heatClass: "very_fast",
    bestFor: ["teglia_romana", "detroit", "grandma_style"],
  },
  {
    id: "blue_steel_pan",
    label: "Teglia in ferro blu",
    description: "Antiaderente naturale, bordo alto — teglia romana, focaccia",
    emoji: "🔷",
    conductivity: 50,
    heatClass: "very_fast",
    bestFor: ["teglia_romana", "focaccia_genovese", "sfincione"],
  },
  {
    id: "cast_iron",
    label: "Padella in ghisa",
    description: "Alta massa termica, bordo alto — Chicago, padellino",
    emoji: "⚫",
    conductivity: 52,
    heatClass: "very_fast",
    bestFor: ["chicago_deep", "padellino_torino", "detroit"],
  },
  {
    id: "oven_rack",
    label: "Griglia del forno",
    description: "Nessuna superficie aggiuntiva — solo la griglia standard",
    emoji: "📐",
    conductivity: 0,
    heatClass: "slow",
    bestFor: [],
  },
];

/* ═══ TOOLS (Utensili & Accessori) ═══ */

export type ToolCategory = "essential" | "precision" | "handling" | "containment";

export interface ToolOption {
  id: string;
  label: string;
  emoji: string;
  category: ToolCategory;
  description: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  /* Essential */
  { id: "digital_scale", label: "Bilancia digitale", emoji: "⚖️", category: "essential", description: "Precisione 1g, capacità 5kg+" },
  { id: "thermometer", label: "Termometro", emoji: "🌡️", category: "essential", description: "IR o a sonda, per impasto e forno" },
  { id: "scraper", label: "Raschietto", emoji: "🔪", category: "essential", description: "Plastica flessibile per pieghe e taglio" },
  { id: "containers", label: "Contenitori lievitazione", emoji: "📦", category: "essential", description: "Cassette impilabili o ciotole con coperchio" },
  /* Precision */
  { id: "dough_cutter", label: "Tagliapasta", emoji: "📏", category: "precision", description: "Inox, per porzionare panetti con precisione" },
  { id: "bench_knife", label: "Spatola da banco", emoji: "🗡️", category: "precision", description: "Acciaio inox, per ribaltare impasti ad alta idratazione" },
  { id: "scoring_blade", label: "Lametta per scoring", emoji: "✂️", category: "precision", description: "Per incisioni decorative sulla superficie" },
  /* Handling */
  { id: "pizza_peel_wood", label: "Pala in legno", emoji: "🪵", category: "handling", description: "Per infornare — basso attrito con semola" },
  { id: "pizza_peel_metal", label: "Pala in alluminio", emoji: "🪩", category: "handling", description: "Per girare e sfornare — sottile e reattiva" },
  { id: "pizza_screen", label: "Retina forata", emoji: "🕸️", category: "handling", description: "Alluminio perforato per cottura croccante" },
  /* Containment */
  { id: "proofing_boxes", label: "Cassette per lievitazione", emoji: "🗃️", category: "containment", description: "Impilabili con coperchio — 30×40 o 40×60 cm" },
  { id: "bannetons", label: "Cestini lievitazione", emoji: "🧺", category: "containment", description: "Per forme tonde, con telo in lino" },
];

const TOOL_CATEGORIES: Record<ToolCategory, { label: string; emoji: string }> = {
  essential: { label: "Essenziali", emoji: "⭐" },
  precision: { label: "Precisione", emoji: "🎯" },
  handling: { label: "Movimentazione", emoji: "🖐️" },
  containment: { label: "Contenimento", emoji: "📦" },
};

/* ═══ FULL EQUIPMENT STATE ═══ */

export interface EquipmentState {
  /* Legacy booleans for backward compat with use-profile-defaults.ts */
  mixer: boolean;
  pizza_stone: boolean;
  pizza_steel: boolean;
  baking_pan: boolean;
  /* Advanced fields */
  mixer_type: MixerType | null;
  mixer_level: MixerLevel | null;
  surfaces: SurfaceType[];
  tools: string[];
}

export const DEFAULT_EQUIPMENT: EquipmentState = {
  mixer: false,
  pizza_stone: false,
  pizza_steel: false,
  baking_pan: false,
  mixer_type: null,
  mixer_level: null,
  surfaces: [],
  tools: [],
};

/** Derive legacy booleans from advanced state */
export function syncLegacyFlags(state: EquipmentState): EquipmentState {
  return {
    ...state,
    mixer: state.mixer_type !== null && state.mixer_type !== "hands",
    pizza_stone: state.surfaces.includes("refractory_brick") || state.surfaces.includes("cordierite_stone"),
    pizza_steel: state.surfaces.includes("steel_plate"),
    baking_pan: state.surfaces.includes("aluminum_pan") || state.surfaces.includes("blue_steel_pan") || state.surfaces.includes("cast_iron"),
  };
}

/** Migrate old simple format to new advanced format */
export function migrateEquipment(saved: Record<string, any>): EquipmentState {
  // Already in new format
  if ("mixer_type" in saved) {
    return { ...DEFAULT_EQUIPMENT, ...saved };
  }
  // Old format: { mixer: bool, pizza_stone: bool, pizza_steel: bool, baking_pan: bool }
  const state = { ...DEFAULT_EQUIPMENT };
  if (saved.mixer) {
    state.mixer_type = "stand_domestic";
    state.mixer_level = "domestic";
  }
  if (saved.pizza_stone) {
    state.surfaces.push("cordierite_stone");
  }
  if (saved.pizza_steel) {
    state.surfaces.push("steel_plate");
  }
  if (saved.baking_pan) {
    state.surfaces.push("aluminum_pan");
  }
  return syncLegacyFlags(state);
}

/* ═══ CMS-AWARE LOCALIZATION ═══ */

/** CmsProfile subset needed for equipment localization */
type EquipCmsLabels = Partial<{
  mixerHands: string; mixerHandsDesc: string;
  mixerStandDomestic: string; mixerStandDomesticDesc: string;
  mixerPlanetary: string; mixerPlanetaryDesc: string;
  mixerSpiral: string; mixerSpiralDesc: string;
  mixerFork: string; mixerForkDesc: string;
  mixerLevelHome: string; mixerLevelSemiPro: string; mixerLevelPro: string;
  surfaceRefractory: string; surfaceRefractoryDesc: string;
  surfaceCordierite: string; surfaceCordieriteDesc: string;
  surfaceSteel: string; surfaceSteelDesc: string;
  surfaceAluminum: string; surfaceAluminumDesc: string;
  surfaceBlueSteel: string; surfaceBlueSteelDesc: string;
  surfaceCastIron: string; surfaceCastIronDesc: string;
  surfaceOvenRack: string; surfaceOvenRackDesc: string;
  toolCatEssential: string; toolCatPrecision: string;
  toolCatHandling: string; toolCatContainment: string;
  toolDigitalScale: string; toolDigitalScaleDesc: string;
  toolThermometer: string; toolThermometerDesc: string;
  toolScraper: string; toolScraperDesc: string;
  toolContainers: string; toolContainersDesc: string;
  toolDoughCutter: string; toolDoughCutterDesc: string;
  toolBenchKnife: string; toolBenchKnifeDesc: string;
  toolScoringBlade: string; toolScoringBladeDesc: string;
  toolPeelWood: string; toolPeelWoodDesc: string;
  toolPeelMetal: string; toolPeelMetalDesc: string;
  toolPizzaScreen: string; toolPizzaScreenDesc: string;
  toolProofingBoxes: string; toolProofingBoxesDesc: string;
  toolBannetons: string; toolBannetonsDesc: string;
}>;

const MIXER_CMS_MAP: Record<MixerType, { label: keyof EquipCmsLabels; desc: keyof EquipCmsLabels }> = {
  hands: { label: "mixerHands", desc: "mixerHandsDesc" },
  stand_domestic: { label: "mixerStandDomestic", desc: "mixerStandDomesticDesc" },
  planetary: { label: "mixerPlanetary", desc: "mixerPlanetaryDesc" },
  spiral: { label: "mixerSpiral", desc: "mixerSpiralDesc" },
  fork: { label: "mixerFork", desc: "mixerForkDesc" },
};

const SURFACE_CMS_MAP: Record<SurfaceType, { label: keyof EquipCmsLabels; desc: keyof EquipCmsLabels }> = {
  refractory_brick: { label: "surfaceRefractory", desc: "surfaceRefractoryDesc" },
  cordierite_stone: { label: "surfaceCordierite", desc: "surfaceCordieriteDesc" },
  steel_plate: { label: "surfaceSteel", desc: "surfaceSteelDesc" },
  aluminum_pan: { label: "surfaceAluminum", desc: "surfaceAluminumDesc" },
  blue_steel_pan: { label: "surfaceBlueSteel", desc: "surfaceBlueSteelDesc" },
  cast_iron: { label: "surfaceCastIron", desc: "surfaceCastIronDesc" },
  oven_rack: { label: "surfaceOvenRack", desc: "surfaceOvenRackDesc" },
};

const TOOL_CMS_MAP: Record<string, { label: keyof EquipCmsLabels; desc: keyof EquipCmsLabels }> = {
  digital_scale: { label: "toolDigitalScale", desc: "toolDigitalScaleDesc" },
  thermometer: { label: "toolThermometer", desc: "toolThermometerDesc" },
  scraper: { label: "toolScraper", desc: "toolScraperDesc" },
  containers: { label: "toolContainers", desc: "toolContainersDesc" },
  dough_cutter: { label: "toolDoughCutter", desc: "toolDoughCutterDesc" },
  bench_knife: { label: "toolBenchKnife", desc: "toolBenchKnifeDesc" },
  scoring_blade: { label: "toolScoringBlade", desc: "toolScoringBladeDesc" },
  pizza_peel_wood: { label: "toolPeelWood", desc: "toolPeelWoodDesc" },
  pizza_peel_metal: { label: "toolPeelMetal", desc: "toolPeelMetalDesc" },
  pizza_screen: { label: "toolPizzaScreen", desc: "toolPizzaScreenDesc" },
  proofing_boxes: { label: "toolProofingBoxes", desc: "toolProofingBoxesDesc" },
  bannetons: { label: "toolBannetons", desc: "toolBannetonsDesc" },
};

const LEVEL_CMS_MAP: Record<MixerLevel, keyof EquipCmsLabels> = {
  domestic: "mixerLevelHome",
  semi_pro: "mixerLevelSemiPro",
  professional: "mixerLevelPro",
};

const CAT_CMS_MAP: Record<ToolCategory, keyof EquipCmsLabels> = {
  essential: "toolCatEssential",
  precision: "toolCatPrecision",
  handling: "toolCatHandling",
  containment: "toolCatContainment",
};

/** Return localized mixer options, overriding label/description from CMS */
export function getLocalizedMixerOptions(cms: EquipCmsLabels): MixerOption[] {
  return MIXER_OPTIONS.map((m) => {
    const map = MIXER_CMS_MAP[m.id];
    return {
      ...m,
      label: (cms[map.label] as string) || m.label,
      description: (cms[map.desc] as string) || m.description,
    };
  });
}

/** Return localized surface options */
export function getLocalizedSurfaceOptions(cms: EquipCmsLabels): SurfaceOption[] {
  return SURFACE_OPTIONS.map((s) => {
    const map = SURFACE_CMS_MAP[s.id];
    return {
      ...s,
      label: (cms[map.label] as string) || s.label,
      description: (cms[map.desc] as string) || s.description,
    };
  });
}

/** Return localized tool options */
export function getLocalizedToolOptions(cms: EquipCmsLabels): ToolOption[] {
  return TOOL_OPTIONS.map((t) => {
    const map = TOOL_CMS_MAP[t.id];
    if (!map) return t;
    return {
      ...t,
      label: (cms[map.label] as string) || t.label,
      description: (cms[map.desc] as string) || t.description,
    };
  });
}

/** Return localized tool categories */
export function getLocalizedToolCategories(cms: EquipCmsLabels): Record<ToolCategory, { label: string; emoji: string }> {
  return {
    essential: { ...TOOL_CATEGORIES.essential, label: (cms[CAT_CMS_MAP.essential] as string) || TOOL_CATEGORIES.essential.label },
    precision: { ...TOOL_CATEGORIES.precision, label: (cms[CAT_CMS_MAP.precision] as string) || TOOL_CATEGORIES.precision.label },
    handling: { ...TOOL_CATEGORIES.handling, label: (cms[CAT_CMS_MAP.handling] as string) || TOOL_CATEGORIES.handling.label },
    containment: { ...TOOL_CATEGORIES.containment, label: (cms[CAT_CMS_MAP.containment] as string) || TOOL_CATEGORIES.containment.label },
  };
}