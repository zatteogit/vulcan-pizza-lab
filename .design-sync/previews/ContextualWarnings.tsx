import { ContextualWarnings } from "@figma/my-make-file";

export function Warnings() {
  return (
    <div style={{ width: 460 }}>
      <ContextualWarnings
        hydration={82}
        flourW={250}
        flourPL={0.55}
        fermentHours={48}
        fermentTemp={4}
        ovenTemp={250}
        skillLevel={2}
        usePreFerment={false}
      />
    </div>
  );
}
