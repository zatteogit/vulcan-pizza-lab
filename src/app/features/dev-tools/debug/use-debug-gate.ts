import { useCallback, useEffect, useState } from "react";

const ENABLED_KEY = "vulcan_debug_overlay_enabled";
// Triple-tap arms the debugger only inside this top-left hot corner, so a normal
// user tapping around the UI can't accidentally summon the dev overlay. It is a
// generous square: on notched phones (viewport-fit=cover) the top ~50px render
// UNDER the status bar and the OS eats taps there, so a tiny 64px corner sat
// almost entirely in dead space — the gesture stopped registering. We both
// enlarge the square AND offset it below env(safe-area-inset-top).
const HOT_CORNER_PX = 100;
// Max gap between taps of the triple-tap. Aiming for a small corner makes a
// deliberate human triple-tap noticeably slower than a synthetic one, so keep
// this generous — any pause longer than this simply resets the counter.
const TRIPLE_TAP_WINDOW_MS = 700;

/** Height of the top safe-area inset (iOS status bar / notch) in CSS px.
 *  Taps in that band are captured by the OS, so the hot corner must start
 *  below it. Measured from env(safe-area-inset-top); 0 where unsupported. */
function readSafeAreaTop(): number {
  try {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    return Number.isFinite(h) ? h : 0;
  } catch {
    return 0;
  }
}

/**
 * Lightweight always-mounted gate for the AI debugger. Owns only the enable
 * flag (persisted), the global activation shortcuts, and the toast channel —
 * the heavy interactive workspace is lazy-loaded only once `isEnabled` is true,
 * so shipped bundles pay almost nothing for users who never open it.
 */
export function useDebugGate() {
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return localStorage.getItem(ENABLED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2000);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ENABLED_KEY, String(next));
      } catch {}
      showToast(next ? "AI Debugger Abilitato" : "AI Debugger Disabilitato");
      return next;
    });
  }, [showToast]);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const isAltA = e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A" || e.code === "KeyA");
      const isShiftX =
        (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "x" || e.key === "X" || e.code === "KeyX");
      if (isAltA || isShiftX) {
        e.preventDefault();
        toggle();
      }
    };

    // Refreshed on mount + orientation/resize: the inset changes when the
    // device rotates, so the hot corner tracks the current status-bar height.
    let safeAreaTop = readSafeAreaTop();
    const refreshSafeArea = () => {
      safeAreaTop = readSafeAreaTop();
    };

    let lastTap = 0;
    let tapCount = 0;
    let replayTimer: number | null = null;
    let replayTarget: HTMLElement | null = null;
    const clearReplay = () => {
      if (replayTimer !== null) window.clearTimeout(replayTimer);
      replayTimer = null;
      replayTarget = null;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      /* Il vertice parte SOTTO la safe-area: su iPhone col notch il contenuto
       * scorre sotto la status bar, quindi il vero angolo visibile che l'utente
       * tocca sta a y ≈ safeAreaTop..(safeAreaTop+100), non a 0..64. */
      const inHotCorner =
        !!touch &&
        touch.clientX < HOT_CORNER_PX &&
        touch.clientY < safeAreaTop + HOT_CORNER_PX;
      if (!inHotCorner) {
        tapCount = 0;
        clearReplay();
        return;
      }

      /* Alcune pagine mostrano un pulsante flottante (es. "indietro" su
       * /recipe) proprio in questo angolo: senza questa esclusione il primo
       * tocco navigava via prima che i 3 tocchi potessero completarsi.
       * Sospendiamo il default e lo "ripetiamo" se non è un triplo-tap, così
       * il pulsante resta invariato per chi tocca una volta sola. */
      const target = touch.target as HTMLElement | null;
      const isDebugUi = !!target?.closest("#vulcan-debug-ui, .vulcan-debug-exclude");
      const interactiveTarget = isDebugUi
        ? null
        : (target?.closest("a,button,[role='button']") as HTMLElement | null);
      if (interactiveTarget) e.preventDefault();

      const now = Date.now();
      tapCount = now - lastTap < TRIPLE_TAP_WINDOW_MS ? tapCount + 1 : 1;
      lastTap = now;

      clearReplay();
      if (tapCount >= 3) {
        tapCount = 0;
        toggle();
        return;
      }
      if (interactiveTarget) {
        replayTarget = interactiveTarget;
        replayTimer = window.setTimeout(() => {
          replayTarget?.click();
          replayTimer = null;
          replayTarget = null;
        }, TRIPLE_TAP_WINDOW_MS);
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    // passive:false — chiamiamo preventDefault() quando il tocco cade su un
    // pulsante reale nell'angolo (vedi replay sopra).
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("resize", refreshSafeArea, { passive: true });
    window.addEventListener("orientationchange", refreshSafeArea, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", refreshSafeArea);
      window.removeEventListener("orientationchange", refreshSafeArea);
      clearReplay();
    };
  }, [toggle]);

  return { isEnabled, setIsEnabled, toast, showToast };
}
