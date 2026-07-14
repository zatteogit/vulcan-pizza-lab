/* === DOMAIN DATA i18n — Italian defaults === */
/* Pre-ferment guide, dietary data, troubleshooting, glossary terms */
/* Separated from cms-context.tsx for maintainability */

import type { CmsPreFerment } from "./cms-context";
import type {
  DietaryMessages,
  GlossaryMessages,
  TroubleshootingMessages,
} from "../../i18n/domain-contracts";

export const PRE_FERMENT_DEFAULTS: CmsPreFerment = {
  sectionLabel: "Pre-fermento",
  tipsLabel: "Consigli",
  showComparison: "Confronta Biga vs Poolish vs Autolisi",
  hideComparison: "Nascondi confronto",
  paramHydration: "Idratazione",
  paramDuration: "Durata",
  paramTemperature: "Temperatura",
  paramPh: "pH finale",
  detailFermentation: "Fermentazione",
  detailFlavor: "Sapore",
  detailCrust: "Crosta",
  detailExtensibility: "Estensibilità",
  detailIdealStyles: "Stili ideali",
  compLabels: [
    "Idratazione", "Lievito", "Durata", "Temperatura",
    "pH finale", "Sapore", "Estensibilità", "Alveolatura", "Complessità",
  ],
  items: {
    poolish: {
      origin: "Francese",
      description: "Pre-fermento liquido (1:1 farina:acqua) con fermentazione prevalentemente alcolica. Sviluppa zuccheri per Maillard intensa.",
      hydration: "100% (rapporto 1:1)",
      consistency: "Liquida, schiumosa",
      fermentationType: "Prevalente alcolica (CO₂ + etanolo)",
      flavor: "Dolce, maltato, note complesse",
      crustResult: "Leggera, dorata intensa, leopard spotting marcato",
      extensibility: "Alta — stesura facile",
      idealStyles: "Teglia Romana, NY Style, Napoletana contemporanea, Focacce",
      tips: [
        "Punto ottimale: superficie a cupola con bolle, poi inizia a ritirarsi",
        "Oltre 16h il sapore diventa troppo acido/alcolico",
        "Se collassa è ancora usabile ma riduci la percentuale sul totale",
        "Percentuale poolish su impasto finale: 20-40% della farina totale",
      ],
    },
    biga: {
      origin: "Italiano",
      description: "Pre-fermento asciutto (44-48% idratazione) con fermentazione lattica + alcolica. Massima conservazione e complessità aromatica.",
      hydration: "44-48%",
      consistency: "Asciutta, compatta",
      fermentationType: "Lattica + alcolica (LAB attivi)",
      flavor: "Acidulo, complesso, note fermentate",
      crustResult: "Croccante, friabile, alveolatura fine",
      extensibility: "Bassa — richiede riposo dopo staglio",
      idealStyles: "Napoletana classica, Pinsa, Pizza al taglio, Pane",
      tips: [
        "Se troppo asciutta: aggiungi 5-10% acqua per facilitare incorporazione",
        "Matura quando la superficie è screpolata \"a cupola\" e il volume è triplicato",
        "Conservabile fino a 48h in frigo (rinfresca con 10% acqua prima dell'uso)",
        "Percentuale biga su impasto finale: 20-50% della farina totale",
      ],
    },
    autolisi: {
      origin: "Universale",
      description: "Riposo enzimatico di sola farina+acqua (senza lievito né sale). Sviluppa glutine spontaneamente e attiva proteasi/amilasi.",
      hydration: "55-75% (tutta l'acqua della ricetta)",
      consistency: "Pastosa",
      fermentationType: "Nessuna (solo attività enzimatica)",
      flavor: "Neutro — non altera il sapore",
      crustResult: "Variabile — dipende dal processo successivo",
      extensibility: "Alta — impasto setoso e meno appiccicoso",
      idealStyles: "Tutti gli stili (tecnica universale)",
      tips: [
        "Farine integrali: autolisi più lunga (60-90min) per ammorbidire la crusca",
        "Acqua tiepida (30-35°C) accelera gli enzimi",
        "SEMPRE prima di aggiungere sale (il sale inibisce gli enzimi)",
        "Riduce il tempo di impasto del 30% perché il glutine si sviluppa da solo",
        "Combinabile con Biga o Poolish per risultati superiori",
      ],
    },
  },
  compValues: {
    hydration: { biga: "44-48%", poolish: "100%", autolisi: "55-75%" },
    yeast: { biga: "0.5-1%", poolish: "0.1-0.5%", autolisi: "0%" },
    duration: { biga: "16-48h", poolish: "8-16h", autolisi: "0.5-2h" },
    temperature: { biga: "16-18°C", poolish: "20-22°C", autolisi: "Ambiente" },
    ph: { biga: "5.0-5.3", poolish: "4.5-4.8", autolisi: "~6.5" },
    flavor: { biga: "Acidulo", poolish: "Dolce/maltato", autolisi: "Neutro" },
    extensibility: { biga: "Bassa", poolish: "Alta", autolisi: "Alta" },
    alveolatura: { biga: "Fine", poolish: "Grande", autolisi: "Grande" },
    complexity: { biga: "Media", poolish: "Bassa", autolisi: "Molto bassa" },
  },
};

