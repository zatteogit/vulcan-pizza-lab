import { METHOD_MESSAGES_IT } from "./method-messages";
import { BRAND } from "../config/brand";
import { T, TIP, toppingText } from "./topping-i18n/registry";
import type { ToppingTranslation } from "./topping-i18n/types";
/* ═══ TOPPING LIBRARY — Sprint 11 Fase 2 + Sprint 12 Fase 2 ═══
 *
 * REGOLA DI STRATIFICAZIONE:
 * Gli ingredienti nell'array `ingredients` di ciascuna `ToppingRecipe` devono
 * essere sempre inseriti in ordine di stesura: dal basso (primo strato a contatto
 * con l'impasto/base) all'alto (ultimo strato/guarnizione in superficie).
 * Tutte le dosi degli ingredienti rappresentano la dose per singolo panetto/teglia.
 *
 * MODELLO A 2 LIVELLI:
 *
 *   ToppingConcept       — il concetto culturale ("Margherita", "Boscaiola", "Diavola")
 *                          → flavor profile, descrizione, emoji, occasioni
 *
 *   ToppingRecipe        — la realizzazione concreta in una tradizione
 *                          ("Margherita Verace AVPN", "Boscaiola alla Romana")
 *                          → ingredienti specifici, pre_prep, assembly, bake adjust
 *                          → preferred_for_styles / preferred_for_families
 *
 * Quando l'utente sceglie un Concept su uno Stile, il resolver
 * `resolveTopping(conceptId, style)` sceglie la variante più adatta con priorità:
 *   1. style esatto (preferred_for_styles)
 *   2. family (preferred_for_families)
 *   3. variante "generica" come fallback
 *   4. prima disponibile
 *
 * Una stessa Boscaiola sulla Napoletana usa porcini sottolio + grana + fior di
 * latte campano (boscaiola_napoletana); sulla Romana usa champignon freschi pre-
 * cotti + solo fior di latte (boscaiola_romana). Stesso concetto, ricetta diversa.
 */
import type { EngineMsg, FamilyId, LayoutSpec, LayoutType, PizzaStyle } from "../domain/pizza-engine";
import thumbnailMargherita from "../../assets/toppings/topping_margherita.webp";
import thumbnailMarinara from "../../assets/toppings/topping_marinara.webp";
import thumbnailBianca from "../../assets/toppings/topping_bianca.webp";
import thumbnailBoscaiola from "../../assets/toppings/topping_boscaiola.webp";
import thumbnailDiavola from "../../assets/toppings/topping_diavola.webp";
import thumbnailCapricciosa from "../../assets/toppings/topping_capricciosa.webp";
import thumbnailQuattroStagioni from "../../assets/toppings/topping_4stagioni.webp";
import thumbnail4Formaggi from "../../assets/toppings/topping_4formaggi.webp";
import thumbnailOrtolana from "../../assets/toppings/topping_ortolana.webp";
import thumbnailPatatePorchetta from "../../assets/toppings/topping_patateporchetta.webp";
import thumbnailBiancaMortazza from "../../assets/toppings/topping_mortadellapistacchio.webp";
import thumbnailCacioPepe from "../../assets/toppings/topping_cacioepepe.webp";
import thumbnailSalsicciaFriarielli from "../../assets/toppings/topping_friarellisalsiccia.webp";
import thumbnailHawaiiana from "../../assets/toppings/topping_hawaiiana.webp";
import thumbnailCrescenzaRecco from "../../assets/toppings/topping_crescenzarecco.webp";
import thumbnailCrudo from "../../assets/toppings/topping_crudo.webp";
import thumbnailReccoCulatello from "../../assets/toppings/topping_reccoculatello.webp";
import thumbnailReccoCotto from "../../assets/toppings/topping_reccocotto.webp";
import thumbnailReccoPizzata from "../../assets/toppings/topping_reccopizzata.webp";
import thumbnailSfincione from "../../assets/toppings/topping_sfincione.webp";
import thumbnailFocacciaBarese from "../../assets/toppings/topping_focacciabarese.webp";
import thumbnailFugazzeta from "../../assets/toppings/topping_fugazzeta.webp";
import thumbnailDetroitPepperoni from "../../assets/toppings/topping_detroitpepperoni.webp";
import thumbnailChicago from "../../assets/toppings/topping_chicago.webp";
import thumbnailMontanara from "../../assets/toppings/topping_montanara.webp";
import thumbnailPizzaFritta from "../../assets/toppings/topping_pizzafritta.webp";
import thumbnailCalzone from "../../assets/toppings/topping_calzone.webp";
import thumbnailCiaccino from "../../assets/toppings/topping_ciaccino.webp";
import thumbnailWhiteClam from "../../assets/toppings/topping_whiteclam.webp";
import thumbnailCosacca from "../../assets/toppings/topping_cosacca.webp";
import thumbnailProvolaPepe from "../../assets/toppings/topping_provolapepe.webp";
import thumbnailNduja from "../../assets/toppings/topping_nduja.webp";
import thumbnailNerano from "../../assets/toppings/topping_nerano.webp";
import thumbnailMargheritaSbagliata from "../../assets/toppings/topping_margheritasbagliata.webp";
import thumbnailScarpetta from "../../assets/toppings/topping_scarpetta.webp";
import thumbnailPatateRosmarino from "../../assets/toppings/topping_pataterosmarino.webp";
import thumbnailHotHoney from "../../assets/toppings/topping_hothoney.webp";
import thumbnailBresaolaRucola from "../../assets/toppings/topping_bresaolarucola.webp";
import thumbnailStracciataBottarga from "../../assets/toppings/topping_stracciatabottarga.webp";
import thumbnailCheesePizza from "../../assets/toppings/topping_cheesepizza.webp";
import thumbnailSupreme from "../../assets/toppings/topping_supreme.webp";
import thumbnailWhitePizza from "../../assets/toppings/topping_whitepizza.webp";
import thumbnailVodkaPizza from "../../assets/toppings/topping_vodkapizza.webp";
import thumbnailBbqChicken from "../../assets/toppings/topping_bbqchicken.webp";
import thumbnailSmokedSalmon from "../../assets/toppings/topping_smokedsalmon.webp";
import thumbnailItalianBeef from "../../assets/toppings/topping_italianbeef.webp";
import thumbnailTomatoPie from "../../assets/toppings/topping_tomatopie.webp";
import thumbnailGreekFeta from "../../assets/toppings/topping_greekfeta.webp";
import thumbnailZuccaSpeck from "../../assets/toppings/topping_zuccaspeck.webp";
import thumbnailBurrataSalmone from "../../assets/toppings/topping_burratasalmone.webp";
import thumbnailFocacciaCipolle from "../../assets/toppings/topping_focacciacipolle.webp";
import thumbnailSardenaira from "../../assets/toppings/topping_sardenaira.webp";
import thumbnailSfincioneBianco from "../../assets/toppings/topping_sfincionebianco.webp";
import thumbnailGorgonzolaPere from "../../assets/toppings/topping_gorgonzolapere.webp";
import thumbnailTonnoCipolla from "../../assets/toppings/topping_tonnocipolla.webp";
import thumbnailScarola from "../../assets/toppings/topping_scarola.webp";
import thumbnailFugazza from "../../assets/toppings/topping_fugazza.webp";
import thumbnailRicottaCicoli from "../../assets/toppings/topping_ricottacicoli.webp";
import thumbnailMeatLovers from "../../assets/toppings/topping_meatlovers.webp";
import thumbnailSpinaci from "../../assets/toppings/topping_spinaci.webp";
import thumbnailProsciuttoFunghi from "../../assets/toppings/topping_prosciuttofunghi.webp";
import thumbnailWurstelPatatine from "../../assets/toppings/topping_wurstelpatatine.webp";
import thumbnailProsciuttoCotto from "../../assets/toppings/topping_prosciuttocotto.webp";
import thumbnailFunghi from "../../assets/toppings/topping_funghi.webp";
import thumbnailNapoli from "../../assets/toppings/topping_napoli.webp";
import thumbnailParmigiana from "../../assets/toppings/topping_parmigiana.webp";
import thumbnailNorma from "../../assets/toppings/topping_norma.webp";
import thumbnailBufalina from "../../assets/toppings/topping_bufalina.webp";
import thumbnailItalianSausage from "../../assets/toppings/topping_italiansausage.webp";
import thumbnailPugliese from "../../assets/toppings/topping_pugliese.webp";
import thumbnailCrudaiola from "../../assets/toppings/topping_crudaiola.webp";
import thumbnailTirolese from "../../assets/toppings/topping_tirolese.webp";
import thumbnailBismarck from "../../assets/toppings/topping_bismarck.webp";
import thumbnailMimosa from "../../assets/toppings/topping_mimosa.webp";
import thumbnailLucana from "../../assets/toppings/topping_lucana.webp";
import thumbnailRossini from "../../assets/toppings/topping_rossini.webp";
import thumbnailPatateLardo from "../../assets/toppings/topping_patatelardo.webp";
import thumbnailGamberettiZucchine from "../../assets/toppings/topping_gamberettizucchine.webp";
import thumbnailVariantMargheritaAvpn from "../../assets/toppings/variants/margherita_napoletana_avpn.webp";
import thumbnailVariantMargheritaRomana from "../../assets/toppings/variants/margherita_romana.webp";
import thumbnailVariantMargheritaAmericana from "../../assets/toppings/variants/margherita_americana.webp";
import thumbnailVariantMargheritaNewYork from "../../assets/toppings/variants/margherita_new_york.webp";
import thumbnailVariantMargheritaGrandma from "../../assets/toppings/variants/margherita_grandma.webp";
import thumbnailVariantMargheritaPadellino from "../../assets/toppings/variants/margherita_padellino.webp";
import thumbnailVariantMargheritaTrancio from "../../assets/toppings/variants/margherita_trancio.webp";
import thumbnailVariantPatatePorchettaBaciata from "../../assets/toppings/variants/patate_porchetta_baciata.webp";
import thumbnailVariantCrudoSpaccata from "../../assets/toppings/variants/crudo_spaccata.webp";
import thumbnailVariantBiancaMortazzaRomana from "../../assets/toppings/variants/bianca_mortazza_romana.webp";
import thumbnailVariantPatatePorchettaSancho from "../../assets/toppings/variants/patate_porchetta_sancho.webp";
import thumbnailVariantFugazzetaRellena from "../../assets/toppings/variants/fugazzeta_rellena.webp";
import thumbnailVariantCalzoneScarola from "../../assets/toppings/variants/calzone_scarola.webp";
import thumbnailVariantCalzoneRicottaCicoli from "../../assets/toppings/variants/calzone_ricotta_cicoli.webp";
import thumbnailVariantReccoNduja from "../../assets/toppings/variants/recco_nduja.webp";
import thumbnailVariantReccoCulatello from "../../assets/toppings/variants/recco_culatello.webp";
import thumbnailVariantReccoCotto from "../../assets/toppings/variants/recco_cotto.webp";
import thumbnailVariantReccoPizzata from "../../assets/toppings/variants/recco_pizzata.webp";

export type IngredientSection = "ripieno" | "base" | "crosta" | "superficie" | "salamoia" | "finitura";

export interface ToppingIngredient {
  /** Product-label data only; precautionary traces are never inferred. */
  allergen_declaration?: import("./allergen-data").AllergenDeclaration;
  /** Explicit catalog composition IDs; amounts remain on the whole preparation. */
  components?: string[];
  name: string;
  /** Quantità per UNA unità servita (panetto/teglia). Per stile multi-piece moltiplicare per dough_balls. */
  amount: { value: number; unit: "g" | "ml" | "pcs" };
  optional?: boolean;
  notes?: string;
  section?: IngredientSection;
}

interface ToppingPrepStep {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  /** Quando va fatto rispetto all'inizio dell'impasto */
  timing: "hours_before_start" | "during_bulk" | "just_before_assembly";
  /** Se hours_before_start, quante ore prima */
  hours_before?: number;
  tip?: { beginner: string; nerd: string };
}

/** Punto della timeline dove inserire uno step di assemblaggio. */
export type TimelineInsertPoint =
  | "before_proof"       // dopo la stesura in teglia, prima dell'appretto (senza appretto in teglia: dopo la stesura, B3)
  | "after_shape"        // dopo stesura, prima della cottura
  | "after_stack"        // tra sovrapposizione e cottura (per layout stacked)
  | "after_fill_internal" // dopo ripieno+sigillatura (per closed_stuffed)
  | "after_bake"         // dopo prima cottura
  | "after_split_fill"   // dopo sdoppiamento (sostituisce farcitura generica)
  | "after_bake2";       // dopo seconda cottura

export interface ToppingAssemblyStep {
  /** The same filling can require different operations on different bases. */
  for_styles?: string[];
  id: string;
  title: string;
  description: string;
  /** G3-WP-03: testo per le cotture brevi (fino a BASIL_BEFORE_BAKE_MAX_SEC di
   *  cottura effettiva); `description` vale per quelle lunghe. Il motore ne
   *  sceglie uno solo (assemblyStepDescription), niente «se la cottura…». */
  description_short_bake?: string;
  /** B3 (decisione 2 di Matteo, 31/10/2026): testo per quando la ricetta non
   *  fa l'appretto in teglia (una versione d'autore che lo fa a panetti, come
   *  Adriano Continisio). Il motore sposta allora un passo `before_proof` dopo
   *  la stesura e usa questo testo, senza «lascialo lievitare in teglia». */
  description_no_pan_proof?: string;
  /** B4: testo per quando la versione mette il condimento sull'impasto già
   *  lievitato in teglia, subito prima di infornare (Paoletta,
   *  MethodProcessProfile.topping_after_proof). */
  description_after_pan_proof?: string;
  insert_at: TimelineInsertPoint;
  duration_minutes: number;
  /** Se true, sostituisce lo step generico (es. "Farcitura" generica) al posto di aggiungersi. */
  replaces_generic?: boolean;
  tip?: { beginner: string; nerd: string };
}

/* ═══ Sprint 12 Fase 2: ToppingConcept (livello concettuale) ═══ */

export type FlavorProfile =
  | "earthy"        // boscaiola, tartufata
  | "fresh"         // margherita, ortolana, marinara
  | "spicy"         // diavola
  | "creamy"        // 4 formaggi, bufalina
  | "rich"          // patate&porchetta, capricciosa
  | "salty_savory"  // bianca con mortazza, cacio e pepe, sfincione
  | "sweet_savory"  // hawaiiana, tatin
  | "light";        // bianca semplice

export interface ToppingConcept {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** Miniatura opzionale: alcuni condimenti hanno immagine dedicata, altri no. */
  thumbnail?: string;
  flavor_profile: FlavorProfile;
  /** Occasioni d'uso suggerite per filtri "Scopri". */
  occasions?: string[];
}

/** I 15 concetti culturali base. Sono entità "astratte": ognuno punta a 1+
 *  ToppingRecipe concreti tramite il campo concept_ref. */
