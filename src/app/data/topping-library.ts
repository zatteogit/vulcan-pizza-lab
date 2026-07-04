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
import type { FamilyId, LayoutType, PizzaStyle } from "../domain/pizza-engine";
import thumbnailMargherita from "../../assets/toppings/topping_margherita.jpg";
import thumbnailMarinara from "../../assets/toppings/topping_marinara.png";
import thumbnailBianca from "../../assets/toppings/topping_bianca.png";
import thumbnailBoscaiola from "../../assets/toppings/topping_boscaiola.png";
import thumbnailDiavola from "../../assets/toppings/topping_diavola.png";
import thumbnailCapricciosa from "../../assets/toppings/topping_capricciosa.png";
import thumbnailQuattroStagioni from "../../assets/toppings/topping_4stagioni.jpg";
import thumbnail4Formaggi from "../../assets/toppings/topping_4formaggi.png";
import thumbnailOrtolana from "../../assets/toppings/topping_ortolana.png";
import thumbnailPatatePorchetta from "../../assets/toppings/topping_patateporchetta.png";
import thumbnailBiancaMortazza from "../../assets/toppings/topping_mortadellapistacchio.png";
import thumbnailCacioPepe from "../../assets/toppings/topping_cacioepepe.png";
import thumbnailSalsicciaFriarielli from "../../assets/toppings/topping_friarellisalsiccia.png";
import thumbnailHawaiiana from "../../assets/toppings/topping_hawaiiana.jpg";
import thumbnailCrescenzaRecco from "../../assets/toppings/topping_crescenzarecco.jpg";
import thumbnailCrudo from "../../assets/toppings/topping_crudo.jpg";
import thumbnailReccoCulatello from "../../assets/toppings/topping_reccoculatello.jpg";
import thumbnailReccoCotto from "../../assets/toppings/topping_reccocotto.jpg";
import thumbnailReccoPizzata from "../../assets/toppings/topping_reccopizzata.jpg";
import thumbnailSfincione from "../../assets/toppings/topping_sfincione.jpg";
import thumbnailFocacciaBarese from "../../assets/toppings/topping_focacciabarese.jpg";
import thumbnailFugazzeta from "../../assets/toppings/topping_fugazzeta.jpg";
import thumbnailDetroitPepperoni from "../../assets/toppings/topping_detroitpepperoni.jpg";
import thumbnailChicago from "../../assets/toppings/topping_chicago.jpg";
import thumbnailMontanara from "../../assets/toppings/topping_montanara.jpg";
import thumbnailPizzaFritta from "../../assets/toppings/topping_pizzafritta.jpg";
import thumbnailCalzone from "../../assets/toppings/topping_calzone.jpg";
import thumbnailCiaccino from "../../assets/toppings/topping_ciaccino.jpg";
import thumbnailWhiteClam from "../../assets/toppings/topping_whiteclam.jpg";
import thumbnailCosacca from "../../assets/toppings/topping_cosacca.jpg";
import thumbnailProvolaPepe from "../../assets/toppings/topping_provolapepe.jpg";
import thumbnailNduja from "../../assets/toppings/topping_nduja.jpg";
import thumbnailNerano from "../../assets/toppings/topping_nerano.jpg";
import thumbnailMargheritaSbagliata from "../../assets/toppings/topping_margheritasbagliata.jpg";
import thumbnailScarpetta from "../../assets/toppings/topping_scarpetta.jpg";
import thumbnailPatateRosmarino from "../../assets/toppings/topping_pataterosmarino.jpg";
import thumbnailHotHoney from "../../assets/toppings/topping_hothoney.jpg";
import thumbnailBresaolaRucola from "../../assets/toppings/topping_bresaolarucola.jpg";
import thumbnailStracciataBottarga from "../../assets/toppings/topping_stracciatabottarga.jpg";
import thumbnailCheesePizza from "../../assets/toppings/topping_cheesepizza.jpg";
import thumbnailSupreme from "../../assets/toppings/topping_supreme.jpg";
import thumbnailWhitePizza from "../../assets/toppings/topping_whitepizza.jpg";
import thumbnailVodkaPizza from "../../assets/toppings/topping_vodkapizza.jpg";
import thumbnailBbqChicken from "../../assets/toppings/topping_bbqchicken.jpg";
import thumbnailSmokedSalmon from "../../assets/toppings/topping_smokedsalmon.jpg";
import thumbnailItalianBeef from "../../assets/toppings/topping_italianbeef.jpg";
import thumbnailTomatoPie from "../../assets/toppings/topping_tomatopie.jpg";
import thumbnailGreekFeta from "../../assets/toppings/topping_greekfeta.jpg";
import thumbnailZuccaSpeck from "../../assets/toppings/topping_zuccaspeck.jpg";
import thumbnailBurrataSalmone from "../../assets/toppings/topping_burratasalmone.jpg";
import thumbnailFocacciaCipolle from "../../assets/toppings/topping_focacciacipolle.jpg";
import thumbnailSardenaira from "../../assets/toppings/topping_sardenaira.jpg";
import thumbnailSfincioneBianco from "../../assets/toppings/topping_sfincionebianco.jpg";
import thumbnailGorgonzolaPere from "../../assets/toppings/topping_gorgonzolapere.jpg";
import thumbnailTonnoCipolla from "../../assets/toppings/topping_tonnocipolla.jpg";
import thumbnailScarola from "../../assets/toppings/topping_scarola.jpg";
import thumbnailFugazza from "../../assets/toppings/topping_fugazza.jpg";
import thumbnailRicottaCicoli from "../../assets/toppings/topping_ricottacicoli.jpg";
import thumbnailMeatLovers from "../../assets/toppings/topping_meatlovers.jpg";
import thumbnailSpinaci from "../../assets/toppings/topping_spinaci.jpg";
import thumbnailProsciuttoFunghi from "../../assets/toppings/topping_prosciuttofunghi.jpg";
import thumbnailVariantMargheritaAvpn from "../../assets/toppings/variants/margherita_napoletana_avpn.jpg";
import thumbnailVariantMargheritaRomana from "../../assets/toppings/variants/margherita_romana.jpg";
import thumbnailVariantMargheritaAmericana from "../../assets/toppings/variants/margherita_americana.jpg";
import thumbnailVariantMargheritaNewYork from "../../assets/toppings/variants/margherita_new_york.jpg";
import thumbnailVariantMargheritaGrandma from "../../assets/toppings/variants/margherita_grandma.jpg";
import thumbnailVariantMargheritaPadellino from "../../assets/toppings/variants/margherita_padellino.jpg";
import thumbnailVariantMargheritaTrancio from "../../assets/toppings/variants/margherita_trancio.jpg";
import thumbnailVariantPatatePorchettaBaciata from "../../assets/toppings/variants/patate_porchetta_baciata.jpg";
import thumbnailVariantCrudoSpaccata from "../../assets/toppings/variants/crudo_spaccata.jpg";
import thumbnailVariantBiancaMortazzaRomana from "../../assets/toppings/variants/bianca_mortazza_romana.jpg";
import thumbnailVariantPatatePorchettaSancho from "../../assets/toppings/variants/patate_porchetta_sancho.jpg";
import thumbnailVariantFugazzetaRellena from "../../assets/toppings/variants/fugazzeta_rellena.jpg";
import thumbnailVariantCalzoneScarola from "../../assets/toppings/variants/calzone_scarola.jpg";
import thumbnailVariantCalzoneRicottaCicoli from "../../assets/toppings/variants/calzone_ricotta_cicoli.jpg";
import thumbnailVariantReccoNduja from "../../assets/toppings/variants/recco_nduja.jpg";
import thumbnailVariantReccoCulatello from "../../assets/toppings/variants/recco_culatello.jpg";
import thumbnailVariantReccoCotto from "../../assets/toppings/variants/recco_cotto.jpg";
import thumbnailVariantReccoPizzata from "../../assets/toppings/variants/recco_pizzata.jpg";

export type IngredientSection = "ripieno" | "base" | "crosta" | "superficie";

