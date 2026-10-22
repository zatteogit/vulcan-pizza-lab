import { describe, expect, it } from "vitest";
import { ENGINE_CHECK_GROUPS } from "./engine-test-suite";

/* ═══ Suite dev-tools in CI (audit motore 22/10/2026, ENG-1) ═══
   I 13 gruppi della pagina /dev (98 controlli) giravano solo a mano nel
   browser. Qui falliscono sugli esiti "fail"; i "warn" restano informativi,
   come nella pagina. */

describe("suite motore di dev-tools", () => {
  it("contiene i 13 gruppi della pagina /dev", () => {
    expect(ENGINE_CHECK_GROUPS).toHaveLength(13);
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
