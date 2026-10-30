import { withBrand } from "../config/brand";

export type UiMessageValues = readonly (string | number)[];

/* Budget D-059 (30/10/2026): nessun catalogo statico, nemmeno l'italiano.
   Il CmsProvider registra quello della lingua attiva (dal bundle, caricato
   da main.tsx prima del primo render); il server (agent/mcp-server.ts) e il
   setup dei test registrano l'italiano da sé. */
const catalogs: Record<string, Record<string, string>> = {};

let activeLocale = "it";

function languageOf(locale: string | undefined): string {
  return locale?.split("-")[0]?.toLowerCase() || "it";
}

/** Register or replace a locale catalog, for example from a lazy CMS bundle. */
export function registerUiMessages(
  locale: string,
  messages: Record<string, string> | undefined,
): void {
  if (!messages) return;
  catalogs[languageOf(locale)] = messages;
}

/** Keep context-free/module-level message consumers aligned with the CMS locale. */
export function setActiveUiLocale(locale: string): void {
  activeLocale = languageOf(locale);
}

export function getActiveUiLocale(): string {
  return activeLocale;
}

/**
 * Resolve a catalog key and interpolate positional `{0}` placeholders, then
 * the brand tokens `{brand}` / `{brandFull}` (see config/brand.ts).
 * Missing translations fall back to Italian when its catalog is registered
 * (every bundle is complete: ui-messages.catalogs.test.ts); a missing source
 * key remains visibly diagnosable and is also rejected statically by the
 * i18n guard.
 */
export function uiMessage(
  key: string,
  values: UiMessageValues = [],
  locale = activeLocale,
): string {
  const language = languageOf(locale);
  const template = catalogs[language]?.[key] ?? catalogs.it?.[key];
  if (template === undefined) return `⟦${key}⟧`;
  return withBrand(
    template.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
      const value = values[Number(index)];
      return value === undefined ? placeholder : String(value);
    }),
  );
}
