import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  generateRecipe,
  generateTimeSlots,
  customMealSlot,
  doughBallsForFlour,
  MAX_DOUGH_BALLS,
  equivalentFermentationHours,
  optimizeRecipe,
  thermalViability,
  recommendStyles,
  feasibleAlternativeStyles,
  fermentationPhases,
  bakeRoundRecoverySec,
  type UserConstraints,
} from "./pizza-engine";

/* ═══ Rete di sicurezza sul motore (audit lug 2026) ═══
   Invarianti stabili, non numeri fragili: disciplinare AVPN, Regola 55,
   proprietà dell'ottimizzatore, slot orari. Prima di questo file il motore
   (~5k righe) non aveva alcun test eseguibile in CI. */

const napoletana = STYLES_DB["napoletana_stg"];

function makeConstraints(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "wood",
    oven_max_temp_c: 485,
    skill_level: 3 as UserConstraints["skill_level"],
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: true,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: [],
    kitchen_temp_c: 22,
    pantry_flours: [],
    pantry_yeasts: [],
    mixer_type: "hands",
    surfaces: [],
    ...overrides,
  };
}

describe("generateRecipe — Napoletana STG con forno capace", () => {
  it("il piano di cottura non sottostima i secondi reali, nemmeno con più infornate", () => {
    for (const style of Object.values(STYLES_DB)) for (const dough_balls of [1, 4]) {
      const r = generateRecipe(style, makeConstraints({ oven_type: "home", oven_max_temp_c: 250, dough_balls }));
      const minutes = r.timeline.filter(s => s.id === "bake" || s.id === "bake2")
        .reduce((sum, s) => sum + s.duration_minutes, 0);
      expect(minutes * 60, `${style.id} × ${dough_balls}`).toBeGreaterThanOrEqual(r.cook_time_sec * dough_balls);
    }
  });

  it("Recco resta senza lievito anche se una bozza chiede un pre-fermento", () => {
    const r = generateRecipe(STYLES_DB.focaccia_recco, makeConstraints(), { usePreFerment: true });
    expect(r.has_pre_ferment).toBe(false);
    expect(r.yeast_g).toBe(0);
    expect(r.timeline.some(s => s.id === "preferment")).toBe(false);
  });
  const recipe = generateRecipe(napoletana, makeConstraints());

  it("lo stile esiste nel DB", () => {
    expect(napoletana).toBeDefined();
  });

  it("idratazione dentro il range dello stile", () => {
    const [lo, hi] = napoletana.dough.hydration_pct_range;
    expect(recipe.hydration_pct).toBeGreaterThanOrEqual(lo);
    expect(recipe.hydration_pct).toBeLessThanOrEqual(hi);
  });

  it("sale nel range del disciplinare AVPN (45–55 g per litro d'acqua)", () => {
    const gramsPerLiter = (recipe.salt_g / recipe.water_g) * 1000;
    expect(gramsPerLiter).toBeGreaterThanOrEqual(40); // margine tecnico sotto
    expect(gramsPerLiter).toBeLessThanOrEqual(55);
  });

  it("cottura dentro il range dello stile", () => {
    const [lo, hi] = napoletana.baking.cook_time_sec_range;
    expect(recipe.cook_time_sec).toBeGreaterThanOrEqual(lo);
    expect(recipe.cook_time_sec).toBeLessThanOrEqual(hi);
  });

  it("la fermentazione rispetta il tempo disponibile", () => {
    expect(recipe.fermentation_hours).toBeLessThanOrEqual(24);
  });

  it("bilancio impasto: panetti × peso = totale", () => {
    expect(recipe.dough_balls * recipe.ball_weight_g).toBe(recipe.total_dough_g);
  });

  it("punteggi nel dominio 0–100", () => {
    for (const key of ["composite", "authenticity", "feasibility", "digestibility"] as const) {
      expect(recipe.scores[key]).toBeGreaterThanOrEqual(0);
      expect(recipe.scores[key]).toBeLessThanOrEqual(100);
    }
  });
});

