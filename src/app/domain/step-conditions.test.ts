import { describe, expect, it } from "vitest";
import { STYLES_DB, generateRecipe, type UserConstraints } from "./pizza-engine";
import { BASIL_BEFORE_BAKE_MAX_SEC, HIGH_HYDRATION_PCT } from "./science/engine-facts";
import { toppingBakeLength } from "./step-thresholds";
import { localizeStep } from "../features/recipe/recipe-output-format";
import { IT_LOCALE } from "../features/cms/locales/it";
import { createFormatter } from "../features/cms/i18n";
import { getScienceNote } from "../data/science-notes";

/* G3-WP-03 (S09-A-13): i passi danno un solo comando per la ricetta e la
   cucina dell'utente; le condizioni che il motore conosce le risolve lui. */

const base: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, available_hours: 48, meal_deadline: false, dough_balls: 2, skill_level: 3,
  has_mixer: false, has_baking_pan: true, has_pizza_stone: true, has_pizza_steel: false,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};
const P1_HOME: UserConstraints = { ...base };
const P3_EFFEUNO: UserConstraints = { ...base, oven_type: "electric_high", oven_max_temp_c: 509 };

const step = (c: UserConstraints, id: string, options = {}) =>
  generateRecipe(STYLES_DB.napoletana_stg, c, options).timeline.find((s) => s.id === id);

describe("G3-WP-03: passi senza condizioni che il motore sa risolvere", () => {
  it("soglie dichiarate come fatti del motore e nota nel registro", () => {
    expect(HIGH_HYDRATION_PCT).toBe(75);
    expect(BASIL_BEFORE_BAKE_MAX_SEC).toBe(120);
    expect(toppingBakeLength(BASIL_BEFORE_BAKE_MAX_SEC)).toBe("short");
    expect(toppingBakeLength(BASIL_BEFORE_BAKE_MAX_SEC + 1)).toBe("long");
    expect(getScienceNote("basil-timing")?.kind).toBe("editorial");
    expect(IT_LOCALE.science?.notes["basil-timing"]?.l1).toBeTruthy();
  });

  it("Napoletana STG con forno elettrico ad alta temperatura (P3): basilico prima del forno", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, P3_EFFEUNO);
    expect(r.cook_time_sec).toBeLessThanOrEqual(BASIL_BEFORE_BAKE_MAX_SEC);
    const s = r.timeline.find((x) => x.id === "spread_margherita_avpn")!;
    expect(s.bake_length).toBe("short");
    expect(s.description).toMatch(/basilico fresco prima di infornare/);
    expect(s.description).not.toMatch(/appena sfornata|\bse\b/i);
  });

  it("stessa ricetta con il forno di casa a 250 °C (P1): basilico appena sfornata", () => {
    const s = step(P1_HOME, "spread_margherita_avpn")!;
    expect(s.bake_length).toBe("long");
    expect(s.description).toMatch(/basilico fresco mettilo appena sfornata/);
    expect(s.description).not.toMatch(/prima di infornare|\bse\b/i);
  });

  it("il «Come si fa» dichiara la soglia, formattata nella lingua attiva", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, P1_HOME);
    const s = r.timeline.find((x) => x.id === "spread_margherita_avpn")!;
    const it = localizeStep(s, r, IT_LOCALE, createFormatter(IT_LOCALE.ui, "it-IT"));
    expect(it.tip?.nerd).toMatch(/Con cotture fino a 2 min/);
    expect(it.tip?.nerd).not.toMatch(/\{sec\}/);
  });

  it("impasto a mano: slap & fold solo sopra la soglia di idratazione", () => {
    const high = step(P1_HOME, "mix", { customHydration: 80 })!;
    expect(high.description).toMatch(/slap & fold/);
    const low = step(P1_HOME, "mix", { customHydration: 60 })!;
    expect(low.description).not.toMatch(/slap & fold/);
    for (const s of [high, low]) {
      expect(s.description).not.toMatch(/se l'idratazione/i);
      expect(s.tip?.nerd).toContain(`${HIGH_HYDRATION_PCT}%`);
    }
  });

  it("nessun passo, in nessuno stile, chiede all'utente di decidere su idratazione o cottura", () => {
    const ideal: UserConstraints = { ...base, oven_type: "wood", oven_max_temp_c: 485, has_mixer: true };
    for (const style of Object.values(STYLES_DB)) {
      for (const c of [ideal, P1_HOME, P3_EFFEUNO]) {
        const r = generateRecipe(style, c);
        for (const s of r.timeline) {
          const loc = localizeStep(s, r, IT_LOCALE);
          const text = [s.description, loc.description, loc.longDesc ?? "", loc.tip?.beginner ?? "", loc.tip?.nerd ?? ""].join(" ");
          expect(text, `${style.id} · ${s.id}`).not.toMatch(/se l'idratazione|se la cottura|se idratazione/i);
        }
      }
    }
  });
});
