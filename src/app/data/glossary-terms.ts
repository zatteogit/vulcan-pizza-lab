import { GLOSSARY_COPY_IT } from "./glossary-copy";
import { BRAND } from "../config/brand";
/* === GLOSSARIO TECNICO — Appendice C (dati) === */
/* FW-05: i termini sono dati leggeri, senza il motore: li legge anche il
 * catalogo italiano del CMS (chunk principale). Interpolazione dei fatti del
 * motore e intervalli derivati dagli stili stanno in glossary-data.ts. */

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
  /** FW-05: `key` lega una fascia a una regola del motore (scala della W). */
  ranges?: { label: string; value: string; note?: string; key?: string }[];
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
    /* FW-05 (S06-A-05, S08-B-05, S12-B-17): la stessa scala del selettore e
     * della riga della ricetta, a fasce semiaperte (FLOUR_STRENGTH_SCALE). */
    ranges: [
      { key: "weak", label: "Debole", value: "{wBandWeak}", note: "Farina generica o per dolci" },
      { key: "medium", label: "Media", value: "{wBandMedium}", note: "Spesso venduta «per pizza»" },
      { key: "strong", label: "Forte", value: "{wBandStrong}", note: "Lunghe maturazioni e impasti molto idratati" },
      { key: "veryStrong", label: "Molto forte", value: "{wBandVeryStrong}", note: "Manitoba e farine per grandi lievitati" },
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
    /* FW-05 (S12-A-04): esempi dagli intervalli degli stili (DERIVED_RANGES). */
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
    /* FW-05 (S12-A-04/B-04, S12-A-15): esempi dagli intervalli degli stili. */
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
    /* FW-05 (S12-B-04): la dose dipende da ore e temperatura; i valori sono
     * quelli che il motore calcola per alcuni scenari. */
    ranges: [
      { label: "Fresco, {yeastS1Hours} a {yeastS1Temp}", value: "{yeastS1Pct}", note: "Stima del modello" },
      { label: "Fresco, {yeastS2Hours} a {yeastS2Temp}", value: "{yeastS2Pct}", note: "Stima del modello" },
      { label: "Fresco, {yeastS3Hours} a {yeastS3Temp}", value: "{yeastS3Pct}", note: "Stima del modello" },
      { label: "Fresco, {yeastS4Hours} a {yeastS4Temp}", value: "{yeastS4Pct}", note: "Stima del modello" },
      { label: "Secco (attivo o istantaneo)", value: "≈ fresco × {yeastDryRatio}", note: "Stessa stima del fresco" },
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
    /* FW-05 (S12-A-01): valori e soglie letti dal motore (getQ10). */
    ranges: [
      { label: "Lievito commerciale ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Stima del modello, coerente con i dati di crescita a temperatura ambiente" },
      { label: "Lievito commerciale < {q10ComBreak}", value: "{q10ComBelow}", note: "Stima del modello, senza fonte" },
      { label: "Lievito madre > {q10SdBreak}", value: "{q10SdAbove}", note: "Stima del modello" },
      { label: "Lievito madre ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Stima del modello" },
    ],
    whyImportant: `Con Q₁₀ = {q10ComAbove} la velocità si moltiplica per {q10ComAbove} ogni {tenDegrees}: {q10ExampleRefHours} a {q10RefTemp} ≈ {q10ExampleWarmHours} a {q10ExampleWarmTemp}. I valori di questa voce sono stime del modello di ${BRAND.name}.`,
    relatedTerms: ["arrhenius", "yeast"],
  },
  {
    id: "arrhenius",
    name: GLOSSARY_COPY_IT.arrhenius.name,
    category: "fermentation",
    definition: GLOSSARY_COPY_IT.arrhenius.definition,
    /* FW-05 (S12-A-01/A-02/B-02): la forma esatta, e il motore non la usa. */
    formula: "k = A · e^(−Eₐ / (R · T)), con T in kelvin",
    whyImportant: `${BRAND.name} non usa questa equazione. Il motore applica un Q₁₀ a tratti riferito a {q10RefTemp}: {q10ComAbove} sopra e {q10ComBelow} sotto {q10ComBreak} per il lievito commerciale, {q10SdAbove} sopra e {q10SdBelow} fino a {q10SdBreak} per il lievito madre. Sono stime del modello, non valori misurati.`,
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
    /* FW-05 (S11-V-01, S12-A-05): valori calcolati dal motore, niente mm senza fonte. */
    whyImportant: `Metrica diffusa nei calcolatori d'impasto nordamericani (in oz/in²; 1 oz/in² ≈ 4,39 g/cm²). ${BRAND.name} la esprime in g/cm² per dimensionare i panetti; insieme al forno orienta tempo di cottura e croccantezza. Gli esempi sono calcolati dal peso del panetto e dalla forma di ogni stile.`,
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
    /* FW-05 (S12-A-03/B-03): pesi, fasce e tetti come li calcola il motore. */
    formula: "A = Ingredienti × {authWIngredients} + Processo × {authWProcess} + Attrezzatura × {authWEquipment}",
    ranges: [
      { label: "{aBand0}", value: "Rigorosamente autentica" },
      { label: "{aBand1}", value: "Fedele con adattamenti" },
      { label: "{aBand2}", value: "Ispirata ma modificata" },
      { label: "{aBand3}", value: "Liberamente interpretata" },
    ],
    whyImportant: `I pesi sono una scelta di ${BRAND.name}, non una misura. Regole di prodotto: senza il combustibile previsto dallo stile il punteggio non supera {authFuelCap}; sotto la temperatura minima dello stile si riduce in proporzione.`,
  },
  {
    id: "f_score",
    name: GLOSSARY_COPY_IT.f_score.name,
    category: "scoring",
    definition: GLOSSARY_COPY_IT.f_score.definition,
    formula: "F = Forno × {feasWOven} + Farina × {feasWFlour} + Esperienza × {feasWSkill}",
    ranges: [
      { label: "{fBand0}", value: "Altamente fattibile" },
      { label: "{fBand1}", value: "Fattibile con attenzione" },
      { label: "{fBand2}", value: "Difficile" },
      { label: "{fBand3}", value: "Alto rischio" },
    ],
    whyImportant: `I pesi sono una scelta di ${BRAND.name}, non una misura. Se la ricetta non si può fare con la tua cucina, la compatibilità non supera {nonFeasibleCeiling}, qualunque siano gli altri punteggi.`,
  },
  {
    id: "d_score",
    name: GLOSSARY_COPY_IT.d_score.name,
    category: "scoring",
    definition: GLOSSARY_COPY_IT.d_score.definition,
    ranges: [
      { label: "{dBand0}", value: "Indice alto" },
      { label: "{dBand1}", value: "Indice medio-alto" },
      { label: "{dBand2}", value: "Indice medio" },
      { label: "{dBand3}", value: "Indice basso" },
    ],
    relatedTerms: ["fodmap", "q10"],
  },
];

/** Le formule con parole da tradurre; le altre sono simboli uguali in ogni lingua. */
export const LOCALIZED_FORMULA_TERMS = ["hydration", "arrhenius", "thickness_factor", "rule_of_55", "a_score", "f_score"] as const;
