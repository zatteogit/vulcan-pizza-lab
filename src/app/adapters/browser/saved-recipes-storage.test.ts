import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedRecipe } from "../../data/saved-recipes";
import {
  exportRecipeBook,
  importRecipeBook,
  loadSavedRecipes,
  removeRecipe,
  restoreRecipe,
  saveRecipe,
} from "./saved-recipes-storage";

class MemoryStorage {
  data = new Map<string, string>();
  failWrites = false;
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage);
});
afterEach(() => vi.unstubAllGlobals());

const draft = (hydration: number): Omit<SavedRecipe, "id" | "createdAt"> => ({
  styleId: "napoletana_stg",
  styleName: "Napoletana STG",
  versionId: null,
  params: {
    hydration,
    flourW: 280,
    flourPL: 0.55,
    fermentHours: 24,
    fermentTemp: 4,
    usePreFerment: false,
    doughBalls: 4,
  },
});

describe("ricettario nel browser (U-1)", () => {
  it("un valore corrotto non cancella il ricettario: si torna alla copia di sicurezza", () => {
    saveRecipe(draft(60));
    saveRecipe(draft(65));
    storage.data.set("vulcan_saved_recipes", '[{"broken"');
    const recovered = loadSavedRecipes();
    expect(recovered.map((r) => r.params.hydration).sort()).toEqual([60, 65]);
    expect(storage.getItem("vulcan_saved_recipes_quarantine")).toContain("broken");
    // il salvataggio successivo parte dalle ricette recuperate, non da zero
    expect(saveRecipe(draft(70)).map((r) => r.params.hydration).sort()).toEqual([60, 65, 70]);
  });

  it("le voci illeggibili vanno in quarantena, le altre restano", () => {
    saveRecipe(draft(60));
    const list = JSON.parse(storage.getItem("vulcan_saved_recipes")!);
    storage.data.set("vulcan_saved_recipes", JSON.stringify([...list, { id: "half" }]));
    expect(loadSavedRecipes()).toHaveLength(1);
    expect(storage.getItem("vulcan_saved_recipes_quarantine")).toContain("half");
  });

  it("se lo storage è pieno il salvataggio non risulta fatto", () => {
    storage.failWrites = true;
    expect(saveRecipe(draft(60))).toEqual([]);
  });

  it("annulla dopo l'eliminazione rimette la ricetta", () => {
    const [saved] = saveRecipe(draft(60));
    removeRecipe(saved.id);
    expect(restoreRecipe(saved).recipes.map((r) => r.id)).toEqual([saved.id]);
  });

  it("annulla con lo storage pieno dice che non è riuscito", () => {
    const [saved] = saveRecipe(draft(60));
    removeRecipe(saved.id);
    storage.failWrites = true;
    expect(restoreRecipe(saved)).toEqual({ ok: false, recipes: [] });
  });

  it("esporta e reimporta in un altro browser senza doppioni", () => {
    saveRecipe(draft(60));
    saveRecipe(draft(65));
    const file = exportRecipeBook();
    storage = new MemoryStorage();
    vi.stubGlobal("localStorage", storage);
    saveRecipe(draft(65));
    expect(importRecipeBook(file)).toMatchObject({ ok: true, added: 1, duplicates: 1 });
    expect(loadSavedRecipes()).toHaveLength(2);
    expect(importRecipeBook("non è json")).toEqual({ ok: false, error: "not_json" });
  });
});
