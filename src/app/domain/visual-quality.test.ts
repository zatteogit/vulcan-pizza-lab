import { describe, expect, it } from "vitest";
import { VisualQualityPolicy } from "./visual-quality";

const healthy = (ms = 1000 / 60) => Array.from({ length: 60 }, () => ms);
const struggling = (ms = 1000 / 60) => [...healthy(ms).slice(0, 20), ...healthy(ms * 3).slice(0, 20)];

describe("adaptive visual quality", () => {
  it.each([30, 60, 90, 120, 144])("does not downgrade steady %i Hz cadence", hz => {
    const policy = new VisualQualityPolicy();
    for (let i = 0; i < 10; i++) expect(policy.observe(healthy(1000 / hz), i * 1000)).toBe("full");
  });
  it.each([60, 120])("detects repeated missed frames relative to %i Hz", hz => {
    const policy = new VisualQualityPolicy();
    policy.observe(healthy(1000 / hz), 1000);
    expect(policy.observe(struggling(1000 / hz), 2000)).toBe("full");
    expect(policy.observe(struggling(1000 / hz), 3000)).toBe("reduced");
  });
  it("ignores isolated stalls and requires consecutive bad windows", () => {
    const policy = new VisualQualityPolicy();
    policy.observe(healthy(), 1000);
    expect(policy.observe([...healthy(), 200], 2000)).toBe("full");
    policy.observe(struggling(), 3000);
    policy.observe(healthy(), 4000);
    expect(policy.observe(struggling(), 5000)).toBe("full");
  });
  it("resets incomplete evidence after a tab or viewport change", () => {
    const policy = new VisualQualityPolicy();
    policy.observe(healthy(), 1000);
    policy.observe(struggling(), 2000);
    policy.resetEvidence();
    expect(policy.observe(healthy(1000 / 30), 3000)).toBe("full");
  });
  it("does not infer quality from empty, invalid or sparse samples", () => {
    const policy = new VisualQualityPolicy();
    policy.observe(healthy(), 1000);
    policy.observe(struggling(), 2000);
    policy.observe([NaN, -1, Infinity, 3000], 3000);
    expect(policy.observe(struggling(), 4000)).toBe("full");
  });
  it("waits for eight healthy windows and a minute before one recovery trial", () => {
    const policy = new VisualQualityPolicy();
    policy.observe(healthy(), 1000);
    policy.observe(struggling(), 2000);
    policy.observe(struggling(), 3000);
    for (let i = 0; i < 8; i++) expect(policy.observe(healthy(), 4000 + i * 1000)).toBe("reduced");
    expect(policy.observe(healthy(), 63_000)).toBe("full");
    policy.observe(struggling(), 64_000);
    expect(policy.observe(struggling(), 65_000)).toBe("reduced");
    for (let i = 0; i < 12; i++) expect(policy.observe(healthy(), 130_000 + i * 1000)).toBe("reduced");
  });
});