export const DIETARY_I18N_DEFAULTS: DietaryMessages = {
  info: {
    low_fodmap: {
      name: "Low FODMAP",
      description: "Riduce fruttani e oligosaccaridi fermentabili",
      scienceNote: "Fermentazione ≥24h riduce FODMAP 70% (Costabile 2014)",
    },
    histamine: {
      name: "Bassa istamina",
      description: "Limita accumulo istamina da fermentazione lunga",
      scienceNote: "Istamina si accumula linearmente. Lievito fresco <6h: safe (<5 mg/kg)",
    },
    gluten_free: {
      name: "Senza glutine",
      description: "Per celiachia o sensibilità al glutine",
      scienceNote: "Soglia EU: <20 ppm. Richiede mix GF (riso/mais/quinoa + xantana 1.5%)",
    },
    lactose_free: {
      name: "Senza lattosio",
      description: "Per intolleranza al lattosio",
      scienceNote: "Cottura >200°C degrada 90%+ lattosio. Solo SEVERE richiede sostituzione",
    },
    nickel: {
      name: "Basso nichel",
      description: "Per allergia sistemica al nichel (SNAS)",
      scienceNote: "Farina 00 (~50 µg/100g) vs integrale (~200 µg/100g). Soglia <200 µg/die",
    },
    vegan: {
      name: "Vegano",
      description: "Nessun derivato animale",
      scienceNote: "Impasto base è già vegano. Attenzione a topping e grassi (burro → olio)",
    },
  },
  conflicts: {
    fodmap_histamine: {
      message: "FODMAP richiede fermentazione lunga (≥24h), istamina richiede fermentazione breve (≤12h)",
      compromiseTip: "Compromesso: 8-12h con lievito fresco a 18°C. FODMAP ridotti ~40% (sub-ottimale), istamina ~8 mg/kg (accettabile)",
    },
    gf_fodmap: {
      message: "Compatibili! Il mix GF elimina la fonte principale di FODMAP (fruttani del grano)",
    },
    nickel_general: {
      message: "Per basso nichel preferisci farina 00 (50 µg/100g) rispetto a integrale (200 µg/100g)",
    },
  },
  warnings: {
    fodmap_low: {
      message: "FODMAP ridotti solo {pct}% — fermentazione troppo breve",
      tip: "Aumenta a ≥24h per raggiungere 70%+ di riduzione",
    },
    fodmap_good: {
      message: "FODMAP ridotti {pct}% — buon livello per IBS",
      tip: "La fermentazione è sufficientemente lunga per degradare i fruttani",
    },
    histamine_high: {
      message: "Istamina stimata ~{val} mg/kg — livello alto",
      tip: "Riduci fermentazione a ≤12h o usa lievito fresco a ≤20°C",
    },
    histamine_moderate: {
      message: "Istamina stimata ~{val} mg/kg — livello moderato",
      tip: "Monitora i sintomi. Per sicurezza, riduci tempo o temperatura",
    },
    gluten_free: {
      message: "Ricetta usa farina di grano — incompatibile con celiachia",
      tip: "Sostituisci con mix GF (riso 40% + mais 30% + quinoa 10% + sorgo 10% + amido 10%) + xantana 1.5%",
    },
    nickel_highW: {
      message: "Farine forti (W alto) tendono ad essere meno raffinate, con più nichel",
      tip: "Preferisci farina 00 raffinata (W 200-260) per minimizzare nichel",
    },
  },
};

