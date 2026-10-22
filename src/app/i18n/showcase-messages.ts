import { withBrand } from "../config/brand";
import { getActiveUiLocale, type UiMessageValues } from "./ui-messages";
import { SHOWCASE_MESSAGES_IT } from "./showcase-messages.it";

const catalogs: Record<string, Record<string, string>> = {
  it: SHOWCASE_MESSAGES_IT,
};

function languageOf(locale: string | undefined): string {
  return locale?.split("-")[0]?.toLowerCase() || "it";
}

/** Lazy showcase bundles can register translated spec-sheet copy here. */
export function registerShowcaseMessages(
  locale: string,
  messages: Record<string, string> | undefined,
): void {
  if (!messages) return;
  catalogs[languageOf(locale)] = messages;
}

/** Like uiMessage: positional `{0}` placeholders, then `{brand}` / `{brandFull}`. */
export function showcaseMessage(
  key: string,
  values: UiMessageValues = [],
  locale = getActiveUiLocale(),
): string {
  const language = languageOf(locale);
  const template = catalogs[language]?.[key] ?? SHOWCASE_MESSAGES_IT[key];
  if (template === undefined) return `⟦${key}⟧`;
  return withBrand(
    template.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
      const value = values[Number(index)];
      return value === undefined ? placeholder : String(value);
    }),
  );
}
