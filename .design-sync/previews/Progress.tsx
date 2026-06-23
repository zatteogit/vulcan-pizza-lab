import { Progress } from "@vulcan/ds";

export function Linear() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 300 }}>
      <Progress label="Maturazione" value={72} />
      <Progress label="Cottura" value={35} />
      <Progress indeterminate label="Caricamento" />
    </div>
  );
}

export function Circular() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <Progress variant="circular" value={72} size={48} />
      <Progress variant="circular" value={35} size={48} />
      <Progress variant="circular" indeterminate size={48} />
    </div>
  );
}
