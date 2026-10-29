import { describe, expect, it } from "vitest";
import { getStepTroubleshooting } from "../../data/troubleshooting-data";
import { generateRecipe, isFriedStyle, type UserConstraints } from "../../domain/pizza-engine";
import { STYLES_DB } from "../../domain/styles-db";
import { stepTroubleContext } from "./step-trouble-context";

/* G4b-WP-01 (S13-B-09): scheda ricetta e modalità cottura leggono i problemi
 * di fase dallo stesso contesto. */

const P1: UserConstraints = {
  oven_type: "home",
  oven_max_temp_c: 250,
  skill_level: 1,
  available_hours: 48,
  meal_deadline: false,
  dough_balls: 4,
  has_mixer: false,
  has_pizza_stone: false,
  has_pizza_steel: false,
  has_baking_pan: true,
  dietary_filters: [],
  kitchen_temp_c: 22,
  pantry_flours: [],
  pantry_yeasts: [],
};

const recipe = (id: string) => generateRecipe(STYLES_DB[id], P1);
const troubleOf = (id: string, stepId: string) => {
  const r = recipe(id);
  const step = r.timeline.find((s) => s.id === stepId);
  expect(step, `${id} senza passo ${stepId}`).toBeDefined();
  return getStepTroubleshooting(step!, stepTroubleContext(r));
};

describe("stepTroubleContext", () => {
  it("riconosce il ripieno del calzone", () => {
    expect(stepTroubleContext(recipe("calzone_napoletano")).filled).toBe(true);
  });

  it("riconosce uno stile non lievitato", () => {
    const unleavened = Object.values(STYLES_DB).find((s) => s.dough.unleavened);
    expect(unleavened).toBeDefined();
    expect(stepTroubleContext(generateRecipe(unleavened!, P1)).unleavened).toBe(true);
  });

  it("napoletana: né ripieno né senza lievito", () => {
    const ctx = stepTroubleContext(recipe("napoletana_stg"));
    expect(ctx.filled).toBe(false);
    expect(ctx.unleavened).toBe(false);
  });
});

describe("problemi della fase per la modalità cottura", () => {
  it("stesura della napoletana: strappi, buchi, ritiro, farina, panetto che si allarga, bordo, pala", () => {
    expect(troubleOf("napoletana_stg", "shape")?.issueIds).toEqual(["P02", "P24", "P07", "P19", "P23", "P16", "P08", "P22"]);
  });

  /* G4b-WP-03 (S13-A-10): «si attacca alla pala» solo se la pizza va in forno con la pala. */
  it("napoletana: P22 in stesura e in cottura; P23 anche nell'appretto", () => {
    expect(stepTroubleContext(recipe("napoletana_stg")).peel).toBe(true);
    expect(troubleOf("napoletana_stg", "bake")?.issueIds[0]).toBe("P22");
    expect(troubleOf("napoletana_stg", "proof")?.issueIds).toContain("P23");
  });

  it("teglia romana e stili fritti: niente pala, niente P22", () => {
    const teglia = recipe("teglia_romana");
    expect(stepTroubleContext(teglia).peel).toBe(false);
    for (const step of teglia.timeline) expect(getStepTroubleshooting(step, stepTroubleContext(teglia))?.issueIds ?? []).not.toContain("P22");
    const fried = generateRecipe(Object.values(STYLES_DB).find((s) => isFriedStyle(s) && !s.dough.unleavened)!, P1);
    expect(stepTroubleContext(fried).peel).toBe(false);
    for (const step of fried.timeline) expect(getStepTroubleshooting(step, stepTroubleContext(fried))?.issueIds ?? []).not.toContain("P22");
  });

  it("cottura di uno stile fritto: i problemi dell'olio, non del forno", () => {
    const fried = Object.values(STYLES_DB).find((s) => isFriedStyle(s) && !s.dough.unleavened);
    expect(fried).toBeDefined();
    const r = generateRecipe(fried!, P1);
    const bake = r.timeline.find((s) => s.id === "bake");
    const ids = getStepTroubleshooting(bake!, stepTroubleContext(r))?.issueIds ?? [];
    expect(ids).toEqual(expect.arrayContaining(["FR01", "FR02"]));
    expect(ids).not.toContain("P09");
  });
});
