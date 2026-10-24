import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  feasibleAlternativeStyles,
  generateRecipe,
  recommendStyles,
  type GeneratedRecipe,
  type PizzaStyle,
  type RecipeBlocker,
  type RecipeOutcome,
  type UserConstraints,
} from "../pizza-engine";

/* ═══ Golden test per stile (M-9) e impossibilità dichiarata (M-10) ═══
 *
 * Tre scenari fissi per ognuno dei 28 stili:
 *   ideal — forno alla temperatura ideale dello stile (a legna se lo richiede),
 *           livello esperto, 72 h, nessun orario del pasto;
 *   home  — forno di casa a 250 °C, livello 2, «Nessuna preferenza» (24 h);
 *   rush  — forno di casa a 250 °C, pasto fra 2 h.
 *
 * EXPECTED è la tabella degli esiti attesi, scritta a mano: un cambio di esito
 * è una decisione di prodotto, non un aggiornamento automatico. I numeri
 * (masse, forno, tempi) stanno in recipes.golden.json: se cambiano, la PR
 * porta il prima/dopo e il motivo (docs/motore-correzioni-2026-10-22.md).
 * Aggiornare i numeri: `npx vitest run src/app/domain/golden -u`. */

type Scenario = "ideal" | "home" | "rush";
type Kind = RecipeBlocker["kind"];
type Expected = Record<Scenario, [RecipeOutcome, Kind[]]>;

const OK: [RecipeOutcome, Kind[]] = ["ok", []];
const WARN: [RecipeOutcome, Kind[]] = ["warnings", []];
const OVEN: [RecipeOutcome, Kind[]] = ["not_feasible", ["oven_too_cold"]];
const SHORT: [RecipeOutcome, Kind[]] = ["not_feasible", ["fermentation_too_short"]];
const LATE_SHORT: [RecipeOutcome, Kind[]] = ["not_feasible", ["time_window", "fermentation_too_short"]];
const OVEN_SHORT: [RecipeOutcome, Kind[]] = ["not_feasible", ["oven_too_cold", "fermentation_too_short"]];

const EXPECTED: Record<string, Expected> = {
  napoletana_stg: { ideal: OK, home: OVEN, rush: OVEN_SHORT },
  napoletana_canotto: { ideal: OK, home: OVEN, rush: OVEN_SHORT },
  teglia_romana: { ideal: OK, home: WARN, rush: SHORT },
  tonda_romana: { ideal: OK, home: WARN, rush: SHORT },
  // C-4 (D-015): forno 280–320 °C (PinsaRomana.it 2022). Nel forno di casa a
  // 250 °C la pinsa si fa con avvisi; prima, con 350–420 °C, era impossibile.
  pinsa_romana: { ideal: OK, home: WARN, rush: SHORT },
  new_york: { ideal: OK, home: WARN, rush: SHORT },
  detroit: { ideal: OK, home: WARN, rush: LATE_SHORT },
  chicago_deep: { ideal: OK, home: OK, rush: LATE_SHORT },
  focaccia_genovese: { ideal: OK, home: OK, rush: LATE_SHORT },
  sfincione: { ideal: OK, home: OK, rush: LATE_SHORT },
  pala_romana: { ideal: OK, home: WARN, rush: SHORT },
  grandma_style: { ideal: OK, home: OK, rush: SHORT },
  focaccia_recco: { ideal: OK, home: WARN, rush: WARN },
  padellino_torino: { ideal: OK, home: OK, rush: SHORT },
  pizza_baciata: { ideal: OK, home: WARN, rush: SHORT },
  ciaccino_senese: { ideal: OK, home: OK, rush: LATE_SHORT },
  pizza_spaccata: { ideal: OK, home: WARN, rush: SHORT },
  trancio_milanese: { ideal: OK, home: OK, rush: SHORT },
  chicago_tavern: { ideal: OK, home: WARN, rush: SHORT },
  focaccia_barese: { ideal: OK, home: OK, rush: LATE_SHORT },
  pizza_fritta: { ideal: OK, home: OK, rush: SHORT },
  pizza_montanara: { ideal: OK, home: OK, rush: SHORT },
  // M-7 (D-022): tonda fritta AVPN, stesso impasto della pizza fritta.
  pizza_fritta_tonda: { ideal: OK, home: OK, rush: SHORT },
  calzone_napoletano: { ideal: OK, home: OVEN, rush: OVEN_SHORT },
  pizza_al_metro: { ideal: OK, home: WARN, rush: SHORT },
  new_haven_apizza: { ideal: OK, home: OVEN, rush: OVEN_SHORT },
  fugazzeta: { ideal: OK, home: OK, rush: LATE_SHORT },
  california_style: { ideal: OK, home: WARN, rush: SHORT },
  greek_pan: { ideal: OK, home: OK, rush: SHORT },
};

const STYLES: PizzaStyle[] = Object.values(STYLES_DB);

