import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StepIllustration, Flask } from "./step-illustrations";

describe("step illustrations at their actual display size", () => {
  it("renders crisp decorative symbols with explicit dimensions at small sizes", () => {
    const mix = renderToStaticMarkup(createElement(StepIllustration, { stepId: "mix", size: 24 }));
    expect(mix).toContain('width="24" height="24"');
    expect(mix).toContain('aria-hidden="true"');
    expect(mix).toContain('focusable="false"');
    expect(mix).not.toContain("<img");
    const flask = renderToStaticMarkup(createElement(Flask, { size: 18 }));
    expect(flask).toContain('width="18" height="18"');
    expect(flask).not.toContain("<img");
  });

  it("does not show a wood oven or rising dough for unrelated actions, even at large size", () => {
    for (const visual of ["fry", "oil", "rest", "proof_pan", "prep", "bake", "preheat"] as const) {
      const html = renderToStaticMarkup(createElement(StepIllustration, { stepId: "unused", visual, size: 120 }));
      expect(html).toContain(`data-step-visual="${visual}"`);
      expect(html).not.toContain("<img");
    }
    const mix = renderToStaticMarkup(createElement(StepIllustration, { stepId: "mix", size: 120 }));
    expect(mix).toContain("<img");
    expect(mix).toContain('alt=""');
  });
});
