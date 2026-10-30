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

/** Ore di maturazione del pre-fermento dalle fonti
 *  (docs/ricerca/prefermenti-fonti-2026-10-24.md): biga circa 16 h a
 *  18–20 °C, poolish 12–16 h a 20–22 °C (qui il centro, 14 h). Prima era il
 *  40 % delle ore totali, uguale per i due (verifica di GPT, 24/10/2026).
 *  G4b-WP-02: vive qui (non in pizza-engine) perché la guida la cita. */
export const PRE_FERMENT_TARGET_HOURS = { biga: 16, poolish: 14 } as const;

/** Riposo dell'autolisi in minuti (Calvel 1974, da King Arthur 2017: V). */
export const AUTOLYSIS_REST_MIN = [20, 60] as const;

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
