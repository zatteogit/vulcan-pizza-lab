import { Dialog, CtaButton } from "@figma/my-make-file";
import { useState } from "react";

export function Confirm() {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 400,
        height: 260,
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--container-page)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CtaButton variant="secondary" radius="lg" onClick={() => setOpen(true)}>
        Apri dialog
      </CtaButton>
      <Dialog
        inline
        open={open}
        onClose={() => setOpen(false)}
        title="Eliminare la versione?"
        actions={
          <>
            <CtaButton variant="secondary" radius="lg" onClick={() => setOpen(false)}>
              Annulla
            </CtaButton>
            <CtaButton variant="primary" radius="lg" onClick={() => setOpen(false)}>
              Elimina
            </CtaButton>
          </>
        }
      >
        Questa azione non può essere annullata. La tua versione personalizzata andrà persa.
      </Dialog>
    </div>
  );
}
