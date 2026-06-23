/**
 * Foundation — Scala tipografica. Mostra le classi `.type-*` reali con un
 * campione + il nome della classe. Context-free.
 */
const TYPES: { cls: string; sample: string }[] = [
  { cls: "type-display", sample: "Display" },
  { cls: "type-title-page", sample: "Titolo pagina" },
  { cls: "type-heading-xl", sample: "Heading XL" },
  { cls: "type-heading-lg", sample: "Heading LG" },
  { cls: "type-heading-md", sample: "Heading MD" },
  { cls: "type-heading-sm", sample: "Heading SM" },
  { cls: "type-subheading", sample: "Subheading" },
  { cls: "type-body-lg", sample: "Body large — testo di paragrafo" },
  { cls: "type-body", sample: "Body — testo di paragrafo" },
  { cls: "type-label", sample: "Label" },
  { cls: "type-data", sample: "1234,5" },
  { cls: "type-numeric", sample: "67,2%" },
  { cls: "type-mono-label", sample: "MONO LABEL" },
  { cls: "type-step-num", sample: "01 — CONTESTO" },
];

export function TypeScale() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "100%", maxWidth: 640 }}>
      {TYPES.map((t) => (
        <div
          key={t.cls}
          style={{ display: "flex", flexDirection: "column", gap: 2, borderBottom: "1px solid var(--outline-variant)", paddingBottom: "var(--space-3)" }}
        >
          <span className={t.cls} style={{ color: "var(--text-default)" }}>{t.sample}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>.{t.cls}</span>
        </div>
      ))}
    </div>
  );
}
