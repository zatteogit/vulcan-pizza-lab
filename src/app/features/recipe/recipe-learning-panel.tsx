import { X, GraduationCap } from "lucide-react";
import type { PizzaStyle } from "../../domain/pizza-engine";
import { formatOrigin } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { placeNameLocalizer } from "../cms/i18n";
import { ModalSheet } from "../../components/ds/index";
import { uiMessage } from "../../i18n/ui-messages";
import { WhyButton } from "../science/why-button";

/* FW-02 (S08-B-15): «Approfondisci» porta alla scienza vera, con gli stessi
 * «Perché?» del resto dell'app (nota del registro, L1→L2→L3 con fonti).
 * La Napoletana STG ha le note del disciplinare; ogni stile quelle del motore
 * che decidono la sua ricetta. Le caratteristiche sono un elenco, non pillole
 * che sembrano pulsanti. */
const STYLE_NOTES = ["yeast-dose", "q10-fermentation", "water-temp-rule", "flour-w-by-grade", "thickness-factor"] as const;
const STG_NOTES = ["stg-flour-w", "stg-oven-temp", "stg-salt-timing", "yeast-dose", "water-temp-rule"] as const;

export function RecipeLearningPanel({
  open,
  style,
  familyName,
  onClose,
}: {
  open: boolean;
  style: PizzaStyle;
  familyName: string;
  onClose: () => void;
}) {
  const { cms } = useCms();
  /* FW-11 (S08-B-08): testi dello stile dal CMS, non i dati italiani grezzi. */
  const description = cms.styleDescriptions?.[style.id] ?? style.description;
  const characteristics = cms.styleChars?.[style.id]
    ? cms.styleChars[style.id].split("|").map((item) => item.trim()).filter(Boolean)
    : style.key_characteristics;
  const noteIds = style.id === "napoletana_stg" ? STG_NOTES : STYLE_NOTES;
  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabelledby="learning-panel-title"
      size="lg"
      scrim="soft"
      surface="solid"
      entry="pop"
      panelClassName="learning-panel"
    >
            <div className="learning-panel__header">
              <div className="learning-panel__intro">
                <p className="learning-panel__eyebrow">
                  <GraduationCap size={16} aria-hidden="true" />
                  <span data-slot="label">{uiMessage("features.recipe.recipe-learning-panel.approfondimento-d68393e7")}</span>
                </p>
                <h2 id="learning-panel-title" className="learning-panel__title">
                  {style.name}
                </h2>
                <p className="learning-panel__subtitle">
                  {familyName} · {formatOrigin(style.origin, placeNameLocalizer(cms))}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="learning-panel__close"
                aria-label={cms.ui.closeInsight}
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="learning-panel__body">
              <p className="learning-panel__description">{description}</p>
              <h3 className="learning-panel__heading">{uiMessage("recipe.learning.characteristics")}</h3>
              <ul className="learning-panel__characteristics">
                {characteristics.slice(0, 6).map((characteristic) => (
                  <li key={characteristic} className="learning-panel__characteristic">
                    {characteristic}
                  </li>
                ))}
              </ul>
              <h3 className="learning-panel__heading">{uiMessage("recipe.learning.science")}</h3>
              <ul className="learning-panel__science">
                {noteIds.map((noteId) => {
                  const title = cms.science?.notes?.[noteId]?.title;
                  return title ? (
                    <li key={noteId} className="learning-panel__science-item">
                      <WhyButton noteId={noteId} label={title} />
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
    </ModalSheet>
  );
}