export const TROUBLESHOOTING_I18N_DEFAULTS: TroubleshootingMessages = {
  categories: {
    dough: "Impasto",
    fermentation: "Fermentazione",
    shaping: "Stesura",
    baking: "Cottura",
    solver: "Algoritmo",
    false_positive: "Falsi Allarmi",
  },
  issues: {
    P01: {
      symptom: "Impasto appiccicoso persistente",
      cause: "Idratazione superiore alla capacità di assorbimento della farina",
      testRapido: "Confronta H% ricetta vs assorbimento farina (+5% max)",
      fixImmediate: "Aggiungi 2-3% di farina e incorpora con pieghe delicate",
      prevention: "Usa H% ≤ assorbimento farina + 5%",
    },
    P02: {
      symptom: "L'impasto si strappa durante la stesura",
      cause: "P/L troppo alto (>0.8) o fermentazione insufficiente (<6h)",
      testRapido: "Stira il panetto di 10cm: si rompe?",
      fixImmediate: "Riposo 60min coperto a temperatura ambiente",
      prevention: "Scegli farine con P/L 0.5-0.6, fermentazione minima 8h",
    },
    P03: {
      symptom: "L'impasto collassa quando lo tocchi",
      cause: "Over-fermentato (volume >150%, finger dent non torna)",
      testRapido: "Premi con dito 1cm: torna in 3-5s?",
      fixImmediate: "Irreversibile. Stendi delicatamente e cuoci subito",
      prevention: "Controlla volume ogni 6h, max +150% aumento",
    },
    P04: {
      symptom: "Nessuna lievitazione dopo 6+ ore",
      cause: "Lievito morto, temperatura troppo bassa, o sale a contatto diretto",
      testRapido: "Test vitalità: 5g lievito + 5g zucchero in 100ml acqua 35°C — schiuma dopo 15min?",
      fixImmediate: "Aggiungi 0.3% lievito fresco sciolto in acqua tiepida, incorpora con pieghe",
      prevention: "Testa il lievito prima di ogni utilizzo",
    },
    P05: {
      symptom: "Lievitazione troppo rapida (raddoppio in <3h)",
      cause: "Troppo lievito (>1.5%) o temperatura ambiente >28°C",
      testRapido: "L'impasto ha raddoppiato in meno di 3 ore?",
      fixImmediate: "Trasferisci immediatamente a 4°C per bloccare la fermentazione",
      prevention: "Usa 0.2% lievito fresco per 24h, controlla temperatura",
    },
    P06: {
      symptom: "Sapore troppo acido/acetico",
      cause: "LAB eterofermentativi attivi >48h a >18°C (specialmente con lievito madre)",
      testRapido: "pH impasto — dovrebbe essere 4.5-5.5, problematico se <4.2",
      fixImmediate: "Aggiungi 0.5-1% zucchero per mascherare acidità",
      prevention: "Fermentazioni >24h sempre a 4-8°C",
    },
    P07: {
      symptom: "Il panetto torna elastico dopo la stesura ('effetto molla')",
      cause: "Glutine non sufficientemente rilassato",
      testRapido: "Stendi a 30cm — torna a 25cm dopo 30 secondi?",
      fixImmediate: "Riposo aggiuntivo 15min coperto, stesura in 2 fasi",
      prevention: "Estrai panetti dal frigo 60-90min prima della stesura",
    },
    P08: {
      symptom: "Buchi giganti irregolari nella pizza",
      cause: "Degassaggio insufficiente + stesura troppo delicata",
      testRapido: "Alveoli >3cm e distribuzione disomogenea?",
      fixImmediate: "Pressa leggermente il panetto prima della stesura per redistribuire il gas",
      prevention: "Riduci tempo fermentazione del 20%",
    },
    P09: {
      symptom: "Base cruda ma cornicione bruciato",
      cause: "Sbilanciamento termico: troppo calore dal cielo, poco dalla platea",
      testRapido: "Contrasto colore estremo tra sopra e sotto?",
      fixImmediate: "Pre-cottura della base 3min senza topping",
      prevention: "Usa teglia/pietra più spessa, bilancia calore cielo/platea",
    },
    P10: {
      symptom: "Crosta pallida, nessuna doratura",
      cause: "Temperatura <250°C, zuccheri esauriti, o umidità eccessiva in superficie",
      testRapido: "Il forno raggiunge almeno 250°C? Fermentazione >48h?",
      fixImmediate: "Spennella olio+miele pre-cottura oppure usa grill finale 2min",
      prevention: "Aggiungi 0.5-1% zucchero, forno almeno 280°C",
    },
    P11: {
      symptom: "Pizza gommosa, non croccante",
      cause: "Temperatura cuore <85°C, idratazione >70%, o cottura troppo lenta",
      testRapido: "Termometro cuore: raggiunge 90°C+?",
      fixImmediate: "Prolunga cottura +2min o aumenta temperatura +20°C",
      prevention: "H ≤ 65%, temperatura cuore target 95°C",
    },
    P14: {
      symptom: "Macchie leopardate sul cornicione (leopard spotting)",
      cause: "Contatto con volta forno >500°C — reazione di Maillard localizzata",
      testRapido: "Le macchie sono amare al gusto?",
      fixImmediate: "NON è un problema! È la caratteristica desiderata della pizza napoletana",
      prevention: "Se troppo marcate: ruota pizza ogni 20s durante cottura",
    },
    P15: {
      symptom: "Fondo pizza scuro/nero sotto",
      cause: "Pietra o teglia troppo calda (>450°C)",
      testRapido: "Assaggia: sapore amaro?",
      fixImmediate: "Se amaro = problema (abbassa temp). Se saporito = NORMALE",
      prevention: "Pre-riscaldo pietra controllato, non oltre 400°C per pietra",
    },
    P16: {
      symptom: "Cornicione basso e piatto",
      cause: "Degassaggio eccessivo, W farina troppo basso, o uso mattarello",
      testRapido: "Altezza cornicione <1cm?",
      fixImmediate: "Stesura più delicata, non schiacciare i bordi",
      prevention: "W ≥ 240 per napoletana, mai mattarello su stili con cornicione",
    },
    P17: {
      symptom: "Pizza troppo secca",
      cause: "Idratazione <55% o cottura troppo lunga (>10min)",
      testRapido: "H% della ricetta? Tempo cottura effettivo?",
      fixImmediate: "Aggiungi olio abbondante sul topping",
      prevention: "H ≥ 58%, non superare tempo cottura consigliato",
    },
    P18: {
      symptom: "Centro della pizza acquoso",
      cause: "Topping troppo liquido o cottura troppo breve",
      testRapido: "Quantità di salsa per pizza? Mozzarella molto umida?",
      fixImmediate: "Pre-cottura base 2min, poi aggiungi topping",
      prevention: "Max 80ml salsa per pizza 30cm, sgocciola bene la mozzarella",
    },
    P19: {
      symptom: "Impossibile stendere il panetto",
      cause: "Farina Manitoba pura (W >380), impasto troppo tenace",
      testRapido: "Quale farina hai usato? W >350?",
      fixImmediate: "Blend 50:50 con farina W 200 nel prossimo impasto",
      prevention: "Max W 320 per pizza, farine con P/L 0.5-0.6",
    },
    P20: {
      symptom: "Odore 'chimico' nell'impasto",
      cause: "Acqua con cloro alto dal rubinetto",
      testRapido: "Senti odore forte aprendo il rubinetto dell'acqua?",
      fixImmediate: "Usa acqua in bottiglia per il prossimo impasto",
      prevention: "Filtra acqua o lasciala riposare 12h aperta (cloro evapora)",
    },
  },
  contextual: {
    sticky_dough: {
      message: "Idratazione {h}% con W {w}: rischio impasto appiccicoso",
      tip: "Usa farina con W ≥ 280 oppure riduci idratazione a 68-70%",
    },
    high_pl: {
      message: "P/L {pl} alto: possibile impasto troppo tenace",
      tip: "Prevedi autolisi 45min prima di aggiungere sale e lievito",
    },
    sour_risk: {
      message: "{h}h a {t}°C: rischio sapore acido",
      tip: "Per fermentazioni >24h, usa temperatura 4-8°C",
    },
    pale_crust: {
      message: "Fermentazione breve ({h}h): crosta pallida e digeribilità limitata",
      tip: "Aggiungi 0.5-1% zucchero per favorire la doratura Maillard",
    },
    cold_oven: {
      message: "Forno a {t}°C: rischio base cruda con bordo bruciato",
      tip: "Pre-cuoci la base 3min senza topping, poi aggiungi ingredienti",
    },
    beginner_hydration: {
      message: "Idratazione {h}% è impegnativa per principianti",
      tip: "Inizia con 60-65% e aumenta gradualmente con esperienza",
    },
    high_w: {
      message: "W {w} molto alto: impasto difficile da stendere",
      tip: "Mixa 50:50 con farina W 200 oppure prevedi autolisi lunga",
    },
    flat_long_ferment: {
      message: "{h}h in frigo senza pre-fermento: possibile sapore piatto",
      tip: "Aggiungi un pre-fermento (poolish o biga) per complessità aromatica",
    },
  },
};

