import { Stepper } from "@vulcan/ds";
import { useState } from "react";

export function Interactive() {
  const [v, setV] = useState(4);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: "var(--font-size-base)", color: "var(--text-muted)" }}>Panetti: {v}</span>
      <Stepper value={v} min={1} max={20} onChange={setV} decrementLabel="Meno panetti" incrementLabel="Più panetti" />
    </div>
  );
}
