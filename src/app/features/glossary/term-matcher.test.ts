import { describe, expect, it } from "vitest";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { buildTermMatcher } from "./term-matcher";

/* D-044: i termini del gergo diventano toccabili, una volta per testo. */

describe("termini toccabili", () => {
  const segment = buildTermMatcher(GLOSSARY_TERMS, "it")();

  it("riconosce il gergo con le forme italiane e collega ogni termine una volta", () => {
    const parts = segment("Impastare fino a incordatura, poi puntata e staglio. Dopo lo staglio, appretto.");
    const links = parts.filter((p) => typeof p !== "string").map((p) => (p as { termId: string }).termId);
    expect(links).toEqual(["incordatura", "bulk_fermentation", "staglio", "ball_fermentation"]);
    expect(parts.map((p) => (typeof p === "string" ? p : p.text)).join("")).toBe(
      "Impastare fino a incordatura, poi puntata e staglio. Dopo lo staglio, appretto.",
    );
  });

  it("non tocca parole comuni né pezzi di parola", () => {
    const parts = segment("Aggiungere il lievito; il bigattino non è una biga.");
    const links = parts.filter((p) => typeof p !== "string");
    expect(links).toEqual([{ termId: "biga", text: "biga" }]);
  });

  it("riconosce stretch & fold e le pieghe", () => {
    const parts = buildTermMatcher(GLOSSARY_TERMS, "it")()("3 giri di pieghe (stretch & fold)");
    expect(parts.filter((p) => typeof p !== "string")).toEqual([{ termId: "stretch_and_fold", text: "pieghe" }]);
  });
});
