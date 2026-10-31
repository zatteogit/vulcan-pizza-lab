import { describe, expect, it } from "vitest";
import { STYLES_DB, calculateOvenCompensations, type GeneratedRecipe, type SkillLevel, type UserConstraints } from "../domain/pizza-engine";
import { DEFAULT_UI_SCORE_WEIGHTS as weights } from "../domain/recipe-score";
import { SKILL_WARNING_KEYS, hydrationAtStyleMinimum } from "../domain/verdict-summary";
import { getInterpretationsForStyle } from "../data/interpretation-library";
import { getVersions } from "../data/style-versions";
import { canonicalRecipeEntry, optimizeSelectedRecipe, tailoredRecipeEntry } from "./recipe-entry";

/* D-070 (decisione di Matteo del 31/10/2026, «Regola generale: mai fuori
 * stile»): il tetto d'idratazione per livello non porta mai la proposta sotto
 * il minimo dello stile (o della versione). Vale per la proposta su misura e
 * per «Ottimizza per me» dal riferimento, da ogni versione e da ogni versione
 * d'autore, a ogni livello e in tre cucine. Sopra il massimo si esce solo con
 * la compensazione del forno, dichiarata (ENG-6). */

const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 1,
  available_hours: 24, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const KITCHENS: Record<string, UserConstraints> = {
  casa24: home,
  casa72: { ...home, available_hours: 72 },
  legna: { ...home, oven_type: "wood", oven_max_temp_c: 450, oven_capacity_temp_c: 450, available_hours: 72 },
};
const LEVELS: SkillLevel[] = [1, 2, 3, 4];

function inStyle(r: GeneratedRecipe, context: string) {
  const [a, b] = r.style.dough.hydration_pct_range;
  const compensation = r.science.compensations.some((c) => c.type === "hydration")
    ? calculateOvenCompensations(r.style, r.oven_temp_c).hydration_delta_pct : 0;
  expect(r.hydration_pct, `${context}: ${r.hydration_pct} < ${Math.min(a, b)}`).toBeGreaterThanOrEqual(Math.min(a, b));
  expect(r.hydration_pct, `${context}: ${r.hydration_pct} > ${Math.max(a, b)} + ${compensation}`).toBeLessThanOrEqual(Math.max(a, b) + compensation + 1e-9);
}

describe("D-070 · mai fuori stile", () => {
  it("proposta su misura e «Ottimizza per me» negli intervalli dello stile, a ogni livello", () => {
    let checked = 0;
    for (const [kitchen, base] of Object.entries(KITCHENS)) for (const skill_level of LEVELS) {
      const c = { ...base, skill_level };
      for (const style of Object.values(STYLES_DB)) {
        const where = `${style.id} · livello ${skill_level} · ${kitchen}`;
        inStyle(tailoredRecipeEntry(style, c, weights).recipe, `${where} · su misura`);
        inStyle(optimizeSelectedRecipe(style, c, weights, undefined, null, null).recipe, `${where} · riferimento`);
        for (const v of getVersions(style.id)) {
          inStyle(optimizeSelectedRecipe(style, c, weights, canonicalRecipeEntry(style, weights, null, v).options.panConfig, v, null).recipe, `${where} · ${v.id}`);
        }
        for (const it of getInterpretationsForStyle(style.id)) {
          inStyle(optimizeSelectedRecipe(style, c, weights, canonicalRecipeEntry(style, weights, it, null).options.panConfig, null, it.id).recipe, `${where} · ${it.id}`);
        }
        checked += 2 + getVersions(style.id).length + getInterpretationsForStyle(style.id).length;
      }
    }
    // 1.380 ricette con la regola (04/11), più le 12 della versione di Dekracap (B5).
    expect(checked).toBe(1392);
  });

  it("per chi comincia: al minimo dello stile, con «Impasto esigente» e senza invito a scendere", () => {
    for (const [id, min] of [["teglia_romana", 75], ["pala_romana", 75], ["pinsa_romana", 72]] as const) {
      const r = tailoredRecipeEntry(STYLES_DB[id], home, weights).recipe;
      expect(r.hydration_pct, id).toBe(min);
      expect(r.verdict.adaptations.some((a) => SKILL_WARNING_KEYS.includes(a.key)), id).toBe(true);
      expect(hydrationAtStyleMinimum(r), id).toBe(true);
    }
  });

  it("per i livelli più alti nulla cambia: il tetto lascia margine sopra il minimo", () => {
    const r = tailoredRecipeEntry(STYLES_DB.teglia_romana, { ...home, skill_level: 3 }, weights).recipe;
    expect(hydrationAtStyleMinimum(r)).toBe(false);
  });
});
