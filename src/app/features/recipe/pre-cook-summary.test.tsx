import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { STYLES_DB, type UserConstraints } from "../../domain/pizza-engine";
import { canonicalRecipe } from "../../use-cases/recipe-entry";
import { buildCookPlan } from "../../use-cases/cook-plan";
import { formatAtClock, formatRelative } from "../../i18n/format";
import { IT_LOCALE } from "../cms/locales/it";
import { engineMsgTexts } from "./engine-msg-text";
import { recipeCardSignals } from "./recipe-card-signals";
import { blockerText } from "./blocker-text";
import { summarizeVerdict } from "../../domain/verdict-summary";
import { PreCookSummary, startBlockedText } from "./pre-cook-summary";

/* G4a-WP-03 (S10-A-20, S10-B-20): il dialog «Prima di iniziare» dice quali
 * condizioni (le stesse della match card), quando si comincia e quando si
 * mangia (il piano), e perché una ricetta non fattibile non parte. */

const cms = IT_LOCALE;
const bcp47 = "it-IT";
// P1: forno di casa a 250 °C, nessuna attrezzatura dichiarata.
const p1: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, available_hours: 48, skill_level: 2, dough_balls: 4,
  has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};
const focaccia = canonicalRecipe(STYLES_DB.focaccia_genovese, p1);
const NOW = new Date(2026, 9, 29, 15, 0).getTime();
const planSteps = (startAt: number) => buildCookPlan(focaccia.timeline, { startAt }).steps.map((s) => ({
  id: s.id, duration_minutes: s.plannedMin, startMs: s.startMs, endMs: s.endMs,
}));
const render = (steps: ReturnType<typeof planSteps>, approximateEnd = true) =>
  renderToStaticMarkup(createElement(PreCookSummary, { recipe: focaccia, steps, approximateEnd, cms, bcp47, now: NOW }));
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'");

describe("PreCookSummary — Focaccia genovese, forno di casa 250 °C", () => {
  it("le condizioni sono le stesse della match card, non ricalcolate", () => {
    const expected = engineMsgTexts(recipeCardSignals(focaccia).map((s) => s.message), cms, bcp47);
    expect(expected.length).toBeGreaterThan(0);
    expect(expected).toContain("Se hai una teglia");
    const html = render(planSteps(NOW + 5 * 60_000));
    expect(html).toContain(cms.cooking.preCookConditionsTitle);
    for (const condition of expected) expect(text(html)).toContain(condition);
    // D-060: niente «Se hai farina».
    expect(text(html)).not.toMatch(/Se hai farina/);
  });

  it("inizio e fine sono il primo e l'ultimo passo del piano", () => {
    const steps = planSteps(NOW + 5 * 60_000);
    const plan = buildCookPlan(focaccia.timeline, { startAt: NOW + 5 * 60_000 });
    expect(steps[0].startMs).toBe(plan.startMs);
    expect(steps[steps.length - 1].endMs).toBe(plan.readyAtMs);
    const html = text(render(steps));
    expect(html).toContain(`Inizi ${formatAtClock(plan.startMs, bcp47, { nowMs: NOW })}`);
    expect(html).toContain(`pronta ${formatAtClock(plan.readyAtMs, bcp47, { approximate: true, nowMs: NOW })}`);
    expect(html).toContain("verso le");
    // Primo passo fra 5 minuti: niente «Il primo passo inizia tra…».
    expect(html).not.toContain("Il primo passo inizia");
  });

  it("con l'orario del pasto fissato la fine è esatta («alle»)", () => {
    const steps = planSteps(NOW + 5 * 60_000);
    expect(text(render(steps, false))).toContain(`pronta ${formatAtClock(steps[steps.length - 1].endMs, bcp47, { nowMs: NOW })}`);
  });

  it("se il primo passo parte fra più di mezz'ora lo dice", () => {
    const start = NOW + (3 * 60 + 1) * 60_000;
    const html = text(render(planSteps(start)));
    expect(html).toContain(`Il primo passo inizia ${formatRelative(start, NOW, bcp47)}.`);
    expect(html).toContain("tra 3 h");
  });

  it("avvisa delle azioni notturne del piano", () => {
    const night = new Date(2026, 9, 30, 2, 0).getTime();
    expect(text(render(planSteps(night)))).toMatch(/di notte con questo piano/);
    // Un inizio che il piano unico dà senza azioni notturne: nessun avviso.
    const day = Array.from({ length: 24 }, (_, h) => new Date(2026, 9, 30, h, 0).getTime())
      .find((start) => buildCookPlan(focaccia.timeline, { startAt: start }).nightActions.length === 0);
    expect(day).toBeDefined();
    expect(text(render(planSteps(day!)))).not.toMatch(/di notte/);
  });

  it("solo elementi semantici, nessuno stile in linea", () => {
    const html = render(planSteps(NOW));
    expect(html).toContain('data-region="pre-cook-summary"');
    expect(html).not.toMatch(/<(div|span)>/);
    expect(html).not.toContain("style=");
  });
});

describe("startBlockedText — ricetta non fattibile", () => {
  it("Napoletana con forno di casa: il motivo è la causa principale del blocco", () => {
    const napoletana = canonicalRecipe(STYLES_DB.napoletana_stg, p1);
    expect(napoletana.verdict.outcome).toBe("not_feasible");
    const primary = summarizeVerdict(napoletana.verdict).primary!;
    expect(primary.kind).toBe("oven_too_cold");
    const reason = startBlockedText(napoletana, cms, bcp47);
    expect(reason).toBe(`Non si può iniziare. ${blockerText(primary, cms, bcp47)}`);
    expect(reason).toMatch(/250\s?°C/);
  });

  it("una ricetta fattibile non ha motivo di blocco", () => {
    expect(startBlockedText(focaccia, cms, bcp47)).toBeNull();
  });
});
