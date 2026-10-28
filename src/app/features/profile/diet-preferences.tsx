/* FW-16 — Dieta e allergeni nel Profilo (D-L, S16-A-03/A-04/A-05).
 * Due gruppi: le diete che controlliamo sugli ingredienti e quelle che il
 * motore non sa misurare (solo promemoria). Le diete «senza glutine» e
 * «senza lattosio» suggeriscono l'allergene corrispondente senza segnarlo da
 * sole: una dieta non è un'allergia. */
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Chip } from "../../components/ds";
import type { AllergenId } from "../../data/allergen-data";
import { useCms } from "../cms/cms-context";
import { t } from "../cms/i18n";
import { allergenName } from "../recipe/allergen-names";
import { AllergenPreferences, saveAllergenPreferences } from "../recipe/allergen-preferences";
import { CHECKED_DIETS, DIET_ALLERGEN_LINK, REMINDER_DIETS } from "../../use-cases/setting-effects";
import { SettingEffectNote } from "./setting-effect-note";
import { uiMessage } from "../../i18n/ui-messages";

export interface DietOption {
  id: string;
  label: string;
  icon: ReactNode;
}

const REMINDER_WHY_KEYS = ["diet.fodmapUnknown", "diet.histamineUnknown", "diet.nickelUnknown", "diet.processCheck"] as const;

export function DietPreferences({
  options,
  dietary,
  onToggleDiet,
  allergens,
  onAllergensChange,
}: {
  options: readonly DietOption[];
  dietary: readonly string[];
  onToggleDiet: (id: string) => void;
  allergens: readonly AllergenId[];
  onAllergensChange: (next: AllergenId[]) => void;
}) {
  const { cms } = useCms();
  const p = cms.profile;
  const group = (ids: readonly string[]) => options.filter((option) => ids.includes(option.id));
  const chips = (ids: readonly string[]) => (
    <div className="profile-diet-chips">
      {group(ids).map((option) => (
        <Chip
          key={option.id}
          label={option.label}
          active={dietary.includes(option.id)}
          onToggle={() => onToggleDiet(option.id)}
          icon={option.icon}
        />
      ))}
    </div>
  );
  const allergenHints = Object.entries(DIET_ALLERGEN_LINK).filter(
    ([diet, allergen]) => dietary.includes(diet) && !allergens.includes(allergen),
  );

  return (
    <>
      <section className="profile-diet-group" data-region="diet-checked" aria-labelledby="profile-diet-checked">
        <h3 id="profile-diet-checked" className="profile-diet-group__title">{p.dietCheckedTitle}</h3>
        <SettingEffectNote settingId="dietChecked" />
        {chips(CHECKED_DIETS)}
        {/* FW-10 (S16-A-03): «Senza glutine» blocca le ricette con farina di
            frumento; lo diciamo dove si sceglie, con il perché. */}
        {dietary.includes("gluten_free") && (
          <section className="profile-diet-note" data-tone="caution" role="status">
            <p className="type-body-sm">{uiMessage("profile.dietGlutenNote")}</p>
            <details className="profile-diet-note__why">
              <summary className="type-body-sm">{uiMessage("profile.dietGlutenWhy")}</summary>
              <p className="type-body-sm">{cms.engineMessages["diet.noValidatedMethod"]}</p>
            </details>
          </section>
        )}
        {allergenHints.map(([diet, allergen]) => {
          const name = allergenName(allergen);
          return (
            <p key={diet} className="profile-diet-note" data-tone="neutral">
              {t(diet === "gluten_free" ? p.dietGlutenAllergenHint : p.dietLactoseAllergenHint, { allergen: name })}
              <button
                type="button"
                className="profile-diet-note__action"
                onClick={() => onAllergensChange(saveAllergenPreferences([...allergens, allergen]))}
              >
                {t(p.dietAllergenAdd, { allergen: name })}
              </button>
            </p>
          );
        })}
      </section>
      <section className="profile-diet-group" data-region="diet-reminder" aria-labelledby="profile-diet-reminder">
        <h3 id="profile-diet-reminder" className="profile-diet-group__title">{p.dietReminderTitle}</h3>
        <SettingEffectNote settingId="dietReminder" />
        {chips(REMINDER_DIETS)}
        <details className="setting-effect-details" data-region="setting-effect-details">
          <summary className="setting-effect-details__summary">
            {p.dietReminderWhy}
            <ChevronDown size={16} aria-hidden="true" className="setting-effect-details__chevron" />
          </summary>
          <ul className="setting-effect-details__list">
            {REMINDER_WHY_KEYS.map((key) => (
              <li key={key} className="setting-effect-details__item">{cms.engineMessages[key]}</li>
            ))}
          </ul>
        </details>
      </section>
      <section className="profile-diet-group" data-region="diet-allergens">
        <AllergenPreferences value={allergens} onChange={onAllergensChange} />
        <SettingEffectNote settingId="allergens" />
      </section>
    </>
  );
}
