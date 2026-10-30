/* ═══ Voce (Siri, Alexa) — catalogo italiano ═══
 * Tutte le parole che la voce dice o riconosce, in un solo punto: frasi
 * brevi, numeri come si parlano, niente simboli. Un'altra lingua è un altro
 * file con la stessa forma (VoiceCatalog) registrato in catalogs.ts.
 * I numeri NON stanno qui: arrivano dagli strumenti MCP (answer.ts). */

import { BRAND } from "../../config/brand";
import type { VoiceCatalog } from "./catalog";

const B = BRAND.name;

const UNIT_WORDS: VoiceCatalog["units"] = {
  panetto: ["un panetto", "panetti"],
  teglia: ["una teglia", "teglie"],
  pala: ["una pala", "pale"],
  focaccia: ["una focaccia", "focacce"],
  padellino: ["un padellino", "padellini"],
  pezzo: ["un pezzo", "pezzi"],
};

export const VOICE_IT: VoiceCatalog = {
  lang: "it",
  locale: "it-IT",
  decimalSeparator: ",",
  units: UNIT_WORDS,

  /* ── Riconoscimento ── */
  styleSynonyms: {
    napoletana_stg: ["napoletana", "pizza napoletana", "la napoletana", "margherita napoletana", "la margherita napoletana", "napoletana stg", "napoletana verace", "verace", "napoletana classica", "napolitana", "pizza napoletana classica"],
    napoletana_canotto: ["napoletana canotto", "napoletana a canotto", "canotto", "a canotto", "pizza a canotto", "napoletana contemporanea", "contemporanea", "canotto contemporanea"],
    teglia_romana: ["teglia romana", "pizza in teglia", "teglia alla romana", "pizza al taglio", "romana in teglia"],
    tonda_romana: ["tonda romana", "romana", "pizza romana", "scrocchiarella", "romana sottile", "pizza romana tonda", "romana scrocchiarella"],
    pinsa_romana: ["pinsa", "pinsa romana", "pinza", "pinza romana"],
    new_york: ["new york", "newyorkese", "pizza newyorkese", "new york style", "niu iork"],
    detroit: ["detroit", "detroit style", "pizza di detroit"],
    chicago_deep: ["chicago", "deep dish", "chicago deep dish", "pizza di chicago"],
    focaccia_genovese: ["focaccia", "focaccia genovese", "fugassa", "focaccia ligure"],
    sfincione: ["sfincione", "sfinciuni", "sfincione palermitano"],
    pala_romana: ["pala romana", "pizza alla pala"],
    grandma_style: ["grandma", "grandma style", "pizza della nonna"],
    focaccia_recco: ["focaccia di recco", "focaccia recco", "recco", "focaccia al formaggio"],
    padellino_torino: ["padellino", "pizza al padellino", "tegamino", "pizza al tegamino", "padellino torinese"],
    pizza_baciata: ["baciata", "pizza baciata"],
    ciaccino_senese: ["ciaccino", "ciaccino senese"],
    pizza_spaccata: ["spaccata", "pizza spaccata"],
    trancio_milanese: ["trancio", "trancio milanese", "pizza al trancio"],
    chicago_tavern: ["tavern", "chicago tavern", "tavern style", "tavern cut"],
    focaccia_barese: ["focaccia barese", "barese"],
    pizza_fritta: ["pizza fritta", "fritta", "calzone fritto"],
    pizza_montanara: ["montanara", "pizza montanara"],
    pizza_fritta_tonda: ["fritta tonda", "pizza fritta tonda"],
    calzone_napoletano: ["calzone", "calzone napoletano", "calzone al forno"],
    pizza_al_metro: ["pizza al metro", "al metro"],
    new_haven_apizza: ["new haven", "apizza", "new haven apizza"],
    fugazzeta: ["fugazzeta", "fugazza", "fugazzetta", "pizza argentina"],
    california_style: ["california", "californiana", "pizza californiana", "california style"],
    greek_pan: ["greek pan", "greca", "pizza greca", "greek"],
  },
  /** Nome detto a voce: senza virgolette, sigle lette bene. */
  spokenStyleNames: {
    tonda_romana: "Tonda Romana scrocchiarella",
  },
  termSynonyms: {
    w_alveograph: ["w", "vu doppia", "doppia vu", "forza della farina", "forza", "w della farina", "alveografo"],
    p_tenacity: ["tenacità", "p della farina"],
    l_extensibility: ["estensibilità", "l della farina"],
    pl_ratio: ["p su l", "pl", "rapporto p su l", "rapporto tra tenacità ed estensibilità"],
    falling_number: ["falling number", "indice di caduta"],
    hydration: ["idratazione", "idratazione dell'impasto"],
    absorption: ["assorbimento", "assorbimento acqua", "assorbimento dell'acqua"],
    stability: ["stabilità", "stabilità dell'impasto"],
    yeast: ["lievito", "lievito di birra"],
    lab: ["batteri lattici", "lab"],
    q10: ["q dieci", "q10", "coefficiente di temperatura"],
    arrhenius: ["arrhenius", "equazione di arrhenius"],
    biga: ["biga"],
    poolish: ["poolish", "pulish", "polish"],
    autolysis: ["autolisi"],
    bulk_fermentation: ["puntata", "prima lievitazione", "lievitazione in massa"],
    ball_fermentation: ["appretto", "seconda lievitazione", "lievitazione in panetti"],
    maillard: ["maillard", "reazione di maillard"],
    caramelization: ["caramellizzazione", "caramelizzazione"],
    starch_gelatinization: ["gelatinizzazione", "gelatinizzazione dell'amido"],
    retrogradation: ["retrogradazione"],
    thermal_conductivity: ["conducibilità termica", "conduttività termica"],
    fodmap: ["fodmap", "fod map"],
    histamine: ["istamina"],
    gluten: ["glutine"],
    proteolysis: ["proteolisi"],
    thickness_factor: ["thickness factor", "fattore di spessore"],
    friction_factor: ["attrito dell'impastatrice", "fattore di attrito"],
    rule_of_55: ["temperatura dell'acqua", "regola del cinquantacinque", "tre temperature"],
    a_score: ["a score", "autenticità"],
    f_score: ["f score", "facilità"],
    d_score: ["d score", "maturazione stimata"],
  },
  /** Nomi detti dei termini quando il nome del glossario ha sigle o simboli. */
  spokenTermNames: {
    w_alveograph: "La W, cioè la forza della farina",
    q10: "Il Q10",
    pl_ratio: "Il rapporto P su L",
  },
  ovenWords: [
    { type: "wood", words: ["a legna", "legna", "pellet", "forno a legna"] },
    { type: "coal", words: ["carbone", "a carbone"] },
    { type: "gas_pizza", words: ["forno a gas da pizza", "forno portatile", "fornetto a gas", "forno da pizza a gas"] },
    { type: "gas", words: ["a gas", "forno a gas"] },
    { type: "electric_high", words: ["forno elettrico per pizza", "fornetto per pizza", "fornetto pizza", "alta temperatura", "forno per pizza elettrico"] },
    { type: "home", words: ["forno di casa", "forno domestico", "forno normale", "forno elettrico", "forno ventilato", "forno di cucina", "di casa", "domestico", "elettrico", "ventilato"] },
  ],
  /** Marche dei forni: la parola detta → la parola di ricerca nel catalogo dei modelli. */
  ovenBrands: {
    ooni: "ooni", uni: "ooni", gozney: "gozney", roccbox: "roccbox", rockbox: "roccbox", effeuno: "effeuno",
    "g3": "g3", ferrari: "ferrari", alfa: "alfa", bertello: "bertello", clementi: "clementi",
    ninja: "ninja", witt: "witt", breville: "breville", sage: "sage", "solo stove": "solo",
  },
  numberWords: {
    zero: 0, uno: 1, una: 1, un: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9,
    dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14, quindici: 15, sedici: 16,
    diciassette: 17, diciotto: 18, diciannove: 19,
    venti: 20, trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60, settanta: 70, ottanta: 80, novanta: 90,
    cento: 100, duecento: 200, trecento: 300, quattrocento: 400, cinquecento: 500,
    paio: 2, dozzina: 12,
  },
  cues: {
    help: ["aiuto", "aiutami", "cosa sai fare", "come funziona", "cosa posso chiederti", "cosa posso chiedere", "istruzioni", "help"],
    glossary: ["cos e", "cosa e", "che cos e", "cosa significa", "che significa", "cosa vuol dire", "che vuol dire", "spiegami", "definizione", "significato", "cosa si intende", "parlami"],
    recommend: ["che pizza", "quale pizza", "che stile", "quale stile", "consigli", "consiglia", "consigliami", "suggerisci", "suggeriscimi", "cosa posso fare", "cosa posso preparare", "cosa faccio", "cosa cucino", "che impasto posso"],
    recipe: ["ricetta", "dosi", "impasto", "ingredienti", "come si fa", "come faccio", "come preparo", "voglio fare", "preparo", "quanta farina", "procedimento"],
  },
  countNouns: ["panetti", "panetto", "pizze", "pizza", "teglie", "teglia", "pezzi", "pezzo", "focacce", "focaccia", "pale", "pala", "pinse", "pinsa", "palline", "pallina", "calzoni", "calzone", "tranci", "trancio", "padellini", "padellino"],
  hourWords: { hours: ["ore", "ora", "h"], days: ["giorni", "giorno", "giornate", "giornata"], half: ["e mezza", "e mezzo"], halfDay: ["mezza giornata"], dayWords: ["un giorno", "una giornata"] },

  /* ── Frasi ── */
  say: {
    welcome: `Ciao, sono ${B}. Chiedimi che pizza fare, una ricetta, per esempio focaccia per due teglie, o cos'è la biga.`,
    welcomeReprompt: "Cosa ti va? Una ricetta, un consiglio o una parola del glossario?",
    help: "Puoi chiedermi: che pizza posso fare in sei ore. Oppure: ricetta teglia romana per due teglie. Oppure: cos'è l'appretto.",
    helpReprompt: "Prova con: ricetta napoletana per quattro panetti.",
    fallback: "Non ho capito. Puoi chiedermi una ricetta, un consiglio sulla pizza o il significato di una parola.",
    fallbackReprompt: "Per esempio: ricetta pinsa per due pale.",
    goodbye: "A presto, e buona pizza!",
    error: "Adesso non riesco a rispondere. Riprova tra poco.",
    tooLong: "La domanda è troppo lunga: prova con una frase più corta.",
    askStyle: "Quale stile? Per esempio napoletana, teglia romana, pinsa o focaccia.",
    askStyleReprompt: "Dimmi lo stile, per esempio napoletana.",
    unknownTerm: `Questa parola non è nel glossario di ${B}. Prova con biga, poolish, appretto o idratazione.`,
    defaultKitchen: (oven: boolean, hours: boolean) =>
      oven && hours ? "Considero un forno di casa e un giorno di tempo."
        : oven ? "Considero un forno di casa."
          : hours ? "Considero un giorno di tempo." : "",
    recommendList: (names: string[]) => names.length === 1 ? `Ti consiglio ${names[0]}.` : `Ti consiglio: ${listJoin(names)}.`,
    recommendFried: (names: string[]) => `Oppure, fritta: ${listJoin(names, "o")}.`,
    recommendScore: (name: string, score: number) => `${name} va bene con la tua cucina per ${score} su 100.`,
    recommendNone: "Per ora, con questa cucina, non trovo uno stile che si possa fare.",
    recommendNeedsHours: (name: string, hours: string, baked: boolean) =>
      `Con questo tempo non ci sta nessuna pizza: la più rapida${baked ? " al forno" : ""}, ${name}, chiede ${hours}.`,
    recommendNeedsOven: (name: string, temp: number) => `Il forno è troppo freddo: ${name} chiede almeno ${temp} gradi.`,
    recommendFollowUpAlexa: (name: string) => `Per la ricetta dimmi lo stile, per esempio ${name}.`,
    recommendFollowUpSiri: (name: string) => `Per la ricetta chiedi: ricetta ${name}.`,
    recipeHead: (name: string, count: number, unit: readonly [string, string], grams: string) =>
      `${name}: ${count === 1 ? unit[0] : `${count} ${unit[1]}`} da ${grams} grammi.`,
    flourWater: (flour: string, water: string) => `Farina ${flour} grammi, acqua ${water}.`,
    saltYeast: (salt: string, yeast: string, yeastKind: string, extra?: string) =>
      `Sale ${salt} grammi, ${yeastKind} ${yeast} grammi${extra ? `, ${extra}` : ""}.`,
    saltOnly: (salt: string) => `Sale ${salt} grammi.`,
    extras: (parts: string[]) => `${capitalize(listJoin(parts))}.`,
    extraFat: (kind: string, grams: string) => `${kind} ${grams} grammi`,
    extraSugar: (grams: string) => `zucchero ${grams} grammi`,
    fatKinds: { oil: "olio", butter: "burro", lard: "strutto" },
    yeastKinds: { fresh: "lievito fresco", dry: "lievito secco", instant: "lievito istantaneo", sourdough: "lievito madre", lievito_madre: "lievito madre" },
    yeastFallback: "lievito",
    flourBand: (band: string) => `${capitalize(band)}.`,
    flourBands: { weak: "farina debole", medium: "farina di media forza", strong: "farina forte per pizza", veryStrong: "farina molto forte, tipo Manitoba" },
    blend: (names: string[]) => `Farina: una miscela di ${listJoin(names)}.`,
    preFerment: (kind: string, flour: string) => `Si parte da una ${kind} con ${flour} grammi di farina e tutto il lievito.`,
    preFermentKinds: { biga: "biga", poolish: "poolish" },
    fermentation: (hours: string, temp: number, fridge: boolean) =>
      `Lievitazione: ${hours} a ${temp} gradi${fridge ? ", in frigo" : ""}.`,
    oven: (temp: number, total: string) => `Forno a ${temp} gradi; in tutto ${total}.`,
    fry: (temp: number, total: string) => `Si frigge in olio a ${temp} gradi; in tutto ${total}.`,
    unleavened: "Non lievita.",
    stepsInApp: `Il procedimento è su ${B}.`,
    stepsInAppAlexa: "Il procedimento è nell'app Alexa.",
    notFeasible: (name: string) => `${name}: per ora, con questa cucina, non si può fare.`,
    blockerOven: (oven: number, min: number) => `Il forno arriva a ${oven} gradi, ne servono almeno ${min}.`,
    blockerTime: (hours: string) => `Il tempo non basta: servono ${hours}.`,
    blockerOther: `Manca qualcosa per farla bene: i dettagli sono su ${B}.`,
    alternatives: (names: string[]) => `Puoi fare invece ${listJoin(names, "o")}.`,
    noAlternatives: "Per ora non trovo alternative con questa cucina: prova con più tempo.",
    caveatsIntro: "Con qualche accortezza:",
    caveats: {
      "feas.ovenSuboptimal": "il forno è sotto l'ideale, verrà simile",
      "feas.ovenTooCold": "il forno è troppo freddo per questo stile",
      "feas.thermalUnviable": "il forno è troppo freddo per questo stile",
      "gen.notWoodOven": "senza forno a legna verrà simile",
      "gen.notCoalOven": "senza forno a carbone verrà simile",
      "gen.homeBakingMethod": "nel forno di casa la cottura cambia",
      "gen.ovenTooNarrow": "la bocca del forno è stretta per questo formato",
      "gen.windowTooShort": "il tempo è sotto quello ideale dello stile",
      "gen.timeBelowStyleWindow": "il tempo è sotto quello ideale dello stile",
      "gen.timeBelowStyleWindowMeal": "il tempo è sotto quello ideale dello stile",
      "feas.hydrationBeginnerHigh": "è un impasto molto idratato, serve pratica",
      "feas.hydrationMedBeginner": "è un impasto idratato, serve un po' di pratica",
      "feas.hydrationNeedsPractice": "è un impasto molto idratato, serve pratica",
      "feas.prefermentNeedsExperience": "il pre-impasto chiede un po' di esperienza",
      "feas.wTooLow": "controlla la forza della farina",
      "feas.wTooHigh": "controlla la forza della farina",
      "feas.flourTooWeakForHydration": "la farina è debole per questa idratazione",
      "need.pan": "serve una teglia",
      "need.checkPan": "serve una teglia",
      "need.deck": "serve una pietra o un acciaio",
    },
    caveatOther: `i dettagli sono su ${B}`,
    hoursPhrase: (whole: number, half: boolean, approx: boolean) =>
      `${approx ? "circa " : ""}${whole === 0 && half ? "mezz'ora" : `${whole === 1 ? "un'ora" : `${whole} ore`}${half ? " e mezza" : ""}`}`,
    minutesPhrase: (minutes: number) => `${minutes} minuti`,
    glossaryAnswer: (name: string, definition: string) => `${name}. ${definition}`,
    cardRecipe: "Ricetta",
    cardRecommend: "Che pizza fare",
    cardGlossary: "Glossario",
    cardHelp: `${B} Pizza`,
    openOnVulcan: `Apri su ${B}`,
  },
  /** Simboli e abbreviazioni da leggere a parole (testi del glossario). */
  speechReplacements: [
    [/(\d)\s*°\s*C\b/g, "$1 gradi"],
    [/\s*°/g, " gradi"],
    [/(\d)\s*%/g, "$1 per cento"],
    [/\bcm²/g, "centimetri quadrati"],
    [/(\d)\s*h\b/g, "$1 ore"],
    [/(\d)\s*min\b/g, "$1 minuti"],
    [/(\d)\s*g\b/g, "$1 grammi"],
    [/(\d)\s*kg\b/g, "$1 chili"],
    [/\bQ₁₀/g, "Q10"],
    [/\bP\/L\b/g, "P su L"],
    [/\s*&\s*/g, " e "],
    [/\s*[—–]\s*(?=\D)/g, ", "],
    [/>\s*(\d)/g, "oltre $1"],
    [/<\s*(\d)/g, "sotto $1"],
  ],
  rangeWord: (a: string, b: string, afterPreposition: boolean) => afterPreposition ? `tra ${a} e ${b}` : `da ${a} a ${b}`,
  rangePrepositions: ["a", "di", "per"],
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function listJoin(items: string[], last = "e"): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`;
}
