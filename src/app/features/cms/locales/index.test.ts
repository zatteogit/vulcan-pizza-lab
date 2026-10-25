import { describe, expect, it } from "vitest";
import { isStaleLocaleSnapshot, LOCALE_BUNDLE_REV } from "./index";

describe("aggiornamento delle traduzioni già salvate nel browser", () => {
  for (const id of ["en", "de", "es", "fr", "pt", "ja"] as const) {
    it(`${id}: ricarica i testi precedenti all'audit fattibilità e dispensa`, () => {
      const snapshot = { locale: { id, name: id } };
      expect(isStaleLocaleSnapshot(snapshot, 5)).toBe(true);
      expect(isStaleLocaleSnapshot(snapshot, null)).toBe(true);
      expect(isStaleLocaleSnapshot(snapshot, LOCALE_BUNDLE_REV)).toBe(false);
    });
  }
  it("non sostituisce le preferenze italiane o uno stato senza lingua", () => {
    expect(isStaleLocaleSnapshot({ locale: { id: "it", name: "Italiano" } }, 5)).toBe(false);
    expect(isStaleLocaleSnapshot(null, 5)).toBe(false);
  });
});
