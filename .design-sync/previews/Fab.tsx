import { Fab } from "@vulcan/ds";
import { Plus, Flame } from "lucide-react";

export function Variants() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <Fab variant="small" icon={<Plus size={18} />} />
      <Fab variant="standard" icon={<Plus size={22} />} />
      <Fab variant="extended" icon={<Flame size={18} />} label="Genera ricetta" />
    </div>
  );
}

export function Colors() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <Fab color="primary" icon={<Plus size={22} />} />
      <Fab color="surface" icon={<Plus size={22} />} />
      <Fab color="tertiary" icon={<Plus size={22} />} />
    </div>
  );
}
