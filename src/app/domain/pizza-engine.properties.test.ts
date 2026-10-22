import { describe, expect, it } from "vitest";
import {
  STYLES_DB,
  calculateOvenCompensations,
  fermentationSpeedRatio,
  generateRecipe,
  getQ10,
  optimizeRecipe,
  type GeneratedRecipe,
  type PizzaStyle,
  type SkillLevel,
  type UserConstraints,
} from "./pizza-engine";

/* ═══ Test di proprietà su TUTTI gli stili del catalogo (audit motore 22/10/2026, ENG-1) ═══
   Prima i test del motore giravano solo sulla Napoletana STG. Qui ogni stile
   passa per le stesse invarianti: monotonia del lievito (ore e temperatura),
   timeline dentro la finestra fino al pasto, preriscaldo, compensazioni
   dichiarate = applicate, bilancio di massa, Regola 55 ai limiti. */

const STYLES: PizzaStyle[] = Object.values(STYLES_DB);
type YeastKind = "fresh" | "dry" | "sourdough";

function makeConstraints(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "home",
    oven_max_temp_c: 250,
    skill_level: 2,
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
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

const HOME_OVEN = { oven_type: "home", oven_max_temp_c: 250 } as const;
const WOOD_OVEN = { oven_type: "wood", oven_max_temp_c: 485 } as const;

const totalMinutes = (recipe: GeneratedRecipe) =>
  recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0);
const fermentationMinutes = (recipe: GeneratedRecipe) =>
  recipe.timeline
    .filter((step) => ["preferment", "bulk", "proof", "preheat"].includes(step.id))
    .reduce((sum, step) => sum + step.duration_minutes, 0);
const hasWarning = (recipe: GeneratedRecipe, key: string) =>
  recipe.scores.warnings.some((warning) => warning.key === key);
/** Pizza fritta e montanara: si friggono in olio a 180–190°C, niente forno. */
const isFried = (style: PizzaStyle) => style.baking.temp_c_range[1] < 200;

describe("Q10 a tratti continuo (ENG-2)", () => {
  const yeasts: YeastKind[] = ["fresh", "dry", "sourdough"];

  it("vale 1 a 18°C ed è strettamente crescente da 2 a 30°C", () => {
    for (const yeast of yeasts) {
      expect(fermentationSpeedRatio(yeast, 18)).toBeCloseTo(1, 10);
      let previous = -Infinity;
      for (let t = 2; t <= 30; t += 0.5) {
        const ratio = fermentationSpeedRatio(yeast, t);
        expect(ratio).toBeGreaterThan(previous);
        previous = ratio;
      }
    }
  });

  it("nessun salto ai punti di raccordo (10°C commerciale, 15°C madre)", () => {
    for (const [yeast, breakC] of [["fresh", 10], ["dry", 10], ["sourdough", 15]] as const) {
      const below = fermentationSpeedRatio(yeast, breakC - 1e-6);
      const at = fermentationSpeedRatio(yeast, breakC);
      expect(Math.abs(at - below)).toBeLessThan(1e-6);
    }
  });

  it("i Q10 locali restano quelli della letteratura citata", () => {
    expect(getQ10("fresh", 4).q10).toBe(1.6);
    expect(getQ10("fresh", 15).q10).toBe(2.0);
    expect(getQ10("sourdough", 10).q10).toBe(1.9);
    expect(getQ10("sourdough", 22).q10).toBe(2.2);
  });

  it("a 4°C il fattore è 2^-0,8 · 1,6^-0,6 (≈0,433, prima 1,6^-1,4 ≈0,518)", () => {
    expect(fermentationSpeedRatio("fresh", 4)).toBeCloseTo(
      Math.pow(2, -0.8) * Math.pow(1.6, -0.6),
      10,
    );
  });
});

