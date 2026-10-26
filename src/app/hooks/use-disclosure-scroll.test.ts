import { describe, expect, it } from "vitest";
import { disclosureScrollDelta } from "./use-disclosure-scroll";

describe("disclosure reading window", () => {
  const viewport = { top: 100, bottom: 600 };
  it("leaves an already readable panel in place", () => {
    expect(disclosureScrollDelta({ ...viewport, anchorTop: 250, contentBottom: 550 })).toBe(0);
  });
  it("reveals only the clipped part above the mobile dock", () => {
    expect(disclosureScrollDelta({ ...viewport, anchorTop: 400, contentBottom: 730 })).toBe(130);
  });
  it("keeps the trigger visible for details taller than the viewport", () => {
    expect(disclosureScrollDelta({ ...viewport, anchorTop: 400, contentBottom: 1100 })).toBe(300);
  });
  it("recovers a trigger covered by the sticky tabs", () => {
    expect(disclosureScrollDelta({ ...viewport, anchorTop: 70, contentBottom: 500 })).toBe(-30);
  });
  it("does not scroll past a trigger already at the reading edge", () => {
    expect(disclosureScrollDelta({ ...viewport, anchorTop: 100, contentBottom: 1100 })).toBe(0);
  });
  it("uses the actual visual viewport when browser chrome reduces the space", () => {
    expect(disclosureScrollDelta({ top: 140, bottom: 470, anchorTop: 350, contentBottom: 550 })).toBe(80);
  });
});
