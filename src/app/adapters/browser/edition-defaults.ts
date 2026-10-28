import { EDITION_DEFAULT_OVEN, type OvenModel } from "../../data/oven-models";

const OVEN_STORAGE_KEY = "vulcan_oven_pref";

/** Al primo avvio di un'edizione con un forno preimpostato (es. il partner),
 * il profilo parte da quel forno. Una scelta già salvata non si tocca mai. */
export function seedEditionOven(storage: Pick<Storage, "getItem" | "setItem"> | null, oven: OvenModel | undefined = EDITION_DEFAULT_OVEN): boolean {
  if (!storage || !oven) return false;
  try {
    if (storage.getItem(OVEN_STORAGE_KEY) !== null) return false;
    // FW-07 (S18-A-01): il forno del partner non diventa in silenzio il tuo:
    // resta marcato «edizione» finché non lo confermi (Crea, profilo, percorso).
    storage.setItem(OVEN_STORAGE_KEY, JSON.stringify({ ovenType: oven.ovenType, maxTemp: oven.maxTempC, modelId: oven.id, origin: "edition" }));
    return true;
  } catch {
    return false;
  }
}

export function browserStorage(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}
