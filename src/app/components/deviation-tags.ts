/* === DEVIATION SIGNATURES & MULTI-DIMENSIONAL TAGS === */
/* Basato su Notion Pagina 05 · Tassonomia Pizza — Modello a 3 Assi */

/* === DEVIATION POINTS === */
export type DeviationPoint =
  | "dough_composition"
  | "dough_structure"
  | "fermentation_extreme"
  | "fermentation_hybrid"
  | "shaping_method"
  | "assembly_order"
  | "assembly_structure"
  | "assembly_timing"
  | "baking_medium"
  | "baking_sequence"
  | "baking_atmosphere"
  | "finishing_method"
  | "service_format";

export type DeviationCategory =
  | "canonical"
  | "parameter_variant"
  | "technique_variant"
  | "hybrid"
  | "experimental";

export interface DeviationSignature {
  deviation_points: DeviationPoint[];
  deviation_score: number; // 0.0 (canonico) - 1.0 (sperimentale)
  category: DeviationCategory;
  description: string;
}

/* === TAG MULTI-DIMENSIONALI === */
export interface RecipeTags {
  geographic_origin: string[];
  philosophy: string[];
  dough_technique: string[];
  hydration_category: "low" | "medium" | "high" | "extreme";
  baking_method: string[];
  texture_profile: string[];
  dietary_tags: string[];
  skill_required: "beginner" | "intermediate" | "advanced" | "expert";
  author_methods: string[];
  community_labels: string[];
  equipment_required: string[];
}

/* === DEVIATION DB PER STILE === */
export const STYLE_DEVIATIONS: Record<string, DeviationSignature> = {
  napoletana_stg: {
    deviation_points: [],
    deviation_score: 0.0,
    category: "canonical",
    description: "Rispetta integralmente disciplinare AVPN: impasto diretto, W 250-320, cottura legna 60-90s",
  },
  napoletana_canotto: {
    deviation_points: ["dough_structure", "fermentation_extreme"],
    deviation_score: 0.35,
    category: "technique_variant",
    description: "Cornicione esplosivo 'canotto', pre-fermento obbligatorio, fermentazione 24-72h",
  },
  teglia_romana: {
    deviation_points: [],
    deviation_score: 0.05,
    category: "canonical",
    description: "Metodo no-knead con pieghe, tradizione consolidata romana",
  },
  tonda_romana: {
    deviation_points: [],
    deviation_score: 0.0,
    category: "canonical",
    description: "Tradizione scrocchiarella: sottile, croccante, mattarello obbligatorio",
  },
  pinsa_romana: {
    deviation_points: ["dough_composition"],
    deviation_score: 0.25,
    category: "parameter_variant",
    description: "Mix multi-cereale (frumento/soia/riso), forma ovale, interpretazione contemporanea",
  },
  pala_romana: {
    deviation_points: [],
    deviation_score: 0.1,
    category: "parameter_variant",
    description: "Variante della teglia con stesura a pala, cottura direttamente su platea",
  },
  new_york: {
    deviation_points: [],
    deviation_score: 0.15,
    category: "parameter_variant",
    description: "Adattamento italo-americano con zucchero e olio, fetta grande pieghevole",
  },
  detroit: {
    deviation_points: ["assembly_structure"],
    deviation_score: 0.3,
    category: "parameter_variant",
    description: "Cheese crown (formaggio ai bordi caramellizzato), teglia Blue Steel",
  },
  chicago_deep: {
    deviation_points: ["assembly_order", "dough_composition"],
    deviation_score: 0.55,
    category: "hybrid",
    description: "Assemblaggio invertito (formaggio sotto, salsa sopra), burro 18%, forma 'torta'",
  },
  grandma_style: {
    deviation_points: [],
    deviation_score: 0.1,
    category: "parameter_variant",
    description: "Tradizione italo-americana casalinga, teglia rettangolare, stesura minima",
  },
  bonci_teglia: {
    deviation_points: ["fermentation_extreme"],
    deviation_score: 0.2,
    category: "parameter_variant",
    description: "Metodo Bonci: idratazione estrema 85-100%, pieghe al posto dell'impastamento",
  },
  focaccia_genovese: {
    deviation_points: [],
    deviation_score: 0.0,
    category: "canonical",
    description: "Disciplinare tradizionale genovese: salamoia, olio abbondante, crosta dorata",
  },
  sfincione: {
    deviation_points: [],
    deviation_score: 0.0,
    category: "canonical",
    description: "Street food palermitano: spugna soffice, cipolla, pangrattato",
  },
  focaccia_recco: {
    deviation_points: ["assembly_structure"],
    deviation_score: 0.4,
    category: "technique_variant",
    description: "Due sfoglie sottilissime con stracchino fuso, tecnica unica di Recco",
  },
  padellino_torino: {
    deviation_points: ["baking_medium"],
    deviation_score: 0.3,
    category: "parameter_variant",
    description: "Cottura iniziale in padella poi forno, tecnica torinese tradizionale",
  },
};

