import { useEffect, useState } from "react";

/** Browser chrome alone must not hide the dock. Require an editable focus and
 * a substantial viewport reduction; ignore pinch zoom. This also covers
 * Android browsers that resize the layout viewport instead of overlaying it. */
export function viewportHasKeyboard({ editing, baselineHeight, layoutHeight, visualHeight, scale = 1 }: {
  editing: boolean; baselineHeight: number; layoutHeight: number; visualHeight: number; scale?: number;
}): boolean {
  // Normalize visual zoom: pinch zoom alone does not reduce usable physical
  // height; Safari may also zoom a focused editor while opening the keyboard.
  const unzoomedHeight = visualHeight * Math.max(1, scale);
  return editing && Math.max(baselineHeight, layoutHeight) - unzoomedHeight > 120;
}

export function useVirtualKeyboard(enabled: boolean): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let baselineHeight = window.innerHeight;
    let lastWidth = window.innerWidth;
    let frame = 0;
    const viewport = window.visualViewport;
    const read = () => {
      frame = 0;
      // A width change indicates rotation/resizing, not keyboard geometry.
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        baselineHeight = window.innerHeight;
      }
      const editor = document.activeElement;
      const editing = editor instanceof HTMLElement && (
        editor.isContentEditable || editor instanceof HTMLTextAreaElement && !editor.readOnly ||
        editor instanceof HTMLInputElement && !editor.readOnly &&
          !["range", "checkbox", "radio", "button", "submit", "reset", "color", "file", "hidden"].includes(editor.type)
      );
      // Preserve the full height across focus transfers while the keyboard
      // remains open. Rotation resets this baseline above.
      baselineHeight = Math.max(baselineHeight, window.innerHeight);
      const next = viewportHasKeyboard({ editing, baselineHeight, layoutHeight: window.innerHeight,
        visualHeight: viewport?.height ?? window.innerHeight, scale: viewport?.scale });
      setOpen(previous => previous === next ? previous : next);
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(read); };
    update();
    window.addEventListener("resize", update, { passive: true });
    viewport?.addEventListener("resize", update, { passive: true });
    viewport?.addEventListener("scroll", update, { passive: true });
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, [enabled]);
  return enabled && open;
}
