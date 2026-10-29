import { X, GraduationCap } from "lucide-react";
import type { PizzaStyle } from "../../domain/pizza-engine";
import { formatOrigin } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { placeNameLocalizer } from "../cms/i18n";
import { ModalSheet } from "../../components/ds/index";
import { uiMessage } from "../../i18n/ui-messages";

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
                  <GraduationCap size={16} />
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
                <X size={17} />
              </button>
            </div>
            <div className="learning-panel__body">
              <p className="learning-panel__description">{description}</p>
              <div className="learning-panel__characteristics">
                {characteristics.slice(0, 6).map((characteristic) => (
                  <div key={characteristic} className="learning-panel__characteristic">
                    {characteristic}
                  </div>
                ))}
              </div>
            </div>
    </ModalSheet>
  );
}
