import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  bakeRoundRecoverySec,
  generateRecipe,
  type GeneratedRecipe,
  type UserConstraints,
} from "../domain/pizza-engine";
import { getFoldingByStyle } from "../data/parametric-databases";
import {
  ACTIVE_STEP_IDS,
  activeStepTimeUp,
  sessionProgress,
  COMFORT_TOLERANCES,
  FLEXIBLE_STEP_IDS,
  NIGHT_WINDOW,
  approxStartAt,
  buildCookPlan,
  completeStepAt,
  countNightActives,
  defaultMealStart,
  displayedClockMs,
  isColdPhase,
  isNightHour,
  movesHoursBetweenColdAndRoom,
  nightActions,
  optimizeComfort,
  previewStartNow,
  recipeFingerprint,
  sessionNightActions,
  sessionReadyAt,
  startNowNeedsConfirm,
  startStepAt,
  stepHasStarted,
  stretchOptions,
  totalPlannedMinutes,
  type SessionTiming,
} from "./cook-plan";

/* ═══ FW-19 — invarianti del piano temporale unico ═══
 * Sulle timeline vere di teglia romana (puntata in frigo), focaccia genovese
 * (a temperatura ambiente) e napoletana STG, nel forno di casa di P1. */

const P1: UserConstraints = {
  oven_type: "home",
  oven_max_temp_c: 250,
  skill_level: 1,
  available_hours: 24,
  meal_deadline: false,
  dough_balls: 4,
  has_mixer: false,
  has_pizza_stone: false,
  has_pizza_steel: false,
  has_baking_pan: true,
  dietary_filters: [],
  kitchen_temp_c: 22,
  pantry_flours: [],
  pantry_yeasts: [],
};
const P3: UserConstraints = { ...P1, oven_type: "electric_high", oven_max_temp_c: 509, skill_level: 4, available_hours: 48 };

const recipe = (id: string, c: UserConstraints = P1): GeneratedRecipe => generateRecipe(STYLES_DB[id], c);
const STYLES = ["teglia_romana", "focaccia_genovese", "napoletana_stg"] as const;
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m, 0, 0);

describe("notte: una sola finestra (S09-A-04)", () => {
  it("23–7, la stessa per l'avviso e per l'orario proposto", () => {
    expect(NIGHT_WINDOW).toEqual({ fromHour: 23, toHour: 7 });
    expect([22, 23, 0, 6, 7].map(isNightHour)).toEqual([false, true, true, true, false]);
  });
});

