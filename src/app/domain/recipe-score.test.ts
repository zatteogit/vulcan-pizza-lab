import { describe, expect, it } from "vitest";
import { globalRecipeScore, explainScore, explainRecipeScores, DEFAULT_UI_SCORE_WEIGHTS } from "./recipe-score";
import { STYLES_DB, generateRecipe, type UserConstraints } from "./pizza-engine";

const weights = { authenticity: 0.3, feasibility: 0.25, digestibility: 0.2, sustainability: 0.15, experimentation: 0.1 };
const good = { authenticity: 100, feasibility: 100, digestibility: 100, sustainability: 100, experimentation: 0 };

describe("globale con autenticità e fattibilità non compensabili", () => {
  it("autenticità 20: gli altri assi a 100 non possono dare un buon voto", () => {
    const result = globalRecipeScore({ ...good, authenticity: 20 }, weights, "warnings");
    expect(result.score).toBe(20);
    expect(result.calculation.weighted_average).toBe(76);
    expect(result.calculation.limited_by).toBe("authenticity");
  });
  it("anche azzerando il peso di A resta il vincolo di fedeltà", () => {
    expect(globalRecipeScore({ ...good, authenticity: 0 }, { ...weights, authenticity: 0 }, "warnings").score).toBe(0);
  });
  it("ricetta non fattibile: tutti gli assi alti non danno 100", () => {
    const result = globalRecipeScore(good, weights, "not_feasible");
    expect(result.score).toBe(39);
    expect(result.calculation.limited_by).toBe("feasibility");
  });
  it("non peggiora una media già inferiore ai tetti", () => {
    const result = globalRecipeScore({ ...good, digestibility: 20 }, weights, "ok");
    expect(result.score).toBe(84);
    expect(result.calculation.limited_by).toBeNull();
  });
  it("mostra la causa effettiva quando i due limiti coesistono", () => {
    const result = globalRecipeScore({ ...good, authenticity: 10 }, weights, "not_feasible");
    expect(result.score).toBe(10);
    expect(result.calculation.limited_by).toBe("authenticity");
  });
  it("più distanza sperimentale non alza il voto globale", () => {
    const base = { ...good, feasibility: 80, digestibility: 80, sustainability: 80 };
    const faithful = globalRecipeScore(base, weights, "warnings");
    const experimental = globalRecipeScore({ ...base, experimentation: 100 }, weights, "warnings");
    expect(faithful.score).toBe(88);
    expect(experimental.score).toBe(78);
    expect(experimental.calculation.weighted_values.experimentation).toBe(0);
  });
});

/* ═══ FW-06 — explainScore: la spiegazione legge il calcolo, non lo rifà ═══ */
describe("explainScore", () => {
  it("la somma dei contributi è la media pesata", () => {
    const e = explainScore({ ...good, authenticity: 70, feasibility: 60, experimentation: 30 }, weights, "warnings");
    const sum = e.dimensions.reduce((acc, d) => acc + d.contribution, 0);
    expect(Math.round(sum)).toBe(e.weightedAverage);
    expect(e.dimensions.reduce((acc, d) => acc + d.weight, 0)).toBeCloseTo(1, 6);
    expect(e.dimensions.find((d) => d.key === "experimentation")!.weightedValue).toBe(70);
  });
  it("limitedBy coincide con il calcolo globale", () => {
    expect(explainScore({ ...good, authenticity: 20 }, weights, "warnings").limitedBy).toBe("authenticity");
    expect(explainScore(good, weights, "not_feasible").limitedBy).toBe("feasibility");
    expect(explainScore(good, weights, "not_feasible").ceilings.feasibility).toBe(39);
    expect(explainScore({ ...good, digestibility: 20 }, weights, "ok").limitedBy).toBeNull();
  });
  it("D-E: con i pesi dell'app contano solo facilità e fedeltà allo stile", () => {
    const e = explainScore({ ...good, digestibility: 0, sustainability: 0, experimentation: 100 }, DEFAULT_UI_SCORE_WEIGHTS, "ok");
    expect(e.score).toBe(100);
    expect(e.dimensions.filter((d) => d.counts).map((d) => d.key)).toEqual(["authenticity", "feasibility"]);
  });
  it("topDrivers: i criteri che tolgono più punti, solo fra quelli che contano", () => {
    const e = explainScore({ ...good, authenticity: 90, feasibility: 50, digestibility: 0 }, DEFAULT_UI_SCORE_WEIGHTS, "ok");
    expect(e.topDrivers).toEqual(["feasibility", "authenticity"]);
  });

  const kitchen: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, available_hours: 48, meal_deadline: false, dough_balls: 4, skill_level: 2,
    has_mixer: false, has_baking_pan: true, has_pizza_stone: false, has_pizza_steel: false, pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
  it.each(["napoletana_stg", "teglia_romana", "focaccia_genovese"])("golden %s: ricostruisce il numero del motore", (id) => {
    const recipe = generateRecipe(STYLES_DB[id], kitchen, { scoreWeights: DEFAULT_UI_SCORE_WEIGHTS });
    const e = explainRecipeScores(recipe.scores)!;
    expect(e.score).toBe(recipe.scores.composite);
    expect(e.limitedBy).toBe(recipe.scores.global_calculation?.limited_by);
    expect({ score: e.score, weightedAverage: e.weightedAverage, limitedBy: e.limitedBy, ceilings: e.ceilings, topDrivers: e.topDrivers,
      counted: e.dimensions.filter((d) => d.counts).map((d) => [d.key, Math.round(d.value)]) }).toMatchSnapshot();
  });
});
