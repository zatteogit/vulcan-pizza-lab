import { describe, expect, it } from "vitest";
import {
  STYLES_DB, declaredPhases, equivalentFermentationHours, fermentationPhases, generateRecipe, isUnworkedPanDough,
  type GeneratedRecipe, type MethodProcessProfile, type UserConstraints,
} from "../domain/pizza-engine";
import { computePreFermentSplit } from "../domain/pre-ferment-split";
import { SKILL_WARNING_KEYS } from "../domain/verdict-summary";
import { getAllInterpretations, getInterpretationById, getInterpretationsForStyle } from "../data/interpretation-library";
import { getImpasto } from "../data/impasto-library";
import { getToppingForStyle } from "../data/topping-library";
import { handleMcpMessage } from "../agent/mcp-server";
import { localizeStep } from "../features/recipe/recipe-output-format";
import { recipeCardSignals } from "../features/recipe/recipe-card-signals";
import { IT_LOCALE } from "../features/cms/locales/it";
import { EN_LOCALE } from "../features/cms/locales/en";
import type { CmsContent } from "../features/cms/cms-context";
import { authorVersionRecipe, canonicalRecipeEntry, presetOvenTemp, recipeFromEntry, tailoredRecipeEntry } from "./recipe-entry";

/* ═══ Tranche B3 · fasi esplicite e versione di Adriano Continisio ═══
 * Fonte: Adriano Continisio, «La pizza in teglia croccante», Profumo di
 * lievito, 26/11/2009 (verificata; docs/progetto-catalogo-italiano.md §9.2,
 * §9.3). Per 3 teglie 30×35: 900 g di farina W 250 (450 nel preimpasto),
 * 720 g d'acqua (450 nel preimpasto), 45 g d'olio, 18 g di sale, 4,5 g di
 * lievito fresco, tutto nel preimpasto; 0,536 g/cm². Preimpasto 3 h a 20 °C,
 * puntata «a temperatura ambiente» fino alle 16, raddoppio a 28 °C, teglie non
 * unte, 250 °C per 10 + 4–5 minuti.
 * Tolleranza dichiarata: farina, acqua e le due metà del preimpasto ±1 g (il
 * motore arrotonda il peso della teglia, 562 g invece di 562,5); sale, olio e
 * lievito esatti. */

const style = STYLES_DB.teglia_in_giornata;
const adriano = getInterpretationById("adriano_continisio")!;
const home: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 24, dough_balls: 3, has_mixer: true, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const entry = () => canonicalRecipeEntry(style, undefined, adriano);
const recipe = (c: UserConstraints = home) => recipeFromEntry(entry(), c);
const minutes = (r: GeneratedRecipe, id: string) => r.timeline.filter((s) => s.id === id).reduce((n, s) => n + s.duration_minutes, 0);

describe("dati della versione", () => {
  it("versione d'autore verificata della teglia in giornata, offerta dallo stile dopo il riferimento", () => {
    expect([adriano.type, adriano.source_status, adriano.base_style_id]).toEqual(["autore", "verified", "teglia_in_giornata"]);
    expect(adriano.url).toBe("http://profumodilievito.blogspot.com/2009/11/la-pizza-in-teglia-croccante.html");
    expect(adriano.source_yeast).toEqual({ type: "fresh", pct: 0.5 });
    expect(getInterpretationsForStyle(style.id).map((it) => it.id)).toEqual(["benedetta_rossi", "adriano_continisio"]);
    // Sale e olio dall'impasto della libreria (§9.11), niente zucchero.
    expect(getImpasto(adriano.parameter_overrides!.impasto_ref!)?.dough_overrides).toMatchObject({ salt_pct: 2, oil_pct: 5, sugar_pct: 0 });
  });

  it("le fasi sommate sono le ore della versione, la puntata ne ha la temperatura; cottura dentro lo stile", () => {
    for (const it of getAllInterpretations()) {
      const p = it.process_profile;
      if (p?.phases) {
        const o = it.parameter_overrides!;
        const sum = (p.phases.preferment?.hours ?? 0) + p.phases.bulk.hours + p.phases.proof.hours;
        expect(sum, it.id).toBe(o.fermentation_hours);
        expect(p.phases.bulk.temp_c, it.id).toBe(o.fermentation_temp_c);
        expect(Boolean(p.phases.preferment), it.id).toBe(Boolean(o.use_pre_ferment));
      }
      const base = STYLES_DB[it.base_style_id];
      if (p?.bake) {
        expect(p.bake.temp_c, it.id).toBeGreaterThanOrEqual(base.baking.temp_c_range[0]);
        expect(p.bake.temp_c, it.id).toBeLessThanOrEqual(base.baking.temp_c_range[1]);
        expect(p.bake.cook_time_sec, it.id).toBeGreaterThanOrEqual(base.baking.cook_time_sec_range[0]);
        expect(p.bake.cook_time_sec, it.id).toBeLessThanOrEqual(base.baking.cook_time_sec_range[1]);
      }
    }
    // Nessuno stile del catalogo dichiara fasi, cottura o teglia non unta: i campi sono delle versioni.
    for (const s of Object.values(STYLES_DB)) {
      expect([s.method_profile?.phases, s.method_profile?.bake, s.method_profile?.unoiled_pan], s.id).toEqual([undefined, undefined, undefined]);
    }
  });
});

