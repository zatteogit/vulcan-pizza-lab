import { Select, Switch } from "../../components/ds/index";
import type { UserConstraints } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";

/** A partial list is not a negative prompt. Only the explicit restrictive
 * choice and a confirmed inventory can exclude unavailable resources.
 * G2-WP-04: le esclusioni si fanno solo riga per riga («Non usare»); qui
 * restano «lista completa» (switch) e «posso comprare» (tre valori), ognuno
 * con la frase che dice cosa fa sul motore (pizza-engine: missing/unverified,
 * need.purchaseRefused). */
export function SupplyPolicyControls({ kind, constraints, onChange }: {
  kind: "flour" | "equipment"; constraints: UserConstraints;
  onChange: (constraints: UserConstraints) => void;
}) {
  const { cms } = useCms();
  const ui = cms.ui;
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
      }));
    } catch { /* The current session still retains the explicit policy. */ }
  };
  return (
    <div className="supply-policy-controls">
      <p className="type-body-sm">{ui.supplyUnknownHint}</p>
      <label className="supply-policy-controls__switch">
        <span data-slot="label">{flour ? ui.supplyPantryComplete : ui.supplyEquipmentComplete}</span>
        <Switch checked={constraints[completeKey] === true} onCheckedChange={value => save({ [completeKey]: value })} />
      </label>
      <p className="type-body-sm">{flour ? ui.supplyPantryCompleteEffect : ui.supplyEquipmentCompleteEffect}</p>
      <Select label={flour ? ui.supplyFlourPurchase : ui.supplyEquipmentPurchase}
        value={constraints[purchaseKey] === undefined ? "unspecified" : constraints[purchaseKey] ? "allowed" : "forbidden"}
        options={[{id:"allowed",label:ui.supplyAllowed},{id:"forbidden",label:ui.supplyForbidden},{id:"unspecified",label:ui.supplyUnspecified}]}
        onValueChange={v=>save({[purchaseKey]:v==="unspecified"?undefined:v==="allowed"})} />
      <p className="type-body-sm">{ui.supplyPurchaseEffect}</p>
    </div>
  );
}
