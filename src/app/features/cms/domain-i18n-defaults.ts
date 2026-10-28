import { ISSUES_DB } from "../../data/troubleshooting-data";
import { GLOSSARY_COPY_IT } from "../../data/glossary-copy";
/* === DOMAIN DATA i18n — Italian defaults === */
/* Pre-ferment guide, dietary data, troubleshooting, glossary terms */
/* Separated from cms-context.tsx for maintainability */

import type { CmsPreFerment, CmsScience } from "./cms-context";
import type {
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
  paramYeast: "Lievito",
  detailFermentation: "Fermentazione",
  detailFlavor: "Sapore",
  detailCrust: "Crosta",
  detailExtensibility: "Estensibilità",
  detailIdealStyles: "Stili ideali",
  compLabels: [
    "Idratazione",
    "Lievito",
    "Durata",
    "Temperatura",
    "Sapore",
    "Estensibilità",
  ],
  items: {
    poolish: {
      origin: "Polonia, poi Francia",
      description: "Pre-fermento liquido: farina e acqua in parti uguali con poco lievito, 12–16 h a 20–22 °C.",
      hydration: "100% (farina e acqua in parti uguali)",
      consistency: "Liquida, schiumosa",
      fermentationType: "Veloce: con tanta acqua matura in poche ore",
      flavor: "Leggermente acidulo, note di nocciola",
      crustResult: "Sottile e dorata; colore e macchie dipendono da forno e temperatura",
      extensibility: "Alta (stima): stesura facile",
      idealStyles: "Teglia Romana, NY Style, Napoletana contemporanea, Focacce",
      tips: [
        "Pronto quando la superficie è piena di bollicine e il centro comincia a cedere",
        "Più lievito, meno ore: a 20–22 °C 0,1% per 15–16 h, 0,3% per 10–12 h",
        "Farina nel poolish: 30–50% della farina totale",
      ],
    },
    biga: {
      origin: "Italia",
      description: "Pre-fermento asciutto: farina, 44% d'acqua e 1% di lievito, circa 16 h a 18–20 °C.",
      hydration: "44% (fino al 50% con farine integrali)",
      consistency: "Asciutta, compatta",
      fermentationType: "Lenta: con poca acqua matura in 16–48 h",
      flavor: "Aromatico, floreale",
      crustResult: "Croccante; la struttura dipende da idratazione e stesura",
      extensibility: "Dipende da farina e idratazione (da verificare)",
      idealStyles: "Pinsa, Pizza al taglio, Pala romana, Pane",
      tips: [
        "Pronta quando è gonfia a tratti, profuma di yogurt e frizza appena; se sa di acido è andata oltre",
        "Biga lunga: 24 h a 4–5 °C, poi 24 h a 18–20 °C",
        "Farina nella biga: 20–50% della farina totale, di solito un terzo",
        "Non si usa nella Napoletana STG: il disciplinare ammette solo l'impasto diretto",
      ],
    },
    autolisi: {
      origin: "R. Calvel, Francia 1974",
      description: "Non è un pre-fermento: farina e acqua riposano senza lievito né sale prima dell'impasto.",
      hydration: "Quella della ricetta (spesso si tiene da parte un po' d'acqua)",
      consistency: "Pastosa",
      fermentationType: "Nessuna (solo attività enzimatica)",
      flavor: "Neutro — non altera il sapore",
      crustResult: "Variabile — dipende dal processo successivo",
      extensibility: "Alta — impasto setoso e meno appiccicoso",
      idealStyles: "Tutti gli stili (tecnica universale)",
      tips: [
        "Riposo di 20–60 minuti; lievito e sale si aggiungono dopo",
        "Si combina con biga o poolish",
      ],
    },
  },
  compValues: {
    hydration: { biga: "44%", poolish: "100%", autolisi: "= ricetta" },
    yeast: { biga: "1%", poolish: "0,1–0,3%", autolisi: "0%" },
    duration: { biga: "16–48 h", poolish: "12–16 h", autolisi: "20–60 min" },
    temperature: { biga: "18–20 °C", poolish: "20–22 °C", autolisi: "Ambiente" },
    flavor: { biga: "Aromatico", poolish: "Leggermente acidulo", autolisi: "Neutro" },
    extensibility: { biga: "Variabile", poolish: "Alta (stima)", autolisi: "Alta" },
  },
};



