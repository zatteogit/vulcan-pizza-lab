import { describe, expect, it } from "vitest";
import { kitchenConstraints, nextSavedOven, resolveEffectiveKitchen } from "./effective-kitchen";
import { ALL_OVEN_MODELS, type OvenModel } from "../data/oven-models";
import { generateRecipe, STYLES_DB, type UserConstraints } from "../domain/pizza-engine";

const models = ALL_OVEN_MODELS;
const aurora: OvenModel = { id: "aurora-e1", brand: "Fornace Aurora", model: "E1", fuel: "electric", ovenType: "electric_high", maxTempC: 450, pizzaCm: 33, source: "P" };

describe("resolveEffectiveKitchen (FW-07)", () => {
  it("senza dati: forno di casa a 250 °C, a mano", () => {
    const k = resolveEffectiveKitchen({}, undefined, {}, models);
    expect(k.oven).toMatchObject({ type: "home", maxTempC: 250, source: "default", fromEdition: false });
    expect(k.mixer.primary).toBe("hands");
    expect(k.isHomeOven).toBe(true);
  });

  it("con il modello la temperatura è quella salvata del modello: 509 °C resta 509 (S05-A-03)", () => {
    const k = resolveEffectiveKitchen({ oven: { ovenType: "electric_high", maxTemp: 509, modelId: "effeuno-p134h" } }, undefined, {}, models);
    expect(k.oven).toMatchObject({ type: "electric_high", maxTempC: 509, declaredMaxTempC: 509, modelId: "effeuno-p134h", pizzaCm: 34, source: "model" });
    expect(k.oven.label).toBe("Effeuno P134H 509 PRO");
    expect(k.isHomeOven).toBe(false);
  });

  it("senza temperatura salvata usa quella dichiarata dal modello, non quella del tipo", () => {
    const k = resolveEffectiveKitchen({ oven: { ovenType: "electric_high", modelId: "effeuno-p134h" } }, undefined, {}, models);
    expect(k.oven.maxTempC).toBe(509);
  });

  it("un modello di un altro tipo di forno non vale", () => {
    const k = resolveEffectiveKitchen({ oven: { ovenType: "home", maxTemp: 250, modelId: "effeuno-p134h" } }, undefined, {}, models);
    expect(k.oven.modelId).toBeUndefined();
    expect(k.oven.source).toBe("type");
  });

  it("cambiare tipo per una ricetta toglie modello e temperatura salvati", () => {
    const k = resolveEffectiveKitchen({ oven: { ovenType: "electric_high", maxTemp: 509, modelId: "effeuno-p134h" } }, undefined, { ovenType: "home" }, models);
    expect(k.oven).toMatchObject({ type: "home", maxTempC: 250 });
    expect(k.oven.modelId).toBeUndefined();
  });

  it("il forno dell'edizione resta marcato finché l'utente non lo conferma (S18-A-01)", () => {
    const seeded = resolveEffectiveKitchen({ oven: { ovenType: "electric_high", maxTemp: 450, modelId: "aurora-e1", origin: "edition" } }, undefined, {}, [...models, aurora]);
    expect(seeded.oven.fromEdition).toBe(true);
    expect(seeded.oven.pizzaCm).toBe(33);
    const fromEdition = resolveEffectiveKitchen({}, { defaultOven: aurora }, {}, [...models, aurora]);
    expect(fromEdition.oven).toMatchObject({ modelId: "aurora-e1", fromEdition: true });
  });

  it("l'impastatrice principale è quella esplicita, poi la prima della lista (S16-A-01)", () => {
    expect(resolveEffectiveKitchen({ equipment: { mixer_type: "spiral", mixers_owned: ["hands", "spiral"] } }).mixer.primary).toBe("spiral");
    expect(resolveEffectiveKitchen({ equipment: { mixers_owned: ["fork"] } }).mixer.primary).toBe("fork");
    expect(resolveEffectiveKitchen({ equipment: { mixer_type: "hand" } }).mixer.primary).toBe("hands");
  });

  it("la distribuzione del calore vale solo se il tipo di forno ce l'ha (S16-B-03)", () => {
    const wood = resolveEffectiveKitchen({ oven: { ovenType: "wood", maxTemp: 485 }, equipment: { oven_heat_profile: "top_grill" } });
    expect(wood.heatDistribution).toBeUndefined();
    expect(kitchenConstraints(wood).oven_heat_profile).toBeUndefined();
    const home = resolveEffectiveKitchen({ oven: { ovenType: "home", maxTemp: 250 }, equipment: { oven_heat_profile: "top_grill" } });
    expect(home.heatDistribution).toBe("top_grill");
  });

  it("i vincoli del motore portano anche la bocca del forno", () => {
    const k = resolveEffectiveKitchen({ oven: { ovenType: "gas_pizza", maxTemp: 500, modelId: "ooni-koda-12" } }, undefined, {}, models);
    expect(kitchenConstraints(k)).toEqual({ oven_type: "gas_pizza", oven_max_temp_c: 500, oven_capacity_temp_c: 500, oven_max_pizza_cm: 30 });
  });
});

