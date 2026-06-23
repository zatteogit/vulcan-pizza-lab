/* ═══ SIGNATURE RECIPES — Sprint 12 Fase 5 ═══
 *
 * "Ricette iconiche": combinazioni (Style + Topping concept) culturalmente
 * riconosciute che vivono nel menu di una pizzeria come voci a sé.
 *
 * Sotto al cofano sono solo deep-link: aprono la recipe page dello Style
 * con il Topping pre-selezionato via search param ?topping=<concept_id>.
 *
 * Esempi:
 *   "Margherita Verace"   → napoletana_stg + margherita
 *   "Cacio e Pepe"        → napoletana_canotto + cacio_e_pepe
 *   "Patate e Porchetta"  → pizza_baciata + patate_porchetta
 *   "Mortazza alla Pala"  → pala_romana + bianca_mortazza
 *
 * Sono pensate per popolare la pagina /explore con qualcosa di più
 * "appetitoso" della semplice lista Stili: voci che evocano la pizza
 * finita più che la tecnica.
 */
import type { FamilyId } from "../domain/pizza-engine";

export interface SignatureRecipe {
  id: string;
  name: string;
  description: string;
  emoji?: string;
  /** Foto override; se omesso, eredita STYLE_PHOTOS[style_id]. */
  photo?: string;

  /** Style "parent" della ricetta. */
  style_id: string;
  /** Topping concept da applicare (verrà risolto dal resolver per family). */
  topping_concept_id: string;

  /** Family (derivata dallo style ma cached per filtri rapidi). */
  family: FamilyId;

  /** Tag occasione per filtri "Scopri" (es. "weekend", "comfort", "tradizione"). */
  occasion_tags?: string[];

  /** Badge breve mostrato sulla card (es. "Disciplinare AVPN", "Tradizione laziale"). */
  authenticity_badge?: string;

  /**
   * Interpretazione associata (link a INTERPRETATION_LIBRARY).
   * Se presente:
   *   - la card Iconiche mostra il nome del Maestro/Pizzeria/Ente come sotto-titolo
   *   - il deep-link aggiunge ?interpretation=<id> così la recipe page applica
   *     gli override e mostra la card narrativa.
   */
  interpretation_id?: string;
}

