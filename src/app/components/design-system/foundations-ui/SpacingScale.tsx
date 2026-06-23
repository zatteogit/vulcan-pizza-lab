/**
 * Foundation — Scala di spaziatura. Barre dimensionate dai token `--space-*`.
 */
const SPACES = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-8", "--space-10", "--space-12", "--space-16"];

export function SpacingScale() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", width: "100%", maxWidth: 520 }}>
      {SPACES.map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)", width: 90, flexShrink: 0 }}>{s}</span>
          <div style={{ height: 16, width: `var(${s})`, background: "var(--primary)", borderRadius: "var(--radius-xs)", flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
