/* ═══ FEEDBACK STORE — VPL-075 ═══
   Raccolta feedback utente su ricette generate.
   Persistenza localStorage. Dati strutturati per calibrazione engine.

   Scopo:
   - Raccogliere ratings post-cottura (tentativo, successo, giudizi 1-5)
   - Registrare problemi specifici (checkboxes: bruciata, cruda, troppo salata, ecc.)
   - Salvare snapshot parametri engine per correlazione predicted vs actual
   - Esportare dati per analisi calibrazione pesi/formule

   Adversarial Audit Reference (18 marzo 2026):
   - ADV-02: Focaccia di Recco riceve 3% lievito nonostante "nessuna lievitazione"
   - ADV-05: Timeline mostra temp ideale, non temp reale forno
   - ADV-07: Asse "forma" sempre 100 in A-Score, inflazione +10 punti
   - ADV-08: Forno 150°C per STG napoletana → F-Score 63 (troppo alto)
   - ADV-11: Lievito madre non selezionato per stili no-knead a lunga fermentazione
*/

import type { OvenType, SkillLevel, ScoreDimensionKey } from "../../domain/pizza-engine";

// ═══ TYPES ═══

export interface RecipeSnapshot {
  styleId: string;
  styleName: string;
  hydration: number;
  flourW: number;
  flourPL: number;
  fermentHours: number;
  fermentTemp: number;
  ovenTemp: number;
  ovenType: OvenType;
  yeastType: string;
  yeastPct: number;
  skillLevel: SkillLevel;
  hasPreFerment: boolean;
  compensationCount: number;
  doughBalls: number;
}

export interface PredictedScores {
  authenticity: number;
  feasibility: number;
  digestibility: number;
  sustainability: number;
  experimentation: number;
  composite: number;
}

/** Problemi specifici riscontrati durante la cottura */
/* `correction`: VPL-C11 — cosa correggerebbe l'engine la prossima volta a fronte
 * di quel problema. Mostrato nella chiusura del feedback come output di valore.
 * IT-only come `label` (questo layer issue è IT-only, vedi recipe-feedback). */
export const RECIPE_ISSUES = [
  { id: "overproofed", label: "Sovra-lievitato", icon: "↑", category: "fermentation", correction: "riduco il lievito e accorcio i tempi" },
  { id: "underproofed", label: "Sotto-lievitato", icon: "↓", category: "fermentation", correction: "allungo i tempi o aumento il lievito" },
  { id: "burnt_top", label: "Bruciata sopra", icon: "🔥", category: "baking", correction: "abbasso la temperatura del forno" },
  { id: "burnt_bottom", label: "Bruciata sotto", icon: "⬇️", category: "baking", correction: "alzo il ripiano e riduco il preriscaldo della base" },
  { id: "raw_center", label: "Cruda al centro", icon: "❄️", category: "baking", correction: "allungo la cottura a temperatura un po' più bassa" },
  { id: "too_dry", label: "Troppo secca", icon: "🏜️", category: "hydration", correction: "aumento l'idratazione" },
  { id: "too_wet", label: "Troppo umida/gommosa", icon: "💧", category: "hydration", correction: "riduco l'idratazione o allungo la cottura" },
  { id: "too_salty", label: "Troppo salata", icon: "🧂", category: "taste", correction: "riduco il sale" },
  { id: "bland", label: "Insipida", icon: "😐", category: "taste", correction: "aumento il sale e allungo la maturazione" },
  { id: "too_dense", label: "Troppo densa", icon: "🧱", category: "texture", correction: "aumento idratazione e lievitazione" },
  { id: "too_sticky", label: "Impasto appiccicoso", icon: "🫠", category: "handling", correction: "riduco l'idratazione e aggiungo pieghe" },
  { id: "hard_to_shape", label: "Difficile da stendere", icon: "💪", category: "handling", correction: "più riposo e idratazione più gestibile" },
  { id: "no_rise", label: "Non è lievitata", icon: "📉", category: "fermentation", correction: "ricontrollo lievito e temperatura di lievitazione" },
  { id: "collapsed", label: "Sgonfiata in cottura", icon: "📦", category: "baking", correction: "riduco l'idratazione e accorcio l'appretto" },
] as const;

