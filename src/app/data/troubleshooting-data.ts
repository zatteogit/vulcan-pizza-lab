/* === TROUBLESHOOTING DATABASE === */
/* Basato su Notion Pagina 11 · Troubleshooting & Testing */
/* Problemi comuni per fase e metodo, con diagnostica contestuale. */
/* i18n: presenters accept a neutral message-source contract. */

import type { TroubleshootingMessageSource } from "../i18n/domain-contracts";
import { interpolate } from "../i18n/interpolate";
import type { TimelineStep } from "../domain/pizza-engine";
import type { StyleThresholds } from "../domain/science/engine-facts";

export interface TroubleshootingIssue {
  id: string;
  category: 'dough' | 'fermentation' | 'shaping' | 'baking' | 'frying' | 'solver' | 'false_positive';
  symptom: string;
  cause: string;
  testRapido: string;
  fixImmediate: string;
  prevention: string;
  severity: 'info' | 'warning' | 'critical';
}

export const ISSUES_DB: TroubleshootingIssue[] = [
  /* === CATEGORIA 1: Consistenza Impasto === */
  {
    id: 'P01', category: 'dough',
    symptom: 'Impasto appiccicoso persistente',
    cause: "Più acqua di quanta la farina riesca ad assorbire",
    testRapido: "L'idratazione della ricetta supera l'assorbimento indicato sulla scheda della farina?",
    fixImmediate: "Aggiungi poca farina alla volta (2–3%) e incorpora con pieghe delicate",
    prevention: "Resta vicino all'assorbimento dichiarato dal mulino; se non lo conosci, parti dal basso dell'idratazione dello stile",
    severity: 'warning',
  },
  {
    id: 'P02', category: 'dough',
    symptom: "L'impasto si strappa durante la stesura",
    cause: "Glutine poco sviluppato o non ancora rilassato, impasto ancora freddo dal frigo; a volte una farina poco estensibile (P/L alto) o un impasto andato oltre",
    testRapido: "Allunga piano un lembo: si strappa subito invece di allungarsi?",
    fixImmediate: "Copri il panetto e lascialo riposare a temperatura ambiente 30–60 min, poi riprova",
    prevention: "Rispetta i tempi della ricetta, togli i panetti dal frigo per tempo e usa una farina con il P/L indicato dallo stile",
    severity: 'warning',
  },
  {
    id: 'P03', category: 'dough',
    symptom: "L'impasto collassa quando lo tocchi",
    cause: "Lievitazione andata oltre: troppo tempo, troppo caldo o troppo lievito",
    testRapido: "Premi con un dito: se il segno torna su subito è ancora indietro, se torna piano è pronto, se resta e l'impasto si sgonfia è andato oltre",
    fixImmediate: "Ripallalo e lascialo riprendere 1–2 h (sarà meno alveolato), oppure stendilo con delicatezza e cuocilo subito",
    prevention: "Controlla l'impasto dall'ultimo terzo del tempo previsto, non solo l'orologio",
    severity: 'warning',
  },
  /* === CATEGORIA 2: Fermentazione === */
  {
    id: 'P04', category: 'fermentation',
    symptom: "L'impasto non cresce nel tempo previsto",
    cause: "Lievito poco attivo o scaduto, oppure impasto più freddo del previsto. In frigo crescere poco è normale",
    testRapido: "Era in frigo? È normale. Altrimenti sciogli un pizzico del lievito in acqua tiepida con un po' di zucchero: dopo 10–15 min fa schiuma?",
    fixImmediate: "Prima mettilo al caldo (24–28 °C) per 1–2 h. Se non riparte, il lievito è inattivo: rifai l'impasto con lievito nuovo",
    prevention: "Controlla la scadenza del lievito e la temperatura della stanza",
    severity: 'warning',
  },
  {
    id: 'P05', category: 'fermentation',
    symptom: 'Lievitazione troppo rapida (raddoppio in <3h)',
    cause: 'Troppo lievito (>1.5%) o temperatura ambiente >28°C',
    testRapido: "L'impasto ha raddoppiato in meno di 3 ore?",
    fixImmediate: "Metti l’impasto in frigorifero per rallentare la fermentazione; il freddo non la blocca subito.",
    prevention: 'Usa la dose di lievito calcolata per le tue ore e la tua temperatura (a 18 °C per 24 h circa 0,1% di lievito fresco)',
    severity: 'warning',
  },
  {
    id: 'P06', category: 'fermentation',
    symptom: 'Sapore troppo acido/acetico',
    cause: "Maturazione troppo lunga o troppo calda: i batteri lattici producono acidi (succede di più con il lievito madre)",
    testRapido: "Annusa e assaggia un pezzetto crudo: l'acido è pungente, come di aceto?",
    fixImmediate: "Si può mangiare; la prossima volta accorcia la maturazione a temperatura ambiente",
    prevention: "Scegli tempo, temperatura e lievito secondo il metodo; controlla lo sviluppo senza una soglia oraria universale.",
    severity: 'warning',
  },
  {
    id: 'P21', category: 'fermentation',
    symptom: 'Fermentazione incostante tra un impasto e l\'altro (frigo di casa)',
    cause: 'Il frigo domestico non ha temperatura stabile: sbrinamenti, aperture e ripiani diversi fanno oscillare la maturazione a freddo, a differenza di una cella professionale',
    testRapido: 'Stesso stile, stessa dose di lievito: la lievitazione cambia parecchio tra una volta e l\'altra?',
    fixImmediate: 'Sposta l\'impasto sul ripiano più basso/centrale (più stabile) e valuta lo stesso panetto a vista, non solo a orologio',
    prevention: "Misura la temperatura sul ripiano usato e osserva lo sviluppo dell’impasto. Lo zucchero non corregge gli sbalzi del frigo.",
    severity: 'info',
  },
  /* === CATEGORIA 3: Stesura === */
  {
    id: 'P07', category: 'shaping',
    symptom: "Il panetto torna elastico dopo la stesura ('effetto molla')",
    cause: 'Glutine non sufficientemente rilassato',
    testRapido: 'Stendi a 30cm — torna a 25cm dopo 30 secondi?',
    fixImmediate: 'Riposo aggiuntivo 15min coperto, stesura in 2 fasi',
    prevention: 'Estrai panetti dal frigo 60-90min prima della stesura',
    severity: 'info',
  },
  {
    id: 'P08', category: 'shaping',
    symptom: 'Buchi giganti irregolari nella pizza',
    cause: "Bolle grandi rimaste nel panetto e stesura molto delicata",
    testRapido: "Le bolle grandi sono sparse anche al centro, non solo nel cornicione?",
    fixImmediate: 'Pressa leggermente il panetto prima della stesura per redistribuire il gas',
    prevention: "Prima di stendere sgonfia con delicatezza le bolle più grandi; nella napoletana e nel canotto qualche alveolo grande nel cornicione è voluto",
    severity: 'info',
  },
  /* === CATEGORIA 4: Cottura === */
  {
    id: 'P09', category: 'baking',
    symptom: 'Base cruda ma cornicione bruciato',
    cause: 'Sbilanciamento termico: troppo calore dal cielo, poco dalla platea',
    testRapido: 'Contrasto colore estremo tra sopra e sotto?',
    fixImmediate: "Cuoci più vicino alla platea calda e più lontano dal cielo; se il forno non supera i 300 °C puoi precuocere la base 2–3 min senza condimento",
    prevention: "Bilancia il calore: pietra o acciaio ben preriscaldati sotto, meno calore dall'alto",
    severity: 'critical',
  },
  {
    id: 'P10', category: 'baking',
    symptom: 'Crosta pallida, nessuna doratura',
    cause: "Forno o platea poco caldi per lo stile, oppure pochi zuccheri rimasti dopo una maturazione molto lunga",
    testRapido: "Il forno arriva alla temperatura indicata dallo stile? La maturazione è stata molto lunga?",
    fixImmediate: "Negli ultimi 1–2 minuti usa il grill, se il forno lo ha",
    prevention: "Porta il forno al massimo con pietra o acciaio ben preriscaldati; fuori dalle ricette STG, che non ammettono zucchero né malto, puoi aggiungere 0,5–1% di zucchero o malto",
    severity: 'warning',
  },
  {
    id: 'P11', category: 'baking',
    symptom: 'Pizza gommosa, non croccante',
    cause: "Cottura troppo breve o troppo bassa per lo spessore, oppure più acqua di quanta ne preveda lo stile",
    testRapido: "Al taglio il cuore è ancora umido e appiccicoso?",
    fixImmediate: "Prolunga la cottura di qualche minuto; se il forno ha ancora margine, alza la temperatura",
    prevention: "Resta nell'idratazione dello stile e cuoci per il tempo indicato dalla ricetta",
    severity: 'warning',
  },
  {
    id: 'P16', category: 'baking',
    symptom: 'Cornicione basso e piatto',
    cause: "Degassaggio eccessivo, farina troppo debole per lo stile, o uso del mattarello",
    testRapido: 'Altezza cornicione <1cm?',
    fixImmediate: 'Stesura più delicata, non schiacciare i bordi',
    prevention: "Usa una farina nella forza indicata dallo stile e niente mattarello sugli stili con cornicione",
    severity: 'info',
  },
  {
    id: 'P17', category: 'baking',
    symptom: 'Pizza troppo secca',
    cause: "Meno acqua di quella prevista dallo stile o cottura più lunga del tempo della ricetta",
    testRapido: "Idratazione e tempo di cottura sono quelli della ricetta?",
    fixImmediate: "Servila appena sfornata; la prossima volta accorcia la cottura",
    prevention: "Resta nell'idratazione dello stile e non superare il tempo di cottura indicato",
    severity: 'info',
  },
  {
    id: 'P18', category: 'baking',
    symptom: 'Centro della pizza acquoso',
    cause: 'Topping troppo liquido o cottura troppo breve',
    testRapido: 'Quantità di salsa per pizza? Mozzarella molto umida?',
    fixImmediate: "Precuoci la base 2–3 min, poi aggiungi il condimento",
    prevention: 'Max 80ml salsa per pizza 30cm, sgocciola bene la mozzarella',
    severity: 'warning',
  },
  {
    id: 'P19', category: 'shaping',
    symptom: 'Impossibile stendere il panetto',
    cause: "Farina molto più forte di quanto preveda lo stile: impasto troppo tenace",
    testRapido: "La W della tua farina supera di molto quella indicata dallo stile?",
    fixImmediate: "Lascia riposare il panetto coperto 20–30 min e riprova; nel prossimo impasto taglia la farina con una più debole",
    prevention: "Usa una farina nella forza e nel P/L indicati dallo stile",
    severity: 'warning',
  },
  {
    id: 'P20', category: 'fermentation',
    symptom: "Odore 'chimico' (alcol, solvente) nell'impasto",
    cause: "Fermentazione andata oltre (alcol ed esteri) o troppo lievito; più di rado il cloro dell'acqua",
    testRapido: "Odore di alcol o di acetone e impasto molle che non risale?",
    fixImmediate: "Se è molle e non risale, trattalo come un impasto andato oltre: ripallalo o cuocilo subito",
    prevention: "La prossima volta meno lievito o più fresco. Se l'acqua di rubinetto sa di cloro usane un'altra: il riposo all'aria non elimina le clorammine",
    severity: 'info',
  },
  /* === CATEGORIA 5: Falsi Positivi === */
  {
    id: 'P14', category: 'false_positive',
    symptom: 'Macchie leopardate sul cornicione (leopard spotting)',
    // FW-01 (S04-A-05, D-F): non è il contatto con la volta né la sola Maillard.
    cause: 'Bolle sottili del cornicione che si scuriscono col calore molto forte del forno (imbrunimento e bruciatura localizzati)',
    testRapido: 'Le macchie sono amare al gusto?',
    fixImmediate: 'NON è un problema! È la caratteristica desiderata della pizza napoletana',
    prevention: 'Se troppo marcate: ruota pizza ogni 20s durante cottura',
    severity: 'info',
  },
  {
    id: 'P15', category: 'false_positive',
    symptom: 'Fondo pizza scuro/nero sotto',
    cause: "Platea più calda di quanto serve allo stile, oppure farina o semola bruciata sulla pietra",
    testRapido: 'Assaggia: sapore amaro?',
    fixImmediate: 'Se amaro = problema (abbassa temp). Se saporito = NORMALE',
    prevention: "Tieni la platea alla temperatura dello stile e spazzola la pietra fra una pizza e l'altra",
    severity: 'info',
  },
  /* Frittura: rimedi qualitativi, la temperatura resta quella della ricetta.
   * Fonti: kingarthurbaking.com/blog/2021/11/17/how-to-fry-without-fear
   * e /recipes/fried-apple-pies-recipe; london-fire.gov.uk/safety/the-home/cooking/deep-fat-fryers/ */
  {
    id: 'FR01', category: 'frying', severity: 'warning',
    symptom: 'Dorata fuori, cruda dentro',
    cause: 'Olio troppo caldo o impasto troppo spesso.',
    testRapido: 'Apri un pezzo di prova e controlla il centro.',
    fixImmediate: 'Riduci il calore per i pezzi successivi; non basarti solo sul colore.',
    prevention: 'Controlla l’olio con un termometro e segui la temperatura della ricetta.',
  },
  {
    id: 'FR02', category: 'frying', severity: 'warning',
    symptom: 'Troppo unta e poco croccante',
    cause: 'Olio troppo freddo o raffreddato da troppi pezzi insieme.',
    testRapido: 'Controlla la temperatura dell’olio fra un turno e l’altro.',
    fixImmediate: 'Lascia tornare l’olio alla temperatura prevista; friggi pochi pezzi e scola bene.',
    prevention: 'Evita di sovraccaricare il recipiente e controlla la temperatura durante i turni.',
  },
  {
    id: 'FR03', category: 'frying', severity: 'warning',
    symptom: 'Il ripieno fuoriesce nell’olio',
    cause: 'Bordi poco sigillati, fori o ripieno sui bordi.',
    testRapido: 'Controlla la chiusura dei pezzi ancora crudi.',
    fixImmediate: 'Sigilla meglio i pezzi successivi; non aggiungere acqua nell’olio caldo.',
    prevention: 'Tieni puliti i bordi, dosa il ripieno e chiudi senza forare l’impasto.',
  },
];

