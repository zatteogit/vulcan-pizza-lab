/**
 * FW-04 — dove e come si apre il popover di un TermLink.
 *
 * Il popover del termine sta in posizione fissa (i testi e le card attorno
 * tagliano l'overflow). Dentro un dialog modale (scheda dello stile, cottura,
 * pannelli) va portato DENTRO il dialog, non nel body: così sta sopra il
 * dialog (stesso contesto di sovrapposizione) e il Tab resta nel suo ciclo.
 * Il dialog può essere trasformato (animazioni): in quel caso la posizione
 * fissa si misura dal dialog e non dallo schermo, e qui la si converte.
 */

/** Margine dal bordo dello schermo e distanza dal termine, in px. */
const EDGE = 16;
const GAP = 8;

export interface TriggerRect { left: number; top: number; bottom: number; width: number }
export interface Viewport { width: number; height: number }
/** Riquadro (padding box) da cui si misura `position: fixed`, in coordinate
 * dello schermo, già spostato dello scorrimento. `null` = lo schermo. */
export interface FixedFrame { left: number; top: number; height: number }

export function fixedPopoverAnchor(
  trigger: TriggerRect,
  viewport: Viewport,
  frame: FixedFrame | null,
): { placement: "above" | "below"; vars: Record<string, string> } {
  const f = frame ?? { left: 0, top: 0, height: viewport.height };
  const above = viewport.height - trigger.bottom < 250;
  const width = Math.min(300, Math.max(240, viewport.width * 0.65), viewport.width - 2 * EDGE);
  const left = Math.max(EDGE, Math.min(trigger.left + trigger.width / 2 - width / 2, viewport.width - width - EDGE));
  const vars: Record<string, string> = { "--tip-left": `${left - f.left}px` };
  if (above) vars["--tip-bottom"] = `${f.top + f.height - (trigger.top - GAP)}px`;
  else vars["--tip-top"] = `${trigger.bottom + GAP - f.top}px`;
  return { placement: above ? "above" : "below", vars };
}

/** Ciò che serve di uno stile calcolato per sapere se fa da riferimento ai fissi. */
export interface FixedContextStyle {
  transform: string;
  perspective: string;
  filter: string;
  backdropFilter?: string;
  willChange: string;
  contain: string;
  containerType?: string;
}

/** Vero se l'elemento diventa il riferimento di `position: fixed` (CSS Transforms, Containment). */
export function establishesFixedContext(style: FixedContextStyle): boolean {
  const set = (v: string | undefined) => !!v && v !== "none";
  return set(style.transform)
    || set(style.perspective)
    || set(style.filter)
    || set(style.backdropFilter)
    || /\b(transform|perspective|filter)\b/.test(style.willChange)
    || /\b(layout|paint|strict|content)\b/.test(style.contain)
    || (!!style.containerType && style.containerType !== "normal");
}

/** Dove montare il popover: il dialog modale che contiene il termine, o il body. */
export function popoverHost(trigger: HTMLElement): HTMLElement {
  return trigger.closest<HTMLElement>("[aria-modal='true']") ?? trigger.ownerDocument.body;
}

function ancestorsUpToBody(start: HTMLElement): HTMLElement[] {
  const doc = start.ownerDocument;
  const chain: HTMLElement[] = [];
  let node: HTMLElement | null = start;
  while (node && node !== doc.body && node !== doc.documentElement) {
    chain.push(node);
    node = node.parentElement;
  }
  return chain;
}

/** Il riquadro di riferimento dei fissi per un popover montato in `host`. */
export function fixedFrameFor(host: HTMLElement): FixedFrame | null {
  for (const node of ancestorsUpToBody(host)) {
    if (!establishesFixedContext(getComputedStyle(node))) continue;
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left + node.clientLeft - node.scrollLeft,
      top: rect.top + node.clientTop - node.scrollTop,
      height: node.clientHeight,
    };
  }
  return null;
}

/** L'elemento che viene dopo `trigger` nell'ordine del Tab, saltando quelli esclusi. */
export function nextInOrder<T>(order: readonly T[], trigger: T, excluded: (item: T) => boolean): T | null {
  const index = order.indexOf(trigger);
  if (index < 0) return null;
  return order.slice(index + 1).find((item) => !excluded(item)) ?? null;
}

/** Vero se il focus è andato fuori dal termine e dal suo popover (si chiude). */
export function focusLeftTip(target: Node | null, parts: readonly (Node | null)[]): boolean {
  if (!target) return false;
  return !parts.some((part) => part?.contains(target));
}

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
