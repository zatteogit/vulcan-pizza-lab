/**
 * Scorciatoie da tastiera della modalità cottura (FW-12, S10-A-08 / S10-B-01).
 *
 * Le frecce SFOGLIANO i passi e basta: non segnano mai un passo come fatto
 * (quello resta un gesto esplicito sul bottone). Si sospendono quando sopra
 * la vista c'è un altro strato (dialog «Interrompi», popover…), quando un
 * altro gestore ha già consumato il tasto o quando il focus è in un campo,
 * uno switch, uno slider o un dialog di conferma.
 */

export type CookingKeyAction = "prev" | "next" | null;

export interface CookingKeyEventLike {
  key: string;
  defaultPrevented: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  target: EventTarget | null;
}

/** Elementi dove le frecce hanno già un significato proprio. */
const OWN_ARROW_KEYS =
  "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role='switch'], [role='slider'], [role='listbox'], [role='combobox'], [role='tablist'], [role='radiogroup'], [role='alertdialog']";

function targetOwnsArrows(target: EventTarget | null): boolean {
  const candidate = target as { closest?: (selector: string) => unknown } | null;
  return typeof candidate?.closest === "function" && candidate.closest(OWN_ARROW_KEYS) != null;
}

export function cookingKeyAction(
  event: CookingKeyEventLike,
  { isTopLayer }: { isTopLayer: boolean },
): CookingKeyAction {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return null;
  if (!isTopLayer || event.defaultPrevented) return null;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
  if (targetOwnsArrows(event.target)) return null;
  return event.key === "ArrowRight" ? "next" : "prev";
}

/**
 * Indice della vista dopo «→» (FW-12). In avanti si sfoglia solo fra i passi
 * già raggiunti: mai oltre il passo attivo, così la vista non finisce su un
 * passo futuro dove il bottone principale non fa nulla. A pizzata conclusa
 * (`allDone`) si sfoglia fino all'ultimo passo.
 */
export function nextViewIndex(
  viewIndex: number,
  { activeIdx, total, allDone }: { activeIdx: number; total: number; allDone: boolean },
): number {
  const limit = allDone ? total - 1 : Math.min(activeIdx, total - 1);
  return viewIndex < limit ? viewIndex + 1 : viewIndex;
}
