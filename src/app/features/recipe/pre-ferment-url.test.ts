import { describe, expect, it } from "vitest";
import { decodePreFermentChoice, writePreFermentChoice } from "./pre-ferment-url";

describe("pre-fermento nel link (D-043)", () => {
  it("andata e ritorno", () => {
    const params = new URLSearchParams();
    writePreFermentChoice(params, { type: "poolish", flourPct: 35 });
    expect(decodePreFermentChoice(new URLSearchParams(params.toString()))).toEqual({ type: "poolish", flourPct: 35 });
  });
  it("valori non validi scartati", () => {
    expect(decodePreFermentChoice(new URLSearchParams("pft=sourdough&pfp=90"))).toEqual({});
  });
});
