/* ═══ SCORPORO PRE-FERMENTO — split canonico biga/poolish ═══
 * Estratto da recipe-output (audit lug 2026) per essere testabile:
 * una ricetta con biga/poolish senza dosi separate non è eseguibile.
 *
 * Convenzioni canoniche:
 *  - Biga: 40% della farina totale, idratata al 45%.
 *  - Poolish: 30% della farina totale, idratato al 100% (1:1).
 *  - Il lievito va tutto nel pre-fermento; il sale mai (frenerebbe i lieviti):
 *    sale e grassi appartengono all'impasto finale.
 */

interface PreFermentSplit {
  name: "Biga" | "Poolish";
  isPoolish: boolean;
  /** Idratazione del pre-fermento (45 biga · 100 poolish). */
  hydrationPct: 45 | 100;
  prefermentFlourG: number;
  prefermentWaterG: number;
  mainFlourG: number;
  mainWaterG: number;
}

export function computePreFermentSplit(args: {
  flourG: number;
  waterG: number;
  preFermentType?: string | null;
}): PreFermentSplit {
  const isPoolish = (args.preFermentType ?? "")
    .toLowerCase()
    .includes("poolish");
  const prefermentFlourG = Math.round(args.flourG * (isPoolish ? 0.3 : 0.4));
  const prefermentWaterG = Math.round(prefermentFlourG * (isPoolish ? 1.0 : 0.45));
  return {
    name: isPoolish ? "Poolish" : "Biga",
    isPoolish,
    hydrationPct: isPoolish ? 100 : 45,
    prefermentFlourG,
    prefermentWaterG,
    mainFlourG: args.flourG - prefermentFlourG,
    mainWaterG: args.waterG - prefermentWaterG,
  };
}
