import { useEffect, useId, useRef, useState } from "react";
import { Monitor } from "lucide-react";
import { Switch } from "../../components/ds/index";
import { createScreenWakeLock, type ScreenLockState } from "../../adapters/browser/screen-wake-lock";
import { uiMessage } from "../../i18n/ui-messages";

const PREFERENCE_KEY = "vulcan_keep_screen_awake";
export function KeepScreenAwake() {
  const labelId = useId();
  const statusId = useId();
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem(PREFERENCE_KEY) !== "false"; } catch { return true; } });
  const [state, setState] = useState<ScreenLockState>(() => typeof navigator.wakeLock?.request !== "function" ? "unsupported" : enabled ? "requesting" : "off");
  const controller = useRef<ReturnType<typeof createScreenWakeLock> | null>(null);
  useEffect(() => {
    const next = createScreenWakeLock(setState); controller.current = next;
    return () => { controller.current = null; next.dispose(); };
  }, []);
  useEffect(() => { controller.current?.setEnabled(enabled); }, [enabled]);
  const status = {
    off: uiMessage("cooking.screen.off"), requesting: uiMessage("cooking.screen.requesting"),
    active: uiMessage("cooking.screen.active"), paused: uiMessage("cooking.screen.paused"),
    released: uiMessage("cooking.screen.released"), denied: uiMessage("cooking.screen.denied"),
    unsupported: uiMessage("cooking.screen.unsupported"),
  };
  return <section className="cooking-screen">
    {state === "unsupported" ? <p className="cooking-screen__status">{uiMessage("cooking.screen.unsupported")}</p> : <>
      <label id={labelId} className="cooking-screen__label" htmlFor={`${labelId}-switch`}>
        <Monitor size={17} aria-hidden="true" />{uiMessage("cooking.screen.label")}
      </label>
      <Switch id={`${labelId}-switch`} checked={enabled} aria-labelledby={labelId} aria-describedby={statusId}
        onCheckedChange={value => { setEnabled(value); try { localStorage.setItem(PREFERENCE_KEY, String(value)); } catch { /* memory only */ } }} />
      <div className="cooking-screen__detail">
        <p id={statusId} role="status" className="cooking-screen__status">{status[state]}</p>
        {(state === "denied" || state === "released") && <button type="button" className="cooking-screen__retry"
          onClick={() => controller.current?.retry()}>{uiMessage("cooking.screen.retry")}</button>}
      </div>
    </>}
  </section>;
}
