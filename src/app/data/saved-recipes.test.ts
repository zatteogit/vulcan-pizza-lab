import { describe, expect, it } from "vitest";
import {
  findSavedRecipeIn,
  normalizeRecipeName,
  recipeSourceUrl,
  renameSavedRecipeIn,
  restoreSavedRecipeIn,
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
  it("keeps the original style, preset and signature accessible independently of a custom name", () => {
    const named = renameSavedRecipeIn([{ ...base, versionId: "traditional", params: { ...base.params, interpretationId: "signature" } }], base.id, "Come piace a Mario")[0];
    const url = new URL(recipeSourceUrl(named.styleId, named.versionId, named.params.interpretationId), "https://example.test");
    expect(named.name).toBe("Come piace a Mario");
    expect(url.pathname).toBe("/recipe/napoletana");
    expect(Object.fromEntries(url.searchParams)).toEqual({ mode: "canonical", tab: "ricetta", v: "traditional", interpretation: "signature" });
    expect(named.params.hydration).toBe(base.params.hydration);
  });
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

describe("«Annulla» dopo la rimozione (S07-B-09)", () => {
  const named: SavedRecipe = { ...base, id: "sr_named", createdAt: 20, name: "Quella di domenica" };
  const older: SavedRecipe = { ...base, id: "sr_older", createdAt: 10, params: { ...base.params, hydration: 70 } };
  const newer: SavedRecipe = { ...base, id: "sr_newer", createdAt: 30, params: { ...base.params, hydration: 60 } };

  it("rimette la voce identica: stesso id, stessa data, stesso nome", () => {
    const removed = removeSavedRecipeFrom([newer, named, older], named.id);
    const restored = restoreSavedRecipeIn(removed, named);
    expect(restored.find(recipe => recipe.id === named.id)).toEqual(named);
  });
  it("conserva l'ordine del ricettario (più recenti prima)", () => {
    const restored = restoreSavedRecipeIn(removeSavedRecipeFrom([newer, named, older], named.id), named);
    expect(restored.map(recipe => recipe.id)).toEqual([newer.id, named.id, older.id]);
  });
  it("non crea doppioni se la ricetta è stata risalvata nel frattempo", () => {
    const resaved: SavedRecipe = { ...named, id: "sr_resaved", createdAt: 40, name: undefined };
    expect(restoreSavedRecipeIn([resaved, older], named)).toEqual([resaved, older]);
    expect(restoreSavedRecipeIn([named, older], named)).toEqual([named, older]);
  });
});
