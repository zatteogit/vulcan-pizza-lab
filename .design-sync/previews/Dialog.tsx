import { Dialog, CtaButton } from "@figma/my-make-file";

export function Confirm() {
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
      }}
    >
      <Dialog
        inline
        open
        title="Eliminare la versione?"
        actions={
          <>
            <CtaButton variant="secondary" radius="lg">
              Annulla
            </CtaButton>
            <CtaButton variant="primary" radius="lg">
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
