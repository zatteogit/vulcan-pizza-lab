import { Snackbar } from "@figma/my-make-file";

export function Variants() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <Snackbar message="Versione salvata" action="Annulla" />
      <Snackbar variant="success" message="Ricetta generata con successo" action="Vedi" />
      <Snackbar variant="error" message="Forno troppo freddo per questo stile" action="Adatta" />
    </div>
  );
}
