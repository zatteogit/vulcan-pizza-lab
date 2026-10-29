import { describe, expect, it } from "vitest";
import {
  KITCHEN_TAB_FALLBACK,
  OVEN_CHOICE_SELECTORS,
  focusOvenChoice,
  type FocusableLike,
  type QueryRootLike,
} from "./kitchen-drawer-focus";

/* Senza DOM nei test: una radice finta che risponde ai selettori presenti e
   un elemento che registra chi ha ricevuto il focus. */
function fakeRoot(present: () => Record<string, string>, focused: string[]): QueryRootLike {
  return {
    querySelector: (selector: string): FocusableLike | null => {
      const name = present()[selector];
      return name ? { focus: () => focused.push(name) } : null;
    },
  };
}

function manualFrames() {
  const queue: Array<() => void> = [];
  return {
    schedule: (cb: () => void) => queue.push(cb),
    flush: (n = 1) => {
      for (let i = 0; i < n && queue.length > 0; i++) queue.shift()!();
    },
    pending: () => queue.length,
  };
}

describe("focusOvenChoice (FW-20, WCAG 2.4.3)", () => {
  it("dopo «Scegli il tuo forno» il focus va sul forno scelto nel cassetto, non su body", () => {
    const focused: string[] = [];
    const frames = manualFrames();
    focusOvenChoice(
      fakeRoot(() => ({ [OVEN_CHOICE_SELECTORS[0]]: "forno-attivo", [OVEN_CHOICE_SELECTORS[1]]: "primo-forno" }), focused),
      { schedule: frames.schedule },
    );
    expect(focused).toEqual([]);
    frames.flush();
    expect(focused).toEqual(["forno-attivo"]);
  });

  it("aspetta il cassetto che compare qualche frame dopo (AnimatePresence)", () => {
    const focused: string[] = [];
    const frames = manualFrames();
    let mounted = false;
    focusOvenChoice(
      fakeRoot((): Record<string, string> => (mounted ? { [OVEN_CHOICE_SELECTORS[1]]: "primo-forno" } : {}), focused),
      { schedule: frames.schedule },
    );
    frames.flush(3);
    expect(focused).toEqual([]);
    mounted = true;
    frames.flush();
    expect(focused).toEqual(["primo-forno"]);
    expect(frames.pending()).toBe(0);
  });

  it("se il cassetto non arriva ripiega sul tab «La tua cucina» aperto", () => {
    const focused: string[] = [];
    const frames = manualFrames();
    focusOvenChoice(fakeRoot(() => ({ [KITCHEN_TAB_FALLBACK]: "tab-cucina" }), focused), {
      schedule: frames.schedule,
      maxFrames: 4,
    });
    frames.flush(10);
    expect(focused).toEqual(["tab-cucina"]);
  });

  it("si può annullare", () => {
    const focused: string[] = [];
    const frames = manualFrames();
    const cancel = focusOvenChoice(fakeRoot(() => ({ [OVEN_CHOICE_SELECTORS[0]]: "forno-attivo" }), focused), {
      schedule: frames.schedule,
    });
    cancel();
    frames.flush();
    expect(focused).toEqual([]);
  });

  it("i selettori puntano a ciò che il cassetto «La tua cucina» rende davvero", () => {
    const userNeeds = Object.values(
      import.meta.glob("./user-needs.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
    )[0];
    expect(userNeeds).toContain('data-slot="oven-preset"');
    expect(userNeeds).toContain("aria-pressed={active}");
    expect(userNeeds).toMatch(/"needs-drawer"/);
    expect(userNeeds).toContain('"needs-summary__tab"');
    expect(userNeeds).toContain("aria-expanded={isActive}");
  });

  it("Crea lo usa quando la scheda apre il cassetto", () => {
    const home = Object.values(
      import.meta.glob("../../pages/home.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
    )[0];
    const handler = home.slice(home.indexOf("onChooseOven={"), home.indexOf("onClosed={", home.indexOf("onChooseOven={")));
    expect(handler).toContain('setStyleSettingsPanel("cucina")');
    expect(handler).toContain("focusOvenChoice(");
  });
});
