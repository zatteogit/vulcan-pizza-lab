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
import thumbnailMargherita from "../../assets/pizzas/verace.png";
import thumbnailMarinara from "../../assets/toppings/topping_marinara.png";
import thumbnailBianca from "../../assets/toppings/topping_bianca.png";
import thumbnailBoscaiola from "../../assets/toppings/topping_boscaiola.png";
import thumbnailDiavola from "../../assets/toppings/topping_diavola.png";
import thumbnailCapricciosa from "../../assets/toppings/topping_capricciosa.png";
import thumbnail4Formaggi from "../../assets/toppings/topping_4formaggi.png";
import thumbnailOrtolana from "../../assets/toppings/topping_ortolana.png";
import thumbnailPatatePorchetta from "../../assets/toppings/topping_patateporchetta.png";
import thumbnailBiancaMortazza from "../../assets/toppings/topping_mortadellapistacchio.png";
import thumbnailCacioEPepe from "../../assets/toppings/topping_cacioepepe.png";
import thumbnailSalsicciaFriarielli from "../../assets/toppings/topping_friarellisalsiccia.png";
import thumbnailCrescenzaRecco from "../../assets/toppings/topping_crescenzarecco.png";

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
    thumbnail: thumbnailCapricciosa, // Riusa la foto della capricciosa (stessi ingredienti)
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
    thumbnail: thumbnailCacioEPepe,
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
  // VPL-B1/B2: condimenti regionali specifici (de-genericizzazione)
  sfincione: {
    id: "sfincione",
    name: "Sfincione Palermitano",
    description: "Salsa di pomodoro e cipolla, caciocavallo, acciughe e pangrattato tostato. Niente mozzarella.",
    emoji: "🧅",
    flavor_profile: "salty_savory",
    occasions: ["siciliano", "street food", "tradizione"],
  },
  focaccia_barese: {
    id: "focaccia_barese",
    name: "Pomodorini e olive baresane",
    description: "Pomodorini freschi schiacciati a mano, olive baresane, origano e olio EVO. La focaccia di Bari.",
    emoji: "🫒",
    flavor_profile: "fresh",
    occasions: ["pugliese", "tradizione"],
  },
  fugazzeta: {
    id: "fugazzeta",
    name: "Mozzarella e cipolla (fugazzeta)",
    description: "Doppio strato ripieno di mozzarella, ricoperto di cipolla a velo e origano. Niente pomodoro.",
    emoji: "🧅",
    flavor_profile: "creamy",
    occasions: ["argentino", "porteño"],
  },
  detroit: {
    id: "detroit",
    name: "Detroit (cheese crown)",
    description: "Brick cheese fino ai bordi per il frico croccante, pepperoni e strisce di salsa in superficie.",
    emoji: "🧀",
    flavor_profile: "rich",
    occasions: ["americano", "detroit"],
  },
  chicago: {
    id: "chicago",
    name: "Chicago deep dish",
    description: "Strati invertiti: mozzarella sul fondo, ripieno, salsa di pomodoro a pezzi e parmigiano in superficie.",
    emoji: "🍅",
    flavor_profile: "rich",
    occasions: ["americano", "chicago"],
  },
  montanara: {
    id: "montanara",
    name: "Montanara (a crudo)",
    description: "Dischetto fritto condito a crudo: pomodoro, ricotta, pecorino e basilico. Niente forno.",
    emoji: "🍅",
    flavor_profile: "fresh",
    occasions: ["napoletano", "street food"],
  },
  calzone: {
    id: "calzone",
    name: "Calzone Napoletano",
    description: "Chiuso a mezzaluna con ripieno di ricotta, fior di latte, salame o cicoli e pepe.",
    emoji: "🥟",
    flavor_profile: "rich",
    occasions: ["classico", "tradizione"],
  },
  ciaccino: {
    id: "ciaccino",
    name: "Farcitura senese",
    description: "Due dischi sottili sigillati e farciti dopo la cottura: prosciutto toscano e pecorino. La schiacciata farcita di Siena.",
    emoji: "🥪",
    flavor_profile: "salty_savory",
    occasions: ["toscano", "merenda", "street food"],
  },
  white_clam: {
    id: "white_clam",
    name: "White Clam (vongole)",
    description: "La clam pie di New Haven: vongole fresche, aglio, origano, pecorino e olio. Niente pomodoro né mozzarella.",
    emoji: "🦪",
    flavor_profile: "salty_savory",
    occasions: ["new haven", "frutti di mare"],
  },
  // ─── Wave 1: firme napoletane (de-genericizzazione per stile) ───
  cosacca: {
    id: "cosacca",
    name: "Cosacca",
    description: "L'antenata della Margherita: pomodoro, pecorino (o parmigiano stagionato) e basilico. Niente mozzarella.",
    emoji: "🧀",
    flavor_profile: "salty_savory",
    occasions: ["napoletana storica", "tradizione", "asciutta"],
  },
  provola_pepe: {
    id: "provola_pepe",
    name: "Provola e Pepe",
    description: "Provola affumicata fusa e pepe nero macinato fresco. Affumicato avvolgente, su base rossa o bianca.",
    emoji: "🌫️",
    flavor_profile: "salty_savory",
    occasions: ["comfort", "affumicato", "napoletana"],
  },
  nduja: {
    id: "nduja",
    name: "'Nduja di Spilinga",
    description: "Salume spalmabile calabrese piccantissimo che si scioglie sulla pizza rilasciando grasso speziato.",
    emoji: "🔥",
    flavor_profile: "spicy",
    occasions: ["piccante", "calabrese", "comfort"],
  },
  nerano: {
    id: "nerano",
    name: "Nerano",
    description: "Crema di zucchine, zucchine fritte, provolone del Monaco DOP e menta. Omaggio alla Costiera.",
    emoji: "🥒",
    flavor_profile: "creamy",
    occasions: ["estate", "costiera", "vegetariano"],
  },
  margherita_sbagliata: {
    id: "margherita_sbagliata",
    name: "Margherita Sbagliata",
    description: "Ordine invertito: solo bufala fusa in cottura, poi passata a crudo fredda e basilico aggiunti DOPO il forno.",
    emoji: "🔄",
    flavor_profile: "fresh",
    occasions: ["contemporanea", "gourmet", "canotto"],
  },
  scarpetta: {
    id: "scarpetta",
    name: "Scarpetta",
    description: "Bufala e fonduta di grana in cottura; fuori dal forno composta di pomodoro a crudo, pesto e scaglie di grana 24 mesi.",
    emoji: "🥄",
    flavor_profile: "rich",
    occasions: ["d'autore", "contemporanea"],
  },
  // ─── Wave 2: firme romane (teglia, tonda, pinsa, pala) ───
  patate_rosmarino: {
    id: "patate_rosmarino",
    name: "Patate e Rosmarino",
    description: "Fette sottili di patate al forno, rosmarino, sale e olio EVO. Il taglio bianco dei forni romani.",
    emoji: "🌿",
    flavor_profile: "rich",
    occasions: ["taglio romano", "comfort", "vegetariano"],
  },
  hot_honey: {
    id: "hot_honey",
    name: "Hot Honey",
    description: "Provola affumicata, pepperoni e miele piccante alla 'nduja. Dolce-piccante che spopola.",
    emoji: "🍯",
    flavor_profile: "sweet_savory",
    occasions: ["dolce-piccante", "casual", "trendy"],
  },
  bresaola_rucola: {
    id: "bresaola_rucola",
    name: "Bresaola, Rucola e Grana",
    description: "Bianca base mozzarella; dopo cottura bresaola IGP, rucola selvatica, scaglie di grana e zest di limone.",
    emoji: "🥩",
    flavor_profile: "fresh",
    occasions: ["estate", "leggera", "post-cottura"],
  },
  stracciata_bottarga: {
    id: "stracciata_bottarga",
    name: "Stracciatella e Bottarga",
    description: "Stracciatella di burrata a crudo, zucchine alla scapece e bottarga di muggine grattugiata. Gourmet romano.",
    emoji: "🐟",
    flavor_profile: "salty_savory",
    occasions: ["gourmet", "pala romana", "estate"],
  },
};

