import { describe, expect, it } from "vitest";
import { STYLES_DB, type UserConstraints } from "../domain/pizza-engine";
import { getVersions } from "../data/style-versions";
import { getInterpretationsForStyle } from "../data/interpretation-library";
import { recipePresetState, isRecipePresetModified, buildGeneratedRecipe, optimizeSelectedRecipe } from "./recipe-entry";

const kitchen: UserConstraints = { oven_type:"home",oven_max_temp_c:250,oven_capacity_temp_c:250,skill_level:2,
 available_hours:0,dough_balls:4,has_mixer:false,has_pizza_stone:true,has_pizza_steel:false,has_baking_pan:true,
 pantry_flours:[],pantry_yeasts:[],dietary_filters:[] };

describe("preset completo e provenienza", () => {
 it("ogni versione/firma è pulita alla selezione; i valori modificati non cambiano il riferimento", () => {
  for(const style of Object.values(STYLES_DB)) {
   const presets=[...getVersions(style.id).map(v=>recipePresetState(style,v,null)),
    ...getInterpretationsForStyle(style.id).map(i=>recipePresetState(style,null,i))];
   for(const reference of presets) {
    expect(isRecipePresetModified(reference,reference),style.id).toBe(false);
    for(const patch of [{hydration:reference.hydration+1},{flourW:reference.flourW+10},{flourPL:reference.flourPL+.05},
      {salt:reference.salt+.1},{fermentHours:reference.fermentHours+1},{fermentTemp:reference.fermentTemp+1},
      {usePreFerment:!reference.usePreFerment},{preFerment:{type:"poolish" as const,flourPct:30}},
      {panConfig:{...reference.panConfig,ballWeightG:999}},{toppingConcept:"test-other"}]) {
      expect(isRecipePresetModified(reference,{...reference,...patch}),`${style.id} ${JSON.stringify(patch)}`).toBe(true);
    }
    const reapplied=recipePresetState(style,reference.version,reference.interpretation);
    expect(reapplied).toEqual(reference);
   }
  }
 });
 it("Pinsa: il preset cambia davvero la W del frumento anche dentro il mix", () => {
  const s=STYLES_DB.pinsa_romana;
  for(const version of getVersions(s.id)) {
   const p=recipePresetState(s,version,null);
   const r=buildGeneratedRecipe({style:s,constraints:kitchen,customHydration:p.hydration,customFlourW:p.flourW,
    customFlourPL:p.flourPL,customSalt:p.salt,customFermentHours:p.fermentHours,customFermentTemp:p.fermentTemp,
    usePreFerment:p.usePreFerment,preFermentChoice:p.preFerment,panConfig:p.panConfig,
    activeVersion:p.version,activeInterpretationId:null,selectedToppingConcept:p.toppingConcept,customFlourBlend:p.flourBlend});
   expect(r.flour_w).toBe(version.params.flour_w);
   expect(r.flour_blend?.find(c=>c.w!==undefined)?.w).toBe(version.params.flour_w);
  }
 });
 it("ottimizzazione dentro una firma: la ricostruzione conserva punteggio, impasto e verdetto della candidata", () => {
  for(const style of Object.values(STYLES_DB)) for(const it of getInterpretationsForStyle(style.id)) {
   const p=recipePresetState(style,null,it);
   const s=p.toppingConcept?{...style,default_topping_ref:p.toppingConcept}:style;
   const o=optimizeSelectedRecipe(s,kitchen,undefined,p.panConfig,null,it.id);
   const r=o.recipe;
   const opened=buildGeneratedRecipe({style:s,constraints:kitchen,customHydration:r.hydration_pct,customFlourW:r.flour_w,
    customFlourPL:r.flour_pl,customSalt:r.baker_pcts?.salt ?? r.style.dough.salt_pct,customFermentHours:r.fermentation_hours,customFermentTemp:r.fermentation_temp_c,
    usePreFerment:r.has_pre_ferment,preFermentChoice:{},panConfig:p.panConfig,activeVersion:null,activeInterpretationId:it.id,
    selectedToppingConcept:p.toppingConcept,customFlourBlend:r.flour_blend?.map(({name,pct,w})=>({name,pct,w})),
    optimizedHydration:o.params.hydration_compensated?{base:o.params.hydration_base,final:o.params.hydration}:null});
   expect(opened.scores,`${style.id}/${it.id}`).toEqual(r.scores);
   expect(opened.verdict).toEqual(r.verdict);
  }
 });
});
