import type { DietaryWarning } from "./dietary-data";
import { pantryIngredientId } from "../domain/pantry-ingredients";

/** EU 1169/2011 Annex II groups. These are recipe/label findings, not a
 * certification of absence, clinical tolerance or kitchen cross-contact. */
export const ALLERGEN_IDS = ["gluten", "crustaceans", "eggs", "fish", "peanuts", "soy", "milk", "nuts", "celery", "mustard", "sesame", "sulphites", "lupin", "molluscs"] as const;
export type AllergenId = typeof ALLERGEN_IDS[number];
export const ALLERGEN_NAMES_IT: Record<AllergenId, string> = {
  gluten:"Cereali con glutine",crustaceans:"Crostacei",eggs:"Uova",fish:"Pesce",peanuts:"Arachidi",soy:"Soia",milk:"Latte",nuts:"Frutta a guscio",celery:"Sedano",mustard:"Senape",sesame:"Sesamo",sulphites:"Anidride solforosa e solfiti",lupin:"Lupini",molluscs:"Molluschi",
};
export function normalizeAllergenIds(value: unknown): AllergenId[] {
  return Array.isArray(value) ? ALLERGEN_IDS.filter(id => value.includes(id)) : [];
}
export interface AllergenDeclaration {
  /** The actual product chosen for this recipe, explicitly entered by the user. */
  product: string;
  contains: AllergenId[];
  may_contain: AllergenId[];
  complete: boolean;
}
export function normalizeAllergenLabels(value: unknown): Record<string, AllergenDeclaration> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0,100).flatMap(([id,v]) => {
    if (["__proto__","constructor","prototype"].includes(id) || !id.trim() || !v || typeof v !== "object" || Array.isArray(v)) return [];
    const d=v as Record<string,unknown>;
    if (typeof d.product !== "string" || !d.product.trim()) return [];
    return [[pantryIngredientId(id),{product:d.product.trim().slice(0,120),contains:normalizeAllergenIds(d.contains),may_contain:normalizeAllergenIds(d.may_contain),complete:d.complete===true}]];
  }));
}
export interface AllergenIngredient {
  name: string;
  components?: readonly string[];
  optional?: boolean;
  section: "dough" | "topping" | "cooking";
  /** Only actual product-label data may introduce precautionary traces. */
  allergen_declaration?: AllergenDeclaration;
}
export interface AllergenSource {
  ingredient_id: string;
  ingredient: string;
  component?: string;
  section: AllergenIngredient["section"];
  optional: boolean;
  evidence: "ingredient" | "declared_component" | "product_label";
  product?: string;
}
export interface AllergenFinding { id: AllergenId; sources: AllergenSource[] }
export interface RecipeAllergens {
  contains: AllergenFinding[];
  conditional: AllergenFinding[];
  may_contain: AllergenFinding[];
  unverified: { ingredient_id: string; ingredient: string; section: AllergenIngredient["section"]; optional: boolean }[];
  optional_ingredients: { id: string; name: string; selected: boolean }[];
  avoided: AllergenId[];
}

const RULES: [AllergenId,RegExp][] = [
  ["gluten", /\b(frumento|grano(?!\s+saraceno)|semola|semolino|farro|spelta|khorasan|kamut|segale|orzo|avena|glutine|gluten|seitan|pangrattato|mollica di pane|wheat|rye|barley|oats|spelt)\b|\b(manitoba|integrale)\b|farina\s+(?:00|0|tipo\s*[12]|integrale|manitoba)\b/],
  ["crustaceans", /\b(gamber\w*|granch\w*|aragost\w*|astice|astici|scampi|scampo|mazzancoll\w*|prawn\w*|shrimp\w*|crab\w*|lobster\w*)\b/],
  ["eggs", /\b(uov[oa]|tuorl\w*|albume|albumi|egg|eggs)\b/],
  ["fish", /\b(acciugh\w*|alici|alice|salmone|tonno|bottarga|pesce|muggine|lompo|anchov\w*|salmon|tuna|fish)\b/],
  ["peanuts", /\b(arachid\w*|peanut\w*)\b/],
  ["soy", /\b(soia|soya|soy|edamame|tofu(?!\s+di\s+ceci))\b/],
  ["milk", /\b(latte|fiordilatte|lattosio|siero|burro|panna|formaggio|formaggi|mozzarella|ricotta|crescenza|stracchino|robiola|toma|tuma|primosale|burrata|stracciatella|provol\w*|pecorino|parmigiano|grana padano|gorgonzola|caciocavallo|fontina|feta|cheddar|gouda|cheese|milk|whey|butter|cream)\b|crème fraîche/],
  ["nuts", /\b(mandorl\w*|nocciol\w*|noci|noce(?!\s+(moscata|di\s+cocco))|pistacch\w*|anacard\w*|pecan|macadamia|almond\w*|hazelnut\w*|walnut\w*|cashew\w*|pistachio\w*|brazil nuts?)\b/],
  ["celery", /\b(sedano|celery|celeriac)\b/], ["mustard", /\b(senape|mustard)\b/],
  ["sesame", /\b(sesamo|sesame|tahini|tahina)\b/], ["sulphites", /\b(solfiti|anidride solforosa|sulphites?|sulfites?)\b/],
  ["lupin", /\b(lupin[io]?|lupins)\b/], ["molluscs", /\b(vongol\w*|cozz[ae]|ostric\w*|calamar\w*|seppi\w*|polp[oi]|lumach\w*|mussels?|clams?|oysters?|squid|octopus)\b/],
];
// Single-ingredient identities: knowing intrinsic allergens never proves that
// the product/working area has no accidental contamination.
const SIMPLE = /^(acqua|sale|fior di sale|olio (evo|extra\s?vergine|d.oliva|di oliva)|zucchero|lievito fresco|farina|frumento|grano|riso|mais|soia|semola|manitoba|integrale|burro|strutto|latte|uov[oa]|pomodor\w*|pelati|aglio|cipoll\w*|basilico|origano|pepe|rosmarino|patate|funghi|porcini|champignon|rucola|scarola|friarielli|zucchin\w*|melanzan\w*|peperon[ei]|olive|capperi|ananas|aneto|mentuccia|pere|spinaci|jalapeños|coriandolo|limone|granella di pistacchio|nocciole|mandorle|noci|pistacchi|arachidi|sesamo|lupini|lievito di birra)\b/;
const DAIRY = /^(mozzarella|ricotta|crescenza|stracchino|robiola|burrata|stracciatella|provol\w*|pecorino|parmigiano|grana padano|gorgonzola|caciocavallo|fontina|feta|cheddar|gouda|fior di latte|caciotta)\b/;

