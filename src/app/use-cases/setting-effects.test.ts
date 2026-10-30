import { describe, expect, it } from "vitest";
import { generateRecipe, optimizeRecipe, STYLES_DB, type UserConstraints } from "../domain/pizza-engine";
import { IT_LOCALE } from "../features/cms/locales/it";
import { CHECKED_DIETS, REMINDER_DIETS, SETTING_EFFECTS, settingEffect, skillEffectFacts, type SettingId } from "./setting-effects";

const kitchen: UserConstraints = {
  oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 0, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: false, pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};
const napoletana = STYLES_DB.napoletana_stg;
const recipe = (patch: Partial<UserConstraints>, style = napoletana, hours = 24) =>
  generateRecipe(style, { ...kitchen, ...patch }, { customFermentationHours: hours });
const json = (value: unknown) => JSON.stringify(value);
/* Il Profilo e i suoi componenti (features/profile): lì vive ogni controllo della cucina. */
const PROFILE_SOURCES = import.meta.glob(["../pages/profile.tsx", "../features/profile/*.tsx"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/* Per ogni impostazione che dichiara «cambia la ricetta», due valori diversi
 * devono dare un output diverso del motore. */
const PROBES: Partial<Record<SettingId, () => [unknown, unknown]>> = {
  oven: () => [recipe({}).oven_temp_c, recipe({ oven_type: "wood", oven_max_temp_c: 485, oven_capacity_temp_c: 485 }).oven_temp_c],
  ovenHeat: () => [json(recipe({ oven_heat_profile: "static_top_bottom" }).timeline), json(recipe({ oven_heat_profile: "top_grill" }).timeline)],
  skill: () => {
    const style = STYLES_DB.teglia_romana;
    return [optimizeRecipe(style, { ...kitchen, skill_level: 1 }).recipe.hydration_pct, optimizeRecipe(style, { ...kitchen, skill_level: 4 }).recipe.hydration_pct];
  },
  mixer: () => [json(recipe({ mixer_type: "hands" }).timeline), json(recipe({ mixer_type: "spiral", has_mixer: true }).timeline)],
  surfaces: () => [json(recipe({ surfaces: [] })), json(recipe({ surfaces: ["steel_plate"], has_pizza_steel: true }))],
  pantry: () => [recipe({ pantry_yeasts: ["fresh"] }, napoletana, 48).yeast_type, recipe({ pantry_yeasts: ["sourdough"] }, STYLES_DB.teglia_romana, 48).yeast_type],
};

describe("FW-16 · effetti delle impostazioni", () => {
  it("ogni impostazione ha una frase nel CMS", () => {
    for (const { id } of SETTING_EFFECTS) expect(IT_LOCALE.settingEffects[id], id).toBeTruthy();
  });

  it("ogni controllo della cucina nel Profilo mostra il suo effetto", () => {
    const profile = Object.values(PROFILE_SOURCES).join("\n");
    for (const { id } of SETTING_EFFECTS) expect(profile, id).toContain(`settingId="${id}"`);
  });

  it("«cambia la ricetta» è vero sul motore", () => {
    for (const entry of SETTING_EFFECTS.filter((e) => e.effect === "changesRecipe")) {
      const probe = PROBES[entry.id];
      expect(probe, `manca la prova per ${entry.id}`).toBeDefined();
      const [a, b] = probe!();
      expect(a, entry.id).not.toEqual(b);
    }
  });

  it("le diete avvisano ma non cambiano dosi né tempi", () => {
    const base = recipe({});
    for (const diet of [...CHECKED_DIETS, ...REMINDER_DIETS]) {
      const filtered = recipe({ dietary_filters: [diet] });
      expect(filtered.hydration_pct, diet).toBe(base.hydration_pct);
      expect(filtered.yeast_type, diet).toBe(base.yeast_type);
      expect(filtered.fermentation_hours, diet).toBe(base.fermentation_hours);
      expect([filtered.flour_g, filtered.water_g, filtered.salt_g], diet).toEqual([base.flour_g, base.water_g, base.salt_g]);
    }
    expect(settingEffect("dietReminder").effect).toBe("warnsOnly");
  });

  it("i fatti del livello vengono dal motore (68/78/88 %, nessun tetto per Esperto)", () => {
    expect(skillEffectFacts()).toEqual([
      { level: 1, hydrationCeilingPct: 68, offersPreFerment: false },
      { level: 2, hydrationCeilingPct: 78, offersPreFerment: true },
      { level: 3, hydrationCeilingPct: 88, offersPreFerment: true },
      { level: 4, hydrationCeilingPct: null, offersPreFerment: true },
    ]);
  });

  /* FW-16/FW-08: le frasi del livello dicono dove vale il tetto. Il tetto è in
   * optimizeRecipe (hCeil = min(hMax, tetto), hLo = min(hMin, hCeil)): vale per
   * le ricette adattate (Crea, modalità adattata) e può scendere sotto
   * l'intervallo dello stile; generateRecipe (scheda di riferimento) non lo applica. */
  it("Principiante: il tetto porta l'acqua proposta sotto l'intervallo dello stile, la scheda di riferimento no", () => {
    const below = Object.values(STYLES_DB).filter((style) => {
      const proposed = optimizeRecipe(style, { ...kitchen, skill_level: 1 }).recipe.hydration_pct;
      return proposed < style.dough.hydration_pct_range[0];
    });
    expect(below.map((style) => style.id)).toContain("teglia_romana");
    const teglia = STYLES_DB.teglia_romana;
    expect(optimizeRecipe(teglia, { ...kitchen, skill_level: 1 }).recipe.hydration_pct).toBeLessThanOrEqual(68);
    expect(generateRecipe(teglia, { ...kitchen, skill_level: 1 }).hydration_pct).toBeGreaterThan(68);
    // Il testo non promette più «sempre dentro l'intervallo dello stile».
    expect(IT_LOCALE.profile.skillEffectRule).not.toMatch(/sempre dentro/);
  });

  /* FW-10: «Senza glutine» blocca ogni ricetta (glutenConflict o glutenUnsupported
   * in dietary-data.ts, entrambi critici), non solo quelle con farina di frumento. */
  it("«Senza glutine»: ogni stile risulta non fattibile", () => {
    const feasible = Object.values(STYLES_DB)
      .filter((style) => recipe({ dietary_filters: ["gluten_free"] }, style).verdict.outcome !== "not_feasible")
      .map((style) => style.id);
    expect(feasible).toEqual([]);
  });
});
