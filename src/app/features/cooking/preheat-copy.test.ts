import { describe, expect, it } from "vitest";
import { STYLES_DB, generateRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { registerUiMessages, setActiveUiLocale } from "../../i18n/ui-messages";
import { UI_MESSAGES_EN } from "../../i18n/ui-messages.en";
import { isOilPreheat, preheatText, type PreheatPart } from "./preheat-copy";

/* FW-19 (revisione): sul passo «Olio a temperatura» delle fritte la modalità
 * cottura non parla di forno, pietra o platea. */
const P1: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, skill_level: 1, available_hours: 24, meal_deadline: false, dough_balls: 4,
  has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
  dietary_filters: [], kitchen_temp_c: 22, pantry_flours: [], pantry_yeasts: [],
};
const preheatOf = (id: string) => generateRecipe(STYLES_DB[id], P1).timeline.find((s) => s.id === "preheat")!;
const PARTS: PreheatPart[] = ["start", "waiting", "remaining", "ready", "alreadyHot", "hotTitle", "hotBody", "hotConfirm", "hotKeep"];

describe("testi del preriscaldo: forno o olio", () => {
  it.each(["pizza_montanara", "pizza_fritta", "pizza_fritta_tonda"])("%s: il passo è l'olio e i testi non parlano di forno", (id) => {
    const step = preheatOf(id);
    expect(isOilPreheat(step)).toBe(true);
    for (const part of PARTS) {
      const text = preheatText(true, part, ["15:53"]);
      expect(text, part).not.toMatch(/forno|pietra|platea/i);
    }
    expect(preheatText(true, "start")).toMatch(/olio/i);
    expect(preheatText(true, "hotTitle")).toMatch(/olio/i);
  });

  it("anche in inglese l'olio non diventa un forno", () => {
    registerUiMessages("en", UI_MESSAGES_EN);
    setActiveUiLocale("en");
    try {
      expect(preheatText(true, "start")).toMatch(/oil/i);
      for (const part of PARTS) expect(preheatText(true, part, ["15:53"]), part).not.toMatch(/oven|stone/i);
    } finally {
      setActiveUiLocale("it");
    }
  });

  it("gli stili al forno restano sul forno", () => {
    const step = preheatOf("napoletana_stg");
    expect(isOilPreheat(step)).toBe(false);
    expect(preheatText(false, "start")).toBe("Ho acceso il forno");
  });
});
