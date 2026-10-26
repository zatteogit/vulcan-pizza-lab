/* ═══ INTERPRETATION LIBRARY — Sprint 12 Fase 4 ═══
 *
 * Le Interpretazioni rappresentano come Maestri/Pizzerie/Community/Disciplinari
 * reinterpretano una Ricetta di base con i loro parametri, tecniche signature,
 * storia, anno di codificazione, provenienza.
 *
 * I 4 type:
 *   master       — pizzaiolo singolo (Bonci, Pepe, Martucci, ecc.)
 *   pizzeria     — locale storico (Pizzarium, da Michele, Pepe in Grani)
 *   community    — gruppo/forum (oggi nessuna voce: D-024, mancano le fonti)
 *   disciplinare — testo di regole (AVPN, IGP Recco; APITER è di una community)
 *
 * Quando un'interpretazione è attiva sulla recipe page, i suoi
 * `parameter_overrides` vengono applicati come custom params, e una card
 * narrativa mostra l'autore, l'anno, la firma tecnica e la storia.
 *
 * NOTA: il vecchio AUTHOR_VARIANTS (deviation-tags.ts) è stato rimosso e
 * migrato qui (Audit motore 2026-05). Questa libreria è l'unica fonte di
 * verità per maestri, pizzerie, disciplinari e community.
 */
import type { MethodProcessProfile, SkillLevel } from "../domain/pizza-engine";

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
  process_profile?: MethodProcessProfile;
  id: string;
  type: InterpretationType;

  /* ─── Identità ─── */
  /** Per master/pizzeria, nome del pizzaiolo. */
  author?: string;
  /** Per pizzeria, nome del locale. */
  pizzeria?: string;
  /** Per community/disciplinare, ente/gruppo. */
  organization?: string;
  /** Nome breve per le chip, quando quello pieno è lungo (es. «APITER»). */
  short_name?: string;
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

/* ═══ LIBRERIA — 12 voci, testi verificati sulle fonti il 24/10/2026 ═══
 * Registro e fonti: docs/fonti-dati.md §5. Le ricette dei maestri sono
 * «Ispirata a…» (C-5, D-027): ricostruzioni da fonti pubbliche. */
