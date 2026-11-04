/* === TROUBLESHOOTING DATABASE === */
/* Basato su Notion Pagina 11 · Troubleshooting & Testing */
/* Problemi comuni per fase e metodo, con diagnostica contestuale. */
/* i18n: presenters accept a neutral message-source contract. */

import type { TroubleshootingMessageSource } from "../i18n/domain-contracts";
import { interpolate } from "../i18n/interpolate";
import type { TimelineStep } from "../domain/pizza-engine";
import type { StyleThresholds } from "../domain/science/engine-facts";

/** G4b-WP-03 (S13-A-16): le fasi nell'ordine in cui il problema si vede. */
export const TROUBLESHOOTING_PHASE_ORDER = ['dough', 'fermentation', 'shaping', 'baking', 'frying', 'false_positive'] as const;
export type TroubleshootingPhase = typeof TROUBLESHOOTING_PHASE_ORDER[number];

/** Budget D-059 (31/10/2026): i dati tengono solo fase e gravità; i testi
 *  (anche in italiano) stanno nel catalogo della lingua,
 *  `troubleshootingI18n.issues` (default italiano in domain-i18n-defaults.ts,
 *  nel bundle `it`), e getLocalizedIssue li unisce. */
export interface TroubleshootingIssueData {
  id: string;
  category: TroubleshootingPhase;
  severity: 'info' | 'warning' | 'critical';
}

export interface TroubleshootingIssue extends TroubleshootingIssueData {
  symptom: string;
  cause: string;
  testRapido: string;
  fixImmediate: string;
  prevention: string;
}

