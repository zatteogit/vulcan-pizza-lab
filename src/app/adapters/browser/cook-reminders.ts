/* FW-16 (S10-B-03, S10-A-17) — promemoria della pizzata, onesti.
 *
 * Su Chrome Android `new Notification()` lancia «Illegal constructor»: serve
 * `ServiceWorkerRegistration.showNotification`. Su Safari iOS fuori dalla PWA
 * l'API non esiste. Quindi:
 *  - lo stato si legge e si mostra (non supportati / spenti / attivi / bloccati);
 *  - il permesso si chiede solo da un gesto dell'utente («Attiva»);
 *  - la notifica passa dal service worker minimo (/sw.js) quando c'è, e dal
 *    costruttore solo come ripiego (desktop).
 * Anche così i promemoria partono solo finché la pagina è aperta: il testo lo dice. */

export type ReminderStatus = "unsupported" | "off" | "on" | "denied";

const SW_URL = "/sw.js";

export function reminderStatus(): ReminderStatus {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "on";
    if (Notification.permission === "denied") return "denied";
    return "off";
  } catch {
    return "unsupported";
  }
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (!("serviceWorker" in navigator)) return null;
    return (await navigator.serviceWorker.getRegistration(SW_URL)) ?? (await navigator.serviceWorker.register(SW_URL));
  } catch {
    return null;
  }
}

/** Da chiamare dentro un gesto dell'utente: chiede il permesso e prepara il service worker. */
export async function enableReminders(): Promise<ReminderStatus> {
  if (reminderStatus() === "unsupported") return "unsupported";
  try {
    await Notification.requestPermission();
  } catch {
    /* Safari vecchi: API a callback, ignorata */
  }
  const status = reminderStatus();
  if (status === "on") await registration();
  return status;
}

export async function showReminder(title: string, body: string): Promise<boolean> {
  if (reminderStatus() !== "on") return false;
  const options: NotificationOptions = { body, icon: "/favicon.ico", tag: "vulcan-cook" };
  const reg = await registration();
  try {
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/** Accorcia sul confine di parola con «…», senza tagliare a metà (S10-A-17). */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/u, "")}…`;
}
