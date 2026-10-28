/* ═══ VPL-067: Profile Data Bridge ═══
 * Shared hook that reads user preferences from localStorage
 * (written by ProfilePage) and returns them as UserConstraints.
 * Used by HomePage wizard and RecipePage. */

import { normalizeAllergenIds } from "../data/allergen-data";
import { useMemo } from "react";
import type {
  UserConstraints,
  SkillLevel,
} from "../domain/pizza-engine";
import {
  kitchenConstraints,
  resolveEffectiveKitchen,
  type EffectiveKitchen,
  type SavedEquipment,
  type SavedOvenPref,
} from "../use-cases/effective-kitchen";
import { DEFAULT_KITCHEN_TEMP } from "../domain/pizza-engine";

import { normalizePantryFlourDetails, type PantryFlourDetails } from "../domain/pantry-ingredients";
import { loadYeastSpeedFactor } from "../adapters/browser/yeast-speed-storage";

/* ═══ STORAGE KEYS (must match profile.tsx) ═══ */
const OVEN_STORAGE_KEY = "vulcan_oven_pref";
const PANTRY_STORAGE_KEY = "vulcan_pantry";
const SKILL_STORAGE_KEY = "vulcan_skill_level";
const DIETARY_STORAGE_KEY = "vulcan_dietary";
const EQUIPMENT_STORAGE_KEY = "vulcan_equipment";
const PROFILE_COMPLETE_KEY = "vulcan_profile_complete";
const NERD_STORAGE_KEY = "vulcan_nerd_on";

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return null;
}

interface ProfileDefaults {
  constraints: UserConstraints;
  /** FW-07: la cucina effettiva (forno con modello, impastatrice, calore). */
  kitchen: EffectiveKitchen;
  isProfileComplete: boolean;
  pizzaNerdEnabled: boolean;
}

/** FW-07: forno e attrezzatura salvati, risolti nella cucina effettiva. */
export function loadEffectiveKitchen(): EffectiveKitchen {
  return resolveEffectiveKitchen({
    oven: loadJson<SavedOvenPref>(OVEN_STORAGE_KEY),
    equipment: loadJson<SavedEquipment>(EQUIPMENT_STORAGE_KEY),
  });
}

export function loadProfileDefaults(): ProfileDefaults {
  const kitchen = loadEffectiveKitchen();
  let skillLevel: SkillLevel = 1;
  let dietaryFilters: string[] = [];
  let pantryFlours: string[] = [];
  let pantryYeasts: string[] = [];
  let pantryPolicy: Partial<UserConstraints> = {};
  let isProfileComplete = false;
  let pizzaNerdEnabled = false;

  try {
    isProfileComplete = localStorage.getItem(PROFILE_COMPLETE_KEY) === "true";
    pizzaNerdEnabled = localStorage.getItem(NERD_STORAGE_KEY) === "true";
    const skill = loadJson<number>(SKILL_STORAGE_KEY);
    if (skill) skillLevel = skill as SkillLevel;
    const dietary = loadJson<string[]>(DIETARY_STORAGE_KEY);
    if (dietary) dietaryFilters = dietary;
    const pantry = loadJson<{ flours?: string[]; yeasts?: string[]; inventory_complete?: boolean; allow_purchase?: boolean; excluded_flours?: string[]; flour_details?: Record<string, PantryFlourDetails>; ingredients?: string[]; ingredients_complete?: boolean; excluded_ingredients?: string[]; excluded_yeasts?: string[] }>(PANTRY_STORAGE_KEY);
    if (pantry) {
      pantryFlours = pantry.flours ?? [];
      pantryYeasts = pantry.yeasts ?? [];
      pantryPolicy = { pantry_inventory_complete: pantry.inventory_complete, allow_flour_purchase: pantry.allow_purchase, excluded_flours: pantry.excluded_flours, pantry_flour_details: normalizePantryFlourDetails(pantry.flour_details), pantry_ingredients: pantry.ingredients, pantry_ingredients_complete: pantry.ingredients_complete, excluded_ingredients: pantry.excluded_ingredients, excluded_yeasts: pantry.excluded_yeasts };
    }
  } catch { /* */ }

  const { oven_heat_profile: kitchenHeat, ...kitchenOven } = kitchenConstraints(kitchen);
  const constraints: UserConstraints = {
    ...kitchenOven,
    skill_level: skillLevel,
    available_hours: 0,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: dietaryFilters,
    allergens_avoid: normalizeAllergenIds(loadJson("vulcan_allergens")),
    kitchen_temp_c: DEFAULT_KITCHEN_TEMP,
    pantry_flours: pantryFlours,
    pantry_yeasts: pantryYeasts,
    yeast_speed_factor: loadYeastSpeedFactor(),
    ...pantryPolicy,
  };

  /* Equipment from profile — supports both old and new format */
  try {
    const equip = loadJson<Record<string, any>>(EQUIPMENT_STORAGE_KEY);
    if (equip) {
      constraints.equipment_inventory_complete = equip.inventory_complete;
      constraints.allow_equipment_purchase = equip.allow_purchase;
      // Legacy boolean flags (work with both formats)
      if (equip.mixer) constraints.has_mixer = true;
      if (equip.pizza_stone) constraints.has_pizza_stone = true;
      if (equip.pizza_steel) constraints.has_pizza_steel = true;
      if (equip.baking_pan) constraints.has_baking_pan = true;
      // Advanced fields (new format only)
      if ("mixer_type" in equip) {
        /* Migrazione: "hand" (valore storico errato) → "hands" canonico */
        constraints.mixer_type =
          equip.mixer_type === "hand" ? "hands" : (equip.mixer_type ?? null);
        constraints.surfaces = Array.isArray(equip.surfaces) ? equip.surfaces : [];
        
        // Deriva dinamicamente i flag legacy basandosi sul formato avanzato
        constraints.has_mixer = constraints.mixer_type !== null && constraints.mixer_type !== "hands";
        constraints.has_pizza_stone = constraints.surfaces.includes("refractory_brick") || constraints.surfaces.includes("cordierite_stone");
        constraints.has_pizza_steel = constraints.surfaces.includes("steel_plate");
        constraints.has_baking_pan = constraints.surfaces.includes("aluminum_pan") || constraints.surfaces.includes("blue_steel_pan") || constraints.surfaces.includes("cast_iron");
        // FW-07: solo una distribuzione del calore valida per il tipo di forno.
        if (kitchenHeat) constraints.oven_heat_profile = kitchenHeat;
      }
    }
  } catch { /* */ }

  return { constraints, kitchen, isProfileComplete, pizzaNerdEnabled };
}

