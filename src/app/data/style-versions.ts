/* ═══ STYLE VERSIONS ═══
 * Interpretazioni di uno stile come "versioni" coerenti: ognuna espone i suoi
 * range di parametri (idratazione, W farina, P/L, ore di fermentazione).
 *
 * Quando una versione è attiva:
 *   1. Gli slider del configurator mostrano i range della versione
 *   2. Smart Link e adaptive hints lavorano su quei range
 *   3. Lo score di autenticità penalizza in base ai range della versione, non
 *      dei range "canonici" dello stile.
 *
 * Le versioni "Casalinga/Tradizionale" (skill_hint: 1) tipicamente allargano i
 * range verso valori più accessibili. Le versioni "centro/expert" possono
 * omettere gli override e usare il range canonico dello stile. */
import type { SkillLevel } from "../domain/pizza-engine";

/** Range override opzionali. Quando undefined, il consumer usa il range dello stile. */
interface VersionRanges {
  hydration_pct_range?: [number, number];
  flour_w_range?: [number, number];
  flour_pl_range?: [number, number];
  fermentation_hours_range?: [number, number];
}

export interface StyleVersion {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Skill level mappato per default automatico all'apertura dello stile */
  skill_hint: SkillLevel;
  /** Override dei range visibili sugli slider e usati dagli scoring */
  ranges?: VersionRanges;
  /** Sprint 11 Fase 3 — id dell'impasto associato a questa versione.
   * Quando presente, sovrascrive style.default_impasto_ref: i dough_overrides
   * dell'impasto vengono applicati ai parametri base dello stile. */
  impasto_ref?: string;
  /** Valori iniziali applicati al click sul chip */
  params: {
    hydration_pct: number;
    flour_w: number;
    flour_pl?: number;
    fermentation_hours: number;
    /** Temperatura discreta: 4 (frigo), 12 (fresco), 22 (ambiente) */
    fermentation_temp_c: 4 | 12 | 22;
    use_pre_ferment: boolean;
    /** Override del peso totale impasto per teglia/pizza (g).
     * Quando presente, il configurator aggiusta panConfig.thickness per ottenere
     * questo peso a parità di dimensioni. Usato per versioni con coefficiente
     * diverso dal default dello stile (es. Sottile = 0.5 g/cm² vs Bonci 0.75). */
    dough_weight_g?: number;
  };
}

