import { ALLERGEN_IDS, normalizeAllergenIds, type AllergenId } from "../../data/allergen-data";
import { Chip } from "../../components/ds";
import { uiMessage } from "../../i18n/ui-messages";
import { allergenName } from "./allergen-names";

/** Explicit, optional preferences; an empty selection is not a declaration of absence. */
export function AllergenPreferences({ value, onChange }: { value: readonly AllergenId[]; onChange: (value: AllergenId[]) => void }) {
  return <details className="allergen-preferences">
    <summary>{uiMessage("allergen.preferences")}<span className="allergen-preferences__value">{value.length ? value.map(allergenName).join(", ") : uiMessage("allergen.unspecified")}</span></summary>
    <p>{uiMessage("allergen.preferenceHelp")}</p>
    <div className="allergen-preferences__choices">{ALLERGEN_IDS.map(id => <Chip key={id} label={allergenName(id)} active={value.includes(id)} onToggle={() => {
      const next=normalizeAllergenIds(value.includes(id)?value.filter(v=>v!==id):[...value,id]);
      try { localStorage.setItem("vulcan_allergens",JSON.stringify(next)); } catch { /* Session preferences still apply. */ }
      onChange(next);
    }}/>)}</div>
    <p>{uiMessage("allergen.preferenceNote")}</p>
  </details>;
}
