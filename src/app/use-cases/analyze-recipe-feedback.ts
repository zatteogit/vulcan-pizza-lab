import type { ScoreDimensionKey } from "../domain/pizza-engine";
import type {
  CalibrationResult,
  IssueFrequency,
  PredictedScores,
  RecipeFeedback,
  RecipeIssueId,
  RecipeSnapshot,
} from "../domain/recipe-feedback";

export type FeedbackCorrectionMessageKey =
  | "too-dry"
  | "too-wet"
  | "too-dense"
  | "underproofed"
  | "overproofed"
  | "too-salty"
  | "bland";

export interface FeedbackCorrection {
  hydrationDelta: number;
  fermentMultiplier: number;
  saltDelta: number;
  messageKeys: FeedbackCorrectionMessageKey[];
  sampleSize: number;
}

/** Compare predicted scores with user ratings without UI or browser dependencies. */
export function analyzeCalibration(feedback: RecipeFeedback[]): CalibrationResult[] {
  const attempted = feedback.filter((entry) =>
    entry.attempted && entry.ratings.overall !== null
  );
  if (attempted.length < 3) {
    return [{
      dimension: "composite",
      meanBias: 0,
      stdDev: 0,
      correlation: 0,
      sampleCount: attempted.length,
      verdict: "insufficient_data",
    }];
  }

  const dimensions: Array<{
    dim: ScoreDimensionKey | "composite";
    predKey: keyof PredictedScores;
    ratingKey: keyof RecipeFeedback["ratings"];
  }> = [
    { dim: "authenticity", predKey: "authenticity", ratingKey: "authenticity_felt" },
    { dim: "feasibility", predKey: "feasibility", ratingKey: "difficulty" },
    { dim: "digestibility", predKey: "digestibility", ratingKey: "digestibility_felt" },
    { dim: "composite", predKey: "composite", ratingKey: "overall" },
  ];

  return dimensions.map(({ dim, predKey, ratingKey }) => {
    const pairs = attempted
      .filter((entry) => entry.ratings[ratingKey] !== null)
      .map((entry) => ({
        predicted: entry.predicted[predKey],
        actual: dim === "feasibility"
          ? (6 - (entry.ratings[ratingKey] as number)) * 20
          : (entry.ratings[ratingKey] as number) * 20,
      }));

    if (pairs.length < 3) {
      return {
        dimension: dim,
        meanBias: 0,
        stdDev: 0,
        correlation: 0,
        sampleCount: pairs.length,
        verdict: "insufficient_data" as const,
      };
    }

    const diffs = pairs.map((pair) => pair.predicted - pair.actual);
    const meanBias = diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
    const variance = diffs.reduce(
      (sum, value) => sum + (value - meanBias) ** 2,
      0,
    ) / diffs.length;
    const stdDev = Math.sqrt(variance);

    const n = pairs.length;
    const sumX = pairs.reduce((sum, pair) => sum + pair.predicted, 0);
    const sumY = pairs.reduce((sum, pair) => sum + pair.actual, 0);
    const sumXY = pairs.reduce((sum, pair) => sum + pair.predicted * pair.actual, 0);
    const sumX2 = pairs.reduce((sum, pair) => sum + pair.predicted ** 2, 0);
    const sumY2 = pairs.reduce((sum, pair) => sum + pair.actual ** 2, 0);
    const denominator = Math.sqrt(
      (n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2),
    );
    const correlation = denominator === 0
      ? 0
      : (n * sumXY - sumX * sumY) / denominator;

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

/** Aggregate recurrent issues without attaching presentation copy. */
export function analyzeIssueFrequency(feedback: RecipeFeedback[]): IssueFrequency[] {
  const attempted = feedback.filter((entry) => entry.attempted && entry.issues.length > 0);
  const issueMap = new Map<RecipeIssueId, {
    count: number;
    styles: Set<string>;
    params: RecipeSnapshot[];
  }>();

  for (const entry of attempted) {
    for (const issue of entry.issues) {
      const aggregate = issueMap.get(issue) ?? {
        count: 0,
        styles: new Set<string>(),
        params: [],
      };
      aggregate.count += 1;
      aggregate.styles.add(entry.recipe.styleId);
      aggregate.params.push(entry.recipe);
      issueMap.set(issue, aggregate);
    }
  }

  return Array.from(issueMap.entries())
    .map(([issueId, aggregate]) => {
      const average = (values: number[]) =>
        values.reduce((sum, value) => sum + value, 0) / values.length;
      return {
        issueId,
        count: aggregate.count,
        styleIds: Array.from(aggregate.styles),
        avgParams: {
          hydration: Math.round(average(aggregate.params.map((item) => item.hydration)) * 10) / 10,
          fermentHours: Math.round(average(aggregate.params.map((item) => item.fermentHours)) * 10) / 10,
          ovenTemp: Math.round(average(aggregate.params.map((item) => item.ovenTemp))),
        },
      };
    })
    .sort((left, right) => right.count - left.count);
}

/** Derive opt-in engine corrections from recurrent issues for one style. */
export function deriveFeedbackCorrections(
  styleId: string,
  feedback: RecipeFeedback[],
): FeedbackCorrection | null {
  const relevant = feedback.filter(
    (entry) =>
      entry.attempted &&
      entry.recipe.styleId === styleId &&
      entry.issues.length > 0,
  );
  if (relevant.length < 2) return null;

  const count = (id: RecipeIssueId) =>
    relevant.filter((entry) => entry.issues.includes(id)).length;
  let hydrationDelta = 0;
  let fermentMultiplier = 1;
  let saltDelta = 0;
  const messageKeys: FeedbackCorrectionMessageKey[] = [];

  if (count("too_dry") >= 2) {
    hydrationDelta += 2;
    messageKeys.push("too-dry");
  }
  if (count("too_wet") >= 2 || count("too_sticky") >= 2) {
    hydrationDelta -= 2;
    messageKeys.push("too-wet");
  }
  if (count("too_dense") >= 2 && hydrationDelta === 0) {
    hydrationDelta += 2;
    messageKeys.push("too-dense");
  }
  if (count("underproofed") >= 2 || count("no_rise") >= 2) {
    fermentMultiplier *= 1.2;
    messageKeys.push("underproofed");
  }
  if (count("overproofed") >= 2 || count("collapsed") >= 2) {
    fermentMultiplier *= 0.8;
    messageKeys.push("overproofed");
  }
  if (count("too_salty") >= 2) {
    saltDelta -= 0.2;
    messageKeys.push("too-salty");
  } else if (count("bland") >= 2) {
    saltDelta += 0.2;
    messageKeys.push("bland");
  }

  if (messageKeys.length === 0) return null;
  return {
    hydrationDelta,
    fermentMultiplier,
    saltDelta,
    messageKeys,
    sampleSize: relevant.length,
  };
}

export function analyzeStyleSuccessRate(feedback: RecipeFeedback[]): Array<{
  styleId: string;
  styleName: string;
  attempts: number;
  successes: number;
  successRate: number;
  avgOverall: number;
  avgPredictedComposite: number;
  calibrationGap: number;
}> {
  const attempted = feedback.filter((entry) => entry.attempted);
  const styleMap = new Map<string, {
    name: string;
    attempts: number;
    successes: number;
    overallSum: number;
    overallCount: number;
    predictedSum: number;
  }>();

  for (const entry of attempted) {
    const aggregate = styleMap.get(entry.recipe.styleId) ?? {
      name: entry.recipe.styleName,
      attempts: 0,
      successes: 0,
      overallSum: 0,
      overallCount: 0,
      predictedSum: 0,
    };
    aggregate.attempts += 1;
    if (entry.success) aggregate.successes += 1;
    if (entry.ratings.overall !== null) {
      aggregate.overallSum += entry.ratings.overall;
      aggregate.overallCount += 1;
    }
    aggregate.predictedSum += entry.predicted.composite;
    styleMap.set(entry.recipe.styleId, aggregate);
  }

  return Array.from(styleMap.entries())
    .map(([styleId, aggregate]) => {
      const avgOverall = aggregate.overallCount > 0
        ? aggregate.overallSum / aggregate.overallCount
        : 0;
      const avgPredicted = aggregate.predictedSum / aggregate.attempts;
      return {
        styleId,
        styleName: aggregate.name,
        attempts: aggregate.attempts,
        successes: aggregate.successes,
        successRate: aggregate.attempts > 0
          ? Math.round((aggregate.successes / aggregate.attempts) * 100)
          : 0,
        avgOverall: Math.round(avgOverall * 10) / 10,
        avgPredictedComposite: Math.round(avgPredicted),
        calibrationGap: Math.round(avgPredicted - avgOverall * 20),
      };
    })
    .sort((left, right) => left.successRate - right.successRate);
}