/* ═══ Audit n. 11 (C-03): il profilo vince sulla bozza per ciò che non si
 * sceglie in Crea ═══
 * La bozza di Crea salva tutti i vincoli. Riaprendola dopo aver cambiato il
 * profilo (es. impastatrice a spirale), i vecchi valori coprivano i nuovi e il
 * procedimento diceva ancora «impastare a mano». Attrezzatura, livello,
 * dispensa, dieta e correzione del lievito si impostano solo nel profilo,
 * quindi si rileggono sempre da lì. Anche il forno salvato è la scelta corrente
 * della cucina: una vecchia bozza non può ripristinarne uno più potente.
 * Ore e panetti restano della bozza. */
export const PROFILE_OWNED_CONSTRAINTS = [
  "oven_type",
  "oven_max_temp_c",
  "oven_capacity_temp_c",
  "oven_max_pizza_cm",
  "skill_level",
  "has_mixer",
  "has_pizza_stone",
  "has_pizza_steel",
  "has_baking_pan",
  "mixer_type",
  "surfaces",
  "oven_heat_profile",
  "dietary_filters",
  "allergens_avoid",
  "pantry_flours",
  "pantry_yeasts",
  "pantry_inventory_complete",
  "allow_flour_purchase",
  "excluded_flours",
  "pantry_flour_details",
  "pantry_ingredients",
  "pantry_ingredients_complete",
  "excluded_ingredients",
  "excluded_yeasts",
  "equipment_inventory_complete",
  "allow_equipment_purchase",
  "yeast_speed_factor",
] as const satisfies readonly (keyof UserConstraints)[];

const EQUIPMENT_KEYS = [
  "equipment_inventory_complete",
  "allow_equipment_purchase",
  "has_mixer",
  "has_pizza_stone",
  "has_pizza_steel",
  "has_baking_pan",
  "mixer_type",
  "surfaces",
  "oven_heat_profile",
] as const satisfies readonly (keyof UserConstraints)[];

/** Solo l'attrezzatura del profilo (impastatrice, superfici, resistenze). */
export function profileEquipment(profile: UserConstraints): Partial<UserConstraints> {
  const equipment: Partial<UserConstraints> = {};
  for (const key of EQUIPMENT_KEYS) {
    if (key in profile) (equipment as Record<string, unknown>)[key] = profile[key];
  }
  return equipment;
}

export function mergeDraftConstraints(
  profile: UserConstraints,
  draft: Partial<UserConstraints> | undefined,
): UserConstraints {
  const merged: UserConstraints = { ...profile, ...(draft ?? {}) };
  for (const key of PROFILE_OWNED_CONSTRAINTS) {
    if (key in profile) {
      (merged as unknown as Record<string, unknown>)[key] = profile[key];
    } else {
      delete (merged as unknown as Record<string, unknown>)[key];
    }
  }
  if (draft?.oven_type === profile.oven_type && typeof draft.oven_max_temp_c === "number" && draft.oven_max_temp_c > 0) {
    merged.oven_max_temp_c = Math.min(draft.oven_max_temp_c, profile.oven_capacity_temp_c ?? profile.oven_max_temp_c);
  }
  return merged;
}

export function useProfileDefaults(): ProfileDefaults {
  return useMemo(() => loadProfileDefaults(), []);
}

/** Audit n. 33: il livello è stato scelto (percorso o profilo)? Senza
 *  scelta l'app usa 1, come Crea e Profilo, senza presentarlo come una scelta. */
export function hasChosenSkill(): boolean {
  try {
    return localStorage.getItem(SKILL_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function loadSkill(): SkillLevel {
  try {
    const raw = localStorage.getItem(SKILL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "number" && (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4)) {
        return parsed as SkillLevel;
      }
    }
  } catch { /* */ }
  return 1;
}
