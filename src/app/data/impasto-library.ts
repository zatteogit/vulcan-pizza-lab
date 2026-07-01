/* ═══ IMPASTO LIBRARY — Sprint 11 Fase 3 ═══
 *
 * Gli "impasti" sono specifiche di METODO riusabili applicabili a più stili.
 * Es. "Metodo Bonci" è un impasto che può essere applicato sia alla Teglia
 * Romana tradizionale che alla Baciata, ottenendo lo stesso formato/topping
 * ma con tecnica diversa (no-knead + pieghe vs diretto).
 *
 * Ogni impasto dichiara `dough_overrides` (Partial<DoughParameters>) che
 * sovrascrivono il dough base dello stile. Quando il motore costruisce una
 * ricetta, l'ordine di priorità è:
 *
 *    version.impasto_ref → impasto.dough_overrides
 *        ↓ poi
 *    style.default_impasto_ref → impasto.dough_overrides
 *        ↓ poi
 *    style.dough (base)
 *
 * Le `version.params` (hydration_pct, flour_w, fermentation_hours) restano
 * le sorgenti puntuali dei valori iniziali al click del chip; l'impasto
 * fornisce i range entro cui questi valori sono validi.
 */
import type { DoughParameters } from "../domain/pizza-engine";

/** Metodo di lavorazione dell'impasto. */
type KneadingMethod =
  | "no_knead_folds"        // no-knead con pieghe (Bonci, Teglia Romana moderna)
  | "direct_short"          // impasto diretto breve (Tonda Romana, Napoletana STG)
  | "direct_long"           // impasto diretto + maturazione lunga (Padellino, NY)
  | "biga_indirect"         // biga + impasto finale (Canotto Martucci, Pala pro)
  | "poolish_indirect"      // poolish + impasto finale
  | "autolisi_then_knead"   // autolisi 30-60 min, poi impasto (Detroit moderna)
  | "rolled_no_yeast";      // tirato col mattarello, senza lievito (Focaccia Recco)

export interface ImpastoRecipe {
  id: string;
  /** Nome esteso per UI (descrittivo). */
  name: string;
  /** Nome breve per chip (max ~14 char). */
  short_name?: string;
  description: string;
  emoji: string;

  /** Override parziali sul dough dello stile. Quando un campo è undefined,
   *  il consumer usa il valore dello style.dough originale. */
  dough_overrides?: Partial<DoughParameters>;

  /** Metodo di lavorazione (per future personalizzazioni della timeline). */
  kneading_method: KneadingMethod;

  /** Richiede pre-ferment? Se true, sovrascrive style.requires_pre_ferment. */
  requires_pre_ferment?: boolean;

  /** Note tecniche aggiuntive (opzionali) — usate per arricchire la timeline. */
  technique_notes?: {
    autolisi_minutes?: number;
    folds_count?: number;
    folds_interval_minutes?: number;
    bulk_at_room_minutes?: number;
  };

  /** Stili con cui questo impasto è "naturalmente" compatibile. Se omesso,
   *  l'impasto è considerato applicabile a qualunque stile (filtro UI generico). */
  compatible_styles?: string[];

  /** Tip educativo mostrato nella UI (es. tooltip della chip). */
  tip?: { beginner?: string; nerd?: string };
}

/* ═══ Libreria impasti ═══
 *
 * 5 impasti base che coprono il 90% degli stili attuali:
 * - teglia_romana_classica  → Teglia, Baciata, Patate&Porchetta
 * - bonci_metodo            → Bonci, Teglia, Baciata (versione "Bonci")
 * - napoletana_diretto      → Napoletana STG
 * - biga_indiretto          → Canotto, Pala pro
 * - padellino_diretto       → Padellino
 *
 * Espandibile: ogni stile contemporaneo può eleggere il suo default tramite
 * `default_impasto_ref` su PizzaStyle, e le sue versioni possono offrire
 * impasti alternativi tramite `impasto_ref` su StyleVersion.
 */
