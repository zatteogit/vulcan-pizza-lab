import { Carousel, Surface, Heading, Badge } from "@vulcan/ds";

const STYLES = [
  { name: "Napoletana STG", note: "Cornicione gonfio, leopardatura", tag: "65% idratazione" },
  { name: "Teglia Romana", note: "Alta idratazione, crunch", tag: "80% idratazione" },
  { name: "Detroit Style", note: "Bordo croccante, olio in teglia", tag: "70% idratazione" },
];

export function Styles() {
  return (
    <div style={{ width: "100%", maxWidth: 340 }}>
      <Carousel itemWidth={220}>
        {STYLES.map((s) => (
          <Surface key={s.name} variant="card" style={{ padding: 16 }}>
            <Heading level="sm">{s.name}</Heading>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-md)", margin: "6px 0 10px" }}>
              {s.note}
            </p>
            <Badge tone="accent" size="xs">
              {s.tag}
            </Badge>
          </Surface>
        ))}
      </Carousel>
    </div>
  );
}
