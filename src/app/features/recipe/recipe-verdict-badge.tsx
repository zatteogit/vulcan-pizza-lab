import { ArrowDown, TriangleAlert } from "lucide-react";
import { Badge } from "../../components/ds/index";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";
import { recipeCardSignals } from "./recipe-card-signals";
import { RECIPE_MATCH_ID } from "./recipe-match-card";
import type { RecipePrimaryTab } from "./recipe-section-tabs";

/* ═══ FW-10 (S07-B-05) — l'esito sopra la piega ═══
 * A 390 px il blocco «Per ora non si può fare» finiva sotto la piega e sotto la
 * navbar: chi ha fretta vedeva titolo, ingredienti e «Stampa». Sotto il titolo
 * c'è ora un segnale breve, lo stesso delle card, e «Perché» porta al blocco
 * che spiega causa e rimedio. */
export function RecipeVerdictBadge({
  recipe,
  hasMatchSlot,
  activeTab,
  onTabChange,
}: {
  recipe: GeneratedRecipe;
  /** Con il blocco compatibilità l'esito vive lì (scheda Ricetta); senza, è
   *  l'avviso in cima al contenuto, valido per entrambe le schede. */
  hasMatchSlot: boolean;
  activeTab: RecipePrimaryTab;
  onTabChange: (tab: RecipePrimaryTab) => void;
}) {
  const { cms, bcp47 } = useCms();
  if (recipe.verdict.outcome !== "not_feasible") return null;
  const signal = recipeCardSignals(recipe)[0];
  if (!signal) return null;
  const text = engineMsgTexts([signal.message], cms, bcp47)[0];
  const targetId = hasMatchSlot ? RECIPE_MATCH_ID : "recipe-verdict-title";

  const goToVerdict = () => {
    if (hasMatchSlot && activeTab !== "ricetta") onTabChange("ricetta");
    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
  };

  return (
    <p className="recipe-verdict-badge" data-region="status">
      <Badge tone="error" className="recipe-verdict-badge__label">
        <TriangleAlert size={14} aria-hidden="true" />
        <span data-slot="label">{text}</span>
      </Badge>
      <button type="button" className="recipe-verdict-badge__why" onClick={goToVerdict}>
        {uiMessage("verdict.why")}
        <ArrowDown size={14} aria-hidden="true" />
      </button>
    </p>
  );
}
