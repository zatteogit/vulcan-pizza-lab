import type { PanConfig } from "../../domain/pizza-engine";

/* ═══ Audit totale n. 16 — teglia nel link ═══
 * Riaprendo una ricetta salvata o un link condiviso la teglia 60×40 tornava
 * 40×30 e le dosi si dimezzavano: le misure non erano nel link. Parametro
 * compatto `pan`: forma, lunghezza, larghezza, diametro, spessore
 * («r:60:40::0.6», «c:::32:0.5»). */

export function encodePan(pan: PanConfig | null | undefined): string | null {
  if (!pan) return null;
  const parts = [
    pan.panShape === "round" ? "c" : pan.panShape === "rectangular" ? "r" : "",
    pan.panLength ?? "",
    pan.panWidth ?? "",
    pan.panDiameter ?? "",
    pan.thickness ?? "",
  ];
  return parts.join(":");
}

export function decodePan(raw: string | null | undefined): PanConfig | null {
  if (!raw) return null;
  const [shape, len, wid, diam, th] = raw.split(":");
  const num = (v: string | undefined, lo: number, hi: number) => {
    if (v === undefined || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= lo && n <= hi ? n : undefined;
  };
  const pan: PanConfig = {
    panShape: shape === "c" ? "round" : shape === "r" ? "rectangular" : undefined,
    panLength: num(len, 5, 200),
    panWidth: num(wid, 5, 200),
    panDiameter: num(diam, 5, 100),
    thickness: num(th, 0.05, 3),
  };
  return Object.values(pan).some((v) => v !== undefined) ? pan : null;
}
