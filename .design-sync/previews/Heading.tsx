import { Heading } from "@vulcan/ds";

export function Scale() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Heading level="display">La tua pizza perfetta</Heading>
      <Heading level="page">Napoletana STG</Heading>
      <Heading level="lg">Parametri dell'impasto</Heading>
      <Heading level="md">Idratazione e farina</Heading>
      <Heading level="sm">Cottura</Heading>
    </div>
  );
}

export function AccentColor() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Heading level="page" color="var(--text-accent)">
        pizza perfetta.
      </Heading>
      <Heading level="md" color="var(--text-muted)">
        I migliori per il tuo profilo
      </Heading>
    </div>
  );
}
