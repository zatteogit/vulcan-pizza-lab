import { TOPPING_LIBRARY } from "../../data/topping-library";
import type { TimelineStep } from "../../domain/pizza-engine";

export type StepVisual =
  | "preferment" | "mix" | "bulk" | "divide" | "proof" | "proof_pan"
  | "rest" | "shape" | "top" | "top_post" | "preheat" | "bake"
  | "oil" | "fry" | "stack" | "fill_internal" | "split_fill" | "prep";

const CORE: Record<string, StepVisual> = {
  preferment: "preferment", mix: "mix", bulk: "bulk", divide: "divide",
  // FW-19: le pieghe sono lavoro di mani, come l'impasto.
  folds: "mix",
  proof: "proof", shape: "shape", top: "top", top_post: "top_post",
  after_bake_top: "top_post", preheat: "preheat", bake: "bake", bake2: "bake",
  stack: "stack", fill_internal: "fill_internal", split_fill: "split_fill",
};

// The insertion point, rather than words like "bake" inside an ID, tells us
// whether this is assembly or actual cooking. Custom toppings share this map.
const TOPPING_VISUALS = new Map<string, StepVisual>();
for (const topping of Object.values(TOPPING_LIBRARY)) {
  for (const step of topping.pre_prep_steps ?? []) TOPPING_VISUALS.set(step.id, "prep");
  for (const step of topping.assembly_steps ?? []) {
    const visual = step.insert_at === "after_fill_internal" ? "fill_internal"
      : step.insert_at === "after_split_fill" ? "split_fill"
      : step.insert_at === "after_bake" || step.insert_at === "after_bake2" ? "top_post"
      : "top";
    TOPPING_VISUALS.set(step.id, visual);
  }
}
TOPPING_VISUALS.set("crudo_spacca_farci", "split_fill");
TOPPING_VISUALS.set("patate_sancho_split", "split_fill");
TOPPING_VISUALS.set("pizza_fritta_fill_seal", "fill_internal");
// It follows the filling insertion point, but Fugazza only has a surface topping.
TOPPING_VISUALS.set("fugazza_top", "top");

export function resolveStepVisual(
  step: Pick<TimelineStep, "id"> & Partial<Pick<TimelineStep, "variant">>,
  context: { unleavened?: boolean; fried?: boolean; proofInPan?: boolean } = {},
): StepVisual {
  if (step.id === "preheat" && (step.variant === "oil" || context.fried)) return "oil";
  if ((step.id === "bake" || step.id === "bake2") && (step.variant === "fry" || context.fried)) return "fry";
  if ((step.id === "bulk" || step.id === "proof") && context.unleavened) return "rest";
  if (step.id === "proof" && (step.variant === "pan" || context.proofInPan)) return "proof_pan";
  return CORE[step.id] ?? TOPPING_VISUALS.get(step.id) ?? (step.id.startsWith("spread_") ? "top" : "prep");
}
