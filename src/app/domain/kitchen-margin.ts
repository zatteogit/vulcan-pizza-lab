/* D-062 (Matteo, 29/10/2026) · Spareggio della compatibilità.
 *
 * Con D-E quasi tutti gli stili fattibili finiscono a 96-98 e, a pari numero,
 * decideva l'ordine del catalogo. Ora, SOLO a pari numero mostrato e dentro lo
 * stesso gruppo, viene prima lo stile che la cucina copre con più margine:
 *
 *   margine di forno  m_T = (forno − minimo dello stile) / minimo dello stile
 *   margine di tempo  m_H = (ore a disposizione − maturazione minima) / maturazione minima
 *   ciascuno limitato fra 0 e 1 (1 = il doppio o più), poi la media dei due.
 *
 * Le fritte non usano il forno: per loro conta solo il tempo. Il numero non
 * cambia: cambia solo l'ordine. È una scelta di Vulcan, non una misura
 * (nota `ranking-tiebreak` del registro della scienza). Funzioni pure. */

import { isFriedStyle, type PizzaStyle, type UserConstraints } from "./pizza-engine";

export interface KitchenMarginParts {
  /** Margine di forno fra 0 e 1; null per gli stili fritti. */
  oven: number | null;
  /** Margine di tempo fra 0 e 1. */
  time: number;
  /** Media dei margini disponibili, fra 0 e 1. */
  margin: number;
}

const clamp01 = (value: number): number => (Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0);

/** Temperatura che il forno raggiunge davvero (la capienza dichiarata la limita). */
function effectiveOvenTemp(constraints: Pick<UserConstraints, "oven_max_temp_c" | "oven_capacity_temp_c">): number {
  const capacity = constraints.oven_capacity_temp_c;
  return capacity !== undefined && Number.isFinite(capacity) && capacity > 0
    ? Math.min(constraints.oven_max_temp_c, capacity)
    : constraints.oven_max_temp_c;
}

/** Quanto forno e tempo della cucina superano ciò che lo stile chiede. */
export function kitchenMarginParts(
  style: PizzaStyle,
  constraints: Pick<UserConstraints, "oven_max_temp_c" | "oven_capacity_temp_c" | "available_hours">,
): KitchenMarginParts {
  const minHours = style.dough.fermentation_hours_range[0];
  const time = minHours > 0 ? clamp01((constraints.available_hours - minHours) / minHours) : 1;
  if (isFriedStyle(style)) return { oven: null, time, margin: time };
  const minTemp = style.baking.temp_c_range[0];
  const oven = minTemp > 0 ? clamp01((effectiveOvenTemp(constraints) - minTemp) / minTemp) : 1;
  return { oven, time, margin: (oven + time) / 2 };
}

export function kitchenMargin(
  style: PizzaStyle,
  constraints: Pick<UserConstraints, "oven_max_temp_c" | "oven_capacity_temp_c" | "available_hours">,
): number {
  return kitchenMarginParts(style, constraints).margin;
}

/** Ordine per compatibilità: numero mostrato (arrotondato) decrescente e, solo a
 *  pari numero, margine decrescente. 0 = pari: chi chiama tiene l'ordine di prima
 *  (sort stabile). */
export function compareByCompatibility(
  a: { score: number; margin: number },
  b: { score: number; margin: number },
): number {
  return Math.round(b.score) - Math.round(a.score) || b.margin - a.margin;
}
