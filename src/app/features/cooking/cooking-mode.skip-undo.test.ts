import { describe, expect, it } from "vitest";
import {
  FLEXIBLE_STEP_IDS,
  completeStepAt,
  previewCompleteNow,
  readyCriterionKey,
  sessionReadyAt,
} from "../../use-cases/cook-timing";
import { applyCookSnapshot, takeCookSnapshot, type CookSessionStep } from "./cook-session";
import { CMS_DEFAULTS } from "../cms/cms-context";
import { STYLES_DB, type UserConstraints } from "../../domain/pizza-engine";
import { isColdPhase } from "../../use-cases/cook-timing";
import { learningPathRecipe } from "../../use-cases/learning-path";

/* S10-B-11, S10-A-15 — «L'impasto è già pronto?» con conferma e «Fatto»
 * annullabile. Vitest gira in Node, senza DOM: qui la logica che la vista usa
 * (anteprima pura per il dialog, fotografia e ripristino per «Annulla»); il
 * percorso coi tocchi è verificato nel browser con Playwright. */

const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 29, 9, 0);

function step(id: string, startMin: number, minutes: number, extra: Partial<CookSessionStep> = {}): CookSessionStep {
  return {
    id,
    title: id,
    description: "",
    duration_minutes: minutes,
    startMs: T0 + startMin * MIN,
    endMs: T0 + (startMin + minutes) * MIN,
    flexible: FLEXIBLE_STEP_IDS.has(id),
    done: false,
    quantities: [{ label: "Farina", value: "500 g" }],
    ...extra,
  };
}

/** Impasto fatto, puntata di 10 h in corso, poi staglio, appretto, cottura. */
function session() {
  return {
    styleName: "Napoletana",
    notified: ["mix0"],
    steps: [
      step("mix", 0, 20, { done: true }),
      step("bulk", 20, 600),
      step("divide", 620, 15),
      step("proof", 635, 240),
      step("bake", 875, 10),
    ],
  };
}

describe("«L'impasto è già pronto?» — anteprima per la conferma", () => {
  it("(a) aprire il dialog non cambia la sessione: l'anteprima è pura", () => {
    const s = session();
    const before = JSON.parse(JSON.stringify(s.steps));
    const now = T0 + 300 * MIN;
    const preview = previewCompleteNow(s.steps, 1, now);
    expect(s.steps).toEqual(before);
    // Fine pizzata anticipata dei 320 minuti che mancavano alla puntata.
    expect(sessionReadyAt(s.steps) - preview.readyAtMs).toBe(320 * MIN);
  });

  it("(b) confermare chiude la puntata e anticipa i passi successivi", () => {
    const s = session();
    const now = T0 + 300 * MIN;
    const next = completeStepAt(s.steps, 1, now);
    expect(next[1].done).toBe(true);
    expect(next[1].endMs).toBe(now);
    expect(next[2].startMs).toBe(now);
    expect(next[4].endMs).toBe(previewCompleteNow(s.steps, 1, now).readyAtMs);
  });

  it("ogni attesa flessibile ha il suo criterio di prontezza, in tutte le lingue di default", () => {
    for (const id of FLEXIBLE_STEP_IDS) {
      expect(readyCriterionKey(id)).toBe(id);
      expect(CMS_DEFAULTS.cooking.readyCriterion[readyCriterionKey(id)]).toBeTruthy();
    }
    expect(readyCriterionKey("rest")).toBe("default");
    expect(CMS_DEFAULTS.cooking.finishedEarly).toBe("L'impasto è già pronto?");
    expect(CMS_DEFAULTS.cooking.waitingReadyAt).toContain("impasto pronto {eta}");
  });
});

describe("«L'impasto è già pronto?» — puntata in frigo (S13-B-02)", () => {
  /* Il motore non chiede di raddoppiare una puntata fredda (tip «in frigo
   * cresce lento»): il criterio del dialog deve dire la stessa cosa. */
  const P1: UserConstraints = {
    oven_type: "home", oven_max_temp_c: 250, skill_level: 1, available_hours: 24, meal_deadline: false,
    dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false,
    dietary_filters: [], kitchen_temp_c: 22, pantry_flours: [], pantry_yeasts: [],
  };

  it("teglia romana del percorso Impara (P1): puntata a 4 °C → criterio «bulkCold», non «volume raddoppiato»", () => {
    const recipe = learningPathRecipe(STYLES_DB.teglia_romana, P1);
    const bulk = recipe.timeline.find((s) => s.id === "bulk")!;
    const cold = isColdPhase(bulk.id, recipe.fermentation_temp_c);
    expect(cold).toBe(true);
    expect(bulk.tip?.beginner).toContain("cresce lento");
    const key = readyCriterionKey(bulk.id, cold);
    expect(key).toBe("bulkCold");
    expect(CMS_DEFAULTS.cooking.readyCriterion[key]).not.toMatch(/raddoppi/);
  });

  it("solo la puntata cambia: appretto e prefermento freddi restano coi loro criteri", () => {
    expect(readyCriterionKey("bulk", false)).toBe("bulk");
    expect(readyCriterionKey("bulk")).toBe("bulk");
    expect(readyCriterionKey("proof", true)).toBe("proof");
    expect(readyCriterionKey("rest", true)).toBe("default");
  });
});

describe("«Annulla» dopo un completamento", () => {
  const timing = (steps: CookSessionStep[]) => steps.map(({ done, startMs, endMs, actualStartMs }) => ({ done, startMs, endMs, actualStartMs }));

  it("(c) dopo la conferma, «Annulla» rimette passi e orari della fotografia", () => {
    const s = session();
    const snap = takeCookSnapshot(s);
    const after = { ...s, steps: completeStepAt(s.steps, 1, T0 + 300 * MIN), notified: [...s.notified, "divide2"] };
    const restored = applyCookSnapshot(after, snap);
    expect(timing(restored.steps)).toEqual(timing(session().steps));
    expect(restored.steps).toEqual(session().steps);
    // La notifica del passo successivo, già segnata, torna in coda.
    expect(restored.notified).toEqual(["mix0"]);
    expect(restored.styleName).toBe("Napoletana");
  });

  it("(d) «Fatto» su un passo attivo, poi «Annulla»: orari come prima", () => {
    const s = session();
    s.steps = completeStepAt(s.steps, 1, T0 + 620 * MIN);
    const reference = JSON.parse(JSON.stringify(s.steps));
    const snap = takeCookSnapshot(s);
    // Staglio finito in ritardo di 25 minuti: il resto slitta.
    const after = { ...s, steps: completeStepAt(s.steps, 2, T0 + 660 * MIN) };
    expect(after.steps[3].startMs).toBe(T0 + 660 * MIN);
    const restored = applyCookSnapshot(after, snap);
    expect(timing(restored.steps)).toEqual(timing(reference));
  });

  it("la fotografia è una copia: completare dopo non la tocca", () => {
    const s = session();
    const snap = takeCookSnapshot(s);
    s.steps[1].done = true;
    s.steps[1].quantities![0].value = "x";
    s.notified.push("bulk1");
    expect(snap.steps[1].done).toBe(false);
    expect(snap.steps[1].quantities![0].value).toBe("500 g");
    expect(snap.notified).toEqual(["mix0"]);
  });
});
