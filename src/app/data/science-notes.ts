import type { OvenType } from "../domain/pizza-engine";
import type { OvenModel } from "./oven-models";
import type { ScienceNote, SourceRef, SourceStatus } from "../domain/science/types";
import { getScienceSource } from "./science-sources";

/* ═══ FW-01 — Registro delle note scientifiche ═══
 * Una nota per ogni affermazione tecnica che l'app mostra o che un pacchetto
 * dell'audit UX/scienza (28/10/2026) deve rendere raggiungibile con il
 * «Perché?». La nota descrive ciò che il motore fa OGGI, non ciò che dovrebbe
 * fare: le correzioni dei modelli sono altri pacchetti, con misure prima/dopo.
 *
 * Regole (verificate da domain/science/science-registry.test.ts):
 * - ogni nota cita almeno una fonte esistente, oppure è 'assumption' o 'editorial';
 * - nessuna nota cita una fonte 'wrong';
 * - ogni 'estimate' dichiara l'incertezza e i decimali mostrabili;
 * - i testi (titolo, livello 1, livello 2, ipotesi) stanno nel CMS in 7 lingue:
 *   `science.notes.<id>.{title,l1,l2}`, `science.assumptions.<id>`;
 * - la formula da leggere sta nel CMS (`science.formulas.<id>`, 7 lingue): qui
 *   resta solo in simboli, di riserva; engineRef sono solo identificatori.
 * I numeri del motore non si scrivono nei testi: arrivano come `context`. */

