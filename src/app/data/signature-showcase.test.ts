import { describe, expect, it } from "vitest";
import { inShowcase, SIGNATURE_RECIPES } from "./signature-recipes";

describe("vetrina di Scopri e foto segnaposto", () => {
  it("lo sfincione in bianco ha il segnaposto e resta fuori dalla vetrina", () => {
    const sfincione = SIGNATURE_RECIPES.find((r) => r.id === "sfincione_bianca");
    expect(sfincione?.photo).toBe("placeholder");
    expect(inShowcase(sfincione!)).toBe(false);
  });
  it("le altre ricette iconiche restano in vetrina", () => {
    const fuori = SIGNATURE_RECIPES.filter((r) => !inShowcase(r)).map((r) => r.id);
    expect(fuori).toEqual(["sfincione_bianca"]);
  });
});
