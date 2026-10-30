import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "../public/media/catalog.json";

describe("reviewed photo archive", () => {
  it("retains every original byte-for-byte alongside the selected version", () => {
    const slots = Object.keys(manifest.active);
    expect(slots).toHaveLength(26);
    for (const slot of slots) {
      const versions = manifest.versions.filter(v => v.slot === slot);
      expect(versions).toHaveLength(2);
      const original = versions.find(v => v.label === "Precedente")!;
      expect(readFileSync("public" + original.src).equals(readFileSync("src/assets/" + slot))).toBe(true);
      const selected = versions.find(v => v.id === manifest.active[slot as keyof typeof manifest.active]);
      expect(selected).toBeDefined();
      expect(selected!.id).not.toBe(original.id);
    }
  });
  it("uses immutable hash URLs, keeps responsive images, and contains no unreferenced files", () => {
    const used = new Set<string>();
    for (const version of manifest.versions) {
      expect(version.smallWidth).toBeLessThanOrEqual(640);
      expect(version.width).toBeLessThanOrEqual(1280);
      for (const url of [version.src, version.smallSrc]) {
        const bytes = readFileSync("public" + url);
        expect(url).toBe("/media/photos/" + createHash("sha256").update(bytes).digest("hex") + ".webp");
        used.add(url.split("/").pop()!);
      }
    }
    expect([...used].sort()).toEqual(readdirSync("public/media/photos").sort());
  });
});
