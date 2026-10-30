import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BakeRoundsTimer } from "./bake-rounds-timer";
import { CookSessionProvider } from "./cook-session";

const render = (props: Parameters<typeof BakeRoundsTimer>[0]) =>
  renderToStaticMarkup(createElement(CookSessionProvider, null, createElement(BakeRoundsTimer, props)));

/* Proposta a Matteo del 29/10 (G4a-WP-02): una pizza sola ha «Inforna» con il
   conto alla rovescia, senza «Cottura 1 di 1». */
describe("timer di cottura", () => {
  it("una pizza sola: «Inforna», senza contatore dei giri", () => {
    const html = render({ rounds: 1, roundSec: 90 });
    expect(html).toContain("Inforna");
    expect(html).not.toContain("1 di 1");
    expect(html).toContain("La cottura dura circa");
  });
  it("più pizze: contatore e «Inforna (1 di 3)» come prima", () => {
    const html = render({ rounds: 3, roundSec: 90 });
    expect(html).toContain("Cottura 1 di 3");
    expect(html).toContain("Inforna (1 di 3)");
  });
  it("frittura di una pizza sola: «Immergi»", () => {
    const html = render({ rounds: 1, roundSec: 60, variant: "fry" });
    expect(html).toContain("Immergi");
    expect(html).not.toContain("1 di 1");
  });
});
