import { describe, expect, it } from "vitest";
import { IT_LOCALE } from "../cms/locales/it";
import { DE_LOCALE } from "../cms/locales/de";
import { EN_LOCALE } from "../cms/locales/en";
import { ES_LOCALE } from "../cms/locales/es";
import { FR_LOCALE } from "../cms/locales/fr";
import { JA_LOCALE } from "../cms/locales/ja";
import { PT_LOCALE } from "../cms/locales/pt";
import source from "./recipe-card-signals.ts?raw";

/* Pill delle card su una riga (nota di Matteo, 29/10/2026). Misurato nel
 * browser: su un telefono da 390 px la colonna dei segnali è larga 146-177 px
 * e al testo restano circa 105 px, cioè ~18 caratteri latini (9 ideogrammi).
 * L'ellissi del CSS è solo una sicurezza per le card più strette (360 px,
 * tablet): i testi devono starci da soli. I segnaposto si riempiono con
 * valori tipici. */
/** Larghezza in «caratteri latini»: un ideogramma o un kana ne vale due. */
const MAX_WIDTH = 18;
const width = (text: string) => [...text].reduce((sum, ch) => sum + (/[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 2 : 1), 0);
const SAMPLE: Record<string, string> = { allergen: "glutine", range: "260–310", yeast: "fresco" };

// Chiavi passate a msg("…") e quelle della tabella dei metodi di cottura (["need.…", "…"]).
const KEYS = [...new Set([...source.matchAll(/(?:msg\(\s*|\[\s*)"((?:card|need|diet|allergen)\.[\w.]+)"/g)].map((m) => m[1]))];

const LOCALES = { it: IT_LOCALE, en: EN_LOCALE, de: DE_LOCALE, fr: FR_LOCALE, es: ES_LOCALE, pt: PT_LOCALE, ja: JA_LOCALE };

describe("pill delle card: testi corti in tutte le lingue", () => {
  it("le chiavi dei segnali sono state trovate", () => {
    expect(KEYS.length).toBeGreaterThan(15);
  });
  for (const [lang, cms] of Object.entries(LOCALES)) {
    it(lang, () => {
      const messages = (cms as { engineMessages?: Record<string, string> }).engineMessages ?? {};
      const tooLong = KEYS.flatMap((key) => {
        const raw = messages[key];
        if (!raw) return [];
        const text = raw.replace(/\{(\w+)\}/g, (_, k: string) => SAMPLE[k] ?? "xxxx");
        return width(text) > MAX_WIDTH ? [`${key}: «${text}» (${width(text)})`] : [];
      });
      expect(tooLong).toEqual([]);
    });
  }
  /* Badge delle ricette iconiche (Scopri): stessa larghezza, testo semibold. */
  const BADGES = ["badgeAvpnRules", "badgeIgpRules", "badgeBonciMethod", "badgeRomanSnack", "badgeRomanBakery"] as const;
  for (const [lang, cms] of Object.entries(LOCALES)) {
    it(`badge delle ricette iconiche · ${lang}`, () => {
      const ui = ((cms as unknown as { ui?: Record<string, string> }).ui) ?? {};
      const tooLong = BADGES.filter((key) => ui[key] && width(ui[key]) > MAX_WIDTH - 1).map((key) => `${key}: «${ui[key]}»`);
      expect(tooLong).toEqual([]);
    });
  }
});
