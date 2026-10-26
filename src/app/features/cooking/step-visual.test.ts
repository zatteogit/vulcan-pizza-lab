import { describe, expect, it } from "vitest";
import { TOPPING_LIBRARY } from "../../data/topping-library";
import { resolveStepVisual } from "./step-visual";

describe("procedure icon semantics", () => {
  it("keeps oven cooking, oil heating, frying and unyeasted rest distinct", () => {
    expect(resolveStepVisual({ id: "preheat" })).toBe("preheat");
    expect(resolveStepVisual({ id: "preheat", variant: "oil" })).toBe("oil");
    expect(resolveStepVisual({ id: "bake", variant: "fry" })).toBe("fry");
    expect(resolveStepVisual({ id: "bake2" })).toBe("bake");
    expect(resolveStepVisual({ id: "bulk" }, { unleavened: true })).toBe("rest");
    expect(resolveStepVisual({ id: "proof" }, { unleavened: true, proofInPan: true })).toBe("rest");
    expect(resolveStepVisual({ id: "proof", variant: "pan" })).toBe("proof_pan");
  });

  it("recovers the correct action for older cooking sessions without visual metadata", () => {
    expect(resolveStepVisual({ id: "bake" }, { fried: true })).toBe("fry");
    expect(resolveStepVisual({ id: "preheat" }, { fried: true })).toBe("oil");
    expect(resolveStepVisual({ id: "proof" }, { proofInPan: true })).toBe("proof_pan");
  });

  it("does not interpret the word bake in topping IDs as oven cooking", () => {
    for (const id of ["sbagliata_bake", "scarpetta_bake", "mortazza_post_bake",
      "nduja_pinsa_bake", "burrata_salmone_bake", "after_bake_top"]) {
      expect(["top", "top_post"]).toContain(resolveStepVisual({ id }));
    }
    expect(resolveStepVisual({ id: "patate_sancho_split" })).toBe("split_fill");
    expect(resolveStepVisual({ id: "crudo_spacca_farci" })).toBe("split_fill");
    expect(resolveStepVisual({ id: "pizza_fritta_fill_seal" })).toBe("fill_internal");
    expect(resolveStepVisual({ id: "fugazza_top" })).toBe("top");
  });

  it("covers every catalog assembly and preparation without falling back to a pizza slice", () => {
    let count = 0;
    for (const topping of Object.values(TOPPING_LIBRARY)) {
      for (const step of topping.pre_prep_steps ?? []) {
        expect(resolveStepVisual(step), step.id).toBe("prep");
        count++;
      }
      for (const step of topping.assembly_steps ?? []) {
        expect(["top", "top_post", "fill_internal", "split_fill"])
          .toContain(resolveStepVisual(step));
        count++;
      }
    }
    expect(count).toBeGreaterThan(100);
    expect(resolveStepVisual({ id: "future_unknown_step" })).toBe("prep");
  });
});
