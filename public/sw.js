/* FW-16 — service worker minimo per i promemoria della pizzata.
 * Serve solo a mostrare le notifiche (su Chrome Android `new Notification()`
 * non funziona). Nessuna cache e nessun gestore `fetch`: la rete e gli asset
 * restano quelli di sempre. Registrato solo quando l'utente attiva i promemoria. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => "focus" in client);
      return open ? open.focus() : self.clients.openWindow("/");
    }),
  );
});
