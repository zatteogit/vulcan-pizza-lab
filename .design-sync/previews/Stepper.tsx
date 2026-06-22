import { Stepper } from "@figma/my-make-file";

const noop = () => {};

export function Default() {
  return (
    <Stepper
      value={4}
      min={1}
      max={20}
      onChange={noop}
      decrementLabel="Meno panetti"
      incrementLabel="Più panetti"
    />
  );
}

export function AtMin() {
  return (
    <Stepper
      value={1}
      min={1}
      max={20}
      onChange={noop}
      decrementLabel="Meno panetti"
      incrementLabel="Più panetti"
    />
  );
}

export function AtMax() {
  return (
    <Stepper
      value={20}
      min={1}
      max={20}
      onChange={noop}
      decrementLabel="Meno panetti"
      incrementLabel="Più panetti"
    />
  );
}
