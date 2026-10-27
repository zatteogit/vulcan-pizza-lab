import { afterEach, describe, expect, it, vi } from "vitest";
import { monitorVisualQuality } from "./visual-quality-monitor";

function host() {
  vi.useFakeTimers();
  let now = 0;
  let nextId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const viewport = new EventTarget();
  const win = Object.assign(new EventTarget(), { visualViewport: viewport, setTimeout, clearTimeout });
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", doc);
  vi.stubGlobal("performance", { now: () => now });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { const id = ++nextId; frames.set(id, cb); return id; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  return { doc, viewport, frames,
    timers(ms: number) { now += ms; vi.advanceTimersByTime(ms); },
    tick(ms: number, count: number, interacting = false) {
      for (let i = 0; i < count; i++) {
        now += ms;
        if (interacting) doc.dispatchEvent(new Event("scroll"));
        const pending = [...frames.values()]; frames.clear();
        pending.forEach(cb => cb(now));
      }
    },
  };
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("visual quality browser lifecycle", () => {
  it("ends its bounded warm sample and creates no permanent idle loop", () => {
    const h = host(); const change = vi.fn(); const close = monitorVisualQuality(change);
    expect(h.frames.size).toBe(0);
    h.timers(1800); h.tick(1000 / 60, 150);
    expect(h.frames.size).toBe(0);
    h.timers(60_000);
    expect(h.frames.size).toBe(0);
    expect(change).not.toHaveBeenCalled(); close();
  });
  it("publishes a downgrade only after sustained interaction stalls", () => {
    const h = host(); const change = vi.fn(); const close = monitorVisualQuality(change);
    h.timers(1800); h.tick(1000 / 60, 75, true);
    h.tick(50, 50, true);
    expect(change).toHaveBeenCalledExactlyOnceWith("reduced"); close();
  });
  it("cancels hidden-tab samples and recalibrates when visible", () => {
    const h = host(); const change = vi.fn(); const close = monitorVisualQuality(change);
    h.timers(1800); h.tick(1000 / 60, 75, true);
    h.doc.hidden = true; h.doc.dispatchEvent(new Event("visibilitychange"));
    expect(h.frames.size).toBe(0);
    h.tick(500, 10, true); expect(change).not.toHaveBeenCalled();
    h.doc.hidden = false; h.doc.dispatchEvent(new Event("visibilitychange"));
    h.timers(800); h.tick(1000 / 30, 75, true);
    expect(change).not.toHaveBeenCalled(); close();
  });
  it("drops samples on viewport changes and removes every listener on cleanup", () => {
    const h = host(); const close = monitorVisualQuality(vi.fn());
    h.timers(1800); expect(h.frames.size).toBe(1);
    h.viewport.dispatchEvent(new Event("resize")); expect(h.frames.size).toBe(0);
    close(); h.timers(5000);
    for (const type of ["scroll", "pointerdown", "keydown", "visibilitychange"]) h.doc.dispatchEvent(new Event(type));
    h.timers(5000); expect(h.frames.size).toBe(0);
  });
});
