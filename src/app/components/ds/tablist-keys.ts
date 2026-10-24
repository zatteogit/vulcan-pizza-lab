import type { KeyboardEvent } from "react";

/* ═══ U-10 (F13) — tastiera delle tab secondo il pattern ARIA ═══
 * Una sola tab nella sequenza del Tab (tabIndex 0 sull'attiva, -1 sulle altre);
 * frecce, Home e Fine spostano la selezione e il focus. Le tab portano
 * `data-tab-id` per essere ritrovate dentro il tablist. */

export function tabIndexFor(active: boolean): 0 | -1 {
  return active ? 0 : -1;
}

export function handleTablistKeyDown<T extends string>(
  event: KeyboardEvent<HTMLElement>,
  ids: readonly T[],
  active: T,
  select: (id: T) => void,
): void {
  const count = ids.length;
  if (count === 0) return;
  const current = Math.max(0, ids.indexOf(active));
  let next: number;
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      next = (current + 1) % count;
      break;
    case "ArrowLeft":
    case "ArrowUp":
      next = (current - 1 + count) % count;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = count - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  const target = ids[next];
  select(target);
  const list = event.currentTarget;
  requestAnimationFrame(() => {
    list.querySelector<HTMLElement>(`[role="tab"][data-tab-id="${target}"]`)?.focus();
  });
}
