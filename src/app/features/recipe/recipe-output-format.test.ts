import { describe, expect, it } from "vitest";
import { localizeStep, flourStrength, displayStepTime, addMinutes, fmtDuration, startForDeadline, roundToQuarter, readyTimeForDisplay, dayOffset, yeastPracticalHint, getParametricTip, bakeSecondsPerRound, yeastBakerPctText } from "./recipe-output-format";
import { generateRecipe, STYLES_DB, type UserConstraints } from "../../domain/pizza-engine";
import { CMS_DEFAULTS } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { engineMsgTexts } from "./engine-msg-text";

describe("fine stimata: precisione del riepilogo", () => {
  it("mostra 12:31 come circa 12:30 senza cambiare l'istante del programma", () => {
    const exact = new Date(2026, 9, 26, 12, 31, 49);
    const original = exact.getTime();
    const displayed = readyTimeForDisplay(exact, true);
    expect([displayed.getHours(), displayed.getMinutes(), displayed.getSeconds()]).toEqual([12, 30, 0]);
    expect(exact.getTime()).toBe(original);
  });

  it("aggiorna anche il giorno quando la stima arrotonda oltre mezzanotte", () => {
    const exact = new Date(2026, 9, 26, 23, 59);
    const displayed = readyTimeForDisplay(exact, true);
    expect([displayed.getHours(), displayed.getMinutes()]).toEqual([0, 0]);
    expect(dayOffset(exact, displayed)).toBe(1);
    expect(readyTimeForDisplay(new Date(2026, 9, 26, 12, 38), true).getMinutes()).toBe(45);
  });

  it("mantiene i minuti scelti dall'utente e gli orari senza fasi flessibili", () => {
    const target = new Date(2026, 9, 26, 12, 31);
    expect(readyTimeForDisplay(target, false)).toBe(target);
    expect(addMinutes(startForDeadline(target, 368, new Date(2026, 9, 26, 0)), 368)).toEqual(target);
  });
});
/* FW-19: defaultMealStart è in use-cases/cook-plan.ts (test in cook-plan.test.ts). */
describe("flourStrength (audit totale n. 11, B-24)", () => {
  it("una sola scala: W 300 è forte ovunque", () => {
    expect(flourStrength(180)).toBe("weak");
    expect(flourStrength(250)).toBe("medium");
    expect(flourStrength(300)).toBe("strong");
    expect(flourStrength(360)).toBe("veryStrong");
  });
});

describe('orari e dosi: secondo collaudo',()=>{
 it('puntata dopo impasto di 20 minuti: lo stesso istante in timeline e guida',()=>{
  const start=new Date(2026,9,26,9,30);
  expect(displayStepTime(false,addMinutes(start,20),start,'it-IT')).toBe('09:50');
  expect(displayStepTime(true,addMinutes(start,23),start,'it-IT')).toBe('ca. 09:53');
  /* FW-11: un solo formato di durata, anche oltre le 24 h (spazi della lingua). */
  const plain=(s:string)=>s.replace(/[\u00a0\u202f]/g,' ');
  expect(plain(fmtDuration(24*60+8))).toBe('24 h 8 min');
  expect(plain(fmtDuration(68))).toBe('1 h 8 min');expect(plain(fmtDuration(1134))).toBe('18 h 54 min');
 });
 it('pasto 15:30, 368 minuti: inizio 09:22 e fine 15:30, senza arrotondamento tardivo',()=>{
  const meal=new Date(2026,9,26,15,30), now=new Date(2026,9,26,8,0);
  const start=startForDeadline(meal,368,now);
  expect(start.getHours()).toBe(9);expect(start.getMinutes()).toBe(22);
  expect(addMinutes(start,368)).toEqual(meal);
  const quarter=roundToQuarter(new Date(2026,9,26,9,58));
  expect(quarter.getHours()).toBe(10);expect(quarter.getMinutes()).toBe(0);
 });
 it('sotto il grammo serve una bilancia, non una dose a occhio',()=>{
  for(const type of ['fresh','dry']) for(const g of [0.1,0.8]) expect(yeastPracticalHint(g,type,undefined)).toContain('0,01');
 });
});

