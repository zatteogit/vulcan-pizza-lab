import { describe, expect, it } from "vitest";
import { FLOURS_DB } from "../data/flour-database";
import { FLOUR_SOURCES } from "../data/flour-sources";
import { getScienceSource } from "../data/science-sources";
import { STYLES_DB } from "../domain/styles-db";
import { buildFlourSheet, type FlourSheet } from "./flour-sheet";

const field = (sheet: FlourSheet | null, id: string) => sheet?.fields.find((f) => f.id === id);

describe("G1a-WP-01 — scheda farina", () => {
  it("Caputo Pizzeria: W dalla scheda del produttore, esatto e verificato", () => {
    const w = field(buildFlourSheet("caputo_pizzeria"), "w");
    expect(w).toMatchObject({ value: 265, evidence: "exact", sourceStatus: "verified", sourceId: "caputo-pizzeria-2025" });
    // Assorbimento non è sulla pagina del produttore: resta da verificare.
    expect(field(buildFlourSheet("caputo_pizzeria"), "assorbimento_pct")?.sourceStatus).toBe("unverified");
  });

  it("Petra 3: W e P/L contraddetti dalla scheda (non dichiarati), stime", () => {
    const sheet = buildFlourSheet("petra_3_evolutiva");
    expect(sheet?.wDeclared).toBe(false);
    for (const id of ["w", "pl"]) {
      expect(field(sheet, id)).toMatchObject({ sourceStatus: "wrong", evidence: "estimate" });
    }
  });

  it("5 Stagioni rossa: falling number errato, stabilità verificata", () => {
    const sheet = buildFlourSheet("5stagioni_rossa");
    expect(field(sheet, "falling_number")?.sourceStatus).toBe("wrong");
    expect(field(sheet, "stabilita_min")?.sourceStatus).toBe("verified");
    expect(field(sheet, "w")?.sourceStatus).toBe("unverified");
  });

  it("le farine «Generico» sono tutte da verificare", () => {
    const generic = FLOURS_DB.filter((f) => f.producer === "Generico");
    expect(generic.length).toBeGreaterThan(0);
    for (const flour of generic) {
      const sheet = buildFlourSheet(flour.id);
      expect(sheet?.generic).toBe(true);
      expect(sheet?.sourceIds).toEqual([]);
      for (const f of sheet?.fields ?? []) {
        expect(f).toMatchObject({ sourceStatus: "unverified", evidence: "estimate" });
      }
    }
  });

  it("gli stili compatibili esistono tutti nel catalogo", () => {
    for (const flour of FLOURS_DB) {
      expect(flour.stili_compatibili.filter((id) => !(id in STYLES_DB)), flour.id).toEqual([]);
      expect(buildFlourSheet(flour.id)?.compatibleStyleIds).toEqual(flour.stili_compatibili);
    }
  });

  it("ogni farina del database ha la sua scheda; un id inesistente no", () => {
    for (const flour of FLOURS_DB) {
      const sheet = buildFlourSheet(flour.id);
      expect(sheet?.name).toBe(flour.name);
      expect(sheet?.fermentationHours).toEqual([flour.fermentazione_min_h, flour.fermentazione_max_h]);
    }
    expect(buildFlourSheet("inesistente")).toBeNull();
  });

  it("le fonti per farina esistono nel registro e le farine anche", () => {
    for (const [flourId, fields] of Object.entries(FLOUR_SOURCES)) {
      expect(FLOURS_DB.some((f) => f.id === flourId), flourId).toBe(true);
      for (const source of Object.values(fields)) expect(getScienceSource(source!.sourceId), source!.sourceId).toBeDefined();
    }
  });

  it("senza glutine: niente W, P/L e falling number a zero mostrati come valori", () => {
    const sheet = buildFlourSheet("mix_gluten_free");
    expect(sheet?.fields.map((f) => f.id)).not.toContain("w");
    expect(sheet?.fields.every((f) => f.value > 0)).toBe(true);
  });
});
