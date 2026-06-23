import { Switch } from "@vulcan/ds";
import { useState } from "react";

export function States() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
        <Switch checked={a} onCheckedChange={setA} />
        <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-default)" }}>Modalità nerd</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
        <Switch checked={b} onCheckedChange={setB} />
        <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-muted)" }}>Evita le fasi notturne</span>
      </label>
    </div>
  );
}
