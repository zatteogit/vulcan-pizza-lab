import { describe, expect, it } from "vitest";
import { UI_MESSAGES_IT } from "./ui-messages.it";
import { EN_LOCALE } from "../features/cms/locales/en";
import { DE_LOCALE } from "../features/cms/locales/de";
import { ES_LOCALE } from "../features/cms/locales/es";
import { FR_LOCALE } from "../features/cms/locales/fr";
import { PT_LOCALE } from "../features/cms/locales/pt";
import { JA_LOCALE } from "../features/cms/locales/ja";

/* I18N-1: ogni lingua ha il catalogo uiMessage completo, con gli stessi
   segnaposto dell'italiano. Una chiave nuova senza traduzione fa fallire. */

const placeholders = (text: string) => (text.match(/\{[^{}]+\}/g) ?? []).sort();

const LOCALES = { en: EN_LOCALE, de: DE_LOCALE, es: ES_LOCALE, fr: FR_LOCALE, pt: PT_LOCALE, ja: JA_LOCALE };

describe("cataloghi uiMessage per lingua (I18N-1)", () => {
  for (const [lang, bundle] of Object.entries(LOCALES)) {
    it(`${lang}: stesse chiavi e stessi segnaposto dell'italiano`, () => {
      const messages = bundle.messages ?? {};
      expect(Object.keys(messages).sort()).toEqual(Object.keys(UI_MESSAGES_IT).sort());
      for (const [key, italian] of Object.entries(UI_MESSAGES_IT)) {
        expect(messages[key]?.trim().length, `${lang} ${key} vuota`).toBeGreaterThan(0);
        expect(placeholders(messages[key]), `${lang} ${key}`).toEqual(placeholders(italian));
      }
    });
  }
});

describe("problemi del troubleshooting tradotti (I18N-1)", () => {
  it("ogni problema del catalogo ha il testo in ogni lingua", async () => {
    const { ISSUES_DB } = await import("../data/troubleshooting-data");
    for (const [lang, bundle] of Object.entries(LOCALES)) {
      const issues = (bundle as { troubleshootingI18n?: { issues?: Record<string, unknown> } }).troubleshootingI18n?.issues ?? {};
      const missing = ISSUES_DB.map((issue) => issue.id).filter((id) => !issues[id]);
      expect(missing, lang).toEqual([]);
    }
  });
});

describe("passi del motore tradotti (I18N-2)", () => {
  it("ogni chiave timeline.* emessa dal motore esiste in ogni lingua", async () => {
    const engine = Object.values(
      import.meta.glob("/src/app/domain/pizza-engine.ts", { query: "?raw", import: "default", eager: true }),
    )[0] as string;
    const keys = [...engine.matchAll(/em\(\s*"(timeline\.[\w.]+)"/g)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(50);
    for (const [lang, bundle] of Object.entries(LOCALES)) {
      const missing = [...new Set(keys)].filter((key) => !bundle.engineMessages?.[key]);
      expect(missing, lang).toEqual([]);
    }
  });
});
