/**
 * ds/escape-stack — registro LIFO degli strati aperti (FW-12).
 *
 * Popover, tendine, dialog, sheet e la vista della modalità cottura si
 * registrano qui quando si aprono. Esc chiude SOLO lo strato in cima; chi sta
 * sotto non lo sente. Le scorciatoie globali di uno strato (es. le frecce
 * della modalità cottura) chiedono `isTop()` e si sospendono quando sopra c'è
 * un altro strato.
 *
 * Un solo listener su `document` in fase di bubbling: i gestori React dei
 * campi (che girano prima, sul root) possono consumare Esc con
 * `preventDefault()` e in quel caso lo stack non fa nulla.
 */
import { useEffect, useRef } from "react";

export interface EscapeKeyEventLike {
  key: string;
  defaultPrevented: boolean;
  isComposing?: boolean;
  preventDefault(): void;
}

interface EscapeLayer {
  id: symbol;
  onEscape?: () => void;
}

export interface EscapeLayerHandle {
  id: symbol;
  /** true se nessuno strato è stato aperto sopra questo. */
  isTop(): boolean;
  /** Toglie lo strato dal registro (idempotente). */
  release(): void;
}

const layers: EscapeLayer[] = [];
let listening = false;

function onDocumentKeyDown(event: KeyboardEvent) {
  handleEscapeKey(event);
}

function syncListener() {
  if (typeof document === "undefined") return;
  if (layers.length > 0 && !listening) {
    document.addEventListener("keydown", onDocumentKeyDown);
    listening = true;
  } else if (layers.length === 0 && listening) {
    document.removeEventListener("keydown", onDocumentKeyDown);
    listening = false;
  }
}

/**
 * Applica Esc allo strato in cima. Ritorna true se lo ha consumato.
 * Esportata per i test: in app la chiama il listener su document.
 */
export function handleEscapeKey(event: EscapeKeyEventLike): boolean {
  if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return false;
  const top = layers[layers.length - 1];
  if (!top) return false;
  event.preventDefault();
  top.onEscape?.();
  return true;
}

/** Registra uno strato. Senza `onEscape` lo strato blocca Esc senza chiudersi. */
export function pushEscapeLayer(onEscape?: () => void): EscapeLayerHandle {
  const layer: EscapeLayer = { id: Symbol("escape-layer"), onEscape };
  layers.push(layer);
  syncListener();
  return {
    id: layer.id,
    isTop: () => isTopEscapeLayer(layer.id),
    release: () => {
      const index = layers.lastIndexOf(layer);
      if (index >= 0) layers.splice(index, 1);
      syncListener();
    },
  };
}

export function isTopEscapeLayer(id: symbol): boolean {
  return layers.length > 0 && layers[layers.length - 1].id === id;
}

/** Numero di strati aperti (per test e diagnostica). */
export function escapeLayerDepth(): number {
  return layers.length;
}

/**
 * Hook: registra uno strato finché `active` è vero. `onEscape` può cambiare
 * a ogni render senza riordinare lo stack. Ritorna `isTop()`.
 */
export function useEscapeLayer(active: boolean, onEscape?: () => void): () => boolean {
  const onEscapeRef = useRef(onEscape);
  const handleRef = useRef<EscapeLayerHandle | null>(null);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const handle = pushEscapeLayer(() => onEscapeRef.current?.());
    handleRef.current = handle;
    return () => {
      handle.release();
      if (handleRef.current === handle) handleRef.current = null;
    };
  }, [active]);

  return () => handleRef.current?.isTop() ?? false;
}
