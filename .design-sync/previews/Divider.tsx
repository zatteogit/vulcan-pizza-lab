import { Divider } from "@vulcan/ds";

export function Horizontal() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 320 }}>
      <Divider />
      <Divider label="oppure" />
    </div>
  );
}

export function Vertical() {
  return (
    <div style={{ display: "flex", gap: 16, height: 40, alignItems: "stretch", color: "var(--text-muted)" }}>
      <span>Ricetta</span>
      <Divider orientation="vertical" />
      <span>Procedimento</span>
      <Divider orientation="vertical" />
      <span>Condimento</span>
    </div>
  );
}
