import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KeepScreenAwakeNotice, KeepScreenAwakeToggle, type KeepScreenAwakeControl } from "./keep-screen-awake";

/* G4a-WP-02 (S10-B-14, S10-A-18): lo schermo acceso è un bottone dell'header;
 * nel corpo del passo resta solo l'avviso quando qualcosa non va. */
const control = (state: KeepScreenAwakeControl["state"], enabled = true): KeepScreenAwakeControl =>
  ({ state, enabled, toggle: () => {}, retry: () => {} });

describe("schermo acceso", () => {
  it("il bottone dell'header dice se è acceso (aria-pressed) e ha un nome", () => {
    const on = renderToStaticMarkup(createElement(KeepScreenAwakeToggle, { control: control("active") }));
    expect(on).toContain('aria-pressed="true"');
    expect(on).toMatch(/aria-label="[^"]+"/);
    const off = renderToStaticMarkup(createElement(KeepScreenAwakeToggle, { control: control("off", false) }));
    expect(off).toContain('aria-pressed="false"');
  });

  it("dove l'API non c'è il bottone non compare", () => {
    expect(renderToStaticMarkup(createElement(KeepScreenAwakeToggle, { control: control("unsupported") }))).toBe("");
  });

  it("acceso, in attesa o spento non occupa il corpo del passo", () => {
    for (const state of ["active", "requesting", "off", "paused"] as const) {
      const html = renderToStaticMarkup(createElement(KeepScreenAwakeNotice, { control: control(state) }));
      expect(html, state).not.toContain("cooking-screen");
    }
  });

  it("negato o interrotto: una riga con «Riprova»; non supportato: solo la riga", () => {
    for (const state of ["denied", "released"] as const) {
      const html = renderToStaticMarkup(createElement(KeepScreenAwakeNotice, { control: control(state) }));
      expect(html).toContain("cooking-screen");
      expect(html).toContain("<button");
    }
    const unsupported = renderToStaticMarkup(createElement(KeepScreenAwakeNotice, { control: control("unsupported") }));
    expect(unsupported).toContain("cooking-screen");
    expect(unsupported).not.toContain("<button");
    /* Spento dall'utente: un rilascio non è un problema da segnalare. */
    expect(renderToStaticMarkup(createElement(KeepScreenAwakeNotice, { control: control("released", false) }))).toBe("");
  });
});
