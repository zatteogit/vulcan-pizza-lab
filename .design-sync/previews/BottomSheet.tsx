import { BottomSheet } from "@figma/my-make-file";

export function Open() {
  return (
    <div
      style={{
        position: "relative",
        width: 380,
        height: 280,
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--container-page)",
      }}
    >
      <BottomSheet inline open title="Adatta alla tua cucina">
        Ricalibra tempi e temperature per il tuo forno. Scegli l'attrezzatura
        disponibile e l'impasto si adatta di conseguenza.
      </BottomSheet>
    </div>
  );
}
