import { StepHeader } from "@vulcan/ds";

export function Editorial() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 420 }}>
      <StepHeader num="01" category="Contesto" title="Quando e dove" subtitle="Tempo, luogo, stagione" />
      <StepHeader num="02" category="Setup" title="Cosa hai a disposizione" subtitle="Attrezzatura, dispensa, esperienza" />
    </div>
  );
}
