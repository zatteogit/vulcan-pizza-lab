import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { Dialog, Disclosure, IconButton, SegmentedControl, Switch } from "../../components/ds/index";
import { FLOURS_DB } from "../../data/flour-database";
import { TOPPING_LIBRARY } from "../../data/topping-library";
import { normalizePantryFlourDetails, pantryIngredientId, type PantryFlourDetails } from "../../domain/pantry-ingredients";
import type { UserConstraints } from "../../domain/pizza-engine";
import { savePantryConstraints } from "../../adapters/browser/pantry-storage";
import { SupplyPolicyControls } from "./supply-policy-controls";
import { t } from "../cms/i18n";
import { useCms } from "../cms/cms-context";
import { pantryIngredientNames } from "./pantry-ingredient-names";

type Status = "unknown" | "available" | "excluded";
type Tab = "flour" | "dough" | "topping";
type Item = { id: string; name: string; producer?: string; detail?: string; yeast?: boolean; flour?: boolean };

export function PantryEditor({ constraints, onChange, onClose, flourOptions }: {
  constraints: UserConstraints; onChange: (next: UserConstraints) => void; onClose: () => void;
  flourOptions: { id: string; name: string; w: string; detail: string }[];
}) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const [tab, setTab] = useState<Tab>("flour");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const save = (patch: Partial<UserConstraints>) => {
    const next = { ...constraints, ...patch };
    onChange(next);
    savePantryConstraints(next);
  };
  const ingredientNames = useMemo(() => pantryIngredientNames(cms), [cms]);
  // Stable keys come from the engine's source ingredients, never translated copy.
  const doughNames = ["Sale", "Zucchero", "Olio EVO", "Burro", "Strutto", "Acqua"];
  const flourItems: Item[] = [
    // FW-01: le farine generiche non hanno più una W stimata: si mostra la descrizione.
    ...flourOptions.map(f => ({ ...f, flour: true, detail: f.w || f.detail })),
    ...FLOURS_DB.filter(f => !flourOptions.some(option => option.id === f.id)).map(f => ({
      id: f.id, name: f.name, producer: f.producer, flour: true,
      detail: t(f.w_declared === false ? ui.pantryWEstimate : ui.pantryWValue, {w:f.w}),
    })),
    ...Object.entries(constraints.pantry_flour_details ?? {}).filter(([id]) => id.startsWith("custom:")).map(([id, f]) => ({id, name:f.name || ui.pantryMyFlour, producer:f.producer, flour:true, detail:f.w ? t(ui.pantryWValue,{w:f.w}) : ui.pantryUnspecified})),
  ];
  const toppings = useMemo(() => {
    const unique = new Map<string, Item>();
    for (const recipe of Object.values(TOPPING_LIBRARY)) for (const ingredient of recipe.ingredients) {
      const id = pantryIngredientId(ingredient.name);
      if (!unique.has(id)) unique.set(id, { id, name: ingredientNames.get(id) ?? ingredient.name });
    }
    return [...unique.values()].sort((a,b) => a.name.localeCompare(b.name, bcp47));
  }, [ingredientNames, bcp47]);
  const ingredients: Item[] = tab === "flour" ? flourItems : tab === "topping" ? toppings : [
    ...["fresh", "dry", "sourdough"].map(id => ({ id, name:cms.yeastLabels[id] ?? id, yeast:true })),
    ...doughNames.map(name => ({id:pantryIngredientId(name), name:ingredientNames.get(pantryIngredientId(name)) ?? name})),
  ];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = ingredients.filter(item => `${constraints.pantry_flour_details?.[item.id]?.name ?? ""} ${constraints.pantry_flour_details?.[item.id]?.producer ?? ""} ${item.name} ${item.producer ?? ""}`.toLocaleLowerCase().includes(normalizedQuery));
  const status = (item: Item): Status => {
    const have = item.flour ? constraints.pantry_flours : item.yeast ? constraints.pantry_yeasts : constraints.pantry_ingredients ?? [];
    const excluded = item.flour ? constraints.excluded_flours ?? [] : item.yeast ? constraints.excluded_yeasts ?? [] : constraints.excluded_ingredients ?? [];
    return excluded.includes(item.id) ? "excluded" : have.includes(item.id) ? "available" : "unknown";
  };
  const setStatus = (item: Item, value: Status) => {
    const haveKey = item.flour ? "pantry_flours" : item.yeast ? "pantry_yeasts" : "pantry_ingredients";
    const excludedKey = item.flour ? "excluded_flours" : item.yeast ? "excluded_yeasts" : "excluded_ingredients";
    save({
      [haveKey]: [...(constraints[haveKey] ?? []).filter(id => id !== item.id), ...(value === "available" ? [item.id] : [])],
      [excludedKey]: [...(constraints[excludedKey] ?? []).filter(id => id !== item.id), ...(value === "excluded" ? [item.id] : [])],
    });
  };
  const statuses = [{value:"available" as const,label:ui.pantryHave}, {value:"unknown" as const,label:ui.pantryUnspecified}, {value:"excluded" as const,label:ui.pantryDoNotUse}];
  const saveDetail = (id: string, detail: PantryFlourDetails) => save({pantry_flour_details:normalizePantryFlourDetails({...constraints.pantry_flour_details,[id]:detail})});
  return createPortal(
    <Dialog open onClose={onClose} ariaLabel={ui.pantryFull} className="pantry-editor">
      <div className="pantry-editor__header"><h2>{ui.pantryFull}</h2><IconButton variant="bare" onClick={onClose} aria-label={ui.close}><X size={20}/></IconButton></div>
      <p className="pantry-editor__hint">{ui.pantryStatusHint}</p>
      <SegmentedControl value={tab} ariaLabel={ui.pantryFull} onValueChange={value=>{setTab(value);setQuery("");setLimit(20);setDetailsId(null);}}
        options={[{value:"flour",label:ui.pantryFlours},{value:"dough",label:ui.pantryDough},{value:"topping",label:ui.pantryToppings}]} fullWidth size="sm" />
      <div className="pantry-editor__search"><Search size={16} aria-hidden="true"/><input className="pantry-editor__input" type="search" value={query} onChange={event=>{setQuery(event.target.value);setLimit(20);}} placeholder={ui.pantrySearch} aria-label={ui.pantrySearch}/></div>
      <div className="pantry-editor__scroll">
        <Disclosure className="pantry-editor__policies" variant="inline" summary={ui.pantryPolicies}>
          <SupplyPolicyControls kind="flour" constraints={constraints} onChange={onChange} flourOptions={flourItems.map(item=>({id:item.id,label:item.name}))}/>
          <label className="pantry-editor__complete"><span data-slot="label">{ui.pantryToppingsComplete}</span><Switch checked={constraints.pantry_ingredients_complete===true} onCheckedChange={value=>save({pantry_ingredients_complete:value})}/></label>
        </Disclosure>
        {tab === "flour" && <button type="button" className="pantry-editor__add" onClick={()=>{
          const id=`custom:${crypto.randomUUID()}`;
          save({pantry_flour_details:{...constraints.pantry_flour_details,[id]:{name:ui.pantryMyFlour}},pantry_flours:[...constraints.pantry_flours,id]});
          setDetailsId(id);setQuery("");setLimit(Number.MAX_SAFE_INTEGER);
          requestAnimationFrame(()=>document.getElementById(`pantry-${id}`)?.scrollIntoView({block:"center"}));
        }}><Plus size={16}/>{ui.pantryAddFlour}</button>}
        {filtered.slice(0,limit).map(item=><div className="pantry-editor__item" key={item.id} id={`pantry-${item.id}`}>
          <div className="pantry-editor__item-heading"><div data-slot="item-info"><h3>{constraints.pantry_flour_details?.[item.id]?.name ?? item.name}</h3>{item.flour && <p>{constraints.pantry_flour_details?.[item.id]?.producer ?? item.producer} {constraints.pantry_flour_details?.[item.id]?.w ? t(ui.pantryWValue,{w:constraints.pantry_flour_details[item.id].w!}) : item.detail}</p>}</div>
            {item.flour && <button type="button" className="pantry-editor__details" aria-expanded={detailsId===item.id} onClick={()=>setDetailsId(detailsId===item.id?null:item.id)}>{ui.pantryDetails}<ChevronDown size={14}/></button>}
          </div>
          <SegmentedControl ariaLabel={item.name} value={status(item)} options={statuses} onValueChange={value=>setStatus(item,value)} size="sm" fullWidth />
          {item.flour && detailsId===item.id && <FlourDetails id={item.id} detail={constraints.pantry_flour_details?.[item.id] ?? {}} onSave={detail=>saveDetail(item.id,detail)} />}
        </div>)}
        {filtered.length===0 && <p className="pantry-editor__empty">{ui.pantryNoResults}</p>}
        {filtered.length>limit && <button type="button" className="pantry-editor__more" onClick={()=>setLimit(value=>value+20)}>{ui.pantryShowMore}</button>}

      </div>
      <p className="pantry-editor__saved">{ui.pantryAutoSaved}</p>
    </Dialog>, document.body,
  );
}