export interface StepTroubleshooting {
  labelKey: string;
  issueIds: readonly string[];
  initialIssueId?: string;
}

const STEP_TROUBLE: Record<string, StepTroubleshooting> = {
  preferment: { labelKey: 'preferment', issueIds: ['P06', 'P04', 'P05'], initialIssueId: 'P06' },
  // FW-05 (S13-A-02): l'odore «chimico» è prima di tutto sovrafermentazione.
  mix: { labelKey: 'mix', issueIds: ['P01'], initialIssueId: 'P01' },
  bulk: { labelKey: 'bulk', issueIds: ['P03', 'P04', 'P05', 'P06', 'P20', 'P21'], initialIssueId: 'P03' },
  proof: { labelKey: 'proof', issueIds: ['P03', 'P04', 'P05', 'P06', 'P20', 'P21'], initialIssueId: 'P03' },
  shape: { labelKey: 'shape', issueIds: ['P02', 'P07', 'P08', 'P19'], initialIssueId: 'P02' },
};

/** FW-05 (S13-B-02): sotto questa temperatura la puntata è una maturazione in
 *  frigo, dove crescere poco è normale (scelta di Vulcan). */
export const COLD_RETARD_MAX_C = 8;

/** FW-05 (S13-B-14): diagnosi che presumono una rete glutinica (W, P/L,
 *  glutine da rilassare): fuori bersaglio con un mix senza glutine. */
