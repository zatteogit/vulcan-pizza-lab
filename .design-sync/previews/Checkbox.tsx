import { Checkbox } from "@figma/my-make-file";
import { useState } from "react";

export function Interactive() {
  const [v, setV] = useState<Record<string, boolean | "indeterminate">>({
    napo: true,
    teglia: false,
    bonci: "indeterminate",
  });
  const toggle = (id: string) =>
    setV((p) => ({ ...p, [id]: p[id] === "indeterminate" ? true : !p[id] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", maxWidth: 320 }}>
      <Checkbox checked={v.napo} onCheckedChange={() => toggle("napo")} label="Napoletana STG" description="Classica AVPN, forno a legna" />
      <Checkbox checked={v.teglia} onCheckedChange={() => toggle("teglia")} label="Teglia Romana" description="Alta idratazione, crunch" />
      <Checkbox checked={v.bonci} onCheckedChange={() => toggle("bonci")} label="Metodo Bonci" description="Lunga maturazione" />
    </div>
  );
}

export function Bare() {
  const [on, setOn] = useState([true, false, true]);
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {on.map((c, i) => (
        <Checkbox key={i} checked={c} onCheckedChange={() => setOn((p) => p.map((x, j) => (j === i ? !x : x)))} />
      ))}
      <Checkbox checked disabled />
    </div>
  );
}
