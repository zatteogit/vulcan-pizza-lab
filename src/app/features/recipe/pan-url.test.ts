import { describe, expect, it } from "vitest";
import { decodePan, encodePan } from "./pan-url";

describe("teglia nel link (audit totale n. 16)", () => {
  it("andata e ritorno", () => {
    const pan = { panShape: "rectangular" as const, panLength: 60, panWidth: 40, thickness: 0.6 };
    expect(decodePan(encodePan(pan))).toEqual({ ...pan, panDiameter: undefined });
  });
  it("valori fuori misura scartati", () => {
    expect(decodePan("r:9999:40::")?.panLength).toBeUndefined();
    expect(decodePan("")).toBeNull();
  });
});
