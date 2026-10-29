import { describe, expect, it } from "vitest";
import { SCIENCE_NOTES } from "./science-notes";
import { SCIENCE_SOURCES } from "./science-sources";
import { METHOD_GROUP_IDS, latestSourceReading, methodAssumptions, methodGroups, methodSources } from "./method-sections";
import type { ScienceNote } from "../domain/science/types";

/* FW-15 (D-D): la pagina «Metodo e fonti» è una vista del registro. */
describe("Metodo e fonti", () => {
  it("ogni nota del registro compare una e una sola volta, nell'ordine dei gruppi", () => {
    const shown = methodGroups().flatMap((group) => group.notes.map((note) => note.id));
    expect([...shown].sort()).toEqual(SCIENCE_NOTES.map((note) => note.id).sort());
    expect(new Set(shown).size).toBe(shown.length);
    const order = methodGroups().map((group) => METHOD_GROUP_IDS.indexOf(group.id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("una nota senza gruppo finisce in «altre note», non sparisce", () => {
    const extra: ScienceNote = { id: "nota-nuova", kind: "editorial", sourceIds: [] };
    const groups = methodGroups([...SCIENCE_NOTES, extra]);
    expect(groups[groups.length - 1]?.id).toBe("other");
    expect(groups[groups.length - 1]?.notes.map((note) => note.id)).toContain("nota-nuova");
  });

  it("le fonti «wrong» non si mostrano; le altre sì, verificate per prime", () => {
    const shown = methodSources();
    expect(shown.some(({ source }) => source.status === "wrong")).toBe(false);
    expect(shown.length).toBe(SCIENCE_SOURCES.filter((source) => source.status !== "wrong").length);
    expect(shown[0]?.source.status).toBe("verified");
    const yeast = shown.find(({ source }) => source.id === "salvado-2011");
    expect(yeast?.noteIds).toEqual(expect.arrayContaining(["q10-fermentation", "equivalent-hours"]));
  });

  it("ipotesi elencate una volta, con le note che le usano", () => {
    const assumptions = methodAssumptions();
    expect(new Set(assumptions.map((item) => item.id)).size).toBe(assumptions.length);
    expect(assumptions.find((item) => item.id === "constant-ferment-temp")?.noteIds).toContain("yeast-dose");
  });

  it("data dell'ultima lettura delle fonti", () => {
    expect(latestSourceReading()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(latestSourceReading()! >= "2026-10-24").toBe(true);
    expect(latestSourceReading([])).toBeUndefined();
  });
});
