import { describe, expect, it } from "vitest";
import { earliestFeasibleMeal, firstFeasibleSlot, slotsWithoutFeasibleStyle } from "./feasible-slot";
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

/* FW-09 (S05-A-01, S05-A-13): il primo pasto possibile e gli slot senza stili.
 * Misura (P1, forno di casa 250 °C, livello 1, ore 15:15): prima i 4 slot
 * erano proposti tutti uguali, «Stasera» (4 h 45 min) con 0 stili e nessun
 * segnale, e il rimedio era «Domani a pranzo» (21 h 15 min); dopo «Stasera»
 * dice «Nessuno stile in tempo» e il primo pasto possibile è alle 21:30
 * (6 h 15 min, Greek pan). */
describe("earliestFeasibleMeal e slotsWithoutFeasibleStyle (FW-09)", () => {
  const now = new Date(2026, 9, 28, 15, 15);
  const slots = [...generateTimeSlots(now), NO_PREFERENCE_SLOT];
  const recommend = (c: UserConstraints) => recommendStyles(c);

  it("con 4,75 h e forno di casa trova il primo pasto possibile, prima dello slot successivo", () => {
    const earliest = earliestFeasibleMeal(home, now, recommend, home.available_hours)!;
    expect(earliest).not.toBeNull();
    expect(earliest.hours).toBeGreaterThan(4.75);
    expect(earliest.styleIds.length).toBeGreaterThan(0);
    expect(earliest.at.getMinutes() % 15).toBe(0);
    expect(earliest.at.getTime()).toBeGreaterThanOrEqual(now.getTime() + earliest.hours * 3_600_000);
    // È il minimo: un quarto d'ora prima nessuno stile è fattibile.
    const before = recommendStyles({ ...home, available_hours: earliest.hours - 0.25 });
    expect(before.every((rec) => rec.tier === "not_feasible")).toBe(true);
    const nextSlot = firstFeasibleSlot(home, slots, recommend)!;
    expect(earliest.hours).toBeLessThan(nextSlot.hours);
  });

  it("allungare la finestra non toglie fattibilità (premessa della ricerca binaria)", () => {
    let previous = 0;
    for (const hours of [4, 6, 8, 12, 24, 48, 96, 168]) {
      const feasible = recommendStyles({ ...home, available_hours: hours }).filter((rec) => rec.tier !== "not_feasible").length;
      expect(feasible).toBeGreaterThanOrEqual(previous);
      previous = feasible;
    }
  });

  it("senza nessuno stile fattibile nemmeno a una settimana restituisce null", () => {
    expect(earliestFeasibleMeal(home, now, () => [])).toBeNull();
  });

  it("segna gli slot in cui nessuno stile sta nei tempi, non quelli dopo", () => {
    const none = slotsWithoutFeasibleStyle(home, slots, recommend);
    expect(none.has("tonight")).toBe(true);
    expect(none.has("tomorrow_lunch")).toBe(false);
    expect(none.has("no_preference")).toBe(false);
  });

  it("se il limite è la cucina e non il tempo, non segna nessuno slot", () => {
    expect(slotsWithoutFeasibleStyle(home, slots, () => []).size).toBe(0);
  });
});
