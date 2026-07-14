import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let scrollLocks = 0;
const dialogStack: symbol[] = [];

function lockDocumentScroll() {
  scrollLocks += 1;
  document.documentElement.classList.add("ds-dialog-open");
}

function unlockDocumentScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.documentElement.classList.remove("ds-dialog-open");
}

/** Shared modal keyboard contract: autofocus, Tab loop, Escape and focus restore. */
export function useDialogFocus<TElement extends HTMLElement>({
  open,
  onClose,
  lockScroll = true,
}: {
  open: boolean;
  onClose?: () => void;
  lockScroll?: boolean;
}) {
  const panelRef = useRef<TElement>(null);
  const onCloseRef = useRef(onClose);
  const dialogIdRef = useRef(Symbol("dialog"));

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const panel = panelRef.current;
    if (!panel) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (lockScroll) lockDocumentScroll();
    const dialogId = dialogIdRef.current;
    dialogStack.push(dialogId);

    const focusable = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" &&
          !element.closest("[inert], [aria-hidden='true']") &&
          element.getClientRects().length > 0,
      );

    const focusFrame = requestAnimationFrame(() => {
      (focusable()[0] ?? panel).focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== dialogId) return;
      if (event.key === "Escape" && onCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const candidates = focusable();
      if (!candidates.length) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      const stackIndex = dialogStack.lastIndexOf(dialogId);
      if (stackIndex >= 0) dialogStack.splice(stackIndex, 1);
      if (lockScroll) unlockDocumentScroll();
      if (previouslyFocused?.isConnected) {
        queueMicrotask(() => {
          if (previouslyFocused.isConnected) previouslyFocused.focus();
        });
      }
    };
  }, [lockScroll, open]);

  return panelRef;
}
