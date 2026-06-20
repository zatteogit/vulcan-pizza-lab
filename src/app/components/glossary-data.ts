/* === GLOSSARIO TECNICO — Appendice C === */
/* Basato su Notion Appendice C · Glossario Tecnico (302ed0f7e12081379cf4ce959ef2b1b3) */
/* i18n: getLocalizedTerm/Categories accept CmsContent */

import type { CmsContent } from './cms/cms-context';

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

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, { label: string; emoji: string; description: string }> = {
  rheology: {
    label: "Reologia",
    emoji: "📐",
    description: "Proprietà meccaniche della farina e dell'impasto",
  },
  fermentation: {
    label: "Fermentazione",
    emoji: "🦠",
    description: "Lievitazione, maturazione e processi biologici",
  },
  thermal: {
    label: "Termica",
    emoji: "🔥",
    description: "Trasferimento calore e cottura",
  },
  chemistry: {
    label: "Chimica",
    emoji: "🔬",
    description: "Composizione e reazioni chimiche",
  },
  mechanics: {
    label: "Meccanica",
    emoji: "⚙️",
    description: "Lavorazione, attrezzature e misure",
  },
  scoring: {
    label: "Punteggi",
    emoji: "📊",
    description: "Metriche di qualità Vulcan",
  },
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  /* ═══ REOLOGIA ═══ */
  {
    id: "w_alveograph",
    name: "W (Alveografo di Chopin)",
    symbol: "W",
    category: "rheology",
    definition: "Energia totale necessaria per espandere un alveolo di impasto fino a rottura. Misura la forza complessiva della farina.",
    unit: "10⁻⁴ J",
    formula: "W = ∫₀ᵗ P(t) dt",
    ranges: [
      { label: "Debole", value: "90–160", note: "Biscotti, cialde" },
      { label: "Media", value: "160–200", note: "Pan carrè, focaccia" },
      { label: "Medio-forte", value: "200–280", note: "Pizza napoletana" },
      { label: "Forte", value: "280–350", note: "Pane grande lievitazione" },
      { label: "Molto forte", value: "350–450", note: "Panettone, croissant" },
    ],
    whyImportant: "W basso (<180): impasto estensibile, fermentazione breve. W medio (220-280): ideale napoletana, tollera 18-30h. W alto (>300): impasto tenace, serve per impasti ricchi.",
    relatedTerms: ["p_tenacity", "l_extensibility", "pl_ratio"],
  },
  {
    id: "p_tenacity",
    name: "P (Tenacità)",
    symbol: "P",
    category: "rheology",
    definition: "Resistenza massima alla deformazione. Picco della curva alveografica — quanto l'impasto resiste allo stiramento.",
    unit: "mm H₂O",
    ranges: [
      { label: "Pizza", value: "40–80 mm" },
      { label: "Pane", value: "80–120 mm" },
      { label: "Croissant", value: "100–140 mm" },
    ],
    whyImportant: "P alto: impasto 'duro', tiene forma in cottura. P basso: impasto 'molle', facile stendere, può collassare.",
    relatedTerms: ["w_alveograph", "pl_ratio"],
  },
  {
    id: "l_extensibility",
    name: "L (Estensibilità)",
    symbol: "L",
    category: "rheology",
    definition: "Lunghezza massima raggiunta dall'alveolo prima di rottura. Misura quanto l'impasto si può allungare.",
    unit: "mm",
    ranges: [
      { label: "Pizza", value: "80–120 mm" },
      { label: "Pane", value: "60–100 mm" },
    ],
    whyImportant: "L alto: impasto estensibile, facile stendere senza strappi. L basso: impasto corto, si strappa.",
    relatedTerms: ["w_alveograph", "pl_ratio"],
  },
  {
    id: "pl_ratio",
    name: "P/L (Rapporto Tenacità/Estensibilità)",
    symbol: "P/L",
    category: "rheology",
    definition: "Indice di bilanciamento meccanico. Rapporto tra resistenza e estensibilità dell'impasto.",
    unit: "adimensionale",
    formula: "P/L = P (mm H₂O) / L (mm)",
    ranges: [
      { label: "<0.4 Molto estensibile", value: "Collassa facilmente", note: "Pinsa" },
      { label: "0.4–0.5 Estensibile", value: "Facile lavorare", note: "Napoletana classica" },
      { label: "0.5–0.7 Bilanciato", value: "Buon equilibrio", note: "Napoletana moderna, pane" },
      { label: "0.7–1.0 Tenace", value: "Resistente", note: "Pane grande lievitazione" },
      { label: ">1.0 Molto tenace", value: "Elastico, ritorna", note: "Croissant" },
    ],
    whyImportant: "P/L ottimale (0.5-0.6): cornicione alto + base sottile. <0.4: pizza piatta. >0.8: impasto 'di gomma'.",
    relatedTerms: ["w_alveograph", "p_tenacity", "l_extensibility"],
  },
  {
    id: "falling_number",
    name: "Falling Number (Hagberg-Perten)",
    symbol: "FN",
    category: "rheology",
    definition: "Tempo impiegato da un'asta a cadere attraverso una sospensione di farina riscaldata. Misura l'attività amilasica.",
    unit: "secondi",
    ranges: [
      { label: "<200 Altissima amilasi", value: "Impasto appiccicoso", note: "Sconsigliato pizza" },
      { label: "200–250 Alta", value: "Mollica umida", note: "Pane rapido" },
      { label: "250–300 Media", value: "Buon equilibrio", note: "Pizza 8-12h" },
      { label: "300–400 Bassa", value: "Asciutto, lento", note: "Pizza 24-48h" },
      { label: ">400 Molto bassa", value: "Secco", note: "Pasta secca" },
    ],
    whyImportant: "FN basso (<250): fermentazione rapida ma impasto instabile. FN alto (>300): stabile per lunghe maturazioni.",
    relatedTerms: ["w_alveograph"],
  },
  {
    id: "hydration",
    name: "Idratazione (H%)",
    symbol: "H%",
    category: "rheology",
    definition: "Percentuale in peso di acqua rispetto alla farina nell'impasto.",
    unit: "%",
    formula: "H% = (peso acqua / peso farina) × 100",
    ranges: [
      { label: "Napoletana classica", value: "55–60%", note: "Morbido, lavorabile" },
      { label: "Napoletana contemporanea", value: "60–65%", note: "Cornicione leggero" },
      { label: "Canotto", value: "65–70%", note: "Alveoli grandi" },
      { label: "Pinsa romana", value: "75–85%", note: "Steso in teglia" },
      { label: "Focaccia/Bonci", value: "85–100%+", note: "Pastella" },
    ],
    whyImportant: "H bassa (<55%): croccante, facile. H media (60-65%): bilanciamento. H alta (>70%): serve farina forte (W>280) e abilità.",
    relatedTerms: ["w_alveograph", "absorption"],
  },
  {
    id: "absorption",
    name: "Assorbimento Acqua",
    category: "rheology",
    definition: "Massima quantità d'acqua che una farina può assorbire mantenendo consistenza lavorabile. Dipende da proteine, amido danneggiato, fibre.",
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
    definition: "Tempo durante il quale l'impasto mantiene consistenza ottimale durante mixing. Misurata con farinografo.",
    unit: "minuti",
    ranges: [
      { label: "Debole", value: "2–4 min" },
      { label: "Media", value: "5–8 min" },
      { label: "Forte", value: "10–15 min" },
      { label: "Manitoba", value: "15–20 min" },
    ],
    whyImportant: "Stabilità bassa (<5 min): degrada se overmixed. Alta (>10 min): tollera errori operativi.",
  },

  /* ═══ FERMENTAZIONE ═══ */
  {
    id: "yeast",
    name: "Lievito (Saccharomyces cerevisiae)",
    category: "fermentation",
    definition: "Fungo unicellulare che converte zuccheri in CO₂ + etanolo + composti aromatici.",
    ranges: [
      { label: "Fresco", value: "0.5–2.0%", note: "Umidità 70%, frigo 4°C" },
      { label: "Secco attivo", value: "0.3–1.0%", note: "Idratare prima" },
      { label: "Secco istantaneo", value: "0.2–0.8%", note: "Diretto" },
    ],
    whyImportant: "Temp ottimale: 28-32°C. Min 4°C (dormiente). Max 40°C (inibito). Morte >55°C.",
    relatedTerms: ["q10", "arrhenius"],
  },
  {
    id: "lab",
    name: "LAB (Batteri Lattici)",
    category: "fermentation",
    definition: "Batteri che fermentano zuccheri producendo acido lattico (e acetico). Presenti nel lievito madre.",
    whyImportant: "Abbassano pH (4.0-4.5), aumentano acidità, degradano FODMAP (fruttani), inibiscono muffe. Temp ottimale: 28-32°C.",
    relatedTerms: ["fodmap", "yeast"],
  },
  {
    id: "q10",
    name: "Q₁₀ (Coefficiente di Temperatura)",
    symbol: "Q₁₀",
    category: "fermentation",
    definition: "Fattore moltiplicativo della velocità di reazione biochimica per ogni aumento di 10°C.",
    unit: "adimensionale",
    formula: "Q₁₀ = k(T+10) / k(T)",
    ranges: [
      { label: "Lievito commerciale ≥10°C", value: "2.0", note: "Standard" },
      { label: "Lievito commerciale <10°C", value: "1.6", note: "Cold adapted" },
      { label: "Lievito madre >15°C", value: "2.2", note: "Sourdough" },
      { label: "Lievito madre ≤15°C", value: "1.9", note: "Sourdough cold" },
    ],
    whyImportant: "Fermentazione raddoppia ogni +10°C. 24h a 18°C ≈ 12h a 28°C.",
    relatedTerms: ["arrhenius", "yeast"],
  },
  {
    id: "arrhenius",
    name: "Equazione di Arrhenius",
    category: "fermentation",
    definition: "Descrive la dipendenza della velocità di reazione dalla temperatura assoluta.",
    formula: "k(T) = k_ref × e^(β × (T - T_ref))",
    whyImportant: "Con β=0.075 e T_ref=18°C → Q₁₀ ≈ 2.12. Usato nel motore Vulcan per calcolare dosaggio lievito e tempi.",
    relatedTerms: ["q10"],
  },
  {
    id: "biga",
    name: "Biga",
    category: "fermentation",
    definition: "Pre-impasto asciutto (44-50% idratazione) con farina + acqua + lievito, fermentato 16-24h a 16-18°C.",
    whyImportant: "Aumenta forza, estensibilità, sapore complesso, alveolatura irregolare rustica, shelf life più lunga. Dosaggio: 20-40% su farina totale.",
    relatedTerms: ["poolish", "autolysis"],
  },
  {
    id: "poolish",
    name: "Poolish",
    category: "fermentation",
    definition: "Pre-impasto liquido (100% idratazione) con farina + acqua 1:1 + lievito, fermentato 12-16h a 16-18°C.",
    whyImportant: "Estensibilità alta, alveolatura fine e uniforme, sapore dolce-acidulo, crosta sottile croccante. Poolish = estensibilità; Biga = forza.",
    relatedTerms: ["biga", "autolysis"],
  },
  {
    id: "autolysis",
    name: "Autolisi",
    category: "fermentation",
    definition: "Riposo di farina + acqua (senza lievito/sale) per 20-60 min. Enzimi proteasi sviluppano il glutine spontaneamente.",
    whyImportant: "Riduce mixing time -30-50%, aumenta estensibilità, migliore idratazione. 20-30 min per W<200, 45-60 min per W>280.",
    relatedTerms: ["biga", "poolish"],
  },
  {
    id: "bulk_fermentation",
    name: "Puntata (Bulk Fermentation)",
    category: "fermentation",
    definition: "Prima fase fermentazione dopo mixing, prima della divisione in panetti. L'impasto riposa in massa unica 30 min – 4h.",
    whyImportant: "Rilassamento glutine, inizio fermentazione, sviluppo aromi, aumento volume 20-50%.",
  },
  {
    id: "ball_fermentation",
    name: "Appretto (Ball Fermentation)",
    category: "fermentation",
    definition: "Seconda fase fermentazione dopo divisione in panetti. Ogni panetto riposa singolarmente 4-48h a 4-22°C.",
    whyImportant: "Fermentazione principale, maturazione proteolisi, sviluppo volume finale, stabilizzazione pH.",
  },

  /* ═══ TERMICA ═══ */
  {
    id: "maillard",
    name: "Reazione di Maillard",
    category: "thermal",
    definition: "Reazione non-enzimatica tra aminoacidi e zuccheri riducenti ad alta temperatura (>140°C).",
    whyImportant: "Crosta dorata (melanoidine), aroma tostato (pirazine), leopard spotting a 300°C+. Ottimale 160-180°C.",
    relatedTerms: ["caramelization"],
  },
  {
    id: "caramelization",
    name: "Caramellizzazione",
    category: "thermal",
    definition: "Degradazione termica degli zuccheri (senza proteine) ad alta temperatura (>150°C saccarosio, >120°C fruttosio).",
    whyImportant: "Contribuisce a macchie scure su cornicione. Meno rilevante di Maillard nella pizza (poche proteine in superficie).",
    relatedTerms: ["maillard"],
  },
  {
    id: "starch_gelatinization",
    name: "Gelatinizzazione Amido",
    category: "thermal",
    definition: "Transizione amido da stato cristallino a gelatinoso assorbendo acqua. Inizio 55-60°C, picco 65-70°C, completamento 80-85°C.",
    whyImportant: "Mollica: rende amido digeribile (<55°C al cuore = amido crudo). Crosta: >100°C → croccante.",
    relatedTerms: ["retrogradation"],
  },
  {
    id: "retrogradation",
    name: "Retrogradazione",
    category: "thermal",
    definition: "Ricristallizzazione dell'amido gelatinizzato durante conservazione. Massima a 4°C (frigo).",
    whyImportant: "Mollica diventa dura e 'stantia'. Ritardare con: grassi 2-3%, zuccheri 1-2%, fermentazione lunga, idratazione alta.",
    relatedTerms: ["starch_gelatinization"],
  },
  {
    id: "thermal_conductivity",
    name: "Conducibilità Termica",
    symbol: "k",
    category: "thermal",
    definition: "Capacità di un materiale di condurre calore.",
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
    whyImportant: "Acciaio (k=50): ideale forni casa 280°C, cottura 6-8 min. Pietra (k=2): ideale forni legna 450°C+, cottura 60-90s.",
  },

  /* ═══ CHIMICA ═══ */
  {
    id: "fodmap",
    name: "FODMAP",
    category: "chemistry",
    definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Carboidrati a catena corta fermentabili (fruttani 1-3% nel grano).",
    whyImportant: "Intestino non digerisce fruttani → batteri fermentano → gas/gonfiore. Fermentazione lunga riduce: 24h→60-70%, 48h→80-85%.",
    relatedTerms: ["lab"],
  },
  {
    id: "histamine",
    name: "Istamina",
    category: "chemistry",
    definition: "Ammina biogena da decarbossilazione dell'istidina. Prodotta da LAB durante fermentazione, presente in formaggi stagionati e salumi.",
    whyImportant: "Accumulo lineare con tempo. Madre 24h/28°C → 30-50 mg/kg. Soggetti con deficit DAO: reazione pseudo-allergica. Soluzione: fermentazione breve (<12h) + lievito commerciale.",
    relatedTerms: ["lab", "fodmap"],
  },
  {
    id: "gluten",
    name: "Glutine",
    category: "chemistry",
    definition: "Complesso proteico viscoelastico formato da gliadina (estensibile) + glutenina (tenace) in presenza di acqua e mixing.",
    whyImportant: "Elasticità da glutenine (legami S-S), viscosità da gliadine (legami H). Proteolisi lunga taglia legami → impasto più estensibile.",
    relatedTerms: ["proteolysis", "w_alveograph"],
  },
  {
    id: "proteolysis",
    name: "Proteolisi",
    category: "chemistry",
    definition: "Degradazione proteine in peptidi e aminoacidi da parte di enzimi proteasi. Target: glutine.",
    whyImportant: "Facilità stesura, aumento digeribilità, aminoacidi liberi → sapore umami. Eccessiva (>72h): impasto troppo molle. Ottimale: 24-48h.",
    relatedTerms: ["gluten"],
  },

  /* ═══ MECCANICA ═══ */
  {
    id: "thickness_factor",
    name: "Thickness Factor (TF)",
    symbol: "TF",
    category: "mechanics",
    definition: "Densità superficiale impasto — massa per unità area. Indica quanto impasto c'è per cm².",
    unit: "g/cm²",
    formula: "TF = peso panetto (g) / area pizza (cm²)",
    ranges: [
      { label: "Napoletana", value: "0.30–0.36", note: "6-7 mm" },
      { label: "Romana tonda", value: "0.20–0.25", note: "4-5 mm" },
      { label: "New York", value: "0.40–0.50", note: "8-10 mm" },
      { label: "Chicago deep dish", value: "1.00–1.30", note: "20-26 mm" },
    ],
    whyImportant: "Determina tempo cottura, croccantezza e densità calorica. Metrica originale Progetto Vulcan.",
  },
  {
    id: "friction_factor",
    name: "Friction Factor (Fattore Attrito)",
    category: "mechanics",
    definition: "Incremento temperatura impasto (°C) per minuto di mixing, dovuto ad attrito meccanico.",
    unit: "°C/min",
    ranges: [
      { label: "Manuale", value: "0.0" },
      { label: "Planetaria domestica", value: "0.8–1.0" },
      { label: "Spirale professionale", value: "0.4–0.6" },
      { label: "Forcella", value: "0.2–0.3" },
    ],
    whyImportant: "Mixing genera calore → alza temperatura → fermentazione troppo rapida. Usato nella Regola del 55.",
    relatedTerms: ["rule_of_55"],
  },
  {
    id: "rule_of_55",
    name: "Regola del 55",
    category: "mechanics",
    definition: "Formula empirica per calcolare temperatura acqua necessaria a raggiungere temperatura impasto target.",
    formula: "T_acqua = 55 − (T_ambiente + T_farina + ΔT_attrito)",
    whyImportant: "55 = costante empirica (varia 50-60 per diverse macchine). ΔT_attrito = Friction Factor × tempo mixing.",
    relatedTerms: ["friction_factor"],
  },

  /* ═══ PUNTEGGI ═══ */
  {
    id: "a_score",
    name: "A-Score (Authenticity)",
    category: "scoring",
    definition: "Punteggio 0-100 che misura aderenza di una ricetta al disciplinare dello stile target.",
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
    name: "F-Score (Feasibility)",
    category: "scoring",
    definition: "Punteggio 0-100 che misura realizzabilità pratica data equipaggiamento e abilità utente.",
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
    name: "D-Score (Digestibility)",
    category: "scoring",
    definition: "Punteggio 0-100 che stima digeribilità basato su ore fermentazione normalizzate e riduzione FODMAP.",
    formula: "D = min(100, 20 + 1.5 × t_eff,18°C)",
    ranges: [
      { label: "85-100", value: "Alta (>48h equivalenti)" },
      { label: "70-84", value: "Media-alta (24-48h)" },
      { label: "50-69", value: "Media (12-24h)" },
      { label: "<50", value: "Bassa (<12h)" },
    ],
    relatedTerms: ["fodmap", "q10"],
  },
];

/** Termini raggruppati per categoria */
export function getTermsByCategory(cms?: CmsContent): Record<GlossaryCategory, GlossaryTerm[]> {
  const map = {} as Record<GlossaryCategory, GlossaryTerm[]>;
  for (const cat of Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[]) {
    map[cat] = GLOSSARY_TERMS.map(term => term.category === cat ? getLocalizedTerm(term, cms) : term)
      .filter((term) => term.category === cat);
  }
  return map;
}

/** Trova un termine per ID (localized) */
export function getTermById(id: string, cms?: CmsContent): GlossaryTerm | undefined {
  const term = GLOSSARY_TERMS.find((t) => t.id === id);
  return term ? getLocalizedTerm(term, cms) : undefined;
}

/* === i18n: LOCALIZED GETTERS === */

/** Return localized term content (falls back to Italian hardcoded) */
export function getLocalizedTerm(term: GlossaryTerm, cms?: CmsContent): GlossaryTerm {
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
