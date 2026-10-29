import { describe, expect, it } from "vitest";
import { UI_MESSAGES_DE } from "./ui-messages.de";
import { DE_LOCALE } from "../features/cms/locales/de";
import { GLOSSARY_TERMS_DE, PRE_FERMENT_DE, SCIENCE_DE, TROUBLESHOOTING_DE } from "../features/cms/locales/domain-de";

/* Revisione ondata 2: il tedesco dà del «du» («deine Hefe», «Wähle …»), ma le
 * chiavi recipe.phases.* erano passate al «Sie» («Lösen Sie … Wiegen Sie …»),
 * nello stesso pannello Ingredienti. Come fr-register.test.ts per il «vous».
 *
 * «Sie»/«Ihr…» a inizio frase (anche dopo i due punti, che in tedesco vogliono
 * la maiuscola) sono i pronomi «lei/essi», «loro», e restano permessi; con la
 * maiuscola a metà frase sono il registro formale. */

function texts(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => texts(child, path ? `${path}.${key}` : key));
}

const FORMAL = /(?<!(?:^|[.:!?«»"„“(]\s*))\b(?:Sie|Ihnen|Ihre?[nmrs]?)\b/u;

describe("tedesco: sempre «du»", () => {
  it("nessuna stringa usa Sie/Ihnen/Ihr a metà frase", () => {
    const all = [
      ...texts(UI_MESSAGES_DE, "ui"),
      ...texts(DE_LOCALE, "cms"),
      ...texts({ GLOSSARY_TERMS_DE, PRE_FERMENT_DE, SCIENCE_DE, TROUBLESHOOTING_DE }, "domain"),
    ];
    expect(all.length).toBeGreaterThan(1000);
    const formal = all.filter(([, text]) => FORMAL.test(text));
    expect(formal.map(([path, text]) => `${path}: ${text}`)).toEqual([]);
  });

  it("la regola riconosce il registro formale e lascia il pronome a inizio frase", () => {
    expect(FORMAL.test("Wiegen Sie 4 g ab.")).toBe(true);
    expect(FORMAL.test("Statt Ihnen erfundene Zahlen")).toBe(true);
    expect(FORMAL.test("Nimm Backhefe in Ihren Vorrat auf.")).toBe(true);
    expect(FORMAL.test("Ihre Anwesenheit belegt nichts.")).toBe(false);
    expect(FORMAL.test("Sie ist fertig, wenn der Rand goldbraun ist.")).toBe(false);
    expect(FORMAL.test("Eine Entscheidung: Sie gilt für dich.")).toBe(false);
  });
});
