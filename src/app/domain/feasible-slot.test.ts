import { describe, expect, it } from "vitest";
import { firstFeasibleSlot } from "./feasible-slot";
import { NO_PREFERENCE_SLOT, generateTimeSlots, recommendStyles, type UserConstraints } from "./pizza-engine";

const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 1,
  available_hours: 4.75, meal_deadline: true, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };

describe("firstFeasibleSlot (audit 28/10/2026, S05-A-01)", () => {
  // Mercoledì 28/10/2026 alle 15:15: «Stasera» lascia 4 h 45 min.
  const now = new Date(2026, 9, 28, 15, 15);
  const slots = [...generateTimeSlots(now), NO_PREFERENCE_SLOT];

  it("col forno di casa «Stasera» non lascia stili fattibili", () => {
    const tonight = slots.find((slot) => slot.id === "tonight")!;
    expect(tonight.hours).toBe(4.75);
    expect(recommendStyles({ ...home, available_hours: tonight.hours }).every((rec) => rec.tier === "not_feasible")).toBe(true);
  });

  it("propone il primo momento successivo in cui almeno uno stile è fattibile", () => {
    const slot = firstFeasibleSlot(home, slots, (c) => recommendStyles(c))!;
    expect(slot).not.toBeNull();
    expect(slot.hours).toBeGreaterThan(4.75);
    expect(recommendStyles({ ...home, available_hours: slot.hours }).some((rec) => rec.tier !== "not_feasible")).toBe(true);
    // Ed è il primo: quelli prima (più vicini) non hanno stili fattibili.
    for (const earlier of slots.filter((s) => s.hours > 4.75 && s.hours < slot.hours)) {
      expect(recommendStyles({ ...home, available_hours: earlier.hours }).every((rec) => rec.tier === "not_feasible")).toBe(true);
    }
  });

  it("senza nessuno stile fattibile restituisce null", () => {
    expect(firstFeasibleSlot(home, slots, () => [])).toBeNull();
  });
});
