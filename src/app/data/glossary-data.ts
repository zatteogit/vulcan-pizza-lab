import { GLOSSARY_COPY_IT } from "./glossary-copy";
/* === GLOSSARIO TECNICO — Appendice C === */
/* Basato su Notion Appendice C · Glossario Tecnico (302ed0f7e12081379cf4ce959ef2b1b3) */
/* i18n: localized getters depend on a neutral message-source contract. */

import type { GlossaryMessageSource } from "../i18n/domain-contracts";
import { BRAND } from "../config/brand";

export type GlossaryCategory =
  | "rheology"
  | "fermentation"
  | "thermal"
  | "chemistry"
  | "mechanics"
  | "scoring";

export interface GlossaryTerm {
  id: string;
  name: string;
  symbol?: string;
  category: GlossaryCategory;
  definition: string;
  unit?: string;
  formula?: string;
  ranges?: { label: string; value: string; note?: string }[];
  whyImportant?: string;
  relatedTerms?: string[];
  relatedPages?: string[];
}

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, { label: string; description: string }> = {
  rheology: {
    label: "Reologia",
    description: "Proprietà meccaniche della farina e dell'impasto",
  },
  fermentation: {
    label: "Fermentazione",
    description: "Lievitazione, maturazione e processi biologici",
  },
  thermal: {
    label: "Termica",
    description: "Trasferimento calore e cottura",
  },
  chemistry: {
    label: "Chimica",
    description: "Composizione e reazioni chimiche",
  },
  mechanics: {
    label: "Meccanica",
    description: "Lavorazione, attrezzature e misure",
  },
  scoring: {
    label: "Punteggi",
    description: `Metriche di qualità ${BRAND.name}`,
  },
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  /* ═══ REOLOGIA ═══ */
  {
    id: "w_alveograph",
    name: GLOSSARY_COPY_IT.w_alveograph.name,
    symbol: "W",
    category: "rheology",
    definition: GLOSSARY_COPY_IT.w_alveograph.definition,
    unit: "10⁻⁴ J",
    formula: "W ∝ ∫ P dV",
    ranges: [
      { label: "Debole", value: "90–160", note: "Biscotti, cialde" },
      { label: "Media", value: "160–200", note: "Pan carrè, focaccia" },
      { label: "Medio-forte", value: "200–280", note: "Pizza napoletana" },
      { label: "Forte", value: "280–350", note: "Pane grande lievitazione" },
      { label: "Molto forte", value: "350–450", note: "Panettone, croissant" },
    ],
    whyImportant: GLOSSARY_COPY_IT.w_alveograph.whyImportant,
    relatedTerms: ["p_tenacity", "l_extensibility", "pl_ratio"],
  },
  {
    id: "p_tenacity",
    name: GLOSSARY_COPY_IT.p_tenacity.name,
    symbol: "P",
    category: "rheology",
    definition: GLOSSARY_COPY_IT.p_tenacity.definition,
    unit: "mm H₂O",
    ranges: [
      { label: "Pizza", value: "40–80 mm" },
      { label: "Pane", value: "80–120 mm" },
      { label: "Croissant", value: "100–140 mm" },
    ],
    whyImportant: GLOSSARY_COPY_IT.p_tenacity.whyImportant,
    relatedTerms: ["w_alveograph", "pl_ratio"],
  },
  {
    id: "l_extensibility",
    name: GLOSSARY_COPY_IT.l_extensibility.name,
    symbol: "L",
    category: "rheology",
    definition: GLOSSARY_COPY_IT.l_extensibility.definition,
    unit: "mm",
    ranges: [
      { label: "Pizza", value: "80–120 mm" },
      { label: "Pane", value: "60–100 mm" },
    ],
    whyImportant: GLOSSARY_COPY_IT.l_extensibility.whyImportant,
    relatedTerms: ["w_alveograph", "pl_ratio"],
  },
  {
    id: "pl_ratio",
    name: GLOSSARY_COPY_IT.pl_ratio.name,
    symbol: "P/L",
    category: "rheology",
    definition: GLOSSARY_COPY_IT.pl_ratio.definition,
    formula: "P/L = P (mm H₂O) / L (mm)",
    ranges: [
      { label: "<0.4 Molto estensibile", value: "Collassa facilmente", note: "Pinsa" },
      { label: "0.4–0.5 Estensibile", value: "Facile lavorare", note: "Napoletana classica" },
      { label: "0.5–0.7 Bilanciato", value: "Buon equilibrio", note: "Napoletana moderna, pane" },
      { label: "0.7–1.0 Tenace", value: "Resistente", note: "Pane grande lievitazione" },
      { label: ">1.0 Molto tenace", value: "Elastico, ritorna", note: "Croissant" },
    ],
    whyImportant: GLOSSARY_COPY_IT.pl_ratio.whyImportant,
    relatedTerms: ["w_alveograph", "p_tenacity", "l_extensibility"],
  },
  {
    id: "falling_number",
    name: GLOSSARY_COPY_IT.falling_number.name,
    symbol: "FN",
    category: "rheology",
    definition: GLOSSARY_COPY_IT.falling_number.definition,
    unit: "s",
    ranges: [
      { label: "<200 Altissima amilasi", value: "Impasto appiccicoso", note: "Sconsigliato pizza" },
      { label: "200–250 Alta", value: "Mollica umida", note: "Pane rapido" },
      { label: "250–300 Media", value: "Buon equilibrio", note: "Pizza 8-12h" },
      { label: "300–400 Bassa", value: "Asciutto, lento", note: "Pizza 24-48h" },
      { label: ">400 Molto bassa", value: "Secco", note: "Pasta secca" },
    ],
    whyImportant: GLOSSARY_COPY_IT.falling_number.whyImportant,
    relatedTerms: ["w_alveograph"],
  },
  {
    id: "hydration",
    name: GLOSSARY_COPY_IT.hydration.name,
    symbol: "H%",
    category: "rheology",
    definition: GLOSSARY_COPY_IT.hydration.definition,
    unit: "%",
    formula: "H% = (peso acqua / peso farina) × 100",
    ranges: [
      { label: "Napoletana classica", value: "55–60%", note: "Morbido, lavorabile" },
      { label: "Napoletana contemporanea", value: "60–65%", note: "Cornicione leggero" },
      { label: "Canotto", value: "65–70%", note: "Alveoli grandi" },
      { label: "Pinsa romana", value: "75–85%", note: "Steso in teglia" },
      { label: "Focaccia/Bonci", value: "85–100%+", note: "Pastella" },
    ],
    whyImportant: GLOSSARY_COPY_IT.hydration.whyImportant,
    relatedTerms: ["w_alveograph", "absorption"],
  },
  {
    id: "absorption",
    name: GLOSSARY_COPY_IT.absorption.name,
    category: "rheology",
    definition: GLOSSARY_COPY_IT.absorption.definition,
    unit: "%",
    ranges: [
      { label: "00 debole (W150)", value: "50–52%" },
      { label: "00 media (W220)", value: "53–55%" },
      { label: "00 forte (W280)", value: "56–58%" },
      { label: "Integrale", value: "65–75%" },
      { label: "Manitoba (W380)", value: "60–65%" },
    ],
    relatedTerms: ["hydration", "w_alveograph"],
  },
  {
    id: "stability",
    name: GLOSSARY_COPY_IT.stability.name,
    category: "rheology",
    definition: GLOSSARY_COPY_IT.stability.definition,
    unit: "min",
    ranges: [
      { label: "Debole", value: "2–4 min" },
      { label: "Media", value: "5–8 min" },
      { label: "Forte", value: "10–15 min" },
      { label: "Manitoba", value: "15–20 min" },
    ],
    whyImportant: GLOSSARY_COPY_IT.stability.whyImportant,
  },

  /* ═══ FERMENTAZIONE ═══ */
  {
    id: "yeast",
    name: GLOSSARY_COPY_IT.yeast.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.yeast.definition,
    ranges: [
      { label: "Fresco", value: "0.5–2.0%", note: "Umidità 70%, frigo 4°C" },
      { label: "Secco attivo", value: "0.3–1.0%", note: "Idratare prima" },
      { label: "Secco istantaneo", value: "0.2–0.8%", note: "Diretto" },
    ],
    whyImportant: GLOSSARY_COPY_IT.yeast.whyImportant,
    relatedTerms: ["q10", "arrhenius"],
  },
  {
    id: "lab",
    name: GLOSSARY_COPY_IT.lab.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.lab.definition,
    whyImportant: GLOSSARY_COPY_IT.lab.whyImportant,
    relatedTerms: ["fodmap", "yeast"],
  },
  {
    id: "q10",
    name: GLOSSARY_COPY_IT.q10.name,
    symbol: "Q₁₀",
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.q10.definition,
    formula: "Q₁₀ = k(T+10) / k(T)",
    ranges: [
      { label: "Lievito commerciale ≥10°C", value: "2.0", note: "Stima del modello, coerente con i dati di crescita fra 18 e 25 °C" },
      { label: "Lievito commerciale <10°C", value: "1.6", note: "Stima del modello, senza fonte" },
      { label: "Lievito madre >15°C", value: "2.2", note: "Stima del modello" },
      { label: "Lievito madre ≤15°C", value: "1.9", note: "Stima del modello" },
    ],
    whyImportant: `Con Q₁₀ = 2 la fermentazione raddoppia ogni +10°C: 24h a 18°C ≈ 12h a 28°C. I valori qui sotto sono stime del modello di ${BRAND.name}.`,
    relatedTerms: ["arrhenius", "yeast"],
  },
  {
    id: "arrhenius",
    name: GLOSSARY_COPY_IT.arrhenius.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.arrhenius.definition,
    formula: "k(T) = k_ref × e^(β × (T - T_ref))",
    whyImportant: `Con β=0.075 e T_ref=18°C → Q₁₀ ≈ 2.12. Usato nel motore ${BRAND.name} per calcolare dosaggio lievito e tempi.`,
    relatedTerms: ["q10"],
  },
  {
    id: "biga",
    name: GLOSSARY_COPY_IT.biga.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.biga.definition,
    whyImportant: GLOSSARY_COPY_IT.biga.whyImportant,
    relatedTerms: ["poolish", "autolysis"],
  },
  {
    id: "poolish",
    name: GLOSSARY_COPY_IT.poolish.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.poolish.definition,
    whyImportant: GLOSSARY_COPY_IT.poolish.whyImportant,
    relatedTerms: ["biga", "autolysis"],
  },
  {
    id: "autolysis",
    name: GLOSSARY_COPY_IT.autolysis.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.autolysis.definition,
    whyImportant: GLOSSARY_COPY_IT.autolysis.whyImportant,
    relatedTerms: ["biga", "poolish"],
  },
  {
    id: "bulk_fermentation",
    name: GLOSSARY_COPY_IT.bulk_fermentation.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.bulk_fermentation.definition,
    whyImportant: GLOSSARY_COPY_IT.bulk_fermentation.whyImportant,
  },
  {
    id: "ball_fermentation",
    name: GLOSSARY_COPY_IT.ball_fermentation.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.ball_fermentation.definition,
    whyImportant: GLOSSARY_COPY_IT.ball_fermentation.whyImportant,
  },

  /* ═══ TERMICA ═══ */
  {
    id: "maillard",
    name: GLOSSARY_COPY_IT.maillard.name,
    category: "thermal",
    definition: GLOSSARY_COPY_IT.maillard.definition,
    whyImportant: GLOSSARY_COPY_IT.maillard.whyImportant,
    relatedTerms: ["caramelization"],
  },
  {
    id: "caramelization",
    name: GLOSSARY_COPY_IT.caramelization.name,
    category: "thermal",
    definition: GLOSSARY_COPY_IT.caramelization.definition,
    whyImportant: GLOSSARY_COPY_IT.caramelization.whyImportant,
    relatedTerms: ["maillard"],
  },
  {
    id: "starch_gelatinization",
    name: GLOSSARY_COPY_IT.starch_gelatinization.name,
    category: "thermal",
    definition: GLOSSARY_COPY_IT.starch_gelatinization.definition,
    whyImportant: GLOSSARY_COPY_IT.starch_gelatinization.whyImportant,
    relatedTerms: ["retrogradation"],
  },
  {
    id: "retrogradation",
    name: GLOSSARY_COPY_IT.retrogradation.name,
    category: "thermal",
    definition: GLOSSARY_COPY_IT.retrogradation.definition,
    whyImportant: GLOSSARY_COPY_IT.retrogradation.whyImportant,
    relatedTerms: ["starch_gelatinization"],
  },
  {
    id: "thermal_conductivity",
    name: GLOSSARY_COPY_IT.thermal_conductivity.name,
    symbol: "k",
    category: "thermal",
    definition: GLOSSARY_COPY_IT.thermal_conductivity.definition,
    unit: "W/(m·K)",
    formula: "q = -k × A × (dT/dx)",
    ranges: [
      { label: "Rame", value: "400" },
      { label: "Alluminio", value: "205" },
      { label: "Acciaio al carbonio", value: "50" },
      { label: "Acciaio inox", value: "16" },
      { label: "Cordierite (pietra)", value: "2.5–3.5" },
      { label: "Pietra refrattaria", value: "1.0–1.5" },
      { label: "Impasto pizza", value: "0.5" },
    ],
    whyImportant: GLOSSARY_COPY_IT.thermal_conductivity.whyImportant,
  },

  /* ═══ CHIMICA ═══ */
  {
    id: "fodmap",
    name: GLOSSARY_COPY_IT.fodmap.name,
    category: "chemistry",
    definition: GLOSSARY_COPY_IT.fodmap.definition,
    whyImportant: GLOSSARY_COPY_IT.fodmap.whyImportant,
    relatedTerms: ["lab"],
  },
  {
    id: "histamine",
    name: GLOSSARY_COPY_IT.histamine.name,
    category: "chemistry",
    definition: GLOSSARY_COPY_IT.histamine.definition,
    whyImportant: GLOSSARY_COPY_IT.histamine.whyImportant,
    relatedTerms: ["lab", "fodmap"],
  },
  {
    id: "gluten",
    name: GLOSSARY_COPY_IT.gluten.name,
    category: "chemistry",
    definition: GLOSSARY_COPY_IT.gluten.definition,
    whyImportant: GLOSSARY_COPY_IT.gluten.whyImportant,
    relatedTerms: ["proteolysis", "w_alveograph"],
  },
  {
    id: "proteolysis",
    name: GLOSSARY_COPY_IT.proteolysis.name,
    category: "chemistry",
    definition: GLOSSARY_COPY_IT.proteolysis.definition,
    whyImportant: GLOSSARY_COPY_IT.proteolysis.whyImportant,
    relatedTerms: ["gluten"],
  },

  /* ═══ MECCANICA ═══ */
  {
    id: "thickness_factor",
    name: GLOSSARY_COPY_IT.thickness_factor.name,
    symbol: "TF",
    category: "mechanics",
    definition: GLOSSARY_COPY_IT.thickness_factor.definition,
    unit: "g/cm²",
    formula: "TF = peso panetto (g) / area pizza (cm²)",
    ranges: [
      { label: "Napoletana", value: "0.30–0.36", note: "6-7 mm" },
      { label: "Romana tonda", value: "0.20–0.25", note: "4-5 mm" },
      { label: "New York", value: "0.40–0.50", note: "8-10 mm" },
      { label: "Chicago deep dish", value: "1.00–1.30", note: "20-26 mm" },
    ],
    whyImportant: `Determina tempo cottura, croccantezza e densità calorica. Metrica originale Progetto ${BRAND.name}.`,
  },
  {
    id: "friction_factor",
    name: GLOSSARY_COPY_IT.friction_factor.name,
    category: "mechanics",
    definition: GLOSSARY_COPY_IT.friction_factor.definition,
    unit: "°C",
    ranges: [
      { label: "A mano", value: "0" },
      { label: "Impastatrice a forcella", value: "2" },
      { label: "Spirale", value: "3" },
      { label: "Planetaria domestica (impasti da cucina)", value: "4" },
      { label: "Planetaria", value: "5" },
    ],
    whyImportant: GLOSSARY_COPY_IT.friction_factor.whyImportant,
    relatedTerms: ["rule_of_55"],
  },
  {
    id: "rule_of_55",
    name: GLOSSARY_COPY_IT.rule_of_55.name,
    category: "mechanics",
    definition: GLOSSARY_COPY_IT.rule_of_55.definition,
    formula: "T_acqua = 3 × T_impasto − T_ambiente − T_farina − attrito",
    whyImportant: GLOSSARY_COPY_IT.rule_of_55.whyImportant,
    relatedTerms: ["friction_factor"],
  },

  /* ═══ PUNTEGGI ═══ */
  {
    id: "a_score",
    name: GLOSSARY_COPY_IT.a_score.name,
    category: "scoring",
    definition: GLOSSARY_COPY_IT.a_score.definition,
    formula: "A = Ingredienti(30%) + Processo(25%) + Attrezzatura(35%) + Forma(10%)",
    ranges: [
      { label: "90-100", value: "Rigorosamente autentica" },
      { label: "75-89", value: "Sostanzialmente autentica" },
      { label: "60-74", value: "Ispirata allo stile" },
      { label: "<60", value: "Deviazione significativa" },
    ],
  },
  {
    id: "f_score",
    name: GLOSSARY_COPY_IT.f_score.name,
    category: "scoring",
    definition: GLOSSARY_COPY_IT.f_score.definition,
    formula: "F = Forno(40%) + Ingredienti(30%) + Abilità(20%) + Tempo(10%)",
    ranges: [
      { label: "90-100", value: "Altamente fattibile" },
      { label: "75-89", value: "Fattibile con attenzione" },
      { label: "60-74", value: "Difficile" },
      { label: "<60", value: "Sconsigliato" },
    ],
  },
  {
    id: "d_score",
    name: GLOSSARY_COPY_IT.d_score.name,
    category: "scoring",
    definition: GLOSSARY_COPY_IT.d_score.definition,
    ranges: [{"label":"85-100","value":"Indice alto"},{"label":"70-84","value":"Indice medio-alto"},{"label":"50-69","value":"Indice medio"},{"label":"<50","value":"Indice basso"}],
    relatedTerms: ["fodmap", "q10"],
  },
];

