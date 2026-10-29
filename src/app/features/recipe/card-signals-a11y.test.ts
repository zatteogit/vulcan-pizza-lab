import { describe, expect, it } from "vitest";

/* Revisione finale ondata 1: i segnali di blocco delle card iconiche (forno,
 * allergeni, dieta, tempi) devono arrivare al lettore di schermo, e la pill
 * bloccata non si affida al solo colore. Niente DOM di test nel repo: controllo
 * sul sorgente. */
const SOURCES = import.meta.glob(["../../pages/explore.tsx", "./style-card-parts.tsx"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const explore = SOURCES["../../pages/explore.tsx"];
const parts = SOURCES["./style-card-parts.tsx"];

describe("card di Scopri: segnali accessibili", () => {
  it("lo StyleMetaChip della ricetta iconica entra in aria-describedby del link", () => {
    const card = explore.slice(explore.indexOf("function SignatureRecipeCard"), explore.indexOf("function StyleTechLine"));
    expect(card).toMatch(/signalsId = showSignals \? `\$\{nameId\}-signals`/);
    expect(card).toMatch(/aria-describedby=\{\[signalsId,/);
    expect(card).toMatch(/<StyleMetaChip id=\{signalsId\}/);
    expect(parts).toMatch(/<div id=\{id\} className="style-signals"/);
  });

  it("la CompatibilityPill bloccata lo dice nel nome accessibile", () => {
    expect(parts).toMatch(/blocked \? `\$\{uiMessage\("pages\.explore\.compatibilityBlocked"\)\}/);
  });
});
