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
import signatureBonciMargherita from "../../assets/signatures/signature_bonci_margherita.webp";
import signatureCacioEPepe from "../../assets/signatures/signature_cacio_e_pepe.webp";
import signatureDetroitPepperoni from "../../assets/signatures/signature_detroit_pepperoni.webp";
import signatureMarinaraAvpn from "../../assets/signatures/signature_marinara_avpn.webp";
import signatureNyPepperoni from "../../assets/signatures/signature_ny_pepperoni.webp";
import signatureSalsicciaFriarielli from "../../assets/signatures/signature_salsiccia_friarielli.webp";
import signatureSfincioneBianco from "../../assets/signatures/signature_sfincione_bianco.webp";

export interface SignatureRecipe {
  id: string;
  name: string;
  /** Card-only editorial hierarchy; full reference names remain available in detail/search. */
  card?: {
    name?: string;
    /** null omits a style already identified by the recipe title. */
    context?: string | null;
    attribution?: "badge" | "subtitle";
  };
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
    card: { attribution: "badge" },
    name: "Margherita Verace",
    description: "Pomodoro, mozzarella, basilico e olio extravergine sulla base napoletana di riferimento.",
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
    card: { attribution: "badge" },
    name: "Marinara",
    description: "Niente formaggio: pomodoro, aglio, origano e olio extravergine. Con la Margherita, è una delle due pizze della STG.",
    emoji: "🌿",
    photo: signatureMarinaraAvpn,
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
    description: "Crema di pecorino e pepe nero stesa appena sfornata: la scioglie il calore della pizza.",
    emoji: "⚫",
    photo: signatureCacioEPepe,
    style_id: "napoletana_canotto",
    topping_concept_id: "cacio_e_pepe",
    family: "napoletana",
    occasion_tags: ["gourmet", "comfort"],
  },
  {
    id: "salsiccia_friarielli",
    name: "Salsiccia & Friarielli",
    description: "Un classico delle pizzerie napoletane: friarielli amarognoli, salsiccia e provola affumicata.",
    emoji: "🥬",
    photo: signatureSalsicciaFriarielli,
    style_id: "napoletana_stg",
    topping_concept_id: "salsiccia_friarielli",
    family: "napoletana",
    occasion_tags: ["inverno", "tradizione"],
  },

  /* ═══ ROMANE ═══ */
  {
    id: "patate_e_porchetta",
    name: "Patate e Porchetta",
    description: "Una base cotta in bianco con patate a scaglie sopra, poi aperta e farcita di porchetta dopo la cottura.",
    emoji: "🥔",
    style_id: "pizza_spaccata",
    topping_concept_id: "patate_porchetta",
    family: "romana",
    occasion_tags: ["weekend", "comfort", "tradizione laziale"],
    authenticity_badge: "Stile panaria romana",
  },
  {
    id: "mortazza_alla_pala",
    card: { context: null },
    name: "Mortazza alla Pala",
    description: "Pizza bianca alla pala aperta a libro, con mortadella Bologna IGP e granella di pistacchio dopo la cottura.",
    emoji: "🥪",
    style_id: "pala_romana",
    topping_concept_id: "bianca_mortazza",
    family: "romana",
    occasion_tags: ["aperitivo", "antipasto", "street food"],
    authenticity_badge: "Spuntino romano",
  },
  {
    id: "scrocchiarella_boscaiola",
    card: { context: "Tonda romana" },
    name: "Scrocchiarella Boscaiola",
    description: "Tonda sottile e croccante con funghi saltati, salsiccia e mozzarella.",
    emoji: "🍄",
    style_id: "tonda_romana",
    topping_concept_id: "boscaiola",
    family: "romana",
    occasion_tags: ["autunno", "comfort"],
  },
  {
    id: "bonci_margherita",
    card: { name: "Margherita al taglio", attribution: "badge" },
    name: "Margherita al taglio, ispirata a Bonci",
    description: "Teglia con impasto molto idratato e lunga maturazione in frigo, come nelle ricette che Bonci ha reso pubbliche. Sopra, una margherita classica.",
    emoji: "☁️",
    photo: signatureBonciMargherita,
    style_id: "teglia_romana",
    topping_concept_id: "margherita",
    family: "romana", // Allineato allo stile bonci_teglia, ricollocato in "romana" (lug 2026)
    occasion_tags: ["pizza al taglio", "casual"],
    authenticity_badge: "Ispirata a Bonci",
    interpretation_id: "bonci_pizzarium",
  },

  /* ═══ SICILIANE / SUD ═══ */
  {
    id: "sfincione_bianca",
    card: { context: null },
    name: "Sfincione in bianco",
    description: "L'impasto alto e soffice dello sfincione palermitano, solo con olio extravergine, rosmarino e sale. Non è lo sfincione bianco di Bagheria, che porta ricotta e tuma.",
    emoji: "🏺",
    photo: signatureSfincioneBianco,
    style_id: "sfincione",
    topping_concept_id: "bianca",
    family: "contemporanea",
    occasion_tags: ["street food", "tradizione siciliana"],
  },

  /* ═══ INTERNAZIONALI ═══ */
  {
    id: "ny_pepperoni",
    card: { context: null },
    name: "New York Pepperoni",
    description: "Fetta larga e pieghevole, con pepperoni che in cottura si arricciano a coppetta.",
    emoji: "🗽",
    photo: signatureNyPepperoni,
    style_id: "new_york",
    topping_concept_id: "diavola",
    family: "americana",
    occasion_tags: ["street food", "casual"],
  },
  {
    id: "detroit_pepperoni",
    card: { context: null },
    name: "Detroit Pepperoni",
    description: "Pizza alta in teglia, con pepperoni e formaggio fino ai bordi, dove forma una crosta dorata e croccante.",
    emoji: "🚗",
    photo: signatureDetroitPepperoni,
    style_id: "detroit",
    topping_concept_id: "diavola",
    family: "americana",
    occasion_tags: ["comfort", "weekend"],
  },
  {
    id: "crescenza_recco_igp",
    card: { name: "Focaccia di Recco col formaggio", context: null, attribution: "badge" },
    name: "Focaccia di Recco col formaggio IGP",
    description: "Due sfoglie sottilissime senza lievito con formaggio fresco fuso in mezzo. Tradizione ligure, IGP dal 2015.",
    emoji: "🧀",
    style_id: "focaccia_recco",
    topping_concept_id: "crescenza_recco",
    family: "contemporanea",
    occasion_tags: ["antipasto", "tradizione IGP"],
    authenticity_badge: "Disciplinare IGP",
    interpretation_id: "igp_recco",
  },
];
