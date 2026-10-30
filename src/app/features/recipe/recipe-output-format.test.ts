import { describe, expect, it } from "vitest";
import { localizeStep, flourStrength, displayStepTime, addMinutes, fmtDuration, startForDeadline, roundToQuarter, readyTimeForDisplay, dayOffset, yeastPracticalHint, getParametricTip, bakeSecondsPerRound, yeastBakerPctText, stepQuantities, phaseBakerPctText, rule55DescriptionText, yeastDilutionText } from "./recipe-output-format";
import { preFermentMaturationTempC } from "../../domain/pre-ferment-split";
import { buildRecipePhases, yeastDilution } from "../../domain/recipe-phases";
import { generateRecipe, STYLES_DB, type UserConstraints } from "../../domain/pizza-engine";
import { IT_LOCALE } from "../cms/locales/it";
import { createFormatter } from "../cms/i18n";
import { getToppingForStyle } from "../../data/topping-library";
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
  const pt = IT_LOCALE.parametricTips;
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

/* ═══ FW-17 — dosi nei passi dal modello per fasi ═══ */
describe("stepQuantities (FW-17)", () => {
  const k: UserConstraints = {
    oven_type: "home", oven_max_temp_c: 250, skill_level: 3, available_hours: 72, dough_balls: 4,
    has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
    dietary_filters: [], kitchen_temp_c: 21, pantry_flours: [], pantry_yeasts: [], mixer_type: "hands", surfaces: [],
  };
  const fmt = createFormatter(IT_LOCALE.ui, "it-IT");
  const labels = (rows: { label: string }[]) => rows.map((r) => r.label);

  it("S08-A-02: con la biga l'impasto parte dal prefermento e include lo zucchero", () => {
    const recipe = generateRecipe(STYLES_DB.new_york, k, { usePreFerment: true, preFerment: { type: "biga", flourPct: 50 } });
    const mix = stepQuantities("mix", recipe, IT_LOCALE, fmt);
    expect(mix[0].label).toBe("Biga");
    expect(labels(mix)).toContain(IT_LOCALE.ui.sugar);
    expect(labels(mix)).not.toContain(IT_LOCALE.yeastLabels.fresh);
  });

  it("S10-B-09 / S10-A-21: temperatura dell'acqua nell'impasto e aiuto per le microdosi", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, k);
    const mix = stepQuantities("mix", recipe, IT_LOCALE, fmt);
    expect(labels(mix)).toContain("Temperatura dell'acqua");
    expect(recipe.yeast_g).toBeLessThan(1);
    expect(mix.find((q) => q.label === IT_LOCALE.yeastLabels.fresh)?.hint).toMatch(/Sciogli/);
  });

  it("S10-A-06: il passo della salamoia riporta le dosi del condimento", () => {
    const recipe = generateRecipe(STYLES_DB.focaccia_genovese, k);
    const topping = getToppingForStyle("focaccia_genovese_classica", STYLES_DB.focaccia_genovese)!;
    const rows = stepQuantities("spread_salamoia_genovese", recipe, IT_LOCALE, fmt, topping);
    expect(labels(rows)).toEqual(expect.arrayContaining(["Acqua", "Sale fino"]));
    expect(rows.find((r) => r.label === "Acqua")?.value).toMatch(/in tutto/);
  });
});

/* ═══ FW-17 (S08-A-09/B-07) — baker's % uguale in Ricetta e in stampa ═══
 * Le due viste leggono la stessa riga dei totali (buildRecipePhases, cioè i
 * baker_pcts del motore) con lo stesso formato. Prima la Ricetta ricalcolava la
 * percentuale dai grammi arrotondati: pinsa da un panetto, sale 1,9 % a schermo
 * e 1,8 % in stampa. */
