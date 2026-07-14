import { UI_MESSAGES_IT } from "./ui-messages.it";

export type UiMessageValues = readonly (string | number)[];

const catalogs: Record<string, Record<string, string>> = {
  it: UI_MESSAGES_IT,
};

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
 * Resolve a catalog key and interpolate positional `{0}` placeholders.
 * Missing translations fall back to Italian; a missing source key remains
 * visibly diagnosable and is also rejected statically by the i18n guard.
 */
export function uiMessage(
  key: string,
  values: UiMessageValues = [],
  locale = activeLocale,
): string {
  const language = languageOf(locale);
  const template = catalogs[language]?.[key] ?? UI_MESSAGES_IT[key];
  if (template === undefined) return `⟦${key}⟧`;
  return template.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
    const value = values[Number(index)];
    return value === undefined ? placeholder : String(value);
  });
}