export const GLOSSARY_TERMS_DEFAULTS: GlossaryMessages = {
  terms: {
    w_alveograph: {
      name: "W (Alveografo di Chopin)",
      definition: "Energia totale necessaria per espandere un alveolo di impasto fino a rottura. Misura la forza complessiva della farina.",
      whyImportant: "W basso (<180): impasto estensibile, fermentazione breve. W medio (220-280): ideale napoletana, tollera 18-30h. W alto (>300): impasto tenace, serve per impasti ricchi.",
      ranges: [
        { label: "Debole", value: "90–160", note: "Biscotti, cialde" },
        { label: "Media", value: "160–200", note: "Pan carrè, focaccia" },
        { label: "Medio-forte", value: "200–280", note: "Pizza napoletana" },
        { label: "Forte", value: "280–350", note: "Pane grande lievitazione" },
        { label: "Molto forte", value: "350–450", note: "Panettone, croissant" },
      ],
    },
    p_tenacity: {
      name: "P (Tenacità)",
      definition: "Resistenza massima alla deformazione. Picco della curva alveografica — quanto l'impasto resiste allo stiramento.",
      whyImportant: "P alto: impasto 'duro', tiene forma in cottura. P basso: impasto 'molle', facile stendere, può collassare.",
      ranges: [
        { label: "Pizza", value: "40–80 mm" },
        { label: "Pane", value: "80–120 mm" },
        { label: "Croissant", value: "100–140 mm" },
      ],
    },
    l_extensibility: {
      name: "L (Estensibilità)",
      definition: "Lunghezza massima raggiunta dall'alveolo prima di rottura. Misura quanto l'impasto si può allungare.",
      whyImportant: "L alto: impasto estensibile, facile stendere senza strappi. L basso: impasto corto, si strappa.",
      ranges: [
        { label: "Pizza", value: "80–120 mm" },
        { label: "Pane", value: "60–100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L (Rapporto Tenacità/Estensibilità)",
      definition: "Indice di bilanciamento meccanico. Rapporto tra resistenza e estensibilità dell'impasto.",
      whyImportant: "P/L ottimale (0.5-0.6): cornicione alto + base sottile. <0.4: pizza piatta. >0.8: impasto 'di gomma'.",
      ranges: [
        { label: "<0.4 Molto estensibile", value: "Collassa facilmente", note: "Pinsa" },
        { label: "0.4–0.5 Estensibile", value: "Facile lavorare", note: "Napoletana classica" },
        { label: "0.5–0.7 Bilanciato", value: "Buon equilibrio", note: "Napoletana moderna, pane" },
        { label: "0.7–1.0 Tenace", value: "Resistente", note: "Pane grande lievitazione" },
        { label: ">1.0 Molto tenace", value: "Elastico, ritorna", note: "Croissant" },
      ],
    },
    falling_number: {
      name: "Falling Number (Hagberg-Perten)",
      definition: "Tempo impiegato da un'asta a cadere attraverso una sospensione di farina riscaldata. Misura l'attività amilasica.",
      whyImportant: "FN basso (<250): fermentazione rapida ma impasto instabile. FN alto (>300): stabile per lunghe maturazioni.",
      ranges: [
        { label: "<200 Altissima amilasi", value: "Impasto appiccicoso", note: "Sconsigliato pizza" },
        { label: "200–250 Alta", value: "Mollica umida", note: "Pane rapido" },
        { label: "250–300 Media", value: "Buon equilibrio", note: "Pizza 8-12h" },
        { label: "300–400 Bassa", value: "Asciutto, lento", note: "Pizza 24-48h" },
        { label: ">400 Molto bassa", value: "Secco", note: "Pasta secca" },
      ],
    },
    hydration: {
      name: "Idratazione (H%)",
      definition: "Percentuale in peso di acqua rispetto alla farina nell'impasto.",
      whyImportant: "H bassa (<55%): croccante, facile. H media (60-65%): bilanciamento. H alta (>70%): serve farina forte (W>280) e abilità.",
      ranges: [
        { label: "Napoletana classica", value: "55–60%", note: "Morbido, lavorabile" },
        { label: "Napoletana contemporanea", value: "60–65%", note: "Cornicione leggero" },
        { label: "Canotto", value: "65–70%", note: "Alveoli grandi" },
        { label: "Pinsa romana", value: "75–85%", note: "Steso in teglia" },
        { label: "Focaccia/Bonci", value: "85–100%+", note: "Pastella" },
      ],
    },
    absorption: {
      name: "Assorbimento Acqua",
      definition: "Massima quantità d'acqua che una farina può assorbire mantenendo consistenza lavorabile. Dipende da proteine, amido danneggiato, fibre.",
      ranges: [
        { label: "00 debole (W150)", value: "50–52%" },
        { label: "00 media (W220)", value: "53–55%" },
        { label: "00 forte (W280)", value: "56–58%" },
        { label: "Integrale", value: "65–75%" },
        { label: "Manitoba (W380)", value: "60–65%" },
      ],
    },
    stability: {
      name: "Stabilità Impasto",
      definition: "Tempo durante il quale l'impasto mantiene consistenza ottimale durante mixing. Misurata con farinografo.",
      whyImportant: "Stabilità bassa (<5 min): degrada se overmixed. Alta (>10 min): tollera errori operativi.",
      ranges: [
        { label: "Debole", value: "2–4 min" },
        { label: "Media", value: "5–8 min" },
        { label: "Forte", value: "10–15 min" },
        { label: "Manitoba", value: "15–20 min" },
      ],
    },
    yeast: {
      name: "Lievito (Saccharomyces cerevisiae)",
      definition: "Fungo unicellulare che converte zuccheri in CO₂ + etanolo + composti aromatici.",
      whyImportant: "Temp ottimale: 28-32°C. Min 4°C (dormiente). Max 40°C (inibito). Morte >55°C.",
      ranges: [
        { label: "Fresco", value: "0.5–2.0%", note: "Umidità 70%, frigo 4°C" },
        { label: "Secco attivo", value: "0.3–1.0%", note: "Idratare prima" },
        { label: "Secco istantaneo", value: "0.2–0.8%", note: "Diretto" },
      ],
    },
    lab: {
      name: "LAB (Batteri Lattici)",
      definition: "Batteri che fermentano zuccheri producendo acido lattico (e acetico). Presenti nel lievito madre.",
      whyImportant: "Abbassano pH (4.0-4.5), aumentano acidità, degradano FODMAP (fruttani), inibiscono muffe. Temp ottimale: 28-32°C.",
    },
    q10: {
      name: "Q₁₀ (Coefficiente di Temperatura)",
      definition: "Fattore moltiplicativo della velocità di reazione biochimica per ogni aumento di 10°C.",
      whyImportant: "Fermentazione raddoppia ogni +10°C. 24h a 18°C ≈ 12h a 28°C.",
      ranges: [
        { label: "Lievito commerciale ≥10°C", value: "2.0", note: "Standard" },
        { label: "Lievito commerciale <10°C", value: "1.6", note: "Cold adapted" },
        { label: "Lievito madre >15°C", value: "2.2", note: "Sourdough" },
        { label: "Lievito madre ≤15°C", value: "1.9", note: "Sourdough cold" },
      ],
    },
    arrhenius: {
      name: "Equazione di Arrhenius",
      definition: "Descrive la dipendenza della velocità di reazione dalla temperatura assoluta.",
      whyImportant: "Con β=0.075 e T_ref=18°C → Q₁₀ ≈ 2.12. Usato nel motore Vulcan per calcolare dosaggio lievito e tempi.",
    },
    biga: {
      name: "Biga",
      definition: "Pre-impasto asciutto (44-50% idratazione) con farina + acqua + lievito, fermentato 16-24h a 16-18°C.",
      whyImportant: "Aumenta forza, estensibilità, sapore complesso, alveolatura irregolare rustica, shelf life più lunga. Dosaggio: 20-40% su farina totale.",
    },
    poolish: {
      name: "Poolish",
      definition: "Pre-impasto liquido (100% idratazione) con farina + acqua 1:1 + lievito, fermentato 12-16h a 16-18°C.",
      whyImportant: "Estensibilità alta, alveolatura fine e uniforme, sapore dolce-acidulo, crosta sottile croccante. Poolish = estensibilità; Biga = forza.",
    },
    autolysis: {
      name: "Autolisi",
      definition: "Riposo di farina + acqua (senza lievito/sale) per 20-60 min. Enzimi proteasi sviluppano il glutine spontaneamente.",
      whyImportant: "Riduce mixing time -30-50%, aumenta estensibilità, migliore idratazione. 20-30 min per W<200, 45-60 min per W>280.",
    },
    bulk_fermentation: {
      name: "Puntata (Bulk Fermentation)",
      definition: "Prima fase fermentazione dopo mixing, prima della divisione in panetti. L'impasto riposa in massa unica 30 min – 4h.",
      whyImportant: "Rilassamento glutine, inizio fermentazione, sviluppo aromi, aumento volume 20-50%.",
    },
    ball_fermentation: {
      name: "Appretto (Ball Fermentation)",
      definition: "Seconda fase fermentazione dopo divisione in panetti. Ogni panetto riposa singolarmente 4-48h a 4-22°C.",
      whyImportant: "Fermentazione principale, maturazione proteolisi, sviluppo volume finale, stabilizzazione pH.",
    },
    maillard: {
      name: "Reazione di Maillard",
      definition: "Reazione non-enzimatica tra aminoacidi e zuccheri riducenti ad alta temperatura (>140°C).",
      whyImportant: "Crosta dorata (melanoidine), aroma tostato (pirazine), leopard spotting a 300°C+. Ottimale 160-180°C.",
    },
    caramelization: {
      name: "Caramellizzazione",
      definition: "Degradazione termica degli zuccheri (senza proteine) ad alta temperatura (>150°C saccarosio, >120°C fruttosio).",
      whyImportant: "Contribuisce a macchie scure su cornicione. Meno rilevante di Maillard nella pizza (poche proteine in superficie).",
    },
    starch_gelatinization: {
      name: "Gelatinizzazione Amido",
      definition: "Transizione amido da stato cristallino a gelatinoso assorbendo acqua. Inizio 55-60°C, picco 65-70°C, completamento 80-85°C.",
      whyImportant: "Mollica: rende amido digeribile (<55°C al cuore = amido crudo). Crosta: >100°C → croccante.",
    },
    retrogradation: {
      name: "Retrogradazione",
      definition: "Ricristallizzazione dell'amido gelatinizzato durante conservazione. Massima a 4°C (frigo).",
      whyImportant: "Mollica diventa dura e 'stantia'. Ritardare con: grassi 2-3%, zuccheri 1-2%, fermentazione lunga, idratazione alta.",
    },
    thermal_conductivity: {
      name: "Conducibilità Termica",
      definition: "Capacità di un materiale di condurre calore.",
      whyImportant: "Acciaio (k=50): ideale forni casa 280°C, cottura 6-8 min. Pietra (k=2): ideale forni legna 450°C+, cottura 60-90s.",
      ranges: [
        { label: "Rame", value: "400" },
        { label: "Alluminio", value: "205" },
        { label: "Acciaio al carbonio", value: "50" },
        { label: "Acciaio inox", value: "16" },
        { label: "Cordierite (pietra)", value: "2.5–3.5" },
        { label: "Pietra refrattaria", value: "1.0–1.5" },
        { label: "Impasto pizza", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Carboidrati a catena corta fermentabili (fruttani 1-3% nel grano).",
      whyImportant: "Intestino non digerisce fruttani → batteri fermentano → gas/gonfiore. Fermentazione lunga riduce: 24h→60-70%, 48h→80-85%.",
    },
    histamine: {
      name: "Istamina",
      definition: "Ammina biogena da decarbossilazione dell'istidina. Prodotta da LAB durante fermentazione, presente in formaggi stagionati e salumi.",
      whyImportant: "Accumulo lineare con tempo. Madre 24h/28°C → 30-50 mg/kg. Soggetti con deficit DAO: reazione pseudo-allergica. Soluzione: fermentazione breve (<12h) + lievito commerciale.",
    },
    gluten: {
      name: "Glutine",
      definition: "Complesso proteico viscoelastico formato da gliadina (estensibile) + glutenina (tenace) in presenza di acqua e mixing.",
      whyImportant: "Elasticità da glutenine (legami S-S), viscosità da gliadine (legami H). Proteolisi lunga taglia legami → impasto più estensibile.",
    },
    proteolysis: {
      name: "Proteolisi",
      definition: "Degradazione proteine in peptidi e aminoacidi da parte di enzimi proteasi. Target: glutine.",
      whyImportant: "Facilità stesura, aumento digeribilità, aminoacidi liberi → sapore umami. Eccessiva (>72h): impasto troppo molle. Ottimale: 24-48h.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Densità superficiale impasto — massa per unità area. Indica quanto impasto c'è per cm².",
      whyImportant: "Determina tempo cottura, croccantezza e densità calorica. Metrica originale Progetto Vulcan.",
      ranges: [
        { label: "Napoletana", value: "0.30–0.36", note: "6-7 mm" },
        { label: "Romana tonda", value: "0.20–0.25", note: "4-5 mm" },
        { label: "New York", value: "0.40–0.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00–1.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "Friction Factor (Fattore Attrito)",
      definition: "Incremento temperatura impasto (°C) per minuto di mixing, dovuto ad attrito meccanico.",
      whyImportant: "Mixing genera calore → alza temperatura → fermentazione troppo rapida. Usato nella Regola del 55.",
      ranges: [
        { label: "Manuale", value: "0.0" },
        { label: "Planetaria domestica", value: "0.8–1.0" },
        { label: "Spirale professionale", value: "0.4–0.6" },
        { label: "Forcella", value: "0.2–0.3" },
      ],
    },
    rule_of_55: {
      name: "Regola del 55",
      definition: "Formula empirica per calcolare temperatura acqua necessaria a raggiungere temperatura impasto target.",
      whyImportant: "55 = costante empirica (varia 50-60 per diverse macchine). ΔT_attrito = Friction Factor × tempo mixing.",
    },
    a_score: {
      name: "A-Score (Authenticity)",
      definition: "Punteggio 0-100 che misura aderenza di una ricetta al disciplinare dello stile target.",
      ranges: [
        { label: "90-100", value: "Rigorosamente autentica" },
        { label: "75-89", value: "Sostanzialmente autentica" },
        { label: "60-74", value: "Ispirata allo stile" },
        { label: "<60", value: "Deviazione significativa" },
      ],
    },
    f_score: {
      name: "F-Score (Feasibility)",
      definition: "Punteggio 0-100 che misura realizzabilità pratica data equipaggiamento e abilità utente.",
      ranges: [
        { label: "90-100", value: "Altamente fattibile" },
        { label: "75-89", value: "Fattibile con attenzione" },
        { label: "60-74", value: "Difficile" },
        { label: "<60", value: "Sconsigliato" },
      ],
    },
    d_score: {
      name: "D-Score (Digestibility)",
      definition: "Punteggio 0-100 che stima digeribilità basato su ore fermentazione normalizzate e riduzione FODMAP.",
      ranges: [
        { label: "85-100", value: "Alta (>48h equivalenti)" },
        { label: "70-84", value: "Media-alta (24-48h)" },
        { label: "50-69", value: "Media (12-24h)" },
        { label: "<50", value: "Bassa (<12h)" },
      ],
    },
  },
};
