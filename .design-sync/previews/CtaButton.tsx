import { CtaButton } from "@vulcan/ds";
import { Flame } from "lucide-react";

export function Variants() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <CtaButton variant="primary">Genera ricetta</CtaButton>
      <CtaButton variant="secondary">Torna all'originale</CtaButton>
    </div>
  );
}

export function WithIcon() {
  return (
    <CtaButton variant="primary">
      <Flame size={16} /> Inizia la pizzata
    </CtaButton>
  );
}

export function Radii() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <CtaButton radius="pill">Pill</CtaButton>
      <CtaButton radius="xl">Extra large</CtaButton>
      <CtaButton radius="lg">Large</CtaButton>
    </div>
  );
}
