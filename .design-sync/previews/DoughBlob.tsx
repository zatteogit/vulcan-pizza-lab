import { DoughBlob } from "@vulcan/ds";

export function Variants() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
      <DoughBlob variant="rest" size={96} energy={20} animate={false} />
      <DoughBlob variant="rise" size={96} energy={55} animate={false} />
      <DoughBlob variant="forge" size={96} energy={85} animate={false} />
    </div>
  );
}

export function Expressive() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
      <DoughBlob variant="stretch" size={96} energy={40} animate={false} />
      <DoughBlob variant="spin" size={96} energy={70} animate={false} />
      <DoughBlob variant="fold" size={96} energy={60} animate={false} />
    </div>
  );
}