const GLUTEN_DEPENDENT_ISSUES = new Set(['P02', 'P07', 'P19']);

function withoutIssues(trouble: StepTroubleshooting, drop: (id: string) => boolean): StepTroubleshooting | undefined {
  const issueIds = trouble.issueIds.filter((id) => !drop(id));
  if (issueIds.length === 0) return undefined;
  const initialIssueId = trouble.initialIssueId && issueIds.includes(trouble.initialIssueId) ? trouble.initialIssueId : undefined;
  return { ...trouble, issueIds, initialIssueId };
}

/** Il metodo del singolo passo prevale sul nome condiviso "bake".
 * Nessun fallback a un problema del forno per passi sconosciuti o riposi non lievitati.
 * FW-05: `coldRetard` (puntata in frigo) toglie «non cresce» (S13-B-02: al freddo
 * crescere poco è normale); `glutenFree` toglie le diagnosi sul glutine. */
export function getStepTroubleshooting(
  step: Pick<TimelineStep, 'id' | 'variant' | 'msg'>,
  context: { unleavened?: boolean; filled?: boolean; coldRetard?: boolean; glutenFree?: boolean } = {},
): StepTroubleshooting | undefined {
  if (context.unleavened && (step.id === 'bulk' || step.id === 'proof')) return undefined;
  let trouble: StepTroubleshooting | undefined;
  if (context.unleavened && step.id === 'shape') trouble = { labelKey: 'shape', issueIds: ['P07', 'P19'], initialIssueId: 'P07' };
  else if (step.id === 'bake' || step.id === 'bake2') {
    trouble = { labelKey: 'bake', issueIds: step.variant === 'fry'
      ? ['FR01', 'FR02', ...(context.filled ? ['FR03'] : [])]
      : ['P09', 'P10', 'P11', 'P17', ...(step.msg?.title?.key === 'timeline.bakeWhite.title' ? [] : ['P18'])] };
  } else trouble = STEP_TROUBLE[step.id];
  if (!trouble || (!context.coldRetard && !context.glutenFree)) return trouble;
  return withoutIssues(trouble, (id) =>
    (!!context.coldRetard && step.id === 'bulk' && id === 'P04') ||
    (!!context.glutenFree && GLUTEN_DEPENDENT_ISSUES.has(id)));
}

