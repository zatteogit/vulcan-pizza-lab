import { describe, expect, it } from "vitest";
import {
  findSavedRecipeIn,
  removeSavedRecipeFrom,
  toggleFavoriteStyleIn,
  upsertSavedRecipe,
  type SavedRecipe,
} from "./saved-recipes";

const base: SavedRecipe = {
  id: "old",
  createdAt: 1,
  styleId: "napoletana",
  styleName: "Napoletana",
  versionId: null,
  params: {
    hydration: 65,
    flourW: 280,
    flourPL: 0.55,
    fermentHours: 24,
    fermentTemp: 5,
    usePreFerment: false,
    doughBalls: 2,
  },
};

describe("saved recipe rules", () => {
  it("replaces the same recipe identity without duplicating it", () => {
    const next = upsertSavedRecipe([base], { ...base, score: 91 }, { id: "new", createdAt: 2 });
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ id: "new", score: 91 });
    expect(findSavedRecipeIn(next, base.styleId, base.params)?.id).toBe("new");
  });

  it("removes recipes and toggles favorites immutably", () => {
    expect(removeSavedRecipeFrom([base], "old")).toEqual([]);
    expect(toggleFavoriteStyleIn(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleFavoriteStyleIn(["a", "b"], "a")).toEqual(["b"]);
  });
});