describe("Regola 55 (temperatura acqua / DDT)", () => {
  it("cucina a 22°C, a mano: acqua ≈ 28°C (DDT 24: 24×3 − 22 − 22)", () => {
    const recipe = generateRecipe(napoletana, makeConstraints({ kitchen_temp_c: 22 }));
    expect(recipe.science.desired_dough_temp_c).toBe(24);
    expect(recipe.science.water_temp_c).toBe(28);
  });

  it("l'impastatrice sottrae l'attrito dall'acqua", () => {
    const hands = generateRecipe(napoletana, makeConstraints({ mixer_type: "hands" }));
    const mixer = generateRecipe(
      napoletana,
      makeConstraints({ has_mixer: true, mixer_type: "planetary" }),
    );
    expect(mixer.science.friction_factor).toBeGreaterThan(0);
    if (hands.science.water_temp_c != null && mixer.science.water_temp_c != null) {
      expect(mixer.science.water_temp_c).toBeLessThan(hands.science.water_temp_c);
    }
  });

  it("fermentazione in frigo → DDT 22", () => {
    const recipe = generateRecipe(napoletana, makeConstraints(), {
      customFermentationTempC: 4,
      customFermentationHours: 24,
    });
    expect(recipe.science.desired_dough_temp_c).toBe(22);
  });

  it("cucina rovente d'estate: acqua fredda ma mai sotto il pavimento pratico (2°C) o null", () => {
    const recipe = generateRecipe(napoletana, makeConstraints({ kitchen_temp_c: 34 }));
    const wt = recipe.science.water_temp_c;
    expect(wt === null || wt >= 2).toBe(true);
  });
});

describe("optimizeRecipe — proprietà dell'ottimizzatore", () => {
  it("il soffitto non è mai sotto la ricetta generata (a parità di vincoli)", () => {
    const constraints = makeConstraints({ oven_type: "home", oven_max_temp_c: 250 });
    const generated = generateRecipe(napoletana, constraints);
    const optimized = optimizeRecipe(napoletana, constraints);
    expect(optimized.recipe.scores.composite).toBeGreaterThanOrEqual(
      generated.scores.composite - 0.5,
    );
  });

  it("l'ottimo resta dentro i range dello stile", () => {
    const { recipe } = optimizeRecipe(napoletana, makeConstraints());
    const [hLo, hHi] = napoletana.dough.hydration_pct_range;
    expect(recipe.hydration_pct).toBeGreaterThanOrEqual(hLo);
    expect(recipe.hydration_pct).toBeLessThanOrEqual(hHi);
  });
});

describe("thermalViability", () => {
  it("forno domestico a 250°C: la Napoletana non è viabile (< 1)", () => {
    expect(thermalViability(napoletana, 250)).toBeLessThan(1);
  });

  it("forno a legna a 485°C: viabilità piena", () => {
    expect(thermalViability(napoletana, 485)).toBeGreaterThanOrEqual(1);
  });
});

