import { describe, expect, it } from "vitest";
import type { UserConstraints } from "../domain/pizza-engine";
import { mergeDraftConstraints, profileEquipment } from "./use-profile-defaults";

/* Audit n. 11 (C-03): il profilo cambiato deve arrivare alla bozza aperta. */

const profile: UserConstraints = {
  oven_type: "home",
  oven_max_temp_c: 250,
  skill_level: 3,
  available_hours: 24,
  dough_balls: 4,
  has_mixer: true,
  has_pizza_stone: true,
  has_pizza_steel: false,
  has_baking_pan: false,
  dietary_filters: [],
  pantry_flours: ["00"],
  pantry_yeasts: ["fresh"],
  mixer_type: "spiral",
  surfaces: ["cordierite_stone"],
};

describe("mergeDraftConstraints", () => {
  it("l'attrezzatura e il livello vengono dal profilo, non dalla bozza", () => {
    const merged = mergeDraftConstraints(profile, {
      ...profile,
      skill_level: 1,
      has_mixer: false,
      mixer_type: "hands",
      surfaces: [],
      has_pizza_stone: false,
    });
    expect(merged.mixer_type).toBe("spiral");
    expect(merged.has_mixer).toBe(true);
    expect(merged.surfaces).toEqual(["cordierite_stone"]);
    expect(merged.has_pizza_stone).toBe(true);
    expect(merged.skill_level).toBe(3);
  });

  it("il forno corrente vince sulla bozza; ore e panetti restano quelli scelti", () => {
    const merged = mergeDraftConstraints(profile, {
      oven_type: "electric_high",
      oven_max_temp_c: 400,
      available_hours: 30,
      dough_balls: 7,
      meal_deadline: true,
    });
    expect(merged.oven_type).toBe("home");
    expect(merged.oven_max_temp_c).toBe(250);
    expect(merged.available_hours).toBe(30);
    expect(merged.dough_balls).toBe(7);
    expect(merged.meal_deadline).toBe(true);
  });

  it("un campo tolto dal profilo non sopravvive nella bozza", () => {
    const { mixer_type: _mixer, surfaces: _surfaces, ...withoutAdvanced } = profile;
    const merged = mergeDraftConstraints(withoutAdvanced, { mixer_type: "hands", surfaces: ["steel_plate"] });
    expect("mixer_type" in merged).toBe(false);
    expect("surfaces" in merged).toBe(false);
  });
});

describe("profileEquipment", () => {
  it("prende solo l'attrezzatura", () => {
    const equipment = profileEquipment(profile);
    expect(equipment).toEqual({
      has_mixer: true,
      has_pizza_stone: true,
      has_pizza_steel: false,
      has_baking_pan: false,
      mixer_type: "spiral",
      surfaces: ["cordierite_stone"],
    });
  });
});