function FlourDetails({id,detail,onSave}:{id:string;detail:PantryFlourDetails;onSave:(detail:PantryFlourDetails)=>void}) {
  const {cms}=useCms(); const ui=cms.ui;
  const product=FLOURS_DB.find(flour=>flour.id===id);
  const fields = [{key:"w" as const,label:ui.pantryFlourW,catalog:product?.w_declared!==false?product?.w:undefined,max:1000},
    {key:"pl" as const,label:ui.pantryFlourPL,catalog:product?.w_declared!==false?product?.pl:undefined,max:10},
    {key:"protein_pct" as const,label:ui.pantryProtein,catalog:product?.proteine_pct,max:100}];
  return <div className="pantry-editor__flour-details">
    <label>{ui.pantryFlourName}<input key={`${id}-name`} className="pantry-editor__input" defaultValue={detail.name??product?.name??""} maxLength={120} onBlur={event=>onSave({...detail,name:event.target.value})}/></label>
    <label>{ui.pantryProducer}<input key={`${id}-producer`} className="pantry-editor__input" defaultValue={detail.producer??product?.producer??""} maxLength={120} onBlur={event=>onSave({...detail,producer:event.target.value})}/></label>
    <div className="pantry-editor__numbers">{fields.map(field=><label key={field.key}>{field.label}<input className="pantry-editor__input" inputMode="decimal" type="text" defaultValue={detail[field.key]??field.catalog??""} onChange={event=>event.target.setCustomValidity("")} onBlur={event=>{
      const raw=event.target.value.trim(); const number=Number(raw.replace(",","."));
      if(raw && (!Number.isFinite(number)||number<0||(field.key!=="protein_pct"&&number===0)||number>field.max)){event.target.setCustomValidity(ui.pantryInvalidValue);event.target.reportValidity();return;}
      onSave({...detail,[field.key]:raw?number:undefined});
    }}/></label>)}</div>
    <p className="pantry-editor__hint">{ui.pantryFlourDataHint}</p>
  </div>;
}
