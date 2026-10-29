/* ═══ SCORPORO PRE-FERMENTO — split canonico biga/poolish ═══
 * Estratto da recipe-output (audit lug 2026) per essere testabile:
 * una ricetta con biga/poolish senza dosi separate non è eseguibile.
 *
 * Convenzioni canoniche:
 *  - Biga: 40% della farina totale, idratata al 44% (fonti: audit totale
 *    n. 10, docs/ricerca/prefermenti-fonti-2026-10-24.md; prima 45%).
 *  - Poolish: 30% della farina totale, idratato al 100% (1:1).
 *  - D-043: la quota di farina si può scegliere (flourPct, 20–50%).
 *  - Il lievito va tutto nel pre-fermento; il sale mai (frenerebbe i lieviti):
 *    sale e grassi appartengono all'impasto finale.
 */

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
  const flourPct = args.flourPct ?? (isPoolish ? 30 : 40);
  const prefermentFlourG = Math.round(args.flourG * (flourPct / 100));
  /* FW-17 (S08-A-03): l'acqua del pre-fermento non supera mai quella della
     ricetta, così l'impasto finale non riceve acqua negativa. */
  const prefermentWaterG = Math.min(
    Math.max(0, args.waterG),
    Math.round(prefermentFlourG * (isPoolish ? 1.0 : 0.44)),
  );
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

/* ═══ FW-17 — limiti e temperature del pre-fermento ═══ */

/** Temperatura di maturazione del pre-fermento, °C (fonti:
 *  docs/ricerca/prefermenti-fonti-2026-10-24.md; stessi valori del CMS). */
export const PRE_FERMENT_TEMP_C = { biga: [18, 20], poolish: [20, 22] } as const;

/** FW-17 (S08-A-07): temperatura con cui il prefermento maturo entra
 *  nell'impasto finale (ipotesi del modello: punto medio di PRE_FERMENT_TEMP_C). */
export function preFermentMaturationTempC(type: "biga" | "poolish"): number {
  const [lo, hi] = PRE_FERMENT_TEMP_C[type];
  return (lo + hi) / 2;
}

/** FW-17 (S08-A-07): Regola 55, la somma che le temperature degli ingredienti
 *  devono raggiungere: senza prefermento cucina + farina + acqua = 3 × DDT −
 *  attrito; con un prefermento entra un quarto ingrediente, quindi cucina +
 *  farina + acqua + prefermento = 4 × DDT − attrito. La usano il motore
 *  (acqua = somma − gli altri termini) e la spiegazione in Ricetta, così il
 *  numero e la sua spiegazione non divergono. */
export function rule55Sum(ddt: number, friction: number, hasPreFerment: boolean): number {
  return (hasPreFerment ? 4 : 3) * ddt - friction;
}

/** FW-17 (S08-A-03): un poolish è idratato al 100 %, quindi la sua quota di
 *  farina non può superare l'idratazione della ricetta (altrimenti l'acqua del
 *  poolish supera quella totale). La biga (44 %) non arriva mai al limite. */
export function maxPreFermentFlourPct(
  type: "biga" | "poolish",
  hydrationPct: number,
  max: number,
): number {
  return type === "poolish" ? Math.min(max, Math.floor(hydrationPct)) : max;
}