describe("nextSavedOven (S18-A-02)", () => {
  it("ritoccare lo stesso tipo conserva modello e temperatura", () => {
    expect(nextSavedOven({ ovenType: "electric_high", maxTemp: 509, modelId: "effeuno-p134h" }, "electric_high")).toEqual({ ovenType: "electric_high", maxTemp: 509, modelId: "effeuno-p134h" });
  });
  it("confermare il forno dell'edizione toglie il segno «edizione»", () => {
    expect(nextSavedOven({ ovenType: "electric_high", maxTemp: 450, modelId: "aurora-e1", origin: "edition" }, "electric_high").origin).toBeUndefined();
  });
  it("un tipo diverso toglie il modello e prende la temperatura del tipo", () => {
    expect(nextSavedOven({ ovenType: "electric_high", maxTemp: 509, modelId: "effeuno-p134h" }, "home")).toEqual({ ovenType: "home", maxTemp: 250 });
  });
});

describe("motore con la cucina effettiva", () => {
  const base: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, skill_level: 2, available_hours: 0, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false, dietary_filters: [], pantry_flours: [], pantry_yeasts: [] };
  const warningKeys = (c: UserConstraints, id: string) => generateRecipe(STYLES_DB[id], c).scores.warnings.map((w) => w.key);

  it("una NY da 35 cm in un forno da 33 cm: avviso esatto (S18-A-06)", () => {
    const k = kitchenConstraints(resolveEffectiveKitchen({ oven: { ovenType: "electric_high", maxTemp: 450, modelId: "aurora-e1" } }, undefined, {}, [...models, aurora]));
    expect(warningKeys({ ...base, ...k }, "new_york")).toContain("gen.ovenTooNarrow");
    const w = generateRecipe(STYLES_DB.new_york, { ...base, ...k }).scores.warnings.find((x) => x.key === "gen.ovenTooNarrow");
    expect(w?.params).toEqual({ max: 33, diameter: 35 });
    // La napoletana da 32 cm entra: nessun avviso; senza dato del forno, nessun avviso.
    expect(warningKeys({ ...base, ...k }, "napoletana_stg")).not.toContain("gen.ovenTooNarrow");
    expect(warningKeys(base, "new_york")).not.toContain("gen.ovenTooNarrow");
  });

  it("grill superiore in un forno a legna: istruzioni del forno a legna (S16-B-03)", () => {
    const r = generateRecipe(STYLES_DB.napoletana_stg, { ...base, oven_type: "wood", oven_max_temp_c: 485, oven_heat_profile: "top_grill" });
    const bake = r.timeline.find((s) => s.id === "bake")!;
    const keys = bake.msg?.description?.map((m) => m.key) ?? [];
    expect(keys).toContain("timeline.oven.wood");
    expect(keys).not.toContain("timeline.oven.topGrillShelf");
  });

  it("focaccia a 230 °C in un forno da 250 °C: «impostato a», non «al massimo» (S10-A-22)", () => {
    const r = generateRecipe(STYLES_DB.focaccia_genovese, base);
    const bake = r.timeline.find((s) => s.id === "bake")!;
    const oven = bake.msg?.description?.find((m) => m.key.startsWith("timeline.oven."));
    expect(oven?.key).toBe("timeline.oven.staticShelfSet");
    expect(oven?.params).toEqual({ temp: r.oven_temp_c });
    // La napoletana al massimo del forno di casa resta «al massimo».
    const nap = generateRecipe(STYLES_DB.napoletana_stg, base).timeline.find((s) => s.id === "bake")!;
    expect(nap.msg?.description?.some((m) => m.key === "timeline.oven.staticShelf" || m.key === "timeline.homeTray.bake")).toBe(true);
  });
});
