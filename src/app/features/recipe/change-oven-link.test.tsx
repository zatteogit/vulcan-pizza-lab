import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type GeneratedRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import { ChangeOvenLink } from "./change-oven-link";
import { canonicalRecipe } from "./kitchen-compatibility";

/* FW-10, seguito: «Cambia forno» è un link vero (<a href>), con il suo testo
 * come nome, verso la ricerca del forno nel Profilo senza un forno scelto. */

const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, available_hours: 0, skill_level: 2,
  dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
const html = (recipe?: GeneratedRecipe) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ChangeOvenLink, { recipe })));

describe("ChangeOvenLink", () => {
  it("bloccata dal forno: un solo link «Cambia forno» verso la ricerca del forno, vuota", () => {
    const out = html(canonicalRecipe(STYLES_DB.napoletana_stg, home));
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('href="/profile?tab=setup&amp;ovenQuery="');
    expect(out).toContain(`>${uiMessage("explore.card.changeOven")}<`);
    expect(out).toContain('aria-hidden="true"');
    expect(out).not.toMatch(/<button/);
  });
  it("bloccata dal tempo, fattibile o senza ricetta: niente", () => {
    const late = generateRecipe(STYLES_DB.focaccia_genovese, { ...home, has_pizza_stone: true, available_hours: 3, meal_deadline: true });
    expect(late.verdict.outcome).toBe("not_feasible");
    expect(html(late)).toBe("");
    expect(html(canonicalRecipe(STYLES_DB.napoletana_stg, { ...home, oven_type: "wood", oven_max_temp_c: 450 }))).toBe("");
    expect(html(undefined)).toBe("");
  });
});
