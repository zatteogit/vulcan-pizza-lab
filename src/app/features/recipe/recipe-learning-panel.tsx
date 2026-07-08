import { X, GraduationCap } from "lucide-react";
import type { PizzaStyle } from "../../domain/pizza-engine";
import { formatOrigin } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { ModalSheet } from "../../components/ds/index";

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
                  <span data-slot="label">Approfondimento</span>
                </p>
                <h2 id="learning-panel-title" className="learning-panel__title">
                  {style.name}
                </h2>
                <p className="learning-panel__subtitle">
                  {familyName} · {formatOrigin(style.origin)}
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
              <p className="learning-panel__description">{style.description}</p>
              <div className="learning-panel__characteristics">
                {style.key_characteristics.slice(0, 6).map((characteristic) => (
                  <div key={characteristic} className="learning-panel__characteristic">
                    {characteristic}
                  </div>
                ))}
              </div>
            </div>
    </ModalSheet>
  );
}
