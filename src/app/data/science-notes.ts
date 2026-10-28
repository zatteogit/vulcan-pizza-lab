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
 *   `science.notes.<id>.{title,l1,l2}`, `science.assumptions.<id>`.
 * I numeri del motore non si scrivono nei testi: arrivano come `context`. */

export const SCIENCE_NOTES: readonly ScienceNote[] = [
  /* ── Lievito e fermentazione ── */
  {
    id: "yeast-dose",
    kind: "estimate",
    formula: "Y = Y₀ × (t₀ / tₑ)^0,7 · Y₀ = 0,1 %, t₀ = 24 h a 18 °C",
    variables: [
      { symbol: "Y", unitKey: "percent" },
      { symbol: "tₑ", unitKey: "hours" },
    ],
    assumptionIds: ["constant-ferment-temp", "time-exponent-no-source", "kitchen-temp-standard"],
    sourceIds: ["avpn-2024", "masaf-stg-2010"],
    uncertainty: { relative: 0.3, displayDecimals: 2 },
    engineRef: "calculateYeastPercentage, YEAST_DOSE_MARGIN",
    glossaryTermId: "yeast",
  },
  {
    id: "q10-fermentation",
    kind: "estimate",
    formula: "v(T) = Q10^((T − 18)/10) · Q10 = 2,0 sopra 10 °C, 1,6 sotto (a tratti)",
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
    formula: "h₁₈ = h × fattore del metodo × v(T)",
    variables: [
      { symbol: "h₁₈", unitKey: "hours" },
      { symbol: "h", unitKey: "hours" },
    ],
    assumptionIds: ["constant-ferment-temp", "q10-cold-no-source"],
    sourceIds: ["salvado-2011"],
    uncertainty: { displayDecimals: 0 },
    engineRef: "equivalentFermentationHours, fermentationSpeedRatio",
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
    engineRef: "generateRecipe (yeastType sourdough)",
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
    id: "autolysis",
    kind: "exact",
    sourceIds: ["king-arthur-autolyse-2017"],
    glossaryTermId: "autolysis",
  },

  /* ── Impasto ── */
  {
    id: "water-temp-rule",
    kind: "exact",
    formula: "T acqua = 3 × T impasto − T cucina − T farina − attrito",
    variables: [
      { symbol: "T", unitKey: "celsius" },
    ],
    assumptionIds: ["kitchen-temp-standard", "flour-at-kitchen-temp", "mixer-friction-values"],
    sourceIds: ["vulcan-notion-db"],
    engineRef: "Regola 55: desired_dough_temp_c, MIXER_FRICTION_K",
    glossaryTermId: "rule_of_55",
  },
  {
    id: "water-activity",
    kind: "estimate",
    formula: "Aw ≈ 0,96 + (H − 55) × 0,0005 − sale × 0,006 − zucchero × 0,004",
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
    engineRef: "recipe-configurator: salt_pct ± 0,3",
  },
  {
    id: "stg-salt-timing",
    kind: "exact",
    sourceIds: ["masaf-stg-2010"],
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
    formula: "P/L ≈ 0,30 + (W − 150) × 0,0015, limitato all'intervallo dello stile",
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
    uncertainty: { range: [430, 485], displayDecimals: 0 },
    engineRef: "STYLES_DB.napoletana_stg.baking.temp_c_range",
  },
  {
    id: "style-min-oven-temp",
    kind: "assumption",
    assumptionIds: ["style-min-temp-no-source"],
    sourceIds: [],
    engineRef: "STYLES_DB.<stile>.baking.temp_c_range, thermalViability",
  },
  {
    id: "bake-time-home-preheat",
    kind: "assumption",
    assumptionIds: ["preheat-home-minutes"],
    sourceIds: [],
    engineRef: "generateTimeline: idealPreheat",
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
    formula: "E = P × t · P = 2, 3 o 8 kW secondo la temperatura del forno",
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
    formula: "TF = peso del panetto (g) / area della pizza (cm²) · 1 oz/in² ≈ 4,39 g/cm²",
    variables: [{ symbol: "TF", unitKey: "g-per-cm2" }],
    sourceIds: ["lehmann-pmq-thickness"],
    engineRef: "STYLES_DB.<stile>.dough.thickness_factor",
    glossaryTermId: "thickness_factor",
  },

  /* ── Punteggio ── */
  {
    id: "score-weights",
    kind: "editorial",
    engineRef: "DEFAULT_UI_SCORE_WEIGHTS",
    sourceIds: [],
  },
  {
    id: "non-feasible-ceiling",
    kind: "editorial",
    engineRef: "NON_FEASIBLE_SCORE_CEILING",
    sourceIds: [],
  },
  {
    id: "authenticity-fuel-cap",
    kind: "editorial",
    engineRef: "calculateAuthenticityScore: Math.min(score, 75)",
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

  /* ── Problemi e soluzioni ── */
  {
    id: "troubleshooting-thresholds",
    kind: "estimate",
    assumptionIds: ["thresholds-rules-of-thumb"],
    sourceIds: ["vulcan-notion-db"],
    uncertainty: { displayDecimals: 0 },
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
