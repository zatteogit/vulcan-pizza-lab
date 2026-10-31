import type { ToppingTranslation } from "./types";

/** Condimenti in italiano, la lingua di partenza (budget D-059, 31/10/2026).
 *  I testi stavano in topping-library.ts, che ora tiene solo struttura, dosi,
 *  nomi (che fanno da chiave per dispensa, allergeni e ricerca) e i segnaposto
 *  T/TIP dove il testo sta qui. Si carica come le altre lingue, nel chunk
 *  `it-toppings`; il server lo registra da sé (agent/mcp-server.ts). */
export const TOPPING_I18N_IT: ToppingTranslation = {
  concepts: {
    margherita: { description: "Pomodoro, mozzarella, basilico. La regina, l'origine, l'evergreen." },
    marinara: { description: "Pomodoro, aglio, origano, olio. Niente formaggio, gusto puro mediterraneo." },
    bianca: { description: "Olio e sale, eventualmente rosmarino. Base per panini o assaggio crosta." },
    boscaiola: { description: "Funghi e salsiccia con formaggio. Comfort autunnale." },
    diavola: { description: "Mozzarella e salame piccante. Per chi ama il fuoco." },
    capricciosa: { description: "Pomodoro, mozzarella, funghi, prosciutto cotto, carciofini, olive. La pizza che ha tutto." },
    quattro_stagioni: { description: "Stessi ingredienti della Capricciosa ma divisi in 4 quadranti. Variante più scenografica." },
    quattro_formaggi: { description: "Mozzarella, gorgonzola, parmigiano, fontina. Bianca o rossa." },
    ortolana: { description: "Verdure grigliate o saltate, mozzarella. La pizza degli orti." },
    patate_porchetta: { description: "Patate a scaglie arricciate sopra, porchetta nel ripieno post-cottura. Iconica romana." },
    crudo: { description: "Bianca spaccata e farcita a freddo con prosciutto crudo stagionato. Semplice e nobile." },
    bianca_mortazza: { description: "Pizza bianca aperta a libro, mortadella IGP e pistacchio post-bake. Strepitosa." },
    cacio_e_pepe: { description: "Crema di pecorino e pepe stesa post-bake immediato. Trucco del calore residuo." },
    salsiccia_friarielli: { description: "Classico napoletano: salsiccia + cime di rapa amarognole + provola. Anche bianca." },
    hawaiiana: { description: "Prosciutto cotto e ananas su base classica. Divisiva ma con il suo pubblico." },
    crescenza_recco: { description: "Sfoglia sottile + crescenza dentro. Disciplinare IGP, niente altro." },
    recco_culatello: { description: "Classica crescenza, dopo cottura coperta da fette di Culatello di Zibello DOP." },
    recco_cotto: { description: "Crescenza con prosciutto cotto artigianale Millefiori adagiato in uscita dal forno." },
    recco_pizzata: { description: "Crescenza con passata di pomodoro, acciughe, olive taggiasche e capperi. La Recco 'pizzata'." },
    sfincione: { description: "Salsa di pomodoro e cipolla, caciocavallo, acciughe e pangrattato tostato. Niente mozzarella." },
    focaccia_barese: { description: "Pomodorini freschi schiacciati a mano, olive baresane, origano e olio EVO. La focaccia di Bari." },
    fugazzeta: { description: "Doppio strato ripieno di mozzarella, ricoperto di cipolla a velo e origano. Niente pomodoro." },
    detroit: { description: "Brick cheese fino ai bordi per il frico croccante, pepperoni e strisce di salsa in superficie." },
    chicago: { description: "Strati invertiti: mozzarella sul fondo, ripieno, salsa di pomodoro a pezzi e parmigiano in superficie." },
    montanara: { description: "Dischetto fritto e poi condito A CRUDO SOPRA: pomodoro cotto, ricotta, pecorino e basilico. Aperta, non ripiena." },
    pizza_fritta: { description: "Tasca di impasto RIPIENA e sigillata, poi fritta: ricotta, provola, cicoli (o pepe). Chiusa, non aperta." },
    calzone: { description: "Chiuso a mezzaluna con ripieno di ricotta, fior di latte, salame o cicoli e pepe." },
    ciaccino: { description: "Due dischi sottili sigillati e farciti dopo la cottura: prosciutto toscano e pecorino. La schiacciata farcita di Siena." },
    white_clam: { description: "La clam pie di New Haven: vongole fresche, aglio, origano, pecorino e olio. Niente pomodoro né mozzarella." },
    cosacca: { description: "L'antenata della Margherita: pomodoro, pecorino (o parmigiano stagionato) e basilico. Niente mozzarella." },
    provola_pepe: { description: "Provola affumicata fusa e pepe nero macinato fresco. Affumicato avvolgente, su base rossa o bianca." },
    nduja: { description: "Salume spalmabile calabrese piccantissimo che si scioglie sulla pizza rilasciando grasso speziato." },
    nerano: { description: "Crema di zucchine, zucchine fritte, provolone del Monaco DOP e menta. Omaggio alla Costiera Sorrentina." },
    margherita_sbagliata: { description: "Ordine invertito: solo bufala fusa in cottura, poi passata a crudo fredda e basilico aggiunti DOPO il forno." },
    scarpetta: { description: "Bufala e fonduta di grana in cottura; fuori dal forno composta di pomodoro a crudo, pesto e scaglie di grana 24 mesi." },
    patate_rosmarino: { description: "Fette sottili di patate al forno, rosmarino, sale e olio EVO. Il taglio bianco dei forni romani." },
    hot_honey: { description: "Provola affumicata, pepperoni e miele piccante alla 'nduja. Dolce-piccante che spopola." },
    bresaola_rucola: { description: "Bianca base mozzarella; dopo cottura bresaola IGP, rucola selvatica, scaglie di grana e zest di limone." },
    stracciata_bottarga: { description: "Stracciatella di burrata a crudo, zucchine alla scapece e bottarga di muggine grattugiata. Gourmet romano." },
    cheese_pizza: { description: "La plain cheese americana: salsa di pomodoro speziata e mozzarella low-moisture fusa fino al bordo." },
    supreme: { description: "La ricca americana: pepperoni, salsiccia, peperoni verdi, cipolla e funghi su mozzarella." },
    white_pizza: { description: "Senza pomodoro: mozzarella, ricotta montata, aglio e spinaci. La white pie americana." },
    vodka_pizza: { description: "Salsa vodka cremosa (pomodoro, panna, vodka), basilico e pecorino. Trend italo-americano." },
    bbq_chicken: { description: "Pollo glassato alla barbecue, cipolla rossa e coriandolo. Resa celebre da California Pizza Kitchen (1985)." },
    smoked_salmon: { description: "Base bianca con crème fraîche; a crudo salmone affumicato, aneto, cipolla rossa e capperi." },
    italian_beef: { description: "Straccetti di manzo brasato nel suo brodo e giardiniera piccante. La specialità di Chicago." },
    tomato_pie: { description: "La apizza di New Haven senza mozzarella: solo salsa di San Marzano, aglio, origano e pecorino." },
    greek_feta: { description: "Pan pizza dei diner greci: feta sbriciolata, olive kalamata, cipolla rossa e origano." },
    zucca_speck: { description: "Crema di zucca arrosto, speck a freddo e scaglie di caciocavallo. Il gourmet d'autunno di Bonci." },
    burrata_salmone: { description: "Stracciatella di burrata a crudo, salmone affumicato, zest di limone e aneto. Abbinamento freddo." },
    focaccia_cipolle: { description: "Fette sottili di cipolla dorata stufate in cottura con abbondante olio sulla focaccia ligure." },
    sardenaira: { description: "La focaccia condita di Sanremo: pomodoro, acciughe sotto sale, olive taggiasche, capperi, aglio in camicia e origano. Nella versione De.Co. non c'è cipolla, che compare nelle versioni di casa e nella pissalandrea." },
    sfincione_bianco: { description: "Lo sfincione di Bagheria, senza pomodoro: tuma, ricotta di pecora, acciughe, cipolle stufate e mollica tostata con caciocavallo. Non è lo «sfincione in bianco» palermitano, condito solo con olio, rosmarino e sale." },
    gorgonzola_pere: { description: "Base bianca con fette di pera dolce e gorgonzola cremoso. Il dolce-salato del padellino." },
    tonno_cipolla: { description: "Pomodoro, mozzarella, tonno sott'olio e cipolla rossa di Tropea. Un classico semplice e saporito." },
    scarola: { description: "Scarola stufata con aglio, olive e capperi (e provola). Ripieno classico del calzone napoletano." },
    fugazza: { description: "L'originale argentina senza formaggio: solo cipolla a velo e origano sull'impasto. Antenata della fugazzeta." },
    ricotta_cicoli: { description: "Ripieno rustico napoletano: ricotta di pecora, cicoli (ciccioli di maiale), fior di latte e pepe." },
    meat_lovers: { description: "Festa di carni: pepperoni, salsiccia, bacon e manzo su formaggio fuso. Per i carnivori." },
    spinaci: { description: "Spinaci freschi al vapore con mix di formaggi fondenti. Versione vegetariana ricca." },
    prosciutto_funghi: { description: "Prosciutto cotto e funghi champignon su mozzarella. Il classico intramontabile." },
    italian_sausage: { description: "Salsiccia al finocchio a pezzetti, messa cruda su salsa e mozzarella: il condimento più diffuso nelle pizzerie di Chicago." },
    wurstel_patatine: { description: "Pomodoro, mozzarella, würstel e patatine fritte messe all'uscita dal forno. In molte pizzerie si chiama «Americana»." },
    prosciutto_cotto: { description: "Pomodoro, mozzarella e prosciutto cotto. Semplice, senza funghi." },
    funghi: { description: "Pomodoro, mozzarella e champignon saltati in padella prima, così non bagnano la pizza." },
    napoli: { description: "Pomodoro, mozzarella, acciughe e origano. A Roma si chiama «Napoli», a Napoli «Romana»; capperi e olive solo in alcune varianti." },
    parmigiana: { description: "Pomodoro, melanzane fritte, mozzarella o provola, parmigiano e basilico: la parmigiana di melanzane sulla pizza." },
    norma: { description: "Pomodoro, melanzane fritte e basilico, con ricotta salata grattugiata dopo il forno, come la pasta alla Norma catanese." },
    bufalina: { description: "Pomodoro, mozzarella di bufala campana e basilico. La bufala rilascia molto siero: va sgocciolata e, nei forni lenti, messa all'uscita." },
    pugliese: { description: "Pomodoro, mozzarella, cipolla e origano. La cipolla va cruda a velo nelle cotture lunghe e stufata prima nei forni veloci, dove non farebbe in tempo a cuocere." },
    crudaiola: { description: "Base bianca con fior di latte in forno; pomodorini, rucola e scaglie di parmigiano a crudo, tutti dopo il forno." },
    tirolese: { description: "Pomodoro e mozzarella in forno, speck a fette messo all'uscita: sulla pizza calda si ammorbidisce senza seccarsi." },
    bismarck: { description: "Pomodoro, mozzarella, prosciutto cotto e un uovo al centro. Nel forno di casa l'uovo entra negli ultimi minuti: l'albume si rapprende e il tuorlo resta morbido." },
    mimosa: { description: "Base bianca di panna e mozzarella con prosciutto cotto e mais dolce, tutto in forno." },
    lucana: { description: "Fior di latte e salsiccia lucanica in forno, peperoni cruschi sbriciolati solo all'uscita: in forno anneriscono e diventano amari." },
    rossini: { description: "Il classico di Pesaro: pomodoro e mozzarella in forno, poi uovo sodo a fette e maionese, a freddo. Si trova anche al taglio." },
    patate_lardo: { description: "Patate a fette sottili e rosmarino in forno; il lardo a fette va sulla pizza calda all'uscita, dove diventa traslucido senza sciogliersi." },
    gamberetti_zucchine: { description: "Base bianca con fior di latte e zucchine; i gamberetti, saltati prima in padella, si aggiungono alla fine." },
  },
  recipes: {
    margherita_napoletana_avpn: {
      variant_name: "Verace AVPN",
      ingredients: {
        "3": { notes: "foglie intere" },
      },
    },
    margherita_romana: {
      ingredients: {
        "3": { notes: "foglie" },
      },
    },
    margherita_teglia_in_giornata: {
      ingredients: {
        "0": { notes: "tiepida" },
        "1": { notes: "negli ultimi 5 minuti di cottura" },
      },
    },
    marinara_avpn: {
      variant_name: "AVPN",
      ingredients: {
        "2": { notes: "spicchi affettati sottili" },
      },
    },
    marinara_scarole_metro: {
      variant_name: "con scarole",
      ingredients: {
        "1": { notes: "da stufare" },
        "2": { notes: "spicchio" },
      },
    },
    bianca_olio_rosmarino: {
      variant_name: "olio e rosmarino",
      ingredients: {
        "1": { notes: "rametti" },
        "2": { notes: "in superficie" },
      },
    },
    boscaiola_napoletana: {
      variant_name: "porcini e salsiccia",
      ingredients: {
        "2": { notes: "qualità trifolati" },
        "3": { notes: "spezzata a tocchetti" },
        "4": { notes: "in superficie" },
      },
    },
    boscaiola_romana: {
      variant_name: "salsiccia e funghi",
      ingredients: {
        "2": { notes: "affettati" },
        "4": { notes: "usati per pre-cottura funghi" },
        "5": { notes: "usato in cottura funghi e a filo" },
      },
    },
    diavola_napoletana: {
      variant_name: "salame napoletano",
      ingredients: {
        "2": { notes: "a fette spesse" },
      },
    },
    diavola_americana: {
      variant_name: "Pepperoni",
      ingredients: {
        "2": { notes: "americano, più dolce-affumicato" },
      },
    },
    italian_sausage_tavern: {
      variant_name: "al finocchio, a crudo",
      ingredients: {
        "2": { notes: "a pezzetti piccoli" },
      },
    },
    patate_porchetta: {
      bake_note: "Le patate richiedono cottura più lunga per arricciarsi e colorire.",
      ingredients: {
        "3": { notes: "rametti" },
        "5": { notes: "solo a fine" },
      },
    },
    bianca_mortazza_romana: {
      variant_name: "IGP di Bologna",
    },
    patate_porchetta_sancho: {
      variant_name: "alla Sancho (in crosta di patate)",
      bake_note: "Le patate in superficie richiedono qualche minuto in più per arricciarsi.",
      ingredients: {
        "2": { notes: "aghi" },
        "3": { notes: "a fine cottura" },
      },
    },
    crescenza_recco: {
      variant_name: "IGP",
    },
    sfincione_palermitano: {
      ingredients: {
        "0": { notes: "Filetti" },
        "1": { notes: "A dadini" },
        "3": { notes: "A fette sottili, stufata nella salsa" },
        "5": { notes: "Tostato in olio" },
      },
    },
    focaccia_barese_classica: {
      ingredients: {
        "0": { notes: "Schiacciati a mano, non San Marzano" },
        "1": { notes: "Intere o denocciolate" },
      },
    },
    focaccia_barese_patate: {
      variant_name: "alla barese",
      bake_note: "Le patate richiedono qualche minuto in più.",
      ingredients: {
        "0": { notes: "a coprire tutta la superficie" },
      },
    },
    focaccia_barese_cipolla: {
      variant_name: "cipolla di Acquaviva",
    },
    fugazzeta_rellena: {
      ingredients: {
        "0": { notes: "Ripieno interno" },
        "1": { notes: "A velo, in superficie" },
      },
    },
    detroit_brick: {
      ingredients: {
        "0": { notes: "Fino ai bordi: forma il cheese crown / frico" },
        "2": { notes: "Strisce in superficie (racing stripes)" },
      },
    },
    chicago_deep_classic: {
      ingredients: {
        "0": { notes: "Sul fondo, a contatto con l'impasto" },
        "1": { notes: "Strato sopra la mozzarella" },
        "2": { notes: "Salsa grezza in superficie" },
        "3": { notes: "In superficie" },
      },
    },
    calzone_napoletano_classico: {
      variant_name: "ricotta e salame",
      ingredients: {
        "6": { notes: "foglie" },
      },
    },
    calzone_scarola: {
      variant_name: "e provola",
    },
    margherita_new_york: {
      ingredients: {
        "2": { notes: "In superficie: hallmark della slice newyorkese" },
      },
    },
    montanara_classica: {
      ingredients: {
        "1": { notes: "A fiocchi, a crudo" },
        "3": { notes: "foglie" },
      },
    },
    pizza_fritta_ripiena: {
      variant_name: "ricotta, provola e cicoli",
      ingredients: {
        "2": { notes: "in alternativa: solo pepe nero" },
      },
    },
    pizza_fritta_tonda_ripiena: {
      variant_name: "tonda, ricotta, provola e cicoli",
    },
    ciaccino_senese_farcito: {
      ingredients: {
        "0": { notes: "A fette, nel ripieno" },
        "1": { notes: "A fettine sottili" },
      },
    },
    white_clam_new_haven: {
      ingredients: {
        "0": { notes: "Con poco del loro liquido" },
      },
    },
    salsiccia_friarielli_napoletana: {
      ingredients: {
        "0": { notes: "Da ripassare con aglio, olio e peperoncino" },
        "1": { notes: "Cruda, a tocchetti" },
        "2": { notes: "A cubetti" },
      },
    },
    cacio_e_pepe_crema: {
      variant_name: "dopo la cottura",
      ingredients: {
        "0": { notes: "Per la crema" },
        "2": { notes: "Per montare la crema" },
      },
    },
    hawaiiana_classica: {
      ingredients: {
        "3": { notes: "A pezzetti, asciugato" },
      },
    },
    quattro_stagioni_napoletana: {
      ingredients: {
        "2": { notes: "per un quadrante" },
        "3": { notes: "per un quadrante" },
        "4": { notes: "per un quadrante" },
        "5": { notes: "per un quadrante" },
      },
    },
    cosacca_napoletana: {
      ingredients: {
        "2": { notes: "o pecorino" },
      },
    },
    provola_pepe_napoletana: {
      ingredients: {
        "0": { notes: "ombra di pomodoro, leggera" },
      },
    },
    nduja_napoletana: {
      ingredients: {
        "2": { notes: "a fiocchi" },
      },
    },
    margherita_sbagliata_canotto: {
      bake_note: "Il pomodoro va aggiunto solo a fine cottura: resta crudo, acidulo e profumato.",
    },
    scarpetta_canotto: {
      variant_name: "Da Lioniello",
    },
    quattro_stagioni_romana: {
      ingredients: {
        "2": { notes: "per un quadrante" },
        "3": { notes: "per un quadrante" },
        "4": { notes: "per un quadrante" },
        "5": { notes: "per un quadrante" },
      },
    },
    diavola_romana: {
      variant_name: "salame piccante",
    },
    hot_honey_tonda: {
      ingredients: {
        "3": { notes: "a filo dopo cottura" },
      },
    },
    nduja_pinsa: {
      variant_name: "Sapori del Sole",
      ingredients: {
        "0": { notes: "a fiocchi, fusa in cottura" },
        "1": { notes: "a crudo dopo cottura" },
        "2": { notes: "a crudo dopo cottura" },
      },
    },
    patate_rosmarino_romana: {
      bake_note: "Le patate richiedono qualche minuto in più per dorarsi e arricciarsi ai bordi.",
      ingredients: {
        "2": { notes: "aghi" },
        "3": { notes: "a fine cottura" },
      },
    },
    stracciata_bottarga_pala: {
      variant_name: "Roscioli",
      ingredients: {
        "0": { notes: "a crudo dopo cottura" },
      },
    },
    white_pizza_ny: {
      ingredients: {
        "1": { notes: "a ciuffi" },
      },
    },
    vodka_detroit: {
      ingredients: {
        "0": { notes: "fino ai bordi: cheese crown / frico" },
        "1": { notes: "a strisce in superficie" },
      },
    },
    italian_beef_chicago: {
      ingredients: {
        "0": { notes: "sul fondo, protegge l'impasto" },
        "3": { notes: "salsa grezza in superficie" },
      },
    },
    supreme_tavern: {
      variant_name: "party cut",
    },
    margherita_grandma: {
      ingredients: {
        "0": { notes: "alla base, a contatto con la teglia oliata" },
        "1": { notes: "a cucchiaiate sopra il formaggio" },
      },
    },
    vodka_grandma: {
      variant_name: "Buzzy",
      ingredients: {
        "1": { notes: "a cucchiaiate sopra" },
      },
    },
    bbq_chicken_california: {
      variant_name: "California Pizza Kitchen",
      ingredients: {
        "0": { notes: "al posto del pomodoro" },
        "4": { notes: "a crudo dopo cottura" },
      },
    },
    smoked_salmon_california: {
      variant_name: "Spago",
      ingredients: {
        "2": { notes: "a crudo dopo cottura" },
      },
    },
    greek_cheese_pan: {
      variant_name: "Greek pan",
    },
    zucca_speck_bonci: {
      variant_name: "Pizzarium",
      ingredients: {
        "1": { notes: "a freddo dopo cottura" },
      },
    },
    burrata_salmone_bonci: {
      variant_name: "Pizzarium",
      ingredients: {
        "1": { notes: "a crudo dopo cottura" },
      },
    },
    focaccia_genovese_classica: {
      variant_name: "olio, sale e salamoia",
    },
    sardenaira_sanremo: {
      variant_name: "De.Co. di Sanremo",
      ingredients: {
        "0": { notes: "a crudo, ben sgocciolati; niente cipolla" },
      },
    },
    sfincione_bianco_bagherese: {
      variant_name: "bagherese",
      ingredients: {
        "1": { notes: "affondata nell'impasto" },
        "2": { notes: "a cucchiaiate sulla tuma" },
      },
    },
    recco_nduja: {
      ingredients: {
        "1": { notes: "a pezzetti, prima della chiusura" },
      },
    },
    recco_culatello_recipe: {
      ingredients: {
        "2": { notes: "a crudo dopo cottura" },
      },
    },
    recco_cotto_recipe: {
      ingredients: {
        "2": { notes: "a crudo dopo cottura" },
      },
    },
    gorgonzola_pere_padellino: {
      ingredients: {
        "0": { notes: "base bianca" },
        "2": { notes: "a tocchetti" },
      },
    },
    margherita_trancio: {
      ingredients: {
        "1": { notes: "cola sui lati del trancio alto" },
      },
    },
    hot_honey_detroit: {
      variant_name: "The Founders",
      ingredients: {
        "0": { notes: "fino ai bordi: cheese crown" },
        "3": { notes: "post-cottura" },
        "4": { notes: "a filo dopo cottura" },
      },
    },
    hawaiiana_detroit: {
      variant_name: "Big Hawaiian",
      ingredients: {
        "0": { notes: "fino ai bordi" },
        "4": { notes: "post-cottura" },
      },
    },
    meat_lovers_detroit: {
      variant_name: "Meatsiah",
      ingredients: {
        "0": { notes: "fino ai bordi" },
        "5": { notes: "post-cottura" },
      },
    },
    supreme_chicago: {
      variant_name: "The Special",
      ingredients: {
        "0": { notes: "sul fondo" },
      },
    },
    spinaci_chicago: {
      variant_name: "Fresh Spinach",
      ingredients: {
        "0": { notes: "sul fondo" },
      },
    },
    meat_lovers_chicago: {
      variant_name: "Meat and More Meat",
      ingredients: {
        "0": { notes: "sul fondo" },
      },
    },
    cheese_tavern: {
      variant_name: "Tavern (party cut)",
    },
    wurstel_patatine_classica: {
      ingredients: {
        "2": { notes: "a rondelle; controlla l'etichetta: alcuni contengono latte o glutine" },
        "3": { notes: "fritte poco prima, messe dopo il forno" },
      },
    },
    funghi_napoletana: {
      ingredients: {
        "2": { notes: "peso da crudi" },
      },
    },
    funghi_romana: {
      ingredients: {
        "2": { notes: "peso da crudi" },
        "3": { notes: "per saltare i funghi" },
        "4": { notes: "per i funghi e a filo" },
      },
    },
    napoli_romana: {
      variant_name: "alla romana",
    },
    napoli_napoletana: {
      variant_name: "«Romana» a Napoli",
    },
    parmigiana_napoletana: {
      ingredients: {
        "1": { notes: "a fette, sgocciolata" },
        "2": { notes: "peso dopo la frittura" },
        "4": { notes: "foglie" },
      },
    },
    parmigiana_romana: {
      ingredients: {
        "2": { notes: "peso dopo la frittura" },
        "4": { notes: "foglie, dopo il forno" },
      },
    },
    norma_napoletana: {
      ingredients: {
        "2": { notes: "peso dopo la frittura" },
        "3": { notes: "dopo il forno; non parmigiano né ricotta fresca" },
        "4": { notes: "foglie, dopo il forno" },
      },
    },
    norma_romana: {
      ingredients: {
        "2": { notes: "peso dopo la frittura" },
        "3": { notes: "dopo il forno" },
        "4": { notes: "foglie, dopo il forno" },
      },
    },
    bufalina_napoletana: {
      ingredients: {
        "1": { notes: "a pezzi, sgocciolata almeno un'ora" },
        "2": { notes: "foglie" },
      },
    },
    bufalina_romana: {
      variant_name: "bufala all'uscita",
      ingredients: {
        "1": { notes: "a pezzi, dopo il forno" },
        "2": { notes: "foglie, dopo il forno" },
      },
    },
    pugliese_napoletana: {
      variant_name: "cipolla stufata",
      ingredients: {
        "2": { notes: "peso da cruda" },
      },
    },
    pugliese_romana: {
      variant_name: "cipolla cruda",
      ingredients: {
        "2": { notes: "cruda, affettata sottilissima" },
      },
    },
    crudaiola_classica: {
      ingredients: {
        "1": { notes: "a spicchi, dopo il forno" },
        "3": { notes: "dopo il forno" },
        "4": { notes: "dopo il forno" },
        "5": { notes: "metà in forno, metà sul fresco" },
      },
    },
    tirolese_classica: {
      ingredients: {
        "2": { notes: "dopo il forno" },
      },
    },
    bismarck_classica: {
      ingredients: {
        "3": { notes: "intero, a temperatura ambiente" },
      },
    },
    lucana_classica: {
      ingredients: {
        "1": { notes: "senza budello" },
        "2": { notes: "fritti, dopo il forno" },
      },
    },
    rossini_classica: {
      ingredients: {
        "2": { notes: "a fette, dopo il forno" },
        "3": { notes: "a freddo; alcune contengono senape, controlla l'etichetta" },
      },
    },
    patate_lardo_romana: {
      bake_note: "Le patate richiedono qualche minuto in più per dorarsi.",
      ingredients: {
        "1": { notes: "aghi" },
        "3": { notes: "dopo il forno" },
        "4": { notes: "a fine cottura" },
      },
    },
    gamberetti_zucchine_classica: {
      ingredients: {
        "2": { notes: "saltati in padella, dopo il forno" },
        "4": { notes: "per la padella e a filo" },
      },
    },
  },
  steps: {
    spread_margherita_avpn: {
      title: "Condimento Margherita Verace",
      description: "Stendi i pelati schiacciati a mano in modo uniforme, disponi il fior di latte a strisce o cubetti e aggiungi un filo d'olio EVO. Il basilico fresco mettilo appena sfornata.",
      description_short_bake: "Stendi i pelati schiacciati a mano in modo uniforme, disponi il fior di latte a strisce o cubetti e aggiungi un filo d'olio EVO. Completa con il basilico fresco prima di infornare.",
      tip_beginner: "Disciplinare AVPN: pomodoro pelati DOP, mozzarella campana, basilico fresco. Olio EVO sì, ma poco.",
      tip_nerd: "Con la cottura lampo della napoletana il basilico resta in forno troppo poco per annerire; con una cottura lunga si secca e si scurisce, quindi va messo dopo.",
    },
    spread_margherita_romana: {
      title: "Condimento Margherita romana",
      description: "Stendi la passata salata uniformemente. Distribuisci mozzarella a cubetti. Olio a filo. Basilico solo a fine cottura.",
      tip_beginner: "Forno casa = cottura lunga (12-20 min). Basilico fresco va aggiunto APPENA esce, altrimenti brucia.",
      tip_nerd: "I composti volatili del basilico (linalolo, eucaliptolo) degradano sopra i 100°C. Per cotture >5min meglio aggiungere post-bake.",
    },
    spread_margherita_teglia_in_giornata: {
      title: "Salsa ora, mozzarella a fine cottura",
      description: "Distribuisci la salsa tiepida sull'impasto appena steso, fino ai bordi, e lascialo lievitare in teglia. Inforna; negli ultimi 5 minuti di cottura apri il forno, distribuisci la mozzarella a dadini e finisci la cottura.",
      description_no_pan_proof: "Distribuisci la salsa tiepida sull'impasto appena steso nella teglia, fino ai bordi, e inforna subito. Negli ultimi 5 minuti di cottura apri il forno, distribuisci la mozzarella a dadini e finisci la cottura.",
    },
    spread_margherita_us: {
      title: "Condimento Margherita americana",
      description: "Spargi la salsa lasciando bordo libero. Mozzarella shredded a manciate distribuite. Parmigiano spolverato. Olio a filo. (Niente basilico fresco: stile USA non lo prevede di base).",
    },
    spread_marinara_avpn: {
      title: "Condimento Marinara AVPN",
      description: "Pelati schiacciati salati. Aglio a fettine sottili distribuito. Origano abbondante. Filo d'olio EVO. Niente formaggio (è la Marinara!).",
    },
    stufare_scarola_metro: {
      title: "Stufa la scarola",
      description: "Lava la scarola e tagliala a strisce. Stufala in padella con olio e aglio finché appassisce e perde l'acqua, poi sala. Falla raffreddare prima di metterla sulla pizza.",
    },
    spread_marinara_scarole: {
      title: "Marinara con scarole",
      description: "Pelati schiacciati e salati, la scarola stufata ben scolata, origano e un filo d'olio. Niente formaggio.",
    },
    spread_marinara_romana: {
      title: "Condimento Marinara romana",
      description: "Passata salata; aglio a fette sottili; origano; opzionale peperoncino in fiocchi; abbondante olio EVO.",
    },
    spread_bianca: {
      title: "Condimento bianca",
      description: "Spennella con olio EVO; distribuisci aghi di rosmarino freschi; sale grosso in superficie.",
    },
    spread_boscaiola_nap: {
      title: "Condimento Boscaiola napoletana",
      description: "Stendi i pelati schiacciati salati. Distribuisci fior di latte. Aggiungi porcini scolati e salsiccia spezzata cruda. Spolvera di grana padano. Olio a filo.",
      tip_beginner: "Porcini sottolio = già pronti, niente cottura preliminare. La salsiccia, a tocchetti piccoli, cuoce direttamente in forno.",
      tip_nerd: "L'olio dei porcini sottolio è già aromatizzato (porcini, alloro, aglio): apporta complessità aromatica. La grana resiste alla cottura wood-oven 450° meglio del parmigiano (più ricca di grasso).",
    },
    saltare_champignon: {
      title: "Salta gli champignon",
      description: "Affetta gli champignon. Scalda olio EVO con aglio in camicia e prezzemolo. Salta i funghi 8-10 min a fiamma medio-alta finché perdono acqua e iniziano a dorarsi. Sale a fine cottura.",
      tip_beginner: "Cuocili PRIMA. Se vanno crudi sulla pizza, rilasciano acqua e bagnano la base impedendole di cuocere bene.",
      tip_nerd: "Gli champignon sono 92% acqua. Pre-cottura 8min → riduzione massa ~50% + reazione Maillard sui bordi → sapore concentrato e zero rilascio in cottura pizza.",
    },
    spread_boscaiola_rom: {
      title: "Condimento Boscaiola romana",
      description: "Stendi passata salata. Distribuisci mozzarella. Aggiungi champignon saltati (a temperatura ambiente). Spezzetta la salsiccia cruda a tocchetti distribuiti. Olio a filo.",
    },
    spread_diavola_nap: {
      title: "Condimento Diavola napoletana",
      description: "Pelati schiacciati salati. Fior di latte. Salame piccante a fette adagiato a raggera. Filo di olio piccante opzionale.",
    },
    spread_diavola_us: {
      title: "Condimento Pepperoni",
      description: "Salsa. Mozzarella shredded. Pepperoni a fette sovrapposte (il classico effetto coppette). Origano.",
      tip_beginner: "Il pepperoni americano è diverso dal salame piccante: più dolce, più affumicato, e fa quelle 'coppette' caratteristiche col grasso in cottura.",
      tip_nerd: "Pepperoni USA = budello rigido + grasso al 35-40% → si arriccia in cottura formando concavità ('cupping'). Il salame italiano resta piatto.",
    },
    spread_sausage_tavern: {
      title: "Salsiccia cruda fino al bordo",
      description: "Salsa sottile fino quasi al bordo, poi la mozzarella. Distribuisci la salsiccia cruda a pezzetti piccoli su tutta la superficie: cuoce in forno con la pizza. Origano. Dopo la cottura, taglia a quadretti.",
    },
    patate_mandolina_ammollo: {
      title: "Preparazione patate",
      description: "Affetta le patate sottilissime (1-2mm) con mandolina. Immergi in acqua fredda per 30 min: serve a togliere l'amido in eccesso. Scola e asciugare bene tra panni puliti.",
      tip_beginner: "L'acqua fredda toglie l'amido: senza, le patate si attaccano tra loro in cottura e non si arricciano ai bordi.",
      tip_nerd: "L'amido superficiale gelatinizza a ~60°C creando una pellicola adesiva. Togliendolo, le patate si disidratano poco a poco in cottura e i bordi si arricciano (effetto chip).",
    },
    stesura_patate: {
      title: "Disposizione patate sopra",
      description: "Disponi le patate a scaglie sovrapposte sull'impasto. Condisci con olio EVO e rosmarino. Niente sale ancora.",
      tip_beginner: "Non salare ora: il sale farebbe rilasciare acqua e bagnerebbe la base. Va aggiunto solo a fine cottura.",
      tip_nerd: "Il NaCl per osmosi estrae acqua dalle cellule vegetali (turgor pressure rilascio). Sala in anticipo significa portare le patate da ~80% acqua a poltiglia bagnata.",
    },
    farcitura_porchetta: {
      title: "Farcitura porchetta",
      description: "Separa i due strati cotti. Disponi le fette di porchetta sulla metà inferiore e aggiungi il pepe, se desiderato. Richiudi con la parte alta, con le patate sopra.",
    },
    sale_finale: {
      title: "Sale e servizio",
      description: "Spolvera di fior di sale la superficie delle patate. Servi calda, tagliata a quadrotti.",
    },
    spread_bianca_base: {
      title: "Prepara la base in bianco",
      description: "Spennella con olio EVO e cospargi di fior di sale. Lascia la base senza farcitura: cuocerà nella fase successiva.",
    },
    mortazza_post_bake: {
      title: "Aggiungi mortadella post-cottura",
      description: "Sulla base cotta distribuisci la mortadella a fette ondulate e la granella di pistacchio. Aggiungi la stracciatella di burrata solo se scelta. Servi senza rimettere in forno.",
    },
    mortazza_spaccata_fill: {
      title: "Apri e farcisci la base cotta",
      description: "Taglia la base cotta orizzontalmente con un coltello a sega. Distribuisci mortadella e granella di pistacchio nella metà inferiore; aggiungi la stracciatella solo se scelta. Richiudi e servi senza rimettere in forno.",
    },
    spread_baciata_surface: {
      title: "Condisci la superficie",
      description: "Dopo aver sovrapposto i dischi, spennella la superficie esterna con olio EVO e fior di sale. Il ripieno si aggiungerà dopo la cottura.",
    },
    mortazza_split_fill: {
      title: "Apri e farcisci la Baciata",
      description: "Separa i due strati cotti, aiutandoti con un coltello a sega lungo il bordo. Distribuisci mortadella e granella di pistacchio nello strato inferiore; aggiungi la stracciatella solo se scelta. Richiudi e servi senza rimettere in forno.",
    },
    crudo_bianca: {
      title: "Cottura in bianco",
      description: "Spennella con olio EVO e fior di sale. Cuoci la base finché dorata e alveolata. Niente altro prima del forno.",
    },
    crudo_spacca_farci: {
      title: "Spacca e farcisci col crudo",
      description: "Estrai dal forno, spacca a metà col coltello e farcisci con le fette di prosciutto crudo. Il calore residuo ammorbidisce appena il grasso del crudo.",
    },
    patate_sancho_prep: {
      title: "Affetta e ammolla le patate",
      description: "Affetta le patate a 1-2 mm con la mandolina, mettile a bagno 20 min in acqua fredda per togliere l'amido, scolale e asciugale.",
    },
    patate_sancho_top: {
      title: "Patate a scaglie in superficie",
      description: "Disponi le patate a scaglie sovrapposte sulla base (la 'crosta di patate'). Olio EVO e rosmarino. Niente sale ora. Cuoci finché le patate si arricciano e dorano.",
    },
    patate_sancho_split: {
      title: "Spacca e farcisci di porchetta",
      description: "Fuori dal forno, sala le patate. Spacca la teglia a metà (le patate restano fuori) e farcisci l'interno con la porchetta di Ariccia a fette e una macinata di pepe. Richiudi. Alla Sancho.",
    },
    crescenza_internal: {
      title: "Crescenza tra le sfoglie",
      description: "Tra la sfoglia inferiore e quella superiore, distribuisci pezzetti di crescenza a distanza regolare. Sigilla i bordi schiacciando. Olio + sale grosso in superficie.",
    },
    sfincione_sauce: {
      title: "Salsa di cipolla e pangrattato tostato",
      description: "Stufa la cipolla a fette in poco olio, unisci la passata e cuoci 15 min. A parte, tosta il pangrattato in padella con un filo d'olio fino a doratura.",
    },
    sfincione_top: {
      title: "Condisci lo sfincione",
      description: "Stendi la salsa di pomodoro e cipolla sull'impasto. Distribuisci il caciocavallo a dadini e i filetti di acciuga affondandoli leggermente. Spolvera con pangrattato tostato, pecorino e origano, infine un filo d'olio EVO.",
    },
    barese_top: {
      title: "Pomodorini, olive e origano",
      description: "Affonda i pomodorini schiacciati nell'impasto lievitato. Distribuisci le olive baresane premendole leggermente. Spolvera l'origano, irrora con olio EVO abbondante e finisci con sale grosso.",
    },
    barese_patate: {
      title: "Coperta di patate",
      description: "Copri interamente la focaccia con le fette di patata sovrapposte (~5 mm). Rosmarino, abbondante olio EVO e sale grosso. Le patate si arricciano e dorano in cottura.",
    },
    barese_cipolla_prep: {
      title: "Stufa la cipolla",
      description: "Affetta la cipolla rossa dolce e stufala dolcemente in olio finché morbida e appena dorata.",
    },
    barese_cipolla: {
      title: "Cipolla stufata sulla focaccia",
      description: "Distribuisci la cipolla stufata sull'impasto lievitato. Origano, olio EVO e sale grosso. La dolcezza della cipolla di Acquaviva è la firma di questa variante.",
    },
    fugazzeta_onion: {
      title: "Ammorbidisci la cipolla",
      description: "Affetta la cipolla a velo e lasciala in acqua fredda salata 15 min per smorzarne il pungente, poi scolala e asciugala bene.",
    },
    fugazzeta_fill_top: {
      title: "Mozzarella interna + cipolla in superficie",
      description: "Distribuisci la mozzarella sullo strato inferiore, copri con il secondo disco e sigilla i bordi. In superficie disponi la cipolla a velo, l'origano e (a piacere) il formaggio grattugiato; rifinisci con olio EVO e sale. Niente pomodoro.",
    },
    fugazza_onion: {
      title: "Ammorbidisci la cipolla",
      description: "Affetta la cipolla a velo, mettila a bagno 15 min in acqua fredda salata per smorzarne il pungente, scolala e asciugala.",
    },
    fugazza_top: {
      title: "Solo cipolla in superficie (niente formaggio)",
      description: "La fugazza non si farcisce di formaggio: si copre la superficie con un letto abbondante di cipolla a velo, origano, olio EVO e sale. È l'antenata 'magra' della fugazzeta rellena.",
    },
    detroit_cheese_crown: {
      title: "Cheese crown fino ai bordi",
      description: "Distribuisci il brick cheese su tutta la superficie spingendolo contro i bordi della teglia: in cottura caramella formando la crosta di formaggio (frico). Adagia sopra il pepperoni.",
    },
    detroit_sauce_stripes: {
      title: "Strisce di salsa in superficie",
      description: "Sopra il formaggio, stendi 2-3 strisce di salsa di pomodoro (racing stripes) nel senso della lunghezza. La salsa va SOPRA, non sotto. Spolvera parmigiano e origano.",
    },
    chicago_cheese_base: {
      title: "Mozzarella e ripieno sul fondo",
      description: "Fodera lo stampo profondo con l'impasto facendolo risalire sui bordi. Copri il fondo con le fette di mozzarella (proteggono l'impasto dalla salsa), poi distribuire la salsiccia.",
    },
    chicago_sauce_top: {
      title: "Salsa a pezzi e parmigiano in superficie",
      description: "Versa la polpa di pomodoro a pezzi SOPRA il formaggio e il ripieno. Spolvera parmigiano, origano e basilico. Cuoci a lungo (25-35 min): è la salsa sopra a proteggere il formaggio.",
    },
    calzone_assembly: {
      title: "Chiusura calzone",
      description: "Stendi il disco, spalma la ricotta mescolata al pepe su una metà. Distribuisci fior di latte e salame. Ripiega a mezzaluna e sigilla premendo forte sui bordi. Cospargi la superficie esterna con un velo di passata, parmigiano, basilico e un filo d'olio.",
    },
    scarola_stufata: {
      title: "Stufa la scarola",
      description: "Ripassa la scarola in padella con aglio, olive e capperi finché morbida e asciutta. Strizza bene l'acqua in eccesso.",
    },
    calzone_scarola_fill: {
      title: "Chiusura calzone di scarola",
      description: "Distribuisci la scarola stufata con olive e capperi su metà disco, aggiungi la provola (e acciughe a piacere). Ripiega a mezzaluna e sigilla. È il calzone invernale napoletano per eccellenza.",
    },
    calzone_cicoli_fill: {
      title: "Chiusura calzone ricotta e cicoli",
      description: "Spalma la ricotta al pepe su metà disco, unisci fior di latte e cicoli. Ripiega e sigilla. Velo di passata in superficie. Il ripieno rustico tradizionale.",
    },
    spread_margherita_ny: {
      title: "Condimento New York",
      description: "Stendi la salsa (con un pizzico di zucchero per bilanciare l'acidità) lasciando il bordo libero. Copri con la mozzarella low-moisture. Finisci con pecorino romano grattugiato e un filo d'olio. La fetta resta grande e pieghevole.",
    },
    montanara_a_crudo: {
      title: "Condisci a crudo dopo la frittura",
      description: "Friggi il dischetto in olio fino a doratura, scolalo bene. Sul dischetto ancora caldo distribuisci il pomodoro, i fiocchi di ricotta, il pecorino e il basilico; rifinisci con un filo d'olio EVO. Niente cottura in forno: il condimento resta a crudo.",
    },
    pizza_fritta_fill_seal: {
      title: "Farcisci e sigilla prima di friggere",
      description: "Stendi il dischetto e distribuisci ricotta, provola, cicoli e pepe su metà, con il pomodoro se scelto. Ripiega a mezzaluna e sigilla bene i bordi. Il ripieno resta all’interno; la frittura è nella fase successiva.",
      tip_beginner: "È diversa dalla montanara: la montanara è aperta e condita sopra dopo la frittura; la pizza fritta è chiusa e ripiena prima di friggere.",
      tip_nerd: "Sigilla bene i bordi è critico: una tasca aperta fa entrare olio e fa fuoriuscire il ripieno. Il vapore interno cuoce a vapore ricotta e provola mentre l'esterno frigge.",
    },
    pizza_fritta_tonda_fill: {
      title: "Farcisci e chiudi i due dischi",
      description: "Stendi a mano, senza farina, le due porzioni in dischi sottili 2–3 mm. Sul disco più grande distribuisci ricotta, provola, cicoli e pepe lasciando libero il bordo; copri con il disco piccolo e sigilla premendo bene. La frittura è nella fase successiva.",
      tip_beginner: "Il disco sotto è più grande: così il bordo si ripiega sopra e la tonda resta chiusa in frittura.",
      tip_nerd: "Senza farina in stesura l'olio resta pulito più a lungo; un bordo sigillato male fa entrare olio e uscire il ripieno.",
    },
    ciaccino_farcitura: {
      title: "Farcisci la schiacciata sigillata",
      description: "Stendi due dischi sottili. Su quello inferiore distribuisci prosciutto e pecorino lasciando un bordo libero, copri col secondo disco e sigilla premendo bene. Cuoci fino a doratura: la farcitura si scalda e il pecorino fonde appena. Niente pomodoro.",
      tip_beginner: "Il ripieno è essenziale: prosciutto toscano e pecorino, nient'altro. È una schiacciata farcita, non una pizza condita.",
      tip_nerd: "I dischi vanno sottili (2-3 mm): troppo spessi e il centro resta crudo prima che i bordi sigillati dorino.",
    },
    white_clam_top: {
      title: "Vongole, aglio e pecorino (white pie)",
      description: "Sulla base stesa distribuisci le vongole sgusciate con un po' del loro liquido e l'aglio tritato. Irrora con olio EVO, spolvera pecorino romano e origano. Niente pomodoro né mozzarella. Cuoci su pietra molto calda finché i bordi sono ben anneriti (coal-fired).",
    },
    friarielli_saltati: {
      title: "Salta i friarielli",
      description: "Ripassa i friarielli in padella con aglio, olio e un pizzico di peperoncino fino a quando sono morbidi e asciutti. Strizza bene l'acqua in eccesso prima di usarli.",
    },
    salsiccia_friarielli_top: {
      title: "Provola, salsiccia e friarielli",
      description: "Distribuisci la provola a cubetti sulla base (bianca, senza pomodoro). Aggiungi la salsiccia cruda a tocchetti e i friarielli saltati. Filo d'olio EVO. La salsiccia cuoce nella cottura flash; per i forni casa, pre-rosolarla.",
    },
    cacio_pepe_cream: {
      title: "Monta la crema di pecorino",
      description: "Mescola il pecorino con acqua tiepida (o poca panna) e pepe fino a ottenere una crema liscia senza grumi. Tieni da parte a temperatura ambiente.",
    },
    cacio_pepe_postbake: {
      title: "Crema a crudo sul calore residuo",
      description: "Cuoci la base bianca. Appena sfornata, stendi la crema di pecorino e pepe sul disco caldo: il calore residuo la rende setosa senza stracciarla. Macina altro pepe sopra.",
    },
    hawaiiana_top: {
      title: "Prosciutto cotto e ananas",
      description: "Stendi la salsa e la mozzarella. Distribuisci prosciutto cotto e ananas ben asciugato (per non rilasciare acqua). Cuoci finché il formaggio è fuso e l'ananas leggermente caramellato.",
    },
    champignon_nap_capricciosa: {
      title: "Salta gli champignon",
      description: "Affetta gli champignon e saltali 5 min in padella con un filo d'olio finché perdono acqua. Sala a fine.",
    },
    spread_capricciosa_nap: {
      title: "Condimento Capricciosa napoletana",
      description: "Pelati schiacciati + fior di latte alla base. Distribuisci prosciutto cotto, champignon saltati, carciofini di Paestum scolati e olive caiazzane. Alici di Cetara per la versione del Sud. Filo d'olio EVO.",
    },
    spread_4stagioni_nap: {
      title: "Condimento 4 Stagioni napoletana",
      description: "Pelati + fior di latte alla base. DIVIDI in 4 quadranti: prosciutto cotto, champignon saltati, carciofini di Paestum, alici di Cetara con olive. Ogni quadrante isolato.",
    },
    spread_4formaggi_nap: {
      title: "Condimento 4 Formaggi napoletana",
      description: "Base bianca. Distribuisci il fior di latte; aggiungi provolone del Monaco e gorgonzola a tocchetti. Parmigiano in superficie. Cottura flash che fonde senza bruciare.",
      tip_beginner: "Il provolone del Monaco al posto della fontina dà la nota campana: più dolce-piccante e meno burrosa.",
      tip_nerd: "Provolone del Monaco DOP: pasta semidura da latte di vacca agerolese, stagionatura ≥6 mesi → fonde filando ma tiene la scaglia, regge i 450°C del forno a legna.",
    },
    verdure_fritte_nap: {
      title: "Friggi melanzane e zucchine",
      description: "Taglia melanzane a cubetti e zucchine a fette, friggile in olio caldo finché dorate, scola su carta. Griglia i peperoni e spellali.",
    },
    spread_ortolana_nap: {
      title: "Condimento Ortolana napoletana",
      description: "Pomodoro schiacciato + fior di latte. Distribuisci melanzane e zucchine fritte e i peperoni grigliati. Basilico e olio EVO. (Versione vegetariana napoletana, con verdure fritte non grigliate).",
    },
    spread_cosacca: {
      title: "Condimento Cosacca",
      description: "Stendi il pomodoro schiacciato salato. Spolvera abbondante parmigiano (o pecorino). Basilico e olio EVO. NIENTE mozzarella: è la pizza pre-Margherita.",
      tip_beginner: "La Cosacca è l'antenata della Margherita: solo pomodoro, formaggio stagionato e basilico. Più sapida e asciutta.",
      tip_nerd: "Senza mozzarella manca l'acqua di latte: la base resta più asciutta e croccante. Il parmigiano grattugiato fonde nel pomodoro creando crosticine sapide (Maillard sui bordi del formaggio).",
    },
    spread_provola_pepe: {
      title: "Condimento Provola e Pepe",
      description: "Velo di pomodoro schiacciato (l'ombra). Distribuisci la provola affumicata a cubetti. Dopo cottura, generosa macinata di pepe nero, basilico e filo d'olio.",
    },
    spread_nduja_nap: {
      title: "Condimento 'Nduja di Spilinga",
      description: "Pomodoro schiacciato + fior di latte. Distribuisci la 'nduja a piccoli fiocchi (non spalmata): in cottura si scioglie rilasciando grasso rosso piccante. Basilico e olio a fine.",
      tip_beginner: "Mettila a fiocchetti piccoli e distanziati: si scioglie e si distribuisce da sola. Troppa = piccantezza che copre tutto.",
      tip_nerd: "La 'nduja è ~30-40% grasso suino: a 450°C il grasso fonde e veicola la capsaicina e la paprika, colorando la pizza di rosso aranciato.",
    },
    nerano_prep: {
      title: "Crema e zucchine fritte",
      description: "Friggi metà delle zucchine a julienne finché dorate. Frulla l'altra metà (saltata) con olio EVO, poca menta e sale per la crema. Tieni da parte.",
    },
    spread_nerano: {
      title: "Condimento Nerano",
      description: "Base bianca con crema di zucchine. Distribuisci il fior di latte e le zucchine fritte. Dopo cottura: scaglie di provolone del Monaco e mentuccia fresca. Filo d'olio.",
    },
    sbagliata_bake: {
      title: "Solo bufala in cottura",
      description: "Sul disco condisci SOLO con la mozzarella di bufala a fette. Inforna e cuoci finché il cornicione gonfia e la bufala fonde. Niente pomodoro nel forno.",
    },
    sbagliata_post: {
      title: "Pomodoro a crudo dopo il forno",
      description: "Appena sfornata, distribuisci a cucchiaiate la passata di pomodoro a crudo fredda, il basilico e un filo d'olio. Il contrasto caldo/freddo e il pomodoro fresco sono la firma della 'sbagliata'.",
    },
    scarpetta_fonduta: {
      title: "Fonduta di grana",
      description: "Scalda dolcemente il Grana Padano 12 mesi con poca panna/latte fino a crema liscia. Tieni in caldo.",
    },
    scarpetta_bake: {
      title: "Bufala e fonduta in cottura",
      description: "Condisci con la bufala e ciuffi di fonduta di grana. Inforna fino a cornicione gonfio e formaggi fusi.",
    },
    scarpetta_post: {
      title: "Composta, pesto e grana a fine",
      description: "Fuori dal forno, distribuisci la composta di pomodoro a crudo fredda, puntini di pesto di basilico e scaglie di Grana 24 mesi. Firma 'Scarpetta' di Lioniello.",
    },
    spread_capricciosa_rom: {
      title: "Condimento Capricciosa romana",
      description: "Passata + fior di latte. Distribuisci prosciutto cotto, champignon affettati, carciofini romani e olive nere. Spicchi di uovo sodo per la versione romana classica. Olio a filo.",
    },
    spread_4stagioni_rom: {
      title: "Condimento 4 Stagioni romana",
      description: "Passata + fior di latte. DIVIDI in 4 quadranti: prosciutto cotto, champignon, carciofini, olive nere. Quadranti netti.",
    },
    spread_4formaggi_rom: {
      title: "Condimento 4 Formaggi romana",
      description: "Base bianca. Fior di latte, gorgonzola dolce e provola affumicata a tocchetti. Pecorino romano in superficie: la nota sapida laziale al posto del parmigiano.",
    },
    grigliare_verdure_rom: {
      title: "Griglia le verdure",
      description: "Griglia melanzane e zucchine a fette; cuoci al forno le fette di patate. Sala a fine.",
    },
    spread_ortolana_rom: {
      title: "Condimento Ortolana romana",
      description: "Base bianca con fior di latte. Distribuisci patate al forno, melanzane e zucchine grigliate, pomodorini datterini. Olio a filo. (Versione romana con patate e verdure grigliate).",
    },
    spread_diavola_rom: {
      title: "Condimento Diavola romana",
      description: "Passata + fior di latte. Fette di salame piccante distribuite. Origano e pecorino romano spolverati, filo d'olio. Sulla tonda scrocchiarella il salame diventa croccante.",
    },
    spread_provola_pepe_tonda: {
      title: "Condimento Provola e Pepe (tonda)",
      description: "Passata + provola affumicata a cubetti sulla base sottilissima. Dopo cottura, macinata di pepe nero e basilico. La scrocchiarella regge l'affumicato senza ammollarsi.",
    },
    spread_hot_honey: {
      title: "Condimento Hot Honey",
      description: "Passata speziata + provola + pepperoni. Cuoci. Fuori dal forno, filo di miele alla 'nduja e pecorino romano: dolce-piccante sul croccante della tonda.",
      tip_beginner: "Il miele va SEMPRE dopo il forno: a caldo si caramella e diventa amaro. A filo sulla pizza calda resta lucido e dolce.",
      tip_nerd: "Lo zucchero del miele (fruttosio) imbrunisce già a ~110°C: in forno a 320°C brucerebbe. Aggiunto post-bake sfrutta solo il calore residuo (~70°C) restando fluido.",
    },
    bresaola_bake: {
      title: "Cottura in bianco con mozzarella",
      description: "Condisci solo con fior di latte e cuoci la tonda finché croccante e il formaggio è fuso.",
    },
    bresaola_post: {
      title: "Bresaola, rucola e grana a crudo",
      description: "Fuori dal forno, adagia la bresaola a fette, la rucola, le scaglie di grana, una grattata di zest di limone e un filo d'olio. Tutto a crudo per restare fresco.",
    },
    nduja_pinsa_bake: {
      title: "'Nduja in cottura",
      description: "Sulla pinsa stesa distribuisci la 'nduja a fiocchi e inforna: si scioglie e insaporisce la base croccante.",
    },
    nduja_pinsa_post: {
      title: "Stracciatella e datterini a freddo",
      description: "Fuori dal forno, ciuffi di stracciatella e datterini freschi disposti a crudo. Il fresco-cremoso bilancia il piccante. Filo d'olio.",
    },
    patate_mandolina_rom: {
      title: "Affetta e ammolla le patate",
      description: "Affetta le patate a 1-2 mm con la mandolina, mettile a bagno 20 min in acqua fredda per togliere l'amido, scolale e asciugale bene.",
    },
    spread_patate_rosmarino: {
      title: "Condimento Patate e Rosmarino",
      description: "Su base (bianca o con velo di fior di latte) disponi le patate a scaglie sovrapposte. Olio EVO e rosmarino. Sala SOLO a fine cottura per non bagnare la base.",
    },
    stracciata_bake: {
      title: "Pala bianca in cottura",
      description: "Cuoci la pala in bianco (solo olio e sale) fino a doratura e alveolatura aperta.",
    },
    stracciata_post: {
      title: "Stracciatella, scapece e bottarga",
      description: "Fuori dal forno, ciuffi di stracciatella, zucchine alla scapece e una pioggia di bottarga di muggine grattugiata. Filo d'olio. Tutto a crudo.",
    },
    spread_cheese_ny: {
      title: "Salsa e mozzarella fino al bordo",
      description: "Stendi la salsa lasciando 1 cm di bordo. Copri con abbondante mozzarella low-moisture quasi fino al cornicione. Pecorino e filo d'olio. La slice deve restare grande e pieghevole.",
    },
    spread_white_ny: {
      title: "White pie senza pomodoro",
      description: "Niente salsa. Distribuisci mozzarella, ciuffi di ricotta montata, spinaci saltati e aglio. Pecorino e olio. Cottura su pietra/acciaio.",
    },
    spread_supreme_ny: {
      title: "Condimento Supreme",
      description: "Salsa + mozzarella. Distribuisci pepperoni, salsiccia cruda sbriciolata, peperoni verdi, cipolla e funghi. Il classico carico americano completo.",
    },
    spread_vodka_detroit: {
      title: "Cheese crown e strisce di vodka",
      description: "Brick cheese fino ai bordi della teglia (caramella in frico). Dopo cottura, strisce di salsa vodka calda, basilico e pecorino. La salsa va SOPRA, come da stile Detroit.",
    },
    spread_italian_beef: {
      title: "Strati invertiti con Italian beef",
      description: "Fodera lo stampo profondo. Mozzarella a fette sul fondo, poi l'Italian beef e la giardiniera. Copri con la polpa di pomodoro a pezzi e parmigiano. Cottura lunga.",
    },
    spread_supreme_tavern: {
      title: "Carico leggero su base cracker",
      description: "Sulla base sottilissima, salsa e mozzarella fino al bordo. Distribuisci salsiccia, pepperoni e peperoni in modo uniforme (si taglia a quadrotti). Pochi strati per restare croccante.",
    },
    spread_margherita_grandma: {
      title: "Formaggio sotto, salsa a cucchiaiate sopra",
      description: "Sulla teglia oliata distribuisci la mozzarella a contatto con la base (frico sul fondo). Sopra, cucchiaiate asimmetriche di marinara densa. Pecorino, basilico e olio. Stile Grandma di Long Island.",
    },
    spread_vodka_grandma: {
      title: "Grandma alla vodka",
      description: "Mozzarella alla base, cucchiaiate di salsa vodka cremosa sopra, pecorino e basilico. Fondo croccante grazie all'olio in teglia.",
    },
    spread_tomato_pie: {
      title: "Tomato pie senza mozzarella",
      description: "Solo pomodoro San Marzano e aglio sulla base sottile. Origano, abbondante pecorino e olio. Niente mozzarella (è il famoso 'plain tomato pie'). Cottura a carbone fino a crosta annerita.",
    },
    spread_bbq_chicken: {
      title: "BBQ chicken alla californiana",
      description: "Salsa barbecue al posto del pomodoro. Mozzarella, pollo glassato e cipolla rossa. Dopo cottura, coriandolo fresco. La pizza di Ed LaDou per il primo menu di California Pizza Kitchen (1985).",
    },
    salmon_bake: {
      title: "Base bianca con crème fraîche",
      description: "Cuoci la base sottile con crème fraîche e mozzarella, senza salmone.",
    },
    salmon_post: {
      title: "Salmone a crudo dopo il forno",
      description: "Fuori dal forno, adagia il salmone affumicato, aneto, cipolla rossa a velo e capperi. Il salmone resta crudo: la firma di Spago.",
    },
    spread_greek: {
      title: "Feta, kalamata e cipolla",
      description: "Nel padellino unto, salsa e mix mozzarella-cheddar. Distribuisci feta, olive kalamata e cipolla rossa. Origano. Fondo fritto e croccante dall'abbondante olio.",
    },
    spread_greek_cheese: {
      title: "Plain cheese nel padellino",
      description: "Salsa all'origano e abbondante mix mozzarella-cheddar fino al bordo del padellino unto. Il fondo frigge nell'olio restando croccante. Il cheese dei diner greco-americani.",
    },
    zucca_speck_bake: {
      title: "Crema di zucca in cottura",
      description: "Stendi la crema di zucca sulla teglia ad alta idratazione e cuoci fino a base dorata e mollica spumosa.",
    },
    zucca_speck_post: {
      title: "Speck e caciocavallo a freddo",
      description: "Fuori dal forno, adagia lo speck a fette e le scaglie di caciocavallo sul caldo. Filo d'olio. Lo speck resta morbido, non cotto.",
    },
    burrata_salmone_bake: {
      title: "Teglia in bianco",
      description: "Cuoci la teglia in bianco (olio e sale) fino a doratura e alveolatura aperta.",
    },
    burrata_salmone_post: {
      title: "Stracciatella e salmone a freddo",
      description: "Fuori dal forno, ciuffi di stracciatella, fette di salmone affumicato, zest di limone e aneto. Tutto a crudo.",
    },
    spread_salamoia_genovese: {
      title: "Salamoia nelle fossette",
      description: "Prima della lievitazione finale, fai le fossette con i polpastrelli. Sciogli il sale fino nell’acqua della salamoia, nelle dosi indicate. Versa nelle fossette; distribuisci separatamente l’olio EVO e il sale grosso di finitura.",
    },
    spread_cipolle_genovese: {
      title: "Cipolle e salamoia nelle fossette",
      description: "Distribuisci le cipolle prima della lievitazione finale. Sciogli il sale fino nell’acqua della salamoia, nelle dosi indicate, e versare nelle fossette. Distribuisci separatamente l’olio EVO e il sale grosso di finitura.",
    },
    spread_sardenaira: {
      title: "Condisci la Sardenaira",
      description: "Distribuisci il pomodoro a crudo sull'impasto alto e soffice. Affonda le acciughe e gli spicchi d'aglio in camicia. Distribuisci olive taggiasche, capperi e origano; abbondante olio EVO. Cuoci lentamente in teglia. Non è una pizza: è una focaccia condita.",
    },
    bagherese_prep: {
      title: "Cipolle stufate e mollica tostata",
      description: "Stufa le cipolle bianche dolcemente in olio. A parte, tosta la mollica di pane in padella con origano e un filo d'olio.",
    },
    spread_sfincione_bianco: {
      title: "Sfincione bianco senza pomodoro",
      description: "Niente pomodoro. Affonda nell'impasto le fette di tuma e le acciughe sciolte, poi distribuisci la ricotta a cucchiaiate. Copri con le cipolle stufate, il caciocavallo grattugiato e la mollica tostata. Pepe e olio.",
    },
    recco_nduja_fill: {
      title: "Crescenza e 'nduja tra le sfoglie",
      description: "Tra la sfoglia inferiore e superiore distribuisci la crescenza a pezzetti e, qua e là, la 'nduja. Sigilla i bordi, bucherella. Olio e sale in superficie. La 'nduja si scioglie nel ripieno fondente.",
    },
    recco_culatello_fill: {
      title: "Crescenza tra le sfoglie",
      description: "Distribuisci la crescenza tra le due sfoglie sottilissime, sigilla i bordi, bucherella, olio e sale. Cuoci a 300-320°C.",
    },
    recco_culatello_post: {
      title: "Culatello a crudo dopo il forno",
      description: "Appena sfornata, adagia le fette di Culatello di Zibello DOP sulla focaccia caldissima: si scalda appena e resta morbido.",
    },
    recco_cotto_fill: {
      title: "Crescenza tra le sfoglie",
      description: "Crescenza tra le due sfoglie, sigilla, bucherella, olio e sale. Cuoci fino a bolle dorate.",
    },
    recco_cotto_post: {
      title: "Cotto Millefiori in uscita dal forno",
      description: "Adagia le fette di prosciutto cotto Millefiori sulla focaccia appena sfornata.",
    },
    recco_pizzata_fill: {
      title: "Crescenza dentro, pomodoro e acciughe sopra",
      description: "Crescenza tra le due sfoglie sottili, sigilla e bucherella. In superficie qualche cucchiaio di passata, acciughe, olive taggiasche e capperi. Olio EVO. La versione 'pizzata' della Recco.",
    },
    spread_margherita_padellino: {
      title: "Condimento Margherita al padellino",
      description: "Sull'impasto lievitato nel padellino oliato, stendi la passata e il fior di latte. Basilico e olio. Il fondo frigge nell'olio del tegamino restando croccante, l'interno soffice.",
    },
    spread_diavola_padellino: {
      title: "Condimento Diavola al padellino",
      description: "Passata e fior di latte nel padellino. Distribuisci il salame piccante a fette. Basilico e olio. Il salame si fa croccante in cottura.",
    },
    spread_capricciosa_padellino: {
      title: "Condimento Capricciosa al padellino",
      description: "Passata + fior di latte. Distribuisci prosciutto cotto, champignon, carciofini, olive nere e capperi. Olio a filo. Versione torinese ricca.",
    },
    spread_tonno_padellino: {
      title: "Condimento Tonno e Cipolla",
      description: "Passata + fior di latte. Distribuisci il tonno sgocciolato e la cipolla rossa a velo. Origano e olio. Semplice e saporito.",
    },
    spread_gorgo_pere: {
      title: "Condimento Gorgonzola e Pere",
      description: "Base bianca: fior di latte, fette sottili di pera e gorgonzola a tocchetti. Niente pomodoro. In cottura le pere si ammorbidiscono e il gorgonzola fonde: dolce-salato.",
    },
    spread_margherita_trancio: {
      title: "Condimento Margherita al trancio",
      description: "Sull'impasto alto e soffice in teglia, passata e abbondante mozzarella che in cottura cola lungo i lati. Basilico e olio. Fondo dorato e croccante dall'olio in teglia.",
    },
    spread_diavola_trancio: {
      title: "Condimento Diavola al trancio",
      description: "Passata e abbondante mozzarella, salame piccante a fette. Olio a filo. Il trancio milanese spesso e soffice con fondo croccante.",
    },
    founders_assembly: {
      title: "Cheese crown, pepperoni, jalapeños e hot honey",
      description: "Brick cheese fino ai bordi (frico), pepperoni e jalapeños sopra. Dopo cottura, strisce di salsa rossa e un filo di miele piccante. Dolce-piccante con la crosta caramellata.",
    },
    big_hawaiian_assembly: {
      title: "Pepperoni, bacon, ananas e glassa piccante",
      description: "Brick cheese ai bordi. Pepperoni, bacon e ananas caramellato. Dopo cottura, glassa dolce al peperoncino. La hawaiana in versione Detroit.",
    },
    meatsiah_assembly: {
      title: "Quattro carni e cheese crown",
      description: "Brick cheese ai bordi. Distribuisci pepperoni, salsiccia, bacon e straccetti di manzo. Dopo cottura, strisce di salsa rossa. La 'Meatsiah'.",
    },
    special_assembly: {
      title: "Strati invertiti: The Special",
      description: "Fodera lo stampo profondo. Mozzarella sul fondo, poi salsiccia, funghi, peperoni e cipolla. Copri con la polpa di pomodoro a pezzi. Cottura lunga.",
    },
    spinach_assembly: {
      title: "Spinaci e quattro formaggi nel guscio",
      description: "Mozzarella sul fondo, poi spinaci al vapore e il mix di formaggi. Copri con la polpa di pomodoro. Versione vegetariana del deep dish.",
    },
    meat_chicago_assembly: {
      title: "Quattro carni nel guscio profondo",
      description: "Mozzarella sul fondo, poi pepperoni, milanese, salsiccia e bacon. Copri con la polpa di pomodoro. Cottura lunga.",
    },
    tavern_cheese_assembly: {
      title: "Plain cheese su base cracker",
      description: "Salsa e mozzarella fino al bordo della base sottilissima. Cottura su pietra finché rigida e croccante. Tagliata a quadrotti (party cut).",
    },
    capricciosa_trancio_assembly: {
      title: "Capricciosa al trancio",
      description: "Passata e abbondante mozzarella sull'impasto alto. Distribuisci cotto, funghi, carciofini e olive. Fondo croccante dall'olio in teglia.",
    },
    prosciutto_funghi_assembly: {
      title: "Prosciutto e funghi al trancio",
      description: "Passata e mozzarella. Distribuisci prosciutto cotto e champignon. Il grande classico al trancio milanese.",
    },
    "4formaggi_trancio_assembly": {
      title: "Quattro formaggi al trancio",
      description: "Base bianca con mozzarella, gorgonzola e fontina a tocchetti. Parmigiano in superficie. Sull'impasto alto e soffice milanese.",
    },
    friggere_patatine_wurstel: {
      title: "Friggi le patatine",
      description: "Friggi le patatine a 170-175 °C finché sono dorate, oppure cuoci quelle surgelate come dice la confezione. Scolale su carta e salale.",
      tip_beginner: "Preparale mentre la pizza cuoce: devono essere calde e croccanti quando la sforni.",
      tip_nerd: "In forno le patatine già fritte perdono acqua e croccantezza e la mozzarella le ammorbidisce: aggiunte all'uscita restano croccanti.",
    },
    spread_wurstel_patatine: {
      title: "Pomodoro, mozzarella e würstel",
      description: "Stendi la passata, distribuisci il fior di latte e le rondelle di würstel. Le patatine non vanno in forno.",
    },
    finish_wurstel_patatine: {
      title: "Patatine all'uscita",
      description: "Appena sfornata, distribuisci le patatine fritte calde sulla pizza.",
    },
    spread_prosciutto_cotto_nap: {
      title: "Condimento Prosciutto cotto",
      description: "Pelati schiacciati e fior di latte. Distribuisci le fette di prosciutto cotto spezzate a mano e un filo d'olio.",
    },
    spread_prosciutto_cotto_rom: {
      title: "Condimento Prosciutto cotto",
      description: "Passata e fior di latte. Il prosciutto cotto va sopra la mozzarella; nelle cotture lunghe del forno di casa mettilo negli ultimi 3-4 minuti, così non si secca.",
      tip_beginner: "Se dopo 10 minuti di forno il prosciutto è già arricciato e scuro, la prossima volta mettilo a fine cottura.",
      tip_nerd: "Il prosciutto cotto è già cotto e ha poca acqua libera: oltre i 6-8 minuti a 250 °C si disidrata e i bordi caramellano fino ad amareggiare.",
    },
    saltare_champignon_funghi_nap: {
      title: "Salta gli champignon",
      description: "Affetta gli champignon e saltali 5-6 minuti in padella con un filo d'olio finché perdono l'acqua. Sala a fine cottura e lasciali intiepidire.",
    },
    spread_funghi_nap: {
      title: "Condimento Funghi",
      description: "Pelati schiacciati e fior di latte. Distribuisci gli champignon saltati e un filo d'olio.",
    },
    saltare_champignon_funghi_rom: {
      title: "Salta gli champignon",
      description: "Affetta gli champignon. Scalda l'olio con l'aglio in camicia e salta i funghi 8-10 minuti a fiamma vivace finché perdono l'acqua e dorano. Sale e prezzemolo a fine cottura.",
      tip_beginner: "Cuocili prima: crudi rilasciano acqua sulla pizza e la base resta bagnata.",
      tip_nerd: "Gli champignon sono circa il 92 % acqua: in padella ne perdono circa metà, e la base non riceve quell'acqua in cottura.",
    },
    spread_funghi_rom: {
      title: "Condimento Funghi",
      description: "Passata e fior di latte. Distribuisci gli champignon saltati a temperatura ambiente e un filo d'olio.",
    },
    spread_napoli_rom: {
      title: "Condimento Napoli",
      description: "Passata e fior di latte. Distribuisci i filetti di acciuga, l'origano e, se li usi, i capperi. Filo d'olio.",
      tip_beginner: "Le acciughe sono già salate: niente sale sulla passata.",
      tip_nerd: "I filetti sott'olio portano circa il 15 % di sale sul loro peso: 15 g aggiungono intorno ai 2 g di sale alla pizza.",
    },
    spread_napoli_nap: {
      title: "Condimento con alici",
      description: "Pelati schiacciati e fior di latte. Distribuisci i filetti di alici e l'origano. Filo d'olio.",
    },
    friggere_melanzane_parmigiana: {
      title: "Friggi le melanzane",
      description: "Taglia le melanzane a fette di 5 mm. Se sono amare, salale e lasciale 30 minuti in uno scolapasta, poi asciugale. Friggile a 170 °C 2-3 minuti per lato finché sono dorate e scolale su carta.",
      tip_beginner: "Si possono friggere anche il giorno prima e tenerle in frigo: tirale fuori un'ora prima.",
      tip_nerd: "La melanzana assorbe olio come una spugna finché la superficie non si chiude: olio ben caldo e poche fette per volta, così la temperatura non crolla.",
    },
    spread_parmigiana_nap: {
      title: "Condimento Parmigiana",
      description: "Pelati, poi la provola. Sovrapponi le melanzane fritte, cospargi di parmigiano e aggiungi il basilico all'uscita.",
    },
    friggere_melanzane_parmigiana_rom: {
      title: "Friggi le melanzane",
      description: "Taglia le melanzane a fette di 5 mm, salale se amare e asciugale. Friggile a 170 °C 2-3 minuti per lato e scolale su carta.",
    },
    spread_parmigiana_rom: {
      title: "Condimento Parmigiana",
      description: "Passata e fior di latte, poi le melanzane fritte e il parmigiano. Basilico all'uscita.",
    },
    friggere_melanzane_norma: {
      title: "Friggi le melanzane a cubetti",
      description: "Taglia le melanzane a cubetti di 1,5 cm, salale se amare e asciugale. Friggile a 170 °C finché sono dorate e scolale su carta.",
    },
    spread_norma_nap: {
      title: "Pomodoro, fior di latte e melanzane",
      description: "Pelati schiacciati, fior di latte e cubetti di melanzana fritta.",
    },
    finish_norma_nap: {
      title: "Ricotta salata e basilico",
      description: "Appena sfornata, grattugia sopra la ricotta salata e aggiungi il basilico.",
      tip_beginner: "La ricotta salata va a crudo: in forno si scioglie e perde il suo sapore deciso.",
      tip_nerd: "È una ricotta pressata e stagionata, povera d'acqua e molto salata: grattugiata sulla pizza calda resta in fiocchi e non fonde come la mozzarella.",
    },
    friggere_melanzane_norma_rom: {
      title: "Friggi le melanzane a cubetti",
      description: "Taglia le melanzane a cubetti di 1,5 cm, salale se amare e asciugale. Friggile a 170 °C finché sono dorate e scolale su carta.",
    },
    spread_norma_rom: {
      title: "Pomodoro, fior di latte e melanzane",
      description: "Passata, fior di latte e cubetti di melanzana fritta.",
    },
    finish_norma_rom: {
      title: "Ricotta salata e basilico",
      description: "Appena sfornata, grattugia sopra la ricotta salata e aggiungi il basilico.",
    },
    sgocciolare_bufala_nap: {
      title: "Sgocciola la bufala",
      description: "Taglia la mozzarella di bufala a pezzi e lasciala in uno scolapasta in frigo almeno un'ora, così perde il siero.",
    },
    spread_bufalina_nap: {
      title: "Condimento Bufalina",
      description: "Pelati schiacciati, bufala sgocciolata a pezzi, basilico e un filo d'olio. Nel forno da 430 °C in su la bufala può cuocere sulla pizza: bastano 60-90 secondi.",
    },
    spread_bufalina_rom: {
      title: "Solo pomodoro in forno",
      description: "Stendi la passata con un filo d'olio. La bufala non va in forno.",
    },
    finish_bufalina_rom: {
      title: "Bufala e basilico all'uscita",
      description: "Appena sfornata, distribuisci la bufala a pezzi e il basilico.",
      tip_beginner: "Nelle cotture lunghe la bufala in forno diventa gommosa e lascia un lago di siero: all'uscita resta morbida.",
      tip_nerd: "La bufala ha più acqua e più grasso del fior di latte: oltre qualche minuto di calore la cagliata si contrae e spurga il siero, che bagna la base.",
    },
    stufare_cipolla_pugliese: {
      title: "Stufa la cipolla",
      description: "Affetta sottile la cipolla e stufala 10-12 minuti a fuoco basso con un filo d'olio e un pizzico di sale, finché è morbida e trasparente. Lasciala intiepidire.",
      tip_beginner: "In 60-90 secondi di forno la cipolla cruda resta croccante e pungente: stufata prima arriva già morbida.",
      tip_nerd: "Per ammorbidirsi la cipolla deve perdere acqua e far cedere le pareti delle cellule, e a 100 °C servono minuti: la cottura napoletana è troppo breve.",
    },
    spread_pugliese_nap: {
      title: "Condimento Pugliese",
      description: "Pelati schiacciati e fior di latte. Distribuisci la cipolla stufata, l'origano e un filo d'olio.",
    },
    spread_pugliese_rom: {
      title: "Condimento Pugliese",
      description: "Passata e fior di latte. Distribuisci la cipolla cruda a velo, l'origano e un filo d'olio: nella cottura lunga la cipolla cuoce sulla pizza.",
      description_short_bake: "Passata e fior di latte. Distribuisci la cipolla, l'origano e un filo d'olio. In una cottura così breve la cipolla cruda resta croccante: se la vuoi morbida, stufala prima 10 minuti in padella.",
      tip_beginner: "Affettala più sottile che puoi: le fette spesse restano crude al centro.",
      tip_nerd: "Il velo di cipolla perde acqua sotto il calore del cielo del forno e si colora ai bordi; uno spessore oltre i 2-3 mm non fa in tempo ad ammorbidirsi.",
    },
    condire_pomodorini_crudaiola: {
      title: "Condisci i pomodorini",
      description: "Taglia i pomodorini a spicchi, condiscili con il sale e un filo d'olio e lasciali in uno scolapasta mentre la pizza cuoce, così perdono l'acqua in eccesso.",
    },
    spread_crudaiola: {
      title: "Solo fior di latte in forno",
      description: "Distribuisci il fior di latte sull'impasto con un filo d'olio. Pomodorini, rucola e parmigiano non vanno in forno.",
    },
    finish_crudaiola: {
      title: "Il fresco all'uscita",
      description: "Appena sfornata, distribuisci i pomodorini sgocciolati, la rucola e le scaglie di parmigiano. Finisci con l'olio rimasto.",
      tip_beginner: "Aspetta un minuto prima di mettere la rucola: sulla mozzarella bollente appassisce subito.",
      tip_nerd: "Cotti, pomodorini e rucola perdono acqua e profumi volatili; a crudo sulla pizza calda restano croccanti, ed è il contrasto caldo-freddo a fare la crudaiola.",
    },
    spread_tirolese: {
      title: "Pomodoro e mozzarella",
      description: "Stendi la passata e distribuisci il fior di latte. Lo speck non va in forno.",
    },
    finish_tirolese: {
      title: "Speck all'uscita",
      description: "Appena sfornata, adagia le fette di speck sulla pizza calda.",
      tip_beginner: "In forno lo speck si secca e diventa duro e salato: sulla pizza calda resta morbido.",
      tip_nerd: "Lo speck è crudo, salato e affumicato, con poca acqua: il calore residuo basta a rendere traslucido il grasso senza disidratare la fetta.",
    },
    spread_bismarck: {
      title: "Condimento Bismarck",
      description: "Passata, fior di latte e prosciutto cotto; lascia libero il centro. Inforna senza uovo: negli ultimi 4-5 minuti di cottura apri il forno, rompi l'uovo al centro e finisci la cottura finché l'albume è rappreso.",
      description_short_bake: "Passata, fior di latte e prosciutto cotto, con un incavo al centro. Rompi l'uovo nell'incavo subito prima di infornare: in una cottura così breve non c'è un momento per aggiungerlo dopo.",
      tip_beginner: "Rompi l'uovo prima in una tazzina: lo fai scivolare al centro senza rompere il tuorlo.",
      tip_nerd: "L'albume comincia a rapprendersi verso i 62 °C e diventa compatto verso gli 80 °C, il tuorlo si addensa da circa 65 °C: in 10-12 minuti di forno di casa l'uovo diventa sodo, in 4-5 l'albume si rapprende e il tuorlo resta morbido.",
    },
    spread_mimosa: {
      title: "Condimento Mimosa",
      description: "Stendi la panna in uno strato sottile lasciando libero il bordo. Distribuisci il fior di latte, il prosciutto cotto e il mais ben sgocciolato.",
      tip_beginner: "Asciuga il mais su carta da cucina: il liquido della scatola bagna la base.",
      tip_nerd: "La panna al posto del pomodoro porta grasso e poca acqua: la base resta bianca e cremosa, ma un velo spesso rallenta la cottura del centro.",
    },
    friggere_cruschi_lucana: {
      title: "Friggi i peperoni cruschi",
      description: "Togli il picciolo e i semi. Immergi i peperoni nell'olio a 160-170 °C per 3-5 secondi, finché diventano rosso scuro e croccanti, e scolali su carta. Se li compri già fritti, salta questo passo.",
      tip_beginner: "Bastano pochi secondi: se scuriscono troppo diventano amari, e vanno rifatti.",
      tip_nerd: "Il crusco è un peperone essiccato, quasi senz'acqua e ricco di zuccheri: nell'olio caldo croccantisce in un attimo e poco dopo caramella fino a bruciare.",
    },
    spread_lucana: {
      title: "Fior di latte e salsiccia",
      description: "Distribuisci il fior di latte e la salsiccia a pezzetti. Finisci con un filo d'olio. I cruschi non vanno in forno.",
    },
    finish_lucana: {
      title: "Cruschi all'uscita",
      description: "Appena sfornata, sbriciola sopra i peperoni cruschi.",
      tip_beginner: "In forno i cruschi anneriscono in un attimo e diventano amari: vanno sempre sulla pizza già sfornata.",
      tip_nerd: "Sono già fritti e asciutti: il calore della pizza basta a farne uscire il profumo senza cuocerli di nuovo.",
    },
    rassodare_uova_rossini: {
      title: "Rassoda le uova",
      description: "Metti le uova in acqua già bollente e cuocile 9 minuti. Raffreddale in acqua fredda, sgusciale e tagliale a fette.",
    },
    spread_rossini: {
      title: "Pomodoro e mozzarella",
      description: "Stendi la passata e distribuisci il fior di latte. Uovo e maionese vanno a freddo, dopo il forno.",
    },
    finish_rossini: {
      title: "Uovo sodo e maionese a freddo",
      description: "Lascia intiepidire la pizza un paio di minuti. Distribuisci le fette di uovo sodo e completa con la maionese a ciuffetti.",
      tip_beginner: "Sulla pizza bollente la maionese si scioglie e diventa unta: aspetta che smetta di fumare.",
      tip_nerd: "La maionese è olio emulsionato nel tuorlo: col calore le proteine del tuorlo coagulano e l'emulsione si rompe, separando l'olio.",
    },
    patate_mandolina_lardo: {
      title: "Affetta e ammolla le patate",
      description: "Affetta le patate a 1-2 mm con la mandolina, mettile a bagno 20 minuti in acqua fredda, scolale e asciugale bene.",
    },
    spread_patate_lardo: {
      title: "Patate e rosmarino in forno",
      description: "Disponi le patate a scaglie sovrapposte e condiscile con l'olio e il rosmarino. Il lardo non va in forno.",
    },
    finish_patate_lardo: {
      title: "Lardo all'uscita",
      description: "Appena sfornata, stendi le fette di lardo sulle patate calde e finisci con il fior di sale.",
      tip_beginner: "Il lardo è già salato: assaggia prima di aggiungere il fior di sale.",
      tip_nerd: "Il lardo è quasi tutto grasso: in forno si scioglie e frigge, sulle patate calde diventa solo traslucido e profumato.",
    },
    saltare_gamberetti_zucchine: {
      title: "Salta zucchine e gamberetti",
      description: "Salta le zucchine 3-4 minuti in padella con metà dell'olio, finché si ammorbidiscono, e salale. Nella stessa padella scalda l'aglio con l'olio rimasto e salta i gamberetti 1-2 minuti, finché diventano rosa. Spegni e aggiungi il prezzemolo.",
      tip_beginner: "Non cuocere troppo i gamberetti: dopo un paio di minuti diventano gommosi, e il forno li seccherebbe ancora di più.",
      tip_nerd: "Le proteine dei gamberetti si contraggono già sopra i 60 °C e spremono fuori l'acqua: una cottura breve in padella e l'aggiunta all'uscita li tengono succosi.",
    },
    spread_gamberetti_zucchine: {
      title: "Fior di latte e zucchine",
      description: "Distribuisci il fior di latte e le zucchine saltate. I gamberetti si aggiungono alla fine.",
    },
    finish_gamberetti_zucchine: {
      title: "Gamberetti all'uscita",
      description: "Appena sfornata, distribuisci i gamberetti con il loro fondo di aglio e prezzemolo.",
    },
  },
};