describe("baker's % della Ricetta = baker's % della stampa (FW-17)", () => {
  const VIEWS = import.meta.glob(["./ingredients-section.tsx", "./print-sheet.tsx"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
  const k: UserConstraints = {
    oven_type: "home", oven_max_temp_c: 250, skill_level: 3, available_hours: 72, dough_balls: 1,
    has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
    dietary_filters: [], kitchen_temp_c: 21, pantry_flours: [], pantry_yeasts: [], mixer_type: "hands", surfaces: [],
  };
  const fmtPct = (n: number, locale: string) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n)}%`;

  it("entrambe le viste usano phaseBakerPctText sulle righe dei totali, nessuna ricalcola dai grammi", () => {
    const screen = VIEWS["./ingredients-section.tsx"];
    const print = VIEWS["./print-sheet.tsx"];
    expect(screen).toMatch(/phases\.totals\.find\(/);
    expect(screen).toMatch(/phaseBakerPctText\(row, bcp47\)/);
    for (const id of ["salt", "yeast", "fat", "sugar"]) expect(screen).toContain(`bakerPct("${id}")`);
    expect(screen).not.toMatch(/\/ recipe\.flour_g\) \* 100/);
    expect(print).toMatch(/model\.totals\.map/);
    expect(print).toMatch(/phaseBakerPctText\(row, bcp47\)/);
  });

  for (const id of ["pinsa_romana", "napoletana_stg"]) {
    it(`${id}, un panetto: sale, grasso e zucchero come i baker_pcts del motore`, () => {
      const recipe = generateRecipe(STYLES_DB[id], k);
      const totals = buildRecipePhases(recipe).totals;
      for (const locale of ["it-IT", "en-US", "fr-FR", "de-DE", "es-ES", "pt-PT", "ja-JP"]) {
        for (const key of ["salt", "fat", "sugar"] as const) {
          const row = totals.find((r) => r.id === key);
          if (!row) continue;
          expect(phaseBakerPctText(row, locale)).toBe(fmtPct(recipe.baker_pcts![key], locale));
        }
      }
    });
  }

  it("le evidenze dell'audit: pinsa sale 1,8 % e olio 1,3 %, STG sale 2,8 %", () => {
    const pinsa = buildRecipePhases(generateRecipe(STYLES_DB.pinsa_romana, k)).totals;
    const stg = buildRecipePhases(generateRecipe(STYLES_DB.napoletana_stg, k)).totals;
    const text = (rows: typeof pinsa, id: string) => phaseBakerPctText(rows.find((r) => r.id === id)!, "it-IT");
    expect(text(pinsa, "salt")).toBe("1,8%");
    expect(text(pinsa, "fat")).toBe("1,3%");
    expect(text(stg, "salt")).toBe("2,8%");
  });
});

/* ═══ FW-17 (S08-A-07) — la spiegazione della Regola 55 torna coi numeri ═══
 * Con un prefermento l'acqua dell'impasto finale viene dalla regola a quattro
 * termini: anche la spiegazione. Prima diceva «cucina + farina + acqua ≈ 72 °C»
 * accanto a un'acqua a 37 °C con la cucina a 20 °C (20 + 20 + 37 = 77). */
describe("Regola 55: numero e spiegazione coincidono (FW-17)", () => {
  const base: UserConstraints = {
    oven_type: "home", oven_max_temp_c: 250, skill_level: 3, available_hours: 72, dough_balls: 4,
    has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true,
    dietary_filters: [], kitchen_temp_c: 20, pantry_flours: [], pantry_yeasts: [], mixer_type: "hands", surfaces: [],
  };
  const fmt = createFormatter(IT_LOCALE.ui, "it-IT");
  const SECTION = (import.meta.glob("./ingredients-section.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>)["./ingredients-section.tsx"];

  it("canotto con biga, cucina a 20 °C: cucina + farina + acqua + biga = 4 × DDT, e il testo lo dice", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_canotto, base, { usePreFerment: true, preFerment: { type: "biga", flourPct: 50 } });
    expect(recipe.has_pre_ferment).toBe(true);
    const ddt = recipe.science.desired_dough_temp_c;
    expect(recipe.science.friction_factor).toBe(0);
    expect(20 + 20 + recipe.water_temp_c! + 19).toBeCloseTo(4 * ddt, 1);
    const text = rule55DescriptionText(recipe, IT_LOCALE, fmt);
    expect(text).toContain(fmt.celsius(4 * ddt));
    expect(text).toContain("Biga");
    expect(text).toContain(fmt.celsius(19));
    // La vecchia spiegazione a tre termini (3 × DDT) non torna più con questo numero.
    expect(text).not.toContain(fmt.celsius(3 * ddt));
  });

  it("su tutto il catalogo, con e senza prefermento, i termini sommano al numero della spiegazione", () => {
    let checked = 0;
    for (const style of Object.values(STYLES_DB)) {
      for (const options of [{ usePreFerment: false }, { usePreFerment: true, preFerment: { type: "biga" as const, flourPct: 40 } }, { usePreFerment: true, preFerment: { type: "poolish" as const, flourPct: 30 } }]) {
        const recipe = generateRecipe(style, base, options);
        if (recipe.water_temp_c == null || recipe.science.water_temp_limit) continue;
        const ddt = recipe.science.desired_dough_temp_c;
        const friction = recipe.science.friction_factor;
        const pref = recipe.has_pre_ferment
          ? preFermentMaturationTempC(recipe.pre_ferment_type!.includes("poolish") ? "poolish" : "biga")
          : 0;
        const sum = (recipe.has_pre_ferment ? 4 : 3) * ddt - friction;
        expect(20 + 20 + recipe.water_temp_c + pref).toBeCloseTo(sum, 1);
        expect(rule55DescriptionText(recipe, IT_LOCALE, fmt)).toContain(fmt.celsius(sum));
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("con un prefermento il (?) sta accanto all'acqua dell'impasto finale, non sulla riga Acqua", () => {
    expect(SECTION).toMatch(/\{!phases\.preFerment && rule55Toggle\}/);
    expect(SECTION).toMatch(/\{phase\.id === "final" && rule55Toggle\}/);
  });

  it("la stringa a quattro termini esiste in tutte le lingue con gli stessi segnaposto", async () => {
    const locales = await Promise.all(["en", "fr", "de", "es", "pt", "ja"].map((l) => import(`../cms/locales/${l}.ts`)));
    const texts = [IT_LOCALE.cooking.rule55DescriptionPreferment, ...locales.map((m) => (Object.values(m).find((v) => (v as { cooking?: unknown })?.cooking) as { cooking: { rule55DescriptionPreferment: string } }).cooking.rule55DescriptionPreferment)];
    for (const text of texts) {
      for (const ph of ["{sum}", "{ddt}", "{friction}", "{preferment}", "{prefTemp}"]) expect(text).toContain(ph);
    }
  });
});

/* ═══ FW-17 (D-O, revisione) — la diluizione dice entrambe le pesate ═══ */
describe("diluzione del lievito: incertezza onesta (FW-17)", () => {
  const fmt = createFormatter(IT_LOCALE.ui, "it-IT");
  it("0,1 g: nomina lievito e soluzione e dà ±20 %, non «solo un decimo»", () => {
    const why = yeastDilutionText(yeastDilution(0.1, "fresh", 300)!, fmt).body[2];
    expect(why).toContain("5 g di lievito");
    expect(why).toContain("5 g di soluzione");
    expect(why).toContain(fmt.percent(20));
    expect(why).not.toMatch(/resta solo|un decimo/);
  });
  it("0,6 g: 30 g di soluzione, ±15 %", () => {
    const why = yeastDilutionText(yeastDilution(0.6, "fresh", 300)!, fmt).body[2];
    expect(why).toContain("30 g di soluzione");
    expect(why).toContain(fmt.percent(15));
  });
});

/* FW-19 (S09-A-14, S09-A-11, S09-B-06, S10-B-10): testi del piano coerenti con il motore. */
describe("piano temporale: testi dei passi (FW-19)", () => {
  const c: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, skill_level: 1, available_hours: 24, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: true, dietary_filters: [], kitchen_temp_c: 22, pantry_flours: [], pantry_yeasts: [] };
  const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");
  it("i giri di cottura in secondi veri e il recupero del forno, senza arrotondare a «6 minuti»", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, c);
    const bake = r.timeline.find((s) => s.id === "bake")!;
    const [rounds, recovery] = engineMsgTexts(bake.msg!.description!.filter((m) => m.key.startsWith("timeline.bake.r")), IT_LOCALE, "it-IT").map(plain);
    expect(bake.round_seconds! % 60).not.toBe(0);
    expect(rounds).toContain(`${Math.floor(bake.round_seconds! / 60)} min ${bake.round_seconds! % 60} s`);
    expect(recovery).toContain("5 min");
  });
  it("il preriscaldo non fa conti col tempo e ripete il segno di prontezza", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, c);
    const heat = r.timeline.find((s) => s.id === "preheat")!;
    const text = localizeStep(heat, r, IT_LOCALE).description;
    expect(text).not.toMatch(/già inclusi|non aggiungerli/);
    expect(text).toMatch(/premuto con un dito/);
  });
  it("le pieghe dicono numero e intervallo del passo; la puntata in frigo non chiede più 1–2 h di acclimatamento", () => {
    const r = generateRecipe(STYLES_DB.teglia_romana, c);
    const folds = r.timeline.find((s) => s.id === "folds")!;
    expect(plain(localizeStep(folds, r, IT_LOCALE, createFormatter(IT_LOCALE.ui, "it-IT")).description)).toMatch(/3 giri di pieghe, uno ogni 45 min/);
    const bulk = r.timeline.find((s) => s.id === "bulk")!;
    const longDesc = localizeStep(bulk, r, IT_LOCALE).longDesc ?? "";
    expect(longDesc).not.toMatch(/acclimatare 1-2 ore/);
    expect(getParametricTip("bulk", "teglia_romana", false, IT_LOCALE.parametricTips, { ovenTempC: 250, cookSec: 600, ovenTempLabel: "250 °C", referenceTempLabel: "300 °C", foldsInPlan: true }, IT_LOCALE.parametricText)).toBeNull();
  });
});