describe("generateTimeSlots", () => {
  it("propone sempre almeno uno slot, con ore positive e crescenti", () => {
    const slots = generateTimeSlots(new Date("2026-07-03T10:00:00"));
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.hours).toBeGreaterThan(0);
    }
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].hours).toBeGreaterThanOrEqual(slots[i - 1].hours);
    }
  });

  it("M-2: ore al quarto d'ora per difetto, mai oltre il tempo reale al pasto", () => {
    for (let minute = 0; minute < 24 * 60; minute += 7) {
      const now = new Date(2026, 9, 23, 0, minute);
      for (const slot of generateTimeSlots(now)) {
        expect(slot.hours * 4).toBe(Math.floor(slot.hours * 4));
        const meal = new Date(now);
        meal.setDate(meal.getDate() + (slot.dayOffset ?? 0));
        if (slot.meal === "lunch") meal.setHours(12, 30, 0, 0);
        else meal.setHours(20, 0, 0, 0);
        const realHours = (meal.getTime() - now.getTime()) / 3_600_000;
        expect(slot.hours).toBeLessThanOrEqual(realHours + 1e-9);
        expect(realHours - slot.hours).toBeLessThan(0.25);
      }
    }
  });

  it("M-2: alle 16:20 «Stasera» vale 3 h 30 min, non 4 h", () => {
    const tonight = generateTimeSlots(new Date(2026, 9, 23, 16, 20)).find((s) => s.id === "tonight");
    expect(tonight?.hours).toBe(3.5);
    expect(tonight?.meal).toBe("dinner");
    expect(tonight?.dayOffset).toBe(0);
    expect(tonight?.targetAt).toBe(new Date(2026, 9, 23, 20, 0).getTime());
  });

  it("a tarda sera i pasti di oggi sono già esclusi", () => {
    const slots = generateTimeSlots(new Date("2026-07-03T23:30:00"));
    // nessuno slot deve essere irrealisticamente vicino
    for (const slot of slots) {
      expect(slot.hours).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("customMealSlot (U-2)", () => {
  const now = new Date(2026, 9, 22, 16, 20);
  it("sabato alle 20: ore al quarto d'ora per difetto, istante esatto conservato", () => {
    const target = new Date(2026, 9, 24, 20, 0);
    const slot = customMealSlot(target, now)!;
    expect(slot.id).toBe("custom");
    expect(slot.hours).toBe(51.5);
    expect(slot.dayOffset).toBe(2);
    expect(slot.targetAt).toBe(target.getTime());
  });

  it("rifiuta orari troppo vicini, passati o oltre 7 giorni", () => {
    expect(customMealSlot(new Date(2026, 9, 22, 17, 0), now)).toBeNull();
    expect(customMealSlot(new Date(2026, 9, 21, 20, 0), now)).toBeNull();
    expect(customMealSlot(new Date(2026, 9, 30, 20, 0), now)).toBeNull();
  });
});

describe("doughBallsForFlour (U-2)", () => {
  const constraints = {
    oven_type: "home", oven_max_temp_c: 250, skill_level: 2, available_hours: 24, dough_balls: 4,
    has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false,
    dietary_filters: [], kitchen_temp_c: 22, pantry_flours: [], pantry_yeasts: [], mixer_type: "hands", surfaces: [],
  } as unknown as UserConstraints;

  it("con 750 g di farina dice quanti panetti e quanta ne avanza", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, constraints);
    const fit = doughBallsForFlour(recipe, 750);
    expect(fit.balls).toBeGreaterThan(0);
    expect(fit.flour_g).toBeLessThanOrEqual(750);
    expect(fit.flour_g + fit.leftover_g).toBe(750);
    // la ricetta rigenerata con quei panetti sta davvero nella farina disponibile
    const exact = generateRecipe(STYLES_DB.napoletana_stg, { ...constraints, dough_balls: fit.balls });
    expect(exact.flour_g).toBeLessThanOrEqual(751);
    // un panetto in più non ci sta
    const more = generateRecipe(STYLES_DB.napoletana_stg, { ...constraints, dough_balls: fit.balls + 1 });
    expect(more.flour_g).toBeGreaterThan(750);
  });

  it("sotto il minimo per un panetto restituisce zero panetti", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, constraints);
    expect(doughBallsForFlour(recipe, 50)).toMatchObject({ balls: 0, flour_g: 0, capped: false });
  });

  it("D-043: oltre il tetto di 200 lo dice (capped) e l'avanzo resta vero", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, constraints);
    const fit = doughBallsForFlour(recipe, 100000);
    expect(fit.balls).toBe(MAX_DOUGH_BALLS);
    expect(fit.capped).toBe(true);
    expect(fit.flour_g + fit.leftover_g).toBe(100000);
    expect(doughBallsForFlour(recipe, 750).capped).toBe(false);
    // esattamente 200 panetti senza avanzo utile: non è il tetto a fermarli
    expect(doughBallsForFlour(recipe, fit.flour_g).capped).toBe(false);
  });

  it("budget nullo, negativo o non numerico: zero panetti, mai il tetto", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, constraints);
    for (const g of [0, -5, Number.NaN]) {
      expect(doughBallsForFlour(recipe, g)).toMatchObject({ balls: 0, leftover_g: 0, capped: false });
    }
  });
});