describe("(a) orario proposto senza pasto scelto: nessuna azione di notte (S09-A-04)", () => {
  /** Le azioni notturne minime fra i pasti raggiungibili nei prossimi 8 giorni. */
  const minNight = (timeline: GeneratedRecipe["timeline"], now: Date) => {
    let min = Infinity;
    for (let day = 0; day < 8; day++) for (const [h, m] of [[12, 30], [20, 0]]) {
      const meal = new Date(now);
      meal.setDate(meal.getDate() + day);
      meal.setHours(h, m, 0, 0);
      const s = meal.getTime() - totalPlannedMinutes(timeline) * 60_000;
      if (s >= now.getTime()) min = Math.min(min, countNightActives(timeline, s));
    }
    return min;
  };
  for (const id of STYLES) {
    it(`${id}: a ore diverse, il primo pasto con meno azioni notturne (zero quando si può)`, () => {
      const r = recipe(id);
      for (const now of [at(26, 8), at(26, 14, 30), at(26, 19), at(26, 23, 30)]) {
        const start = defaultMealStart(r.timeline, now);
        expect(start.getTime()).toBeGreaterThanOrEqual(now.getTime());
        const plan = buildCookPlan(r.timeline, { startAt: start });
        expect(plan.nightActions.length, `${id} ${now.toISOString()}`).toBe(minNight(r.timeline, now));
        const end = new Date(plan.readyAtMs);
        expect([[12, 30], [20, 0]].some(([h, m]) => end.getHours() === h && end.getMinutes() === m)).toBe(true);
      }
    });
  }

  it("teglia romana e napoletana STG: c'è sempre un pasto senza azioni di notte, ed è quello proposto", () => {
    for (const id of ["teglia_romana", "napoletana_stg"]) {
      const r = recipe(id);
      for (const now of [at(26, 8), at(26, 19)]) {
        expect(buildCookPlan(r.timeline, { startAt: defaultMealStart(r.timeline, now) }).nightActions, id).toEqual([]);
      }
    }
  });

  it("focaccia (14 h e mezza): nessun pasto la evita del tutto, e il piano lo dice (non è più un inizio alle 23 taciuto)", () => {
    const r = recipe("focaccia_genovese");
    const plan = buildCookPlan(r.timeline, { startAt: defaultMealStart(r.timeline, at(26, 8)) });
    expect(plan.nightActions.length).toBe(minNight(r.timeline, at(26, 8)));
    expect(plan.steps.filter((s) => s.night).length).toBe(plan.nightActions.length);
  });

  it("se nessun pasto evita la notte, sceglie quello con meno azioni notturne (mai il primo a caso)", () => {
    // Una timeline lunga 23 h con azioni ogni ora: tutte le partenze toccano la notte.
    const timeline = Array.from({ length: 23 }, () => ({ id: "shape", duration_minutes: 60 }));
    const now = at(26, 10);
    const start = defaultMealStart(timeline, now);
    const chosen = countNightActives(timeline, start.getTime());
    for (let day = 0; day < 8; day++) for (const [h, m] of [[12, 30], [20, 0]]) {
      const meal = at(26 + day, h, m).getTime();
      const s = meal - totalPlannedMinutes(timeline) * 60_000;
      if (s >= now.getTime()) expect(chosen).toBeLessThanOrEqual(countNightActives(timeline, s));
    }
  });

  it("ogni azione notturna del piano è segnalata (flag night e elenco)", () => {
    const r = recipe("napoletana_stg");
    const plan = buildCookPlan(r.timeline, { startAt: at(26, 16) }); // «Inizia ora» alle 16
    const flagged = plan.steps.filter((s) => s.night).map((s) => s.index);
    expect(plan.nightActions.map((n) => n.index)).toEqual(flagged);
    for (const s of plan.steps) {
      const night = isNightHour(new Date(s.startMs).getHours());
      expect(s.night).toBe(ACTIVE_STEP_IDS.has(s.id) && night);
    }
    expect(plan.nightActions).toEqual(nightActions(r.timeline, at(26, 16).getTime()));
  });
});

