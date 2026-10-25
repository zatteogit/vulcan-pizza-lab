import { Chip, Select } from "../../components/ds/index";
import type { UserConstraints } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { pantryFlourName } from "./pantry-flour-names";

/** A partial list is not a negative prompt. Only the explicit restrictive
 * choice and a confirmed inventory can exclude unavailable resources. */
export function SupplyPolicyControls({ kind, constraints, onChange, flourOptions = [] }: {
  kind: "flour" | "equipment"; constraints: UserConstraints; flourOptions?: {id:string;label:string}[];
  onChange: (constraints: UserConstraints) => void;
}) {
  const { cms } = useCms();
  const flour = kind === "flour";
  const completeKey = flour ? "pantry_inventory_complete" : "equipment_inventory_complete";
  const purchaseKey = flour ? "allow_flour_purchase" : "allow_equipment_purchase";
  const save = (patch: Partial<UserConstraints>) => {
    const next = { ...constraints, ...patch };
    onChange(next);
    const key = flour ? "vulcan_pantry" : "vulcan_equipment";
    try {
      const previous = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(key, JSON.stringify({ ...previous,
        inventory_complete: next[completeKey], allow_purchase: next[purchaseKey],
        ...(flour ? { excluded_flours: next.excluded_flours } : {}),
      }));
    } catch { /* The current session still retains the explicit policy. */ }
  };
  const excluded = constraints.excluded_flours ?? [];
  return (
    <div className="supply-policy-controls">
      <p className="type-body-sm">{cms.ui.supplyUnknownHint}</p>
      <Select label={flour ? cms.ui.supplyPantryInventory : cms.ui.supplyEquipmentInventory}
        value={constraints[completeKey] ? "complete" : "partial"}
        options={[{id:"partial",label:cms.ui.supplyPartial},{id:"complete",label:cms.ui.supplyComplete}]}
        onValueChange={v=>save({[completeKey]:v==="complete"})} />
      <Select label={flour ? cms.ui.supplyFlourPurchase : cms.ui.supplyEquipmentPurchase}
        value={constraints[purchaseKey] === undefined ? "unspecified" : constraints[purchaseKey] ? "allowed" : "forbidden"}
        options={[{id:"unspecified",label:cms.ui.supplyUnspecified},{id:"allowed",label:cms.ui.supplyAllowed},{id:"forbidden",label:cms.ui.supplyForbidden}]}
        onValueChange={v=>save({[purchaseKey]:v==="unspecified"?undefined:v==="allowed"})} />
      {flour && <>
        <Select label={cms.ui.supplyExcludedFlours} value={null} placeholder={cms.ui.supplyAddExclusion}
          options={flourOptions.filter(option=>!excluded.includes(option.id))}
          onValueChange={id=>save({excluded_flours:[...excluded,id]})} />
        <div className="recipe-condition-chips">
          {excluded.map(id=><Chip key={id} active label={flourOptions.find(option=>option.id===id)?.label ?? pantryFlourName(id)} onToggle={()=>save({excluded_flours:excluded.filter(x=>x!==id)})} />)}
        </div>
      </>}
    </div>
  );
}
