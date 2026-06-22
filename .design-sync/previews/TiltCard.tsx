import { TiltCard, Heading, Badge } from "@figma/my-make-file";

export function Default() {
  return (
    <TiltCard style={{ maxWidth: 280 }}>
      <div
        style={{
          padding: 20,
          background: "var(--surface-container)",
          border: "1px solid var(--outline-variant)",
          borderRadius: 16,
        }}
      >
        <Heading level="sm">Napoletana STG</Heading>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-md)",
            margin: "6px 0 12px",
          }}
        >
          Card con tilt 3D al passaggio del mouse.
        </p>
        <Badge tone="accent" size="xs">
          65% idratazione
        </Badge>
      </div>
    </TiltCard>
  );
}
