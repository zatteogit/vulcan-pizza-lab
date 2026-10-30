import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PreFermentCard } from "./pre-ferment-guide";
import { preFermentExample } from "../../domain/science/engine-facts";

/* G4b-WP-02 (S14-B-07): la card aperta dice come si fa, in passi numerati, e
 * che il sale entra solo nell'impasto finale; l'esempio su 1 kg di farina
 * compare solo nella guida (prop showExample), mai dentro una ricetta. */

const html = (props: Parameters<typeof PreFermentCard>[0]) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PreFermentCard, { open: true, ...props })));
const steps = (out: string) => [...(out.match(/<ol class="[^"]*preferment-guide-card__steps[^"]*">([\s\S]*?)<\/ol>/)?.[1] ?? "").matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);

describe("PreFermentCard — «Come si fa»", () => {
  it("biga: quattro passi in un <ol>, il sale nell'ultimo, con il «Perché?» della procedura", () => {
    const out = html({ preFermentType: "biga", headingLevel: 2 });
    const items = steps(out);
    expect(items).toHaveLength(4);
    expect(items[3]).toMatch(/sale/);
    expect(items.join(" ")).not.toMatch(/\{\w+\}/);
    expect(out).toContain("<h3 class=\"preferment-guide-card__tips-label\">Come si fa</h3>");
    expect(out).toContain("Perché: Come si preparano");
  });

  it("l'esempio su 1 kg: solo con showExample, con le dosi dello scorporo e il lievito come stima", () => {
    const ex = preFermentExample("biga");
    const out = html({ preFermentType: "biga", showExample: true });
    expect(out).toContain(`${ex.prefermentFlourG} g`);
    expect(out).toContain(`${ex.prefermentWaterG} g`);
    expect(out).toContain(`${ex.mainWaterG} g`);
    expect(out).toContain("Perché: Biga e poolish");
    expect(html({ preFermentType: "biga" })).not.toContain(`${ex.prefermentWaterG} g`);
    // L'autolisi non è un prefermento: niente esempio.
    const autolisi = html({ preFermentType: "autolisi", showExample: true });
    expect(steps(autolisi)).toHaveLength(3);
    expect(autolisi).not.toContain("Perché: Biga e poolish");
  });
});