describe("dosi della fonte (3 teglie 30×35, forno di casa a 250 °C)", () => {
  it("riproduce i grammi della fonte", () => {
    const r = recipe();
    expect([r.dough_balls, r.ball_weight_g]).toEqual([3, 562]);
    expect(Math.abs(r.flour_g - 900)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.water_g - 720)).toBeLessThanOrEqual(1);
    expect([r.salt_g, r.fat_g, r.sugar_g]).toEqual([18, 45, 0]);
    expect([r.yeast_type, r.yeast_g]).toEqual(["fresh", 4.5]);
    expect(r.yeast_source).toMatchObject({ source_type: "fresh", source_pct: 0.5, converted: false });
    expect([r.hydration_pct, r.flour_w, r.baker_pcts]).toEqual([80, 250, { salt: 2, fat: 5, sugar: 0 }]);
    expect(Math.round((r.ball_weight_g / (30 * 35)) * 1000) / 1000).toBe(0.535);
    // Preimpasto: metà della farina, idratato al 100 %, tutto il lievito.
    expect([r.has_pre_ferment, r.pre_ferment_type, r.pre_ferment_flour_pct]).toEqual([true, "poolish", 50]);
    const split = computePreFermentSplit({ flourG: r.flour_g, waterG: r.water_g, preFermentType: r.pre_ferment_type, flourPct: r.pre_ferment_flour_pct });
    expect(Math.abs(split.prefermentFlourG - 450)).toBeLessThanOrEqual(1);
    expect(Math.abs(split.prefermentWaterG - 450)).toBeLessThanOrEqual(1);
    // Cottura della versione, non l'ideale dello stile (210 °C, Benedetta).
    expect([r.oven_temp_c, r.cook_time_sec]).toEqual([250, 870]);
    expect(r.source_notes?.map((n) => n.key)).toEqual(["fermentation.roomTemp", "fermentation.hoursAssumed", "topping.vulcanDoses"]);
    expect(r.verdict.outcome).not.toBe("not_feasible");
  });

  it("la scheda dello stile e Crea aprono la versione a 250 °C, il riferimento resta a 210 °C", () => {
    expect(presetOvenTemp(style, home, adriano)).toBe(250);
    expect(presetOvenTemp(style, home, getInterpretationById("benedetta_rossi"))).toBe(210);
    expect(presetOvenTemp(style, home)).toBe(210);
    const sheet = authorVersionRecipe(style, adriano, { ...home, dough_balls: 1 });
    expect([sheet.oven_temp_c, sheet.cook_time_sec, sheet.ball_weight_g]).toEqual([250, 870, 562]);
    // Con un forno che arriva a 230 °C si cuoce a 230 °C, più a lungo.
    const cooler = recipe({ ...home, oven_max_temp_c: 230, oven_capacity_temp_c: 230 });
    expect(cooler.oven_temp_c).toBe(230);
    expect(cooler.cook_time_sec).toBeGreaterThan(870);
  });

  it("con solo lievito secco la dose si converte 1:3 e si dichiara", () => {
    const r = recipe({ ...home, pantry_yeasts: ["dry"], pantry_inventory_complete: true });
    expect([r.yeast_type, r.yeast_source?.converted]).toEqual(["dry", true]);
    expect(r.source_notes?.map((n) => n.key)).toContain("yeast.sourceFreshAsDry");
  });
});

