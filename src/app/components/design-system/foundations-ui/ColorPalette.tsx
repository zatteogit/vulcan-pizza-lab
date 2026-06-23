/**
 * Foundation — Palette colori. Card di riferimento: disegna gli swatch dei
 * token colore reali (il valore arriva dalla closure CSS). Context-free.
 */
import type { CSSProperties } from "react";

const GROUPS: { title: string; tokens: string[] }[] = [
  { title: "Brand", tokens: ["--primary", "--secondary", "--tertiary", "--cta", "--destructive"] },
  { title: "Testo", tokens: ["--text-default", "--text-muted", "--text-subtle", "--text-accent", "--text-success", "--text-warning", "--text-error"] },
  { title: "Superfici", tokens: ["--container-page", "--container-card", "--surface-container", "--surface-container-high", "--surface-container-low"] },
  { title: "Bordi", tokens: ["--outline", "--outline-variant"] },
];

function Swatch({ name }: { name: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 56, borderRadius: "var(--radius-md)", background: `var(${name})`, border: "1px solid var(--outline-variant)" }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>{name}</span>
    </div>
  );
}

export function ColorPalette() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", width: "100%", maxWidth: 640 }}>
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-caps)",
              color: "var(--text-default)",
              marginBottom: 10,
            }}
          >
            {g.title}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "var(--space-3)" }}>
            {g.tokens.map((t) => <Swatch key={t} name={t} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