export type RecipeIssueId = typeof RECIPE_ISSUES[number]["id"];

export interface RecipeFeedback {
  id: string;
  timestamp: string;
  /** Parametri della ricetta generata */
  recipe: RecipeSnapshot;
  /** Score previsti dal motore */
  predicted: PredictedScores;
  /** L'utente ha effettivamente provato la ricetta? */
  attempted: boolean;
  /** Se provata: è riuscita? */
  success: boolean | null;
  /** Giudizi 1-5 (null = non valutato) */
  ratings: {
    overall: number | null;         // Giudizio complessivo
    taste: number | null;           // Gusto
    texture: number | null;         // Consistenza/alveolatura
    difficulty: number | null;      // 1=facile 5=impossibile (inverso: 1=bene per F-Score)
    authenticity_felt: number | null; // Quanto sembra "autentica" (calibra A-Score)
    digestibility_felt: number | null; // Quanto è stata digeribile (calibra D-Score)
  };
  /** Problemi specifici (checkboxes) */
  issues: RecipeIssueId[];
  /** Note libere */
  notes: string;
}

// ═══ ANALYSIS TYPES ═══

export interface CalibrationResult {
  dimension: ScoreDimensionKey | "composite";
  /** Media differenza (predicted - actual*20) — positiva = engine sovrastima */
  meanBias: number;
  /** Deviazione standard */
  stdDev: number;
  /** Correlazione Pearson (predicted vs actual rating) */
  correlation: number;
  /** Numero campioni usati */
  sampleCount: number;
  /** Verdetto */
  verdict: "calibrated" | "overestimates" | "underestimates" | "uncorrelated" | "insufficient_data";
}

export interface IssueFrequency {
  issueId: RecipeIssueId;
  label: string;
  count: number;
  /** Stili in cui il problema ricorre */
  styleIds: string[];
  /** Parametro medio associato (es: hydration media delle ricette con "too_dry") */
  avgParams: {
    hydration: number;
    fermentHours: number;
    ovenTemp: number;
  };
}

export interface AdversarialFinding {
  id: string;
  severity: "bug" | "bias" | "noise";
  title: string;
  description: string;
  affectedStyles: string[];
  suggestedFix: string;
  /** Se verificato da feedback utente */
  confirmedByFeedback: boolean;
  feedbackCount: number;
  /** Se il fix è stato applicato al motore */
  fixed: boolean;
}

// ═══ STORAGE ═══

const STORAGE_KEY = "vulcan_recipe_feedback";
const MAX_ENTRIES = 500; // Keep last 500 feedback entries

