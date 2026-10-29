/**
 * FW-20 (WCAG 2.4.3): «Scegli il tuo forno» smonta la scheda che aveva il
 * focus e apre il cassetto «La tua cucina». Il focus va portato dentro il
 * cassetto, sulla scelta del forno, invece di cadere su <body>.
 *
 * Il cassetto può comparire qualche frame dopo il click (con un altro
 * cassetto aperto, AnimatePresence aspetta la sua uscita): si riprova a ogni
 * frame per un tempo limitato, poi si ripiega sul tab «La tua cucina», che è
 * il controllo aperto (aria-expanded) subito prima del cassetto.
 */

export interface FocusableLike {
  focus: (options?: FocusOptions) => void;
}

export interface QueryRootLike {
  querySelector: (selector: string) => FocusableLike | null;
}

/** In ordine di preferenza: il forno scelto, un forno qualunque, il primo controllo del cassetto. */
export const OVEN_CHOICE_SELECTORS = [
  '.needs-drawer [data-slot="oven-preset"] [aria-pressed="true"]',
  '.needs-drawer [data-slot="oven-preset"] button',
  ".needs-drawer button:not([disabled]), .needs-drawer a[href]",
] as const;

/** Ripiego: il tab aperto della barra «La tua cucina / Dispensa / Tu». */
export const KITCHEN_TAB_FALLBACK = '.needs-summary__tab[aria-expanded="true"]';

export function findOvenChoiceTarget(root: QueryRootLike): FocusableLike | null {
  for (const selector of OVEN_CHOICE_SELECTORS) {
    const found = root.querySelector(selector);
    if (found) return found;
  }
  return null;
}

/**
 * Porta il focus sulla scelta del forno appena il cassetto c'è. Restituisce
 * una funzione che annulla i tentativi rimasti.
 */
export function focusOvenChoice(
  root: QueryRootLike,
  {
    schedule = (cb: () => void) => requestAnimationFrame(cb),
    maxFrames = 60,
  }: { schedule?: (cb: () => void) => unknown; maxFrames?: number } = {},
): () => void {
  let cancelled = false;
  let frame = 0;
  const attempt = () => {
    if (cancelled) return;
    const target = findOvenChoiceTarget(root);
    if (target) {
      target.focus();
      return;
    }
    frame += 1;
    if (frame < maxFrames) {
      schedule(attempt);
      return;
    }
    root.querySelector(KITCHEN_TAB_FALLBACK)?.focus();
  };
  schedule(attempt);
  return () => {
    cancelled = true;
  };
}
