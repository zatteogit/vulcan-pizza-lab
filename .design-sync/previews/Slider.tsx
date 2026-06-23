import { Slider } from "@figma/my-make-file";

export function Sliders() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 300 }}>
      <Slider label="Idratazione" value={65} min={50} max={90} unit="%" />
      <Slider label="Farina W" value={280} min={170} max={400} />
      <Slider label="Fermentazione" value={24} min={4} max={72} unit="h" />
    </div>
  );
}