/** Termini raggruppati per categoria */
export function getTermsByCategory(cms?: GlossaryMessageSource): Record<GlossaryCategory, GlossaryTerm[]> {
  const map = {} as Record<GlossaryCategory, GlossaryTerm[]>;
  for (const cat of Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[]) {
    map[cat] = GLOSSARY_TERMS.map(term => term.category === cat ? getLocalizedTerm(term, cms) : term)
      .filter((term) => term.category === cat);
  }
  return map;
}

/** Trova un termine per ID (localized) */
export function getTermById(id: string, cms?: GlossaryMessageSource): GlossaryTerm | undefined {
  const term = GLOSSARY_TERMS.find((t) => t.id === id);
  return term ? getLocalizedTerm(term, cms) : undefined;
}

/* === i18n: LOCALIZED GETTERS === */

/** Return localized term content (falls back to Italian hardcoded) */
export function getLocalizedTerm(term: GlossaryTerm, cms?: GlossaryMessageSource): GlossaryTerm {
  const loc = cms?.glossaryTerms?.terms?.[term.id];
  if (!loc) return term;
  return {
    ...term,
    name: loc.name ?? term.name,
    definition: loc.definition ?? term.definition,
    whyImportant: loc.whyImportant ?? term.whyImportant,
    ranges: loc.ranges?.length ? loc.ranges : term.ranges,
  };
}
