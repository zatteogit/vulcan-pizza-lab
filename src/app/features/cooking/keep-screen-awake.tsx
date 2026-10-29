/* G4a-WP-02 (S10-B-14, S10-A-18): lo schermo acceso è un'impostazione, non
 * un contenuto del passo. Un solo controller (useKeepScreenAwake) alimenta il
 * bottone nell'header e, solo quando c'è qualcosa da fare, una riga d'avviso. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor } from "lucide-react";
import { IconButton } from "../../components/ds/index";
import { createScreenWakeLock, type ScreenLockState } from "../../adapters/browser/screen-wake-lock";
import { uiMessage } from "../../i18n/ui-messages";

const PREFERENCE_KEY = "vulcan_keep_screen_awake";

export interface KeepScreenAwakeControl {
  enabled: boolean;
  state: ScreenLockState;
  toggle: () => void;
  retry: () => void;
}

/** `active` falso (pizzata finita) rilascia lo schermo senza cambiare la preferenza. */
export function useKeepScreenAwake(active = true): KeepScreenAwakeControl {
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem(PREFERENCE_KEY) !== "false"; } catch { return true; } });
  const [state, setState] = useState<ScreenLockState>(() => typeof navigator.wakeLock?.request !== "function" ? "unsupported" : enabled ? "requesting" : "off");
  const controller = useRef<ReturnType<typeof createScreenWakeLock> | null>(null);
  useEffect(() => {
    const next = createScreenWakeLock(setState); controller.current = next;
    return () => { controller.current = null; next.dispose(); };
  }, []);
  useEffect(() => { controller.current?.setEnabled(enabled && active); }, [enabled, active]);
  const toggle = useCallback(() => setEnabled((value) => {
    try { localStorage.setItem(PREFERENCE_KEY, String(!value)); } catch { /* memory only */ }
    return !value;
  }), []);
  const retry = useCallback(() => controller.current?.retry(), []);
  return { enabled, state, toggle, retry };
}

/** Bottone dell'header: acceso / spento. Dove l'API non c'è non compare. */
export function KeepScreenAwakeToggle({ control }: { control: KeepScreenAwakeControl }) {
  if (control.state === "unsupported") return null;
  return (
    <IconButton variant="bare" radius="lg" className="cooking-mode-header__action" aria-pressed={control.enabled}
      aria-label={uiMessage("cooking.screen.label")} onClick={control.toggle}>
      <Monitor size={18} aria-hidden="true" />
    </IconButton>
  );
}

/** Una riga solo se lo schermo non resta acceso come chiesto. */
export function KeepScreenAwakeNotice({ control }: { control: KeepScreenAwakeControl }) {
  const { state, enabled } = control;
  const problem = state === "unsupported" || (enabled && (state === "denied" || state === "released"));
  if (!problem) return null;
  return (
    <p role="status" className="cooking-screen">
      {uiMessage(state === "unsupported" ? "cooking.screen.unsupported" : state === "denied" ? "cooking.screen.denied" : "cooking.screen.released")}
      {state !== "unsupported" && (
        <button type="button" className="cooking-screen__retry" onClick={control.retry}>{uiMessage("cooking.screen.retry")}</button>
      )}
    </p>
  );
}
