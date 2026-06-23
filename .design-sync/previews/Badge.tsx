import { Badge } from "@vulcan/ds";

export function Tones() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge tone="default">Bozza</Badge>
      <Badge tone="accent">Napoletana</Badge>
      <Badge tone="primary">In forno</Badge>
      <Badge tone="success">Riuscita</Badge>
      <Badge tone="warning">Da adattare</Badge>
      <Badge tone="error">Non fattibile</Badge>
      <Badge tone="tertiary">Lievitazione</Badge>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Badge tone="accent" size="sm">
        72% idratazione
      </Badge>
      <Badge tone="accent" size="xs">
        W280
      </Badge>
    </div>
  );
}

export function CustomColor() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Badge color="var(--cta)">Disciplinare AVPN</Badge>
      <Badge tone="muted">24–48h</Badge>
    </div>
  );
}
