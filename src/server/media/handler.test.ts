import { describe, expect, it } from "vitest";
import { handleMediaRequest, type MediaStore, type PhotoVersion } from "./handler";

const oldPhoto: PhotoVersion = { id: "old", slot: "pizzas/pinsa.webp", label: "Prima", src: "/old.webp", smallSrc: "/old.webp", width: 1280, height: 853, smallWidth: 640, createdAt: 1 };
const newPhoto = { ...oldPhoto, id: "new", src: "/new.webp" };
function fixture(role: string | null = "admin") {
  let current = oldPhoto;
  const versions = [oldPhoto, newPhoto, { ...newPhoto, id: "other", slot: "pizzas/recco.webp" }];
  const store: MediaStore = {
    active: async () => [current], library: async () => versions,
    find: async id => versions.find(v => v.id === id) ?? null,
    async publish(slot, id, expected) {
      if (current.id !== expected) return false;
      current = versions.find(v => v.id === id && v.slot === slot)!;
      return true;
    },
  };
  const send = (path: string, data?: unknown, origin = "https://vulcan.example") => handleMediaRequest(new Request("https://vulcan.example/api/media/" + path, data === undefined ? {} : {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(data),
  }), { store, actor: async () => role ? { role } : null });
  return { send, store };
}
describe("shared photo CMS", () => {
  it("public visitors can read the active photos, but cannot read the CMS or publish", async () => {
    for (const role of [null, "user", "demo", "tester"]) {
      const { send } = fixture(role);
      expect((await send("active")).status).toBe(200);
      expect((await send("library")).status).toBe(403);
      expect((await send("publish", { slot: oldPhoto.slot, id: "new", expected: "old" })).status).toBe(403);
    }
  });
  it("publishes and restores while retaining every previous version", async () => {
    const { send, store } = fixture("editor");
    expect((await send("publish", { slot: oldPhoto.slot, id: "new", expected: "old" })).status).toBe(200);
    expect((await store.active())[0].id).toBe("new");
    expect((await send("publish", { slot: oldPhoto.slot, id: "old", expected: "new" })).status).toBe(200);
    expect((await store.active())[0].id).toBe("old");
    expect(await store.library()).toHaveLength(3);
  });
  it("rejects cross-origin writes, another slot's version, unknown versions and stale editors", async () => {
    const { send } = fixture();
    expect((await send("publish", { slot: oldPhoto.slot, id: "new", expected: "old" }, "https://attacker.example")).status).toBe(403);
    expect((await send("publish", { slot: oldPhoto.slot, id: "other", expected: "old" })).status).toBe(400);
    expect((await send("publish", { slot: oldPhoto.slot, id: "missing", expected: "old" })).status).toBe(400);
    expect((await send("publish", { slot: oldPhoto.slot, id: "new", expected: "stale" })).status).toBe(409);
  });
  it("rejects malformed and oversized requests, including untrusted chunked bodies", async () => {
    const { send } = fixture();
    expect((await send("publish", null)).status).toBe(400);
    expect((await send("publish", { slot: oldPhoto.slot, id: "new" })).status).toBe(400);
    expect((await send("publish", { extra: "x".repeat(5000) })).status).toBe(413);
  });
});
