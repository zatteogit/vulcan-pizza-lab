import { describe, expect, it } from "vitest";
import {
  RECIPE_BOOK_VERSION,
  mergeRecipeBooks,
  parseRecipeBook,
  parseStoredRecipes,
  serializeRecipeBook,
} from "./recipe-book";
import { MAX_SAVED_RECIPES, upsertSavedRecipe, type SavedRecipe } from "./saved-recipes";

const recipe = (id: string, createdAt: number, hydration = 65): SavedRecipe => ({
  id,
  createdAt,
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

describe("lettura del ricettario salvato (U-1)", () => {
  it("un JSON rotto è corrotto, non un ricettario vuoto", () => {
    expect(parseStoredRecipes('[{"id":"a"')).toMatchObject({ corrupt: true, recipes: [] });
    expect(parseStoredRecipes(null)).toMatchObject({ corrupt: false, recipes: [] });
  });

  it("le voci illeggibili si mettono da parte, le altre restano", () => {
    const read = parseStoredRecipes(JSON.stringify([recipe("a", 1), { id: "b" }]));
    expect(read.recipes.map((r) => r.id)).toEqual(["a"]);
    expect(read.rejected).toEqual([{ id: "b" }]);
  });
});

describe("file del ricettario (U-1)", () => {
  it("esporta e reimporta senza perdite", () => {
    const text = serializeRecipeBook([recipe("a", 1), recipe("b", 2, 70)], ["detroit"], 99);
    const parsed = parseRecipeBook(text);
    expect(parsed).toMatchObject({ ok: true, favorites: ["detroit"], rejected: 0 });
    if (parsed.ok) expect(parsed.recipes.map((r) => r.id).sort()).toEqual(["a", "b"]);
  });

  it("accetta anche un elenco nudo (contenuto di localStorage copiato a mano)", () => {
    expect(parseRecipeBook(JSON.stringify([recipe("a", 1)]))).toMatchObject({ ok: true });
  });

  it("rifiuta testo non JSON, formati estranei e versioni più nuove", () => {
    expect(parseRecipeBook("ciao")).toEqual({ ok: false, error: "not_json" });
    expect(parseRecipeBook('{"foo":1}')).toEqual({ ok: false, error: "wrong_format" });
    const newer = JSON.parse(serializeRecipeBook([], [], 1));
    newer.version = RECIPE_BOOK_VERSION + 1;
    expect(parseRecipeBook(JSON.stringify(newer))).toEqual({ ok: false, error: "newer_version" });
  });
});

describe("unione dei ricettari (U-1)", () => {
  it("niente doppioni: stessi parametri → si tiene la più recente con l'id esistente", () => {
    const merge = mergeRecipeBooks([recipe("a", 1)], [recipe("x", 5), recipe("y", 6, 70)]);
    expect(merge).toMatchObject({ added: 1, duplicates: 1, skipped: 0 });
    expect(merge.recipes.find((r) => r.params.hydration === 65)).toMatchObject({ id: "a", createdAt: 5 });
  });

  it("una voce più vecchia non sovrascrive quella salvata", () => {
    const merge = mergeRecipeBooks([recipe("a", 10)], [recipe("x", 5)]);
    expect(merge.recipes).toEqual([recipe("a", 10)]);
  });

  it("a ricettario pieno non entra nulla e nulla si perde", () => {
    const full = Array.from({ length: MAX_SAVED_RECIPES }, (_, i) => recipe(`r${i}`, i, 50 + i * 0.1));
    expect(mergeRecipeBooks(full, [recipe("new", 1000, 99)])).toMatchObject({ added: 0, skipped: 1 });
    expect(upsertSavedRecipe(full, recipe("n", 0, 99), { id: "n", createdAt: 1000 })).toHaveLength(MAX_SAVED_RECIPES);
    expect(upsertSavedRecipe(full, recipe("n", 0, 99), { id: "n", createdAt: 1000 }).map((r) => r.id)).not.toContain("n");
  });
});