describe("(b) Timeline comoda: D-Q, nessuno scambio frigo ↔ ambiente (S09-A-05, S09-B-04)", () => {
  it("l'appretto usa le tolleranze dell'ambiente anche con la puntata in frigo", () => {
    expect(isColdPhase("bulk", 4)).toBe(true);
    expect(isColdPhase("proof", 4)).toBe(false);
    expect(isColdPhase("preferment", 4)).toBe(false);
    const room = COMFORT_TOLERANCES.room;
    const opts = stretchOptions(546, false);
    expect(Math.max(...opts)).toBeLessThanOrEqual(Math.min(546 * room.plusFraction, room.plusMaxMin));
    expect(Math.min(...opts)).toBeGreaterThanOrEqual(-Math.min(546 * room.minusFraction, room.minusMaxMin));
  });

  it("riconosce uno scambio di ore fra frigo e ambiente", () => {
    expect(movesHoursBetweenColdAndRoom({ 1: -240, 3: 240 }, { 1: true, 3: false })).toBe(true);
    expect(movesHoursBetweenColdAndRoom({ 1: 60, 3: 30 }, { 1: true, 3: false })).toBe(false);
    expect(movesHoursBetweenColdAndRoom({ 1: -60, 3: 60 }, { 1: false, 3: false })).toBe(false);
  });

  it("teglia romana in frigo: il piano comodo non sposta ore fra frigo e appretto e azzera la notte", () => {
    const r = recipe("teglia_romana");
    let found = 0;
    for (let h = 0; h < 24; h++) {
      const start = at(26, h);
      const plan = optimizeComfort(r.timeline, start, r.fermentation_temp_c, at(26, 0));
      if (!plan) continue;
      found++;
      const coldByIndex = Object.fromEntries(r.timeline.map((s, i) => [i, isColdPhase(s.id, r.fermentation_temp_c)]));
      expect(movesHoursBetweenColdAndRoom(plan.stretch, coldByIndex)).toBe(false);
      expect(plan.nightCount).toBe(0);
      expect(countNightActives(r.timeline, plan.newStart.getTime(), plan.stretch)).toBe(0);
      // Il pasto non si sposta (al quarto d'ora).
      const end = buildCookPlan(r.timeline, { startAt: plan.newStart, stretch: plan.stretch }).readyAtMs;
      const original = start.getTime() + totalPlannedMinutes(r.timeline) * 60_000;
      expect(Math.abs(end - original)).toBeLessThanOrEqual(7.5 * 60_000);
      for (const [i, extra] of Object.entries(plan.stretch)) {
        const step = r.timeline[Number(i)];
        expect(FLEXIBLE_STEP_IDS.has(step.id)).toBe(true);
        expect(stretchOptions(step.duration_minutes, coldByIndex[Number(i)])).toContain(extra);
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  it("null sia senza notte sia quando non riesce: la UI legge le azioni notturne a parte (S09-A-03)", () => {
    const r = recipe("napoletana_stg");
    const day = defaultMealStart(r.timeline, at(26, 8));
    expect(optimizeComfort(r.timeline, day, r.fermentation_temp_c, at(26, 8))).toBeNull();
    expect(countNightActives(r.timeline, day.getTime())).toBe(0);
    // «Inizia ora» alle 16: azioni di notte; se il piano comodo non c'è, restano da dire.
    const now = at(26, 16);
    const plan = optimizeComfort(r.timeline, now, r.fermentation_temp_c, now);
    if (!plan) expect(countNightActives(r.timeline, now.getTime())).toBeGreaterThan(0);
  });
});

describe("(c) il preriscaldo dura e stesura e cottura vengono dopo (S10-A-02)", () => {
  for (const id of STYLES) for (const c of [P1, P3]) {
    it(`${id} ${c.oven_type}`, () => {
      const r = recipe(id, c);
      const plan = buildCookPlan(r.timeline, { startAt: at(26, 9) });
      const heat = plan.steps.find((s) => s.id === "preheat")!;
      expect(heat.plannedMin).toBeGreaterThan(0);
      for (const s of plan.steps.filter((s) => s.id === "shape" || s.id === "bake")) {
        if (s.index > heat.index) expect(s.startMs).toBeGreaterThanOrEqual(heat.endMs);
      }
      // In cucina: acceso il forno, la fine è inizio reale + durata, e il resto slitta.
      const session: SessionTiming[] = plan.steps.map((s) => ({ id: s.id, duration_minutes: s.plannedMin, startMs: s.startMs, endMs: s.endMs, done: false }));
      const lit = heat.startMs + 7 * 60_000;
      const after = startStepAt(session, heat.index, lit);
      expect(after[heat.index].actualStartMs).toBe(lit);
      expect(after[heat.index].endMs).toBe(lit + heat.plannedMin * 60_000);
      expect(after[heat.index + 1].startMs).toBe(after[heat.index].endMs);
    });
  }
});

describe("(d) pieghe e acclimatazione dei testi sono nel piano (S10-B-10, S09-A-07, S10-A-05)", () => {
  it("teglia romana e focaccia: un passo «Pieghe» prima della puntata, con numero × intervallo di FOLDING_DB", () => {
    for (const id of ["teglia_romana", "focaccia_genovese"]) {
      const r = recipe(id);
      const ids = r.timeline.map((s) => s.id);
      const folds = r.timeline.find((s) => s.id === "folds")!;
      const data = getFoldingByStyle(id)!;
      expect(folds, id).toBeDefined();
      expect(folds.duration_minutes).toBe(data.foldCount * data.foldInterval_min);
      expect(ids.indexOf("folds")).toBe(ids.indexOf("mix") + 1);
      expect(ids.indexOf("bulk")).toBe(ids.indexOf("folds") + 1);
      const desc = folds.msg?.description?.[0];
      expect(desc?.params).toEqual({ count: data.foldCount, interval: data.foldInterval_min });
      expect(desc?.key).toBe(r.fermentation_temp_c <= 6 ? "timeline.folds.descCold" : "timeline.folds.desc");
    }
  });

  it("in cantina (12 °C) le pieghe non mandano il contenitore in frigo: torna a 12 °C, come la puntata", () => {
    for (const id of ["teglia_romana", "napoletana_canotto"]) {
      const r = generateRecipe(STYLES_DB[id], P1, { customFermentationTempC: 12, customFermentationHours: 24 });
      expect(r.fermentation_temp_c, id).toBe(12);
      const folds = r.timeline.find((s) => s.id === "folds")!;
      const desc = folds.msg?.description?.[0];
      expect(desc?.key, id).toBe("timeline.folds.descCool");
      expect(desc?.params?.temp, id).toBe(12);
      expect(folds.description, id).not.toMatch(/metti il contenitore in frigo/);
      expect(folds.description, id).toMatch(/rimetti il contenitore a 12°C, non in frigo/);
      expect(r.timeline.find((s) => s.id === "bulk")!.description).toMatch(/12°C/);
    }
  });

  it("il frigo resta per la puntata fino a 6 °C; da 18 °C nessuna indicazione sul contenitore", () => {
    const keyAt = (t: number) =>
      generateRecipe(STYLES_DB.teglia_romana, P1, { customFermentationTempC: t, customFermentationHours: 24 })
        .timeline.find((s) => s.id === "folds")!.msg?.description?.[0]?.key;
    expect(keyAt(4)).toBe("timeline.folds.descCold");
    expect(keyAt(6)).toBe("timeline.folds.descCold");
    expect(keyAt(7)).toBe("timeline.folds.descCool");
    expect(keyAt(17)).toBe("timeline.folds.descCool");
    expect(keyAt(18)).toBe("timeline.folds.desc");
  });

  it("l'impasto senza impastatrice non scrive più un intervallo diverso da quello del passo", () => {
    const mix = recipe("teglia_romana").timeline.find((s) => s.id === "mix")!;
    expect(mix.description).not.toMatch(/30 min|1,5/);
  });

  it("la napoletana STG non ha pieghe", () => {
    expect(recipe("napoletana_stg").timeline.some((s) => s.id === "folds")).toBe(false);
  });

  it("le pieghe sono un'azione: contano per la notte", () => {
    expect(ACTIVE_STEP_IDS.has("folds")).toBe(true);
    expect(FLEXIBLE_STEP_IDS.has("folds")).toBe(false);
  });
});

describe("(e) il ri-ancoraggio conserva il piano comodo (S10-A-03)", () => {
  it("i passi dopo «Fatto» tengono le durate pianificate, estensioni comprese", () => {
    const r = recipe("teglia_romana");
    const stretch = { [r.timeline.findIndex((s) => s.id === "bulk")]: 120 };
    const plan = buildCookPlan(r.timeline, { startAt: at(26, 9), stretch });
    const session: SessionTiming[] = plan.steps.map((s) => ({ id: s.id, duration_minutes: s.plannedMin, startMs: s.startMs, endMs: s.endMs, done: false }));
    const late = plan.steps[0].endMs + 10 * 60_000;
    const after = completeStepAt(session, 0, late);
    expect(after[0].done).toBe(true);
    expect(after[0].endMs).toBe(late);
    for (let i = 1; i < after.length; i++) {
      expect(after[i].endMs - after[i].startMs).toBe(plan.steps[i].plannedMin * 60_000);
      expect(after[i].startMs).toBe(after[i - 1].endMs);
    }
    expect(sessionReadyAt(after)).toBe(plan.readyAtMs + 10 * 60_000);
  });

  it("cominciare un passo prima dell'orario anticipa la fine: l'anteprima la dice (S10-A-01)", () => {
    const r = recipe("focaccia_genovese");
    const plan = buildCookPlan(r.timeline, { startAt: at(26, 19, 25) });
    const session: SessionTiming[] = plan.steps.map((s) => ({ id: s.id, duration_minutes: s.plannedMin, startMs: s.startMs, endMs: s.endMs, done: false }));
    const now = at(26, 16, 6).getTime();
    expect(stepHasStarted(session[0], now)).toBe(false);
    const preview = previewStartNow(session, 0, now);
    expect(preview.readyAtMs).toBe(plan.readyAtMs - (plan.startMs - now));
    expect(preview.nightActions).toEqual(sessionNightActions(startStepAt(session, 0, now), now));
    expect(stepHasStarted(startStepAt(session, 0, now)[0], now)).toBe(true);
  });
});

describe("«Iniziare adesso?» solo se cambia ciò che si legge (revisione ondata 2)", () => {
  // Impasto alle 12:17 di venerdì, poi 96 min di lievitazione (flessibile) e 7 min di cottura: pronto alle 14:20, «ca. 14:15».
  const mixAt = at(30, 12, 17).getTime();
  const session: SessionTiming[] = [
    { id: "mix", duration_minutes: 20, startMs: mixAt, endMs: mixAt + 20 * 60_000, done: false },
    { id: "proof", duration_minutes: 96, startMs: mixAt + 20 * 60_000, endMs: mixAt + 116 * 60_000, done: false },
    { id: "bake", duration_minutes: 7, startMs: mixAt + 116 * 60_000, endMs: mixAt + 123 * 60_000, done: false },
  ];
  it("10 minuti prima, «ca. 14:15» resta «ca. 14:15»: niente dialogo", () => {
    const now = at(30, 12, 7).getTime();
    expect(previewStartNow(session, 0, now).readyAtMs).toBe(sessionReadyAt(session) - 10 * 60_000);
    expect(startNowNeedsConfirm(session, 0, now, true)).toBe(false);
  });
  it("senza «ca.» l'orario al minuto cambia: dialogo", () => {
    expect(startNowNeedsConfirm(session, 0, at(30, 12, 7).getTime(), false)).toBe(true);
  });
  it("un anticipo oltre il quarto d'ora cambia l'orario mostrato: dialogo", () => {
    expect(startNowNeedsConfirm(session, 0, at(30, 11, 30).getTime(), true)).toBe(true);
  });
  it("una nuova azione di notte chiede conferma anche se l'orario mostrato non cambia", () => {
    // «Impasto» alle 7:01 (fuori dalla notte), pronto alle 7:03: «ca. 7:00».
    const mix = at(31, 7, 1).getTime();
    const morning: SessionTiming[] = [
      { id: "proof", duration_minutes: 10, startMs: mix - 10 * 60_000, endMs: mix, done: false },
      { id: "mix", duration_minutes: 2, startMs: mix, endMs: mix + 2 * 60_000, done: false },
    ];
    // Cominciando alle 6:47 l'impasto cade alle 6:57, di notte; il pasto resta «ca. 7:00».
    const now = at(31, 6, 47).getTime();
    expect(displayedClockMs(previewStartNow(morning, 0, now).readyAtMs, true)).toBe(displayedClockMs(sessionReadyAt(morning), true));
    expect(startNowNeedsConfirm(morning, 0, now, true)).toBe(true);
    // Alle 6:52 l'impasto cade alle 7:02: niente di nuovo di notte, niente dialogo.
    expect(startNowNeedsConfirm(morning, 0, at(31, 6, 52).getTime(), true)).toBe(false);
  });
});

describe("(f) cotture in serie: recupero del forno e conti che tornano (S09-A-14, S09-B-13)", () => {
  for (const [id, c] of [["napoletana_stg", P1], ["napoletana_stg", P3], ["teglia_romana", P1]] as const) {
    it(`${id} ${c.oven_type}: secondi reali × giri + recupero fra i giri`, () => {
      const r = recipe(id, c);
      const bake = r.timeline.find((s) => s.id === "bake")!;
      const recovery = bakeRoundRecoverySec(c.oven_type);
      expect(bake.rounds).toBe(4);
      expect(bake.recovery_seconds).toBe(recovery);
      expect(bake.duration_minutes).toBe(Math.ceil((bake.round_seconds! * 4 + recovery * 3) / 60));
      // L'etichetta mostra i secondi veri, non un minuto arrotondato.
      const sec = bake.round_seconds!;
      if (sec >= 120 && sec % 60 !== 0) expect(bake.timing_label).toContain(`${Math.floor(sec / 60)} min ${Math.round(sec % 60)} s`);
    });
  }
});

describe("(g) «ca.» sull'orario incerto (S09-A-10)", () => {
  it("è incerto l'inizio del passo dopo un'attesa biologica, non l'inizio dell'attesa", () => {
    const r = recipe("napoletana_stg");
    const plan = buildCookPlan(r.timeline, { startAt: at(26, 9) });
    for (const s of plan.steps) {
      expect(s.approxStart).toBe(s.index > 0 && FLEXIBLE_STEP_IDS.has(r.timeline[s.index - 1].id));
      expect(approxStartAt(r.timeline, s.index)).toBe(s.approxStart);
    }
    const bulk = plan.steps.find((s) => s.id === "bulk")!;
    expect(bulk.approxStart).toBe(false);
    expect(plan.steps[bulk.index + 1].approxStart).toBe(true);
  });
});

describe("impronta della ricetta (S10-B-21)", () => {
  it("stabile per gli stessi passi, diversa se cambiano i panetti", () => {
    const parts = (c: UserConstraints) => recipe("napoletana_stg", c).timeline.flatMap((s) => [s.id, s.duration_minutes, s.description]);
    expect(recipeFingerprint(parts(P1))).toBe(recipeFingerprint(parts(P1)));
    expect(recipeFingerprint(parts(P1))).not.toBe(recipeFingerprint(parts({ ...P1, dough_balls: 6 })));
  });
});

describe("un solo avanzamento per barra e widget (G4a-WP-02, S10-B-23)", () => {
  const session = (): SessionTiming[] => {
    const r = recipe("teglia_romana");
    const plan = buildCookPlan(r.timeline, { startAt: at(26, 9) });
    return plan.steps.map((s) => ({ id: s.id, duration_minutes: s.plannedMin, startMs: s.startMs, endMs: s.endMs, done: false }));
  };

  it("0 all'inizio, 1 solo quando tutti i passi sono fatti", () => {
    const steps = session();
    expect(sessionProgress(steps, steps[0].startMs)).toBe(0);
    expect(sessionProgress(steps, steps[0].startMs - 3_600_000)).toBe(0);
    expect(sessionProgress(steps, sessionReadyAt(steps) + 3_600_000)).toBeLessThan(1);
    const all = steps.map((s) => ({ ...s, done: true }));
    expect(sessionProgress(all, steps[0].startMs)).toBe(1);
    expect(sessionProgress([], 0)).toBe(0);
  });

  it("cresce col tempo e con i passi fatti, mai sotto passi fatti sul totale", () => {
    let steps = session();
    let prev = -1;
    const t0 = steps[0].startMs;
    const end = sessionReadyAt(steps);
    for (let now = t0; now <= end; now += 20 * 60_000) {
      const p = sessionProgress(steps, now);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
    /* Ogni «Fatto» a orario non fa tornare indietro la barra. */
    prev = -1;
    steps = session();
    for (let i = 0; i < steps.length; i++) {
      const now = steps[i].endMs;
      steps = completeStepAt(steps, i, now);
      const p = sessionProgress(steps, now);
      expect(p).toBeGreaterThanOrEqual(prev);
      expect(p).toBeGreaterThanOrEqual((i + 1) / steps.length);
      prev = p;
    }
    expect(prev).toBe(1);
  });
});

describe("fine di un passo attivo cronometrato (G4a-WP-02, S10-B-04)", () => {
  const step = { id: "bake", duration_minutes: 8, startMs: 0, endMs: 8 * 60_000, done: false, flexible: false };
  it("solo se il conto alla rovescia è partito e arriva a zero", () => {
    expect(activeStepTimeUp(step, false, 9 * 60_000)).toBe(false);
    const started = { ...step, actualStartMs: 0 };
    expect(activeStepTimeUp(started, false, 7 * 60_000)).toBe(false);
    expect(activeStepTimeUp(started, false, 8 * 60_000)).toBe(true);
  });
  it("mai per attese, passi senza durata o già fatti", () => {
    const started = { ...step, actualStartMs: 0 };
    expect(activeStepTimeUp({ ...started, flexible: true }, true, 9 * 60_000)).toBe(false);
    expect(activeStepTimeUp(started, true, 9 * 60_000)).toBe(false);
    expect(activeStepTimeUp({ ...started, duration_minutes: 0 }, false, 9 * 60_000)).toBe(false);
    expect(activeStepTimeUp({ ...started, done: true }, false, 9 * 60_000)).toBe(false);
  });
});
