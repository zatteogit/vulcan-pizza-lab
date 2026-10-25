import { describe, expect, it } from "vitest";
import { generateRecipe, STYLES_DB, type GeneratedRecipe, type UserConstraints } from "../../domain/pizza-engine";
import { recipeCardSignals, recipePresentationState } from "./recipe-card-signals";

const constraints: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, available_hours: 48, skill_level: 4,
  dough_balls: 4, has_mixer: true, has_pizza_stone: true, has_pizza_steel: true, has_baking_pan: true,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [] };
const base = generateRecipe(STYLES_DB.focaccia_genovese, constraints);
const withVerdict = (patch: Partial<GeneratedRecipe["verdict"]>): GeneratedRecipe => ({ ...base, verdict: { ...base.verdict, ...patch } });

describe("card: solo informazioni che aiutano a scegliere", () => {
  it("la dispensa non compilata espone la condizione sulla W della ricetta", () => {
    expect(base.verdict.conditions?.some(c => c.kind === "flour")).toBe(true);
    expect(recipeCardSignals(base)[0].message).toMatchObject({key:"need.checkFlour",params:{w:base.flour_w}});
  });
  it("Calzone e Chicago con tutte le farine rimosse mostrano la W effettiva", () => {
    for (const style of [STYLES_DB.calzone_napoletano, STYLES_DB.chicago_deep]) {
      const recipe = generateRecipe(style, {...constraints, oven_type:"wood", oven_max_temp_c:450, has_baking_pan:false});
      expect(recipe.verdict.outcome).not.toBe("not_feasible");
      expect(recipeCardSignals(recipe)).toContainEqual(expect.objectContaining({
        icon:"flour",message:expect.objectContaining({key:"need.checkFlour",params:{w:recipe.flour_w}}),
      }));
    }
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
    expect(recipeCardSignals(r)[0].message).toMatchObject({key:"need.flour",params:{w:285}});
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

describe("voto e stato operativo distinti", () => {
  it("una dispensa incompleta non è un adattamento della ricetta", () => {
    expect(recipePresentationState(base, base)).toBe("check");
  });
  it("una modifica effettiva conserva anche i controlli pendenti nel verdetto", () => {
    const changed = { ...base, hydration_pct: base.hydration_pct - 1 };
    expect(recipePresentationState(changed, base)).toBe("adapted");
    expect(changed.verdict.conditions).toEqual(base.verdict.conditions);
  });
  it("il blocco resta prioritario rispetto a un voto alto e alle modifiche", () => {
    expect(recipePresentationState(withVerdict({outcome:"not_feasible"}),base)).toBe("blocked");
  });
});
