import { describe, expect, it } from "vitest";
import { STYLES_DB, generateRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { UI_MESSAGES_IT } from "../../i18n/ui-messages.it";
import { roundStatus, roundsCtaState, turnPointsSec, type RoundStatusInput } from "./bake-rounds-status";

/* FW-19 (revisione): il timer per giro segue la variante del passo (forno o
 * olio) e le rotazioni dello stile, non un «mezzo giro» per tutti. */

const base: RoundStatusInput = { phase: "baking", elapsedSec: 0, roundSec: 120, round: 1, rounds: 4, turns: 1 };
const at = (elapsedSec: number, over: Partial<RoundStatusInput> = {}) => roundStatus({ ...base, ...over, elapsedSec });

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
const bakeStep = (id: string) => generateRecipe(STYLES_DB[id], P1).timeline.find((s) => s.id === "bake")!;

describe("stato del timer per giro", () => {
  it("una rotazione: «gira» a metà, prima il conto alla rovescia", () => {
    expect(at(59).key).toBe("remaining");
    expect(at(60).key).toBe("turn");
    expect(at(119).key).toBe("turn");
  });

  it("nessuna rotazione (Chicago, Recco, padellino): mai «gira»", () => {
    for (const t of [0, 30, 60, 90, 119]) expect(at(t, { turns: 0 }).key).toBe("remaining");
  });

  it("tre rotazioni (napoletana): tre promemoria a intervalli uguali, senza «mezzo giro»", () => {
    expect(turnPointsSec(120, 3)).toEqual([30, 60, 90]);
    expect(at(29, { turns: 3 }).key).toBe("remaining");
    expect(at(30, { turns: 3 })).toEqual({ key: "rotate", turnIndex: 1, turnCount: 3 });
    expect(at(60, { turns: 3 })).toEqual({ key: "rotate", turnIndex: 2, turnCount: 3 });
    expect(at(95, { turns: 3 })).toEqual({ key: "rotate", turnIndex: 3, turnCount: 3 });
    expect(UI_MESSAGES_IT["cooking.rounds.rotate"]).not.toMatch(/mezzo giro/);
  });

  it("fuori dalla cottura: pronto, sfornata, tutte fatte", () => {
    expect(roundStatus({ ...base, phase: "idle", round: 0 }).key).toBe("ready");
    expect(roundStatus({ ...base, phase: "out", round: 2 }).key).toBe("out");
    expect(roundStatus({ ...base, phase: "out", round: 4 }).key).toBe("allDone");
  });

  it("la frittura ha testi propri: niente forno, niente mezzo giro", () => {
    for (const k of ["label", "progress", "ready", "start", "remaining", "turn", "out", "allDone"]) {
      const text = UI_MESSAGES_IT[`cooking.rounds.fry.${k}`];
      expect(text, k).toBeDefined();
      expect(text, k).not.toMatch(/[Ii]nforn|[Ss]forn|mezzo giro|forno/);
    }
  });
});

describe("il motore passa al timer variante e rotazioni dello stile", () => {
  it("stili fritti: variante fry, più giri", () => {
    for (const id of ["pizza_fritta", "pizza_montanara", "pizza_fritta_tonda"]) {
      const bake = bakeStep(id);
      expect(bake.variant, id).toBe("fry");
      expect(bake.rounds, id).toBeGreaterThan(1);
    }
  });

  it("rotazioni da BAKING_TIMES_DB: 0 per Chicago, Recco e padellino, 3 per la napoletana", () => {
    expect(bakeStep("chicago_deep").turns).toBe(0);
    expect(bakeStep("focaccia_recco").turns).toBe(0);
    expect(bakeStep("padellino_torino").turns).toBe(0);
    expect(generateRecipe(STYLES_DB.napoletana_stg, { ...P1, oven_type: "electric_high", oven_max_temp_c: 509 })
      .timeline.find((s) => s.id === "bake")!.turns).toBe(3);
    expect(bakeStep("teglia_romana").turns).toBe(1);
  });
});

describe("pulsante del giro e focus (WCAG 2.4.3)", () => {
  it("resta montato e inattivo mentre cuoce, sparisce solo a fine giri", () => {
    expect(roundsCtaState("idle", false)).toBe("enabled");
    expect(roundsCtaState("baking", false)).toBe("waiting");
    expect(roundsCtaState("out", false)).toBe("enabled");
    expect(roundsCtaState("out", true)).toBe("hidden");
  });
});
