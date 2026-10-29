import { OVEN_PRESETS, type OvenType, type UserConstraints } from "../domain/pizza-engine";
import { OVEN_MODELS, type OvenModel } from "../data/oven-models";
import { isHeatProfileCompatible, type MixerType, type OvenHeatProfile } from "../data/equipment-data";

/* ═══ FW-07 — La cucina effettiva, una sola ═══
 * Audit 28/10/2026: Crea, Personalizza, la scheda stile, il profilo e il
 * server MCP leggevano il forno ciascuno a modo suo (il tipo generico al posto
 * del modello, «il primo spuntato», la prima impastatrice della lista…). Qui
 * si risolve una volta sola, da dati salvati espliciti, e tutti leggono lo
 * stesso oggetto. Funzione pura: niente browser, niente CMS. */

/** Forno salvato in `vulcan_oven_pref`. */
export interface SavedOvenPref {
  ovenType?: OvenType;
  maxTemp?: number;
  modelId?: string;
  /** Preimpostato dall'edizione e non ancora confermato dall'utente. */
  origin?: "edition";
}

/** Attrezzatura salvata in `vulcan_equipment` (campi usati qui). */
export interface SavedEquipment {
  mixer_type?: string | null;
  mixers_owned?: string[];
  surfaces?: string[];
  oven_heat_profile?: OvenHeatProfile;
}

export interface KitchenProfile {
  oven?: SavedOvenPref | null;
  equipment?: SavedEquipment | null;
}

/** Scelte fatte solo per questa ricetta (Personalizza, MCP). */
export interface KitchenOverrides {
  ovenType?: OvenType;
  maxTempC?: number;
  modelId?: string | null;
}

export interface EffectiveOven {
  type: OvenType;
  modelId?: string;
  /** «Marca Modello» se c'è un modello; altrimenti l'id del tipo (la UI lo traduce). */
  label: string;
  /** Temperatura massima che il motore usa, °C. */
  maxTempC: number;
  /** Massima dichiarata dal produttore del modello, °C. */
  declaredMaxTempC?: number;
  /** Diametro massimo della pizza dichiarato dal produttore, cm. */
  pizzaCm?: number;
  /** Da dove viene il forno: un modello, un tipo scelto, il valore di ripiego. */
  source: "model" | "type" | "default";
  /** Preimpostato dall'edizione e non confermato. */
  fromEdition: boolean;
}

export interface EffectiveKitchen {
  oven: EffectiveOven;
  mixer: { primary: MixerType };
  /** Distribuzione del calore valida per il tipo di forno (altrimenti assente). */
  heatDistribution?: OvenHeatProfile;
  surfaces: string[];
  /** Forno non nato per la pizza (casa o elettrico standard). */
  isHomeOven: boolean;
}

const MIXERS: readonly MixerType[] = ["hands", "planetary", "spiral", "fork", "stand_domestic"];
const DEFAULT_OVEN: OvenType = "home";

export function presetMaxTemp(type: OvenType): number {
  return OVEN_PRESETS.find((preset) => preset.id === type)?.maxTemp ?? 250;
}

function normalizeMixer(value: unknown): MixerType | undefined {
  const id = value === "hand" ? "hands" : value;
  return MIXERS.includes(id as MixerType) ? (id as MixerType) : undefined;
}

export function resolveEffectiveKitchen(
  profile: KitchenProfile,
  edition?: { defaultOven?: OvenModel },
  overrides: KitchenOverrides = {},
  models: readonly OvenModel[] = OVEN_MODELS,
): EffectiveKitchen {
  const saved = profile.oven ?? (edition?.defaultOven
    ? { ovenType: edition.defaultOven.ovenType, maxTemp: edition.defaultOven.maxTempC, modelId: edition.defaultOven.id, origin: "edition" as const }
    : null);
  const type = overrides.ovenType ?? saved?.ovenType ?? DEFAULT_OVEN;
  const typeChanged = overrides.ovenType !== undefined && overrides.ovenType !== saved?.ovenType;
  const modelId = overrides.modelId !== undefined ? overrides.modelId : typeChanged ? undefined : saved?.modelId;
  // Un modello vale solo per il suo tipo di forno: un tipo diverso lo esclude.
  const model = modelId ? models.find((m) => m.id === modelId && m.ovenType === type) : undefined;
  const savedTemp = typeChanged ? undefined : saved?.maxTemp;
  // La temperatura salvata vince (l'utente può abbassarla); senza, quella
  // dichiarata dal modello, poi quella del tipo (509 °C resta 509, S05-A-03).
  const maxTempC = overrides.maxTempC ?? savedTemp ?? model?.maxTempC ?? presetMaxTemp(type);
  const oven: EffectiveOven = {
    type,
    ...(model ? { modelId: model.id, declaredMaxTempC: model.maxTempC } : {}),
    ...(model?.pizzaCm !== undefined ? { pizzaCm: model.pizzaCm } : {}),
    label: model ? `${model.brand} ${model.model}` : type,
    maxTempC,
    source: model ? "model" : overrides.ovenType || saved?.ovenType ? "type" : "default",
    fromEdition: !typeChanged && overrides.modelId === undefined && saved?.origin === "edition",
  };

  const equipment = profile.equipment ?? {};
  // L'impastatrice principale è quella esplicita (mixer_type), poi la prima
  // della lista: il profilo mette in testa l'ultima scelta (S16-A-01).
  const primary = normalizeMixer(equipment.mixer_type) ?? normalizeMixer(equipment.mixers_owned?.[0]) ?? "hands";
  const heat = equipment.oven_heat_profile;
  return {
    oven,
    mixer: { primary },
    ...(isHeatProfileCompatible(heat, type) ? { heatDistribution: heat } : {}),
    surfaces: Array.isArray(equipment.surfaces) ? [...equipment.surfaces] : [],
    isHomeOven: type === "home" || type === "electric_standard",
  };
}

/** I vincoli del motore che dipendono dalla cucina effettiva. */
export function kitchenConstraints(kitchen: EffectiveKitchen): Pick<UserConstraints, "oven_type" | "oven_max_temp_c" | "oven_capacity_temp_c"> & Partial<UserConstraints> {
  return {
    oven_type: kitchen.oven.type,
    oven_max_temp_c: kitchen.oven.maxTempC,
    oven_capacity_temp_c: kitchen.oven.maxTempC,
    ...(kitchen.oven.pizzaCm !== undefined ? { oven_max_pizza_cm: kitchen.oven.pizzaCm } : {}),
    ...(kitchen.heatDistribution ? { oven_heat_profile: kitchen.heatDistribution } : {}),
  };
}

/** Forno da salvare dopo una scelta di tipo in Crea o nel profilo: lo stesso
 *  tipo conserva modello e temperatura; un tipo diverso li toglie (S18-A-02). */
export function nextSavedOven(prev: SavedOvenPref | null | undefined, type: OvenType, maxTemp = presetMaxTemp(type)): SavedOvenPref {
  if (prev?.ovenType === type) {
    const { origin: _origin, ...kept } = prev;
    return { ...kept, ovenType: type, maxTemp: prev.maxTemp ?? maxTemp };
  }
  return { ovenType: type, maxTemp };
}
