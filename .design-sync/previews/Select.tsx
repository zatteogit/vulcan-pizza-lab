import { Select } from "@vulcan/ds";
import { useState } from "react";

const OPTS = [
  { id: "00", label: "Farina 00", desc: "W 260–290", group: "Raffinate" },
  { id: "0", label: "Farina 0", desc: "W 240–270", group: "Raffinate" },
  { id: "integrale", label: "Integrale", desc: "W 200–240", group: "Integrali" },
];

export function Interactive() {
  const [v, setV] = useState<string | null>("00");
  return (
    <div style={{ width: "100%", maxWidth: 300 }}>
      <Select label="Tipo farina" options={OPTS} value={v} onValueChange={setV} />
    </div>
  );
}
