/* ═══ G2-WP-01 — «Parametri collegati» (S06-A-01, S06-B-01, D-G2-1) ═══
 * Regola di Vulcan, non un modello fisico: quando sposti un parametro, gli
 * altri vanno nella stessa posizione relativa del loro intervallo di stile
 * (W e ore seguono l'idratazione, P/L va al contrario; la temperatura segue
 * le ore a tre gradini: frigo, fresco, ambiente).
 * Il risultato resta sempre dentro l'intervallo dello stile: prima mapTo
 * concedeva un 20 % in più e la propagazione stessa produceva il blocco
 * «lievitazione sotto il minimo» che il motore poi segnalava.
 * Modulo puro: restituisce le modifiche, il componente le applica. */

export type LinkedField = "hydration" | "flourW" | "flourPL" | "fermentHours" | "fermentTemp";
export type LinkedValues = Partial<Record<LinkedField, number>>;
export type Range = readonly [number, number];

export interface LinkedRanges {
  hydration: Range;
  flourW: Range;
  flourPL: Range;
  fermentHours: Range;
  /** P/L segue il collegamento solo se è modificabile (dettagli tecnici). */
  includePL: boolean;
}

/** Limiti dei cursori del configuratore e passo di ciascuno. */
export const SLIDER_BOUNDS: Readonly<Record<Exclude<LinkedField, "fermentTemp">, readonly [number, number, number]>> = {
  hydration: [45, 105, 1],
  flourW: [100, 420, 10],
  flourPL: [0.3, 0.9, 0.01],
  fermentHours: [1, 96, 1],
};

/** Temperature dei tre regimi (°C), le stesse delle scelte rapide. */
export const FRIDGE_C = 4;
export const COOL_C = 12;
export const AMBIENT_C = 22;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Posizione di v nell'intervallo, 0 = minimo, 1 = massimo (non limitata). */
export const ratio = (v: number, lo: number, hi: number) => (hi === lo ? 0.5 : (v - lo) / (hi - lo));

/** Stessa posizione r nell'intervallo [tLo, tHi], al passo del cursore e mai fuori intervallo. */
export function mapTo(r: number, tLo: number, tHi: number, sliderMin: number, sliderMax: number, step: number): number {
  const raw = tLo + clamp(r, 0, 1) * (tHi - tLo);
  const snapped = clamp(Math.round(raw / step) * step, tLo, tHi);
  const decimals = step < 1 ? Math.ceil(-Math.log10(step)) : 0;
  return Number(clamp(snapped, sliderMin, sliderMax).toFixed(decimals));
}

export const mapToInverse = (r: number, tLo: number, tHi: number, sliderMin: number, sliderMax: number, step: number) =>
  mapTo(1 - r, tLo, tHi, sliderMin, sliderMax, step);

/** Terzo alto dell'intervallo → frigo, centro → fresco, terzo basso → ambiente. */
export function tempFromHours(hours: number, [lo, hi]: Range): number {
  const mid = (lo + hi) / 2;
  if (hours >= mid + (hi - mid) * 0.3) return FRIDGE_C;
  if (hours >= mid - (mid - lo) * 0.3) return COOL_C;
  return AMBIENT_C;
}

/** Frigo → 80 % dell'intervallo, fresco → 50 %, ambiente → 20 %. */
export function hoursFromTemp(tempC: number, [lo, hi]: Range): number {
  const at = tempC <= 6 ? 0.8 : tempC <= 16 ? 0.5 : 0.2;
  return clamp(Math.round(lo + (hi - lo) * at), lo, hi);
}

/** D-G2-1 (A): acceso di default solo dal livello 3. */
export const defaultSmartLink = (skillLevel: number) => skillLevel >= 3;

/** D-G2-1 (A): con gli avanzati chiusi il collegamento non agisce mai. */
export const linkedActive = (smartLink: boolean, showAdvanced: boolean) => smartLink && showAdvanced;

/** Le modifiche agli altri parametri quando `source` passa a `value`. */
export function propagateLinked(source: LinkedField, value: number, ranges: LinkedRanges): LinkedValues {
  const { hydration: sH, flourW: sW, flourPL: sPL, fermentHours: sF, includePL } = ranges;
  const [hMin, hMax, hStep] = SLIDER_BOUNDS.hydration;
  const [wMin, wMax, wStep] = SLIDER_BOUNDS.flourW;
  const [pMin, pMax, pStep] = SLIDER_BOUNDS.flourPL;
  const [fMin, fMax, fStep] = SLIDER_BOUNDS.fermentHours;
  const out: LinkedValues = {};

  let r: number;
  if (source === "fermentTemp") {
    out.fermentHours = clamp(hoursFromTemp(value, sF), fMin, fMax);
    r = ratio(out.fermentHours, sF[0], sF[1]);
  } else {
    r = source === "hydration" ? ratio(value, sH[0], sH[1])
      : source === "flourW" ? ratio(value, sW[0], sW[1])
      : source === "flourPL" ? 1 - ratio(value, sPL[0], sPL[1])
      : ratio(value, sF[0], sF[1]);
    if (source === "fermentHours") {
      out.fermentTemp = tempFromHours(value, sF);
    } else {
      out.fermentHours = mapTo(r, sF[0], sF[1], fMin, fMax, fStep);
      out.fermentTemp = tempFromHours(out.fermentHours, sF);
    }
  }
  if (source !== "hydration") out.hydration = mapTo(r, sH[0], sH[1], hMin, hMax, hStep);
  if (source !== "flourW") out.flourW = mapTo(r, sW[0], sW[1], wMin, wMax, wStep);
  if (source !== "flourPL" && includePL) out.flourPL = mapToInverse(r, sPL[0], sPL[1], pMin, pMax, pStep);
  return out;
}

/** Solo i campi che la propagazione cambia davvero rispetto ai valori attuali. */
export function linkedChanges(current: LinkedValues, next: LinkedValues): LinkedField[] {
  return (Object.keys(next) as LinkedField[]).filter((field) => next[field] !== current[field]);
}

/** Valori prima e dopo le propagazioni di fila, per «Annulla». */
export interface LinkedRun {
  before: LinkedValues;
  after: LinkedValues;
}

/** Ordine dei campi nel riepilogo, lo stesso del configuratore. */
export const LINKED_FIELD_ORDER: readonly LinkedField[] = ["hydration", "flourW", "flourPL", "fermentHours", "fermentTemp"];

/**
 * Unisce una nuova propagazione a quelle di fila (un cursore trascinato ne
 * produce una a ogni passo): «Annulla» torna ai valori di prima della prima.
 * La serie riparte se qualcos'altro ha cambiato i valori adattati; il campo
 * che l'utente sposta torna suo e non si annulla.
 */
export function mergeLinked(prev: LinkedRun | null, current: LinkedValues, source: LinkedField, next: LinkedValues): LinkedRun | null {
  const fields = (run: LinkedRun) => Object.keys(run.after) as LinkedField[];
  const valid = prev !== null && fields(prev).every((f) => f === source || current[f] === prev.after[f]);
  const before: LinkedValues = {};
  const after: LinkedValues = {};
  if (valid) {
    for (const f of fields(prev)) {
      if (f === source) continue;
      before[f] = prev.before[f];
      after[f] = prev.after[f];
    }
  }
  for (const f of linkedChanges(current, next)) {
    if (!(f in before)) before[f] = current[f];
    after[f] = next[f];
  }
  for (const f of Object.keys(after) as LinkedField[]) {
    if (after[f] === before[f]) {
      delete after[f];
      delete before[f];
    }
  }
  return Object.keys(after).length > 0 ? { before, after } : null;
}