export const SCIENCE_NOTES: readonly ScienceNote[] = [
  /* ── Lievito e fermentazione ── */
  {
    id: "yeast-dose",
    kind: "estimate",
    // FW-01: è il conto di calculateYeastPercentage + generateRecipe, passo per
    // passo (test in science-registry.test.ts che ricalcola yeast_baker_pct).
    formula: "Y = max(0,01 %; min(3 %; Y₀ × (t₀ / tₑ)^0,7 ÷ v(T) × s) ÷ k) · tₑ = (h − hₐ) + hₐ ÷ v(T)",
    variables: [
      { symbol: "Y", unitKey: "percent" },
      { symbol: "tₑ", unitKey: "hours" },
      { symbol: "h", unitKey: "hours" },
      { symbol: "hₐ", unitKey: "hours" },
      { symbol: "v", unitKey: "ratio" },
      { symbol: "s", unitKey: "ratio" },
      { symbol: "k", unitKey: "ratio" },
    ],
    assumptionIds: ["constant-ferment-temp", "time-exponent-no-source", "kitchen-temp-standard"],
    sourceIds: ["avpn-2024", "masaf-stg-2010"],
    uncertainty: { relative: 0.3, displayDecimals: 2 },
    engineRef: "calculateYeastPercentage, equivalentFermentationHours, clampYeastSpeedFactor, YEAST_DOSE_MARGIN",
    glossaryTermId: "yeast",
  },
  {
    id: "q10-fermentation",
    kind: "estimate",
    // FW-01: getQ10 + fermentationSpeedRatio, a tratti continui per tipo di lievito.
    formula: "v(T) = Q10ₐ^((T − 18)/10) · T < T_b: v(T) = Q10ₐ^((T_b − 18)/10) × Q10_b^((T − T_b)/10)",
    variables: [
      { symbol: "v", unitKey: "ratio" },
      { symbol: "T", unitKey: "celsius" },
    ],
    assumptionIds: ["q10-cold-no-source", "constant-ferment-temp"],
    sourceIds: ["salvado-2011", "baranyi-2017"],
    uncertainty: { displayDecimals: 1 },
    engineRef: "getQ10, fermentationSpeedRatio",
    glossaryTermId: "q10",
  },
  {
    id: "equivalent-hours",
    kind: "estimate",
    // FW-01: equivalentFermentationHours × fermentationSpeedRatio. Sotto i
    // 18 °C l'appretto si fa a 18 °C (PROOF_MIN_TEMP_C) e conta per le sue ore.
    formula: "T ≥ 18 °C: h₁₈ = h × v(T) · T < 18 °C: h₁₈ = (h − hₐ) × v(T) + hₐ",
    variables: [
      { symbol: "h₁₈", unitKey: "hours" },
      { symbol: "h", unitKey: "hours" },
      { symbol: "hₐ", unitKey: "hours" },
      { symbol: "v", unitKey: "ratio" },
    ],
    assumptionIds: ["constant-ferment-temp", "q10-cold-no-source"],
    sourceIds: ["salvado-2011"],
    uncertainty: { displayDecimals: 0 },
    engineRef: "equivalentFermentationHours, fermentationSpeedRatio, fermentationPhases, foldWindowMinutes",
  },
  {
    id: "kitchen-temp-default",
    kind: "assumption",
    assumptionIds: ["kitchen-temp-standard"],
    sourceIds: [],
    engineRef: "DEFAULT_KITCHEN_TEMP",
  },
  {
    id: "proof-split",
    kind: "assumption",
    assumptionIds: ["proof-share-default"],
    sourceIds: [],
    engineRef: "fermentationPhases",
    glossaryTermId: "ball_fermentation",
  },
  {
    id: "sourdough-starter-dose",
    kind: "assumption",
    assumptionIds: ["starter-steps-by-hours", "starter-not-in-hydration"],
    sourceIds: ["vulcan-notion-db"],
    engineRef: "generateRecipe",
  },
  {
    id: "pre-ferment",
    kind: "estimate",
    assumptionIds: ["constant-ferment-temp"],
    sourceIds: [
      "king-arthur-preferment",
      "king-arthur-preferments-2020",
      "dissapore-biga-2020",
      "scatti-di-gusto-biga-2017",
      "scatti-di-gusto-poolish-2020",
      "ooni-biga-poolish",
      "edible-molecules-2018",
      "wikipedia-pre-ferment",
      "masaf-stg-2010",
    ],
    uncertainty: { displayDecimals: 1 },
    engineRef: "computePreFermentSplit",
    glossaryTermId: "biga",
  },
  {
    // G4b-WP-02 (S14-B-07, D-G4b-1 A): i passi «Come si fa» sono una scelta di
    // Vulcan; le fonti coprono ore, temperature e maturazione, non l'impasto.
    id: "pre-ferment-procedure",
    kind: "editorial",
    sourceIds: ["king-arthur-preferment", "dissapore-biga-2020", "king-arthur-autolyse-2017"],
    engineRef: "PRE_FERMENT_TARGET_HOURS, PRE_FERMENT_TEMP_C, AUTOLYSIS_REST_MIN",
    glossaryTermId: "pre_ferment",
  },
  {
    id: "autolysis",
    kind: "exact",
    sourceIds: ["king-arthur-autolyse-2017"],
    glossaryTermId: "autolysis",
  },

  /* ── Impasto ── */
  {
    id: "water-temp-rule",
    kind: "exact",
    // FW-17 (S08-A-07): con un prefermento la regola ha quattro termini.
    formula: "T_w = 3 × T_d − T_k − T_f − F · T_w = 4 × T_d − T_k − T_f − T_p − F · T_wp = 3 × T_p − T_k − T_f",
    variables: [
      { symbol: "T", unitKey: "celsius" },
    ],
    assumptionIds: ["kitchen-temp-standard", "flour-at-kitchen-temp", "mixer-friction-values", "preferment-at-maturation-temp"],
    sourceIds: ["vulcan-notion-db"],
    engineRef: "desired_dough_temp_c, MIXER_FRICTION_K",
    glossaryTermId: "rule_of_55",
  },
  {
    id: "water-activity",
    kind: "estimate",
    formula: "Aw ≈ 0,96 + (H − 55) × 0,0005 − S × 0,006 − Z × 0,004",
    variables: [
      { symbol: "Aw", unitKey: "dimensionless" },
      { symbol: "H", unitKey: "percent" },
    ],
    assumptionIds: ["coefficients-not-measured"],
    sourceIds: ["vulcan-notion-db"],
    uncertainty: { displayDecimals: 2 },
    engineRef: "ScientificLayer.water_activity",
  },
  {
    id: "dough-indices",
    kind: "editorial",
    assumptionIds: ["coefficients-not-measured"],
    sourceIds: ["vulcan-notion-db"],
    uncertainty: { displayDecimals: 0 },
    engineRef: "ScientificLayer.gluten_network, proteolysis_index, starch_degradation_pct",
  },
  {
    id: "salt-range",
    kind: "editorial",
    sourceIds: ["masaf-stg-2010"],
    engineRef: "salt_pct",
  },
  {
    id: "stg-salt-timing",
    kind: "exact",
    sourceIds: ["masaf-stg-2010"],
  },
  /* FW-02: «Ricetta e disciplinare» della Napoletana STG. Il confronto con gli
   * intervalli del disciplinare è aritmetica; non è una verifica di conformità. */
  {
    id: "stg-reference",
    kind: "exact",
    assumptionIds: ["stg-partial-check"],
    sourceIds: ["masaf-stg-2010"],
    engineRef: "stgDepartures",
  },

  /* ── Farina ── */
  {
    id: "flour-w-by-grade",
    kind: "estimate",
    assumptionIds: ["grade-is-not-strength"],
    sourceIds: ["dpr-187-2001", "avpn-2024", "caputo-pizzeria-2025", "caputo-nuvola-2025"],
    uncertainty: { displayDecimals: 0 },
    engineRef: "FLOUR_W_RANGES",
    glossaryTermId: "w_alveograph",
  },
  {
    id: "flour-pl-estimate",
    kind: "estimate",
    formula: "P/L ≈ 0,30 + (W − 150) × 0,0015",
    variables: [
      { symbol: "P/L", unitKey: "ratio" },
      { symbol: "W", unitKey: "w-alveograph" },
    ],
    assumptionIds: ["coefficients-not-measured"],
    sourceIds: ["vulcan-notion-db"],
    uncertainty: { displayDecimals: 2 },
    engineRef: "estimatePL",
    glossaryTermId: "pl_ratio",
  },
  {
    id: "stg-flour-w",
    kind: "editorial",
    sourceIds: ["avpn-2024", "masaf-stg-2010"],
    engineRef: "STYLES_DB.napoletana_stg.dough.flour_w_range",
  },

  /* ── Forno e cottura ── */
  {
    id: "oven-max-temp",
    kind: "estimate",
    assumptionIds: ["oven-temp-surface-unspecified"],
    sourceIds: [
      "ooni-2026",
      "gozney-2026",
      "effeuno-2026",
      "g3-ferrari-delizia",
      "sage-pizzaiolo-manual",
      "witt-2026",
      "clementi-gold",
      "alfa-forni-faq",
      "bertello-2026",
      "ovens-secondary-2026",
    ],
    uncertainty: { displayDecimals: 0 },
    engineRef: "OVEN_MODELS.maxTempC",
  },
  {
    id: "oven-preset-max-temp",
    kind: "estimate",
    assumptionIds: ["oven-temp-surface-unspecified"],
    sourceIds: ["pinsaromana-it-2022", "ooni-2026", "masaf-stg-2010", "avpn-2024"],
    uncertainty: { displayDecimals: 0 },
    engineRef: "OVEN_PRESETS.maxTemp",
  },
  {
    id: "stg-oven-temp",
    kind: "estimate",
    sourceIds: ["masaf-stg-2010", "avpn-2024"],
    uncertainty: { range: [430, 485], unitKey: "celsius", displayDecimals: 0 },
    engineRef: "STYLES_DB.napoletana_stg.baking.temp_c_range",
  },
  {
    id: "style-min-oven-temp",
    kind: "assumption",
    assumptionIds: ["style-min-temp-no-source"],
    sourceIds: [],
    engineRef: "baking.temp_c_range, thermalViability",
  },
  {
    id: "bake-time-home-preheat",
    kind: "assumption",
    assumptionIds: ["preheat-home-minutes"],
    sourceIds: [],
    engineRef: "generateTimeline, idealPreheat",
  },
  {
    id: "surface-conductivity",
    kind: "estimate",
    variables: [{ symbol: "k", unitKey: "w-per-m-k" }],
    assumptionIds: ["rack-no-contact"],
    sourceIds: ["engineering-toolbox-metals"],
    uncertainty: { displayDecimals: 1 },
    engineRef: "SURFACE_OPTIONS.conductivity",
    glossaryTermId: "thermal_conductivity",
  },
  {
    id: "baking-energy",
    kind: "assumption",
    formula: "E = P × t · P ∈ {2; 3; 8} kW",
    variables: [
      { symbol: "E", unitKey: "kilojoule" },
      { symbol: "t", unitKey: "seconds" },
    ],
    assumptionIds: ["oven-power-steps"],
    sourceIds: [],
    engineRef: "ScientificLayer.baking_energy_kj",
  },
  {
    id: "thickness-factor",
    kind: "exact",
    formula: "TF = m / A · 1 oz/in² ≈ 4,39 g/cm²",
    variables: [{ symbol: "TF", unitKey: "g-per-cm2" }],
    sourceIds: ["lehmann-pmq-thickness"],
    engineRef: "dough.thickness_factor",
    glossaryTermId: "thickness_factor",
  },

  /* ── Punteggio ── */
  {
    id: "score-weights",
    kind: "editorial",
    /* FW-06 · D-E: contano solo autenticità (A) e facilità (F). */
    formula: "C = min(w_A × A + w_F × F; A) · w_A + w_F = 1 · C_nf = min(C; 39)",
    variables: [
      { symbol: "A", unitKey: "index-100" },
      { symbol: "F", unitKey: "index-100" },
    ],
    engineRef: "DEFAULT_UI_SCORE_WEIGHTS, globalRecipeScore, explainScore",
    sourceIds: [],
  },
  {
    id: "non-feasible-ceiling",
    kind: "editorial",
    engineRef: "NON_FEASIBLE_SCORE_CEILING",
    sourceIds: [],
  },
  {
    // D-063: il tetto vale solo se il forno non arriva al minimo dello stile.
    id: "authenticity-fuel-cap",
    kind: "editorial",
    engineRef: "calculateAuthenticityScore, AUTHENTICITY_FUEL_CAP",
    sourceIds: [],
  },
  {
    // D-062: a pari numero mostrato, più margine di forno e tempo prima.
    id: "ranking-tiebreak",
    kind: "editorial",
    formula: "M = ½ × [min(1; max(0; (T − T_min) / T_min)) + min(1; max(0; (H − H_min) / H_min))]",
    variables: [
      { symbol: "T", unitKey: "celsius" },
      { symbol: "H", unitKey: "hours" },
    ],
    engineRef: "kitchenMargin, compareByCompatibility",
    sourceIds: [],
  },
  {
    // G2-WP-01 · D-G2-1: regola del configuratore, non un modello fisico.
    id: "linked-params",
    kind: "editorial",
    formula: "r = (v − v₀) / (v₁ − v₀), 0 ≤ r ≤ 1 · x = x₀ + r × (x₁ − x₀)",
    engineRef: "propagateLinked, mapTo",
    sourceIds: [],
  },
  {
    id: "digestibility",
    kind: "editorial",
    assumptionIds: ["no-health-claim"],
    sourceIds: [],
    engineRef: "calculateDigestibilityScore",
    glossaryTermId: "d_score",
  },

  /* ── FW-19: piano temporale ── */
  {
    // Margini con cui la Timeline comoda allunga o accorcia le attese (D-Q):
    // scelta di Vulcan, senza fonte; il lievito non si ricalcola.
    id: "comfort-tolerances",
    kind: "editorial",
    assumptionIds: ["comfort-margins-rule-of-thumb", "comfort-yeast-unchanged"],
    sourceIds: [],
    engineRef: "COMFORT_TOLERANCES, optimizeComfort, movesHoursBetweenColdAndRoom",
  },
  {
    // Recupero del forno fra due cotture in serie (S09-A-14, S09-B-13).
    id: "bake-round-recovery",
    kind: "assumption",
    assumptionIds: ["recovery-by-oven-type"],
    sourceIds: [],
    engineRef: "BAKE_ROUND_RECOVERY_SEC, generateTimeline",
  },
  {
    // G3-WP-03 · D-G3-02: basilico prima del forno solo con cotture brevi.
    id: "basil-timing",
    kind: "editorial",
    engineRef: "BASIL_BEFORE_BAKE_MAX_SEC, assemblyStepBake, generateTimeline",
    sourceIds: [],
  },

  /* ── Problemi e soluzioni ── */
  {
    id: "troubleshooting-thresholds",
    kind: "estimate",
    assumptionIds: ["thresholds-rules-of-thumb"],
    sourceIds: ["vulcan-notion-db"],
    uncertainty: { displayDecimals: 0 },
    engineRef: "ISSUES_DB",
  },
  {
    // G4b-WP-03 (S13-A-10, D-G4b-2 A): pala, panetto che si allarga e buchi
    // in stesura sono pratica comune, senza fonte e senza soglie numeriche.
    id: "troubleshooting-practice",
    kind: "editorial",
    sourceIds: [],
    engineRef: "ISSUES_DB",
  },
];