/** Ricette iconiche — 12 voci selezionate per coprire le 4 famiglie principali. */
export const SIGNATURE_RECIPES: SignatureRecipe[] = [
  /* ═══ NAPOLETANE ═══ */
  {
    id: "margherita_verace",
    name: "Margherita Verace",
    description: "L'icona universale. San Marzano DOP, fior di latte campano, basilico fresco, cottura in 90s a 450°C.",
    emoji: "🍅",
    style_id: "napoletana_stg",
    topping_concept_id: "margherita",
    family: "napoletana",
    occasion_tags: ["sempre", "classico"],
    authenticity_badge: "Disciplinare AVPN",
    interpretation_id: "avpn_disciplinare",
  },
  {
    id: "marinara_avpn",
    name: "Marinara",
    description: "Niente formaggio. Pomodoro, aglio, origano, olio EVO. La pizza dei marinai partenopei.",
    emoji: "🌿",
    style_id: "napoletana_stg",
    topping_concept_id: "marinara",
    family: "napoletana",
    occasion_tags: ["vegano", "asciutta"],
    authenticity_badge: "Disciplinare AVPN",
    interpretation_id: "avpn_disciplinare",
  },
  {
    id: "cacio_e_pepe_napoletana",
    name: "Cacio e Pepe",
    description: "Crema di pecorino romano stesa sul calore residuo. Trucco dei pizzaioli gourmet napoletani.",
    emoji: "⚫",
    style_id: "napoletana_canotto",
    topping_concept_id: "cacio_e_pepe",
    family: "napoletana",
    occasion_tags: ["gourmet", "comfort"],
    interpretation_id: "pepe_caiazzo",
  },
  {
    id: "salsiccia_friarielli",
    name: "Salsiccia & Friarielli",
    description: "Classico napoletano DOC. Cime di rapa amarognole, salsiccia rosolata, provola affumicata.",
    emoji: "🥬",
    style_id: "napoletana_stg",
    topping_concept_id: "salsiccia_friarielli",
    family: "napoletana",
    occasion_tags: ["inverno", "tradizione"],
  },

  /* ═══ ROMANE ═══ */
  {
    id: "patate_e_porchetta",
    name: "Patate e Porchetta",
    description: "Doppio strato in teglia: patate a scaglie arricciate sopra, porchetta nel ripieno post-cottura.",
    emoji: "🥔",
    style_id: "pizza_baciata",
    topping_concept_id: "patate_porchetta",
    family: "romana",
    occasion_tags: ["weekend", "comfort", "tradizione laziale"],
    authenticity_badge: "Stile panaria romana",
  },
  {
    id: "mortazza_alla_pala",
    name: "Mortazza alla Pala",
    description: "Pala romana aperta a libro con mortadella IGP e granella di pistacchio di Bronte post-bake.",
    emoji: "🥪",
    style_id: "pala_romana",
    topping_concept_id: "bianca_mortazza",
    family: "romana",
    occasion_tags: ["aperitivo", "antipasto", "street food"],
    authenticity_badge: "Spuntino romano",
  },
  {
    id: "scrocchiarella_boscaiola",
    name: "Scrocchiarella Boscaiola",
    description: "Tonda sottilissima e croccante con champignon saltati, salsiccia luganega, mozzarella.",
    emoji: "🍄",
    style_id: "tonda_romana",
    topping_concept_id: "boscaiola",
    family: "romana",
    occasion_tags: ["autunno", "comfort"],
  },
  {
    id: "bonci_margherita",
    name: "Bonci al Taglio Margherita",
    description: "Teglia 40×30 metodo Bonci: idratazione 85%, no-knead, 24-48h frigo. Margherita classica.",
    emoji: "☁️",
    style_id: "bonci_teglia",
    topping_concept_id: "margherita",
    family: "contemporanea",
    occasion_tags: ["pizza al taglio", "casual"],
    authenticity_badge: "Metodo Bonci",
    interpretation_id: "bonci_pizzarium",
  },

  /* ═══ SICILIANE / SUD ═══ */
  {
    id: "sfincione_bianca",
    name: "Sfincione bianco",
    description: "Pizza palermitana alta e soffice con olio EVO, rosmarino e fior di sale.",
    emoji: "🏺",
    style_id: "sfincione",
    topping_concept_id: "bianca",
    family: "contemporanea",
    occasion_tags: ["street food", "tradizione siciliana"],
  },

  /* ═══ INTERNAZIONALI ═══ */
  {
    id: "ny_pepperoni",
    name: "New York Pepperoni",
    description: "Fetta XL pieghevole. Pepperoni a fette coppette che si arricciano in cottura. Stile street USA.",
    emoji: "🗽",
    style_id: "new_york",
    topping_concept_id: "diavola",
    family: "americana",
    occasion_tags: ["street food", "casual"],
  },
  {
    id: "detroit_pepperoni",
    name: "Detroit Pepperoni",
    description: "Pan pizza profonda con cheese crown caramellato ai bordi e pepperoni distribuiti.",
    emoji: "🚗",
    style_id: "detroit",
    topping_concept_id: "diavola",
    family: "americana",
    occasion_tags: ["comfort", "weekend"],
  },
  {
    id: "crescenza_recco_igp",
    name: "Focaccia di Recco IGP",
    description: "Doppia sfoglia sottilissima senza lievito con crescenza fondente all'interno. Tradizione ligure.",
    emoji: "🧀",
    style_id: "focaccia_recco",
    topping_concept_id: "crescenza_recco",
    family: "contemporanea",
    occasion_tags: ["antipasto", "tradizione IGP"],
    authenticity_badge: "Disciplinare IGP",
    interpretation_id: "igp_recco",
  },
];

/** Filtro per famiglia. */
export function getSignatureRecipesByFamily(family: FamilyId): SignatureRecipe[] {
  return SIGNATURE_RECIPES.filter((r) => r.family === family);
}

/** Tutte le ricette. */
export function getAllSignatureRecipes(): SignatureRecipe[] {
  return SIGNATURE_RECIPES;
}

/** Lookup per id. */
export function getSignatureRecipeById(id: string): SignatureRecipe | undefined {
  return SIGNATURE_RECIPES.find((r) => r.id === id);
}
