import { describe, expect, it } from "vitest";
import { createEntryTime, recommendationSections, shouldAskForOven } from "./create-entry";
import {
  NO_PREFERENCE_SLOT,
  STYLES_DB,
  isFriedStyle,
  recommendStyles,
  suggestedTimeSlot,
  type UserConstraints,
} from "./pizza-engine";
import { CMS_DEFAULTS } from "../features/cms/cms-context";
import { DEFAULT_UI_SCORE_WEIGHTS, explainScore } from "./recipe-score";

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
