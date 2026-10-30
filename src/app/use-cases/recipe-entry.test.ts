import { describe, expect, it } from "vitest";
import { STYLES_DB, recommendStyles, type UserConstraints } from "../domain/pizza-engine";
import { authorVersionRecipe, buildGeneratedRecipe, canonicalRecipe, canonicalRecipeEntry, getCanonicalVersion, presetOvenTemp, recipePresetState, tailoredRecipeEntry } from "./recipe-entry";
import { getInterpretationById, getInterpretationsForStyle } from "../data/interpretation-library";
import { getStyleReference, getVersions } from "../data/style-versions";

const weights = { authenticity: .3, feasibility: .25, digestibility: .2, sustainability: .15, experimentation: .1 };
const base: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
 available_hours: 24, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
 has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const kitchens: UserConstraints[] = [base, {...base,available_hours:8.13,meal_deadline:true},
 {...base,oven_type:"wood",oven_max_temp_c:450,oven_capacity_temp_c:450,skill_level:4,available_hours:72},
 {...base,oven_type:"coal",oven_max_temp_c:400,oven_capacity_temp_c:400,available_hours:48}];

describe("anteprima → stato editabile → risultato", () => {
 it("i 29 originali ricostruiscono esattamente gli stessi assi, esiti, dosi e timeline", () => {
  for(const constraints of kitchens) for(const style of Object.values(STYLES_DB)) {
   const entry=canonicalRecipeEntry(style,weights); const o=entry.options;
   const opened=buildGeneratedRecipe({style,constraints,scoreWeights:weights,
    customHydration:o.customHydration!,customFlourW:o.customFlourW!, customFlourPL:o.customFlourPL!,
    customFermentHours:o.customFermentationHours!,customFermentTemp:o.customFermentationTempC!,
    usePreFerment:o.usePreFerment!,customSalt:o.customSalt!,panConfig:o.panConfig!,preFermentChoice:{},
    activeVersion:entry.version,activeInterpretationId:entry.interpretation?.id??null,
    selectedToppingConcept:entry.topping,customFlourBlend:o.customFlourBlend});
   expect(opened,style.id).toEqual(canonicalRecipe(style,constraints,weights));
  }
 });
 it("i 29 adattamenti conservano P/L e compensazioni quando entrano negli slider", () => {
  for(const constraints of kitchens) for(const style of Object.values(STYLES_DB)) {
   const entry=tailoredRecipeEntry(style,constraints,weights); const r=entry.recipe;
   const opened=buildGeneratedRecipe({style,constraints,scoreWeights:weights,
    customHydration:r.hydration_pct,customFlourW:r.flour_w,customFlourPL:r.flour_pl,
    customFermentHours:r.fermentation_hours,customFermentTemp:r.fermentation_temp_c,
    usePreFerment:r.has_pre_ferment,customSalt:entry.options.customSalt!,panConfig:entry.options.panConfig!,
    preFermentChoice:{},activeVersion:null,activeInterpretationId:null,
    selectedToppingConcept:style.default_topping_ref??null,customFlourBlend:entry.options.customFlourBlend,
    optimizedHydration:entry.optimizedHydration});
   expect(opened,style.id).toEqual(r);
  }
 });
 it("il gruppo della card è il verdetto della stessa ricetta di cui mostra il voto", () => {
  for(const constraints of kitchens) for(const rec of recommendStyles(constraints,undefined,undefined,
    (style,c)=>tailoredRecipeEntry(style,c,weights).recipe)) {
    expect(rec.recipe.verdict,rec.style.id).toEqual(rec.verdict);
    expect(rec.tier).toBe(rec.verdict.outcome==="ok"?"perfect":rec.verdict.outcome==="warnings"?"good":"not_feasible");
    expect(rec.recipe).toEqual(tailoredRecipeEntry(rec.style,constraints,weights).recipe);
  }
 });
});

