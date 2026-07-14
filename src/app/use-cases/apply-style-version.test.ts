import { describe, expect, it, vi } from "vitest";
import { applyStyleVersion, type StyleVersionPort } from "./apply-style-version";
import type { StyleVersion } from "../data/style-versions";

describe("applyStyleVersion", () => {
  it("maps every version parameter to the state port", () => {
    const calls: Array<[string, unknown]> = [];
    const port = Object.fromEntries(
      [
        "onHydrationChange",
        "onFlourWChange",
        "onFlourPLChange",
        "onFermentHoursChange",
        "onFermentTempChange",
        "onPreFermentChange",
        "onVersionChange",
      ].map((name) => [name, vi.fn((value) => calls.push([name, value]))]),
    ) as unknown as StyleVersionPort;
    const version = {
      id: "test-version",
      label: "Test",
      emoji: "🧪",
      description: "Fixture",
      skill_hint: 1,
      params: {
        hydration_pct: 68,
        flour_w: 300,
        flour_pl: 0.55,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: true,
      },
    } satisfies StyleVersion;

    applyStyleVersion(version, port);

    expect(calls).toEqual([
      ["onHydrationChange", 68],
      ["onFlourWChange", 300],
      ["onFlourPLChange", 0.55],
      ["onFermentHoursChange", 24],
      ["onFermentTempChange", 4],
      ["onPreFermentChange", true],
      ["onVersionChange", "test-version"],
    ]);
  });
});
