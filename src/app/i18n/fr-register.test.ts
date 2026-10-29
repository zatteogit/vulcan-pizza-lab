import { describe, expect, it } from "vitest";
import { UI_MESSAGES_FR } from "./ui-messages.fr";
import { FR_LOCALE } from "../features/cms/locales/fr";
import { GLOSSARY_TERMS_FR, PRE_FERMENT_FR, SCIENCE_FR, TROUBLESHOOTING_FR } from "../features/cms/locales/domain-fr";

/* FW-09 revisione: il francese si rivolge sempre con «vous». Le stringhe
 * dell'ondata 1 erano passate al «tu» («ta cuisine», «Dis-nous», «tu as»),
 * così nella stessa schermata convivevano i due registri. */

function texts(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => texts(child, path ? `${path}.${key}` : key));
}

// «tienne», «tiens» sono anche il verbo tenir: restano fuori.
const INFORMAL = new Set(["tu", "ton", "ta", "tes", "toi"]);

describe("francese: sempre «vous»", () => {
  it("nessuna stringa usa tu/ton/ta/tes/toi", () => {
    const all = [
      ...texts(UI_MESSAGES_FR, "ui"),
      ...texts(FR_LOCALE, "cms"),
      ...texts({ GLOSSARY_TERMS_FR, PRE_FERMENT_FR, SCIENCE_FR, TROUBLESHOOTING_FR }, "domain"),
    ];
    expect(all.length).toBeGreaterThan(1000);
    const informal = all.filter(([, text]) => text.toLowerCase().split(/[^\p{L}]+/u).some((word) => INFORMAL.has(word)));
    expect(informal.map(([path]) => path)).toEqual([]);
  });
});