describe("condizioni specifiche, senza inventare acquisti", () => {
 it("dispensa non compilata: verificare, senza affermare che manca una farina", () => {
  const r=canonicalRecipe(STYLES_DB.chicago_deep,base,weights);
  expect(r.verdict.outcome).toBe("warnings");
  expect(r.verdict.conditions?.map(c=>c.status)).toEqual(["unverified","unverified"]);
  expect(r.verdict.conditions?.map(c=>c.message.key)).toEqual(["need.checkFlour","need.checkYeast"]);
 });
 it("tipo 0 non prova una W specifica né obbliga a comprare una 00", () => {
  const r=canonicalRecipe(STYLES_DB.chicago_deep,{...base,pantry_flours:["0"]},weights);
  expect(r.verdict.conditions?.find(c=>c.kind==="flour")).toMatchObject({status:"unverified",message:{key:"need.checkFlour",params:{w:r.flour_w}}});
 });
 it("un prodotto dichiarato incompatibile indica la W della ricetta effettiva", () => {
  const r=canonicalRecipe(STYLES_DB.new_haven_apizza,{...base,pantry_inventory_complete:true,pantry_flours:["caputo_cuoco"]},weights);
  expect(r.verdict.conditions?.find(c=>c.kind==="flour")).toMatchObject({status:"missing",message:{key:"need.flour",params:{w:r.flour_w}}});
  expect(r.verdict.outcome).toBe("not_feasible"); // la farina non risolve il forno
  // D-060: chi legge vede la fascia dello stile, non la W puntuale del calcolo.
  const [lo,hi]=STYLES_DB.new_haven_apizza.dough.flour_w_range;
  expect(r.verdict.conditions?.find(c=>c.kind==="flour")?.message.params?.range).toBe(r.flour_w>=lo&&r.flour_w<=hi?`${lo}–${hi}`:String(Math.round(r.flour_w/10)*10));
 });
 it("il frumento compatibile non dimostra di avere tutti gli ingredienti della Pinsa", () => {
  const r=canonicalRecipe(STYLES_DB.pinsa_romana,{...base,pantry_flours:["caputo_nuvola"]},weights);
  expect(r.verdict.conditions?.find(c=>c.kind==="flour_blend")).toMatchObject({status:"unverified",message:{key:"need.checkBlend"}});
 });
 it("le teglie dichiarate disponibili non si propongono di nuovo come mancanti", () => {
  const r=canonicalRecipe(STYLES_DB.chicago_deep,base,weights);
  expect(r.verdict.conditions?.some(c=>c.kind==="pan")).toBe(false);
  expect(canonicalRecipe(STYLES_DB.chicago_deep,{...base,has_baking_pan:false,equipment_inventory_complete:true},weights).verdict.conditions?.some(c=>c.kind==="pan"&&c.status==="missing")).toBe(true);
 });
});

describe("conoscenza, preferenze negative e aiuti facoltativi", () => {
 it("una farina non elencata in un inventario parziale non è una mancanza certa", () => {
  const r=canonicalRecipe(STYLES_DB.chicago_deep,{...base,pantry_flours:["caputo_cuoco"]},weights);
  expect(r.verdict.conditions?.find(c=>c.kind==="flour")?.status).toBe("unverified");
 });
 it("non comprare e lista parziale: si chiede di verificare, senza dedurre un divieto dalla lista vuota", () => {
  const r=canonicalRecipe(STYLES_DB.chicago_deep,{...base,allow_flour_purchase:false},weights);
  expect(r.verdict.outcome).toBe("warnings");
  expect(r.verdict.blockers).toEqual([]);
 });
 it("non comprare e inventario completo senza farine: manca una condizione che non si vuole risolvere", () => {
  const r=canonicalRecipe(STYLES_DB.chicago_deep,{...base,allow_flour_purchase:false,pantry_inventory_complete:true},weights);
  expect(r.verdict.blockers).toContainEqual(expect.objectContaining({kind:"resource_excluded",resource:"flour"}));
 });
 it("una teglia non dichiarata è da verificare; l'assenza confermata resta procurabile finché non viene rifiutata", () => {
  const absent={...base,has_baking_pan:false};
  expect(canonicalRecipe(STYLES_DB.chicago_deep,absent,weights).verdict.conditions?.find(c=>c.kind==="pan")?.status).toBe("unverified");
  const missing=canonicalRecipe(STYLES_DB.chicago_deep,{...absent,equipment_inventory_complete:true},weights);
  expect(missing.verdict.conditions?.find(c=>c.kind==="pan")).toMatchObject({status:"missing",acquisition:"accessory"});
  expect(missing.verdict.outcome).toBe("warnings");
  expect(canonicalRecipe(STYLES_DB.chicago_deep,{...absent,equipment_inventory_complete:true,allow_equipment_purchase:false},weights).verdict.outcome).toBe("not_feasible");
 });
 it("il riso escluso blocca la Pinsa effettiva; nessun acquisto annulla l'esclusione", () => {
  const r=canonicalRecipe(STYLES_DB.pinsa_romana,{...base,excluded_flours:["riso"],allow_flour_purchase:true},weights);
  expect(r.verdict.blockers).toContainEqual(expect.objectContaining({kind:"resource_excluded",resource:"flour"}));
 });
 it("semola facoltativa: escluderla sopprime il suggerimento, senza peggiorare voto o verdetto", () => {
  const s=STYLES_DB.new_york;
  const a=canonicalRecipe(s,base,weights);
  const b=canonicalRecipe(s,{...base,excluded_flours:["semola"]},weights);
  expect(a.optional_aids?.map(m=>m.key)).toContain("aid.semolina");
  expect(b.optional_aids).toEqual([]);
  expect(b.scores).toEqual(a.scores);
  expect(b.verdict).toEqual(a.verdict);
 });
 it("nessuna preferenza temporale non introduce una scadenza fittizia di 24 h", () => {
  const r=tailoredRecipeEntry(STYLES_DB.pinsa_romana,{...base,available_hours:0,meal_deadline:false},weights).recipe;
  expect(r.fermentation_hours).toBeGreaterThanOrEqual(24);
  expect(r.verdict.blockers.some(b=>b.kind==="time_window")).toBe(false);
 });
});

