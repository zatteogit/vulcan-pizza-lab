import { beforeAll, describe, expect, it } from "vitest";
import {
  MICRO_DOSE_GRAMS,
  formatAtClock,
  formatClock,
  formatDuration,
  formatMass,
  formatNumber,
  formatPercent,
  formatRange,
  formatRelative,
  formatTemp,
  isMicroDose,
} from "./format";
import { registerUiMessages } from "./ui-messages";
import { UI_MESSAGES_EN } from "./ui-messages.en";
import { UI_MESSAGES_FR } from "./ui-messages.fr";
import { UI_MESSAGES_ES } from "./ui-messages.es";
import { UI_MESSAGES_PT } from "./ui-messages.pt";
import { UI_MESSAGES_JA } from "./ui-messages.ja";

/* FW-11: un solo formato, preso dalla lingua; niente preposizioni nel codice. */

const NBSP = /[  ]/g;
const plain = (text: string) => text.replace(NBSP, " ");

beforeAll(() => {
  registerUiMessages("en", UI_MESSAGES_EN);
  registerUiMessages("fr", UI_MESSAGES_FR);
  registerUiMessages("es", UI_MESSAGES_ES);
  registerUiMessages("pt", UI_MESSAGES_PT);
  registerUiMessages("ja", UI_MESSAGES_JA);
});

describe("numeri e intervalli", () => {
  it("virgola decimale in italiano, punto in inglese", () => {
    expect(formatNumber(0.62, "it-IT", { maximumFractionDigits: 2 })).toBe("0,62");
    expect(formatNumber(0.62, "en-GB", { maximumFractionDigits: 2 })).toBe("0.62");
  });

  it("intervallo con trattino tipografico e unità una volta sola", () => {
    expect(plain(formatRange(6, 14, "it-IT", { unit: "hour" }))).toBe("6–14 h");
    expect(formatRange(0.55, 0.7, "it-IT", { maximumFractionDigits: 2 })).toBe("0,55–0,7");
    expect(plain(formatRange(12, 12, "it-IT", { unit: "hour" }))).toBe("12 h");
  });

  it("percentuale con la spaziatura della lingua", () => {
    expect(plain(formatPercent(12, "it-IT"))).toBe("12%");
    expect(plain(formatPercent(12, "de-DE"))).toBe("12 %");
  });
});

describe("durate", () => {
  it("un solo formato con ore e minuti, senza perdere i minuti oltre le 24 h", () => {
    expect(plain(formatDuration(576, "it-IT"))).toBe("9 h 36 min");
    expect(plain(formatDuration(1728, "it-IT"))).toBe("28 h 48 min");
    expect(plain(formatDuration(1728, "it-IT", { days: true }))).toBe("1 giorno 4 h 48 min");
    expect(plain(formatDuration(35, "it-IT"))).toBe("35 min");
    expect(plain(formatDuration(0.5, "it-IT", { seconds: true }))).toBe("30 s");
  });
});

describe("tempi relativi", () => {
  const now = Date.UTC(2026, 9, 28, 10, 0);
  const later = now + (8 * 60 + 26) * 60_000;

  it("la preposizione viene dal catalogo di ogni lingua", () => {
    expect(plain(formatRelative(later, now, "it-IT"))).toBe("tra 8 h 26 min");
    expect(plain(formatRelative(later, now, "fr-FR"))).toBe("dans 8 h 26 min");
    expect(plain(formatRelative(later, now, "es-ES"))).toBe("en 8 h 26 min");
    expect(plain(formatRelative(later, now, "pt-PT"))).toBe("em 8 h 26 min");
    expect(plain(formatRelative(later, now, "ja-JP"))).toMatch(/^8\s?時間 26\s?分後$/);
  });

  it("scaduto: «ora» nella lingua", () => {
    expect(formatRelative(now - 1000, now, "it-IT")).toBe("ora");
    expect(formatRelative(now - 1000, now, "en-GB")).toBe("now");
  });
});

describe("orari", () => {
  const at = new Date(2026, 9, 28, 20, 53).getTime();

  it("il «circa» è una chiave e arrotonda ai 15 minuti", () => {
    expect(formatClock(at, "it-IT")).toBe("20:53");
    expect(formatClock(at, "it-IT", { approximate: true })).toBe("ca. 21:00");
    expect(formatClock(at, "en-GB", { approximate: true })).toBe("approx. 21:00");
  });

  it("«alle» / «verso le» nella lingua", () => {
    expect(formatAtClock(at, "it-IT")).toBe("alle 20:53");
    expect(formatAtClock(at, "it-IT", { approximate: true })).toBe("verso le 21:00");
    expect(formatAtClock(at, "fr-FR", { approximate: true })).toBe("vers 21:00");
  });

  it("un orario di un altro giorno porta il giorno della settimana", () => {
    const tomorrow = at + 86_400_000;
    expect(formatClock(tomorrow, "it-IT", { nowMs: at })).not.toBe(formatClock(tomorrow, "it-IT"));
    /* Il giorno sta davanti alla frase, non fra preposizione e ora. */
    expect(formatAtClock(tomorrow, "it-IT", { approximate: true, nowMs: at })).toBe("gio verso le 21:00");
    expect(formatAtClock(tomorrow, "en-GB", { approximate: true, nowMs: at })).toBe("Thu around 21:00");
    expect(formatClock(tomorrow, "it-IT", { approximate: true, nowMs: at })).toBe("gio ca. 21:00");
  });
});

describe("unità e microdosi (D-J, S17-A-01)", () => {
  it("spazio fra numero e unità", () => {
    expect(plain(formatTemp(250, "it-IT"))).toBe("250 °C");
    expect(plain(formatMass(387, "it-IT"))).toBe("387 g");
    expect(plain(formatTemp(250, "en-US", "imperial"))).toMatch(/^482\s?°F$/);
  });

  it("sotto la soglia le dosi restano in grammi anche nell'imperiale", () => {
    expect(MICRO_DOSE_GRAMS).toBe(10);
    expect(isMicroDose(0.5)).toBe(true);
    expect(plain(formatMass(0.5, "en-US", "imperial"))).toBe("0.5 g");
    expect(plain(formatMass(3, "en-US", "imperial"))).toBe("3 g");
    expect(plain(formatMass(30, "en-US", "imperial"))).toBe("1.1 oz");
    expect(plain(formatMass(600, "en-US", "imperial"))).toBe("1 lb 5.2 oz");
  });

  it("una microdose esplicita resta in grammi anche sopra soglia", () => {
    expect(plain(formatMass(12, "en-US", "imperial", { microDose: true }))).toBe("12 g");
  });
});
