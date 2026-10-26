import { describe, expect, it } from "vitest";
import { procedureTimelineRows } from "./procedure-step-identity";
import type { TimelineStep } from "../../domain/pizza-engine";

const steps = (...ids: string[]) => ids.map(id => ({ id }) as TimelineStep);

describe("persistent procedure controls", () => {
  it("keeps the assembly row identity across topping-specific IDs", () => {
    const original = procedureTimelineRows(steps("mix", "spread_margherita_avpn", "bake"));
    for (const id of ["spread_nerano", "scarpetta_bake", "sbagliata_bake", "top"]) {
      const changed = procedureTimelineRows(steps("mix", id, "bake"));
      expect(changed.map(row => row.key)).toEqual(original.map(row => row.key));
      expect(changed[1].phase).toBe("after_shape");
    }
  });

  it("keeps multiple operations at the same stage distinct", () => {
    const rows = procedureTimelineRows(steps("chicago_cheese_base", "chicago_sauce_top", "bake", "top_post"));
    expect(new Set(rows.map(row => row.key)).size).toBe(rows.length);
    expect(rows[0].ordinal).toBe(0);
    expect(rows[1].ordinal).toBe(1);
    expect(rows[2].phase).toBeUndefined();
    expect(rows[3].phase).toBe("after_bake");
  });

  it("does not confuse actual baking with assembly or duplicate a generic filling row", () => {
    const rows = procedureTimelineRows(steps("sbagliata_bake", "fill_internal", "crescenza_internal", "bake", "bake2"));
    expect(new Set(rows.map(row => row.key)).size).toBe(rows.length);
    expect(rows[0].phase).toBe("after_shape");
    expect(rows[3].key).toBe("bake");
    expect(rows[4].key).toBe("bake2");
  });
});
