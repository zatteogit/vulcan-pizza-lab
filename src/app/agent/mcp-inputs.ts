import type { PanConfig, UserConstraints } from "../domain/pizza-engine";
import { normalizePantryFlourDetails, pantryIngredientId } from "../domain/pantry-ingredients";
import { ALLERGEN_IDS, normalizeAllergenLabels } from "../data/allergen-data";

export type ToolArgs = Record<string, unknown>;
export class ToolInputError extends Error {}

export function numberInput(args: ToolArgs, key: string, min: number, max: number, fallback?: number): number {
  const value = args[key];
  if (value === undefined) {
    if (fallback === undefined) throw new ToolInputError(`missing "${key}"`);
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new ToolInputError(`"${key}" must be a number between ${min} and ${max}`);
  }
  return value;
}

export function optionalBoolean(args: ToolArgs, key: string): boolean | undefined {
  if (args[key] === undefined) return undefined;
  if (typeof args[key] !== "boolean") throw new ToolInputError(`"${key}" must be a boolean`);
  return args[key] as boolean;
}

export function stringList(args: ToolArgs, key: string, allowed?: readonly string[]): string[] | undefined {
  const raw = args[key];
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > 1000 || raw.some(v => typeof v !== "string" || !v.trim() || v.length > 200)) {
    throw new ToolInputError(`"${key}" must be an array of up to 1000 non-empty strings`);
  }
  const result = [...new Set(raw.map(v => (v as string).trim()))];
  if (allowed && result.some(v => !allowed.includes(v))) throw new ToolInputError(`"${key}" must contain only: ${allowed.join(", ")}`);
  return result;
}

export function enumInput<T extends string>(args: ToolArgs, key: string, allowed: readonly T[]): T | undefined {
  if (args[key] === undefined) return undefined;
  if (typeof args[key] !== "string" || !allowed.includes(args[key] as T)) throw new ToolInputError(`"${key}" must be one of ${allowed.join(", ")}`);
  return args[key] as T;
}

const yeasts = ["fresh", "dry", "sourdough"] as const;
const mixers = ["hands", "planetary", "spiral", "fork", "stand_domestic"] as const;
const surfaces = ["aluminum_pan", "blue_steel_pan", "cast_iron", "cordierite_stone", "refractory_brick", "steel_plate", "oven_rack"] as const;
const heat = ["static_top_bottom", "top_grill", "bottom_boost", "fan_assisted", "gas_bottom", "gas_rear", "wood_side_flame"] as const;
const diets = ["gluten_free", "lactose_free", "vegan", "low_fodmap", "histamine", "nickel"] as const;
const listSchema = (description: string, values?: readonly string[]) => ({ type: "array", maxItems: 1000, items: { type: "string", ...(values ? { enum: values } : {}) }, description });

