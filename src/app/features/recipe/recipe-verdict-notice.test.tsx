import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type GeneratedRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import { canonicalRecipe } from "./kitchen-compatibility";
import { RecipeVerdictNotice } from "./recipe-verdict-notice";

/* FW-10, seguito: «Cambia forno» sta nell'avviso «Così non è fattibile» (pannello
 * dello stile e scheda della ricetta), solo se la causa principale è il forno.
 * È un link vero verso la ricerca del forno nel Profilo, vuota. */

const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, available_hours: 0, skill_level: 2,
  dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
const html = (recipe: GeneratedRecipe, constraints: UserConstraints = home) =>
  renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(RecipeVerdictNotice, { recipe, constraints, mealDeadline: false, embedded: true, showRecipeBelow: false })));
const changeOven = `>${uiMessage("verdict.changeOven")}<`;

describe("RecipeVerdictNotice — «Cambia forno»", () => {
  it("bloccata dal forno: link verso la ricerca del forno, vuota", () => {
    const out = html(canonicalRecipe(STYLES_DB.napoletana_stg, home));
    expect(out).toContain('href="/profile?tab=setup&amp;ovenQuery="');
    expect(out).toContain(changeOven);
  });
  it("bloccata dal tempo, da una dieta o fattibile: niente link", () => {
    const late = generateRecipe(STYLES_DB.focaccia_genovese, { ...home, has_pizza_stone: true, available_hours: 3, meal_deadline: true });
    expect(late.verdict.outcome).toBe("not_feasible");
    expect(html(late)).not.toContain(changeOven);
    const vegan = { ...home, dietary_filters: ["vegan"] };
    expect(html(canonicalRecipe(STYLES_DB.napoletana_stg, vegan), vegan)).not.toContain(changeOven);
    const wood = { ...home, oven_type: "wood" as const, oven_max_temp_c: 450 };
    expect(html(canonicalRecipe(STYLES_DB.napoletana_stg, wood), wood)).toBe("");
  });
});