export const TOPPING_CONCEPTS: Record<string, ToppingConcept> = {
  margherita: {
    id: "margherita",
    name: "Margherita",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailMargherita,
    flavor_profile: "fresh",
    occasions: ["sempre", "classico", "cena famiglia"],
  },
  marinara: {
    id: "marinara",
    name: "Marinara",
    description: T,
    emoji: "🌿",
    thumbnail: thumbnailMarinara,
    flavor_profile: "fresh",
    occasions: ["vegano", "asciutta", "estate"],
  },
  bianca: {
    id: "bianca",
    name: "Bianca",
    description: T,
    emoji: "🌾",
    thumbnail: thumbnailBianca,
    flavor_profile: "light",
    occasions: ["aperitivo", "antipasto", "pane sostitutivo"],
  },
  boscaiola: {
    id: "boscaiola",
    name: "Boscaiola",
    description: T,
    emoji: "🍄",
    thumbnail: thumbnailBoscaiola,
    flavor_profile: "earthy",
    occasions: ["autunno", "comfort", "cena"],
  },
  diavola: {
    id: "diavola",
    name: "Diavola",
    description: T,
    emoji: "🌶️",
    thumbnail: thumbnailDiavola,
    flavor_profile: "spicy",
    occasions: ["serata amici", "comfort"],
  },
  capricciosa: {
    id: "capricciosa",
    name: "Capricciosa",
    description: T,
    emoji: "🎭",
    thumbnail: thumbnailCapricciosa,
    flavor_profile: "rich",
    occasions: ["domenica", "cena", "ristorante"],
  },
  quattro_stagioni: {
    id: "quattro_stagioni",
    name: "Quattro Stagioni",
    description: T,
    emoji: "🍂",
    thumbnail: thumbnailQuattroStagioni,
    flavor_profile: "rich",
    occasions: ["serata speciale"],
  },
  quattro_formaggi: {
    id: "quattro_formaggi",
    name: "Quattro Formaggi",
    description: T,
    emoji: "🧀",
    thumbnail: thumbnail4Formaggi,
    flavor_profile: "creamy",
    occasions: ["comfort", "vegetariano"],
  },
  ortolana: {
    id: "ortolana",
    name: "Ortolana",
    description: T,
    emoji: "🥗",
    thumbnail: thumbnailOrtolana,
    flavor_profile: "fresh",
    occasions: ["vegetariano", "estate", "leggera"],
  },
  patate_porchetta: {
    id: "patate_porchetta",
    name: "Patate e Porchetta",
    description: T,
    emoji: "🥔",
    thumbnail: thumbnailPatatePorchetta,
    flavor_profile: "rich",
    occasions: ["weekend", "tradizione laziale", "comfort"],
  },
  crudo: {
    id: "crudo",
    name: "Crudo",
    description: T,
    emoji: "🍖",
    thumbnail: thumbnailCrudo,
    flavor_profile: "salty_savory",
    occasions: ["spaccata", "spuntino", "tradizione"],
  },
  bianca_mortazza: {
    id: "bianca_mortazza",
    name: "Bianca con Mortadella",
    description: T,
    emoji: "🥪",
    thumbnail: thumbnailBiancaMortazza,
    flavor_profile: "salty_savory",
    occasions: ["antipasto", "aperitivo", "spuntino romano"],
  },
  cacio_e_pepe: {
    id: "cacio_e_pepe",
    name: "Cacio e Pepe",
    description: T,
    emoji: "⚫",
    thumbnail: thumbnailCacioPepe,
    flavor_profile: "salty_savory",
    occasions: ["romana gourmet", "comfort"],
  },
  salsiccia_friarielli: {
    id: "salsiccia_friarielli",
    name: "Salsiccia e Friarielli",
    description: T,
    emoji: "🥬",
    thumbnail: thumbnailSalsicciaFriarielli,
    flavor_profile: "earthy",
    occasions: ["napoletana DOC", "inverno", "comfort"],
  },
  hawaiiana: {
    id: "hawaiiana",
    name: "Hawaiiana",
    description: T,
    emoji: "🍍",
    thumbnail: thumbnailHawaiiana,
    flavor_profile: "sweet_savory",
    occasions: ["controversa", "americana", "estate"],
  },
  crescenza_recco: {
    id: "crescenza_recco",
    name: "Crescenza alla Recco",
    description: T,
    emoji: "🧀",
    thumbnail: thumbnailCrescenzaRecco,
    flavor_profile: "creamy",
    occasions: ["ligure", "tradizione IGP"],
  },
  // Farciture approvate Focaccia di Recco (oltre alla classica + 'nduja)
  recco_culatello: {
    id: "recco_culatello",
    name: "Crescenza e Culatello",
    description: T,
    emoji: "🍖",
    thumbnail: thumbnailReccoCulatello,
    flavor_profile: "salty_savory",
    occasions: ["ligure", "gourmet"],
  },
  recco_cotto: {
    id: "recco_cotto",
    name: "Crescenza e Cotto Millefiori",
    description: T,
    emoji: "🐷",
    thumbnail: thumbnailReccoCotto,
    flavor_profile: "salty_savory",
    occasions: ["ligure", "delicato"],
  },
  recco_pizzata: {
    id: "recco_pizzata",
    name: "Focaccia Pizzata",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailReccoPizzata,
    flavor_profile: "salty_savory",
    occasions: ["ligure", "mediterraneo"],
  },
  // VPL-B1/B2: condimenti regionali specifici (de-genericizzazione)
  sfincione: {
    id: "sfincione",
    name: "Sfincione Palermitano",
    description: T,
    emoji: "🧅",
    thumbnail: thumbnailSfincione,
    flavor_profile: "salty_savory",
    occasions: ["siciliano", "street food", "tradizione"],
  },
  focaccia_barese: {
    id: "focaccia_barese",
    name: "Pomodorini e olive baresane",
    description: T,
    emoji: "🫒",
    thumbnail: thumbnailFocacciaBarese,
    flavor_profile: "fresh",
    occasions: ["pugliese", "tradizione"],
  },
  fugazzeta: {
    id: "fugazzeta",
    name: "Mozzarella e cipolla (fugazzeta)",
    description: T,
    emoji: "🧅",
    thumbnail: thumbnailFugazzeta,
    flavor_profile: "creamy",
    occasions: ["argentino", "porteño"],
  },
  detroit: {
    id: "detroit",
    name: "Detroit (cheese crown)",
    description: T,
    emoji: "🧀",
    thumbnail: thumbnailDetroitPepperoni,
    flavor_profile: "rich",
    occasions: ["americano", "detroit"],
  },
  chicago: {
    id: "chicago",
    name: "Chicago deep dish",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailChicago,
    flavor_profile: "rich",
    occasions: ["americano", "chicago"],
  },
  montanara: {
    id: "montanara",
    name: "Montanara",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailMontanara,
    flavor_profile: "fresh",
    occasions: ["napoletano", "street food", "a crudo"],
  },
  pizza_fritta: {
    id: "pizza_fritta",
    name: "Pizza Fritta ripiena",
    description: T,
    emoji: "🥟",
    thumbnail: thumbnailPizzaFritta,
    flavor_profile: "rich",
    occasions: ["napoletano", "street food", "ripiena"],
  },
  calzone: {
    id: "calzone",
    name: "Calzone Napoletano",
    description: T,
    emoji: "🥟",
    thumbnail: thumbnailCalzone,
    flavor_profile: "rich",
    occasions: ["classico", "tradizione"],
  },
  ciaccino: {
    id: "ciaccino",
    name: "Farcitura senese",
    description: T,
    emoji: "🥪",
    thumbnail: thumbnailCiaccino,
    flavor_profile: "salty_savory",
    occasions: ["toscano", "merenda", "street food"],
  },
  white_clam: {
    id: "white_clam",
    name: "White Clam (vongole)",
    description: T,
    emoji: "🦪",
    thumbnail: thumbnailWhiteClam,
    flavor_profile: "salty_savory",
    occasions: ["new haven", "frutti di mare"],
  },
  // ─── Wave 1: firme napoletane (de-genericizzazione per stile) ───
  cosacca: {
    id: "cosacca",
    name: "Cosacca",
    description: T,
    emoji: "🧀",
    thumbnail: thumbnailCosacca,
    flavor_profile: "salty_savory",
    occasions: ["napoletana storica", "tradizione", "asciutta"],
  },
  provola_pepe: {
    id: "provola_pepe",
    name: "Provola e Pepe",
    description: T,
    emoji: "🌫️",
    thumbnail: thumbnailProvolaPepe,
    flavor_profile: "salty_savory",
    occasions: ["comfort", "affumicato", "napoletana"],
  },
  nduja: {
    id: "nduja",
    name: "'Nduja di Spilinga",
    description: T,
    emoji: "🔥",
    thumbnail: thumbnailNduja,
    flavor_profile: "spicy",
    occasions: ["piccante", "calabrese", "comfort"],
  },
  nerano: {
    id: "nerano",
    name: "Nerano",
    description: T,
    emoji: "🥒",
    thumbnail: thumbnailNerano,
    flavor_profile: "creamy",
    occasions: ["estate", "costiera", "vegetariano"],
  },
  margherita_sbagliata: {
    id: "margherita_sbagliata",
    name: "Margherita Sbagliata",
    description: T,
    emoji: "🔄",
    thumbnail: thumbnailMargheritaSbagliata,
    flavor_profile: "fresh",
    occasions: ["contemporanea", "gourmet", "canotto"],
  },
  scarpetta: {
    id: "scarpetta",
    name: "Scarpetta",
    description: T,
    emoji: "🥄",
    thumbnail: thumbnailScarpetta,
    flavor_profile: "rich",
    occasions: ["d'autore", "contemporanea"],
  },
  // ─── Wave 2: firme romane (teglia, tonda, pinsa, pala) ───
  patate_rosmarino: {
    id: "patate_rosmarino",
    name: "Patate e Rosmarino",
    description: T,
    emoji: "🌿",
    thumbnail: thumbnailPatateRosmarino,
    flavor_profile: "rich",
    occasions: ["taglio romano", "comfort", "vegetariano"],
  },
  hot_honey: {
    id: "hot_honey",
    name: "Hot Honey",
    description: T,
    emoji: "🍯",
    thumbnail: thumbnailHotHoney,
    flavor_profile: "sweet_savory",
    occasions: ["dolce-piccante", "casual", "trendy"],
  },
  bresaola_rucola: {
    id: "bresaola_rucola",
    name: "Bresaola, Rucola e Grana",
    description: T,
    emoji: "🥩",
    thumbnail: thumbnailBresaolaRucola,
    flavor_profile: "fresh",
    occasions: ["estate", "leggera", "post-cottura"],
  },
  stracciata_bottarga: {
    id: "stracciata_bottarga",
    name: "Stracciatella e Bottarga",
    description: T,
    emoji: "🐟",
    thumbnail: thumbnailStracciataBottarga,
    flavor_profile: "salty_savory",
    occasions: ["gourmet", "pala romana", "estate"],
  },
  // ─── Wave 3: classici e firme americane ───
  cheese_pizza: {
    id: "cheese_pizza",
    name: "Cheese Pizza",
    description: T,
    emoji: "🧀",
    thumbnail: thumbnailCheesePizza,
    flavor_profile: "creamy",
    occasions: ["americano", "classico", "slice"],
  },
  supreme: {
    id: "supreme",
    name: "Supreme",
    description: T,
    emoji: "🎪",
    thumbnail: thumbnailSupreme,
    flavor_profile: "rich",
    occasions: ["americano", "abbondante", "condivisione"],
  },
  white_pizza: {
    id: "white_pizza",
    name: "White Pizza",
    description: T,
    emoji: "🤍",
    thumbnail: thumbnailWhitePizza,
    flavor_profile: "creamy",
    occasions: ["americano", "senza pomodoro", "vegetariano"],
  },
  vodka_pizza: {
    id: "vodka_pizza",
    name: "Vodka",
    description: T,
    emoji: "🌸",
    thumbnail: thumbnailVodkaPizza,
    flavor_profile: "creamy",
    occasions: ["americano", "trendy", "cremoso"],
  },
  bbq_chicken: {
    id: "bbq_chicken",
    name: "BBQ Chicken",
    description: T,
    emoji: "🍗",
    thumbnail: thumbnailBbqChicken,
    flavor_profile: "sweet_savory",
    occasions: ["california", "gourmet", "dolce-affumicato"],
  },
  smoked_salmon: {
    id: "smoked_salmon",
    name: "Salmone affumicato",
    description: T,
    emoji: "🍣",
    thumbnail: thumbnailSmokedSalmon,
    flavor_profile: "salty_savory",
    occasions: ["california", "gourmet", "brunch"],
  },
  italian_beef: {
    id: "italian_beef",
    name: "Italian Beef",
    description: T,
    emoji: "🥩",
    thumbnail: thumbnailItalianBeef,
    flavor_profile: "rich",
    occasions: ["chicago", "abbondante", "carne"],
  },
  tomato_pie: {
    id: "tomato_pie",
    name: "Tomato Pie",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailTomatoPie,
    flavor_profile: "fresh",
    occasions: ["new haven", "senza mozzarella", "asciutta"],
  },
  greek_feta: {
    id: "greek_feta",
    name: "Greca (feta e olive)",
    description: T,
    emoji: "🫒",
    thumbnail: thumbnailGreekFeta,
    flavor_profile: "salty_savory",
    occasions: ["greek pan", "mediterraneo", "diner"],
  },
  // ─── Wave 4: classici e firme contemporanee/regionali ───
  zucca_speck: {
    id: "zucca_speck",
    name: "Zucca, Speck e Caciocavallo",
    description: T,
    emoji: "🎃",
    thumbnail: thumbnailZuccaSpeck,
    flavor_profile: "earthy",
    occasions: ["autunno", "bonci", "gourmet"],
  },
  burrata_salmone: {
    id: "burrata_salmone",
    name: "Burrata e Salmone",
    description: T,
    emoji: "🐟",
    thumbnail: thumbnailBurrataSalmone,
    flavor_profile: "salty_savory",
    occasions: ["gourmet", "freddo", "bonci"],
  },
  focaccia_cipolle: {
    id: "focaccia_cipolle",
    name: "Focaccia alle cipolle",
    description: T,
    emoji: "🧅",
    thumbnail: thumbnailFocacciaCipolle,
    flavor_profile: "light",
    occasions: ["ligure", "aperitivo", "vegetariano"],
  },
  sardenaira: {
    id: "sardenaira",
    name: "Sardenaira",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailSardenaira,
    flavor_profile: "salty_savory",
    occasions: ["sanremo", "ponente ligure", "De.Co."],
  },
  sfincione_bianco: {
    id: "sfincione_bianco",
    name: "Sfincione bianco di Bagheria",
    description: T,
    emoji: "🧅",
    thumbnail: thumbnailSfincioneBianco,
    flavor_profile: "salty_savory",
    occasions: ["bagheria", "siciliano", "senza pomodoro"],
  },
  gorgonzola_pere: {
    id: "gorgonzola_pere",
    name: "Gorgonzola e Pere",
    description: T,
    emoji: "🍐",
    thumbnail: thumbnailGorgonzolaPere,
    flavor_profile: "sweet_savory",
    occasions: ["autunno", "dolce-salato", "padellino"],
  },
  tonno_cipolla: {
    id: "tonno_cipolla",
    name: "Tonno e Cipolla",
    description: T,
    emoji: "🐟",
    thumbnail: thumbnailTonnoCipolla,
    flavor_profile: "salty_savory",
    occasions: ["classico", "estate", "semplice"],
  },
  // ─── Arricchimento: farciture/condimenti per stili prima "magri" ───
  scarola: {
    id: "scarola",
    name: "Scarola",
    description: T,
    emoji: "🥬",
    thumbnail: thumbnailScarola,
    flavor_profile: "earthy",
    occasions: ["napoletano", "inverno", "tradizione"],
  },
  fugazza: {
    id: "fugazza",
    name: "Fugazza (sola cipolla)",
    description: T,
    emoji: "🧅",
    thumbnail: thumbnailFugazza,
    flavor_profile: "fresh",
    occasions: ["argentino", "porteño", "senza pomodoro"],
  },
  ricotta_cicoli: {
    id: "ricotta_cicoli",
    name: "Ricotta e Cicoli",
    description: T,
    emoji: "🐖",
    thumbnail: thumbnailRicottaCicoli,
    flavor_profile: "rich",
    occasions: ["napoletano", "rustico", "tradizione"],
  },
  meat_lovers: {
    id: "meat_lovers",
    name: "Meat Lovers",
    description: T,
    emoji: "🥓",
    thumbnail: thumbnailMeatLovers,
    flavor_profile: "rich",
    occasions: ["americano", "carne", "abbondante"],
  },
  spinaci: {
    id: "spinaci",
    name: "Spinaci",
    description: T,
    emoji: "🍃",
    thumbnail: thumbnailSpinaci,
    flavor_profile: "fresh",
    occasions: ["vegetariano", "comfort"],
  },
  prosciutto_funghi: {
    id: "prosciutto_funghi",
    name: "Prosciutto e Funghi",
    description: T,
    emoji: "🍄",
    thumbnail: thumbnailProsciuttoFunghi,
    flavor_profile: "rich",
    occasions: ["classico", "comfort", "famiglia"],
  },
  italian_sausage: {
    id: "italian_sausage",
    name: "Salsiccia",
    description: T,
    emoji: "🌭",
    thumbnail: thumbnailItalianSausage,
    flavor_profile: "salty_savory",
    occasions: ["classico", "birra"],
  },
  /* ═══ D-065 — catalogo italiano, tranche A: condimenti quotidiani ═══
   * Da docs/progetto-catalogo-italiano.md §4. Un menù prova che il gusto
   * esiste, non le dosi: le grammature sono di Vulcan, allineate alle ricette
   * simili già in libreria (stessa base di pomodoro e formaggio per formato). */
  wurstel_patatine: {
    id: "wurstel_patatine",
    name: "Würstel e patatine",
    description: T,
    emoji: "🌭",
    thumbnail: thumbnailWurstelPatatine,
    flavor_profile: "rich",
    occasions: ["bambini", "famiglia", "serata amici"],
  },
  prosciutto_cotto: {
    id: "prosciutto_cotto",
    name: "Prosciutto cotto",
    description: T,
    emoji: "🥓",
    thumbnail: thumbnailProsciuttoCotto,
    flavor_profile: "salty_savory",
    occasions: ["bambini", "classico", "cena famiglia"],
  },
  funghi: {
    id: "funghi",
    name: "Funghi",
    description: T,
    emoji: "🍄",
    thumbnail: thumbnailFunghi,
    flavor_profile: "earthy",
    occasions: ["vegetariano", "classico"],
  },
  napoli: {
    id: "napoli",
    name: "Napoli",
    description: T,
    emoji: "🐟",
    thumbnail: thumbnailNapoli,
    flavor_profile: "salty_savory",
    occasions: ["classico", "pizzeria"],
  },
  parmigiana: {
    id: "parmigiana",
    name: "Parmigiana",
    description: T,
    emoji: "🍆",
    thumbnail: thumbnailParmigiana,
    flavor_profile: "rich",
    occasions: ["vegetariano", "estate", "comfort"],
  },
  norma: {
    id: "norma",
    name: "Norma",
    description: T,
    emoji: "🍆",
    thumbnail: thumbnailNorma,
    flavor_profile: "salty_savory",
    occasions: ["vegetariano", "estate", "tradizione siciliana"],
  },
  bufalina: {
    id: "bufalina",
    name: "Bufalina",
    description: T,
    emoji: "🐃",
    thumbnail: thumbnailBufalina,
    flavor_profile: "creamy",
    occasions: ["classico", "estate"],
  },
  /* ═══ D-065 — tranche A2: condimenti con una fase delicata ═══
   * Da docs/progetto-catalogo-italiano.md §4 (proposte del rapporto Gemini).
   * Ognuno ha un ingrediente che il forno rovina o che va cotto a parte: la
   * fase si modella con i passi esistenti (prima del forno, «after_bake»,
   * testo per le cotture brevi), senza campi nuovi nel motore. */
  pugliese: {
    id: "pugliese",
    name: "Pugliese",
    description: T,
    emoji: "🧅",
    thumbnail: thumbnailPugliese,
    flavor_profile: "salty_savory",
    occasions: ["classico", "pizzeria", "vegetariano"],
  },
  crudaiola: {
    id: "crudaiola",
    name: "Crudaiola",
    description: T,
    emoji: "🍅",
    thumbnail: thumbnailCrudaiola,
    flavor_profile: "fresh",
    occasions: ["estate", "fresco"],
  },
  tirolese: {
    id: "tirolese",
    name: "Tirolese",
    description: T,
    emoji: "🥓",
    thumbnail: thumbnailTirolese,
    flavor_profile: "salty_savory",
    occasions: ["classico", "pizzeria"],
  },
  bismarck: {
    id: "bismarck",
    name: "Bismarck",
    description: T,
    emoji: "🍳",
    thumbnail: thumbnailBismarck,
    flavor_profile: "rich",
    occasions: ["classico", "pizzeria"],
  },
  mimosa: {
    id: "mimosa",
    name: "Mimosa",
    description: T,
    emoji: "🌽",
    thumbnail: thumbnailMimosa,
    flavor_profile: "creamy",
    occasions: ["bambini", "famiglia"],
  },
  lucana: {
    id: "lucana",
    name: "Lucana",
    description: T,
    emoji: "🌶️",
    thumbnail: thumbnailLucana,
    flavor_profile: "salty_savory",
    occasions: ["basilicata", "tradizione"],
  },
  rossini: {
    id: "rossini",
    name: "Rossini",
    description: T,
    emoji: "🥚",
    thumbnail: thumbnailRossini,
    flavor_profile: "rich",
    occasions: ["pesaro", "marche", "tradizione"],
  },
  patate_lardo: {
    id: "patate_lardo",
    name: "Patate, lardo e rosmarino",
    description: T,
    emoji: "🥔",
    thumbnail: thumbnailPatateLardo,
    flavor_profile: "rich",
    occasions: ["taglio romano", "inverno", "comfort"],
  },
  gamberetti_zucchine: {
    id: "gamberetti_zucchine",
    name: "Gamberetti e zucchine",
    description: T,
    emoji: "🍤",
    thumbnail: thumbnailGamberettiZucchine,
    flavor_profile: "fresh",
    occasions: ["estate", "mare"],
  },
};