export const KITCHEN_INPUT = {
  allergens_avoid: listSchema("EU Annex II groups explicitly to avoid, separate from vegan/lactose-free preferences.", ALLERGEN_IDS),
  included_optional_ingredients: listSchema("Optional ingredient IDs/names explicitly included. Omission keeps them conditional."),
  allergen_labels: {type:"object",maxProperties:100,description:"Actual product labels keyed by ingredient ID/name. Cannot erase intrinsic allergens.",additionalProperties:{type:"object",additionalProperties:false,required:["product","contains","may_contain","complete"],properties:{product:{type:"string",minLength:1,maxLength:120},contains:listSchema("Declared as present.",ALLERGEN_IDS),may_contain:listSchema("Precautionary allergens explicitly stated on this label only.",ALLERGEN_IDS),complete:{type:"boolean"}}}},
  pantry_flours: listSchema("Available flour IDs from list_pantry_items, or custom IDs with pantry_flour_details. Omission/empty partial inventory does not mean absent."),
  pantry_yeasts: listSchema("Available yeasts.", yeasts),
  pantry_inventory_complete: { type: "boolean", description: "True only if the user confirms this flour/yeast inventory is complete." },
  allow_flour_purchase: { type: "boolean", description: "Explicit willingness/refusal to procure flour. Omit when unknown." },
  excluded_flours: listSchema("Flour IDs the user explicitly refuses to use; purchase permission never cancels an exclusion."),
  pantry_flour_details: { type: "object", description: "Per flour ID, product/label data. Never infer W from protein. Custom flour IDs are allowed.", additionalProperties: { type: "object", additionalProperties: false, properties: {
    name: { type: "string", maxLength: 120 }, producer: { type: "string", maxLength: 120 },
    w: { type: "number", exclusiveMinimum: 0, maximum: 1000 }, pl: { type: "number", exclusiveMinimum: 0, maximum: 10 }, protein_pct: { type: "number", minimum: 0, maximum: 100 },
  } } },
  pantry_ingredients: listSchema("Available dough/topping ingredient IDs from list_pantry_items. Italian ingredient names are also normalized to stable IDs."),
  pantry_ingredients_complete: { type: "boolean", description: "True only for a confirmed complete dough/topping ingredient inventory." },
  excluded_ingredients: listSchema("Dough/topping ingredients explicitly forbidden by the user."),
  excluded_yeasts: listSchema("Yeast types explicitly forbidden by the user.", yeasts),
  equipment_inventory_complete: { type: "boolean", description: "True = unavailable equipment is confirmed missing; omitted = unverified." },
  allow_equipment_purchase: { type: "boolean", description: "Explicit willingness/refusal to obtain missing equipment." },
  mixer_type: { type: "string", enum: mixers },
  surfaces: listSchema("Available baking surfaces, same IDs as the browser.", surfaces),
  oven_heat_profile: { type: "string", enum: heat },
  kitchen_temp_c: { type: "number", minimum: 1, maximum: 45, description: "Measured room temperature (°C)." },
  yeast_speed_factor: { type: "number", minimum: 0.5, maximum: 2 },
  dietary_filters: listSchema("Same dietary filter IDs as the browser.", diets),
};

export function kitchenInputs(args: ToolArgs): Partial<UserConstraints> {
  const result: Partial<UserConstraints> = {};
  const allergens = stringList(args,"allergens_avoid",ALLERGEN_IDS);
  if(allergens)result.allergens_avoid=allergens as typeof ALLERGEN_IDS[number][];
  const optional = stringList(args,"included_optional_ingredients");
  if(optional)result.included_optional_ingredients=optional.map(pantryIngredientId);
  if(args.allergen_labels!==undefined){
    const raw=args.allergen_labels;
    if(!raw||typeof raw!=="object"||Array.isArray(raw)||Object.keys(raw).length>100)throw new ToolInputError('allergen_labels must contain up to 100 ingredient labels');
    for(const [id,value]of Object.entries(raw)){
      if(!id.trim()||["__proto__","constructor","prototype"].includes(id)||!value||typeof value!=="object"||Array.isArray(value))throw new ToolInputError('invalid allergen label');
      const d=value as ToolArgs;
      if(Object.keys(d).some(k=>!["product","contains","may_contain","complete"].includes(k))||typeof d.product!=="string"||!d.product.trim()||d.product.length>120||typeof d.complete!=="boolean"||!Array.isArray(d.contains)||!Array.isArray(d.may_contain))throw new ToolInputError('a label requires product, contains, may_contain and complete');
      stringList(d,"contains",ALLERGEN_IDS);stringList(d,"may_contain",ALLERGEN_IDS);
    }
    result.allergen_labels=normalizeAllergenLabels(raw);
  }
  for (const key of ["pantry_inventory_complete", "allow_flour_purchase", "pantry_ingredients_complete", "equipment_inventory_complete", "allow_equipment_purchase"] as const) {
    if (args[key] !== undefined) result[key] = optionalBoolean(args, key);
  }
  for (const key of ["pantry_flours", "excluded_flours", "pantry_yeasts", "excluded_yeasts", "pantry_ingredients", "excluded_ingredients", "dietary_filters", "surfaces"] as const) {
    const value = stringList(args, key, key === "pantry_yeasts" || key === "excluded_yeasts" ? yeasts : key === "surfaces" ? surfaces : key === "dietary_filters" ? diets : undefined);
    if (value) result[key] = key === "pantry_ingredients" || key === "excluded_ingredients" ? value.map(pantryIngredientId) : value;
  }
  if (args.pantry_flour_details !== undefined) {
    const raw = args.pantry_flour_details;
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || Object.keys(raw).length > 250) throw new ToolInputError('"pantry_flour_details" must be an object keyed by flour ID');
    for (const [id, detail] of Object.entries(raw)) {
      if (!id.trim() || ["__proto__", "constructor", "prototype"].includes(id) || !detail || typeof detail !== "object" || Array.isArray(detail)) throw new ToolInputError(`invalid flour detail "${id}"`);
      const d = detail as ToolArgs;
      for (const key of Object.keys(d)) if (!["name", "producer", "w", "pl", "protein_pct"].includes(key)) throw new ToolInputError(`unknown flour field "${key}"`);
      for (const key of ["name", "producer"]) if (d[key] !== undefined && (typeof d[key] !== "string" || (d[key] as string).length > 120)) throw new ToolInputError(`invalid flour ${key}`);
      for (const key of ["w", "pl", "protein_pct"]) if (d[key] !== undefined) numberInput(d, key, key === "protein_pct" ? 0 : Number.MIN_VALUE, key === "w" ? 1000 : key === "pl" ? 10 : 100);
    }
    result.pantry_flour_details = normalizePantryFlourDetails(raw);
  }
  if (args.mixer_type !== undefined) { result.mixer_type = enumInput(args, "mixer_type", mixers); result.has_mixer = result.mixer_type !== "hands"; }
  if (result.surfaces) {
    result.has_baking_pan = result.surfaces.some(s => ["aluminum_pan", "blue_steel_pan", "cast_iron"].includes(s));
    result.has_pizza_stone = result.surfaces.some(s => ["cordierite_stone", "refractory_brick"].includes(s));
    result.has_pizza_steel = result.surfaces.includes("steel_plate");
  }
  if (args.oven_heat_profile !== undefined) result.oven_heat_profile = enumInput(args, "oven_heat_profile", heat);
  if (args.kitchen_temp_c !== undefined) result.kitchen_temp_c = numberInput(args, "kitchen_temp_c", 1, 45);
  if (args.yeast_speed_factor !== undefined) result.yeast_speed_factor = numberInput(args, "yeast_speed_factor", 0.5, 2);
  return result;
}

