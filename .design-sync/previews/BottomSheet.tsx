import { BottomSheet, CtaButton } from "@figma/my-make-file";
import { useState } from "react";

export function Open() {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 380,
        height: 280,
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--container-page)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CtaButton variant="secondary" radius="lg" onClick={() => setOpen(true)}>
        Apri sheet
      </CtaButton>
      <BottomSheet inline open={open} onClose={() => setOpen(false)} title="Adatta alla tua cucina">
        Ricalibra tempi e temperature per il tuo forno. Scegli l'attrezzatura
        disponibile e l'impasto si adatta di conseguenza.
      </BottomSheet>
    </div>
  );
}
