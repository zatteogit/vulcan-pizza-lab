import type { OvenType, ScoreDimensionKey, SkillLevel } from "./pizza-engine";

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

/** Stable issue metadata. User-facing copy is resolved by presentation. */
export const RECIPE_ISSUE_DEFINITIONS = [
  { id: "overproofed", icon: "↑", category: "fermentation" },
  { id: "underproofed", icon: "↓", category: "fermentation" },
  { id: "burnt_top", icon: "🔥", category: "baking" },
  { id: "burnt_bottom", icon: "⬇️", category: "baking" },
  { id: "raw_center", icon: "❄️", category: "baking" },
  { id: "too_dry", icon: "🏜️", category: "hydration" },
  { id: "too_wet", icon: "💧", category: "hydration" },
  { id: "too_salty", icon: "🧂", category: "taste" },
  { id: "bland", icon: "😐", category: "taste" },
  { id: "too_dense", icon: "🧱", category: "texture" },
  { id: "too_sticky", icon: "🫠", category: "handling" },
  { id: "hard_to_shape", icon: "💪", category: "handling" },
  { id: "no_rise", icon: "📉", category: "fermentation" },
  { id: "collapsed", icon: "📦", category: "baking" },
] as const;

export type RecipeIssueId = (typeof RECIPE_ISSUE_DEFINITIONS)[number]["id"];

export interface RecipeFeedback {
  id: string;
  timestamp: string;
  recipe: RecipeSnapshot;
  predicted: PredictedScores;
  attempted: boolean;
  success: boolean | null;
  ratings: {
    overall: number | null;
    taste: number | null;
    texture: number | null;
    difficulty: number | null;
    authenticity_felt: number | null;
    digestibility_felt: number | null;
  };
  issues: RecipeIssueId[];
  notes: string;
}

export interface CalibrationResult {
  dimension: ScoreDimensionKey | "composite";
  meanBias: number;
  stdDev: number;
  correlation: number;
  sampleCount: number;
  verdict:
    | "calibrated"
    | "overestimates"
    | "underestimates"
    | "uncorrelated"
    | "insufficient_data";
}

export interface IssueFrequency {
  issueId: RecipeIssueId;
  count: number;
  styleIds: string[];
  avgParams: {
    hydration: number;
    fermentHours: number;
    ovenTemp: number;
  };
}

export type AdversarialFindingId =
  | "ADV-02"
  | "ADV-05"
  | "ADV-07"
  | "ADV-08"
  | "ADV-11"
  | "ADV-04"
  | "ADV-12"
  | "ADV-06";

export interface AdversarialFinding {
  id: AdversarialFindingId;
  severity: "bug" | "bias" | "noise";
  title: string;
  description: string;
  affectedStyles: string[];
  suggestedFix: string;
  confirmedByFeedback: boolean;
  feedbackCount: number;
  fixed: boolean;
}
