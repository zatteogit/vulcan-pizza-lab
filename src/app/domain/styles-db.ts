/* ═══ STYLES DB — dati puri, separati dal motore (audit lug 2026) ═══
 * Questo modulo NON deve importare valori dal motore: è ciò che permette
 * alla shell (styles-override-context) di caricare gli stili senza
 * trascinarsi dietro pizza-engine + topping-library nel chunk d'ingresso.
 * I tipi arrivano da pizza-engine come import type (azzerati a runtime). */

import type { FamilyId, PizzaStyle, StyleOrigin } from "./pizza-engine";

export const PIZZA_FAMILIES: Record<
  FamilyId,
  { name: string; description: string; emoji: string }
> = {
  napoletana: {
    name: "Napoletana",
    description:
      "Leggerezza, lievitazione naturale, cottura veloce ad altissima temperatura",
    emoji: "🇮🇹",
  },
  romana: {
    name: "Romana",
    description:
      "Dalla croccantezza estrema della Scrocchiarella all'alta idratazione della Teglia",
    emoji: "🏛️",
  },
  americana: {
    name: "Americana",
    description:
      "Adattamento italo-americano: praticità, street food, varietà regionali",
    emoji: "🗽",
  },
  contemporanea: {
    name: "Contemporanea",
    description:
      "Digeribilità, sperimentazione, alta idratazione, tecniche avanzate",
    emoji: "🔬",
  },
};

/** Uno stile appartiene a una famiglia se è la sua primaria O una secondaria.
 * Usato dai filtri (non esclusivi) — il grouping usa solo `style.family`. */
export function styleMatchesFamily(style: PizzaStyle, family: FamilyId): boolean {
  return style.family === family || (style.families?.includes(family) ?? false);
}

/** Compact origin for cards, with provincial context for smaller localities. */
export function shortOrigin(origin: StyleOrigin): string {
  return origin.province ? `${origin.city} (${origin.province})` : origin.city;
}
/** Origine completa per viste di dettaglio: "Napoli, Campania, Italia". */
export function formatOrigin(origin: StyleOrigin): string {
  return [shortOrigin(origin), origin.region, origin.country].filter(Boolean).join(", ");
}

