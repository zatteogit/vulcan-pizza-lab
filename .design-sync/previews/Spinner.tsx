import { Spinner } from "@vulcan/ds";

export function Sizes() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={36} />
    </div>
  );
}
