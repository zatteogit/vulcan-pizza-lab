/* ═══ INTERPRETATION LIBRARY — Sprint 12 Fase 4 ═══
 *
 * Le Interpretazioni rappresentano come Maestri/Pizzerie/Community/Disciplinari
 * reinterpretano una Ricetta di base con i loro parametri, tecniche signature,
 * storia, anno di codificazione, provenienza.
 *
 * I 4 type:
 *   master       — pizzaiolo singolo (Bonci, Pepe, Martucci, ecc.)
 *   pizzeria     — locale storico (Pizzarium, da Michele, Pepe in Grani)
 *   community    — gruppo/forum (Malati di Pizza, Pizzaioli Anonimi)
 *   disciplinare — ente ufficiale (AVPN, Confraternita, IGP, APITER)
 *
 * Quando un'interpretazione è attiva sulla recipe page, i suoi
 * `parameter_overrides` vengono applicati come custom params, e una card
 * narrativa mostra l'autore, l'anno, la firma tecnica e la storia.
 *
 * NOTA: il vecchio AUTHOR_VARIANTS (deviation-tags.ts) è stato rimosso e
 * migrato qui (Audit motore 2026-05). Questa libreria è l'unica fonte di
 * verità per maestri, pizzerie, disciplinari e community.
 */
import type { SkillLevel } from "../domain/pizza-engine";

type InterpretationType =
  | "master"
  | "pizzeria"
  | "community"
  | "disciplinare";

interface InterpretationParameterOverrides {
  hydration_pct?: number;
  flour_w?: number;
  flour_pl?: number;
  fermentation_hours?: number;
  fermentation_temp_c?: 4 | 12 | 22;
  use_pre_ferment?: boolean;
  dough_weight_g?: number;
  /** Override impasto (link a IMPASTO_LIBRARY). */
  impasto_ref?: string;
}

export interface Interpretation {
  id: string;
  type: InterpretationType;

  /* ─── Identità ─── */
  /** Per master/pizzeria, nome del pizzaiolo. */
  author?: string;
  /** Per pizzeria, nome del locale. */
  pizzeria?: string;
  /** Per community/disciplinare, ente/gruppo. */
  organization?: string;
  /** Città / paese di origine. */
  location?: string;
  /** Anno di codificazione/fondazione. */
  year_codified?: number;

  /* ─── Cosa interpreta ─── */
  /** Style "parent" dell'interpretazione. */
  base_style_id: string;
  /** Style compatibili (oltre al base). Se omesso, solo base. */
  compatible_style_ids?: string[];
  /** Topping concept associato (opzionale, se l'interpretazione si lega a un topping). */
  base_topping_concept_id?: string;

  /* ─── Come la cambia ─── */
  parameter_overrides?: InterpretationParameterOverrides;

  /* ─── Narrativa ─── */
  /** Nome firma (es. "Margherita Sbagliata"). Visibile prominentemente. */
  signature_name?: string;
  /** Tecnica signature in 1-2 frasi. */
  technique_signature?: string;
  /** Storia/bio in 2-3 frasi. */
  story: string;
  /** Link a video/libro/sito. */
  url?: string;

  /* ─── Metadata UI ─── */
  emoji?: string;
  /** Badge breve (es. "Tre stelle Pizza", "Disciplinare ufficiale"). */
  badge?: string;
  /** Difficoltà richiesta (1-4). */
  skill_required?: SkillLevel;
  /** Marker per ordinamento UI. */
  verified_canonical?: boolean;
}

