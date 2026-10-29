import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type GeneratedRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import { RecipeMatchCard } from "./recipe-match-card";

/* Revisione G3: gli avvisi del motore (W troppo basso…) non sono adattamenti.
 * «Come l'abbiamo adattata» elenca solo ciò che Vulcan ha cambiato e mai nel
 * Riferimento; gli avvisi stanno in «Da tenere d'occhio». */

const constraints: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, available_hours: 48, skill_level: 4,
  dough_balls: 4, has_mixer: true, has_pizza_stone: true, has_pizza_steel: true, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
const base = generateRecipe(STYLES_DB.focaccia_genovese, constraints);
const wWarning: GeneratedRecipe = { ...base, verdict: { ...base.verdict,
  adaptations: [...base.verdict.adaptations, { key: "feas.wTooLow", fallback: "W troppo basso: 220 < 260", params: { w: 220, wMin: 260 } }] } };

const render = (mode: "canonical" | "adapted", rationale?: string[]) => renderToStaticMarkup(createElement(RecipeMatchCard, {
  scores: wWarning.scores, ovenTemp: 250, idealTemp: 250, minTemp: 220, mode, initialExpanded: true,
  verdictRecipe: wWarning, verdictConstraints: constraints, originalRecipe: base, optimizationRationale: rationale,
}));
const esc = (text: string) => text.replace(/'/g, "&#x27;");

describe("RecipeMatchCard: dettagli", () => {
  it("nel Riferimento l'avviso sulla W non compare come adattamento", () => {
    const html = render("canonical");
    expect(html).toContain(esc(uiMessage("recipe.matchDetails.watch")));
    expect(html).toContain("220");
    expect(html).not.toContain(esc(uiMessage("recipe.matchDetails.adapted")));
  });
  it("fuori dal Riferimento gli avvisi restano separati dagli adattamenti", () => {
    const html = render("adapted", ["Più acqua"]);
    const watch = html.indexOf(esc(uiMessage("recipe.matchDetails.watch")));
    const adapted = html.indexOf(esc(uiMessage("recipe.matchDetails.adapted")));
    expect(watch).toBeGreaterThan(-1);
    expect(adapted).toBeGreaterThan(watch);
    expect(html.slice(adapted)).not.toContain("220 &lt;");
  });
});
