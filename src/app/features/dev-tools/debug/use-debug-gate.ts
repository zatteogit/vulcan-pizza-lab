import { useCallback, useEffect, useRef, useState } from "react";

const ENABLED_KEY = "vulcan_debug_overlay_enabled";
// Triple-tap only arms the debugger inside this top-left hot corner, so a normal
// user tapping around the UI can't accidentally summon the dev overlay.
const HOT_CORNER_PX = 64;

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
      const inHotCorner = touch && touch.clientX < HOT_CORNER_PX && touch.clientY < HOT_CORNER_PX;
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
      tapCount = now - lastTap < 350 ? tapCount + 1 : 1;
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
        }, 350);
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
      window.removeEventListener("touchend", handleTouchEnd);
      clearReplay();
    };
  }, [toggle]);

  return { isEnabled, setIsEnabled, toast, showToast };
}
