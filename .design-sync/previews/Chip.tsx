import { Chip } from "@figma/my-make-file";
import { CookingPot, Package } from "lucide-react";

const noop = () => {};

export function States() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Chip label="Forno a legna" active={true} onToggle={noop} />
      <Chip label="Teglia" active={false} onToggle={noop} />
    </div>
  );
}

export function WithIcon() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Chip label="Dispensa" active={true} onToggle={noop} />
      <Chip
        label="La tua cucina"
        active={false}
        onToggle={noop}
        icon={<CookingPot size={15} />}
      />
      <Chip
        label="Tutto pronto"
        active={false}
        onToggle={noop}
        icon={<Package size={15} />}
      />
    </div>
  );
}
