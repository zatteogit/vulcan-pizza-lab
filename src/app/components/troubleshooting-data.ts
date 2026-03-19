/* === TROUBLESHOOTING DATABASE === */
/* Basato su Notion Pagina 11 · Troubleshooting & Testing */
/* 20 problemi comuni, 6 categorie, diagnostica contestuale */
/* i18n: getLocalizedIssue/CategoryLabel/ContextualWarnings accept CmsContent */

import type { CmsContent } from './cms/cms-context';
import { t } from './cms/i18n';

export interface TroubleshootingIssue {
  id: string;
  category: 'dough' | 'fermentation' | 'shaping' | 'baking' | 'solver' | 'false_positive';
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
    cause: 'Idratazione superiore alla capacita di assorbimento della farina',
    testRapido: 'Confronta H% ricetta vs assorbimento farina (+5% max)',
    fixImmediate: 'Aggiungi 2-3% di farina e incorpora con pieghe delicate',
    prevention: 'Usa H% ≤ assorbimento farina + 5%',
    severity: 'warning',
  },
  {
    id: 'P02', category: 'dough',
    symptom: "L'impasto si strappa durante la stesura",
    cause: 'P/L troppo alto (>0.8) o fermentazione insufficiente (<6h)',
    testRapido: 'Stira il panetto di 10cm: si rompe?',
    fixImmediate: 'Riposo 60min coperto a temperatura ambiente',
    prevention: 'Scegli farine con P/L 0.5-0.6, fermentazione minima 8h',
    severity: 'warning',
  },
  {
    id: 'P03', category: 'dough',
    symptom: "L'impasto collassa quando lo tocchi",
    cause: 'Over-fermentato (volume >150%, finger dent non torna)',
    testRapido: 'Premi con dito 1cm: torna in 3-5s?',
    fixImmediate: 'Irreversibile. Stendi delicatamente e cuoci subito',
    prevention: 'Controlla volume ogni 6h, max +150% aumento',
    severity: 'critical',
  },
  /* === CATEGORIA 2: Fermentazione === */
  {
    id: 'P04', category: 'fermentation',
    symptom: 'Nessuna lievitazione dopo 6+ ore',
    cause: 'Lievito morto, temperatura troppo bassa, o sale a contatto diretto',
    testRapido: 'Test vitalita: 5g lievito + 5g zucchero in 100ml acqua 35°C — schiuma dopo 15min?',
    fixImmediate: 'Aggiungi 0.3% lievito fresco sciolto in acqua tiepida, incorpora con pieghe',
    prevention: 'Testa il lievito prima di ogni utilizzo',
    severity: 'critical',
  },
  {
    id: 'P05', category: 'fermentation',
    symptom: 'Lievitazione troppo rapida (raddoppio in <3h)',
    cause: 'Troppo lievito (>1.5%) o temperatura ambiente >28°C',
    testRapido: "L'impasto ha raddoppiato in meno di 3 ore?",
    fixImmediate: 'Trasferisci immediatamente a 4°C per bloccare la fermentazione',
    prevention: 'Usa 0.2% lievito fresco per 24h, controlla temperatura',
    severity: 'warning',
  },
  {
    id: 'P06', category: 'fermentation',
    symptom: 'Sapore troppo acido/acetico',
    cause: 'LAB eterofermentativi attivi >48h a >18°C (specialmente con lievito madre)',
    testRapido: 'pH impasto — dovrebbe essere 4.5-5.5, problematico se <4.2',
    fixImmediate: 'Aggiungi 0.5-1% zucchero per mascherare acidita',
    prevention: 'Fermentazioni >24h sempre a 4-8°C',
    severity: 'warning',
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
    cause: 'Degassaggio insufficiente + stesura troppo delicata',
    testRapido: 'Alveoli >3cm e distribuzione disomogenea?',
    fixImmediate: 'Pressa leggermente il panetto prima della stesura per redistribuire il gas',
    prevention: 'Riduci tempo fermentazione del 20%',
    severity: 'info',
  },
  /* === CATEGORIA 4: Cottura === */
  {
    id: 'P09', category: 'baking',
    symptom: 'Base cruda ma cornicione bruciato',
    cause: 'Sbilanciamento termico: troppo calore dal cielo, poco dalla platea',
    testRapido: 'Contrasto colore estremo tra sopra e sotto?',
    fixImmediate: 'Pre-cottura della base 3min senza topping',
    prevention: 'Usa teglia/pietra piu spessa, bilancia calore cielo/platea',
    severity: 'critical',
  },
  {
    id: 'P10', category: 'baking',
    symptom: 'Crosta pallida, nessuna doratura',
    cause: 'Temperatura <250°C, zuccheri esauriti, o umidita eccessiva in superficie',
    testRapido: 'Il forno raggiunge almeno 250°C? Fermentazione >48h?',
    fixImmediate: 'Spennella olio+miele pre-cottura oppure usa grill finale 2min',
    prevention: 'Aggiungi 0.5-1% zucchero, forno almeno 280°C',
    severity: 'warning',
  },
  {
    id: 'P11', category: 'baking',
    symptom: 'Pizza gommosa, non croccante',
    cause: 'Temperatura cuore <85°C, idratazione >70%, o cottura troppo lenta',
    testRapido: 'Termometro cuore: raggiunge 90°C+?',
    fixImmediate: 'Prolunga cottura +2min o aumenta temperatura +20°C',
    prevention: 'H ≤ 65%, temperatura cuore target 95°C',
    severity: 'warning',
  },
  {
    id: 'P16', category: 'baking',
    symptom: 'Cornicione basso e piatto',
    cause: 'Degassaggio eccessivo, W farina troppo basso, o uso mattarello',
    testRapido: 'Altezza cornicione <1cm?',
    fixImmediate: 'Stesura piu delicata, non schiacciare i bordi',
    prevention: 'W ≥ 240 per napoletana, mai mattarello su stili con cornicione',
    severity: 'info',
  },
  {
    id: 'P17', category: 'baking',
    symptom: 'Pizza troppo secca',
    cause: 'Idratazione <55% o cottura troppo lunga (>10min)',
    testRapido: 'H% della ricetta? Tempo cottura effettivo?',
    fixImmediate: 'Aggiungi olio abbondante sul topping',
    prevention: 'H ≥ 58%, non superare tempo cottura consigliato',
    severity: 'info',
  },
  {
    id: 'P18', category: 'baking',
    symptom: 'Centro della pizza acquoso',
    cause: 'Topping troppo liquido o cottura troppo breve',
    testRapido: 'Quantita di salsa per pizza? Mozzarella molto umida?',
    fixImmediate: 'Pre-cottura base 2min, poi aggiungi topping',
    prevention: 'Max 80ml salsa per pizza 30cm, sgocciola bene la mozzarella',
    severity: 'warning',
  },
  {
    id: 'P19', category: 'baking',
    symptom: 'Impossibile stendere il panetto',
    cause: 'Farina Manitoba pura (W >380), impasto troppo tenace',
    testRapido: 'Quale farina hai usato? W >350?',
    fixImmediate: 'Blend 50:50 con farina W 200 nel prossimo impasto',
    prevention: 'Max W 320 per pizza, farine con P/L 0.5-0.6',
    severity: 'warning',
  },
  {
    id: 'P20', category: 'baking',
    symptom: "Odore 'chimico' nell'impasto",
    cause: 'Acqua con cloro alto dal rubinetto',
    testRapido: "Senti odore forte aprendo il rubinetto dell'acqua?",
    fixImmediate: 'Usa acqua in bottiglia per il prossimo impasto',
    prevention: 'Filtra acqua o lasciala riposare 12h aperta (cloro evapora)',
    severity: 'info',
  },
  /* === CATEGORIA 5: Falsi Positivi === */
  {
    id: 'P14', category: 'false_positive',
    symptom: 'Macchie leopardate sul cornicione (leopard spotting)',
    cause: 'Contatto con volta forno >500°C — reazione di Maillard localizzata',
    testRapido: 'Le macchie sono amare al gusto?',
    fixImmediate: 'NON e un problema! E la caratteristica desiderata della pizza napoletana',
    prevention: 'Se troppo marcate: ruota pizza ogni 20s durante cottura',
    severity: 'info',
  },
  {
    id: 'P15', category: 'false_positive',
    symptom: 'Fondo pizza scuro/nero sotto',
    cause: 'Pietra o teglia troppo calda (>450°C)',
    testRapido: 'Assaggia: sapore amaro?',
    fixImmediate: 'Se amaro = problema (abbassa temp). Se saporito = NORMALE',
    prevention: 'Pre-riscaldo pietra controllato, non oltre 400°C per pietra',
    severity: 'info',
  },
];

