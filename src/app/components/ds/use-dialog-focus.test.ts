import { describe, expect, it } from "vitest";
import { tabLoopTarget } from "./use-dialog-focus";

const base = { defaultPrevented: false, isTop: true, shiftKey: false, hasCandidates: true, insidePanel: true, atFirst: false, atLast: false };

describe("modal Tab loop", () => {
  it("wraps at the edges and pulls focus back into the panel", () => {
    expect(tabLoopTarget({ ...base, atLast: true })).toBe("first");
    expect(tabLoopTarget({ ...base, shiftKey: true, atFirst: true })).toBe("last");
    expect(tabLoopTarget({ ...base, insidePanel: false })).toBe("first");
    expect(tabLoopTarget({ ...base, hasCandidates: false })).toBe("panel");
    expect(tabLoopTarget(base)).toBeNull();
  });

  it("leaves a Tab already handled inside the dialog alone (TermLink into its popover, FW-04)", () => {
    expect(tabLoopTarget({ ...base, defaultPrevented: true, insidePanel: false })).toBeNull();
    expect(tabLoopTarget({ ...base, defaultPrevented: true, atLast: true })).toBeNull();
  });

  it("runs only on the top-most modal", () => {
    expect(tabLoopTarget({ ...base, isTop: false, insidePanel: false })).toBeNull();
  });
});
