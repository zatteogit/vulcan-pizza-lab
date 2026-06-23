import { Surface, Heading, Badge } from "@vulcan/ds";

export function Card() {
  return (
    <Surface variant="card" style={{ padding: 20, maxWidth: 320 }}>
      <Heading level="md">Napoletana STG</Heading>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "var(--font-size-lg)",
          lineHeight: 1.5,
          margin: "8px 0 0",
        }}
      >
        Cornicione gonfio, centro sottile, leopardatura. Standard AVPN.
      </p>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <Badge tone="accent" size="xs">
          65% idratazione
        </Badge>
        <Badge tone="muted" size="xs">
          24–48h
        </Badge>
      </div>
    </Surface>
  );
}

export function Glass() {
  return (
    <div
      style={{
        padding: 28,
        background:
          "linear-gradient(135deg, var(--color-terracotta-300), var(--color-terracotta-500))",
        borderRadius: 24,
      }}
    >
      <Surface variant="glass" style={{ padding: 18, maxWidth: 300 }}>
        <Heading level="sm">Adatta alla tua cucina</Heading>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-md)",
            margin: "6px 0 0",
          }}
        >
          Ricalibra tempi e temperature per il tuo forno.
        </p>
      </Surface>
    </div>
  );
}