describe("fasi esplicite nella timeline", () => {
  it("preimpasto 3 h a 20 °C, puntata 6 h a 22 °C, appretto 1 h 30 a 28 °C (gli ultimi 30 minuti col preriscaldo)", () => {
    const r = recipe();
    expect(r.declared_phases).toEqual(adriano.process_profile!.phases);
    const pre = r.timeline.find((s) => s.id === "preferment")!;
    const bulk = r.timeline.find((s) => s.id === "bulk")!;
    const proof = r.timeline.find((s) => s.id === "proof")!;
    expect([pre.duration_minutes, pre.temp_c]).toEqual([180, 20]);
    expect([bulk.duration_minutes, bulk.temp_c]).toEqual([360, 22]);
    expect([proof.duration_minutes + minutes(r, "preheat"), proof.temp_c]).toEqual([90, 28]);
    expect(proof.variant).toBeUndefined(); // nei contenitori, non in teglia
    // La fermentazione della timeline è quella della ricetta: 10 h 30.
    expect(minutes(r, "preferment") + minutes(r, "bulk") + minutes(r, "proof") + minutes(r, "preheat")).toBe(630);
    const ids = r.timeline.map((s) => s.id);
    expect(ids.slice(0, 3)).toEqual(["preferment", "mix", "bulk"]);
    // Stesura nella teglia non unta, poi il condimento, poi la cottura dal basso all'alto.
    const shape = r.timeline.find((s) => s.id === "shape")!;
    expect([shape.variant, shape.msg?.description?.[0]?.key]).toEqual(["unoiled", "timeline.shape.unoiledPan"]);
    expect(ids.indexOf("shape")).toBeLessThan(ids.indexOf("spread_margherita_teglia_croccante"));
    expect(ids.indexOf("spread_margherita_teglia_croccante")).toBeLessThan(ids.indexOf("bake"));
    expect(r.timeline.find((s) => s.id === "bake")?.msg?.description?.map((m) => m.key)).toContain("timeline.bake.lowThenHigh");
  });

  it("il modello del lievito conta ogni fase alla sua temperatura", () => {
    const r = recipe();
    const phases = adriano.process_profile!;
    const eq = equivalentFermentationHours(10.5, 22, "fresh", true, "poolish", phases);
    // 3 h a 20 °C valgono meno di 3 h a 22 °C, 1 h 30 a 28 °C molto di più.
    expect(eq).toBeGreaterThan(10.5);
    expect(eq).not.toBe(equivalentFermentationHours(10.5, 22, "fresh", true, "poolish"));
    expect(r.yeast_source?.model_pct).toBeGreaterThan(0);
    expect(r.yeast_source!.model_pct).toBeLessThan(0.5);
  });

  it("cambiati ore, temperatura o pre-fermento tornano le quote del modello (e, con ore e temperatura, la sua dose)", () => {
    const e = entry();
    for (const change of [{ customFermentationHours: 8 }, { customFermentationTempC: 24 }, { usePreFerment: false }]) {
      const r = generateRecipe(e.style, home, { ...e.options, ...change });
      expect(r.declared_phases, JSON.stringify(change)).toBeUndefined();
      // D-068: la dose della fonte segue ore e temperatura; il solo pre-fermento spento la lascia.
      if (!("usePreFerment" in change)) expect(r.yeast_source, JSON.stringify(change)).toBeUndefined();
      expect(r.timeline.some((s) => s.temp_c !== undefined), JSON.stringify(change)).toBe(false);
      expect(r.source_notes?.map((n) => n.key) ?? [], JSON.stringify(change)).not.toContain("fermentation.roomTemp");
    }
    const eight = generateRecipe(e.style, home, { ...e.options, customFermentationHours: 8 });
    expect(fermentationPhases(8, true, "poolish", e.style.method_profile, 22)).toEqual(fermentationPhases(8, true, "poolish"));
    expect(minutes(eight, "preferment")).toBe(Math.round(fermentationPhases(8, true, "poolish").preferment * 60));
  });

  it("forma generale: senza pre-fermento, appretto in teglia (come servirà a B4)", () => {
    const profile: MethodProcessProfile = {
      id: "prova", source_url: "https://example.org", proof_in_pan: true,
      phases: { bulk: { hours: 2, temp_c: 26 }, proof: { hours: 0.5, temp_c: 26 } },
    };
    expect(declaredPhases(profile, 2.5, 26, false)).toBe(profile.phases);
    expect(declaredPhases(profile, 2.5, 26, true)).toBeUndefined();
    expect(declaredPhases(profile, 3, 26, false)).toBeUndefined();
    expect(fermentationPhases(2.5, false, "poolish", profile, 26)).toEqual({ preferment: 0, bulk: 2, proof: 0.5 });
    const r = generateRecipe({ ...style, method_profile: profile }, { ...home, dough_balls: 1 },
      { customFermentationHours: 2.5, customFermentationTempC: 26, usePreFerment: false });
    expect(minutes(r, "bulk") + minutes(r, "proof") + minutes(r, "preheat")).toBe(150);
    expect(r.timeline.find((s) => s.id === "bulk")?.temp_c).toBe(26);
  });
});

