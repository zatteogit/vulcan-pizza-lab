import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DoughBlob } from "./dough-mascot";

/* FW-13 (S10-B-19): la mascotte «dough» era invisibile perché il TSX scriveva
 * inline `--blob-body: var(--blob-body)`, una custom property ciclica. */
describe("DoughBlob colours", () => {
  it("never sets a custom property that references itself", () => {
    for (const variant of ["stretch", "rise", "forge", "neural"] as const) {
      const html = renderToStaticMarkup(createElement(DoughBlob, { variant, animate: false }));
      for (const [, name, value] of html.matchAll(/(--[\w-]+):\s*([^;"]+)/g)) {
        expect(value, `${variant}: ${name}`).not.toContain(`var(${name})`);
      }
    }
  });
});
