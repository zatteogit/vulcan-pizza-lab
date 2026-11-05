import { describe, expect, it } from "vitest";
import { showcasePreview } from "./explore-showcase";

const e = (item: string, blocked = false) => ({ item, blocked });

describe("vetrina di Scopri: solo ciò che si fa", () => {
  it("le voci non fattibili non riempiono l'anteprima", () => {
    expect(showcasePreview([e("a"), e("x", true), e("b"), e("y", true), e("z", true)], 4)).toEqual(["a", "b"]);
  });
  it("toglie la ricetta già in primo piano e può restare vuota", () => {
    expect(showcasePreview([e("a"), e("x", true)], 4, "a")).toEqual([]);
  });
  it("se non c'è nulla di fattibile mostra le prime, per non lasciare la vetrina vuota", () => {
    expect(showcasePreview([e("x", true), e("y", true)], 4)).toEqual(["x", "y"]);
  });
  it("rispetta il limite e l'ordine", () => {
    expect(showcasePreview(["a", "b", "c", "d", "f"].map((id) => e(id)), 4)).toEqual(["a", "b", "c", "d"]);
  });
});
