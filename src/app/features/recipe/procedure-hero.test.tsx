import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProcedureHeroControls } from "./procedure-hero";
import { uiMessage } from "../../i18n/ui-messages";

/* G3-WP-01 — tabella di marcia: pasto attivo derivato dal piano, gruppo con
 * nome, «Inizia ora» come azione distinta, stato vuoto senza pasti e «circa»
 * spiegato a vista. Render statico (Node, senza DOM: vista da 640 px in su). */

const noop = () => {};
const start = new Date(2026, 9, 29, 22, 45);
const end = new Date(2026, 9, 30, 12, 30);
const slot = (id: string, idealStart: Date, isFeasible = true) => ({
  id, label: id, sublabel: "", hours: 14, emoji: "", meal: "lunch" as const, dayOffset: 1,
  targetAt: end.getTime(), idealStart, mealAt: end, isFeasible,
});

function render(overrides: Partial<Parameters<typeof ProcedureHeroControls>[0]> = {}) {
  return renderToStaticMarkup(createElement(ProcedureHeroControls, {
    calendarReference: start, startTime: start, setStartTime: noop, endTime: end, endDisplayTime: end,
    preciseEndTime: false, setPreciseEndTime: noop, totalDurationMin: 825, hasFlexiblePhases: true,
    editingTime: false, setEditingTime: noop, editingEndTime: false, setEditingEndTime: noop,
    handleTimeInput: noop, handleEndTimeInput: noop,
    mealSlots: [slot("tomorrow_lunch", start), slot("tomorrow_dinner", new Date(2026, 9, 30, 6, 15))],
    comfortToggled: false, setComfortToggled: noop, currentComfortPlan: null,
    preComfortStart: { current: null }, setStretch: noop,
    ...overrides,
  }));
}

describe("ProcedureHeroControls (G3-WP-01)", () => {
  it("il pasto che coincide col piano è premuto, nel gruppo con nome", () => {
    const html = render();
    expect(html).toMatch(/role="group" aria-labelledby="[^"]+"/);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
    // Con un pasto attivo la Fine è l'obiettivo: niente «circa».
    expect(html).not.toContain(uiMessage("recipe.schedule.approxHelp"));
    // «Inizia ora» è un pulsante d'azione, non un chip.
    expect(html).toContain("ds-cta--secondary");
  });

  it("con l'orario spostato nessun pasto è attivo e il «circa» è spiegato", () => {
    const html = render({ startTime: new Date(2026, 9, 29, 23, 0) });
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).toContain(uiMessage("recipe.schedule.approxHelp"));
  });

  it("senza pasti raggiungibili il blocco resta con uno stato vuoto e un'azione", () => {
    const html = render({ mealSlots: [slot("tomorrow_lunch", start, false)] });
    expect(html).not.toContain('role="group"');
    expect(html).toContain("ds-empty");
    expect(html).toContain(uiMessage("recipe.schedule.noMealFits"));
  });
});