export interface ToppingIngredient {
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
  | "after_shape"        // dopo stesura, prima della cottura
  | "after_stack"        // tra sovrapposizione e cottura (per layout stacked)
  | "after_fill_internal" // dopo ripieno+sigillatura (per closed_stuffed)
  | "after_bake"         // dopo prima cottura
  | "after_split_fill"   // dopo sdoppiamento (sostituisce farcitura generica)
  | "after_bake2";       // dopo seconda cottura

interface ToppingAssemblyStep {
  id: string;
  title: string;
  description: string;
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

interface ToppingConcept {
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
    description: "Pomodoro, mozzarella, basilico. La regina, l'origine, l'evergreen.",
    emoji: "🍅",
    thumbnail: thumbnailMargherita,
    flavor_profile: "fresh",
    occasions: ["sempre", "classico", "cena famiglia"],
  },
  marinara: {
    id: "marinara",
    name: "Marinara",
    description: "Pomodoro, aglio, origano, olio. Niente formaggio, gusto puro mediterraneo.",
    emoji: "🌿",
    thumbnail: thumbnailMarinara,
    flavor_profile: "fresh",
    occasions: ["vegano", "asciutta", "estate"],
  },
  bianca: {
    id: "bianca",
    name: "Bianca",
    description: "Olio e sale, eventualmente rosmarino. Base per panini o assaggio crosta.",
    emoji: "🌾",
    thumbnail: thumbnailBianca,
    flavor_profile: "light",
    occasions: ["aperitivo", "antipasto", "pane sostitutivo"],
  },
  boscaiola: {
    id: "boscaiola",
    name: "Boscaiola",
    description: "Funghi e salsiccia con formaggio. Comfort autunnale.",
    emoji: "🍄",
    thumbnail: thumbnailBoscaiola,
    flavor_profile: "earthy",
    occasions: ["autunno", "comfort", "cena"],
  },
  diavola: {
    id: "diavola",
    name: "Diavola",
    description: "Mozzarella e salame piccante. Per chi ama il fuoco.",
    emoji: "🌶️",
    thumbnail: thumbnailDiavola,
    flavor_profile: "spicy",
    occasions: ["serata amici", "comfort"],
  },
  capricciosa: {
    id: "capricciosa",
    name: "Capricciosa",
    description: "Pomodoro, mozzarella, funghi, prosciutto cotto, carciofini, olive. La pizza che ha tutto.",
    emoji: "🎭",
    thumbnail: thumbnailCapricciosa,
    flavor_profile: "rich",
    occasions: ["domenica", "cena", "ristorante"],
  },
  quattro_stagioni: {
    id: "quattro_stagioni",
    name: "Quattro Stagioni",
    description: "Stessi ingredienti della Capricciosa ma divisi in 4 quadranti. Variante più scenografica.",
    emoji: "🍂",
    thumbnail: thumbnailQuattroStagioni,
    flavor_profile: "rich",
    occasions: ["serata speciale"],
  },
  quattro_formaggi: {
    id: "quattro_formaggi",
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, parmigiano, fontina. Bianca o rossa.",
    emoji: "🧀",
    thumbnail: thumbnail4Formaggi,
    flavor_profile: "creamy",
    occasions: ["comfort", "vegetariano"],
  },
  ortolana: {
    id: "ortolana",
    name: "Ortolana",
    description: "Verdure grigliate o saltate, mozzarella. La pizza degli orti.",
    emoji: "🥗",
    thumbnail: thumbnailOrtolana,
    flavor_profile: "fresh",
    occasions: ["vegetariano", "estate", "leggera"],
  },
  patate_porchetta: {
    id: "patate_porchetta",
    name: "Patate e Porchetta",
    description: "Patate a scaglie arricciate sopra, porchetta nel ripieno post-cottura. Iconica romana.",
    emoji: "🥔",
    thumbnail: thumbnailPatatePorchetta,
    flavor_profile: "rich",
    occasions: ["weekend", "tradizione laziale", "comfort"],
  },
  crudo: {
    id: "crudo",
    name: "Crudo",
    description: "Bianca spaccata e farcita a freddo con prosciutto crudo stagionato. Semplice e nobile.",
    emoji: "🍖",
    thumbnail: thumbnailCrudo,
    flavor_profile: "salty_savory",
    occasions: ["spaccata", "spuntino", "tradizione"],
  },
  bianca_mortazza: {
    id: "bianca_mortazza",
    name: "Bianca con Mortadella",
    description: "Pizza bianca aperta a libro, mortadella IGP e pistacchio post-bake. Strepitosa.",
    emoji: "🥪",
    thumbnail: thumbnailBiancaMortazza,
    flavor_profile: "salty_savory",
    occasions: ["antipasto", "aperitivo", "spuntino romano"],
  },
  cacio_e_pepe: {
    id: "cacio_e_pepe",
    name: "Cacio e Pepe",
    description: "Crema di pecorino e pepe stesa post-bake immediato. Trucco del calore residuo.",
    emoji: "⚫",
    thumbnail: thumbnailCacioPepe,
    flavor_profile: "salty_savory",
    occasions: ["romana gourmet", "comfort"],
  },
  salsiccia_friarielli: {
    id: "salsiccia_friarielli",
    name: "Salsiccia e Friarielli",
    description: "Classico napoletano: salsiccia + cime di rapa amarognole + provola. Anche bianca.",
    emoji: "🥬",
    thumbnail: thumbnailSalsicciaFriarielli,
    flavor_profile: "earthy",
    occasions: ["napoletana DOC", "inverno", "comfort"],
  },
  hawaiiana: {
    id: "hawaiiana",
    name: "Hawaiiana",
    description: "Prosciutto cotto e ananas su base classica. Divisiva ma con il suo pubblico.",
    emoji: "🍍",
    thumbnail: thumbnailHawaiiana,
    flavor_profile: "sweet_savory",
    occasions: ["controversa", "americana", "estate"],
  },
  crescenza_recco: {
    id: "crescenza_recco",
    name: "Crescenza alla Recco",
    description: "Sfoglia sottile + crescenza dentro. Disciplinare IGP, niente altro.",
    emoji: "🧀",
    thumbnail: thumbnailCrescenzaRecco,
    flavor_profile: "creamy",
    occasions: ["ligure", "tradizione IGP"],
  },
  // Farciture approvate Focaccia di Recco (oltre alla classica + 'nduja)
  recco_culatello: {
    id: "recco_culatello",
    name: "Crescenza e Culatello",
    description: "Classica crescenza, dopo cottura coperta da fette di Culatello di Zibello DOP.",
    emoji: "🍖",
    thumbnail: thumbnailReccoCulatello,
    flavor_profile: "salty_savory",
    occasions: ["ligure", "gourmet"],
  },
  recco_cotto: {
    id: "recco_cotto",
    name: "Crescenza e Cotto Millefiori",
    description: "Crescenza con prosciutto cotto artigianale Millefiori adagiato in uscita dal forno.",
    emoji: "🐷",
    thumbnail: thumbnailReccoCotto,
    flavor_profile: "salty_savory",
    occasions: ["ligure", "delicato"],
  },
  recco_pizzata: {
    id: "recco_pizzata",
    name: "Focaccia Pizzata",
    description: "Crescenza con passata di pomodoro, acciughe, olive taggiasche e capperi. La Recco 'pizzata'.",
    emoji: "🍅",
    thumbnail: thumbnailReccoPizzata,
    flavor_profile: "salty_savory",
    occasions: ["ligure", "mediterraneo"],
  },
  // VPL-B1/B2: condimenti regionali specifici (de-genericizzazione)
  sfincione: {
    id: "sfincione",
    name: "Sfincione Palermitano",
    description: "Salsa di pomodoro e cipolla, caciocavallo, acciughe e pangrattato tostato. Niente mozzarella.",
    emoji: "🧅",
    thumbnail: thumbnailSfincione,
    flavor_profile: "salty_savory",
    occasions: ["siciliano", "street food", "tradizione"],
  },
  focaccia_barese: {
    id: "focaccia_barese",
    name: "Pomodorini e olive baresane",
    description: "Pomodorini freschi schiacciati a mano, olive baresane, origano e olio EVO. La focaccia di Bari.",
    emoji: "🫒",
    thumbnail: thumbnailFocacciaBarese,
    flavor_profile: "fresh",
    occasions: ["pugliese", "tradizione"],
  },
  fugazzeta: {
    id: "fugazzeta",
    name: "Mozzarella e cipolla (fugazzeta)",
    description: "Doppio strato ripieno di mozzarella, ricoperto di cipolla a velo e origano. Niente pomodoro.",
    emoji: "🧅",
    thumbnail: thumbnailFugazzeta,
    flavor_profile: "creamy",
    occasions: ["argentino", "porteño"],
  },
  detroit: {
    id: "detroit",
    name: "Detroit (cheese crown)",
    description: "Brick cheese fino ai bordi per il frico croccante, pepperoni e strisce di salsa in superficie.",
    emoji: "🧀",
    thumbnail: thumbnailDetroitPepperoni,
    flavor_profile: "rich",
    occasions: ["americano", "detroit"],
  },
  chicago: {
    id: "chicago",
    name: "Chicago deep dish",
    description: "Strati invertiti: mozzarella sul fondo, ripieno, salsa di pomodoro a pezzi e parmigiano in superficie.",
    emoji: "🍅",
    thumbnail: thumbnailChicago,
    flavor_profile: "rich",
    occasions: ["americano", "chicago"],
  },
  montanara: {
    id: "montanara",
    name: "Montanara",
    description: "Dischetto fritto e poi condito A CRUDO SOPRA: pomodoro cotto, ricotta, pecorino e basilico. Aperta, non ripiena.",
    emoji: "🍅",
    thumbnail: thumbnailMontanara,
    flavor_profile: "fresh",
    occasions: ["napoletano", "street food", "a crudo"],
  },
  pizza_fritta: {
    id: "pizza_fritta",
    name: "Pizza Fritta ripiena",
    description: "Tasca di impasto RIPIENA e sigillata, poi fritta: ricotta, provola, cicoli (o pepe). Chiusa, non aperta.",
    emoji: "🥟",
    thumbnail: thumbnailPizzaFritta,
    flavor_profile: "rich",
    occasions: ["napoletano", "street food", "ripiena"],
  },
  calzone: {
    id: "calzone",
    name: "Calzone Napoletano",
    description: "Chiuso a mezzaluna con ripieno di ricotta, fior di latte, salame o cicoli e pepe.",
    emoji: "🥟",
    thumbnail: thumbnailCalzone,
    flavor_profile: "rich",
    occasions: ["classico", "tradizione"],
  },
  ciaccino: {
    id: "ciaccino",
    name: "Farcitura senese",
    description: "Due dischi sottili sigillati e farciti dopo la cottura: prosciutto toscano e pecorino. La schiacciata farcita di Siena.",
    emoji: "🥪",
    thumbnail: thumbnailCiaccino,
    flavor_profile: "salty_savory",
    occasions: ["toscano", "merenda", "street food"],
  },
  white_clam: {
    id: "white_clam",
    name: "White Clam (vongole)",
    description: "La clam pie di New Haven: vongole fresche, aglio, origano, pecorino e olio. Niente pomodoro né mozzarella.",
    emoji: "🦪",
    thumbnail: thumbnailWhiteClam,
    flavor_profile: "salty_savory",
    occasions: ["new haven", "frutti di mare"],
  },
  // ─── Wave 1: firme napoletane (de-genericizzazione per stile) ───
  cosacca: {
    id: "cosacca",
    name: "Cosacca",
    description: "L'antenata della Margherita: pomodoro, pecorino (o parmigiano stagionato) e basilico. Niente mozzarella.",
    emoji: "🧀",
    thumbnail: thumbnailCosacca,
    flavor_profile: "salty_savory",
    occasions: ["napoletana storica", "tradizione", "asciutta"],
  },
  provola_pepe: {
    id: "provola_pepe",
    name: "Provola e Pepe",
    description: "Provola affumicata fusa e pepe nero macinato fresco. Affumicato avvolgente, su base rossa o bianca.",
    emoji: "🌫️",
    thumbnail: thumbnailProvolaPepe,
    flavor_profile: "salty_savory",
    occasions: ["comfort", "affumicato", "napoletana"],
  },
  nduja: {
    id: "nduja",
    name: "'Nduja di Spilinga",
    description: "Salume spalmabile calabrese piccantissimo che si scioglie sulla pizza rilasciando grasso speziato.",
    emoji: "🔥",
    thumbnail: thumbnailNduja,
    flavor_profile: "spicy",
    occasions: ["piccante", "calabrese", "comfort"],
  },
  nerano: {
    id: "nerano",
    name: "Nerano",
    description: "Crema di zucchine, zucchine fritte, provolone del Monaco DOP e menta. Omaggio alla Costiera.",
    emoji: "🥒",
    thumbnail: thumbnailNerano,
    flavor_profile: "creamy",
    occasions: ["estate", "costiera", "vegetariano"],
  },
  margherita_sbagliata: {
    id: "margherita_sbagliata",
    name: "Margherita Sbagliata",
    description: "Ordine invertito: solo bufala fusa in cottura, poi passata a crudo fredda e basilico aggiunti DOPO il forno.",
    emoji: "🔄",
    thumbnail: thumbnailMargheritaSbagliata,
    flavor_profile: "fresh",
    occasions: ["contemporanea", "gourmet", "canotto"],
  },
  scarpetta: {
    id: "scarpetta",
    name: "Scarpetta",
    description: "Bufala e fonduta di grana in cottura; fuori dal forno composta di pomodoro a crudo, pesto e scaglie di grana 24 mesi.",
    emoji: "🥄",
    thumbnail: thumbnailScarpetta,
    flavor_profile: "rich",
    occasions: ["d'autore", "contemporanea"],
  },
  // ─── Wave 2: firme romane (teglia, tonda, pinsa, pala) ───
  patate_rosmarino: {
    id: "patate_rosmarino",
    name: "Patate e Rosmarino",
    description: "Fette sottili di patate al forno, rosmarino, sale e olio EVO. Il taglio bianco dei forni romani.",
    emoji: "🌿",
    thumbnail: thumbnailPatateRosmarino,
    flavor_profile: "rich",
    occasions: ["taglio romano", "comfort", "vegetariano"],
  },
  hot_honey: {
    id: "hot_honey",
    name: "Hot Honey",
    description: "Provola affumicata, pepperoni e miele piccante alla 'nduja. Dolce-piccante che spopola.",
    emoji: "🍯",
    thumbnail: thumbnailHotHoney,
    flavor_profile: "sweet_savory",
    occasions: ["dolce-piccante", "casual", "trendy"],
  },
  bresaola_rucola: {
    id: "bresaola_rucola",
    name: "Bresaola, Rucola e Grana",
    description: "Bianca base mozzarella; dopo cottura bresaola IGP, rucola selvatica, scaglie di grana e zest di limone.",
    emoji: "🥩",
    thumbnail: thumbnailBresaolaRucola,
    flavor_profile: "fresh",
    occasions: ["estate", "leggera", "post-cottura"],
  },
  stracciata_bottarga: {
    id: "stracciata_bottarga",
    name: "Stracciatella e Bottarga",
    description: "Stracciatella di burrata a crudo, zucchine alla scapece e bottarga di muggine grattugiata. Gourmet romano.",
    emoji: "🐟",
    thumbnail: thumbnailStracciataBottarga,
    flavor_profile: "salty_savory",
    occasions: ["gourmet", "pala romana", "estate"],
  },
  // ─── Wave 3: classici e firme americane ───
  cheese_pizza: {
    id: "cheese_pizza",
    name: "Cheese Pizza",
    description: "La plain cheese americana: salsa di pomodoro speziata e mozzarella low-moisture fusa fino al bordo.",
    emoji: "🧀",
    thumbnail: thumbnailCheesePizza,
    flavor_profile: "creamy",
    occasions: ["americano", "classico", "slice"],
  },
  supreme: {
    id: "supreme",
    name: "Supreme",
    description: "La ricca americana: pepperoni, salsiccia, peperoni verdi, cipolla e funghi su mozzarella.",
    emoji: "🎪",
    thumbnail: thumbnailSupreme,
    flavor_profile: "rich",
    occasions: ["americano", "abbondante", "condivisione"],
  },
  white_pizza: {
    id: "white_pizza",
    name: "White Pizza",
    description: "Senza pomodoro: mozzarella, ricotta montata, aglio e spinaci. La white pie americana.",
    emoji: "🤍",
    thumbnail: thumbnailWhitePizza,
    flavor_profile: "creamy",
    occasions: ["americano", "senza pomodoro", "vegetariano"],
  },
  vodka_pizza: {
    id: "vodka_pizza",
    name: "Vodka",
    description: "Salsa vodka cremosa (pomodoro, panna, vodka), basilico e pecorino. Trend italo-americano.",
    emoji: "🌸",
    thumbnail: thumbnailVodkaPizza,
    flavor_profile: "creamy",
    occasions: ["americano", "trendy", "cremoso"],
  },
  bbq_chicken: {
    id: "bbq_chicken",
    name: "BBQ Chicken",
    description: "Pollo glassato alla barbecue, cipolla rossa e coriandolo. Firma californiana di Wolfgang Puck.",
    emoji: "🍗",
    thumbnail: thumbnailBbqChicken,
    flavor_profile: "sweet_savory",
    occasions: ["california", "gourmet", "dolce-affumicato"],
  },
  smoked_salmon: {
    id: "smoked_salmon",
    name: "Salmone affumicato",
    description: "Base bianca con crème fraîche; a crudo salmone affumicato, aneto, cipolla rossa e capperi.",
    emoji: "🍣",
    thumbnail: thumbnailSmokedSalmon,
    flavor_profile: "salty_savory",
    occasions: ["california", "gourmet", "brunch"],
  },
  italian_beef: {
    id: "italian_beef",
    name: "Italian Beef",
    description: "Straccetti di manzo brasato nel suo brodo e giardiniera piccante. La specialità di Chicago.",
    emoji: "🥩",
    thumbnail: thumbnailItalianBeef,
    flavor_profile: "rich",
    occasions: ["chicago", "abbondante", "carne"],
  },
  tomato_pie: {
    id: "tomato_pie",
    name: "Tomato Pie",
    description: "La apizza di New Haven senza mozzarella: solo salsa di San Marzano, aglio, origano e pecorino.",
    emoji: "🍅",
    thumbnail: thumbnailTomatoPie,
    flavor_profile: "fresh",
    occasions: ["new haven", "senza mozzarella", "asciutta"],
  },
  greek_feta: {
    id: "greek_feta",
    name: "Greca (feta e olive)",
    description: "Pan pizza dei diner greci: feta sbriciolata, olive kalamata, cipolla rossa e origano.",
    emoji: "🫒",
    thumbnail: thumbnailGreekFeta,
    flavor_profile: "salty_savory",
    occasions: ["greek pan", "mediterraneo", "diner"],
  },
  // ─── Wave 4: classici e firme contemporanee/regionali ───
  zucca_speck: {
    id: "zucca_speck",
    name: "Zucca, Speck e Caciocavallo",
    description: "Crema di zucca arrosto, speck a freddo e scaglie di caciocavallo. Il gourmet d'autunno di Bonci.",
    emoji: "🎃",
    thumbnail: thumbnailZuccaSpeck,
    flavor_profile: "earthy",
    occasions: ["autunno", "bonci", "gourmet"],
  },
  burrata_salmone: {
    id: "burrata_salmone",
    name: "Burrata e Salmone",
    description: "Stracciatella di burrata a crudo, salmone affumicato, zest di limone e aneto. Abbinamento freddo.",
    emoji: "🐟",
    thumbnail: thumbnailBurrataSalmone,
    flavor_profile: "salty_savory",
    occasions: ["gourmet", "freddo", "bonci"],
  },
  focaccia_cipolle: {
    id: "focaccia_cipolle",
    name: "Focaccia alle cipolle",
    description: "Fette sottili di cipolla dorata stufate in cottura con abbondante olio sulla focaccia ligure.",
    emoji: "🧅",
    thumbnail: thumbnailFocacciaCipolle,
    flavor_profile: "light",
    occasions: ["ligure", "aperitivo", "vegetariano"],
  },
  sardenaira: {
    id: "sardenaira",
    name: "Sardenaira",
    description: "La focaccia condita di Sanremo: salsa di pomodoro e cipolla, acciughe, olive taggiasche, capperi e aglio.",
    emoji: "🍅",
    thumbnail: thumbnailSardenaira,
    flavor_profile: "salty_savory",
    occasions: ["sanremo", "ponente ligure", "De.Co."],
  },
  sfincione_bianco: {
    id: "sfincione_bianco",
    name: "Sfincione bianco (bagherese)",
    description: "La variante di Bagheria senza pomodoro: tuma, acciughe, cipolle stufate, caciocavallo e mollica tostata.",
    emoji: "🧅",
    thumbnail: thumbnailSfincioneBianco,
    flavor_profile: "salty_savory",
    occasions: ["bagheria", "siciliano", "senza pomodoro"],
  },
  gorgonzola_pere: {
    id: "gorgonzola_pere",
    name: "Gorgonzola e Pere",
    description: "Base bianca con fette di pera dolce e gorgonzola cremoso. Il dolce-salato del padellino.",
    emoji: "🍐",
    thumbnail: thumbnailGorgonzolaPere,
    flavor_profile: "sweet_savory",
    occasions: ["autunno", "dolce-salato", "padellino"],
  },
  tonno_cipolla: {
    id: "tonno_cipolla",
    name: "Tonno e Cipolla",
    description: "Pomodoro, mozzarella, tonno sott'olio e cipolla rossa di Tropea. Un classico semplice e saporito.",
    emoji: "🐟",
    thumbnail: thumbnailTonnoCipolla,
    flavor_profile: "salty_savory",
    occasions: ["classico", "estate", "semplice"],
  },
  // ─── Arricchimento: farciture/condimenti per stili prima "magri" ───
  scarola: {
    id: "scarola",
    name: "Scarola",
    description: "Scarola stufata con aglio, olive e capperi (e provola). Ripieno classico del calzone napoletano.",
    emoji: "🥬",
    thumbnail: thumbnailScarola,
    flavor_profile: "earthy",
    occasions: ["napoletano", "inverno", "tradizione"],
  },
  fugazza: {
    id: "fugazza",
    name: "Fugazza (sola cipolla)",
    description: "L'originale argentina senza formaggio: solo cipolla a velo e origano sull'impasto. Antenata della fugazzeta.",
    emoji: "🧅",
    thumbnail: thumbnailFugazza,
    flavor_profile: "fresh",
    occasions: ["argentino", "porteño", "senza pomodoro"],
  },
  ricotta_cicoli: {
    id: "ricotta_cicoli",
    name: "Ricotta e Cicoli",
    description: "Ripieno rustico napoletano: ricotta di pecora, cicoli (ciccioli di maiale), fior di latte e pepe.",
    emoji: "🐖",
    thumbnail: thumbnailRicottaCicoli,
    flavor_profile: "rich",
    occasions: ["napoletano", "rustico", "tradizione"],
  },
  meat_lovers: {
    id: "meat_lovers",
    name: "Meat Lovers",
    description: "Festa di carni: pepperoni, salsiccia, bacon e manzo su formaggio fuso. Per i carnivori.",
    emoji: "🥓",
    thumbnail: thumbnailMeatLovers,
    flavor_profile: "rich",
    occasions: ["americano", "carne", "abbondante"],
  },
  spinaci: {
    id: "spinaci",
    name: "Spinaci",
    description: "Spinaci freschi al vapore con mix di formaggi fondenti. Versione vegetariana ricca.",
    emoji: "🍃",
    thumbnail: thumbnailSpinaci,
    flavor_profile: "fresh",
    occasions: ["vegetariano", "comfort"],
  },
  prosciutto_funghi: {
    id: "prosciutto_funghi",
    name: "Prosciutto e Funghi",
    description: "Prosciutto cotto e funghi champignon su mozzarella. Il classico intramontabile.",
    emoji: "🍄",
    thumbnail: thumbnailProsciuttoFunghi,
    flavor_profile: "rich",
    occasions: ["classico", "comfort", "famiglia"],
  },
};

/* ═══ ToppingRecipe — la realizzazione concreta ═══ */

export interface ToppingRecipe {
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
    variant_name: "Verace AVPN",
    thumbnail: thumbnailVariantMargheritaAvpn,
    authenticity: "canonical", // disciplinare AVPN
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano DOP schiacciati a mano (pomodoro, succo di pomodoro)", amount: { value: 80, unit: "g" } },
      { name: "Sale fino sulla salsa", amount: { value: 1, unit: "g" } },
      { name: "Fior di latte campano (o mozzarella di bufala)", amount: { value: 90, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: "foglie intere" },
      { name: "Olio EVO a filo", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_avpn",
      title: "Condimento Margherita Verace",
      description: "Stendere i pelati schiacciati a mano in modo uniforme. Disporre il fior di latte a strisce o cubetti. Basilico fresco e olio EVO a filo PRIMA del forno (cottura 90s, regge).",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: {
        beginner: "Disciplinare AVPN: pomodoro pelati DOP, mozzarella campana, basilico fresco. Olio EVO sì, ma poco.",
        nerd: "La cottura flash 90s a 450°C preserva il basilico fresco (la pizza dura troppo poco per degradarlo). Diverso dai forni casa lenti dove va aggiunto post.",
      },
    }],
  },

