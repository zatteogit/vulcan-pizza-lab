import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_COOK_ALERTS, createCookAlert, readCookAlerts, writeCookAlerts } from "./cook-alert";

function fakeAudio() {
  const oscillators: { freq: number; started: boolean }[] = [];
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const resume = vi.fn(async () => {});
  class FakeContext {
    state = "suspended";
    currentTime = 0;
    destination = {};
    resume = resume;
    createOscillator() {
      const osc = { frequency: param(), connect: vi.fn((node: unknown) => node), start: vi.fn(() => { entry.started = true; }), stop: vi.fn() };
      const entry = { get freq() { return osc.frequency.value; }, started: false };
      oscillators.push(entry);
      return osc;
    }
    createGain() {
      return { gain: param(), connect: vi.fn() };
    }
  }
  return { Ctor: FakeContext as unknown as new () => AudioContext, oscillators, resume };
}

afterEach(() => vi.unstubAllGlobals());

describe("segnale di fine fase (S10-B-04)", () => {
  it("vibra e suona alla fine di una fase", () => {
    const vibrate = vi.fn(() => true);
    const audio = fakeAudio();
    const alert = createCookAlert({ sound: true, vibrate: true }, { vibrate, AudioContext: audio.Ctor });
    alert.signal("end");
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect((vibrate.mock.calls[0] as unknown as [number[]])[0].length).toBeGreaterThan(1);
    expect(audio.oscillators.length).toBeGreaterThan(0);
    expect(audio.oscillators.every((o) => o.started)).toBe(true);
    expect(audio.resume).toHaveBeenCalled();
  });

  it("«gira» e «inizia» hanno segnali diversi dalla fine", () => {
    const vibrate = vi.fn(() => true);
    const alert = createCookAlert({ sound: false, vibrate: true }, { vibrate });
    alert.signal("turn");
    alert.signal("start");
    alert.signal("end");
    const patterns = vibrate.mock.calls.map((c) => JSON.stringify((c as unknown as [number[]])[0]));
    expect(new Set(patterns).size).toBe(3);
  });

  it("spento non vibra e non crea l'audio", () => {
    const vibrate = vi.fn(() => true);
    const audio = fakeAudio();
    const alert = createCookAlert({ sound: false, vibrate: false }, { vibrate, AudioContext: audio.Ctor });
    alert.prime();
    alert.signal("end");
    expect(vibrate).not.toHaveBeenCalled();
    expect(audio.oscillators).toHaveLength(0);
  });

  it("senza vibrazione né AudioContext non lancia", () => {
    const alert = createCookAlert({ sound: true, vibrate: true }, {});
    expect(() => { alert.prime(); alert.signal("end"); }).not.toThrow();
  });

  it("API che lanciano non rompono la pizzata", () => {
    const vibrate = vi.fn(() => { throw new Error("no"); });
    const Broken = class { constructor() { throw new Error("blocked"); } } as unknown as new () => AudioContext;
    const alert = createCookAlert({ sound: true, vibrate: true }, { vibrate, AudioContext: Broken });
    expect(() => alert.signal("end")).not.toThrow();
  });

  it("preferenza: default della decisione, poi quella salvata; storage negato non lancia", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    expect(readCookAlerts()).toBe(DEFAULT_COOK_ALERTS);
    writeCookAlerts(false);
    expect(readCookAlerts()).toBe(false);
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } });
    expect(readCookAlerts()).toBe(DEFAULT_COOK_ALERTS);
    expect(() => writeCookAlerts(true)).not.toThrow();
  });
});