/* ═══ ToppingRecipe — la realizzazione concreta ═══ */

export interface ToppingRecipe {
  /** A real preparation variant, not merely a topping omission. */
  layout_override?: LayoutSpec;
  method_note?: EngineMsg;
  /** B2 (seguito): scelta di Vulcan su ciò che la fonte non dice (es. come
   *  si condisce la salsa). La ricetta la dichiara fra le note della fonte
   *  (`source_notes`), non fra le varianti di metodo. */
  source_note?: EngineMsg;
  id: string;
  /** Link al concetto culturale di alto livello. */
  concept_ref: string;
  /** Nome variante per UI (es. "alla napoletana", "AVPN", "alla romana"). */
  variant_name?: string;
  /** Thumbnail specifico della variante. Se omesso, la UI usa il thumbnail del concept. */
  thumbnail?: string;

  /** Compatibilità per il pairing engine (Sprint 12 Fase 3). */
  preferred_for_styles?: string[];
  preferred_for_families?: FamilyId[];
  /** Combinazione esplicitamente sconsigliata (taboo). */
  taboo_for_styles?: string[];
  taboo_for_families?: FamilyId[];

  /** Tier di autenticità DISPLAY esplicito, indipendente dal match di stile.
   *  Default (se omesso) per un topping pertinente = "natural" (Tradizionale).
   *  - "canonical"  → "Da disciplinare": SOLO ricette da disciplinare ufficiale
   *                   (AVPN, IGP, DOP, De.Co.).
   *  - "signature"  → "Specialità": firma moderna/gourmet/d'autore (es. Hot Honey,
   *                   Scarpetta, Nerano), pertinente allo stile ma non un canone.
   *  Non usare "common"/"experimental"/"taboo" qui (derivano dal match). */
  authenticity?: AuthenticityScore;

  /** C-2: etichetta per uno stile preciso, quando la ricetta è da disciplinare
   *  solo per alcuni degli stili a cui è assegnata (la margherita AVPN lo è per
   *  la napoletana STG, non per il canotto o la pizza al metro). */
  authenticity_by_style?: Partial<Record<string, AuthenticityScore>>;

  /** Layout compatibili. Se omesso = compatibile con tutti. */
  compatible_layouts?: LayoutType[];

  /** Lista ingredienti per UNA unità servita. */
  ingredients: ToppingIngredient[];

  /** Step di pre-preparazione opzionali (mandolina patate, marinatura, ecc.) */
  pre_prep_steps?: ToppingPrepStep[];

  /** Step di assemblaggio (quando aggiungere cosa) */
  assembly_steps?: ToppingAssemblyStep[];

  /** Modifiche al baking (es. +5 min per patate, -10°C per formaggi delicati) */
  bake_adjustments?: {
    additional_minutes?: number;
    temperature_delta_c?: number;
    /** Note testuali sul motivo (es. "patate richiedono asciugatura lenta") */
    note?: string;
  };

  /** Backward compat: nome esposto per ricerca diretta. Se omesso, deriva da concept.name. */
  name?: string;
  description?: string;
  emoji?: string;
}

