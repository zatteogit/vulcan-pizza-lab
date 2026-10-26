import { TOPPING_LIBRARY, type TimelineInsertPoint } from "../../data/topping-library";
import type { TimelineStep } from "../../domain/pizza-engine";

const TOPPING_PHASES = new Map<string, TimelineInsertPoint>([
  ["top", "after_shape"], ["top_post", "after_bake"],
  ["after_bake_top", "after_bake"], ["fill_internal", "after_fill_internal"],
  ["split_fill", "after_split_fill"],
]);
for (const topping of Object.values(TOPPING_LIBRARY)) {
  for (const step of topping.assembly_steps ?? []) TOPPING_PHASES.set(step.id, step.insert_at);
}

/** Keep a phase's controls mounted when a different topping changes its IDs.
 * Multiple operations at the same insertion point still get distinct keys. */
export function procedureTimelineRows(timeline: TimelineStep[]) {
  const counts = new Map<TimelineInsertPoint, number>();
  return timeline.map(step => {
    const phase = TOPPING_PHASES.get(step.id) ?? (step.id.startsWith("spread_") ? "after_shape" : undefined);
    const ordinal = phase ? counts.get(phase) ?? 0 : 0;
    if (phase) counts.set(phase, ordinal + 1);
    return { step, phase, ordinal, key: phase ? `topping:${phase}:${ordinal}` : step.id };
  });
}