describe("getParametricTip: cottura nel forno dell'utente (audit 28/10/2026, S09-A-01; FW-07)", () => {
  const pt = CMS_DEFAULTS.parametricTips;
  const home = { ovenTempC: 250, cookSec: 360, ovenTempLabel: "250 °C", referenceTempLabel: "485 °C", ovenType: "home" as const };
  const wood = { ovenTempC: 485, cookSec: 75, ovenTempLabel: "485 °C", referenceTempLabel: "485 °C", ovenType: "wood" as const };

  it("forno di casa con la napoletana: tempo dalla stima del motore (±20 %), non 1–2 min", () => {
    const tip = getParametricTip("bake", "napoletana_stg", false, pt, home)!;
    expect(tip).toContain("4–8 min");
    expect(tip).not.toContain("1–2 min");
    expect(tip).not.toMatch(/Ruota 3/);
    expect(tip).toContain(pt.turnsHalfway);
  });

  it("in modalità Nerd mostra la stima e, come confronto, il riferimento dello stile", () => {
    const tip = getParametricTip("bake", "napoletana_stg", true, pt, home)!;
    expect(tip).toContain("250 °C");
    expect(tip).toContain("60–90 s a 485 °C");
  });

  it("forno a legna: tempo del motore e rotazioni frequenti; senza ricetta, nessun consiglio", () => {
    const tip = getParametricTip("bake", "napoletana_stg", false, pt, wood)!;
    expect(tip).toContain("1–2 min");
    expect(tip).toContain(pt.turnsFrequent);
    expect(getParametricTip("bake", "napoletana_stg", false, pt)).toBeNull();
  });

  it("forno elettrico ad alta temperatura: una volta a metà, come il passo (non «Ruota 3 volte»)", () => {
    const tip = getParametricTip("bake", "napoletana_stg", false, pt, { ...wood, ovenType: "electric_high" })!;
    expect(tip).toContain(pt.turnsHalfway);
    expect(tip).not.toMatch(/Ruota 3/);
  });

  it("frittura: nessun consiglio di forno", () => {
    expect(getParametricTip("bake", "pizza_fritta", false, pt, { ...home, frying: true })).toBeNull();
  });

  it("il consiglio dell'impasto non parla del forno", () => {
    const tip = getParametricTip("mix", "napoletana_stg", false, pt, home)!;
    expect(tip).not.toMatch(/Forno|°C/);
    expect(tip.endsWith(" ")).toBe(false);
  });

  const kitchen: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, skill_level: 2, available_hours: 0, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false, dietary_filters: [], pantry_flours: [], pantry_yeasts: [] };
  const interval = (tip: string) => tip.match(/(\d+)–(\d+) min/)!.slice(1).map(Number);

  for (const id of ["napoletana_stg", "teglia_romana", "new_york"]) {
    it(`${id} col forno di casa a 250 °C: l'intervallo del consiglio contiene la durata per giro del passo`, () => {
      const recipe = generateRecipe(STYLES_DB[id], kitchen);
      const bake = recipe.timeline.find((s) => s.id === "bake")!;
      const perRound = bakeSecondsPerRound(bake, recipe.cook_time_sec);
      const tip = getParametricTip("bake", id, false, pt, { ...home, cookSec: perRound })!;
      const [minM, maxM] = interval(tip);
      expect(perRound / 60).toBeGreaterThanOrEqual(minM);
      expect(perRound / 60).toBeLessThanOrEqual(maxM);
      // Un solo tempo per la cottura: niente intervallo del riferimento dello stile.
      if (id === "teglia_romana") expect(tip).not.toContain("8–15 min");
    });
  }
});

describe("lievito in baker's % con la precisione del registro (yeast-dose)", () => {
  const kitchen: UserConstraints = {
    oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
    available_hours: 0, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
    has_baking_pan: false, pantry_flours: [], pantry_yeasts: ["dry"], dietary_filters: [],
  };
  it("lievito secco 24 h: mai «0 %» nella griglia scientifica", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, kitchen, { customFermentationHours: 24 });
    expect(recipe.yeast_type).toBe("dry");
    expect(recipe.science.yeast_baker_pct).toBeGreaterThan(0);
    for (const locale of ["it-IT", "en-US", "fr-FR", "de-DE", "es-ES", "pt-PT", "ja-JP"]) {
      const text = yeastBakerPctText(recipe.science.yeast_baker_pct, locale);
      expect(text.replace(/[\u00a0\u202f ]/g, "")).not.toMatch(/^0%$/);
      expect(text).toMatch(/[1-9]/);
    }
    expect(yeastBakerPctText(0.033, "it-IT").replace(/[\u00a0\u202f ]/g, "")).toBe("0,03%");
    expect(yeastBakerPctText(0.04, "en-US")).toBe("0.04%");
  });
});

/* FW-19 (S09-A-14, S09-A-11, S09-B-06, S10-B-10): testi del piano coerenti con il motore. */
describe("piano temporale: testi dei passi (FW-19)", () => {
  const c: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, skill_level: 1, available_hours: 24, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true, dietary_filters: [], kitchen_temp_c: 22, pantry_flours: [], pantry_yeasts: [] };
  const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");
  it("i giri di cottura in secondi veri e il recupero del forno, senza arrotondare a «6 minuti»", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, c);
    const bake = r.timeline.find((s) => s.id === "bake")!;
    const [rounds, recovery] = engineMsgTexts(bake.msg!.description!.filter((m) => m.key.startsWith("timeline.bake.r")), CMS_DEFAULTS, "it-IT").map(plain);
    expect(bake.round_seconds! % 60).not.toBe(0);
    expect(rounds).toContain(`${Math.floor(bake.round_seconds! / 60)} min ${bake.round_seconds! % 60} s`);
    expect(recovery).toContain("5 min");
  });
  it("il preriscaldo non fa conti col tempo e ripete il segno di prontezza", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, c);
    const heat = r.timeline.find((s) => s.id === "preheat")!;
    const text = localizeStep(heat, r, CMS_DEFAULTS).description;
    expect(text).not.toMatch(/già inclusi|non aggiungerli/);
    expect(text).toMatch(/premuto con un dito/);
  });
  it("le pieghe dicono numero e intervallo del passo; la puntata in frigo non chiede più 1–2 h di acclimatamento", () => {
    const r = generateRecipe(STYLES_DB.teglia_romana, c);
    const folds = r.timeline.find((s) => s.id === "folds")!;
    expect(plain(localizeStep(folds, r, CMS_DEFAULTS, createFormatter(CMS_DEFAULTS.ui, "it-IT")).description)).toMatch(/3 giri di pieghe, uno ogni 45 min/);
    const bulk = r.timeline.find((s) => s.id === "bulk")!;
    const longDesc = localizeStep(bulk, r, CMS_DEFAULTS).longDesc ?? "";
    expect(longDesc).not.toMatch(/acclimatare 1-2 ore/);
    expect(getParametricTip("bulk", "teglia_romana", false, CMS_DEFAULTS.parametricTips, { ovenTempC: 250, cookSec: 600, ovenTempLabel: "250 °C", referenceTempLabel: "300 °C", foldsInPlan: true }, CMS_DEFAULTS.parametricText)).toBeNull();
  });
});