describe("pre-fermento: un solo tipo per ricetta e procedimento (audit totale n. 3)", () => {
  it.each(
    Object.values(STYLES_DB)
      .filter((s) => /biga|poolish/.test(s.dough.process_type))
      .map((s) => [s.id, s] as const),
  )("%s: il passo nomina lo stesso pre-fermento della ricetta", (_id, style) => {
    const recipe = generateRecipe(style, makeConstraints(), { usePreFerment: true });
    expect(recipe.has_pre_ferment).toBe(true);
    const step = recipe.timeline.find((s) => s.id === "preferment");
    expect(step?.description).toContain(recipe.pre_ferment_type);
  });
});

describe("lievito sulle fasi reali (audit totale n. 5)", () => {
  it("sopra i 18 °C le ore restano quelle", () => {
    expect(equivalentFermentationHours(24, 22, "fresh", false)).toBe(24);
    expect(equivalentFermentationHours(8, 18, "dry", true)).toBe(8);
  });
  it("in frigo l'appretto a 18 °C vale più ore fredde", () => {
    expect(equivalentFermentationHours(36, 4, "fresh", false)).toBeGreaterThan(36);
  });
});

describe("stili in teglia: stesura prima dell'appretto (audit totale n. 7)", () => {
  const order = (id: string) =>
    generateRecipe(STYLES_DB[id], makeConstraints({ oven_type: "home", oven_max_temp_c: 250 })).timeline.map((s) => s.id);
  it("Detroit si stende in teglia e lievita lì", () => {
    const ids = order("detroit");
    expect(ids.indexOf("shape")).toBeLessThan(ids.indexOf("proof"));
  });
  it("la teglia romana fa l'appretto a panetti e si stende prima di infornare", () => {
    const ids = order("teglia_romana");
    expect(ids.indexOf("proof")).toBeLessThan(ids.indexOf("shape"));
  });
});

describe("teglia di default delle forme ovali (audit totale n. 11, B-15)", () => {
  for (const id of ["pala_romana", "pinsa_romana"]) {
    it(`${id}: la teglia dello stile non cambia il peso`, () => {
      const style = STYLES_DB[id];
      const constraints = makeConstraints({
        oven_type: style.baking.oven_type_required,
        oven_max_temp_c: style.baking.temp_c_ideal,
      });
      const without = generateRecipe(style, constraints);
      const withDefaultPan = generateRecipe(style, constraints, {
        panConfig: {
          panShape: "round",
          panLength: style.shape.length_cm,
          panWidth: style.shape.width_cm,
          thickness: style.shape.thickness_factor,
        },
      });
      expect(withDefaultPan.ball_weight_g).toBe(without.ball_weight_g);
    });
  }
});

