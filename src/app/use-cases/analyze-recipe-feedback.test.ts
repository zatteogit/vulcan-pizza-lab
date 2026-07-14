import { describe, expect, it } from "vitest";
import type { RecipeFeedback, RecipeIssueId } from "../domain/recipe-feedback";
import {
  analyzeCalibration,
  analyzeIssueFrequency,
  deriveFeedbackCorrections,
} from "./analyze-recipe-feedback";

function feedback(
  id: string,
  options: {
    styleId?: string;
    issues?: RecipeIssueId[];
    overall?: number | null;
    composite?: number;
    attempted?: boolean;
  } = {},
): RecipeFeedback {
  return {
    id,
    timestamp: "2026-07-13T12:00:00.000Z",
    recipe: {
      styleId: options.styleId ?? "napoletana",
      styleName: "Napoletana",
      hydration: 65,
      flourW: 300,
      flourPL: 0.55,
      fermentHours: 24,
      fermentTemp: 20,
      ovenTemp: 450,
      ovenType: "electric_high",
      yeastType: "fresh",
      yeastPct: 0.2,
      skillLevel: 2,
      hasPreFerment: false,
      compensationCount: 0,
      doughBalls: 4,
    },
    predicted: {
      authenticity: 80,
      feasibility: 80,
      digestibility: 80,
      sustainability: 80,
      experimentation: 80,
      composite: options.composite ?? 80,
    },
    attempted: options.attempted ?? true,
    success: true,
    ratings: {
      overall: options.overall ?? 4,
      taste: null,
      texture: null,
      difficulty: null,
      authenticity_felt: null,
      digestibility_felt: null,
    },
    issues: options.issues ?? [],
    notes: "",
  };
}

describe("recipe feedback analysis", () => {
  it("reports insufficient calibration signal without touching browser APIs", () => {
    const result = analyzeCalibration([feedback("one")]);

    expect(result).toEqual([{
      dimension: "composite",
      meanBias: 0,
      stdDev: 0,
      correlation: 0,
      sampleCount: 1,
      verdict: "insufficient_data",
    }]);
  });

  it("detects a correlated overestimate from five rated attempts", () => {
    const samples = [1, 2, 3, 4, 5].map((rating) =>
      feedback(`fb-${rating}`, { overall: rating, composite: rating * 20 + 20 })
    );

    const composite = analyzeCalibration(samples).find(
      (result) => result.dimension === "composite",
    );

    expect(composite).toMatchObject({
      meanBias: 20,
      correlation: 1,
      sampleCount: 5,
      verdict: "overestimates",
    });
  });

  it("returns numeric corrections plus presentation-neutral message keys", () => {
    const samples = [
      feedback("one", { issues: ["too_dry", "underproofed", "too_salty"] }),
      feedback("two", { issues: ["too_dry", "underproofed", "too_salty"] }),
    ];

    expect(deriveFeedbackCorrections("napoletana", samples)).toEqual({
      hydrationDelta: 2,
      fermentMultiplier: 1.2,
      saltDelta: -0.2,
      messageKeys: ["too-dry", "underproofed", "too-salty"],
      sampleSize: 2,
    });
  });

  it("aggregates issue conditions without embedding localized labels", () => {
    const result = analyzeIssueFrequency([
      feedback("one", { issues: ["too_dry"] }),
      feedback("two", { issues: ["too_dry"] }),
    ]);

    expect(result).toEqual([{
      issueId: "too_dry",
      count: 2,
      styleIds: ["napoletana"],
      avgParams: { hydration: 65, fermentHours: 24, ovenTemp: 450 },
    }]);
    expect(result[0]).not.toHaveProperty("label");
  });
});