describe("lievito monotono su tutti gli stili (ENG-2, ENG-3)", () => {
  it("non cresce con le ore (1–96 h), lievito fresco e secco, frigo e ambiente", () => {
    const violations: string[] = [];
    for (const style of STYLES) {
      for (const yeast of ["fresh", "dry"] as const) {
        for (const tempC of [4, 22]) {
          let previous = Infinity;
          for (let hours = 1; hours <= 96; hours++) {
            const recipe = generateRecipe(style, makeConstraints({ pantry_yeasts: [yeast] }), {
              customFermentationHours: hours,
              customFermentationTempC: tempC,
            });
            const pct = recipe.science.yeast_baker_pct;
            if (pct > previous + 1e-9) {
              violations.push(`${style.id} ${yeast} ${tempC}°C ${hours}h: ${pct}% > ${previous}%`);
            }
            if (pct > 3) violations.push(`${style.id} ${yeast} ${hours}h: ${pct}% oltre il tetto 3%`);
            previous = pct;
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("non cresce con la temperatura (2–30°C a passi di 0,5) e le ore equivalenti a 18°C non calano", () => {
    const violations: string[] = [];
    for (const style of STYLES) {
      for (const yeast of ["fresh", "dry", "sourdough"] as const) {
        for (const hours of [8, 24]) {
          let previousPct = Infinity;
          let previousEff = -Infinity;
          for (let tempC = 2; tempC <= 30; tempC += 0.5) {
            const recipe = generateRecipe(style, makeConstraints({ pantry_yeasts: [yeast] }), {
              customFermentationHours: hours,
              customFermentationTempC: tempC,
            });
            const pct = recipe.science.yeast_baker_pct;
            const eff = recipe.science.effective_hours_18c;
            if (pct > previousPct + 1e-9) {
              violations.push(`${style.id} ${yeast} ${hours}h ${tempC}°C: lievito ${pct}% > ${previousPct}%`);
            }
            if (eff < previousEff - 1e-9) {
              violations.push(`${style.id} ${yeast} ${hours}h ${tempC}°C: ore eq. ${eff} < ${previousEff}`);
            }
            previousPct = pct;
            previousEff = eff;
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("sotto le 2 h niente rampa: 1 h richiede più lievito di 2 h (Napoletana, 22°C)", () => {
    const napoletana = STYLES_DB["napoletana_stg"];
    const at = (hours: number) =>
      generateRecipe(napoletana, makeConstraints(), {
        customFermentationHours: hours,
        customFermentationTempC: 22,
      }).science.yeast_baker_pct;
    expect(at(1)).toBeGreaterThan(at(2));
    expect(at(1)).toBeLessThanOrEqual(3);
  });
});

describe("timeline dentro la finestra fino al pasto (ENG-4)", () => {
  it("generateRecipe: ≤ available_hours × 60 su tutti gli stili, forno di casa e a legna", () => {
    const violations: string[] = [];
    for (const style of STYLES) {
      for (const oven of [HOME_OVEN, WOOD_OVEN]) {
        for (const available of [4, 6, 8, 12, 24, 48]) {
          const recipe = generateRecipe(style, makeConstraints({ ...oven, available_hours: available }));
          const total = totalMinutes(recipe);
          if (total > available * 60) {
            violations.push(`${style.id} @${oven.oven_max_temp_c} ${available}h: ${total} min`);
          }
          if (hasWarning(recipe, "gen.windowTooShort")) {
            violations.push(`${style.id} ${available}h: avviso finestra senza motivo`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("optimizeRecipe: ≤ available_hours × 60 su tutti gli stili", () => {
    const violations: string[] = [];
    for (const style of STYLES) {
      for (const oven of [HOME_OVEN, WOOD_OVEN]) {
        for (const available of [4, 8, 24]) {
          const { recipe } = optimizeRecipe(style, makeConstraints({ ...oven, available_hours: available }));
          const total = totalMinutes(recipe);
          if (total > available * 60) {
            violations.push(`${style.id} @${oven.oven_max_temp_c} ${available}h: ${total} min`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("finestra impossibile: fermentazione minima e avviso, che compare solo quando si sfora", () => {
    for (const style of STYLES) {
      for (const available of [1, 2, 3]) {
        const recipe = generateRecipe(style, makeConstraints({ available_hours: available }));
        const over = totalMinutes(recipe) > available * 60;
        expect(hasWarning(recipe, "gen.windowTooShort")).toBe(over);
        const minimum = Math.min(style.dough.fermentation_hours_range[0], 1);
        expect(recipe.fermentation_hours).toBeGreaterThanOrEqual(minimum);
      }
    }
  });

  it("ore scelte dall'utente oltre la finestra: si rispettano, ma con avviso", () => {
    const recipe = generateRecipe(STYLES_DB["teglia_romana"], makeConstraints({ available_hours: 24 }), {
      customFermentationHours: 48,
    });
    expect(recipe.fermentation_hours).toBe(48);
    expect(hasWarning(recipe, "gen.windowTooShort")).toBe(true);
  });

  it("esempio documentato: Napoletana con 4 h e forno a legna → 3,25 h di fermentazione", () => {
    const recipe = generateRecipe(
      STYLES_DB["napoletana_stg"],
      makeConstraints({ ...WOOD_OVEN, available_hours: 4 }),
    );
    expect(recipe.fermentation_hours).toBe(3.25);
    expect(totalMinutes(recipe)).toBeLessThanOrEqual(240);
  });
});

describe("preriscaldo e fasi di fermentazione (ENG-5)", () => {
  const cases: { available?: number; hours?: number }[] = [
    { available: 3 },
    { available: 4 },
    { available: 8 },
    { available: 24 },
    { hours: 1 },
    { hours: 1.5 },
    { hours: 2 },
    { hours: 3 },
    { hours: 24 },
  ];

  it("ogni stile cotto in forno ha un solo «accendi il forno», prima della cottura", () => {
    const violations: string[] = [];
    for (const style of STYLES.filter((s) => !isFried(s))) {
      for (const oven of [HOME_OVEN, WOOD_OVEN]) {
        for (const c of cases) {
          const recipe = generateRecipe(
            style,
            makeConstraints({ ...oven, available_hours: c.available ?? 48 }),
            c.hours != null ? { customFermentationHours: c.hours } : {},
          );
          const ids = recipe.timeline.map((step) => step.id);
          const preheats = ids.filter((id) => id === "preheat").length;
          const label = `${style.id} @${oven.oven_max_temp_c} ${JSON.stringify(c)}`;
          if (preheats !== 1) {
            violations.push(`${label}: ${preheats} preriscaldi`);
            continue;
          }
          const preheatIdx = ids.indexOf("preheat");
          const bakeIdx = ids.indexOf("bake");
          if (bakeIdx < preheatIdx) violations.push(`${label}: cottura prima del preriscaldo`);
          if (ids.indexOf("divide") > preheatIdx) violations.push(`${label}: preriscaldo prima dello staglio`);
          if (recipe.timeline[preheatIdx].duration_minutes < 30) {
            violations.push(`${label}: preriscaldo di ${recipe.timeline[preheatIdx].duration_minutes} min`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("le fasi di fermentazione sommano alle ore (il preriscaldo corre in parallelo)", () => {
    const violations: string[] = [];
    for (const style of STYLES) {
      for (const c of cases) {
        const recipe = generateRecipe(
          style,
          makeConstraints({ available_hours: c.available ?? 48 }),
          c.hours != null ? { customFermentationHours: c.hours } : {},
        );
        const diff = Math.abs(fermentationMinutes(recipe) - recipe.fermentation_hours * 60);
        if (diff > 1) violations.push(`${style.id} ${JSON.stringify(c)}: scarto ${diff} min`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("Focaccia di Recco: preriscaldo presente e riposo al posto della lievitazione", () => {
    for (const oven of [HOME_OVEN, WOOD_OVEN]) {
      const recipe = generateRecipe(STYLES_DB["focaccia_recco"], makeConstraints(oven));
      const preheat = recipe.timeline.find((step) => step.id === "preheat");
      expect(preheat).toBeDefined();
      expect(preheat?.variant).toBe("during_rest");
      for (const step of recipe.timeline.filter((s) => s.id === "bulk" || s.id === "proof")) {
        expect(step.title).toBe("Riposo");
      }
      expect(recipe.timeline.some((step) => /Lievitazione/.test(step.description))).toBe(false);
    }
  });
});

describe("compensazioni dichiarate = applicate (ENG-6)", () => {
  const ovens = [150, 180, 250, 300, 400, 485];

  function checkRecipe(recipe: GeneratedRecipe, label: string, expectHydration: boolean | null): string[] {
    const errors: string[] = [];
    const expected = calculateOvenCompensations(recipe.style, recipe.oven_temp_c);
    const listed = recipe.science.compensations;
    const hydrationComp = listed.find((c) => c.type === "hydration");
    if (expectHydration !== null && !!hydrationComp !== expectHydration) {
      errors.push(`${label}: compensazione idratazione ${hydrationComp ? "elencata" : "assente"}`);
    }
    if (hydrationComp) {
      if (Math.abs(hydrationComp.compensated - recipe.hydration_pct) > 1e-9) {
        errors.push(`${label}: idratazione ${recipe.hydration_pct} ≠ compensata ${hydrationComp.compensated}`);
      }
      const delta = hydrationComp.compensated - hydrationComp.original;
      if (Math.abs(delta - expected.hydration_delta_pct) > 0.051) {
        errors.push(`${label}: delta ${delta} ≠ ${expected.hydration_delta_pct}`);
      }
    }
    const fatPct = (recipe.fat_g / recipe.flour_g) * 100;
    const sugarPct = (recipe.sugar_g / recipe.flour_g) * 100;
    const gramTolerancePct = (0.5 / recipe.flour_g) * 100 + 1e-9;
    for (const c of listed) {
      if (c.type === "oil" && Math.abs(fatPct - c.compensated) > gramTolerancePct) {
        errors.push(`${label}: grasso ${fatPct.toFixed(2)}% ≠ dichiarato ${c.compensated}%`);
      }
      if (c.type === "sugar" && Math.abs(sugarPct - c.compensated) > gramTolerancePct) {
        errors.push(`${label}: zucchero ${sugarPct.toFixed(2)}% ≠ dichiarato ${c.compensated}%`);
      }
      if (c.type === "cook_time" && recipe.cook_time_sec !== c.compensated) {
        errors.push(`${label}: cottura ${recipe.cook_time_sec}s ≠ ${c.compensated}s`);
      }
      if (
        c.type === "thickness" &&
        recipe.ball_weight_g !== Math.round(recipe.style.shape.dough_weight_g * c.compensated)
      ) {
        errors.push(`${label}: peso panetto ${recipe.ball_weight_g} non scalato ×${c.compensated}`);
      }
    }
    // Ogni compensazione non-idratazione calcolata è applicata ed elencata.
    const listedTypes = new Set(listed.map((c) => c.type));
    for (const c of expected.compensations) {
      if (c.type !== "hydration" && !listedTypes.has(c.type)) {
        errors.push(`${label}: ${c.type} calcolata ma non elencata`);
      }
    }
    return errors;
  }

  it("generateRecipe senza idratazione custom: compensazione applicata ed elencata", () => {
    const errors: string[] = [];
    for (const style of STYLES) {
      for (const oven of ovens) {
        const recipe = generateRecipe(style, makeConstraints({ oven_max_temp_c: oven }));
        const delta = calculateOvenCompensations(recipe.style, recipe.oven_temp_c).hydration_delta_pct;
        errors.push(...checkRecipe(recipe, `${style.id}@${oven}`, delta > 0));
      }
    }
    expect(errors).toEqual([]);
  });

  it("idratazione scelta dall'utente: nessuna compensazione d'idratazione elencata", () => {
    const errors: string[] = [];
    for (const style of STYLES) {
      for (const oven of ovens) {
        const recipe = generateRecipe(style, makeConstraints({ oven_max_temp_c: oven }), {
          customHydration: 62,
        });
        if (recipe.hydration_pct !== 62) errors.push(`${style.id}@${oven}: idratazione ${recipe.hydration_pct}`);
        errors.push(...checkRecipe(recipe, `${style.id}@${oven} custom`, false));
      }
    }
    expect(errors).toEqual([]);
  });

  it("optimizeRecipe: compensa sopra i candidati, dichiara l'uscita dal range e resta sotto il tetto di livello", () => {
    const ceilings: Record<SkillLevel, number> = { 1: 68, 2: 78, 3: 88, 4: 200 };
    const errors: string[] = [];
    for (const style of STYLES) {
      for (const oven of [180, 250, 485]) {
        for (const skill of [1, 2, 4] as SkillLevel[]) {
          const result = optimizeRecipe(style, makeConstraints({ oven_max_temp_c: oven, skill_level: skill }));
          const recipe = result.recipe;
          const label = `${style.id}@${oven} skill${skill}`;
          const delta = calculateOvenCompensations(recipe.style, recipe.oven_temp_c).hydration_delta_pct;
          errors.push(...checkRecipe(recipe, label, delta > 0));
          if (recipe.hydration_pct > ceilings[skill] + 1e-9) {
            errors.push(`${label}: idratazione ${recipe.hydration_pct} oltre il tetto ${ceilings[skill]}`);
          }
          const [, hMax] = recipe.style.dough.hydration_pct_range;
          const declared = recipe.science.compensations.some((c) => c.type === "hydration");
          if (recipe.hydration_pct > hMax + 1e-9) {
            if (!declared) errors.push(`${label}: fuori range senza compensazione dichiarata`);
            if (!result.rationale.some((m) => m.key === "opt.hydrationOutOfStyleRange")) {
              errors.push(`${label}: fuori range senza motivazione`);
            }
          }
          if (result.params.hydration !== recipe.hydration_pct) {
            errors.push(`${label}: params.hydration ${result.params.hydration} ≠ ricetta ${recipe.hydration_pct}`);
          }
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it("esempio documentato: Napoletana a 250°C", () => {
    const napoletana = STYLES_DB["napoletana_stg"];
    const constraints = makeConstraints();
    const generated = generateRecipe(napoletana, constraints);
    expect(generated.hydration_pct).toBe(67.2);
    const optimized = optimizeRecipe(napoletana, constraints);
    const comp = optimized.recipe.science.compensations.find((c) => c.type === "hydration");
    expect(comp).toBeDefined();
    expect(optimized.recipe.hydration_pct).toBeCloseTo((comp?.original ?? 0) + 8.7, 5);
    expect(optimized.rationale.some((m) => m.key === "opt.hydrationOvenCompensated")).toBe(true);
    // La UI ricostruisce la ricetta con l'idratazione finale come valore custom:
    // stessa idratazione, nessuna seconda compensazione.
    const rebuilt = generateRecipe(napoletana, constraints, { customHydration: optimized.params.hydration });
    expect(rebuilt.hydration_pct).toBe(optimized.recipe.hydration_pct);
    expect(rebuilt.science.compensations.some((c) => c.type === "hydration")).toBe(false);
  });
});

describe("bilancio di massa su tutti gli stili", () => {
  it("percentuali e pesi coerenti, arrotondamenti al grammo", () => {
    const errors: string[] = [];
    for (const style of STYLES) {
      for (const oven of [180, 250, 485]) {
        for (const balls of [1, 4, 7]) {
          for (const yeast of ["fresh", "dry", "sourdough"] as const) {
            const recipe = generateRecipe(
              style,
              makeConstraints({ oven_max_temp_c: oven, dough_balls: balls, pantry_yeasts: [yeast] }),
            );
            const label = `${style.id}@${oven} ×${balls} ${yeast}`;
            const grams = [recipe.flour_g, recipe.water_g, recipe.salt_g, recipe.fat_g, recipe.sugar_g, recipe.yeast_g];
            if (grams.some((g) => !Number.isFinite(g) || g < 0)) errors.push(`${label}: grammi non validi ${grams}`);
            const sum = grams.reduce((a, b) => a + b, 0);
            if (Math.abs(sum - recipe.total_dough_g) > 3.5) {
              errors.push(`${label}: somma ${sum} g vs totale ${recipe.total_dough_g} g`);
            }
            if (recipe.total_dough_g !== recipe.ball_weight_g * recipe.dough_balls) {
              errors.push(`${label}: totale ≠ panetti × peso`);
            }
            if (Math.abs(recipe.water_g - (recipe.flour_g * recipe.hydration_pct) / 100) > 0.5 + 1e-9) {
              errors.push(`${label}: acqua ${recipe.water_g} g ≠ ${recipe.hydration_pct}%`);
            }
            if (Math.abs(recipe.salt_g - (recipe.flour_g * recipe.style.dough.salt_pct) / 100) > 0.5 + 1e-9) {
              errors.push(`${label}: sale ${recipe.salt_g} g ≠ ${recipe.style.dough.salt_pct}%`);
            }
            // yeast_baker_pct è arrotondato a 2 decimali: ±0,005% della farina,
            // più l'arrotondamento dei grammi (0,05 g; 0,5 g per la madre).
            const yeastTolerance =
              (recipe.yeast_type === "sourdough" ? 0.5 : 0.05) + (recipe.flour_g * 0.005) / 100;
            if (
              Math.abs(recipe.yeast_g - (recipe.flour_g * recipe.science.yeast_baker_pct) / 100) >
              yeastTolerance + 1e-9
            ) {
              errors.push(`${label}: lievito ${recipe.yeast_g} g ≠ ${recipe.science.yeast_baker_pct}%`);
            }
            if (recipe.flour_blend) {
              const blendSum = recipe.flour_blend.reduce((a, c) => a + c.grams, 0);
              if (blendSum !== recipe.flour_g) errors.push(`${label}: mix ${blendSum} g ≠ farina ${recipe.flour_g} g`);
            }
          }
        }
      }
    }
    expect(errors).toEqual([]);
  });
});

describe("Regola 55 ai limiti (ENG-7)", () => {
  const napoletana = STYLES_DB["napoletana_stg"];

  it("cucina fredda (8 e 12°C): acqua al massimo pratico di 40°C con indicazione", () => {
    for (const kitchen of [8, 12]) {
      const recipe = generateRecipe(napoletana, makeConstraints({ kitchen_temp_c: kitchen }));
      expect(recipe.science.water_temp_c).toBe(40);
      expect(recipe.science.water_temp_limit).toBe("max");
    }
  });

  it("cucina calda con impastatrice: acqua al minimo di 2°C con indicazione", () => {
    const recipe = generateRecipe(
      napoletana,
      makeConstraints({ kitchen_temp_c: 34, has_mixer: true, mixer_type: "planetary" }),
    );
    expect(recipe.science.water_temp_c).toBe(2);
    expect(recipe.science.water_temp_limit).toBe("min");
  });

  it("nel range: acqua = 3·DDT − 2·cucina − attrito, senza indicazione; mai crescente con la cucina", () => {
    for (const mixer of ["hands", "planetary"] as const) {
      let previous = Infinity;
      for (let kitchen = 5; kitchen <= 40; kitchen++) {
        const recipe = generateRecipe(
          napoletana,
          makeConstraints({ kitchen_temp_c: kitchen, has_mixer: mixer !== "hands", mixer_type: mixer }),
        );
        const { desired_dough_temp_c: ddt, friction_factor: friction, water_temp_c: water } = recipe.science;
        expect(water).not.toBeNull();
        const raw = 3 * ddt - 2 * kitchen - friction;
        if (raw >= 2 && raw <= 40) {
          expect(water).toBe(raw);
          expect(recipe.science.water_temp_limit).toBeNull();
        }
        expect(water as number).toBeLessThanOrEqual(previous);
        previous = water as number;
      }
    }
  });
});
