import { useCallback, useEffect, useRef, useState } from "react";
import type { Annotation, PinPosition } from "./annotation-types";

/**
 * Resolves screen positions for the annotation pins on the current route.
 * Static pins (simple-pin / sketch) use their stored page coordinates; element
 * pins are re-located by selector each pass, falling back to captured
 * coordinates when the element is gone.
 *
 * Replaces the old 1.5s polling loop with scroll/resize listeners plus a
 * MutationObserver, all debounced through requestAnimationFrame, so it only
 * recomputes when the DOM or viewport actually moves.
 */
export function usePinPositions(annotations: Annotation[], pathname: string, enabled: boolean) {
  const [positions, setPositions] = useState<Record<string, PinPosition>>({});
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;
  const rafRef = useRef<number | null>(null);

  const compute = useCallback(() => {
    const next: Record<string, PinPosition> = {};

    for (const anno of annotationsRef.current) {
      if (anno.route !== pathname) {
        next[anno.id] = { top: 0, left: 0, visible: false };
        continue;
      }

      if (
        (anno.elementTag === "simple-pin" || anno.elementTag === "sketch-layer") &&
        anno.pageX !== undefined &&
        anno.pageY !== undefined
      ) {
        next[anno.id] = { top: anno.pageY, left: anno.pageX, visible: true };
        continue;
      }

      let found = false;
      if (anno.selector) {
        try {
          const el = document.querySelector(anno.selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              next[anno.id] = {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                visible: true,
              };
              found = true;
            }
          }
        } catch {}
      }

      if (!found) {
        const fallbackTop =
          anno.pageY !== undefined
            ? anno.pageY
            : anno.elementRect
              ? anno.elementRect.top + (anno.scrollTop || 0)
              : 0;
        const fallbackLeft =
          anno.pageX !== undefined
            ? anno.pageX
            : anno.elementRect
              ? anno.elementRect.left + (anno.scrollLeft || 0)
              : 0;
        next[anno.id] = { top: fallbackTop, left: fallbackLeft, visible: true };
      }
    }

    setPositions(next);
  }, [pathname]);

  const schedule = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      compute();
    });
  }, [compute]);

  useEffect(() => {
    if (!enabled) return;

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // A couple of settle passes cover route transitions / async layout.
    const t1 = setTimeout(schedule, 150);
    const t2 = setTimeout(schedule, 500);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, pathname, schedule]);

  // Recompute immediately when the annotation set changes.
  useEffect(() => {
    if (enabled) schedule();
  }, [annotations, enabled, schedule]);

  return positions;
}
