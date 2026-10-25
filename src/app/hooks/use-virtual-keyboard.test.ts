import { describe, expect, it } from "vitest";
import { viewportHasKeyboard } from "./use-virtual-keyboard";

describe("keyboard geometry without user-agent sniffing", () => {
  const base = { editing: true, baselineHeight: 844, layoutHeight: 844, visualHeight: 844 };
  it("detects an overlaid keyboard while editing", () => {
    expect(viewportHasKeyboard({ ...base, visualHeight: 510 })).toBe(true);
  });
  it("detects a keyboard that resizes the layout viewport", () => {
    expect(viewportHasKeyboard({ ...base, layoutHeight: 510, visualHeight: 510 })).toBe(true);
  });
  it("keeps navigation visible for browser chrome changes", () => {
    expect(viewportHasKeyboard({ ...base, visualHeight: 770 })).toBe(false);
    expect(viewportHasKeyboard({ ...base, editing: false, visualHeight: 510 })).toBe(false);
  });
  it("does not mistake pinch zoom for a keyboard", () => {
    expect(viewportHasKeyboard({ ...base, scale: 2, visualHeight: 422 })).toBe(false);
  });
  it("detects a keyboard even if Safari also zooms the focused editor", () => {
    expect(viewportHasKeyboard({ ...base, scale: 1.3, visualHeight: 350 })).toBe(true);
  });
  it("restores the dock after keyboard dismissal and handles landscape", () => {
    expect(viewportHasKeyboard(base)).toBe(false);
    expect(viewportHasKeyboard({ editing: true, baselineHeight: 390, layoutHeight: 390, visualHeight: 230 })).toBe(true);
  });
});
