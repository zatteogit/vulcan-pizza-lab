import { afterEach, describe, expect, it, vi } from "vitest";
import { copyRecipeLink, shareRecipeLink } from "./recipe-sharing";
const url = "https://example.test/recipe/tonda_romana?mode=adapted&n=4&pan=r%3A60%3A40";
afterEach(() => vi.unstubAllGlobals());
describe("native recipe sharing", () => {
  it("passes the complete link and title to the native share handler", async () => {
    const share = vi.fn().mockResolvedValue(undefined); vi.stubGlobal("navigator", { share });
    expect(await shareRecipeLink(url, "Come piace a Mario")).toBe("opened");
    expect(share).toHaveBeenCalledExactlyOnceWith({ url, title: "Come piace a Mario" });
  });
  it("does not silently copy when the native panel is cancelled", async () => {
    const writeText = vi.fn(); vi.stubGlobal("navigator", { share: vi.fn().mockRejectedValue({ name: "AbortError" }), clipboard: { writeText } });
    expect(await shareRecipeLink(url, "Pizza")).toBe("cancelled"); expect(writeText).not.toHaveBeenCalled();
  });
  it.each([{}, { share: vi.fn().mockRejectedValue({ name: "NotAllowedError" }) }])("reports unsupported or denied native sharing", async navigator => {
    vi.stubGlobal("navigator", navigator); expect(await shareRecipeLink(url, "Pizza")).toBe("unavailable");
  });
  it("does not call share when the browser rejects the payload", async () => {
    const share = vi.fn(); vi.stubGlobal("navigator", { share, canShare: () => false });
    expect(await shareRecipeLink(url, "Pizza")).toBe("unavailable"); expect(share).not.toHaveBeenCalled();
  });
  it("confirms copying only after the browser resolves the write", async () => {
    let resolve!: () => void; const writeText = vi.fn(() => new Promise<void>(r => { resolve = r; }));
    vi.stubGlobal("navigator", { clipboard: { writeText } }); const result = copyRecipeLink(url);
    expect(writeText).toHaveBeenCalledExactlyOnceWith(url); resolve(); expect(await result).toBe(true);
  });
  it.each([{}, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } }])("leaves unavailable clipboard access for manual copying", async navigator => {
    vi.stubGlobal("navigator", navigator); expect(await copyRecipeLink(url)).toBe(false);
  });
});
