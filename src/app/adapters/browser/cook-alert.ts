/* G4a-WP-02 (S10-B-04) — segnale di fine fase: vibrazione e un breve tono.
 *
 * Con le mani in pasta o davanti al forno lo schermo non si guarda: alla fine
 * di un'attesa, di un passo cronometrato o di una cottura arriva un segnale.
 * Nessun file audio: un oscillatore di Web Audio. Tutto è facoltativo (iOS non
 * vibra, alcuni browser non hanno AudioContext) e niente lancia eccezioni.
 * Funziona solo finché la pagina è aperta: il testo dei promemoria lo dice. */

export type CookAlertKind = "start" | "end" | "turn";

/** D-G4a-3: suono e vibrazione attivi per default, con interruttore nell'header. */
export const DEFAULT_COOK_ALERTS = true;
const PREFERENCE_KEY = "vulcan_cook_alerts";

/** Frequenze (Hz) dei bip, uno dopo l'altro: la fine ne ha tre, «gira» due. */
const TONES: Record<CookAlertKind, number[]> = {
  start: [660],
  turn: [880, 880],
  end: [880, 660, 880],
};
/** Ogni bip dura BEEP_S secondi, poi una pausa di GAP_S; la vibrazione segue lo stesso ritmo. */
const BEEP_S = 0.18;
const GAP_S = 0.09;

export function readCookAlerts(): boolean {
  try {
    const value = localStorage.getItem(PREFERENCE_KEY);
    return value === null ? DEFAULT_COOK_ALERTS : value === "true";
  } catch {
    return DEFAULT_COOK_ALERTS;
  }
}

export function writeCookAlerts(on: boolean): void {
  try {
    localStorage.setItem(PREFERENCE_KEY, String(on));
  } catch {
    /* solo in memoria */
  }
}

export interface CookAlertEnv {
  vibrate?: (pattern: number[]) => boolean;
  AudioContext?: new () => AudioContext;
}

const browserEnv = (): CookAlertEnv => ({
  vibrate: typeof navigator !== "undefined" && navigator.vibrate ? (pattern) => navigator.vibrate(pattern) : undefined,
  AudioContext: typeof AudioContext !== "undefined" ? AudioContext : undefined,
});

export function createCookAlert(options: { sound: boolean; vibrate: boolean }, env: CookAlertEnv = browserEnv()) {
  let ctx: AudioContext | undefined;
  /* Creato e ripreso al primo uso; Safari lo sblocca solo dentro un gesto (prime). */
  const audio = () => {
    try {
      if (options.sound && env.AudioContext) {
        ctx ??= new env.AudioContext();
        if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      }
    } catch {
      /* audio non disponibile */
    }
    return ctx;
  };
  return {
    prime: audio,
    signal(kind: CookAlertKind): void {
      const tones = TONES[kind];
      try {
        if (options.vibrate) env.vibrate?.(tones.flatMap(() => [BEEP_S * 1000, GAP_S * 1000]).slice(0, -1));
        const c = audio();
        if (!c) return;
        tones.forEach((freq, i) => {
          const at = c.currentTime + i * (BEEP_S + GAP_S);
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.25, at);
          gain.gain.exponentialRampToValueAtTime(0.001, at + BEEP_S);
          osc.connect(gain).connect(c.destination);
          osc.start(at);
          osc.stop(at + BEEP_S);
        });
      } catch {
        /* vibrazione o audio non permessi: il segnale resta visivo */
      }
    },
  };
}
