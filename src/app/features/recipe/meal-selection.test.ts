import { describe, expect, it } from "vitest";
import { selectedMealId } from "./meal-selection";

const at = (iso: string) => new Date(iso);
const slots = [
  { id: "tonight", idealStart: at("2026-10-29T06:30:00") },
  { id: "tomorrow_lunch", idealStart: at("2026-10-29T23:00:00") },
];

describe("selectedMealId", () => {
  it("riconosce la coincidenza esatta", () => {
    expect(selectedMealId(slots, at("2026-10-29T23:00:00"))).toBe("tomorrow_lunch");
  });

  it("accetta uno scarto entro la tolleranza", () => {
    expect(selectedMealId(slots, at("2026-10-29T23:00:40"))).toBe("tomorrow_lunch");
    expect(selectedMealId(slots, at("2026-10-29T22:57:00"), 5)).toBe("tomorrow_lunch");
  });

  it("non sceglie nulla fuori tolleranza (orario spostato con −/+)", () => {
    expect(selectedMealId(slots, at("2026-10-29T23:15:00"))).toBeNull();
    expect(selectedMealId([], at("2026-10-29T23:00:00"))).toBeNull();
  });

  it("fra due slot vicini vince il più vicino", () => {
    const close = [
      { id: "a", idealStart: at("2026-10-29T23:00:00") },
      { id: "b", idealStart: at("2026-10-29T23:01:00") },
    ];
    expect(selectedMealId(close, at("2026-10-29T23:00:50"))).toBe("b");
    expect(selectedMealId(close, at("2026-10-29T23:00:10"))).toBe("a");
  });
});
