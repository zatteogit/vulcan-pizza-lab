import { CUSTOM_SLOT_MAX_HOURS, floorToQuarterHour } from "./pizza-engine";
import type { StyleRecommendation, TimeSlot, UserConstraints } from "./pizza-engine";

type Recommend = (constraints: UserConstraints) => StyleRecommendation[];

const QUARTER_MS = 15 * 60_000;

/** Audit 28/10/2026 (S05-A-01): col forno di casa «Stasera» può non lasciare
 *  nessuno stile fattibile. Il primo momento, dopo quello scelto, in cui almeno
 *  uno stile lo è; «Nessuna preferenza» (ore 0) per ultimo. `null` se nemmeno
 *  senza limiti di tempo la cucina ne permette uno. Il calcolo delle
 *  raccomandazioni arriva dal chiamante, così le card e la proposta usano le
 *  stesse ricette. */
export function firstFeasibleSlot(
  constraints: UserConstraints,
  slots: readonly TimeSlot[],
  recommend: Recommend,
): TimeSlot | null {
  const later = slots
    .filter((slot) => slot.hours === 0 || slot.hours > constraints.available_hours)
    .sort((a, b) => (a.hours || Infinity) - (b.hours || Infinity));
  for (const slot of later) {
    const candidate: UserConstraints = { ...constraints, available_hours: slot.hours, meal_deadline: slot.hours > 0 ? constraints.meal_deadline : false };
    if (recommend(candidate).some((rec) => rec.tier !== "not_feasible")) return slot;
  }
  return null;
}

/* ═══ FW-09 (S05-A-01, S05-A-13): il primo pasto possibile ═══ */

export interface EarliestFeasibleMeal {
  /** Istante del pasto, al quarto d'ora dell'orologio (mai prima del minimo). */
  at: Date;
  /** Ore da `now` a `at`, al quarto d'ora per difetto (come gli altri slot). */
  hours: number;
  /** Stili fattibili a quell'ora, nell'ordine del motore. */
  styleIds: string[];
}

function feasibleIds(constraints: UserConstraints, hours: number, recommend: Recommend): string[] {
  return recommend({ ...constraints, available_hours: hours, meal_deadline: true })
    .filter((rec) => rec.tier !== "not_feasible")
    .map((rec) => rec.style.id);
}

/** Il primo pasto, da `now`, per cui almeno uno stile è fattibile con questa
 *  cucina. Non usa soglie fisse: la fattibilità è il verdetto delle stesse
 *  ricette delle card (impasto, lievitazione minima dello stile, staglio,
 *  stesura, preriscaldo e cottura dentro la finestra fino al pasto). Ricerca
 *  binaria al quarto d'ora fra `fromHours` (escluso se già noto infattibile)
 *  e una settimana: allungare la finestra non toglie fattibilità (proprietà
 *  verificata nei test). `null` se nemmeno a una settimana c'è uno stile. */
export function earliestFeasibleMeal(
  constraints: UserConstraints,
  now: Date,
  recommend: Recommend,
  fromHours = 0,
): EarliestFeasibleMeal | null {
  const maxQ = Math.round(CUSTOM_SLOT_MAX_HOURS * 4);
  if (feasibleIds(constraints, maxQ / 4, recommend).length === 0) return null;
  let lo = Math.max(0, Math.floor(fromHours * 4)); // quarti: infattibile o non provato
  let hi = maxQ; // quarti: fattibile
  if (lo > 0 && feasibleIds(constraints, lo / 4, recommend).length > 0) hi = lo;
  else {
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (mid > 0 && feasibleIds(constraints, mid / 4, recommend).length > 0) hi = mid;
      else lo = mid;
    }
  }
  const minimumMs = now.getTime() + (hi / 4) * 3_600_000;
  const at = new Date(Math.min(Math.ceil(minimumMs / QUARTER_MS) * QUARTER_MS, now.getTime() + CUSTOM_SLOT_MAX_HOURS * 3_600_000));
  const hours = floorToQuarterHour((at.getTime() - now.getTime()) / 3_600_000);
  return { at, hours, styleIds: feasibleIds(constraints, hours, recommend) };
}

/** Per ogni slot con orario: `true` se nessuno stile ci sta nei tempi. Gli
 *  slot si provano dal più vicino e ci si ferma al primo con uno stile
 *  fattibile (quelli dopo hanno più tempo). Se nessuno slot ne ha, nessuno
 *  è segnato: il limite allora non è il tempo ma la cucina. */
export function slotsWithoutFeasibleStyle(
  constraints: UserConstraints,
  slots: readonly TimeSlot[],
  recommend: Recommend,
): Set<string> {
  const first = firstFeasibleSlot({ ...constraints, available_hours: 0, meal_deadline: true }, slots, recommend);
  if (!first || first.hours === 0) {
    return first ? new Set(slots.filter((slot) => slot.hours > 0).map((slot) => slot.id)) : new Set();
  }
  return new Set(slots.filter((slot) => slot.hours > 0 && slot.hours < first.hours).map((slot) => slot.id));
}
