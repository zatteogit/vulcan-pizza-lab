import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  feasibleAlternativeStyles,
  generateRecipe,
  recommendStyles,
  pantryFlourMix,
  type GeneratedRecipe,
  type PizzaStyle,
  type RecipeBlocker,
  type RecipeOutcome,
  type UserConstraints,
} from "../pizza-engine";

/* ═══ Golden test per stile (M-9) e impossibilità dichiarata (M-10) ═══
 *
 * Tre scenari fissi per ognuno dei 30 stili:
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

// Dispensa non compilata: ricetta condizionata alla verifica degli ingredienti.
const CHECK_PANTRY: [RecipeOutcome, Kind[]] = ["warnings", []];
const WARN: [RecipeOutcome, Kind[]] = ["warnings", []];
const OVEN: [RecipeOutcome, Kind[]] = ["not_feasible", ["oven_too_cold"]];
const OVEN_LATE: [RecipeOutcome, Kind[]] = ["not_feasible", ["oven_too_cold", "time_window"]];
const LATE_SHORT: [RecipeOutcome, Kind[]] = ["not_feasible", ["time_window", "fermentation_too_short"]];
const OVEN_LATE_SHORT: [RecipeOutcome, Kind[]] = ["not_feasible", ["oven_too_cold", "time_window", "fermentation_too_short"]];

/* D-050: in «rush» (2 h, 4 pezzi, forno di casa) le cotture si ripetono una
   alla volta, quindi oltre alla fermentazione troppo corta anche il pasto
   arriva prima della fine: stessi stili non fattibili, un motivo in più. */
const EXPECTED: Record<string, Expected> = {
  napoletana_stg: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  napoletana_canotto: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  teglia_romana: { ideal: CHECK_PANTRY, home: WARN, rush: LATE_SHORT },
  tonda_romana: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  // C-4 (D-015): forno 280–320 °C (PinsaRomana.it 2022). Nel forno di casa a
  // 250 °C la pinsa si fa con avvisi; prima, con 350–420 °C, era impossibile.
  pinsa_romana: { ideal: CHECK_PANTRY, home: WARN, rush: LATE_SHORT },
  new_york: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  detroit: { ideal: CHECK_PANTRY, home: WARN, rush: LATE_SHORT },
  chicago_deep: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  focaccia_genovese: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  sfincione: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  pala_romana: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  grandma_style: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  focaccia_recco: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE },
  padellino_torino: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  // C-1: prima il condimento predefinito non portava a nessuna ricetta; con la
  // mortadella (farcitura dopo la cottura) in 2 h non ci sta neanche la finestra.
  pizza_baciata: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  ciaccino_senese: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  pizza_spaccata: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  trancio_milanese: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  chicago_tavern: { ideal: CHECK_PANTRY, home: WARN, rush: LATE_SHORT },
  focaccia_barese: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  pizza_fritta: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  pizza_montanara: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  // M-7 (D-022): tonda fritta AVPN, stesso impasto della pizza fritta.
  pizza_fritta_tonda: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  calzone_napoletano: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  pizza_al_metro: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  new_haven_apizza: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  fugazzeta: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  california_style: { ideal: CHECK_PANTRY, home: OVEN, rush: OVEN_LATE_SHORT },
  greek_pan: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
  // B2: senza preset il motore usa il centro della forbice (7 h a 22 °C) e la
  // dose del modello; in 2 h, con 4 teglie da cuocere una alla volta, non ci sta.
  teglia_in_giornata: { ideal: CHECK_PANTRY, home: CHECK_PANTRY, rush: LATE_SHORT },
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
    // Cucina con una teglia; la mancanza di attrezzatura si verifica a parte.
    has_baking_pan: true,
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
      oven_type: style.baking.oven_type_required === "coal" ? "coal"
        : style.requires_wood_oven ? "wood" : style.baking.temp_c_ideal >= 350 ? "gas" : "home",
      oven_max_temp_c: style.baking.temp_c_ideal,
      skill_level: 4,
      available_hours: 72,
      has_pizza_stone: true,
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

  it("forno a legna dello stile: mai un blocco (D-020); avviso solo sotto la temperatura dello stile (D-063)", () => {
    // Napoletana STG con un forno a gas da 450 °C: il calore basta, quindi la
    // legna è solo un'informazione dell'autenticità, non un avviso del verdetto.
    const c = constraints({ oven_type: "gas", oven_max_temp_c: 450 });
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, c);
    expect(recipe.scores.warnings.map((w) => w.key)).not.toContain("gen.notWoodOven");
    expect(recipe.scores.penalties.map((p) => p.key)).toContain("auth.woodByMethod");
    const rec = recommendStyles(c).find((r) => r.style.id === "napoletana_stg")!;
    expect(rec.tier).not.toBe("not_feasible");
    expect(rec.warnings.map((w) => w.key)).not.toContain("gen.notWoodOven");
    // Sotto la temperatura minima (forno a gas da 400 °C) l'avviso c'è ancora.
    const cold = generateRecipe(STYLES_DB.napoletana_stg, constraints({ oven_type: "gas", oven_max_temp_c: 400 }));
    expect(cold.scores.warnings.map((w) => w.key)).toContain("gen.notWoodOven");
  });

  it("mix di due farine della dispensa (C-3)", () => {
    // 00 (W170–220) e manitoba (W340–380): nessuna da sola sta in W260–300.
    expect(pantryFlourMix(["00", "manitoba"], [260, 300])).toEqual({
      weak: "00", strong: "manitoba", weakPct: 50, strongPct: 50, w: 278,
    });
    // una sola farina, o due dalla stessa parte: niente mix
    expect(pantryFlourMix(["00"], [260, 300])).toBeNull();
    expect(pantryFlourMix(["00", "0"], [260, 300])).toBeNull();
    // la Tipo 1 della dispensa ora ha una W
    expect(pantryFlourMix(["tipo_1", "manitoba"], [280, 320])).not.toBeNull();
    const c = constraints({ pantry_flours: ["00", "manitoba"] });
    const napoletana = recommendStyles(c).find((r) => r.style.id === "napoletana_stg")!;
    expect(napoletana.reasons.map((m) => m.key)).toContain("rec.flourMix");
    expect(napoletana.warnings.map((m) => m.key)).not.toContain("rec.flourNoMatch");
  });

  it("le fritte non parlano del forno (U-6)", () => {
    // Prima: «il tuo forno raggiunge la temperatura ideale (175 °C)», che è l'olio.
    const recs = recommendStyles(constraints({}));
    const fried = recs.filter((r) => r.style.baking.temp_c_range[1] < 200);
    expect(fried.length).toBeGreaterThan(0);
    for (const r of fried) {
      const keys = r.reasons.map((m) => m.key);
      expect(keys).toContain("rec.fried");
      expect(keys).not.toContain("rec.ovenIdeal");
    }
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
