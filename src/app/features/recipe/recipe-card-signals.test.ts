import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type GeneratedRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { recipeCardSignals, recipePresentationState } from "./recipe-card-signals";

const constraints: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, available_hours: 48, skill_level: 4,
  dough_balls: 4, has_mixer: true, has_pizza_stone: true, has_pizza_steel: true, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
const base = generateRecipe(STYLES_DB.focaccia_genovese, constraints);
const withVerdict = (patch: Partial<GeneratedRecipe["verdict"]>): GeneratedRecipe => ({ ...base, verdict: { ...base.verdict, ...patch } });

describe("card: solo informazioni che aiutano a scegliere", () => {
  // D-060 (29/10/2026, Matteo): la verifica di dispensa resta nel verdetto
  // (motore, MCP) ma non è un segnale: valeva per ogni ricetta.
  it("la dispensa non compilata resta nel verdetto ma non diventa un segnale", () => {
    expect(base.verdict.conditions?.find(c => c.kind === "flour")).toMatchObject({status:"unverified",message:{key:"need.checkFlour",params:{w:base.flour_w}}});
    expect(recipeCardSignals(base).map(s => s.message.key)).not.toContain("need.checkFlour");
  });
  it("Calzone e Chicago: la condizione sulla farina porta la fascia dello stile, non la W puntuale", () => {
    for (const style of [STYLES_DB.calzone_napoletano, STYLES_DB.chicago_deep]) {
      const recipe = generateRecipe(style, {...constraints, oven_type:"wood", oven_max_temp_c:450, has_baking_pan:false});
      expect(recipe.verdict.outcome).not.toBe("not_feasible");
      const [lo, hi] = style.dough.flour_w_range;
      expect(recipe.verdict.conditions?.find(c => c.kind === "flour")?.message.params).toMatchObject({w:recipe.flour_w,range:`${lo}–${hi}`});
      expect(recipeCardSignals(recipe).map(s => s.message.key)).not.toContain("need.checkFlour");
    }
  });
  it("Scopri non mostra prerequisiti di dispensa o attrezzatura; Crea li mantiene", () => {
    const recipe=withVerdict({conditions:[
      {kind:"pan",status:"unverified",message:{key:"need.checkPan",fallback:""}},
      {kind:"flour",status:"unverified",message:{key:"need.checkFlour",fallback:"",params:{w:285}}},
    ]});
    expect(recipeCardSignals(recipe,"explore")).toEqual([]);
    expect(recipeCardSignals(recipe,"create").map(signal=>signal.message.key)).toEqual(["card.panCheck"]);
    expect(recipe.verdict.conditions).toHaveLength(2);
  });
  it("Scopri conserva gli avvisi sul metodo di cottura", () => {
    const recipe=withVerdict({adaptations:[{key:"gen.notWoodOven",fallback:""}]});
    expect(recipeCardSignals(recipe,"explore").map(signal=>signal.message.key)).toEqual(["need.withoutWood"]);
  });
  it("un blocco termico precede qualsiasi suggerimento di acquisto", () => {
    const r = withVerdict({ outcome: "not_feasible", blockers: [{kind:"oven_too_cold",oven_c:250,style_min_c:350}],
      conditions:[{kind:"flour",status:"missing",message:{key:"need.flour",fallback:"",params:{w:300}}}] });
    expect(recipeCardSignals(r).map(s => s.message.key)).toEqual(["need.blockedOven"]);
  });
  it("mancanza certa e dato da verificare hanno pill diverse", () => {
    for(const status of ["missing","unverified"] as const) {
      const r=withVerdict({conditions:[{kind:"pan",status,message:{key:"need.pan",fallback:""}}]});
      expect(recipeCardSignals(r)[0].message.key).toBe(status==="missing"?"card.panMissing":"card.panCheck");
    }
  });
  it("un ingrediente confermato mancante viene mostrato con la W effettiva", () => {
    const r=withVerdict({conditions:[{kind:"flour",status:"missing",message:{key:"need.flour",fallback:"",params:{w:285}}}]});
    expect(recipeCardSignals(r)[0].message).toMatchObject({key:"card.flourMissing",params:{w:285}});
  });
  it("mantiene il metodo specifico e limita la card a due condizioni", () => {
    const r=withVerdict({adaptations:[{key:"gen.homeBakingMethod",fallback:""}],conditions:[
      {kind:"pan",status:"missing",message:{key:"need.pan",fallback:""}},
      {kind:"flour_blend",status:"unverified",message:{key:"need.checkBlend",fallback:""}},
    ]});
    expect(recipeCardSignals(r).map(s=>s.message.key)).toEqual(["need.invertedTray","card.panMissing"]);
  });
  it("le condizioni complete restano nel verdetto anche quando non entrano nella card", () => {
    const before=JSON.stringify(base.verdict);
    recipeCardSignals(base);
    expect(JSON.stringify(base.verdict)).toBe(before);
  });
});

describe("FW-10: l'idratazione per chi comincia è un segnale di livello 1", () => {
  it("Teglia romana per un principiante a 250 °C: prima l'impasto, poi la cottura", () => {
    const recipe = generateRecipe(STYLES_DB.teglia_romana, { ...constraints, skill_level: 1 });
    expect(recipe.verdict.adaptations.map(a => a.key)).toContain("feas.hydrationBeginnerHigh");
    const signals = recipeCardSignals(recipe);
    expect(signals[0]).toMatchObject({ icon: "water", tone: "warning", message: { key: "card.hydrationBeginner" } });
    expect(recipeCardSignals(recipe, "explore")[0].message.key).toBe("card.hydrationBeginner");
  });
  it("chi è esperto non vede il segnale", () => {
    const recipe = generateRecipe(STYLES_DB.teglia_romana, constraints);
    expect(recipeCardSignals(recipe).some(s => s.message.key === "card.hydrationBeginner")).toBe(false);
  });
});

describe("voto e stato operativo distinti", () => {
  it("D-060: le sole verifiche di dispensa non rendono la ricetta «con condizioni»", () => {
    const onlyPantry = withVerdict({ outcome: "warnings", adaptations: [{key:"need.checkFlour",fallback:""},{key:"need.checkYeast",fallback:""}] });
    expect(recipePresentationState(onlyPantry)).toBe("ready");
    const withPan = withVerdict({ outcome: "warnings", adaptations: [{key:"need.checkFlour",fallback:""},{key:"need.checkPan",fallback:""}] });
    expect(recipePresentationState(withPan)).toBe("check");
  });
  it("una modifica effettiva conserva anche i controlli pendenti nel verdetto", () => {
    const changed = { ...base, hydration_pct: base.hydration_pct - 1 };
    expect(recipePresentationState(changed)).toBe(recipePresentationState(base));
    expect(changed.verdict.conditions).toEqual(base.verdict.conditions);
  });
  it("il blocco resta prioritario rispetto a un voto alto e alle modifiche", () => {
    expect(recipePresentationState(withVerdict({outcome:"not_feasible"}))).toBe("blocked");
  });
});
