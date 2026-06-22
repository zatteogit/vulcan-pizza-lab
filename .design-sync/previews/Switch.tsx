import { Switch } from "@figma/my-make-file";

const noop = () => {};

export function States() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Switch checked={true} onCheckedChange={noop} />
        <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-default)" }}>
          Modalità nerd
        </span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Switch checked={false} onCheckedChange={noop} />
        <span style={{ fontSize: "var(--font-size-lg)", color: "var(--text-muted)" }}>
          Evita le fasi notturne
        </span>
      </label>
    </div>
  );
}