/* ═══ ToppingRecipe — la realizzazione concreta ═══ */

export interface ToppingRecipe {
  id: string;
  /** Link al concetto culturale di alto livello. */
  concept_ref: string;
  /** Nome variante per UI (es. "alla napoletana", "AVPN", "alla romana"). */
  variant_name?: string;

  /** Compatibilità per il pairing engine (Sprint 12 Fase 3). */
  preferred_for_styles?: string[];
  preferred_for_families?: FamilyId[];
  /** Combinazione esplicitamente sconsigliata (taboo). */
  taboo_for_styles?: string[];
  taboo_for_families?: FamilyId[];

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
    preferred_for_styles: ["napoletana_stg"],
    preferred_for_families: ["napoletana"],
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
    variant_name: "alla romana",
    preferred_for_families: ["romana", "contemporanea"],
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
    variant_name: "all'americana",
    preferred_for_families: ["americana"],
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

  margherita_generica: {
    id: "margherita_generica",
    concept_ref: "margherita",
    variant_name: "classica",
    // fallback per qualsiasi style non coperto sopra
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 90, unit: "g" } },
      { name: "Sale", amount: { value: 1, unit: "g" } },
      { name: "Mozzarella fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Basilico fresco", amount: { value: 4, unit: "pcs" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    assembly_steps: [{
      id: "spread_margherita_gen",
      title: "Condimento Margherita classica",
      description: "Salsa + mozzarella + basilico + olio. La più amata di sempre.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* ─── MARINARA — 2 varianti ─── */
  marinara_avpn: {
    id: "marinara_avpn",
    concept_ref: "marinara",
    variant_name: "AVPN",
    preferred_for_families: ["napoletana"],
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
    variant_name: "alla romana",
    preferred_for_families: ["romana"],
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
    variant_name: "alla napoletana",
    preferred_for_families: ["napoletana"],
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
    variant_name: "alla romana",
    preferred_for_families: ["romana", "contemporanea"],
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
    variant_name: "alla napoletana",
    preferred_for_families: ["napoletana"],
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
    preferred_for_families: ["americana"],
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
  capricciosa_classica: {
    id: "capricciosa_classica",
    concept_ref: "capricciosa",
    variant_name: "classica",
    preferred_for_families: ["romana", "napoletana", "contemporanea"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 80, unit: "g" } },
      { name: "Mozzarella fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto a fette (carne di suino, sale, aromi)", amount: { value: 40, unit: "g" } },
      { name: "Funghi champignon", amount: { value: 30, unit: "g" } },
      { name: "Carciofini sottolio (carciofi, olio, sale)", amount: { value: 30, unit: "g" } },
      { name: "Olive nere", amount: { value: 20, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "champignon_quick",
      title: "Saltare champignon (rapido)",
      description: "Affettare champignon e saltare 5 min in padella con olio. Niente aglio (non interferisce con prosciutto).",
      duration_minutes: 8,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_capricciosa",
      title: "Condimento Capricciosa",
      description: "Salsa + mozzarella alla base. Distribuire prosciutto, funghi (saltati 5 min prima), carciofini scolati, olive nere. Filo d'olio.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  /* ─── QUATTRO STAGIONI — 1 classica ─── */
  quattro_stagioni_classica: {
    id: "quattro_stagioni_classica",
    concept_ref: "quattro_stagioni",
    variant_name: "classica",
    preferred_for_families: ["romana", "napoletana", "contemporanea"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 80, unit: "g" } },
      { name: "Mozzarella fior di latte", amount: { value: 80, unit: "g" } },
      { name: "Prosciutto cotto (carne di suino, sale, aromi)", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Funghi saltati", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Carciofini sottolio (carciofi, olio, sale)", amount: { value: 30, unit: "g" }, notes: "per un quadrante" },
      { name: "Olive nere", amount: { value: 20, unit: "g" }, notes: "per un quadrante" },
    ],
    assembly_steps: [{
      id: "spread_4stagioni",
      title: "Condimento 4 Stagioni",
      description: "Salsa + mozzarella alla base. DIVIDERE in 4 quadranti immaginari: prosciutto in alto-sx, funghi in alto-dx, carciofi in basso-sx, olive in basso-dx. Effetto scenografico.",
      insert_at: "after_shape",
      duration_minutes: 6,
      replaces_generic: true,
    }],
  },

  /* ─── QUATTRO FORMAGGI — 1 classica ─── */
  quattro_formaggi_classica: {
    id: "quattro_formaggi_classica",
    concept_ref: "quattro_formaggi",
    variant_name: "classica",
    preferred_for_families: ["romana", "napoletana", "contemporanea"],
    ingredients: [
      { name: "Mozzarella fior di latte", amount: { value: 60, unit: "g" } },
      { name: "Fontina", amount: { value: 30, unit: "g" }, notes: "a fette sottili" },
      { name: "Gorgonzola dolce", amount: { value: 30, unit: "g" }, notes: "a cubetti" },
      { name: "Parmigiano grattugiato", amount: { value: 15, unit: "g" } },
    ],
    assembly_steps: [{
      id: "spread_4formaggi",
      title: "Condimento 4 Formaggi",
      description: "Base bianca o rossa a scelta. Distribuire mozzarella; aggiungere gorgonzola e fontina a tocchetti. Parmigiano in superficie post-bake (resta cremoso, non bruciato).",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  /* ─── ORTOLANA — 1 classica ─── */
  ortolana_classica: {
    id: "ortolana_classica",
    concept_ref: "ortolana",
    variant_name: "classica",
    preferred_for_families: ["romana", "napoletana", "contemporanea"],
    ingredients: [
      { name: "Passata di pomodoro (pomodoro, sale)", amount: { value: 70, unit: "g" } },
      { name: "Mozzarella fior di latte", amount: { value: 70, unit: "g" } },
      { name: "Zucchine grigliate", amount: { value: 50, unit: "g" } },
      { name: "Melanzane grigliate", amount: { value: 50, unit: "g" } },
      { name: "Peperoni grigliati", amount: { value: 50, unit: "g" } },
      { name: "Olio EVO", amount: { value: 5, unit: "ml" } },
    ],
    pre_prep_steps: [{
      id: "grigliare_verdure",
      title: "Grigliare verdure",
      description: "Tagliare zucchine, melanzane e peperoni a fette di 5mm. Grigliare in padella o piastra calda con poco olio finché morbide e segnate. Salare a fine.",
      duration_minutes: 25,
      timing: "just_before_assembly",
    }],
    assembly_steps: [{
      id: "spread_ortolana",
      title: "Condimento Ortolana",
      description: "Salsa + mozzarella. Distribuire le verdure grigliate alternandole. Olio a filo.",
      insert_at: "after_shape",
      duration_minutes: 4,
      replaces_generic: true,
    }],
  },

  patate_porchetta: {
    id: "patate_porchetta",
    concept_ref: "patate_porchetta",
    variant_name: "alla romana",
    preferred_for_styles: ["pizza_baciata", "pizza_patate_porchetta"],
    preferred_for_families: ["romana"],
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
    variant_name: "alla romana",
    preferred_for_styles: ["pala_romana", "teglia_romana", "bonci_teglia"],
    preferred_for_families: ["romana", "contemporanea"],
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

  crescenza_recco: {
    id: "crescenza_recco",
    concept_ref: "crescenza_recco",
    variant_name: "IGP",
    preferred_for_styles: ["focaccia_recco"],
    taboo_for_families: ["napoletana", "romana", "americana"],
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
    variant_name: "tradizionale",
    preferred_for_styles: ["sfincione"],
    taboo_for_families: ["napoletana"],
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
    variant_name: "tradizionale",
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
  fugazzeta_rellena: {
    id: "fugazzeta_rellena",
    concept_ref: "fugazzeta",
    variant_name: "rellena",
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
  detroit_brick: {
    id: "detroit_brick",
    concept_ref: "detroit",
    variant_name: "classica",
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
    variant_name: "classica",
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
    variant_name: "classico",
    preferred_for_styles: ["calzone_napoletano"],
    preferred_for_families: ["napoletana"],
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
  margherita_new_york: {
    id: "margherita_new_york",
    concept_ref: "margherita",
    variant_name: "New York",
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
    variant_name: "classica",
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

  /* ─── R1/R29: farciture & condimenti regionali prima mancanti ─── */
  ciaccino_senese_farcito: {
    id: "ciaccino_senese_farcito",
    concept_ref: "ciaccino",
    variant_name: "tradizionale",
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
    variant_name: "apizza",
    preferred_for_styles: ["new_haven_apizza"],
    taboo_for_families: ["napoletana"],
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
    variant_name: "alla napoletana",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    preferred_for_families: ["napoletana"],
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
    preferred_for_families: ["napoletana", "contemporanea"],
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
    variant_name: "classica",
    preferred_for_families: ["americana"],
    taboo_for_families: ["napoletana"],
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
    variant_name: "alla napoletana",
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
    variant_name: "alla napoletana",
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
    variant_name: "alla napoletana",
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
    variant_name: "alla napoletana (vegetariana)",
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
    variant_name: "tradizionale",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    preferred_for_families: ["napoletana"],
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
    variant_name: "alla napoletana",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    preferred_for_families: ["napoletana"],
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
    variant_name: "di Spilinga",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto"],
    preferred_for_families: ["napoletana"],
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
    variant_name: "alla napoletana",
    preferred_for_styles: ["napoletana_stg", "napoletana_canotto", "pizza_al_metro"],
    preferred_for_families: ["napoletana"],
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
    variant_name: "contemporanea",
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
    variant_name: "alla romana",
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
    variant_name: "alla romana",
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
    variant_name: "alla romana",
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
    variant_name: "alla romana",
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
    variant_name: "alla romana (Pepperoni)",
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
    variant_name: "alla romana",
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
    variant_name: "alla romana",
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
    variant_name: "alla romana",
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
    variant_name: "Sapori del Sole (pinsa)",
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
    variant_name: "alla romana",
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
    variant_name: "alla pala (Roscioli)",
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

};

export function resolveTopping(
  conceptId: string,
  style: PizzaStyle,
): ToppingRecipe | undefined {
  const variants = Object.values(TOPPING_LIBRARY).filter(
    (r) => r.concept_ref === conceptId,
  );
  if (variants.length === 0) return undefined;

  // 1. Esatto su style.id
  const exact = variants.find((v) => v.preferred_for_styles?.includes(style.id));
  if (exact) return exact;

  // 2. Family match
  const familyMatch = variants.find((v) =>
    v.preferred_for_families?.includes(style.family),
  );
  if (familyMatch) return familyMatch;

  // 3. Variante "generica/classica" come fallback esplicito
  const generic = variants.find(
    (v) =>
      v.variant_name === "classica" ||
      v.variant_name === "generica" ||
      v.id.endsWith("_generica") ||
      v.id.endsWith("_classica"),
  );
  if (generic) return generic;

  // 4. Prima disponibile
  return variants[0];
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

function getAllConcepts(): ToppingConcept[] {
  return Object.values(TOPPING_CONCEPTS);
}

/** Tutte le varianti per un concept. Utile per debug e per UI "vedi varianti". */
export function getVariantsForConcept(conceptId: string): ToppingRecipe[] {
  return getAllToppings().filter((t) => t.concept_ref === conceptId);
}

/* ═══ Pairing Engine — Sprint 12 Fase 3 ═══ */

export type AuthenticityScore =
  | "canonical"     // 🟢 100% — variante per questo style esatto
  | "natural"       // 🟢 ~85% — variante per questa family
  | "common"        // 🟡 ~65% — fallback con variante generica disponibile
  | "experimental"  // 🟠 ~50% — esiste variante ma per altre family
  | "taboo";        // 🔴 — esplicito taboo (style o family)

/** Calcola l'autenticità della coppia (conceptId, style) usando regole computate
 *  dalle preferred_for_* e taboo_for_* delle varianti. Niente PAIRING_MATRIX
 *  esplicita: l'autenticità emerge dalla configurazione delle varianti.
 *
 *  Priorità:
 *  1. taboo esplicito (style o family) → "taboo"
 *  2. variante preferred per questo style.id → "canonical"
 *  3. variante preferred per style.family → "natural"
 *  4. variante "generica/classica" come fallback → "common"
 *  5. varianti esistenti ma per altre family → "experimental"
 */
function computeAuthenticity(
  conceptId: string,
  style: PizzaStyle,
): AuthenticityScore {
  const variants = getVariantsForConcept(conceptId);
  if (variants.length === 0) return "common"; // no info, assume neutro

  // 1. Taboo esplicito blocca tutto
  for (const v of variants) {
    if (v.taboo_for_styles?.includes(style.id)) return "taboo";
    if (v.taboo_for_families?.includes(style.family)) return "taboo";
  }

  // 2. Canonical: variante per questo style esatto
  const canonical = variants.some((v) =>
    v.preferred_for_styles?.includes(style.id),
  );
  if (canonical) return "canonical";

  // 3. Natural: variante per questa family
  const natural = variants.some((v) =>
    v.preferred_for_families?.includes(style.family),
  );
  if (natural) return "natural";

  // 4. Fallback generico esiste
  const hasGeneric = variants.some(
    (v) =>
      v.variant_name === "classica" ||
      v.variant_name === "generica" ||
      v.id.endsWith("_generica") ||
      v.id.endsWith("_classica"),
  );
  if (hasGeneric) return "common";

  // 5. Varianti esistono solo per altre family → sperimentale
  return "experimental";
}

/** Metadata visiva per ogni livello di autenticità (color/icona/label).
 *  Usata dai chip nella UI per coerenza di linguaggio visivo. */
export const AUTHENTICITY_META: Record<
  AuthenticityScore,
  { label: string; icon: string; hue: "green" | "amber" | "orange" | "red" | "gray" }
> = {
  canonical: { label: "Da disciplinare", icon: "", hue: "green" },
  natural: { label: "Tradizionale", icon: "", hue: "green" },
  common: { label: "Alternativa", icon: "", hue: "amber" },
  experimental: { label: "Da provare", icon: "", hue: "orange" },
  taboo: { label: "Sconsigliato", icon: "", hue: "red" },
};

/** Restituisce tutti i concept ordinati per autenticità rispetto a uno style.
 *  Utile per costruire la chip strip con i topping migliori in cima. */
export function getConceptsByAuthenticity(style: PizzaStyle): Array<{
  concept: ToppingConcept;
  authenticity: AuthenticityScore;
  resolved: ToppingRecipe | undefined;
}> {
  const order: Record<AuthenticityScore, number> = {
    canonical: 0,
    natural: 1,
    common: 2,
    experimental: 3,
    taboo: 4,
  };
  return getAllConcepts()
    .map((concept) => ({
      concept,
      authenticity: computeAuthenticity(concept.id, style),
      resolved: resolveTopping(concept.id, style),
    }))
    .sort((a, b) => order[a.authenticity] - order[b.authenticity]);
}

export function getRecipesByAuthenticity(style: PizzaStyle): Array<{
  recipe: ToppingRecipe;
  authenticity: AuthenticityScore;
}> {
  const order: Record<AuthenticityScore, number> = {
    canonical: 0,
    natural: 1,
    common: 2,
    experimental: 3,
    taboo: 4,
  };
  /* R30 (layout-aware): gli stili farciti/chiusi accettano solo topping pensati
     per quel layout. Un topping "da superficie" (margherita, boscaiola…) su un
     ciaccino sigillato o una focaccia di Recco è fuori contesto: lo si tiene
     fuori dai "featured" declassandolo a experimental. */
  const SEALED_LAYOUTS = new Set<LayoutType>(["closed_stuffed", "double_thin_sheet"]);
  const styleLayout = style.layout?.type as LayoutType | undefined;
  const layoutIncompatible = (recipe: ToppingRecipe): boolean => {
    if (!styleLayout) return false;
    if (recipe.compatible_layouts) return !recipe.compatible_layouts.includes(styleLayout);
    // topping universale (nessuna dichiarazione) → non adatto ai layout sigillati
    return SEALED_LAYOUTS.has(styleLayout);
  };
  return Object.values(TOPPING_LIBRARY)
    .map((recipe) => {
      let authenticity: AuthenticityScore = "experimental";
      if (recipe.taboo_for_styles?.includes(style.id) || recipe.taboo_for_families?.includes(style.family)) {
        authenticity = "taboo";
      } else if (layoutIncompatible(recipe)) {
        authenticity = "experimental";
      } else if (recipe.preferred_for_styles?.includes(style.id)) {
        authenticity = "canonical";
      } else if (recipe.preferred_for_families?.includes(style.family)) {
        authenticity = "natural";
      } else if (
        (recipe.variant_name === "classica" ||
          recipe.variant_name === "generica" ||
          recipe.id.endsWith("_generica") ||
          recipe.id.endsWith("_classica")) &&
        /* R30: un topping "classico" è un'alternativa universale solo se NON è
           ancorato a stili specifici. Le ricette regionali (detroit_brick,
           chicago_deep_classic, montanara_classica, focaccia_barese_classica…)
           hanno preferred_for_styles: fuori dai loro stili sono sperimentali,
           non vanno proposte come "Alternativa" (es. Detroit sotto Napoletana). */
        !(recipe.preferred_for_styles && recipe.preferred_for_styles.length > 0)
      ) {
        authenticity = "common";
      }
      return { recipe, authenticity };
    })
    .sort((a, b) => order[a.authenticity] - order[b.authenticity]);
}