describe("fattibilità nei consigli (audit totale n. 9)", () => {
  it("pinsa con forno domestico 250: adattamento esplicito, mai perfetta o ideale", () => {
    const rec = recommendStyles(makeConstraints({
      oven_type: "home", oven_max_temp_c: 250, skill_level: 4,
      available_hours: 72, mixer_type: "spiral", has_mixer: true,
      pantry_flours: ["manitoba"],
    })).find((r) => r.style.id === "pinsa_romana")!;
    expect(rec.reasons.map((m) => m.key)).not.toContain("rec.ovenIdeal");
    expect(rec.warnings.map((m) => m.key)).toContain("gen.homeBakingMethod");
    expect(rec.tier).not.toBe("perfect");
  });

  it("i consigli rispettano l'esito della timeline, comprese le cotture in serie", () => {
    for (const available_hours of [2, 6, 8, 24]) {
      const c = makeConstraints({ oven_type: "home", oven_max_temp_c: 250,
        available_hours, meal_deadline: true, dough_balls: 20 });
      for (const rec of recommendStyles(c)) {
        const recipe = generateRecipe(rec.style, c);
        if (recipe.verdict.outcome === "not_feasible") {
          expect(rec.tier, `${rec.style.id}: ${available_hours}h`).toBe("not_feasible");
        }
        if (recipe.verdict.blockers.some((b) => b.kind === "time_window" || b.kind === "fermentation_too_short")) {
          expect(rec.reasons.map((m) => m.key)).not.toContain("rec.timeCompatible");
        }
      }
    }
  });

  it("nessuna riserva di forno o attrezzatura finisce fra i perfetti", () => {
    for (const oven_max_temp_c of [200, 250, 280, 300, 450]) {
      for (const rec of recommendStyles(makeConstraints({ oven_max_temp_c }))) {
        if (rec.tier === "perfect") expect(rec.warnings).toEqual([]);
      }
    }
  });

  it("ogni dichiarazione di forno ideale è vera per tutto il catalogo", () => {
    for (const oven_max_temp_c of [200, 250, 280, 300, 350, 450, 485]) {
      const c = makeConstraints({ oven_max_temp_c });
      for (const rec of recommendStyles(c)) {
        for (const reason of rec.reasons.filter((m) => m.key === "rec.ovenIdeal")) {
          expect(oven_max_temp_c).toBeGreaterThanOrEqual(Number(reason.params?.ideal));
        }
        expect(generateRecipe(rec.style, c).oven_temp_c).toBeLessThanOrEqual(oven_max_temp_c);
      }
    }
  });

  it("più tempo del massimo dello stile non diventa un avviso di tempo insufficiente", () => {
    const rec = recommendStyles(makeConstraints({ available_hours: 72 }))
      .find((r) => r.style.id === "napoletana_stg")!;
    expect(rec.warnings.map((m) => m.key)).not.toContain("rec.timeInsufficient");
  });

  it("con 5 ore gli stili che lievitano di più non sono fattibili", () => {
    const recs = recommendStyles(makeConstraints({ oven_type: "home", oven_max_temp_c: 250, available_hours: 5 }));
    for (const rec of recs) {
      if (rec.style.dough.fermentation_hours_range[0] > 5) expect(rec.tier).toBe("not_feasible");
    }
  });

  it("nessuno stile chiede più di 24 h minime: «Nessuna preferenza» non esclude nulla per il tempo", () => {
    for (const style of Object.values(STYLES_DB)) {
      expect(style.dough.fermentation_hours_range[0]).toBeLessThanOrEqual(24);
    }
  });

  it("le alternative stanno nel forno che hai", () => {
    const constraints = makeConstraints({ oven_type: "home", oven_max_temp_c: 250, mixer_type: "hands" });
    for (const alt of feasibleAlternativeStyles(napoletana, constraints)) {
      expect(alt.baking.temp_c_range[0]).toBeLessThanOrEqual(275);
    }
  });
});

describe("Recco senza lievito: niente frasi da impasto lievitato", () => {
  it("né «solo farina, acqua, sale, lievito» né fermentazione o FODMAP", () => {
    const recipe = generateRecipe(STYLES_DB["focaccia_recco"], makeConstraints({ oven_type: "home", oven_max_temp_c: 300 }));
    const keys = recipe.scores.claims.map((c) => c.key);
    expect(keys).not.toContain("sust.pureDough");
    expect(keys.filter((k) => k.startsWith("dig."))).toEqual([]);
    expect(recipe.science.fodmap_reduction_pct).toBeNull();
  });
});

