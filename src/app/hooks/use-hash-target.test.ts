import { describe, expect, it } from "vitest";
import { hashTargetId, revealWhenStable, type RevealEnv } from "./use-hash-target";

/** Fotogrammi manuali: ogni `tick()` esegue la callback in coda. */
function fakeEnv(tops: (number | null)[], reducedMotion = false) {
  const queue: (() => void)[] = [];
  const scrolls: ScrollIntoViewOptions[] = [];
  const focuses: (FocusOptions | undefined)[] = [];
  let frame = 0;
  const env: RevealEnv = {
    getElement: () => {
      const top = tops[Math.min(frame, tops.length - 1)];
      return top === null
        ? null
        : { getBoundingClientRect: () => ({ top }), scrollIntoView: (o) => scrolls.push(o) };
    },
    getFocusElement: () => ({ focus: (o) => focuses.push(o) }),
    frame: (cb) => { queue.push(cb); return queue.length; },
    cancelFrame: () => { queue.length = 0; },
    reducedMotion,
    maxFrames: 10,
  };
  const tick = () => { const cb = queue.shift(); cb?.(); frame += 1; };
  return { env, tick, scrolls, focuses, queue };
}

describe("hashTargetId", () => {
  it("reads the id, with or without a prefix", () => {
    expect(hashTargetId("#w_alveograph")).toBe("w_alveograph");
    expect(hashTargetId("#pf-poolish", "pf-")).toBe("poolish");
    expect(hashTargetId("#other", "pf-")).toBeNull();
    expect(hashTargetId("")).toBeNull();
    expect(hashTargetId("#%E2%82%81")).toBe("₁");
  });
});

describe("revealWhenStable (deep link)", () => {
  it("waits for the entry to exist and stop moving, then scrolls to the start and focuses the title", () => {
    const { env, tick, scrolls, focuses } = fakeEnv([null, null, 1800, 1400, 1400]);
    revealWhenStable("glossary-q10", "glossary-q10-toggle", env);
    for (let i = 0; i < 4; i++) tick();
    expect(scrolls).toEqual([]);
    tick();
    expect(scrolls).toEqual([{ behavior: "smooth", block: "start" }]);
    expect(focuses).toEqual([{ preventScroll: true }]);
  });

  it("scrolls without animation under reduced motion", () => {
    const { env, tick, scrolls } = fakeEnv([500, 500], true);
    revealWhenStable("x", undefined, env);
    tick(); tick();
    expect(scrolls).toEqual([{ behavior: "auto", block: "start" }]);
  });

  it("gives up quietly when the entry never appears", () => {
    const { env, tick, scrolls, queue } = fakeEnv([null]);
    revealWhenStable("missing", "missing-toggle", env);
    for (let i = 0; i < 12; i++) tick();
    expect(scrolls).toEqual([]);
    expect(queue).toHaveLength(0);
  });

  it("still lands on an entry that keeps moving once the wait is over", () => {
    const { env, tick, scrolls } = fakeEnv(Array.from({ length: 20 }, (_, i) => i * 10));
    revealWhenStable("x", undefined, env);
    for (let i = 0; i < 10; i++) tick();
    expect(scrolls).toHaveLength(1);
  });

  it("does nothing after cancel (the user navigated away)", () => {
    const { env, tick, scrolls } = fakeEnv([300, 300]);
    const cancel = revealWhenStable("x", undefined, env);
    cancel();
    tick(); tick();
    expect(scrolls).toEqual([]);
  });
});
