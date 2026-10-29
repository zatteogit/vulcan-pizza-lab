import { describe, expect, it } from "vitest";
import { defaultMealStart, flourStrength, displayStepTime, addMinutes, fmtDuration, startForDeadline, roundToQuarter, readyTimeForDisplay, dayOffset, yeastPracticalHint, getParametricTip, bakeSecondsPerRound } from "./recipe-output-format";
import { generateRecipe, STYLES_DB, type UserConstraints } from "../../domain/pizza-engine";
import { CMS_DEFAULTS } from "../cms/cms-context";

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
describe("defaultMealStart (audit totale n. 2)", () => {
  it("ancora la fine a pranzo o cena, mai di notte", () => {
    const now = new Date(2026, 9, 24, 14, 30);
    for (const minutes of [5 * 60, 13 * 60, 24 * 60, 36 * 60, 50 * 60]) {
      const end = new Date(defaultMealStart(minutes, now).getTime() + minutes * 60_000);
      const h = end.getHours() + end.getMinutes() / 60;
      const sh = defaultMealStart(minutes, now).getHours();
      expect(sh >= 7 && sh < 22).toBe(true);
      expect(h === 12.5 || (h > 12.5 && h <= 12.75) || h === 20 || (h > 20 && h <= 20.25)).toBe(true);
    }
  });
});

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
  expect(displayStepTime('bulk',addMinutes(start,20),start,'it-IT')).toBe('ca. 09:50');
  expect(displayStepTime('shape',addMinutes(start,23),start,'it-IT')).toBe('09:53');
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
