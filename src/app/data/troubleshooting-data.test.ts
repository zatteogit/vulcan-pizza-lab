import { describe, expect, it } from "vitest";
import { getContextualWarnings } from "./troubleshooting-data";

const params = {
  hydration: 63, flourW: 285, flourPL: 0.6, fermentHours: 16,
  fermentTemp: 4, ovenTemp: 175, skillLevel: 2, usePreFerment: false,
};

describe("avvisi contestuali per il metodo di cottura", () => {
  it("mantiene l'avviso di forno freddo per una ricetta al forno", () => {
    expect(getContextualWarnings(params).some(w => w.issueId === "P09")).toBe(true);
  });

  it("non scambia l'olio della frittura per un forno freddo", () => {
    const warnings = getContextualWarnings({ ...params, usesOven: false });
    expect(warnings.some(w => w.issueId === "P09")).toBe(false);
  });

  it("continua a segnalare i problemi dell'impasto anche se la ricetta è fritta", () => {
    const warnings = getContextualWarnings({ ...params, usesOven: false, hydration: 80, flourW: 220 });
    expect(warnings.some(w => w.issueId === "P01")).toBe(true);
    expect(warnings.some(w => w.issueId === "P09")).toBe(false);
  });
});
