import { ISSUES_DB } from "../../data/troubleshooting-data";
import { GLOSSARY_TERMS, LOCALIZED_FORMULA_TERMS } from "../../data/glossary-terms";
import { BRAND } from "../../config/brand";
/* === DOMAIN DATA i18n — Italian defaults === */
/* Pre-ferment guide, dietary data, troubleshooting, glossary terms */
/* Separated from cms-context.tsx for maintainability */

import type { CmsPreFerment, CmsScience } from "./cms-context";
import type {
  GlossaryMessages,
  TroubleshootingMessages,
} from "../../i18n/domain-contracts";

export const PRE_FERMENT_DEFAULTS: CmsPreFerment = {
  sectionLabel: "Prefermento",
  tipsLabel: "Consigli",
  showComparison: "Confronta Biga vs Poolish vs Autolisi",
  paramHydration: "Idratazione",
  paramDuration: "Durata",
  paramTemperature: "Temperatura",
  paramYeast: "Lievito fresco",
  detailFermentation: "Fermentazione",
  detailFlavor: "Sapore",
  detailCrust: "Crosta",
  detailExtensibility: "Estensibilità",
  detailIdealStyles: "Stili ideali",
  /* FW-05 */
  techniqueLabel: "Tecnica",
  recipeContextLine: "In questa ricetta: {yeast} di lievito su {flour} di farina del prefermento ({pct}). Tutto il lievito dell'impasto va nel prefermento ed è dosato sulle ore totali della ricetta, non sulle sole ore del prefermento.",
  compLabels: [
    "Idratazione",
    "Lievito fresco (sulla farina del prefermento)",
    "Durata",
    "Temperatura",
    "Sapore",
    "Estensibilità",
  ],
  items: {
    poolish: {
      origin: "Polonia, poi Francia",
      description: "Prefermento liquido: farina e acqua in parti uguali con poco lievito, 12–16 h a 20–22 °C.",
      hydration: "100% (farina e acqua in parti uguali)",
      consistency: "Liquida, schiumosa",
      fermentationType: "Più rapido della biga a parità di lievito: con la dose indicata matura in 12–16 h",
      flavor: "Leggermente acidulo, note di nocciola",
      crustResult: "Sottile e dorata; colore e macchie dipendono da forno e temperatura",
      extensibility: "Alta (stima): stesura facile",
      tips: [
        "Pronto quando la superficie è piena di bollicine e il centro comincia a cedere",
        "Più lievito, meno ore: a 20–22 °C 0,1% per 15–16 h, 0,3% per 10–12 h",
        "Farina nel poolish: 30–50% della farina totale; {brand} parte dal {poolishFlourPct}",
      ],
    },
    biga: {
      origin: "Italia",
      description: "Prefermento asciutto: farina, {bigaHydration} d'acqua e circa l'1% di lievito fresco sulla farina della biga, circa 16 h a 18–20 °C.",
      hydration: "{bigaHydration} (fino al 50% con farine integrali)",
      consistency: "Asciutta, compatta",
      fermentationType: "Lenta: con poca acqua matura in circa 16 h (fino a 48 h con il frigo)",
      flavor: "Aromatico, floreale",
      crustResult: "Croccante; la struttura dipende da idratazione e stesura",
      extensibility: "Dipende da farina e idratazione (da verificare)",
      tips: [
        "Pronta quando è gonfia a tratti, profuma di yogurt e frizza appena; se sa di acido è andata oltre",
        "Biga lunga: 24 h a 4–5 °C, poi 24 h a 18–20 °C",
        "Farina nella biga: di solito il 30–40% della farina totale; {brand} parte dal {bigaFlourPct} e puoi cambiarla fra {flourPctMin} e {flourPctMax}",
        "Non si usa nella Napoletana STG: il disciplinare ammette solo l'impasto diretto",
      ],
    },
    autolisi: {
      origin: "R. Calvel, Francia 1974",
      description: "Non è un prefermento: farina e acqua riposano senza lievito né sale prima dell'impasto.",
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
    hydration: { biga: "{bigaHydration}", poolish: "{poolishHydration}", autolisi: "= ricetta" },
    yeast: { biga: "1%", poolish: "0,1–0,2%", autolisi: "0%" },
    duration: { biga: "16 h (fino a 48 h con 24 h in frigo)", poolish: "12–16 h", autolisi: "20–60 min" },
    temperature: { biga: "18–20 °C (biga lunga: prima 24 h a 4–5 °C)", poolish: "20–22 °C", autolisi: "Ambiente" },
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
    false_positive: "Falsi allarmi",
  },
  /* FW-05 (S13-A-01/B-01, D-I): un solo testo italiano, in ISSUES_DB; prima
   * le due copie divergevano (accenti, P21 assente qui). */
  issues: Object.fromEntries(ISSUES_DB.map(({ id, symptom, cause, testRapido, fixImmediate, prevention }) => [id, { symptom, cause, testRapido, fixImmediate, prevention }])),
  contextual: {
    sticky_dough: {
      message: "Idratazione {h}% con W {w}: rischio impasto appiccicoso",
      tip: "Questo stile prevede W {wMin}–{wMax}: usa una farina in questa forbice oppure riduci un po' l'idratazione",
    },
    high_pl: {
      message: "P/L {pl} alto: possibile impasto troppo tenace",
      tip: "Prevedi autolisi 45min prima di aggiungere sale e lievito",
    },
    sour_risk: {
      message: "{h}h a {t}°C: rischio sapore acido",
      tip: "Se la cucina è calda, sposta parte della maturazione in frigo e controlla l'impasto più dell'orologio",
    },
    pale_crust: {
      message: "Fermentazione breve: verifica lo sviluppo dell’impasto prima di proseguire.",
      tip: "Controlla volume, elasticità e risposta alla pressione: le sole ore non attestano la digeribilità.",
    },
    cold_oven: {
      message: "Forno a {t}°C, sotto la temperatura dello stile: rischio crosta pallida e pizza secca",
      tip: "Preriscalda a lungo pietra o acciaio e, se il forno ha il grill, usalo negli ultimi minuti",
    },
    beginner_hydration: {
      message: "Idratazione {h}% è impegnativa per principianti",
      tip: "Questo stile prevede {hMin}–{hMax}%: se sei alle prime armi resta vicino a {hMin}%",
    },
    high_w: {
      message: "W {w} molto oltre quella dello stile: impasto difficile da stendere",
      tip: "Questo stile prevede W {wMin}–{wMax}: taglia con una farina più debole oppure prevedi un'autolisi lunga",
    },
    flat_long_ferment: {
      message: "{h}h in frigo senza prefermento: possibile sapore piatto",
      tip: "Aggiungi un prefermento (poolish o biga) per complessità aromatica",
    },
  },
};

/* FW-05 (S12-B-14): una sola fonte per i testi italiani del glossario.
 * Prima i range e i «perché» erano copiati qui e in glossary-data.ts, e due
 * copie divergevano (Arrhenius, Q₁₀, TF). Le formule entrano nel catalogo solo
 * se hanno parole da tradurre; i range derivati dagli stili non sono testo. */
/* Nel catalogo il nome del prodotto torna token, come in ogni testo del CMS. */
const brandToken = (text: string) => text.split(BRAND.name).join("{brand}");
export const GLOSSARY_TERMS_DEFAULTS: GlossaryMessages = {
  terms: Object.fromEntries(GLOSSARY_TERMS.map((term) => [term.id, {
    name: term.name,
    definition: brandToken(term.definition),
    ...(term.whyImportant !== undefined ? { whyImportant: brandToken(term.whyImportant) } : {}),
    ...((LOCALIZED_FORMULA_TERMS as readonly string[]).includes(term.id) && term.formula ? { formula: term.formula } : {}),
    ...(term.ranges ? { ranges: term.ranges.map(({ label, value, note }) => (note ? { label, value, note } : { label, value })) } : {}),
  }])),
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
      l2: "Moltiplichiamo le ore per la velocità alla tua temperatura. Se fermenti più al fresco del riferimento (frigo, cantina), l'appretto finale si fa alla temperatura di riferimento: quelle ore contano così come sono e solo le altre si moltiplicano. Per questo il conto «ore × velocità» da solo non torna.",
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
