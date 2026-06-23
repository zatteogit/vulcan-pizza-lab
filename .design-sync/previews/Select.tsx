import { Select } from "@figma/my-make-file";

const OPTS = [
  { id: "00", label: "Farina 00", desc: "W 260–290", group: "Raffinate" },
  { id: "0", label: "Farina 0", desc: "W 240–270", group: "Raffinate" },
  { id: "integrale", label: "Integrale", desc: "W 200–240", group: "Integrali" },
];

export function Selected() {
  return (
    <div style={{ width: 300 }}>
      <Select label="Tipo farina" options={OPTS} value="00" />
    </div>
  );
}

export function Placeholder() {
  return (
    <div style={{ width: 300 }}>
      <Select label="Tipo farina" options={OPTS} value={null} placeholder="Seleziona..." />
    </div>
  );
}
