import { describe, expect, it } from "vitest";
import { parseLocaleGrams } from "./flour-budget-number";

describe("grammi di farina letti secondo la lingua", () => {
  it("il separatore delle migliaia della lingua vale migliaia", () => {
    expect(parseLocaleGrams("1.500", "it-IT")).toBe(1500);
    expect(parseLocaleGrams("1.500", "de-DE")).toBe(1500);
    expect(parseLocaleGrams("1.500", "es-ES")).toBe(1500);
    expect(parseLocaleGrams("1.500", "pt-BR")).toBe(1500);
    expect(parseLocaleGrams("1,500", "en-GB")).toBe(1500);
    expect(parseLocaleGrams("1,500", "ja-JP")).toBe(1500);
    expect(parseLocaleGrams("1 500", "fr-FR")).toBe(1500);
    expect(parseLocaleGrams("1.000.000", "en-GB")).toBe(1000000);
  });
  it("la virgola decimale vale in ogni lingua", () => {
    expect(parseLocaleGrams("1500,5", "it-IT")).toBe(1500.5);
    expect(parseLocaleGrams("1500,5", "en-GB")).toBe(1500.5);
    expect(parseLocaleGrams("1500.5", "fr-FR")).toBe(1500.5);
    expect(parseLocaleGrams("500", "it-IT")).toBe(500);
  });
  it("ciò che resta ambiguo non diventa 1,5 g", () => {
    expect(parseLocaleGrams("1,500", "it-IT")).toBeNaN();
    expect(parseLocaleGrams("1.500", "en-GB")).toBeNaN();
    expect(parseLocaleGrams("1,500", "fr-FR")).toBeNaN();
    expect(parseLocaleGrams("1.5.00", "it-IT")).toBeNaN();
    expect(parseLocaleGrams("abc", "it-IT")).toBeNaN();
    expect(parseLocaleGrams("1.500,5", "it-IT")).toBeNaN();
  });
});