function constraints(overrides: Partial<UserConstraints>): UserConstraints {
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

const SCENARIOS: Record<Scenario, (style: PizzaStyle) => UserConstraints> = {
  ideal: (style) =>
    constraints({
      oven_type: style.requires_wood_oven ? "wood" : style.baking.temp_c_ideal >= 350 ? "gas" : "home",
      oven_max_temp_c: style.baking.temp_c_ideal,
      skill_level: 4,
      available_hours: 72,
    }),
  home: () => constraints({}),
  rush: () => constraints({ available_hours: 2, meal_deadline: true }),
};

const totalMinutes = (recipe: GeneratedRecipe) =>
  recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0);

describe("golden: esito atteso per stile e scenario (M-9)", () => {
  it("la tabella copre esattamente il catalogo", () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(STYLES.map((s) => s.id).sort());
  });

  for (const style of STYLES) {
    for (const scenario of Object.keys(SCENARIOS) as Scenario[]) {
      it(`${style.id} · ${scenario}`, () => {
        const recipe = generateRecipe(style, SCENARIOS[scenario](style));
        const [outcome, kinds] = EXPECTED[style.id][scenario];
        expect(recipe.verdict.outcome).toBe(outcome);
        expect(recipe.verdict.blockers.map((b) => b.kind)).toEqual(kinds);
      });
    }
  }
});

describe("golden: masse, forno e tempi (M-9)", () => {
  it("coincidono con recipes.golden.json", async () => {
    const table: Record<string, Record<string, unknown>> = {};
    for (const style of STYLES) {
      for (const scenario of ["ideal", "home"] as const) {
        const r = generateRecipe(style, SCENARIOS[scenario](style));
        table[`${style.id}/${scenario}`] = {
          flour_g: r.flour_g,
          water_g: r.water_g,
          salt_g: r.salt_g,
          yeast_g: r.yeast_g,
          fat_g: r.fat_g,
          sugar_g: r.sugar_g,
          hydration_pct: r.hydration_pct,
          ball_weight_g: r.ball_weight_g,
          fermentation_h: r.fermentation_hours,
          fermentation_c: r.fermentation_temp_c,
          oven_c: r.oven_temp_c,
          cook_s: r.cook_time_sec,
          timeline_min: totalMinutes(r),
        };
      }
    }
    await expect(JSON.stringify(table, null, 2) + "\n").toMatchFileSnapshot("./recipes.golden.json");
  });
});

describe("impossibilità dichiarata (M-10)", () => {
  it("napoletana verace, pronta in 2 h, forno di casa a 250 °C: non fattibile così, con i motivi", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, SCENARIOS.rush(STYLES_DB.napoletana_stg));
    expect(recipe.verdict.outcome).toBe("not_feasible");
    expect(recipe.verdict.blockers).toContainEqual({ kind: "oven_too_cold", oven_c: 250, style_min_c: 430 });
    expect(recipe.verdict.blockers.find((b) => b.kind === "fermentation_too_short")).toMatchObject({ style_min_h: 6 }); // STG: 6–14 h (C-4)
  });

  it("ogni esito «non fattibile» ha almeno un motivo, e ogni motivo rende l'esito «non fattibile»", () => {
    for (const style of STYLES) {
      for (const make of Object.values(SCENARIOS)) {
        const { verdict } = generateRecipe(style, make(style));
        expect(verdict.outcome === "not_feasible", style.id).toBe(verdict.blockers.length > 0);
      }
    }
  });

  it("le alternative proposte sono davvero fattibili con gli stessi vincoli", () => {
    const home = SCENARIOS.home(STYLES_DB.napoletana_stg);
    const alternatives = feasibleAlternativeStyles(STYLES_DB.napoletana_stg, home);
    expect(alternatives.length).toBeGreaterThan(0);
    for (const alt of alternatives) {
      expect(alt.id).not.toBe("napoletana_stg");
      expect(generateRecipe(alt, home).verdict.outcome).not.toBe("not_feasible");
    }
  });

  it("forno a legna dello stile: avviso, non blocco (D-020)", () => {
    // Napoletana STG con un forno a gas da 450 °C: il calore basta, il legno no.
    const c = constraints({ oven_type: "gas", oven_max_temp_c: 450 });
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, c);
    expect(recipe.verdict.outcome).toBe("warnings");
    expect(recipe.scores.warnings.map((w) => w.key)).toContain("gen.notWoodOven");
    const rec = recommendStyles(c).find((r) => r.style.id === "napoletana_stg")!;
    expect(rec.tier).not.toBe("not_feasible");
    expect(rec.warnings.map((w) => w.key)).toContain("rec.needsWoodOven");
  });

  it("consigli e ricetta dicono la stessa cosa sul forno", () => {
    for (const oven of [200, 250, 300, 350, 400, 485]) {
      const c = constraints({ oven_type: oven >= 400 ? "gas" : "home", oven_max_temp_c: oven });
      for (const rec of recommendStyles(c)) {
        const ovenBlocked = generateRecipe(rec.style, c).verdict.blockers.some((b) => b.kind === "oven_too_cold");
        if (ovenBlocked) expect(rec.tier, `${rec.style.id} a ${oven} °C`).toBe("not_feasible");
      }
    }
  });
});