/** Classify declared words/identities only; never reconstruct a sauce or read
 * hidden ingredients out of preparation notes. Alternative branches produce
 * only their common allergens as certain. Unknown is NOT a 'may contain'. */
function classifyIngredient(name: string): { contains: AllergenId[]; unverified: boolean } {
  let n=name.normalize("NFKC").toLocaleLowerCase("it").trim();
  // Annex II exemptions used in ingredient labels. No inference from W,
  // protein, fermentation, cooking temperature, vegan or lactose-free claims.
  const exemptions=/olio di soia completamente raffinato|sciroppo di glucosio (?:da|di|a base di) (?:frumento|orzo)|maltodestrine? (?:da|di|a base di) frumento/g;
  if (!n.replace(exemptions, "").trim()) return {contains:[],unverified:false};
  // An exempt component never exempts the rest of a mixed ingredient.
  n=n.replace(exemptions,"componente esente");
  const hasNotes=/[()]/.test(n);
  n=n.replace(/\([^)]*\)/g,"").replace(/farina integrale di (riso|mais|grano saraceno)|semola di (mais|riso)/g,(_,a:string,b:string)=>`farina di ${a??b}`);
  const negativeGroup="(?:latte|lattosio|uova|soia|arachidi|glutine|frutta a guscio|crostacei|pesce|sedano|senape|sesamo|anidride solforosa|solfiti|lupini|molluschi)";
  n=n.replace(new RegExp(`\\bsenza ${negativeGroup}(?:\\s*(?:,|e|né)\\s*${negativeGroup})*\\b`,"g"),"").replace(/\b(?:gluten|lactose|milk|egg|soy|peanut|nut)[ -]free\b/g,"")
    .replace(/\buov[oa](?=\s+di\s+(?:pesce|lompo|muggine|salmone|tonno))/g,"")
    .replace(/\blatte(?=\s+(?:di\s+|d.)?(?:soia|riso|mandorle?|avena|cocco|nocciole|anacardi|vegetale))/g,"")
    .replace(/\bburro(?=\s+(?:di\s+|d.)(?:arachidi|mandorle|cacao))|\b(?:formaggio|mozzarella|burro)\s+(?:vegetale|vegano)|\bvegan\s+cheese/g,"");
  const branches=n.split(/\s+(?:o|oppure)\s+/).map(s=>s.replace(/[()]/g,"").trim());
  const detected=branches.map(branch=>RULES.filter(([,test])=>test.test(branch)).map(([id])=>id));
  const common=ALLERGEN_IDS.filter(id=>detected.every(ids=>ids.includes(id)));
  const knownFlour=!/^farina\b/.test(n)||common.length>0||/^farina (di )?(riso|mais|sorgo|miglio|grano saraceno|ceci|castagne|cocco|teff|quinoa)\b/.test(n);
  return {contains:common,unverified:hasNotes||branches.length>1 || !(SIMPLE.test(n)&&knownFlour||DAIRY.test(n))};
}

const identityCache=new Map<string,ReturnType<typeof classifyIngredient>>();
export function ingredientAllergens(name:string):ReturnType<typeof classifyIngredient>{
  let value=identityCache.get(name);
  if(!value){value=classifyIngredient(name);if(identityCache.size>=1024)identityCache.clear();identityCache.set(name,value);}
  return {contains:[...value.contains],unverified:value.unverified};
}

