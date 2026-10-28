import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { browserStorage, seedEditionOven } from "./app/adapters/browser/edition-defaults";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

// Edizione con forno preimpostato (partner, demo): prima del primo render.
seedEditionOven(browserStorage());

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
