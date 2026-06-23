import { SegmentedControl } from "@vulcan/ds";
import { Flame, Compass, GraduationCap } from "lucide-react";
import { useState } from "react";

export function Modes() {
  const [v, setV] = useState("crea");
  return (
    <SegmentedControl
      ariaLabel="Sezione"
      value={v}
      onValueChange={setV}
      options={[
        { value: "crea", label: "Crea" },
        { value: "scopri", label: "Scopri" },
        { value: "impara", label: "Impara" },
      ]}
    />
  );
}

export function WithIcons() {
  const [v, setV] = useState("scopri");
  return (
    <SegmentedControl
      ariaLabel="Sezione"
      value={v}
      onValueChange={setV}
      options={[
        { value: "crea", label: "Crea", icon: <Flame size={15} /> },
        { value: "scopri", label: "Scopri", icon: <Compass size={15} /> },
        { value: "impara", label: "Impara", icon: <GraduationCap size={15} /> },
      ]}
    />
  );
}

export function Brand() {
  const [v, setV] = useState("adattata");
  return (
    <SegmentedControl
      ariaLabel="Modalità"
      tone="brand"
      value={v}
      onValueChange={setV}
      options={[
        { value: "canonica", label: "Canonica" },
        { value: "adattata", label: "La mia versione" },
      ]}
    />
  );
}
