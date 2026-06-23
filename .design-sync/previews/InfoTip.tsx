import { InfoTip } from "@figma/my-make-file";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--text-default)",
        fontSize: "var(--font-size-lg)",
      }}
    >
      {label}
      {children}
    </span>
  );
}

export function Inline() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 280 }}>
      <Row label="Idratazione">
        <InfoTip>Quanta acqua rispetto alla farina, in percentuale.</InfoTip>
      </Row>
      <Row label="Maturazione">
        <InfoTip size={18}>Tempo di riposo dell'impasto in frigo.</InfoTip>
      </Row>
    </div>
  );
}
