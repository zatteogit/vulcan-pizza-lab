import { describe, expect, it } from "vitest";
import { globalRecipeScore } from "./recipe-score";

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