export const TROUBLESHOOTING_I18N_DEFAULTS: TroubleshootingMessages = {
  categories: {
    frying: "Frittura",
    dough: "Impasto",
    fermentation: "Fermentazione",
    shaping: "Stesura",
    baking: "Cottura",
    solver: "Algoritmo",
    false_positive: "Falsi Allarmi",
  },
  issues: {
    ...Object.fromEntries(ISSUES_DB.filter(issue => issue.category === "frying").map(({ id, symptom, cause, testRapido, fixImmediate, prevention }) => [id, { symptom, cause, testRapido, fixImmediate, prevention }])),
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
      fixImmediate: "Metti l’impasto in frigorifero per rallentare la fermentazione; il freddo non la blocca subito.",
      prevention: "Usa la dose di lievito calcolata per le tue ore e la tua temperatura (a 18 °C per 24 h circa 0,1% di lievito fresco)",
    },
    P06: {
      symptom: "Sapore troppo acido/acetico",
      cause: "LAB eterofermentativi attivi >48h a >18°C (specialmente con lievito madre)",
      testRapido: "pH impasto — dovrebbe essere 4.5-5.5, problematico se <4.2",
      fixImmediate: "Lo zucchero maschera il sapore ma non corregge una fermentazione eccessiva. Rivaluta l’impasto prima di usarlo.",
      prevention: "Scegli tempo, temperatura e lievito secondo il metodo; controlla lo sviluppo senza una soglia oraria universale.",
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
      prevention: "Aggiungi 0,5–1% di zucchero o malto e porta il forno al massimo, con pietra o acciaio ben preriscaldati",
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
      cause: "Bolle sottili del cornicione che si scuriscono col calore molto forte del forno (imbrunimento e bruciatura localizzati)",
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
      message: "Fermentazione breve: verifica lo sviluppo dell’impasto prima di proseguire.",
      tip: "Controlla volume, elasticità e risposta alla pressione: le sole ore non attestano la digeribilità.",
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
      name: GLOSSARY_COPY_IT.w_alveograph.name,
      definition: GLOSSARY_COPY_IT.w_alveograph.definition,
      whyImportant: GLOSSARY_COPY_IT.w_alveograph.whyImportant,
      ranges: [
        { label: "Debole", value: "90–160", note: "Biscotti, cialde" },
        { label: "Media", value: "160–200", note: "Pan carrè, focaccia" },
        { label: "Medio-forte", value: "200–280", note: "Pizza napoletana" },
        { label: "Forte", value: "280–350", note: "Pane grande lievitazione" },
        { label: "Molto forte", value: "350–450", note: "Panettone, croissant" },
      ],
    },
    p_tenacity: {
      name: GLOSSARY_COPY_IT.p_tenacity.name,
      definition: GLOSSARY_COPY_IT.p_tenacity.definition,
      whyImportant: GLOSSARY_COPY_IT.p_tenacity.whyImportant,
      ranges: [
        { label: "Pizza", value: "40–80 mm" },
        { label: "Pane", value: "80–120 mm" },
        { label: "Croissant", value: "100–140 mm" },
      ],
    },
    l_extensibility: {
      name: GLOSSARY_COPY_IT.l_extensibility.name,
      definition: GLOSSARY_COPY_IT.l_extensibility.definition,
      whyImportant: GLOSSARY_COPY_IT.l_extensibility.whyImportant,
      ranges: [
        { label: "Pizza", value: "80–120 mm" },
        { label: "Pane", value: "60–100 mm" },
      ],
    },
    pl_ratio: {
      name: GLOSSARY_COPY_IT.pl_ratio.name,
      definition: GLOSSARY_COPY_IT.pl_ratio.definition,
      whyImportant: GLOSSARY_COPY_IT.pl_ratio.whyImportant,
      ranges: [
        { label: "<0.4 Molto estensibile", value: "Collassa facilmente", note: "Pinsa" },
        { label: "0.4–0.5 Estensibile", value: "Facile lavorare", note: "Napoletana classica" },
        { label: "0.5–0.7 Bilanciato", value: "Buon equilibrio", note: "Napoletana moderna, pane" },
        { label: "0.7–1.0 Tenace", value: "Resistente", note: "Pane grande lievitazione" },
        { label: ">1.0 Molto tenace", value: "Elastico, ritorna", note: "Croissant" },
      ],
    },
    falling_number: {
      name: GLOSSARY_COPY_IT.falling_number.name,
      definition: GLOSSARY_COPY_IT.falling_number.definition,
      whyImportant: GLOSSARY_COPY_IT.falling_number.whyImportant,
      ranges: [
        { label: "<200 Altissima amilasi", value: "Impasto appiccicoso", note: "Sconsigliato pizza" },
        { label: "200–250 Alta", value: "Mollica umida", note: "Pane rapido" },
        { label: "250–300 Media", value: "Buon equilibrio", note: "Pizza 8-12h" },
        { label: "300–400 Bassa", value: "Asciutto, lento", note: "Pizza 24-48h" },
        { label: ">400 Molto bassa", value: "Secco", note: "Pasta secca" },
      ],
    },
    hydration: {
      name: GLOSSARY_COPY_IT.hydration.name,
      definition: GLOSSARY_COPY_IT.hydration.definition,
      whyImportant: GLOSSARY_COPY_IT.hydration.whyImportant,
      ranges: [
        { label: "Napoletana classica", value: "55–60%", note: "Morbido, lavorabile" },
        { label: "Napoletana contemporanea", value: "60–65%", note: "Cornicione leggero" },
        { label: "Canotto", value: "65–70%", note: "Alveoli grandi" },
        { label: "Pinsa romana", value: "75–85%", note: "Steso in teglia" },
        { label: "Focaccia/Bonci", value: "85–100%+", note: "Pastella" },
      ],
    },
    absorption: {
      name: GLOSSARY_COPY_IT.absorption.name,
      definition: GLOSSARY_COPY_IT.absorption.definition,
      ranges: [
        { label: "00 debole (W150)", value: "50–52%" },
        { label: "00 media (W220)", value: "53–55%" },
        { label: "00 forte (W280)", value: "56–58%" },
        { label: "Integrale", value: "65–75%" },
        { label: "Manitoba (W380)", value: "60–65%" },
      ],
    },
    stability: {
      name: GLOSSARY_COPY_IT.stability.name,
      definition: GLOSSARY_COPY_IT.stability.definition,
      whyImportant: GLOSSARY_COPY_IT.stability.whyImportant,
      ranges: [
        { label: "Debole", value: "2–4 min" },
        { label: "Media", value: "5–8 min" },
        { label: "Forte", value: "10–15 min" },
        { label: "Manitoba", value: "15–20 min" },
      ],
    },
    yeast: {
      name: GLOSSARY_COPY_IT.yeast.name,
      definition: GLOSSARY_COPY_IT.yeast.definition,
      whyImportant: GLOSSARY_COPY_IT.yeast.whyImportant,
      ranges: [
        { label: "Fresco", value: "0.5–2.0%", note: "Umidità 70%, frigo 4°C" },
        { label: "Secco attivo", value: "0.3–1.0%", note: "Idratare prima" },
        { label: "Secco istantaneo", value: "0.2–0.8%", note: "Diretto" },
      ],
    },
    lab: {
      name: GLOSSARY_COPY_IT.lab.name,
      definition: GLOSSARY_COPY_IT.lab.definition,
      whyImportant: GLOSSARY_COPY_IT.lab.whyImportant,
    },
    q10: {
      name: GLOSSARY_COPY_IT.q10.name,
      definition: GLOSSARY_COPY_IT.q10.definition,
      whyImportant: "Con Q₁₀ = 2 la fermentazione raddoppia ogni +10°C: 24h a 18°C ≈ 12h a 28°C. I valori qui sotto sono stime del modello di {brand}.",
      ranges: [
        { label: "Lievito commerciale ≥10°C", value: "2.0", note: "Stima del modello, coerente con i dati di crescita fra 18 e 25 °C" },
        { label: "Lievito commerciale <10°C", value: "1.6", note: "Stima del modello, senza fonte" },
        { label: "Lievito madre >15°C", value: "2.2", note: "Stima del modello" },
        { label: "Lievito madre ≤15°C", value: "1.9", note: "Stima del modello" },
      ],
    },
    arrhenius: {
      name: GLOSSARY_COPY_IT.arrhenius.name,
      definition: GLOSSARY_COPY_IT.arrhenius.definition,
      whyImportant: "Con β=0.075 e T_ref=18°C → Q₁₀ ≈ 2.12. Usato nel motore {brand} per calcolare dosaggio lievito e tempi.",
    },
    biga: {
      name: GLOSSARY_COPY_IT.biga.name,
      definition: GLOSSARY_COPY_IT.biga.definition,
      whyImportant: GLOSSARY_COPY_IT.biga.whyImportant,
    },
    poolish: {
      name: GLOSSARY_COPY_IT.poolish.name,
      definition: GLOSSARY_COPY_IT.poolish.definition,
      whyImportant: GLOSSARY_COPY_IT.poolish.whyImportant,
    },
    autolysis: {
      name: GLOSSARY_COPY_IT.autolysis.name,
      definition: GLOSSARY_COPY_IT.autolysis.definition,
      whyImportant: GLOSSARY_COPY_IT.autolysis.whyImportant,
    },
    bulk_fermentation: {
      name: GLOSSARY_COPY_IT.bulk_fermentation.name,
      definition: GLOSSARY_COPY_IT.bulk_fermentation.definition,
      whyImportant: GLOSSARY_COPY_IT.bulk_fermentation.whyImportant,
    },
    ball_fermentation: {
      name: GLOSSARY_COPY_IT.ball_fermentation.name,
      definition: GLOSSARY_COPY_IT.ball_fermentation.definition,
      whyImportant: GLOSSARY_COPY_IT.ball_fermentation.whyImportant,
    },
    maillard: {
      name: GLOSSARY_COPY_IT.maillard.name,
      definition: GLOSSARY_COPY_IT.maillard.definition,
      whyImportant: GLOSSARY_COPY_IT.maillard.whyImportant,
    },
    caramelization: {
      name: GLOSSARY_COPY_IT.caramelization.name,
      definition: GLOSSARY_COPY_IT.caramelization.definition,
      whyImportant: GLOSSARY_COPY_IT.caramelization.whyImportant,
    },
    starch_gelatinization: {
      name: GLOSSARY_COPY_IT.starch_gelatinization.name,
      definition: GLOSSARY_COPY_IT.starch_gelatinization.definition,
      whyImportant: GLOSSARY_COPY_IT.starch_gelatinization.whyImportant,
    },
    retrogradation: {
      name: GLOSSARY_COPY_IT.retrogradation.name,
      definition: GLOSSARY_COPY_IT.retrogradation.definition,
      whyImportant: GLOSSARY_COPY_IT.retrogradation.whyImportant,
    },
    thermal_conductivity: {
      name: GLOSSARY_COPY_IT.thermal_conductivity.name,
      definition: GLOSSARY_COPY_IT.thermal_conductivity.definition,
      whyImportant: GLOSSARY_COPY_IT.thermal_conductivity.whyImportant,
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
      name: GLOSSARY_COPY_IT.fodmap.name,
      definition: GLOSSARY_COPY_IT.fodmap.definition,
      whyImportant: GLOSSARY_COPY_IT.fodmap.whyImportant,
    },
    histamine: {
      name: GLOSSARY_COPY_IT.histamine.name,
      definition: GLOSSARY_COPY_IT.histamine.definition,
      whyImportant: GLOSSARY_COPY_IT.histamine.whyImportant,
    },
    gluten: {
      name: GLOSSARY_COPY_IT.gluten.name,
      definition: GLOSSARY_COPY_IT.gluten.definition,
      whyImportant: GLOSSARY_COPY_IT.gluten.whyImportant,
    },
    proteolysis: {
      name: GLOSSARY_COPY_IT.proteolysis.name,
      definition: GLOSSARY_COPY_IT.proteolysis.definition,
      whyImportant: GLOSSARY_COPY_IT.proteolysis.whyImportant,
    },
    thickness_factor: {
      name: GLOSSARY_COPY_IT.thickness_factor.name,
      definition: GLOSSARY_COPY_IT.thickness_factor.definition,
      whyImportant: "Metrica diffusa nei calcolatori d'impasto nordamericani (in oz/in²; 1 oz/in² ≈ 4,39 g/cm²). {brand} la esprime in g/cm² per dimensionare i panetti; insieme al forno orienta tempo di cottura e croccantezza.",
      ranges: [
        { label: "Napoletana", value: "0.30–0.36", note: "6-7 mm" },
        { label: "Romana tonda", value: "0.20–0.25", note: "4-5 mm" },
        { label: "New York", value: "0.40–0.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00–1.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: GLOSSARY_COPY_IT.friction_factor.name,
      definition: GLOSSARY_COPY_IT.friction_factor.definition,
      whyImportant: GLOSSARY_COPY_IT.friction_factor.whyImportant,
      ranges: [
        { label: "A mano", value: "0" },
        { label: "Impastatrice a forcella", value: "2" },
        { label: "Spirale", value: "3" },
        { label: "Planetaria domestica (impasti da cucina)", value: "4" },
        { label: "Planetaria", value: "5" },
      ],
    },
    rule_of_55: {
      name: GLOSSARY_COPY_IT.rule_of_55.name,
      definition: GLOSSARY_COPY_IT.rule_of_55.definition,
      whyImportant: GLOSSARY_COPY_IT.rule_of_55.whyImportant,
    },
    a_score: {
      name: GLOSSARY_COPY_IT.a_score.name,
      definition: GLOSSARY_COPY_IT.a_score.definition,
      ranges: [
        { label: "90-100", value: "Rigorosamente autentica" },
        { label: "75-89", value: "Sostanzialmente autentica" },
        { label: "60-74", value: "Ispirata allo stile" },
        { label: "<60", value: "Deviazione significativa" },
      ],
    },
    f_score: {
      name: GLOSSARY_COPY_IT.f_score.name,
      definition: GLOSSARY_COPY_IT.f_score.definition,
      ranges: [
        { label: "90-100", value: "Altamente fattibile" },
        { label: "75-89", value: "Fattibile con attenzione" },
        { label: "60-74", value: "Difficile" },
        { label: "<60", value: "Sconsigliato" },
      ],
    },
    d_score: {
      name: GLOSSARY_COPY_IT.d_score.name,
      definition: GLOSSARY_COPY_IT.d_score.definition,
      ranges: [{"label":"85-100","value":"Indice alto"},{"label":"70-84","value":"Indice medio-alto"},{"label":"50-69","value":"Indice medio"},{"label":"<50","value":"Indice basso"}],
    },
  },
};

/* ═══ FW-01 — Registro della scienza: testi delle note e delle ipotesi ═══
 * Le note sono dati in src/app/data/science-notes.ts (statuto, formula, fonti);
 * qui ci sono solo le parole, su tre livelli: titolo, «In breve» (l1) e
 * «Perché» (l2). Niente numeri del motore scritti a mano: se servono, arrivano
 * come segnaposto dal chiamante. Stesse chiavi in tutte e 7 le lingue. */
export const SCIENCE_I18N_DEFAULTS: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "Dose di lievito",
      l1: "È una stima: più ore e più caldo vogliono meno lievito.",
      l2: "Partiamo da una dose di riferimento coerente con i disciplinari napoletani e la correggiamo per le tue ore e la tua temperatura. Lievito, farina e cucina reali possono spostare i tempi: guarda l'impasto più dell'orologio.",
    },
    "q10-fermentation": {
      title: "Temperatura e velocità di lievitazione",
      l1: "Più caldo, lievitazione più veloce; più freddo, più lenta. Il fattore è una stima.",
      l2: "Il modello usa un fattore di velocità a tratti rispetto a una temperatura di riferimento. A temperatura ambiente è coerente con gli studi sul lievito; al fresco e in frigo non ha una fonte e può sbagliare di molto: controlla l'impasto.",
    },
    "equivalent-hours": {
      title: "Ore equivalenti",
      l1: "Le tue ore tradotte nelle ore che servirebbero alla temperatura di riferimento.",
      l2: "Moltiplichiamo le ore per la velocità alla tua temperatura e per un fattore del metodo (prefermento, frigo). Per questo il conto «ore × velocità» da solo non torna.",
    },
    "kitchen-temp-default": {
      title: "Temperatura della cucina",
      l1: "Se non la indichi, usiamo un valore standard.",
      l2: "La temperatura della cucina cambia i tempi di lievitazione e la temperatura dell'acqua. Il valore standard è un'ipotesi: se la tua cucina è più calda o più fredda, indicalo e la ricetta si adatta.",
    },
    "proof-split": {
      title: "Durata dell'appretto",
      l1: "Quando lo stile non la indica, l'appretto è una quota fissa delle ore totali.",
      l2: "È un'ipotesi del modello, non una regola del metodo. Se la cucina è più calda del previsto l'impasto è pronto prima: controllalo.",
    },
    "sourdough-starter-dose": {
      title: "Dose di lievito madre",
      l1: "La dose di madre è una regola pratica che dipende solo dalle ore.",
      l2: "Non tiene conto della temperatura né della forza della tua madre. Farina e acqua della madre non entrano nell'idratazione mostrata: l'impasto reale è un po' più idratato.",
    },
    "pre-ferment": {
      title: "Biga e poolish",
      l1: "Idratazione, ore e temperature vengono da fonti di settore concordi.",
      l2: "La biga è un prefermento asciutto che matura lentamente al fresco; il poolish è liquido e matura più in fretta. Crosta e alveolatura dipendono soprattutto da forno, idratazione e stesura, non dal solo prefermento.",
    },
    autolysis: {
      title: "Autolisi",
      l1: "Farina e acqua riposano senza lievito né sale prima dell'impasto.",
      l2: "Non è un prefermento: non fermenta. Idrata la farina e rende l'impasto più facile da lavorare (R. Calvel, 1974).",
    },
    "water-temp-rule": {
      title: "Temperatura dell'acqua",
      l1: "Un conto esatto, che parte da alcune ipotesi sulla tua cucina.",
      l2: "Cucina, farina, acqua e calore dell'impastatrice sommano tre volte la temperatura d'impasto che vuoi. L'aritmetica è esatta; cucina e farina sono stime se non le misuri, e il calore dell'impastatrice è un valore tipico.",
    },
    "water-activity": {
      title: "Attività dell'acqua (Aw)",
      l1: "Un indice stimato, non misurato.",
      l2: "Lo calcoliamo con una formula semplice da idratazione, sale e zucchero. Serve a confrontare ricette, non a dire quanto si conserva la pizza: per un valore vero serve uno strumento.",
    },
    "dough-indices": {
      title: "Indici dell'impasto",
      l1: "Rete glutinica e proteolisi sono indici del modello, non misure.",
      l2: "Mettono insieme forza della farina, idratazione e ore con pesi scelti da {brand}. Servono a confrontare due ricette, non sono valori di laboratorio.",
    },
    "salt-range": {
      title: "Intervallo del sale",
      l1: "Le tacche del sale sono una scelta di {brand}, non un intervallo da fonte.",
      l2: "Per la Napoletana STG il disciplinare indica un intervallo preciso; per gli altri stili mostriamo una fascia stretta attorno al valore della ricetta.",
    },
    "stg-salt-timing": {
      title: "Il sale nella Napoletana STG",
      l1: "Il disciplinare scioglie il sale nell'acqua prima di aggiungere la farina.",
      l2: "È l'ordine del Regolamento UE della STG. Altri metodi aggiungono il sale più tardi: per questo stile seguiamo il disciplinare.",
    },
    "flour-w-by-grade": {
      title: "Tipo di farina e forza",
      l1: "00, 0, 1 e integrale dicono quanto è raffinata la farina, non quanto è forte.",
      l2: "La forza (W) cambia da un sacco all'altro anche nello stesso tipo. Se il sacco non la indica, il modello usa una stima per il tipo: per un valore vero guarda la scheda del produttore.",
    },
    "flour-pl-estimate": {
      title: "P/L stimato",
      l1: "Se non indichi il P/L, lo stimiamo dalla forza della farina.",
      l2: "È una relazione approssimata, limitata all'intervallo dello stile. Il valore vero è sulla scheda tecnica della farina.",
    },
    "stg-flour-w": {
      title: "Forza della farina nella STG",
      l1: "Usiamo la forbice dell'AVPN, più stretta di quella del disciplinare STG.",
      l2: "Il Regolamento UE della STG ammette farine più deboli e più forti; il disciplinare dell'AVPN restringe l'intervallo. È una scelta di {brand}: le due fonti sono indicate.",
    },
    "oven-max-temp": {
      title: "Temperatura massima del forno",
      l1: "È la temperatura dichiarata per il tuo modello.",
      l2: "Quasi nessun produttore dice se è la temperatura dell'aria o della pietra. Quando il dato viene da un rivenditore o da una recensione lo segnaliamo; i forni delle demo hanno dati inventati.",
    },
    "oven-preset-max-temp": {
      title: "Temperatura tipica del tipo di forno",
      l1: "Un valore tipico: correggilo con quello del tuo forno.",
      l2: "Per alcuni tipi di forno non abbiamo una scheda di produttore o una norma. Se conosci il tuo forno, indica la sua temperatura: la ricetta si adatta.",
    },
    "stg-oven-temp": {
      title: "Forno della Napoletana STG",
      l1: "Le due fonti danno la stessa temperatura a superfici diverse.",
      l2: "Il disciplinare STG la riferisce alla platea, quello dell'AVPN alla cupola. Nessuna delle due arriva all'estremo alto dell'intervallo usato dal motore: quel valore è da verificare.",
    },
    "style-min-oven-temp": {
      title: "Temperatura minima dello stile",
      l1: "Per molti stili il minimo è una scelta del modello, senza fonte.",
      l2: "Sotto il minimo la ricetta risulta non fattibile o meno fedele. Dove c'è un disciplinare lo seguiamo; negli altri casi la soglia è da verificare.",
    },
    "bake-time-home-preheat": {
      title: "Preriscaldamento del forno di casa",
      l1: "La durata del preriscaldo è un'ipotesi del modello.",
      l2: "Pietra e acciaio si scaldano più lentamente dell'aria: mettili nel forno freddo, accendi e, se puoi, misura la superficie prima di infornare.",
    },
    "surface-conductivity": {
      title: "Conducibilità della superficie",
      l1: "Quanto in fretta la superficie passa calore alla pizza.",
      l2: "È la conducibilità termica tipica del materiale, in W/(m·K): i metalli vengono da tabelle tecniche, pietra e refrattario sono valori da verificare. La griglia non ha una superficie di contatto.",
    },
    "baking-energy": {
      title: "Energia di cottura",
      l1: "Un ordine di grandezza, non una misura.",
      l2: "Moltiplichiamo il tempo di cottura per una potenza tipica scelta secondo la temperatura del forno, uguale per legna, gas ed elettrico. Non conta il preriscaldo.",
    },
    "thickness-factor": {
      title: "Thickness factor",
      l1: "Grammi di impasto per ogni cm² di pizza.",
      l2: "È una metrica diffusa nei calcolatori d'impasto nordamericani, in once per pollice quadrato; {brand} la esprime in g/cm² per dimensionare i panetti.",
    },
    "score-weights": {
      title: "Pesi del punteggio",
      l1: "I pesi delle dimensioni sono una scelta di {brand}.",
      l2: "Dicono quanto conta ogni dimensione nel numero finale. Non vengono da una misura: sono una regola dell'app, uguale per tutti.",
    },
    "non-feasible-ceiling": {
      title: "Tetto per le ricette non fattibili",
      l1: "Una ricetta che non puoi fare resta nella fascia bassa: è una regola dell'app.",
      l2: "Così una ricetta non eseguibile non supera mai una che puoi fare, anche se le altre dimensioni sono alte.",
    },
    "authenticity-fuel-cap": {
      title: "Tetto di autenticità per il combustibile",
      l1: "Senza il forno previsto dallo stile, l'autenticità ha un tetto: è una scelta di {brand}.",
      l2: "Quando uno stile richiede legna o carbone, un altro forno può cuocere bene ma non segue il metodo. Il tetto è un confine editoriale, non una misura della qualità.",
    },
    digestibility: {
      title: "Indice di digeribilità",
      l1: "Un indice del modello sul processo, non una promessa per la salute.",
      l2: "Tiene conto di ore e temperature di maturazione. Non misura come una persona digerisce una pizza e non attesta l'idoneità a una dieta.",
    },
    "troubleshooting-thresholds": {
      title: "Soglie dei problemi",
      l1: "Le soglie numeriche dei problemi sono indicative.",
      l2: "Sono regole pratiche senza una fonte pubblicata e non tengono conto dello stile: un impasto in teglia, per esempio, è molto più idratato di una napoletana. Usale come spunto, non come diagnosi.",
    },
  },
  assumptions: {
    "constant-ferment-temp": "La temperatura resta costante per tutta la fase.",
    "time-exponent-no-source": "La correzione per le ore usa un esponente scelto dal modello, senza fonte.",
    "kitchen-temp-standard": "Se non indichi la temperatura della cucina, usiamo un valore standard.",
    "q10-cold-no-source": "Al fresco e in frigo il fattore di velocità non ha una fonte: l'errore può essere grande.",
    "proof-share-default": "Senza indicazioni dello stile, l'appretto è una quota fissa delle ore.",
    "starter-steps-by-hours": "La dose di madre scende a gradini con le ore, senza considerare la temperatura.",
    "starter-not-in-hydration": "Farina e acqua della madre non sono contate nell'idratazione.",
    "flour-at-kitchen-temp": "La farina è alla temperatura della cucina.",
    "mixer-friction-values": "Il calore dell'impastatrice è un valore tipico da verificare; a mano è zero.",
    "coefficients-not-measured": "I coefficienti della formula sono scelti dal modello, non misurati.",
    "grade-is-not-strength": "Il tipo di farina indica la raffinazione, non la forza: la W per tipo è una stima.",
    "oven-temp-surface-unspecified": "Non sappiamo se la temperatura dichiarata è dell'aria o della pietra.",
    "style-min-temp-no-source": "La temperatura minima dello stile non ha una fonte scritta.",
    "preheat-home-minutes": "La durata del preriscaldo dipende solo dalla temperatura del forno, non dalla superficie.",
    "rack-no-contact": "La griglia non ha una superficie di contatto: la base cuoce per irraggiamento e aria.",
    "oven-power-steps": "Una potenza tipica per fascia di temperatura, uguale per ogni combustibile.",
    "no-health-claim": "Nessuna affermazione sulla salute: l'indice non misura la digestione di una persona.",
    "thresholds-rules-of-thumb": "Le soglie sono regole pratiche generali, non tarate sullo stile.",
  },
};
