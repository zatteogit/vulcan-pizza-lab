import { describe, expect, it } from "vitest";
import { getRecipesByAuthenticity } from "../data/topping-library";
import {
  STYLES_DB,
  generateRecipe,
  type GeneratedRecipe,
  type PizzaStyle,
  type UserConstraints,
} from "../domain/pizza-engine";
import { centerParamsForStyle, styleWithSelectedTopping } from "./use-recipe-state";

/* ═══ Parametri «centro dello stile» della UI (revisione 22/10/2026) ═══
   «Torna all'originale», l'interpretazione base e lo stato iniziale del Crea
   passano sempre ore custom al motore, quindi saltano il suo clamp. Con un
   orario del pasto anche questi parametri devono far stare la timeline nella
   finestra (ENG-4), come l'ottimizzatore. */

const STYLES: PizzaStyle[] = Object.values(STYLES_DB);

function makeConstraints(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "home",
    oven_max_temp_c: 250,
    skill_level: 2,
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: [],
    kitchen_temp_c: 22,
    pantry_flours: [],
    pantry_yeasts: [],
    mixer_type: "hands",
    surfaces: [],
    ...overrides,
  };
}

const totalMinutes = (recipe: GeneratedRecipe) =>
  recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0);

/** Come buildGeneratedRecipe: la UI passa tutti i parametri come custom. */
function buildFromCenter(style: PizzaStyle, constraints: UserConstraints, windowed: boolean) {
  const params = centerParamsForStyle(
    style,
    constraints.available_hours,
    windowed ? constraints : undefined,
  );
  const recipe = generateRecipe(style, constraints, {
    customHydration: params.hydration,
    customFlourW: params.flourW,
    customFlourPL: params.flourPL,
    customFermentationHours: params.fermentHours,
    customFermentationTempC: params.fermentTemp,
    usePreFerment: params.usePreFerment,
    customSalt: style.dough.salt_pct,
  });
  return { params, recipe };
}

describe("centerParamsForStyle con l'orario del pasto", () => {
  it("la ricetta dai centri sta nella finestra (28 stili, forno di casa e a legna, 4/6/8/12 h)", () => {
    const violations: string[] = [];
    for (const style of STYLES) {
      for (const oven of [
        { oven_type: "home", oven_max_temp_c: 250 },
        { oven_type: "wood", oven_max_temp_c: 485 },
      ] as const) {
        for (const available of [4, 6, 8, 12]) {
          const constraints = makeConstraints({ ...oven, available_hours: available, meal_deadline: true });
          const { recipe } = buildFromCenter(style, constraints, true);
          const total = totalMinutes(recipe);
          const minimum = Math.min(style.dough.fermentation_hours_range[0], 1);
          if (total > available * 60 && recipe.fermentation_hours > minimum) {
            violations.push(`${style.id} @${oven.oven_max_temp_c} ${available}h: ${total} min`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("esempio della revisione: Napoletana, forno a legna, pasto fra 4 h → 3,25 h e niente avviso", () => {
    const constraints = makeConstraints({
      oven_type: "wood",
      oven_max_temp_c: 485,
      available_hours: 4,
      meal_deadline: true,
    });
    const { params, recipe } = buildFromCenter(STYLES_DB["napoletana_stg"], constraints, true);
    expect(params.fermentHours).toBe(3.25);
    expect(totalMinutes(recipe)).toBeLessThanOrEqual(240);
    expect(recipe.scores.warnings.some((w) => w.key === "gen.windowTooShort")).toBe(false);
  });

  it("senza orario del pasto i centri restano quelli di prima: min(centro arrotondato, ore)", () => {
    for (const style of STYLES) {
      const [fMin, fMax] = style.dough.fermentation_hours_range;
      for (const available of [4, 24, 48]) {
        const noDeadline = makeConstraints({ available_hours: available });
        const params = centerParamsForStyle(style, available, noDeadline);
        expect(params.fermentHours).toBe(Math.min(Math.round((fMin + fMax) / 2), available));
      }
    }
  });
});

describe("styleWithSelectedTopping", () => {
  it("nessun condimento o condimento di default: stesso stile", () => {
    const style = STYLES_DB["napoletana_stg"];
    expect(styleWithSelectedTopping(style, null)).toBe(style);
    expect(styleWithSelectedTopping(style, style.default_topping_ref ?? null)).toBe(style);
  });

  it("condimento valido diverso dal default: lo stile che riceve il motore lo usa", () => {
    let changed = 0;
    for (const style of STYLES) {
      for (const { recipe } of getRecipesByAuthenticity(style)) {
        const next = styleWithSelectedTopping(style, recipe.id);
        if (next !== style) {
          changed++;
          expect(next.default_topping_ref).toBe(recipe.id);
          expect(next.dough).toBe(style.dough);
        }
      }
    }
    expect(changed).toBeGreaterThan(0);
  });
});