const STYLE_VERSIONS: Record<string, StyleVersion[]> = {
  teglia_romana: [
    {
      id: "teglia_sottile",
      label: "Sottile",
      emoji: "🍃",
      description: "Croccante e leggera: 75%, 18h, ~600g/teglia (stile romano classico)",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [68, 78],
        flour_w_range: [260, 300],
        fermentation_hours_range: [12, 24],
      },
      params: {
        hydration_pct: 75,
        flour_w: 280,
        flour_pl: 0.55,
        fermentation_hours: 18,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
        dough_weight_g: 600, // 0.5 g/cm² su teglia 30x40 — pizza sottile classica
      },
    },
    {
      id: "teglia_casalinga",
      label: "Casalinga",
      emoji: "🏠",
      description: "Teglia romana accessibile per principianti",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [72, 82],
        flour_w_range: [270, 310],
        fermentation_hours_range: [18, 36],
      },
      params: {
        hydration_pct: 78,
        flour_w: 290,
        flour_pl: 0.58,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "teglia_classica",
      label: "Classica",
      emoji: "📐",
      description: "Idratazione 82%, 36h in frigo",
      skill_hint: 2,
      params: {
        hydration_pct: 82,
        flour_w: 310,
        flour_pl: 0.60,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "teglia_alta",
      label: "Alta idratazione",
      emoji: "💧",
      description: "Mollica nuvola, 48h in frigo",
      skill_hint: 3,
      ranges: {
        hydration_pct_range: [82, 92],
        flour_w_range: [310, 350],
      },
      params: {
        hydration_pct: 88,
        flour_w: 330,
        flour_pl: 0.62,
        fermentation_hours: 48,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  napoletana_canotto: [
    {
      id: "canotto_bilanciato",
      label: "Bilanciato",
      emoji: "🎈",
      description: "Idratazione 68% con biga, 24h frigo",
      skill_hint: 2,
      params: {
        hydration_pct: 68,
        flour_w: 300,
        flour_pl: 0.58,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: true,
      },
    },
    {
      id: "canotto_martucci",
      label: "Stile Martucci",
      emoji: "🏗️",
      description: "Biga ibrida, 48h frigo, cornicione esplosivo",
      skill_hint: 3,
      params: {
        hydration_pct: 72,
        flour_w: 320,
        flour_pl: 0.56,
        fermentation_hours: 48,
        fermentation_temp_c: 4,
        use_pre_ferment: true,
      },
    },
    {
      id: "canotto_estremo",
      label: "Estremo Pro",
      emoji: "🌊",
      description: "72h frigo, idratazione 78%, farina molto forte",
      skill_hint: 3,
      ranges: {
        hydration_pct_range: [72, 80],
        flour_w_range: [320, 360],
      },
      params: {
        hydration_pct: 78,
        flour_w: 340,
        flour_pl: 0.54,
        fermentation_hours: 72,
        fermentation_temp_c: 4,
        use_pre_ferment: true,
      },
    },
  ],

  napoletana_stg: [
    {
      id: "stg_tradizionale",
      label: "Tradizionale",
      emoji: "🍕",
      description: "Diretto 12h a temperatura ambiente",
      skill_hint: 2,
      params: {
        hydration_pct: 58,
        flour_w: 280,
        flour_pl: 0.60,
        fermentation_hours: 12,
        fermentation_temp_c: 22,
        use_pre_ferment: false,
      },
    },
    {
      id: "stg_avpn",
      label: "Disciplinare AVPN",
      emoji: "📜",
      // C-4 (D-016): lo stile segue la STG; qui i valori del disciplinare AVPN
      // 2024 — lievitazione totale 12–24 h, panetto 280 g per 28–35 cm.
      description: "60% / 24h ambiente / W300 / panetto 280 g — disciplinare AVPN 2024",
      skill_hint: 3,
      ranges: {
        fermentation_hours_range: [12, 24],
      },
      params: {
        hydration_pct: 60,
        flour_w: 300,
        flour_pl: 0.62,
        fermentation_hours: 24,
        fermentation_temp_c: 22,
        use_pre_ferment: false,
        dough_weight_g: 280,
      },
    },
  ],

  tonda_romana: [
    {
      id: "tonda_casalinga",
      label: "Casalinga",
      emoji: "🏠",
      description: "Diretto breve, farina debole, 8h ambiente",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [54, 62],
        fermentation_hours_range: [4, 18],
      },
      params: {
        hydration_pct: 58,
        flour_w: 200,
        flour_pl: 0.50,
        fermentation_hours: 8,
        fermentation_temp_c: 22,
        use_pre_ferment: false,
      },
    },
    {
      id: "tonda_scrocchiarella",
      label: "Scrocchiarella",
      emoji: "💥",
      description: "18h frigo per croccantezza estrema",
      skill_hint: 2,
      ranges: {
        hydration_pct_range: [55, 62],
        flour_w_range: [200, 240],
      },
      params: {
        hydration_pct: 60,
        flour_w: 220,
        flour_pl: 0.52,
        fermentation_hours: 18,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  focaccia_genovese: [
    {
      id: "focaccia_tradizionale",
      label: "Tradizionale",
      emoji: "🫒",
      description: "Diretto breve, 8h ambiente, salamoia generosa",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [58, 68],
        flour_w_range: [200, 250],
        fermentation_hours_range: [4, 14],
      },
      params: {
        hydration_pct: 65,
        flour_w: 220,
        flour_pl: 0.55,
        fermentation_hours: 8,
        fermentation_temp_c: 22,
        use_pre_ferment: false,
      },
    },
    {
      id: "focaccia_moderna",
      label: "Moderna",
      emoji: "✨",
      description: "16h frigo per alveolatura più aperta",
      skill_hint: 2,
      ranges: {
        hydration_pct_range: [65, 72],
      },
      params: {
        hydration_pct: 70,
        flour_w: 240,
        flour_pl: 0.58,
        fermentation_hours: 16,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  pinsa_romana: [
    {
      id: "pinsa_moderna",
      label: "Moderna",
      emoji: "🥖",
      description: "Idratazione 78%, 36h frigo, mix multicereale",
      skill_hint: 2,
      params: {
        hydration_pct: 78,
        flour_w: 290,
        flour_pl: 0.62,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "pinsa_tradizionale",
      label: "Tradizionale",
      emoji: "📜",
      description: "Idratazione 80% (tetto del protocollo OPR), 48h frigo, alveolatura aperta",
      skill_hint: 3,
      params: {
        hydration_pct: 80, // C-4: era 82, sopra il protocollo OPR 2020 (71–80%)
        flour_w: 310,
        flour_pl: 0.66,
        fermentation_hours: 48,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  new_york: [
    {
      id: "ny_casalinga",
      label: "Casalinga",
      emoji: "🏠",
      description: "62% idratazione, 24h frigo, semplice ed efficace",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [58, 65],
        flour_w_range: [260, 300],
        fermentation_hours_range: [12, 36],
      },
      params: {
        hydration_pct: 62,
        flour_w: 280,
        flour_pl: 0.60,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "ny_classica",
      label: "Classica NY",
      emoji: "🗽",
      description: "Fetta pieghevole, 36h frigo, zucchero+olio",
      skill_hint: 2,
      params: {
        hydration_pct: 64,
        flour_w: 290,
        flour_pl: 0.62,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  detroit: [
    {
      id: "detroit_casalinga",
      label: "Casalinga",
      emoji: "🏠",
      description: "70% idratazione, 24h frigo, teglia oliata",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [65, 75],
        flour_w_range: [260, 300],
        fermentation_hours_range: [12, 36],
      },
      params: {
        hydration_pct: 70,
        flour_w: 280,
        flour_pl: 0.60,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "detroit_classica",
      label: "Classica",
      emoji: "🚗",
      description: "74% idratazione, 24h frigo, cheese crown",
      skill_hint: 2,
      params: {
        hydration_pct: 74,
        flour_w: 300,
        flour_pl: 0.62,
        // Audit totale n. 6: 36 h era fuori dal range dello stile (8–24 h, D-031).
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  chicago_deep: [
    {
      id: "chicago_tradizionale",
      label: "Tradizionale",
      emoji: "🥧",
      description: "Impasto corto col burro, 18h frigo",
      skill_hint: 1,
      params: {
        hydration_pct: 52,
        flour_w: 240,
        flour_pl: 0.50,
        fermentation_hours: 18,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "chicago_pro",
      label: "Pro",
      emoji: "🌆",
      description: "24h frigo, farina più forte, alveolatura più sviluppata",
      skill_hint: 2,
      ranges: {
        hydration_pct_range: [50, 56],
      },
      params: {
        hydration_pct: 54,
        flour_w: 260,
        flour_pl: 0.55,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  sfincione: [
    {
      id: "sfincione_casalingo",
      label: "Casalingo",
      emoji: "🏠",
      description: "67% idratazione, 8h ambiente, diretto semplice",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [60, 70],
        flour_w_range: [250, 290],
        fermentation_hours_range: [4, 18],
      },
      params: {
        hydration_pct: 67,
        flour_w: 270,
        flour_pl: 0.55,
        fermentation_hours: 8,
        fermentation_temp_c: 22,
        use_pre_ferment: false,
      },
    },
    {
      id: "sfincione_tradizionale",
      label: "Palermitano",
      emoji: "🏺",
      description: "70% idratazione, 18h frigo, mollica più sviluppata",
      skill_hint: 2,
      ranges: {
        flour_w_range: [270, 310],
      },
      params: {
        hydration_pct: 70,
        flour_w: 290,
        flour_pl: 0.60,
        fermentation_hours: 18,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  pala_romana: [
    {
      id: "pala_bilanciata",
      label: "Bilanciata",
      emoji: "🏓",
      description: "72% idratazione + biga, 36h frigo",
      skill_hint: 2,
      ranges: {
        hydration_pct_range: [70, 76],
      },
      params: {
        hydration_pct: 72,
        flour_w: 300,
        flour_pl: 0.56,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: true,
      },
    },
    {
      id: "pala_pro",
      label: "Pro",
      emoji: "🔥",
      description: "78% idratazione, biga 48h, alveolatura estrema",
      skill_hint: 3,
      params: {
        hydration_pct: 78,
        flour_w: 320,
        flour_pl: 0.54,
        fermentation_hours: 48,
        fermentation_temp_c: 4,
        use_pre_ferment: true,
      },
    },
  ],

  grandma_style: [
    {
      id: "grandma_casalinga",
      label: "Casalinga",
      emoji: "🏠",
      description: "62% idratazione, 24h frigo, teglia oliata",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [58, 65],
        flour_w_range: [240, 290],
        fermentation_hours_range: [12, 36],
      },
      params: {
        hydration_pct: 62,
        flour_w: 260,
        flour_pl: 0.60,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "grandma_long_island",
      label: "Long Island",
      emoji: "👵",
      description: "65% idratazione, 36h frigo, sapore più sviluppato",
      skill_hint: 2,
      params: {
        hydration_pct: 65,
        flour_w: 280,
        flour_pl: 0.62,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  padellino_torino: [
    {
      id: "padellino_casalingo",
      label: "Casalingo",
      emoji: "🏠",
      description: "68% idratazione, 24h frigo, padellino oliato",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [62, 72],
        flour_w_range: [260, 300],
        fermentation_hours_range: [12, 36],
      },
      params: {
        hydration_pct: 68,
        flour_w: 280,
        flour_pl: 0.58,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "padellino_torinese",
      label: "Torinese",
      emoji: "🍳",
      description: "72% idratazione, 36h frigo, fondo ultra-croccante",
      skill_hint: 2,
      ranges: {
        hydration_pct_range: [68, 75],
        flour_w_range: [280, 320],
      },
      params: {
        hydration_pct: 72,
        flour_w: 300,
        flour_pl: 0.60,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  focaccia_recco: [
    {
      id: "recco_igp",
      label: "Disciplinare IGP",
      emoji: "🧀",
      description: "Sfoglia sottilissima, niente lievito, riposo 1h",
      skill_hint: 2,
      params: {
        hydration_pct: 48,
        flour_w: 320, // VPL-B2: era 190 (stale) — disciplinare IGP usa farina di forza W≥300
        flour_pl: 0.60, // VPL-B2: era 0.48 — allineato al range stile [0.55,0.70]
        fermentation_hours: 1,
        fermentation_temp_c: 22,
        use_pre_ferment: false,
      },
    },
  ],

  /* ═══ Sprint 11 Fase 3 — Versioni che cambiano l'IMPASTO ═══
   * Pizza Baciata e Patate&Porchetta possono essere fatte con impasti diversi:
   * il formato (stacked + white_then_top) e il topping rimangono invariati,
   * cambia solo il metodo di lavorazione dell'impasto.                     */
  pizza_baciata: [
    {
      id: "baciata_tradizionale",
      label: "Tradizionale",
      emoji: "📐",
      description: "Impasto Teglia Romana classica, 80%, 24h frigo. Bilanciata, accessibile.",
      skill_hint: 2,
      // Niente impasto_ref → usa style.default_impasto_ref (teglia_romana_classica)
      params: {
        hydration_pct: 80,
        flour_w: 320,
        flour_pl: 0.55,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "baciata_bonci",
      label: "Metodo Bonci",
      emoji: "☁️",
      description: "Idratazione 85%, no-knead spinto, 48h frigo. Mollica nuvola, alta digeribilità.",
      skill_hint: 3,
      impasto_ref: "bonci_metodo",
      params: {
        hydration_pct: 85,
        flour_w: 320,
        flour_pl: 0.58,
        fermentation_hours: 48,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  pizza_spaccata: [
    {
      id: "spaccata_tradizionale",
      label: "Tradizionale",
      emoji: "📐",
      description: "Impasto Teglia Romana classica, 80%, 24h frigo. Base unica da spaccare.",
      skill_hint: 2,
      params: {
        hydration_pct: 80,
        flour_w: 320,
        flour_pl: 0.55,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "spaccata_bonci",
      label: "Metodo Bonci",
      emoji: "☁️",
      description: "Idratazione 85%, no-knead spinto, 48h frigo. Stile pizza al taglio Bonci.",
      skill_hint: 3,
      impasto_ref: "bonci_metodo",
      /* Metodo ad alta idratazione: oltre il range dello stile, dichiarato qui
       * come per le altre varianti (audit totale n. 6). */
      ranges: {
        hydration_pct_range: [80, 88],
        flour_w_range: [300, 340],
        fermentation_hours_range: [24, 72],
      },
      params: {
        hydration_pct: 85,
        flour_w: 320,
        flour_pl: 0.58,
        fermentation_hours: 48,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  /* ═══ Nuovi stili — Sprint 11 espansione catalogo ═══ */
  trancio_milanese: [
    {
      id: "trancio_casalingo",
      label: "Casalingo",
      emoji: "🏠",
      description: "70% idratazione, 24h frigo. Ricetta accessibile, fondo dorato.",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [65, 72],
        fermentation_hours_range: [12, 24],
      },
      params: {
        hydration_pct: 70,
        flour_w: 300,
        flour_pl: 0.55,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "trancio_pizzeria",
      label: "Pizzeria",
      emoji: "🥪",
      description: "72% idratazione, 36h frigo. Stile delle pizzerie milanesi storiche.",
      skill_hint: 2,
      params: {
        hydration_pct: 72,
        flour_w: 320,
        flour_pl: 0.58,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],

  chicago_tavern: [
    {
      id: "tavern_classico",
      label: "Tavern",
      emoji: "🍺",
      description: "55% idratazione, 24h frigo. La pizza dei pub di Chicago.",
      skill_hint: 1,
      ranges: {
        hydration_pct_range: [52, 58],
        fermentation_hours_range: [18, 36],
      },
      params: {
        hydration_pct: 55,
        flour_w: 260,
        flour_pl: 0.60,
        fermentation_hours: 24,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
    {
      id: "tavern_cracker",
      label: "Cracker thin",
      emoji: "🟫",
      description: "52% idratazione, 36h frigo. Estremo croccante, biscottato.",
      skill_hint: 2,
      params: {
        hydration_pct: 52,
        flour_w: 280,
        flour_pl: 0.65,
        fermentation_hours: 36,
        fermentation_temp_c: 4,
        use_pre_ferment: false,
      },
    },
  ],
};

/** Ritorna le versioni disponibili per uno stile, [] se nessuna definita. */
export function getVersions(styleId: string): StyleVersion[] {
  return STYLE_VERSIONS[styleId] ?? [];
}

/** Cerca una versione per id, su tutti gli stili. */
export function getVersionById(versionId: string): StyleVersion | null {
  for (const versions of Object.values(STYLE_VERSIONS)) {
    const v = versions.find((x) => x.id === versionId);
    if (v) return v;
  }
  return null;
}

/* ═══ FW-14 · RIFERIMENTO DELLO STILE (D-B) ═══
 * Un solo «Riferimento» per stile, scritto nei dati e non dedotto dalla
 * difficoltà (prima: versione con skill_hint massimo, che per la Teglia dava
 * l'88 % fuori dalla forbice 75–85 % dello stile). Tutti i delta («Prima →
 * Dopo», «ottimizzato», «Cosa cambia») partono da qui.
 *   - disciplinare: dove esiste un disciplinare (STG, IGP, APITER) il
 *     riferimento è lui (`referenceInterpretationId`);
 *   - provisional: regola precedente tenuta finché i parametri cadono negli
 *     intervalli dello stile, altrimenti la versione che ci cade (o il centro
 *     degli intervalli se nessuna ci cade). Da confermare da Matteo stile per
 *     stile (docs/fonti-dati.md §5.1);
 *   - fonte (tranche B1, D-055 e D-068): uno stile senza disciplinare prende
 *     come riferimento una sua versione d'autore, cioè la ricetta di una
 *     fonte letta (per la teglia casalinga in giornata Benedetta Rossi,
 *     provvisorio: decisione 3 di Matteo del 30/10/2026). La versione è nata
 *     sullo stile, non è un disciplinare ed è offerta dallo stile (test in
 *     recipe-entry.test.ts). */
export type StyleReferenceBasis = "disciplinare" | "provisional" | "fonte";
export interface StyleReference {
  /** Versione di riferimento; null = centro degli intervalli dello stile. */
  referenceVersionId: string | null;
  /** Disciplinare o versione d'autore di riferimento (interpretation-library):
   *  prevale sulla versione. */
  referenceInterpretationId?: string;
  basis: StyleReferenceBasis;
}

const disciplinare = (id: string): StyleReference => ({ referenceVersionId: null, referenceInterpretationId: id, basis: "disciplinare" });
const provisional = (id: string | null): StyleReference => ({ referenceVersionId: id, basis: "provisional" });
/** B1: riferimento = una versione d'autore dello stile (base «fonte»). */
export const sourceReference = (interpretationId: string): StyleReference =>
  ({ referenceVersionId: null, referenceInterpretationId: interpretationId, basis: "fonte" });

const STYLE_REFERENCES: Record<string, StyleReference> = {
  napoletana_stg: disciplinare("avpn_disciplinare"),
  focaccia_recco: disciplinare("igp_recco"),
  teglia_romana: disciplinare("apiter_teglia"),
  napoletana_canotto: provisional("canotto_martucci"),
  tonda_romana: provisional("tonda_scrocchiarella"),
  pinsa_romana: provisional("pinsa_tradizionale"),
  new_york: provisional("ny_classica"),
  detroit: provisional("detroit_classica"),
  chicago_deep: provisional("chicago_tradizionale"),
  focaccia_genovese: provisional(null),
  sfincione: provisional("sfincione_casalingo"),
  pala_romana: provisional("pala_pro"),
  grandma_style: provisional("grandma_long_island"),
  padellino_torino: provisional(null),
  pizza_baciata: provisional("baciata_bonci"),
  pizza_spaccata: provisional("spaccata_tradizionale"),
  trancio_milanese: provisional("trancio_pizzeria"),
  chicago_tavern: provisional("tavern_cracker"),
  // B2: Benedetta Rossi, provvisorio (decisione 3 di Matteo del 30/10/2026).
  teglia_in_giornata: sourceReference("benedetta_rossi"),
};

/** Riferimento dichiarato dello stile; senza voce: centro degli intervalli. */
export function getStyleReference(styleId: string): StyleReference {
  return STYLE_REFERENCES[styleId] ?? { referenceVersionId: null, basis: "provisional" };
}

/** Sceglie la versione adatta allo skill level, o null se lo stile non ne ha.
 *
 * Se `availableHours` è valorizzato (l'utente ha scelto QUANDO vuole la pizza),
 * vengono considerate solo le versioni la cui fermentazione ci sta davvero:
 * mai proporre di default una "Classica 36h" a chi ha chiesto la pizza stasera.
 * Se nessuna versione rispetta il vincolo si torna null e il chiamante usa il
 * range canonico dello stile clampato alle ore disponibili. */
export function getDefaultVersion(
  styleId: string,
  skillLevel: SkillLevel,
  availableHours?: number,
): StyleVersion | null {
  const versions = getVersions(styleId);
  if (versions.length === 0) return null;

  // Margine 10%: gli slot sono stime ("~22 ore"), una versione da 24h ci sta.
  const pool =
    availableHours !== undefined
      ? versions.filter(
          (v) => v.params.fermentation_hours <= availableHours * 1.1,
        )
      : versions;
  if (pool.length === 0) return null;

  const exact = pool.find((v) => v.skill_hint === skillLevel);
  if (exact) return exact;

  // Fallback: versione col skill_hint più vicino, preferendo il livello inferiore
  // (è più "sicuro" partire da una versione più semplice di una più estrema)
  let best = pool[0];
  let bestDist = Math.abs(best.skill_hint - skillLevel);
  for (const v of pool) {
    const dist = Math.abs(v.skill_hint - skillLevel);
    if (dist < bestDist || (dist === bestDist && v.skill_hint < best.skill_hint)) {
      best = v;
      bestDist = dist;
    }
  }
  return best;
}

