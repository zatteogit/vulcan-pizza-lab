import { describe, expect, it } from "vitest";
import { STYLES_DB } from "../domain/styles-db";
import { getRecipesByAuthenticity } from "./topping-library";

// Selecting a topping updates the generated recipe's default_topping_ref.
// A carousel must keep the same menu order after that update.
describe("stable topping navigation", () => {
  it("keeps every style's browsing order stable across all selections", () => {
    for (const style of Object.values(STYLES_DB)) {
      const menu = getRecipesByAuthenticity(style, { prioritizeDefault: false }).map(item => item.recipe.id);
      for (const selected of menu) {
        const next = getRecipesByAuthenticity({ ...style, default_topping_ref: selected }, { prioritizeDefault: false });
        expect(next.map(item => item.recipe.id), `${style.id}: ${selected}`).toEqual(menu);
      }
    }
  });

  it("retains explicit default priority for callers that request the ranked catalog", () => {
    const style = STYLES_DB.napoletana_stg;
    const ranked = getRecipesByAuthenticity(style);
    const selected = ranked[ranked.length - 1].recipe.id;
    expect(getRecipesByAuthenticity({ ...style, default_topping_ref: selected })[0].recipe.id).toBe(selected);
  });
});
