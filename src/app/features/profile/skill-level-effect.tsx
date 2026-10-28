/* FW-08 (S15-A-02/B-02): che cosa cambia scegliendo il livello di esperienza.
   I tetti d'idratazione vengono dal motore (hydrationCeilingForSkill), mai
   scritti nel testo; la nota dichiara che è una scelta di Vulcan. */

import { hydrationCeilingForSkill, type SkillLevel } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { uiMessage } from "../../i18n/ui-messages";

/* Chiavi letterali: il guard i18n le riconosce solo così. */
function effectText(level: SkillLevel, ceiling: string): string {
  switch (level) {
    case 1: return uiMessage("profile.skillEffect.1", [ceiling]);
    case 2: return uiMessage("profile.skillEffect.2", [ceiling]);
    case 3: return uiMessage("profile.skillEffect.3", [ceiling]);
    default: return uiMessage("profile.skillEffect.4");
  }
}

export function SkillLevelEffect({ level }: { level: SkillLevel }) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const ceiling = hydrationCeilingForSkill(level);
  const effect = effectText(level, ceiling === null ? "" : fmt.percent(ceiling));
  return (
    <aside className="skill-level-effect" data-region="skill-effect" aria-live="polite">
      <p className="type-body-sm skill-level-effect__text">{effect}</p>
      <p className="type-data-xs skill-level-effect__note">{uiMessage("profile.skillEffect.note")}</p>
    </aside>
  );
}
