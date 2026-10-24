import { describe, expect, it } from "vitest";
import { defaultMealStart } from "./recipe-output-format";
describe("defaultMealStart (audit totale n. 2)", () => {
  it("ancora la fine a pranzo o cena, mai di notte", () => {
    const now = new Date(2026, 9, 24, 14, 30);
    for (const minutes of [5 * 60, 13 * 60, 24 * 60, 36 * 60, 50 * 60]) {
      const end = new Date(defaultMealStart(minutes, now).getTime() + minutes * 60_000);
      const h = end.getHours() + end.getMinutes() / 60;
      const sh = defaultMealStart(minutes, now).getHours();
      expect(sh >= 7 && sh < 22).toBe(true);
      expect(h === 12.5 || (h > 12.5 && h <= 12.75) || h === 20 || (h > 20 && h <= 20.25)).toBe(true);
    }
  });
});
