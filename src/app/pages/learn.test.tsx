import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { LearnPage } from "./learn";

/* G4a-WP-04 (S11-A-10, S11-B-10, S11-B-13): la card del percorso è un
 * articolo con un solo link (nessun link dentro un link), dice cosa apre e
 * quanto dura, e il livello si cambia da qui. */

const html = (url = "/learn") =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(LearnPage)));

describe("LearnPage — card del percorso", () => {
  // useLayoutEffect sul server: avviso atteso di react-router, non del componente.
  beforeAll(() => { vi.spyOn(console, "error").mockImplementation(() => {}); });
  it("nessun link annidato in un altro link", () => {
    const out = html();
    // Fra l'apertura di ogni <a> e la sua chiusura non si apre un altro <a>.
    for (const m of out.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) expect(m[1]).not.toMatch(/<a\b/);
    expect(out).not.toContain("data-progress");
  });

  it("copy onesta: apre una ricetta, con durata dal motore e «Cambia livello»", () => {
    const out = html();
    expect(out).toContain("Apri la ricetta");
    expect(out).not.toContain("Inizia il percorso");
    expect(out).toMatch(/Circa \d+/);
    expect(out).toContain('href="/profile?tab=setup#skill"');
    expect(out).toMatch(/href="\/recipe\/[a-z_]+\?mode=adapted"/);
  });

  it("«Qualcosa non va?» nel primo schermo: un link per problema, che apre la sua scheda (G4a-WP-05)", () => {
    const out = html();
    const nav = out.match(/<nav data-region="quick-help"[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect(nav).toContain("Qualcosa non va?");
    for (const id of ["P01", "P04", "P07", "P09"]) expect(nav).toContain(`href="/learn/troubleshooting?issue=${id}"`);
    expect(nav).toContain("Impasto appiccicoso persistente");
    // Viene prima del percorso consigliato.
    expect(out.indexOf('data-region="quick-help"')).toBeLessThan(out.indexOf('data-region="feature"'));
  });
});

