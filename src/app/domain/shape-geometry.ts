/* ═══ FW-05 — Geometria della forma: area e spessore del panetto ═══
 * Spostato da pizza-engine.ts senza cambiare il calcolo. Modulo puro. */
import type { PizzaStyle, ShapeParameters } from "./pizza-engine";

/** Calculate default area for a style shape (cm²) */
export function getDefaultShapeArea(shape: ShapeParameters): number {
  if (shape.shape_type === "rectangular" || shape.shape_type === "oval") {
    const l = shape.length_cm ?? 30;
    const w = shape.width_cm ?? 20;
    return shape.shape_type === "oval" ? Math.PI * (l / 2) * (w / 2) : l * w;
  }
  const d = shape.diameter_cm ?? 30;
  return Math.PI * (d / 2) * (d / 2);
}

/** Audit n. 11 (B-15): lo spessore reale, peso del panetto sull'area della
 *  forma (g/cm²). `shape.thickness_factor` è solo un indice relativo che il
 *  motore usa come rapporto: mostrarlo come g/cm² dava 0,35 dove il peso
 *  diviso l'area fa 0,51. */
export function doughThicknessGPerCm2(style: PizzaStyle, weightG = style.shape.dough_weight_g): number {
  const area = getDefaultShapeArea(style.shape);
  return area > 0 ? Math.round((weightG / area) * 100) / 100 : 0;
}
