/* ═══ SCORPORO PRE-FERMENTO — split canonico biga/poolish ═══
 * Estratto da recipe-output (audit lug 2026) per essere testabile:
 * una ricetta con biga/poolish senza dosi separate non è eseguibile.
 *
 * Convenzioni canoniche:
 *  - Biga: idratata al 44% (fonti: audit totale n. 10,
 *    docs/ricerca/prefermenti-fonti-2026-10-24.md; prima 45%). La quota di
 *    partenza del 40% della farina totale è un'ipotesi del modello: le fonti
 *    dicono circa un terzo, in generale 20–50% (FW-05, S14-A-07).
 *  - Poolish: 30% della farina totale, idratato al 100% (1:1).
 *  - D-043: la quota di farina si può scegliere (flourPct, 20–50%).
 *  - Il lievito va tutto nel pre-fermento; il sale mai (frenerebbe i lieviti):
 *    sale e grassi appartengono all'impasto finale.
 */

/** Quota di farina nel pre-fermento: default e limiti dalle fonti (biga in
 *  genere 20–50 %, poolish 30–50 %; qui 20–50 per entrambi). */
export const PRE_FERMENT_FLOUR_PCT = { biga: 40, poolish: 30, min: 20, max: 50 } as const;

interface PreFermentSplit {
  name: "Biga" | "Poolish";
  isPoolish: boolean;
  /** Idratazione del pre-fermento (44 biga · 100 poolish). */
  hydrationPct: 44 | 100;
  /** Farina nel pre-fermento, % della farina totale. */
  flourPct: number;
  prefermentFlourG: number;
  prefermentWaterG: number;
  mainFlourG: number;
  mainWaterG: number;
}

export function computePreFermentSplit(args: {
  flourG: number;
  waterG: number;
  preFermentType?: string | null;
  flourPct?: number | null;
}): PreFermentSplit {
  const isPoolish = (args.preFermentType ?? "")
    .toLowerCase()
    .includes("poolish");
  const flourPct = args.flourPct ?? PRE_FERMENT_FLOUR_PCT[isPoolish ? "poolish" : "biga"];
  const prefermentFlourG = Math.round(args.flourG * (flourPct / 100));
  const prefermentWaterG = Math.round(prefermentFlourG * (isPoolish ? 1.0 : 0.44));
  return {
    name: isPoolish ? "Poolish" : "Biga",
    isPoolish,
    hydrationPct: isPoolish ? 100 : 44,
    flourPct,
    prefermentFlourG,
    prefermentWaterG,
    mainFlourG: args.flourG - prefermentFlourG,
    mainWaterG: args.waterG - prefermentWaterG,
  };
}
