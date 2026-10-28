import type { GeneratedRecipe, OvenType } from "../../domain/pizza-engine";
import { stgDepartures, type StgDeparture } from "../../domain/recipe-reference";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";
import { uiMessage } from "../../i18n/ui-messages";
import { Disclosure } from "../../components/ds";

export function RecipeReferenceNote({ recipe, oven }: { recipe: GeneratedRecipe; oven?: OvenType }) {
  const { cms, bcp47 } = useCms();
  if (recipe.method_changes?.length) return <aside className="recipe-reference-note">{engineMsgTexts(recipe.method_changes,cms,bcp47).map((note,i)=><p key={i}>{note}</p>)}</aside>;
  if (recipe.style.formula_variant) return <aside className="recipe-reference-note"><p>{engineMsgTexts([recipe.style.formula_variant], cms, bcp47)[0]}</p></aside>;
  if (recipe.style.id !== "napoletana_stg") return null;
  const departures = stgDepartures(recipe, oven);
  const descriptions: Record<StgDeparture, string> = {
    wood: uiMessage("recipe.reference.wood"), bake: uiMessage("recipe.reference.bake"),
    flour: uiMessage("recipe.reference.flour"), pl: uiMessage("recipe.reference.pl"),
    fermentation: uiMessage("recipe.reference.fermentation"), cold: uiMessage("recipe.reference.cold"),
    preferment: uiMessage("recipe.reference.preferment"), yeast: uiMessage("recipe.reference.yeast"),
    additions: uiMessage("recipe.reference.additions"), weight: uiMessage("recipe.reference.weight"),
    topping: uiMessage("recipe.reference.topping"),
  };
  return (
    <aside className="recipe-reference-note">
      <p className="recipe-reference-note__title">{departures.length ? uiMessage("recipe.reference.outside") : uiMessage("recipe.reference.source")}</p>
      <Disclosure variant="inline" summary={uiMessage("recipe.reference.details")}>
        {recipe.style.method_profile?.id === "avpn_disciplinare" && <p>
          <a href={recipe.style.method_profile.source_url} target="_blank" rel="noreferrer">{uiMessage("recipe.reference.avpn")}</a>
          {recipe.has_pre_ferment && <> · {engineMsgTexts([{key:"auth.directMethod",fallback:cms.engineMessages["auth.directMethod"]}], cms, bcp47)[0]}</>}
        </p>}
        {departures.length > 0 && <ul>{departures.map(key => <li key={key}>{descriptions[key]}</li>)}</ul>}
        <p>{uiMessage("recipe.reference.disclaimer")}</p>
        <a href="https://www.masaf.gov.it/flex/cm/pages/ServeAttachment.php/L/IT/D/1%252F4%252Fa%252FD.54ec78491c37356fe33f/P/BLOB:ID=24230/E/pdf?mode=download" target="_blank" rel="noreferrer">{uiMessage("recipe.reference.specification")}</a>
      </Disclosure>
    </aside>
  );
}
