import type { AdversarialFinding } from "../domain/recipe-feedback";

export type AdversarialFindingMetadata = Omit<
  AdversarialFinding,
  "title" | "description" | "suggestedFix"
>;

/** Stable Engine Lab audit metadata; presentation resolves explanatory copy. */
export const ADVERSARIAL_FEEDBACK_FINDINGS: readonly AdversarialFindingMetadata[] = [
  { id: "ADV-02", severity: "bug", affectedStyles: ["focaccia_recco"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-05", severity: "bug", affectedStyles: ["napoletana_stg", "napoletana_canotto", "pala_romana", "pinsa_romana", "focaccia_recco"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-07", severity: "bias", affectedStyles: ["*"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-08", severity: "bias", affectedStyles: ["napoletana_stg", "napoletana_canotto"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-11", severity: "bug", affectedStyles: ["teglia_romana", "focaccia_genovese", "sfincione", "grandma_style"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-04", severity: "noise", affectedStyles: ["napoletana_canotto", "pala_romana"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-12", severity: "noise", affectedStyles: ["chicago_deep"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
  { id: "ADV-06", severity: "bias", affectedStyles: ["napoletana_stg", "napoletana_canotto", "pinsa_romana", "pala_romana"], confirmedByFeedback: false, feedbackCount: 0, fixed: true },
];
