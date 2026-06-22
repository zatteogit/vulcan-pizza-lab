import { StepIllustration } from "@figma/my-make-file";

export function Steps() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
      <StepIllustration stepId="mix" size={84} />
      <StepIllustration stepId="bulk" size={84} />
      <StepIllustration stepId="shape" size={84} />
      <StepIllustration stepId="bake" size={84} />
    </div>
  );
}

export function Tones() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <StepIllustration stepId="proof" size={84} tone="default" />
      <StepIllustration stepId="proof" size={84} tone="accent" />
      <StepIllustration stepId="proof" size={84} tone="muted" />
    </div>
  );
}
