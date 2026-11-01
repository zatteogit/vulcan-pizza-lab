import { describe, expect, it } from "vitest";
import { AUTH_AXIS_WEIGHTS, FEAS_AXIS_WEIGHTS } from "../../domain/recipe-score";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { GLOSSARY_VISUALS } from "./learning-illustration";

const plates = import.meta.glob("../../../assets/learn/*-diagram.svg", { query: "?raw", import: "default", eager: true });
const svg = (id: string) => plates[`../../../assets/learn/${id}-diagram.svg`] as string;

describe("reviewed learning diagrams stay faithful to their sources", () => {
  it("keeps bar proportions aligned with the engine criteria", () => {
    for (const [id, weights] of [["a-score", AUTH_AXIS_WEIGHTS], ["f-score", FEAS_AXIS_WEIGHTS]] as const) {
      const widths = [...svg(id).matchAll(/<rect\b[^>]*\bwidth="([\d.]+)"/g)].map(match => Number(match[1]));
      expect(widths).toHaveLength(3);
      Object.values(weights).forEach((weight, index) => expect(widths[index] / 576).toBeCloseTo(weight));
    }
  });
  it("conserves the nine symbolic residues in order through proteolysis", () => {
    const circles = [...svg("proteolysis").matchAll(/<circle\b[^>]*\bcy="(\d+)"[^>]*\bfill="([^"]+)"/g)];
    const before = circles.filter(match => match[1] === "116").map(match => match[2]);
    const after = circles.filter(match => match[1] === "294").map(match => match[2]);
    expect(before).toHaveLength(9);
    expect(after).toEqual(before);
  });
  it("keeps labels localizable and reuses cached bitmap artwork", () => {
    for (const id of ["arrhenius", "proteolysis", "a-score", "f-score", "d-score"]) {
      expect(svg(id)).not.toMatch(/<text\b|data:image|<image\b/);
    }
    expect(GLOSSARY_TERMS.filter(term => !GLOSSARY_VISUALS[term.id]).map(term => term.id)).toEqual([]);
  });
});
