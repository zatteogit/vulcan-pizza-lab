import { useCallback, useLayoutEffect, useRef } from "react";

/** Move only enough to reveal the panel. A long panel starts below its trigger
 * rather than scrolling past it in an attempt to show an impossible whole. */
export function disclosureScrollDelta({ anchorTop, contentBottom, top, bottom }: {
  anchorTop: number; contentBottom: number; top: number; bottom: number;
}): number {
  if (anchorTop < top) return anchorTop - top;
  return Math.min(Math.max(0, contentBottom - bottom), anchorTop - top);
}

function readingViewport() {
  const viewport = window.visualViewport;
  const style = getComputedStyle(document.documentElement);
  const gutter = parseFloat(style.fontSize);
  const offset = viewport?.offsetTop ?? 0;
  let top = offset + (parseFloat(style.scrollPaddingTop) || 0);
  let bottom = offset + (viewport?.height ?? window.innerHeight) - gutter;
  // Measure the actual chrome, including the desktop sticky tabs and mobile
  // safe-area/dock geometry. No browser sniffing or fixed header offsets.
  document.querySelectorAll<HTMLElement>(".recipe-view-toolbar, .section-tabs-wrap--sticky").forEach(element => {
    const rect = element.getBoundingClientRect();
    const css = getComputedStyle(element);
    if (rect.height && css.visibility !== "hidden" && rect.top <= offset + (parseFloat(css.top) || 0) + 1) {
      top = Math.max(top, rect.bottom + gutter);
    }
  });
  document.querySelectorAll<HTMLElement>(".section-tabs-dock, .app-shell-dock").forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.height && element.dataset.keyboardOpen !== "true" && rect.top > top) bottom = Math.min(bottom, rect.top - gutter);
  });
  return { top, bottom };
}

/** The disclosure's height animation drives the page as well: one trajectory,
 * no delayed scrollIntoView and no second animation chasing a moving target.
 * Only an explicit opening arms it; any new user gesture gives control back. */
export function useDisclosureScroll(expanded: boolean) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const armed = useRef(false);
  const frame = useRef(0);
  const movement = useRef<{ start: number; delta: number; height: number } | null>(null);
  const dispose = useRef<(() => void) | undefined>();
  const cancel = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    armed.current = false;
    movement.current = null;
    dispose.current?.();
    dispose.current = undefined;
  }, []);
  const prepare = useCallback(() => {
    cancel();
    armed.current = true;
    const key = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab", "Escape", "Enter"].includes(event.key)) cancel();
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel, { passive: true });
    window.addEventListener("keydown", key);
    window.addEventListener("resize", cancel);
    window.visualViewport?.addEventListener("resize", cancel);
    dispose.current = () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", cancel);
      window.visualViewport?.removeEventListener("resize", cancel);
    };
  }, [cancel]);

  useLayoutEffect(() => {
    if (!expanded) { cancel(); return; }
    const anchor = anchorRef.current;
    const content = contentRef.current;
    if (!armed.current || !anchor || !content) return;
    const viewport = readingViewport();
    let anchorTop = anchor.getBoundingClientRect().top;
    const height = content.scrollHeight;
    const contentBottom = content.getBoundingClientRect().top + height;
    const title = anchor.closest(".procedure-timeline-step")?.querySelector(".procedure-timeline-step__title");
    const titleTop = title?.getBoundingClientRect().top;
    // Keep the phase title too when it fits; otherwise prioritise the toggle.
    if (titleTop !== undefined && titleTop >= viewport.top && contentBottom - titleTop <= viewport.bottom - viewport.top) anchorTop = titleTop;
    movement.current = { start: window.scrollY, height,
      delta: disclosureScrollDelta({ anchorTop, contentBottom, ...viewport }) };
    return cancel;
  }, [expanded, cancel]);

  const follow = useCallback((height: number | string) => {
    const move = movement.current;
    if (!move || !move.delta || !move.height) return;
    const renderedHeight = typeof height === "number" ? height : parseFloat(height);
    if (!Number.isFinite(renderedHeight)) return;
    const progress = Math.min(1, Math.max(0, renderedHeight / move.height));
    const top = move.start + move.delta * progress;
    // Integer scroll coordinates and the spring's settling tail need no work.
    if (Math.abs(top - window.scrollY) > 1) window.scrollTo({ top, behavior: "instant" });
  }, []);
  const complete = useCallback(() => {
    // Motion may complete a zero-duration reveal before writing height:auto.
    // Wait for that commit so the browser cannot clamp to the collapsed page.
    frame.current = requestAnimationFrame(() => {
      if (movement.current) follow(movement.current.height);
      cancel();
    });
  }, [cancel, follow]);
  return { anchorRef, contentRef, prepare, follow, complete };
}
