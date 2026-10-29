import { beforeAll, describe, expect, it } from "vitest";
import { registerUiMessages } from "../../i18n/ui-messages";
import { UI_MESSAGES_EN } from "../../i18n/ui-messages.en";
import { generateTimeSlots, NO_PREFERENCE_SLOT, type EngineMsg } from "../../domain/pizza-engine";
import { CMS_DEFAULTS } from "../cms/cms-context";
import { EN_LOCALE } from "../cms/locales/en";
import { DE_LOCALE } from "../cms/locales/de";
import { engineMsgTexts } from "./engine-msg-text";
import { timeSlotText, timeSlotWhen } from "./time-slot-text";

/* Giovedì 22/10/2026 alle 16:20: «Stasera» è fra 3 h 40 min, al quarto d'ora
   per difetto 3 h 30 min; il quarto slot cade di sabato. */
const NOW = new Date(2026, 9, 22, 16, 20);

const em = (key: string, fallback: string, params: EngineMsg["params"]): EngineMsg => ({ key, fallback, params });

describe("timeSlotText (M-2)", () => {
  const slots = generateTimeSlots(NOW);

  it("sottotitolo dinamico al quarto d'ora, non il testo fisso «4-6 ore»", () => {
    const tonight = slots.find((slot) => slot.id === "tonight")!;
    expect(timeSlotText(tonight, CMS_DEFAULTS, "it-IT", NOW)).toEqual({
      label: "Stasera",
      sublabel: "3 h 30 min",
    });
    expect(timeSlotText(tonight, EN_LOCALE, "en-GB", NOW).label).toBe("Tonight");
  });

  it("i giorni oltre domani sono nella lingua attiva", () => {
    const dayAfter = slots.find((slot) => slot.id === "day_after_lunch")!;
    expect(timeSlotText(dayAfter, CMS_DEFAULTS, "it-IT", NOW).label).toBe("Sabato a pranzo");
    expect(timeSlotText(dayAfter, EN_LOCALE, "en-GB", NOW).label).toBe("Saturday lunch");
    expect(timeSlotText(dayAfter, DE_LOCALE, "de-DE", NOW).label).toBe("Samstag mittags");
  });

  it("«Nessuna preferenza» passa dal CMS", () => {
    expect(timeSlotText(NO_PREFERENCE_SLOT, EN_LOCALE, "en-GB", NOW).label).toBe("No preference");
  });
});

describe("engineMsgTexts (M-5)", () => {
  const compensated = em("opt.hydrationOvenCompensated", "", { h: 63.7, base: 55, delta: 8.7 });

  it("decimali con la virgola in italiano e col punto in inglese", () => {
    expect(engineMsgTexts([compensated], CMS_DEFAULTS, "it-IT")[0]).toContain("63,7%");
    expect(engineMsgTexts([compensated], EN_LOCALE, "en-GB")[0]).toContain("63.7%");
  });

  it("le ore diventano durate e un parametro ripetuto si sostituisce ovunque", () => {
    const below = em("gen.timeBelowStyleWindow", "", { available: 3.75, fMin: 24 });
    const text = engineMsgTexts([below], CMS_DEFAULTS, "it-IT")[0];
    expect(text).toContain("Con 3 h 45 min");
    expect(text).not.toContain("{fMin}");
    expect(text.match(/24 h/g)).toHaveLength(2);
  });

  it("le temperature hanno l'unità una sola volta; {min} è una temperatura solo dove serve", () => {
    const cold = em("rec.ovenTooCold", "", { temp: 250, min: 400 });
    expect(engineMsgTexts([cold], CMS_DEFAULTS, "it-IT")[0]).toMatch(/250\s?°C < min 400\s?°C$/);
    const range = em("opt.hydrationOutOfStyleRange", "", { min: 58, max: 65 });
    expect(engineMsgTexts([range], CMS_DEFAULTS, "it-IT")[0]).toContain("(58–65%)");
  });

  it("le motivazioni dell'ottimizzatore non restano in italiano", () => {
    const room = em("opt.roomFerment", "Fermentazione…", { hours: 8, temp: 22 });
    expect(engineMsgTexts([room], EN_LOCALE, "en-GB")[0]).toMatch(/^8 hrs fermentation at room temperature \(22\s?°C\)/);
  });
});

describe("timeSlotWhen (S05-A-07)", () => {
  /* P1 alle 15:15: «Stasera» è alle 20:00, fra 4 h 45 min. */
  const at1515 = new Date(2026, 9, 22, 15, 15);
  const tonight = generateTimeSlots(at1515).find((slot) => slot.id === "tonight")!;
  beforeAll(() => registerUiMessages("en", UI_MESSAGES_EN));

  it("dice a che ora si mangia e fra quanto, nella lingua attiva", () => {
    const plain = (text: string) => text.replace(/\u00a0/g, " ");
    expect(plain(timeSlotWhen(tonight, CMS_DEFAULTS, "it-IT"))).toBe("alle 20:00 · tra 4 h 45 min");
    expect(plain(timeSlotWhen(tonight, EN_LOCALE, "en-GB"))).toMatch(/^at 20:00 · in 4 hrs? 45 mins?$/);
    // Si va a capo solo attorno al «·».
    expect(timeSlotWhen(tonight, CMS_DEFAULTS, "it-IT").split(" ")).toHaveLength(3);
  });

  it("senza istante del pasto resta la sola durata", () => {
    expect(timeSlotWhen(NO_PREFERENCE_SLOT, CMS_DEFAULTS, "it-IT")).toBe(CMS_DEFAULTS.ui.slotNoPreferenceSub);
  });
});
