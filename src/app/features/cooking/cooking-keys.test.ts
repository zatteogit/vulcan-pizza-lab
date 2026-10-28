import { describe, expect, it } from "vitest";
import { cookingKeyAction, type CookingKeyEventLike } from "./cooking-keys";

/* Un finto elemento: `closest` risponde come il DOM per i selettori che contano. */
function target(matches: string | null) {
  return {
    closest: (selector: string) =>
      matches && selector.split(",").some((part) => part.trim() === matches) ? {} : null,
  } as unknown as EventTarget;
}

function key(overrides: Partial<CookingKeyEventLike> = {}): CookingKeyEventLike {
  return { key: "ArrowRight", defaultPrevented: false, target: target(null), ...overrides };
}

describe("cookingKeyAction (FW-12, S10-A-08 / S10-B-01)", () => {
  it("le frecce sfogliano i passi quando la vista è lo strato in cima", () => {
    expect(cookingKeyAction(key(), { isTopLayer: true })).toBe("next");
    expect(cookingKeyAction(key({ key: "ArrowLeft" }), { isTopLayer: true })).toBe("prev");
  });

  it("tacciono con il dialog «Interrompi» (o un altro strato) aperto sopra", () => {
    expect(cookingKeyAction(key(), { isTopLayer: false })).toBeNull();
  });

  it("tacciono se il tasto è già stato consumato o ha modificatori", () => {
    expect(cookingKeyAction(key({ defaultPrevented: true }), { isTopLayer: true })).toBeNull();
    expect(cookingKeyAction(key({ altKey: true }), { isTopLayer: true })).toBeNull();
    expect(cookingKeyAction(key({ metaKey: true }), { isTopLayer: true })).toBeNull();
    expect(cookingKeyAction(key({ shiftKey: true }), { isTopLayer: true })).toBeNull();
  });

  it("lasciano le frecce a campi, switch, slider e dialog di conferma", () => {
    for (const selector of ["input", "[role='switch']", "[role='slider']", "[role='alertdialog']", "[role='tablist']"]) {
      expect(cookingKeyAction(key({ target: target(selector) }), { isTopLayer: true })).toBeNull();
    }
  });

  it("ignora gli altri tasti (Esc passa dall'escape-stack, non da qui)", () => {
    expect(cookingKeyAction(key({ key: "Escape" }), { isTopLayer: true })).toBeNull();
    expect(cookingKeyAction(key({ key: "Enter" }), { isTopLayer: true })).toBeNull();
  });
});

/* Contratto del focus della vista (S10-A-09 / S10-B-02). Senza DOM nei test,
   si verifica che la vista usi il contratto condiviso dei modali. */
const COOKING_MODE_SOURCE = Object.values(
  import.meta.glob("./cooking-mode.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
)[0];

describe("modalità cottura: contratto del focus (FW-12)", () => {
  it("usa useDialogFocus con focus iniziale sul titolo e ritorno al widget", () => {
    expect(COOKING_MODE_SOURCE).toContain("useDialogFocus<HTMLDivElement>({");
    expect(COOKING_MODE_SOURCE).toContain("initialFocusRef: titleRef");
    expect(COOKING_MODE_SOURCE).toMatch(/fallbackFocus: \(\) => document\.querySelector<HTMLElement>\("\.cook-widget"\)/);
    expect(COOKING_MODE_SOURCE).toMatch(/ref=\{dialogRef\}[\s\S]*role="dialog"[\s\S]*aria-modal="true"/);
    expect(COOKING_MODE_SOURCE).toContain('<h2 ref={titleRef} tabIndex={-1}');
  });

  it("non gestisce Esc da sé e le frecce non completano i passi", () => {
    expect(COOKING_MODE_SOURCE).not.toMatch(/key === ["']Escape["']/);
    const handler = COOKING_MODE_SOURCE.slice(
      COOKING_MODE_SOURCE.indexOf("const action = cookingKeyAction("),
      COOKING_MODE_SOURCE.indexOf('window.addEventListener("keydown", onKey)'),
    );
    expect(handler.length).toBeGreaterThan(0);
    expect(handler).not.toContain("completeStep");
    expect(handler).not.toContain("goNext");
  });

  it("annuncia il passo e espone l'avanzamento come progressbar", () => {
    expect(COOKING_MODE_SOURCE).toContain('uiMessage("cooking.a11y.step-announce"');
    expect(COOKING_MODE_SOURCE).toMatch(/className="cooking-mode-progress"\s+role="progressbar"/);
  });
});
