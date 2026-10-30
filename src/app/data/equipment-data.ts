import type { OvenType } from "../domain/pizza-engine";

/* === EQUIPMENT DATA — basato su Database Notion ===
   Fonte: 🔥 Forni, ♨️ Teglie & Piastre, 🥣 Impastatrici, 🔧 Utensili
   Sincronizzato: 17 marzo 2026 */

/* ═══ MIXER (Impastatrici & Planetarie) ═══ */

export type MixerType = "hands" | "planetary" | "spiral" | "fork" | "stand_domestic";
type MixerLevel = "domestic" | "semi_pro" | "professional";

interface MixerOption {
  id: MixerType;
  /** Nome e descrizione arrivano dal CMS (getLocalizedMixerOptions): i dati
   *  non ne tengono una copia italiana (stesso testo di CMS_DEFAULTS). */
  label: string;
  description: string;
  emoji: string;
  level: MixerLevel;
  /** Costante K (Regola 55) — attrito termico */
  frictionK?: number;
  /** Attrito °C/min */
  frictionDegMin?: number;
}

const MIXER_OPTIONS: Omit<MixerOption, "label" | "description">[] = [
  {
    id: "hands",
    emoji: "🤲",
    level: "domestic",
  },
  {
    id: "stand_domestic",
    emoji: "🥣",
    level: "domestic",
    frictionK: 22,
    frictionDegMin: 0.4,
  },
  {
    id: "planetary",
    emoji: "⚙️",
    level: "semi_pro",
    frictionK: 18,
    frictionDegMin: 0.3,
  },
  {
    id: "spiral",
    emoji: "🔄",
    level: "professional",
    frictionK: 12,
    frictionDegMin: 0.2,
  },
  {
    id: "fork",
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

export type OvenHeatProfile =
  | "static_top_bottom"
  | "top_grill"
  | "bottom_boost"
  | "fan_assisted"
  | "gas_bottom"
  | "gas_rear"
  | "wood_side_flame";

/* ═══ FW-07 — distribuzione del calore valida per tipo di forno ═══
 * Scelta di Vulcan (mappatura editoriale, non una misura): quali disposizioni
 * di resistenze o bruciatori esistono su ciascun tipo di forno. Un forno a
 * legna non ha un grill superiore e un forno di casa non ha una fiamma
 * laterale: il profilo mostra solo le opzioni valide e il motore ignora una
 * combinazione impossibile (audit 28/10/2026, S16-B-03/A-13). */
export const HEAT_PROFILE_OVENS: Record<OvenHeatProfile, readonly OvenType[]> = {
  static_top_bottom: ["home", "electric_standard", "electric_high"],
  top_grill: ["home", "electric_standard"],
  bottom_boost: ["home", "electric_standard", "electric_high"],
  fan_assisted: ["home", "electric_standard"],
  gas_bottom: ["gas", "gas_pizza"],
  gas_rear: ["gas", "gas_pizza"],
  wood_side_flame: ["wood"],
};

export function isHeatProfileCompatible(profile: OvenHeatProfile | undefined | null, ovenType: OvenType): boolean {
  return !!profile && (HEAT_PROFILE_OVENS[profile]?.includes(ovenType) ?? false);
}

/** Distribuzioni valide per il forno, nell'ordine in cui si mostrano. */
export function compatibleHeatProfiles(ovenType: OvenType): OvenHeatProfile[] {
  return (Object.keys(HEAT_PROFILE_OVENS) as OvenHeatProfile[]).filter((id) => HEAT_PROFILE_OVENS[id].includes(ovenType));
}

interface SurfaceOption {
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

const SURFACE_OPTIONS: Omit<SurfaceOption, "label" | "description">[] = [
  {
    id: "refractory_brick",
    emoji: "🧱",
    conductivity: 1.0,
    heatClass: "slow",
    bestFor: ["napoletana_stg", "napoletana_canotto"],
  },
  {
    id: "cordierite_stone",
    emoji: "🪨",
    conductivity: 1.5,
    heatClass: "medium",
    bestFor: ["napoletana_canotto", "new_york", "tonda_romana"],
  },
  {
    id: "steel_plate",
    emoji: "🔩",
    conductivity: 50,
    heatClass: "very_fast",
    bestFor: ["new_york", "tonda_romana", "pinsa_romana"],
  },
  {
    id: "aluminum_pan",
    emoji: "🫕",
    conductivity: 200,
    heatClass: "very_fast",
    bestFor: ["teglia_romana", "detroit", "grandma_style"],
  },
  {
    id: "blue_steel_pan",
    emoji: "🔷",
    conductivity: 50,
    heatClass: "very_fast",
    bestFor: ["teglia_romana", "focaccia_genovese", "sfincione"],
  },
  {
    id: "cast_iron",
    emoji: "⚫",
    conductivity: 52,
    heatClass: "very_fast",
    bestFor: ["chicago_deep", "padellino_torino", "detroit"],
  },
  {
    id: "oven_rack",
    emoji: "📐",
    conductivity: 0,
    heatClass: "slow",
    bestFor: [],
  },
];

/* ═══ TOOLS (Utensili & Accessori) ═══ */

export type ToolCategory = "essential" | "precision" | "handling" | "containment";

interface ToolOption {
  id: string;
  label: string;
  emoji: string;
  category: ToolCategory;
  description: string;
}

const TOOL_OPTIONS: Omit<ToolOption, "label" | "description">[] = [
  /* Essential */
  { id: "digital_scale", emoji: "⚖️", category: "essential", },
  { id: "thermometer", emoji: "🌡️", category: "essential", },
  { id: "scraper", emoji: "🔪", category: "essential", },
  /* FW-16: «Cassette per lievitazione» era lo stesso oggetto: unito qui
     (gli id salvati «proofing_boxes» migrano a «containers»). */
  { id: "containers", emoji: "📦", category: "essential", },
  /* Precision */
  { id: "dough_cutter", emoji: "📏", category: "precision", },
  { id: "bench_knife", emoji: "🗡️", category: "precision", },
  { id: "scoring_blade", emoji: "✂️", category: "precision", },
  /* Handling */
  { id: "pizza_peel_wood", emoji: "🪵", category: "handling", },
  { id: "pizza_peel_metal", emoji: "🪩", category: "handling", },
  { id: "pizza_screen", emoji: "🕸️", category: "handling", },
  /* Containment */
  { id: "bannetons", emoji: "🧺", category: "containment", },
];

const TOOL_CATEGORY_EMOJI: Record<ToolCategory, { emoji: string }> = {
  essential: { emoji: "⭐" },
  precision: { emoji: "🎯" },
  handling: { emoji: "🖐️" },
  containment: { emoji: "📦" },
};

/* ═══ FULL EQUIPMENT STATE ═══ */

export interface EquipmentState {
  inventory_complete?: boolean;
  allow_purchase?: boolean;
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
  oven_heat_profile?: OvenHeatProfile;
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
  oven_heat_profile: "static_top_bottom",
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
    const merged: EquipmentState = { ...DEFAULT_EQUIPMENT, ...saved };
    /* FW-16: le cassette sono confluite nei contenitori di lievitazione. */
    if (Array.isArray(merged.tools) && merged.tools.includes("proofing_boxes")) {
      merged.tools = [...new Set(merged.tools.map((t) => (t === "proofing_boxes" ? "containers" : t)))];
    }
    return merged;
  }
  // Old format: { mixer: bool, pizza_stone: bool, pizza_steel: bool, baking_pan: bool }
  const state: EquipmentState = { ...DEFAULT_EQUIPMENT, inventory_complete: saved.inventory_complete, allow_purchase: saved.allow_purchase, surfaces: [...DEFAULT_EQUIPMENT.surfaces] };
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
  bannetons: { label: "toolBannetons", desc: "toolBannetonsDesc" },
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
      label: cms[map.label] ?? "",
      description: cms[map.desc] ?? "",
    };
  });
}

/** Return localized surface options */
export function getLocalizedSurfaceOptions(cms: EquipCmsLabels): SurfaceOption[] {
  return SURFACE_OPTIONS.map((s) => {
    const map = SURFACE_CMS_MAP[s.id];
    return {
      ...s,
      label: cms[map.label] ?? "",
      description: cms[map.desc] ?? "",
    };
  });
}

/** Return localized tool options */
export function getLocalizedToolOptions(cms: EquipCmsLabels): ToolOption[] {
  return TOOL_OPTIONS.map((t) => {
    const map = TOOL_CMS_MAP[t.id];
    return {
      ...t,
      label: map ? cms[map.label] ?? "" : t.id,
      description: map ? cms[map.desc] ?? "" : "",
    };
  });
}

/** Return localized tool categories */
export function getLocalizedToolCategories(cms: EquipCmsLabels): Record<ToolCategory, { label: string; emoji: string }> {
  const out = {} as Record<ToolCategory, { label: string; emoji: string }>;
  for (const id of Object.keys(CAT_CMS_MAP) as ToolCategory[]) {
    out[id] = { ...TOOL_CATEGORY_EMOJI[id], label: cms[CAT_CMS_MAP[id]] ?? "" };
  }
  return out;
}