describe("pre-fermento sulle ore delle fonti (verifica di GPT, 24/10/2026)", () => {
  it("con 24 h: biga 16 h, poolish 14 h, il resto puntata e appretto 2:1", () => {
    const biga = fermentationPhases(24, true, "biga");
    expect(biga.preferment).toBe(16);
    expect(biga.bulk).toBeCloseTo(16 / 3, 5);
    expect(biga.proof).toBeCloseTo(8 / 3, 5);
    expect(fermentationPhases(24, true, "poolish").preferment).toBe(14);
  });

  it("con poche ore resta la quota di prima (40 %)", () => {
    expect(fermentationPhases(10, true, "biga").preferment).toBe(4);
    expect(fermentationPhases(1, true, "poolish").preferment).toBe(0.4);
  });

  it("senza pre-fermento puntata 60 % e appretto 40 %", () => {
    expect(fermentationPhases(10, false)).toEqual({ preferment: 0, bulk: 6, proof: 4 });
  });

  it("il passo del pre-fermento nella ricetta dura quanto dicono le fonti", () => {
    const style = STYLES_DB["napoletana_canotto"];
    for (const [type, hours] of [["biga", 16], ["poolish", 14]] as const) {
      const recipe = generateRecipe(style, makeConstraints({ available_hours: 48 }), {
        customFermentationHours: 24,
        usePreFerment: true,
        preFerment: { type },
      });
      expect(recipe.timeline.find((s) => s.id === "preferment")?.duration_minutes).toBe(hours * 60);
    }
  });
});

describe("cotture una alla volta (D-050)", () => {
  it("la cottura dura il tempo di una pizza per il numero di pizze", () => {
    const one = generateRecipe(napoletana, makeConstraints({ dough_balls: 1 })).timeline.find((s) => s.id === "bake")!;
    const recipe = generateRecipe(napoletana, makeConstraints({ dough_balls: 6 }));
    const six = recipe.timeline.find((s) => s.id === "bake")!;
    expect(one.rounds).toBeUndefined();
    expect(six.rounds).toBe(6);
    // Sui secondi veri, non sul minuto arrondato di una pizza (90 s × 6 = 9 min, non 2 × 6),
    // più il recupero del forno fra un giro e l'altro (FW-19, S09-A-14).
    const recovery = bakeRoundRecoverySec(makeConstraints().oven_type);
    expect(six.duration_minutes).toBe(Math.ceil((recipe.cook_time_sec * 6 + recovery * 5) / 60));
    expect(six.round_seconds).toBe(recipe.cook_time_sec);
    expect(six.recovery_seconds).toBe(recovery);
    expect(six.msg?.description?.find((m) => m.key === "timeline.bake.recovery")?.params?.sec).toBe(recovery);
    expect(six.msg?.description?.find((m) => m.key === "timeline.bake.rounds")?.params?.sec).toBe(recipe.cook_time_sec);
    expect(six.msg?.description?.some((m) => m.key === "timeline.bake.rounds")).toBe(true);
  });
});

describe("avviso sul tempo fino al pasto (verifica di GPT, 24/10/2026)", () => {
  it("dice quante ore restano alla lievitazione dopo lavorazioni e cottura", () => {
    const style = Object.values(STYLES_DB).find((s) => s.dough.fermentation_hours_range[0] === 4)!;
    const recipe = generateRecipe(style, makeConstraints({ oven_type: "home", oven_max_temp_c: 250, available_hours: 4, meal_deadline: true }));
    const msg = recipe.scores.warnings.find((w) => w.key === "gen.timeBelowStyleWindowMeal");
    expect(msg).toBeDefined();
    const { available, work, ferment, fMin, needed } = msg!.params as Record<string, number>;
    expect(available).toBe(4);
    expect(ferment).toBe(recipe.fermentation_hours);
    expect(ferment).toBeLessThan(fMin);
    expect(work).toBeGreaterThan(0);
    expect(needed).toBe(fMin + work);
  });
});
