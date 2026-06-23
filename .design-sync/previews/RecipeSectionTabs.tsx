import { RecipeSectionTabs } from "@figma/my-make-file";

export function Inline() {
  return (
    <div style={{ maxWidth: 440 }}>
      <RecipeSectionTabs
        activeTab="ricetta"
        recipeLabel="Napoletana"
        onChange={() => {}}
        sticky={false}
      />
    </div>
  );
}

export function Procedure() {
  return (
    <div style={{ maxWidth: 440 }}>
      <RecipeSectionTabs
        activeTab="procedimento"
        recipeLabel="Romana"
        onChange={() => {}}
        sticky={false}
      />
    </div>
  );
}
