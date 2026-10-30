import { afterEach, describe, expect, it, vi } from "vitest";
import { bootLocaleId, isStaleLocaleSnapshot, LOCALE_BUNDLE_REV, readSavedCms } from "./index";

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

/* Budget D-059 (30/10/2026): main.tsx carica il bundle di questa lingua prima
 * del primo render, e lo script in <head> la sceglie con la stessa regola. */
describe("lingua di avvio", () => {
  afterEach(() => vi.unstubAllGlobals());
  const boot = (saved: unknown, languages: string[]) => {
    vi.stubGlobal("localStorage", { getItem: () => (saved === null ? null : JSON.stringify(saved)) });
    vi.stubGlobal("navigator", { languages, language: languages[0] });
    return bootLocaleId();
  };
  it("lo snapshot salvato vince sul browser", () => {
    expect(boot({ locale: { id: "ja", name: "日本語" } }, ["de-DE"])).toBe("ja");
  });
  it("modifiche senza lingua = italiano", () => {
    expect(boot({ hero: { title: "x" } }, ["en-GB"])).toBe("it");
  });
  it("lingua salvata sconosciuta = italiano", () => {
    expect(boot({ locale: { id: "xx", name: "?" } }, ["en-GB"])).toBe("it");
  });
  it("primo avvio: la lingua del browser, l'italiano, o l'inglese di ripiego", () => {
    expect(boot(null, ["fr-FR", "en"])).toBe("fr");
    expect(boot(null, ["it-IT", "en"])).toBe("it");
    expect(boot(null, ["ko-KR"])).toBe("en");
  });
  it("il provider rilegge lo stato salvato senza analizzarlo di nuovo", () => {
    boot({ locale: { id: "pt", name: "Português" } }, ["it-IT"]);
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("letto due volte"); } });
    expect(readSavedCms()?.locale?.id).toBe("pt");
  });
});
