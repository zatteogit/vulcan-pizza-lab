import { VisualQualityPolicy, type VisualQuality } from "../../domain/visual-quality";

/** One warm cadence sample, then bounded interaction samples; no permanent rAF loop, hardware
 * fingerprint, storage or network reporting. Hidden tabs contribute no data. */
export function monitorVisualQuality(onChange: (quality: VisualQuality) => void): () => void {
  const policy = new VisualQualityPolicy();
  let warmupTimer = 0;
  let frame = 0;
  let previous = 0;
  let started = 0;
  let activeUntil = 0;
  let intervals: number[] = [];
  let published: VisualQuality = "full";
  let warmUntil = performance.now() + 1800;

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = previous = started = 0;
    intervals = [];
  };
  const sample = (time: number) => {
    frame = 0;
    if (document.hidden || time > activeUntil) { stop(); return; }
    if (!started) started = time;
    if (previous) intervals.push(time - previous);
    previous = time;
    if (time - started >= 1000) {
      const quality = policy.observe(intervals, time);
      if (quality !== published) { published = quality; onChange(quality); }
      started = time;
      intervals = [];
    }
    frame = requestAnimationFrame(sample);
  };
  const activate = () => {
    const now = performance.now();
    if (document.hidden || now < warmUntil) return;
    activeUntil = now + 2400;
    if (!frame) frame = requestAnimationFrame(sample);
  };
  const reset = () => {
    stop();
    policy.resetEvidence();
    // Exclude tab restoration, orientation changes and keyboard relayout.
    warmUntil = performance.now() + 800;
    window.clearTimeout(warmupTimer);
    if (!document.hidden) warmupTimer = window.setTimeout(activate, 800);
  };
  warmupTimer = window.setTimeout(activate, 1800);
  document.addEventListener("scroll", activate, { passive: true, capture: true });
  document.addEventListener("pointerdown", activate, { passive: true });
  document.addEventListener("keydown", activate);
  document.addEventListener("visibilitychange", reset);
  window.addEventListener("resize", reset, { passive: true });
  window.visualViewport?.addEventListener("resize", reset, { passive: true });
  return () => {
    window.clearTimeout(warmupTimer);
    stop();
    document.removeEventListener("scroll", activate, { capture: true });
    document.removeEventListener("pointerdown", activate);
    document.removeEventListener("keydown", activate);
    document.removeEventListener("visibilitychange", reset);
    window.removeEventListener("resize", reset);
    window.visualViewport?.removeEventListener("resize", reset);
  };
}
