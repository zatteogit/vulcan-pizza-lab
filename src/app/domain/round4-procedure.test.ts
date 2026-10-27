import { describe, expect, it } from "vitest";
import { handleMcpMessage } from "../agent/mcp-server";
import { getToppingForStyle, TOPPING_LIBRARY } from "../data/topping-library";
import { STYLES_DB } from "./pizza-engine";

function recipe(input: Record<string, unknown>) {
  const response = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: {
    name: "generate_recipe", arguments: { oven_type: "home", oven_max_temp_c: 300,
      available_hours: 48, meal_deadline: false, skill_level: 3, dough_balls: 2,
      has_baking_pan: true, recipe_mode: "canonical", ...input },
  } });
  if (!response || !("result" in response)) throw Error("Missing MCP result");
  const result = response.result as { isError?: boolean; structuredContent: any };
  expect(result.isError).not.toBe(true);
  return result.structuredContent;
}

function coherentSchedule(r: any) {
  expect(r.schedule.total_minutes).toBe(r.steps.reduce((sum: number, s: any) => sum + s.duration_minutes, 0));
  for (const s of r.steps.filter((s: any) => s.work_units)) {
    expect(s.duration_minutes).toBe(s.work_units * s.minutes_per_unit);
  }
}

describe("round 4: ingredients and procedural ownership", () => {
  it("checks the garlic explicitly used to prepare friarielli, without inventing component amounts", () => {
    const input = { style_id: "napoletana_stg", topping_id: "salsiccia_friarielli_napoletana",
      oven_type: "wood", oven_max_temp_c: 485, available_hours: 12 };
    for (const recipe_mode of ["canonical", "adapted"]) {
      const blocked = recipe({ ...input, recipe_mode, excluded_ingredients: ["aglio"] });
      expect(blocked.outcome).toBe("not_feasible");
      expect(blocked.blockers.some((b: any) => b.kind === "resource_excluded" && b.message.params.ingredient.toLowerCase() === "aglio")).toBe(true);
      const allowed = recipe({ ...input, recipe_mode, excluded_ingredients: ["burro"] });
      expect(allowed.blockers.some((b: any) => b.kind === "resource_excluded")).toBe(false);
      const greens = allowed.topping.ingredients_per_unit.find((i: any) => i.name.startsWith("Friarielli"));
      expect(greens.declared_components.map((c: any) => c.id)).toContain("aglio");
      expect(greens.amount).toEqual(TOPPING_LIBRARY.salsiccia_friarielli_napoletana.ingredients[0].amount);
      expect(greens.declared_components.every((c: any) => !("amount" in c))).toBe(true);
    }
  });

  it("keeps frying exclusively in the cooking phase for both filled fried formats and weights", () => {
    for (const style_id of ["pizza_fritta", "pizza_fritta_tonda"]) for (const ball_weight_g of [150, 300]) {
      const r = recipe({ style_id, dough_balls: 4, ball_weight_g });
      const instructions = r.steps.filter((s: any) => /\b(?:friggere|friggi)\b/i.test(s.description));
      expect(instructions.map((s: any) => s.id)).toEqual(["bake"]);
      const fill = r.steps.find((s: any) => /fill/.test(s.id));
      expect(fill.description).toMatch(/sigillare/i);
      expect(r.steps.indexOf(fill)).toBeLessThan(r.steps.findIndex((s: any) => s.id === "bake"));
      expect(r.steps.find((s: any) => s.id === "bake").rounds).toBe(4);
      coherentSchedule(r);
    }
  });

  it("stacks and fully bakes the Baciata before opening and cold filling it once", () => {
    for (const recipe_mode of ["canonical", "adapted"]) for (const dietary_filters of [[], ["lactose_free"]]) {
      const r = recipe({ style_id: "pizza_baciata", topping_id: "bianca_mortazza_romana", recipe_mode, dietary_filters });
      const ids = r.steps.map((s: any) => s.id);
      expect(ids.indexOf("spread_baciata_surface")).toBeGreaterThan(ids.indexOf("stack"));
      expect(ids.indexOf("bake")).toBeGreaterThan(ids.indexOf("spread_baciata_surface"));
      expect(ids.indexOf("mortazza_split_fill")).toBeGreaterThan(ids.indexOf("bake"));
      expect(ids).not.toContain("split_fill");
      expect(ids).not.toContain("mortazza_post_bake");
      expect(ids).not.toContain("bake2");
      expect(r.steps.filter((s: any) => /separare i due strati/i.test(s.description))).toHaveLength(1);
      const bake = r.steps.find((s: any) => s.id === "bake");
      expect(bake.duration_minutes * 60).toBeGreaterThanOrEqual(r.cook_time_sec * r.dough_balls);
      coherentSchedule(r);
    }
  });

  it("does not reuse split-filling instructions on a single open base or skip opening the porchetta Baciata", () => {
    const baciata = getToppingForStyle("bianca_mortazza_romana", STYLES_DB.pizza_baciata)!;
    const pala = getToppingForStyle("bianca_mortazza_romana", STYLES_DB.pala_romana)!;
    const spaccata = getToppingForStyle("bianca_mortazza_romana", STYLES_DB.pizza_spaccata)!;
    expect(baciata.assembly_steps?.map(s => s.id)).toEqual(["spread_baciata_surface", "mortazza_split_fill"]);
    expect(pala.assembly_steps?.map(s => s.id)).toEqual(["spread_bianca_base", "mortazza_post_bake"]);
    expect(spaccata.assembly_steps?.map(s => s.id)).toEqual(["spread_bianca_base", "mortazza_spaccata_fill"]);
    for (const topping_id of ["bianca_mortazza_romana", "patate_porchetta"]) {
      const r = recipe({ style_id: "pizza_baciata", topping_id });
      expect(r.steps.some((s: any) => s.id === "bake2")).toBe(false);
      expect(r.steps.filter((s: any) => /separare i due strati/i.test(s.description))).toHaveLength(1);
      coherentSchedule(r);
    }
  });
});
