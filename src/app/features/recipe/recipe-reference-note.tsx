import type { GeneratedRecipe, OvenType } from "../../domain/pizza-engine";
import { STG_SPECIFICATION_URL, stgDepartures, type StgDeparture } from "../../domain/recipe-reference";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";
import { uiMessage } from "../../i18n/ui-messages";
import { WhyButton } from "../science/why-button";

/* FW-02: «Ricetta e disciplinare» è il «Perché?» della nota stg-reference.
 * L1/L2 e il L3 (statuto, ipotesi del confronto parziale, fonte) vengono dal
 * registro; qui restano solo le differenze di questa ricetta e i link. */
export function RecipeReferenceNote({ recipe, oven }: { recipe: GeneratedRecipe; oven?: OvenType }) {
  const { cms, bcp47 } = useCms();
  /* B1 (D-068): le scelte di Vulcan sulla fonte (lievito convertito per la
     dispensa, «luogo caldo» senza gradi) si dichiarano sopra la nota. */
  const notes = recipe.source_notes;
  if (!notes?.length) return <ReferenceNoteBody recipe={recipe} oven={oven} />;
  return (
    <>
      <aside className="recipe-reference-note">{engineMsgTexts(notes, cms, bcp47).map((note, i) => <p key={i}>{note}</p>)}</aside>
      <ReferenceNoteBody recipe={recipe} oven={oven} />
    </>
  );
}

function ReferenceNoteBody({ recipe, oven }: { recipe: GeneratedRecipe; oven?: OvenType }) {
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
      {/* L'etichetta resta «Ricetta e disciplinare»: la descrizione dello stile
          fuori disciplinare rimanda a questo nome. */}
      <WhyButton noteId="stg-reference" label={uiMessage("recipe.reference.details")}>
        {departures.length > 0 && <ul className="recipe-reference-note__list">{departures.map(key => <li key={key}>{descriptions[key]}</li>)}</ul>}
        {recipe.style.method_profile?.id === "avpn_disciplinare" && <p>
          <a href={recipe.style.method_profile.source_url} target="_blank" rel="noreferrer" className="recipe-reference-note__link">{uiMessage("recipe.reference.avpn")}</a>
          {recipe.has_pre_ferment && <> · {engineMsgTexts([{key:"auth.directMethod",fallback:cms.engineMessages["auth.directMethod"]}], cms, bcp47)[0]}</>}
        </p>}
        <p><a href={STG_SPECIFICATION_URL} target="_blank" rel="noreferrer" className="recipe-reference-note__link">{uiMessage("recipe.reference.specification")}</a></p>
      </WhyButton>
    </aside>
  );
}
