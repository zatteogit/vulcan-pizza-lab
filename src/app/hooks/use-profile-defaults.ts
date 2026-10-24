/* ═══ VPL-067: Profile Data Bridge ═══
 * Shared hook that reads user preferences from localStorage
 * (written by ProfilePage) and returns them as UserConstraints.
 * Used by HomePage wizard and RecipePage. */

import { useMemo } from "react";
import type {
  UserConstraints,
  OvenType,
  SkillLevel,
} from "../domain/pizza-engine";
import { DEFAULT_KITCHEN_TEMP } from "../domain/pizza-engine";

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
  isProfileComplete: boolean;
  pizzaNerdEnabled: boolean;
  /** Summary label: "Forno elettrico 250°C · Intermedio" */
  summaryLabel: string;
}

const SKILL_LABELS: Record<number, string> = {
  1: "Principiante",
  2: "Intermedio",
  3: "Esperto",
};

const OVEN_LABELS: Record<string, string> = {
  home: "Forno di casa",
  electric_standard: "Elettrico standard",
  electric_high: "Elettrico alta temp.",
  gas: "Forno a gas a platea",
  gas_pizza: "Forno a gas da pizza",
  wood: "Forno a legna",
};

export function loadProfileDefaults(): ProfileDefaults {
  let ovenType: OvenType = "home";
  let ovenTemp = 250;
  let skillLevel: SkillLevel = 2;
  let dietaryFilters: string[] = [];
  let pantryFlours: string[] = [];
  let pantryYeasts: string[] = [];
  let isProfileComplete = false;
  let pizzaNerdEnabled = false;

  try {
    isProfileComplete = localStorage.getItem(PROFILE_COMPLETE_KEY) === "true";
    pizzaNerdEnabled = localStorage.getItem(NERD_STORAGE_KEY) === "true";
    const oven = loadJson<{ ovenType?: OvenType; maxTemp?: number }>(OVEN_STORAGE_KEY);
    if (oven) {
      ovenType = oven.ovenType ?? ovenType;
      ovenTemp = oven.maxTemp ?? ovenTemp;
    }
    const skill = loadJson<number>(SKILL_STORAGE_KEY);
    if (skill) skillLevel = skill as SkillLevel;
    const dietary = loadJson<string[]>(DIETARY_STORAGE_KEY);
    if (dietary) dietaryFilters = dietary;
    const pantry = loadJson<{ flours?: string[]; yeasts?: string[] }>(PANTRY_STORAGE_KEY);
    if (pantry) {
      pantryFlours = pantry.flours ?? [];
      pantryYeasts = pantry.yeasts ?? [];
    }
  } catch { /* */ }

  const constraints: UserConstraints = {
    oven_type: ovenType,
    oven_max_temp_c: ovenTemp,
    skill_level: skillLevel,
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: dietaryFilters,
    kitchen_temp_c: DEFAULT_KITCHEN_TEMP,
    pantry_flours: pantryFlours,
    pantry_yeasts: pantryYeasts,
    yeast_speed_factor: loadYeastSpeedFactor(),
  };

  /* Equipment from profile — supports both old and new format */
  try {
    const equip = loadJson<Record<string, any>>(EQUIPMENT_STORAGE_KEY);
    if (equip) {
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
        constraints.oven_heat_profile = equip.oven_heat_profile ?? constraints.oven_heat_profile;
      }
    }
  } catch { /* */ }

  const ovenLabel = OVEN_LABELS[ovenType] ?? ovenType;
  const skillLabel = SKILL_LABELS[skillLevel] ?? `Skill ${skillLevel}`;
  const summaryLabel = `${ovenLabel} ${ovenTemp}°C · ${skillLabel}`;

  return { constraints, isProfileComplete, pizzaNerdEnabled, summaryLabel };
}

/* ═══ Audit n. 11 (C-03): il profilo vince sulla bozza per ciò che non si
 * sceglie in Crea ═══
 * La bozza di Crea salva tutti i vincoli. Riaprendola dopo aver cambiato il
 * profilo (es. impastatrice a spirale), i vecchi valori coprivano i nuovi e il
 * procedimento diceva ancora «impastare a mano». Attrezzatura, livello,
 * dispensa, dieta e correzione del lievito si impostano solo nel profilo,
 * quindi si rileggono sempre da lì; forno, ore e panetti restano della bozza. */
export const PROFILE_OWNED_CONSTRAINTS = [
  "skill_level",
  "has_mixer",
  "has_pizza_stone",
  "has_pizza_steel",
  "has_baking_pan",
  "mixer_type",
  "surfaces",
  "oven_heat_profile",
  "dietary_filters",
  "pantry_flours",
  "pantry_yeasts",
  "yeast_speed_factor",
] as const satisfies readonly (keyof UserConstraints)[];

const EQUIPMENT_KEYS = [
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
  return merged;
}

export function useProfileDefaults(): ProfileDefaults {
  return useMemo(() => loadProfileDefaults(), []);
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
  return 2;
}