export function loadFeedback(): RecipeFeedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveFeedback(entry: RecipeFeedback): void {
  const existing = loadFeedback();
  existing.push(entry);
  // Keep only last MAX_ENTRIES
  const trimmed = existing.slice(-MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full — evict oldest half
    const half = trimmed.slice(Math.floor(trimmed.length / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
  }
}


export function clearAllFeedback(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportFeedbackJSON(): string {
  return JSON.stringify({
    vulcan_feedback: "1.0",
    timestamp: new Date().toISOString(),
    entries: loadFeedback(),
  }, null, 2);
}

/**
 * Export feedback as CSV for external analysis (R, Python, Excel).
 * Columns: all recipe params, predicted scores, ratings, issues, notes.
 */
export function exportFeedbackCSV(): string {
  const feedback = loadFeedback();
  const headers = [
    "id", "timestamp", "attempted", "success",
    // Recipe snapshot
    "style_id", "style_name", "hydration", "flour_w", "flour_pl",
    "ferment_hours", "ferment_temp", "oven_temp", "oven_type",
    "yeast_type", "yeast_pct", "skill_level", "has_pre_ferment",
    "compensation_count", "dough_balls",
    // Predicted scores
    "pred_authenticity", "pred_feasibility", "pred_digestibility",
    "pred_sustainability", "pred_experimentation", "pred_composite",
    // Ratings
    "rating_overall", "rating_taste", "rating_texture",
    "rating_difficulty", "rating_authenticity_felt", "rating_digestibility_felt",
    // Issues & notes
    "issues", "notes",
  ];

  const escCSV = (v: string | number | boolean | null | undefined): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = feedback.map((f) => [
    f.id, f.timestamp, f.attempted, f.success,
    f.recipe.styleId, f.recipe.styleName, f.recipe.hydration, f.recipe.flourW, f.recipe.flourPL,
    f.recipe.fermentHours, f.recipe.fermentTemp, f.recipe.ovenTemp, f.recipe.ovenType,
    f.recipe.yeastType, f.recipe.yeastPct, f.recipe.skillLevel, f.recipe.hasPreFerment,
    f.recipe.compensationCount, f.recipe.doughBalls,
    f.predicted.authenticity, f.predicted.feasibility, f.predicted.digestibility,
    f.predicted.sustainability, f.predicted.experimentation, f.predicted.composite,
    f.ratings.overall, f.ratings.taste, f.ratings.texture,
    f.ratings.difficulty, f.ratings.authenticity_felt, f.ratings.digestibility_felt,
    f.issues.join("|"), f.notes,
  ].map(escCSV).join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function importFeedbackJSON(json: string): number {
  try {
    const data = JSON.parse(json);
    const entries: RecipeFeedback[] = data.entries ?? data;
    if (!Array.isArray(entries)) return 0;
    const existing = loadFeedback();
    const existingIds = new Set(existing.map((e) => e.id));
    const newEntries = entries.filter((e) => e.id && !existingIds.has(e.id));
    const merged = [...existing, ...newEntries].slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return newEntries.length;
  } catch {
    return 0;
  }
}

/** Genera ID univoco per feedback */
export function generateFeedbackId(): string {
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ═══ ANALYSIS FUNCTIONS ═══

/**
 * Analisi calibrazione: confronta predicted scores con ratings utente.
 * Rating 1-5 → scala 0-100: rating * 20.
 */
export function analyzeCalibration(feedback: RecipeFeedback[]): CalibrationResult[] {
  const attempted = feedback.filter((f) => f.attempted && f.ratings.overall !== null);
  if (attempted.length < 3) {
    return [{ dimension: "composite" as ScoreDimensionKey, meanBias: 0, stdDev: 0, correlation: 0, sampleCount: attempted.length, verdict: "insufficient_data" }];
  }

  const dimensions: Array<{ dim: ScoreDimensionKey | "composite"; predKey: keyof PredictedScores; ratingKey: keyof RecipeFeedback["ratings"] }> = [
    { dim: "authenticity", predKey: "authenticity", ratingKey: "authenticity_felt" },
    { dim: "feasibility", predKey: "feasibility", ratingKey: "difficulty" },
    { dim: "digestibility", predKey: "digestibility", ratingKey: "digestibility_felt" },
    { dim: "composite", predKey: "composite", ratingKey: "overall" },
  ];

  return dimensions.map(({ dim, predKey, ratingKey }) => {
    const pairs = attempted
      .filter((f) => f.ratings[ratingKey] !== null)
      .map((f) => ({
        predicted: f.predicted[predKey],
        actual: dim === "feasibility"
          ? (6 - (f.ratings[ratingKey] as number)) * 20 // invert difficulty: 1=easy=100, 5=hard=0
          : (f.ratings[ratingKey] as number) * 20,
      }));

    if (pairs.length < 3) {
      return { dimension: dim, meanBias: 0, stdDev: 0, correlation: 0, sampleCount: pairs.length, verdict: "insufficient_data" as const };
    }

    const diffs = pairs.map((p) => p.predicted - p.actual);
    const meanBias = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const variance = diffs.reduce((a, d) => a + (d - meanBias) ** 2, 0) / diffs.length;
    const stdDev = Math.sqrt(variance);

    // Pearson correlation
    const n = pairs.length;
    const sumX = pairs.reduce((a, p) => a + p.predicted, 0);
    const sumY = pairs.reduce((a, p) => a + p.actual, 0);
    const sumXY = pairs.reduce((a, p) => a + p.predicted * p.actual, 0);
    const sumX2 = pairs.reduce((a, p) => a + p.predicted ** 2, 0);
    const sumY2 = pairs.reduce((a, p) => a + p.actual ** 2, 0);
    const denom = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
    const correlation = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;

    let verdict: CalibrationResult["verdict"];
    if (pairs.length < 5) verdict = "insufficient_data";
    else if (Math.abs(correlation) < 0.3) verdict = "uncorrelated";
    else if (meanBias > 15) verdict = "overestimates";
    else if (meanBias < -15) verdict = "underestimates";
    else verdict = "calibrated";

    return {
      dimension: dim,
      meanBias: Math.round(meanBias * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      correlation: Math.round(correlation * 100) / 100,
      sampleCount: pairs.length,
      verdict,
    };
  });
}

/**
 * Frequenza problemi: quali issue ricorrono e in quali condizioni.
 */
export function analyzeIssueFrequency(feedback: RecipeFeedback[]): IssueFrequency[] {
  const attempted = feedback.filter((f) => f.attempted && f.issues.length > 0);
  const issueMap = new Map<RecipeIssueId, { count: number; styles: Set<string>; params: RecipeSnapshot[] }>();

  for (const f of attempted) {
    for (const issue of f.issues) {
      const existing = issueMap.get(issue) ?? { count: 0, styles: new Set(), params: [] };
      existing.count++;
      existing.styles.add(f.recipe.styleId);
      existing.params.push(f.recipe);
      issueMap.set(issue, existing);
    }
  }

  return Array.from(issueMap.entries())
    .map(([issueId, data]) => {
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      return {
        issueId,
        label: RECIPE_ISSUES.find((i) => i.id === issueId)?.label ?? issueId,
        count: data.count,
        styleIds: Array.from(data.styles),
        avgParams: {
          hydration: Math.round(avg(data.params.map((p) => p.hydration)) * 10) / 10,
          fermentHours: Math.round(avg(data.params.map((p) => p.fermentHours)) * 10) / 10,
          ovenTemp: Math.round(avg(data.params.map((p) => p.ovenTemp))),
        },
      };
    })
    .sort((a, b) => b.count - a.count);
}

// ═══ FEEDBACK → GENERAZIONE (F2 — chiude il loop di apprendimento) ═══
// Prima il feedback era SOLO raccolto: i "correction" degli issue promettevano
// "riduco il sale / aumento l'idratazione" ma nulla rientrava nella generazione.
// Qui deriviamo correzioni CONCRETE dai problemi RICORRENTI (≥2 volte) sullo
// stesso stile, ma SOLO sulle leve che abbiamo davvero (idratazione, durata
// fermentazione). Per il sale (non ancora una leva) restiamo onesti: nota, non
// finto auto-fix. L'applicazione è opt-in e trasparente (vedi UI), non silenziosa.

export interface FeedbackCorrection {
  /** Punti % da sommare all'idratazione (0 = nessuna correzione). */
  hydrationDelta: number;
  /** Moltiplicatore sulle ore di fermentazione (1 = nessuna). */
  fermentMultiplier: number;
  /** F3 — punti % da sommare al sale (0 = nessuna). Ora è una leva reale. */
  saltDelta: number;
  /** Note human-readable (IT), una per correzione applicata o suggerita. */
  notes: string[];
  /** Quanti tentativi con problemi hanno informato la correzione. */
  sampleSize: number;
}

/** Deriva correzioni dai problemi ricorrenti (≥2) per uno stile. null se non c'è
 *  abbastanza segnale o nessuna correzione mappabile. */
export function deriveFeedbackCorrections(
  styleId: string,
  feedback: RecipeFeedback[],
): FeedbackCorrection | null {
  const relevant = feedback.filter(
    (f) => f.attempted && f.recipe.styleId === styleId && f.issues.length > 0,
  );
  if (relevant.length < 2) return null; // serve un minimo di segnale
  const count = (id: RecipeIssueId) => relevant.filter((f) => f.issues.includes(id)).length;

  let hydrationDelta = 0;
  let fermentMultiplier = 1;
  let saltDelta = 0;
  const notes: string[] = [];

  if (count("too_dry") >= 2) {
    hydrationDelta += 2;
    notes.push("Le ultime volte è venuta troppo secca: +2% idratazione.");
  }
  if (count("too_wet") >= 2 || count("too_sticky") >= 2) {
    hydrationDelta -= 2;
    notes.push("Impasto troppo umido/appiccicoso: −2% idratazione.");
  }
  if (count("too_dense") >= 2 && hydrationDelta === 0) {
    hydrationDelta += 2;
    notes.push("Troppo densa: +2% idratazione per una mollica più aperta.");
  }
  if (count("underproofed") >= 2 || count("no_rise") >= 2) {
    fermentMultiplier *= 1.2;
    notes.push("Poco lievitata: fermentazione ~20% più lunga.");
  }
  if (count("overproofed") >= 2 || count("collapsed") >= 2) {
    fermentMultiplier *= 0.8;
    notes.push("Sovra-lievitata/sgonfiata: fermentazione ~20% più corta.");
  }
  // F3 — il sale ora è una leva reale (customSalt): correzione applicabile.
  if (count("too_salty") >= 2) {
    saltDelta -= 0.2;
    notes.push("Troppo salata: −0,2% di sale.");
  } else if (count("bland") >= 2) {
    saltDelta += 0.2;
    notes.push("Insipida: +0,2% di sale (e allunga un po' la maturazione).");
  }

  if (notes.length === 0) return null;
  return { hydrationDelta, fermentMultiplier, saltDelta, notes, sampleSize: relevant.length };
}

/**
 * Success rate per stile: quali stili hanno più fallimenti.
 */
export function analyzeStyleSuccessRate(feedback: RecipeFeedback[]): Array<{
  styleId: string;
  styleName: string;
  attempts: number;
  successes: number;
  successRate: number;
  avgOverall: number;
  avgPredictedComposite: number;
  calibrationGap: number; // positive = engine overestimates
}> {
  const attempted = feedback.filter((f) => f.attempted);
  const styleMap = new Map<string, {
    name: string;
    attempts: number;
    successes: number;
    overallSum: number;
    overallCount: number;
    predictedSum: number;
  }>();

  for (const f of attempted) {
    const existing = styleMap.get(f.recipe.styleId) ?? {
      name: f.recipe.styleName,
      attempts: 0,
      successes: 0,
      overallSum: 0,
      overallCount: 0,
      predictedSum: 0,
    };
    existing.attempts++;
    if (f.success) existing.successes++;
    if (f.ratings.overall !== null) {
      existing.overallSum += f.ratings.overall;
      existing.overallCount++;
    }
    existing.predictedSum += f.predicted.composite;
    styleMap.set(f.recipe.styleId, existing);
  }

  return Array.from(styleMap.entries())
    .map(([styleId, data]) => {
      const avgOverall = data.overallCount > 0 ? data.overallSum / data.overallCount : 0;
      const avgPredicted = data.predictedSum / data.attempts;
      return {
        styleId,
        styleName: data.name,
        attempts: data.attempts,
        successes: data.successes,
        successRate: data.attempts > 0 ? Math.round((data.successes / data.attempts) * 100) : 0,
        avgOverall: Math.round(avgOverall * 10) / 10,
        avgPredictedComposite: Math.round(avgPredicted),
        calibrationGap: Math.round(avgPredicted - avgOverall * 20),
      };
    })
    .sort((a, b) => a.successRate - b.successRate);
}

// ═══ ADVERSARIAL AUDIT FINDINGS ═══

const ADVERSARIAL_FINDINGS: AdversarialFinding[] = [
  {
    id: "ADV-02",
    severity: "bug",
    title: "Focaccia di Recco: 3% lievito in stile senza lievitazione",
    description: "Con fermentation_hours_range [0.5, 2], calculateYeastPercentage produce 3% fresh yeast (clamped). Lo stile è descritto come 'Nessuna lievitazione — sfoglia diretta'. Il modello Arrhenius non gestisce stili non lievitati.",
    affectedStyles: ["focaccia_recco"],
    suggestedFix: "Aggiungere guard: se fermentation_hours_range[1] <= 2 AND process_type include 'direct' senza lievitazione, impostare yeastPct = 0. Oppure aggiungere flag 'unleavened: true' a PizzaStyle.",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-05",
    severity: "bug",
    title: "Timeline mostra temperatura ideale, non temperatura reale forno",
    description: "Lo step 'Cottura' nella timeline dice 'Cuocere a {style.baking.temp_c_ideal}°C' anche quando il forno dell'utente è a 250°C e lo stile richiede 485°C. La ricetta ha oven_temp_c corretto, ma la timeline mostra il valore sbagliato.",
    affectedStyles: ["napoletana_stg", "napoletana_canotto", "pala_romana", "pinsa_romana", "focaccia_recco"],
    suggestedFix: "In generateTimeline, passare ovenTemp effettivo e usarlo nella description dello step bake: `Cuocere a ${ovenTemp}°C`.",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-07",
    severity: "bias",
    title: "A-Score: asse 'forma' sempre 100, inflazione +10 punti",
    description: "In calculateAuthenticityScore, breakdown.forma parte a 100 e non viene mai penalizzato. Con peso 0.10, questo regala 10 punti a tutti gli A-Score. Se breakdown.ingredienti=60, processo=80, attrezzatura=50, forma=100: score=60*0.3+80*0.25+50*0.35+100*0.1 = 18+20+17.5+10 = 65.5. Senza forma: 55.5/90*100 = 61.7. Delta: ~4-10 punti di inflazione.",
    affectedStyles: ["*"],
    suggestedFix: "Rimuovere asse 'forma' dal calcolo (ridistribuire peso) oppure implementare penalità forma reali (es: panetto troppo pesante/leggero per lo stile).",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-08",
    severity: "bias",
    title: "F-Score: forno 150°C per STG napoletana → 63% fattibile",
    description: "Con forno 150°C (deficit 335°C da ideale 485°C): ovenScore=max(20, 60-167)=20. Ma con flour=95 e skill=90: score=20*0.4+95*0.3+90*0.3=63.5. Classificato 'Fattibile con attenzione'. Un forno a 150°C NON può fare una napoletana STG — dovrebbe essere <40.",
    affectedStyles: ["napoletana_stg", "napoletana_canotto"],
    suggestedFix: "Ridurre floor di ovenScore a 5 (non 20) quando deficit > 200°C. Oppure aggiungere hard constraint: se ovenTemp < temp_c_range[0] * 0.6, ovenScore = 0.",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-11",
    severity: "bug",
    title: "Lievito madre non selezionato per stili no-knead a lunga fermentazione",
    description: "La selezione lievito madre richiede (fermentationHours >= 12 AND (hasPreFerment OR style.requires_pre_ferment)). Ma teglia_romana (no_knead, 24-48h, requires_pre_ferment=false) con utente che ha sourdough in pantry → seleziona 'fresh' invece di 'sourdough'. Il lievito madre è perfettamente adatto per no-knead lunghi.",
    affectedStyles: ["teglia_romana", "bonci_teglia", "focaccia_genovese", "sfincione", "grandma_style"],
    suggestedFix: "Cambiare condizione: sourdough se fermentationHours >= 12 AND (hasPreFerment OR style.requires_pre_ferment OR fermentationHours >= 24).",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-04",
    severity: "noise",
    title: "Pre-fermento sempre 'poolish', mai 'biga'",
    description: "generateRecipe imposta pre_ferment_type='poolish' per tutti gli stili con pre-fermento, anche quando lo stile specifica process_type='biga|poolish'. Per Canotto e Pala Romana, biga è spesso più autentico.",
    affectedStyles: ["napoletana_canotto", "pala_romana"],
    suggestedFix: "Scegliere il primo metodo nel process_type: style.dough.process_type.split('|')[0].",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-12",
    severity: "noise",
    title: "Compensazione olio su stili con burro",
    description: "Per chicago_deep (fat_type='butter', oil_pct=18%), se deficit>150°C la compensazione aggiunge oil_delta. Il risultato è burro 18% + olio extra 3% = 21% grasso totale. La compensazione non distingue tra tipi di grasso.",
    affectedStyles: ["chicago_deep"],
    suggestedFix: "Skippare oil compensation se style.dough.fat_type === 'butter' e oil_pct >= 10% (già molto grasso).",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
  {
    id: "ADV-06",
    severity: "bias",
    title: "Sustainability: bassa temperatura premiata ma cook time penalizzato",
    description: "ovenEfficiency premia temp basse (95 se sotto minimo), ma il cook time aumenta esponenzialmente con Arrhenius, riducendo cookEfficiency a 40. I due assi si contraddicono parzialmente, rendendo il sustainability score incoerente per forni domestici.",
    affectedStyles: ["napoletana_stg", "napoletana_canotto", "pinsa_romana", "pala_romana"],
    suggestedFix: "Correlare ovenEfficiency con cookTime: se il deficit causa cookTime > 2x ideale, ridurre ovenEfficiency proporzionalmente.",
    confirmedByFeedback: false,
    feedbackCount: 0,
    fixed: true,
  },
];

/**
 * Aggiorna gli ADVERSARIAL_FINDINGS con dati di feedback per conferma/smentita.
 * Es: se molti utenti segnalano "too_dry" su focaccia_recco, ADV-02 è confermato.
 */
export function crossReferenceAdversarialWithFeedback(
  feedback: RecipeFeedback[],
): AdversarialFinding[] {
  const findings = ADVERSARIAL_FINDINGS.map((f) => ({ ...f }));

  for (const finding of findings) {
    const relevantFeedback = feedback.filter((fb) =>
      finding.affectedStyles.includes("*") || finding.affectedStyles.includes(fb.recipe.styleId),
    );

    finding.feedbackCount = relevantFeedback.length;

    // Check specific confirmations
    if (finding.id === "ADV-02") {
      // Focaccia di Recco con problemi di lievitazione
      const reccoFeedback = relevantFeedback.filter((f) =>
        f.issues.includes("overproofed") || f.issues.includes("too_wet"),
      );
      finding.confirmedByFeedback = reccoFeedback.length >= 2;
    } else if (finding.id === "ADV-08") {
      // Napoletana con forno basso che fallisce
      const lowOvenFails = relevantFeedback.filter((f) =>
        f.recipe.ovenTemp < 300 && f.success === false,
      );
      finding.confirmedByFeedback = lowOvenFails.length >= 2;
    } else if (finding.id === "ADV-07") {
      // A-Score sovrastimato rispetto a percezione autenticità
      const authGaps = relevantFeedback
        .filter((f) => f.ratings.authenticity_felt !== null)
        .map((f) => f.predicted.authenticity - (f.ratings.authenticity_felt! * 20));
      const avgGap = authGaps.length > 0 ? authGaps.reduce((a, b) => a + b, 0) / authGaps.length : 0;
      finding.confirmedByFeedback = avgGap > 12 && authGaps.length >= 3;
    }
  }

  return findings;
}