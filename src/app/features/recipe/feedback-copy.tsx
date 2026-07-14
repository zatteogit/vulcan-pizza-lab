import {
  RECIPE_ISSUE_DEFINITIONS,
  type AdversarialFindingId,
  type RecipeIssueId,
} from "../../domain/recipe-feedback";
import type { FeedbackCorrectionMessageKey } from "../../use-cases/analyze-recipe-feedback";
import { uiMessage } from "../../i18n/ui-messages";

const issueCopy: Record<RecipeIssueId, { label: () => string; correction: () => string }> = {
  overproofed: {
    label: () => uiMessage("features.recipe.feedback.issue.overproofed.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.overproofed.correction"),
  },
  underproofed: {
    label: () => uiMessage("features.recipe.feedback.issue.underproofed.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.underproofed.correction"),
  },
  burnt_top: {
    label: () => uiMessage("features.recipe.feedback.issue.burnt-top.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.burnt-top.correction"),
  },
  burnt_bottom: {
    label: () => uiMessage("features.recipe.feedback.issue.burnt-bottom.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.burnt-bottom.correction"),
  },
  raw_center: {
    label: () => uiMessage("features.recipe.feedback.issue.raw-center.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.raw-center.correction"),
  },
  too_dry: {
    label: () => uiMessage("features.recipe.feedback.issue.too-dry.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.too-dry.correction"),
  },
  too_wet: {
    label: () => uiMessage("features.recipe.feedback.issue.too-wet.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.too-wet.correction"),
  },
  too_salty: {
    label: () => uiMessage("features.recipe.feedback.issue.too-salty.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.too-salty.correction"),
  },
  bland: {
    label: () => uiMessage("features.recipe.feedback.issue.bland.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.bland.correction"),
  },
  too_dense: {
    label: () => uiMessage("features.recipe.feedback.issue.too-dense.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.too-dense.correction"),
  },
  too_sticky: {
    label: () => uiMessage("features.recipe.feedback.issue.too-sticky.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.too-sticky.correction"),
  },
  hard_to_shape: {
    label: () => uiMessage("features.recipe.feedback.issue.hard-to-shape.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.hard-to-shape.correction"),
  },
  no_rise: {
    label: () => uiMessage("features.recipe.feedback.issue.no-rise.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.no-rise.correction"),
  },
  collapsed: {
    label: () => uiMessage("features.recipe.feedback.issue.collapsed.label"),
    correction: () => uiMessage("features.recipe.feedback.issue.collapsed.correction"),
  },
};

/** Compatibility view for the form; getters follow the active locale. */
export const RECIPE_ISSUES = RECIPE_ISSUE_DEFINITIONS.map((definition) => ({
  ...definition,
  get label(): string {
    return issueCopy[definition.id].label();
  },
  get correction(): string {
    return issueCopy[definition.id].correction();
  },
}));

export function issueLabel(issueId: RecipeIssueId): string {
  return issueCopy[issueId].label();
}

export function feedbackCorrectionNote(key: FeedbackCorrectionMessageKey): string {
  switch (key) {
    case "too-dry":
      return uiMessage("features.recipe.feedback.correction.too-dry");
    case "too-wet":
      return uiMessage("features.recipe.feedback.correction.too-wet");
    case "too-dense":
      return uiMessage("features.recipe.feedback.correction.too-dense");
    case "underproofed":
      return uiMessage("features.recipe.feedback.correction.underproofed");
    case "overproofed":
      return uiMessage("features.recipe.feedback.correction.overproofed");
    case "too-salty":
      return uiMessage("features.recipe.feedback.correction.too-salty");
    case "bland":
      return uiMessage("features.recipe.feedback.correction.bland");
  }
}

export function adversarialFindingCopy(id: AdversarialFindingId): {
  title: string;
  description: string;
  suggestedFix: string;
} {
  switch (id) {
    case "ADV-02":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-02.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-02.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-02.suggested-fix"),
      };
    case "ADV-05":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-05.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-05.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-05.suggested-fix"),
      };
    case "ADV-07":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-07.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-07.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-07.suggested-fix"),
      };
    case "ADV-08":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-08.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-08.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-08.suggested-fix"),
      };
    case "ADV-11":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-11.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-11.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-11.suggested-fix"),
      };
    case "ADV-04":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-04.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-04.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-04.suggested-fix"),
      };
    case "ADV-12":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-12.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-12.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-12.suggested-fix"),
      };
    case "ADV-06":
      return {
        title: uiMessage("features.recipe.feedback.finding.adv-06.title"),
        description: uiMessage("features.recipe.feedback.finding.adv-06.description"),
        suggestedFix: uiMessage("features.recipe.feedback.finding.adv-06.suggested-fix"),
      };
  }
}
