import { afterEach, describe, expect, it } from "vitest";
import { assessAllergens } from "../../data/allergen-data";
import { registerUiMessages, setActiveUiLocale } from "../../i18n/ui-messages";
import { UI_MESSAGES_DE } from "../../i18n/ui-messages.de";
import { UI_MESSAGES_FR } from "../../i18n/ui-messages.fr";
import { allergenSummary, allergensForSection, needsMilkNote } from "./allergen-copy";
import { inlineAllergenName } from "./allergen-names";

afterEach(() => setActiveUiLocale("it"));

describe("allergen copy explains the actual recipe", () => {
  it("keeps dough and cooking findings separate from the selected topping without weakening the combined report", () => {
    const report = assessAllergens([
      { name: "Farina di frumento", section: "dough" },
      { name: "Latte", section: "dough" },
      { name: "Olio di arachidi", section: "cooking" },
      { name: "Mozzarella", section: "topping" },
      { name: "Acciughe", section: "topping" },
    ], ["milk", "fish"]);
    const snapshot = JSON.stringify(report);
    const dough = allergensForSection(report, "recipe");
    const topping = allergensForSection(report, "topping");
    expect(dough.contains.map(group => group.id)).toEqual(["gluten", "peanuts", "milk"]);
    expect(topping.contains.map(group => group.id)).toEqual(["fish", "milk"]);
    expect(topping.contains.find(group => group.id === "milk")?.sources.map(source => source.ingredient)).toEqual(["Mozzarella"]);
    expect(JSON.stringify(report)).toBe(snapshot);
    expect(report.avoided).toEqual(["fish", "milk"]);
  });

  it("retains optional additions, label traces and unknown products only in their own section", () => {
    const report = assessAllergens([
      { name: "Farina di frumento", section: "dough" },
      { name: "Mozzarella", section: "topping", optional: true },
      { name: "Salsa speciale", section: "topping" },
      { name: "Olio EVO", section: "topping", allergen_declaration: { product: "Olio scelto", contains: [], may_contain: ["sesame"], complete: true } },
    ]);
    const dough = allergensForSection(report, "recipe");
    const topping = allergensForSection(report, "topping");
    expect(dough.conditional).toEqual([]);
    expect(dough.may_contain).toEqual([]);
    expect(dough.unverified).toEqual([]);
    expect(topping.conditional.map(group => group.id)).toEqual(["milk"]);
    expect(topping.may_contain.map(group => group.id)).toEqual(["sesame"]);
    expect(topping.unverified.map(source => source.ingredient)).toContain("Salsa speciale");
  });

  it("names the allergen in an optional addition rather than a group count", () => {
    const report = assessAllergens([
      { name: "Farina di frumento", section: "dough" },
      { name: "Mozzarella", section: "topping", optional: true },
    ]);
    expect(allergenSummary(report)).toEqual(["Cereali con glutine", "Con le aggiunte: Latte"]);
  });

  it("never suggests required milk disappears by omitting another dairy addition", () => {
    const report = assessAllergens([
      { name: "Mozzarella", section: "topping" },
      { name: "Parmigiano", section: "topping", optional: true },
    ]);
    expect(allergenSummary(report)).toEqual(["Latte"]);
  });

  it("distinguishes a required product's traces from an optional product's traces", () => {
    const label = { product: "Prodotto scelto", contains: [], may_contain: ["peanuts" as const], complete: true };
    const ingredient = { name: "Olio EVO", section: "topping" as const, allergen_declaration: label };
    expect(allergenSummary(assessAllergens([ingredient]))).toContain("Possibili tracce: Arachidi");
    expect(allergenSummary(assessAllergens([{ ...ingredient, optional: true }]))).toContain("Possibili tracce nelle aggiunte: Arachidi");
  });

  it("unknown composition calls for label verification without asserting absence", () => {
    const report = assessAllergens([{ name: "Salsa speciale", section: "topping" }]);
    expect(allergenSummary(report)).toEqual(["Da verificare sulle etichette"]);
    expect(needsMilkNote(report)).toBe(false);
    expect(needsMilkNote({ ...report, avoided: ["milk"] })).toBe(true);
  });

  it("uses sentence case without lowercasing German nouns", () => {
    expect(inlineAllergenName("milk", "it-IT")).toBe("latte");
    registerUiMessages("de", UI_MESSAGES_DE);
    setActiveUiLocale("de");
    expect(inlineAllergenName("milk", "de-DE")).toBe("Milch");
    registerUiMessages("fr", UI_MESSAGES_FR);
    setActiveUiLocale("fr");
    expect(inlineAllergenName("eggs", "fr-FR")).toBe("œufs");
  });
});
