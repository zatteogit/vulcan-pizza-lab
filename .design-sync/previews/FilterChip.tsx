import { FilterChip } from "@figma/my-make-file";
import { useState } from "react";

export function Filters() {
  const [sel, setSel] = useState("tutti");
  const items = ["Tutti", "Napoletana", "Romana", "Americana"];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {items.map((x) => (
        <FilterChip key={x} active={sel === x.toLowerCase()} onClick={() => setSel(x.toLowerCase())}>
          {x}
        </FilterChip>
      ))}
    </div>
  );
}

export function WithCount() {
  const [sel, setSel] = useState("tutti");
  const items: [string, number][] = [["Tutti", 28], ["Napoletana", 5], ["Romana", 6]];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {items.map(([l, c]) => (
        <FilterChip key={l} active={sel === l.toLowerCase()} count={c} onClick={() => setSel(l.toLowerCase())}>
          {l}
        </FilterChip>
      ))}
    </div>
  );
}