describe("testi del procedimento", () => {
  const r = recipe();
  const step = (id: string) => r.timeline.find((s) => s.id === id)!;
  it("in italiano e in inglese, con le temperature della fonte", () => {
    const en = { ...IT_LOCALE, ...EN_LOCALE } as CmsContent;
    expect(localizeStep(step("proof"), r, IT_LOCALE).description).toMatch(/28\s?°C/);
    expect(localizeStep(step("proof"), r, IT_LOCALE).longDesc).toContain("come dice la fonte");
    expect(localizeStep(step("proof"), r, en).description).toMatch(/^Final rise at 28\s?°C/);
    expect(localizeStep(step("preferment"), r, IT_LOCALE).longDesc).toMatch(/a 20\s?°C/);
    expect(localizeStep(step("bulk"), r, IT_LOCALE).description).toMatch(/22\s?°C/);
    expect(localizeStep(step("shape"), r, en).description).toContain("ungreased tray");
  });
});

describe("impasto lavorato e proposta su misura", () => {
  it("l'impasto di Adriano si lavora: per chi comincia resta «esigente»", () => {
    expect(isUnworkedPanDough(entry().style)).toBe(false);
    const beginner = recipe({ ...home, skill_level: 1 });
    const signals = [...beginner.verdict.adaptations.map((a) => a.key), ...recipeCardSignals(beginner).map((s) => s.message.key)];
    expect(signals.some((key) => SKILL_WARNING_KEYS.includes(key) || key === "card.hydrationBeginner")).toBe(true);
    // Il riferimento (Benedetta, mescolato in teglia) resta senza segnali.
    expect(isUnworkedPanDough(canonicalRecipeEntry(style).style)).toBe(true);
  });

  it("la proposta su misura resta dentro lo stile e attorno al riferimento", () => {
    for (const skill_level of [1, 2, 3, 4] as const) {
      const t = tailoredRecipeEntry(style, { ...home, skill_level }).recipe;
      const d = style.dough;
      expect(t.hydration_pct, `${skill_level}`).toBeGreaterThanOrEqual(d.hydration_pct_range[0]);
      expect(t.hydration_pct, `${skill_level}`).toBeLessThanOrEqual(d.hydration_pct_range[1]);
      expect(t.fermentation_hours, `${skill_level}`).toBeGreaterThanOrEqual(d.fermentation_hours_range[0]);
      expect(t.fermentation_hours, `${skill_level}`).toBeLessThanOrEqual(6);
      expect(t.declared_phases).toBeUndefined();
    }
  });
});

describe("MCP", () => {
  const call = (args: Record<string, unknown>) => {
    const response = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "generate_recipe", arguments: args } });
    if (!response || !("result" in response)) throw new Error("missing tool result");
    return (response.result as { structuredContent: Record<string, any> }).structuredContent;
  };
  it("generate_recipe con interpretation_id: dosi, fasi con le temperature, cottura e note", () => {
    const data = call({ style_id: "teglia_in_giornata", interpretation_id: "adriano_continisio", oven_type: "home", oven_max_temp_c: 250, dough_balls: 3 });
    const grams = (name: string) => data.ingredients.find((i: { name: string }) => i.name === name)?.grams;
    expect([grams("flour"), grams("water"), grams("salt"), grams("fat"), grams("yeast_fresh")]).toEqual([899, 719, 18, 45, 4.5]);
    expect(data.declared_phases).toEqual(adriano.process_profile!.phases);
    expect(data.steps.filter((s: { temp_c?: number }) => s.temp_c !== undefined).map((s: { id: string; temp_c: number }) => `${s.id}@${s.temp_c}`))
      .toEqual(["preferment@20", "bulk@22", "proof@28"]);
    expect([data.oven_temp_c, data.cook_time_sec]).toEqual([250, 870]);
    expect(data.pre_ferment).toMatchObject({ type: "poolish", flour_pct: 50, maturation_minutes: 180 });
    expect(data.yeast_source).toMatchObject({ source_type: "fresh", source_pct: 0.5 });
    expect(data.topping.id).toBe("margherita_teglia_croccante");
    // Con le ore cambiate: niente fasi della fonte.
    expect(call({ style_id: "teglia_in_giornata", interpretation_id: "adriano_continisio", oven_type: "home", oven_max_temp_c: 250, fermentation_hours: 8 }).declared_phases).toBeNull();
  });
});

describe("condimento della versione", () => {
  it("margherita con dosi di Vulcan, dopo la stesura; la margherita dello stile resta quella di Benedetta", () => {
    const own = getToppingForStyle("margherita_teglia_croccante", style)!;
    expect(own.assembly_steps?.[0].insert_at).toBe("after_shape");
    expect(own.source_note?.key).toBe("topping.vulcanDoses");
    expect(getToppingForStyle("margherita", style)?.id).toBe("margherita_teglia_in_giornata");
  });
});