const IMPASTO_LIBRARY: Record<string, ImpastoRecipe> = {
  teglia_romana_classica: {
    id: "teglia_romana_classica",
    name: "Teglia Romana classica",
    short_name: "Tradizionale",
    description:
      "Idratazione 80%, no-knead con pieghe, maturazione 24-36h. Standard Confraternita/APITER.",
    emoji: "📐",
    dough_overrides: {
      hydration_pct_range: [75, 85],
      flour_w_range: [300, 360],
      flour_pl_range: [0.50, 0.60],
      salt_pct: 2.5,
      oil_pct: 2.5,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 36],
      process_type: "no_knead",
    },
    kneading_method: "no_knead_folds",
    technique_notes: {
      folds_count: 3,
      folds_interval_minutes: 30,
      bulk_at_room_minutes: 120,
    },
    compatible_styles: [
      "teglia_romana",
      "pizza_baciata",
      "pizza_spaccata",
      "pala_romana",
    ],
    tip: {
      beginner:
        "Il metodo classico romano: nessuna fatica con la spianatoia, solo qualche piega ogni 30 minuti.",
      nerd:
        "L'incordatura avviene tramite riposi e pieghe: la rete glutinica si forma per idratazione progressiva, non per energia meccanica.",
    },
  },

  bonci_metodo: {
    id: "bonci_metodo",
    name: "Metodo Bonci",
    short_name: "Bonci",
    description:
      "Idratazione 80-85%, no-knead, pieghe ogni 30min, 24-48h frigo. Mollica nuvola, alta digeribilità.",
    emoji: "☁️",
    dough_overrides: {
      hydration_pct_range: [78, 90],
      flour_w_range: [280, 340],
      flour_pl_range: [0.50, 0.65],
      salt_pct: 2.5,
      oil_pct: 3.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "no_knead",
    },
    kneading_method: "no_knead_folds",
    technique_notes: {
      folds_count: 4,
      folds_interval_minutes: 30,
      bulk_at_room_minutes: 90,
    },
    compatible_styles: [
      "teglia_romana",
      "pizza_baciata",
      "pizza_spaccata",
    ],
    tip: {
      beginner:
        "Niente impastatrice né forza: bagna, gira, aspetta. La forza arriva dal tempo.",
      nerd:
        "L'olio aggiunto in fase finale crea un film tra le maglie glutiniche che rallenta la perdita d'acqua in cottura: alveolatura più aperta, mollica più umida.",
    },
  },

  napoletana_diretto: {
    id: "napoletana_diretto",
    name: "Diretto napoletano",
    short_name: "Napoletano",
    description:
      "Idratazione 60%, diretto, 8-24h ambiente. Standard AVPN.",
    emoji: "🍕",
    dough_overrides: {
      hydration_pct_range: [55, 62],
      flour_w_range: [250, 320],
      flour_pl_range: [0.55, 0.70],
      salt_pct: 2.8,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [8, 24],
      process_type: "direct",
    },
    kneading_method: "direct_short",
    compatible_styles: ["napoletana_stg"],
    tip: {
      beginner:
        "Lavorazione classica a mano: impasta, lascia rilassare, forma i panetti.",
      nerd:
        "Idratazione moderata (60%) e farina W300 forniscono struttura sufficiente per una maturazione breve a temperatura ambiente, secondo il disciplinare AVPN.",
    },
  },

  biga_indiretto: {
    id: "biga_indiretto",
    name: "Metodo a Biga",
    short_name: "Biga",
    description:
      "Pre-fermento biga 18h, poi rinfresco + 48h frigo. Cornicione esplosivo, mollica aperta.",
    emoji: "🏗️",
    dough_overrides: {
      hydration_pct_range: [65, 78],
      flour_w_range: [300, 350],
      flour_pl_range: [0.50, 0.65],
      salt_pct: 2.5,
      oil_pct: 0.0,
      fat_type: "none",
      sugar_pct: 0.0,
      fermentation_hours_range: [24, 72],
      process_type: "biga",
    },
    kneading_method: "biga_indirect",
    requires_pre_ferment: true,
    technique_notes: {
      bulk_at_room_minutes: 60,
    },
    compatible_styles: ["napoletana_canotto", "pala_romana"],
    tip: {
      beginner:
        "La biga è un piccolo pre-impasto che riposa una notte prima del vero impasto. Più ore, più sapore.",
      nerd:
        "La biga (44% idro, 1% LdB) sviluppa acidi organici (lattico, acetico) e composti aromatici che amplificano la complessità del prodotto finito.",
    },
  },

  padellino_diretto: {
    id: "padellino_diretto",
    name: "Padellino diretto",
    short_name: "Padellino",
    description:
      "Idratazione media 70%, diretto, 18-36h. Specifico per cottura in padellino oliato.",
    emoji: "🍳",
    dough_overrides: {
      hydration_pct_range: [65, 75],
      flour_w_range: [260, 320],
      flour_pl_range: [0.50, 0.65],
      salt_pct: 2.5,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.5,
      fermentation_hours_range: [18, 36],
      process_type: "direct",
    },
    kneading_method: "direct_long",
    compatible_styles: ["padellino_torino"],
    tip: {
      beginner:
        "Padellino ben oliato: l'impasto cresce dentro, il fondo diventa croccante come una focaccina.",
      nerd:
        "Il padellino in ferro nero accumula calore inerziale: la conduzione termica diretta porta il fondo oltre i 200°C, accelerando reazioni di Maillard e cristallizzazione zuccheri.",
    },
  },

  /* ═══ IMPASTI SPECIALI — Audit motore 2026-05 (dietetici/salutisti) ═══
   * Applicabili a più stili tramite default_impasto_ref o version.impasto_ref.
   * compatible_styles omesso → generici (filtro UI li mostra ovunque). */

  senza_glutine: {
    id: "senza_glutine",
    name: "Senza glutine",
    short_name: "Gluten-free",
    description:
      "Mix gluten-free (riso, mais, psyllium/gomma di guar) ad alta idratazione. Niente maglia glutinica: l'impasto è una pastella densa modellata, non lavorata.",
    emoji: "🌾",
    dough_overrides: {
      // W e P/L non applicabili (no glutine): teniamo range bassi nominali.
      flour_w_range: [0, 0],
      flour_pl_range: [0, 0],
      hydration_pct_range: [80, 100], // Le farine GF assorbono molta più acqua
      salt_pct: 2.0,
      oil_pct: 4.0, // Grasso per struttura e morbidezza
      fat_type: "oil",
      sugar_pct: 1.0, // Aiuta doratura e lievitazione
      fermentation_hours_range: [2, 6], // Lievitazione breve: senza glutine non trattiene a lungo
      process_type: "direct",
    },
    kneading_method: "direct_short",
    tip: {
      beginner:
        "Niente impasto da incordare: mescola fino a pastella densa e modella con le mani bagnate o una spatola.",
      nerd:
        "Senza glutine la struttura dipende da idrocolloidi (psyllium, xantano, guar) che imitano la viscoelasticità. L'alta idratazione gelatinizza l'amido in cottura per dare mollica.",
    },
  },

  integrale_multicereali: {
    id: "integrale_multicereali",
    name: "Integrale / multicereali",
    short_name: "Integrale",
    description:
      "Farina integrale o mix multicereali (grano, segale, farro). Più fibra, W effettivo più basso, idratazione aumentata perché la crusca assorbe acqua.",
    emoji: "🌰",
    dough_overrides: {
      flour_w_range: [200, 280], // L'integrale ha meno glutine sviluppabile
      flour_pl_range: [0.45, 0.60],
      hydration_pct_range: [70, 80], // Crusca assorbe → serve più acqua
      salt_pct: 2.2,
      oil_pct: 2.0,
      fat_type: "oil",
      sugar_pct: 0.0,
      fermentation_hours_range: [12, 36], // Maturazione lunga per ammorbidire la crusca
      process_type: "autolisi",
    },
    kneading_method: "autolisi_then_knead",
    technique_notes: {
      autolisi_minutes: 60, // Autolisi lunga per idratare la crusca
    },
    tip: {
      beginner:
        "L'integrale beve più acqua: l'impasto sembra appiccicoso all'inizio ma si stabilizza con il riposo (autolisi).",
      nerd:
        "La crusca taglia la maglia glutinica (effetto 'lama'): un'autolisi lunga e idratazione maggiore compensano, mantenendo estensibilità e volume.",
    },
  },
};

/** Risolve impasto da id, undefined se non trovato. */
export function getImpasto(id: string): ImpastoRecipe | undefined {
  return IMPASTO_LIBRARY[id];
}

/** Merge utility: applica i dough_overrides di un impasto sopra il dough base.
 *  Solo i campi definiti nell'impasto sovrascrivono — gli altri restano. */
export function mergeImpastoIntoDough(
  baseDough: DoughParameters,
  impasto: ImpastoRecipe | undefined,
): DoughParameters {
  if (!impasto?.dough_overrides) return baseDough;
  return { ...baseDough, ...impasto.dough_overrides };
}