/* === CATEGORY LABELS === */
/* FW-13 (S13-B-12): niente emoji (letti dallo screen reader, resi diversi fra
 * piattaforme); le icone Lucide delle categorie vivono nella UI. */
/* FW-04 (S13-A-07, S13-B-05): le sigle e i termini che la scheda usa
 * (H%, P/L, LAB, finger dent, platea/cielo, W…) portano alla voce del
 * glossario. Il test term-link.test.ts verifica che ogni id esista. */
export const ISSUE_GLOSSARY_TERMS: Record<string, readonly string[]> = {
  P01: ["hydration", "absorption"],
  P02: ["pl_ratio", "l_extensibility"],
  P03: ["poke_test", "ball_fermentation"],
  P05: ["q10"],
  P06: ["lab", "sourdough"],
  P07: ["gluten", "ball_fermentation"],
  P08: ["cornicione"],
  P09: ["oven_floor_dome", "thermal_conductivity"],
  P10: ["maillard"],
  P11: ["hydration"],
  P14: ["cornicione", "maillard"],
  P15: ["oven_floor_dome"],
  P16: ["cornicione", "w_alveograph"],
  P17: ["hydration"],
  P19: ["w_alveograph", "manitoba", "pl_ratio"],
  P21: ["q10"],
};

export const CATEGORY_LABELS: Record<string, { label: string }> = {
  dough: { label: 'Impasto' },
  fermentation: { label: 'Fermentazione' },
  shaping: { label: 'Stesura' },
  baking: { label: 'Cottura' },
  frying: { label: 'Frittura' },
  solver: { label: 'Algoritmo' },
  false_positive: { label: 'Falsi allarmi' },
};

