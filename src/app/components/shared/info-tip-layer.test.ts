import { describe, expect, it } from "vitest";
import { establishesFixedContext, fixedPopoverAnchor, nextInOrder } from "./info-tip-layer";

const viewport = { width: 390, height: 844 };
const none = { transform: "none", perspective: "none", filter: "none", backdropFilter: "none", willChange: "auto", contain: "none", containerType: "normal" };

describe("TermLink popover position (FW-04)", () => {
  it("opens below the term, measured from the screen, when no dialog transforms it", () => {
    const { placement, vars } = fixedPopoverAnchor({ left: 150, top: 200, bottom: 220, width: 60 }, viewport, null);
    expect(placement).toBe("below");
    expect(vars["--tip-top"]).toBe("228px");
    // larghezza 253,5 (65% di 390), centrata sul termine e tenuta a 16 px dal bordo
    expect(parseFloat(vars["--tip-left"])).toBeCloseTo(180 - 253.5 / 2);
    // vicino al bordo resta a 16 px
    expect(fixedPopoverAnchor({ left: 4, top: 200, bottom: 220, width: 40 }, viewport, null).vars["--tip-left"]).toBe("16px");
  });

  it("opens above near the bottom of the screen", () => {
    const { placement, vars } = fixedPopoverAnchor({ left: 100, top: 700, bottom: 720, width: 60 }, viewport, null);
    expect(placement).toBe("above");
    expect(vars["--tip-bottom"]).toBe(`${844 - 692}px`);
  });

  it("converts to the frame of a transformed dialog, so it lands at the same spot on screen", () => {
    const frame = { left: 0, top: 300, height: 544 };
    const screen = fixedPopoverAnchor({ left: 100, top: 400, bottom: 420, width: 60 }, viewport, null);
    const inDialog = fixedPopoverAnchor({ left: 100, top: 400, bottom: 420, width: 60 }, viewport, frame);
    expect(parseFloat(inDialog.vars["--tip-top"])).toBe(parseFloat(screen.vars["--tip-top"]) - 300);
    const aboveScreen = fixedPopoverAnchor({ left: 100, top: 700, bottom: 720, width: 60 }, viewport, null);
    const aboveDialog = fixedPopoverAnchor({ left: 100, top: 700, bottom: 720, width: 60 }, viewport, frame);
    expect(aboveDialog.vars["--tip-bottom"]).toBe(aboveScreen.vars["--tip-bottom"]);
  });

  it("recognises the styles that make an ancestor the reference of fixed boxes", () => {
    expect(establishesFixedContext(none)).toBe(false);
    expect(establishesFixedContext({ ...none, transform: "matrix(1, 0, 0, 1, 0, 12)" })).toBe(true);
    expect(establishesFixedContext({ ...none, backdropFilter: "blur(8px)" })).toBe(true);
    expect(establishesFixedContext({ ...none, willChange: "transform, opacity" })).toBe(true);
    expect(establishesFixedContext({ ...none, contain: "paint" })).toBe(true);
    expect(establishesFixedContext({ ...none, containerType: "inline-size" })).toBe(true);
  });
});

describe("Tab out of the TermLink popover (FW-04)", () => {
  it("goes to the control after the term, skipping the popover's own link", () => {
    const order = ["close", "term", "glossary-link", "next"];
    expect(nextInOrder(order, "term", (item) => item === "glossary-link")).toBe("next");
    expect(nextInOrder(order, "next", () => false)).toBeNull();
    expect(nextInOrder(order, "missing", () => false)).toBeNull();
  });
});
