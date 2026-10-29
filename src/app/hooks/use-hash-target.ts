/**
 * FW-04 (S04-A-04, S12-B-01, S12-B-11, S14-B-16) — un solo modo di atterrare
 * su una voce da un deep link (#termine, #pf-poolish, ?issue=P03).
 *
 * 1. `onMatch(id)` apre la voce (accordion, filtri azzerati); se l'id non
 *    esiste restituisce false e non succede nulla.
 * 2. `revealWhenStable` aspetta che l'elemento esista e che la sua posizione
 *    resti ferma per due fotogrammi (animazioni di layout, catalogo della
 *    lingua che arriva dopo), poi lo porta in cima con `block: "start"`
 *    (lo spazio della testata sta in `scroll-margin-block-start`, nel CSS).
 * 3. Con «riduci movimento» lo scorrimento è istantaneo; il focus va sul
 *    titolo della voce senza un secondo scorrimento (preventScroll).
 *
 * Funziona anche sulla stessa route: l'effetto dipende da `location.key`,
 * quindi toccare due volte lo stesso link riporta alla voce.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/** Il minimo che serve del DOM: in test si passano oggetti finti. */
export interface RevealTarget {
  getBoundingClientRect(): { top: number };
  scrollIntoView(options: ScrollIntoViewOptions): void;
}
export interface FocusTarget {
  focus(options?: FocusOptions): void;
}

export interface RevealEnv {
  getElement(id: string): RevealTarget | null;
  getFocusElement?(id: string): FocusTarget | null;
  frame(callback: () => void): number;
  cancelFrame(handle: number): void;
  reducedMotion: boolean;
  /** Fotogrammi massimi di attesa (~1 s a 60 Hz). */
  maxFrames?: number;
}

/** Attende un layout stabile, poi scorre e mette a fuoco. Restituisce l'annullamento. */
export function revealWhenStable(
  targetId: string,
  focusId: string | undefined,
  env: RevealEnv,
): () => void {
  const maxFrames = env.maxFrames ?? 60;
  let handle = 0;
  let frames = 0;
  let lastTop: number | null = null;
  let cancelled = false;

  const finish = (el: RevealTarget) => {
    el.scrollIntoView({ behavior: env.reducedMotion ? "auto" : "smooth", block: "start" });
    const focusEl = focusId ? env.getFocusElement?.(focusId) : null;
    focusEl?.focus({ preventScroll: true });
  };

  const step = () => {
    if (cancelled) return;
    frames += 1;
    const el = env.getElement(targetId);
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (lastTop !== null && Math.abs(top - lastTop) < 1) {
        finish(el);
        return;
      }
      lastTop = top;
      if (frames >= maxFrames) {
        finish(el);
        return;
      }
    } else if (frames >= maxFrames) {
      return;
    }
    handle = env.frame(step);
  };

  handle = env.frame(step);
  return () => {
    cancelled = true;
    env.cancelFrame(handle);
  };
}

/** Ambiente reale del browser per `revealWhenStable`. */
export function browserRevealEnv(): RevealEnv {
  const reducedMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    getElement: (id) => document.getElementById(id),
    getFocusElement: (id) => document.getElementById(id),
    frame: (cb) => window.requestAnimationFrame(cb),
    cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    reducedMotion,
  };
}

/** Estrae l'id dall'hash (`#pf-poolish` con prefisso `pf-` → `poolish`). */
export function hashTargetId(hash: string, prefix = ""): string | null {
  let raw = hash.replace(/^#/, "");
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* hash malformato: si usa così com'è */
  }
  if (!raw || !raw.startsWith(prefix)) return null;
  const id = raw.slice(prefix.length);
  return id || null;
}

export interface HashTargetOptions {
  /** Prefisso dell'hash (`pf-` per #pf-poolish). */
  prefix?: string;
  /** Apre la voce; false se l'id non esiste. */
  onMatch: (id: string) => boolean;
  /** id dell'elemento da portare in vista. */
  targetId: (id: string) => string;
  /** id dell'elemento che riceve il focus (il pulsante del titolo). */
  focusId?: (id: string) => string;
}

export function useHashTarget({ prefix = "", onMatch, targetId, focusId }: HashTargetOptions): void {
  const location = useLocation();
  const latest = useRef({ onMatch, targetId, focusId });
  latest.current = { onMatch, targetId, focusId };

  useEffect(() => {
    const id = hashTargetId(location.hash, prefix);
    if (!id) return;
    const { onMatch: match, targetId: target, focusId: focus } = latest.current;
    if (!match(id)) return;
    return revealWhenStable(target(id), focus?.(id), browserRevealEnv());
  }, [location.hash, location.key, prefix]);
}