export const PAN_INPUT = { type: "object", additionalProperties: false, description: "Pan dimensions in cm, matching browser panConfig. ball_weight_g takes precedence over geometry.", properties: {
  shape: { type: "string", enum: ["round", "rectangular"] }, length_cm: { type: "number", exclusiveMinimum: 0, maximum: 200 }, width_cm: { type: "number", exclusiveMinimum: 0, maximum: 200 }, diameter_cm: { type: "number", exclusiveMinimum: 0, maximum: 200 }, thickness: { type: "number", exclusiveMinimum: 0, maximum: 5 },
} };

export function panInput(args: ToolArgs): PanConfig | undefined {
  if (args.pan === undefined && args.ball_weight_g === undefined) return undefined;
  const pan: PanConfig = {};
  if (args.pan !== undefined) {
    if (!args.pan || typeof args.pan !== "object" || Array.isArray(args.pan)) throw new ToolInputError('"pan" must be an object');
    const raw = args.pan as ToolArgs;
    for (const key of Object.keys(raw)) if (!["shape", "length_cm", "width_cm", "diameter_cm", "thickness"].includes(key)) throw new ToolInputError(`unknown pan field "${key}"`);
    if (raw.shape !== undefined) pan.panShape = enumInput(raw, "shape", ["round", "rectangular"]);
    if ((raw.shape === "round" && (raw.length_cm !== undefined || raw.width_cm !== undefined)) || (raw.shape === "rectangular" && raw.diameter_cm !== undefined)) throw new ToolInputError('pan dimensions conflict with its shape');
    for (const [key, target] of [["length_cm", "panLength"], ["width_cm", "panWidth"], ["diameter_cm", "panDiameter"], ["thickness", "thickness"]] as const) {
      if (raw[key] !== undefined) pan[target] = numberInput(raw, key, Number.MIN_VALUE, key === "thickness" ? 5 : 200);
    }
  }
  if (args.ball_weight_g !== undefined) pan.ballWeightG = numberInput(args, "ball_weight_g", 20, 5000);
  return pan;
}
