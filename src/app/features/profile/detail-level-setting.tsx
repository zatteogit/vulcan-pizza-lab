/* FW-08 (D-C, S16-B-14, S17-A-07/B-13): «Mostra i dettagli tecnici»
   (PizzaNerd) nel Profilo, accanto al livello di esperienza: dice che cosa
   mostra e come si distingue dal livello. Scrive lo stesso stato
   dell'interruttore nella testata della ricetta (useDetailLevel). */

import { useId } from "react";
import { Beaker } from "lucide-react";
import { Switch } from "../../components/ds/index";
import { useDetailLevel } from "../../hooks/use-detail-level";
import { uiMessage } from "../../i18n/ui-messages";

export function DetailLevelSetting() {
  const { level, setLevel } = useDetailLevel();
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  return (
    <section className="detail-level-setting" data-region="detail-level" aria-labelledby={titleId}>
      <header className="detail-level-setting__head">
        <Beaker size={17} aria-hidden="true" className="detail-level-setting__icon" />
        <label id={titleId} htmlFor={`${id}-switch`} className="type-body-sm detail-level-setting__title">
          {uiMessage("detailLevel.settingTitle")}
        </label>
        <Switch
          id={`${id}-switch`}
          checked={level === "technical"}
          aria-labelledby={titleId}
          aria-describedby={descId}
          onCheckedChange={(on) => setLevel(on ? "technical" : "essential")}
        />
      </header>
      <p id={descId} className="type-data-xs detail-level-setting__desc">
        {uiMessage("detailLevel.settingDesc")}
      </p>
      <p className="type-data-xs detail-level-setting__relation">
        {uiMessage("detailLevel.relation")}
      </p>
    </section>
  );
}

/** FW-08 (S15-B-11): la stessa proposta nell'onboarding, a chi sceglie
 *  Esperto. Stato locale: si salva con il resto delle risposte. */
export function DetailLevelOffer({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (on: boolean) => void;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  return (
    <section className="detail-level-setting detail-level-setting--offer" data-region="detail-level" aria-labelledby={titleId}>
      <header className="detail-level-setting__head">
        <Beaker size={17} aria-hidden="true" className="detail-level-setting__icon" />
        <label id={titleId} htmlFor={`${id}-switch`} className="type-body-sm detail-level-setting__title">
          {uiMessage("detailLevel.settingTitle")}
        </label>
        <Switch
          id={`${id}-switch`}
          checked={checked}
          aria-labelledby={titleId}
          aria-describedby={descId}
          onCheckedChange={onCheckedChange}
        />
      </header>
      <p id={descId} className="type-data-xs detail-level-setting__desc">
        {uiMessage("detailLevel.settingDesc")}
      </p>
    </section>
  );
}
