import { Chip } from "@vulcan/ds";
import { CookingPot, Package } from "lucide-react";
import { useState } from "react";

export function States() {
  const [on, setOn] = useState({ legna: true, teglia: false });
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Chip label="Forno a legna" active={on.legna} onToggle={() => setOn((p) => ({ ...p, legna: !p.legna }))} />
      <Chip label="Teglia" active={on.teglia} onToggle={() => setOn((p) => ({ ...p, teglia: !p.teglia }))} />
    </div>
  );
}

export function WithIcon() {
  const [sel, setSel] = useState("dispensa");
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Chip label="Dispensa" active={sel === "dispensa"} onToggle={() => setSel("dispensa")} />
      <Chip label="La tua cucina" active={sel === "cucina"} onToggle={() => setSel("cucina")} icon={<CookingPot size={15} />} />
      <Chip label="Tutto pronto" active={sel === "pronto"} onToggle={() => setSel("pronto")} icon={<Package size={15} />} />
    </div>
  );
}
