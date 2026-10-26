import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SelectionMark } from "./SelectionMark";
import { Chip } from "./Chip";

describe("persistent selection spacing", () => {
  it("keeps the same decorative marker structure in both states", () => {
    const active = renderToStaticMarkup(createElement(SelectionMark, { active: true }));
    const inactive = renderToStaticMarkup(createElement(SelectionMark, { active: false }));
    expect(active.replace(" ds-selection-mark--active", "")).toBe(inactive);
    expect(inactive).toContain('aria-hidden="true"');
    expect(inactive).toContain("ds-selection-mark__check");
  });

  it("keeps fallback icons mounted while replacing them with the check", () => {
    for (const active of [true, false]) {
      const html = renderToStaticMarkup(createElement(Chip, {
        active, label: "test", onToggle() {}, icon: createElement("svg", { "data-test-icon": true }),
      }));
      expect(html).toContain('type="button"');
      expect(html).toContain(`aria-pressed="${active}"`);
      expect(html).toContain("ds-selection-mark__icon");
      expect(html).toContain("ds-selection-mark__check");
    }
  });
});
