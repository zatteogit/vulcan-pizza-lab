/* FW-16 (S10-B-03, S10-A-17) — riga «Promemoria» della modalità cucina:
 * dice se le notifiche arriveranno e chiede il permesso solo con un gesto. */
import { BellRing } from "lucide-react";
import { useState } from "react";
import { enableReminders, reminderStatus, type ReminderStatus } from "../../adapters/browser/cook-reminders";
import { uiMessage } from "../../i18n/ui-messages";

function statusText(status: ReminderStatus): string {
  if (status === "on") return uiMessage("cooking.reminders.on");
  if (status === "denied") return uiMessage("cooking.reminders.denied");
  if (status === "off") return uiMessage("cooking.reminders.off");
  return uiMessage("cooking.reminders.unsupported");
}

export function CookRemindersRow() {
  const [status, setStatus] = useState<ReminderStatus>(reminderStatus);
  return (
    <section className="cooking-reminders" data-region="cook-reminders" data-status={status} aria-live="polite">
      <p className="cooking-reminders__label">
        <BellRing size={16} aria-hidden="true" />
        {uiMessage("cooking.reminders.label")}
      </p>
      {status === "off" && (
        <button
          type="button"
          className="cooking-reminders__enable"
          onClick={async () => setStatus(await enableReminders())}
        >
          {uiMessage("cooking.reminders.enable")}
        </button>
      )}
      <p className="cooking-reminders__status">{statusText(status)}</p>
    </section>
  );
}
