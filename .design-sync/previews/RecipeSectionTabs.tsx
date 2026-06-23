import { RecipeSectionTabs } from "@vulcan/ds";
import { useState } from "react";

export function Inline() {
  const [tab, setTab] = useState("ricetta");
  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <RecipeSectionTabs activeTab={tab as any} recipeLabel="Napoletana" onChange={(t) => setTab(t)} sticky={false} />
    </div>
  );
}
