import { BRAND } from "../config/brand";
/* === GLOSSARIO TECNICO — Appendice C (dati) === */
/* FW-05: i termini sono dati leggeri, senza il motore: li legge anche il
 * catalogo italiano del CMS. Interpolazione dei fatti del motore e intervalli
 * derivati dagli stili stanno in glossary-data.ts.
 * Budget D-059 (31/10/2026): definizioni e «perché» stanno nel catalogo
 * della lingua, italiano compreso (GLOSSARY_TEXT_IT in
 * domain-i18n-defaults.ts, nel bundle `it`); qui restano il nome (lo usano la
 * voce e Alexa per riconoscere il termine), simbolo, unità, formula, fasce e
 * collegamenti, con il segnaposto T al posto dei testi. getLocalizedTerm
 * unisce dati e catalogo. */

export type GlossaryCategory =
  | "technique"
  | "flour"
  | "rheology"
  | "fermentation"
  | "thermal"
  | "chemistry"
  | "mechanics"
  | "scoring";

/** FW-04 (S12-A-11): pagine che approfondiscono una voce («Vedi anche»). */
export type GlossaryPage = "profile" | "pre-ferments" | "troubleshooting";

export interface GlossaryTerm {
  id: string;
  name: string;
  symbol?: string;
  category: GlossaryCategory;
  /** FW-04 (S12-B-08): livello 1, in parole semplici; si mostra per primo. */
  plainDefinition?: string;
  definition: string;
  unit?: string;
  formula?: string;
  /** FW-05: `key` lega una fascia a una regola del motore (scala della W).
   *  FW-04 (S12-A-14): `value` è sempre il numero o l'intervallo, `label`
   *  che cosa vuol dire, `note` un esempio. */
  ranges?: { label: string; value: string; note?: string; key?: string }[];
  whyImportant?: string;
  relatedTerms?: string[];
  relatedPages?: GlossaryPage[];
  /** FW-04: note del registro della scienza (FW-01) non già collegate con
   *  ScienceNote.glossaryTermId; il test verifica che esistano. */
  noteIds?: string[];
}

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, { label: string; description: string }> = {
  /* FW-04 (S12-B-07): le parole del procedimento vengono prima. */
  technique: {
    label: "Gesti e fasi",
    description: "Le parole del procedimento, dall'impasto al forno",
  },
  flour: {
    label: "Farine",
    description: "Tipi di farina e come leggerli",
  },
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

/** Segnaposto di un testo che sta nel catalogo della lingua: tiene la
 *  presenza del campo e l'ordine delle chiavi (risposte MCP). Visibile se
 *  arrivasse a schermo, come le chiavi grezze. */
export const GLOSSARY_TEXT = "⟦glossario⟧";
const T = GLOSSARY_TEXT;

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  /* ═══ REOLOGIA ═══ */
  {
    id: "w_alveograph",
    name: "W (Alveografo di Chopin)",
    plainDefinition: T,
    symbol: "W",
    category: "rheology",
    definition: T,
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
    whyImportant: T,
    relatedTerms: ["p_tenacity", "l_extensibility", "pl_ratio"],
  },
  {
    id: "p_tenacity",
    name: "P (Tenacità)",
    plainDefinition: T,
    symbol: "P",
    category: "rheology",
    definition: T,
    unit: "mm H₂O",
    ranges: [
      { label: "Pizza", value: "40–80 mm" },
      { label: "Pane", value: "80–120 mm" },
      { label: "Croissant", value: "100–140 mm" },
    ],
    whyImportant: T,
    relatedTerms: ["w_alveograph", "pl_ratio"],
  },
  {
    id: "l_extensibility",
    name: "L (Estensibilità)",
    plainDefinition: T,
    symbol: "L",
    category: "rheology",
    definition: T,
    unit: "mm",
    ranges: [
      { label: "Pizza", value: "80–120 mm" },
      { label: "Pane", value: "60–100 mm" },
    ],
    whyImportant: T,
    relatedTerms: ["w_alveograph", "pl_ratio"],
  },
  {
    id: "pl_ratio",
    name: "P/L (Rapporto Tenacità/Estensibilità)",
    plainDefinition: T,
    symbol: "P/L",
    category: "rheology",
    definition: T,
    formula: "P/L = P (mm H₂O) / L (mm)",
    /* FW-05 (S12-A-04): esempi dagli intervalli degli stili (DERIVED_RANGES). */
    whyImportant: T,
    relatedTerms: ["w_alveograph", "p_tenacity", "l_extensibility"],
  },
  {
    id: "falling_number",
    name: "Falling Number (Hagberg-Perten)",
    plainDefinition: T,
    symbol: "FN",
    category: "rheology",
    definition: T,
    unit: "s",
    ranges: [
      { label: "Altissima amilasi · Impasto appiccicoso", value: "< 200", note: "Sconsigliato pizza" },
      { label: "Alta · Mollica umida", value: "200–250", note: "Pane rapido" },
      { label: "Media · Buon equilibrio", value: "250–300", note: "Pizza 8-12h" },
      { label: "Bassa · Asciutto, lento", value: "300–400", note: "Pizza 24-48h" },
      { label: "Molto bassa · Secco", value: "> 400", note: "Pasta secca" },
    ],
    whyImportant: T,
    relatedTerms: ["w_alveograph"],
  },
  {
    id: "hydration",
    name: "Idratazione (H%)",
    plainDefinition: T,
    symbol: "H%",
    category: "rheology",
    definition: T,
    unit: "%",
    formula: "H% = (peso acqua / peso farina) × 100",
    /* FW-05 (S12-A-04/B-04, S12-A-15): esempi dagli intervalli degli stili. */
    whyImportant: T,
    relatedTerms: ["w_alveograph", "absorption"],
  },
  {
    id: "absorption",
    name: "Assorbimento Acqua",
    category: "rheology",
    definition: T,
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
    name: "Stabilità Impasto",
    category: "rheology",
    definition: T,
    unit: "min",
    ranges: [
      { label: "Debole", value: "2–4 min" },
      { label: "Media", value: "5–8 min" },
      { label: "Forte", value: "10–15 min" },
      { label: "Manitoba", value: "15–20 min" },
    ],
    whyImportant: T,
  },

  /* ═══ FERMENTAZIONE ═══ */
  {
    id: "yeast",
    name: "Lievito (Saccharomyces cerevisiae)",
    category: "fermentation",
    definition: T,
    /* FW-05 (S12-B-04): la dose dipende da ore e temperatura; i valori sono
     * quelli che il motore calcola per alcuni scenari. */
    ranges: [
      { label: "Fresco, {yeastS1Hours} a {yeastS1Temp}", value: "{yeastS1Pct}", note: "Stima del modello" },
      { label: "Fresco, {yeastS2Hours} a {yeastS2Temp}", value: "{yeastS2Pct}", note: "Stima del modello" },
      { label: "Fresco, {yeastS3Hours} a {yeastS3Temp}", value: "{yeastS3Pct}", note: "Stima del modello" },
      { label: "Fresco, {yeastS4Hours} a {yeastS4Temp}", value: "{yeastS4Pct}", note: "Stima del modello" },
      { label: "Secco (attivo o istantaneo)", value: "≈ fresco × {yeastDryRatio}", note: "Stessa stima del fresco" },
    ],
    whyImportant: T,
    relatedTerms: ["q10", "arrhenius"],
  },
  {
    id: "lab",
    name: "LAB (Batteri Lattici)",
    plainDefinition: T,
    category: "fermentation",
    definition: T,
    whyImportant: T,
    relatedTerms: ["fodmap", "yeast"],
  },
  {
    id: "q10",
    name: "Q₁₀ (Coefficiente di Temperatura)",
    plainDefinition: T,
    symbol: "Q₁₀",
    category: "fermentation",
    definition: T,
    formula: "Q₁₀ = k(T+10) / k(T)",
    /* FW-05 (S12-A-01): valori e soglie letti dal motore (getQ10). */
    ranges: [
      { label: "Lievito commerciale ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Stima del modello, coerente con i dati di crescita a temperatura ambiente" },
      { label: "Lievito commerciale < {q10ComBreak}", value: "{q10ComBelow}", note: "Stima del modello, senza fonte" },
      { label: "Lievito madre > {q10SdBreak}", value: "{q10SdAbove}", note: "Stima del modello" },
      { label: "Lievito madre ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Stima del modello" },
    ],
    whyImportant: T,
    relatedTerms: ["arrhenius", "yeast"],
  },
  {
    id: "arrhenius",
    name: "Equazione di Arrhenius",
    category: "fermentation",
    definition: T,
    /* FW-05 (S12-A-01/A-02/B-02): la forma esatta, e il motore non la usa. */
    formula: "k = A · e^(−Eₐ / (R · T)), con T in kelvin",
    whyImportant: T,
    relatedTerms: ["q10"],
  },
  {
    id: "biga",
    name: "Biga",
    category: "fermentation",
    definition: T,
    whyImportant: T,
    relatedTerms: ["poolish", "autolysis"],
  },
  {
    id: "poolish",
    name: "Poolish",
    category: "fermentation",
    definition: T,
    whyImportant: T,
    relatedTerms: ["biga", "autolysis"],
  },
  {
    id: "autolysis",
    name: "Autolisi",
    category: "fermentation",
    definition: T,
    whyImportant: T,
    relatedTerms: ["biga", "poolish"],
  },
  {
    id: "bulk_fermentation",
    name: "Puntata (Bulk Fermentation)",
    category: "fermentation",
    definition: T,
    whyImportant: T,
  },
  {
    id: "ball_fermentation",
    name: "Appretto (Ball Fermentation)",
    category: "fermentation",
    definition: T,
    whyImportant: T,
  },

  /* ═══ TERMICA ═══ */
  {
    id: "maillard",
    name: "Reazione di Maillard",
    category: "thermal",
    definition: T,
    whyImportant: T,
    relatedTerms: ["caramelization"],
  },
  {
    id: "caramelization",
    name: "Caramellizzazione",
    category: "thermal",
    definition: T,
    whyImportant: T,
    relatedTerms: ["maillard"],
  },
  {
    id: "starch_gelatinization",
    name: "Gelatinizzazione Amido",
    category: "thermal",
    definition: T,
    whyImportant: T,
    relatedTerms: ["retrogradation"],
  },
  {
    id: "retrogradation",
    name: "Retrogradazione",
    category: "thermal",
    definition: T,
    whyImportant: T,
    relatedTerms: ["starch_gelatinization"],
  },
  {
    id: "thermal_conductivity",
    name: "Conducibilità Termica",
    symbol: "k",
    category: "thermal",
    definition: T,
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
    whyImportant: T,
  },

  /* ═══ CHIMICA ═══ */
  {
    id: "fodmap",
    name: "FODMAP",
    category: "chemistry",
    definition: T,
    whyImportant: T,
    relatedTerms: ["lab"],
  },
  {
    id: "histamine",
    name: "Istamina",
    category: "chemistry",
    definition: T,
    whyImportant: T,
    relatedTerms: ["lab", "fodmap"],
  },
  {
    id: "gluten",
    name: "Glutine",
    category: "chemistry",
    definition: T,
    whyImportant: T,
    relatedTerms: ["proteolysis", "w_alveograph", "sourdough"],
    relatedPages: ["profile"],
  },
  {
    id: "proteolysis",
    name: "Proteolisi",
    category: "chemistry",
    definition: T,
    whyImportant: T,
    relatedTerms: ["gluten"],
  },

  /* ═══ MECCANICA ═══ */
  {
    id: "thickness_factor",
    name: "Carico d’impasto (Thickness Factor, TF)",
    plainDefinition: T,
    symbol: "TF",
    category: "mechanics",
    definition: T,
    unit: "g/cm²",
    formula: "TF = peso panetto (g) / area pizza (cm²)",
    /* FW-05 (S11-V-01, S12-A-05): valori calcolati dal motore, niente mm senza fonte. */
    whyImportant: T,
  },
  {
    id: "friction_factor",
    name: "Attrito dell'impastatrice",
    category: "mechanics",
    definition: T,
    unit: "°C",
    ranges: [
      { label: "A mano", value: "0" },
      { label: "Impastatrice a forcella", value: "2" },
      { label: "Spirale", value: "3" },
      { label: "Planetaria domestica (impasti da cucina)", value: "4" },
      { label: "Planetaria", value: "5" },
    ],
    whyImportant: T,
    relatedTerms: ["rule_of_55"],
  },
  {
    id: "rule_of_55",
    name: "Temperatura dell'acqua (Regola 55)",
    category: "mechanics",
    definition: T,
    formula: "T_acqua = 3 × T_impasto − T_ambiente − T_farina − attrito",
    whyImportant: T,
    relatedTerms: ["friction_factor"],
  },

  /* ═══ PUNTEGGI ═══ */
  {
    id: "a_score",
    name: "A-Score (Autenticità)",
    category: "scoring",
    definition: T,
    /* FW-05 (S12-A-03/B-03): pesi, fasce e tetti come li calcola il motore. */
    formula: "A = Ingredienti × {authWIngredients} + Processo × {authWProcess} + Attrezzatura × {authWEquipment}",
    ranges: [
      { label: "Rigorosamente autentica", value: "{aBand0}" },
      { label: "Fedele con adattamenti", value: "{aBand1}" },
      { label: "Ispirata ma modificata", value: "{aBand2}" },
      { label: "Liberamente interpretata", value: "{aBand3}" },
    ],
    whyImportant: T,
  },
  {
    id: "f_score",
    name: "F-Score (Facilità)",
    category: "scoring",
    definition: T,
    formula: "F = Forno × {feasWOven} + Farina × {feasWFlour} + Esperienza × {feasWSkill}",
    ranges: [
      { label: "Altamente fattibile", value: "{fBand0}" },
      { label: "Fattibile con attenzione", value: "{fBand1}" },
      { label: "Difficile", value: "{fBand2}" },
      { label: "Alto rischio", value: "{fBand3}" },
    ],
    whyImportant: T,
  },
  {
    id: "d_score",
    name: "D-Score (Maturazione stimata)",
    category: "scoring",
    definition: T,
    ranges: [
      { label: "Indice alto", value: "{dBand0}" },
      { label: "Indice medio-alto", value: "{dBand1}" },
      { label: "Indice medio", value: "{dBand2}" },
      { label: "Indice basso", value: "{dBand3}" },
    ],
    relatedTerms: ["fodmap", "q10"],
  },
  /* ═══ GESTI E FASI — FW-04 (D-044, S12-B-07, S09-A-15) ═══ */
  {
    id: "dough_division",
    name: "Staglio",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["bulk_fermentation", "ball_shaping", "ball_fermentation"],
  },
  {
    id: "ball_shaping",
    name: "Pirlatura",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["dough_division", "ball_fermentation"],
  },
  {
    id: "gluten_development",
    name: "Incordatura",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["gluten", "folds", "stability"],
  },
  {
    id: "folds",
    name: "Pieghe",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["gluten_development", "hydration"],
  },
  {
    id: "poke_test",
    name: "Prova del dito (poke test)",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["ball_fermentation", "bulk_fermentation"],
    relatedPages: ["troubleshooting"],
  },
  {
    id: "cornicione",
    name: "Cornicione",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["hydration", "maillard"],
  },
  {
    id: "oven_floor_dome",
    name: "Platea e cielo",
    category: "technique",
    definition: T,
    whyImportant: T,
    relatedTerms: ["thermal_conductivity", "maillard"],
    relatedPages: ["troubleshooting"],
  },
  {
    id: "pre_ferment",
    name: "Prefermento",
    category: "fermentation",
    definition: T,
    whyImportant: T,
    relatedTerms: ["biga", "poolish", "sourdough", "autolysis"],
    relatedPages: ["pre-ferments"],
    noteIds: ["pre-ferment"],
  },
  {
    id: "sourdough",
    name: "Lievito madre",
    category: "fermentation",
    definition: T,
    whyImportant: T,
    relatedTerms: ["lab", "yeast", "pre_ferment"],
    noteIds: ["sourdough-starter-dose"],
  },

  /* ═══ FARINE — FW-04 (S15-A-09) ═══ */
  {
    id: "flour_type",
    name: "Tipo di farina (00, 0, 1, 2, integrale)",
    category: "flour",
    definition: T,
    whyImportant: T,
    relatedTerms: ["w_alveograph", "manitoba", "semola_rimacinata"],
    noteIds: ["flour-w-by-grade"],
  },
  {
    id: "manitoba",
    name: "Manitoba",
    category: "flour",
    definition: T,
    whyImportant: T,
    relatedTerms: ["w_alveograph", "flour_type"],
  },
  {
    id: "semola_rimacinata",
    name: "Semola rimacinata",
    category: "flour",
    definition: T,
    whyImportant: T,
    relatedTerms: ["flour_type", "gluten"],
  },
];

/** Le formule con parole da tradurre; le altre sono simboli uguali in ogni lingua. */
export const LOCALIZED_FORMULA_TERMS = ["hydration", "arrhenius", "thickness_factor", "rule_of_55", "a_score", "f_score"] as const;
