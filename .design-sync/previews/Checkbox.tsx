import { Checkbox } from "@figma/my-make-file";

export function States() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 320 }}>
      <Checkbox checked label="Napoletana STG" description="Classica AVPN, forno a legna" />
      <Checkbox checked={false} label="Teglia Romana" description="Alta idratazione, crunch" />
      <Checkbox checked="indeterminate" label="Metodo Bonci" description="Lunga maturazione" />
    </div>
  );
}

export function Bare() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Checkbox checked />
      <Checkbox checked={false} />
      <Checkbox checked="indeterminate" />
      <Checkbox checked disabled />
    </div>
  );
}