describe("ottimizzazione con un blocco indipendente dal tempo", () => {
 it("un riso escluso non induce a portare la Pinsa oltre il massimo di maturazione", () => {
  const r=tailoredRecipeEntry(STYLES_DB.pinsa_romana,{...base,available_hours:0,excluded_flours:["riso"]},weights).recipe;
  expect(r.verdict.outcome).toBe("not_feasible");
  expect(r.fermentation_hours).toBeLessThanOrEqual(r.style.dough.fermentation_hours_range[1]);
  expect(r.verdict.blockers.map(b=>b.kind)).toEqual(["resource_excluded"]);
 });
});

/* FW-14 (D-B, S03-V-01): il riferimento è dichiarato nei dati e cade negli
 * intervalli che la scheda dello stile mostra nelle pill. */
describe("FW-14 · riferimento dello stile", () => {
 const inRange=(v:number,[lo,hi]:[number,number])=>v>=lo&&v<=hi;
 it("ogni riferimento rientra negli intervalli dello stile", () => {
  for(const style of Object.values(STYLES_DB)) {
   const o=canonicalRecipeEntry(style).options; const d=style.dough;
   expect(inRange(o.customHydration!,d.hydration_pct_range),`${style.id} idratazione ${o.customHydration}`).toBe(true);
   expect(inRange(o.customFlourW!,d.flour_w_range),`${style.id} W ${o.customFlourW}`).toBe(true);
   expect(inRange(o.customFermentationHours!,d.fermentation_hours_range),`${style.id} ore ${o.customFermentationHours}`).toBe(true);
  }
 });
 it("ogni stile con versioni dichiara il riferimento; i disciplinari prevalgono", () => {
  for(const style of Object.values(STYLES_DB)) {
   const ref=getStyleReference(style.id);
   if(ref.referenceVersionId) expect(getVersions(style.id).map(v=>v.id),style.id).toContain(ref.referenceVersionId);
   if(ref.basis==="disciplinare") expect(canonicalRecipeEntry(style).interpretation?.type,style.id).toBe("disciplinare");
   else expect(canonicalRecipeEntry(style).interpretation,style.id).toBeNull();
  }
  expect(canonicalRecipeEntry(STYLES_DB.teglia_romana).interpretation?.id).toBe("apiter_teglia");
  expect(getCanonicalVersion("teglia_romana")).toBeNull();
 });
});

/* G1b: il verdetto di ogni versione d'autore nel pannello stile è quello della
 * ricetta che «Genera con questa versione» apre in Crea (stato del preset,
 * forno di presetOvenTemp, buildGeneratedRecipe come useRecipeState). */
describe("authorVersionRecipe", () => {
 const p3: UserConstraints = {...base, oven_type:"electric_high", oven_max_temp_c:509, oven_capacity_temp_c:509, skill_level:3};
 it("coincide con la ricetta che Crea costruisce dal preset della versione", () => {
  for(const constraints of [...kitchens, p3]) for(const style of Object.values(STYLES_DB)) for(const it of getInterpretationsForStyle(style.id)) {
   const p=recipePresetState(style,null,it);
   const opened=buildGeneratedRecipe({style,scoreWeights:weights,constraints:{...constraints,oven_max_temp_c:presetOvenTemp(style,constraints)},
    customHydration:p.hydration,customFlourW:p.flourW,customFlourPL:p.flourPL,customSalt:p.salt,
    customFermentHours:p.fermentHours,customFermentTemp:p.fermentTemp,usePreFerment:p.usePreFerment,
    preFermentChoice:{},panConfig:p.panConfig,activeVersion:null,activeInterpretationId:it.id,
    selectedToppingConcept:p.toppingConcept,customFlourBlend:p.flourBlend});
   expect(authorVersionRecipe(style,it,constraints,weights),`${style.id} · ${it.id}`).toEqual(opened);
  }
 });
 it("sulla STG: col forno di casa la versione AVPN è bloccata, con l'Effeuno no", () => {
  const avpn=getInterpretationById("avpn_disciplinare")!;
  expect(authorVersionRecipe(STYLES_DB.napoletana_stg,avpn,base).verdict.outcome).toBe("not_feasible");
  expect(authorVersionRecipe(STYLES_DB.napoletana_stg,avpn,p3).verdict.outcome).not.toBe("not_feasible");
 });
 it("una versione può essere bloccata dove lo stile no: Bonci (48 h) col pasto fra 28 h, la teglia su misura sì", () => {
  const bonci=getInterpretationById("bonci_pizzarium")!;
  const teglia=STYLES_DB.teglia_romana;
  expect(authorVersionRecipe(teglia,bonci,{...base,meal_deadline:true,available_hours:28}).verdict.outcome).toBe("not_feasible");
  expect(authorVersionRecipe(teglia,bonci,{...base,meal_deadline:true,available_hours:96}).verdict.outcome).not.toBe("not_feasible");
  expect(tailoredRecipeEntry(teglia,{...base,meal_deadline:true,available_hours:28},weights).recipe.verdict.outcome).not.toBe("not_feasible");
 });
});
