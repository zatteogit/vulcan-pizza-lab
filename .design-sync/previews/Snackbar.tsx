import { Snackbar } from "@figma/my-make-file";
import { useState } from "react";

export function Variants() {
  const [v, setV] = useState([true, true, true]);
  const dismiss = (i: number) => setV((p) => p.map((x, j) => (j === i ? false : x)));
  const reset = () => setV([true, true, true]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      {v[0] && <Snackbar message="Versione salvata" action="Annulla" onAction={() => dismiss(0)} />}
      {v[1] && <Snackbar variant="success" message="Ricetta generata con successo" action="Vedi" onAction={() => dismiss(1)} />}
      {v[2] && <Snackbar variant="error" message="Forno troppo freddo per questo stile" action="Adatta" onAction={() => dismiss(2)} />}
      {!v.some(Boolean) && (
        <button
          type="button"
          onClick={reset}
          style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "var(--font-size-md)" }}
        >
          ↺ Mostra di nuovo
        </button>
      )}
    </div>
  );
}
