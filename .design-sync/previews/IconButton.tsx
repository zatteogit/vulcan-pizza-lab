import { IconButton } from "@figma/my-make-file";
import { Heart, Share2, Plus, ChevronLeft } from "lucide-react";

export function Sizes() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <IconButton size="sm" aria-label="Preferito">
        <Heart size={14} />
      </IconButton>
      <IconButton size="md" aria-label="Preferito">
        <Heart size={16} />
      </IconButton>
      <IconButton size="lg" aria-label="Preferito">
        <Heart size={18} />
      </IconButton>
    </div>
  );
}

export function Variants() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <IconButton variant="surface" aria-label="Indietro">
        <ChevronLeft size={16} />
      </IconButton>
      <IconButton variant="surface" aria-label="Condividi">
        <Share2 size={16} />
      </IconButton>
      <IconButton variant="ghost" aria-label="Aggiungi">
        <Plus size={16} />
      </IconButton>
    </div>
  );
}
