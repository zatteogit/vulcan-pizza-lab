import { RadioButton } from "@figma/my-make-file";

export function Group() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 340 }} role="radiogroup">
      <RadioButton checked label="Forno casalingo" description="Elettrico standard, max 250°C" />
      <RadioButton label="Forno a legna" description="450–500°C, fiamma diretta" />
      <RadioButton label="Forno portatile (Ooni)" description="Gas o legna, 400–500°C" />
    </div>
  );
}

export function Compact() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <RadioButton checked label="Fresco" />
      <RadioButton label="Secco" />
      <RadioButton label="Madre" />
    </div>
  );
}