/* === CATEGORY LABELS === */
export const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  dough: { label: 'Impasto', emoji: '🫗' },
  fermentation: { label: 'Fermentazione', emoji: '🫧' },
  shaping: { label: 'Stesura', emoji: '🤲' },
  baking: { label: 'Cottura', emoji: '🔥' },
  solver: { label: 'Algoritmo', emoji: '⚙️' },
  false_positive: { label: 'Falsi Allarmi', emoji: '✅' },
};

/* === i18n: LOCALIZED GETTERS === */

/** Return localized issue content (falls back to Italian hardcoded) */
export function getLocalizedIssue(issue: TroubleshootingIssue, cms?: CmsContent): TroubleshootingIssue {
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

/** Return localized category label (falls back to Italian hardcoded) */
export function getLocalizedCategoryLabel(catId: string, cms?: CmsContent): string {
  return cms?.troubleshootingI18n?.categories?.[catId] ?? CATEGORY_LABELS[catId]?.label ?? catId;
}

/* === CONTEXTUAL WARNINGS === */
/* Genera avvisi contestuali basati sui parametri della ricetta */

export interface ContextualWarning {
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
  skillLevel: number;
  usePreFerment: boolean;
}, cms?: CmsContent): ContextualWarning[] {
  const warnings: ContextualWarning[] = [];
  const cmsCtx = cms?.troubleshootingI18n?.contextual;

  /* Idratazione alta + W basso = rischio P01 */
  if (params.hydration > 72 && params.flourW < 280) {
    const loc = cmsCtx?.sticky_dough;
    warnings.push({
      issueId: 'P01',
      message: loc ? t(loc.message, { h: String(params.hydration), w: String(params.flourW) })
        : `Idratazione ${params.hydration}% con W ${params.flourW}: rischio impasto appiccicoso`,
      tip: loc?.tip ?? 'Usa farina con W ≥ 280 oppure riduci idratazione a 68-70%',
      severity: 'warning',
    });
  }

  /* P/L alto = rischio P02/P07 */
  if (params.flourPL > 0.75) {
    const loc = cmsCtx?.high_pl;
    warnings.push({
      issueId: 'P02',
      message: loc ? t(loc.message, { pl: params.flourPL.toFixed(2) })
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
      message: loc ? t(loc.message, { h: String(params.fermentHours), t: String(params.fermentTemp) })
        : `${params.fermentHours}h a ${params.fermentTemp}°C: rischio sapore acido`,
      tip: loc?.tip ?? 'Per fermentazioni >24h, usa temperatura 4-8°C',
      severity: 'warning',
    });
  }

  /* Fermentazione breve = rischio P10 + D-Score basso */
  if (params.fermentHours < 6) {
    const loc = cmsCtx?.pale_crust;
    warnings.push({
      issueId: 'P10',
      message: loc ? t(loc.message, { h: String(params.fermentHours) })
        : `Fermentazione breve (${params.fermentHours}h): crosta pallida e digeribilita limitata`,
      tip: loc?.tip ?? 'Aggiungi 0.5-1% zucchero per favorire la doratura Maillard',
      severity: 'info',
    });
  }

  /* Forno freddo per stili che richiedono alta temperatura */
  if (params.ovenTemp < 250) {
    const loc = cmsCtx?.cold_oven;
    warnings.push({
      issueId: 'P09',
      message: loc ? t(loc.message, { t: String(params.ovenTemp) })
        : `Forno a ${params.ovenTemp}°C: rischio base cruda con bordo bruciato`,
      tip: loc?.tip ?? 'Pre-cuoci la base 3min senza topping, poi aggiungi ingredienti',
      severity: 'warning',
    });
  }

  /* Idratazione alta + principiante */
  if (params.hydration > 70 && params.skillLevel <= 2) {
    const loc = cmsCtx?.beginner_hydration;
    warnings.push({
      issueId: 'P01',
      message: loc ? t(loc.message, { h: String(params.hydration) })
        : `Idratazione ${params.hydration}% e impegnativa per principianti`,
      tip: loc?.tip ?? 'Inizia con 60-65% e aumenta gradualmente con esperienza',
      severity: 'warning',
    });
  }

  /* W molto alto = difficile da stendere P19 */
  if (params.flourW > 360) {
    const loc = cmsCtx?.high_w;
    warnings.push({
      issueId: 'P19',
      message: loc ? t(loc.message, { w: String(params.flourW) })
        : `W ${params.flourW} molto alto: impasto difficile da stendere`,
      tip: loc?.tip ?? 'Mixa 50:50 con farina W 200 oppure prevedi autolisi lunga',
      severity: 'warning',
    });
  }

  /* Fermentazione fredda molto lunga senza pre-fermento */
  if (params.fermentHours > 48 && params.fermentTemp <= 4 && !params.usePreFerment) {
    const loc = cmsCtx?.flat_long_ferment;
    warnings.push({
      issueId: 'P06',
      message: loc ? t(loc.message, { h: String(params.fermentHours) })
        : `${params.fermentHours}h in frigo senza pre-fermento: possibile sapore piatto`,
      tip: loc?.tip ?? 'Aggiungi un pre-fermento (poolish o biga) per complessita aromatica',
      severity: 'info',
    });
  }

  return warnings;
}
