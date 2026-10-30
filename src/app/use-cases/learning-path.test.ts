import { describe, expect, it } from "vitest";
import { getDefaultVersion } from "../data/style-versions";
import { STYLES_DB, getDefaultDoughBalls, type PizzaStyle, type UserConstraints } from "../domain/pizza-engine";
import { FLEXIBLE_STEP_IDS, isColdPhase } from "./cook-timing";
import { learningPathPreview, learningPathRecipe, learningStyleForKitchen } from "./learning-path";
import { buildGeneratedRecipe, canonicalRecipeEntry } from "./recipe-entry";

/* G4a-WP-04 (S11-A-02): la card del percorso dice durata e attrezzatura
 * prima del clic, con gli stessi numeri della ricetta che il link apre:
 * /recipe/<id>?mode=adapted senza parametri = versione del livello sulla
 * cucina dell'utente, costruita da recipe.tsx con buildGeneratedRecipe. */

const P1: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, skill_level: 1, available_hours: 24, meal_deadline: false,
  dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false,
  dietary_filters: [], kitchen_temp_c: 22, pantry_flours: [], pantry_yeasts: [],
};
const P3: UserConstraints = { ...P1, oven_type: "electric_high", oven_max_temp_c: 509, oven_capacity_temp_c: 509, skill_level: 4, available_hours: 48 };

/** Lo stato iniziale della scheda (recipe.tsx) per ?mode=adapted senza altri parametri. */
function pageRecipe(style: PizzaStyle, c: UserConstraints) {
  const version = getDefaultVersion(style.id, c.skill_level);
  const { options: o, topping } = canonicalRecipeEntry(style, undefined, null, version);
  return buildGeneratedRecipe({
    style, constraints: { ...c, dough_balls: getDefaultDoughBalls(style) },
    customHydration: o.customHydration!, customFlourW: o.customFlourW!, customFermentHours: o.customFermentationHours!,
    customFermentTemp: o.customFermentationTempC!, usePreFerment: o.usePreFerment!, preFermentChoice: {},
    customFlourPL: o.customFlourPL!, customSalt: o.customSalt!, panConfig: o.panConfig!, activeVersion: version,
    activeInterpretationId: null, selectedToppingConcept: topping, customFlourBlend: o.customFlourBlend, optimizedHydration: null,
  });
}

describe("learningPathRecipe = la ricetta che il link apre", () => {
  for (const [name, c, id] of [["P1", P1, "teglia_romana"], ["P3", P3, "teglia_romana"], ["P1 liv. 2", { ...P1, skill_level: 2 as const }, "padellino_torino"]] as const) {
    it(`${name}, ${id}: stessi tempi, temperature e verdetto della scheda`, () => {
      const ours = learningPathRecipe(STYLES_DB[id], c);
      const page = pageRecipe(STYLES_DB[id], c);
      expect(ours.timeline.map((s) => [s.id, s.duration_minutes])).toEqual(page.timeline.map((s) => [s.id, s.duration_minutes]));
      expect([ours.hydration_pct, ours.fermentation_hours, ours.fermentation_temp_c, ours.yeast_g]).toEqual([page.hydration_pct, page.fermentation_hours, page.fermentation_temp_c, page.yeast_g]);
      expect(ours.verdict).toEqual(page.verdict);
    });
  }
});

describe("learningPathPreview", () => {
  it("P1, teglia romana: durata del piano, freddo solo nella puntata, condizione della teglia", () => {
    const recipe = learningPathRecipe(STYLES_DB.teglia_romana, P1);
    const preview = learningPathPreview(recipe);
    expect(preview.totalMinutes).toBe(recipe.timeline.reduce((n, s) => n + s.duration_minutes, 0));
    // Pieghe e gesti a temperatura ambiente, appretto ad almeno 18 °C: in frigo solo la puntata.
    const cold = recipe.timeline.filter((s) => FLEXIBLE_STEP_IDS.has(s.id) && isColdPhase(s.id, recipe.fermentation_temp_c));
    expect(cold.map((s) => s.id)).toEqual(["bulk"]);
    expect(preview.coldMinutes).toBe(cold[0].duration_minutes);
    expect(preview.coldMinutes).toBeLessThan(preview.totalMinutes);
    // Senza teglia dichiarata: la condizione del verdetto, con il suo messaggio; farina e lievito no (D-060).
    expect(recipe.verdict.conditions!.some((c) => c.kind === "flour")).toBe(true);
    expect(preview.equipment).toEqual([recipe.verdict.conditions!.find((c) => c.kind === "pan")!.message]);
    expect(preview.equipment.map((m) => m.key)).toEqual(["need.checkPan"]);
  });

  it("con la teglia dichiarata non c'è condizione d'attrezzatura", () => {
    expect(learningPathPreview(learningPathRecipe(STYLES_DB.teglia_romana, { ...P1, has_baking_pan: true })).equipment).toEqual([]);
  });

  it("P3, livello Esperto: la versione del livello allunga il freddo", () => {
    const p1 = learningPathPreview(learningPathRecipe(STYLES_DB.teglia_romana, P1));
    const p3 = learningPathPreview(learningPathRecipe(STYLES_DB.teglia_romana, P3));
    expect(p3.coldMinutes).toBeGreaterThan(p1.coldMinutes);
  });

  it("a temperatura ambiente: zero minuti in frigo", () => {
    const recipe = learningPathRecipe(STYLES_DB.focaccia_genovese, P1);
    if (recipe.fermentation_temp_c > 6) expect(learningPathPreview(recipe).coldMinutes).toBe(0);
  });
});

describe("learningStyleForKitchen giudica la ricetta del link", () => {
  it("P1 forno di casa: la teglia del livello 1 è proponibile", () => {
    expect(learningStyleForKitchen("teglia_romana", P1, STYLES_DB)?.id).toBe("teglia_romana");
    expect(learningPathRecipe(STYLES_DB.teglia_romana, P1).verdict.outcome).not.toBe("not_feasible");
  });
});
