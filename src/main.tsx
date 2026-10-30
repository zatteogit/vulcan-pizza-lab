import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { browserStorage, seedEditionOven } from "./app/adapters/browser/edition-defaults";
import { syncBrowserChrome } from "./app/adapters/browser/browser-chrome";
import { bootLocaleId, loadLocaleBundle } from "./app/features/cms/locales/index";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

// Edizione con forno preimpostato (partner, demo): prima del primo render.
seedEditionOven(browserStorage());
// Barra del browser col colore del tema dell'app (Android, Edge, Safari ≤ 18).
syncBrowserChrome();

function render() {
  createRoot(rootEl!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

/* Budget D-059 (30/10/2026): i testi, italiano compreso, sono bundle lazy
   (features/cms/locales). Il primo render aspetta quello della lingua di
   avvio, che lo script in <head> ha già chiesto insieme al chunk d'ingresso
   (localePreloadPlugin in vite.config.ts): fino ad allora resta lo splash di
   index.html, mai una chiave grezza o un testo vuoto. Se la lingua salvata
   non si scarica, si parte in italiano. */
const bootLocale = bootLocaleId();
void loadLocaleBundle(bootLocale)
  .catch(() => (bootLocale === "it" ? undefined : loadLocaleBundle("it")))
  .finally(render);
