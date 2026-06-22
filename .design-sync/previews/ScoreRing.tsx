import { ScoreRing } from "@figma/my-make-file";

export function Tiers() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <ScoreRing score={92} color="var(--text-success)" size={48} />
      <ScoreRing score={68} color="var(--text-warning)" size={48} />
      <ScoreRing score={34} color="var(--text-error)" size={48} />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <ScoreRing score={78} color="var(--primary)" size={28} />
      <ScoreRing score={78} color="var(--primary)" size={40} />
      <ScoreRing score={78} color="var(--primary)" size={56} />
    </div>
  );
}
