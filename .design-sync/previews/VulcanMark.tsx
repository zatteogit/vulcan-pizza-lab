import { VulcanMark } from "@vulcan/ds";

export function Variants() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", color: "var(--primary)" }}>
      <VulcanMark variant="intima" size={40} />
      <VulcanMark variant="naturale" size={40} />
      <VulcanMark variant="aperta" size={40} />
      <VulcanMark variant="audace" size={40} />
      <VulcanMark variant="monumentale" size={40} />
    </div>
  );
}

export function GradientGlow() {
  return (
    <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
      <VulcanMark size={64} gradient />
      <VulcanMark size={64} gradient glow />
    </div>
  );
}
