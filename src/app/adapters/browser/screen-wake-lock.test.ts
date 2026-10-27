import { afterEach, describe, expect, it, vi } from "vitest";
import { createScreenWakeLock } from "./screen-wake-lock";
class Sentinel extends EventTarget {
  released = false;
  release = vi.fn(async () => { this.released = true; this.dispatchEvent(new Event("release")); });
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function host(request?: ReturnType<typeof vi.fn>) {
  const doc = Object.assign(new EventTarget(), { hidden: false });
  vi.stubGlobal("document", doc); vi.stubGlobal("navigator", request ? { wakeLock: { request } } : {});
  const state = vi.fn(); const controller = createScreenWakeLock(state);
  return { doc, state, controller, visibility(hidden: boolean) { doc.hidden = hidden; doc.dispatchEvent(new Event("visibilitychange")); } };
}
afterEach(() => vi.unstubAllGlobals());
describe("screen wake lock ownership", () => {
  it("reports unsupported browsers without throwing", () => {
    const h = host(); h.controller.setEnabled(true); expect(h.state).toHaveBeenLastCalledWith("unsupported"); h.controller.dispose();
  });
  it("owns one lock and releases it when disabled", async () => {
    const lock = new Sentinel(); const request = vi.fn().mockResolvedValue(lock); const h = host(request);
    h.controller.setEnabled(true); await flush(); h.controller.retry(); h.controller.setEnabled(true);
    expect(request).toHaveBeenCalledExactlyOnceWith("screen"); expect(h.state).toHaveBeenLastCalledWith("active");
    h.controller.setEnabled(false); expect(lock.release).toHaveBeenCalledTimes(1); expect(h.state).toHaveBeenLastCalledWith("off"); h.controller.dispose();
  });
  it("releases a request that resolves after the view was closed", async () => {
    let grant!: (s: Sentinel) => void; const request = vi.fn(() => new Promise<Sentinel>(r => { grant = r; })); const h = host(request);
    h.controller.setEnabled(true); h.controller.dispose(); const calls = h.state.mock.calls.length; const late = new Sentinel(); grant(late); await flush();
    expect(late.release).toHaveBeenCalledTimes(1); expect(h.state).toHaveBeenCalledTimes(calls);
  });
  it("does not leave a late grant alive after the user switches it off", async () => {
    let grant!: (s: Sentinel) => void; const h = host(vi.fn(() => new Promise<Sentinel>(r => { grant = r; })));
    h.controller.setEnabled(true); h.controller.setEnabled(false); const late = new Sentinel(); grant(late); await flush();
    expect(late.release).toHaveBeenCalledTimes(1); expect(h.state).toHaveBeenLastCalledWith("off"); h.controller.dispose();
  });
  it("reacquires once after returning from a hidden tab", async () => {
    const first = new Sentinel(), second = new Sentinel(); const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValue(second); const h = host(request);
    h.controller.setEnabled(true); await flush(); h.visibility(true); expect(first.release).toHaveBeenCalledTimes(1);
    expect(h.state).toHaveBeenLastCalledWith("paused"); h.visibility(false); h.visibility(false); await flush();
    expect(request).toHaveBeenCalledTimes(2); expect(h.state).toHaveBeenLastCalledWith("active"); h.controller.dispose(); expect(second.release).toHaveBeenCalledTimes(1);
  });
  it("serializes a hidden/visible change while a request is still pending", async () => {
    let grant!: (s: Sentinel) => void; const second = new Sentinel(); const request = vi.fn().mockImplementationOnce(() => new Promise<Sentinel>(r => { grant = r; })).mockResolvedValue(second); const h = host(request);
    h.controller.setEnabled(true); h.visibility(true); h.visibility(false); expect(request).toHaveBeenCalledTimes(1);
    const late = new Sentinel(); grant(late); await flush(); expect(late.release).toHaveBeenCalledTimes(1); expect(request).toHaveBeenCalledTimes(2); expect(h.state).toHaveBeenLastCalledWith("active"); h.controller.dispose();
  });
  it("reports a system release without fighting it with retries", async () => {
    const lock = new Sentinel(); const request = vi.fn().mockResolvedValue(lock); const h = host(request);
    h.controller.setEnabled(true); await flush(); await lock.release(); await flush();
    expect(h.state).toHaveBeenLastCalledWith("released"); expect(request).toHaveBeenCalledTimes(1); h.controller.dispose();
  });
  it("permits an explicit retry after denial and removes visibility listeners", async () => {
    const lock = new Sentinel(); const request = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(lock); const h = host(request);
    h.controller.setEnabled(true); await flush(); expect(h.state).toHaveBeenLastCalledWith("denied"); h.controller.retry(); await flush(); expect(h.state).toHaveBeenLastCalledWith("active");
    h.controller.dispose(); h.visibility(true); h.visibility(false); expect(request).toHaveBeenCalledTimes(2);
  });
});
