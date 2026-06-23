import { Slider } from "@figma/my-make-file";
import { useState } from "react";

export function Sliders() {
  const [h, setH] = useState(65);
  const [w, setW] = useState(280);
  const [f, setF] = useState(24);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: 300 }}>
      <Slider label="Idratazione" value={h} min={50} max={90} unit="%" onValueChange={setH} />
      <Slider label="Farina W" value={w} min={170} max={400} onValueChange={setW} />
      <Slider label="Fermentazione" value={f} min={4} max={72} unit="h" onValueChange={setF} />
    </div>
  );
}
