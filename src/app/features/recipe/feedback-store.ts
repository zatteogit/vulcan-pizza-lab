/**
 * Compatibility facade for feedback UI call sites. Persistence lives in the
 * browser adapter; calibration and correction rules live in pure use cases.
 */

import {
  clearAllFeedback,
  importFeedbackJSON,
  loadFeedback,
  saveFeedback,
} from "../../adapters/browser/recipe-feedback-storage";
import type {
  AdversarialFinding,
  CalibrationResult,
  PredictedScores,
  RecipeFeedback,
  RecipeIssueId,
  RecipeSnapshot,
} from "../../domain/recipe-feedback";
import { ADVERSARIAL_FEEDBACK_FINDINGS } from "../../data/adversarial-feedback-findings";
import {
  analyzeCalibration,
  analyzeIssueFrequency as analyzeIssueFrequencyCore,
  analyzeStyleSuccessRate,
  deriveFeedbackCorrections as deriveFeedbackCorrectionsCore,
} from "../../use-cases/analyze-recipe-feedback";
import {
  adversarialFindingCopy,
  feedbackCorrectionNote,
  issueLabel,
  RECIPE_ISSUES,
} from "./feedback-copy";

export type {
  AdversarialFinding,
  CalibrationResult,
  PredictedScores,
  RecipeFeedback,
  RecipeIssueId,
  RecipeSnapshot,
};
export {
  analyzeCalibration,
  analyzeStyleSuccessRate,
  clearAllFeedback,
  importFeedbackJSON,
  loadFeedback,
  RECIPE_ISSUES,
  saveFeedback,
};

// ═══ STORAGE ═══

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

/** Genera ID univoco per feedback */
export function generateFeedbackId(): string {
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function analyzeIssueFrequency(feedback: RecipeFeedback[]) {
  return analyzeIssueFrequencyCore(feedback).map((frequency) => ({
    ...frequency,
    label: issueLabel(frequency.issueId),
  }));
}

/** Compatibility facade: presentation resolves pure correction message keys. */
export function deriveFeedbackCorrections(styleId: string, feedback: RecipeFeedback[]) {
  const correction = deriveFeedbackCorrectionsCore(styleId, feedback);
  if (!correction) return null;
  const { messageKeys, ...values } = correction;
  return {
    ...values,
    notes: messageKeys.map(feedbackCorrectionNote),
  };
}

// ═══ ADVERSARIAL AUDIT FINDINGS ═══

/**
 * Aggiorna gli ADVERSARIAL_FINDINGS con dati di feedback per conferma/smentita.
 * Es: se molti utenti segnalano "too_dry" su focaccia_recco, ADV-02 è confermato.
 */
export function crossReferenceAdversarialWithFeedback(
  feedback: RecipeFeedback[],
): AdversarialFinding[] {
  const findings: AdversarialFinding[] = ADVERSARIAL_FEEDBACK_FINDINGS.map((finding) => ({
    ...finding,
    ...adversarialFindingCopy(finding.id),
  }));

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
