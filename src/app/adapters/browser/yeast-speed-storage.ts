/* M-11: correzione personale della lievitazione, salvata nel browser.
   Vale per tutte le ricette; il motore la limita a 0,5–2. */

import { clampYeastSpeedFactor } from "../../domain/pizza-engine";

const YEAST_SPEED_KEY = "vulcan_yeast_speed";

export function loadYeastSpeedFactor(): number {
  try {
    const raw = localStorage.getItem(YEAST_SPEED_KEY);
    return raw === null ? 1 : clampYeastSpeedFactor(Number(raw));
  } catch {
    return 1;
  }
}

export function saveYeastSpeedFactor(factor: number): void {
  const value = clampYeastSpeedFactor(factor);
  try {
    if (value === 1) localStorage.removeItem(YEAST_SPEED_KEY);
    else localStorage.setItem(YEAST_SPEED_KEY, String(value));
  } catch {
    /* storage non disponibile: la correzione vale solo per questa sessione */
  }
}
