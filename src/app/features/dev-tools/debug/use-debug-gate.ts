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
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const inHotCorner = touch && touch.clientX < HOT_CORNER_PX && touch.clientY < HOT_CORNER_PX;
      if (!inHotCorner) {
        tapCount = 0;
        return;
      }
      const now = Date.now();
      if (now - lastTap < 350) {
        tapCount++;
        if (tapCount >= 3) {
          toggle();
          tapCount = 0;
        }
      } else {
        tapCount = 1;
      }
      lastTap = now;
    };

    window.addEventListener("keydown", handleGlobalKeys);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [toggle]);

  return { isEnabled, setIsEnabled, toast, showToast };
}