/* === TAG DB PER STILE === */
export const STYLE_TAGS: Record<string, RecipeTags> = {
  napoletana_stg: {
    geographic_origin: ["napoli", "campania"],
    philosophy: ["tradizionale", "stg_certified"],
    dough_technique: ["direct"],
    hydration_category: "medium",
    baking_method: ["wood_fired"],
    texture_profile: ["leopard_crust", "soft_center", "puffy_cornicione"],
    dietary_tags: [],
    skill_required: "advanced",
    author_methods: ["pepe_sensoriale", "pepe_sensory_layering", "bianco_long_ferment"],
    community_labels: ["disciplinare_avpn"],
    equipment_required: ["wood_oven", "pizza_peel"],
  },
  napoletana_canotto: {
    geographic_origin: ["napoli", "campania"],
    philosophy: ["contemporanea"],
    dough_technique: ["biga", "poolish", "autolisi"],
    hydration_category: "high",
    baking_method: ["electric_high_temp"],
    texture_profile: ["leopard_crust", "airy_crumb", "puffy_cornicione"],
    dietary_tags: ["high_digestibility"],
    skill_required: "advanced",
    author_methods: ["martucci_biga", "pepe_sensory_layering", "bianco_long_ferment"],
    community_labels: ["weekend_project"],
    equipment_required: ["high_temp_oven"],
  },
  teglia_romana: {
    geographic_origin: ["roma", "lazio"],
    philosophy: ["tradizionale", "contemporanea"],
    dough_technique: ["no_knead", "long_fermentation"],
    hydration_category: "extreme",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["thick_airy", "crispy_base", "cloud_crumb"],
    dietary_tags: ["high_digestibility"],
    skill_required: "beginner",
    author_methods: ["bonci_no_knead"],
    community_labels: ["beginner_friendly", "party_size"],
    equipment_required: ["baking_pan"],
  },
  tonda_romana: {
    geographic_origin: ["roma", "lazio"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "medium",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["crispy_thin"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["quick_cook", "beginner_friendly"],
    equipment_required: ["rolling_pin"],
  },
  pinsa_romana: {
    geographic_origin: ["roma", "lazio"],
    philosophy: ["contemporanea", "traditional_inspired"],
    dough_technique: ["direct", "long_fermentation"],
    hydration_category: "high",
    baking_method: ["electric_high_temp", "home_oven_compatible"],
    texture_profile: ["airy_crumb", "glassy_crust"],
    dietary_tags: ["high_digestibility"],
    skill_required: "intermediate",
    author_methods: [],
    community_labels: ["high_digestibility"],
    equipment_required: [],
  },
  pala_romana: {
    geographic_origin: ["roma", "lazio"],
    philosophy: ["contemporanea"],
    dough_technique: ["direct", "poolish"],
    hydration_category: "high",
    baking_method: ["electric_high_temp"],
    texture_profile: ["airy_crumb", "crispy_base"],
    dietary_tags: [],
    skill_required: "intermediate",
    author_methods: [],
    community_labels: [],
    equipment_required: ["pizza_peel"],
  },
  new_york: {
    geographic_origin: ["new_york", "usa_northeast"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct", "poolish"],
    hydration_category: "medium",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["foldable", "crispy_undercarriage"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: ["forkish_saturday"],
    community_labels: ["beginner_friendly", "party_size"],
    equipment_required: ["pizza_stone"],
  },
  detroit: {
    geographic_origin: ["detroit", "usa_midwest"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "high",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["cheese_crown", "thick_airy", "crispy_edges"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["beginner_friendly", "cheese_lovers"],
    equipment_required: ["detroit_pan"],
  },
  chicago_deep: {
    geographic_origin: ["chicago", "usa_midwest"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "low",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["deep_dish", "buttery_crust", "thick_sauce"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["comfort_food"],
    equipment_required: ["deep_dish_pan"],
  },
  grandma_style: {
    geographic_origin: ["new_york", "usa_northeast"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "medium",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["thin_crispy_base", "generous_oil"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["beginner_friendly", "comfort_food"],
    equipment_required: ["baking_pan"],
  },
  bonci_teglia: {
    geographic_origin: ["roma", "lazio"],
    philosophy: ["contemporanea"],
    dough_technique: ["no_knead", "long_fermentation"],
    hydration_category: "extreme",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["thick_airy", "cloud_crumb", "crispy_base"],
    dietary_tags: ["high_digestibility"],
    skill_required: "beginner",
    author_methods: ["bonci_no_knead"],
    community_labels: ["beginner_friendly", "party_size"],
    equipment_required: ["baking_pan"],
  },
  focaccia_genovese: {
    geographic_origin: ["genova", "liguria"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "medium",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["golden_crust", "soft_interior", "oily"],
    dietary_tags: ["vegan"],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["beginner_friendly", "breakfast"],
    equipment_required: ["baking_pan"],
  },
  sfincione: {
    geographic_origin: ["palermo", "sicilia"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "medium",
    baking_method: ["electric_any", "home_oven_compatible"],
    texture_profile: ["spongy", "thick_airy"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["street_food", "comfort_food"],
    equipment_required: ["baking_pan"],
  },
  focaccia_recco: {
    geographic_origin: ["recco", "liguria"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "low",
    baking_method: ["electric_high_temp"],
    texture_profile: ["crispy_thin", "cheese_filled"],
    dietary_tags: [],
    skill_required: "expert",
    author_methods: [],
    community_labels: ["showstopper"],
    equipment_required: [],
  },
  padellino_torino: {
    geographic_origin: ["torino", "piemonte"],
    philosophy: ["tradizionale"],
    dough_technique: ["direct"],
    hydration_category: "medium",
    baking_method: ["pan_baked", "home_oven_compatible"],
    texture_profile: ["soft_thick", "golden_base"],
    dietary_tags: [],
    skill_required: "beginner",
    author_methods: [],
    community_labels: ["beginner_friendly", "quick_cook"],
    equipment_required: ["cast_iron_pan"],
  },
};

/* === AUTHOR VARIANTS — MIGRATO (Audit motore 2026-05) ===
   Le varianti d'autore vivono ora nella Interpretation library
   (src/app/components/interpretation-library.ts) come unica fonte di verità:
   maestri, pizzerie, disciplinari e community con parametri assoluti.
   Il vecchio AUTHOR_VARIANTS (adjustment relativi) è stato rimosso;
   usa getInterpretationsForStyle(styleId) al suo posto. */

/* === DEVIATION CATEGORY LABELS === */
export const DEVIATION_CATEGORY_LABELS: Record<DeviationCategory, { label: string; emoji: string; color: string }> = {
  canonical: { label: "Canonico", emoji: "📜", color: "var(--cta)" },
  parameter_variant: { label: "Variazione parametrica", emoji: "🔧", color: "var(--tertiary)" },
  technique_variant: { label: "Variante tecnica", emoji: "⚙️", color: "var(--primary)" },
  hybrid: { label: "Ibridazione", emoji: "🔀", color: "var(--secondary)" },
  experimental: { label: "Sperimentale", emoji: "🧪", color: "var(--primary)" },
};

/* === HELPER: get deviation info for a style === */
export function getStyleDeviation(styleId: string): DeviationSignature {
  return STYLE_DEVIATIONS[styleId] ?? {
    deviation_points: [],
    deviation_score: 0,
    category: "canonical" as DeviationCategory,
    description: "",
  };
}

export function getStyleTags(styleId: string): RecipeTags | null {
  return STYLE_TAGS[styleId] ?? null;
}

/* getCompatibleVariants() rimosso (Audit motore 2026-05): usa
   getInterpretationsForStyle() da interpretation-library.ts. */