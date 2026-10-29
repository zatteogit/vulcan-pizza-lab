import { describe, expect, it } from "vitest";
import { createEntryTime, recommendationSections, shouldAskForOven } from "./create-entry";
import {
  NO_PREFERENCE_SLOT,
  STYLES_DB,
  isFriedStyle,
  recommendStyles,
  suggestedTimeSlot,
  generateRecipe,
  type UserConstraints,
} from "./pizza-engine";
import { CMS_DEFAULTS } from "../features/cms/cms-context";
import { AUTHENTICITY_FUEL_CAP, DEFAULT_UI_SCORE_WEIGHTS, explainScore } from "./recipe-score";
import { compareByCompatibility, kitchenMargin } from "./kitchen-margin";

/* Guardie delle decisioni di Matteo (docs/autorialita.md). Una PR le aveva
 * annullate senza registrarne di nuove (audit 28/10/2026, S05-V-01). Chi
 * rovescia una decisione cambia il test qui sotto E registra una nuova D-0xx
 * nel registro (docs/autorialita.md §7 Manutenzione). */

const SOURCES = import.meta.glob(
  [
    "/src/app/pages/home.tsx",
    "/src/app/pages/profile.tsx",
    "/src/app/features/recipe/user-needs.tsx",
    "/src/app/features/recipe/oven-first-notice.tsx",
    "/src/app/features/recipe/recommended-styles.tsx",
    "/src/app/pages/explore.tsx",
    "/src/app/agent/mcp-tools.ts",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const source = (path: string): string => {
  const text = SOURCES[`/src/app/${path.replace(/^\.\.\//, "")}`];
  if (text === undefined) throw new Error(`Sorgente non trovato: ${path}`);
  return text;
};

const homeKitchen: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, available_hours: 24, meal_deadline: true, dough_balls: 2, skill_level: 1,
  has_mixer: false, has_baking_pan: true, has_pizza_stone: false, has_pizza_steel: false,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};

describe("D-036: Crea si apre sul momento consigliato", () => {
  it("senza bozza lo slot iniziale è suggestedTimeSlot, non «Nessuna preferenza»", () => {
    for (const hour of [7, 12, 15, 18, 22]) {
      const now = new Date(2026, 9, 28, hour, 10);
      const entry = createEntryTime(now.getTime());
      const suggested = suggestedTimeSlot(now);
      expect(entry).not.toBeNull();
      expect(entry!.slotId).toBe(suggested!.id);
      expect(entry!.slotId).not.toBe(NO_PREFERENCE_SLOT.id);
      expect(entry!.hours).toBe(suggested!.hours);
      expect(entry!.hours).toBeGreaterThan(0);
      expect(entry!.targetAt).toBeGreaterThan(now.getTime());
    }
  });

  it("il momento consigliato è quello più vicino alle 24 h", () => {
    const now = new Date(2026, 9, 28, 15, 0);
    const suggested = suggestedTimeSlot(now)!;
    expect(Math.abs(suggested.hours - 24)).toBeLessThanOrEqual(6);
  });

  it("la pagina Crea usa createEntryTime e il badge «Consigliato» non dipende dall'assenza di scelta", () => {
    expect(source("../pages/home.tsx")).toMatch(/createEntryTime\(/);
    const needs = source("../features/recipe/user-needs.tsx");
    expect(needs).toMatch(/const suggested = slot\.id === suggestedSlot;/);
    expect(needs).not.toMatch(/suggestedSlot && !selectedTimeSlot/);
  });
});

describe("D-038: l'avviso di Crea chiede solo il forno, finché non è scelto", () => {
  it("compare solo senza forno salvato e finché non è congedato", () => {
    expect(shouldAskForOven({ ovenSaved: false, dismissed: false })).toBe(true);
    expect(shouldAskForOven({ ovenSaved: true, dismissed: false })).toBe(false);
    expect(shouldAskForOven({ ovenSaved: false, dismissed: true })).toBe(false);
  });

  it("l'avviso legge il forno salvato (vulcan_oven_pref), non un flag indipendente", () => {
    const notice = source("../features/recipe/oven-first-notice.tsx");
    expect(notice).toMatch(/"vulcan_oven_pref"/);
    expect(notice).toMatch(/shouldAskForOven\(/);
    expect(source("../pages/home.tsx")).toMatch(/<OvenFirstNotice/);
  });

  it("l'onboarding del profilo salva il forno, quindi dopo l'onboarding l'avviso non ricompare", () => {
    expect(source("../pages/profile.tsx")).toMatch(/saveJson\(OVEN_STORAGE_KEY/);
    expect(source("../pages/profile.tsx")).toMatch(/OVEN_STORAGE_KEY = "vulcan_oven_pref"/);
  });
});

describe("D-032: le fritte stanno in una sezione a parte dei consigli", () => {
  it("con il forno di casa nessuna fritta è in «Perfetti per te» o fra i fattibili", () => {
    const recs = recommendStyles(homeKitchen);
    expect(recs.some((rec) => isFriedStyle(rec.style) && rec.tier !== "not_feasible")).toBe(true);
    const sections = recommendationSections(recs);
    for (const section of sections) {
      if (section.key === "perfect" || section.key === "good") {
        expect(section.items.filter((rec) => isFriedStyle(rec.style))).toEqual([]);
      }
    }
    const fried = sections.find((section) => section.key === "fried");
    expect(fried?.items.length).toBeGreaterThan(0);
    expect(fried!.items.every((rec) => isFriedStyle(rec.style) && rec.tier !== "not_feasible")).toBe(true);
    const keys = sections.map((section) => section.key);
    expect(keys.indexOf("fried")).toBeGreaterThan(Math.max(keys.indexOf("perfect"), keys.indexOf("good")));
  });

  it("nessuno stile si perde nel raggruppamento", () => {
    const recs = recommendStyles(homeKitchen);
    const total = recommendationSections(recs).reduce((sum, section) => sum + section.items.length, 0);
    expect(total).toBe(recs.length);
    expect(Object.values(STYLES_DB).some(isFriedStyle)).toBe(true);
  });

  it("i consigli di Crea usano recommendationSections e la sezione ha un titolo nel CMS", () => {
    expect(source("../features/recipe/recommended-styles.tsx")).toMatch(/recommendationSections\(/);
    expect(CMS_DEFAULTS.tiers.fried?.label).toBeTruthy();
  });
});

/* FW-17 — D-P (audit 28/10/2026): niente biga o poolish col lievito madre
 * finché non c'è una fonte per i parametri; la ricetta lo dice. */
describe("D-P: biga e poolish solo col lievito di birra", () => {
  it("col solo lievito madre il prefermento non si calcola e c'è la spiegazione", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_canotto, { ...homeKitchen, pantry_yeasts: ["sourdough"], available_hours: 48 }, {
      usePreFerment: true,
      preFerment: { type: "biga" },
      customFermentationHours: 24,
    });
    expect(recipe.has_pre_ferment).toBe(false);
    expect(recipe.method_changes?.some((m) => m.key === "preferment.sourdoughInstead")).toBe(true);
  });
});

/* FW-06 · D-057 (D-E dell'audit): la «Compatibilità con la tua cucina» pesa solo
 * fattibilità (facilità) e fedeltà allo stile (autenticità). Le altre
 * dimensioni restano calcolate e si mostrano a parte, con peso 0. */
describe("D-057: la compatibilità pesa solo facilità e autenticità", () => {
  it("pesi dell'app e del CMS: zero per maturazione, sostenibilità e sperimentazione", () => {
    expect(DEFAULT_UI_SCORE_WEIGHTS.digestibility).toBe(0);
    expect(DEFAULT_UI_SCORE_WEIGHTS.sustainability).toBe(0);
    expect(DEFAULT_UI_SCORE_WEIGHTS.experimentation).toBe(0);
    expect(DEFAULT_UI_SCORE_WEIGHTS.authenticity).toBeGreaterThan(0);
    expect(DEFAULT_UI_SCORE_WEIGHTS.feasibility).toBeGreaterThan(0);
    for (const key of ["authenticity", "feasibility", "digestibility", "sustainability", "experimentation"] as const) {
      expect(CMS_DEFAULTS.scoreDimensions[key].weight).toBe(DEFAULT_UI_SCORE_WEIGHTS[key]);
    }
  });

  it("una ricetta con maturazione e sostenibilità a zero non perde punti", () => {
    const full = { authenticity: 90, feasibility: 80, digestibility: 100, sustainability: 100, experimentation: 0 };
    const empty = { ...full, digestibility: 0, sustainability: 0, experimentation: 100 };
    expect(explainScore(empty, DEFAULT_UI_SCORE_WEIGHTS, "ok").score).toBe(explainScore(full, DEFAULT_UI_SCORE_WEIGHTS, "ok").score);
  });
});

/* D-062 (Matteo, 29/10/2026): a pari numero mostrato, dentro lo stesso gruppo,
 * prima lo stile che la cucina copre con più margine di forno e tempo. Il
 * numero non cambia. Vale in Crea, in Scopri (anteprima per cucina) e in
 * recommend_styles (MCP). */
describe("D-062: spareggio per margine della cucina", () => {
  const pizzaOven: UserConstraints = { ...homeKitchen, oven_type: "electric_high", oven_max_temp_c: 450, available_hours: 48, meal_deadline: false, has_pizza_stone: true };

  it("dentro un gruppo, a pari numero il margine decide e il numero non cambia", () => {
    const recs = recommendStyles(pizzaOven);
    const before = new Map(recs.map((r) => [r.style.id, r.recipe.scores.composite]));
    const score = (r: (typeof recs)[number]) => ({ score: r.recipe.scores.composite, margin: kitchenMargin(r.style, pizzaOven) });
    const sections = recommendationSections(recs, (items) => [...items].sort((a, b) => compareByCompatibility(score(a), score(b))));
    let ties = 0;
    for (const section of sections) {
      section.items.forEach((item, i) => {
        expect(item.recipe.scores.composite).toBe(before.get(item.style.id));
        const next = section.items[i + 1];
        if (!next) return;
        expect(Math.round(item.recipe.scores.composite)).toBeGreaterThanOrEqual(Math.round(next.recipe.scores.composite));
        if (Math.round(item.recipe.scores.composite) === Math.round(next.recipe.scores.composite)) {
          ties++;
          expect(kitchenMargin(item.style, pizzaOven)).toBeGreaterThanOrEqual(kitchenMargin(next.style, pizzaOven));
        }
      });
    }
    expect(ties).toBeGreaterThan(0);
  });

  it("Crea, Scopri e recommend_styles usano lo stesso confronto", () => {
    expect(source("../features/recipe/recommended-styles.tsx")).toMatch(/compareByCompatibility\(/);
    expect(source("../pages/explore.tsx")).toMatch(/compareByCompatibility\(/);
    expect(source("../agent/mcp-tools.ts")).toMatch(/compareByCompatibility\(/);
  });

  it("lo spareggio è dichiarato nella spiegazione del punteggio, come scelta", () => {
    expect(CMS_DEFAULTS.scoreExplainer.tieBreak).toMatch(/Scelta di prodotto/);
    expect(CMS_DEFAULTS.science.notes["ranking-tiebreak"]?.l1).toMatch(/scelta di \{brand\}/);
  });
});

/* D-063 (Matteo, 29/10/2026): il tetto di autenticità per il combustibile vale
 * solo se il forno non arriva alla temperatura minima dello stile. Con il
 * forno che ci arriva, la legna prevista è un'informazione, non una penalità. */
describe("D-063: tetto del combustibile solo sotto il minimo dello stile", () => {
  const electric = (temp: number): UserConstraints => ({ ...homeKitchen, oven_type: "electric_high", oven_max_temp_c: temp, available_hours: 48, meal_deadline: false, skill_level: 4, has_pizza_stone: true });

  it("Napoletana STG con forno elettrico a 450 °C (≥ 430): niente tetto, niente −15", () => {
    const style = STYLES_DB.napoletana_stg;
    expect(450).toBeGreaterThanOrEqual(style.baking.temp_c_range[0]);
    const recipe = generateRecipe(style, electric(450));
    const keys = recipe.scores.penalties.map((p) => p.key);
    expect(recipe.scores.authenticity).toBeGreaterThan(AUTHENTICITY_FUEL_CAP);
    expect(keys).toContain("auth.woodByMethod");
    expect(keys).not.toContain("auth.fuelCap");
    expect(keys).not.toContain("auth.notWoodOven");
  });

  it("Pizza al Metro con forno elettrico sotto i suoi 300 °C minimi: il tetto resta", () => {
    const style = STYLES_DB.pizza_al_metro;
    const recipe = generateRecipe(style, electric(style.baking.temp_c_range[0] - 10));
    const keys = recipe.scores.penalties.map((p) => p.key);
    expect(recipe.scores.authenticity).toBeLessThanOrEqual(AUTHENTICITY_FUEL_CAP);
    expect(keys).toContain("auth.notWoodOven");
    expect(keys).not.toContain("auth.woodByMethod");
  });

  it("con il forno a legna nessun messaggio sul combustibile", () => {
    const recipe = generateRecipe(STYLES_DB.napoletana_stg, { ...electric(480), oven_type: "wood" });
    const keys = recipe.scores.penalties.map((p) => p.key);
    expect(keys.filter((k) => ["auth.woodByMethod", "auth.notWoodOven", "auth.fuelCap"].includes(k))).toEqual([]);
  });
});