/* === i18n: LOCALIZED GETTERS === */

/** Return localized issue content (falls back to Italian hardcoded) */
export function getLocalizedIssue(issue: TroubleshootingIssue, cms?: TroubleshootingMessageSource): TroubleshootingIssue {
  const loc = cms?.troubleshootingI18n?.issues?.[issue.id];
  if (!loc) return issue;
  return {
    ...issue,
    symptom: loc.symptom ?? issue.symptom,
    cause: loc.cause ?? issue.cause,
    testRapido: loc.testRapido ?? issue.testRapido,
    fixImmediate: loc.fixImmediate ?? issue.fixImmediate,
    prevention: loc.prevention ?? issue.prevention,
  };
}

export function getLocalizedCategoryLabel(category: string, cms?: TroubleshootingMessageSource): string {
  const loc = cms?.troubleshootingI18n?.categories?.[category];
  if (loc) return loc;
  return CATEGORY_LABELS[category]?.label ?? category;
}


/* === CONTEXTUAL WARNINGS === */
/* Genera avvisi contestuali basati sui parametri della ricetta */

interface ContextualWarning {
  issueId: string;
  message: string;
  tip: string;
  severity: 'info' | 'warning' | 'critical';
}

export function getContextualWarnings(params: {
  hydration: number;
  flourW: number;
  flourPL: number;
  fermentHours: number;
  fermentTemp: number;
  ovenTemp: number;
  /** La temperatura di frittura non è una temperatura del forno. */
  usesOven?: boolean;
  /** Flour mass used by the existing blend advice. */
  flourG?: number;
  skillLevel: number;
  usePreFerment: boolean;
  /** FW-05 (S13-V-01, D-I): soglie dello stile scelto (thresholdFor). Senza
   *  stile i consigli che dipendono dallo stile non compaiono. */
  style?: StyleThresholds;
}, cms?: TroubleshootingMessageSource): ContextualWarning[] {
  const warnings: ContextualWarning[] = [];
  const cmsCtx = cms?.troubleshootingI18n?.contextual;
  const style = params.style;
  const styleVars: Record<string, string> = style ? {
    hMin: String(style.hydrationPct[0]), hMax: String(style.hydrationPct[1]),
    wMin: String(style.flourW[0]), wMax: String(style.flourW[1]),
  } : {};

  /* Idratazione alta + W basso = rischio P01, ma non se farina e acqua sono
   * quelle dello stile (FW-05: la focaccia barese al 75% con W 250 è nel suo). */
  const inStyle = style
    && params.flourW >= style.flourW[0] && params.flourW <= style.flourW[1]
    && params.hydration <= style.hydrationPct[1];
  if (style && params.hydration > 72 && params.flourW < 280 && !inStyle) {
    const loc = cmsCtx?.sticky_dough;
    warnings.push({
      issueId: 'P01',
      message: loc ? interpolate(loc.message, { h: String(params.hydration), w: String(params.flourW) })
        : `Idratazione ${params.hydration}% con W ${params.flourW}: rischio impasto appiccicoso`,
      tip: interpolate(loc?.tip ?? "Questo stile prevede W {wMin}–{wMax}: usa una farina in questa forbice oppure riduci un po' l'idratazione", styleVars),
      severity: 'warning',
    });
  }

  /* P/L alto = rischio P02/P07 */
  if (params.flourPL > 0.75) {
    const loc = cmsCtx?.high_pl;
    warnings.push({
      issueId: 'P02',
      message: loc ? interpolate(loc.message, { pl: params.flourPL.toFixed(2) })
        : `P/L ${params.flourPL.toFixed(2)} alto: possibile impasto troppo tenace`,
      tip: loc?.tip ?? 'Prevedi autolisi 45min prima di aggiungere sale e lievito',
      severity: 'info',
    });
  }

  /* Fermentazione lunga + temperatura ambiente = rischio P06 */
  if (params.fermentHours > 36 && params.fermentTemp > 18) {
    const loc = cmsCtx?.sour_risk;
    warnings.push({
      issueId: 'P06',
      message: loc ? interpolate(loc.message, { h: String(params.fermentHours), t: String(params.fermentTemp) })
        : `${params.fermentHours}h a ${params.fermentTemp}°C: rischio sapore acido`,
      // FW-05 (S13-A-03): come P06, nessuna soglia oraria universale nel consiglio.
      tip: loc?.tip ?? "Se la cucina è calda, sposta parte della maturazione in frigo e controlla l'impasto più dell'orologio",
      severity: 'warning',
    });
  }

  /* Fermentazione breve = rischio P10 + D-Score basso */
  if (params.fermentHours < 6) {
    const loc = cmsCtx?.pale_crust;
    warnings.push({
      issueId: 'P10',
      message: loc ? interpolate(loc.message, { h: String(params.fermentHours) })
        : "Fermentazione breve: verifica lo sviluppo dell’impasto prima di proseguire.",
      tip: loc?.tip ?? 'Controlla volume, elasticità e risposta alla pressione: le sole ore non attestano la digeribilità.',
      severity: 'info',
    });
  }

  /* Forno sotto la temperatura dello stile: crosta pallida (P10), non «base
   * cruda e bordo bruciato» (FW-05, S13-A-11/B-03). La soglia è quella dello stile. */
  if (params.usesOven !== false && style && params.ovenTemp < style.ovenMinC) {
    const loc = cmsCtx?.cold_oven;
    warnings.push({
      issueId: 'P10',
      message: loc ? interpolate(loc.message, { t: String(params.ovenTemp) })
        : `Forno a ${params.ovenTemp}°C, sotto la temperatura dello stile: rischio crosta pallida e pizza secca`,
      tip: loc?.tip ?? 'Preriscalda a lungo pietra o acciaio e, se il forno ha il grill, usalo negli ultimi minuti',
      severity: 'warning',
    });
  }

  /* Idratazione alta + principiante (skill-aware): solo skill 1 mostra warning a 70+
   * Skill 2 (Intermedio) lo mostra solo se davvero estrema (>85). Skill 3/4 mai. */
  const hydrationWarnThreshold = params.skillLevel === 1 ? 70 : 85;
  /* FW-05 (S13-V-01): dentro la forbice dello stile non è un errore (la teglia
   * romana è al 75–85% anche per chi comincia); fuori, il consiglio è relativo. */
  if (style && params.hydration > hydrationWarnThreshold && params.skillLevel <= 2 && params.hydration > style.hydrationPct[1]) {
    const loc = cmsCtx?.beginner_hydration;
    warnings.push({
      issueId: 'P01',
      message: loc ? interpolate(loc.message, { h: String(params.hydration) })
        : params.skillLevel === 1
          ? `Idratazione ${params.hydration}% è impegnativa per principianti`
          : `Idratazione ${params.hydration}% è estrema, richiede pratica`,
      tip: interpolate(loc?.tip ?? 'Questo stile prevede {hMin}–{hMax}%: se sei alle prime armi resta vicino a {hMin}%', styleVars),
      severity: 'warning',
    });
  }

  /* W molto oltre lo stile = difficile da stendere P19. Soglia della fattibilità
   * del motore (W massima dello stile × FLOUR_W_EXCESS_FACTOR), FW-05. */
  if (style && params.flourW > style.flourWExcess) {
    const loc = cmsCtx?.high_w;
    warnings.push({
      issueId: 'P19',
      message: loc ? interpolate(loc.message, { w: String(params.flourW) })
        : `W ${params.flourW} molto oltre quella dello stile: impasto difficile da stendere`,
      tip: interpolate(loc?.tip ?? "Questo stile prevede W {wMin}–{wMax}: taglia con una farina più debole oppure prevedi un'autolisi lunga", styleVars),
      severity: 'warning',
    });
  }

  /* Fermentazione fredda molto lunga senza pre-fermento */
  if (params.fermentHours > 48 && params.fermentTemp <= 4 && !params.usePreFerment) {
    const loc = cmsCtx?.flat_long_ferment;
    warnings.push({
      issueId: 'P06',
      message: loc ? interpolate(loc.message, { h: String(params.fermentHours) })
        : `${params.fermentHours}h in frigo senza prefermento: possibile sapore piatto`,
      tip: loc?.tip ?? 'Aggiungi un prefermento (poolish o biga) per complessita aromatica',
      severity: 'info',
    });
  }

  return warnings;
}
