import { getActiveUiLocale } from "../../i18n/ui-messages";
import type { ToppingTranslation } from "./types";

/* ═══ Testi dei condimenti per lingua (budget D-059, 31/10/2026) ═══
 * topping-library.ts tiene struttura, dosi e nomi; i testi (descrizioni,
 * varianti, note, passi, consigli) stanno nei cataloghi per lingua,
 * italiano compreso (topping-i18n/<lingua>.ts), caricati con il bundle della
 * lingua. Qui si registrano, come il catalogo uiMessage: il CmsProvider
 * registra quello della lingua attiva, il server (agent/mcp-server.ts) e il
 * setup dei test l'italiano. La libreria legge da qui con getter al posto
 * dei segnaposto T / TIP, quindi motore, MCP e voce non cambiano. */

/** Segnaposto di un testo che sta nel catalogo della lingua. Visibile se
 *  arrivasse a schermo senza catalogo (come le chiavi grezze ⟦…⟧). */
export const T = "⟦topping⟧";
/** Segnaposto del consiglio di un passo (tip_beginner / tip_nerd). */
export const TIP: { beginner: string; nerd: string } = { beginner: T, nerd: T };

const catalogs: Record<string, ToppingTranslation> = {};

function languageOf(locale: string): string {
  return locale.split("-")[0]?.toLowerCase() || "it";
}

/** Registra (o sostituisce) i testi dei condimenti di una lingua. */
export function registerToppingTexts(locale: string, texts: ToppingTranslation | undefined): void {
  if (!texts) return;
  catalogs[languageOf(locale)] = texts;
}

/** Un testo nella lingua attiva dell'interfaccia, altrimenti in italiano
 *  (ogni catalogo è completo: topping-i18n.test.ts), altrimenti vuoto. */
export function toppingText(read: (texts: ToppingTranslation) => string | undefined): string {
  const active = catalogs[getActiveUiLocale()];
  return (active && read(active)) ?? (catalogs.it && read(catalogs.it)) ?? "";
}
