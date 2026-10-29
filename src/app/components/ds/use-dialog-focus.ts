import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import { pushEscapeLayer, type EscapeLayerHandle } from "./escape-stack";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let scrollLocks = 0;
/* Modal layers only: the Tab loop belongs to the top-most modal, even when a
   non-modal layer (popover, select) sits above it in the escape stack. */
const modalStack: symbol[] = [];

function lockDocumentScroll() {
  scrollLocks += 1;
  document.documentElement.classList.add("ds-dialog-open");
}

function unlockDocumentScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.documentElement.classList.remove("ds-dialog-open");
}

/**
 * Where the modal's Tab loop sends focus, or null to let the key through.
 * FW-04: a Tab already handled by a layer inside the dialog (the TermLink
 * moving into its popover) is not corrected again.
 */
export function tabLoopTarget(state: {
  defaultPrevented: boolean;
  isTop: boolean;
  shiftKey: boolean;
  hasCandidates: boolean;
  insidePanel: boolean;
  atFirst: boolean;
  atLast: boolean;
}): "first" | "last" | "panel" | null {
  if (state.defaultPrevented || !state.isTop) return null;
  if (!state.hasCandidates) return "panel";
  if (!state.insidePanel) return state.shiftKey ? "last" : "first";
  if (state.shiftKey && state.atFirst) return "last";
  if (!state.shiftKey && state.atLast) return "first";
  return null;
}

/**
 * Shared modal keyboard contract: autofocus, Tab loop, Escape and focus restore.
 * FW-12: Escape passes through the shared escape stack (escape-stack.ts), so
 * only the top-most layer closes; the Tab loop runs only on the top-most modal.
 */
export function useDialogFocus<TElement extends HTMLElement>({
  open,
  onClose,
  lockScroll = true,
  initialFocusRef,
  fallbackFocus,
  layerRef,
}: {
  open: boolean;
  onClose?: () => void;
  lockScroll?: boolean;
  /** Focused on open instead of the first focusable (e.g. a title with tabIndex=-1). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Where focus goes on close when the opener is no longer in the DOM. */
  fallbackFocus?: () => HTMLElement | null;
  /** Receives the escape-stack handle while open (for layer-aware shortcuts). */
  layerRef?: MutableRefObject<EscapeLayerHandle | null>;
}) {
  const panelRef = useRef<TElement>(null);
  const onCloseRef = useRef(onClose);
  const fallbackFocusRef = useRef(fallbackFocus);

  useEffect(() => {
    onCloseRef.current = onClose;
    fallbackFocusRef.current = fallbackFocus;
  }, [onClose, fallbackFocus]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const panel = panelRef.current;
    if (!panel) return;

    /* Body is not an opener: the trigger may already be hidden (e.g. the
       cook widget hides while its view is open), so fallbackFocus decides. */
    const previouslyFocused =
      document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement
        : null;
    if (lockScroll) lockDocumentScroll();
    const layer = pushEscapeLayer(() => onCloseRef.current?.());
    modalStack.push(layer.id);
    if (layerRef) layerRef.current = layer;

    const focusable = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" &&
          !element.closest("[inert], [aria-hidden='true']") &&
          element.getClientRects().length > 0,
      );

    const focusFrame = requestAnimationFrame(() => {
      (initialFocusRef?.current ?? focusable()[0] ?? panel).focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const candidates = focusable();
      const active = document.activeElement;
      const target = tabLoopTarget({
        defaultPrevented: event.defaultPrevented,
        isTop: modalStack[modalStack.length - 1] === layer.id,
        shiftKey: event.shiftKey,
        hasCandidates: candidates.length > 0,
        insidePanel: active instanceof Node && panel.contains(active),
        atFirst: active === candidates[0] || active === panel,
        atLast: active === candidates[candidates.length - 1],
      });
      if (!target) return;
      event.preventDefault();
      if (target === "panel") panel.focus({ preventScroll: true });
      else (target === "first" ? candidates[0] : candidates[candidates.length - 1]).focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      layer.release();
      if (layerRef?.current === layer) layerRef.current = null;
      const modalIndex = modalStack.lastIndexOf(layer.id);
      if (modalIndex >= 0) modalStack.splice(modalIndex, 1);
      if (lockScroll) unlockDocumentScroll();
      queueMicrotask(() => {
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
        else fallbackFocusRef.current?.()?.focus();
      });
    };
  }, [lockScroll, open]);

  return panelRef;
}