export const ISSUES_DB: TroubleshootingIssueData[] = [
  /* === CATEGORIA 1: Consistenza Impasto === */
  {
    id: 'P01', category: 'dough',
    severity: 'warning',
  },
  {
    /* Proposta a Matteo del 29/10: P24 «Si apre un buco mentre stendo» confluisce
       qui; il problema si vede in stesura, quindi la fase è «Stesura». */
    id: 'P02', category: 'shaping',
    severity: 'warning',
  },
  {
    // G4b-WP-03 (S13-A-16): si vede durante la lievitazione, non all'impasto.
    id: 'P03', category: 'fermentation',
    severity: 'warning',
  },
  /* === CATEGORIA 2: Fermentazione === */
  {
    id: 'P04', category: 'fermentation',
    severity: 'warning',
  },
  {
    id: 'P05', category: 'fermentation',
    severity: 'warning',
  },
  {
    id: 'P06', category: 'fermentation',
    severity: 'warning',
  },
  {
    id: 'P21', category: 'fermentation',
    severity: 'info',
  },
  /* === CATEGORIA 3: Stesura === */
  {
    id: 'P07', category: 'shaping',
    severity: 'info',
  },
  {
    id: 'P08', category: 'shaping',
    severity: 'info',
  },
  /* G4b-WP-03 (S13-A-10, D-G4b-2 A): incidenti frequenti di chi comincia.
   * Testo qualitativo, senza soglie: nota troubleshooting-practice. */
  {
    id: 'P22', category: 'shaping', severity: 'warning',
  },
  {
    id: 'P23', category: 'shaping', severity: 'warning',
  },
  /* === CATEGORIA 4: Cottura === */
  {
    id: 'P09', category: 'baking',
    severity: 'critical',
  },
  {
    id: 'P10', category: 'baking',
    severity: 'warning',
  },
  {
    id: 'P11', category: 'baking',
    severity: 'warning',
  },
  {
    // G4b-WP-03 (S13-A-16): nasce in stesura (bordi schiacciati, mattarello).
    id: 'P16', category: 'shaping',
    severity: 'info',
  },
  {
    id: 'P17', category: 'baking',
    severity: 'info',
  },
  {
    id: 'P18', category: 'baking',
    severity: 'warning',
  },
  {
    id: 'P19', category: 'shaping',
    severity: 'warning',
  },
  {
    id: 'P20', category: 'fermentation',
    severity: 'info',
  },
  /* === CATEGORIA 5: Falsi Positivi === */
  {
    id: 'P14', category: 'false_positive',
    // FW-01 (S04-A-05, D-F): non è il contatto con la volta né la sola Maillard.
    severity: 'info',
  },
  {
    id: 'P15', category: 'false_positive',
    severity: 'info',
  },
  /* Frittura: rimedi qualitativi, la temperatura resta quella della ricetta.
   * Fonti: kingarthurbaking.com/blog/2021/11/17/how-to-fry-without-fear
   * e /recipes/fried-apple-pies-recipe; london-fire.gov.uk/safety/the-home/cooking/deep-fat-fryers/ */
  {
    id: 'FR01', category: 'frying', severity: 'warning',
  },
  {
    id: 'FR02', category: 'frying', severity: 'warning',
  },
  {
    id: 'FR03', category: 'frying', severity: 'warning',
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
  proof: { labelKey: 'proof', issueIds: ['P03', 'P23', 'P04', 'P05', 'P06', 'P20', 'P21'], initialIssueId: 'P03' },
  shape: { labelKey: 'shape', issueIds: ['P02', 'P07', 'P19', 'P23', 'P16', 'P08', 'P22'], initialIssueId: 'P02' },
};

/** FW-05 (S13-B-02): sotto questa temperatura la puntata è una maturazione in
 *  frigo, dove crescere poco è normale (scelta di Vulcan). */
export const COLD_RETARD_MAX_C = 8;

/** FW-05 (S13-B-14): diagnosi che presumono una rete glutinica (W, P/L,
 *  glutine da rilassare): fuori bersaglio con un mix senza glutine. */
const GLUTEN_DEPENDENT_ISSUES = new Set(['P02', 'P07', 'P16', 'P19']);

function withoutIssues(trouble: StepTroubleshooting, drop: (id: string) => boolean): StepTroubleshooting | undefined {
  const issueIds = trouble.issueIds.filter((id) => !drop(id));
  if (issueIds.length === 0) return undefined;
  const initialIssueId = trouble.initialIssueId && issueIds.includes(trouble.initialIssueId) ? trouble.initialIssueId : undefined;
  return { ...trouble, issueIds, initialIssueId };
}

/** Il metodo del singolo passo prevale sul nome condiviso "bake".
 * Nessun fallback a un problema del forno per passi sconosciuti o riposi non lievitati.
 * FW-05: `coldRetard` (puntata in frigo) toglie «non cresce» (S13-B-02: al freddo
 * crescere poco è normale); `glutenFree` toglie le diagnosi sul glutine.
 * G4b-WP-03: «si attacca alla pala» (P22) solo se la pizza va in forno con la pala.
 * B2 (seguito): niente «impasto appiccicoso» (P01) sotto «mescola senza impastare». */
export function getStepTroubleshooting(
  step: Pick<TimelineStep, 'id' | 'variant' | 'msg'>,
  context: { unleavened?: boolean; filled?: boolean; coldRetard?: boolean; glutenFree?: boolean; peel?: boolean } = {},
): StepTroubleshooting | undefined {
  if (context.unleavened && (step.id === 'bulk' || step.id === 'proof')) return undefined;
  let trouble: StepTroubleshooting | undefined;
  if (context.unleavened && step.id === 'shape') trouble = { labelKey: 'shape', issueIds: ['P07', 'P19'], initialIssueId: 'P07' };
  else if (step.id === 'bake' || step.id === 'bake2') {
    trouble = { labelKey: 'bake', issueIds: step.variant === 'fry'
      ? ['FR01', 'FR02', ...(context.filled ? ['FR03'] : [])]
      : ['P22', 'P09', 'P10', 'P11', 'P17', ...(step.msg?.title?.key === 'timeline.bakeWhite.title' ? [] : ['P18'])] };
  } else trouble = STEP_TROUBLE[step.id];
  if (!trouble) return trouble;
  return withoutIssues(trouble, (id) =>
    (!context.peel && id === 'P22') ||
    // B2 (seguito): l'impasto mescolato senza impastare è appiccicoso per
    // ricetta; «aggiungi farina» (P01) contraddirebbe la fonte.
    (step.variant === 'stir' && id === 'P01') ||
    (!!context.coldRetard && step.id === 'bulk' && id === 'P04') ||
    (!!context.glutenFree && GLUTEN_DEPENDENT_ISSUES.has(id)));
}

/* G4a-WP-05 (S11-B-11, D-G4a-4): «Qualcosa non va?» in cima a Impara, un
 * problema per categoria (impasto, lievitazione, stesura, cottura). */
export const QUICK_HELP_ISSUE_IDS = ["P01", "P04", "P07", "P09"] as const;

/* === CATEGORY LABELS === */
/* FW-13 (S13-B-12): niente emoji (letti dallo screen reader, resi diversi fra
 * piattaforme); le icone Lucide delle categorie vivono nella UI.
 * G4b-WP-03: le etichette delle fasi vivono solo nel CMS
 * (troubleshootingI18n.categories, default italiano in domain-i18n-defaults). */
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
  P22: ["semola_rimacinata"],
  P23: ["ball_shaping", "hydration", "poke_test"],
};

/** G4b-WP-03: «Perché?» delle voci senza soglie numeriche (pratica comune). */
export const ISSUE_SCIENCE_NOTES: Record<string, string> = {
  P22: "troubleshooting-practice",
  P23: "troubleshooting-practice",
};

const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 } as const;

/** G4b-WP-03 (S13-A-16): gruppi per fase nell'ordine della preparazione,
 *  critici in alto; gruppi vuoti esclusi, ordine stabile a pari severità. */
