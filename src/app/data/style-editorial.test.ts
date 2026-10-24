import { describe, expect, it } from "vitest";
import { STYLES_DB } from "../domain/styles-db";
import { STYLE_PHOTOS } from "./style-photos";
import { getRecipesByAuthenticity, getToppingForStyle } from "./topping-library";

/* ═══ C-1 — regole editoriali per stile controllabili dal codice ═══
 * Le linee guida complete sono in docs/linee-guida-stili.md; qui solo quello
 * che una macchina può verificare. Prima del controllo tre stili (baciata,
 * California, greek pan) avevano un condimento predefinito che non portava a
 * nessuna ricetta. */

const styles = Object.values(STYLES_DB);

describe("linee guida degli stili", () => {
  it.each(styles.map((s) => [s.id, s] as const))(
    "%s: il condimento predefinito è una ricetta dello stile",
    (_id, style) => {
      expect(style.default_topping_ref, "manca il condimento predefinito").toBeTruthy();
      const recipe = getToppingForStyle(style.default_topping_ref!, style);
      expect(recipe, `${style.default_topping_ref} non porta a nessuna ricetta`).toBeDefined();
      const shown = getRecipesByAuthenticity(style).map((r) => r.recipe.id);
      expect(shown, `${recipe!.id} non è tra le ricette mostrate per lo stile`).toContain(recipe!.id);
    },
  );

  it("ogni stile ha almeno una foto", () => {
    expect(styles.filter((s) => !STYLE_PHOTOS[s.id]).map((s) => s.id)).toEqual([]);
  });
});
