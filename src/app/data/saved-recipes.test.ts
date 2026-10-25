import { describe, expect, it } from "vitest";
import {
  findSavedRecipeIn,
  normalizeRecipeName,
  renameSavedRecipeIn,
  savedRecipeKey,
  formatSavedDate,
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

describe("formatSavedDate", () => {
  const now = new Date(2026, 9, 24, 12);
  it("dice oggi, ieri e i giorni nella lingua attiva", () => {
    expect(formatSavedDate(now.getTime(), now, "it-IT")).toBe("oggi");
    expect(formatSavedDate(now.getTime() - 86_400_000, now, "en-GB")).toBe("yesterday");
    expect(formatSavedDate(now.getTime() - 3 * 86_400_000, now, "de-DE")).toBe("vor 3 Tagen");
  });
});

describe("nomi personali delle versioni", () => {
  it("rinomina senza cambiare identità, parametri o data del salvataggio", () => {
    const renamed = renameSavedRecipeIn([base], base.id, "Come piace a Mario")[0];
    expect(renamed).toEqual({...base,name:"Come piace a Mario"});
    expect(savedRecipeKey(renamed.styleId,renamed.params)).toBe(savedRecipeKey(base.styleId,base.params));
    expect(base.name).toBeUndefined();
  });
  it("un nome vuoto ripristina il titolo dello stile senza eliminare la ricetta", () => {
    const renamed=renameSavedRecipeIn([{...base,name:"Mario"}],base.id,"  ");
    expect(renamed).toHaveLength(1);
    expect(renamed[0].name).toBeUndefined();
  });
  it("tratta il nome come testo facoltativo e limita input importati o da URL", () => {
    expect(normalizeRecipeName({unexpected:true})).toBeUndefined();
    expect(normalizeRecipeName("  Mario\nLuigi  ")).toBe("Mario Luigi");
    expect(normalizeRecipeName("x".repeat(100))).toHaveLength(80);
  });
});