export function groupIssuesByPhase<T extends Pick<TroubleshootingIssue, 'category' | 'severity'>>(issues: readonly T[]) {
  return TROUBLESHOOTING_PHASE_ORDER
    .map((phase) => ({ phase, issues: issues.filter((issue) => issue.category === phase)
      .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) }))
    .filter((group) => group.issues.length > 0);
}

/* === i18n: LOCALIZED GETTERS === */

/** Il problema con i testi della lingua attiva (ogni bundle li ha tutti:
 *  ui-messages.catalogs.test.ts e locale-parity.test.ts). */
export function getLocalizedIssue(issue: TroubleshootingIssueData, cms?: TroubleshootingMessageSource): TroubleshootingIssue {
  const loc = cms?.troubleshootingI18n?.issues?.[issue.id];
  return {
    ...issue,
    symptom: loc?.symptom ?? "",
    cause: loc?.cause ?? "",
    testRapido: loc?.testRapido ?? "",
    fixImmediate: loc?.fixImmediate ?? "",
    prevention: loc?.prevention ?? "",
  };
}

export function getLocalizedCategoryLabel(category: string, cms?: TroubleshootingMessageSource): string {
  return cms?.troubleshootingI18n?.categories?.[category] ?? category;
}


/* === CONTEXTUAL WARNINGS === */
/* Genera avvisi contestuali basati sui parametri della ricetta.
 * G4b-WP-03: i testi vengono solo dal CMS (default italiano in
 * domain-i18n-defaults.ts); qui restavano copie italiane divergenti. */

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
  const style = params.style;
  const styleVars: Record<string, string> = style ? {
    hMin: String(style.hydrationPct[0]), hMax: String(style.hydrationPct[1]),
    wMin: String(style.flourW[0]), wMax: String(style.flourW[1]),
  } : {};
  const add = (issueId: string, key: string, severity: ContextualWarning['severity'], vars: Record<string, string> = {}) => {
    const loc = cms?.troubleshootingI18n?.contextual?.[key];
    warnings.push({ issueId, severity, message: interpolate(loc?.message, vars), tip: interpolate(loc?.tip, styleVars) });
  };
  const h = String(params.hydration);
  const w = String(params.flourW);

  /* Idratazione alta + W basso = rischio P01, ma non se farina e acqua sono
   * quelle dello stile (FW-05: la focaccia barese al 75% con W 250 è nel suo). */
  const inStyle = style
    && params.flourW >= style.flourW[0] && params.flourW <= style.flourW[1]
    && params.hydration <= style.hydrationPct[1];
  if (style && params.hydration > 72 && params.flourW < 280 && !inStyle) add('P01', 'sticky_dough', 'warning', { h, w });

  /* P/L alto = rischio P02/P07 */
  if (params.flourPL > 0.75) add('P02', 'high_pl', 'info', { pl: params.flourPL.toFixed(2) });

  /* Fermentazione lunga + temperatura ambiente = rischio P06.
   * FW-05 (S13-A-03): come P06, nessuna soglia oraria universale nel consiglio. */
  if (params.fermentHours > 36 && params.fermentTemp > 18) add('P06', 'sour_risk', 'warning', { h: String(params.fermentHours), t: String(params.fermentTemp) });

  /* Fermentazione breve = rischio P10 + D-Score basso */
  if (params.fermentHours < 6) add('P10', 'pale_crust', 'info', { h: String(params.fermentHours) });

  /* Forno sotto la temperatura dello stile: crosta pallida (P10), non «base
   * cruda e bordo bruciato» (FW-05, S13-A-11/B-03). La soglia è quella dello stile. */
  if (params.usesOven !== false && style && params.ovenTemp < style.ovenMinC) add('P10', 'cold_oven', 'warning', { t: String(params.ovenTemp) });

  /* Idratazione alta + principiante (skill-aware): solo skill 1 mostra warning a 70+
   * Skill 2 (Intermedio) lo mostra solo se davvero estrema (>85). Skill 3/4 mai.
   * FW-05 (S13-V-01): dentro la forbice dello stile non è un errore (la teglia
   * romana è al 75–85% anche per chi comincia); fuori, il consiglio è relativo. */
  const hydrationWarnThreshold = params.skillLevel === 1 ? 70 : 85;
  if (style && params.hydration > hydrationWarnThreshold && params.skillLevel <= 2 && params.hydration > style.hydrationPct[1]) add('P01', 'beginner_hydration', 'warning', { h });

  /* W molto oltre lo stile = difficile da stendere P19. Soglia della fattibilità
   * del motore (W massima dello stile × FLOUR_W_EXCESS_FACTOR), FW-05. */
  if (style && params.flourW > style.flourWExcess) add('P19', 'high_w', 'warning', { w });

  /* Fermentazione fredda molto lunga senza pre-fermento */
  if (params.fermentHours > 48 && params.fermentTemp <= 4 && !params.usePreFerment) add('P06', 'flat_long_ferment', 'info', { h: String(params.fermentHours) });

  return warnings;
}