export const STYLES_DB: Record<string, PizzaStyle> = {
  napoletana_stg: {
    id: "napoletana_stg",
    name: "Napoletana STG",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      // C-4 (D-016): lo stile segue la STG (reg. UE 97/2010); il disciplinare
      // AVPN 2024 è la versione «stg_avpn». Fonti in docs/fonti-dati.md §1.1.
      // W: la STG ammette 220–380; si tiene la forbice AVPN 250–320, che sta
      // dentro i limiti di legge ed è più utile come guida.
      flour_w_range: [250, 320],
      flour_pl_range: [0.55, 0.70], // STG e AVPN: 0,50–0,70
      hydration_pct_range: [55, 62],
      // Audit motore 2026-06: ripristinato a 2.8% (disciplinare AVPN ~50 g/L
      // acqua → a H58-62 ≈ 2.6-3.0% sulla farina). Lo stile ha la STG come riferimento:
      // l'omogeneità con Canotto/Teglia NON deve prevalere sul disciplinare per
      // lo stile-bandiera. (Audit role-play — finding F9.)
      salt_pct: 2.8,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      // STG: 2 h in massa + 4–6 h in panetti a circa 25 °C, poi uso entro 6 h
      // → 6–14 h in tutto. Era 8–24, che nessun testo riporta.
      fermentation_hours_range: [6, 14],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 250, // STG: 180–250 g. Era 270 (valore AVPN, ora nella versione)
      thickness_factor: 0.34,
      diameter_cm: 32,
    },
    baking: {
      oven_type_required: "wood",
      temp_c_range: [430, 500],
      temp_c_ideal: 485,
      cook_time_sec_range: [60, 90],
      cook_time_sec_ideal: 75,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: true,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    description:
      "Pizza Napoletana STG secondo il regolamento UE 97/2010. Cornicione gonfio, centro sottile, leopardatura.",
    key_characteristics: [
      "Cornicione 1-2cm gonfio",
      "Centro 3-4mm sottile",
      "Crosta leopardata",
      "Cottura 60-90s",
    ],
    hydration_category: "medium",
    emoji: "🍕",
    servings_per_unit: [1, 1], // Napoletana = 1 pizza a testa
    default_topping_ref: "margherita_napoletana_avpn",
  },
  napoletana_canotto: {
    id: "napoletana_canotto",
    name: "Canotto Contemporanea",
    family: "napoletana",
    families: ["contemporanea"], // Napoletano d'origine ma tecnica contemporanea
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [280, 340], // Martucci Caputo Saccorosso W300 — era [300,350]
      flour_pl_range: [0.50, 0.65], // Più estensibile per cornicione esplosivo
      hydration_pct_range: [65, 75], // Martucci 68%, Salvo 70%, pro 75% — era [70,80]
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "biga|poolish",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 300,
      thickness_factor: 0.36,
      diameter_cm: 33,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [400, 480],
      temp_c_ideal: 450,
      cook_time_sec_range: [90, 150],
      cook_time_sec_ideal: 120,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: true,
    suitable_for_beginner: false,
    description:
      'Cornicione esplosivo "canotto d\'aria", alveolatura estrema, alta digeribilità.',
    key_characteristics: [
      'Cornicione 3-4cm "canotto"',
      "Alveolatura estrema",
      "Maturazione 24-72h",
      "Digeribilità alta",
    ],
    hydration_category: "high",
    emoji: "🎈",
    servings_per_unit: [1, 1], // Canotto = 1 pizza a testa
    default_topping_ref: "margherita_napoletana_avpn",
  },
  teglia_romana: {
    id: "teglia_romana",
    name: "Teglia Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [300, 380], // D-029: disciplinare APITER della Confraternita della Pizza (2016)
      flour_pl_range: [0.50, 0.60], // APITER: 0.50-0.60 stretto
      hydration_pct_range: [75, 85], // Teglia tradizionale 75-85%, moderna 85-90% — era [80,100]
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 48],
      process_type: "no_knead",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 600, // D-029: APITER, peso = area/2 ± 20% → 600 g per 40 × 30
      thickness_factor: 0.6,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [250, 320], // D-029: platea 300–320 (APITER), 250 il forno di casa (Alfè 2020)
      temp_c_ideal: 310,
      cook_time_sec_range: [480, 900], // D-029: 8–13 min (APITER), 12–15 a casa (Trezzi 2020)
      cook_time_sec_ideal: 720,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Alta idratazione, no-knead con pieghe. Base croccante, mollica nuvola.",
    key_characteristics: [
      "Altezza 2-3cm",
      "Idratazione 75-90%",
      "No-knead + pieghe",
      "Mollica nuvola",
    ],
    hydration_category: "extreme",
    emoji: "📐",
    default_topping_ref: "margherita",
  },
  tonda_romana: {
    id: "tonda_romana",
    name: 'Tonda Romana "Scrocchiarella"',
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [200, 240], // Farina debole W170-220, max W230 — Audit Maggio 2026 (La Verace, Molino Vigevano)
      flour_pl_range: [0.40, 0.60], // Bassa tenacità: si stende col mattarello senza resistenza
      hydration_pct_range: [55, 60], // D-030: Valdes 2012 «intorno al 55%», Magenis 2020 55–60%
      salt_pct: 2.5, // Standard romano — era 2.8
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [6, 24], // Minimo 6h diretto, moderna 12-24h — era [3,6] troppo breve
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 180,
      thickness_factor: 0.21,
      diameter_cm: 33,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [300, 400], // D-030: ideale dalle fonti (380–400 a legna, Magenis 2020; ~350 elettrico, Pagano 2017); minimo 300 per il forno di casa (Matteo)
      temp_c_ideal: 380,
      cook_time_sec_range: [90, 200], // D-030: «non supera i due minuti» (Valdes 2012), poco più di 3 elettrico
      cook_time_sec_ideal: 120,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      'Sottilissima, stesa col mattarello o a mano, croccante estrema. "Scrocchiarella".',
    key_characteristics: [
      "Spessore 1-2mm",
      "Mattarello o a mano",
      "Croccante estrema",
      "Farina debole W<210",
    ],
    hydration_category: "medium",
    emoji: "💥",
    servings_per_unit: [1, 1], // Scrocchiarella = 1 pizza a testa
    default_topping_ref: "margherita_romana",
  },
  pinsa_romana: {
    id: "pinsa_romana",
    name: "Pinsa Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.55, 0.75], // Mix multicereale: P/L variabile
      // C-4 (D-015): protocollo OPR 2020 — 1 L d'acqua per 1,25–1,4 kg di farina
      // (71–80%), sale 20–25 g/L (1,4–2,0%), olio 15–20 g/L (1,1–1,6%).
      // Erano 75–85%, 2,5% e 1,0%. Fonti in docs/fonti-dati.md §1.2.
      hydration_pct_range: [72, 80],
      salt_pct: 1.8,
      oil_pct: 1.3,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "direct",
      // OPR 2020, §2.2: maturazione a 4 °C (docs/fonti-dati.md §1.2).
      fermentation_temp_c: 4,
      // VPL-B2: mix multicereale tipico della pinsa (non una farina "W305" singola)
      flour_blend: [
        { name: "Farina di frumento", pct: 70, w: 290 },
        { name: "Farina di soia", pct: 15 },
        { name: "Farina di riso", pct: 15 },
      ],
    },
    shape: {
      shape_type: "oval",
      dough_weight_g: 240, // OPR 2020: 230–250 g. Era 280
      thickness_factor: 0.35,
      length_cm: 34, // OPR 2020: 32–35 × 20–22 cm da cotta. Era 35 × 25
      width_cm: 21,
    },
    baking: {
      oven_type_required: "electric_high",
      // PinsaRomana.it 2022: «forno in pizzeria impostato a 300/310 °C, cottura
      // su pietra». Era 350–420 (ideale 380), senza fonte. Tempo: da verificare.
      temp_c_range: [280, 320],
      temp_c_ideal: 300,
      home_adaptation: {
        min_temp_c: 250,
        method: "inverted_tray",
        source_url: "https://pinsaromana.it/ricetta/come-fare-la-pinsa-romana-metodo-originale-con-marco-montuori/",
      },
      cook_time_sec_range: [180, 300],
      cook_time_sec_ideal: 240,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    description:
      "Mix 70% frumento / 15% soia / 15% riso. Forma ovale, crosta vetrosa.",
    key_characteristics: [
      "Mix multi-cereale",
      "Forma ovale",
      "Crosta vetrosa",
      "Maturazione 24-72h",
    ],
    hydration_category: "high",
    emoji: "🥖",
    servings_per_unit: [1, 1], // Pinsa = formato individuale ovale
    default_topping_ref: "margherita",
  },
  new_york: {
    id: "new_york",
    name: "New York Style",
    family: "americana",
    origin: { city: "New York", region: "New York", country: "USA" },
    dough: {
      flour_w_range: [280, 340], // Bread flour USA (KA ~W280, KABF ~W300) — era [280,340]
      flour_pl_range: [0.55, 0.70], // Bread flour americana: bilanciata
      hydration_pct_range: [58, 65], // Reinhart 62%, Kenji 63%, tradizionale 60% — era [62,68]
      salt_pct: 2.0, // Standard USA 1.5-2% — era 2.8 (troppo per tradizione americana)
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 1.5,
      fermentation_hours_range: [18, 48],
      process_type: "direct|poolish",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 280,
      thickness_factor: 0.28,
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [270, 310],
      temp_c_ideal: 290,
      cook_time_sec_range: [540, 720],
      cook_time_sec_ideal: 600,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Fetta grande pieghevole, crosta croccante ma flessibile. Street food.",
    key_characteristics: [
      "Fetta pieghevole",
      "Zucchero + olio",
      "Cottura 9–12 min", // D-031: allineata al tempo di cottura del codice (540–720 s)
      "Oleosità caratteristica",
    ],
    hydration_category: "medium",
    emoji: "🗽",
    default_topping_ref: "margherita_new_york",
  },
  detroit: {
    id: "detroit",
    proof_in_pan: true,
    name: "Detroit Style",
    family: "americana",
    origin: { city: "Detroit", region: "Michigan", country: "USA" },
    dough: {
      flour_w_range: [280, 320], // Bread flour USA standard — era [290,350]
      flour_pl_range: [0.55, 0.70], // Bread flour standard
      hydration_pct_range: [70, 75],
      salt_pct: 2.0, // Standard USA — era 2.5
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 0, // D-031: niente zucchero nell'impasto (King Arthur s.d.; Our Place s.d.). Era 0,5 da blog
      fermentation_hours_range: [8, 24], // D-031: 8–24 h (King Arthur s.d.; Our Place s.d.); 48 h senza fonte
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 600,
      thickness_factor: 0.72,
      length_cm: 30,
      width_cm: 25,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [250, 290], // Serve calore per caramellizzazione brick cheese — era [230,260]
      temp_c_ideal: 270, // 500°F+ per frico ai bordi — era 245
      cook_time_sec_range: [660, 900], // 12-16 min a temp più alta — era [840,1140]
      cook_time_sec_ideal: 780, // 14 min — era 1020 (fuori range)
    },
    crust_type: "cheese_crown",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Cheese crown croccante, teglia Blue Steel. Formaggio fino ai bordi.",
    key_characteristics: [
      "Cheese crown",
      "Teglia profonda",
      "Formaggio ai bordi",
      "Crosta caramellata",
    ],
    hydration_category: "high",
    emoji: "🚗",
    default_topping_ref: "detroit_brick",
  },
  chicago_deep: {
    id: "chicago_deep",
    proof_in_pan: true,
    name: "Chicago Deep Dish",
    family: "americana",
    origin: { city: "Chicago", region: "Illinois", country: "USA" },
    dough: {
      flour_w_range: [220, 260], // AP flour USA W200-250, bread flour max W270 — era [230,290]
      flour_pl_range: [0.45, 0.60], // Shortcrust-like: burro riduce tenacità
      hydration_pct_range: [48, 52], // Impasto corto col burro, 50-55% tipico — era [48,58]
      salt_pct: 2.0, // Ripieno e formaggi aggiungono sapidità — era 2.5
      oil_pct: 18.0, // FIX Audit: era 0.0 — Chicago Deep Dish usa ~18% burro sulla farina
      fat_type: "butter", // Burro, non olio — Audit KB Bug #4
      sugar_pct: 1.0,
      fermentation_hours_range: [12, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 450,
      thickness_factor: 1.05,
      diameter_cm: 23,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [200, 235], // 425-450°F — era [200,230]
      temp_c_ideal: 225, // 435°F Cook's Illustrated — era 215
      cook_time_sec_range: [1500, 2100], // 25-35 min — era [1800,2400] troppo lungo
      cook_time_sec_ideal: 1800, // 30 min — era 2100 (al bordo max)
    },
    crust_type: "deep_dish",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Pizza profonda come una torta salata. Strati invertiti: formaggio-ripieno-salsa.",
    key_characteristics: [
      "Profondità 5cm",
      "Burro 18%",
      "Strati invertiti",
      "Cottura 35min",
    ],
    hydration_category: "low",
    emoji: "🏙️",
    default_topping_ref: "chicago_deep_classic",
  },

  /* ═══ EXPANSION WAVE 1 — 6 nuovi stili (marzo 2026) ═══ */

  focaccia_genovese: {
    id: "focaccia_genovese",
    proof_in_pan: true,
    name: "Focaccia Genovese",
    family: "contemporanea",
    origin: { city: "Genova", region: "Liguria", country: "Italia" },
    dough: {
      flour_w_range: [240, 280], // Farina 0 standard ligure W200-250 — era [220,280]
      flour_pl_range: [0.45, 0.65],
      hydration_pct_range: [55, 62], // Tradizionale 60-65%, moderna 68-72% — era [65,75]
      salt_pct: 2.5,
      oil_pct: 8.0, // Generoso olio EVO nella teglia e sull'impasto
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [6, 18],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 700,
      thickness_factor: 0.55,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [210, 250], // Focaccia vuole calore per bolle dorate — era [200,230]
      temp_c_ideal: 230, // era 220
      cook_time_sec_range: [1140, 1440],
      cook_time_sec_ideal: 1320,
    },
    crust_type: "focaccia_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Soffice e unta, con crosta dorata e crateri caratteristici. Salamoia olio-acqua in superficie.",
    key_characteristics: [
      "Olio EVO generoso",
      "Crateri superficiali",
      "Salamoia olio-acqua",
      "Cottura 15-20min",
    ],
    hydration_category: "high",
    emoji: "🫒",
    default_topping_ref: "focaccia_genovese_classica",
  },
  sfincione: {
    id: "sfincione",
    proof_in_pan: true,
    name: "Sfincione",
    family: "contemporanea",
    origin: { city: "Palermo", region: "Sicilia", country: "Italia" },
    dough: {
      flour_w_range: [240, 280],
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [60, 70], // "Molto idratato" da tradizione palermitana — Audit Maggio 2026
      salt_pct: 2.5,
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 800,
      thickness_factor: 0.7,
      length_cm: 35,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [200, 240], // Sfincione cuoce a temp media — era [220,260]
      temp_c_ideal: 220, // era 240
      cook_time_sec_range: [1200, 1500],
      cook_time_sec_ideal: 1380,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Pizza spessa siciliana con pomodoro, cipolla, acciughe, caciocavallo e pangrattato. Street food di Palermo.",
    key_characteristics: [
      "Spesso e soffice",
      "Pangrattato tostato",
      "Cipolla + acciughe",
      "Caciocavallo",
    ],
    hydration_category: "medium",
    emoji: "🏺",
    default_topping_ref: "sfincione_palermitano",
  },
  pala_romana: {
    id: "pala_romana",
    name: "Pala Romana",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 320], // Consultapizza W260-350 — Audit Maggio 2026
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [75, 82],
      salt_pct: 2.5,
      oil_pct: 2.5, // Pala tradizionale 2-3% olio EVO — era 1.5 (Consultapizza)
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [18, 48], // Pala tradizionale 18-48h, prolungabile — Audit Maggio 2026
      process_type: "direct|biga|poolish", // Pala può essere diretta o con pre-fermento
    },
    shape: {
      shape_type: "oval",
      dough_weight_g: 320,
      thickness_factor: 0.35,
      length_cm: 40,
      width_cm: 20,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [330, 380],
      temp_c_ideal: 350,
      cook_time_sec_range: [240, 360],
      cook_time_sec_ideal: 300,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false, // Può essere diretta o con biga — non più obbligatorio
    suitable_for_beginner: false,
    description:
      "Formato ovale allungato servito su pala. Via di mezzo tra tonda e teglia: croccante fuori, nuvola dentro.",
    key_characteristics: [
      "Forma ovale allungata",
      "Alta idratazione",
      "Servita su pala",
      "Crosta croccante-nuvola",
    ],
    hydration_category: "high",
    emoji: "🏓",
    default_topping_ref: "bianca_mortazza_romana",
  },
  grandma_style: {
    id: "grandma_style",
    proof_in_pan: true,
    name: "Grandma Style",
    family: "americana",
    origin: { city: "Long Island", region: "New York", country: "USA" },
    dough: {
      flour_w_range: [240, 280], // Bread flour USA — era [260,320]
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [60, 65], // Tradizione italo-americana 60-65% — era [60,68]
      salt_pct: 2.0, // Standard USA — era 2.5
      oil_pct: 4.0, // Teglia generosamente oliata
      fat_type: "oil",
      sugar_pct: 1.0,
      fermentation_hours_range: [18, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 550,
      thickness_factor: 0.35,
      length_cm: 33,
      width_cm: 23,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [230, 260],
      temp_c_ideal: 250,
      cook_time_sec_range: [840, 1020],
      cook_time_sec_ideal: 900,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Sottile, croccante, teglia oliata. La pizza della nonna italo-americana. Mozzarella sotto, salsa sopra.",
    key_characteristics: [
      "Sottile e croccante",
      "Mozzarella sotto salsa",
      "Teglia ben oliata",
      "Cottura 12-16min",
    ],
    hydration_category: "medium",
    emoji: "👵",
    default_topping_ref: "margherita",
  },
  focaccia_recco: {
    id: "focaccia_recco",
    name: "Focaccia di Recco",
    family: "contemporanea",
    origin: { city: "Recco", province: "Genova", region: "Liguria", country: "Italia" },
    dough: {
      // C-4 (D-017): disciplinare IGP, CCIAA Genova 2024 (art. 5): «W > 300;
      // P/L non inferiore a 0,50». Il tetto 340 è una scelta. docs/fonti-dati.md §1.3.
      flour_w_range: [300, 340],
      flour_pl_range: [0.55, 0.70],
      // Il disciplinare non indica l'idratazione: 45–50% è una stima di Vulcan.
      hydration_pct_range: [45, 50],
      salt_pct: 2.0,
      oil_pct: 4.0, // 3-4% nell'impasto, resto in teglia — era 5.0
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [0.5, 2], // Solo riposo della sfoglia — non lievitata
      process_type: "direct",
      unleavened: true, // VPL-B2: sfoglia senza lievito (farina/acqua/olio/sale)
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 400,
      thickness_factor: 0.08, // Sottilissima, quasi trasparente
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_high",
      // Disciplinare IGP: forno «tra 270° e 320°C» per «4-8 minuti».
      // Erano 300–340 °C (ideale 320) e 8–10 min.
      temp_c_range: [270, 320],
      temp_c_ideal: 300,
      cook_time_sec_range: [240, 480],
      cook_time_sec_ideal: 360,
    },
    crust_type: "stuffed_thin",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "double_thin_sheet",
      pieces_per_unit: 2,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    description:
      "Due sfoglie sottilissime con stracchino fuso. IGP dal 2015. Bolle dorate caratteristiche.",
    key_characteristics: [
      "Sfoglia quasi trasparente",
      "Ripiena di stracchino",
      "Bolle dorate",
      "Nessuna lievitazione",
    ],
    hydration_category: "low",
    emoji: "🧀",
    default_topping_ref: "crescenza_recco",
  },
  padellino_torino: {
    id: "padellino_torino",
    proof_in_pan: true,
    name: "Pizza al Padellino",
    family: "contemporanea",
    origin: { city: "Torino", region: "Piemonte", country: "Italia" },
    dough: {
      flour_w_range: [220, 260], // Farina 0/1 forte — era [280,330]
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [60, 65],
      salt_pct: 2.5,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.5,
      fermentation_hours_range: [18, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 180, // Padellino tradizionale 160-200g per padellino 20cm — era 250
      thickness_factor: 0.5,
      diameter_cm: 20, // Padellino in ferro/alluminio standard 20cm — era 22
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 240],
      temp_c_ideal: 230,
      cook_time_sec_range: [600, 720],
      cook_time_sec_ideal: 660,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    default_dough_balls: 4, // Padellini sono individuali: default 4 (uno a testa per 4 persone)
    description:
      "Cotta in padellino di ferro e finita in forno. Fondo croccante burro-olio, soffice al centro. Specialità torinese.",
    key_characteristics: [
      "Padellino di ferro",
      "Fondo ultra-croccante",
      "Morbida al centro",
      "Porzione individuale",
    ],
    hydration_category: "high",
    emoji: "🍳",
    default_topping_ref: "margherita",
  },

  /* ═══ SPRINT 11 Fase 1 — Stili con layout speciale ═══ */
  pizza_baciata: {
    id: "pizza_baciata",
    name: "Pizza Baciata",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [75, 85],
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 48],
      process_type: "direct|biga",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 800, // 2 panetti da 400g per teglia 40x30
      thickness_factor: 0.55,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [270, 300],
      temp_c_ideal: 285,
      cook_time_sec_range: [840, 1200],
      cook_time_sec_ideal: 960,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "stacked",
      pieces_per_unit: 2,
      interlayer: "oil_brush",
      filling_timing: "post_bake_split",
      cook_mode: "white_then_top",
    },
    default_impasto_ref: "teglia_romana_classica",
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Doppio strato in teglia: due dischi sovrapposti spennellati d'olio, cotti in bianco, poi sdoppiati e farciti a freddo. Stile romano da panificio.",
    key_characteristics: [
      "Doppio disco con olio in mezzo",
      "Cottura in bianco",
      "Farcitura post-cottura a freddo",
      "Stile panaria romana",
    ],
    hydration_category: "high",
    emoji: "💋",
    default_topping_ref: "bianca_mortazza",
  },

  ciaccino_senese: {
    id: "ciaccino_senese",
    name: "Ciaccino Senese",
    family: "contemporanea",
    origin: { city: "Siena", region: "Toscana", country: "Italia" },
    dough: {
      flour_w_range: [220, 280],
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [60, 65],
      salt_pct: 2.0,
      oil_pct: 5.0,
      fat_type: "lard",
      sugar_pct: 0.0,
      fermentation_hours_range: [4, 12],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 700, // 2 dischi da 350g
      thickness_factor: 0.40,
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [230, 270],
      temp_c_ideal: 250,
      cook_time_sec_range: [900, 1200],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "stuffed_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 2,
      interlayer: "sealed_edges",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Pizza ripiena toscana: due dischi sigillati con prosciutto cotto e formaggio filante all'interno. Tipico dei panifici senesi.",
    key_characteristics: [
      "Due dischi sigillati ai bordi",
      "Ripieno interno pre-cottura",
      "Strutto/olio nell'impasto",
      "Tradizione senese",
    ],
    hydration_category: "medium",
    emoji: "🥪",
    default_topping_ref: "ciaccino",
  },

  /* Sprint 11 Fase 2 — Variante d'autore: Baciata con topping signature */
  /* Nota: "Pizza Patate e Porchetta" NON è uno stile a sé: è la `pizza_spaccata`
     con la farcitura patate&porchetta (ricetta `patate_porchetta_sancho`,
     "in crosta di patate" alla Sancho). La combinazione iconica vive come
     Ricetta Iconica (signature `patate_e_porchetta` → pizza_spaccata). Lo stile
     dedicato è stato rimosso; /recipe/pizza_patate_porchetta redirige alla spaccata. */
  pizza_spaccata: {
    id: "pizza_spaccata",
    name: "Pizza Spaccata",
    family: "romana",
    origin: { city: "Roma", region: "Lazio", country: "Italia" },
    dough: {
      flour_w_range: [280, 340],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [72, 80],
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 48],
      process_type: "direct|biga",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 700,
      thickness_factor: 0.6,
      length_cm: 40,
      width_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [270, 300],
      temp_c_ideal: 285,
      cook_time_sec_range: [840, 1200],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    layout: {
      type: "single",
      pieces_per_unit: 1,
      interlayer: "none",
      filling_timing: "post_bake_split",
      cook_mode: "bianca_only",
    },
    default_topping_ref: "bianca_mortazza_romana",
    default_impasto_ref: "teglia_romana_classica",
    default_dough_balls: 1,
    servings_per_unit: [2, 4],
    description:
      "UN SOLO disco/teglia di pizza bianca cotto e poi SPACCATO a metà col coltello e farcito a freddo. Diversa dalla Baciata (che parte da due dischi sovrapposti cotti insieme). Farciture: mortazza, crudo, e la patate e porchetta 'in crosta di patate' alla Sancho.",
    key_characteristics: [
      "Base singola cotta in bianco",
      "Spaccata a metà dopo la cottura",
      "Farcita a freddo (mortazza, crudo, patate&porchetta)",
      "Tradizione romana da forno / al taglio",
    ],
    hydration_category: "high",
    emoji: "🔪",
  },

  /* ═══ Sprint 11 — Espansione catalogo (2 nuovi stili) ═══ */
  trancio_milanese: {
    id: "trancio_milanese",
    name: "Trancio Milanese",
    family: "contemporanea",
    origin: { city: "Milano", region: "Lombardia", country: "Italia" },
    dough: {
      flour_w_range: [280, 340], // Farina forte 0/1 — pizzerie Spontini, Cocco, Di Gennaro
      flour_pl_range: [0.50, 0.65],
      hydration_pct_range: [65, 75], // Medio-alta, mollica soffice
      salt_pct: 2.2,
      oil_pct: 4.0, // Generoso olio nella teglia per fondo dorato
      fat_type: "oil",
      sugar_pct: 0.5, // Spinta minima per colorazione
      fermentation_hours_range: [18, 36],
      process_type: "direct",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 600,
      thickness_factor: 0.5, // ~2cm di mollica
      length_cm: 33,
      width_cm: 25,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 260],
      temp_c_ideal: 240,
      cook_time_sec_range: [840, 1080],
      cook_time_sec_ideal: 960,
    },
    crust_type: "thick_airy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    description:
      "Trancio rettangolare tipico delle pizzerie milanesi a taglio. Soffice all'interno, fondo dorato dall'olio in teglia. Servito al banco a pranzo.",
    key_characteristics: [
      "Trancio rettangolare al taglio",
      "Cottura in teglia oliata",
      "Mollica soffice ~2cm",
      "Stile tavola calda milanese",
    ],
    hydration_category: "high",
    emoji: "🥪",
    default_topping_ref: "margherita",
  },

  chicago_tavern: {
    id: "chicago_tavern",
    name: "Chicago Tavern Cut",
    family: "americana",
    origin: { city: "Chicago", region: "Illinois", country: "USA" },
    dough: {
      flour_w_range: [240, 290], // Bread flour standard USA
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [50, 58], // Bassa idratazione per crocantezza estrema cracker-like
      salt_pct: 2.0,
      oil_pct: 4.0, // Olio nell'impasto + nella teglia
      fat_type: "oil",
      sugar_pct: 1.5, // Tipico USA, per colorazione e crocantezza
      fermentation_hours_range: [18, 36],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 380,
      thickness_factor: 0.22, // Sottilissima (cracker thin)
      diameter_cm: 35,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [240, 280],
      temp_c_ideal: 260,
      cook_time_sec_range: [600, 840],
      cook_time_sec_ideal: 720,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    servings_per_unit: [2, 3],
    description:
      "Sottilissima e croccante tagliata a quadrotti (party cut), alternativa al deep dish di Chicago. Servita nei tavern con birra ghiacciata.",
    key_characteristics: [
      "Sottile cracker-like",
      "Taglio a quadrotti (party cut)",
      "Bordo croccante",
      "Stile tavern di quartiere",
    ],
    hydration_category: "low",
    emoji: "🟫",
    default_topping_ref: "italian_sausage_tavern",
  },

  /* ═══ NUOVI STILI — Audit motore 2026-05 (italiani minori + internazionali) ═══ */

  focaccia_barese: {
    id: "focaccia_barese",
    proof_in_pan: true,
    name: "Focaccia Barese",
    family: "contemporanea",
    origin: { city: "Bari", region: "Puglia", country: "Italia" },
    dough: {
      flour_w_range: [220, 280], // Farina media + semola rimacinata
      flour_pl_range: [0.45, 0.55],
      hydration_pct_range: [70, 80], // Impasto morbido con patata lessa
      salt_pct: 2.0,
      oil_pct: 4.0, // EVO generoso nell'impasto e nel ruoto
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 500,
      thickness_factor: 0.55,
      diameter_cm: 32, // Ruoto tondo
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 250],
      temp_c_ideal: 240,
      cook_time_sec_range: [1200, 1500],
      cook_time_sec_ideal: 1320,
    },
    crust_type: "focaccia_soft",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [3, 4],
    description:
      "Soffice e umida grazie alla patata nell'impasto. Pomodorini schiacciati, olive baresane, origano e tanto olio EVO. Cotta nel ruoto tondo.",
    key_characteristics: [
      "Patata lessa nell'impasto",
      "Pomodorini e olive baresane",
      "Mollica umida e soffice",
      "Crosta inferiore dorata nell'olio",
    ],
    hydration_category: "high",
    emoji: "🫒",
    default_topping_ref: "focaccia_barese_classica",
  },

  pizza_fritta: {
    id: "pizza_fritta",
    name: "Pizza Fritta",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    // M-7 (D-022, D-023): impasto del disciplinare AVPN 2024 (una sola farina,
    // W 250–320, niente grassi), lievitazione 8–24 h (8 h Sorbillo, fino a 24
    // AVPN). Idratazione 60–65%: plausibile (le fonti vanno da 53 a 67%).
    // Panetto circa 200 g (AVPN 2024, §4.2); era 100 g. Fonti in docs/fonti-dati.md §1.4.
    dough: {
      flour_w_range: [250, 320],
      flour_pl_range: [0.50, 0.70],
      hydration_pct_range: [60, 65],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 200,
      thickness_factor: 0.53,
      diameter_cm: 22, // da verificare: l'AVPN dà 22–24 cm per 200 g, ma per la pizza al forno
    },
    baking: {
      oven_type_required: "home", // Frittura in olio, non forno
      // C-4 (D-018): AVPN 2024, frittura ideale «around 175 °C», friggitrice
      // «between 175 °C and 190 °C». Era 180–190, ideale 185.
      temp_c_range: [175, 190],
      temp_c_ideal: 175,
      cook_time_sec_range: [60, 120],
      cook_time_sec_ideal: 90,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "panetto",
    default_dough_balls: 4,
    servings_per_unit: [1, 1],
    description:
      "Calzone fritto: un disco di circa 200 g farcito con ricotta, provola, cicoli e pepe, chiuso a mezzaluna e fritto in olio di semi a circa 175 °C.",
    key_characteristics: [
      "Cottura in frittura (no forno)",
      "Ripiena (chiusa a mezzaluna)",
      "Farcita prima di friggere",
      "Lievitazione 8–24 h",
    ],
    hydration_category: "medium",
    emoji: "🍳",
    default_topping_ref: "pizza_fritta_ripiena",
  },

  pizza_montanara: {
    id: "pizza_montanara",
    name: "Pizza Montanara",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    // M-7 (D-023): stesso impasto della pizza fritta. Panetto 100 g (Sorbillo:
    // «pagnottine da circa 100 g»); diametro e tempo di frittura da verificare.
    dough: {
      flour_w_range: [250, 320],
      flour_pl_range: [0.50, 0.70],
      hydration_pct_range: [60, 65],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 100,
      thickness_factor: 0.5,
      diameter_cm: 14,
    },
    baking: {
      oven_type_required: "home",
      temp_c_range: [175, 190], // Olio: come la pizza fritta (AVPN 2024)
      temp_c_ideal: 175,
      cook_time_sec_range: [60, 120],
      cook_time_sec_ideal: 90,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "panetto",
    default_dough_balls: 4,
    servings_per_unit: [1, 2],
    description:
      "Dischetto di impasto fritto in olio, scolato e poi condito sopra: pomodoro, formaggio e basilico. Aperta, non ripiena.",
    key_characteristics: [
      "Cottura in frittura (no forno)",
      "Aperta (non ripiena)",
      "Condita dopo la frittura",
      "Lievitazione 8–24 h",
    ],
    hydration_category: "medium",
    emoji: "🍳",
    default_topping_ref: "montanara_classica",
  },

  /* M-7 (D-022, decisione di Matteo, 24/10/2026): la «tonda fritta» del
   * disciplinare AVPN 2024 — due dischi sovrapposti (circa 120 g sotto e 80 g
   * sopra, 200 g in tutto), farciti e sigillati, fritti in olio di semi a circa
   * 175 °C. Per la Masardona è la «pizza fritta tradizionale». Diametro e tempo
   * di frittura non hanno fonte. docs/fonti-dati.md §1.4. */
  pizza_fritta_tonda: {
    id: "pizza_fritta_tonda",
    name: "Pizza Fritta Tonda",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [250, 320],
      flour_pl_range: [0.50, 0.70],
      hydration_pct_range: [60, 65],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 200,
      thickness_factor: 0.53,
      diameter_cm: 22, // da verificare (nessuna fonte per la fritta)
    },
    baking: {
      oven_type_required: "home",
      temp_c_range: [175, 190], // AVPN 2024
      temp_c_ideal: 175,
      cook_time_sec_range: [60, 120], // da verificare: l'AVPN dice solo «finché è dorata»
      cook_time_sec_ideal: 90,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 2,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    serving_unit: "panetto",
    default_dough_balls: 4,
    servings_per_unit: [1, 1],
    description:
      "Due dischi sottili (circa 120 g sotto e 80 g sopra) farciti con ricotta, provola e cicoli, sigillati e fritti in olio di semi a circa 175 °C.",
    key_characteristics: [
      "Cottura in frittura (no forno)",
      "Due dischi sovrapposti",
      "Farcita prima di friggere",
      "Lievitazione 8–24 h",
    ],
    hydration_category: "medium",
    emoji: "🍳",
    default_topping_ref: "pizza_fritta_tonda_ripiena",
  },

  calzone_napoletano: {
    id: "calzone_napoletano",
    name: "Calzone Napoletano",
    family: "napoletana",
    origin: { city: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [250, 320],
      flour_pl_range: [0.55, 0.70],
      hydration_pct_range: [58, 62],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 280,
      thickness_factor: 0.4,
      diameter_cm: 30, // Disco prima della chiusura
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [400, 470],
      temp_c_ideal: 430, // Leggermente sotto la pizza per cuocere il ripieno
      cook_time_sec_range: [120, 240],
      cook_time_sec_ideal: 180,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: false,
    allows_additives: false,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 1,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    serving_unit: "panetto",
    default_dough_balls: 4,
    servings_per_unit: [1, 1],
    description:
      "Mezzaluna chiusa e sigillata con ripieno di ricotta, fior di latte, salame o cicoli e pepe. Cornicione gonfio, cotto in forno ad alta temperatura.",
    key_characteristics: [
      "Chiuso a mezzaluna sigillata",
      "Ripieno ricotta + fior di latte",
      "Impasto napoletano STG",
      "Cottura alta T per gonfiare",
    ],
    hydration_category: "medium",
    emoji: "🥟",
    default_topping_ref: "calzone_napoletano_classico",
  },

  pizza_al_metro: {
    id: "pizza_al_metro",
    name: "Pizza al Metro",
    family: "napoletana",
    origin: { city: "Vico Equense", province: "Napoli", region: "Campania", country: "Italia" },
    dough: {
      flour_w_range: [260, 320],
      flour_pl_range: [0.55, 0.65],
      hydration_pct_range: [62, 70],
      salt_pct: 2.5,
      oil_pct: 1.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [6, 12], // D-028: «sei ore di lievitazione» (Fucito 2017); l'estremo alto è una scelta
      process_type: "direct|biga",
    },
    shape: {
      shape_type: "rectangular",
      dough_weight_g: 1000, // D-028: 700 g erano per 70 cm; stesso spessore su 100 cm (stima proporzionale)
      thickness_factor: 0.45,
      length_cm: 100, // D-028: si vende al metro (menù Gigino 2026; Fucito 2017: «lunga un metro»)
      width_cm: 30,
    },
    baking: {
      oven_type_required: "wood", // D-028: forni a legna (Fucito 2017; Scatti di Gusto 2017)
      temp_c_range: [300, 380],
      temp_c_ideal: 340,
      cook_time_sec_range: [240, 360],
      cook_time_sec_ideal: 300,
    },
    crust_type: "leopard_soft",
    requires_wood_oven: true, // avviso, non blocco (D-020)
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [4, 5], // D-028: «fino a 5 persone» (menù Gigino 2026)
    /* C-2: i condimenti vengono dal catalogo napoletano, scritto per un disco
     * da 32 cm (804 cm²); un metro × 30 cm sono 3000 cm²: dosi × 3,7. */
    topping_scale: 3.7,
    description:
      "Formato rettangolare lungo nato a Vico Equense, servito a metri con più condimenti affiancati. Impasto napoletano morbido, alveolato.",
    key_characteristics: [
      "Formato lungo servito a metri",
      "Più gusti sulla stessa base",
      "Impasto napoletano morbido",
      "Conviviale, da condividere",
    ],
    hydration_category: "medium",
    emoji: "📏",
    default_topping_ref: "margherita",
  },

  new_haven_apizza: {
    id: "new_haven_apizza",
    name: "New Haven Apizza",
    family: "americana",
    origin: { city: "New Haven", region: "Connecticut", country: "USA" },
    dough: {
      flour_w_range: [240, 300], // Bread flour
      flour_pl_range: [0.55, 0.65],
      hydration_pct_range: [60, 66],
      salt_pct: 2.0,
      oil_pct: 1.0,
      fat_type: "oil",
      sugar_pct: 0.0, // Niente zucchero, a differenza della NY
      fermentation_hours_range: [24, 72], // Maturazione fredda
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 300,
      thickness_factor: 0.25, // Sottile e irregolare
      diameter_cm: 38,
    },
    baking: {
      oven_type_required: "coal", // Sally's: coal-fired; legna è un adattamento.
      temp_c_range: [340, 400],
      temp_c_ideal: 370,
      cook_time_sec_range: [240, 360],
      cook_time_sec_ideal: 300,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: false,
    serving_unit: "panetto",
    default_dough_balls: 2,
    servings_per_unit: [2, 3],
    description:
      "Cotta in forno a carbone, sottile, irregolare e carbonizzata sui bordi. L'icona è la white clam pie (vongole, aglio, origano, niente pomodoro).",
    key_characteristics: [
      "Forno a carbone, bordi carbonizzati",
      "Sottile e irregolare",
      "Niente zucchero nell'impasto",
      "White clam pie iconica",
    ],
    hydration_category: "medium",
    emoji: "🦪",
    default_topping_ref: "white_clam",
  },

  fugazzeta: {
    id: "fugazzeta",
    name: "Fugazzeta Argentina",
    family: "americana",
    origin: { city: "Buenos Aires", country: "Argentina" },
    dough: {
      flour_w_range: [200, 260],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [55, 62],
      salt_pct: 2.0,
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 1.0,
      fermentation_hours_range: [4, 12], // Spesso giornaliera, lievito generoso
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 600,
      thickness_factor: 0.7, // Alta, "al molde"
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [220, 260],
      temp_c_ideal: 240,
      cook_time_sec_range: [900, 1200],
      cook_time_sec_ideal: 1020,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    layout: {
      type: "closed_stuffed",
      pieces_per_unit: 2,
      interlayer: "internal_filling",
      filling_timing: "pre_bake_internal",
      cook_mode: "topped",
    },
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [4, 6],
    description:
      "Pizza alta 'al molde' a doppio strato, ripiena di abbondante mozzarella e ricoperta di cipolla. Niente pomodoro. Icona della pizza porteña.",
    key_characteristics: [
      "Doppio strato ripieno di mozzarella",
      "Cipolla in superficie, niente pomodoro",
      "Alta e morbida (al molde)",
      "Origano e olio EVO finale",
    ],
    hydration_category: "medium",
    emoji: "🧅",
    default_topping_ref: "fugazzeta",
  },

  california_style: {
    id: "california_style",
    name: "California Style",
    family: "americana",
    origin: { city: "California", country: "USA" },
    dough: {
      flour_w_range: [240, 300],
      flour_pl_range: [0.55, 0.65],
      hydration_pct_range: [60, 65],
      salt_pct: 2.0,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.5,
      fermentation_hours_range: [24, 48],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 230,
      thickness_factor: 0.25, // Base sottile
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_high",
      temp_c_range: [280, 340],
      temp_c_ideal: 300,
      cook_time_sec_range: [300, 420],
      cook_time_sec_ideal: 360,
    },
    crust_type: "crispy_thin",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "panetto",
    default_dough_balls: 2,
    servings_per_unit: [1, 2],
    description:
      "Base sottile con ingredienti gourmet non convenzionali (pollo BBQ, capra, fichi, rucola). Nata da Chez Panisse e Wolfgang Puck negli anni '80.",
    key_characteristics: [
      "Base sottile artigianale",
      "Ingredienti gourmet stagionali",
      "Combinazioni non tradizionali",
      "Approccio chef-driven",
    ],
    hydration_category: "medium",
    emoji: "🥑",
    default_topping_ref: "smoked_salmon_california",
  },

  greek_pan: {
    id: "greek_pan",
    proof_in_pan: true,
    name: "Greek Pan Pizza",
    family: "americana",
    origin: { city: "New England", country: "USA" },
    dough: {
      flour_w_range: [220, 280],
      flour_pl_range: [0.50, 0.60],
      hydration_pct_range: [60, 68],
      salt_pct: 2.0,
      oil_pct: 5.0, // Teglia molto unta → fondo quasi fritto
      fat_type: "oil",
      sugar_pct: 1.0,
      fermentation_hours_range: [4, 12],
      process_type: "direct",
    },
    shape: {
      shape_type: "round",
      dough_weight_g: 400,
      thickness_factor: 0.5,
      diameter_cm: 30,
    },
    baking: {
      oven_type_required: "electric_standard",
      temp_c_range: [230, 260],
      temp_c_ideal: 245,
      cook_time_sec_range: [720, 1020],
      cook_time_sec_ideal: 840,
    },
    crust_type: "pan_crispy",
    requires_wood_oven: false,
    allows_additives: true,
    requires_pre_ferment: false,
    suitable_for_beginner: true,
    serving_unit: "teglia",
    default_dough_balls: 1,
    servings_per_unit: [3, 4],
    description:
      "Cotta in teglia tonda generosamente oliata: fondo croccante quasi fritto, mollica soffice. Mix mozzarella + cheddar. Classico dei diner greco-americani.",
    key_characteristics: [
      "Teglia molto unta, fondo fritto",
      "Mollica soffice e spessa",
      "Mix mozzarella + cheddar",
      "Diner greco-americano",
    ],
    hydration_category: "medium",
    emoji: "🫓",
    default_topping_ref: "greek_cheese_pan",
  },
};