const BY_ID = new Map(SCIENCE_NOTES.map((note) => [note.id, note]));

export function getScienceNote(id: string): ScienceNote | undefined {
  return BY_ID.get(id);
}

/** Nota con le fonti risolte, per «Perché?», pagina «Metodo e fonti» e MCP. */
export function resolveScienceNote(id: string): (ScienceNote & { sources: SourceRef[] }) | undefined {
  const note = BY_ID.get(id);
  if (!note) return undefined;
  const sources = note.sourceIds
    .map((sourceId) => getScienceSource(sourceId))
    .filter((source): source is SourceRef => source !== undefined);
  return { ...note, sources };
}

/** Note collegate a una voce di glossario (per il badge di statuto nel glossario). */
export function notesForGlossaryTerm(termId: string): ScienceNote[] {
  return SCIENCE_NOTES.filter((note) => note.glossaryTermId === termId);
}

/* Stato della temperatura massima dei forni generici (docs/fonti-dati.md §3.1).
 * 'unverified' = valore indicativo da correggere con quello del proprio forno. */
export const OVEN_PRESET_MAX_TEMP_STATUS: Record<OvenType, SourceStatus> = {
  home: "plausible",
  electric_standard: "unverified",
  gas: "unverified",
  electric_high: "unverified",
  gas_pizza: "verified",
  wood: "plausible",
  coal: "unverified",
};

/* Provenienza della temperatura dei forni per modello (oven-models.ts, S18-A-07/B-07):
 * V = scheda del produttore, P = fonte secondaria, demo = marchio e dato inventati
 * (statuto «Scelta di Vulcan», mai presentati come fonte). */
export const OVEN_MODEL_SOURCE_STATUS: Record<OvenModel["source"], SourceStatus> = {
  V: "verified",
  P: "plausible",
  demo: "unverified",
};