/* ═══ LIBRERIA — 10 voci iniziali ═══ */
const INTERPRETATION_LIBRARY: Record<string, Interpretation> = {
  /* ─── DISCIPLINARI (3) ─── */
  avpn_disciplinare: {
    id: "avpn_disciplinare",
    type: "disciplinare",
    organization: "AVPN — Associazione Verace Pizza Napoletana",
    location: "Napoli",
    year_codified: 1984,
    base_style_id: "napoletana_stg",
    base_topping_concept_id: "margherita",
    parameter_overrides: {
      hydration_pct: 60,
      flour_w: 280,
      flour_pl: 0.62,
      fermentation_hours: 12,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Verace Pizza Napoletana STG",
    technique_signature: "Disco 32cm, cornicione 1-2cm gonfio, centro 4mm, leopardatura, cottura wood-oven 60-90s a 430-485°C.",
    story:
      "L'AVPN nasce nel 1984 per tutelare la verace pizza napoletana. Nel 2010 ottiene il marchio STG (Specialità Tradizionale Garantita) dall'Unione Europea. I parametri sono codificati: solo farina 0/00 W250-320, lievito di birra/madre, sale, acqua. Cottura solo in forno a legna.",
    url: "https://www.pizzanapoletana.org",
    emoji: "📜",
    badge: "STG dal 2010",
    skill_required: 3,
    verified_canonical: true,
  },
  igp_recco: {
    id: "igp_recco",
    type: "disciplinare",
    organization: "Consorzio Focaccia di Recco IGP",
    location: "Recco, Liguria",
    year_codified: 2012,
    base_style_id: "focaccia_recco",
    base_topping_concept_id: "crescenza_recco",
    parameter_overrides: {
      hydration_pct: 48,
      flour_w: 190,
      flour_pl: 0.48,
      fermentation_hours: 1,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Focaccia di Recco col Formaggio IGP",
    technique_signature: "Doppia sfoglia sottilissima tirata a mano, crescenza fondente all'interno, sigillatura bordi, cottura 270°C 5min.",
    story:
      "Ottenuta IGP nel 2012, la Focaccia di Recco è uno degli unici prodotti panari italiani senza lievito. Solo 7 comuni del Tigullio possono fregiarsi del marchio IGP. La crescenza deve essere ligure e non sostituibile.",
    emoji: "📜",
    badge: "IGP dal 2012",
    skill_required: 3,
    verified_canonical: true,
  },
  apiter_teglia: {
    id: "apiter_teglia",
    type: "disciplinare",
    organization: "APITER — Confraternita Pizza in Teglia",
    location: "Roma",
    year_codified: 2018,
    base_style_id: "teglia_romana",
    parameter_overrides: {
      hydration_pct: 80,
      flour_w: 320,
      fermentation_hours: 36,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Teglia Romana APITER Standard",
    technique_signature: "Idratazione 75-85%, W300-380, P/L 0.50-0.60, no-knead con 3-4 pieghe, maturazione 24-48h frigo.",
    story:
      "APITER nasce per tutelare l'identità della Pizza in Teglia Romana, codificando i parametri tradizionali contro la deriva 'alta idratazione spinta'. È diventato lo standard di riferimento per le pizzerie professionali e i corsi pro.",
    emoji: "📜",
    badge: "Standard pro",
    skill_required: 2,
    verified_canonical: true,
  },

  /* ─── MAESTRI (4) ─── */
  bonci_pizzarium: {
    id: "bonci_pizzarium",
    type: "master",
    author: "Gabriele Bonci",
    pizzeria: "Pizzarium",
    location: "Roma",
    year_codified: 2003,
    base_style_id: "teglia_romana",
    compatible_style_ids: ["pala_romana", "pizza_baciata"],
    parameter_overrides: {
      hydration_pct: 82,
      flour_w: 320,
      flour_pl: 0.60,
      fermentation_hours: 48,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
      impasto_ref: "bonci_metodo",
    },
    signature_name: "Pizza al Taglio Pizzarium",
    technique_signature: "No-knead totale, 4 pieghe ogni 30min con rotazione 90°, maturazione 48-72h frigo, stesa con sole dita, taglio a forbice, vendita a peso.",
    story:
      "Bonci ha codificato il metodo no-knead all'italiana nel 2003 col format Teglia. Pizzarium è il flagship: la pizza è tagliata a forbice e venduta a peso. Ha cambiato il paradigma della pizza al taglio italiana.",
    url: "https://www.bonci.it",
    emoji: "☁️",
    badge: "Pizza al taglio iconica",
    skill_required: 3,
  },
  pepe_caiazzo: {
    id: "pepe_caiazzo",
    type: "master",
    author: "Franco Pepe",
    pizzeria: "Pepe in Grani",
    location: "Caiazzo (CE)",
    year_codified: 2012,
    base_style_id: "napoletana_canotto",
    compatible_style_ids: ["napoletana_stg"],
    base_topping_concept_id: "margherita",
    parameter_overrides: {
      hydration_pct: 65,
      flour_w: 310,
      fermentation_hours: 30,
      fermentation_temp_c: 12,
      use_pre_ferment: false,
    },
    signature_name: "Margherita Sbagliata",
    technique_signature: "Fior di latte e pomodoro applicati post-cottura in 3 momenti separati: dots geometrici di pomodoro, crema di mozzarella, basilico fresco. Tecnica del 'sensory layering'.",
    story:
      "Franco Pepe ha portato la pizza nel mondo della gastronomia gourmet. Pepe in Grani a Caiazzo è considerata una delle migliori pizzerie del mondo (50 Top Pizza). Il suo approccio è scientifico-territoriale: ingredienti del Sannio, fermentazioni controllate, tecnica chef.",
    url: "https://www.pepeingrani.it",
    emoji: "👨‍🍳",
    badge: "50 Top Pizza #1 2017-2019",
    skill_required: 4,
  },
  martucci_caserta: {
    id: "martucci_caserta",
    type: "master",
    author: "Francesco Martucci",
    pizzeria: "I Masanielli",
    location: "Caserta",
    year_codified: 2015,
    base_style_id: "napoletana_canotto",
    parameter_overrides: {
      hydration_pct: 70,
      flour_w: 320,
      flour_pl: 0.55,
      fermentation_hours: 48,
      fermentation_temp_c: 4,
      use_pre_ferment: true,
    },
    signature_name: "Canotto a Biga Ibrida 50%",
    technique_signature: "Biga 50% farina (18h a 18°C) + autolisi simultanea della restante farina. Fermentazione totale 48-72h, cornicione esplosivo controllato.",
    story:
      "Martucci ha portato il 'canotto' moderno al massimo livello tecnico. La sua tecnica di biga ibrida è studiata nei corsi professionali. 50 Top Pizza #1 nel 2020.",
    emoji: "🏗️",
    badge: "50 Top Pizza #1 2020",
    skill_required: 4,
  },
  sorbillo_napoli: {
    id: "sorbillo_napoli",
    type: "master",
    author: "Gino Sorbillo",
    pizzeria: "Pizzeria Sorbillo",
    location: "Napoli",
    year_codified: 1935,
    base_style_id: "napoletana_stg",
    parameter_overrides: {
      hydration_pct: 62,
      flour_w: 280,
      fermentation_hours: 24,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Napoletana Sorbillo (3a generazione)",
    technique_signature: "Stesura a libro velocissima, ruota di carro 32cm, cornicione gonfio classico. Tradizione di famiglia dal 1935 (terza generazione).",
    story:
      "Gino Sorbillo rappresenta la tradizione napoletana classica. Pizzeria storica in via dei Tribunali a Napoli. È diventato volto televisivo della cultura pizzaiola e ha aperto sedi in tutta Italia.",
    emoji: "🍕",
    badge: "Tradizione 1935",
    skill_required: 2,
  },

  /* ─── MAESTRI migrati da AUTHOR_VARIANTS (Audit motore 2026-05) ─── */
  bosco_aria_di_pane: {
    id: "bosco_aria_di_pane",
    type: "master",
    author: "Renato Bosco",
    pizzeria: "Saporè",
    location: "San Martino Buon Albergo (VR)",
    year_codified: 2010,
    base_style_id: "teglia_romana",
    compatible_style_ids: ["pala_romana", "pinsa_romana"],
    parameter_overrides: {
      hydration_pct: 85,
      flour_w: 320,
      flour_pl: 0.55,
      fermentation_hours: 48,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Aria di Pane / Doppio Crunch",
    technique_signature: "Metodo idrolisi (autolisi spinta) con lievito minimo, idratazione 80-90%, cottura bifasica per crosta vetrosa e mollica aerata.",
    story:
      "Renato Bosco, 'pizzaricercatore' di Saporè, ha codificato l'alta idratazione moderna in teglia. Le sue creazioni 'Aria di Pane' e 'Doppio Crunch' sono studiate nei corsi professionali. Tra i pizzaioli più premiati d'Italia (50 Top Pizza, Gambero Rosso).",
    emoji: "🌬️",
    badge: "Pizzaricercatore",
    skill_required: 4,
  },
  capuano_napoli: {
    id: "capuano_napoli",
    type: "master",
    author: "Vincenzo Capuano",
    pizzeria: "Pizzeria Vincenzo Capuano",
    location: "Napoli",
    year_codified: 2018,
    base_style_id: "napoletana_canotto",
    compatible_style_ids: ["napoletana_stg"],
    base_topping_concept_id: "margherita",
    parameter_overrides: {
      hydration_pct: 70,
      flour_w: 300,
      fermentation_hours: 24,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Canotto e metodo forbici",
    technique_signature: "Cornicione 'canotto' alto e areato; mozzarella tagliata a forbici da fredda per preservare il siero (~95% vs 70% col coltello).",
    story:
      "Vincenzo Capuano ha portato la napoletana contemporanea sui social con un seguito enorme, aprendo sedi in tutta Italia ed Europa. Il 'metodo forbici' per i latticini è la sua firma più imitata.",
    emoji: "✂️",
    badge: "Canotto contemporaneo",
    skill_required: 3,
  },
  bianco_phoenix: {
    id: "bianco_phoenix",
    type: "master",
    author: "Chris Bianco",
    pizzeria: "Pizzeria Bianco",
    location: "Phoenix, Arizona",
    year_codified: 1988,
    base_style_id: "napoletana_stg",
    compatible_style_ids: ["napoletana_canotto"],
    parameter_overrides: {
      hydration_pct: 63,
      flour_w: 280,
      fermentation_hours: 120,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Fermentazione 5 giorni",
    technique_signature: "Fermentazione fredda 5 giorni, farina macinata localmente (Arizona). Minimalismo assoluto: acqua, farina, sale, lievito.",
    story:
      "Chris Bianco è considerato il padre della pizza artigianale americana. Primo pizzaiolo a vincere il James Beard Award (3 volte). La sua filosofia: pochi ingredienti, lunga fermentazione, materia prima locale.",
    emoji: "🇺🇸",
    badge: "3× James Beard",
    skill_required: 3,
  },
  forkish_portland: {
    id: "forkish_portland",
    type: "master",
    author: "Ken Forkish",
    pizzeria: "Ken's Artisan Pizza",
    location: "Portland, Oregon",
    year_codified: 2006,
    base_style_id: "new_york",
    compatible_style_ids: ["teglia_romana"],
    parameter_overrides: {
      hydration_pct: 68,
      flour_w: 280,
      fermentation_hours: 24,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Saturday Pizza (FWSY)",
    technique_signature: "Impasto venerdì sera, fermentazione fredda overnight, pizza il sabato. Workflow casalingo ottimizzato dal libro 'Flour Water Salt Yeast'.",
    story:
      "Ken Forkish, ex-tecnologo passato alla panificazione, ha reso accessibile la fermentazione lunga ai panificatori casalinghi col bestseller 'Flour Water Salt Yeast'. Il suo 'Saturday Pizza' è lo schema di riferimento per il weekend.",
    url: "https://kensartisan.com",
    emoji: "📘",
    badge: "Autore FWSY",
    skill_required: 2,
  },

  /* ─── PIZZERIE STORICHE (1) ─── */
  da_michele_napoli: {
    id: "da_michele_napoli",
    type: "pizzeria",
    pizzeria: "L'Antica Pizzeria da Michele",
    location: "Napoli",
    year_codified: 1870,
    base_style_id: "napoletana_stg",
    parameter_overrides: {
      hydration_pct: 60,
      flour_w: 260,
      fermentation_hours: 8,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Margherita o Marinara — niente altro",
    technique_signature: "Da 150+ anni solo 2 pizze: Margherita e Marinara. Forno a legna acceso dalle 7 del mattino, impasto giornaliero, niente fronzoli.",
    story:
      "Aperta nel 1870 in via Cesare Sersale a Napoli, da Michele è la pizzeria simbolo della tradizione popolare. Il menu è composto da SOLO Margherita e Marinara. Resa famosa internazionalmente da 'Mangia Prega Ama' con Julia Roberts.",
    emoji: "🏛️",
    badge: "Dal 1870",
    skill_required: 2,
    verified_canonical: true,
  },

  /* ─── COMMUNITY (2) ─── */
  malati_di_pizza: {
    id: "malati_di_pizza",
    type: "community",
    organization: "Malati di Pizza (community)",
    year_codified: 2010,
    base_style_id: "teglia_romana",
    compatible_style_ids: ["pala_romana", "pinsa_romana"],
    parameter_overrides: {
      hydration_pct: 75,
      flour_w: 280,
      fermentation_hours: 24,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
      dough_weight_g: 600,
    },
    signature_name: "Bonci Casalingo (dose dimezzata)",
    technique_signature: "Versione 'casalinga' del Bonci: 0.5 g/cm² (era 0.75), pizza più sottile, accessibile a forno domestico standard. Testata su 200+ post di forum.",
    story:
      "Sviluppata sul forum Malati di Pizza dopo anni di test per replicare Bonci a casa senza forno professionale. La community ha codificato dose, idratazione e timing accessibili al pizzaiolo amatoriale italiano.",
    url: "https://www.malatidipizza.com",
    emoji: "🍕",
    badge: "Community casalinga",
    skill_required: 1,
  },
  confraternita_pinsa: {
    id: "confraternita_pinsa",
    type: "community",
    organization: "Confraternita della Pizza",
    year_codified: 2014,
    base_style_id: "pinsa_romana",
    compatible_style_ids: ["pala_romana"],
    parameter_overrides: {
      hydration_pct: 80,
      flour_w: 290,
      fermentation_hours: 48,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Pinsa Multicereali 48h",
    technique_signature: "Mix farina (70% grano, 15% riso, 15% soia), 80% idratazione, 48h frigo, stesura ovale, crosta vetrosa.",
    story:
      "Il forum Confraternita della Pizza ha codificato la Pinsa Romana moderna divulgando ricette di Corrado Di Marco. Standard per la pinsa casalinga di qualità.",
    emoji: "👥",
    badge: "Community pinsa",
    skill_required: 2,
  },
};

/* ═══ API ═══ */

/** Tutte le interpretazioni come array. */
export function getAllInterpretations(): Interpretation[] {
  return Object.values(INTERPRETATION_LIBRARY);
}

/** Lookup per id. */
export function getInterpretationById(id: string): Interpretation | undefined {
  return INTERPRETATION_LIBRARY[id];
}

/** Interpretazioni compatibili con uno Style.
 *  Filtra per base_style_id OR compatible_style_ids. */
export function getInterpretationsForStyle(styleId: string): Interpretation[] {
  return getAllInterpretations().filter(
    (i) => i.base_style_id === styleId || i.compatible_style_ids?.includes(styleId),
  );
}
