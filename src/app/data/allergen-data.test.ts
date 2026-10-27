import { describe, expect, it } from "vitest";
import { assessAllergens, allergenWarnings, ingredientAllergens, normalizeAllergenLabels } from "./allergen-data";

describe("allergen identities, not diet guarantees",()=>{
 it.each([
  ["Mozzarella senza lattosio",["milk"]],["Parmigiano Reggiano",["milk"]],
  ["Latte di soia",["soy"]],["Latte di mandorla",["nuts"]],["Latte di cocco",[]],
  ["Burro d'arachidi",["peanuts"]],["Burro di cacao",[]],["Formaggio vegetale senza lattosio",[]],
  ["Farina di frumento",["gluten"]],["Farina di grano saraceno",[]],["Farina integrale di riso",[]],
  ["Farina di soia",["soy"]],["Semola di mais",[]],["Uova di lompo",["fish"]],
  ["Bottarga (uova di muggine)",["fish"]],["Uova di quaglia",["eggs"]],["Noce moscata",[]],
  ["Pistacchi",["nuts"]],["Arachidi",["peanuts"]],["Vongole",["molluscs"]],["Gamberetti",["crustaceans"]],
  ["Sedano rapa",["celery"]],["Senape",["mustard"]],["Tahina",["sesame"]],["Farina di lupini",["lupin"]],
  ["Olio di soia completamente raffinato",[]],["Sciroppo di glucosio da frumento",[]],
  ["Maltodestrine da frumento",[]],["Anidride solforosa",["sulphites"]],["Olio di soia completamente raffinato e arachidi",["peanuts"]],["Sciroppo di glucosio da frumento e latte",["milk"]],
  ["Salsa senza latte e uova",[]],["Salsa senza solfiti",[]],["Manitoba",["gluten"]],["Salsa milk-free",[]],["Olio EVO o burro",[]],["Provola o fiordilatte",["milk"]],
 ] as [string,string[]][])("%s",(name,ids)=>expect(ingredientAllergens(name).contains).toEqual(ids));
 it("keeps unknown sauces and alternatives unverified, never invented traces",()=>{
  for(const name of ["Salsa barbecue","Mix proprietario","Farina speciale","Acqua o panna","Vino bianco"]){
   expect(ingredientAllergens(name).unverified,name).toBe(true);
   const r=assessAllergens([{name,section:"topping"}],["milk"]);expect(r.may_contain).toEqual([]);expect(r.unverified).toHaveLength(1);
  }
 });
 it("does not turn preparation notes into ingredient composition",()=>{
  const r=assessAllergens([{name:"Pomodoro (servire con panna)",section:"topping"}]);expect(r.contains).toEqual([]);expect(r.unverified).toHaveLength(1);
 });
 it("evaluates dough, declared compound components and optional choices together",()=>{
  const inputs=[{name:"Farina di frumento",section:"dough" as const},{name:"Salsa speciale",components:["latte","senape"],section:"topping" as const},{name:"Granella di pistacchio",optional:true,section:"topping" as const}];
  const r=assessAllergens(inputs,["milk","nuts"]);expect(r.contains.map(a=>a.id)).toEqual(["gluten","milk","mustard"]);expect(r.conditional.map(a=>a.id)).toEqual(["nuts"]);
  expect(r.contains.find(g=>g.id==="milk")!.sources[0].component).toBe("latte");
  expect(allergenWarnings(r).filter(w=>w.severity==="critical").map(w=>w.filterId)).toEqual(["allergen:milk"]);
  const selected=assessAllergens(inputs,["nuts"],["granella di pistacchio"]);expect(selected.contains.some(a=>a.id==="nuts")).toBe(true);expect(allergenWarnings(selected).some(w=>w.severity==="critical")).toBe(true);
 });
 it("accepts only explicit product labels for traces, without erasing recipe allergens",()=>{
  const labels=normalizeAllergenLabels({"mozzarella senza lattosio":{product:"Prodotto scelto",contains:[],may_contain:["nuts"],complete:true}});
  const r=assessAllergens([{name:"Mozzarella senza lattosio",section:"topping"}],["milk","nuts"],[],labels);
  expect(r.contains.map(g=>g.id)).toEqual(["milk"]);expect(r.may_contain.map(g=>g.id)).toEqual(["nuts"]);
  expect(allergenWarnings(r).filter(w=>w.severity==="critical")).toHaveLength(2);
  expect(r.may_contain[0].sources[0].evidence).toBe("product_label");expect(r.unverified).toEqual([]);
 });
 it("normalizes malformed metadata without inventing valid allergen IDs",()=>{
  expect(normalizeAllergenLabels({a:{product:"",contains:["milk"]},b:{product:"X",contains:["milk","not_real"],may_contain:"nuts"}})).toEqual({b:{product:"X",contains:["milk"],may_contain:[],complete:false}});
 });
});

it("optional dairy cannot imply that omitting it removes required milk",()=>{
 const r=assessAllergens([{name:"Mozzarella",section:"topping"},{name:"Parmigiano",section:"topping",optional:true}],["milk"]);
 expect(allergenWarnings(r).filter(w=>w.filterId==="allergen:milk").map(w=>w.message.key)).toEqual(["allergen.conflict"]);
});
