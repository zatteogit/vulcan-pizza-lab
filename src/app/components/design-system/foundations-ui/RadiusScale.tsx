/**
 * Foundation — Scala dei raggi. Box con ogni token `--radius-*`.
 */
const RADII = ["--radius-xs", "--radius-sm", "--radius-md", "--radius-lg", "--radius-xl", "--radius-2xl", "--radius-full"];

export function RadiusScale() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "var(--space-4)", width: "100%", maxWidth: 560 }}>
      {RADII.map((r) => (
        <div key={r} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <div style={{ width: "100%", height: 72, background: "var(--surface-container)", border: "2px solid var(--primary)", borderRadius: `var(${r})` }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>{r}</span>
        </div>
      ))}
    </div>
  );
}
