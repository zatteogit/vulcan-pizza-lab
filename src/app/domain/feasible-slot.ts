import type { StyleRecommendation, TimeSlot, UserConstraints } from "./pizza-engine";

/** Audit 28/10/2026 (S05-A-01): col forno di casa «Stasera» può non lasciare
 *  nessuno stile fattibile. Il primo momento, dopo quello scelto, in cui almeno
 *  uno stile lo è; «Nessuna preferenza» (ore 0) per ultimo. `null` se nemmeno
 *  senza limiti di tempo la cucina ne permette uno. Il calcolo delle
 *  raccomandazioni arriva dal chiamante, così le card e la proposta usano le
 *  stesse ricette. */
export function firstFeasibleSlot(
  constraints: UserConstraints,
  slots: readonly TimeSlot[],
  recommend: (constraints: UserConstraints) => StyleRecommendation[],
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
