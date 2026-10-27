export type ScreenLockState = "off" | "requesting" | "active" | "paused" | "released" | "denied" | "unsupported";
interface ScreenLock extends EventTarget { readonly released: boolean; release(): Promise<void> }

/** One in-flight request and one owned sentinel. A system release is reported,
 * not fought with automatic retries. Visibility return may reacquire the lock. */
export function createScreenWakeLock(onState: (state: ScreenLockState) => void) {
  const candidate = (navigator as Navigator & { wakeLock?: { request(type: "screen"): Promise<ScreenLock> } }).wakeLock;
  const api = typeof candidate?.request === "function" ? candidate : null;
  let enabled = false;
  let disposed = false;
  let pending = false;
  let generation = 0;
  let owned: { lock: ScreenLock; onRelease: () => void } | null = null;
  const publish = (state: ScreenLockState) => { if (!disposed) onState(state); };
  const release = (lock: ScreenLock) => { try { void lock.release().catch(() => {}); } catch { /* best effort */ } };
  const releaseOwned = () => {
    if (!owned) return;
    const { lock, onRelease } = owned; owned = null;
    lock.removeEventListener("release", onRelease); release(lock);
  };
  const request = () => {
    if (disposed || !enabled || pending || !api || document.hidden || owned) return;
    const attempt = generation; pending = true; publish("requesting");
    void (async () => {
      try {
        const lock = await api.request("screen");
        if (disposed || !enabled || document.hidden || attempt !== generation) { release(lock); return; }
        if (lock.released) { publish("released"); return; }
        const onRelease = () => {
          if (owned?.lock !== lock) return;
          lock.removeEventListener("release", onRelease); owned = null;
          publish(document.hidden ? "paused" : "released");
        };
        owned = { lock, onRelease }; lock.addEventListener("release", onRelease); publish("active");
      } catch { if (attempt === generation) publish("denied"); }
      finally {
        pending = false;
        if (attempt !== generation) request();
      }
    })();
  };
  const visibility = () => {
    if (document.hidden) {
      generation++; releaseOwned();
      if (enabled) publish("paused");
    } else if (enabled) request();
  };
  document.addEventListener("visibilitychange", visibility);
  publish(api ? "off" : "unsupported");
  return {
    setEnabled(value: boolean) {
      enabled = value; generation++;
      if (!api) { publish("unsupported"); return; }
      if (!enabled) { releaseOwned(); publish("off"); }
      else if (document.hidden) publish("paused");
      else if (owned) publish("active");
      else request();
    },
    retry: request,
    dispose() { disposed = true; enabled = false; generation++; document.removeEventListener("visibilitychange", visibility); releaseOwned(); },
  };
}
