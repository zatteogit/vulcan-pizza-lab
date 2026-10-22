import { describe, expect, it } from "vitest";
import { ENGINE_CHECK_GROUPS } from "./engine-test-suite";

/* ═══ Suite dev-tools in CI (audit motore 22/10/2026, ENG-1) ═══
   I gruppi della pagina /dev (13, 98 controlli al 22/10) giravano solo a
   mano nel browser. Qui falliscono sugli esiti "fail"; i "warn" restano informativi,
   come nella pagina. */

describe("suite motore di dev-tools", () => {
  // La pagina /dev deriva i suoi gruppi da ENGINE_CHECK_GROUPS: un gruppo
  // nuovo gira qui senza aggiornare un conteggio a mano.
  it("gruppi con id univoci (almeno i 13 storici)", () => {
    const ids = ENGINE_CHECK_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(13);
  });

  for (const group of ENGINE_CHECK_GROUPS) {
    it(`${group.id} — ${group.label}: nessun controllo in fail`, () => {
      const results = group.run();
      expect(results.length).toBeGreaterThan(0);
      const failed = results
        .filter((result) => result.status === "fail")
        .map((result) => `${result.id} ${result.name}: ${result.detail}`);
      expect(failed).toEqual([]);
    });
  }
});