/* ═══ Libreria topping (varianti realizzate) ═══ */
export const TOPPING_LIBRARY: Record<string, ToppingRecipe> = {
  /* ─── MARGHERITA — 4 varianti ─── */
  margherita_napoletana_avpn: {
    id: "margherita_napoletana_avpn",
    concept_ref: "margherita",
    variant_name: T,
    thumbnail: thumbnailVariantMargheritaAvpn,
    authenticity: "canonical", // disciplinare AVPN
    /* Il disciplinare è della napoletana: canotto e pizza al metro non ne hanno uno. */
    authenticity_by_style: { napoletana_canotto: "natural", pizza_al_metro: "natural" },
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano DOP schiacciati a mano (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 80, unit: "g" } },
      { name: "Sale fino sulla salsa", amount: { value: 1, unit: "g" } },
      { name: "Fior di latte campano (o mozzarella di bufala)", amount: { value: 90, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
      { name: "Olio EVO a filo", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_avpn",
      title: T,
      /* G3-WP-03 (S09-A-13, D-G3-02): il motore sceglie il testo con la
         cottura effettiva; questo è quello delle cotture lunghe. */
      description: T,
      description_short_bake: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  margherita_romana: {
    id: "margherita_romana",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaRomana,
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 100, unit: "g" } },
      { name: "Sale sulla passata", amount: { value: 1, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_romana",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  /* Tranche B2: la margherita della ricetta di Benedetta Rossi (pagina
   * ufficiale, verificata il 30/10/2026), dosi per la teglia 35×35 dello
   * stile: 300 g di salsa tiepida già condita prima dell'ultima lievitazione,
   * 250 g di mozzarella a dadini negli ultimi 5 minuti. «Condita» senza
   * dettaglio nella fonte: olio e sale sono la lettura di Vulcan. Gli ultimi
   * minuti non sono un punto della timeline: li dice il passo (§4.1). */
  margherita_teglia_in_giornata: {
    id: "margherita_teglia_in_giornata",
    concept_ref: "margherita",
    preferred_for_styles: ["teglia_in_giornata"],
    // B3: la nota nomina la fonte del condimento, perché si vede anche con le
    // versioni d'autore dello stile che non hanno una margherita propria.
    source_note: { key: "topping.sauceSeasoning", get fallback() { return METHOD_MESSAGES_IT["topping.sauceSeasoning"]; }, params: { app: BRAND.name, author: "Benedetta Rossi" } },
    ingredients: [
      { name: "Salsa di pomodoro condita (pomodoro, olio, sale)", components: ["pomodoro", "olio", "sale"], amount: { value: 300, unit: "g" }, notes: T },
      { name: "Mozzarella a dadini", amount: { value: 250, unit: "g" }, notes: T },
    ],
    assembly_steps: [{
      id: "spread_margherita_teglia_in_giornata",
      title: T,
      description: T,
      description_no_pan_proof: T,
      description_after_pan_proof: T,
      insert_at: "before_proof",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  margherita_americana: {
    id: "margherita_americana",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaAmericana,
    preferred_for_styles: ["california_style"],
    ingredients: [
      { name: "Salsa di pomodoro (passata di pomodoro, origano, zucchero, sale)",  components: ["passata di pomodoro", "origano", "zucchero", "sale"],amount: { value: 100, unit: "g" } },
      { name: "Low-moisture mozzarella shredded", amount: { value: 100, unit: "g" } },
      { name: "Parmigiano grattugiato in superficie", amount: { value: 5, unit: "g" } },
      { name: "Olive oil drizzle", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_us",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },


  /* ─── MARINARA — 2 varianti ─── */
  marinara_avpn: {
    id: "marinara_avpn",
    concept_ref: "marinara",
    variant_name: T,
    authenticity: "canonical", // disciplinare AVPN
    /* Il disciplinare è della napoletana: canotto e pizza al metro non ne hanno uno. */
    authenticity_by_style: { napoletana_canotto: "natural", pizza_al_metro: "natural" },
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano DOP (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 80, unit: "g" } },
      { name: "Sale", amount: { value: 1, unit: "g" } },
      { name: "Aglio", amount: { value: 2, unit: "pcs" }, notes: T },
      { name: "Origano secco siciliano", amount: { value: 1, unit: "g" } },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_marinara_avpn",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* C-2 (D-028): il classico di Gigino a Vico Equense, con tre fonti (Becchi
   * 2023; Scatti di Gusto 2017; menù 2026). Dosi per un disco da 32 cm come
   * il resto del catalogo napoletano: la pizza al metro le scala (topping_scale). */
  marinara_scarole_metro: {
    id: "marinara_scarole_metro",
    concept_ref: "marinara",
    variant_name: T,
    preferred_for_styles: ["pizza_al_metro"],
    ingredients: [
      { name: "Pelati (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 70, unit: "g" } },
      { name: "Scarola", amount: { value: 120, unit: "g" }, notes: T },
      { name: "Aglio", amount: { value: 1, unit: "pcs" }, notes: T },
      { name: "Origano secco", amount: { value: 1, unit: "g" } },
      { name: "Olio EVO", amount: { value: 12, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "stufare_scarola_metro",
      title: T,
      description: T,
      duration_minutes: 15,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_marinara_scarole",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  marinara_romana: {
    id: "marinara_romana",
    concept_ref: "marinara",
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 100, unit: "g" } },
      { name: "Sale", amount: { value: 1, unit: "g" } },
      { name: "Aglio", amount: { value: 1, unit: "pcs" } },
      { name: "Origano", amount: { value: 1, unit: "g" } },
      { name: "Peperoncino (opzionale)", amount: { value: 1, unit: "pcs" }, optional: true },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_marinara_romana",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* ─── BIANCA — 1 generica ─── */
  bianca_olio_rosmarino: {
    id: "bianca_olio_rosmarino",
    concept_ref: "bianca",
    variant_name: T,
    // La bianca/schiacciata è una base tradizionale italiana trasversale
    // (focaccia, pala, teglia, sfincione bianco, schiacciata napoletana).
    preferred_for_styles: ["focaccia_genovese", "focaccia_barese", "pala_romana", "teglia_romana"],
    ingredients: [
      { name: "Olio EVO", amount: { value: 15, unit: "ml" } },
      { name: "Rosmarino fresco", amount: { value: 2, unit: "pcs" }, notes: T },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: T },
    ],
    assembly_steps: [{
      id: "spread_bianca",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* ─── BOSCAIOLA — 2 varianti regionali (la demo del refactor!) ─── */
  boscaiola_napoletana: {
    id: "boscaiola_napoletana",
    concept_ref: "boscaiola",
    variant_name: T,
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    ingredients: [
      { name: "Pelati San Marzano (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 60, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "Porcini sottolio scolati (funghi porcini, olio, aglio, sale, spezie)",  components: ["funghi porcini", "olio", "aglio", "sale", "spezie"],amount: { value: 50, unit: "g" }, notes: T },
      { name: "Salsiccia napoletana al finocchio (carne di maiale, sale, finocchietto, pepe)",  components: ["carne di maiale", "sale", "finocchietto", "pepe"],amount: { value: 50, unit: "g" }, notes: T },
      { name: "Grana padano grattugiato", amount: { value: 8, unit: "g" }, notes: T },
      { name: "Olio EVO a filo", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_boscaiola_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  boscaiola_romana: {
    id: "boscaiola_romana",
    concept_ref: "boscaiola",
    variant_name: T,
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 70, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Champignon freschi", amount: { value: 70, unit: "g" }, notes: T },
      { name: "Salsiccia (luganega o casereccia) (carne di maiale, sale, pepe)",  components: ["carne di maiale", "sale", "pepe"],amount: { value: 60, unit: "g" } },
      { name: "Aglio + prezzemolo per soffritto", components: ["aglio", "prezzemolo"], amount: { value: 5, unit: "g" }, notes: T },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "saltare_champignon",
      title: T,
      description: T,
      duration_minutes: 15,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_boscaiola_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* ─── DIAVOLA — 2 varianti ─── */
  diavola_napoletana: {
    id: "diavola_napoletana",
    concept_ref: "diavola",
    variant_name: T,
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Salame piccante napoletano (carne di maiale, sale, peperoncino, spezie)",  components: ["carne di maiale", "sale", "peperoncino", "spezie"],amount: { value: 50, unit: "g" }, notes: T },
      { name: "Olio piccante (olio EVO, peperoncino)",  components: ["olio EVO", "peperoncino"],amount: { value: 5, unit: "ml" }, optional: true },
    ],
    assembly_steps: [{
      id: "spread_diavola_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  diavola_americana: {
    id: "diavola_americana",
    concept_ref: "diavola",
    variant_name: T,
    preferred_for_styles: ["new_york", "chicago_tavern", "grandma_style", "california_style", "greek_pan"],
    ingredients: [
      { name: "Salsa di pomodoro (passata di pomodoro, sale, zucchero, origano, aglio in polvere)",  components: ["passata di pomodoro", "sale", "zucchero", "origano", "aglio"],amount: { value: 100, unit: "g" } },
      { name: "Low-moisture mozzarella shredded", amount: { value: 100, unit: "g" } },
      { name: "Pepperoni a fette (carne di maiale e manzo, sale, spezie, paprika)",  components: ["carne di maiale", "manzo", "sale", "spezie", "paprika"],amount: { value: 70, unit: "g" }, notes: T },
      { name: "Origano", amount: { value: 1, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_diavola_us",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  /* C-2: nelle pizzerie di Chicago il condimento più diffuso è la salsiccia
   * italiana (Wikipedia, «Tavern-style pizza»), a pezzetti crudi fino al bordo. */
  italian_sausage_tavern: {
    id: "italian_sausage_tavern",
    concept_ref: "italian_sausage",
    variant_name: T,
    preferred_for_styles: ["chicago_tavern"],
    ingredients: [
      { name: "Salsa di pomodoro (passata di pomodoro, sale, origano, aglio)",  components: ["passata di pomodoro", "sale", "origano", "aglio"],amount: { value: 90, unit: "g" } },
      { name: "Low-moisture mozzarella grattugiata", amount: { value: 100, unit: "g" } },
      { name: "Salsiccia al finocchio cruda (carne di maiale, sale, semi di finocchio, pepe)",  components: ["carne di maiale", "sale", "semi di finocchio", "pepe"],amount: { value: 90, unit: "g" }, notes: T },
      { name: "Origano secco", amount: { value: 1, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_sausage_tavern",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* ─── CAPRICCIOSA — 1 classica ─── */

  /* ─── QUATTRO STAGIONI — 1 classica ─── */

  /* ─── QUATTRO FORMAGGI — 1 classica ─── */

  /* ─── ORTOLANA — 1 classica ─── */

  patate_porchetta: {
    id: "patate_porchetta",
    concept_ref: "patate_porchetta",
    thumbnail: thumbnailVariantPatatePorchettaBaciata,
    preferred_for_styles: ["pizza_baciata"],
    compatible_layouts: ["stacked"],
    ingredients: [
      { name: "Porchetta affettata sottile (carne di maiale, sale, pepe, aglio, rosmarino)",  components: ["carne di maiale", "sale", "pepe", "aglio", "rosmarino"],amount: { value: 200, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero", amount: { value: 1, unit: "g" }, optional: true, section: "ripieno" },
      { name: "Patate gialle a tessuto compatto", amount: { value: 400, unit: "g" }, section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: T, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: T, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "patate_mandolina_ammollo",
      title: T,
      description: T,
      duration_minutes: 35,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [
      {
        id: "stesura_patate",
        title: T,
        description: T,
        insert_at: "after_stack",
        duration_minutes: 6,
        tip: TIP,
      },
      {
        id: "farcitura_porchetta",
        title: T,
        description: T,
        insert_at: "after_split_fill",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "sale_finale",
        title: T,
        description: T,
        insert_at: "after_bake2",
        duration_minutes: 1,
      },
    ],
    bake_adjustments: {
      additional_minutes: 5,
      note: T,
    },
  },

  bianca_mortazza_romana: {
    id: "bianca_mortazza_romana",
    concept_ref: "bianca_mortazza",
    variant_name: T,
    thumbnail: thumbnailVariantBiancaMortazzaRomana,
    preferred_for_styles: ["pizza_spaccata", "pala_romana", "teglia_romana", "pizza_baciata"],
    ingredients: [
      { name: "Olio EVO per spennellare", amount: { value: 12, unit: "ml" }, section: "base" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, section: "base" },
      { name: "Stracciatella di burrata (mozzarella, panna)",  components: ["mozzarella", "panna"],amount: { value: 50, unit: "g" }, optional: true, section: "ripieno" },
      { name: "Mortadella IGP di Bologna a fette sottili (carne di suino, sale, spezie, pistacchio)",  components: ["carne di suino", "sale", "spezie", "pistacchio"],amount: { value: 100, unit: "g" }, section: "ripieno" },
      { name: "Granella di pistacchio di Bronte", amount: { value: 10, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "spread_bianca_base",
        for_styles: ["pala_romana", "teglia_romana", "pizza_spaccata"],
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "mortazza_post_bake",
        for_styles: ["pala_romana", "teglia_romana"],
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 3,
      },
      {
        id: "mortazza_spaccata_fill",
        for_styles: ["pizza_spaccata"],
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 7,
      },
      {
        id: "spread_baciata_surface",
        for_styles: ["pizza_baciata"],
        title: T,
        description: T,
        insert_at: "after_stack",
        duration_minutes: 2,
      },
      {
        id: "mortazza_split_fill",
        for_styles: ["pizza_baciata"],
        title: T,
        description: T,
        insert_at: "after_split_fill",
        duration_minutes: 7,
        replaces_generic: true,
      },
    ],
  },

  /* ─── Farciture della Spaccata (base singola cotta e spaccata a metà) ─── */
  crudo_spaccata: {
    id: "crudo_spaccata",
    concept_ref: "crudo",
    thumbnail: thumbnailVariantCrudoSpaccata,
    preferred_for_styles: ["pizza_spaccata"],
    ingredients: [
      { name: "Olio EVO per spennellare", amount: { value: 10, unit: "ml" }, section: "base" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, section: "base" },
      { name: "Prosciutto crudo stagionato a fette (es. Parma 24 mesi)", amount: { value: 90, unit: "g" }, section: "ripieno" },
    ],
    assembly_steps: [
      {
        id: "crudo_bianca",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "crudo_spacca_farci",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
  },

  /* Patate e Porchetta ALLA SANCHO: base singola con patate in crosta (sopra),
     poi spaccata a metà e farcita di porchetta. È una spaccata, non una baciata. */
  patate_porchetta_sancho: {
    id: "patate_porchetta_sancho",
    concept_ref: "patate_porchetta",
    variant_name: T,
    thumbnail: thumbnailVariantPatatePorchettaSancho,
    preferred_for_styles: ["pizza_spaccata"],
    ingredients: [
      { name: "Patate gialle a fette sottilissime (mandolina)", amount: { value: 220, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 18, unit: "ml" }, section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: T, section: "superficie" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: T, section: "superficie" },
      { name: "Porchetta di Ariccia IGP affettata sottile", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero", amount: { value: 1, unit: "g" }, optional: true, section: "ripieno" },
    ],
    pre_prep_steps: [{
      id: "patate_sancho_prep",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [
      {
        id: "patate_sancho_top",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 6,
        replaces_generic: true,
      },
      {
        id: "patate_sancho_split",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 4,
      },
    ],
    bake_adjustments: {
      additional_minutes: 4,
      note: T,
    },
  },

  crescenza_recco: {
    id: "crescenza_recco",
    concept_ref: "crescenza_recco",
    variant_name: T,
    authenticity: "canonical", // disciplinare IGP Focaccia di Recco
    preferred_for_styles: ["focaccia_recco"],
    compatible_layouts: ["double_thin_sheet"],
    ingredients: [
      { name: "Crescenza fresca (formaggio molle)", amount: { value: 250, unit: "g" }, section: "ripieno" },
      { name: "Olio EVO ligure", amount: { value: 10, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "crescenza_internal",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 4,
    }],
  },

  sfincione_palermitano: {
    id: "sfincione_palermitano",
    concept_ref: "sfincione",
    preferred_for_styles: ["sfincione"],
    ingredients: [
      { name: "Acciughe sott'olio", amount: { value: 30, unit: "g" }, notes: T },
      { name: "Caciocavallo (o primosale)", amount: { value: 150, unit: "g" }, notes: T },
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 250, unit: "g" } },
      { name: "Cipolla bianca", amount: { value: 200, unit: "g" }, notes: T },
      { name: "Pecorino grattugiato", amount: { value: 30, unit: "g" }, optional: true },
      { name: "Pangrattato", amount: { value: 40, unit: "g" }, notes: T },
      { name: "Origano secco", amount: { value: 2, unit: "g" } },
      { name: "Olio EVO", amount: { value: 30, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "sfincione_sauce",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "sfincione_top",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },
  focaccia_barese_classica: {
    id: "focaccia_barese_classica",
    concept_ref: "focaccia_barese",
    preferred_for_styles: ["focaccia_barese"],
    ingredients: [
      { name: "Pomodorini freschi (ciliegino)", amount: { value: 300, unit: "g" }, notes: T },
      { name: "Olive baresane", amount: { value: 80, unit: "g" }, notes: T },
      { name: "Origano secco", amount: { value: 2, unit: "g" } },
      { name: "Sale grosso", amount: { value: 4, unit: "g" } },
      { name: "Olio EVO", amount: { value: 25, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "barese_top",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* Varianti tradizionali della focaccia barese (non è mono-gusto). */
  focaccia_barese_patate: {
    id: "focaccia_barese_patate",
    concept_ref: "patate_rosmarino",
    variant_name: T,
    preferred_for_styles: ["focaccia_barese"],
    ingredients: [
      { name: "Patate gialle a fette di ~5 mm", amount: { value: 300, unit: "g" }, notes: T, section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Sale grosso", amount: { value: 4, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 25, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "barese_patate",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
    bake_adjustments: { additional_minutes: 4, note: T },
  },

  focaccia_barese_cipolla: {
    id: "focaccia_barese_cipolla",
    concept_ref: "focaccia_cipolle",
    variant_name: T,
    preferred_for_styles: ["focaccia_barese"],
    ingredients: [
      { name: "Cipolla rossa di Acquaviva (o di Tropea) stufata", amount: { value: 200, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Sale grosso", amount: { value: 4, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 25, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "barese_cipolla_prep",
      title: T,
      description: T,
      duration_minutes: 20,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "barese_cipolla",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  fugazzeta_rellena: {
    id: "fugazzeta_rellena",
    concept_ref: "fugazzeta",
    thumbnail: thumbnailVariantFugazzetaRellena,
    preferred_for_styles: ["fugazzeta"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Mozzarella per pizza (asciutta)", amount: { value: 300, unit: "g" }, notes: T, section: "ripieno" },
      { name: "Cipolla bianca", amount: { value: 200, unit: "g" }, notes: T, section: "superficie" },
      { name: "Parmigiano o pecorino grattugiato", amount: { value: 20, unit: "g" }, optional: true, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "fugazzeta_onion",
      title: T,
      description: T,
      duration_minutes: 15,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "fugazzeta_fill_top",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  /* La "fugazza" originale: niente formaggio dentro, solo cipolla in superficie. */
  fugazza_argentina: {
    id: "fugazza_argentina",
    concept_ref: "fugazza",
    preferred_for_styles: ["fugazzeta"],
    compatible_layouts: ["single"],
    layout_override: { type: "single", pieces_per_unit: 1, interlayer: "none", filling_timing: "pre_bake", cook_mode: "topped" },
    method_note: { key: "diet.singleBase", get fallback() { return METHOD_MESSAGES_IT["diet.singleBase"]; } },
    ingredients: [
      { name: "Cipolla bianca a velo abbondante", amount: { value: 250, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 3, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "fugazza_onion",
      title: T,
      description: T,
      duration_minutes: 15,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "fugazza_top",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  detroit_brick: {
    id: "detroit_brick",
    concept_ref: "detroit",
    preferred_for_styles: ["detroit"],
    ingredients: [
      { name: "Brick cheese del Wisconsin (o mozzarella low-moisture)", amount: { value: 250, unit: "g" }, notes: T, section: "crosta" },
      { name: "Pepperoni piccante (carne di maiale, sale, spezie)",  components: ["carne di maiale", "sale", "spezie"],amount: { value: 80, unit: "g" }, optional: true, section: "base" },
      { name: "Salsa di pomodoro concentrata (passata di pomodoro, origano, sale)",  components: ["passata di pomodoro", "origano", "sale"],amount: { value: 150, unit: "g" }, notes: T, section: "superficie" },
      { name: "Parmigiano o pecorino grattugiato", amount: { value: 10, unit: "g" }, optional: true, section: "superficie" },
      { name: "Origano secco", amount: { value: 1, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "detroit_cheese_crown",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "detroit_sauce_stripes",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
      },
    ],
  },
  chicago_deep_classic: {
    id: "chicago_deep_classic",
    concept_ref: "chicago",
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 200, unit: "g" }, notes: T, section: "base" },
      { name: "Salsiccia italiana sbriciolata (carne di suino, sale, pepe, semi di finocchio)",  components: ["carne di suino", "sale", "pepe", "semi di finocchio"],amount: { value: 150, unit: "g" }, optional: true, notes: T, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi (San Marzano) (pomodori, succo di pomodoro, sale)",  components: ["pomodori", "succo di pomodoro", "sale"],amount: { value: 250, unit: "g" }, notes: T, section: "superficie" },
      { name: "Parmigiano grattugiato", amount: { value: 20, unit: "g" }, notes: T, section: "superficie" },
      { name: "Origano e basilico secco", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "chicago_cheese_base",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 5,
        replaces_generic: true,
      },
      {
        id: "chicago_sauce_top",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 3,
      },
    ],
  },
  calzone_napoletano_classico: {
    id: "calzone_napoletano_classico",
    concept_ref: "calzone",
    variant_name: T,
    preferred_for_styles: ["calzone_napoletano"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Ricotta fresca (siero di latte, sale)",  components: ["siero di latte", "sale"],amount: { value: 100, unit: "g" }, section: "ripieno" },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" }, section: "ripieno" },
      { name: "Salame napoletano (carne di maiale, sale, pepe)",  components: ["carne di maiale", "sale", "pepe"],amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "ripieno" },
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Parmigiano grattugiato", amount: { value: 5, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 2, unit: "pcs" }, notes: T, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "calzone_assembly",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* Calzone: il classico non è mono-gusto — scarola e ricotta&cicoli sono tradizionali. */
  calzone_scarola: {
    id: "calzone_scarola",
    concept_ref: "scarola",
    variant_name: T,
    thumbnail: thumbnailVariantCalzoneScarola,
    preferred_for_styles: ["calzone_napoletano"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Scarola stufata con aglio (scarola, aglio, olio)",  components: ["scarola", "aglio", "olio"],amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Olive di Gaeta denocciolate", amount: { value: 25, unit: "g" }, section: "ripieno" },
      { name: "Capperi dissalati", amount: { value: 10, unit: "g" }, section: "ripieno" },
      { name: "Provola affumicata a cubetti", amount: { value: 70, unit: "g" }, section: "ripieno" },
      { name: "Acciughe (opzionali)", amount: { value: 10, unit: "g" }, optional: true, section: "ripieno" },
    ],
    pre_prep_steps: [{
      id: "scarola_stufata",
      title: T,
      description: T,
      duration_minutes: 12,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "calzone_scarola_fill",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  calzone_ricotta_cicoli: {
    id: "calzone_ricotta_cicoli",
    concept_ref: "ricotta_cicoli",
    thumbnail: thumbnailVariantCalzoneRicottaCicoli,
    preferred_for_styles: ["calzone_napoletano"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Ricotta di pecora (siero di latte, sale)",  components: ["siero di latte", "sale"],amount: { value: 110, unit: "g" }, section: "ripieno" },
      { name: "Cicoli napoletani (ciccioli di maiale)", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "ripieno" },
      { name: "Passata di pomodoro (sulla superficie)", amount: { value: 40, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "calzone_cicoli_fill",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  margherita_new_york: {
    id: "margherita_new_york",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaNewYork,
    preferred_for_styles: ["new_york"],
    ingredients: [
      { name: "Salsa di pomodoro (passata di pomodoro, sale, zucchero, origano)",  components: ["passata di pomodoro", "sale", "zucchero", "origano"],amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Low-moisture mozzarella", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Pecorino Romano grattugiato", amount: { value: 8, unit: "g" }, notes: T, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_ny",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },
  montanara_classica: {
    id: "montanara_classica",
    concept_ref: "montanara",
    preferred_for_styles: ["pizza_montanara"],
    ingredients: [
      { name: "Pomodoro (pelati schiacciati o passata, sale)",  components: ["sale"],amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Ricotta fresca (siero di latte, sale)",  components: ["siero di latte", "sale"],amount: { value: 30, unit: "g" }, notes: T, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 5, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 2, unit: "pcs" }, notes: T, section: "superficie" },
      { name: "Olio EVO", amount: { value: 3, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "montanara_a_crudo",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* Pizza Fritta RIPIENA — distinta dalla Montanara: qui si farcisce e si
     sigilla PRIMA di friggere (tasca chiusa), non si condisce sopra a crudo. */
  pizza_fritta_ripiena: {
    id: "pizza_fritta_ripiena",
    concept_ref: "pizza_fritta",
    variant_name: T,
    preferred_for_styles: ["pizza_fritta"],
    ingredients: [
      // M-7: dosi del disciplinare AVPN 2024 (§4.2) per un panetto di circa 200 g:
      // ricotta 80–90 g, provola o fiordilatte 30–50 g, cicoli o salame 50–60 g.
      { name: "Ricotta di pecora (siero di latte, sale)",  components: ["siero di latte", "sale"],amount: { value: 85, unit: "g" }, section: "ripieno" },
      { name: "Provola affumicata a cubetti", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Cicoli napoletani (o ciccioli di maiale)", amount: { value: 55, unit: "g" }, notes: T, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "ripieno" },
      { name: "Pomodoro San Marzano (poco, dentro)", amount: { value: 30, unit: "g" }, optional: true, section: "ripieno" },
    ],
    assembly_steps: [{
      id: "pizza_fritta_fill_seal",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  /* M-7 (D-022): ripieno della tonda fritta, dosi AVPN 2024 per 200 g. */
  pizza_fritta_tonda_ripiena: {
    id: "pizza_fritta_tonda_ripiena",
    concept_ref: "pizza_fritta",
    variant_name: T,
    preferred_for_styles: ["pizza_fritta_tonda"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Ricotta di pecora (siero di latte, sale)",  components: ["siero di latte", "sale"],amount: { value: 85, unit: "g" }, section: "ripieno" },
      { name: "Provola affumicata a cubetti", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Cicoli napoletani (o salame napoletano)", amount: { value: 55, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 1, unit: "g" }, section: "ripieno" },
    ],
    assembly_steps: [{
      id: "pizza_fritta_tonda_fill",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 6,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  /* ─── R1/R29: farciture & condimenti regionali prima mancanti ─── */
  ciaccino_senese_farcito: {
    id: "ciaccino_senese_farcito",
    concept_ref: "ciaccino",
    preferred_for_styles: ["ciaccino_senese"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Prosciutto crudo toscano", amount: { value: 80, unit: "g" }, notes: T, section: "ripieno" },
      { name: "Pecorino toscano semi-stagionato", amount: { value: 60, unit: "g" }, notes: T, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 1, unit: "g" }, optional: true, section: "ripieno" },
    ],
    assembly_steps: [{
      id: "ciaccino_farcitura",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
      tip: TIP,
    }],
  },
  white_clam_new_haven: {
    id: "white_clam_new_haven",
    concept_ref: "white_clam",
    preferred_for_styles: ["new_haven_apizza"],
    ingredients: [
      { name: "Vongole fresche sgusciate (littleneck)", amount: { value: 150, unit: "g" }, notes: T, section: "base" },
      { name: "Aglio fresco tritato", amount: { value: 12, unit: "g" }, section: "base" },
      { name: "Pecorino romano grattugiato", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Pepe nero e prezzemolo", amount: { value: 2, unit: "g" }, optional: true, section: "superficie" },
    ],
    assembly_steps: [{
      id: "white_clam_top",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },
  salsiccia_friarielli_napoletana: {
    id: "salsiccia_friarielli_napoletana",
    concept_ref: "salsiccia_friarielli",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Friarielli (cime di rapa) puliti", components: ["cime di rapa", "aglio", "olio EVO", "peperoncino"], amount: { value: 120, unit: "g" }, notes: T, section: "base" },
      { name: "Salsiccia napoletana sbriciolata (carne di maiale, sale, pepe)",  components: ["carne di maiale", "sale", "pepe"],amount: { value: 100, unit: "g" }, notes: T, section: "base" },
      { name: "Provola affumicata", amount: { value: 80, unit: "g" }, notes: T, section: "base" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "friarielli_saltati",
      title: T,
      description: T,
      duration_minutes: 12,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "salsiccia_friarielli_top",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },
  cacio_e_pepe_crema: {
    id: "cacio_e_pepe_crema",
    concept_ref: "cacio_e_pepe",
    variant_name: T,
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pecorino romano grattugiato", amount: { value: 60, unit: "g" }, notes: T, section: "superficie" },
      { name: "Pepe nero in grani macinato fresco", amount: { value: 3, unit: "g" }, section: "superficie" },
      { name: "Acqua tiepida (o poca panna)", amount: { value: 30, unit: "ml" }, notes: T, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "cacio_pepe_cream",
      title: T,
      description: T,
      duration_minutes: 5,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "cacio_pepe_postbake",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 2,
      replaces_generic: true,
    }],
  },
  hawaiiana_classica: {
    id: "hawaiiana_classica",
    concept_ref: "hawaiiana",
    preferred_for_styles: ["new_york", "grandma_style"],
    authenticity: "experimental", // l'ananas: innovazione/eresia, tenuta in coda
    ingredients: [
      { name: "Salsa di pomodoro (passata, sale, origano)",  components: ["passata", "sale", "origano"],amount: { value: 80, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Prosciutto cotto a cubetti", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Ananas (fresco o ben sgocciolato)", amount: { value: 70, unit: "g" }, notes: T, section: "base" },
    ],
    assembly_steps: [{
      id: "hawaiiana_top",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * WAVE 1 — TOPPING PER STILE: FAMIGLIA NAPOLETANA
   * Ogni stile napoletano riceve i propri classici (varianti napoletane, non
   * fallback cross-family) + le firme dai cataloghi (Pepe in Grani, 50 Kalò,
   * Da Lioniello). Ancorati con preferred_for_styles così vincono sul resolver.
   * ═══════════════════════════════════════════════════════════════════════ */

  /* ─── Classici in versione napoletana (battono il fallback cross-family) ─── */
  capricciosa_napoletana: {
    id: "capricciosa_napoletana",
    concept_ref: "capricciosa",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano schiacciati a mano (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 80, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a fette (carne di suino, sale, aromi)",  components: ["carne di suino", "sale", "aromi"],amount: { value: 35, unit: "g" } },
      { name: "Funghi champignon saltati", amount: { value: 30, unit: "g" } },
      { name: "Carciofini di Paestum sottolio (carciofi, olio, sale)",  components: ["carciofi", "olio", "sale"],amount: { value: 30, unit: "g" } },
      { name: "Olive caiazzane (o nere di Gaeta)", amount: { value: 20, unit: "g" } },
      { name: "Alici di Cetara (opzionali)", amount: { value: 10, unit: "g" }, optional: true },
      { name: "Olio EVO delle Colline Salernitane a filo", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "champignon_nap_capricciosa",
      title: T,
      description: T,
      duration_minutes: 8,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_capricciosa_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  quattro_stagioni_napoletana: {
    id: "quattro_stagioni_napoletana",
    concept_ref: "quattro_stagioni",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    ingredients: [
      { name: "Pelati San Marzano schiacciati a mano (pomodoro, succo di pomodoro)",  components: ["pomodoro", "succo di pomodoro"],amount: { value: 80, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto (carne di suino, sale, aromi)",  components: ["carne di suino", "sale", "aromi"],amount: { value: 30, unit: "g" }, notes: T },
      { name: "Funghi champignon saltati", amount: { value: 30, unit: "g" }, notes: T },
      { name: "Carciofini di Paestum sottolio (carciofi, olio, sale)",  components: ["carciofi", "olio", "sale"],amount: { value: 30, unit: "g" }, notes: T },
      { name: "Alici di Cetara e olive", amount: { value: 25, unit: "g" }, notes: T },
    ],
    assembly_steps: [{
      id: "spread_4stagioni_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  quattro_formaggi_napoletana: {
    id: "quattro_formaggi_napoletana",
    concept_ref: "quattro_formaggi",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" } },
      { name: "Provolone del Monaco DOP a scaglie", amount: { value: 25, unit: "g" } },
      { name: "Gorgonzola dolce a cubetti", amount: { value: 25, unit: "g" } },
      { name: "Parmigiano Reggiano grattugiato", amount: { value: 15, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_4formaggi_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  ortolana_napoletana: {
    id: "ortolana_napoletana",
    concept_ref: "ortolana",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 70, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" } },
      { name: "Melanzane fritte a cubetti", amount: { value: 45, unit: "g" } },
      { name: "Zucchine fritte", amount: { value: 45, unit: "g" } },
      { name: "Peperoni grigliati", amount: { value: 40, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" } },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "verdure_fritte_nap",
      title: T,
      description: T,
      duration_minutes: 20,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_ortolana_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* ─── Firme napoletane dai cataloghi ─── */
  cosacca_napoletana: {
    id: "cosacca_napoletana",
    concept_ref: "cosacca",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" } },
      { name: "Sale fino", amount: { value: 1, unit: "g" } },
      { name: "Parmigiano Reggiano DOP 24 mesi grattugiato", amount: { value: 25, unit: "g" }, notes: T },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" } },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 6, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_cosacca",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 2,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  provola_pepe_napoletana: {
    id: "provola_pepe_napoletana",
    concept_ref: "provola_pepe",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 70, unit: "g" }, notes: T },
      { name: "Provola affumicata campana a cubetti", amount: { value: 90, unit: "g" } },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_provola_pepe",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  nduja_napoletana: {
    id: "nduja_napoletana",
    concept_ref: "nduja",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 80, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "'Nduja piccante di Spilinga (carne di maiale, peperoncino, sale)",  components: ["carne di maiale", "peperoncino", "sale"],amount: { value: 40, unit: "g" }, notes: T },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_nduja_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  nerano_napoletana: {
    id: "nerano_napoletana",
    concept_ref: "nerano",
    authenticity: "signature",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Crema di zucchine (zucchine, olio EVO, sale)",  components: ["zucchine", "olio EVO", "sale"],amount: { value: 80, unit: "g" }, section: "base" },
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Zucchine fritte a julienne", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Provolone del Monaco DOP a scaglie", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Mentuccia fresca", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "nerano_prep",
      title: T,
      description: T,
      duration_minutes: 20,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_nerano",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  margherita_sbagliata_canotto: {
    id: "margherita_sbagliata_canotto",
    concept_ref: "margherita_sbagliata",
    authenticity: "signature",
    preferred_for_styles: ["napoletana_canotto"],
    ingredients: [
      { name: "Mozzarella di bufala campana DOP a fette (fusa in cottura)", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Passata di pomodoro riccio a crudo, fredda (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 80, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco (o riduzione di basilico)", amount: { value: 4, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO a filo", amount: { value: 6, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "sbagliata_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "sbagliata_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
    bake_adjustments: {
      note: T,
    },
  },

  scarpetta_canotto: {
    id: "scarpetta_canotto",
    concept_ref: "scarpetta",
    variant_name: T,
    authenticity: "signature",
    preferred_for_styles: ["napoletana_canotto"],
    ingredients: [
      { name: "Mozzarella di bufala campana DOP (fusa in cottura)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Fonduta di Grana Padano DOP 12 mesi", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Composta di pomodoro a crudo, fredda (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 70, unit: "g" }, section: "superficie" },
      { name: "Pesto di basilico", amount: { value: 10, unit: "g" }, section: "superficie" },
      { name: "Scaglie di Grana Padano DOP 24 mesi", amount: { value: 15, unit: "g" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "scarpetta_fonduta",
      title: T,
      description: T,
      duration_minutes: 10,
      timing: "just_before_assembly",
    }],
    assembly_steps: [
      {
        id: "scarpetta_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 3,
        replaces_generic: true,
      },
      {
        id: "scarpetta_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * WAVE 2 — TOPPING PER STILE: FAMIGLIA ROMANA
   * teglia_romana, tonda_romana, pinsa_romana, pala_romana (+ baciata/patate
   * già coperti). Classici in versione romana (la "margherita romana" è diversa
   * dalla napoletana: passata, fior di latte fuso, basilico) + firme dai menù
   * (180g per la tonda, Pinsere per la pinsa, Roscioli per la pala).
   * ═══════════════════════════════════════════════════════════════════════ */

  /* ─── Classici in versione romana (battono il fallback cross-family) ─── */
  capricciosa_romana: {
    id: "capricciosa_romana",
    concept_ref: "capricciosa",
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto alla brace a fette (carne di suino, sale, aromi)",  components: ["carne di suino", "sale", "aromi"],amount: { value: 40, unit: "g" } },
      { name: "Funghi champignon freschi affettati", amount: { value: 30, unit: "g" } },
      { name: "Carciofini sottolio alla romana (carciofi, olio, sale)",  components: ["carciofi", "olio", "sale"],amount: { value: 30, unit: "g" } },
      { name: "Olive nere", amount: { value: 20, unit: "g" } },
      { name: "Uovo sodo (opzionale, alla romana)", amount: { value: 1, unit: "pcs" }, optional: true },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_capricciosa_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  quattro_stagioni_romana: {
    id: "quattro_stagioni_romana",
    concept_ref: "quattro_stagioni",
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto (carne di suino, sale, aromi)",  components: ["carne di suino", "sale", "aromi"],amount: { value: 30, unit: "g" }, notes: T },
      { name: "Funghi champignon", amount: { value: 30, unit: "g" }, notes: T },
      { name: "Carciofini sottolio (carciofi, olio, sale)",  components: ["carciofi", "olio", "sale"],amount: { value: 30, unit: "g" }, notes: T },
      { name: "Olive nere", amount: { value: 20, unit: "g" }, notes: T },
    ],
    assembly_steps: [{
      id: "spread_4stagioni_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  quattro_formaggi_romana: {
    id: "quattro_formaggi_romana",
    concept_ref: "quattro_formaggi",
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 70, unit: "g" } },
      { name: "Gorgonzola dolce DOP a cubetti", amount: { value: 30, unit: "g" } },
      { name: "Provola affumicata a cubetti", amount: { value: 25, unit: "g" } },
      { name: "Pecorino romano DOP grattugiato", amount: { value: 15, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_4formaggi_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  ortolana_romana: {
    id: "ortolana_romana",
    concept_ref: "ortolana",
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 70, unit: "g" } },
      { name: "Fette di patate al forno", amount: { value: 50, unit: "g" } },
      { name: "Melanzane grigliate", amount: { value: 45, unit: "g" } },
      { name: "Zucchine grigliate", amount: { value: 45, unit: "g" } },
      { name: "Pomodorini datterini freschi", amount: { value: 40, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "grigliare_verdure_rom",
      title: T,
      description: T,
      duration_minutes: 22,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_ortolana_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* ─── Firme romane dai menù ─── */
  diavola_romana: {
    id: "diavola_romana",
    concept_ref: "diavola",
    variant_name: T,
    preferred_for_styles: ["tonda_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Salame piccante a fette (carne di maiale, sale, peperoncino)",  components: ["carne di maiale", "sale", "peperoncino"],amount: { value: 50, unit: "g" } },
      { name: "Origano secco", amount: { value: 1, unit: "g" }, section: "superficie" },
      { name: "Pecorino romano DOP grattugiato", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_diavola_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  provola_pepe_tonda: {
    id: "provola_pepe_tonda",
    concept_ref: "provola_pepe",
    preferred_for_styles: ["tonda_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 85, unit: "g" } },
      { name: "Provola affumicata campana a cubetti", amount: { value: 85, unit: "g" } },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_provola_pepe_tonda",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  hot_honey_tonda: {
    id: "hot_honey_tonda",
    concept_ref: "hot_honey",
    authenticity: "signature",
    preferred_for_styles: ["tonda_romana"],
    ingredients: [
      { name: "Passata di pomodoro speziata (pomodoro, sale, peperoncino)",  components: ["pomodoro", "sale", "peperoncino"],amount: { value: 85, unit: "g" } },
      { name: "Provola affumicata campana a cubetti", amount: { value: 80, unit: "g" } },
      { name: "Salame piccante tipo pepperoni a fette", amount: { value: 45, unit: "g" } },
      { name: "Miele aromatizzato alla 'nduja", amount: { value: 12, unit: "g" }, notes: T, section: "superficie" },
      { name: "Pecorino romano DOP grattugiato", amount: { value: 10, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_hot_honey",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  bresaola_rucola_tonda: {
    id: "bresaola_rucola_tonda",
    concept_ref: "bresaola_rucola",
    authenticity: "signature",
    preferred_for_styles: ["tonda_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 85, unit: "g" }, section: "base" },
      { name: "Bresaola della Valtellina IGP a fette (carne di manzo, sale)",  components: ["carne di manzo", "sale"],amount: { value: 50, unit: "g" }, section: "superficie" },
      { name: "Rucola selvatica fresca", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Scaglie di Parmigiano Reggiano 24 mesi", amount: { value: 15, unit: "g" }, section: "superficie" },
      { name: "Zest di limone grattugiato", amount: { value: 1, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "bresaola_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "bresaola_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },

  nduja_pinsa: {
    id: "nduja_pinsa",
    concept_ref: "nduja",
    variant_name: T,
    authenticity: "signature",
    preferred_for_styles: ["pinsa_romana"],
    ingredients: [
      { name: "'Nduja piccante di Spilinga (carne di maiale, peperoncino, sale)",  components: ["carne di maiale", "peperoncino", "sale"],amount: { value: 40, unit: "g" }, section: "base", notes: T },
      { name: "Stracciatella di burrata fresca (mozzarella, panna)",  components: ["mozzarella", "panna"],amount: { value: 70, unit: "g" }, section: "superficie", notes: T },
      { name: "Pomodorini datterini freschi", amount: { value: 50, unit: "g" }, section: "superficie", notes: T },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "nduja_pinsa_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "nduja_pinsa_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
  },

  patate_rosmarino_romana: {
    id: "patate_rosmarino_romana",
    concept_ref: "patate_rosmarino",
    preferred_for_styles: ["teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Fior di latte (opzionale, su pinsa/teglia)", amount: { value: 60, unit: "g" }, optional: true, section: "base" },
      { name: "Patate gialle a fette sottili", amount: { value: 180, unit: "g" }, section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: T, section: "superficie" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: T, section: "superficie" },
      { name: "Olio EVO", amount: { value: 12, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "patate_mandolina_rom",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_patate_rosmarino",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
    bake_adjustments: {
      additional_minutes: 4,
      note: T,
    },
  },

  stracciata_bottarga_pala: {
    id: "stracciata_bottarga_pala",
    concept_ref: "stracciata_bottarga",
    variant_name: T,
    authenticity: "signature",
    preferred_for_styles: ["pala_romana"],
    ingredients: [
      { name: "Stracciatella di burrata fresca pugliese (mozzarella, panna)",  components: ["mozzarella", "panna"],amount: { value: 90, unit: "g" }, section: "superficie", notes: T },
      { name: "Zucchine romanesche alla scapece (zucchine, aceto, menta)",  components: ["zucchine", "aceto", "menta"],amount: { value: 60, unit: "g" }, section: "superficie" },
      { name: "Bottarga di muggine grattugiata", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 6, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "stracciata_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "stracciata_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },


  /* ═══════════════════════════════════════════════════════════════════════
   * WAVE 3 — TOPPING PER STILE: FAMIGLIA AMERICANA
   * Gli stili USA usano classici AMERICANI (cheese, pepperoni, supreme, white
   * pie) + firme dai menù (Joe's, Emmy Squared, Giordano's, Prince St, Spago),
   * non i classici italiani. Pepperoni/Margherita americane già esistono.
   * ═══════════════════════════════════════════════════════════════════════ */

  cheese_ny: {
    id: "cheese_ny",
    concept_ref: "cheese_pizza",
    preferred_for_styles: ["new_york"],
    ingredients: [
      { name: "Salsa di pomodoro stile Santa Barbara (passata, origano, zucchero, aglio)",  components: ["passata", "origano", "zucchero", "aglio"],amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture grattugiata", amount: { value: 130, unit: "g" }, section: "base" },
      { name: "Pecorino romano grattugiato", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 4, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_cheese_ny",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  white_pizza_ny: {
    id: "white_pizza_ny",
    concept_ref: "white_pizza",
    preferred_for_styles: ["new_york"],
    ingredients: [
      { name: "Mozzarella low-moisture", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Ricotta vaccina montata", amount: { value: 60, unit: "g" }, notes: T, section: "base" },
      { name: "Spinaci freschi saltati", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Aglio fresco tritato", amount: { value: 6, unit: "g" }, section: "base" },
      { name: "Pecorino romano grattugiato", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_white_ny",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  supreme_ny: {
    id: "supreme_ny",
    concept_ref: "supreme",
    preferred_for_styles: ["new_york"],
    ingredients: [
      { name: "Salsa di pomodoro Santa Barbara (passata, origano, aglio)",  components: ["passata", "origano", "aglio"],amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Salame pepperoni a fette", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Salsiccia di maiale sbriciolata", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Peperoni verdi a rondelle", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Cipolla bianca affettata", amount: { value: 25, unit: "g" }, section: "base" },
      { name: "Funghi champignon affettati", amount: { value: 30, unit: "g" }, section: "base" },
    ],
    assembly_steps: [{
      id: "spread_supreme_ny",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  vodka_detroit: {
    id: "vodka_detroit",
    concept_ref: "vodka_pizza",
    preferred_for_styles: ["detroit"],
    authenticity: "signature",
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 200, unit: "g" }, notes: T, section: "crosta" },
      { name: "Salsa vodka (pomodoro, panna, vodka, cipolla)",  components: ["pomodoro", "panna", "vodka", "cipolla"],amount: { value: 100, unit: "g" }, notes: T, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 12, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_vodka_detroit",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  italian_beef_chicago: {
    id: "italian_beef_chicago",
    concept_ref: "italian_beef",
    preferred_for_styles: ["chicago_deep"],
    authenticity: "signature",
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 180, unit: "g" }, notes: T, section: "base" },
      { name: "Straccetti di manzo brasato (Italian beef) nel proprio brodo", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Giardiniera piccante tritata (verdure sott'aceto)", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi (San Marzano)", amount: { value: 200, unit: "g" }, notes: T, section: "superficie" },
      { name: "Parmigiano grattugiato", amount: { value: 15, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_italian_beef",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  supreme_tavern: {
    id: "supreme_tavern",
    concept_ref: "supreme",
    variant_name: T,
    preferred_for_styles: ["chicago_tavern"],
    ingredients: [
      { name: "Salsa di pomodoro", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Salsiccia di maiale al finocchietto sbriciolata", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Salame pepperoni", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Peperoni verdi a rondelle", amount: { value: 25, unit: "g" }, section: "base" },
    ],
    assembly_steps: [{
      id: "spread_supreme_tavern",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  margherita_grandma: {
    id: "margherita_grandma",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaGrandma,
    preferred_for_styles: ["grandma_style"],
    ingredients: [
      { name: "Mozzarella fior di latte fresca", amount: { value: 110, unit: "g" }, notes: T, section: "base" },
      { name: "Salsa marinara densa di pomodori confit (pomodoro, aglio, olio)",  components: ["pomodoro", "aglio", "olio"],amount: { value: 90, unit: "g" }, notes: T, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 12, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 6, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_grandma",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  vodka_grandma: {
    id: "vodka_grandma",
    concept_ref: "vodka_pizza",
    variant_name: T,
    preferred_for_styles: ["grandma_style"],
    authenticity: "signature",
    ingredients: [
      { name: "Mozzarella fior di latte fresca", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Salsa vodka (pomodoro, panna, prosciutto, vodka)",  components: ["pomodoro", "panna", "prosciutto", "vodka"],amount: { value: 100, unit: "g" }, notes: T, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 12, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_vodka_grandma",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  tomato_pie_newhaven: {
    id: "tomato_pie_newhaven",
    concept_ref: "tomato_pie",
    preferred_for_styles: ["new_haven_apizza"],
    ingredients: [
      { name: "Polpa di pomodoro San Marzano (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 130, unit: "g" }, section: "base" },
      { name: "Aglio fresco tritato", amount: { value: 8, unit: "g" }, section: "base" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 18, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 12, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_tomato_pie",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  bbq_chicken_california: {
    id: "bbq_chicken_california",
    concept_ref: "bbq_chicken",
    variant_name: T,
    preferred_for_styles: ["california_style"],
    authenticity: "signature",
    ingredients: [
      { name: "Salsa barbecue", amount: { value: 80, unit: "g" }, notes: T, section: "base" },
      { name: "Mozzarella (o mix con gouda affumicato)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Pollo cotto glassato alla barbecue", amount: { value: 80, unit: "g" }, section: "base" },
      { name: "Cipolla rossa affettata sottile", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Coriandolo fresco", amount: { value: 4, unit: "pcs" }, notes: T, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_bbq_chicken",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  smoked_salmon_california: {
    id: "smoked_salmon_california",
    concept_ref: "smoked_salmon",
    variant_name: T,
    preferred_for_styles: ["california_style"],
    authenticity: "signature",
    ingredients: [
      { name: "Crème fraîche", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Mozzarella", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Salmone affumicato", amount: { value: 60, unit: "g" }, notes: T, section: "superficie" },
      { name: "Aneto fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Cipolla rossa a velo", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Capperi", amount: { value: 8, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "salmon_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "salmon_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },

  greek_feta_pan: {
    id: "greek_feta_pan",
    concept_ref: "greek_feta",
    preferred_for_styles: ["greek_pan"],
    ingredients: [
      { name: "Salsa di pomodoro all'origano", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mix mozzarella e cheddar", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Feta sbriciolata", amount: { value: 50, unit: "g" }, section: "superficie" },
      { name: "Olive kalamata denocciolate", amount: { value: 30, unit: "g" }, section: "superficie" },
      { name: "Cipolla rossa a rondelle", amount: { value: 25, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_greek",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* Greek pan: il diner-classic plain cheese (mix mozzarella + cheddar). */
  greek_cheese_pan: {
    id: "greek_cheese_pan",
    concept_ref: "cheese_pizza",
    variant_name: T,
    preferred_for_styles: ["greek_pan"],
    ingredients: [
      { name: "Salsa di pomodoro all'origano", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mix mozzarella e cheddar", amount: { value: 120, unit: "g" }, section: "base" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_greek_cheese",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * WAVE 4 — TOPPING PER STILE: FAMIGLIA CONTEMPORANEA / REGIONALE
   * bonci_teglia, focaccia_genovese (+ Sardenaira De.Co.), sfincione (+
   * bagherese bianco), focaccia_recco, padellino_torino, trancio_milanese.
   * Ciaccino e Barese sono mono-topping già coperti.
   * ═══════════════════════════════════════════════════════════════════════ */

  zucca_speck_bonci: {
    id: "zucca_speck_bonci",
    concept_ref: "zucca_speck",
    variant_name: T,
    preferred_for_styles: ["teglia_romana"],
    authenticity: "signature",
    ingredients: [
      { name: "Crema di zucca arrosto (zucca, noce moscata, sale)",  components: ["zucca", "noce moscata", "sale"],amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Speck artigianale a fette", amount: { value: 50, unit: "g" }, notes: T, section: "superficie" },
      { name: "Caciocavallo campano a scaglie", amount: { value: 30, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "zucca_speck_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 3,
        replaces_generic: true,
      },
      {
        id: "zucca_speck_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
  },

  burrata_salmone_bonci: {
    id: "burrata_salmone_bonci",
    concept_ref: "burrata_salmone",
    variant_name: T,
    preferred_for_styles: ["teglia_romana"],
    authenticity: "signature",
    ingredients: [
      { name: "Olio EVO e sale per la cottura in bianco", amount: { value: 10, unit: "ml" }, section: "base" },
      { name: "Stracciatella di burrata pugliese (mozzarella, panna)",  components: ["mozzarella", "panna"],amount: { value: 80, unit: "g" }, notes: T, section: "superficie" },
      { name: "Salmone scozzese affumicato a freddo", amount: { value: 60, unit: "g" }, section: "superficie" },
      { name: "Zest di limone e aneto fresco", amount: { value: 3, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "burrata_salmone_bake",
        title: T,
        description: T,
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "burrata_salmone_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },

  /* C-2: la genovese classica è olio, sale grosso e salamoia nelle fossette;
   * il rosmarino è una variante (Città dell'Olio 2016; docs/linee-guida-stili.md). */
  focaccia_genovese_classica: {
    id: "focaccia_genovese_classica",
    concept_ref: "bianca",
    variant_name: T,
    preferred_for_styles: ["focaccia_genovese"],
    ingredients: [
      { name: "Acqua", amount: { value: 30, unit: "ml" }, section: "salamoia" },
      { name: "Sale fino", amount: { value: 1.5, unit: "g" }, section: "salamoia" },
      { name: "Olio EVO ligure", amount: { value: 15, unit: "ml" }, section: "finitura" },
      { name: "Sale grosso", amount: { value: 3, unit: "g" }, section: "finitura" },
    ],
    assembly_steps: [{
      id: "spread_salamoia_genovese",
      title: T,
      description: T,
      insert_at: "before_proof",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  focaccia_cipolle_genovese: {
    id: "focaccia_cipolle_genovese",
    concept_ref: "focaccia_cipolle",
    preferred_for_styles: ["focaccia_genovese"],
    ingredients: [
      { name: "Cipolle dorate a fette sottili", amount: { value: 120, unit: "g" }, section: "superficie" },
      { name: "Acqua", amount: { value: 30, unit: "ml" }, section: "salamoia" },
      { name: "Sale fino", amount: { value: 1.5, unit: "g" }, section: "salamoia" },
      { name: "Olio EVO ligure", amount: { value: 15, unit: "ml" }, section: "finitura" },
      { name: "Sale grosso", amount: { value: 3, unit: "g" }, section: "finitura" },
    ],
    assembly_steps: [{
      id: "spread_cipolle_genovese",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  sardenaira_sanremo: {
    id: "sardenaira_sanremo",
    concept_ref: "sardenaira",
    variant_name: T,
    preferred_for_styles: ["focaccia_genovese"],
    authenticity: "canonical",
    /* La De.Co. è della sardenaira, non della focaccia genovese che la ospita. */
    authenticity_by_style: { focaccia_genovese: "natural" },
    ingredients: [
      { name: "Pomodori freschi a pezzi o polpa di pomodoro", components: ["pomodoro"], amount: { value: 150, unit: "g" }, notes: T, section: "base" },
      { name: "Acciughe salate dissalate", amount: { value: 25, unit: "g" }, section: "base" },
      { name: "Aglio in camicia schiacciato", amount: { value: 3, unit: "pcs" }, section: "base" },
      { name: "Olive taggiasche in salamoia", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Capperi dissalati", amount: { value: 15, unit: "g" }, section: "superficie" },
      { name: "Origano selvatico secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Olio EVO ligure", amount: { value: 20, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_sardenaira",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  sfincione_bianco_bagherese: {
    id: "sfincione_bianco_bagherese",
    concept_ref: "sfincione_bianco",
    variant_name: T,
    preferred_for_styles: ["sfincione"],
    ingredients: [
      { name: "Acciughe salate sciolte in olio EVO", amount: { value: 25, unit: "g" }, section: "base" },
      { name: "Tuma fresca (o primosale) a fette", amount: { value: 120, unit: "g" }, notes: T, section: "base" },
      { name: "Ricotta di pecora", amount: { value: 120, unit: "g" }, notes: T, section: "base" },
      { name: "Cipolle bianche stufate lentamente", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Caciocavallo stagionato grattugiato", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Mollica di pane tostata all'origano", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Pepe nero e olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "bagherese_prep",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_sfincione_bianco",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  recco_nduja: {
    id: "recco_nduja",
    concept_ref: "nduja",
    thumbnail: thumbnailVariantReccoNduja,
    preferred_for_styles: ["focaccia_recco"],
    authenticity: "signature",
    compatible_layouts: ["double_thin_sheet"],
    ingredients: [
      { name: "Crescenza ligure fresca", amount: { value: 230, unit: "g" }, section: "ripieno" },
      { name: "'Nduja piccante di Spilinga", amount: { value: 40, unit: "g" }, notes: T, section: "ripieno" },
      { name: "Olio EVO ligure", amount: { value: 10, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "recco_nduja_fill",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  recco_culatello_recipe: {
    id: "recco_culatello_recipe",
    concept_ref: "recco_culatello",
    thumbnail: thumbnailVariantReccoCulatello,
    preferred_for_styles: ["focaccia_recco"],
    authenticity: "signature",
    compatible_layouts: ["double_thin_sheet"],
    ingredients: [
      { name: "Crescenza ligure fresca", amount: { value: 230, unit: "g" }, section: "ripieno" },
      { name: "Olio EVO ligure", amount: { value: 8, unit: "ml" }, section: "superficie" },
      { name: "Culatello di Zibello DOP a fette sottili", amount: { value: 60, unit: "g" }, notes: T, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "recco_culatello_fill",
        title: T,
        description: T,
        insert_at: "after_fill_internal",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "recco_culatello_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
  },

  recco_cotto_recipe: {
    id: "recco_cotto_recipe",
    concept_ref: "recco_cotto",
    thumbnail: thumbnailVariantReccoCotto,
    preferred_for_styles: ["focaccia_recco"],
    compatible_layouts: ["double_thin_sheet"],
    ingredients: [
      { name: "Crescenza ligure fresca", amount: { value: 230, unit: "g" }, section: "ripieno" },
      { name: "Olio EVO ligure", amount: { value: 8, unit: "ml" }, section: "superficie" },
      { name: "Prosciutto cotto artigianale Millefiori a fette", amount: { value: 60, unit: "g" }, notes: T, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "recco_cotto_fill",
        title: T,
        description: T,
        insert_at: "after_fill_internal",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "recco_cotto_post",
        title: T,
        description: T,
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
  },

  recco_pizzata_recipe: {
    id: "recco_pizzata_recipe",
    concept_ref: "recco_pizzata",
    thumbnail: thumbnailVariantReccoPizzata,
    preferred_for_styles: ["focaccia_recco"],
    compatible_layouts: ["double_thin_sheet"],
    ingredients: [
      { name: "Crescenza ligure fresca", amount: { value: 200, unit: "g" }, section: "ripieno" },
      { name: "Passata di pomodoro biologico", amount: { value: 60, unit: "g" }, section: "superficie" },
      { name: "Acciughe salate dissalate", amount: { value: 15, unit: "g" }, section: "superficie" },
      { name: "Olive taggiasche", amount: { value: 25, unit: "g" }, section: "superficie" },
      { name: "Capperi di Pantelleria dissalati", amount: { value: 10, unit: "g" }, section: "superficie" },
      { name: "Olio EVO ligure", amount: { value: 8, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "recco_pizzata_fill",
      title: T,
      description: T,
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  margherita_padellino: {
    id: "margherita_padellino",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaPadellino,
    preferred_for_styles: ["padellino_torino"],
    ingredients: [
      { name: "Passata di pomodoro pelato italiano (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_padellino",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  diavola_padellino: {
    id: "diavola_padellino",
    concept_ref: "diavola",
    preferred_for_styles: ["padellino_torino"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Salame piccante a fette", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Basilico fresco", amount: { value: 2, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_diavola_padellino",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  capricciosa_padellino: {
    id: "capricciosa_padellino",
    concept_ref: "capricciosa",
    preferred_for_styles: ["padellino_torino"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 85, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 95, unit: "g" }, section: "base" },
      { name: "Prosciutto cotto di alta qualità", amount: { value: 35, unit: "g" }, section: "base" },
      { name: "Funghi champignon freschi affettati", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Carciofini cotti sott'olio", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Olive nere", amount: { value: 20, unit: "g" }, section: "base" },
      { name: "Capperi e olio EVO", amount: { value: 8, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_capricciosa_padellino",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  tonno_cipolla_padellino: {
    id: "tonno_cipolla_padellino",
    concept_ref: "tonno_cipolla",
    preferred_for_styles: ["padellino_torino"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 95, unit: "g" }, section: "base" },
      { name: "Tonno sott'olio di qualità sgocciolato", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Cipolla rossa di Tropea affettata", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Origano e olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_tonno_padellino",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  gorgonzola_pere_padellino: {
    id: "gorgonzola_pere_padellino",
    concept_ref: "gorgonzola_pere",
    preferred_for_styles: ["padellino_torino"],
    authenticity: "signature",
    ingredients: [
      { name: "Mozzarella fior di latte fusa", amount: { value: 95, unit: "g" }, notes: T, section: "base" },
      { name: "Pere fresche dolci a fette sottili", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Gorgonzola DOP cremoso", amount: { value: 40, unit: "g" }, notes: T, section: "base" },
      { name: "Olio EVO", amount: { value: 4, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_gorgo_pere",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  margherita_trancio: {
    id: "margherita_trancio",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaTrancio,
    preferred_for_styles: ["trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte abbondante", amount: { value: 120, unit: "g" }, notes: T, section: "base" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_trancio",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  diavola_trancio: {
    id: "diavola_trancio",
    concept_ref: "diavola",
    preferred_for_styles: ["trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)",  components: ["pomodoro", "sale"],amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte abbondante", amount: { value: 120, unit: "g" }, section: "base" },
      { name: "Salame piccante a fette", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_diavola_trancio",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* ── Arricchimento Americana/Milanese (Detroit, Chicago, Tavern, Trancio) ── */

  /* Detroit — lineup Emmy Squared */
  hot_honey_detroit: {
    id: "hot_honey_detroit",
    concept_ref: "hot_honey",
    variant_name: T,
    preferred_for_styles: ["detroit"],
    authenticity: "signature",
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 220, unit: "g" }, notes: T, section: "crosta" },
      { name: "Salame pepperoni (Ezzo)", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Jalapeños stufati sotto aceto", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Salsa di pomodoro rossa a strisce", amount: { value: 90, unit: "g" }, notes: T, section: "superficie" },
      { name: "Miele piccante fuso", amount: { value: 15, unit: "g" }, notes: T, section: "superficie" },
    ],
    assembly_steps: [{
      id: "founders_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  hawaiiana_detroit: {
    id: "hawaiiana_detroit",
    concept_ref: "hawaiiana",
    variant_name: T,
    preferred_for_styles: ["detroit"],
    authenticity: "experimental",
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 200, unit: "g" }, notes: T, section: "crosta" },
      { name: "Salame pepperoni (Ezzo)", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Bacon affumicato croccante", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Ananas fresco a cubetti caramellato", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Glassa dolce al peperoncino", amount: { value: 12, unit: "g" }, notes: T, section: "superficie" },
    ],
    assembly_steps: [{
      id: "big_hawaiian_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  meat_lovers_detroit: {
    id: "meat_lovers_detroit",
    concept_ref: "meat_lovers",
    variant_name: T,
    preferred_for_styles: ["detroit"],
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 200, unit: "g" }, notes: T, section: "crosta" },
      { name: "Salame pepperoni (Ezzo)", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Salsiccia italiana sbriciolata", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Bacon affumicato croccante", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Straccetti di controfiletto di manzo", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Salsa di pomodoro rossa a strisce", amount: { value: 90, unit: "g" }, notes: T, section: "superficie" },
    ],
    assembly_steps: [{
      id: "meatsiah_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* Chicago Deep Dish — lineup Giordano's (strati invertiti) */
  supreme_chicago: {
    id: "supreme_chicago",
    concept_ref: "supreme",
    variant_name: T,
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 180, unit: "g" }, notes: T, section: "base" },
      { name: "Salsiccia fresca sbriciolata (senza nitrati)", amount: { value: 100, unit: "g" }, section: "ripieno" },
      { name: "Funghi champignon affettati", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Peperoni verdi dolci", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Cipolla bianca tritata", amount: { value: 30, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi (San Marzano)", amount: { value: 220, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "special_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  spinaci_chicago: {
    id: "spinaci_chicago",
    concept_ref: "spinaci",
    variant_name: T,
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 160, unit: "g" }, notes: T, section: "base" },
      { name: "Spinaci freschi al vapore", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Mix di quattro formaggi fondenti", amount: { value: 80, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi", amount: { value: 200, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spinach_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  meat_lovers_chicago: {
    id: "meat_lovers_chicago",
    concept_ref: "meat_lovers",
    variant_name: T,
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 170, unit: "g" }, notes: T, section: "base" },
      { name: "Salame pepperoni", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Salame milanese dolce", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Salsiccia fresca sbriciolata", amount: { value: 60, unit: "g" }, section: "ripieno" },
      { name: "Bacon affumicato croccante", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi", amount: { value: 200, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "meat_chicago_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  /* Chicago Tavern — base cracker, party cut */
  cheese_tavern: {
    id: "cheese_tavern",
    concept_ref: "cheese_pizza",
    variant_name: T,
    preferred_for_styles: ["chicago_tavern"],
    ingredients: [
      { name: "Salsa di pomodoro", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Origano secco", amount: { value: 1, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "tavern_cheese_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* Trancio Milanese — classici all'italiana */
  capricciosa_trancio: {
    id: "capricciosa_trancio",
    concept_ref: "capricciosa",
    preferred_for_styles: ["trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte abbondante", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Prosciutto cotto", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Funghi champignon", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Carciofini sottolio", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Olive nere", amount: { value: 20, unit: "g" }, section: "base" },
    ],
    assembly_steps: [{
      id: "capricciosa_trancio_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  prosciutto_funghi_trancio: {
    id: "prosciutto_funghi_trancio",
    concept_ref: "prosciutto_funghi",
    preferred_for_styles: ["trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte abbondante", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Prosciutto cotto a fette", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Funghi champignon affettati", amount: { value: 50, unit: "g" }, section: "base" },
    ],
    assembly_steps: [{
      id: "prosciutto_funghi_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  quattro_formaggi_trancio: {
    id: "quattro_formaggi_trancio",
    concept_ref: "quattro_formaggi",
    preferred_for_styles: ["trancio_milanese"],
    ingredients: [
      { name: "Mozzarella fior di latte", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Gorgonzola dolce", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Fontina", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Parmigiano grattugiato", amount: { value: 15, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "4formaggi_trancio_assembly",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },


  /* ═══ D-065 — catalogo italiano, tranche A: condimenti quotidiani ═══
   * Grammature di Vulcan per UNA unità dello stile (il motore le scala con
   * l'area e topping_scale). Napoletana: pelati e fior di latte come la
   * Capricciosa napoletana; romana: passata e fior di latte come la Capricciosa
   * romana. Gli ingredienti che il forno rovina vanno in «after_bake». */
  wurstel_patatine_classica: {
    id: "wurstel_patatine_classica",
    concept_ref: "wurstel_patatine",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "napoletana_canotto", "trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Würstel di suino (carne di suino, acqua, sale, spezie)", components: ["carne di suino", "acqua", "sale", "spezie"], amount: { value: 50, unit: "g" }, notes: T },
      { name: "Patatine fritte (patate, olio di semi di girasole, sale)", components: ["patate", "olio di semi di girasole", "sale"], amount: { value: 60, unit: "g" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "friggere_patatine_wurstel",
      title: T,
      description: T,
      duration_minutes: 12,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_wurstel_patatine",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }, {
      id: "finish_wurstel_patatine",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
    }],
  },

  prosciutto_cotto_napoletana: {
    id: "prosciutto_cotto_napoletana",
    concept_ref: "prosciutto_cotto",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a fette (carne di suino, sale, aromi)", components: ["carne di suino", "sale", "aromi"], amount: { value: 40, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_prosciutto_cotto_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },
  prosciutto_cotto_romana: {
    id: "prosciutto_cotto_romana",
    concept_ref: "prosciutto_cotto",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana", "trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a fette (carne di suino, sale, aromi)", components: ["carne di suino", "sale", "aromi"], amount: { value: 45, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_prosciutto_cotto_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  funghi_napoletana: {
    id: "funghi_napoletana",
    concept_ref: "funghi",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Funghi champignon saltati", amount: { value: 60, unit: "g" }, notes: T },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "saltare_champignon_funghi_nap",
      title: T,
      description: T,
      duration_minutes: 8,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_funghi_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },
  funghi_romana: {
    id: "funghi_romana",
    concept_ref: "funghi",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana", "trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Funghi champignon saltati", amount: { value: 70, unit: "g" }, notes: T },
      { name: "Aglio e prezzemolo", components: ["aglio", "prezzemolo"], amount: { value: 3, unit: "g" }, notes: T },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "saltare_champignon_funghi_rom",
      title: T,
      description: T,
      duration_minutes: 12,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_funghi_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  napoli_romana: {
    id: "napoli_romana",
    concept_ref: "napoli",
    variant_name: T,
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Filetti di acciuga sott'olio (acciughe, olio di oliva, sale)", components: ["acciughe", "olio di oliva", "sale"], amount: { value: 15, unit: "g" } },
      { name: "Origano secco", amount: { value: 1, unit: "g" } },
      { name: "Capperi dissalati", amount: { value: 5, unit: "g" }, optional: true },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_napoli_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },
  napoli_napoletana: {
    id: "napoli_napoletana",
    concept_ref: "napoli",
    variant_name: T,
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 70, unit: "g" } },
      { name: "Filetti di alici sott'olio (alici, olio di oliva, sale)", components: ["alici", "olio di oliva", "sale"], amount: { value: 15, unit: "g" } },
      { name: "Origano secco", amount: { value: 1, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_napoli_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  parmigiana_napoletana: {
    id: "parmigiana_napoletana",
    concept_ref: "parmigiana",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 70, unit: "g" } },
      { name: "Provola affumicata", amount: { value: 70, unit: "g" }, notes: T },
      { name: "Melanzane fritte (melanzane, olio di semi di girasole, sale)", components: ["melanzane", "olio di semi di girasole", "sale"], amount: { value: 80, unit: "g" }, notes: T },
      { name: "Parmigiano Reggiano grattugiato", amount: { value: 8, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "friggere_melanzane_parmigiana",
      title: T,
      description: T,
      duration_minutes: 30,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_parmigiana_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },
  parmigiana_romana: {
    id: "parmigiana_romana",
    concept_ref: "parmigiana",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Melanzane fritte (melanzane, olio di semi di girasole, sale)", components: ["melanzane", "olio di semi di girasole", "sale"], amount: { value: 90, unit: "g" }, notes: T },
      { name: "Parmigiano Reggiano grattugiato", amount: { value: 10, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "friggere_melanzane_parmigiana_rom",
      title: T,
      description: T,
      duration_minutes: 30,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_parmigiana_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  norma_napoletana: {
    id: "norma_napoletana",
    concept_ref: "norma",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 60, unit: "g" } },
      { name: "Melanzane fritte a cubetti (melanzane, olio di semi di girasole, sale)", components: ["melanzane", "olio di semi di girasole", "sale"], amount: { value: 70, unit: "g" }, notes: T },
      { name: "Ricotta salata grattugiata", amount: { value: 15, unit: "g" }, notes: T },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "friggere_melanzane_norma",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_norma_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }, {
      id: "finish_norma_nap",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
      tip: TIP,
    }],
  },
  norma_romana: {
    id: "norma_romana",
    concept_ref: "norma",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 60, unit: "g" } },
      { name: "Melanzane fritte a cubetti (melanzane, olio di semi di girasole, sale)", components: ["melanzane", "olio di semi di girasole", "sale"], amount: { value: 80, unit: "g" }, notes: T },
      { name: "Ricotta salata grattugiata", amount: { value: 15, unit: "g" }, notes: T },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "friggere_melanzane_norma_rom",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_norma_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }, {
      id: "finish_norma_rom",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
    }],
  },

  bufalina_napoletana: {
    id: "bufalina_napoletana",
    concept_ref: "bufalina",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 80, unit: "g" } },
      { name: "Mozzarella di bufala campana DOP", amount: { value: 80, unit: "g" }, notes: T },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "sgocciolare_bufala_nap",
      title: T,
      description: T,
      duration_minutes: 60,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_bufalina_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },
  bufalina_romana: {
    id: "bufalina_romana",
    concept_ref: "bufalina",
    variant_name: T,
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 90, unit: "g" } },
      { name: "Mozzarella di bufala campana DOP", amount: { value: 90, unit: "g" }, notes: T },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: T },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_bufalina_rom",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 2,
      replaces_generic: true,
    }, {
      id: "finish_bufalina_rom",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 2,
      tip: TIP,
    }],
  },

  /* ═══ D-065 — tranche A2: condimenti con una fase delicata ═══
   * Stesse basi della tranche A1 (pelati e fior di latte sulla napoletana,
   * passata e fior di latte sulla romana). Le fasi usano solo ciò che il
   * motore ha già: «after_shape» prima del forno, «after_bake» all'uscita,
   * description_short_bake quando la cottura breve cambia il gesto. «Negli
   * ultimi minuti» non è un punto della timeline: lo dice il testo del passo
   * prima della cottura (come il prosciutto cotto della tranche A1). */
  pugliese_napoletana: {
    id: "pugliese_napoletana",
    concept_ref: "pugliese",
    variant_name: T,
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati schiacciati a mano (pomodoro, succo di pomodoro)", components: ["pomodoro", "succo di pomodoro"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 70, unit: "g" } },
      { name: "Cipolla bianca stufata", amount: { value: 60, unit: "g" }, notes: T },
      { name: "Origano secco", amount: { value: 1, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "stufare_cipolla_pugliese",
      title: T,
      description: T,
      duration_minutes: 15,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_pugliese_nap",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },
  pugliese_romana: {
    id: "pugliese_romana",
    concept_ref: "pugliese",
    variant_name: T,
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana", "trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Cipolla bianca a velo", amount: { value: 50, unit: "g" }, notes: T },
      { name: "Origano secco", amount: { value: 1, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_pugliese_rom",
      title: T,
      description: T,
      description_short_bake: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  crudaiola_classica: {
    id: "crudaiola_classica",
    concept_ref: "crudaiola",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro", "tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Pomodorini freschi", amount: { value: 80, unit: "g" }, notes: T },
      { name: "Sale fino sui pomodorini", amount: { value: 1, unit: "g" } },
      { name: "Rucola", amount: { value: 15, unit: "g" }, notes: T },
      { name: "Parmigiano Reggiano a scaglie", amount: { value: 10, unit: "g" }, notes: T },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "condire_pomodorini_crudaiola",
      title: T,
      description: T,
      duration_minutes: 5,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_crudaiola",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 2,
      replaces_generic: true,
    }, {
      id: "finish_crudaiola",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 2,
      tip: TIP,
    }],
  },

  tirolese_classica: {
    id: "tirolese_classica",
    concept_ref: "tirolese",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "napoletana_canotto", "trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Speck a fette (carne di suino, sale, spezie)", components: ["carne di suino", "sale", "spezie"], amount: { value: 40, unit: "g" }, notes: T },
    ],
    assembly_steps: [{
      id: "spread_tirolese",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }, {
      id: "finish_tirolese",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
      tip: TIP,
    }],
  },

  bismarck_classica: {
    id: "bismarck_classica",
    concept_ref: "bismarck",
    preferred_for_styles: ["tonda_romana", "pala_romana", "napoletana_canotto", "trancio_milanese"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a fette (carne di suino, sale, aromi)", components: ["carne di suino", "sale", "aromi"], amount: { value: 40, unit: "g" } },
      { name: "Uovo", amount: { value: 1, unit: "pcs" }, notes: T },
    ],
    assembly_steps: [{
      id: "spread_bismarck",
      title: T,
      description: T,
      description_short_bake: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  mimosa_classica: {
    id: "mimosa_classica",
    concept_ref: "mimosa",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "napoletana_canotto", "trancio_milanese"],
    ingredients: [
      { name: "Panna fresca", amount: { value: 40, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a dadini (carne di suino, sale, aromi)", components: ["carne di suino", "sale", "aromi"], amount: { value: 40, unit: "g" } },
      { name: "Mais dolce sgocciolato", amount: { value: 40, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_mimosa",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: TIP,
    }],
  },

  lucana_classica: {
    id: "lucana_classica",
    concept_ref: "lucana",
    preferred_for_styles: ["napoletana_canotto", "tonda_romana", "teglia_romana", "pala_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Salsiccia lucanica a pezzetti (carne di suino, sale, peperone dolce, finocchietto)", components: ["carne di suino", "sale", "peperone dolce", "finocchietto"], amount: { value: 50, unit: "g" }, notes: T },
      { name: "Peperoni cruschi (peperoni dolci essiccati, olio di semi di girasole)", components: ["peperoni dolci essiccati", "olio di semi di girasole"], amount: { value: 6, unit: "g" }, notes: T },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "friggere_cruschi_lucana",
      title: T,
      description: T,
      duration_minutes: 10,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_lucana",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }, {
      id: "finish_lucana",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
      tip: TIP,
    }],
  },

  rossini_classica: {
    id: "rossini_classica",
    concept_ref: "rossini",
    preferred_for_styles: ["tonda_romana", "teglia_romana", "pala_romana", "napoletana_canotto"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", components: ["pomodoro", "sale"], amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Uovo sodo", amount: { value: 1, unit: "pcs" }, notes: T },
      { name: "Maionese (olio di semi di girasole, uova, aceto, succo di limone, sale)", components: ["olio di semi di girasole", "uova", "aceto", "succo di limone", "sale"], amount: { value: 25, unit: "g" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "rassodare_uova_rossini",
      title: T,
      description: T,
      duration_minutes: 15,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_rossini",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }, {
      id: "finish_rossini",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 2,
      tip: TIP,
    }],
  },

  patate_lardo_romana: {
    id: "patate_lardo_romana",
    concept_ref: "patate_lardo",
    preferred_for_styles: ["teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Patate gialle a fette sottili", amount: { value: 160, unit: "g" } },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: T },
      { name: "Olio EVO", amount: { value: 10, unit: "ml" } },
      { name: "Lardo a fette sottili (lardo di suino, sale, pepe, aromi)", components: ["lardo di suino", "sale", "pepe", "aromi"], amount: { value: 30, unit: "g" }, notes: T },
      { name: "Fior di sale", amount: { value: 1, unit: "g" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "patate_mandolina_lardo",
      title: T,
      description: T,
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_patate_lardo",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }, {
      id: "finish_patate_lardo",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
      tip: TIP,
    }],
    bake_adjustments: {
      additional_minutes: 4,
      note: T,
    },
  },

  gamberetti_zucchine_classica: {
    id: "gamberetti_zucchine_classica",
    concept_ref: "gamberetti_zucchine",
    preferred_for_styles: ["napoletana_canotto", "tonda_romana", "teglia_romana", "pala_romana", "pinsa_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 70, unit: "g" } },
      { name: "Zucchine a rondelle sottili", amount: { value: 80, unit: "g" } },
      { name: "Gamberetti sgusciati", amount: { value: 60, unit: "g" }, notes: T },
      { name: "Aglio e prezzemolo", components: ["aglio", "prezzemolo"], amount: { value: 3, unit: "g" } },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" }, notes: T },
    ],
    pre_prep_steps: [{
      id: "saltare_gamberetti_zucchine",
      title: T,
      description: T,
      duration_minutes: 10,
      timing: "just_before_assembly",
      tip: TIP,
    }],
    assembly_steps: [{
      id: "spread_gamberetti_zucchine",
      title: T,
      description: T,
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }, {
      id: "finish_gamberetti_zucchine",
      title: T,
      description: T,
      insert_at: "after_bake",
      duration_minutes: 1,
    }],
  },
};

/* ═══ Testi per lingua (budget D-059, 31/10/2026) ═══
 * I segnaposto T e TIP diventano getter sul catalogo della lingua attiva
 * (topping-i18n/registry.ts; l'italiano è topping-i18n/it.ts). Restano al
 * loro posto nei letterali perché dicono quali testi esistono (la variante
 * per le cotture brevi, il consiglio, la nota di cottura) e tengono l'ordine
 * delle chiavi delle risposte MCP. Chi aggiunge un condimento scrive qui la
 * struttura con T / TIP e il testo in it.ts e nelle altre lingue. */
function bindText<O extends object>(obj: O, key: string, read: (texts: ToppingTranslation) => string | undefined): void {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: () => toppingText(read),
    /* Un'assegnazione esplicita (test, strumenti) torna a un valore semplice. */
    set(value: unknown) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    },
  });
}

function bindStepTexts(step: { id: string; title: string; description: string; description_short_bake?: string; description_no_pan_proof?: string; description_after_pan_proof?: string; tip?: { beginner: string; nerd: string } }): void {
  const st = (texts: ToppingTranslation) => texts.steps[step.id];
  if (step.title === T) bindText(step, "title", (x) => st(x)?.title);
  if (step.description === T) bindText(step, "description", (x) => st(x)?.description);
  if (step.description_short_bake === T) bindText(step, "description_short_bake", (x) => st(x)?.description_short_bake);
  if (step.description_no_pan_proof === T) bindText(step, "description_no_pan_proof", (x) => st(x)?.description_no_pan_proof);
  if (step.description_after_pan_proof === T) bindText(step, "description_after_pan_proof", (x) => st(x)?.description_after_pan_proof);
  if (step.tip === TIP) {
    Object.defineProperty(step, "tip", {
      enumerable: true,
      configurable: true,
      get: () => ({ beginner: toppingText((x) => st(x)?.tip_beginner), nerd: toppingText((x) => st(x)?.tip_nerd) }),
      set(value: unknown) {
        Object.defineProperty(step, "tip", { value, enumerable: true, configurable: true, writable: true });
      },
    });
  }
}

for (const [id, concept] of Object.entries(TOPPING_CONCEPTS)) {
  if (concept.description === T) bindText(concept, "description", (x) => x.concepts[id]?.description);
}
for (const [id, recipe] of Object.entries(TOPPING_LIBRARY)) {
  const rt = (texts: ToppingTranslation) => texts.recipes[id];
  if (recipe.variant_name === T) bindText(recipe, "variant_name", (x) => rt(x)?.variant_name);
  if (recipe.bake_adjustments?.note === T) bindText(recipe.bake_adjustments, "note", (x) => rt(x)?.bake_note);
  recipe.ingredients.forEach((ingredient, index) => {
    if (ingredient.notes === T) bindText(ingredient, "notes", (x) => rt(x)?.ingredients?.[String(index)]?.notes);
  });
  for (const step of recipe.pre_prep_steps ?? []) bindStepTexts(step);
  for (const step of recipe.assembly_steps ?? []) bindStepTexts(step);
}

export function resolveTopping(
  conceptId: string,
  style: PizzaStyle,
): ToppingRecipe | undefined {
  /* Per-stile, punto: la variante di un concept per uno stile è SOLO quella
   * esplicitamente assegnata a quello stile (preferred_for_styles). Niente
   * fallback per famiglia o "generico": ogni stile ha i suoi condimenti. */
  const recipe = Object.values(TOPPING_LIBRARY).find(
    (r) =>
      r.concept_ref === conceptId &&
      (r.preferred_for_styles?.includes(style.id) ?? false) &&
      !r.taboo_for_styles?.includes(style.id),
  );
  return recipe && toppingForSelectedStyle(recipe, style);
}

/** Keep the catalog, generated timeline and translated detail on the same method. */
function toppingForSelectedStyle(recipe: ToppingRecipe, style: PizzaStyle): ToppingRecipe {
  if (!recipe.assembly_steps?.some(step => step.for_styles)) return recipe;
  return { ...recipe, assembly_steps: recipe.assembly_steps.filter(step => !step.for_styles || step.for_styles.includes(style.id)) };
}

/* ═══ API esistenti (backward compat) ═══ */

/** Risolve un topping per ID nel contesto di uno Style.
 *  Se ID è un concept, usa il resolver per scegliere la variante giusta.
 *  Se ID è una recipe specifica, ritorna quella. */
/** C-2: dosi moltiplicate per `style.topping_scale` (pizza al metro). Grammi e
 *  millilitri all'unità, pezzi al mezzo; la ricetta originale non cambia. */
export function scaleToppingAmounts(recipe: ToppingRecipe, scale: number | undefined): ToppingRecipe {
  if (!scale || scale === 1) return recipe;
  const round = (value: number, unit: string) =>
    unit === "g" || unit === "ml" ? Math.round(value * scale * 10) / 10 : Math.max(1, Math.round(value * scale * 2) / 2);
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      amount: { ...ing.amount, value: round(ing.amount.value, ing.amount.unit) },
    })),
  };
}

export function getToppingForStyle(
  id: string,
  style: PizzaStyle,
): ToppingRecipe | undefined {
  // 1. Match diretto su recipe id (priorità: l'utente ha scelto esplicitamente)
  const direct = TOPPING_LIBRARY[id];
  if (direct) return direct.layout_override && !direct.preferred_for_styles?.includes(style.id) ? undefined : toppingForSelectedStyle(direct, style);

  // 2. Match su concept id → resolver intelligente
  if (TOPPING_CONCEPTS[id]) {
    return resolveTopping(id, style);
  }

  return undefined;
}

function getAllToppings(): ToppingRecipe[] {
  return Object.values(TOPPING_LIBRARY);
}

export function getToppingThumbnail(recipe?: ToppingRecipe): string | undefined {
  return recipe?.thumbnail ?? (recipe ? TOPPING_CONCEPTS[recipe.concept_ref]?.thumbnail : undefined);
}

/** Tutte le varianti per un concept. Utile per debug e per UI "vedi varianti". */
export function getVariantsForConcept(conceptId: string): ToppingRecipe[] {
  return getAllToppings().filter((t) => t.concept_ref === conceptId);
}

/* ═══ Pairing Engine — Sprint 12 Fase 3 ═══ */

export type AuthenticityScore =
  | "canonical"     // 🟢 "Da disciplinare" — SOLO disciplinari ufficiali (AVPN, IGP, DOP, De.Co.)
  | "natural"       // 🟢 "Tradizionale" — classico consolidato per lo stile/famiglia
  | "signature"     // 🟡 "Specialità" — firma moderna/gourmet/d'autore (non un canone)
  | "common"        // ⚪️ "Alternativa" — fallback generico non ancorato allo stile
  | "experimental"  // 🟠 "Da provare" — variante esistente ma per altri stili/famiglie
  | "taboo";        // 🔴 — esplicito taboo (style o family)

/** Metadata visiva per ogni livello di autenticità (color/icona/label).
 *  Usata dai chip nella UI per coerenza di linguaggio visivo. */
export const AUTHENTICITY_META: Record<
  AuthenticityScore,
  { label: string; icon: string; hue: "green" | "amber" | "orange" | "red" | "gray" }
> = {
  canonical: { label: "Da disciplinare", icon: "", hue: "green" },
  natural: { label: "Tradizionale", icon: "", hue: "green" },
  signature: { label: "Specialità", icon: "", hue: "amber" },
  common: { label: "Alternativa", icon: "", hue: "gray" },
  experimental: { label: "Da provare", icon: "", hue: "orange" },
  taboo: { label: "Sconsigliato", icon: "", hue: "red" },
};

const AUTHENTICITY_ORDER: Record<AuthenticityScore, number> = {
  canonical: 0,
  natural: 1,
  signature: 2,
  common: 3,
  experimental: 4,
  taboo: 5,
};

const REPRESENTATIVE_ORDER_MISS = 1_000;

/** Prior culturale del carousel: i condimenti piu rappresentativi dello stile
 * devono comparire prima, indipendentemente dall'ordine fisico della libreria. */
const REPRESENTATIVE_CONCEPT_ORDER_BY_STYLE: Record<string, readonly string[]> = {
  napoletana_stg: [
    "margherita",
    "marinara",
    "cosacca",
    "salsiccia_friarielli",
    "diavola",
    "boscaiola",
    "provola_pepe",
    "nduja",
    "montanara",
  ],
  napoletana_canotto: [
    "margherita",
    "margherita_sbagliata",
    "marinara",
    "scarpetta",
    "nerano",
    "salsiccia_friarielli",
    "diavola",
    "nduja",
  ],
  pizza_al_metro: [
    "margherita",
    "marinara",
    "salsiccia_friarielli",
    "diavola",
    "boscaiola",
  ],
  teglia_romana: [
    "margherita",
    "marinara",
    "bianca",
    "patate_rosmarino",
    "boscaiola",
    "capricciosa",
    "quattro_stagioni",
    "quattro_formaggi",
    "ortolana",
    "bianca_mortazza",
    "cacio_e_pepe",
  ],
  tonda_romana: [
    "margherita",
    "marinara",
    "capricciosa",
    "quattro_stagioni",
    "boscaiola",
    "quattro_formaggi",
    "ortolana",
    "patate_rosmarino",
  ],
  pinsa_romana: [
    "margherita",
    "marinara",
    "bianca",
    "ortolana",
    "quattro_formaggi",
    "capricciosa",
    "boscaiola",
  ],
  pala_romana: [
    "bianca_mortazza",
    "bianca",
    "margherita",
    "marinara",
    "patate_rosmarino",
    "boscaiola",
    "capricciosa",
    "stracciata_bottarga",
  ],
  focaccia_genovese: ["bianca", "focaccia_cipolle", "sardenaira"],
  sfincione: ["sfincione", "sfincione_bianco"],
  focaccia_recco: [
    "crescenza_recco",
    "recco_pizzata",
    "recco_cotto",
    "recco_culatello",
    "nduja",
  ],
  padellino_torino: [
    "margherita",
    "quattro_formaggi",
    "prosciutto_funghi",
    "gorgonzola_pere",
    "spinaci",
  ],
  pizza_baciata: ["patate_porchetta"],
  ciaccino_senese: ["ciaccino"],
  pizza_spaccata: ["bianca_mortazza", "crudo"],
  trancio_milanese: [
    "margherita",
    "prosciutto_funghi",
    "quattro_formaggi",
    "capricciosa",
  ],
  new_york: [
    "margherita",
    "cheese_pizza",
    "diavola",
    "supreme",
    "white_pizza",
    "vodka_pizza",
    "hawaiiana",
  ],
  grandma_style: [
    "margherita",
    "cheese_pizza",
    "tomato_pie",
    "diavola",
    "supreme",
    "hawaiiana",
  ],
  chicago_tavern: [
    "cheese_pizza",
    "diavola",
    "supreme",
    "italian_beef",
    "white_pizza",
  ],
  detroit: ["detroit", "hot_honey", "vodka_pizza", "meat_lovers", "hawaiiana"],
  chicago_deep: ["chicago", "supreme", "italian_beef", "meat_lovers", "spinaci"],
  focaccia_barese: ["focaccia_barese"],
  pizza_fritta: ["pizza_fritta", "ricotta_cicoli"],
  pizza_fritta_tonda: ["pizza_fritta", "ricotta_cicoli"],
  pizza_montanara: ["montanara"],
  calzone_napoletano: ["calzone", "ricotta_cicoli", "scarola"],
  new_haven_apizza: ["white_clam", "tomato_pie"],
  fugazzeta: ["fugazzeta", "fugazza"],
  california_style: ["bbq_chicken", "margherita", "smoked_salmon", "hawaiiana"],
  greek_pan: ["greek_feta", "cheese_pizza", "diavola", "ortolana"],
  teglia_in_giornata: ["margherita"],
};

const REPRESENTATIVE_CONCEPT_ORDER_BY_FAMILY: Partial<Record<FamilyId, readonly string[]>> = {
  napoletana: ["margherita", "marinara", "diavola", "salsiccia_friarielli"],
  romana: ["margherita", "marinara", "bianca", "capricciosa", "boscaiola"],
  americana: ["cheese_pizza", "diavola", "supreme", "margherita"],
  contemporanea: ["bianca", "margherita"],
  regionale: ["bianca", "margherita"], // FW-14: come prima, quando erano «contemporanea»
};

function conceptOrderIndex(
  conceptId: string,
  concepts: readonly string[] | undefined,
): number {
  if (!concepts) return REPRESENTATIVE_ORDER_MISS;
  const index = concepts.indexOf(conceptId);
  return index >= 0 ? index : REPRESENTATIVE_ORDER_MISS;
}

function representativeOrder(
  recipe: ToppingRecipe,
  style: PizzaStyle,
  defaultTopping: ToppingRecipe | undefined,
): number {
  if (defaultTopping?.id === recipe.id) return -2;
  if (defaultTopping?.concept_ref === recipe.concept_ref) return -1;

  const styleOrder = conceptOrderIndex(
    recipe.concept_ref,
    REPRESENTATIVE_CONCEPT_ORDER_BY_STYLE[style.id],
  );
  if (styleOrder !== REPRESENTATIVE_ORDER_MISS) return styleOrder;

  return conceptOrderIndex(
    recipe.concept_ref,
    REPRESENTATIVE_CONCEPT_ORDER_BY_FAMILY[style.family],
  );
}

export function getRecipesByAuthenticity(style: PizzaStyle, { prioritizeDefault = true }: { prioritizeDefault?: boolean } = {}): Array<{
  recipe: ToppingRecipe;
  authenticity: AuthenticityScore;
}> {
  /* R30 (layout-aware): gli stili farciti/chiusi accettano solo topping pensati
     per quel layout. Un topping "da superficie" (margherita, boscaiola…) su un
     ciaccino sigillato o una focaccia di Recco è fuori contesto: lo si tiene
     fuori dai "featured" declassandolo a experimental. */
  /* Per-stile, punto: la lista condimenti di uno stile è ESATTAMENTE l'insieme
     delle ricette assegnate a quello stile (preferred_for_styles). Nessun
     fallback per famiglia o "generico": la boscaiola romana NON sborda sulla
     focaccia genovese. L'autenticità è solo un tag per ordinamento/ricerca. */
  const SEALED_LAYOUTS = new Set<LayoutType>(["closed_stuffed", "double_thin_sheet"]);
  const styleLayout = (style.reference_layout ?? style.layout)?.type as LayoutType | undefined;
  const layoutIncompatible = (recipe: ToppingRecipe): boolean => {
    if (!styleLayout) return false;
    if (recipe.layout_override) return !recipe.preferred_for_styles?.includes(style.id);
    if (recipe.compatible_layouts) return !recipe.compatible_layouts.includes(styleLayout);
    return SEALED_LAYOUTS.has(styleLayout);
  };
  const defaultTopping = prioritizeDefault && style.default_topping_ref
    ? getToppingForStyle(style.default_topping_ref, style)
    : undefined;
  return Object.values(TOPPING_LIBRARY)
    .map((recipe, sourceIndex) => ({ recipe, sourceIndex }))
    .filter(
      ({ recipe }) =>
        (recipe.preferred_for_styles?.includes(style.id) ?? false) &&
        !recipe.taboo_for_styles?.includes(style.id) &&
        !layoutIncompatible(recipe),
    )
    .map(({ recipe, sourceIndex }) => ({
      recipe,
      authenticity: recipe.authenticity_by_style?.[style.id] ?? recipe.authenticity ?? "natural",
      representativeOrder: representativeOrder(recipe, style, defaultTopping),
      preferredStyleOrder: recipe.preferred_for_styles?.indexOf(style.id) ?? REPRESENTATIVE_ORDER_MISS,
      sourceIndex,
    }))
    .sort(
      (a, b) =>
        a.representativeOrder - b.representativeOrder ||
        AUTHENTICITY_ORDER[a.authenticity] - AUTHENTICITY_ORDER[b.authenticity] ||
        a.preferredStyleOrder - b.preferredStyleOrder ||
        a.sourceIndex - b.sourceIndex,
    )
    .map(({ recipe, authenticity }) => ({ recipe: toppingForSelectedStyle(recipe, style), authenticity }));
}
