import { afterEach, describe, expect, it } from "vitest";
import { assessAllergens } from "../../data/allergen-data";
import { registerUiMessages, setActiveUiLocale } from "../../i18n/ui-messages";
import { UI_MESSAGES_DE } from "../../i18n/ui-messages.de";
import { UI_MESSAGES_FR } from "../../i18n/ui-messages.fr";
import { allergenSummary, needsMilkNote } from "./allergen-copy";
import { inlineAllergenName } from "./allergen-names";

afterEach(() => setActiveUiLocale("it"));

describe("allergen copy explains the actual recipe", () => {
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