export function assessAllergens(ingredients: AllergenIngredient[], avoid: readonly AllergenId[] = [], selected: readonly string[] = [], labels: Record<string,AllergenDeclaration> = {}): RecipeAllergens {
  const selectedIds=new Set(selected.map(pantryIngredientId));
  const safeLabels=normalizeAllergenLabels(labels);
  const report:RecipeAllergens={contains:[],conditional:[],may_contain:[],unverified:[],optional_ingredients:[],avoided:normalizeAllergenIds(avoid)};
  const add=(target:AllergenFinding[],id:AllergenId,source:AllergenSource)=>{
    let group=target.find(g=>g.id===id);if(!group){group={id,sources:[]};target.push(group);}
    if(!group.sources.some(s=>s.ingredient_id===source.ingredient_id&&s.component===source.component&&s.evidence===source.evidence))group.sources.push(source);
  };
  for(const ingredient of ingredients){
    const id=pantryIngredientId(ingredient.name),included=selectedIds.has(id),optional=!!ingredient.optional&&!included;
    const declaration=safeLabels[id]??ingredient.allergen_declaration;
    const source:AllergenSource={ingredient_id:id,ingredient:ingredient.name,section:ingredient.section,optional,evidence:"ingredient"};
    if(ingredient.optional)report.optional_ingredients.push({id,name:ingredient.name,selected:included});
    let unknown=false;
    for(const [i,name]of [ingredient.name,...(ingredient.components??[])].entries()){
      const finding=ingredientAllergens(name);unknown ||= finding.unverified;
      for(const allergen of finding.contains)add(optional?report.conditional:report.contains,allergen,{...source,...(i?{component:name,evidence:"declared_component" as const}: {})});
    }
    if(declaration){
      for(const allergen of normalizeAllergenIds(declaration.contains))add(optional?report.conditional:report.contains,allergen,{...source,evidence:"product_label",product:declaration.product});
      for(const allergen of normalizeAllergenIds(declaration.may_contain))add(report.may_contain,allergen,{...source,evidence:"product_label",product:declaration.product});
    }
    if(unknown&&!declaration?.complete)report.unverified.push({ingredient_id:id,ingredient:ingredient.name,section:ingredient.section,optional});
  }
  for(const key of ["contains","conditional","may_contain"]as const)report[key].sort((a,b)=>ALLERGEN_IDS.indexOf(a.id)-ALLERGEN_IDS.indexOf(b.id));
  report.optional_ingredients=[...new Map(report.optional_ingredients.map(i=>[i.id,i])).values()];
  return report;
}

export const ALLERGEN_MESSAGES_IT:Record<string,string>={
  "allergen.conflict": "Contiene {allergen}: {ingredients}.",
  "allergen.traceConflict": "Possibili tracce di {allergen}, segnalate in etichetta: {ingredients}.",
  "allergen.optional": "Per evitare {allergen}, non aggiungere: {ingredients}.",
  "allergen.verify": "Controlla le etichette dei prodotti che userai.",
  "allergen.change": "Scegli un’alternativa prima di prepararla.",
  "allergen.labels": "Considera anche le possibili contaminazioni durante la preparazione.",
  "allergen.cardConflict": "Contiene {allergen}",
  "allergen.cardTrace": "Possibili tracce di {allergen}",
  "allergen.cardOptional": "Evita le aggiunte con {allergen}",
  "allergen.cardCheck": "Controlla le etichette",
};
export function allergenWarnings(report:RecipeAllergens):DietaryWarning[]{
  const warnings:DietaryWarning[]=[];
  const add=(id:AllergenId|"labels",key:string,names:string[],severity:DietaryWarning["severity"])=>warnings.push({filterId:`allergen:${id}`,ingredients:names,severity,
    message:{key,fallback:ALLERGEN_MESSAGES_IT[key],params:{...(id!=="labels"?{allergen:id}:{}),ingredients:names}},
    tip:{key:severity==="critical"?"allergen.change":"allergen.labels",fallback:ALLERGEN_MESSAGES_IT[severity==="critical"?"allergen.change":"allergen.labels"]}});
  for(const id of report.avoided){
    const certain=report.contains.find(g=>g.id===id);
    if(certain)add(id,"allergen.conflict",[...new Set(certain.sources.map(s=>s.ingredient))],"critical");
    const traces=report.may_contain.find(g=>g.id===id)?.sources.filter(s=>!s.optional);
    if(traces?.length)add(id,"allergen.traceConflict",[...new Set(traces.map(s=>s.ingredient))],"critical");
    const optional=[...(report.conditional.find(g=>g.id===id)?.sources??[]),...(report.may_contain.find(g=>g.id===id)?.sources.filter(s=>s.optional)??[])];
    if(optional.length&&!certain&&!traces?.length)add(id,"allergen.optional",[...new Set(optional.map(s=>s.ingredient))],"warning");
  }
  if(report.avoided.length)add("labels","allergen.verify",report.unverified.filter(s=>!s.optional).map(s=>s.ingredient),"warning");
  return warnings;
}
