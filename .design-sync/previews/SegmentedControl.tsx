import { SegmentedControl } from "@figma/my-make-file";
import { Flame, Compass, GraduationCap } from "lucide-react";

const noop = () => {};

export function Modes() {
  return (
    <SegmentedControl
      ariaLabel="Sezione"
      value="crea"
      onValueChange={noop}
      options={[
        { value: "crea", label: "Crea" },
        { value: "scopri", label: "Scopri" },
        { value: "impara", label: "Impara" },
      ]}
    />
  );
}

export function WithIcons() {
  return (
    <SegmentedControl
      ariaLabel="Sezione"
      value="scopri"
      onValueChange={noop}
      options={[
        { value: "crea", label: "Crea", icon: <Flame size={15} /> },
        { value: "scopri", label: "Scopri", icon: <Compass size={15} /> },
        { value: "impara", label: "Impara", icon: <GraduationCap size={15} /> },
      ]}
    />
  );
}

export function Tabs() {
  return (
    <SegmentedControl
      ariaLabel="Sezioni ricetta"
      role="tablist"
      value="ricetta"
      onValueChange={noop}
      options={[
        { value: "ricetta", label: "Ricetta" },
        { value: "procedimento", label: "Procedimento" },
        { value: "condimento", label: "Condimento" },
      ]}
    />
  );
}

export function Brand() {
  return (
    <SegmentedControl
      ariaLabel="Modalità"
      tone="brand"
      value="adattata"
      onValueChange={noop}
      options={[
        { value: "canonica", label: "Canonica" },
        { value: "adattata", label: "La mia versione" },
      ]}
    />
  );
}
