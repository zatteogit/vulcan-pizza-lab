import { RadioButton } from "@vulcan/ds";
import { useState } from "react";

const OVENS = [
  { id: "home", label: "Forno casalingo", desc: "Elettrico standard, max 250°C" },
  { id: "wood", label: "Forno a legna", desc: "450–500°C, fiamma diretta" },
  { id: "ooni", label: "Forno portatile (Ooni)", desc: "Gas o legna, 400–500°C" },
];

export function Group() {
  const [sel, setSel] = useState("home");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", maxWidth: 340 }} role="radiogroup">
      {OVENS.map((o) => (
        <RadioButton key={o.id} checked={sel === o.id} onSelect={() => setSel(o.id)} label={o.label} description={o.desc} />
      ))}
    </div>
  );
}

export function Compact() {
  const [sel, setSel] = useState("fresco");
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {["Fresco", "Secco", "Madre"].map((l) => (
        <RadioButton key={l} checked={sel === l.toLowerCase()} onSelect={() => setSel(l.toLowerCase())} label={l} />
      ))}
    </div>
  );
}
