/**
 * Foundation — Elevazione. Card con ogni token `--shadow-*`.
 */
const SHADOWS = ["--shadow-xs", "--shadow-sm", "--shadow-md", "--shadow-lg", "--shadow-xl", "--shadow-glow", "--shadow-cta"];

export function Elevation() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "var(--space-6)", width: "100%", maxWidth: 600, padding: "var(--space-2)" }}>
      {SHADOWS.map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ width: "100%", height: 64, background: "var(--container-card)", borderRadius: "var(--radius-lg)", boxShadow: `var(${s})` }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>{s}</span>
        </div>
      ))}
    </div>
  );
}
