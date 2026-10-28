/* FW-08 (D-C): interruttore compatto «Dettagli tecnici» (PizzaNerd) nella
   testata della scheda ricetta e di Crea. Scrive lo stesso stato del Profilo
   (useDetailLevel): accenderlo qui vale anche per le altre schermate. */

import { useId } from "react";
import { Switch } from "../../components/ds/index";
import { useDetailLevel } from "../../hooks/use-detail-level";
import { uiMessage } from "../../i18n/ui-messages";

export function DetailLevelSwitch() {
  const { level, setLevel } = useDetailLevel();
  const id = useId();
  const labelId = `${id}-label`;
  return (
    <p className="detail-level-switch" data-region="detail-level">
      <label id={labelId} htmlFor={`${id}-switch`} className="detail-level-switch__label">
        {uiMessage("detailLevel.toggle")}
      </label>
      <Switch
        id={`${id}-switch`}
        checked={level === "technical"}
        aria-labelledby={labelId}
        onCheckedChange={(on) => setLevel(on ? "technical" : "essential")}
      />
    </p>
  );
}