const INTERPRETATION_LIBRARY: Record<string, Interpretation> = {
  /* ─── DISCIPLINARI (3) ─── */
  avpn_disciplinare: {
    id: "avpn_disciplinare",
    process_profile: {
      id: "avpn_disciplinare", direct_only: true,
      source_url: "https://www.pizzanapoletana.org/public/pdf/Disciplinare-2024-ITA.pdf",
    },
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
    signature_name: "Verace Pizza Napoletana",
    technique_signature: "Disco fino a 35 cm, cornicione 1–2 cm, centro di circa 4 mm. Cottura in 60–90 secondi; la STG vuole il forno a legna, con la platea a circa 485 °C.",
    story: "L'AVPN nasce a Napoli nel 1984 per tutelare la verace pizza napoletana. Nel 2010 l'UE registra la «Pizza Napoletana» come STG, su domanda dell'AVPN e dell'Associazione Pizzaiuoli Napoletani. Il disciplinare AVPN chiede farina 00 o 0 con W 250–320, lievito di birra o naturale, sale e acqua; gas ed elettrico solo in deroga.",
    url: "https://www.pizzanapoletana.org",
    emoji: "📜",
    badge: "STG dal 2010",
    skill_required: 3,
    verified_canonical: true,
  },
  igp_recco: {
    id: "igp_recco",
    process_profile: {
      id: "igp_recco",
      source_url: "https://www.ge.camcom.gov.it/it/promuovi/prodotti-tipici/prodotti-dop-e-igp/disciplinare_focaccia_di_recco_settembre_2024.pdf",
    },
    type: "disciplinare",
    organization: "Consorzio Focaccia di Recco IGP",
    location: "Recco, Liguria",
    // C-4: registrata IGP con reg. UE 2015/39 del 13/01/2015 (era 2012). Farina
    // dal disciplinare (CCIAA Genova 2024, art. 5): W > 300, P/L ≥ 0,50 (era
    // W 190, P/L 0,48: fuori norma). docs/fonti-dati.md §1.3.
    year_codified: 2015,
    base_style_id: "focaccia_recco",
    base_topping_concept_id: "crescenza_recco",
    parameter_overrides: {
      hydration_pct: 48,
      flour_w: 320,
      flour_pl: 0.60,
      fermentation_hours: 1,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Focaccia di Recco col Formaggio IGP",
    technique_signature: "Due sfoglie sottilissime tirate a mano, formaggio fresco a pezzetti in mezzo, bordi saldati e fori sulla sfoglia di sopra. Cottura a 270–320 °C per 4–8 minuti.",
    story: "IGP dal 2015, la Focaccia di Recco col formaggio si fa senza lievito: farina, acqua, olio extravergine e sale. La zona di produzione è il comune di Recco con i confinanti Avegno, Sori e Camogli. Il formaggio è fresco, a pasta molle e cremoso, da latte vaccino fresco pastorizzato.",
    emoji: "📜",
    badge: "IGP dal 2015",
    skill_required: 3,
    verified_canonical: true,
  },
  apiter_teglia: {
    id: "apiter_teglia",
    process_profile: {
      id: "apiter_teglia", direct_only: true, proof_hours: 3.5, proof_in_pan: false,
      source_url: "https://www.laconfraternitadellapizza.net/documenti/Disciplinare-Autentica-Pizza-In-Teglia-Alla-Romana.pdf",
    },
    type: "disciplinare",
    organization: "La Confraternita della Pizza (disciplinare APITER)",
    short_name: "APITER",
    year_codified: 2016,
    base_style_id: "teglia_romana",
    parameter_overrides: {
      hydration_pct: 80,
      flour_w: 320,
      fermentation_hours: 36,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Teglia romana secondo il disciplinare APITER",
    technique_signature: "Farina 00 o 0 con W 300–380 e P/L 0,50–0,60, idratazione alta (dal 75% in su), pieghe di rinforzo a tre, maturazione in frigo da 24 a 72 ore.",
    story: "APITER sta per «Autentica Pizza In TEglia alla Romana»: è il disciplinare firmato dai membri del forum La Confraternita della Pizza, intorno al 2016. È il testo di una community di appassionati, non una norma di legge.",
    emoji: "📜",
    badge: "Disciplinare di community",
    skill_required: 2,
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
    signature_name: "Ispirata alla pizza al taglio di Pizzarium",
    technique_signature: "Impasto molto idratato con lunga maturazione (le fonti parlano di 48–72 ore e oltre), stesura a mano in teglia, taglio con le forbici e vendita a peso.",
    story: "Gabriele Bonci apre Pizzarium a Roma nel 2003, in via della Meloria. La pizza si sceglie al banco, si taglia con le forbici e si paga a peso. Per molti critici il suo lavoro ha cambiato la pizza al taglio romana.",
    url: "https://www.bonci.it",
    emoji: "☁️",
    badge: "Pizzarium dal 2003",
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
    signature_name: "Ispirata alla Margherita Sbagliata",
    technique_signature: "In forno va solo la mozzarella di bufala con un filo d'olio. Dopo la cottura si aggiungono il pomodoro riccio crudo, a strisce, e una riduzione di basilico: il pomodoro resta fresco.",
    story: "Franco Pepe apre Pepe in Grani a Caiazzo nel 2012; la Margherita Sbagliata è del 2015. Lavora soprattutto con ingredienti dell'Alto Casertano. Per 50 Top Pizza, Pepe in Grani è stata la prima pizzeria d'Italia nel 2017, nel 2018 e nel 2019 (ex aequo).",
    url: "https://www.pepeingrani.it",
    emoji: "👨‍🍳",
    badge: "1ª a 50 Top Pizza 2017–2019",
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
      fermentation_hours: 24,
      fermentation_temp_c: 22,
      use_pre_ferment: false,
    },
    signature_name: "Ispirata alla pizza dei Masanielli",
    technique_signature: "Secondo una recensione del 2017: farina di tipo 0 poco proteica, impasto diretto, 24 ore di lievitazione a temperatura ambiente.",
    story: "Francesco Martucci guida I Masanielli a Caserta. Per 50 Top Pizza è la prima pizzeria d'Italia nel 2019 (ex aequo con Pepe in Grani) e, da sola, nel 2020, quando guida anche la classifica mondiale.",
    emoji: "🏗️",
    badge: "1ª a 50 Top Pizza 2020",
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
    signature_name: "Ispirata alla napoletana di Sorbillo",
    technique_signature: "Napoletana classica a cornicione gonfio, nella tradizione di una famiglia di pizzaioli attiva in via dei Tribunali dal 1935.",
    story: "Gino Sorbillo è il nipote di Luigi, che nel 1935 aprì la prima pizzeria di famiglia in via dei Tribunali 32, a Napoli. È spesso ospite in televisione e ha aperto locali in altre città italiane e all'estero.",
    emoji: "🍕",
    badge: "Dal 1935",
    skill_required: 2,
  },

  /* ─── MAESTRI migrati da AUTHOR_VARIANTS (Audit motore 2026-05) ─── */
  bosco_aria_di_pane: {
    id: "bosco_aria_di_pane",
    type: "master",
    author: "Renato Bosco",
    pizzeria: "Saporè",
    location: "San Martino Buon Albergo (VR)",
    year_codified: 2009,
    base_style_id: "teglia_romana",
    compatible_style_ids: ["pala_romana", "pinsa_romana"],
    parameter_overrides: {
      hydration_pct: 80,
      flour_w: 320,
      flour_pl: 0.55,
      fermentation_hours: 48,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Ispirata ad Aria di Pane e Doppio Crunch",
    technique_signature: "Impasto molto idratato (circa 80% nelle ricette che ha pubblicato) con lievito madre, cotto in teglia per avere crosta croccante e mollica leggera.",
    story: "Renato Bosco, detto il «pizzaricercatore», fonda Saporè a San Martino Buon Albergo (VR) nel 2009. Aria di Pane e Doppio Crunch sono sue creazioni, con marchio registrato. Le sue pizzerie hanno ottenuto i Tre Spicchi del Gambero Rosso.",
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
    signature_name: "Ispirata al canotto di Capuano",
    technique_signature: "Cornicione «canotto» alto e alveolato. Al tavolo la pizza si taglia con le forbici: secondo la pizzeria, così si stressa meno l'impasto e non si schiaccia il cornicione.",
    story: "Vincenzo Capuano ha portato la napoletana contemporanea sui social: nel 2025 aveva circa un milione di follower tra Instagram e TikTok. Ha aperto pizzerie in molte città italiane e anche all'estero.",
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
      fermentation_hours: 18,
      fermentation_temp_c: 4,
      use_pre_ferment: false,
    },
    signature_name: "Ispirata a Pizzeria Bianco",
    technique_signature: "Impasto a mano con farina, acqua, sale e lievito, circa 18 ore di lievitazione, farine di mulini locali come Hayden Flour Mills (Arizona).",
    story: "Chris Bianco apre Pizzeria Bianco a Phoenix alla fine degli anni Ottanta, nel retro di un negozio di alimentari. Nel 2003 è il primo pizzaiolo a vincere un James Beard Award (miglior chef del Southwest); nel 2022 ne vince un secondo. Filosofia: pochi ingredienti, materia prima locale.",
    emoji: "🇺🇸",
    badge: "James Beard 2003",
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
    signature_name: "Ispirata agli impasti di «Flour Water Salt Yeast»",
    technique_signature: "Gli impasti «Saturday» si fanno al mattino per la pizza della sera; gli «overnight» si impastano la sera, lievitano di notte a temperatura ambiente e poi vanno in frigo.",
    story: "Dopo vent'anni nell'informatica, Ken Forkish apre a Portland Ken's Artisan Bakery (2001) e Ken's Artisan Pizza (2006). Il suo «Flour Water Salt Yeast» (2012), premiato dalla James Beard Foundation e dall'IACP, ha portato la lievitazione lunga nelle cucine di casa.",
    url: "https://kensartisan.com",
    emoji: "📘",
    badge: "Autore di FWSY",
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
    signature_name: "Margherita e Marinara, e poco altro",
    technique_signature: "Menu ridotto all'osso: per decenni solo Margherita e Marinara, oggi quattro pizze. Forno a legna e niente fronzoli.",
    story: "Fondata nel 1870 dalla famiglia Condurro a Forcella, da Michele è in via Cesare Sersale dal 1930. È una delle pizzerie simbolo della tradizione popolare napoletana. Il film «Mangia prega ama» (2010), con Julia Roberts, l'ha resa famosa nel mondo.",
    emoji: "🏛️",
    badge: "Dal 1870",
    skill_required: 2,
    verified_canonical: true,
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
