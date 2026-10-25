import { afterEach, describe, expect, it, vi } from "vitest";
import { savePantryConstraints } from "./pantry-storage";
import { loadProfileDefaults, mergeDraftConstraints } from "../../hooks/use-profile-defaults";
import type { UserConstraints } from "../../domain/pizza-engine";

afterEach(()=>vi.unstubAllGlobals());
describe("dispensa completa → profilo → ricetta",()=>{
  it("conserva dettagli, esclusioni e dati precedenti dopo il salvataggio rapido",()=>{
    const storage=new Map<string,string>([["vulcan_pantry",JSON.stringify({legacy:"keep"})]]);
    vi.stubGlobal("localStorage",{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value)});
    const constraints:UserConstraints={oven_type:"home",oven_max_temp_c:250,available_hours:48,skill_level:3,dough_balls:4,
      has_mixer:false,has_pizza_stone:false,has_pizza_steel:false,has_baking_pan:true,dietary_filters:[],
      pantry_flours:["custom:bag"],pantry_yeasts:["dry"],pantry_flour_details:{"custom:bag":{name:"Farina personale",w:285,protein_pct:12.7}},
      pantry_ingredients:["basilico"],excluded_ingredients:["olio_evo"],excluded_yeasts:["fresh"],excluded_flours:["riso"]};
    savePantryConstraints(constraints);
    savePantryConstraints({...constraints,pantry_flours:["custom:bag","00"]});
    expect(JSON.parse(storage.get("vulcan_pantry")!)).toMatchObject({legacy:"keep",excluded_ingredients:["olio_evo"],flour_details:constraints.pantry_flour_details});
    const profile=loadProfileDefaults().constraints;
    expect(profile.pantry_flour_details).toEqual(constraints.pantry_flour_details);
    expect(profile.excluded_yeasts).toEqual(["fresh"]);
    const merged=mergeDraftConstraints(profile,{pantry_flour_details:{},excluded_ingredients:[]});
    expect(merged.pantry_flour_details).toEqual(constraints.pantry_flour_details);
    expect(merged.excluded_ingredients).toEqual(["olio_evo"]);
  });
});
