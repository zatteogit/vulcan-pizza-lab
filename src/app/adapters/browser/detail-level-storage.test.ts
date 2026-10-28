import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DETAIL_LEVEL_EVENT,
  DETAIL_LEVEL_STORAGE_KEY,
  loadDetailLevel,
  saveDetailLevel,
  subscribeDetailLevel,
} from "./detail-level-storage";
import { hydrationCeilingForSkill } from "../../domain/pizza-engine";

/* FW-08 (D-C): «Mostra i dettagli tecnici» ha un solo stato e un solo modulo
   che lo legge e lo scrive. */

function stubStorage(initial: Record<string, string> = {}) {
  const storage = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  });
  return storage;
}

function stubWindow() {
  const target = new EventTarget();
  vi.stubGlobal("window", target);
  vi.stubGlobal("CustomEvent", class extends Event {
    detail: unknown;
    constructor(type: string, init?: { detail?: unknown }) {
      super(type);
      this.detail = init?.detail;
    }
  });
  return target;
}

afterEach(() => vi.unstubAllGlobals());

describe("livello di dettaglio (PizzaNerd)", () => {
  it("parte essenziale e legge la chiave del profilo e quella storica", () => {
    stubStorage();
    expect(loadDetailLevel()).toBe("essential");
    stubStorage({ [DETAIL_LEVEL_STORAGE_KEY]: "true" });
    expect(loadDetailLevel()).toBe("technical");
    stubStorage({ vulcan_view_mode: "nerd" });
    expect(loadDetailLevel()).toBe("technical");
  });

  it("salva, toglie la chiave storica e avvisa chi ascolta nella stessa scheda", () => {
    const storage = stubStorage({ vulcan_view_mode: "nerd" });
    const target = stubWindow();
    const onChange = vi.fn();
    const unsubscribe = subscribeDetailLevel(onChange);
    saveDetailLevel("technical");
    expect(storage.get(DETAIL_LEVEL_STORAGE_KEY)).toBe("true");
    expect(storage.has("vulcan_view_mode")).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    saveDetailLevel("essential");
    expect(loadDetailLevel()).toBe("essential");
    expect(onChange).toHaveBeenCalledTimes(2);
    unsubscribe();
    target.dispatchEvent(new Event(DETAIL_LEVEL_EVENT));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("con lo storage bloccato vale «essenziale» e il salvataggio non lancia", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    });
    stubWindow();
    expect(loadDetailLevel()).toBe("essential");
    expect(() => saveDetailLevel("technical")).not.toThrow();
  });

  it("un solo modulo dell'app tocca la chiave vulcan_nerd_on", () => {
    const sources = import.meta.glob(
      ["/src/app/**/*.{ts,tsx}", "!/src/app/**/*.test.{ts,tsx}"],
      { query: "?raw", import: "default", eager: true },
    ) as Record<string, string>;
    const offenders = Object.entries(sources)
      .filter(([, text]) => /vulcan_nerd_on|vulcan_view_mode/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual(["/src/app/adapters/browser/detail-level-storage.ts"]);
  });
});

describe("effetti del livello di esperienza (S15-A-02)", () => {
  it("espone gli stessi tetti d'idratazione dell'ottimizzatore", () => {
    expect(([1, 2, 3, 4] as const).map((s) => hydrationCeilingForSkill(s))).toEqual([68, 78, 88, null]);
  });
});
