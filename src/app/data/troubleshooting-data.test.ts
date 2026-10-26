import { describe, expect, it } from "vitest";
import { getContextualWarnings, getStepTroubleshooting, ISSUES_DB } from "./troubleshooting-data";
import { TROUBLESHOOTING_I18N_DEFAULTS } from "../features/cms/domain-i18n-defaults";
import { TROUBLESHOOTING_EN } from "../features/cms/locales/domain-en";
import { TROUBLESHOOTING_DE } from "../features/cms/locales/domain-de";
import { TROUBLESHOOTING_ES } from "../features/cms/locales/domain-es";
import { TROUBLESHOOTING_FR } from "../features/cms/locales/domain-fr";
import { TROUBLESHOOTING_PT } from "../features/cms/locales/domain-pt";
import { TROUBLESHOOTING_JA } from "../features/cms/locales/domain-ja";

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

describe("troubleshooting limitato alla fase effettiva", () => {
  it("il passo bake in variante fry non apre problemi del forno", () => {
    const ids = getStepTroubleshooting({ id: "bake", variant: "fry" })!.issueIds;
    expect(ids).toEqual(["FR01", "FR02"]);
    expect(ids.every(id => ISSUES_DB.find(issue => issue.id === id)?.category === "frying")).toBe(true);
    expect(getStepTroubleshooting({ id: "bake", variant: "fry" }, { filled: true })!.issueIds).toContain("FR03");
  });

  it("valuta ogni cottura separatamente e non parla di topping nella prima cottura in bianco", () => {
    expect(getStepTroubleshooting({ id: "bake2" }, { filled: true })!.issueIds).toContain("P09");
    expect(getStepTroubleshooting({ id: "bake2" })!.issueIds).not.toContain("FR01");
    expect(getStepTroubleshooting({ id: "bake", msg: { title: { key: "timeline.bakeWhite.title", fallback: "Prima cottura in bianco" } } })!.issueIds).not.toContain("P18");
  });

  it("impasto e stesura non rimandano alla cottura", () => {
    for (const id of ["mix", "shape"]) {
      expect(getStepTroubleshooting({ id })!.issueIds.every(key => ["dough", "shaping"].includes(ISSUES_DB.find(issue => issue.id === key)!.category))).toBe(true);
    }
  });

  it("i riposi senza lievito e le fasi sconosciute non ereditano un problema generico", () => {
    for (const id of ["bulk", "proof"]) expect(getStepTroubleshooting({ id }, { unleavened: true })).toBeUndefined();
    expect(getStepTroubleshooting({ id: "custom_topping_bake" })).toBeUndefined();
    expect(getStepTroubleshooting({ id: "shape" }, { unleavened: true })!.issueIds).not.toContain("P02");
  });

  it("tutti gli ID contestuali esistono, senza duplicati o selezioni fuori contesto", () => {
    for (const id of ["preferment", "mix", "bulk", "proof", "shape", "bake", "bake2"]) {
      const context = getStepTroubleshooting({ id })!;
      expect(new Set(context.issueIds).size).toBe(context.issueIds.length);
      expect(context.issueIds.every(key => ISSUES_DB.some(issue => issue.id === key))).toBe(true);
      if (context.initialIssueId) expect(context.issueIds).toContain(context.initialIssueId);
    }
  });

  it("i tre problemi di frittura hanno tutti i campi nelle sette lingue", () => {
    for (const copy of [TROUBLESHOOTING_I18N_DEFAULTS, TROUBLESHOOTING_EN, TROUBLESHOOTING_DE, TROUBLESHOOTING_ES, TROUBLESHOOTING_FR, TROUBLESHOOTING_PT, TROUBLESHOOTING_JA]) {
      expect(copy.categories?.frying).toBeTruthy();
      for (const id of ["FR01", "FR02", "FR03"]) {
        const issue = copy.issues?.[id];
        expect(issue).toBeDefined();
        for (const field of ["symptom", "cause", "testRapido", "fixImmediate", "prevention"] as const) expect(issue?.[field]).toBeTruthy();
      }
    }
  });
});