  margherita_romana: {
    id: "margherita_romana",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaRomana,
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 100, unit: "g" } },
      { name: "Sale sulla passata", amount: { value: 1, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, notes: "foglie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_romana",
      title: "Condimento Margherita romana",
      description: "Stendere la passata salata uniformemente. Distribuire mozzarella a cubetti. Olio a filo. Basilico solo a fine cottura.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
      tip: {
        beginner: "Forno casa = cottura lunga (12-20 min). Basilico fresco va aggiunto APPENA esce, altrimenti brucia.",
        nerd: "I composti volatili del basilico (linalolo, eucaliptolo) degradano sopra i 100°C. Per cotture >5min meglio aggiungere post-bake.",
      },
    }],
  },

  margherita_americana: {
    id: "margherita_americana",
    concept_ref: "margherita",
    thumbnail: thumbnailVariantMargheritaAmericana,
    preferred_for_styles: ["california_style"],
    ingredients: [
      { name: "Salsa di pomodoro (passata di pomodoro, origano, zucchero, sale)", amount: { value: 100, unit: "g" } },
      { name: "Low-moisture mozzarella shredded", amount: { value: 100, unit: "g" } },
      { name: "Parmigiano grattugiato in superficie", amount: { value: 5, unit: "g" } },
      { name: "Olive oil drizzle", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_us",
      title: "Condimento Margherita americana",
      description: "Spargere la salsa lasciando bordo libero. Mozzarella shredded a manciate distribuite. Parmigiano spolverato. Olio a filo. (Niente basilico fresco: stile USA non lo prevede di base).",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },


  /* ─── MARINARA — 2 varianti ─── */
  marinara_avpn: {
    id: "marinara_avpn",
    concept_ref: "marinara",
    variant_name: "AVPN",
    authenticity: "canonical", // disciplinare AVPN
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano DOP (pomodoro, succo di pomodoro)", amount: { value: 80, unit: "g" } },
      { name: "Sale", amount: { value: 1, unit: "g" } },
      { name: "Aglio", amount: { value: 2, unit: "pcs" }, notes: "spicchi affettati sottili" },
      { name: "Origano secco siciliano", amount: { value: 1, unit: "g" } },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_marinara_avpn",
      title: "Condimento Marinara AVPN",
      description: "Pelati schiacciati salati. Aglio a fettine sottili distribuito. Origano abbondante. Filo d'olio EVO. Niente formaggio (è la Marinara!).",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 100, unit: "g" } },
      { name: "Sale", amount: { value: 1, unit: "g" } },
      { name: "Aglio", amount: { value: 1, unit: "pcs" } },
      { name: "Origano", amount: { value: 1, unit: "g" } },
      { name: "Peperoncino (opzionale)", amount: { value: 1, unit: "pcs" }, optional: true },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_marinara_romana",
      title: "Condimento Marinara romana",
      description: "Passata salata; aglio a fette sottili; origano; opzionale peperoncino in fiocchi; abbondante olio EVO.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* ─── BIANCA — 1 generica ─── */
  bianca_olio_rosmarino: {
    id: "bianca_olio_rosmarino",
    concept_ref: "bianca",
    variant_name: "olio e rosmarino",
    // La bianca/schiacciata è una base tradizionale italiana trasversale
    // (focaccia, pala, teglia, sfincione bianco, schiacciata napoletana).
    preferred_for_styles: ["focaccia_genovese", "focaccia_barese", "pala_romana", "teglia_romana"],
    ingredients: [
      { name: "Olio EVO", amount: { value: 15, unit: "ml" } },
      { name: "Rosmarino fresco", amount: { value: 2, unit: "pcs" }, notes: "rametti" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: "in superficie" },
    ],
    assembly_steps: [{
      id: "spread_bianca",
      title: "Condimento bianca",
      description: "Spennellare con olio EVO; distribuire aghi di rosmarino freschi; sale grosso in superficie.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  /* ─── BOSCAIOLA — 2 varianti regionali (la demo del refactor!) ─── */
  boscaiola_napoletana: {
    id: "boscaiola_napoletana",
    concept_ref: "boscaiola",
    variant_name: "porcini e salsiccia",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano (pomodoro, succo di pomodoro)", amount: { value: 60, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "Porcini sottolio scolati (funghi porcini, olio, aglio, sale, spezie)", amount: { value: 50, unit: "g" }, notes: "qualità trifolati" },
      { name: "Salsiccia napoletana al finocchio (carne di maiale, sale, finocchietto, pepe)", amount: { value: 50, unit: "g" }, notes: "spezzata a tocchetti" },
      { name: "Grana padano grattugiato", amount: { value: 8, unit: "g" }, notes: "in superficie" },
      { name: "Olio EVO a filo", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_boscaiola_nap",
      title: "Condimento Boscaiola napoletana",
      description: "Stendere i pelati schiacciati salati. Distribuire fior di latte. Aggiungere porcini scolati e salsiccia spezzata cruda. Spolverare di grana padano. Olio a filo.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
      tip: {
        beginner: "Porcini sottolio = già pronti, niente cottura preliminare. La salsiccia cuoce nel forno flash 90s.",
        nerd: "L'olio dei porcini sottolio è già aromatizzato (porcini, alloro, aglio): apporta complessità aromatica. La grana resiste alla cottura wood-oven 450° meglio del parmigiano (più ricca di grasso).",
      },
    }],
  },

  boscaiola_romana: {
    id: "boscaiola_romana",
    concept_ref: "boscaiola",
    variant_name: "salsiccia e funghi",
    preferred_for_styles: ["teglia_romana", "tonda_romana", "pinsa_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 70, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Champignon freschi", amount: { value: 70, unit: "g" }, notes: "affettati" },
      { name: "Salsiccia (luganega o casereccia) (carne di maiale, sale, pepe)", amount: { value: 60, unit: "g" } },
      { name: "Aglio + prezzemolo per soffritto", amount: { value: 5, unit: "g" }, notes: "usati per pre-cottura funghi" },
      { name: "Olio EVO", amount: { value: 8, unit: "ml" }, notes: "usato in cottura funghi e a filo" },
    ],
    pre_prep_steps: [{
      id: "saltare_champignon",
      title: "Saltare champignon",
      description: "Affettare gli champignon. Scaldare olio EVO con aglio in camicia e prezzemolo. Saltare i funghi 8-10 min a fiamma medio-alta finché perdono acqua e iniziano a dorarsi. Sale a fine cottura.",
      duration_minutes: 15,
      timing: "just_before_assembly",
      tip: {
        beginner: "Cuocili PRIMA. Se vanno crudi sulla pizza, rilasciano acqua e bagnano la base impedendole di cuocere bene.",
        nerd: "Gli champignon sono 92% acqua. Pre-cottura 8min → riduzione massa ~50% + reazione Maillard sui bordi → sapore concentrato e zero rilascio in cottura pizza.",
      },
    }],
    assembly_steps: [{
      id: "spread_boscaiola_rom",
      title: "Condimento Boscaiola romana",
      description: "Stendere passata salata. Distribuire mozzarella. Aggiungere champignon saltati (a temperatura ambiente). Spezzettare la salsiccia cruda a tocchetti distribuiti. Olio a filo.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* ─── DIAVOLA — 2 varianti ─── */
  diavola_napoletana: {
    id: "diavola_napoletana",
    concept_ref: "diavola",
    variant_name: "salame napoletano",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano (pomodoro, succo di pomodoro)", amount: { value: 80, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Salame piccante napoletano (carne di maiale, sale, peperoncino, spezie)", amount: { value: 50, unit: "g" }, notes: "a fette spesse" },
      { name: "Olio piccante (olio EVO, peperoncino)", amount: { value: 5, unit: "ml" }, optional: true },
    ],
    assembly_steps: [{
      id: "spread_diavola_nap",
      title: "Condimento Diavola napoletana",
      description: "Pelati schiacciati salati. Fior di latte. Salame piccante a fette adagiato a raggera. Filo di olio piccante opzionale.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  diavola_americana: {
    id: "diavola_americana",
    concept_ref: "diavola",
    variant_name: "Pepperoni",
    preferred_for_styles: ["new_york", "chicago_tavern", "grandma_style", "california_style", "greek_pan"],
    ingredients: [
      { name: "Salsa di pomodoro (passata di pomodoro, sale, zucchero, origano, aglio in polvere)", amount: { value: 100, unit: "g" } },
      { name: "Low-moisture mozzarella shredded", amount: { value: 100, unit: "g" } },
      { name: "Pepperoni a fette (carne di maiale e manzo, sale, spezie, paprika)", amount: { value: 70, unit: "g" }, notes: "americano, più dolce-affumicato" },
      { name: "Origano", amount: { value: 1, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_diavola_us",
      title: "Condimento Pepperoni",
      description: "Salsa. Mozzarella shredded. Pepperoni a fette sovrapposte (il classico effetto coppette). Origano.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: {
        beginner: "Il pepperoni americano è diverso dal salame piccante: più dolce, più affumicato, e fa quelle 'coppette' caratteristiche col grasso in cottura.",
        nerd: "Pepperoni USA = budello rigido + grasso al 35-40% → si arriccia in cottura formando concavità ('cupping'). Il salame italiano resta piatto.",
      },
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
      { name: "Porchetta affettata sottile (carne di maiale, sale, pepe, aglio, rosmarino)", amount: { value: 200, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero", amount: { value: 1, unit: "g" }, optional: true, section: "ripieno" },
      { name: "Patate gialle a tessuto compatto", amount: { value: 400, unit: "g" }, section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: "rametti", section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: "solo a fine", section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "patate_mandolina_ammollo",
      title: "Preparazione patate",
      description: "Affettare le patate sottilissime (1-2mm) con mandolina. Immergere in acqua fredda per 30 min: serve a togliere l'amido in eccesso. Scolare e asciugare bene tra panni puliti.",
      duration_minutes: 35,
      timing: "just_before_assembly",
      tip: {
        beginner: "L'acqua fredda toglie l'amido: senza, le patate si attaccano tra loro in cottura e non si arricciano ai bordi.",
        nerd: "L'amido superficiale gelatinizza a ~60°C creando una pellicola adesiva. Rimuoverlo permette la disidratazione progressiva durante il bake e l'arricciamento dei bordi (effetto chip).",
      },
    }],
    assembly_steps: [
      {
        id: "stesura_patate",
        title: "Disposizione patate sopra",
        description: "Disporre le patate a scaglie sovrapposte sull'impasto. Condire con olio EVO e rosmarino. Niente sale ancora.",
        insert_at: "after_stack",
        duration_minutes: 6,
        tip: {
          beginner: "Non salare ora: il sale farebbe rilasciare acqua e bagnerebbe la base. Va aggiunto solo a fine cottura.",
          nerd: "Il NaCl per osmosi estrae acqua dalle cellule vegetali (turgor pressure rilascio). Salare in anticipo significa portare le patate da ~80% acqua a poltiglia bagnata.",
        },
      },
      {
        id: "farcitura_porchetta",
        title: "Farcitura porchetta",
        description: "Dopo aver sdoppiato, disporre le fette di porchetta sulla metà inferiore. Macinata di pepe. Richiudere con la parte alta (con patate sopra).",
        insert_at: "after_split_fill",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "sale_finale",
        title: "Sale e servizio",
        description: "Spolverare di fior di sale la superficie delle patate. Servire calda, tagliata a quadrotti.",
        insert_at: "after_bake2",
        duration_minutes: 1,
      },
    ],
    bake_adjustments: {
      additional_minutes: 5,
      note: "Le patate richiedono cottura più lunga per arricciarsi e colorire.",
    },
  },

  bianca_mortazza_romana: {
    id: "bianca_mortazza_romana",
    concept_ref: "bianca_mortazza",
    variant_name: "IGP di Bologna",
    thumbnail: thumbnailVariantBiancaMortazzaRomana,
    preferred_for_styles: ["pizza_spaccata", "pala_romana", "teglia_romana"],
    ingredients: [
      { name: "Olio EVO per spennellare", amount: { value: 12, unit: "ml" }, section: "base" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, section: "base" },
      { name: "Stracciatella di burrata (mozzarella, panna)", amount: { value: 50, unit: "g" }, optional: true, section: "ripieno" },
      { name: "Mortadella IGP di Bologna a fette sottili (carne di suino, sale, spezie, pistacchio)", amount: { value: 100, unit: "g" }, section: "ripieno" },
      { name: "Granella di pistacchio di Bronte", amount: { value: 10, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "spread_bianca_base",
        title: "Cottura in bianco",
        description: "Spennellare con olio EVO e cospargere di fior di sale. Cuocere fino a doratura della crosta (niente altro prima del forno).",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "mortazza_post_bake",
        title: "Aggiungere mortadella post-cottura",
        description: "Estrarre dal forno. Sdoppiare a libro se Pala/Pala-ish, oppure adagiare le fette sopra. Distribuire mortadella IGP a fette ondulate. Cospargere di pistacchio. (Stracciatella di burrata opzionale per versione gourmet).",
        insert_at: "after_bake",
        duration_minutes: 3,
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
        title: "Cottura in bianco",
        description: "Spennellare con olio EVO e fior di sale. Cuocere la base finché dorata e alveolata. Niente altro prima del forno.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "crudo_spacca_farci",
        title: "Spaccare e farcire col crudo",
        description: "Estrarre dal forno, spaccare a metà col coltello e farcire con le fette di prosciutto crudo. Il calore residuo ammorbidisce appena il grasso del crudo.",
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
    variant_name: "alla Sancho (in crosta di patate)",
    thumbnail: thumbnailVariantPatatePorchettaSancho,
    preferred_for_styles: ["pizza_spaccata"],
    ingredients: [
      { name: "Patate gialle a fette sottilissime (mandolina)", amount: { value: 220, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 18, unit: "ml" }, section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: "aghi", section: "superficie" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: "a fine cottura", section: "superficie" },
      { name: "Porchetta di Ariccia IGP affettata sottile", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero", amount: { value: 1, unit: "g" }, optional: true, section: "ripieno" },
    ],
    pre_prep_steps: [{
      id: "patate_sancho_prep",
      title: "Affettare e ammollare le patate",
      description: "Affettare le patate a 1-2 mm con la mandolina, ammollarle 20 min in acqua fredda per togliere l'amido, scolare e asciugare.",
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [
      {
        id: "patate_sancho_top",
        title: "Patate a scaglie in superficie",
        description: "Disporre le patate a scaglie sovrapposte sulla base (la 'crosta di patate'). Olio EVO e rosmarino. Niente sale ora. Cuocere finché le patate si arricciano e dorano.",
        insert_at: "after_shape",
        duration_minutes: 6,
        replaces_generic: true,
      },
      {
        id: "patate_sancho_split",
        title: "Spaccare e farcire di porchetta",
        description: "Fuori dal forno, salare le patate. Spaccare la teglia a metà (le patate restano fuori) e farcire l'interno con la porchetta di Ariccia a fette e una macinata di pepe. Richiudere. Alla Sancho.",
        insert_at: "after_bake",
        duration_minutes: 4,
      },
    ],
    bake_adjustments: {
      additional_minutes: 4,
      note: "Le patate in superficie richiedono qualche minuto in più per arricciarsi.",
    },
  },

  crescenza_recco: {
    id: "crescenza_recco",
    concept_ref: "crescenza_recco",
    variant_name: "IGP",
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
      title: "Crescenza tra le sfoglie",
      description: "Tra la sfoglia inferiore e quella superiore, distribuire pezzetti di crescenza a distanza regolare. Sigillare i bordi schiacciando. Olio + sale grosso in superficie.",
      insert_at: "after_fill_internal",
      duration_minutes: 4,
    }],
  },

  sfincione_palermitano: {
    id: "sfincione_palermitano",
    concept_ref: "sfincione",
    preferred_for_styles: ["sfincione"],
    ingredients: [
      { name: "Acciughe sott'olio", amount: { value: 30, unit: "g" }, notes: "Filetti" },
      { name: "Caciocavallo (o primosale)", amount: { value: 150, unit: "g" }, notes: "A dadini" },
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 250, unit: "g" } },
      { name: "Cipolla bianca", amount: { value: 200, unit: "g" }, notes: "A fette sottili, stufata nella salsa" },
      { name: "Pecorino grattugiato", amount: { value: 30, unit: "g" }, optional: true },
      { name: "Pangrattato", amount: { value: 40, unit: "g" }, notes: "Tostato in olio" },
      { name: "Origano secco", amount: { value: 2, unit: "g" } },
      { name: "Olio EVO", amount: { value: 30, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "sfincione_sauce",
      title: "Salsa di cipolla e pangrattato tostato",
      description: "Stufare la cipolla a fette in poco olio, unire la passata e cuocere 15 min. A parte, tostare il pangrattato in padella con un filo d'olio fino a doratura.",
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "sfincione_top",
      title: "Condire lo sfincione",
      description: "Stendere la salsa di pomodoro e cipolla sull'impasto. Distribuire il caciocavallo a dadini e i filetti di acciuga affondandoli leggermente. Spolverare con pangrattato tostato, pecorino e origano, infine un filo d'olio EVO.",
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
      { name: "Pomodorini freschi (ciliegino)", amount: { value: 300, unit: "g" }, notes: "Schiacciati a mano, non San Marzano" },
      { name: "Olive baresane", amount: { value: 80, unit: "g" }, notes: "Intere o denocciolate" },
      { name: "Origano secco", amount: { value: 2, unit: "g" } },
      { name: "Sale grosso", amount: { value: 4, unit: "g" } },
      { name: "Olio EVO", amount: { value: 25, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "barese_top",
      title: "Pomodorini, olive e origano",
      description: "Affondare i pomodorini schiacciati nell'impasto lievitato. Distribuire le olive baresane premendole leggermente. Spolverare l'origano, irrorare con olio EVO abbondante e finire con sale grosso.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* Varianti tradizionali della focaccia barese (non è mono-gusto). */
  focaccia_barese_patate: {
    id: "focaccia_barese_patate",
    concept_ref: "patate_rosmarino",
    variant_name: "alla barese",
    preferred_for_styles: ["focaccia_barese"],
    ingredients: [
      { name: "Patate gialle a fette di ~5 mm", amount: { value: 300, unit: "g" }, notes: "a coprire tutta la superficie", section: "superficie" },
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Sale grosso", amount: { value: 4, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 25, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "barese_patate",
      title: "Coperta di patate",
      description: "Coprire interamente la focaccia con le fette di patata sovrapposte (~5 mm). Rosmarino, abbondante olio EVO e sale grosso. Le patate si arricciano e dorano in cottura.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
    bake_adjustments: { additional_minutes: 4, note: "Le patate richiedono qualche minuto in più." },
  },

  focaccia_barese_cipolla: {
    id: "focaccia_barese_cipolla",
    concept_ref: "focaccia_cipolle",
    variant_name: "cipolla di Acquaviva",
    preferred_for_styles: ["focaccia_barese"],
    ingredients: [
      { name: "Cipolla rossa di Acquaviva (o di Tropea) stufata", amount: { value: 200, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Sale grosso", amount: { value: 4, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 25, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "barese_cipolla_prep",
      title: "Stufare la cipolla",
      description: "Affettare la cipolla rossa dolce e stufarla dolcemente in olio finché morbida e appena dorata.",
      duration_minutes: 20,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "barese_cipolla",
      title: "Cipolla stufata sulla focaccia",
      description: "Distribuire la cipolla stufata sull'impasto lievitato. Origano, olio EVO e sale grosso. La dolcezza della cipolla di Acquaviva è la firma di questa variante.",
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
      { name: "Mozzarella per pizza (asciutta)", amount: { value: 300, unit: "g" }, notes: "Ripieno interno", section: "ripieno" },
      { name: "Cipolla bianca", amount: { value: 200, unit: "g" }, notes: "A velo, in superficie", section: "superficie" },
      { name: "Parmigiano o pecorino grattugiato", amount: { value: 20, unit: "g" }, optional: true, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "fugazzeta_onion",
      title: "Ammorbidire la cipolla",
      description: "Affettare la cipolla a velo e lasciarla in acqua fredda salata 15 min per smorzarne il pungente, poi scolarla e asciugarla bene.",
      duration_minutes: 15,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "fugazzeta_fill_top",
      title: "Mozzarella interna + cipolla in superficie",
      description: "Distribuire la mozzarella sullo strato inferiore, coprire con il secondo disco e sigillare i bordi. In superficie disporre la cipolla a velo, l'origano e (a piacere) il formaggio grattugiato; rifinire con olio EVO e sale. Niente pomodoro.",
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
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Cipolla bianca a velo abbondante", amount: { value: 250, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 3, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "fugazza_onion",
      title: "Ammorbidire la cipolla",
      description: "Affettare la cipolla a velo, ammollarla 15 min in acqua fredda salata per smorzarne il pungente, scolare e asciugare.",
      duration_minutes: 15,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "fugazza_top",
      title: "Solo cipolla in superficie (niente formaggio)",
      description: "La fugazza non si farcisce di formaggio: si copre la superficie con un letto abbondante di cipolla a velo, origano, olio EVO e sale. È l'antenata 'magra' della fugazzeta rellena.",
      insert_at: "after_fill_internal",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  detroit_brick: {
    id: "detroit_brick",
    concept_ref: "detroit",
    preferred_for_styles: ["detroit"],
    ingredients: [
      { name: "Brick cheese del Wisconsin (o mozzarella low-moisture)", amount: { value: 250, unit: "g" }, notes: "Fino ai bordi: forma il cheese crown / frico", section: "crosta" },
      { name: "Pepperoni piccante (carne di maiale, sale, spezie)", amount: { value: 80, unit: "g" }, optional: true, section: "base" },
      { name: "Salsa di pomodoro concentrata (passata di pomodoro, origano, sale)", amount: { value: 150, unit: "g" }, notes: "Strisce in superficie (racing stripes)", section: "superficie" },
      { name: "Parmigiano o pecorino grattugiato", amount: { value: 10, unit: "g" }, optional: true, section: "superficie" },
      { name: "Origano secco", amount: { value: 1, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "detroit_cheese_crown",
        title: "Cheese crown fino ai bordi",
        description: "Distribuire il brick cheese su tutta la superficie spingendolo contro i bordi della teglia: in cottura caramella formando la crosta di formaggio (frico). Adagiare sopra the pepperoni.",
        insert_at: "after_shape",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "detroit_sauce_stripes",
        title: "Strisce di salsa in superficie",
        description: "Sopra il formaggio, stendere 2-3 strisce di salsa di pomodoro (racing stripes) nel senso della lunghezza. La salsa va SOPRA, non sotto. Spolverare parmigiano e origano.",
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
      { name: "Mozzarella a fette", amount: { value: 200, unit: "g" }, notes: "Sul fondo, a contatto con l'impasto", section: "base" },
      { name: "Salsiccia italiana sbriciolata (carne di suino, sale, pepe, semi di finocchio)", amount: { value: 150, unit: "g" }, optional: true, notes: "Strato sopra la mozzarella", section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi (San Marzano) (pomodori, succo di pomodoro, sale)", amount: { value: 250, unit: "g" }, notes: "Salsa grezza in superficie", section: "superficie" },
      { name: "Parmigiano grattugiato", amount: { value: 20, unit: "g" }, notes: "In superficie", section: "superficie" },
      { name: "Origano e basilico secco", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "chicago_cheese_base",
        title: "Mozzarella e ripieno sul fondo",
        description: "Foderare lo stampo profondo con l'impasto facendolo risalire sui bordi. Coprire il fondo con le fette di mozzarella (proteggono l'impasto dalla salsa), poi distribuire la salsiccia.",
        insert_at: "after_shape",
        duration_minutes: 5,
        replaces_generic: true,
      },
      {
        id: "chicago_sauce_top",
        title: "Salsa a pezzi e parmigiano in superficie",
        description: "Versare la polpa di pomodoro a pezzi SOPRA il formaggio e il ripieno. Spolverare parmigiano, origano e basilico. Cuocere a lungo (25-35 min): è la salsa sopra a proteggere il formaggio.",
        insert_at: "after_shape",
        duration_minutes: 3,
      },
    ],
  },
  calzone_napoletano_classico: {
    id: "calzone_napoletano_classico",
    concept_ref: "calzone",
    variant_name: "ricotta e salame",
    preferred_for_styles: ["calzone_napoletano"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Ricotta fresca (siero di latte, sale)", amount: { value: 100, unit: "g" }, section: "ripieno" },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" }, section: "ripieno" },
      { name: "Salame napoletano (carne di maiale, sale, pepe)", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "ripieno" },
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Parmigiano grattugiato", amount: { value: 5, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 2, unit: "pcs" }, notes: "foglie", section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "calzone_assembly",
      title: "Chiusura calzone",
      description: "Stendere il disco, spalmare la ricotta mescolata al pepe su una metà. Distribuire fior di latte e salame. Ripiegare a mezzaluna e sigillare premendo forte sui bordi. Cospargere la superficie esterna con un velo di passata, parmigiano, basilico e un filo d'olio.",
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* Calzone: il classico non è mono-gusto — scarola e ricotta&cicoli sono tradizionali. */
  calzone_scarola: {
    id: "calzone_scarola",
    concept_ref: "scarola",
    variant_name: "e provola",
    thumbnail: thumbnailVariantCalzoneScarola,
    preferred_for_styles: ["calzone_napoletano"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Scarola stufata con aglio (scarola, aglio, olio)", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Olive di Gaeta denocciolate", amount: { value: 25, unit: "g" }, section: "ripieno" },
      { name: "Capperi dissalati", amount: { value: 10, unit: "g" }, section: "ripieno" },
      { name: "Provola affumicata a cubetti", amount: { value: 70, unit: "g" }, section: "ripieno" },
      { name: "Acciughe (opzionali)", amount: { value: 10, unit: "g" }, optional: true, section: "ripieno" },
    ],
    pre_prep_steps: [{
      id: "scarola_stufata",
      title: "Stufare la scarola",
      description: "Ripassare la scarola in padella con aglio, olive e capperi finché morbida e asciutta. Strizzare bene l'acqua in eccesso.",
      duration_minutes: 12,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "calzone_scarola_fill",
      title: "Chiusura calzone di scarola",
      description: "Distribuire la scarola stufata con olive e capperi su metà disco, aggiungere la provola (e acciughe a piacere). Ripiegare a mezzaluna e sigillare. È il calzone invernale napoletano per eccellenza.",
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
      { name: "Ricotta di pecora (siero di latte, sale)", amount: { value: 110, unit: "g" }, section: "ripieno" },
      { name: "Cicoli napoletani (ciccioli di maiale)", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" }, section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "ripieno" },
      { name: "Passata di pomodoro (sulla superficie)", amount: { value: 40, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "calzone_cicoli_fill",
      title: "Chiusura calzone ricotta e cicoli",
      description: "Spalmare la ricotta al pepe su metà disco, unire fior di latte e cicoli. Ripiegare e sigillare. Velo di passata in superficie. Il ripieno rustico tradizionale.",
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
      { name: "Salsa di pomodoro (passata di pomodoro, sale, zucchero, origano)", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Low-moisture mozzarella", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Pecorino Romano grattugiato", amount: { value: 8, unit: "g" }, notes: "In superficie: hallmark della slice newyorkese", section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_ny",
      title: "Condimento New York",
      description: "Stendere la salsa (con un pizzico di zucchero per bilanciare l'acidità) lasciando il bordo libero. Coprire con la mozzarella low-moisture. Finire con pecorino romano grattugiato e un filo d'olio. La fetta resta grande e pieghevole.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },
  montanara_classica: {
    id: "montanara_classica",
    concept_ref: "montanara",
    preferred_for_styles: ["pizza_fritta"],
    ingredients: [
      { name: "Pomodoro (pelati schiacciati o passata, sale)", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Ricotta fresca (siero di latte, sale)", amount: { value: 30, unit: "g" }, notes: "A fiocchi, a crudo", section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 5, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 2, unit: "pcs" }, notes: "foglie", section: "superficie" },
      { name: "Olio EVO", amount: { value: 3, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "montanara_a_crudo",
      title: "Condire a crudo dopo la frittura",
      description: "Friggere il dischetto in olio fino a doratura, scolarlo bene. Sul dischetto ancora caldo distribuire il pomodoro, i fiocchi di ricotta, il pecorino e il basilico; rifinire con un filo d'olio EVO. Niente cottura in forno: il condimento resta a crudo.",
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
    variant_name: "ricotta, provola e cicoli",
    preferred_for_styles: ["pizza_fritta"],
    ingredients: [
      { name: "Ricotta di pecora (siero di latte, sale)", amount: { value: 80, unit: "g" }, section: "ripieno" },
      { name: "Provola affumicata a cubetti", amount: { value: 70, unit: "g" }, section: "ripieno" },
      { name: "Cicoli napoletani (o ciccioli di maiale)", amount: { value: 40, unit: "g" }, notes: "in alternativa: solo pepe nero", section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "ripieno" },
      { name: "Pomodoro San Marzano (poco, dentro)", amount: { value: 30, unit: "g" }, optional: true, section: "ripieno" },
    ],
    assembly_steps: [{
      id: "pizza_fritta_fill_seal",
      title: "Farcire e sigillare prima di friggere",
      description: "Stendere il dischetto, distribuire ricotta, provola, cicoli e pepe su metà (eventuale velo di pomodoro). Ripiegare a mezzaluna e sigillare bene i bordi. Friggere in olio bollente finché gonfia e dora. NON si condisce sopra: il ripieno è dentro.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
      tip: {
        beginner: "È diversa dalla montanara: la montanara è aperta e condita sopra dopo la frittura; la pizza fritta è chiusa e ripiena prima di friggere.",
        nerd: "Sigillare bene i bordi è critico: una tasca aperta fa entrare olio e fa fuoriuscire il ripieno. Il vapore interno cuoce a vapore ricotta e provola mentre l'esterno frigge.",
      },
    }],
  },

  /* ─── R1/R29: farciture & condimenti regionali prima mancanti ─── */
  ciaccino_senese_farcito: {
    id: "ciaccino_senese_farcito",
    concept_ref: "ciaccino",
    preferred_for_styles: ["ciaccino_senese"],
    compatible_layouts: ["closed_stuffed"],
    ingredients: [
      { name: "Prosciutto crudo toscano", amount: { value: 80, unit: "g" }, notes: "A fette, nel ripieno", section: "ripieno" },
      { name: "Pecorino toscano semi-stagionato", amount: { value: 60, unit: "g" }, notes: "A fettine sottili", section: "ripieno" },
      { name: "Pepe nero macinato fresco", amount: { value: 1, unit: "g" }, optional: true, section: "ripieno" },
    ],
    assembly_steps: [{
      id: "ciaccino_farcitura",
      title: "Farcire la schiacciata sigillata",
      description: "Stendere due dischi sottili. Su quello inferiore distribuire prosciutto e pecorino lasciando un bordo libero, coprire col secondo disco e sigillare premendo bene. Cuocere fino a doratura: la farcitura si scalda e il pecorino fonde appena. Niente pomodoro.",
      insert_at: "after_fill_internal",
      duration_minutes: 5,
      replaces_generic: true,
      tip: {
        beginner: "Il ripieno è essenziale: prosciutto toscano e pecorino, nient'altro. È una schiacciata farcita, non una pizza condita.",
        nerd: "I dischi vanno sottili (2-3 mm): troppo spessi e il centro resta crudo prima che i bordi sigillati dorino.",
      },
    }],
  },
  white_clam_new_haven: {
    id: "white_clam_new_haven",
    concept_ref: "white_clam",
    preferred_for_styles: ["new_haven_apizza"],
    ingredients: [
      { name: "Vongole fresche sgusciate (littleneck)", amount: { value: 150, unit: "g" }, notes: "Con poco del loro liquido", section: "base" },
      { name: "Aglio fresco tritato", amount: { value: 12, unit: "g" }, section: "base" },
      { name: "Pecorino romano grattugiato", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 20, unit: "ml" }, section: "superficie" },
      { name: "Pepe nero e prezzemolo", amount: { value: 2, unit: "g" }, optional: true, section: "superficie" },
    ],
    assembly_steps: [{
      id: "white_clam_top",
      title: "Vongole, aglio e pecorino (white pie)",
      description: "Sulla base stesa distribuire le vongole sgusciate con un po' del loro liquido e l'aglio tritato. Irrorare con olio EVO, spolverare pecorino romano e origano. Niente pomodoro né mozzarella. Cuocere su pietra molto calda finché i bordi sono ben anneriti (coal-fired).",
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
      { name: "Friarielli (cime di rapa) puliti", amount: { value: 120, unit: "g" }, notes: "Saltati aglio e peperoncino", section: "base" },
      { name: "Salsiccia napoletana sbriciolata (carne di maiale, sale, pepe)", amount: { value: 100, unit: "g" }, notes: "Cruda, a tocchetti", section: "base" },
      { name: "Provola affumicata", amount: { value: 80, unit: "g" }, notes: "A cubetti", section: "base" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "friarielli_saltati",
      title: "Saltare i friarielli",
      description: "Ripassare i friarielli in padella con aglio, olio e un pizzico di peperoncino fino a quando sono morbidi e asciutti. Strizzare bene l'acqua in eccesso prima di usarli.",
      duration_minutes: 12,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "salsiccia_friarielli_top",
      title: "Provola, salsiccia e friarielli",
      description: "Distribuire la provola a cubetti sulla base (bianca, senza pomodoro). Aggiungere la salsiccia cruda a tocchetti e i friarielli saltati. Filo d'olio EVO. La salsiccia cuoce nella cottura flash; per i forni casa, pre-rosolarla.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },
  cacio_e_pepe_crema: {
    id: "cacio_e_pepe_crema",
    concept_ref: "cacio_e_pepe",
    variant_name: "post-bake",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pecorino romano grattugiato", amount: { value: 60, unit: "g" }, notes: "Per la crema", section: "superficie" },
      { name: "Pepe nero in grani macinato fresco", amount: { value: 3, unit: "g" }, section: "superficie" },
      { name: "Acqua tiepida (o poca panna)", amount: { value: 30, unit: "ml" }, notes: "Per montare la crema", section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "cacio_pepe_cream",
      title: "Montare la crema di pecorino",
      description: "Mescolare il pecorino con acqua tiepida (o poca panna) e pepe fino a ottenere una crema liscia senza grumi. Tenere da parte a temperatura ambiente.",
      duration_minutes: 5,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "cacio_pepe_postbake",
      title: "Crema a crudo sul calore residuo",
      description: "Cuocere la base bianca. Appena sfornata, stendere la crema di pecorino e pepe sul disco caldo: il calore residuo la rende setosa senza stracciarla. Macinare altro pepe sopra.",
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
      { name: "Salsa di pomodoro (passata, sale, origano)", amount: { value: 80, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Prosciutto cotto a cubetti", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Ananas (fresco o ben sgocciolato)", amount: { value: 70, unit: "g" }, notes: "A pezzetti, asciugato", section: "base" },
    ],
    assembly_steps: [{
      id: "hawaiiana_top",
      title: "Prosciutto cotto e ananas",
      description: "Stendere la salsa e la mozzarella. Distribuire prosciutto cotto e ananas ben asciugato (per non rilasciare acqua). Cuocere finché il formaggio è fuso e l'ananas leggermente caramellato.",
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
      { name: "Pelati San Marzano schiacciati a mano (pomodoro, succo di pomodoro)", amount: { value: 80, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a fette (carne di suino, sale, aromi)", amount: { value: 35, unit: "g" } },
      { name: "Funghi champignon saltati", amount: { value: 30, unit: "g" } },
      { name: "Carciofini di Paestum sottolio (carciofi, olio, sale)", amount: { value: 30, unit: "g" } },
      { name: "Olive caiazzane (o nere di Gaeta)", amount: { value: 20, unit: "g" } },
      { name: "Alici di Cetara (opzionali)", amount: { value: 10, unit: "g" }, optional: true },
      { name: "Olio EVO delle Colline Salernitane a filo", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "champignon_nap_capricciosa",
      title: "Saltare champignon",
      description: "Affettare gli champignon e saltarli 5 min in padella con un filo d'olio finché perdono acqua. Salare a fine.",
      duration_minutes: 8,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_capricciosa_nap",
      title: "Condimento Capricciosa napoletana",
      description: "Pelati schiacciati + fior di latte alla base. Distribuire prosciutto cotto, champignon saltati, carciofini di Paestum scolati e olive caiazzane. Alici di Cetara per la versione del Sud. Filo d'olio EVO.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  quattro_stagioni_napoletana: {
    id: "quattro_stagioni_napoletana",
    concept_ref: "quattro_stagioni",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pelati San Marzano schiacciati a mano (pomodoro, succo di pomodoro)", amount: { value: 80, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto (carne di suino, sale, aromi)", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Funghi champignon saltati", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Carciofini di Paestum sottolio (carciofi, olio, sale)", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Alici di Cetara e olive", amount: { value: 25, unit: "g" }, notes: "per un quadrante" },
    ],
    assembly_steps: [{
      id: "spread_4stagioni_nap",
      title: "Condimento 4 Stagioni napoletana",
      description: "Pelati + fior di latte alla base. DIVIDERE in 4 quadranti: prosciutto cotto, champignon saltati, carciofini di Paestum, alici di Cetara con olive. Ogni quadrante isolato.",
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
      title: "Condimento 4 Formaggi napoletana",
      description: "Base bianca. Distribuire il fior di latte; aggiungere provolone del Monaco e gorgonzola a tocchetti. Parmigiano in superficie. Cottura flash che fonde senza bruciare.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
      tip: {
        beginner: "Il provolone del Monaco al posto della fontina dà la nota campana: più dolce-piccante e meno burrosa.",
        nerd: "Provolone del Monaco DOP: pasta semidura da latte di vacca agerolese, stagionatura ≥6 mesi → fonde filando ma tiene la scaglia, regge i 450°C del forno a legna.",
      },
    }],
  },

  ortolana_napoletana: {
    id: "ortolana_napoletana",
    concept_ref: "ortolana",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)", amount: { value: 70, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" } },
      { name: "Melanzane fritte a cubetti", amount: { value: 45, unit: "g" } },
      { name: "Zucchine fritte", amount: { value: 45, unit: "g" } },
      { name: "Peperoni grigliati", amount: { value: 40, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" } },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "verdure_fritte_nap",
      title: "Friggere melanzane e zucchine",
      description: "Tagliare melanzane a cubetti e zucchine a fette, friggerle in olio caldo finché dorate, scolare su carta. Grigliare i peperoni e spellarli.",
      duration_minutes: 20,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_ortolana_nap",
      title: "Condimento Ortolana napoletana",
      description: "Pomodoro schiacciato + fior di latte. Distribuire melanzane e zucchine fritte e i peperoni grigliati. Basilico e olio EVO. (Versione vegetariana napoletana, con verdure fritte non grigliate).",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* ─── Firme napoletane dai cataloghi ─── */
  cosacca_napoletana: {
    id: "cosacca_napoletana",
    concept_ref: "cosacca",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)", amount: { value: 90, unit: "g" } },
      { name: "Sale fino", amount: { value: 1, unit: "g" } },
      { name: "Parmigiano Reggiano DOP 24 mesi grattugiato", amount: { value: 25, unit: "g" }, notes: "o pecorino" },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" } },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 6, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_cosacca",
      title: "Condimento Cosacca",
      description: "Stendere il pomodoro schiacciato salato. Spolverare abbondante parmigiano (o pecorino). Basilico e olio EVO. NIENTE mozzarella: è la pizza pre-Margherita.",
      insert_at: "after_shape",
      duration_minutes: 2,
      replaces_generic: true,
      tip: {
        beginner: "La Cosacca è l'antenata della Margherita: solo pomodoro, formaggio stagionato e basilico. Più sapida e asciutta.",
        nerd: "Senza mozzarella manca l'acqua di latte: la base resta più asciutta e croccante. Il parmigiano grattugiato fonde nel pomodoro creando crosticine sapide (Maillard sui bordi del formaggio).",
      },
    }],
  },

  provola_pepe_napoletana: {
    id: "provola_pepe_napoletana",
    concept_ref: "provola_pepe",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)", amount: { value: 70, unit: "g" }, notes: "ombra di pomodoro, leggera" },
      { name: "Provola affumicata campana a cubetti", amount: { value: 90, unit: "g" } },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_provola_pepe",
      title: "Condimento Provola e Pepe",
      description: "Velo di pomodoro schiacciato (l'ombra). Distribuire la provola affumicata a cubetti. Dopo cottura, generosa macinata di pepe nero, basilico e filo d'olio.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  nduja_napoletana: {
    id: "nduja_napoletana",
    concept_ref: "nduja",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Pomodoro schiacciato Casa Marrazzo (pomodoro, sale)", amount: { value: 80, unit: "g" } },
      { name: "Fior di latte campano", amount: { value: 80, unit: "g" } },
      { name: "'Nduja piccante di Spilinga (carne di maiale, peperoncino, sale)", amount: { value: 40, unit: "g" }, notes: "a fiocchi" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_nduja_nap",
      title: "Condimento 'Nduja di Spilinga",
      description: "Pomodoro schiacciato + fior di latte. Distribuire la 'nduja a piccoli fiocchi (non spalmata): in cottura si scioglie rilasciando grasso rosso piccante. Basilico e olio a fine.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: {
        beginner: "Mettila a fiocchetti piccoli e distanziati: si scioglie e si distribuisce da sola. Troppa = piccantezza che copre tutto.",
        nerd: "La 'nduja è ~30-40% grasso suino: a 450°C il grasso fonde e veicola la capsaicina e la paprika, colorando la pizza di rosso aranciato.",
      },
    }],
  },

  nerano_napoletana: {
    id: "nerano_napoletana",
    concept_ref: "nerano",
    authenticity: "signature",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    ingredients: [
      { name: "Crema di zucchine (zucchine, olio EVO, sale)", amount: { value: 80, unit: "g" }, section: "base" },
      { name: "Fior di latte campano", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Zucchine fritte a julienne", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Provolone del Monaco DOP a scaglie", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Mentuccia fresca", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO delle Colline Salernitane", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "nerano_prep",
      title: "Crema e zucchine fritte",
      description: "Friggere metà delle zucchine a julienne finché dorate. Frullare l'altra metà (saltata) con olio EVO, poca menta e sale per la crema. Tenere da parte.",
      duration_minutes: 20,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_nerano",
      title: "Condimento Nerano",
      description: "Base bianca con crema di zucchine. Distribuire il fior di latte e le zucchine fritte. Dopo cottura: scaglie di provolone del Monaco e mentuccia fresca. Filo d'olio.",
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
      { name: "Passata di pomodoro riccio a crudo, fredda (pomodoro, sale)", amount: { value: 80, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco (o riduzione di basilico)", amount: { value: 4, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO a filo", amount: { value: 6, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "sbagliata_bake",
        title: "Solo bufala in cottura",
        description: "Sul disco condire SOLO con la mozzarella di bufala a fette. Infornare e cuocere finché il cornicione gonfia e la bufala fonde. Niente pomodoro nel forno.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "sbagliata_post",
        title: "Pomodoro a crudo dopo il forno",
        description: "Appena sfornata, distribuire a cucchiaiate la passata di pomodoro a crudo fredda, il basilico e un filo d'olio. Il contrasto caldo/freddo e il pomodoro fresco sono la firma della 'sbagliata'.",
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
    bake_adjustments: {
      note: "Il pomodoro va aggiunto solo a fine cottura: resta crudo, acidulo e profumato.",
    },
  },

  scarpetta_canotto: {
    id: "scarpetta_canotto",
    concept_ref: "scarpetta",
    variant_name: "Da Lioniello",
    authenticity: "signature",
    preferred_for_styles: ["napoletana_canotto"],
    ingredients: [
      { name: "Mozzarella di bufala campana DOP (fusa in cottura)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Fonduta di Grana Padano DOP 12 mesi", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Composta di pomodoro a crudo, fredda (pomodoro, sale)", amount: { value: 70, unit: "g" }, section: "superficie" },
      { name: "Pesto di basilico", amount: { value: 10, unit: "g" }, section: "superficie" },
      { name: "Scaglie di Grana Padano DOP 24 mesi", amount: { value: 15, unit: "g" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "scarpetta_fonduta",
      title: "Fonduta di grana",
      description: "Scaldare dolcemente il Grana Padano 12 mesi con poca panna/latte fino a crema liscia. Tenere in caldo.",
      duration_minutes: 10,
      timing: "just_before_assembly",
    }],
    assembly_steps: [
      {
        id: "scarpetta_bake",
        title: "Bufala e fonduta in cottura",
        description: "Condire con la bufala e ciuffi di fonduta di grana. Infornare fino a cornicione gonfio e formaggi fusi.",
        insert_at: "after_shape",
        duration_minutes: 3,
        replaces_generic: true,
      },
      {
        id: "scarpetta_post",
        title: "Composta, pesto e grana a fine",
        description: "Fuori dal forno, distribuire la composta di pomodoro a crudo fredda, puntini di pesto di basilico e scaglie di Grana 24 mesi. Firma 'Scarpetta' di Lioniello.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto alla brace a fette (carne di suino, sale, aromi)", amount: { value: 40, unit: "g" } },
      { name: "Funghi champignon freschi affettati", amount: { value: 30, unit: "g" } },
      { name: "Carciofini sottolio alla romana (carciofi, olio, sale)", amount: { value: 30, unit: "g" } },
      { name: "Olive nere", amount: { value: 20, unit: "g" } },
      { name: "Uovo sodo (opzionale, alla romana)", amount: { value: 1, unit: "pcs" }, optional: true },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_capricciosa_rom",
      title: "Condimento Capricciosa romana",
      description: "Passata + fior di latte. Distribuire prosciutto cotto, champignon affettati, carciofini romani e olive nere. Spicchi di uovo sodo per la versione romana classica. Olio a filo.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto (carne di suino, sale, aromi)", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Funghi champignon", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Carciofini sottolio (carciofi, olio, sale)", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Olive nere", amount: { value: 20, unit: "g" }, notes: "per un quadrante" },
    ],
    assembly_steps: [{
      id: "spread_4stagioni_rom",
      title: "Condimento 4 Stagioni romana",
      description: "Passata + fior di latte. DIVIDERE in 4 quadranti: prosciutto cotto, champignon, carciofini, olive nere. Quadranti netti.",
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
      title: "Condimento 4 Formaggi romana",
      description: "Base bianca. Fior di latte, gorgonzola dolce e provola affumicata a tocchetti. Pecorino romano in superficie: la nota sapida laziale al posto del parmigiano.",
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
      title: "Grigliare le verdure",
      description: "Grigliare melanzane e zucchine a fette; cuocere al forno le fette di patate. Salare a fine.",
      duration_minutes: 22,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_ortolana_rom",
      title: "Condimento Ortolana romana",
      description: "Base bianca con fior di latte. Distribuire patate al forno, melanzane e zucchine grigliate, pomodorini datterini. Olio a filo. (Versione romana con patate e verdure grigliate).",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* ─── Firme romane dai menù ─── */
  diavola_romana: {
    id: "diavola_romana",
    concept_ref: "diavola",
    variant_name: "salame piccante",
    preferred_for_styles: ["tonda_romana", "pala_romana"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 90, unit: "g" } },
      { name: "Fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Salame piccante a fette (carne di maiale, sale, peperoncino)", amount: { value: 50, unit: "g" } },
      { name: "Origano secco", amount: { value: 1, unit: "g" }, section: "superficie" },
      { name: "Pecorino romano DOP grattugiato", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_diavola_rom",
      title: "Condimento Diavola romana",
      description: "Passata + fior di latte. Fette di salame piccante distribuite. Origano e pecorino romano spolverati, filo d'olio. Sulla tonda scrocchiarella il salame diventa croccante.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 85, unit: "g" } },
      { name: "Provola affumicata campana a cubetti", amount: { value: 85, unit: "g" } },
      { name: "Pepe nero macinato fresco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_provola_pepe_tonda",
      title: "Condimento Provola e Pepe (tonda)",
      description: "Passata + provola affumicata a cubetti sulla base sottilissima. Dopo cottura, macinata di pepe nero e basilico. La scrocchiarella regge l'affumicato senza ammollarsi.",
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
      { name: "Passata di pomodoro speziata (pomodoro, sale, peperoncino)", amount: { value: 85, unit: "g" } },
      { name: "Provola affumicata campana a cubetti", amount: { value: 80, unit: "g" } },
      { name: "Salame piccante tipo pepperoni a fette", amount: { value: 45, unit: "g" } },
      { name: "Miele aromatizzato alla 'nduja", amount: { value: 12, unit: "g" }, notes: "a filo dopo cottura", section: "superficie" },
      { name: "Pecorino romano DOP grattugiato", amount: { value: 10, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_hot_honey",
      title: "Condimento Hot Honey",
      description: "Passata speziata + provola + pepperoni. Cuocere. Fuori dal forno, filo di miele alla 'nduja e pecorino romano: dolce-piccante sul croccante della tonda.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
      tip: {
        beginner: "Il miele va SEMPRE dopo il forno: a caldo si caramella e diventa amaro. A filo sulla pizza calda resta lucido e dolce.",
        nerd: "Lo zucchero del miele (fruttosio) imbrunisce già a ~110°C: in forno a 320°C brucerebbe. Aggiunto post-bake sfrutta solo il calore residuo (~70°C) restando fluido.",
      },
    }],
  },

  bresaola_rucola_tonda: {
    id: "bresaola_rucola_tonda",
    concept_ref: "bresaola_rucola",
    authenticity: "signature",
    preferred_for_styles: ["tonda_romana"],
    ingredients: [
      { name: "Fior di latte", amount: { value: 85, unit: "g" }, section: "base" },
      { name: "Bresaola della Valtellina IGP a fette (carne di manzo, sale)", amount: { value: 50, unit: "g" }, section: "superficie" },
      { name: "Rucola selvatica fresca", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Scaglie di Parmigiano Reggiano 24 mesi", amount: { value: 15, unit: "g" }, section: "superficie" },
      { name: "Zest di limone grattugiato", amount: { value: 1, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "bresaola_bake",
        title: "Cottura in bianco con mozzarella",
        description: "Condire solo con fior di latte e cuocere la tonda finché croccante e il formaggio è fuso.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "bresaola_post",
        title: "Bresaola, rucola e grana a crudo",
        description: "Fuori dal forno, adagiare la bresaola a fette, la rucola, le scaglie di grana, una grattata di zest di limone e un filo d'olio. Tutto a crudo per restare fresco.",
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },

  nduja_pinsa: {
    id: "nduja_pinsa",
    concept_ref: "nduja",
    variant_name: "Sapori del Sole",
    authenticity: "signature",
    preferred_for_styles: ["pinsa_romana"],
    ingredients: [
      { name: "'Nduja piccante di Spilinga (carne di maiale, peperoncino, sale)", amount: { value: 40, unit: "g" }, section: "base", notes: "a fiocchi, fusa in cottura" },
      { name: "Stracciatella di burrata fresca (mozzarella, panna)", amount: { value: 70, unit: "g" }, section: "superficie", notes: "a crudo dopo cottura" },
      { name: "Pomodorini datterini freschi", amount: { value: 50, unit: "g" }, section: "superficie", notes: "a crudo dopo cottura" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "nduja_pinsa_bake",
        title: "'Nduja in cottura",
        description: "Sulla pinsa stesa distribuire la 'nduja a fiocchi e infornare: si scioglie e insaporisce la base croccante.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "nduja_pinsa_post",
        title: "Stracciatella e datterini a freddo",
        description: "Fuori dal forno, ciuffi di stracciatella e datterini freschi disposti a crudo. Il fresco-cremoso bilancia il piccante. Filo d'olio.",
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
      { name: "Rosmarino fresco", amount: { value: 3, unit: "pcs" }, notes: "aghi", section: "superficie" },
      { name: "Fior di sale", amount: { value: 2, unit: "g" }, notes: "a fine cottura", section: "superficie" },
      { name: "Olio EVO", amount: { value: 12, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "patate_mandolina_rom",
      title: "Affettare e ammollare le patate",
      description: "Affettare le patate a 1-2 mm con la mandolina, ammollarle 20 min in acqua fredda per togliere l'amido, scolare e asciugare bene.",
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_patate_rosmarino",
      title: "Condimento Patate e Rosmarino",
      description: "Su base (bianca o con velo di fior di latte) disporre le patate a scaglie sovrapposte. Olio EVO e rosmarino. Salare SOLO a fine cottura per non bagnare la base.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
    bake_adjustments: {
      additional_minutes: 4,
      note: "Le patate richiedono qualche minuto in più per dorarsi e arricciarsi ai bordi.",
    },
  },

  stracciata_bottarga_pala: {
    id: "stracciata_bottarga_pala",
    concept_ref: "stracciata_bottarga",
    variant_name: "Roscioli",
    authenticity: "signature",
    preferred_for_styles: ["pala_romana"],
    ingredients: [
      { name: "Stracciatella di burrata fresca pugliese (mozzarella, panna)", amount: { value: 90, unit: "g" }, section: "superficie", notes: "a crudo dopo cottura" },
      { name: "Zucchine romanesche alla scapece (zucchine, aceto, menta)", amount: { value: 60, unit: "g" }, section: "superficie" },
      { name: "Bottarga di muggine grattugiata", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 6, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "stracciata_bake",
        title: "Pala bianca in cottura",
        description: "Cuocere la pala in bianco (solo olio e sale) fino a doratura e alveolatura aperta.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "stracciata_post",
        title: "Stracciatella, scapece e bottarga",
        description: "Fuori dal forno, ciuffi di stracciatella, zucchine alla scapece e una pioggia di bottarga di muggine grattugiata. Filo d'olio. Tutto a crudo.",
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
      { name: "Salsa di pomodoro stile Santa Barbara (passata, origano, zucchero, aglio)", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture grattugiata", amount: { value: 130, unit: "g" }, section: "base" },
      { name: "Pecorino romano grattugiato", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 4, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_cheese_ny",
      title: "Salsa e mozzarella fino al bordo",
      description: "Stendere la salsa lasciando 1 cm di bordo. Coprire con abbondante mozzarella low-moisture quasi fino al cornicione. Pecorino e filo d'olio. La slice deve restare grande e pieghevole.",
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
      { name: "Ricotta vaccina montata", amount: { value: 60, unit: "g" }, notes: "a ciuffi", section: "base" },
      { name: "Spinaci freschi saltati", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Aglio fresco tritato", amount: { value: 6, unit: "g" }, section: "base" },
      { name: "Pecorino romano grattugiato", amount: { value: 8, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_white_ny",
      title: "White pie senza pomodoro",
      description: "Niente salsa. Distribuire mozzarella, ciuffi di ricotta montata, spinaci saltati e aglio. Pecorino e olio. Cottura su pietra/acciaio.",
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
      { name: "Salsa di pomodoro Santa Barbara (passata, origano, aglio)", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Salame pepperoni a fette", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Salsiccia di maiale sbriciolata", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Peperoni verdi a rondelle", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Cipolla bianca affettata", amount: { value: 25, unit: "g" }, section: "base" },
      { name: "Funghi champignon affettati", amount: { value: 30, unit: "g" }, section: "base" },
    ],
    assembly_steps: [{
      id: "spread_supreme_ny",
      title: "Condimento Supreme",
      description: "Salsa + mozzarella. Distribuire pepperoni, salsiccia cruda sbriciolata, peperoni verdi, cipolla e funghi. Il classico carico americano completo.",
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
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 200, unit: "g" }, notes: "fino ai bordi: cheese crown / frico", section: "crosta" },
      { name: "Salsa vodka (pomodoro, panna, vodka, cipolla)", amount: { value: 100, unit: "g" }, notes: "a strisce in superficie", section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 12, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_vodka_detroit",
      title: "Cheese crown e strisce di vodka",
      description: "Brick cheese fino ai bordi della teglia (caramella in frico). Dopo cottura, strisce di salsa vodka calda, basilico e pecorino. La salsa va SOPRA, come da stile Detroit.",
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
      { name: "Mozzarella a fette", amount: { value: 180, unit: "g" }, notes: "sul fondo, protegge l'impasto", section: "base" },
      { name: "Straccetti di manzo brasato (Italian beef) nel proprio brodo", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Giardiniera piccante tritata (verdure sott'aceto)", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi (San Marzano)", amount: { value: 200, unit: "g" }, notes: "salsa grezza in superficie", section: "superficie" },
      { name: "Parmigiano grattugiato", amount: { value: 15, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_italian_beef",
      title: "Strati invertiti con Italian beef",
      description: "Foderare lo stampo profondo. Mozzarella a fette sul fondo, poi l'Italian beef e la giardiniera. Coprire con la polpa di pomodoro a pezzi e parmigiano. Cottura lunga.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  supreme_tavern: {
    id: "supreme_tavern",
    concept_ref: "supreme",
    variant_name: "party cut",
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
      title: "Carico leggero su base cracker",
      description: "Sulla base sottilissima, salsa e mozzarella fino al bordo. Distribuire salsiccia, pepperoni e peperoni in modo uniforme (si taglia a quadrotti). Pochi strati per restare croccante.",
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
      { name: "Mozzarella fior di latte fresca", amount: { value: 110, unit: "g" }, notes: "alla base, a contatto con la teglia oliata", section: "base" },
      { name: "Salsa marinara densa di pomodori confit (pomodoro, aglio, olio)", amount: { value: 90, unit: "g" }, notes: "a cucchiaiate sopra il formaggio", section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 12, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 6, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_grandma",
      title: "Formaggio sotto, salsa a cucchiaiate sopra",
      description: "Sulla teglia oliata distribuire la mozzarella a contatto con la base (frico sul fondo). Sopra, cucchiaiate asimmetriche di marinara densa. Pecorino, basilico e olio. Stile Grandma di Long Island.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  vodka_grandma: {
    id: "vodka_grandma",
    concept_ref: "vodka_pizza",
    variant_name: "Buzzy",
    preferred_for_styles: ["grandma_style"],
    authenticity: "signature",
    ingredients: [
      { name: "Mozzarella fior di latte fresca", amount: { value: 110, unit: "g" }, section: "base" },
      { name: "Salsa vodka (pomodoro, panna, prosciutto, vodka)", amount: { value: 100, unit: "g" }, notes: "a cucchiaiate sopra", section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 12, unit: "g" }, section: "superficie" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_vodka_grandma",
      title: "Grandma alla vodka",
      description: "Mozzarella alla base, cucchiaiate di salsa vodka cremosa sopra, pecorino e basilico. Fondo croccante grazie all'olio in teglia.",
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
      { name: "Polpa di pomodoro San Marzano (pomodoro, sale)", amount: { value: 130, unit: "g" }, section: "base" },
      { name: "Aglio fresco tritato", amount: { value: 8, unit: "g" }, section: "base" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Pecorino romano grattugiato", amount: { value: 18, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 12, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_tomato_pie",
      title: "Tomato pie senza mozzarella",
      description: "Solo pomodoro San Marzano e aglio sulla base sottile. Origano, abbondante pecorino e olio. Niente mozzarella (è il famoso 'plain tomato pie'). Cottura a carbone fino a crosta annerita.",
      insert_at: "after_shape",
      duration_minutes: 3,
      replaces_generic: true,
    }],
  },

  bbq_chicken_california: {
    id: "bbq_chicken_california",
    concept_ref: "bbq_chicken",
    variant_name: "Wolfgang Puck",
    preferred_for_styles: ["california_style"],
    authenticity: "signature",
    ingredients: [
      { name: "Salsa barbecue", amount: { value: 80, unit: "g" }, notes: "al posto del pomodoro", section: "base" },
      { name: "Mozzarella (o mix con gouda affumicato)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Pollo cotto glassato alla barbecue", amount: { value: 80, unit: "g" }, section: "base" },
      { name: "Cipolla rossa affettata sottile", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Coriandolo fresco", amount: { value: 4, unit: "pcs" }, notes: "a crudo dopo cottura", section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_bbq_chicken",
      title: "BBQ chicken alla californiana",
      description: "Salsa barbecue al posto del pomodoro. Mozzarella, pollo glassato e cipolla rossa. Dopo cottura, coriandolo fresco. La pizza gourmet anni '80 di Wolfgang Puck.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  smoked_salmon_california: {
    id: "smoked_salmon_california",
    concept_ref: "smoked_salmon",
    variant_name: "Spago",
    preferred_for_styles: ["california_style"],
    authenticity: "signature",
    ingredients: [
      { name: "Crème fraîche", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Mozzarella", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Salmone affumicato", amount: { value: 60, unit: "g" }, notes: "a crudo dopo cottura", section: "superficie" },
      { name: "Aneto fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Cipolla rossa a velo", amount: { value: 20, unit: "g" }, section: "superficie" },
      { name: "Capperi", amount: { value: 8, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "salmon_bake",
        title: "Base bianca con crème fraîche",
        description: "Cuocere la base sottile con crème fraîche e mozzarella, senza salmone.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "salmon_post",
        title: "Salmone a crudo dopo il forno",
        description: "Fuori dal forno, adagiare il salmone affumicato, aneto, cipolla rossa a velo e capperi. Il salmone resta crudo: la firma di Spago.",
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
      title: "Feta, kalamata e cipolla",
      description: "Nel padellino unto, salsa e mix mozzarella-cheddar. Distribuire feta, olive kalamata e cipolla rossa. Origano. Fondo fritto e croccante dall'abbondante olio.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* Greek pan: il diner-classic plain cheese (mix mozzarella + cheddar). */
  greek_cheese_pan: {
    id: "greek_cheese_pan",
    concept_ref: "cheese_pizza",
    variant_name: "Greek pan",
    preferred_for_styles: ["greek_pan"],
    ingredients: [
      { name: "Salsa di pomodoro all'origano", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mix mozzarella e cheddar", amount: { value: 120, unit: "g" }, section: "base" },
      { name: "Origano secco", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_greek_cheese",
      title: "Plain cheese nel padellino",
      description: "Salsa all'origano e abbondante mix mozzarella-cheddar fino al bordo del padellino unto. Il fondo frigge nell'olio restando croccante. Il cheese dei diner greco-americani.",
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
    variant_name: "Pizzarium",
    preferred_for_styles: ["teglia_romana"],
    authenticity: "signature",
    ingredients: [
      { name: "Crema di zucca arrosto (zucca, noce moscata, sale)", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Speck artigianale a fette", amount: { value: 50, unit: "g" }, notes: "a freddo dopo cottura", section: "superficie" },
      { name: "Caciocavallo campano a scaglie", amount: { value: 30, unit: "g" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "zucca_speck_bake",
        title: "Crema di zucca in cottura",
        description: "Stendere la crema di zucca sulla teglia ad alta idratazione e cuocere fino a base dorata e mollica spumosa.",
        insert_at: "after_shape",
        duration_minutes: 3,
        replaces_generic: true,
      },
      {
        id: "zucca_speck_post",
        title: "Speck e caciocavallo a freddo",
        description: "Fuori dal forno, adagiare lo speck a fette e le scaglie di caciocavallo sul caldo. Filo d'olio. Lo speck resta morbido, non cotto.",
        insert_at: "after_bake",
        duration_minutes: 2,
      },
    ],
  },

  burrata_salmone_bonci: {
    id: "burrata_salmone_bonci",
    concept_ref: "burrata_salmone",
    variant_name: "Pizzarium",
    preferred_for_styles: ["teglia_romana"],
    authenticity: "signature",
    ingredients: [
      { name: "Olio EVO e sale per la cottura in bianco", amount: { value: 10, unit: "ml" }, section: "base" },
      { name: "Stracciatella di burrata pugliese (mozzarella, panna)", amount: { value: 80, unit: "g" }, notes: "a crudo dopo cottura", section: "superficie" },
      { name: "Salmone scozzese affumicato a freddo", amount: { value: 60, unit: "g" }, section: "superficie" },
      { name: "Zest di limone e aneto fresco", amount: { value: 3, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "burrata_salmone_bake",
        title: "Teglia in bianco",
        description: "Cuocere la teglia in bianco (olio e sale) fino a doratura e alveolatura aperta.",
        insert_at: "after_shape",
        duration_minutes: 2,
        replaces_generic: true,
      },
      {
        id: "burrata_salmone_post",
        title: "Stracciatella e salmone a freddo",
        description: "Fuori dal forno, ciuffi di stracciatella, fette di salmone affumicato, zest di limone e aneto. Tutto a crudo.",
        insert_at: "after_bake",
        duration_minutes: 3,
      },
    ],
  },

  focaccia_cipolle_genovese: {
    id: "focaccia_cipolle_genovese",
    concept_ref: "focaccia_cipolle",
    preferred_for_styles: ["focaccia_genovese"],
    ingredients: [
      { name: "Cipolle dorate a fette sottili", amount: { value: 120, unit: "g" }, section: "superficie" },
      { name: "Salamoia (acqua, olio EVO, sale)", amount: { value: 30, unit: "ml" }, section: "superficie" },
      { name: "Olio EVO ligure", amount: { value: 15, unit: "ml" }, section: "superficie" },
      { name: "Sale grosso", amount: { value: 3, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_cipolle_genovese",
      title: "Cipolle e salamoia nelle fossette",
      description: "Distribuire le cipolle a fette sulla focaccia prima della lievitazione finale. Versare la salamoia nelle fossette dei polpastrelli, olio EVO e sale grosso. Le cipolle stufano in cottura.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  sardenaira_sanremo: {
    id: "sardenaira_sanremo",
    concept_ref: "sardenaira",
    variant_name: "De.Co. di Sanremo",
    preferred_for_styles: ["focaccia_genovese"],
    authenticity: "canonical",
    ingredients: [
      { name: "Salsa densa di pomodoro cotta con cipolla (pomodoro, cipolla, olio)", amount: { value: 150, unit: "g" }, section: "base" },
      { name: "Acciughe salate dissalate", amount: { value: 25, unit: "g" }, section: "base" },
      { name: "Aglio in camicia schiacciato", amount: { value: 3, unit: "pcs" }, section: "base" },
      { name: "Olive taggiasche in salamoia", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Capperi dissalati", amount: { value: 15, unit: "g" }, section: "superficie" },
      { name: "Origano selvatico secco", amount: { value: 2, unit: "g" }, section: "superficie" },
      { name: "Olio EVO ligure", amount: { value: 20, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_sardenaira",
      title: "Condire la Sardenaira",
      description: "Stendere la salsa densa di pomodoro e cipolla sull'impasto alto e soffice. Affondare le acciughe e gli spicchi d'aglio in camicia. Distribuire olive taggiasche, capperi e origano; abbondante olio EVO. Cottura lenta in teglia. Non è una pizza: è una focaccia condita.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  sfincione_bianco_bagherese: {
    id: "sfincione_bianco_bagherese",
    concept_ref: "sfincione_bianco",
    variant_name: "bagherese",
    preferred_for_styles: ["sfincione"],
    ingredients: [
      { name: "Acciughe salate sciolte in olio EVO", amount: { value: 25, unit: "g" }, section: "base" },
      { name: "Tuma fresca (o primosale) a fette", amount: { value: 120, unit: "g" }, notes: "affondata nell'impasto", section: "base" },
      { name: "Cipolle bianche stufate lentamente", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Caciocavallo stagionato grattugiato", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Mollica di pane tostata all'origano", amount: { value: 40, unit: "g" }, section: "superficie" },
      { name: "Pepe nero e olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    pre_prep_steps: [{
      id: "bagherese_prep",
      title: "Cipolle stufate e mollica tostata",
      description: "Stufare le cipolle bianche dolcemente in olio. A parte, tostare la mollica di pane in padella con origano e un filo d'olio.",
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_sfincione_bianco",
      title: "Sfincione bianco senza pomodoro",
      description: "Niente pomodoro. Affondare nell'impasto le fette di tuma e le acciughe sciolte. Coprire con le cipolle stufate, il caciocavallo grattugiato e la mollica tostata. Pepe e olio. La variante di Bagheria.",
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
      { name: "'Nduja piccante di Spilinga", amount: { value: 40, unit: "g" }, notes: "a pezzetti, prima della chiusura", section: "ripieno" },
      { name: "Olio EVO ligure", amount: { value: 10, unit: "ml" }, section: "superficie" },
      { name: "Sale fino", amount: { value: 2, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "recco_nduja_fill",
      title: "Crescenza e 'nduja tra le sfoglie",
      description: "Tra la sfoglia inferiore e superiore distribuire la crescenza a pezzetti e, qua e là, la 'nduja. Sigillare i bordi, bucherellare. Olio e sale in superficie. La 'nduja si scioglie nel ripieno fondente.",
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
      { name: "Culatello di Zibello DOP a fette sottili", amount: { value: 60, unit: "g" }, notes: "a crudo dopo cottura", section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "recco_culatello_fill",
        title: "Crescenza tra le sfoglie",
        description: "Distribuire la crescenza tra le due sfoglie sottilissime, sigillare i bordi, bucherellare, olio e sale. Cuocere a 300-320°C.",
        insert_at: "after_fill_internal",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "recco_culatello_post",
        title: "Culatello a crudo dopo il forno",
        description: "Appena sfornata, adagiare le fette di Culatello di Zibello DOP sulla focaccia caldissima: si scalda appena e resta morbido.",
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
      { name: "Prosciutto cotto artigianale Millefiori a fette", amount: { value: 60, unit: "g" }, notes: "a crudo dopo cottura", section: "superficie" },
    ],
    assembly_steps: [
      {
        id: "recco_cotto_fill",
        title: "Crescenza tra le sfoglie",
        description: "Crescenza tra le due sfoglie, sigillare, bucherellare, olio e sale. Cuocere fino a bolle dorate.",
        insert_at: "after_fill_internal",
        duration_minutes: 4,
        replaces_generic: true,
      },
      {
        id: "recco_cotto_post",
        title: "Cotto Millefiori in uscita dal forno",
        description: "Adagiare le fette di prosciutto cotto Millefiori sulla focaccia appena sfornata.",
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
      title: "Crescenza dentro, pomodoro e acciughe sopra",
      description: "Crescenza tra le due sfoglie sottili, sigillare e bucherellare. In superficie qualche cucchiaio di passata, acciughe, olive taggiasche e capperi. Olio EVO. La versione 'pizzata' della Recco.",
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
      { name: "Passata di pomodoro pelato italiano (pomodoro, sale)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_padellino",
      title: "Condimento Margherita al padellino",
      description: "Sull'impasto lievitato nel padellino oliato, stendere la passata e il fior di latte. Basilico e olio. Il fondo frigge nell'olio del tegamino restando croccante, l'interno soffice.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Salame piccante a fette", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Basilico fresco", amount: { value: 2, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_diavola_padellino",
      title: "Condimento Diavola al padellino",
      description: "Passata e fior di latte nel padellino. Distribuire il salame piccante a fette. Basilico e olio. Il salame si fa croccante in cottura.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 85, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 95, unit: "g" }, section: "base" },
      { name: "Prosciutto cotto di alta qualità", amount: { value: 35, unit: "g" }, section: "base" },
      { name: "Funghi champignon freschi affettati", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Carciofini cotti sott'olio", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Olive nere", amount: { value: 20, unit: "g" }, section: "base" },
      { name: "Capperi e olio EVO", amount: { value: 8, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_capricciosa_padellino",
      title: "Condimento Capricciosa al padellino",
      description: "Passata + fior di latte. Distribuire prosciutto cotto, champignon, carciofini, olive nere e capperi. Olio a filo. Versione torinese ricca.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 90, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte fusa", amount: { value: 95, unit: "g" }, section: "base" },
      { name: "Tonno sott'olio di qualità sgocciolato", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Cipolla rossa di Tropea affettata", amount: { value: 30, unit: "g" }, section: "base" },
      { name: "Origano e olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_tonno_padellino",
      title: "Condimento Tonno e Cipolla",
      description: "Passata + fior di latte. Distribuire il tonno sgocciolato e la cipolla rossa a velo. Origano e olio. Semplice e saporito.",
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
      { name: "Mozzarella fior di latte fusa", amount: { value: 95, unit: "g" }, notes: "base bianca", section: "base" },
      { name: "Pere fresche dolci a fette sottili", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Gorgonzola DOP cremoso", amount: { value: 40, unit: "g" }, notes: "a tocchetti", section: "base" },
      { name: "Olio EVO", amount: { value: 4, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_gorgo_pere",
      title: "Condimento Gorgonzola e Pere",
      description: "Base bianca: fior di latte, fette sottili di pera e gorgonzola a tocchetti. Niente pomodoro. In cottura le pere si ammorbidiscono e il gorgonzola fonde: dolce-salato.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte abbondante", amount: { value: 120, unit: "g" }, notes: "cola sui lati del trancio alto", section: "base" },
      { name: "Basilico fresco", amount: { value: 3, unit: "pcs" }, section: "superficie" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_margherita_trancio",
      title: "Condimento Margherita al trancio",
      description: "Sull'impasto alto e soffice in teglia, passata e abbondante mozzarella che in cottura cola lungo i lati. Basilico e olio. Fondo dorato e croccante dall'olio in teglia.",
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
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Mozzarella fior di latte abbondante", amount: { value: 120, unit: "g" }, section: "base" },
      { name: "Salame piccante a fette", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spread_diavola_trancio",
      title: "Condimento Diavola al trancio",
      description: "Passata e abbondante mozzarella, salame piccante a fette. Olio a filo. Il trancio milanese spesso e soffice con fondo croccante.",
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
    variant_name: "The Founders",
    preferred_for_styles: ["detroit"],
    authenticity: "signature",
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 220, unit: "g" }, notes: "fino ai bordi: cheese crown", section: "crosta" },
      { name: "Salame pepperoni (Ezzo)", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Jalapeños stufati sotto aceto", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Salsa di pomodoro rossa a strisce", amount: { value: 90, unit: "g" }, notes: "post-cottura", section: "superficie" },
      { name: "Miele piccante fuso", amount: { value: 15, unit: "g" }, notes: "a filo dopo cottura", section: "superficie" },
    ],
    assembly_steps: [{
      id: "founders_assembly",
      title: "Cheese crown, pepperoni, jalapeños e hot honey",
      description: "Brick cheese fino ai bordi (frico), pepperoni e jalapeños sopra. Dopo cottura, strisce di salsa rossa e un filo di miele piccante. Dolce-piccante con la crosta caramellata.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  hawaiiana_detroit: {
    id: "hawaiiana_detroit",
    concept_ref: "hawaiiana",
    variant_name: "Big Hawaiian",
    preferred_for_styles: ["detroit"],
    authenticity: "experimental",
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 200, unit: "g" }, notes: "fino ai bordi", section: "crosta" },
      { name: "Salame pepperoni (Ezzo)", amount: { value: 60, unit: "g" }, section: "base" },
      { name: "Bacon affumicato croccante", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Ananas fresco a cubetti caramellato", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Glassa dolce al peperoncino", amount: { value: 12, unit: "g" }, notes: "post-cottura", section: "superficie" },
    ],
    assembly_steps: [{
      id: "big_hawaiian_assembly",
      title: "Pepperoni, bacon, ananas e glassa piccante",
      description: "Brick cheese ai bordi. Pepperoni, bacon e ananas caramellato. Dopo cottura, glassa dolce al peperoncino. La hawaiana in versione Detroit.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  meat_lovers_detroit: {
    id: "meat_lovers_detroit",
    concept_ref: "meat_lovers",
    variant_name: "Meatsiah",
    preferred_for_styles: ["detroit"],
    ingredients: [
      { name: "Brick cheese del Wisconsin a cubetti", amount: { value: 200, unit: "g" }, notes: "fino ai bordi", section: "crosta" },
      { name: "Salame pepperoni (Ezzo)", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Salsiccia italiana sbriciolata", amount: { value: 50, unit: "g" }, section: "base" },
      { name: "Bacon affumicato croccante", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Straccetti di controfiletto di manzo", amount: { value: 40, unit: "g" }, section: "base" },
      { name: "Salsa di pomodoro rossa a strisce", amount: { value: 90, unit: "g" }, notes: "post-cottura", section: "superficie" },
    ],
    assembly_steps: [{
      id: "meatsiah_assembly",
      title: "Quattro carni e cheese crown",
      description: "Brick cheese ai bordi. Distribuire pepperoni, salsiccia, bacon e straccetti di manzo. Dopo cottura, strisce di salsa rossa. La 'Meatsiah'.",
      insert_at: "after_shape",
      duration_minutes: 5,
      replaces_generic: true,
    }],
  },

  /* Chicago Deep Dish — lineup Giordano's (strati invertiti) */
  supreme_chicago: {
    id: "supreme_chicago",
    concept_ref: "supreme",
    variant_name: "The Special",
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 180, unit: "g" }, notes: "sul fondo", section: "base" },
      { name: "Salsiccia fresca sbriciolata (senza nitrati)", amount: { value: 100, unit: "g" }, section: "ripieno" },
      { name: "Funghi champignon affettati", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Peperoni verdi dolci", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Cipolla bianca tritata", amount: { value: 30, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi (San Marzano)", amount: { value: 220, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "special_assembly",
      title: "Strati invertiti: The Special",
      description: "Foderare lo stampo profondo. Mozzarella sul fondo, poi salsiccia, funghi, peperoni e cipolla. Coprire con la polpa di pomodoro a pezzi. Cottura lunga.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  spinaci_chicago: {
    id: "spinaci_chicago",
    concept_ref: "spinaci",
    variant_name: "Fresh Spinach",
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 160, unit: "g" }, notes: "sul fondo", section: "base" },
      { name: "Spinaci freschi al vapore", amount: { value: 120, unit: "g" }, section: "ripieno" },
      { name: "Mix di quattro formaggi fondenti", amount: { value: 80, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi", amount: { value: 200, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "spinach_assembly",
      title: "Spinaci e quattro formaggi nel guscio",
      description: "Mozzarella sul fondo, poi spinaci al vapore e il mix di formaggi. Coprire con la polpa di pomodoro. Versione vegetariana del deep dish.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  meat_lovers_chicago: {
    id: "meat_lovers_chicago",
    concept_ref: "meat_lovers",
    variant_name: "Meat and More Meat",
    preferred_for_styles: ["chicago_deep"],
    ingredients: [
      { name: "Mozzarella a fette", amount: { value: 170, unit: "g" }, notes: "sul fondo", section: "base" },
      { name: "Salame pepperoni", amount: { value: 50, unit: "g" }, section: "ripieno" },
      { name: "Salame milanese dolce", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Salsiccia fresca sbriciolata", amount: { value: 60, unit: "g" }, section: "ripieno" },
      { name: "Bacon affumicato croccante", amount: { value: 40, unit: "g" }, section: "ripieno" },
      { name: "Polpa di pomodoro a pezzi", amount: { value: 200, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "meat_chicago_assembly",
      title: "Quattro carni nel guscio profondo",
      description: "Mozzarella sul fondo, poi pepperoni, milanese, salsiccia e bacon. Coprire con la polpa di pomodoro. Cottura lunga.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  /* Chicago Tavern — base cracker, party cut */
  cheese_tavern: {
    id: "cheese_tavern",
    concept_ref: "cheese_pizza",
    variant_name: "Tavern (party cut)",
    preferred_for_styles: ["chicago_tavern"],
    ingredients: [
      { name: "Salsa di pomodoro", amount: { value: 70, unit: "g" }, section: "base" },
      { name: "Mozzarella low-moisture", amount: { value: 100, unit: "g" }, section: "base" },
      { name: "Origano secco", amount: { value: 1, unit: "g" }, section: "superficie" },
    ],
    assembly_steps: [{
      id: "tavern_cheese_assembly",
      title: "Plain cheese su base cracker",
      description: "Salsa e mozzarella fino al bordo della base sottilissima. Cottura su pietra finché rigida e croccante. Tagliata a quadrotti (party cut).",
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
      title: "Capricciosa al trancio",
      description: "Passata e abbondante mozzarella sull'impasto alto. Distribuire cotto, funghi, carciofini e olive. Fondo croccante dall'olio in teglia.",
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
      title: "Prosciutto e funghi al trancio",
      description: "Passata e mozzarella. Distribuire prosciutto cotto e champignon. Il grande classico al trancio milanese.",
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
      title: "Quattro formaggi al trancio",
      description: "Base bianca con mozzarella, gorgonzola e fontina a tocchetti. Parmigiano in superficie. Sull'impasto alto e soffice milanese.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

};

export function resolveTopping(
  conceptId: string,
  style: PizzaStyle,
): ToppingRecipe | undefined {
  /* Per-stile, punto: la variante di un concept per uno stile è SOLO quella
   * esplicitamente assegnata a quello stile (preferred_for_styles). Niente
   * fallback per famiglia o "generico": ogni stile ha i suoi condimenti. */
  return Object.values(TOPPING_LIBRARY).find(
    (r) =>
      r.concept_ref === conceptId &&
      (r.preferred_for_styles?.includes(style.id) ?? false) &&
      !r.taboo_for_styles?.includes(style.id),
  );
}

/* ═══ API esistenti (backward compat) ═══ */

/** Risolve un topping per ID nel contesto di uno Style.
 *  Se ID è un concept, usa il resolver per scegliere la variante giusta.
 *  Se ID è una recipe specifica, ritorna quella. */
export function getToppingForStyle(
  id: string,
  style: PizzaStyle,
): ToppingRecipe | undefined {
  // 1. Match diretto su recipe id (priorità: l'utente ha scelto esplicitamente)
  const direct = TOPPING_LIBRARY[id];
  if (direct) return direct;

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
  pizza_fritta: ["pizza_fritta", "montanara", "ricotta_cicoli"],
  calzone_napoletano: ["calzone", "ricotta_cicoli", "scarola"],
  new_haven_apizza: ["white_clam", "tomato_pie"],
  fugazzeta: ["fugazzeta", "fugazza"],
  california_style: ["bbq_chicken", "margherita", "smoked_salmon", "hawaiiana"],
  greek_pan: ["greek_feta", "cheese_pizza", "diavola", "ortolana"],
};

const REPRESENTATIVE_CONCEPT_ORDER_BY_FAMILY: Partial<Record<FamilyId, readonly string[]>> = {
  napoletana: ["margherita", "marinara", "diavola", "salsiccia_friarielli"],
  romana: ["margherita", "marinara", "bianca", "capricciosa", "boscaiola"],
  americana: ["cheese_pizza", "diavola", "supreme", "margherita"],
  contemporanea: ["bianca", "margherita"],
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

export function getRecipesByAuthenticity(style: PizzaStyle): Array<{
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
  const styleLayout = style.layout?.type as LayoutType | undefined;
  const layoutIncompatible = (recipe: ToppingRecipe): boolean => {
    if (!styleLayout) return false;
    if (recipe.compatible_layouts) return !recipe.compatible_layouts.includes(styleLayout);
    return SEALED_LAYOUTS.has(styleLayout);
  };
  const defaultTopping = style.default_topping_ref
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
      authenticity: recipe.authenticity ?? "natural",
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
    .map(({ recipe, authenticity }) => ({ recipe, authenticity }));
}
